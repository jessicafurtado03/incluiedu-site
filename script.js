/* =====================================================
   INCLUIEDU
   SISTEMA FRONT-END (versão 2.0)
   Funciona 100% no navegador (localStorage).
   Pode ser publicado em qualquer hospedagem estática
   (ex.: GitHub Pages), sem servidor.
   ===================================================== */


/* =====================================================
   BANCO DE DADOS LOCAL
   ===================================================== */

function obterDados(chave, padrao = []) {
    const dados = localStorage.getItem(chave);
    if (!dados) {
        return padrao;
    }
    try {
        return JSON.parse(dados);
    } catch (erro) {
        return padrao;
    }
}

function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

/* Evita que textos digitados quebrem o HTML da página */
function esc(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function hoje() {
    return new Date().toLocaleDateString("pt-BR");
}


/* =====================================================
   AVISOS (TOAST) - substitui os alert()
   ===================================================== */

function avisar(mensagem, tipo = "sucesso") {
    let area = document.getElementById("toastArea");
    if (!area) {
        area = document.createElement("div");
        area.id = "toastArea";
        area.className = "toast-area";
        area.setAttribute("role", "status");
        area.setAttribute("aria-live", "polite");
        document.body.appendChild(area);
    }
    const toast = document.createElement("div");
    toast.className = "toast toast-" + tipo;
    toast.textContent = mensagem;
    area.appendChild(toast);
    setTimeout(() => toast.classList.add("saindo"), 2600);
    setTimeout(() => toast.remove(), 3200);
}


/* =====================================================
   DADOS DE DEMONSTRAÇÃO
   Permitem apresentar o sistema já preenchido.
   (Dados fictícios.)
   ===================================================== */

const DEMO = {
    usuarios: [
        { id: 1, nome: "Profa. Ana Ribeiro", email: "professora@incluiedu.com", senha: "demo123", tipo: "professor" },
        { id: 2, nome: "Davi Almeida", email: "aluno@incluiedu.com", senha: "demo123", tipo: "aluno", alunoId: 101 }
    ],
    alunos: [
        { id: 101, nome: "Davi Almeida", turma: "5º Ano A",
          caracteristicas: "TDAH. Perde o foco em textos longos e se beneficia de pausas entre as etapas. Gosta de desafios curtos.",
          recursos: "Instruções curtas, apoio visual, etapas numeradas, tempo adicional.", data: "03/11/2026" },
        { id: 102, nome: "Marina Souza", turma: "5º Ano A",
          caracteristicas: "Baixa visão. Lê melhor com fonte ampliada e alto contraste.",
          recursos: "Fonte ampliada (24pt), alto contraste, leitura em voz alta, lupa.", data: "03/11/2026" },
        { id: 103, nome: "Pedro Henrique", turma: "5º Ano A",
          caracteristicas: "TEA (autismo). Prefere rotina previsível, linguagem objetiva e exemplos concretos.",
          recursos: "Rotina visual, linguagem direta, material concreto, antecipação das etapas.", data: "04/11/2026" },
        { id: 104, nome: "Sofia Martins", turma: "6º Ano B",
          caracteristicas: "Surdez. Comunicação principal em Libras; português escrito como segunda língua.",
          recursos: "Intérprete de Libras, vídeos com legenda, imagens e esquemas visuais.", data: "05/11/2026" },
        { id: 105, nome: "Gabriel Costa", turma: "6º Ano B",
          caracteristicas: "Dislexia. Leitura lenta e troca de letras; compreende muito bem quando escuta.",
          recursos: "Áudio das instruções, palavras-chave destacadas, respostas orais.", data: "05/11/2026" }
    ],
    atividades: [
        { id: 201, titulo: "Frações com pizza", disciplina: "Matemática", turma: "5º Ano A",
          objetivo: "Reconhecer frações como partes de um inteiro.",
          conteudo: "Uma pizza foi dividida em 8 partes iguais. Joana comeu 3 partes e Davi comeu 2 partes. Que fração da pizza Joana comeu? Que fração Davi comeu? Quantas partes sobraram? Represente a resposta com um desenho.", data: "06/11/2026" },
        { id: 202, titulo: "O ciclo da água", disciplina: "Ciências", turma: "5º Ano A",
          objetivo: "Compreender as etapas do ciclo da água.",
          conteudo: "Leia o texto sobre o ciclo da água. Explique o que é evaporação. Explique o que é condensação. Explique o que é precipitação. Desenhe o ciclo da água com setas.", data: "07/11/2026" },
        { id: 203, titulo: "Interpretação: A cigarra e a formiga", disciplina: "Língua Portuguesa", turma: "6º Ano B",
          objetivo: "Identificar personagens, conflito e moral de uma fábula.",
          conteudo: "Leia a fábula A cigarra e a formiga. Quem são os personagens? Qual é o problema da história? Qual é a moral da fábula? Você concorda com a atitude da formiga? Justifique.", data: "10/11/2026" },
        { id: 204, titulo: "Regiões do Brasil", disciplina: "Geografia", turma: "6º Ano B",
          objetivo: "Localizar as cinco regiões brasileiras no mapa.",
          conteudo: "Observe o mapa do Brasil. Pinte cada região com uma cor diferente. Escreva o nome de um estado de cada região. Em qual região fica Brasília?", data: "12/11/2026" },
        { id: 205, titulo: "Construção de Brasília", disciplina: "História", turma: "5º Ano A",
          objetivo: "Compreender por que e como Brasília foi construída.",
          conteudo: "Pesquise sobre a construção de Brasília. Quando a cidade foi inaugurada? Quem era o presidente? Por que a capital foi transferida para o centro do país?", data: "13/11/2026" },
        { id: 206, titulo: "Colors (as cores)", disciplina: "Inglês", turma: "5º Ano A",
          objetivo: "Reconhecer e nomear cores em inglês.",
          conteudo: "Ouça a música das cores. Escreva em inglês: vermelho, azul, amarelo e verde. Pinte cada balão com a cor indicada.", data: "14/11/2026" },
        { id: 207, titulo: "Releitura do Abaporu", disciplina: "Arte", turma: "5º Ano A",
          objetivo: "Apreciar e reinterpretar uma obra da arte brasileira.",
          conteudo: "Observe a obra Abaporu, de Tarsila do Amaral. Escolha um material. Faça a sua releitura da obra. Dê um título para a sua criação.", data: "16/11/2026" }
    ],
    adaptacoes: [
        { id: 301, atividadeId: 201, alunoId: 101, data: "08/11/2026", status: "aprovada",
          estrategias: ["Utilizar instruções mais curtas", "Dividir a atividade em etapas", "Utilizar apoio visual"],
          texto: "Etapa 1: Observe a pizza dividida em 8 partes iguais.\nEtapa 2: Joana comeu 3 partes. Escreva a fração: __/8.\nEtapa 3: Davi comeu 2 partes. Escreva a fração: __/8.\nEtapa 4: Conte quantas partes sobraram.\nEtapa 5: Faça um desenho da pizza e pinte as partes comidas." },
        { id: 302, atividadeId: 202, alunoId: 102, data: "09/11/2026", status: "aprovada",
          estrategias: ["Ampliar a fonte e usar alto contraste", "Disponibilizar áudio"],
          texto: "Etapa 1: Ouça o texto sobre o ciclo da água.\nEtapa 2: Evaporação: o sol aquece a água, que vira vapor. Explique com suas palavras.\nEtapa 3: Condensação: o vapor esfria e forma nuvens. Explique.\nEtapa 4: Precipitação: a água cai como chuva. Explique.\nEtapa 5: Monte o ciclo com as figuras ampliadas." },
        { id: 303, atividadeId: 203, alunoId: 105, data: "11/11/2026", status: "aprovada",
          estrategias: ["Disponibilizar áudio", "Destacar palavras-chave", "Permitir resposta oral"],
          texto: "Etapa 1: Ouça a fábula A CIGARRA e a FORMIGA.\nEtapa 2: Quem são os PERSONAGENS?\nEtapa 3: Qual é o PROBLEMA da história?\nEtapa 4: Qual é a MORAL? Você pode responder falando." },
        { id: 304, atividadeId: 202, alunoId: 101, data: "12/11/2026", status: "aprovada",
          estrategias: ["Utilizar instruções mais curtas", "Dividir a atividade em etapas", "Utilizar apoio visual"],
          texto: "Etapa 1: Veja a figura do ciclo da água.\nEtapa 2: EVAPORAÇÃO: o sol aquece a água e ela vira vapor. O que acontece com a água?\nEtapa 3: CONDENSAÇÃO: o vapor esfria e forma nuvens. O que se forma no céu?\nEtapa 4: PRECIPITAÇÃO: a água cai como chuva. Como a água volta para a terra?\nEtapa 5: DESENHE o ciclo com setas.\n\nLembrete: faça uma pausa curta ao terminar cada etapa." },
        { id: 305, atividadeId: 205, alunoId: 101, data: "14/11/2026", status: "aprovada",
          estrategias: ["Dividir a atividade em etapas", "Destacar palavras-chave", "Prever pausas entre as etapas"],
          texto: "Etapa 1: Brasília foi inaugurada em 21 de abril de 1960. QUAL é o ano?\nEtapa 2: O presidente era Juscelino Kubitschek (JK). QUEM era o presidente?\nEtapa 3: A capital saiu do Rio de Janeiro e foi para o centro do país.\nEtapa 4: Na sua opinião, POR QUE levar a capital para o centro?\n\nLembrete: você pode responder falando." },
        { id: 306, atividadeId: 206, alunoId: 101, data: "15/11/2026", status: "aprovada",
          estrategias: ["Disponibilizar áudio", "Utilizar apoio visual"],
          texto: "Etapa 1: Toque em 🔊 e ouça: RED, BLUE, YELLOW, GREEN.\nEtapa 2: RED é vermelho 🍎. Escreva RED.\nEtapa 3: BLUE é azul 💧. Escreva BLUE.\nEtapa 4: YELLOW é amarelo ☀️ e GREEN é verde 🌳.\nEtapa 5: Pinte os balões com as cores que você aprendeu." },
        { id: 307, atividadeId: 207, alunoId: 101, data: "17/11/2026", status: "aprovada",
          estrategias: ["Dividir a atividade em etapas", "Considerar tempo adicional"],
          texto: "Etapa 1: Observe o Abaporu, de Tarsila do Amaral. O que você vê?\nEtapa 2: Escolha seu material: lápis, tinta, colagem ou massinha.\nEtapa 3: Crie a sua versão do Abaporu.\nEtapa 4: Dê um título para a sua obra.\n\nLembrete: você tem tempo extra." }
    ],
    resultados: [
        { id: 401, alunoId: 101, atividadeId: 201, nivel: "independente", observacao: "Concluiu as 5 etapas com autonomia. As pausas ajudaram.", data: "08/11/2026" },
        { id: 402, alunoId: 102, atividadeId: 202, nivel: "auxilio", observacao: "Precisou de ajuda na etapa 4; fonte ampliada funcionou bem.", data: "09/11/2026" },
        { id: 403, alunoId: 105, atividadeId: 203, nivel: "independente", observacao: "Respondeu oralmente com ótima compreensão da moral.", data: "11/11/2026" },
        { id: 404, alunoId: 103, atividadeId: 204, nivel: "auxilio", observacao: "Com a rotina visual antecipada, completou 4 de 5 regiões.", data: "13/11/2026" },
        { id: 405, alunoId: 104, atividadeId: 202, nivel: "independente", observacao: "O vídeo com Libras fez toda a diferença.", data: "14/11/2026" },
        { id: 406, alunoId: 101, atividadeId: 205, nivel: "nao-concluiu", observacao: "Faltou tempo; retomar a etapa 4 na próxima aula com tempo extra.", data: "14/11/2026" }
    ]
};

function carregarDemonstracao(sobrescrever = true) {
    if (sobrescrever || obterDados("incluiedu_alunos").length === 0) {
        salvarDados("incluiedu_alunos", DEMO.alunos);
        salvarDados("incluiedu_atividades", DEMO.atividades);
        salvarDados("incluiedu_adaptacoes", DEMO.adaptacoes);
        salvarDados("incluiedu_resultados", DEMO.resultados);
    }
    garantirUsuariosDemo();
}

/* As contas de demonstração sempre existem */
function garantirUsuariosDemo() {
    const usuarios = obterDados("incluiedu_usuarios");
    DEMO.usuarios.forEach(demo => {
        if (!usuarios.find(u => u.email === demo.email)) {
            usuarios.push(demo);
        }
    });
    salvarDados("incluiedu_usuarios", usuarios);
}

/* Primeira visita: o sistema já abre com exemplos */
if (!localStorage.getItem("incluiedu_iniciado_v2")) {
    carregarDemonstracao(obterDados("incluiedu_alunos").length < 3);
    localStorage.setItem("incluiedu_iniciado_v2", "1");
} else {
    garantirUsuariosDemo();
}

/* Atualiza registros de demonstração antigos (mesmo id) para a versão atual */
if (!localStorage.getItem("incluiedu_demo_v3")) {
    [["incluiedu_alunos", DEMO.alunos], ["incluiedu_atividades", DEMO.atividades],
     ["incluiedu_adaptacoes", DEMO.adaptacoes], ["incluiedu_usuarios", DEMO.usuarios]].forEach(([chave, demo]) => {
        const dados = obterDados(chave);
        salvarDados(chave, dados.map(item => demo.find(d => d.id === item.id) || item));
    });
    const logado = obterDados("incluiedu_usuario_logado", null);
    const demoLogado = logado && DEMO.usuarios.find(d => d.id === logado.id);
    if (demoLogado) salvarDados("incluiedu_usuario_logado", demoLogado);
    localStorage.setItem("incluiedu_demo_v3", "1");
}

function entrarDemo(tipo) {
    carregarDemonstracao(false);
    const usuario = DEMO.usuarios.find(u => u.tipo === tipo);
    localStorage.setItem("incluiedu_usuario_logado", JSON.stringify(usuario));
    window.location.href = tipo === "professor" ? "dashboard-professor.html" : "dashboard-aluno.html";
}

function restaurarDemonstracao() {
    carregarDemonstracao(true);
    avisar("Dados de exemplo carregados!");
    setTimeout(() => window.location.reload(), 700);
}

function limparDados() {
    if (!confirm("Apagar todos os alunos, atividades, adaptações e resultados deste navegador?")) return;
    ["incluiedu_alunos", "incluiedu_atividades", "incluiedu_adaptacoes", "incluiedu_resultados"]
        .forEach(chave => salvarDados(chave, []));
    avisar("Dados apagados.", "info");
    setTimeout(() => window.location.reload(), 700);
}


/* =====================================================
   CADASTRO
   ===================================================== */

const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = document.getElementById("nomeCadastro").value.trim();
        const email = document.getElementById("emailCadastro").value.trim().toLowerCase();
        const senha = document.getElementById("senhaCadastro").value;
        const tipo = document.getElementById("tipoCadastro").value;

        const usuarios = obterDados("incluiedu_usuarios");

        if (usuarios.find(usuario => usuario.email === email)) {
            mostrarMensagem("mensagemCadastro", "Este e-mail já está cadastrado.", "erro");
            return;
        }

        if (senha.length < 6) {
            mostrarMensagem("mensagemCadastro", "A senha precisa ter pelo menos 6 caracteres.", "erro");
            return;
        }

        usuarios.push({ id: Date.now(), nome, email, senha, tipo });
        salvarDados("incluiedu_usuarios", usuarios);

        mostrarMensagem("mensagemCadastro", "Conta criada com sucesso! Redirecionando para o login...", "sucesso");

        setTimeout(() => { window.location.href = "login.html"; }, 1200);
    });
}


