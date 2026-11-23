/* =====================================================
   INCLUIEDU • APLICAÇÃO
   Contas, alunos, atividades, adaptações, resultados,
   área do aluno e configurações, tudo no banco IndexedDB.
   ===================================================== */

const App = { usuario: null, materias: [] };
const NIVEIS = {
    "independente": { texto: "Concluiu sozinho", cor: "verde", icone: "🟢" },
    "auxilio": { texto: "Concluiu com auxílio", cor: "amarelo", icone: "🟡" },
    "nao-concluiu": { texto: "Não conseguiu concluir", cor: "vermelho", icone: "🔴" }
};
const $ = s => document.querySelector(s);
const param = n => new URLSearchParams(location.search).get(n);
const numParam = n => { const v = Number(param(n)); return Number.isFinite(v) && v > 0 ? v : null; };
const hojeBR = () => new Date().toLocaleDateString("pt-BR");
const dataBR = iso => iso ? new Date(iso).toLocaleDateString("pt-BR") : "";


/* =====================================================
   PRIMEIRA EXECUÇÃO: matérias e modelos de exemplo
   ===================================================== */

async function semear() {
    if (await DB.getMeta("semeado")) return;
    const ids = {};
    for (const m of DADOS_MATERIAS) ids[m.slug] = await DB.salvar("materias", m);
    await DB.setMeta("modelosExemplo", DADOS_EXEMPLOS);
    await DB.setMeta("semeado", true);
}

/* Copia os exemplos para a conta de um professor */
async function criarExemplos(professorId) {
    const ex = await DB.getMeta("modelosExemplo", DADOS_EXEMPLOS);
    const materias = await DB.listar("materias");
    const mapaAluno = {}, mapaAtv = {};
    for (const a of ex.alunos) {
        mapaAluno[a.ref] = await DB.salvar("alunos", { nome: a.nome, turma: a.turma, caracteristicas: a.caracteristicas, recursos: a.recursos, professorId, exemplo: true });
    }
    for (const t of ex.atividades) {
        const mat = materias.find(m => m.slug === t.materia);
        mapaAtv[t.ref] = await DB.salvar("atividades", { titulo: t.titulo, materiaId: mat ? mat.id : null, turma: t.turma, objetivo: t.objetivo, conteudo: t.conteudo, professorId, exemplo: true });
    }
    for (const d of ex.adaptacoes) {
        await DB.salvar("adaptacoes", { atividadeId: mapaAtv[d.atividade], alunoId: mapaAluno[d.aluno], estrategias: d.estrategias, texto: d.texto, status: "aprovada", professorId, exemplo: true, concluida: false, estrelas: 0, respostas: {} });
    }
    for (const r of ex.resultados) {
        await DB.salvar("resultados", { alunoId: mapaAluno[r.aluno], atividadeId: mapaAtv[r.atividade], nivel: r.nivel, observacao: r.observacao, data: hojeBR(), professorId, exemplo: true });
    }
}

/* Migração do armazenamento antigo (LocalStorage) para o banco IndexedDB */
async function migrarArmazenamentoAntigo() {
    if (await DB.getMeta("migracaoLocalStorage")) return;
    const ler = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
    const antigos = ler("incluiedu_usuarios") || [];
    const ignorar = ["professora@incluiedu.com", "aluno@incluiedu.com"];
    const idsExemplo = new Set([101, 102, 103, 104, 105, 201, 202, 203, 204, 205, 206, 207, 301, 302, 303, 304, 305, 306, 307, 401, 402, 403, 404, 405, 406]);
    let professorMigrado = null;
    for (const u of antigos) {
        if (!u || !u.email || ignorar.includes(String(u.email).toLowerCase()) || u.tipo !== "professor") continue;
        if (await DB.primeiro("usuarios", "email", u.email.toLowerCase())) continue;
        const sal = Cripto.sal();
        const id = await DB.salvar("usuarios", { nome: u.nome, email: u.email.toLowerCase(), tipo: "professor", sal, senhaHash: await Cripto.hashSenha(u.senha || "", sal) });
        if (!professorMigrado) professorMigrado = id;
    }
    if (professorMigrado) {
        const materias = await DB.listar("materias");
        const mapaAluno = {}, mapaAtv = {};
        for (const a of (ler("incluiedu_alunos") || []).filter(a => !idsExemplo.has(a.id))) {
            mapaAluno[a.id] = await DB.salvar("alunos", { nome: a.nome, turma: a.turma, caracteristicas: a.caracteristicas, recursos: a.recursos, professorId: professorMigrado });
        }
        for (const t of (ler("incluiedu_atividades") || []).filter(t => !idsExemplo.has(t.id))) {
            const mat = materias.find(m => m.nome.toLowerCase() === String(t.disciplina || "").toLowerCase());
            mapaAtv[t.id] = await DB.salvar("atividades", { titulo: t.titulo, materiaId: mat ? mat.id : null, disciplinaLivre: mat ? "" : t.disciplina, turma: t.turma, objetivo: t.objetivo, conteudo: t.conteudo, professorId: professorMigrado });
        }
        for (const d of (ler("incluiedu_adaptacoes") || [])) {
            if (mapaAluno[d.alunoId] && mapaAtv[d.atividadeId]) await DB.salvar("adaptacoes", { atividadeId: mapaAtv[d.atividadeId], alunoId: mapaAluno[d.alunoId], estrategias: d.estrategias || [], texto: d.texto || "", status: "aprovada", professorId: professorMigrado, respostas: {} });
        }
        for (const r of (ler("incluiedu_resultados") || [])) {
            if (mapaAluno[r.alunoId] && mapaAtv[r.atividadeId]) await DB.salvar("resultados", { alunoId: mapaAluno[r.alunoId], atividadeId: mapaAtv[r.atividadeId], nivel: r.nivel, observacao: r.observacao, data: r.data, professorId: professorMigrado });
        }
    }
    Object.keys(localStorage).filter(k => k.startsWith("incluiedu_") && k !== "incluiedu_acessibilidade" && k !== "incluiedu_sessao")
        .forEach(k => localStorage.removeItem(k));
    await DB.setMeta("migracaoLocalStorage", true);
}


/* =====================================================
   SESSÃO E CONTAS
   ===================================================== */

async function usuarioAtual() {
    const id = Number(localStorage.getItem("incluiedu_sessao"));
    if (!id) return null;
    const u = await DB.buscar("usuarios", id);
    if (!u) localStorage.removeItem("incluiedu_sessao");
    return u || null;
}

function entrarSessao(usuario) { localStorage.setItem("incluiedu_sessao", String(usuario.id)); }

function sair() {
    localStorage.removeItem("incluiedu_sessao");
    location.href = "index.html";
}

async function criarUsuario({ nome, email, senha, tipo, alunoId = null, professorId = null }) {
    email = String(email).trim().toLowerCase();
    if (await DB.primeiro("usuarios", "email", email)) throw new Error("Este e-mail ou usuário já está cadastrado.");
    if (String(senha).length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    const sal = Cripto.sal();
    return DB.salvar("usuarios", { nome: String(nome).trim(), email, tipo, alunoId, professorId, sal, senhaHash: await Cripto.hashSenha(senha, sal) });
}

async function verificarSenha(usuario, senha) {
    return usuario && usuario.senhaHash === await Cripto.hashSenha(senha, usuario.sal);
}

function destinoPadrao(u) { return u.tipo === "professor" ? "dashboard-professor.html" : "dashboard-aluno.html"; }

function exigir(tipo) {
    if (!App.usuario || App.usuario.tipo !== tipo) {
        location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search));
        return false;
    }
    return true;
}

function primeiroNome(nome) { return String(nome || "").replace(/^Profa?\.\s*/i, "").split(" ")[0]; }


/* =====================================================
   CONSULTAS DO PROFESSOR
   ===================================================== */

const meus = tabela => DB.onde(tabela, "professorId", App.usuario.id);

async function carregarTudo() {
    const [alunos, atividades, adaptacoes, resultados] = await Promise.all([meus("alunos"), meus("atividades"), meus("adaptacoes"), meus("resultados")]);
    return { alunos, atividades, adaptacoes, resultados };
}

function materia(id) { return App.materias.find(m => m.id === id) || null; }
function nomeMateria(atv) { const m = materia(atv.materiaId); return m ? m.nome : (atv.disciplinaLivre || "Geral"); }
function corMateria(atv) { const m = materia(atv.materiaId); return m ? m.cor : "#5b54e8"; }
function emojiMateria(atv) { const m = materia(atv.materiaId); return m ? m.emoji : "📝"; }

const seloExemplo = r => r && r.exemplo ? ` <span class="selo-exemplo" title="Registro de exemplo: pode editar ou excluir">exemplo</span>` : "";

/* Exclusões em cascata */
async function excluirAluno(id) {
    await DB.excluirOnde("adaptacoes", "alunoId", id);
    await DB.excluirOnde("resultados", "alunoId", id);
    const acessos = (await DB.onde("usuarios", "professorId", App.usuario.id)).filter(u => u.alunoId === id);
    for (const u of acessos) await DB.excluir("usuarios", u.id);
    await DB.excluir("alunos", id);
}

async function excluirAtividade(id) {
    await DB.excluirOnde("adaptacoes", "atividadeId", id);
    const res = (await meus("resultados")).filter(r => r.atividadeId === id);
    for (const r of res) await DB.excluir("resultados", r.id);
    await DB.excluir("atividades", id);
}


/* =====================================================
   MOTOR DE SUGESTÕES DE ADAPTAÇÃO
   ===================================================== */

const REGRAS_ADAPTACAO = [
    { chaves: ["tdah", "atenção", "atencao", "foco", "hiperativ", "concentra"], motivo: "atenção e foco",
      estrategias: ["Utilizar instruções mais curtas", "Dividir a atividade em etapas", "Prever pausas entre as etapas"] },
    { chaves: ["dislexia", "leitura lenta", "troca de letras", "dificuldade de leitura", "textos longos", "texto longo"], motivo: "leitura",
      estrategias: ["Disponibilizar áudio", "Destacar palavras-chave", "Permitir resposta oral"] },
    { chaves: ["tea", "autis", "rotina", "previsível", "previsivel"], motivo: "previsibilidade e linguagem objetiva",
      estrategias: ["Usar linguagem direta e objetiva", "Antecipar as etapas com rotina visual", "Utilizar exemplos concretos"] },
    { chaves: ["baixa visão", "baixa visao", "cego", "cegueira", "fonte ampliada", "enxerga"], motivo: "acesso visual",
      estrategias: ["Ampliar a fonte e usar alto contraste", "Disponibilizar áudio", "Descrever as imagens"] },
    { chaves: ["surd", "auditiva", "libras", "audição", "audicao"], motivo: "comunicação em Libras",
      estrategias: ["Disponibilizar vídeo ou intérprete de Libras", "Utilizar apoio visual", "Usar legendas e esquemas"] },
    { chaves: ["motora", "física", "fisica", "cadeira de rodas", "coordenação", "coordenacao"], motivo: "coordenação motora",
      estrategias: ["Permitir resposta oral", "Oferecer resposta digital ou de marcar", "Considerar tempo adicional"] },
    { chaves: ["intelectual", "compreens", "abstrat", "alfabetiza"], motivo: "compreensão",
      estrategias: ["Simplificar o vocabulário", "Utilizar material concreto", "Utilizar apoio visual"] },
    { chaves: ["tempo adicional", "lento", "ansiedade", "ansios"], motivo: "ritmo", estrategias: ["Considerar tempo adicional"] }
];
const ESTRATEGIAS_PADRAO = ["Utilizar instruções mais curtas", "Dividir a atividade em etapas", "Utilizar apoio visual", "Destacar palavras-chave", "Disponibilizar áudio"];

