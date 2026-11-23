/* =====================================================
   INCLUIEDU • MINI-JOGOS DAS MATÉRIAS
   Curtos, calmos, só de toque, sem tempo (cronômetro calmo opcional).
   Liberados quando o aluno termina os exercícios de uma aula.
   ===================================================== */

const Jogos = (() => {
    const CHAVE = "incluiedu_jogos_liberados";
    const e = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const mistura = (lista, k = 3) => lista.map((v, i) => ({ v, o: Math.sin((i + 1) * 12.9898 * k) })).sort((a, b) => a.o - b.o).map(x => x.v);
    const fala = t => { if (typeof falar === "function") falar(t); };
    const liberados = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || "[]"); } catch (_) { return []; } };
    const liberar = slug => { const l = liberados(); if (!l.includes(slug)) { l.push(slug); localStorage.setItem(CHAVE, JSON.stringify(l)); } };

    /* ---------- Jogo: rodadas com retorno gentil ---------- */
    function rodadas(area, lista, montar, aoFim) {
        let i = 0, acertosDePrimeira = 0, errouNesta = false;
        const prox = () => {
            if (i >= lista.length) { aoFim(acertosDePrimeira, lista.length); return; }
            errouNesta = false;
            area.innerHTML = `<p class="jogo-rodada">Rodada ${i + 1} de ${lista.length}</p><div class="jogo-palco"></div><p class="jogo-retorno" aria-live="polite"></p>`;
            montar(lista[i], area.querySelector(".jogo-palco"), ok => {
                const ret = area.querySelector(".jogo-retorno");
                if (ok) { if (!errouNesta) acertosDePrimeira++; ret.className = "jogo-retorno ok"; ret.textContent = "⭐ Muito bem!"; fala("Muito bem!"); i++; setTimeout(prox, 900); }
                else { errouNesta = true; ret.className = "jogo-retorno quase"; ret.textContent = "💡 Quase! Tente de novo, sem pressa."; }
            });
        };
        prox();
    }

    /* ---------- Memória (figura ↔ palavra) ---------- */
    function memoria(area, pares, aoFim) {
        const cartas = mistura(pares.flatMap((p, k) => [{ k, t: p[0], fig: true }, { k, t: p[1] }]), pares.length);
        let abertas = [], achados = new Set(), jogadas = 0;
        area.innerHTML = `<p class="jogo-rodada">Encontre os pares: figura e palavra.</p><div class="jogo-memoria">${cartas.map((c, i) => `<button type="button" class="mem-carta" data-i="${i}" aria-label="Carta ${i + 1}, virada para baixo"><span class="mem-frente ${c.fig ? "fig" : ""}">${e(c.t)}</span><span class="mem-verso" aria-hidden="true">❓</span></button>`).join("")}</div><p class="jogo-retorno" aria-live="polite"></p>`;
        const ret = area.querySelector(".jogo-retorno");
        area.querySelector(".jogo-memoria").addEventListener("click", ev => {
            const b = ev.target.closest(".mem-carta"); if (!b) return;
            const i = Number(b.dataset.i);
            if (achados.has(cartas[i].k) || abertas.includes(i) || abertas.length === 2) return;
            abertas.push(i); b.classList.add("aberta"); b.setAttribute("aria-label", cartas[i].t);
            if (abertas.length < 2) return;
            jogadas++;
            const [a, c] = abertas;
            if (cartas[a].k === cartas[c].k) {
                achados.add(cartas[a].k);
                area.querySelectorAll(`.mem-carta`).forEach(x => { if (cartas[Number(x.dataset.i)].k === cartas[a].k) x.classList.add("achada"); });
                ret.className = "jogo-retorno ok"; ret.textContent = `⭐ Par encontrado: ${cartas[a].fig ? cartas[a].t + " " + cartas[c].t : cartas[c].t + " " + cartas[a].t}`;
                fala(cartas[a].fig ? cartas[c].t : cartas[a].t);
                abertas = [];
                if (achados.size === pares.length) setTimeout(() => aoFim(Math.max(0, pares.length * 2 - jogadas + pares.length), pares.length * 2), 700);
            } else {
                ret.className = "jogo-retorno quase"; ret.textContent = "Não é par. Olhe bem e tente de novo 🙂";
                setTimeout(() => { abertas.forEach(k => { const x = area.querySelector(`.mem-carta[data-i="${k}"]`); x.classList.remove("aberta"); x.setAttribute("aria-label", `Carta ${k + 1}, virada para baixo`); }); abertas = []; }, 1100);
            }
        });
    }

    /* ---------- Sequência por toque (ordem) ---------- */
    function montarOrdem(itens, palco, responder, rotulo) {
        const embaralhados = mistura(itens, itens.length + 1);
        let ordem = [];
        palco.innerHTML = `<p class="jogo-pergunta">${e(rotulo)}</p><div class="jogo-cartoes">${embaralhados.map(t => `<button type="button" class="jogo-cartao" data-t="${e(t)}"><span class="pos"></span>${e(t)}</button>`).join("")}</div>
            <div class="botoes-linha"><button type="button" class="btn-mini jogo-limpar">↩ Recomeçar a ordem</button></div>`;
        const pintar = () => palco.querySelectorAll(".jogo-cartao").forEach(b => { const k = ordem.indexOf(b.dataset.t); b.querySelector(".pos").textContent = k >= 0 ? k + 1 + "º" : ""; b.classList.toggle("marcado", k >= 0); });
        palco.addEventListener("click", ev => {
            if (ev.target.closest(".jogo-limpar")) { ordem = []; pintar(); return; }
            const b = ev.target.closest(".jogo-cartao"); if (!b) return;
            const t = b.dataset.t; ordem = ordem.includes(t) ? ordem.filter(x => x !== t) : [...ordem, t]; pintar();
            if (ordem.length === itens.length) { const ok = ordem.every((x, i) => x === itens[i]); responder(ok); if (!ok) setTimeout(() => { ordem = []; pintar(); }, 1200); }
        });
    }

    /* ---------- Os jogos de cada matéria ---------- */
    const JOGOS = {
        matematica: { nome: "Pizzaria das frações", icone: "🍕", desc: "Pinte as fatias para montar a fração pedida.", jogar(area, fim) {
            const lista = [[1, 2], [3, 4], [5, 8], [2, 3], [4, 6]];
            rodadas(area, lista, ([n, d], palco, responder) => {
                const pint = new Array(d).fill(null);
                const desenhar = () => { palco.querySelector(".jogo-pizza").innerHTML = Interativo.pizzaSVG(d, pint, true); palco.querySelector(".jogo-conta").textContent = `Você pintou ${pint.filter(Boolean).length} de ${d} fatias`; };
                palco.innerHTML = `<p class="jogo-pergunta">Monte a fração <strong class="jogo-fracao"><sup>${n}</sup>⁄<sub>${d}</sub></strong>: pinte ${n} ${n === 1 ? "fatia" : "fatias"} de ${d}.</p><div class="jogo-pizza"></div><p class="jogo-conta" aria-live="polite"></p><button type="button" class="btn jogo-pronto">✅ Pronto!</button>`;
                const pintar = i => { pint[i] = pint[i] ? null : "vermelho"; desenhar(); const f = palco.querySelector(`.int-fatia[data-i="${i}"]`); if (f) f.focus(); };
                palco.addEventListener("click", ev => { const f = ev.target.closest(".int-fatia"); if (f) pintar(Number(f.dataset.i)); if (ev.target.closest(".jogo-pronto")) responder(pint.filter(Boolean).length === n); });
                palco.addEventListener("keydown", ev => { const f = ev.target.closest(".int-fatia"); if (f && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); pintar(Number(f.dataset.i)); } });
                desenhar();
            }, fim);
        } },
        portugues: { nome: "Monte a palavra", icone: "🔤", desc: "Toque nas sílabas na ordem certa para formar a palavra da figura.", jogar(area, fim) {
            const lista = [["🐱", ["GA", "TO"]], ["🍌", ["BA", "NA", "NA"]], ["🚗", ["CAR", "RO"]], ["🦋", ["BOR", "BO", "LE", "TA"]], ["🌙", ["LU", "A"]]];
            rodadas(area, lista, ([fig, sil], palco, responder) => {
                let feita = [];
                const extras = ["MA", "PE", "LI"].filter(x => !sil.includes(x)).slice(0, 2);
                const opcoes = mistura([...sil, ...extras], sil.length + 2);
                palco.innerHTML = `<div class="jogo-figura" aria-hidden="true">${fig}</div><p class="jogo-pergunta">Que palavra é esta? Toque nas sílabas.</p>
                    <div class="jogo-vagas" aria-live="polite"></div>
                    <div class="jogo-cartoes">${opcoes.map((s, i) => `<button type="button" class="jogo-cartao silaba" data-i="${i}">${s}</button>`).join("")}</div>
                    <div class="botoes-linha"><button type="button" class="btn-mini jogo-desfazer">↩ Desfazer</button></div>`;
                const pintar = () => { palco.querySelector(".jogo-vagas").innerHTML = sil.map((_, k) => `<span class="int-vaga ${feita[k] !== undefined ? "cheia" : ""}">${feita[k] !== undefined ? opcoes[feita[k]] : "_"}</span>`).join(""); palco.querySelectorAll(".silaba").forEach(b => { b.disabled = feita.includes(Number(b.dataset.i)); }); };
                palco.addEventListener("click", ev => {
                    if (ev.target.closest(".jogo-desfazer")) { feita.pop(); pintar(); return; }
                    const b = ev.target.closest(".silaba"); if (!b || feita.length >= sil.length) return;
                    feita.push(Number(b.dataset.i)); pintar(); fala(opcoes[Number(b.dataset.i)].toLowerCase());
                    if (feita.length === sil.length) { const ok = feita.map(k => opcoes[k]).join("") === sil.join(""); responder(ok); if (ok) fala(sil.join("").toLowerCase()); else setTimeout(() => { feita = []; pintar(); }, 1200); }
                });
                pintar();
            }, fim);
        } },
        ciencias: { nome: "Memória da natureza", icone: "🔬", desc: "Encontre os pares de figura e palavra: sentidos e ciclo da água.", jogar(area, fim) {
            memoria(area, [["👁️", "visão"], ["👂", "audição"], ["👃", "olfato"], ["☀️", "evaporação"], ["☁️", "condensação"], ["🌧️", "precipitação"]], fim);
        } },
        historia: { nome: "Linha do tempo", icone: "⏳", desc: "Coloque os acontecimentos na ordem em que aconteceram.", jogar(area, fim) {
            const lista = [
                ["👶 Bebê", "🧒 Criança", "🧑 Adolescente", "🧓 Idoso"],
                ["🌱 Semente", "🌿 Broto", "🌳 Árvore", "🍎 Fruto"],
                ["1500 • Portugueses chegam", "1822 • Independência", "1888 • Lei Áurea", "1960 • Inauguração de Brasília"]
            ];
            rodadas(area, lista, (itens, palco, responder) => montarOrdem(itens, palco, responder, "Toque do mais antigo para o mais novo:"), fim);
        } },
        geografia: { nome: "Toque na região", icone: "🗺️", desc: "Toque na região do Brasil que o jogo pedir.", jogar(area, fim) {
            const REG = [
                ["Norte", "20,40 150,30 175,60 165,120 110,135 60,130 20,95", "#22a06b", [85, 85]],
                ["Nordeste", "175,60 230,75 280,110 265,165 215,175 170,150 165,120", "#f08c2e", [222, 122]],
                ["Centro-Oeste", "110,135 165,120 170,150 190,180 175,225 120,215 105,170", "#e0a21b", [145, 178]],
                ["Sudeste", "190,180 215,175 250,190 235,230 195,250 175,225", "#3b82f6", [212, 212]],
                ["Sul", "120,215 175,225 195,250 165,290 130,280 125,245", "#8b5cf6", [152, 258]]
            ];
            const achadas = new Set();
            const ordem = mistura(REG.map(r => r[0]), 5);
            rodadas(area, ordem, (alvo, palco, responder) => {
                palco.innerHTML = `<p class="jogo-pergunta">Toque na região <strong>${alvo}</strong>.</p>
                    <svg class="jogo-mapa" viewBox="0 0 300 300" role="group" aria-label="Mapa simples do Brasil com 5 regiões">
                    ${REG.map(([n, pts, cor, [x, y]]) => `<polygon class="regiao ${achadas.has(n) ? "achada" : ""}" data-n="${n}" points="${pts}" fill="${achadas.has(n) ? cor : "#e8ecf7"}" stroke="#4a5170" stroke-width="2" tabindex="0" role="button" aria-label="Região ${achadas.has(n) ? n : "sem nome"}"/>${achadas.has(n) ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="700" fill="#1f2340" pointer-events="none">${n}</text>` : ""}`).join("")}
                    </svg>`;
                const tocar = el => { const ok = el.dataset.n === alvo; if (ok) { achadas.add(alvo); el.setAttribute("fill", REG.find(r => r[0] === alvo)[2]); } else { el.classList.add("errada"); setTimeout(() => el.classList.remove("errada"), 700); } responder(ok); };
                palco.addEventListener("click", ev => { const r = ev.target.closest(".regiao"); if (r) tocar(r); });
                palco.addEventListener("keydown", ev => { const r = ev.target.closest(".regiao"); if (r && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); tocar(r); } });
            }, fim);
        } },
        ingles: { nome: "Memory game", icone: "🇬🇧", desc: "Find the pairs: picture and word in English.", jogar(area, fim) {
            memoria(area, [["🍎", "apple"], ["🐶", "dog"], ["🐱", "cat"], ["☀️", "sun"], ["📘", "book"], ["🍌", "banana"]], fim);
        } },
        artes: { nome: "Misture as cores", icone: "🎨", desc: "Escolha duas tintas para criar a cor pedida.", jogar(area, fim) {
            const TINTA = { vermelho: "#e74c3c", amarelo: "#f5c518", azul: "#3b82f6", branco: "#ffffff" };
            const lista = [["laranja", "#f08c2e", ["vermelho", "amarelo"]], ["verde", "#22a06b", ["azul", "amarelo"]], ["roxo", "#8b5cf6", ["vermelho", "azul"]], ["rosa", "#ec6fa8", ["vermelho", "branco"]]];
            rodadas(area, lista, ([nome, hex, certo], palco, responder) => {
                let sel = [];
                palco.innerHTML = `<p class="jogo-pergunta">Como fazer <strong>${nome}</strong>? Toque em 2 tintas.</p>
                    <div class="jogo-mistura"><span class="balde" style="--c:${hex}" aria-hidden="true"></span><span class="mais">=</span><span class="balde resultado" aria-live="polite">?</span></div>
                    <div class="jogo-cartoes">${Object.keys(TINTA).map(t => `<button type="button" class="jogo-cartao tinta" data-t="${t}" style="--c:${TINTA[t]}"><span class="bolinha"></span>${t}</button>`).join("")}</div>`;
                palco.addEventListener("click", ev => {
                    const b = ev.target.closest(".tinta"); if (!b) return;
                    const t = b.dataset.t; sel = sel.includes(t) ? sel.filter(x => x !== t) : [...sel, t].slice(-2);
                    palco.querySelectorAll(".tinta").forEach(x => x.classList.toggle("marcado", sel.includes(x.dataset.t)));
                    const r = palco.querySelector(".resultado");
                    if (sel.length === 2) {
                        const ok = certo.every(c => sel.includes(c));
                        r.style.setProperty("--c", ok ? hex : "#8d7f74"); r.textContent = ok ? "" : "?";
                        responder(ok);
                        if (!ok) setTimeout(() => { sel = []; palco.querySelectorAll(".tinta").forEach(x => x.classList.remove("marcado")); r.style.removeProperty("--c"); }, 1200);
                    }
                });
            }, fim);
        } }
    };

    function montar(host) {
        const slug = host.dataset.jogo, J = JOGOS[slug];
        if (!J) return;
        const liberado = liberados().includes(slug);
        host.innerHTML = `<div class="jogo-cabeca"><span class="jogo-icone" aria-hidden="true">${J.icone}</span><div><h3>${e(J.nome)}</h3><p>${e(J.desc)}</p></div></div>
            <div class="jogo-trancado" ${liberado ? "hidden" : ""}><span aria-hidden="true">🔒</span><p>Termine os exercícios de uma aula desta página (toque em <strong>Conferir</strong> com tudo respondido) para liberar o mini-jogo.</p></div>
            <div class="jogo-liberado" ${liberado ? "" : "hidden"}>
                <div class="botoes-linha"><button type="button" class="btn jogo-comecar">▶ Jogar</button>
                <label class="jogo-relogio-opcao"><input type="checkbox" class="jogo-com-relogio"> ⏱️ Mostrar cronômetro calmo (sem limite)</label></div>
                <p class="jogo-relogio" hidden aria-live="off"></p>
                <div class="jogo-area"></div>
            </div>`;
        let t0 = 0, rel = null;
        const relogio = host.querySelector(".jogo-relogio");
        host.querySelector(".jogo-comecar").addEventListener("click", () => {
            const area = host.querySelector(".jogo-area");
            t0 = Date.now(); clearInterval(rel);
            if (host.querySelector(".jogo-com-relogio").checked) { relogio.hidden = false; rel = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); relogio.textContent = `⏱️ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} • sem pressa, não tem limite`; }, 1000); }
            else relogio.hidden = true;
            host.querySelector(".jogo-comecar").textContent = "🔄 Jogar de novo";
            J.jogar(area, async (acertos, total) => {
                clearInterval(rel);
                area.innerHTML = `<div class="jogo-fim"><div class="int-estrelas"><span class="acesa" style="--i:1">★</span><span class="acesa" style="--i:2">★</span><span class="acesa" style="--i:3">★</span></div><h3>Você completou o jogo! 🎉</h3><p>Muito bem! Jogar de novo ajuda a lembrar.</p></div>`;
                fala("Parabéns! Você completou o jogo.");
                if (typeof Engaja !== "undefined") {
                    const primeira = await Engaja.ganhar("jogo:" + slug, 15, "Mini-jogo: " + J.nome, { tipo: "jogo", convite: "Jogo completo! 🎮" });
                    if (!primeira) await Engaja.ganhar("jogo:" + slug + ":" + Engaja.dia(), 5, "Mini-jogo: " + J.nome, { tipo: "jogo", convite: "Jogo completo! 🎮" });
                }
            });
        });
        const abrir = () => { host.querySelector(".jogo-trancado").hidden = true; host.querySelector(".jogo-liberado").hidden = false; };
        document.addEventListener("exercicios-concluidos", ev => {
            if (ev.detail.materia !== slug) return;
            const novo = !liberados().includes(slug);
            liberar(slug); abrir();
            if (novo) {
                const aviso = document.createElement("div");
                aviso.className = "jogo-aviso"; aviso.setAttribute("role", "status");
                aviso.innerHTML = `🎮 Mini-jogo liberado: <strong>${e(J.nome)}</strong>! <a href="#minijogo">Jogar agora</a>`;
                ev.target && document.querySelector(`[data-ex="${ev.detail.ex}"]`)?.after(aviso);
            }
        });
    }

    function iniciar() { document.querySelectorAll("[data-jogo]").forEach(montar); }
    return { iniciar, JOGOS, liberar, liberados };
})();