/* =====================================================
   LOGIN
   ===================================================== */

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        const usuario = obterDados("incluiedu_usuarios")
            .find(user => user.email === email && user.senha === senha);

        if (!usuario) {
            mostrarMensagem("mensagemLogin", "E-mail ou senha incorretos.", "erro");
            return;
        }

        localStorage.setItem("incluiedu_usuario_logado", JSON.stringify(usuario));

        window.location.href = usuario.tipo === "professor"
            ? "dashboard-professor.html"
            : "dashboard-aluno.html";
    });
}

/* Preenche o login com a conta de demonstração */
function preencherDemo(tipo) {
    const demo = DEMO.usuarios.find(u => u.tipo === tipo);
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    if (email && senha) {
        email.value = demo.email;
        senha.value = demo.senha;
        email.focus();
    }
}


/* =====================================================
   VERIFICAR LOGIN / SAIR
   ===================================================== */

function usuarioLogado() {
    const usuario = localStorage.getItem("incluiedu_usuario_logado");
    if (!usuario) return null;
    try { return JSON.parse(usuario); } catch (e) { return null; }
}

function sair() {
    localStorage.removeItem("incluiedu_usuario_logado");
    window.location.href = "index.html";
}

/* Mostra o nome de quem está logado */
(function mostrarUsuario() {
    const usuario = usuarioLogado();
    const nomeProfessor = document.getElementById("nomeProfessor");
    const saudacao = document.getElementById("saudacaoProfessor");
    const nomeAluno = document.getElementById("nomeAlunoLogado");
    if (usuario) {
        const primeiroNome = usuario.nome.replace(/^Profa?\.\s*/, "").split(" ")[0];
        if (nomeProfessor) nomeProfessor.textContent = usuario.nome;
        if (saudacao) saudacao.textContent = "Olá, " + primeiroNome + "! 👋";
        if (nomeAluno) nomeAluno.textContent = "Olá, " + primeiroNome + "! 👋";
    }
})();