function sugerirEstrategias(aluno) {
    const texto = ((aluno.caracteristicas || "") + " " + (aluno.recursos || "")).toLowerCase();
    const sugeridas = [], motivos = [];
    REGRAS_ADAPTACAO.forEach(r => {
        if (r.chaves.some(c => texto.includes(c))) {
            motivos.push(r.motivo);
            r.estrategias.forEach(e => { if (!sugeridas.includes(e)) sugeridas.push(e); });
        }
    });
    const todas = [...sugeridas];
    ESTRATEGIAS_PADRAO.forEach(e => { if (!todas.includes(e)) todas.push(e); });
    return { sugeridas, todas, motivos };
}

function gerarTextoAdaptado(conteudo, estrategias) {
    let frases = String(conteudo || "").replace(/\s+/g, " ").split(/(?<=[.?!])\s+/).map(f => f.trim()).filter(Boolean);
    if (!frases.length) frases = [String(conteudo || "")];
    let linhas = frases.map((f, i) => `Etapa ${i + 1}: ${f}`);
    if (estrategias.includes("Destacar palavras-chave")) {
        linhas = linhas.map(l => l.replace(/\b(leia|explique|desenhe|represente|pinte|escreva|observe|responda|quem|qual|quantas|quantos|justifique|ouça|escolha|conte)\b/gi, p => p.toUpperCase()));
    }
    const obs = [];
    if (estrategias.includes("Prever pausas entre as etapas")) obs.push("faça uma pausa curta ao terminar cada etapa");
    if (estrategias.includes("Considerar tempo adicional")) obs.push("você tem tempo extra");
    if (estrategias.includes("Permitir resposta oral")) obs.push("você pode responder falando");
    if (estrategias.includes("Disponibilizar áudio")) obs.push("toque em Ouvir para escutar cada etapa");
    if (obs.length) linhas.push("", "Lembrete: " + obs.join("; ") + ".");
    return linhas.join("\n");
}


/* =====================================================
   CABEÇALHO DO SISTEMA
   ===================================================== */

function preencherUsuario() {
    document.querySelectorAll("[data-nome-usuario]").forEach(el => { el.textContent = App.usuario ? App.usuario.nome : ""; });
    document.querySelectorAll("[data-primeiro-nome]").forEach(el => { el.textContent = App.usuario ? primeiroNome(App.usuario.nome) : ""; });
    /* Site público: troca "Entrar/Criar conta" por "Minha área" quando há sessão */
    const acoes = document.querySelector("header .acoes");
    if (acoes && App.usuario) {
        acoes.innerHTML = `<a class="btn" href="${destinoPadrao(App.usuario)}">Minha área</a>`;
    }
}


/* =====================================================
   PÁGINAS
   ===================================================== */

const Paginas = {};

/* ---------- LOGIN ---------- */
Paginas.login = async () => {
    if (App.usuario && !param("next")) { location.replace(destinoPadrao(App.usuario)); return; }
    $("#formLogin").addEventListener("submit", async e => {
        e.preventDefault();
        const email = $("#email").value.trim().toLowerCase();
        const u = await DB.primeiro("usuarios", "email", email);
        if (!(await verificarSenha(u, $("#senha").value))) {
            mensagem("mensagemLogin", "E-mail/usuário ou senha incorretos.", "erro");
            return;
        }
        entrarSessao(u);
        const next = param("next");
        location.href = next && !/^https?:|^\/\//i.test(next) ? next : destinoPadrao(u);
    });
};

/* ---------- CADASTRO DO PROFESSOR ---------- */
/* ---------- CÓDIGO DA TURMA DO PROFESSOR ---------- */
function gerarCodigo() {
    const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const v = crypto.getRandomValues(new Uint8Array(6));
    return "IE-" + [...v].map(n => letras[n % letras.length]).join("");
}

async function garantirCodigo(usuario) {
    if (usuario.codigoTurma) return usuario.codigoTurma;
    let codigo;
    do { codigo = gerarCodigo(); } while (await buscarProfessorPorVinculo(codigo));
    usuario.codigoTurma = codigo;
    await DB.salvar("usuarios", usuario);
    return codigo;
}

async function buscarProfessorPorVinculo(valor) {
    const v = String(valor || "").trim();
    if (!v) return null;
    const porEmail = await DB.primeiro("usuarios", "email", v.toLowerCase());
    if (porEmail && porEmail.tipo === "professor") return porEmail;
    const profs = await DB.onde("usuarios", "tipo", "professor");
    return profs.find(p => (p.codigoTurma || "").toUpperCase() === v.toUpperCase()) || null;
}

/* Atividades de exemplo para o aluno sem professor vinculado (escopo próprio: professorId negativo) */
async function criarExemplosAluno(alunoId, escopo) {
    const ex = await DB.getMeta("modelosExemplo", DADOS_EXEMPLOS);
    for (const t of ex.atividades) {
        const mat = App.materias.find(m => m.slug === t.materia);
        const atvId = await DB.salvar("atividades", { titulo: t.titulo, materiaId: mat ? mat.id : null, turma: t.turma, objetivo: t.objetivo, conteudo: t.conteudo, professorId: escopo, exemplo: true });
        const modelo = ex.adaptacoes.find(d => d.atividade === t.ref);
        const estr = modelo ? modelo.estrategias : ESTRATEGIAS_PADRAO.slice(0, 3);
        await DB.salvar("adaptacoes", { atividadeId: atvId, alunoId, estrategias: estr, texto: modelo ? modelo.texto : gerarTextoAdaptado(t.conteudo, estr),
            status: "aprovada", professorId: escopo, exemplo: true, concluida: false, estrelas: 0, respostas: {} });
    }
}

async function vincularAluno(usuario, professor) {
    const aluno = await DB.buscar("alunos", usuario.alunoId);
    const escopoAntigo = usuario.professorId;
    if (escopoAntigo !== null && escopoAntigo < 0) {
        await DB.excluirOnde("adaptacoes", "professorId", escopoAntigo);
        await DB.excluirOnde("atividades", "professorId", escopoAntigo);
    }
    await DB.salvar("alunos", Object.assign({}, aluno, { professorId: professor.id }));
    const atualizado = Object.assign({}, usuario, { professorId: professor.id });
    await DB.salvar("usuarios", atualizado);
    return atualizado;
}

/* ---------- CADASTRO (ALUNO OU PROFESSOR) ---------- */
Paginas.cadastro = async () => {
    const aplicarTipo = () => {
        const tipo = document.querySelector('input[name="tipoConta"]:checked').value;
        const aluno = tipo === "aluno";
        document.querySelectorAll("[data-so-aluno]").forEach(el => { el.hidden = !aluno; });
        document.querySelectorAll("[data-so-professor]").forEach(el => { el.hidden = aluno; });
        $("#rotuloEmail").textContent = aluno ? "Usuário ou e-mail" : "E-mail";
        $("#emailCadastro").type = aluno ? "text" : "email";
        $("#emailCadastro").placeholder = aluno ? "Ex.: laura.5b ou seuemail@email.com" : "seuemail@email.com";
        $("#nomeCadastro").placeholder = aluno ? "Seu nome" : "Ex.: Profa. Ana Ribeiro";
        $("#btnCriarConta").textContent = aluno ? "Criar minha conta de aluno" : "Criar conta de professor";
    };
    document.querySelectorAll('input[name="tipoConta"]').forEach(r => r.addEventListener("change", aplicarTipo));
    if (param("tipo") === "aluno") $("#tipoAluno").checked = true;
    aplicarTipo();

    $("#formCadastro").addEventListener("submit", async e => {
        e.preventDefault();
        if ($("#senhaCadastro").value !== $("#senhaConfirma").value) { mensagem("mensagemCadastro", "As senhas não conferem.", "erro"); return; }
        const tipo = document.querySelector('input[name="tipoConta"]:checked').value;
        try {
            if (tipo === "professor") {
                const id = await criarUsuario({ nome: $("#nomeCadastro").value, email: $("#emailCadastro").value, senha: $("#senhaCadastro").value, tipo: "professor" });
                await garantirCodigo(await DB.buscar("usuarios", id));
                if ($("#incluirExemplos").checked) await criarExemplos(id);
                entrarSessao({ id });
                mensagem("mensagemCadastro", "Conta criada! Abrindo sua área…", "sucesso");
                setTimeout(() => { location.href = "dashboard-professor.html?bemvindo=1"; }, 700);
                return;
            }
            const vinculo = $("#vinculoProfessor").value.trim();
            const professor = vinculo ? await buscarProfessorPorVinculo(vinculo) : null;
            if (vinculo && !professor) throw new Error("Não encontramos um professor com esse código ou e-mail. Confira ou deixe o campo em branco.");
            const nome = $("#nomeCadastro").value.trim();
            const uid = await criarUsuario({ nome, email: $("#emailCadastro").value, senha: $("#senhaCadastro").value, tipo: "aluno" });
            const escopo = professor ? professor.id : -uid;
            const alunoId = await DB.salvar("alunos", { nome, turma: $("#turmaCadastro").value.trim() || "A definir", caracteristicas: "", recursos: "", professorId: escopo, autoCadastro: true });
            const u = await DB.buscar("usuarios", uid);
            await DB.salvar("usuarios", Object.assign({}, u, { alunoId, professorId: escopo }));
            if (!professor) await criarExemplosAluno(alunoId, escopo);
            entrarSessao({ id: uid });
            mensagem("mensagemCadastro", "Conta criada! Abrindo sua área…", "sucesso");
            setTimeout(() => { location.href = "dashboard-aluno.html?bemvindo=1"; }, 700);
        } catch (erro) {
            mensagem("mensagemCadastro", erro.message, "erro");
        }
    });
};

