/* =====================================================
   INCLUIEDU • PONTOS E ENGAJAMENTO
   Pontos por tarefa (bônus de primeira tentativa), mini-jogos,
   dias estudados, sequência de dias e tempo ATIVO de estudo
   (aba visível + interação recente). Tudo no IndexedDB.
   ===================================================== */

const Engaja = (() => {
    const PASSO = 15;               /* segundos contados a cada verificação */
    const INATIVO = 60 * 1000;      /* sem interação há 1 min = não conta tempo */
    let usuario = null, ultimaInteracao = Date.now(), timer = null, convidou = false;
    const e = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const dia = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
    const diaMenos = (n, base = new Date()) => { const d = new Date(base); d.setDate(d.getDate() - n); return dia(d); };
    const ehAluno = () => !!(usuario && usuario.tipo === "aluno");

    function convidar(motivo) {
        if (usuario || convidou) return;
        convidou = true;
        const c = document.createElement("div");
        c.className = "convite-pontos";
        c.setAttribute("role", "status");
        c.innerHTML = `<span aria-hidden="true">🏅</span><p><strong>${e(motivo || "Muito bem!")}</strong> Entre na sua conta de aluno para salvar seus pontos, sua sequência de dias e seu tempo de estudo.</p>
            <a class="btn-small" href="login.html">Entrar</a><a class="btn-mini" href="cadastro.html">Criar conta</a>
            <button type="button" class="convite-fechar" aria-label="Fechar aviso">✕</button>`;
        c.querySelector(".convite-fechar").addEventListener("click", () => c.remove());
        document.body.appendChild(c);
    }

    function festejarPontos(valor, texto) {
        const b = document.createElement("div");
        b.className = "pontos-voando";
        b.setAttribute("role", "status");
        b.textContent = `+${valor} pontos${texto ? " • " + texto : ""}`;
        document.body.appendChild(b);
        setTimeout(() => b.remove(), 2600);
    }

    async function ganhar(ref, valor, motivo, opcoes = {}) {
        if (!ehAluno()) { convidar(opcoes.convite); return 0; }
        const lista = await DB.onde("pontos", "usuarioId", usuario.id);
        if (lista.some(p => p.ref === ref)) return 0;
        await DB.salvar("pontos", { usuarioId: usuario.id, ref, valor, motivo, tipo: opcoes.tipo || "tarefa", dia: dia() });
        festejarPontos(valor, opcoes.bonus ? "bônus de primeira tentativa!" : "");
        document.dispatchEvent(new CustomEvent("pontos-ganhos", { detail: { valor, ref } }));
        return valor;
    }

    async function somarTempo(segundos) {
        if (!ehAluno()) return;
        const chave = usuario.id + "|" + dia();
        const r = (await DB.buscar("tempo", chave)) || { chave, usuarioId: usuario.id, dia: dia(), segundos: 0 };
        r.segundos += segundos;
        await DB.salvar("tempo", r);
    }

    async function tick(forcar = false) {
        const visivel = document.visibilityState === "visible";
        const ativo = Date.now() - ultimaInteracao < INATIVO;
        if (forcar || (visivel && ativo)) await somarTempo(PASSO);
    }

    function iniciar(u) {
        usuario = u || null;
        ["pointerdown", "keydown", "scroll", "touchstart", "input"].forEach(ev =>
            window.addEventListener(ev, () => { ultimaInteracao = Date.now(); }, { passive: true, capture: true }));
        if (ehAluno() && !timer) timer = setInterval(() => tick().catch(() => {}), PASSO * 1000);
        /* Exercícios das aulas: pontos na primeira vez que terminar o bloco */
        document.addEventListener("int-conferido", async ev => {
            const bloco = ev.target.closest("[data-ex]");
            if (!bloco) return;
            const d = ev.detail;
            if (d.faltando) return;
            document.dispatchEvent(new CustomEvent("exercicios-concluidos", { detail: { ex: bloco.dataset.ex, materia: bloco.dataset.materia } }));
            const primeira = d.tentativa === 1 && d.total > 0 && d.certos === d.total;
            const valor = 5 + d.certos * 2 + (primeira ? 5 : 0);
            await ganhar("ex:" + bloco.dataset.ex, valor, "Exercícios: " + (bloco.dataset.titulo || bloco.dataset.ex), { tipo: "exercicio", bonus: primeira, convite: "Exercícios concluídos! 🎉" });
        });
    }

    async function resumo(uid) {
        const [pts, tempos] = await Promise.all([DB.onde("pontos", "usuarioId", uid), DB.onde("tempo", "usuarioId", uid)]);
        const seg = {}; tempos.forEach(t => { seg[t.dia] = (seg[t.dia] || 0) + t.segundos; });
        const ptsDia = {}; pts.forEach(p => { ptsDia[p.dia] = (ptsDia[p.dia] || 0) + p.valor; });
        const dias = new Set([...Object.keys(seg).filter(d => seg[d] >= PASSO), ...Object.keys(ptsDia)]);
        let seq = 0, k = dias.has(dia()) ? 0 : 1;
        while (dias.has(diaMenos(k))) { seq++; k++; }
        const ultimos7 = Array.from({ length: 7 }, (_, i) => { const d = diaMenos(6 - i); return { dia: d, min: Math.round((seg[d] || 0) / 60), pts: ptsDia[d] || 0 }; });
        const ultima = [...dias].sort().pop() || null;
        return {
            pontos: pts.reduce((s, p) => s + p.valor, 0),
            jogos: pts.filter(p => p.tipo === "jogo").length,
            tarefas: pts.filter(p => p.tipo !== "jogo").length,
            diasEstudados: dias.size, sequencia: seq,
            minHoje: Math.round((seg[dia()] || 0) / 60),
            minSemana: ultimos7.reduce((s, d) => s + d.min, 0),
            ultimos7, ultima, historico: pts.slice().sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || "")).slice(0, 6)
        };
    }

    const MEDALHAS = [
        { icone: "🌱", nome: "Primeiros pontos", teste: r => r.pontos > 0 },
        { icone: "💯", nome: "100 pontos", teste: r => r.pontos >= 100 },
        { icone: "🔥", nome: "3 dias seguidos", teste: r => r.sequencia >= 3 },
        { icone: "📅", nome: "5 dias de estudo", teste: r => r.diasEstudados >= 5 },
        { icone: "⏱️", nome: "30 min na semana", teste: r => r.minSemana >= 30 },
        { icone: "🎮", nome: "Primeiro mini-jogo", teste: r => r.jogos >= 1 }
    ];
    const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

    function grafico(r, campo, unidade, cor) {
        const max = Math.max(1, ...r.ultimos7.map(d => d[campo]));
        return `<div class="grafico-7" role="img" aria-label="${e(unidade)} nos últimos 7 dias: ${r.ultimos7.map(d => d[campo]).join(", ")}">
            ${r.ultimos7.map(d => `<div class="g7-col"><span class="g7-valor">${d[campo]}</span><span class="g7-barra" style="height:${Math.max(4, d[campo] / max * 100)}%;--c:${cor}"></span><span class="g7-dia">${SEMANA[new Date(d.dia + "T12:00").getDay()]}</span></div>`).join("")}
        </div>`;
    }

    function painelAluno(r) {
        return `<div class="engaja-cards">
                <div class="engaja-card" style="--c:#5b54e8"><span aria-hidden="true">🏅</span><strong id="engPontos">${r.pontos}</strong><small>pontos</small></div>
                <div class="engaja-card" style="--c:#f08c2e"><span aria-hidden="true">🔥</span><strong id="engSequencia">${r.sequencia}</strong><small>${r.sequencia === 1 ? "dia seguido" : "dias seguidos"}</small></div>
                <div class="engaja-card" style="--c:#18b6a4"><span aria-hidden="true">⏱️</span><strong id="engHoje">${r.minHoje}</strong><small>min hoje</small></div>
                <div class="engaja-card" style="--c:#3b82f6"><span aria-hidden="true">📆</span><strong id="engSemana">${r.minSemana}</strong><small>min na semana</small></div>
                <div class="engaja-card" style="--c:#22a06b"><span aria-hidden="true">📚</span><strong id="engDias">${r.diasEstudados}</strong><small>dias estudados</small></div>
            </div>
            <div class="engaja-graficos">
                <div><h3>⏱️ Minutos de estudo</h3>${grafico(r, "min", "Minutos", "#18b6a4")}</div>
                <div><h3>🏅 Pontos por dia</h3>${grafico(r, "pts", "Pontos", "#5b54e8")}</div>
            </div>
            <h3>Medalhas</h3>
            <div class="medalhas">${MEDALHAS.map(m => { const ok = m.teste(r); return `<div class="medalha ${ok ? "ganha" : ""}"><span aria-hidden="true">${m.icone}</span><strong>${e(m.nome)}</strong><small>${ok ? "Conquistada!" : "Ainda não"}</small></div>`; }).join("")}</div>
            <p class="engaja-nota">Só conta o tempo em que você está mesmo estudando: com a página aberta na tela e mexendo nela. 💡</p>`;
    }

    return { iniciar, ganhar, resumo, painelAluno, grafico, tick, dia, convidar, MEDALHAS, _usuario: () => usuario };
})();