/* =====================================================
   CADASTRO DE ALUNO
   ===================================================== */

const formAluno = document.getElementById("formAluno");

if (formAluno) {
    formAluno.addEventListener("submit", function(event) {
        event.preventDefault();

        const alunos = obterDados("incluiedu_alunos");

        alunos.push({
            id: Date.now(),
            nome: document.getElementById("nomeAluno").value.trim(),
            turma: document.getElementById("turmaAluno").value.trim(),
            caracteristicas: document.getElementById("caracteristicasAluno").value.trim(),
            recursos: document.getElementById("recursosAluno").value.trim(),
            data: hoje()
        });

        salvarDados("incluiedu_alunos", alunos);
        formAluno.reset();
        avisar("Aluno cadastrado com sucesso!");
        carregarAlunos();
    });
}


/* =====================================================
   LISTAR ALUNOS
   ===================================================== */

function carregarAlunos() {
    const lista = document.getElementById("listaAlunos");
    if (!lista) return;

    const alunos = obterDados("incluiedu_alunos");

    if (alunos.length === 0) {
        lista.innerHTML = `<p class="empty">Nenhum aluno cadastrado. Use o formulário acima ou carregue os dados de exemplo.</p>`;
        return;
    }

    lista.innerHTML = alunos.map(aluno => `
        <div class="item-lista">
            <div class="item-avatar" aria-hidden="true">${esc(aluno.nome.charAt(0))}</div>
            <div class="item-info">
                <strong>${esc(aluno.nome)}</strong>
                <p>${esc(aluno.turma)}</p>
                ${aluno.caracteristicas ? `<small>${esc(aluno.caracteristicas)}</small>` : ""}
            </div>
            <a class="btn-small" href="aluno-perfil.html?id=${aluno.id}">Ver perfil</a>
        </div>
    `).join("");
}

carregarAlunos();


/* =====================================================
   PERFIL DO ALUNO + MEMÓRIA PEDAGÓGICA
   ===================================================== */

const NIVEIS = {
    "independente": { texto: "Concluiu sozinho", cor: "verde", icone: "🟢" },
    "auxilio": { texto: "Concluiu com auxílio", cor: "amarelo", icone: "🟡" },
    "nao-concluiu": { texto: "Não conseguiu concluir", cor: "vermelho", icone: "🔴" }
};

function carregarPerfilAluno() {
    const container = document.getElementById("perfilAluno");
    if (!container) return;

    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const alunos = obterDados("incluiedu_alunos");
    const aluno = alunos.find(item => item.id === id) || (id ? null : alunos[0]);

    if (!aluno) {
        container.innerHTML = `
            <div class="dashboard-card">
                <h2>Aluno não encontrado.</h2>
                <p>Ele pode ter sido removido ou os dados deste navegador foram apagados.</p>
                <a class="btn" href="alunos.html">Voltar para alunos</a>
            </div>`;
        return;
    }

    const atividades = obterDados("incluiedu_atividades");
    const adaptacoes = obterDados("incluiedu_adaptacoes").filter(a => a.alunoId === aluno.id);
    const resultados = obterDados("incluiedu_resultados").filter(r => r.alunoId === aluno.id);
    const titulo = idAtv => (atividades.find(a => a.id === idAtv) || {}).titulo || "Atividade";

    const memoria = adaptacoes.length || resultados.length
        ? `<ul class="timeline">
            ${adaptacoes.map(a => `
                <li>
                    <strong>🧩 ${esc(titulo(a.atividadeId))}</strong>
                    <small>${esc(a.data)} • adaptação ${esc(a.status || "salva")}</small>
                    ${(a.estrategias || []).length ? `<p>${a.estrategias.map(e => `<span class="tag">${esc(e)}</span>`).join(" ")}</p>` : ""}
                </li>`).join("")}
            ${resultados.map(r => `
                <li>
                    <strong>${(NIVEIS[r.nivel] || {}).icone || "📊"} ${esc(titulo(r.atividadeId))}</strong>
                    <small>${esc(r.data || "")} • ${esc((NIVEIS[r.nivel] || {}).texto || r.nivel)}</small>
                    ${r.observacao ? `<p>${esc(r.observacao)}</p>` : ""}
                </li>`).join("")}
           </ul>`
        : `<p>O histórico das estratégias utilizadas aparecerá aqui conforme as atividades forem adaptadas e os resultados registrados.</p>`;

    container.innerHTML = `
        <section class="dashboard-card perfil-topo">
            <div class="perfil-avatar" aria-hidden="true">${esc(aluno.nome.charAt(0))}</div>
            <div>
                <span class="rotulo">PERFIL PEDAGÓGICO</span>
                <h1>${esc(aluno.nome)}</h1>
                <p>Turma: ${esc(aluno.turma)} • Cadastrado em ${esc(aluno.data || "-")}</p>
            </div>
            <a class="btn" href="adaptar-atividade.html?aluno=${aluno.id}">🧩 Adaptar atividade</a>
        </section>

        <div class="perfil-grid">
            <section class="dashboard-card">
                <h2>🧠 Características de aprendizagem</h2>
                <p>${esc(aluno.caracteristicas) || "Nenhuma informação registrada."}</p>
            </section>
            <section class="dashboard-card">
                <h2>🧩 Recursos facilitadores</h2>
                <p>${esc(aluno.recursos) || "Nenhum recurso registrado."}</p>
            </section>
        </div>

        <section class="dashboard-card">
            <h2>📚 Memória pedagógica</h2>
            ${memoria}
        </section>
    `;
}