/* ---------- DASHBOARD DO PROFESSOR ---------- */
Paginas.dashboardProfessor = async () => {
    if (!exigir("professor")) return;
    const d = await carregarTudo();
    $("#totalAlunos").textContent = d.alunos.length;
    $("#totalAtividades").textContent = d.atividades.length;
    $("#totalAdaptacoes").textContent = d.adaptacoes.length;
    $("#totalResultados").textContent = d.resultados.length;
    if (param("bemvindo")) $("#boasVindas").hidden = false;
    document.querySelectorAll("[data-codigo-turma]").forEach(async el => { el.textContent = await garantirCodigo(App.usuario); });
    const temExemplo = [...d.alunos, ...d.atividades].some(r => r.exemplo);
    $("#avisoExemplos").hidden = !temExemplo;
    $("#btnExcluirExemplos")?.addEventListener("click", async () => {
        if (!(await confirmar("Excluir todos os alunos, atividades, adaptações e resultados marcados como exemplo?", { titulo: "Excluir exemplos", ok: "Excluir", perigo: true }))) return;
        for (const t of ["resultados", "adaptacoes", "atividades", "alunos"]) {
            for (const r of (await meus(t)).filter(x => x.exemplo)) await DB.excluir(t, r.id);
        }
        avisar("Exemplos excluídos.");
        setTimeout(() => location.reload(), 600);
    });
    const ult = d.atividades.slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || "")).slice(0, 4);
    $("#ultimasAtividades").innerHTML = ult.length ? ult.map(a => `
        <div class="item-lista compacto">
            <div class="item-avatar" style="--cor:${corMateria(a)}" aria-hidden="true">${emojiMateria(a)}</div>
            <div class="item-info"><strong>${esc(a.titulo)}${seloExemplo(a)}</strong><p>${esc(nomeMateria(a))} • ${esc(a.turma)}</p></div>
            <a class="btn-small" href="adaptar-atividade.html?atividade=${a.id}">Adaptar</a>
        </div>`).join("") : `<p class="empty">Nenhuma atividade ainda. <a href="nova-atividade.html">Criar a primeira</a>.</p>`;
    resumoResultados(d.resultados, $("#resumoResultados"));
    await engajamentoTurma(d.alunos);
};

/* Pontos, dias e tempo de estudo de cada aluno e de cada turma */
async function engajamentoTurma(alunos) {
    const alvo = $("#engajamentoTurma");
    if (!alvo || typeof Engaja === "undefined") return;
    const contas = (await DB.onde("usuarios", "professorId", App.usuario.id)).filter(u => u.tipo === "aluno");
    if (!contas.length) { alvo.innerHTML = `<p class="empty">Quando seus alunos entrarem com a conta deles, os pontos, a sequência de dias e o tempo de estudo aparecem aqui.</p>`; return; }
    const linhas = [];
    for (const u of contas) {
        const r = await Engaja.resumo(u.id);
        const ficha = alunos.find(a => a.id === u.alunoId) || {};
        linhas.push({ nome: ficha.nome || u.nome, turma: ficha.turma || "Sem turma", alunoId: u.alunoId, r });
    }
    const turmas = {};
    linhas.forEach(l => { const t = turmas[l.turma] = turmas[l.turma] || { alunos: 0, pontos: 0, min: 0, ativos: 0 }; t.alunos++; t.pontos += l.r.pontos; t.min += l.r.minSemana; if (l.r.minSemana > 0 || l.r.ultimos7.some(d => d.pts)) t.ativos++; });
    alvo.innerHTML = `
        <h3>Por turma</h3>
        <div class="tabela-rolar"><table class="tabela-engaja"><thead><tr><th>Turma</th><th>Alunos</th><th>Pontos</th><th>Min. na semana</th><th>Média min./aluno</th><th>Ativos na semana</th></tr></thead><tbody>
        ${Object.entries(turmas).map(([t, v]) => `<tr><td>${esc(t)}</td><td>${v.alunos}</td><td>${v.pontos}</td><td>${v.min}</td><td>${Math.round(v.min / v.alunos)}</td><td>${v.ativos}/${v.alunos}</td></tr>`).join("")}
        </tbody></table></div>
        <h3>Por aluno</h3>
        <div class="tabela-rolar"><table class="tabela-engaja" id="tabelaEngajaAlunos"><thead><tr><th>Aluno</th><th>Turma</th><th>🏅 Pontos</th><th>🔥 Sequência</th><th>📚 Dias</th><th>⏱️ Hoje</th><th>📆 Semana</th><th>Últimos 7 dias</th></tr></thead><tbody>
        ${linhas.sort((a, b) => b.r.pontos - a.r.pontos).map(l => `<tr><td>${l.alunoId ? `<a href="perfil-aluno.html?id=${l.alunoId}">${esc(l.nome)}</a>` : esc(l.nome)}</td><td>${esc(l.turma)}</td><td>${l.r.pontos}</td><td>${l.r.sequencia} ${l.r.sequencia === 1 ? "dia" : "dias"}</td><td>${l.r.diasEstudados}</td><td>${l.r.minHoje} min</td><td>${l.r.minSemana} min</td><td><span class="mini-barras" aria-label="Minutos por dia: ${l.r.ultimos7.map(d => d.min).join(", ")}">${l.r.ultimos7.map(d => `<i style="height:${Math.max(10, d.min / Math.max(1, ...l.r.ultimos7.map(x => x.min)) * 100)}%" class="${d.min || d.pts ? "on" : ""}"></i>`).join("")}</span></td></tr>`).join("")}
        </tbody></table></div>`;
}

function resumoResultados(resultados, alvo) {
    if (!alvo) return;
    const total = resultados.length;
    alvo.innerHTML = Object.entries(NIVEIS).map(([k, n]) => {
        const q = resultados.filter(r => r.nivel === k).length;
        const pct = total ? Math.round(q / total * 100) : 0;
        return `<div class="barra-linha"><span>${n.icone} ${n.texto}</span><div class="barra" role="img" aria-label="${pct}%"><div class="barra-${n.cor}" style="width:${pct}%"></div></div><strong>${q}</strong></div>`;
    }).join("") + (total ? "" : `<p class="empty">Nenhum resultado registrado ainda.</p>`);
}

/* ---------- ALUNOS ---------- */
Paginas.alunos = async () => {
    if (!exigir("professor")) return;
    const form = $("#formAluno");
    const limpar = () => { form.reset(); $("#alunoId").value = ""; $("#tituloFormAluno").textContent = "Cadastrar aluno"; $("#btnSalvarAluno").textContent = "Cadastrar aluno"; $("#btnCancelarAluno").hidden = true; };

    async function listar() {
        const filtro = ($("#buscaAluno").value || "").toLowerCase();
        const alunos = (await meus("alunos")).filter(a => (a.nome + " " + a.turma).toLowerCase().includes(filtro)).sort((a, b) => a.nome.localeCompare(b.nome));
        $("#contagemAlunos").textContent = alunos.length + (alunos.length === 1 ? " aluno" : " alunos");
        $("#listaAlunos").innerHTML = alunos.length ? alunos.map(a => `
            <div class="item-lista">
                <div class="item-avatar" aria-hidden="true">${esc(a.nome.charAt(0))}</div>
                <div class="item-info"><strong>${esc(a.nome)}${seloExemplo(a)}</strong><p>${esc(a.turma)}</p>${a.caracteristicas ? `<small>${esc(a.caracteristicas)}</small>` : ""}</div>
                <div class="acoes-item">
                    <a class="btn-small" href="aluno-perfil.html?id=${a.id}">Perfil</a>
                    <button class="btn-icone" type="button" data-editar="${a.id}" aria-label="Editar ${esc(a.nome)}">✏️</button>
                    <button class="btn-icone perigo" type="button" data-excluir="${a.id}" aria-label="Excluir ${esc(a.nome)}">🗑️</button>
                </div>
            </div>`).join("") : `<p class="empty">Nenhum aluno encontrado.</p>`;
    }

    async function editar(id) {
        const a = await DB.buscar("alunos", id);
        if (!a || a.professorId !== App.usuario.id) return;
        $("#alunoId").value = a.id; $("#nomeAluno").value = a.nome; $("#turmaAluno").value = a.turma;
        $("#caracteristicasAluno").value = a.caracteristicas || ""; $("#recursosAluno").value = a.recursos || "";
        $("#tituloFormAluno").textContent = "Editar aluno"; $("#btnSalvarAluno").textContent = "Salvar alterações"; $("#btnCancelarAluno").hidden = false;
        form.scrollIntoView({ behavior: "smooth" }); $("#nomeAluno").focus();
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const id = Number($("#alunoId").value) || null;
        const atual = id ? await DB.buscar("alunos", id) : {};
        await DB.salvar("alunos", Object.assign({}, atual, { id: id || undefined, nome: $("#nomeAluno").value.trim(), turma: $("#turmaAluno").value.trim(),
            caracteristicas: $("#caracteristicasAluno").value.trim(), recursos: $("#recursosAluno").value.trim(), professorId: App.usuario.id }));
        avisar(id ? "Aluno atualizado!" : "Aluno cadastrado!");
        limpar(); listar();
    });
    $("#btnCancelarAluno").addEventListener("click", limpar);
    $("#buscaAluno").addEventListener("input", listar);
    $("#listaAlunos").addEventListener("click", async e => {
        const ed = e.target.closest("[data-editar]"), ex = e.target.closest("[data-excluir]");
        if (ed) editar(Number(ed.dataset.editar));
        if (ex) {
            const a = await DB.buscar("alunos", Number(ex.dataset.excluir));
            if (await confirmar(`Excluir ${a.nome}? As adaptações, os resultados e o acesso deste aluno também serão excluídos.`, { titulo: "Excluir aluno", ok: "Excluir", perigo: true })) {
                await excluirAluno(a.id); avisar("Aluno excluído.", "info"); listar();
            }
        }
    });
    if (numParam("editar")) editar(numParam("editar"));
    listar();
};

