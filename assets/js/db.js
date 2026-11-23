/* =====================================================
   INCLUIEDU • BANCO DE DADOS (IndexedDB)
   Banco de dados real no navegador: tabelas, índices,
   transações, exportação e importação de backup.
   ===================================================== */

const DB_NOME = "incluiedu";
const DB_VERSAO = 2;

const TABELAS = {
    usuarios:   { indices: [["email", "email", true], ["tipo", "tipo"], ["professorId", "professorId"]] },
    alunos:     { indices: [["professorId", "professorId"]] },
    atividades: { indices: [["professorId", "professorId"], ["materiaId", "materiaId"]] },
    adaptacoes: { indices: [["professorId", "professorId"], ["alunoId", "alunoId"], ["atividadeId", "atividadeId"]] },
    resultados: { indices: [["professorId", "professorId"], ["alunoId", "alunoId"]] },
    materias:   { indices: [["slug", "slug", true]] },
    sugestoes:  { indices: [["pagina", "pagina"], ["usuarioId", "usuarioId"]] },
    meta:       { chave: "chave" }
};

const DB = {
    _conexao: null,

    abrir() {
        if (this._conexao) return Promise.resolve(this._conexao);
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("Este navegador não tem suporte a IndexedDB."));
                return;
            }
            const req = indexedDB.open(DB_NOME, DB_VERSAO);
            req.onupgradeneeded = () => {
                const db = req.result;
                Object.entries(TABELAS).forEach(([nome, cfg]) => {
                    if (db.objectStoreNames.contains(nome)) return;
                    const store = cfg.chave
                        ? db.createObjectStore(nome, { keyPath: cfg.chave })
                        : db.createObjectStore(nome, { keyPath: "id", autoIncrement: true });
                    (cfg.indices || []).forEach(([idx, campo, unico]) =>
                        store.createIndex(idx, campo, { unique: !!unico }));
                });
            };
            req.onsuccess = () => {
                const con = req.result;
                /* Outra aba abriu uma versão nova do banco: fecha e recarrega em vez de travar */
                con.onversionchange = () => { con.close(); this._conexao = null; location.reload(); };
                this._conexao = con;
                resolve(con);
            };
            req.onerror = () => reject(req.error);
            /* Atualização bloqueada por uma aba antiga: avisa e continua esperando (a outra aba recarrega sozinha) */
            req.onblocked = () => {
                if (typeof avisar === "function") avisar("Atualizando o banco de dados… se demorar, feche as outras abas do IncluiEdu.", "info");
                else console.warn("IncluiEdu: atualização do banco aguardando outras abas.");
            };
        });
    },

    async _tx(tabelas, modo, fn) {
        const db = await this.abrir();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(tabelas, modo);
            let retorno;
            Promise.resolve(fn(tx)).then(r => { retorno = r; });
            tx.oncomplete = () => resolve(retorno);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error || new Error("Operação cancelada."));
        });
    },

    _req(r) {
        return new Promise((resolve, reject) => {
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
        });
    },

    listar(tabela) {
        return this._tx([tabela], "readonly", tx => this._req(tx.objectStore(tabela).getAll()));
    },

    buscar(tabela, id) {
        return this._tx([tabela], "readonly", tx => this._req(tx.objectStore(tabela).get(id)));
    },

    onde(tabela, indice, valor) {
        return this._tx([tabela], "readonly", tx =>
            this._req(tx.objectStore(tabela).index(indice).getAll(valor)));
    },

    primeiro(tabela, indice, valor) {
        return this._tx([tabela], "readonly", tx =>
            this._req(tx.objectStore(tabela).index(indice).get(valor)));
    },

    /* Cria ou atualiza. Retorna o id. */
    salvar(tabela, registro) {
        const agora = new Date().toISOString();
        const dados = Object.assign({}, registro, { atualizadoEm: agora });
        if (!dados.criadoEm) dados.criadoEm = agora;
        if (dados.id === undefined || dados.id === null) delete dados.id;
        return this._tx([tabela], "readwrite", tx => this._req(tx.objectStore(tabela).put(dados)));
    },

    excluir(tabela, id) {
        return this._tx([tabela], "readwrite", tx => this._req(tx.objectStore(tabela).delete(id)));
    },

    async excluirOnde(tabela, indice, valor) {
        const itens = await this.onde(tabela, indice, valor);
        await this._tx([tabela], "readwrite", tx => {
            const store = tx.objectStore(tabela);
            itens.forEach(i => store.delete(i.id));
        });
        return itens.length;
    },

    contar(tabela, indice, valor) {
        return this._tx([tabela], "readonly", tx => {
            const store = tx.objectStore(tabela);
            return this._req(indice ? store.index(indice).count(valor) : store.count());
        });
    },

    async getMeta(chave, padrao = null) {
        const r = await this.buscar("meta", chave);
        return r ? r.valor : padrao;
    },

    setMeta(chave, valor) {
        return this._tx(["meta"], "readwrite", tx => this._req(tx.objectStore("meta").put({ chave, valor })));
    },

    /* Backup completo em JSON */
    async exportar() {
        const dados = { app: "IncluiEdu", versao: DB_VERSAO, exportadoEm: new Date().toISOString(), tabelas: {} };
        for (const t of Object.keys(TABELAS)) dados.tabelas[t] = await this.listar(t);
        return dados;
    },

    async importar(dados) {
        if (!dados || dados.app !== "IncluiEdu" || !dados.tabelas) {
            throw new Error("Arquivo de backup inválido.");
        }
        const nomes = Object.keys(TABELAS);
        await this._tx(nomes, "readwrite", tx => {
            nomes.forEach(t => {
                const store = tx.objectStore(t);
                store.clear();
                (dados.tabelas[t] || []).forEach(r => store.put(r));
            });
        });
    }
};