carregarPerfilAluno();


/* =====================================================
   NOVA ATIVIDADE
   ===================================================== */

const formAtividade = document.getElementById("formAtividade");

if (formAtividade) {
    formAtividade.addEventListener("submit", function(event) {
        event.preventDefault();

        const atividades = obterDados("incluiedu_atividades");

        atividades.push({
            id: Date.now(),
            titulo: document.getElementById("tituloAtividade").value.trim(),
            disciplina: document.getElementById("disciplinaAtividade").value.trim(),
            turma: document.getElementById("turmaAtividade").value.trim(),
            objetivo: document.getElementById("objetivoAtividade").value.trim(),
            conteudo: document.getElementById("conteudoAtividade").value.trim(),
            data: hoje()
        });

        salvarDados("incluiedu_atividades", atividades);
        avisar("Atividade criada com sucesso!");
        setTimeout(() => { window.location.href = "atividades.html"; }, 800);
    });
}


/* =====================================================
   LISTAR ATIVIDADES
   ===================================================== */

function carregarAtividades() {
    const lista = document.getElementById("listaAtividades");
    if (!lista) return;

    const atividades = obterDados("incluiedu_atividades");

    if (atividades.length === 0) {
        lista.innerHTML = `<p class="empty">Nenhuma atividade cadastrada. <a href="nova-atividade.html">Criar a primeira atividade</a>.</p>`;
        return;
    }

    lista.innerHTML = atividades.map(atividade => `
        <div class="item-lista">
            <div class="item-avatar disciplina" aria-hidden="true">📝</div>
            <div class="item-info">
                <strong>${esc(atividade.titulo)}</strong>
                <p>${esc(atividade.disciplina)} • ${esc(atividade.turma)}</p>
                ${atividade.objetivo ? `<small>Objetivo: ${esc(atividade.objetivo)}</small>` : ""}
            </div>
            <a class="btn-small" href="adaptar-atividade.html?id=${atividade.id}">Adaptar</a>
        </div>
    `).join("");
}

carregarAtividades();


/* =====================================================
   ÚLTIMAS ATIVIDADES (DASHBOARD)
   ===================================================== */

function carregarUltimasAtividades() {
    const lista = document.getElementById("ultimasAtividades");
    if (!lista) return;

    const atividades = obterDados("incluiedu_atividades").slice(-4).reverse();

    if (atividades.length === 0) {
        lista.innerHTML = `<p class="empty">Nenhuma atividade cadastrada.</p>`;
        return;
    }

    lista.innerHTML = atividades.map(atividade => `
        <div class="item-lista compacto">
            <div class="item-info">
                <strong>${esc(atividade.titulo)}</strong>
                <p>${esc(atividade.disciplina)} • ${esc(atividade.turma)} • ${esc(atividade.data || "")}</p>
            </div>
            <a class="btn-small" href="adaptar-atividade.html?id=${atividade.id}">Adaptar</a>
        </div>
    `).join("");
}

carregarUltimasAtividades();


/* =====================================================
   SELECTS DE ADAPTAÇÃO
   ===================================================== */

function carregarOpcoesAdaptacao() {
    const selectAtividade = document.getElementById("atividadeSelecionada");
    const selectAluno = document.getElementById("alunoSelecionado");
    if (!selectAtividade || !selectAluno) return;

    const atividades = obterDados("incluiedu_atividades");
    const alunos = obterDados("incluiedu_alunos");

    selectAtividade.innerHTML = `<option value="">Selecione uma atividade</option>` +
        atividades.map(a => `<option value="${a.id}">${esc(a.titulo)} (${esc(a.disciplina)})</option>`).join("");

    selectAluno.innerHTML = `<option value="">Selecione um aluno</option>` +
        alunos.map(a => `<option value="${a.id}">${esc(a.nome)} – ${esc(a.turma)}</option>`).join("");

    /* Pré-seleção vinda da URL (?id=atividade ou ?aluno=id) */
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get("id")) selectAtividade.value = parametros.get("id");
    if (parametros.get("aluno")) selectAluno.value = parametros.get("aluno");
}

carregarOpcoesAdaptacao();


/* =====================================================
   MOTOR DE SUGESTÕES
   Analisa as características registradas no perfil
   e sugere estratégias. O professor sempre decide.
   ===================================================== */

const REGRAS_ADAPTACAO = [
    { chaves: ["tdah", "atenção", "atencao", "foco", "hiperativ", "concentra"],
      motivo: "atenção e foco",
      estrategias: ["Utilizar instruções mais curtas", "Dividir a atividade em etapas", "Prever pausas entre as etapas"] },
    { chaves: ["dislexia", "leitura lenta", "troca de letras", "dificuldade de leitura", "textos longos", "texto longo"],
      motivo: "leitura",
      estrategias: ["Disponibilizar áudio", "Destacar palavras-chave", "Permitir resposta oral"] },
    { chaves: ["tea", "autis", "rotina", "previsível", "previsivel"],
      motivo: "previsibilidade e linguagem objetiva",
      estrategias: ["Usar linguagem direta e objetiva", "Antecipar as etapas com rotina visual", "Utilizar exemplos concretos"] },
    { chaves: ["baixa visão", "baixa visao", "cego", "cegueira", "visual", "fonte ampliada", "enxerga"],
      motivo: "acesso visual",
      estrategias: ["Ampliar a fonte e usar alto contraste", "Disponibilizar áudio", "Descrever as imagens"] },
    { chaves: ["surd", "auditiva", "libras", "audição", "audicao"],
      motivo: "comunicação em Libras",
      estrategias: ["Disponibilizar vídeo ou intérprete de Libras", "Utilizar apoio visual", "Usar legendas e esquemas"] },
    { chaves: ["motora", "física", "fisica", "cadeira de rodas", "coordenação", "coordenacao", "escrita"],
      motivo: "coordenação motora",
      estrategias: ["Permitir resposta oral", "Oferecer resposta digital ou de marcar", "Considerar tempo adicional"] },
    { chaves: ["intelectual", "compreens", "abstrat", "alfabetiza"],
      motivo: "compreensão",
      estrategias: ["Simplificar o vocabulário", "Utilizar material concreto", "Utilizar apoio visual"] },
    { chaves: ["tempo", "lento", "ansiedade", "ansios"],
      motivo: "ritmo",
      estrategias: ["Considerar tempo adicional"] }
];

const ESTRATEGIAS_PADRAO = [
    "Utilizar instruções mais curtas",
    "Dividir a atividade em etapas",
    "Utilizar apoio visual",
    "Destacar palavras-chave",
    "Disponibilizar áudio"
];