/* ---------- PERFIL DO ALUNO ---------- */
Paginas.perfilAluno = async () => {
    if (!exigir("professor")) return;
    const id = numParam("id");
    const aluno = id ? await DB.buscar("alunos", id) : null;
    const box = $("#perfilAluno");
    if (!aluno || aluno.professorId !== App.usuario.id) {
        box.innerHTML = `<div class="dashboard-card"><h2>Aluno não encontrado.</h2><a class="btn" href="alunos.html">Voltar para alunos</a></div>`;
        return;
    }
    const d = await carregarTudo();
    const titulo = idAtv => (d.atividades.find(a => a.id === idAtv) || {}).titulo || "Atividade";
    const adapt = d.adaptacoes.filter(a => a.alunoId === aluno.id);
    const res = d.resultados.filter(r => r.alunoId === aluno.id);
    const acesso = (await DB.onde("usuarios", "professorId", App.usuario.id)).find(u => u.alunoId === aluno.id);
    const estrelas = adapt.reduce((s, a) => s + (a.estrelas || 0), 0);

    box.innerHTML = `
        <section class="dashboard-card perfil-topo">
            <div class="perfil-avatar" aria-hidden="true">${esc(aluno.nome.charAt(0))}</div>
            <div>
                <span class="rotulo">PERFIL PEDAGÓGICO</span>
                <h1>${esc(aluno.nome)}${seloExemplo(aluno)}</h1>
                <p>Turma: ${esc(aluno.turma)} • ⭐ ${estrelas} estrelas • ${adapt.filter(a => a.concluida).length}/${adapt.length} atividades concluídas</p>
            </div>
            <div class="botoes-linha">
                <a class="btn" href="adaptar-atividade.html?aluno=${aluno.id}">🧩 Adaptar atividade</a>
                <a class="btn-outline" href="alunos.html?editar=${aluno.id}">✏️ Editar</a>
                <button class="btn-outline perigo" type="button" id="btnExcluirAluno">🗑️ Excluir</button>
            </div>
        </section>
        <div class="perfil-grid">
            <section class="dashboard-card"><h2>🧠 Características de aprendizagem</h2><p>${esc(aluno.caracteristicas) || "Nenhuma informação registrada."}</p></section>
            <section class="dashboard-card"><h2>🧩 Recursos facilitadores</h2><p>${esc(aluno.recursos) || "Nenhum recurso registrado."}</p></section>
        </div>
        <section class="dashboard-card" id="cardAcesso">
            <h2>🔑 Acesso do aluno</h2>
            ${acesso ? `
                <p>O aluno entra em <strong>Entrar</strong> com o usuário <strong>${esc(acesso.email)}</strong> e a senha definida por você.</p>
                <form id="formNovaSenhaAluno" class="form-linha">
                    <label for="novaSenhaAluno" class="sr-only">Nova senha</label>
                    <input type="text" id="novaSenhaAluno" minlength="6" placeholder="Nova senha (mín. 6 caracteres)" required>
                    <button class="btn-outline" type="submit">Trocar senha</button>
                    <button class="btn-outline perigo" type="button" id="btnRemoverAcesso">Remover acesso</button>
                </form>` : `
                <p>Crie um usuário e uma senha para ${esc(primeiroNome(aluno.nome))} ver as atividades adaptadas na Área do Aluno.</p>
                <form id="formAcessoAluno" class="form-linha">
                    <label for="usuarioAluno" class="sr-only">Usuário ou e-mail</label>
                    <input type="text" id="usuarioAluno" placeholder="Usuário ou e-mail (ex.: ${esc(primeiroNome(aluno.nome).toLowerCase())}.${esc(aluno.turma.replace(/\W+/g, "").toLowerCase())})" required>
                    <label for="senhaAluno" class="sr-only">Senha</label>
                    <input type="text" id="senhaAluno" minlength="6" placeholder="Senha (mín. 6 caracteres)" required>
                    <button class="btn" type="submit">Criar acesso</button>
                </form>`}
            <p id="mensagemAcesso" class="mensagem" role="status"></p>
        </section>
        <section class="dashboard-card">
            <h2>📚 Memória pedagógica</h2>
            ${adapt.length || res.length ? `<ul class="timeline">
                ${adapt.map(a => `<li><strong>🧩 ${esc(titulo(a.atividadeId))}</strong><small>${dataBR(a.criadoEm)} • adaptação ${a.concluida ? "• ✅ concluída pelo aluno (" + "⭐".repeat(a.estrelas || 0) + ")" : ""}</small>
                    <p>${(a.estrategias || []).map(e => `<span class="tag">${esc(e)}</span>`).join(" ")}</p>
                    <p><a href="adaptar-atividade.html?editar=${a.id}">Abrir adaptação →</a></p></li>`).join("")}
                ${res.map(r => `<li><strong>${(NIVEIS[r.nivel] || {}).icone || "📊"} ${esc(titulo(r.atividadeId))}</strong><small>${esc(r.data || "")} • ${esc((NIVEIS[r.nivel] || {}).texto || r.nivel)}</small>${r.observacao ? `<p>${esc(r.observacao)}</p>` : ""}</li>`).join("")}
            </ul>` : `<p>O histórico das estratégias utilizadas aparecerá aqui conforme as atividades forem adaptadas e os resultados registrados.</p>`}
        </section>`;

    $("#btnExcluirAluno").addEventListener("click", async () => {
        if (await confirmar(`Excluir ${aluno.nome} e todo o histórico?`, { titulo: "Excluir aluno", ok: "Excluir", perigo: true })) {
            await excluirAluno(aluno.id); location.href = "alunos.html";
        }
    });
    $("#formAcessoAluno")?.addEventListener("submit", async e => {
        e.preventDefault();
        try {
            await criarUsuario({ nome: aluno.nome, email: $("#usuarioAluno").value, senha: $("#senhaAluno").value, tipo: "aluno", alunoId: aluno.id, professorId: App.usuario.id });
            avisar("Acesso criado!"); setTimeout(() => location.reload(), 600);
        } catch (erro) { mensagem("mensagemAcesso", erro.message, "erro"); }
    });
    $("#formNovaSenhaAluno")?.addEventListener("submit", async e => {
        e.preventDefault();
        const nova = $("#novaSenhaAluno").value;
        if (nova.length < 6) { mensagem("mensagemAcesso", "A senha precisa ter pelo menos 6 caracteres.", "erro"); return; }
        const sal = Cripto.sal();
        await DB.salvar("usuarios", Object.assign({}, acesso, { sal, senhaHash: await Cripto.hashSenha(nova, sal) }));
        $("#novaSenhaAluno").value = "";
        mensagem("mensagemAcesso", "Senha alterada.", "sucesso");
    });
    $("#btnRemoverAcesso")?.addEventListener("click", async () => {
        if (await confirmar("Remover o acesso deste aluno? O histórico continua salvo.", { ok: "Remover", perigo: true })) {
            await DB.excluir("usuarios", acesso.id); location.reload();
        }
    });
};

/* ---------- ATIVIDADES ---------- */
Paginas.atividades = async () => {
    if (!exigir("professor")) return;
    const sel = $("#filtroMateria");
    sel.innerHTML = `<option value="">Todas as matérias</option>` + App.materias.map(m => `<option value="${m.id}">${m.emoji} ${esc(m.nome)}</option>`).join("");
    async function listar() {
        const f = Number(sel.value) || null, q = ($("#buscaAtividade").value || "").toLowerCase();
        const lista = (await meus("atividades")).filter(a => (!f || a.materiaId === f) && (a.titulo + " " + a.turma).toLowerCase().includes(q))
            .sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
        $("#listaAtividades").innerHTML = lista.length ? lista.map(a => `
            <div class="item-lista">
                <div class="item-avatar" style="--cor:${corMateria(a)}" aria-hidden="true">${emojiMateria(a)}</div>
                <div class="item-info"><strong>${esc(a.titulo)}${seloExemplo(a)}</strong><p>${esc(nomeMateria(a))} • ${esc(a.turma)}</p>${a.objetivo ? `<small>Objetivo: ${esc(a.objetivo)}</small>` : ""}</div>
                <div class="acoes-item">
                    <a class="btn-small" href="adaptar-atividade.html?atividade=${a.id}">Adaptar</a>
                    <a class="btn-icone" href="nova-atividade.html?id=${a.id}" aria-label="Editar ${esc(a.titulo)}">✏️</a>
                    <button class="btn-icone perigo" type="button" data-excluir="${a.id}" aria-label="Excluir ${esc(a.titulo)}">🗑️</button>
                </div>
            </div>`).join("") : `<p class="empty">Nenhuma atividade encontrada. <a href="nova-atividade.html">Criar atividade</a>.</p>`;
    }
    sel.addEventListener("change", listar);
    $("#buscaAtividade").addEventListener("input", listar);
    $("#listaAtividades").addEventListener("click", async e => {
        const ex = e.target.closest("[data-excluir]");
        if (!ex) return;
        const a = await DB.buscar("atividades", Number(ex.dataset.excluir));
        if (await confirmar(`Excluir "${a.titulo}"? As adaptações e resultados dela também serão excluídos.`, { titulo: "Excluir atividade", ok: "Excluir", perigo: true })) {
            await excluirAtividade(a.id); avisar("Atividade excluída.", "info"); listar();
        }
    });
    listar();
};

/* ---------- NOVA / EDITAR ATIVIDADE ---------- */
Paginas.novaAtividade = async () => {
    if (!exigir("professor")) return;
    $("#materiaAtividade").innerHTML = `<option value="">Selecione a matéria</option>` + App.materias.map(m => `<option value="${m.id}">${m.emoji} ${esc(m.nome)}</option>`).join("");
    const id = numParam("id");
    let atual = {};
    if (id) {
        atual = await DB.buscar("atividades", id);
        if (!atual || atual.professorId !== App.usuario.id) { location.replace("atividades.html"); return; }
        $("#tituloPagina").textContent = "Editar atividade";
        $("#tituloAtividade").value = atual.titulo; $("#materiaAtividade").value = atual.materiaId || "";
        $("#turmaAtividade").value = atual.turma; $("#objetivoAtividade").value = atual.objetivo || ""; $("#conteudoAtividade").value = atual.conteudo || "";
        $("#btnSalvarAtividade").textContent = "Salvar alterações";
    }
    $("#formAtividade").addEventListener("submit", async e => {
        e.preventDefault();
        const novoId = await DB.salvar("atividades", Object.assign({}, atual, { id: id || undefined, titulo: $("#tituloAtividade").value.trim(), materiaId: Number($("#materiaAtividade").value) || null,
            turma: $("#turmaAtividade").value.trim(), objetivo: $("#objetivoAtividade").value.trim(), conteudo: $("#conteudoAtividade").value.trim(), professorId: App.usuario.id }));
        avisar(id ? "Atividade atualizada!" : "Atividade criada!");
        setTimeout(() => { location.href = $("#irAdaptar").checked ? "adaptar-atividade.html?atividade=" + novoId : "atividades.html"; }, 600);
    });
};

