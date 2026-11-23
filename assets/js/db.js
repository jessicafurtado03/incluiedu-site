/* =====================================================
   INCLUIEDU • BANCO DE DADOS NA NUVEM (Supabase)
   Contas e dados sincronizados entre navegadores e aparelhos.
   Mesma interface de antes (DB.listar, DB.buscar, DB.onde, DB.salvar…),
   com segurança por linha (RLS) no servidor.
   ===================================================== */

const NUVEM_URL = "https://ksbkrjiseovpcupttpqh.supabase.co";
const NUVEM_CHAVE = "sb_publishable__e06h6zgVmF0noKeiE-syA_Se_jcfyl"; /* chave pública (publishable): pode ficar no site */
const DOMINIO_ALUNO = "aluno.incluiedu.local"; /* usuários de aluno sem e-mail viram usuario@aluno.incluiedu.local */
const DB_VERSAO = 4;

/* Colunas de busca de cada tabela (o resto do registro fica em "dados" jsonb) */
const COLUNAS = {
    usuarios: ["email", "tipo", "professorId", "alunoId", "authId"],
    alunos: ["professorId"],
    atividades: ["professorId", "materiaId"],
    adaptacoes: ["professorId", "alunoId", "atividadeId"],
    resultados: ["professorId", "alunoId", "atividadeId"],
    pontos: ["usuarioId"],
    tempo: ["usuarioId"],
    sugestoes: ["pagina", "usuarioId"]
};
const TABELAS = Object.keys(COLUNAS);
const CHAVE_TABELA = { tempo: "chave" };
const paraColuna = k => k.replace(/[A-Z]/g, c => "_" + c.toLowerCase());

const Nuvem = (() => {
    let cliente = null;
    function criar(opcoes) {
        if (!window.supabase || !window.supabase.createClient) throw new Error("Não foi possível carregar a conexão com o servidor do IncluiEdu. Verifique a internet e recarregue a página.");
        return window.supabase.createClient(NUVEM_URL, NUVEM_CHAVE, opcoes);
    }
    return {
        get sb() { if (!cliente) cliente = criar({ auth: { persistSession: true, autoRefreshToken: true, storageKey: "incluiedu-auth", detectSessionInUrl: false } }); return cliente; },
        /* cliente temporário (sem guardar sessão) para o professor criar a conta de um aluno sem sair da própria conta */
        temporario() { return criar({ auth: { persistSession: false, autoRefreshToken: false, storageKey: "incluiedu-tmp-" + Date.now(), detectSessionInUrl: false } }); }
    };
})();

let avisouSemConexao = false;
function erroAmigavel(erro) {
    const msg = String((erro && (erro.message || erro.error_description || erro.msg)) || erro || "");
    if (/failed to fetch|networkerror|network request|load failed|fetch failed|ERR_INTERNET|timeout/i.test(msg) || (typeof navigator !== "undefined" && navigator.onLine === false)) {
        if (!avisouSemConexao && typeof mostrarSemConexao === "function") { avisouSemConexao = true; mostrarSemConexao(); }
        return new Error("Sem conexão com o servidor do IncluiEdu. Verifique a internet e tente de novo.");
    }
    if (/JWT|session|refresh token/i.test(msg)) return new Error("Sua sessão expirou. Entre de novo, por favor.");
    if (/row-level security|permission denied|violates/i.test(msg)) return new Error("Você não tem permissão para esta ação.");
    return new Error(msg || "Algo deu errado. Tente de novo.");
}
async function rodar(consulta) {
    let r;
    try { r = await consulta; } catch (e) { throw erroAmigavel(e); }
    if (r.error) throw erroAmigavel(r.error);
    return r;
}

const MATERIAS_FIXAS = () => (typeof DADOS_MATERIAS !== "undefined" ? DADOS_MATERIAS : []).map((m, i) => Object.assign({}, m, { id: i + 1 }));

function paraLinha(tabela, reg) {
    const cols = COLUNAS[tabela] || [], linha = {}, dados = {};
    Object.entries(reg).forEach(([k, v]) => {
        if (v === undefined) return;
        if (k === "id" || k === CHAVE_TABELA[tabela]) { if (v !== null) linha[k] = v; }
        else if (cols.includes(k)) linha[paraColuna(k)] = v;
        else dados[k] = v;
    });
    linha.dados = dados;
    return linha;
}
function deLinha(tabela, linha) {
    if (!linha) return null;
    const reg = Object.assign({}, linha.dados || {});
    if (linha.id !== undefined) reg.id = linha.id;
    if (CHAVE_TABELA[tabela]) reg[CHAVE_TABELA[tabela]] = linha[CHAVE_TABELA[tabela]];
    (COLUNAS[tabela] || []).forEach(k => { const c = paraColuna(k); if (c in linha) reg[k] = linha[c]; });
    if (!reg.criadoEm && linha.criado_em) reg.criadoEm = linha.criado_em;
    return reg;
}
const chaveDe = t => CHAVE_TABELA[t] || "id";