function sugerirEstrategias(aluno) {
    const texto = ((aluno.caracteristicas || "") + " " + (aluno.recursos || "")).toLowerCase();
    const sugeridas = [];
    const motivos = [];

    REGRAS_ADAPTACAO.forEach(regra => {
        if (regra.chaves.some(chave => texto.includes(chave))) {
            motivos.push(regra.motivo);
            regra.estrategias.forEach(e => { if (!sugeridas.includes(e)) sugeridas.push(e); });
        }
    });

    const todas = [...sugeridas];
    ESTRATEGIAS_PADRAO.forEach(e => { if (!todas.includes(e)) todas.push(e); });

    return { sugeridas, todas, motivos };
}

/* Transforma o enunciado em etapas curtas numeradas */
function gerarTextoAdaptado(conteudo, estrategias) {
    let frases = String(conteudo || "")
        .replace(/\s+/g, " ")
        .split(/(?<=[.?!])\s+/)
        .map(f => f.trim())
        .filter(Boolean);

    if (frases.length === 0) frases = [String(conteudo || "")];

    let linhas = frases.map((frase, i) => `Etapa ${i + 1}: ${frase}`);

    if (estrategias.includes("Destacar palavras-chave")) {
        linhas = linhas.map(l => l.replace(/\b(leia|explique|desenhe|represente|pinte|escreva|observe|responda|quem|qual|quantas|quantos|justifique)\b/gi, p => p.toUpperCase()));
    }

    const observacoes = [];
    if (estrategias.includes("Prever pausas entre as etapas")) observacoes.push("faça uma pausa curta ao terminar cada etapa");
    if (estrategias.includes("Considerar tempo adicional")) observacoes.push("você tem tempo extra");
    if (estrategias.includes("Permitir resposta oral")) observacoes.push("você pode responder falando");
    if (estrategias.includes("Disponibilizar áudio")) observacoes.push("toque em 🔊 para ouvir cada etapa");

    if (observacoes.length) {
        linhas.push("", "Lembrete: " + observacoes.join("; ") + ".");
    }

    return linhas.join("\n");
}


/* =====================================================
   GERAR ADAPTAÇÃO
   ===================================================== */

const formAdaptacao = document.getElementById("formAdaptacao");