/* ---------- ADAPTAR ATIVIDADE (com prévia visual) ---------- */
Paginas.adaptar = async () => {
    if (!exigir("professor")) return;
    const d = await carregarTudo();
    const selAtv = $("#atividadeSelecionada"), selAluno = $("#alunoSelecionado");
    selAtv.innerHTML = `<option value="">Selecione uma atividade</option>` + d.atividades.map(a => `<option value="${a.id}">${emojiMateria(a)} ${esc(a.titulo)}</option>`).join("");
    selAluno.innerHTML = `<option value="">Selecione um aluno</option>` + d.alunos.map(a => `<option value="${a.id}">${esc(a.nome)} – ${esc(a.turma)}</option>`).join("");
    if (numParam("atividade")) selAtv.value = numParam("atividade");
    if (numParam("aluno")) selAluno.value = numParam("aluno");
    let editandoId = null;
    const area = $("#resultadoAdaptacao");

    function abrirEditor(atividade, aluno, existente) {
        const { sugeridas, todas, motivos } = sugerirEstrategias(aluno);
        const marcadas = existente ? (existente.estrategias || []) : (sugeridas.length ? sugeridas : ESTRATEGIAS_PADRAO.slice(0, 2));
        const lista = [...new Set([...marcadas, ...todas])];
        area.hidden = false;
        area.innerHTML = `
            <div class="passos-fluxo" aria-label="Etapas">
                <span class="feito">1 Escolha</span><span class="feito">2 Estratégias</span><span class="atual">3 Texto e prévia</span><span>4 Salvar</span>
            </div>
            <span class="rotulo">${existente ? "EDITANDO ADAPTAÇÃO" : "SUGESTÕES DE ADAPTAÇÃO"}</span>
            <h2>${esc(atividade.titulo)}</h2>
            <p>Para: <strong>${esc(aluno.nome)}</strong> • ${esc(nomeMateria(atividade))}</p>
            <div class="adapt-grid">
                <div>
                    <h3>💡 Estratégias</h3>
                    <div class="lista-checks" id="listaEstrategias">
                        ${lista.map(e => `<label class="check"><input type="checkbox" value="${esc(e)}" ${marcadas.includes(e) ? "checked" : ""}><span>${esc(e)}</span></label>`).join("")}
                    </div>
                    <h3>🧠 Por que essas sugestões?</h3>
                    <p>${motivos.length ? `O perfil indica necessidades relacionadas a <strong>${esc(motivos.join(", "))}</strong>.` : "Complete as características do aluno para sugestões mais precisas."}
                       A decisão final é sempre do professor.</p>
                    <h3>✏️ Atividade adaptada</h3>
                    <p class="dica">Cada linha "Etapa N:" vira um passo ilustrado. Edite à vontade: a prévia se atualiza sozinha.</p>
                    <textarea id="textoAdaptado" rows="11" aria-label="Texto da atividade adaptada"></textarea>
                    <div class="botoes-linha">
                        <button class="btn-outline" type="button" id="btnRegerar">↻ Gerar texto de novo</button>
                        <button class="btn" type="button" id="btnSalvarAdaptacao">💾 ${existente ? "Salvar alterações" : "Salvar adaptação"}</button>
                    </div>
                </div>
                <div class="previa">
                    <h3>👀 Como vai ficar</h3>
                    <div class="previa-folha" id="previaFolha"></div>
                    <div class="botoes-linha">
                        <button class="btn-outline" type="button" id="btnPNG">⬇️ Baixar PNG</button>
                        <button class="btn-outline" type="button" id="btnImprimir">🖨️ Imprimir</button>
                    </div>
                </div>
            </div>`;
        const ta = $("#textoAdaptado");
        ta.value = existente ? existente.texto : gerarTextoAdaptado(atividade.conteudo, marcadas);
        const checks = () => [...area.querySelectorAll("#listaEstrategias input:checked")].map(i => i.value);
        const svgAtual = () => Visual.folha({ titulo: atividade.titulo, materia: nomeMateria(atividade), turma: atividade.turma, aluno: aluno.nome, texto: ta.value, cor: corMateria(atividade), emoji: emojiMateria(atividade) });
        let t = null;
        const atualizar = () => { $("#previaFolha").innerHTML = svgAtual(); };
        ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(atualizar, 250); });
        atualizar();
        $("#btnRegerar").addEventListener("click", () => { ta.value = gerarTextoAdaptado(atividade.conteudo, checks()); atualizar(); avisar("Texto atualizado com as estratégias marcadas.", "info"); });
        $("#btnPNG").addEventListener("click", () => Visual.baixarPNG(svgAtual(), atividade.titulo + "-" + aluno.nome).then(() => avisar("Imagem baixada!")).catch(e => avisar(e.message, "erro")));
        $("#btnImprimir").addEventListener("click", () => { if (!Visual.imprimir(svgAtual(), atividade.titulo)) avisar("Permita pop-ups para imprimir.", "erro"); });
        $("#btnSalvarAdaptacao").addEventListener("click", async () => {
            const base = editandoId ? await DB.buscar("adaptacoes", editandoId) : { concluida: false, estrelas: 0, respostas: {} };
            editandoId = await DB.salvar("adaptacoes", Object.assign({}, base, { id: editandoId || undefined, atividadeId: atividade.id, alunoId: aluno.id, estrategias: checks(), texto: ta.value, status: "aprovada", professorId: App.usuario.id }));
            avisar("Adaptação salva! Ela já aparece na Área do Aluno.");
            $("#btnSalvarAdaptacao").textContent = "💾 Salvar alterações";
            area.querySelector(".passos-fluxo span:last-child").className = "feito";
            listarSalvas();
        });
        area.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $("#formAdaptacao").addEventListener("submit", async e => {
        e.preventDefault();
        const atividade = d.atividades.find(a => a.id === Number(selAtv.value));
        const aluno = d.alunos.find(a => a.id === Number(selAluno.value));
        if (!atividade || !aluno) { avisar("Selecione uma atividade e um aluno.", "erro"); return; }
        editandoId = null;
        abrirEditor(atividade, aluno, null);
    });

    async function listarSalvas() {
        const lista = (await meus("adaptacoes")).sort((a, b) => (b.atualizadoEm || "").localeCompare(a.atualizadoEm || ""));
        const atvs = await meus("atividades"), als = await meus("alunos");
        $("#listaAdaptacoes").innerHTML = lista.length ? lista.map(a => {
            const atv = atvs.find(x => x.id === a.atividadeId) || {}, al = als.find(x => x.id === a.alunoId) || {};
            return `<div class="item-lista">
                <div class="item-avatar" style="--cor:${corMateria(atv)}" aria-hidden="true">${emojiMateria(atv)}</div>
                <div class="item-info"><strong>${esc(atv.titulo || "Atividade")}${seloExemplo(a)}</strong><p>${esc(al.nome || "Aluno")} • ${Visual.etapas(a.texto).length} etapas ${a.concluida ? "• ✅ concluída " + "⭐".repeat(a.estrelas || 0) : ""}</p></div>
                <div class="acoes-item">
                    <a class="btn-small" href="adaptar-atividade.html?editar=${a.id}">Abrir</a>
                    <button class="btn-icone perigo" type="button" data-excluir="${a.id}" aria-label="Excluir adaptação">🗑️</button>
                </div></div>`;
        }).join("") : `<p class="empty">Nenhuma adaptação salva ainda.</p>`;
    }
    $("#listaAdaptacoes").addEventListener("click", async e => {
        const ex = e.target.closest("[data-excluir]");
        if (ex && await confirmar("Excluir esta adaptação?", { titulo: "Excluir adaptação", ok: "Excluir", perigo: true })) {
            await DB.excluir("adaptacoes", Number(ex.dataset.excluir)); avisar("Adaptação excluída.", "info"); listarSalvas();
        }
    });
    listarSalvas();

    const editar = numParam("editar");
    if (editar) {
        const ex = await DB.buscar("adaptacoes", editar);
        if (ex && ex.professorId === App.usuario.id) {
            const atv = d.atividades.find(a => a.id === ex.atividadeId), al = d.alunos.find(a => a.id === ex.alunoId);
            if (atv && al) { selAtv.value = atv.id; selAluno.value = al.id; editandoId = ex.id; abrirEditor(atv, al, ex); }
        }
    } else if (selAtv.value && selAluno.value) {
        $("#formAdaptacao").requestSubmit();
    }
};

/* ---------- RESULTADOS ---------- */
Paginas.resultados = async () => {
    if (!exigir("professor")) return;
    const d = await carregarTudo();
    $("#resultadoAluno").innerHTML = d.alunos.map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join("") || `<option value="">Cadastre um aluno primeiro</option>`;
    $("#resultadoAtividade").innerHTML = d.atividades.map(a => `<option value="${a.id}">${esc(a.titulo)}</option>`).join("") || `<option value="">Cadastre uma atividade primeiro</option>`;
    const form = $("#formResultado");
    const limpar = () => { form.reset(); $("#resultadoId").value = ""; $("#btnSalvarResultado").textContent = "Salvar resultado"; $("#btnCancelarResultado").hidden = true; };
    async function listar() {
        const res = (await meus("resultados")).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
        resumoResultados(res, $("#resumoResultados"));
        $("#listaResultados").innerHTML = res.length ? res.map(r => {
            const al = d.alunos.find(a => a.id === r.alunoId), atv = d.atividades.find(a => a.id === r.atividadeId);
            const n = NIVEIS[r.nivel] || { texto: r.nivel, cor: "", icone: "" };
            return `<div class="item-lista">
                <div class="item-info"><strong>${esc(al?.nome || "Aluno")}${seloExemplo(r)}</strong><p>${esc(atv?.titulo || "Atividade")} • ${esc(r.data || "")}</p><small>${esc(r.observacao || "")}</small></div>
                <span class="selo selo-${n.cor}">${n.icone} ${esc(n.texto)}</span>
                <div class="acoes-item">
                    <button class="btn-icone" type="button" data-editar="${r.id}" aria-label="Editar resultado">✏️</button>
                    <button class="btn-icone perigo" type="button" data-excluir="${r.id}" aria-label="Excluir resultado">🗑️</button>
                </div></div>`;
        }).join("") : `<p class="empty">Nenhum resultado registrado.</p>`;
    }
    form.addEventListener("submit", async e => {
        e.preventDefault();
        if (!Number($("#resultadoAluno").value) || !Number($("#resultadoAtividade").value)) { avisar("Cadastre alunos e atividades primeiro.", "erro"); return; }
        const id = Number($("#resultadoId").value) || null;
        const atual = id ? await DB.buscar("resultados", id) : { data: hojeBR() };
        await DB.salvar("resultados", Object.assign({}, atual, { id: id || undefined, alunoId: Number($("#resultadoAluno").value), atividadeId: Number($("#resultadoAtividade").value),
            nivel: $("#resultadoNivel").value, observacao: $("#resultadoObservacao").value.trim(), professorId: App.usuario.id }));
        avisar(id ? "Resultado atualizado!" : "Resultado registrado!");
        limpar(); listar();
    });
    $("#btnCancelarResultado").addEventListener("click", limpar);
    $("#listaResultados").addEventListener("click", async e => {
        const ed = e.target.closest("[data-editar]"), ex = e.target.closest("[data-excluir]");
        if (ed) {
            const r = await DB.buscar("resultados", Number(ed.dataset.editar));
            $("#resultadoId").value = r.id; $("#resultadoAluno").value = r.alunoId; $("#resultadoAtividade").value = r.atividadeId;
            $("#resultadoNivel").value = r.nivel; $("#resultadoObservacao").value = r.observacao || "";
            $("#btnSalvarResultado").textContent = "Salvar alterações"; $("#btnCancelarResultado").hidden = false;
            form.scrollIntoView({ behavior: "smooth" });
        }
        if (ex && await confirmar("Excluir este resultado?", { titulo: "Excluir resultado", ok: "Excluir", perigo: true })) {
            await DB.excluir("resultados", Number(ex.dataset.excluir)); avisar("Resultado excluído.", "info"); listar();
        }
    });
    listar();
};