/* =====================================================
   SENHAS: SHA-256 + sal (SubtleCrypto, com alternativa)
   ===================================================== */

const Cripto = {
    sal() {
        const b = new Uint8Array(16);
        crypto.getRandomValues(b);
        return [...b].map(x => x.toString(16).padStart(2, "0")).join("");
    },

    async sha256(texto) {
        const bytes = new TextEncoder().encode(texto);
        if (window.crypto && crypto.subtle && window.isSecureContext !== false) {
            try {
                const h = await crypto.subtle.digest("SHA-256", bytes);
                return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, "0")).join("");
            } catch (e) { /* usa a implementação abaixo */ }
        }
        return sha256Js(bytes);
    },

    async hashSenha(senha, sal) {
        return this.sha256(sal + ":" + senha);
    }
};

/* SHA-256 em JavaScript puro (usado só se SubtleCrypto não estiver disponível) */
function sha256Js(bytes) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const l = bytes.length, bitLen = l * 8;
    const total = ((l + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(total);
    m.set(bytes); m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(total - 4, bitLen >>> 0);
    dv.setUint32(total - 8, Math.floor(bitLen / 4294967296));
    const w = new Uint32Array(64);
    const r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < total; i += 64) {
        for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
        for (let t = 16; t < 64; t++) {
            const s0 = r(w[t-15],7) ^ r(w[t-15],18) ^ (w[t-15] >>> 3);
            const s1 = r(w[t-2],17) ^ r(w[t-2],19) ^ (w[t-2] >>> 10);
            w[t] = (w[t-16] + s0 + w[t-7] + s1) >>> 0;
        }
        let [a,b,c,d,e,f,g,h] = H;
        for (let t = 0; t < 64; t++) {
            const S1 = r(e,6) ^ r(e,11) ^ r(e,25);
            const ch = (e & f) ^ (~e & g);
            const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
            const S0 = r(a,2) ^ r(a,13) ^ r(a,22);
            const mj = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (S0 + mj) >>> 0;
            h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
        }
        H = H.map((v, k) => (v + [a,b,c,d,e,f,g,h][k]) >>> 0);
    }
    return H.map(v => v.toString(16).padStart(8, "0")).join("");
}