if (formAdaptacao) {
    formAdaptacao.addEventListener("submit", function(event) {
        event.preventDefault();

        const atividadeId = Number(document.getElementById("atividadeSelecionada").value);
        const alunoId = Number(document.getElementById("alunoSelecionado").value);

        const atividade = obterDados("incluiedu_atividades").find(item => item.id === atividadeId);
        const aluno = obterDados("incluiedu_alunos").find(item => item.id === alunoId);

        if (!atividade || !aluno) {
            avisar("Selecione uma atividade e um aluno.", "erro");
            return;
        }

        const { sugeridas, todas, motivos } = sugerirEstrategias(aluno);
        const marcadas = sugeridas.length ? sugeridas : ESTRATEGIAS_PADRAO.slice(0, 2);
        const resultado = document.getElementById("resultadoAdaptacao");

        resultado.style.display = "block";
        resultado.innerHTML = `
            <span class="rotulo">SUGESTÕES DE ADAPTAÇÃO</span>
            <h2>${esc(atividade.titulo)}</h2>
            <p>Para o aluno: <strong>${esc(aluno.nome)}</strong> • ${esc(atividade.disciplina)}</p>

            <hr>

            <h3>💡 Sugestões</h3>
            <div class="lista-checks" id="listaEstrategias">
                ${todas.map(e => `
                    <label class="check">
                        <input type="checkbox" value="${esc(e)}" ${marcadas.includes(e) ? "checked" : ""}>
                        <span>${esc(e)}</span>
                    </label>`).join("")}
            </div>

            <h3>🧠 Por que essas sugestões?</h3>
            <p>
                ${motivos.length
                    ? `O perfil de ${esc(aluno.nome.split(" ")[0])} indica necessidades relacionadas a <strong>${esc(motivos.join(", "))}</strong>. As estratégias marcadas foram escolhidas a partir das características e dos recursos registrados.`
                    : "As sugestões são apresentadas considerando as características pedagógicas registradas para o aluno. Complete o perfil para receber sugestões mais precisas."}
                Você pode marcar ou desmarcar qualquer item: <strong>a decisão final é sempre do professor.</strong>
            </p>

            <h3>✏️ Atividade adaptada</h3>
            <p class="dica">Texto gerado a partir da atividade original. Edite à vontade antes de salvar.</p>
            <textarea id="textoAdaptado" rows="10" aria-label="Texto da atividade adaptada">${esc(gerarTextoAdaptado(atividade.conteudo, marcadas))}</textarea>

            <div class="botoes-linha">
                <button class="btn-outline" type="button" id="btnRegerar">↻ Gerar texto novamente</button>
                <button class="btn" type="button" id="btnSalvarAdaptacao">Salvar adaptação</button>
            </div>
        `;

        const checks = () => [...resultado.querySelectorAll("#listaEstrategias input:checked")].map(i => i.value);

        document.getElementById("btnRegerar").addEventListener("click", () => {
            document.getElementById("textoAdaptado").value = gerarTextoAdaptado(atividade.conteudo, checks());
            avisar("Texto atualizado com as estratégias marcadas.", "info");
        });

        document.getElementById("btnSalvarAdaptacao").addEventListener("click", () => {
            salvarAdaptacao(atividade.id, aluno.id, checks(), document.getElementById("textoAdaptado").value);
        });

        resultado.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    /* Se veio com atividade e aluno na URL, já gera */
    const p = new URLSearchParams(window.location.search);
    if (p.get("id") && p.get("aluno")) {
        formAdaptacao.requestSubmit();
    }
}


/* =====================================================
   SALVAR ADAPTAÇÃO
   ===================================================== */

function salvarAdaptacao(atividadeId, alunoId, estrategias = [], texto = "") {
    const adaptacoes = obterDados("incluiedu_adaptacoes");

    adaptacoes.push({
        id: Date.now(),
        atividadeId,
        alunoId,
        data: hoje(),
        status: "aprovada",
        estrategias,
        texto
    });

    salvarDados("incluiedu_adaptacoes", adaptacoes);
    avisar("Adaptação salva! Ela já aparece na área do aluno.");
}


/* =====================================================
   RESULTADOS
   ===================================================== */

function carregarSelectsResultados() {
    const alunoSelect = document.getElementById("resultadoAluno");
    const atividadeSelect = document.getElementById("resultadoAtividade");
    if (!alunoSelect || !atividadeSelect) return;

    alunoSelect.innerHTML = obterDados("incluiedu_alunos")
        .map(aluno => `<option value="${aluno.id}">${esc(aluno.nome)}</option>`).join("")
        || `<option value="">Cadastre um aluno primeiro</option>`;

    atividadeSelect.innerHTML = obterDados("incluiedu_atividades")
        .map(atividade => `<option value="${atividade.id}">${esc(atividade.titulo)}</option>`).join("")
        || `<option value="">Cadastre uma atividade primeiro</option>`;
}

carregarSelectsResultados();


/* =====================================================
   SALVAR RESULTADO
   ===================================================== */

const formResultado = document.getElementById("formResultado");

if (formResultado) {
    formResultado.addEventListener("submit", function(event) {
        event.preventDefault();

        const resultados = obterDados("incluiedu_resultados");

        resultados.push({
            id: Date.now(),
            alunoId: Number(document.getElementById("resultadoAluno").value),
            atividadeId: Number(document.getElementById("resultadoAtividade").value),
            nivel: document.getElementById("resultadoNivel").value,
            observacao: document.getElementById("resultadoObservacao").value.trim(),
            data: hoje()
        });

        salvarDados("incluiedu_resultados", resultados);
        avisar("Resultado registrado!");
        formResultado.reset();
        carregarSelectsResultados();
        carregarResultados();
    });
}


/* =====================================================
   LISTAR RESULTADOS
   ===================================================== */

function carregarResultados() {
    const lista = document.getElementById("listaResultados");
    if (!lista) return;

    const resultados = obterDados("incluiedu_resultados");
    const alunos = obterDados("incluiedu_alunos");
    const atividades = obterDados("incluiedu_atividades");

    if (resultados.length === 0) {
        lista.innerHTML = `<p class="empty">Nenhum resultado registrado.</p>`;
        return;
    }

    lista.innerHTML = resultados.slice().reverse().map(resultado => {
        const aluno = alunos.find(item => item.id === resultado.alunoId);
        const atividade = atividades.find(item => item.id === resultado.atividadeId);
        const nivel = NIVEIS[resultado.nivel] || { texto: resultado.nivel, cor: "", icone: "" };

        return `
            <div class="item-lista">
                <div class="item-info">
                    <strong>${esc(aluno?.nome || "Aluno")}</strong>
                    <p>${esc(atividade?.titulo || "Atividade")} • ${esc(resultado.data || "")}</p>
                    <small>${esc(resultado.observacao || "")}</small>
                </div>
                <span class="selo selo-${nivel.cor}">${nivel.icone} ${esc(nivel.texto)}</span>
            </div>`;
    }).join("");

    /* Resumo em barras */
    const resumo = document.getElementById("resumoResultados");
    if (resumo) {
        const total = resultados.length;
        resumo.innerHTML = Object.entries(NIVEIS).map(([chave, n]) => {
            const qtd = resultados.filter(r => r.nivel === chave).length;
            const pct = total ? Math.round(qtd / total * 100) : 0;
            return `
                <div class="barra-linha">
                    <span>${n.icone} ${n.texto}</span>
                    <div class="barra" role="img" aria-label="${pct}%"><div class="barra-${n.cor}" style="width:${pct}%"></div></div>
                    <strong>${qtd}</strong>
                </div>`;
        }).join("");
    }
}

carregarResultados();


/* =====================================================
   DASHBOARD
   ===================================================== */

function atualizarDashboard() {
    const mapa = {
        totalAlunos: "incluiedu_alunos",
        totalAtividades: "incluiedu_atividades",
        totalAdaptacoes: "incluiedu_adaptacoes",
        totalResultados: "incluiedu_resultados"
    };
    Object.entries(mapa).forEach(([id, chave]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = obterDados(chave).length;
    });
}

atualizarDashboard();


/* =====================================================
   ÁREA DO ALUNO
   ===================================================== */

function adaptacoesDoAlunoLogado() {
    const usuario = usuarioLogado();
    const alunos = obterDados("incluiedu_alunos");
    const adaptacoes = obterDados("incluiedu_adaptacoes");

    let aluno = null;
    if (usuario && usuario.alunoId) aluno = alunos.find(a => a.id === usuario.alunoId);
    if (!aluno && usuario) aluno = alunos.find(a => a.nome.toLowerCase() === usuario.nome.toLowerCase());

    /* Sem vínculo: mostra todas (modo demonstração) */
    return aluno ? adaptacoes.filter(a => a.alunoId === aluno.id) : adaptacoes;
}

const CORES_DISCIPLINA = {
    "matemática": "#5b5bd6", "ciências": "#14b8a6", "língua portuguesa": "#d97706",
    "geografia": "#16a34a", "história": "#dc2626", "inglês": "#0ea5e9", "arte": "#7c3aed", "artes": "#7c3aed"
};

function carregarAtividadesAluno() {
    const grade = document.getElementById("atividadesAluno");
    if (!grade) return;

    const atividades = obterDados("incluiedu_atividades");
    const concluidas = obterDados("incluiedu_concluidas");
    const minhas = adaptacoesDoAlunoLogado();

    const progresso = document.getElementById("progressoAluno");
    if (progresso) {
        const feitas = minhas.filter(a => concluidas.includes(a.id)).length;
        const pct = minhas.length ? Math.round(feitas / minhas.length * 100) : 0;
        progresso.innerHTML = `
            <div class="barra-linha">
                <span>Meu progresso</span>
                <div class="barra" role="img" aria-label="${pct}% concluído"><div class="barra-verde" style="width:${pct}%"></div></div>
                <strong>${feitas}/${minhas.length}</strong>
            </div>`;
    }

    if (minhas.length === 0) {
        grade.innerHTML = `<div class="dashboard-card"><h2>Nenhuma atividade por aqui ainda 🎉</h2><p>Quando seu professor adaptar uma atividade para você, ela aparece nesta página.</p></div>`;
        return;
    }

    grade.innerHTML = minhas.map(adaptacao => {
        const atv = atividades.find(a => a.id === adaptacao.atividadeId) || { titulo: "Atividade", disciplina: "" };
        const cor = CORES_DISCIPLINA[(atv.disciplina || "").toLowerCase()] || "#5b5bd6";
        const feita = concluidas.includes(adaptacao.id);
        return `
            <a class="card-atividade" href="atividade-aluno.html?id=${adaptacao.id}" style="--cor:${cor}">
                <span class="disciplina-tag">${esc(atv.disciplina)}</span>
                <h3>${esc(atv.titulo)}</h3>
                <p>${(adaptacao.texto || "").split("\n").filter(l => l.startsWith("Etapa")).length || 1} etapas • adaptada para você</p>
                <span class="status ${feita ? "feito" : ""}">${feita ? "✅ Concluída" : "▶ Começar"}</span>
            </a>`;
    }).join("");
}

carregarAtividadesAluno();


/* Atividade em modo "uma etapa por vez" */
function carregarAtividadeAluno() {
    const container = document.getElementById("atividadeAluno");
    if (!container) return;

    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const adaptacoes = obterDados("incluiedu_adaptacoes");
    const adaptacao = adaptacoes.find(a => a.id === id) || adaptacoesDoAlunoLogado()[0];

    if (!adaptacao) {
        container.innerHTML = `<section class="dashboard-card"><h2>Atividade não encontrada.</h2><a class="btn" href="dashboard-aluno.html">Voltar para minhas atividades</a></section>`;
        return;
    }

    const atv = obterDados("incluiedu_atividades").find(a => a.id === adaptacao.atividadeId) || { titulo: "Atividade", disciplina: "", conteudo: "" };
    const texto = adaptacao.texto || gerarTextoAdaptado(atv.conteudo, adaptacao.estrategias || []);
    const linhas = texto.split("\n").filter(l => l.trim());
    const etapas = linhas.filter(l => /^Etapa\s*\d+/i.test(l));
    const extras = linhas.filter(l => !/^Etapa\s*\d+/i.test(l));
    const lista = etapas.length ? etapas : linhas;
    let atual = 0;

    container.innerHTML = `
        <section class="dashboard-card atividade-topo">
            <span class="rotulo">${esc((atv.disciplina || "").toUpperCase())} • ATIVIDADE ADAPTADA</span>
            <h1>${esc(atv.titulo)}</h1>
            <p>Faça uma etapa de cada vez. Sem pressa! ⏱️</p>
            ${extras.length ? `<p class="lembrete">${extras.map(esc).join("<br>")}</p>` : ""}
            <div class="barra" aria-hidden="true"><div class="barra-verde" id="barraEtapas"></div></div>
        </section>

        <section class="dashboard-card etapa-card" aria-live="polite">
            <p class="etapa-contador" id="contadorEtapa"></p>
            <p class="etapa-texto" id="textoEtapa"></p>
            <label for="respostaEtapa" class="sr-only">Sua resposta</label>
            <textarea id="respostaEtapa" rows="3" placeholder="Escreva sua resposta aqui (ou responda falando para o professor)"></textarea>
        </section>

        <section class="dashboard-card botoes-etapa">
            <button class="btn-outline" type="button" id="btnOuvir">🔊 Ouvir</button>
            <button class="btn-outline" type="button" id="btnAnterior">← Anterior</button>
            <button class="btn" type="button" id="btnProxima">Próxima etapa →</button>
        </section>
    `;

    const respostas = obterDados("incluiedu_respostas_" + adaptacao.id, {});
    const campo = document.getElementById("respostaEtapa");

    function mostrar() {
        document.getElementById("contadorEtapa").textContent = `Etapa ${atual + 1} de ${lista.length}`;
        document.getElementById("textoEtapa").textContent = lista[atual].replace(/^Etapa\s*\d+\s*:\s*/i, "");
        document.getElementById("barraEtapas").style.width = Math.round((atual + 1) / lista.length * 100) + "%";
        document.getElementById("btnAnterior").disabled = atual === 0;
        document.getElementById("btnProxima").textContent = atual === lista.length - 1 ? "✅ Concluir atividade" : "Próxima etapa →";
        campo.value = respostas[atual] || "";
    }

    campo.addEventListener("input", () => {
        respostas[atual] = campo.value;
        salvarDados("incluiedu_respostas_" + adaptacao.id, respostas);
    });

    document.getElementById("btnOuvir").addEventListener("click", () => falar(lista[atual]));
    document.getElementById("btnAnterior").addEventListener("click", () => { if (atual > 0) { atual--; mostrar(); } });
    document.getElementById("btnProxima").addEventListener("click", () => {
        if (atual < lista.length - 1) {
            atual++;
            mostrar();
        } else {
            const concluidas = obterDados("incluiedu_concluidas");
            if (!concluidas.includes(adaptacao.id)) concluidas.push(adaptacao.id);
            salvarDados("incluiedu_concluidas", concluidas);
            avisar("Parabéns! Atividade concluída 🎉");
            setTimeout(() => { window.location.href = "dashboard-aluno.html"; }, 1200);
        }
    });

    mostrar();
}

carregarAtividadeAluno();


/* =====================================================
   LEITURA EM VOZ ALTA (Web Speech API)
   ===================================================== */

function falar(texto) {
    if (!("speechSynthesis" in window)) {
        avisar("Seu navegador não tem leitura em voz alta.", "erro");
        return;
    }
    window.speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 0.95;
    const voz = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("pt"));
    if (voz) fala.voice = voz;
    window.speechSynthesis.speak(fala);
}


/* =====================================================
   MENSAGEM
   ===================================================== */

function mostrarMensagem(elementoId, mensagem, tipo = "") {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensagem;
        elemento.className = "mensagem " + (tipo ? "mensagem-" + tipo : "");
    }
}