/* ---------- MATÉRIAS (área do professor) ---------- */
Paginas.materiasProfessor = async () => {
    if (!exigir("professor")) return;
    const atvs = await meus("atividades");
    $("#gradeMaterias").innerHTML = App.materias.map(m => `
        <article class="materia-card" style="--cor:${m.cor}">
            <span class="materia-emoji" aria-hidden="true">${m.emoji}</span>
            <h3>${esc(m.nome)}</h3>
            <p>${esc(m.resumo)}</p>
            <p><strong>${atvs.filter(a => a.materiaId === m.id).length}</strong> atividades suas • ${m.aulas.length} aulas modelo</p>
            <div class="botoes-linha">
                <a class="btn-small" href="materia-${m.slug}.html">Ver aulas modelo</a>
                <a class="btn-small btn-claro" href="atividades.html?materia=${m.id}">Minhas atividades</a>
            </div>
        </article>`).join("");
};

/* ---------- CONFIGURAÇÕES ---------- */
Paginas.configuracoes = async () => {
    if (!exigir("professor")) return;
    $("#cfgNome").value = App.usuario.nome;
    const codigo = await garantirCodigo(App.usuario);
    document.querySelectorAll("[data-codigo-turma]").forEach(el => { el.textContent = codigo; });
    $("#cfgEmail").value = App.usuario.email;
    $("#formPerfil").addEventListener("submit", async e => {
        e.preventDefault();
        const email = $("#cfgEmail").value.trim().toLowerCase();
        const outro = await DB.primeiro("usuarios", "email", email);
        if (outro && outro.id !== App.usuario.id) { mensagem("msgPerfil", "Este e-mail já está em uso.", "erro"); return; }
        App.usuario = Object.assign({}, App.usuario, { nome: $("#cfgNome").value.trim(), email });
        await DB.salvar("usuarios", App.usuario);
        preencherUsuario();
        mensagem("msgPerfil", "Dados atualizados.", "sucesso");
    });
    $("#formSenha").addEventListener("submit", async e => {
        e.preventDefault();
        if (!(await verificarSenha(App.usuario, $("#senhaAtual").value))) { mensagem("msgSenha", "Senha atual incorreta.", "erro"); return; }
        if ($("#senhaNova").value.length < 6) { mensagem("msgSenha", "A nova senha precisa ter pelo menos 6 caracteres.", "erro"); return; }
        const sal = Cripto.sal();
        App.usuario = Object.assign({}, App.usuario, { sal, senhaHash: await Cripto.hashSenha($("#senhaNova").value, sal) });
        await DB.salvar("usuarios", App.usuario);
        e.target.reset();
        mensagem("msgSenha", "Senha alterada com sucesso.", "sucesso");
    });
    $("#btnExportar").addEventListener("click", async () => {
        const dados = await DB.exportar();
        baixarArquivo("incluiedu-backup-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(dados, null, 1));
        avisar("Backup exportado!");
    });
    $("#arquivoImportar").addEventListener("change", async e => {
        const arq = e.target.files[0];
        if (!arq) return;
        try {
            const dados = JSON.parse(await arq.text());
            if (!(await confirmar("Importar este backup? Os dados atuais deste navegador serão substituídos pelos do arquivo.", { titulo: "Importar backup", ok: "Importar" }))) { e.target.value = ""; return; }
            await DB.importar(dados);
            avisar("Backup importado!");
            setTimeout(() => location.href = "login.html", 900);
        } catch (erro) { avisar("Não foi possível importar: " + erro.message, "erro"); }
        e.target.value = "";
    });
    $("#btnRestaurarExemplos").addEventListener("click", async () => {
        await criarExemplos(App.usuario.id);
        avisar("Exemplos adicionados à sua conta!");
    });
    $("#btnExcluirConta").addEventListener("click", async () => {
        if (!(await confirmar("Excluir sua conta e todos os seus alunos, atividades, adaptações, resultados e acessos de alunos? Essa ação não pode ser desfeita.", { titulo: "Excluir conta", ok: "Excluir tudo", perigo: true }))) return;
        for (const t of ["resultados", "adaptacoes", "atividades", "alunos"]) await DB.excluirOnde(t, "professorId", App.usuario.id);
        await DB.excluirOnde("usuarios", "professorId", App.usuario.id);
        await DB.excluir("usuarios", App.usuario.id);
        sair();
    });
    const [na, nt] = await Promise.all([DB.contar("alunos", "professorId", App.usuario.id), DB.contar("atividades", "professorId", App.usuario.id)]);
    $("#infoBanco").textContent = `${na} alunos e ${nt} atividades salvos neste dispositivo.`;
};


/* =====================================================
   ÁREA DO ALUNO
   ===================================================== */

const CONQUISTAS = [
    { id: "primeira", icone: "🌱", nome: "Primeiro passo", desc: "Concluiu a primeira atividade", teste: c => c >= 1 },
    { id: "tres", icone: "🚀", nome: "Embalado", desc: "Concluiu 3 atividades", teste: c => c >= 3 },
    { id: "cinco", icone: "🏆", nome: "Campeão", desc: "Concluiu 5 atividades", teste: c => c >= 5 },
    { id: "estrelas", icone: "🌟", nome: "Céu estrelado", desc: "Juntou 10 estrelas", teste: (c, e) => e >= 10 }
];

async function dadosAluno() {
    const u = App.usuario;
    const aluno = await DB.buscar("alunos", u.alunoId);
    const adaptacoes = await DB.onde("adaptacoes", "alunoId", u.alunoId);
    const atividades = await DB.onde("atividades", "professorId", u.professorId);
    return { aluno, adaptacoes, atividades };
}

Paginas.dashboardAluno = async () => {
    if (!exigir("aluno")) return;
    const semProfessor = App.usuario.professorId === null || App.usuario.professorId < 0;
    const caixa = $("#vinculoAluno");
    if (caixa) {
        caixa.hidden = !semProfessor;
        $("#formVinculo")?.addEventListener("submit", async e => {
            e.preventDefault();
            const prof = await buscarProfessorPorVinculo($("#codigoVinculo").value);
            if (!prof) { mensagem("msgVinculo", "Código ou e-mail não encontrado.", "erro"); return; }
            if (!(await confirmar(`Vincular sua conta a ${prof.nome}? As atividades de exemplo serão trocadas pelas atividades do professor.`, { titulo: "Vincular professor", ok: "Vincular" }))) return;
            App.usuario = await vincularAluno(App.usuario, prof);
            avisar("Pronto! Agora seu professor pode preparar atividades para você.");
            setTimeout(() => location.reload(), 900);
        });
    }
    const { adaptacoes, atividades } = await dadosAluno();
    const feitas = adaptacoes.filter(a => a.concluida).length;
    const estrelas = adaptacoes.reduce((s, a) => s + (a.estrelas || 0), 0);
    const pct = adaptacoes.length ? Math.round(feitas / adaptacoes.length * 100) : 0;
    $("#progressoAluno").innerHTML = `
        <div class="placar">
            <div><strong>⭐ ${estrelas}</strong><span>estrelas</span></div>
            <div><strong>✅ ${feitas}/${adaptacoes.length}</strong><span>atividades</span></div>
        </div>
        <div class="barra barra-grande" role="img" aria-label="${pct}% concluído"><div class="barra-verde" style="width:${pct}%"></div></div>`;
    $("#conquistas").innerHTML = CONQUISTAS.map(c => {
        const ok = c.teste(feitas, estrelas);
        return `<div class="conquista ${ok ? "ganha" : ""}" title="${esc(c.desc)}"><span aria-hidden="true">${c.icone}</span><strong>${esc(c.nome)}</strong><small>${ok ? "Conquistada!" : esc(c.desc)}</small></div>`;
    }).join("");
    const painel = $("#painelEngajamento");
    if (painel && typeof Engaja !== "undefined") {
        const desenhar = async () => { painel.innerHTML = Engaja.painelAluno(await Engaja.resumo(App.usuario.id)); };
        await desenhar();
        document.addEventListener("pontos-ganhos", desenhar);
        setInterval(desenhar, 60000);
    }
    const ordem = adaptacoes.slice().sort((a, b) => Number(a.concluida) - Number(b.concluida));
    $("#atividadesAluno").innerHTML = ordem.length ? ordem.map(a => {
        const atv = atividades.find(t => t.id === a.atividadeId) || { titulo: "Atividade" };
        return `<a class="card-atividade" href="atividade-aluno.html?id=${a.id}" style="--cor:${corMateria(atv)}">
            <span class="card-emoji" aria-hidden="true">${emojiMateria(atv)}</span>
            <span class="disciplina-tag">${esc(nomeMateria(atv))}</span>
            <h3>${esc(atv.titulo)}</h3>
            <p>${Visual.etapas(a.texto).length} etapas • feita para você</p>
            <span class="status ${a.concluida ? "feito" : ""}">${a.concluida ? "✅ Concluída " + "⭐".repeat(a.estrelas || 0) : "▶ Começar"}</span>
        </a>`;
    }).join("") : `<div class="dashboard-card"><h2>Nenhuma atividade por aqui ainda 🎈</h2><p>Quando seu professor preparar uma atividade para você, ela aparece aqui.</p></div>`;
};

Paginas.atividadeAluno = async () => {
    if (!exigir("aluno")) return;
    const id = numParam("id");
    let adaptacao = id ? await DB.buscar("adaptacoes", id) : null;
    const box = $("#atividadeAluno");
    if (!adaptacao || adaptacao.alunoId !== App.usuario.alunoId) {
        box.innerHTML = `<section class="dashboard-card"><h2>Atividade não encontrada.</h2><a class="btn" href="dashboard-aluno.html">Voltar para minhas atividades</a></section>`;
        return;
    }
    const atv = await DB.buscar("atividades", adaptacao.atividadeId) || { titulo: "Atividade" };
    const lista = Visual.etapas(adaptacao.texto);
    const extras = Visual.lembretes(adaptacao.texto);
    const cor = corMateria(atv);
    let atual = 0;
    const respostas = Object.assign({}, adaptacao.respostas || {});
    let salvarT = null;

    box.innerHTML = `
        <section class="dashboard-card atividade-topo" style="--cor:${cor}">
            <span class="rotulo">${emojiMateria(atv)} ${esc(nomeMateria(atv).toUpperCase())}</span>
            <h1>${esc(atv.titulo)}</h1>
            <p>Faça uma etapa de cada vez. Sem pressa! 🐢</p>
            ${extras.length ? `<p class="lembrete">${extras.map(esc).join("<br>")}</p>` : ""}
            <div class="trilha" id="trilha" aria-hidden="true">${lista.map((_, i) => `<span data-i="${i}">${i + 1}</span>`).join("")}</div>
            <div class="botoes-linha">
                <button class="btn-outline" type="button" id="btnFoco" aria-pressed="false">🎯 Modo foco</button>
                <button class="btn-outline" type="button" id="btnFolha">🖼️ Ver folha completa</button>
            </div>
        </section>
        <section class="dashboard-card etapa-card" style="--cor:${cor}" aria-live="polite">
            <div class="etapa-layout">
                <div class="etapa-ilustracao" id="ilustracaoEtapa"></div>
                <div>
                    <p class="etapa-contador" id="contadorEtapa"></p>
                    <p class="etapa-texto" id="textoEtapa"></p>
                    <div id="caixaTexto">
                        <label for="respostaEtapa" class="sr-only">Sua resposta</label>
                        <textarea id="respostaEtapa" rows="3" placeholder="Escreva sua resposta aqui (ou responda falando com o professor)"></textarea>
                    </div>
                </div>
            </div>
            <div id="campoEtapa" class="campo-etapa int-bloco" hidden></div>
            <div class="int-acoes" id="acoesEtapa" hidden>
                <button class="btn" type="button" id="btnConferirEtapa">✅ Conferir</button>
                <button class="btn-outline" type="button" id="btnDeNovoEtapa" hidden>🔄 Tentar de novo</button>
            </div>
            <p class="int-retorno" id="retornoEtapa" aria-live="polite" hidden></p>
        </section>
        <section class="dashboard-card botoes-etapa">
            <button class="btn-outline" type="button" id="btnOuvir">🔊 Ouvir</button>
            <button class="btn-outline" type="button" id="btnAnterior">← Anterior</button>
            <button class="btn" type="button" id="btnProxima">Próxima etapa →</button>
        </section>
        <section class="dashboard-card" id="cardFolha" hidden>
            <h2>🖼️ Minha folha de atividade</h2>
            <div class="previa-folha" id="folhaAluno"></div>
            <div class="botoes-linha"><button class="btn-outline" type="button" id="btnPNGAluno">⬇️ Baixar PNG</button><button class="btn-outline" type="button" id="btnImprimirAluno">🖨️ Imprimir</button></div>
        </section>`;

    const campo = $("#respostaEtapa");
    const svgFolha = () => Visual.folha({ titulo: atv.titulo, materia: nomeMateria(atv), turma: atv.turma, aluno: App.usuario.nome, texto: adaptacao.texto, cor, emoji: emojiMateria(atv) });

    const specs = Interativo.deEtapas(lista).map(x => x.w);
    const acertos = Object.assign({}, adaptacao.acertos || {});
    let ctrl = null;
    function salvarDepois() {
        clearTimeout(salvarT);
        salvarT = setTimeout(async () => { adaptacao = Object.assign({}, adaptacao, { respostas, acertos }); await DB.salvar("adaptacoes", adaptacao); }, 400);
    }
    function montarCampo() {
        const w = specs[atual], area = $("#campoEtapa");
        area.innerHTML = ""; area.className = "campo-etapa int-bloco";
        $("#retornoEtapa").hidden = true; $("#btnDeNovoEtapa").hidden = true;
        ctrl = w ? Interativo.campo(w, area) : null;
        const temCampo = !!w;
        area.hidden = !temCampo;
        $("#acoesEtapa").hidden = !ctrl;
        $("#caixaTexto").hidden = temCampo;
        if (ctrl && respostas["w" + atual] !== undefined) ctrl.set(respostas["w" + atual]);
    }
    $("#campoEtapa").addEventListener("int-mudou", () => { if (!ctrl) return; respostas["w" + atual] = ctrl.valor(); salvarDepois(); });
    $("#btnConferirEtapa").addEventListener("click", () => {
        if (!ctrl) return;
        const ret = $("#retornoEtapa"); ret.hidden = false;
        if (!ctrl.respondido()) { ret.textContent = "👉 Responda primeiro. Sem pressa!"; ret.className = "int-retorno"; return; }
        const r = ctrl.certo();
        acertos[atual] = r;
        if (r === null) { ret.textContent = "💛 Resposta registrada. Muito bem!"; ret.className = "int-retorno ok"; }
        else if (r) { ret.textContent = "⭐ Isso mesmo! " + (ctrl.w.explica || ""); ret.className = "int-retorno ok"; falar("Isso mesmo!"); }
        else { ret.textContent = "💡 Quase! Vamos olhar de novo: " + (ctrl.w.explica || "a resposta é " + ctrl.resposta() + "."); ret.className = "int-retorno quase"; $("#btnDeNovoEtapa").hidden = false; if (ctrl.marcar) ctrl.marcar(); }
        salvarDepois();
    });
    $("#btnDeNovoEtapa").addEventListener("click", () => { delete respostas["w" + atual]; delete acertos[atual]; montarCampo(); salvarDepois(); });
    function mostrar() {
        $("#contadorEtapa").textContent = `Etapa ${atual + 1} de ${lista.length}`;
        $("#textoEtapa").textContent = lista[atual];
        $("#ilustracaoEtapa").innerHTML = Visual.ilustracaoEtapa(adaptacao.texto, atual, cor);
        $("#btnAnterior").disabled = atual === 0;
        $("#btnProxima").textContent = atual === lista.length - 1 ? "✅ Concluir atividade" : "Próxima etapa →";
        campo.value = respostas[atual] || "";
        montarCampo();
        document.querySelectorAll("#trilha span").forEach(s => {
            const i = Number(s.dataset.i);
            s.className = i < atual ? "feito" : i === atual ? "atual" : "";
        });
    }
    campo.addEventListener("input", () => { respostas[atual] = campo.value; salvarDepois(); });
    $("#btnOuvir").addEventListener("click", () => falar(lista[atual]));
    const irParaEtapa = () => { const c = document.querySelector(".etapa-card"); if (c) c.scrollIntoView({ block: "start", behavior: document.body.classList.contains("sem-movimento") ? "auto" : "smooth" }); };
    $("#btnAnterior").addEventListener("click", () => { if (atual > 0) { atual--; mostrar(); irParaEtapa(); } });
    $("#btnProxima").addEventListener("click", async () => {
        if (atual < lista.length - 1) { atual++; mostrar(); irParaEtapa(); return; }
        const feitas = lista.filter((_, i) => specs[i] ? (respostas["w" + i] !== undefined && respostas["w" + i] !== "" && !(Array.isArray(respostas["w" + i]) && !respostas["w" + i].some(v => v !== null))) || specs[i].t === "pizzaVer" : String(respostas[i] || "").trim()).length;
        const erros = Object.values(acertos).filter(v => v === false).length;
        let estrelas = feitas >= lista.length ? 3 : feitas >= Math.ceil(lista.length / 2) ? 2 : 1;
        if (erros && estrelas === 3) estrelas = 2;
        adaptacao = Object.assign({}, adaptacao, { respostas, acertos, concluida: true, estrelas: Math.max(estrelas, adaptacao.estrelas || 0), concluidaEm: new Date().toISOString() });
        await DB.salvar("adaptacoes", adaptacao);
        celebrar(adaptacao.estrelas);
        if (typeof Engaja !== "undefined") await Engaja.ganhar("atv:" + adaptacao.id, 20 + (erros ? 0 : 10), "Atividade: " + atv.titulo, { tipo: "tarefa", bonus: !erros });
    });
    $("#btnFoco").addEventListener("click", e => {
        const on = document.body.classList.toggle("modo-foco");
        e.currentTarget.setAttribute("aria-pressed", on ? "true" : "false");
        e.currentTarget.textContent = on ? "↩ Sair do modo foco" : "🎯 Modo foco";
    });
    $("#btnFolha").addEventListener("click", () => {
        const c = $("#cardFolha");
        c.hidden = !c.hidden;
        if (!c.hidden) { $("#folhaAluno").innerHTML = svgFolha(); c.scrollIntoView({ behavior: "smooth" }); }
    });
    $("#btnPNGAluno").addEventListener("click", () => Visual.baixarPNG(svgFolha(), atv.titulo));
    $("#btnImprimirAluno").addEventListener("click", () => Visual.imprimir(svgFolha(), atv.titulo));
    mostrar();
};

function celebrar(estrelas) {
    const d = document.createElement("dialog");
    d.className = "modal celebracao";
    d.innerHTML = `
        <div class="estrelas-premio" aria-hidden="true">${[1, 2, 3].map(i => `<span class="${i <= estrelas ? "acesa" : ""}" style="--i:${i}">★</span>`).join("")}</div>
        <h2>Parabéns! Atividade concluída 🎉</h2>
        <p>Você ganhou ${estrelas} ${estrelas === 1 ? "estrela" : "estrelas"}. Continue assim!</p>
        <div class="botoes-linha" style="justify-content:center"><a class="btn" href="dashboard-aluno.html">Voltar para minhas atividades</a></div>`;
    document.body.appendChild(d);
    d.showModal();
    falar("Parabéns! Atividade concluída.");
}


/* =====================================================
   SITE PÚBLICO: contato e "usar aula modelo"
   ===================================================== */

Paginas.contato = async () => {
    const perfil = $("#contatoPerfil"), assunto = param("assunto");
    if (perfil && assunto && [...perfil.options].some(o => o.value === assunto)) {
        perfil.value = assunto;
        $("#contatoMensagem").value = assunto === "rede" ? "Olá! Gostaria de receber uma proposta do IncluiEdu para a nossa rede de ensino." : "Olá! Gostaria de conhecer o plano Escola do IncluiEdu.";
    }
    $("#formContato").addEventListener("submit", async e => {
        e.preventDefault();
        const lista = await DB.getMeta("contatos", []);
        lista.push({ nome: $("#contatoNome").value.trim(), email: $("#contatoEmail").value.trim(), perfil: perfil.value, mensagem: $("#contatoMensagem").value.trim(), data: new Date().toISOString() });
        await DB.setMeta("contatos", lista);
        e.target.reset();
        mensagem("mensagemContato", "Mensagem registrada! Obrigado pelo contato.", "sucesso");
    });
};

function ligarModelos() {
    document.querySelectorAll("[data-modelo]").forEach(b => b.addEventListener("click", async () => {
        if (!App.usuario || App.usuario.tipo !== "professor") {
            avisar("Entre como professor para usar esta aula.", "info");
            setTimeout(() => location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop()), 900);
            return;
        }
        const m = JSON.parse(b.dataset.modelo);
        const mat = App.materias.find(x => x.nome === m.disciplina);
        const existente = (await meus("atividades")).find(a => a.titulo === m.titulo);
        const id = existente ? existente.id : await DB.salvar("atividades", { titulo: m.titulo, materiaId: mat ? mat.id : null, turma: m.turma, objetivo: m.objetivo, conteudo: m.conteudo, professorId: App.usuario.id });
        avisar("Aula adicionada às suas atividades!");
        setTimeout(() => location.href = "adaptar-atividade.html?atividade=" + id, 700);
    }));
}