const DB = {
    abrir() { Nuvem.sb; return Promise.resolve(true); },

    async listar(tabela) {
        if (tabela === "materias") return MATERIAS_FIXAS();
        const { data } = await rodar(Nuvem.sb.from(tabela).select("*").order(chaveDe(tabela)));
        return data.map(l => deLinha(tabela, l));
    },

    async buscar(tabela, id) {
        if (tabela === "materias") return MATERIAS_FIXAS().find(m => m.id === id) || null;
        if (id === null || id === undefined || id === "") return null;
        const { data } = await rodar(Nuvem.sb.from(tabela).select("*").eq(chaveDe(tabela), id).maybeSingle());
        return deLinha(tabela, data);
    },

    async onde(tabela, indice, valor) {
        if (tabela === "materias") return MATERIAS_FIXAS().filter(m => m[indice] === valor);
        if (valor === null || valor === undefined) return [];
        const { data } = await rodar(Nuvem.sb.from(tabela).select("*").eq(paraColuna(indice), valor).order(chaveDe(tabela)));
        return data.map(l => deLinha(tabela, l));
    },

    async primeiro(tabela, indice, valor) { return (await this.onde(tabela, indice, valor))[0] || null; },

    async contar(tabela, indice, valor) {
        const { count } = await rodar(Nuvem.sb.from(tabela).select("*", { count: "exact", head: true }).eq(paraColuna(indice), valor));
        return count || 0;
    },

    async salvar(tabela, registro) {
        const agora = new Date().toISOString();
        const reg = Object.assign({}, registro, { atualizadoEm: agora });
        if (!reg.criadoEm) reg.criadoEm = agora;
        const linha = paraLinha(tabela, reg);
        const sb = Nuvem.sb;
        if (tabela === "usuarios") { /* só os dados do perfil (nome, código da turma…) podem ser alterados */
            const d = Object.assign({}, linha.dados); delete d.criadoEm;
            await rodar(sb.from("usuarios").update({ dados: d }).eq("id", reg.id));
            return reg.id;
        }
        if (CHAVE_TABELA[tabela]) { await rodar(sb.from(tabela).upsert(linha, { onConflict: CHAVE_TABELA[tabela] })); return reg[CHAVE_TABELA[tabela]]; }
        if (tabela === "sugestoes" && !reg.id) { await rodar(sb.from(tabela).insert(linha)); return null; } /* visitante pode enviar, mas não ler */
        if (reg.id !== undefined && reg.id !== null) {
            const id = linha.id; delete linha.id;
            const { data } = await rodar(sb.from(tabela).update(linha).eq("id", id).select("id"));
            if (!data.length) throw new Error("Registro não encontrado ou sem permissão para alterar.");
            return id;
        }
        const { data } = await rodar(sb.from(tabela).insert(linha).select("id").single());
        return data.id;
    },

    async excluir(tabela, id) { await rodar(Nuvem.sb.from(tabela).delete().eq(chaveDe(tabela), id)); },

    async excluirOnde(tabela, indice, valor) { await rodar(Nuvem.sb.from(tabela).delete().eq(paraColuna(indice), valor)); },

    async rpc(nome, args) { const { data } = await rodar(Nuvem.sb.rpc(nome, args || {})); return data; },

    /* Pequenas preferências deste aparelho (não são dados da escola) */
    async getMeta(chave, padrao = null) {
        try { const v = localStorage.getItem("incluiedu_meta_" + chave); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
    },
    async setMeta(chave, valor) { localStorage.setItem("incluiedu_meta_" + chave, JSON.stringify(valor)); },

    /* Backup: tudo o que a sua conta pode ver */
    async exportar() {
        const dados = { app: "IncluiEdu", versao: DB_VERSAO, origem: "nuvem", exportadoEm: new Date().toISOString(), tabelas: {} };
        for (const t of TABELAS) dados.tabelas[t] = await this.listar(t);
        dados.tabelas.materias = MATERIAS_FIXAS();
        return dados;
    }
};
