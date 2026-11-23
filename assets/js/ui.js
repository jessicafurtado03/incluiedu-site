/* =====================================================
   INCLUIEDU • INTERFACE
   Avisos, janelas de confirmação, acessibilidade, menu,
   animações suaves, vídeos, cronômetro e quizzes.
   ===================================================== */

function esc(texto) {
    return String(texto ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

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
    setTimeout(() => toast.classList.add("saindo"), 2800);
    setTimeout(() => toast.remove(), 3400);
}

/* Janela de confirmação acessível (substitui o confirm do navegador) */
function confirmar(mensagem, { titulo = "Confirmar", ok = "Confirmar", perigo = false } = {}) {
    return new Promise(resolve => {
        const d = document.createElement("dialog");
        d.className = "modal";
        d.innerHTML = `
            <h2>${esc(titulo)}</h2>
            <p>${esc(mensagem)}</p>
            <div class="botoes-linha">
                <button type="button" class="btn-outline" data-r="0">Cancelar</button>
                <button type="button" class="btn ${perigo ? "btn-perigo" : ""}" data-r="1">${esc(ok)}</button>
            </div>`;
        document.body.appendChild(d);
        const fechar = r => { d.close(); d.remove(); resolve(r); };
        d.addEventListener("click", e => {
            const b = e.target.closest("[data-r]");
            if (b) fechar(b.dataset.r === "1");
            else if (e.target === d) fechar(false);
        });
        d.addEventListener("cancel", e => { e.preventDefault(); fechar(false); });
        d.showModal();
        d.querySelector('[data-r="1"]').focus();
    });
}

function falar(texto) {
    if (!("speechSynthesis" in window)) { avisar("Seu navegador não tem leitura em voz alta.", "erro"); return; }
    window.speechSynthesis.cancel();
    const limpo = typeof Interativo !== "undefined" ? Interativo.paraFala(texto) : String(texto).replace(/[_]{2,}/g, " espaço para resposta ");
    const fala = new SpeechSynthesisUtterance(limpo);
    fala.lang = "pt-BR";
    fala.rate = 0.92;
    const voz = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("pt"));
    if (voz) fala.voice = voz;
    window.speechSynthesis.speak(fala);
}

function baixarArquivo(nome, conteudo, tipo = "application/json") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- MENU MOBILE ---------- */
(function menuMobile() {
    const botao = document.getElementById("botaoMenu");
    if (!botao) return;
    botao.addEventListener("click", () => {
        const aberto = document.body.classList.toggle("menu-aberto");
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.querySelectorAll("header nav a").forEach(link => link.addEventListener("click", () => {
        document.body.classList.remove("menu-aberto");
        botao.setAttribute("aria-expanded", "false");
    }));
})();

(function marcarMenuAtual() {
    const pagina = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("header nav a").forEach(link => {
        const href = link.getAttribute("href");
        if (href.split("#")[0] === pagina && !href.includes("#")) link.setAttribute("aria-current", "page");
    });
})();

/* ---------- PAINEL DE ACESSIBILIDADE ---------- */
const PREFS_PADRAO = { fonte: 100, contraste: false, leitura: false, links: false, movimento: false, foco: false };

function lerPrefs() {
    try { return Object.assign({}, PREFS_PADRAO, JSON.parse(localStorage.getItem("incluiedu_acessibilidade") || "{}")); }
    catch (e) { return Object.assign({}, PREFS_PADRAO); }
}

function aplicarPreferencias(prefs) {
    document.documentElement.style.fontSize = prefs.fonte + "%";
    document.body.classList.toggle("alto-contraste", prefs.contraste);
    document.body.classList.toggle("leitura-facil", prefs.leitura);
    document.body.classList.toggle("destacar-links", prefs.links);
    document.body.classList.toggle("sem-movimento", prefs.movimento);
    document.querySelectorAll("[data-a11y-toggle]").forEach(b =>
        b.setAttribute("aria-pressed", prefs[b.dataset.a11yToggle] ? "true" : "false"));
    const rotulo = document.getElementById("a11yFonteValor");
    if (rotulo) rotulo.textContent = prefs.fonte + "%";
}

const PREFS_ATUAIS = lerPrefs();
/* Altera uma preferência de acessibilidade por código (usado pelas sugestões) */
function alterarPreferencia(fn) {
    fn(PREFS_ATUAIS);
    localStorage.setItem("incluiedu_acessibilidade", JSON.stringify(PREFS_ATUAIS));
    aplicarPreferencias(PREFS_ATUAIS);
}

(function iniciarAcessibilidade() {
    const prefs = PREFS_ATUAIS;
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
            <button type="button" data-a11y-toggle="movimento" aria-pressed="false">⏸ Desligar animações</button>
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
        if (e.key === "Escape" && !caixa.hidden) { caixa.hidden = true; botao.setAttribute("aria-expanded", "false"); botao.focus(); }
    });
    painel.addEventListener("click", e => {
        const alvo = e.target.closest("button");
        if (!alvo || alvo === botao) return;
        const acao = alvo.dataset.a11y, toggle = alvo.dataset.a11yToggle;
        if (toggle) prefs[toggle] = !prefs[toggle];
        if (acao === "mais") prefs.fonte = Math.min(150, prefs.fonte + 10);
        if (acao === "menos") prefs.fonte = Math.max(80, prefs.fonte - 10);
        if (acao === "reset") Object.assign(prefs, PREFS_PADRAO);
        if (acao === "ler") {
            const sel = String(window.getSelection() || "").trim();
            falar(sel || (document.querySelector("main") || document.body).innerText.slice(0, 4000));
        }
        if (acao === "parar" && "speechSynthesis" in window) window.speechSynthesis.cancel();
        localStorage.setItem("incluiedu_acessibilidade", JSON.stringify(prefs));
        aplicarPreferencias(prefs);
    });
    aplicarPreferencias(prefs);
})();