function mensagem(id, texto, tipo = "") {
    const el = document.getElementById(id);
    if (el) { el.textContent = texto; el.className = "mensagem " + (tipo ? "mensagem-" + tipo : ""); }
}



/* =====================================================
   SUGESTÕES PARA MELHOR ATENDER VOCÊ
   ===================================================== */

const OPCOES_SUGESTAO = [
    { id: "letras", icone: "🔍", nome: "Letras maiores", aplicar: { rotulo: "Aumentar as letras agora", fn: p => { p.fonte = Math.min(150, p.fonte + 20); } } },
    { id: "contraste", icone: "🎨", nome: "Mais contraste ou cores", aplicar: { rotulo: "Ativar alto contraste agora", fn: p => { p.contraste = true; } } },
    { id: "audio", icone: "🔊", nome: "Mais áudio", aplicar: { rotulo: "Ler esta página em voz alta agora", acao: () => falar((document.querySelector("main") || document.body).innerText.slice(0, 4000)) } },
    { id: "libras", icone: "🤟", nome: "Libras", aplicar: { rotulo: "Abrir o tradutor de Libras agora", acao: () => { const b = document.querySelector("[vw-access-button]"); if (b) b.click(); else avisar("O tradutor de Libras (VLibras) precisa de internet.", "info"); } } },
    { id: "animacoes", icone: "🐢", nome: "Menos animações", aplicar: { rotulo: "Desligar as animações agora", fn: p => { p.movimento = true; } } },
    { id: "imagens", icone: "🖼️", nome: "Mais imagens" },
    { id: "leitura", icone: "📖", nome: "Texto mais simples", aplicar: { rotulo: "Ativar leitura facilitada agora", fn: p => { p.leitura = true; } } },
    { id: "outra", icone: "🧩", nome: "Outra ideia" }
];