/* =====================================================
   CONTATO
   ===================================================== */

const formContato = document.getElementById("formContato");

if (formContato) {
    formContato.addEventListener("submit", function(event) {
        event.preventDefault();
        const mensagens = obterDados("incluiedu_contatos");
        mensagens.push({
            id: Date.now(),
            nome: document.getElementById("contatoNome").value.trim(),
            email: document.getElementById("contatoEmail").value.trim(),
            perfil: document.getElementById("contatoPerfil").value,
            mensagem: document.getElementById("contatoMensagem").value.trim(),
            data: hoje()
        });
        salvarDados("incluiedu_contatos", mensagens);
        formContato.reset();
        mostrarMensagem("mensagemContato", "Mensagem registrada! Obrigado pelo contato. Responderemos pelo e-mail informado.", "sucesso");
        avisar("Mensagem enviada!");
    });
}


/* =====================================================
   MENU MOBILE
   ===================================================== */

const botaoMenu = document.getElementById("botaoMenu");

if (botaoMenu) {
    botaoMenu.addEventListener("click", () => {
        const aberto = document.body.classList.toggle("menu-aberto");
        botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.querySelectorAll("header nav a").forEach(link =>
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-aberto");
            botaoMenu.setAttribute("aria-expanded", "false");
        }));
}

/* Marca o link da página atual no menu */
(function marcarMenuAtual() {
    const pagina = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll("header nav a").forEach(link => {
        const destino = link.getAttribute("href").split("#")[0];
        if (destino === pagina && !link.getAttribute("href").includes("#")) {
            link.setAttribute("aria-current", "page");
        }
    });
})();


/* =====================================================
   PAINEL DE ACESSIBILIDADE
   ===================================================== */

const PREFS_PADRAO = { fonte: 100, contraste: false, leitura: false, links: false, movimento: false };

function aplicarPreferencias(prefs) {
    document.documentElement.style.fontSize = prefs.fonte + "%";
    document.body.classList.toggle("alto-contraste", prefs.contraste);
    document.body.classList.toggle("leitura-facil", prefs.leitura);
    document.body.classList.toggle("destacar-links", prefs.links);
    document.body.classList.toggle("sem-movimento", prefs.movimento);
    document.querySelectorAll("[data-a11y-toggle]").forEach(botao => {
        botao.setAttribute("aria-pressed", prefs[botao.dataset.a11yToggle] ? "true" : "false");
    });
    const rotulo = document.getElementById("a11yFonteValor");
    if (rotulo) rotulo.textContent = prefs.fonte + "%";
}

(function iniciarAcessibilidade() {
    const prefs = Object.assign({}, PREFS_PADRAO, obterDados("incluiedu_acessibilidade", {}));

    const painel = document.createElement("div");
    painel.className = "a11y";
    painel.innerHTML = `
        <button class="a11y-botao" type="button" aria-expanded="false" aria-controls="a11yPainel" title="Acessibilidade">
            <span aria-hidden="true">♿</span><span class="sr-only">Abrir opções de acessibilidade</span>
        </button>
        <div class="a11y-painel" id="a11yPainel" role="dialog" aria-label="Opções de acessibilidade" hidden>
            <strong>Acessibilidade</strong>
            <div class="a11y-fonte">
                <button type="button" data-a11y="menos" aria-label="Diminuir texto">A−</button>
                <span id="a11yFonteValor">100%</span>
                <button type="button" data-a11y="mais" aria-label="Aumentar texto">A+</button>
            </div>
            <button type="button" data-a11y-toggle="contraste" aria-pressed="false">◐ Alto contraste</button>
            <button type="button" data-a11y-toggle="leitura" aria-pressed="false">📖 Leitura facilitada</button>
            <button type="button" data-a11y-toggle="links" aria-pressed="false">🔗 Destacar links</button>
            <button type="button" data-a11y-toggle="movimento" aria-pressed="false">⏸ Reduzir animações</button>
            <button type="button" data-a11y="ler">🔊 Ler esta página</button>
            <button type="button" data-a11y="parar">⏹ Parar leitura</button>
            <button type="button" data-a11y="reset" class="a11y-reset">Restaurar padrão</button>
        </div>`;
    document.body.appendChild(painel);

    const botao = painel.querySelector(".a11y-botao");
    const caixa = painel.querySelector(".a11y-painel");

    botao.addEventListener("click", () => {
        const abrir = caixa.hidden;
        caixa.hidden = !abrir;
        botao.setAttribute("aria-expanded", abrir ? "true" : "false");
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !caixa.hidden) {
            caixa.hidden = true;
            botao.setAttribute("aria-expanded", "false");
            botao.focus();
        }
    });

    painel.addEventListener("click", e => {
        const alvo = e.target.closest("button");
        if (!alvo || alvo === botao) return;
        const acao = alvo.dataset.a11y;
        const toggle = alvo.dataset.a11yToggle;
        if (toggle) prefs[toggle] = !prefs[toggle];
        if (acao === "mais") prefs.fonte = Math.min(150, prefs.fonte + 10);
        if (acao === "menos") prefs.fonte = Math.max(80, prefs.fonte - 10);
        if (acao === "reset") Object.assign(prefs, PREFS_PADRAO);
        if (acao === "ler") {
            const selecao = String(window.getSelection() || "").trim();
            const principal = document.querySelector("main") || document.body;
            falar(selecao || principal.innerText.slice(0, 4000));
        }
        if (acao === "parar" && "speechSynthesis" in window) window.speechSynthesis.cancel();
        salvarDados("incluiedu_acessibilidade", prefs);
        aplicarPreferencias(prefs);
    });

    aplicarPreferencias(prefs);
})();