/* ---------- ANIMAÇÃO SUAVE AO ROLAR ---------- */
function revelar(raiz = document) {
    const itens = raiz.querySelectorAll(".revelar:not(.visivel)");
    if (!("IntersectionObserver" in window)) { itens.forEach(i => i.classList.add("visivel")); return; }
    const obs = new IntersectionObserver(entradas => entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("visivel"); obs.unobserve(en.target); }
    }), { threshold: 0.12 });
    itens.forEach(i => obs.observe(i));
}
document.querySelectorAll(".section-header, .etapas article, .recursos-grid article, .card-foto, .materia-card, .plano, .dica-card, .bloco-split > *, .fluxo-passo, .aula")
    .forEach(el => el.classList.add("revelar"));
revelar();

/* ---------- VÍDEOS ---------- */
document.querySelectorAll("[data-video]").forEach(card => card.addEventListener("click", () => {
    const id = card.dataset.video;
    if (location.protocol === "file:") { window.open("https://www.youtube.com/watch?v=" + id, "_blank", "noopener"); return; }
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&cc_load_policy=1&hl=pt-BR";
    f.title = card.getAttribute("aria-label") || "Vídeo";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    f.referrerPolicy = "strict-origin-when-cross-origin";
    card.replaceWith(f);
}));

/* ---------- CRONÔMETRO DE ESTUDOS ---------- */
(function pomodoro() {
    const visor = document.getElementById("pomodoroVisor");
    if (!visor) return;
    let restante = 25 * 60, intervalo = null, modo = "foco", contagem = 0;
    const estado = document.getElementById("pomodoroEstado"), ciclos = document.getElementById("pomodoroCiclos");
    const desenhar = () => {
        const m = String(Math.floor(restante / 60)).padStart(2, "0"), s = String(restante % 60).padStart(2, "0");
        visor.textContent = `${m}:${s}`;
    };
    const definir = (novo, min) => { modo = novo; restante = min * 60; estado.textContent = modo === "foco" ? "Hora de focar 📚" : "Hora da pausa ☕"; desenhar(); };
    const tique = () => {
        restante--;
        if (restante <= 0) {
            clearInterval(intervalo); intervalo = null;
            if (modo === "foco") { contagem++; ciclos.textContent = contagem; falar("Muito bem! Hora de uma pausa."); definir("pausa", contagem % 4 === 0 ? 15 : 5); }
            else { falar("Pausa terminada. Vamos voltar a estudar?"); definir("foco", 25); }
        }
        desenhar();
    };
    document.getElementById("pomodoroIniciar").addEventListener("click", () => { if (!intervalo) intervalo = setInterval(tique, 1000); });
    document.getElementById("pomodoroPausar").addEventListener("click", () => { clearInterval(intervalo); intervalo = null; });
    document.getElementById("pomodoroZerar").addEventListener("click", () => { clearInterval(intervalo); intervalo = null; definir("foco", Number(document.getElementById("pomodoroMinutos").value) || 25); });
    document.getElementById("pomodoroMinutos").addEventListener("change", e => { if (!intervalo) definir("foco", Number(e.target.value) || 25); });
    desenhar();
})();

/* ---------- QUIZZES ---------- */
document.querySelectorAll(".quiz").forEach(quiz => quiz.querySelectorAll(".quiz-opcao").forEach(op => op.addEventListener("click", () => {
    const p = op.closest(".quiz-pergunta");
    p.querySelectorAll(".quiz-opcao").forEach(o => { o.disabled = true; });
    const certa = op.dataset.certa === "1";
    op.classList.add(certa ? "certa" : "errada");
    if (!certa) p.querySelector('[data-certa="1"]').classList.add("certa");
    const fb = p.querySelector(".quiz-feedback");
    fb.hidden = false;
    fb.textContent = (certa ? "⭐ Isso mesmo! " : "💡 Quase! ") + (p.dataset.explica || "");
})));

document.querySelectorAll("[data-falar]").forEach(b => b.addEventListener("click", () => falar(b.dataset.falar)));
document.querySelectorAll("[data-ano]").forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- VLIBRAS (tradutor oficial de Libras) ---------- */
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
    s.onload = () => { try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) { /* segue sem VLibras */ } };
    s.onerror = () => area.remove();
    document.body.appendChild(s);
})();