function iniciarSugestoes() {
    const sec = document.querySelector("[data-sugestoes]");
    if (!sec) return;
    const temVoz = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    sec.innerHTML = `
        <div class="sug-card">
            <div class="sug-topo">
                <span class="sug-mascote" aria-hidden="true">💬</span>
                <div>
                    <h2 id="tituloSugestoes">Sugestões para melhor atender você</h2>
                    <p>O que deixaria esta página mais fácil para você? Toque em quantas quiser.</p>
                </div>
            </div>
            <form id="formSugestao">
                <div class="sug-opcoes" role="group" aria-label="Sugestões rápidas">
                    ${OPCOES_SUGESTAO.map(o => `<button type="button" class="sug-opcao" data-op="${o.id}" aria-pressed="false"><span aria-hidden="true">${o.icone}</span>${esc(o.nome)}</button>`).join("")}
                </div>
                <div class="sug-aplicar" id="sugAplicar" hidden></div>
                <label for="sugTexto" class="sug-rotulo">Quer contar mais? <small>(opcional)</small></label>
                <div class="sug-texto">
                    <textarea id="sugTexto" rows="2" placeholder="Escreva aqui${temVoz ? " ou toque no microfone e fale" : ""}"></textarea>
                    ${temVoz ? `<button type="button" class="int-mic" id="sugMic" aria-label="Falar a sugestão">🎤</button>` : ""}
                </div>
                <button class="btn" type="submit">📨 Enviar</button>
                <p class="mensagem" id="sugMsg" role="status"></p>
            </form>
            <div class="sug-obrigado" id="sugObrigado" hidden>
                <div class="sug-coracoes" aria-hidden="true"><span>💜</span><span>💛</span><span>💚</span></div>
                <h3>Obrigado! Sua sugestão foi guardada.</h3>
                <p>Ela ajuda o professor a deixar tudo do seu jeito.</p>
                <button type="button" class="btn-outline" id="sugOutra">Enviar outra sugestão</button>
            </div>
        </div>`;
    const sel = new Set();
    const caixaAplicar = sec.querySelector("#sugAplicar");
    const mostrarAplicar = () => {
        const ops = OPCOES_SUGESTAO.filter(o => sel.has(o.id) && o.aplicar);
        caixaAplicar.hidden = !ops.length;
        caixaAplicar.innerHTML = ops.length ? `<p>✨ Quer ativar agora?</p>${ops.map(o => `<button type="button" class="btn-mini" data-aplicar="${o.id}">${o.icone} ${esc(o.aplicar.rotulo)}</button>`).join("")}` : "";
    };
    sec.addEventListener("click", ev => {
        const b = ev.target.closest(".sug-opcao");
        if (b) { const id = b.dataset.op; sel.has(id) ? sel.delete(id) : sel.add(id); b.setAttribute("aria-pressed", sel.has(id) ? "true" : "false"); mostrarAplicar(); return; }
        const a = ev.target.closest("[data-aplicar]");
        if (a) {
            const o = OPCOES_SUGESTAO.find(x => x.id === a.dataset.aplicar);
            if (o.aplicar.fn) alterarPreferencia(o.aplicar.fn);
            if (o.aplicar.acao) o.aplicar.acao();
            a.disabled = true; a.textContent = "✔ " + o.aplicar.rotulo.replace(/ agora$/, "") + ": feito!";
        }
        if (ev.target.closest("#sugMic")) {
            const R = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new R(); rec.lang = "pt-BR";
            const m = ev.target.closest("#sugMic"); m.classList.add("ouvindo");
            rec.onresult = r => { const t = sec.querySelector("#sugTexto"); t.value = (t.value ? t.value + " " : "") + r.results[0][0].transcript; };
            rec.onend = rec.onerror = () => m.classList.remove("ouvindo");
            try { rec.start(); } catch (e) { m.classList.remove("ouvindo"); }
        }
        if (ev.target.closest("#sugOutra")) { sec.querySelector("#sugObrigado").hidden = true; sec.querySelector("#formSugestao").hidden = false; }
    });
    sec.querySelector("#formSugestao").addEventListener("submit", async ev => {
        ev.preventDefault();
        const texto = sec.querySelector("#sugTexto").value.trim();
        if (!sel.size && !texto) { mensagem("sugMsg", "Toque em uma opção ou escreva sua ideia. 😊", "erro"); return; }
        const u = App.usuario;
        await DB.salvar("sugestoes", {
            pagina: location.pathname.split("/").pop() || "index.html", tituloPagina: document.title.replace(/^IncluiEdu \| /, ""),
            usuarioId: u ? u.id : null, nome: u ? u.nome : null, tipo: u ? u.tipo : "visitante", professorId: u && u.tipo === "aluno" ? u.professorId : (u ? u.id : null),
            opcoes: [...sel], texto, data: new Date().toISOString()
        });
        sel.clear(); ev.target.reset(); sec.querySelectorAll(".sug-opcao").forEach(b => b.setAttribute("aria-pressed", "false")); mostrarAplicar(); mensagem("sugMsg", "");
        ev.target.hidden = true; sec.querySelector("#sugObrigado").hidden = false;
        sec.querySelector("#sugObrigado").focus?.();
    });
}

Paginas.sugestoesProfessor = async () => {
    if (!exigir("professor")) return;
    const nomeOp = id => { const o = OPCOES_SUGESTAO.find(x => x.id === id); return o ? o.icone + " " + o.nome : id; };
    $("#filtroSugOpcao").innerHTML += OPCOES_SUGESTAO.map(o => `<option value="${o.id}">${o.icone} ${esc(o.nome)}</option>`).join("");
    async function listar() {
        const todas = (await DB.listar("sugestoes")).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
        const paginas = [...new Set(todas.map(s => s.pagina))].sort();
        const selPag = $("#filtroSugPagina"), atualPag = selPag.value;
        selPag.innerHTML = `<option value="">Todas as páginas</option>` + paginas.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join("");
        selPag.value = atualPag;
        const op = $("#filtroSugOpcao").value, quem = $("#filtroSugQuem").value, pag = selPag.value;
        const lista = todas.filter(s => (!op || (s.opcoes || []).includes(op)) && (!pag || s.pagina === pag) &&
            (!quem || (quem === "meus" ? s.tipo === "aluno" && s.professorId === App.usuario.id : s.tipo === quem)));
        const cont = {};
        lista.forEach(s => (s.opcoes || []).forEach(o => { cont[o] = (cont[o] || 0) + 1; }));
        $("#resumoSugestoes").innerHTML = Object.keys(cont).length ? Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([o, n]) => `<span class="sug-chip-resumo">${nomeOp(o)} <strong>${n}</strong></span>`).join("") : "";
        $("#listaSugestoes").innerHTML = lista.length ? lista.map(s => `
            <div class="item-lista sug-item">
                <div class="item-avatar" aria-hidden="true">${s.tipo === "aluno" ? "🧒" : s.tipo === "professor" ? "👩‍🏫" : "🙂"}</div>
                <div class="item-info"><strong>${esc(s.nome || "Visitante")}</strong> <small>• ${esc(s.tituloPagina || s.pagina)} • ${new Date(s.data).toLocaleString("pt-BR")}</small>
                    <p>${(s.opcoes || []).map(o => `<span class="tag">${nomeOp(o)}</span>`).join(" ")}</p>${s.texto ? `<p class="sug-texto-lido">“${esc(s.texto)}”</p>` : ""}</div>
                <div class="acoes-item"><button class="btn-icone perigo" type="button" data-excluir="${s.id}" aria-label="Excluir sugestão">🗑️</button></div>
            </div>`).join("") : `<p class="empty">Nenhuma sugestão por aqui ainda. Elas aparecem quando alunos ou visitantes usam a caixa “Sugestões para melhor atender você” no fim das páginas.</p>`;
    }
    ["#filtroSugOpcao", "#filtroSugQuem", "#filtroSugPagina"].forEach(s => $(s).addEventListener("change", listar));
    $("#listaSugestoes").addEventListener("click", async e => {
        const b = e.target.closest("[data-excluir]");
        if (b && await confirmar("Excluir esta sugestão?", { titulo: "Excluir sugestão", ok: "Excluir", perigo: true })) { await DB.excluir("sugestoes", Number(b.dataset.excluir)); avisar("Sugestão excluída.", "info"); listar(); }
    });
    listar();
};

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

(async function iniciar() {
    try {
        await DB.abrir();
        await semear();
        await migrarArmazenamentoAntigo();
        App.materias = await DB.listar("materias");
        App.usuario = await usuarioAtual();
        preencherUsuario();
        ligarModelos();
        if (App.usuario && App.usuario.tipo === "professor") document.querySelectorAll("[data-modelo], [data-so-professor-logado]").forEach(b => { b.hidden = false; });
        if (typeof Engaja !== "undefined") Engaja.iniciar(App.usuario);
        if (typeof Interativo !== "undefined") Interativo.iniciar();
        if (typeof Jogos !== "undefined") Jogos.iniciar();
        iniciarSugestoes();
        document.querySelectorAll("[data-folha-exemplo]").forEach(el => {
            const ex = DADOS_EXEMPLOS.adaptacoes[0], atv = DADOS_EXEMPLOS.atividades.find(t => t.ref === ex.atividade);
            const mat = App.materias.find(m => m.slug === atv.materia) || {};
            el.innerHTML = Visual.folha({ titulo: atv.titulo, materia: mat.nome, turma: atv.turma, aluno: "Davi Almeida (exemplo)", texto: ex.texto, cor: mat.cor, emoji: mat.emoji });
        });
        const rota = Paginas[document.body.dataset.pagina];
        if (rota) await rota();
        if (typeof revelar === "function") revelar();
    } catch (erro) {
        console.error(erro);
        avisar("Erro ao abrir o banco de dados: " + erro.message, "erro");
    }
})();