/* =====================================================
   VÍDEOS (carregam só ao clicar - mais leve e privado)
   ===================================================== */

document.querySelectorAll("[data-video]").forEach(card => {
    card.addEventListener("click", () => {
        const id = card.dataset.video;
        /* Aberto direto do computador (file://) o YouTube bloqueia o player embutido:
           nesse caso abre o vídeo no YouTube em nova aba. */
        if (location.protocol === "file:") {
            window.open("https://www.youtube.com/watch?v=" + id, "_blank", "noopener");
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&cc_load_policy=1&hl=pt-BR";
        iframe.title = card.getAttribute("aria-label") || "Vídeo";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        card.replaceWith(iframe);
    });
});


/* =====================================================
   CRONÔMETRO DE ESTUDOS (POMODORO)
   ===================================================== */

(function pomodoro() {
    const visor = document.getElementById("pomodoroVisor");
    if (!visor) return;

    let restante = 25 * 60;
    let intervalo = null;
    let modo = "foco";
    const estado = document.getElementById("pomodoroEstado");
    const ciclos = document.getElementById("pomodoroCiclos");
    let contagem = 0;

    function desenhar() {
        const m = String(Math.floor(restante / 60)).padStart(2, "0");
        const s = String(restante % 60).padStart(2, "0");
        visor.textContent = `${m}:${s}`;
        document.title = (intervalo ? `${m}:${s} • ` : "") + "IncluiEdu | Dicas de estudo";
    }

    function definir(novoModo, minutos) {
        modo = novoModo;
        restante = minutos * 60;
        estado.textContent = modo === "foco" ? "Hora de focar 📚" : "Hora da pausa ☕";
        desenhar();
    }

    function tique() {
        restante--;
        if (restante <= 0) {
            clearInterval(intervalo);
            intervalo = null;
            if (modo === "foco") {
                contagem++;
                ciclos.textContent = contagem;
                falar("Muito bem! Hora de uma pausa.");
                definir("pausa", contagem % 4 === 0 ? 15 : 5);
            } else {
                falar("Pausa terminada. Vamos voltar a estudar?");
                definir("foco", 25);
            }
            avisar(modo === "pausa" ? "Bloco concluído! Faça uma pausa." : "Pausa terminada!", "info");
        }
        desenhar();
    }

    document.getElementById("pomodoroIniciar").addEventListener("click", () => {
        if (intervalo) return;
        intervalo = setInterval(tique, 1000);
        desenhar();
    });
    document.getElementById("pomodoroPausar").addEventListener("click", () => {
        clearInterval(intervalo);
        intervalo = null;
        desenhar();
    });
    document.getElementById("pomodoroZerar").addEventListener("click", () => {
        clearInterval(intervalo);
        intervalo = null;
        definir("foco", Number(document.getElementById("pomodoroMinutos").value) || 25);
    });
    document.getElementById("pomodoroMinutos").addEventListener("change", e => {
        if (!intervalo) definir("foco", Number(e.target.value) || 25);
    });

    desenhar();
})();


/* =====================================================
   QUIZ RÁPIDO (Dicas de estudo / Conteúdos)
   ===================================================== */

document.querySelectorAll(".quiz").forEach(quiz => {
    quiz.querySelectorAll(".quiz-opcao").forEach(opcao => {
        opcao.addEventListener("click", () => {
            const pergunta = opcao.closest(".quiz-pergunta");
            pergunta.querySelectorAll(".quiz-opcao").forEach(o => { o.disabled = true; });
            const certa = opcao.dataset.certa === "1";
            opcao.classList.add(certa ? "certa" : "errada");
            if (!certa) pergunta.querySelector('[data-certa="1"]').classList.add("certa");
            const fb = pergunta.querySelector(".quiz-feedback");
            fb.hidden = false;
            fb.textContent = (certa ? "✅ Isso mesmo! " : "💡 Quase! ") + (pergunta.dataset.explica || "");
        });
    });
});


/* =====================================================
   ANO ATUAL NO RODAPÉ
   ===================================================== */

document.querySelectorAll("[data-ano]").forEach(el => { el.textContent = new Date().getFullYear(); });


/* =====================================================
   VLIBRAS (tradutor oficial de Libras do Governo Federal)
   Carrega só com internet; sem internet o site segue normal.
   ===================================================== */

(function carregarVLibras() {
    if (!document.body.hasAttribute("data-vlibras") || !navigator.onLine) return;
    const area = document.createElement("div");
    area.setAttribute("vw", "");
    area.className = "enabled";
    area.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(area);
    const s = document.createElement("script");
    s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    s.async = true;
    s.onload = () => { try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) { /* sem VLibras */ } };
    s.onerror = () => area.remove();
    document.body.appendChild(s);
})();



/* =====================================================
   MATÉRIAS: ouvir exemplo e usar modelo no sistema
   ===================================================== */

document.querySelectorAll("[data-falar]").forEach(botao =>
    botao.addEventListener("click", () => falar(botao.dataset.falar)));

document.querySelectorAll("[data-modelo]").forEach(botao =>
    botao.addEventListener("click", () => {
        const modelo = JSON.parse(botao.dataset.modelo);
        const atividades = obterDados("incluiedu_atividades");
        let atividade = atividades.find(a => a.titulo === modelo.titulo);
        if (!atividade) {
            atividade = Object.assign({ id: Date.now(), data: hoje() }, modelo);
            atividades.push(atividade);
            salvarDados("incluiedu_atividades", atividades);
        }
        avisar("Atividade adicionada! Agora escolha o aluno.");
        setTimeout(() => { window.location.href = "adaptar-atividade.html?id=" + atividade.id; }, 800);
    }));


/* Contato: pré-seleciona o assunto vindo dos planos (?assunto=escola) */
(function assuntoContato() {
    const perfil = document.getElementById("contatoPerfil");
    const assunto = new URLSearchParams(location.search).get("assunto");
    if (!perfil || !assunto) return;
    if ([...perfil.options].some(o => o.value === assunto)) perfil.value = assunto;
    const msg = document.getElementById("contatoMensagem");
    if (msg && !msg.value) msg.value = assunto === "rede"
        ? "Olá! Gostaria de receber uma proposta do IncluiEdu para a nossa rede de ensino."
        : "Olá! Gostaria de conhecer o plano Escola do IncluiEdu.";
})();
