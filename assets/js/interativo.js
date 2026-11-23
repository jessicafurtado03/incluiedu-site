/* =====================================================
   INCLUIEDU • ATIVIDADES INTERATIVAS
   Transforma lacunas e escolhas em campos de tocar:
   frações, números, pizza para pintar, cartões de letras,
   escolhas grandes (A/B/C/D, imagens), ordenar, separar
   em caixas, ligar pares e colorir. Conferir com retorno
   gentil, estrelas e "tentar de novo".
   ===================================================== */

const Interativo = (function () {
    const CORES = { vermelho: "#e74c3c", azul: "#3b82f6", amarelo: "#f5c518", verde: "#22a06b", laranja: "#f08c2e", roxo: "#8b5cf6", rosa: "#ec6fa8", marrom: "#9a6b4b" };
    const NOMES_DEN = { 2: "meios", 3: "terços", 4: "quartos", 5: "quintos", 6: "sextos", 7: "sétimos", 8: "oitavos", 9: "nonos", 10: "décimos", 12: "doze avos" };
    const e = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "").replace(/\s+/g, " ").trim();
    let seq = 0;
    const uid = p => p + "-" + (++seq);

    /* Embaralha de forma fixa (mesma ordem sempre) */
    function embaralhar(lista, semente = 7) {
        const a = lista.map((v, i) => ({ v, k: Math.sin(i * 9301 + semente * 49297) }));
        a.sort((x, y) => x.k - y.k);
        const r = a.map(x => x.v);
        if (r.every((v, i) => v === lista[i]) && r.length > 1) r.push(r.shift());
        return r;
    }

    /* ---------- TEXTO PARA FALA ---------- */
    function paraFala(texto) {
        return String(texto || "")
            .replace(/_{2,}\s*\/\s*(\d+)/g, (m, d) => " quantos " + (NOMES_DEN[d] || d + " avos") + " ")
            .replace(/(\d+)\s*\/\s*(\d+)/g, (m, n, d) => n + " " + (NOMES_DEN[d] || d + " avos"))
            .replace(/([a-zà-ú]+)_{2,}([a-zà-ú]+)/gi, "$1, espaço, $2")
            .replace(/_{2,}/g, " espaço para resposta ")
            .replace(/R\$\s?(\d+),00/g, "$1 reais")
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}]/gu, " ")
            .replace(/[✓✔→]/g, " ")
            .replace(/\s+/g, " ").trim();
    }

    /* ---------- DETECÇÃO: frase da etapa -> campo interativo ---------- */
    const SIM_NAO = { t: "escolha", opcoes: ["👍 Sim", "👎 Não", "🤔 Mais ou menos"], livre: true };
    const REGRAS = [
        { re: /dividida em (\d+) partes/, w: (m, c) => { c.partes = Number(m[1]); return { t: "pizzaVer", partes: c.partes }; } },
        { re: /_{2,}\s*\/\s*(\d+)/, w: (m, c, t) => { const n = (t.match(/comeu (\d+) parte/) || [])[1]; const quem = (t.match(/^(?:etapa \d+: )?(\w+) comeu/) || [])[1]; if (quem && n) c.comeu[quem] = Number(n); return { t: "fracao", den: Number(m[1]), certo: n ? Number(n) : null }; } },
        { re: /conte quantas partes sobraram/, w: (m, c) => { const tot = c.partes || 8; const com = Object.values(c.comeu).reduce((s, v) => s + v, 0); return { t: "numero", max: tot, certo: com ? tot - com : null, sufixo: "partes" }; } },
        { re: /pinte a pizza.*vermelho\s*=\s*(\w+).*azul\s*=\s*(\w+)/, w: (m, c) => ({ t: "pizza", partes: c.partes || 8, cores: [{ nome: "vermelho", quem: cap(m[1]), certo: c.comeu[m[1]] ?? null }, { nome: "azul", quem: cap(m[2]), certo: c.comeu[m[2]] ?? null }] }) },
        { re: /pinte (\d+) partes/, w: (m, c) => { c.comeu.pintadas = Number(m[1]); return { t: "pizza", partes: c.partes || 8, cores: [{ nome: "vermelho", quem: "Pintar", certo: Number(m[1]) }] }; } },
        { re: /fracao que sobrou/, w: (m, c) => { const tot = c.partes || 8; const com = Object.values(c.comeu).reduce((s, v) => s + v, 0); return { t: "fracao", den: tot, certo: com ? tot - com : null, explica: com ? `Sobraram ${tot - com} de ${tot} partes: ${tot - com}/${tot}.` : "" }; } },
        { re: /pinte as partes comidas/, w: (m, c) => ({ t: "pizza", partes: c.partes || 8, cores: [{ nome: "vermelho", quem: "Comidas", certo: Object.values(c.comeu).reduce((s, v) => s + v, 0) || null }] }) },
        // Português
        { re: /circule os personagens|quem sao os personagens/, w: () => ({ t: "escolha", opcoes: ["🦗 cigarra", "🐜 formiga", "☀️ sol", "🐘 elefante"], certos: [0, 1], explica: "Os personagens são a cigarra e a formiga. O sol faz parte do cenário." }) },
        { re: /cigarra ficou sem _{2,}|qual e o problema da historia/, w: () => ({ t: "escolha", opcoes: ["🍎 comida", "🎈 brinquedo", "👟 sapato"], certo: 0, explica: "A cigarra passou o verão cantando e ficou sem comida no inverno." }) },
        { re: /moral/, w: () => ({ t: "escolha", opcoes: ["🐜 É bom se preparar: primeiro o dever, depois o lazer.", "🎵 Cantar é proibido."], certo: 0, explica: "A moral é que devemos nos preparar para o futuro." }) },
        { re: /concorda com a formiga/, w: () => SIM_NAO },
        { re: /escreva o nome depois de .?para/, w: () => ({ t: "texto", prefixo: "Para:", curto: true }) },
        { re: /vamos brincar de _{2,}/, w: () => ({ t: "escolha", opcoes: ["⚽ futebol", "🪢 pular corda", "🙈 esconde-esconde", "🧩 quebra-cabeça"], livre: true }) },
        { re: /escreva seu nome no final/, w: () => ({ t: "texto", prefixo: "Assinatura:", curto: true }) },
        { re: /ca_{2,}o \(r ou rr\?\)/, w: () => ({ t: "letras", opcoes: ["R", "RR"], palavras: [{ emoji: "🚗", antes: "ca", depois: "o", certo: "RR" }], explica: "CARRO tem som forte entre vogais: usamos RR." }) },
        { re: /letra certa para cada palavra/, w: () => ({ t: "letras", opcoes: ["R", "RR"], palavras: [{ emoji: "🌍", antes: "te", depois: "a", certo: "RR" }, { emoji: "🍐", antes: "pe", depois: "a", certo: "R" }, { emoji: "🦜", antes: "a", depois: "ara", certo: "R" }, { emoji: "🐶", antes: "cacho", depois: "o", certo: "RR" }], explica: "Som forte entre vogais: RR (terra, cachorro). Som fraco: R (pera, arara)." }) },
        // Matemática
        { re: /separe r\$ 12/, w: () => ({ t: "escolha", opcoes: ["💵 R$ 10 + R$ 2", "💵 R$ 5 + R$ 5", "💵 R$ 20 + R$ 2"], certo: 0, explica: "10 + 2 = 12 reais." }) },
        { re: /separe r\$ 3/, w: () => ({ t: "escolha", opcoes: ["🪙 R$ 2 + R$ 1", "🪙 R$ 2 + R$ 2", "🪙 R$ 5"], certo: 0, explica: "2 + 1 = 3 reais." }) },
        { re: /dinheiro que sobrou|troco/, w: () => ({ t: "numero", max: 10, certo: 5, prefixo: "R$", explica: "20 − 12 − 3 = 5. O troco é R$ 5,00." }) },
        { re: /barra mais alta/, w: () => ({ t: "escolha", grafico: true, opcoes: ["🍌 banana", "🍎 maçã", "🍇 uva", "🍊 laranja"], certo: 0, explica: "A banana tem a barra mais alta: 8 votos." }) },
        { re: /barra mais baixa/, w: () => ({ t: "escolha", grafico: true, opcoes: ["🍌 banana", "🍎 maçã", "🍇 uva", "🍊 laranja"], certo: 2, explica: "A uva tem a barra mais baixa: 3 votos." }) },
        { re: /some os numeros das barras/, w: () => ({ t: "numero", entrada: true, max: 40, certo: 22, explica: "8 + 5 + 3 + 6 = 22." }) },
        // Ciências
        { re: /figuras na ordem certa do ciclo|monte o ciclo|desenhe o ciclo/, w: () => ({ t: "ordenar", itens: ["☀️ Evaporação", "☁️ Condensação", "🌧️ Precipitação", "🏞️ A água volta para rios e mares"], explica: "O sol evapora a água, o vapor forma nuvens, a chuva cai e a água volta para os rios." }) },
        { re: /explique com suas palavras|\. explique\.?$/, w: () => ({ t: "texto", ditado: true }) },
        { re: /toque em objetos .*aspero/, w: () => ({ t: "caixas", caixas: ["🪨 ÁSPERO", "🪞 LISO"], itens: [["🧽 lixa", 0], ["🪟 vidro", 1], ["🌰 casca de árvore", 0], ["🎀 fita de cetim", 1]], explica: "Lixa e casca são ásperas; vidro e cetim são lisos." }) },
        { re: /ligue a figura do orgao/, w: () => ({ t: "ligar", pares: [["👁️ olhos", "🌈 ver o arco-íris"], ["👂 orelhas", "🎵 ouvir música"], ["👃 nariz", "🌸 cheirar a flor"], ["👅 língua", "🍋 provar o limão"], ["✋ pele", "🧸 sentir o ursinho macio"]], explica: "Cada órgão do sentido percebe uma coisa diferente." }) },
        { re: /qual sentido voce mais gostou/, w: () => ({ t: "escolha", opcoes: ["👁️ visão", "👂 audição", "👃 olfato", "👅 paladar", "✋ tato"], livre: true }) },
        { re: /observe 3 feijoes/, w: () => ({ t: "escolha", opcoes: ["💧☀️ com água e luz", "🚫💧 sem água", "🌑 sem luz"], certo: 0, pergunta: "Qual feijão vai crescer melhor?", explica: "A planta precisa de água e de luz para crescer." }) },
        { re: /marque.*no que a planta precisa/, w: () => ({ t: "escolha", opcoes: ["💧 água", "☀️ luz", "🟫 solo", "🍫 chocolate"], certos: [0, 1, 2], explica: "Planta precisa de água, luz e solo. Chocolate não!" }) },
        // História
        { re: /coloque as fotos em ordem: bebe/, w: () => ({ t: "ordenar", itens: ["👶 bebê", "🧒 criança pequena", "🎒 primeiro dia na escola", "😀 hoje"], explica: "Uma linha do tempo vai do mais antigo para o mais recente." }) },
        { re: /uma palavra para cada foto/, w: () => ({ t: "texto", ditado: true, curto: true }) },
        { re: /escolha 3 imagens que mostram contribuicoes indigenas/, w: () => ({ t: "escolha", opcoes: ["🥔 mandioca", "🛏️ rede de dormir", "🍿 pipoca", "📱 celular", "🚗 carro"], certos: [0, 1, 2], explica: "Mandioca, rede e a palavra pipoca vêm dos povos indígenas." }) },
        { re: /inaugurada em 21 de abril de 1960/, w: () => ({ t: "escolha", opcoes: ["1500", "1960", "2000"], certo: 1, pergunta: "Em que ano Brasília foi inaugurada?", explica: "Brasília foi inaugurada em 1960." }) },
        { re: /presidente era juscelino/, w: () => ({ t: "escolha", opcoes: ["👔 Juscelino Kubitschek", "👑 Dom Pedro II", "⚖️ Tiradentes"], certo: 0, pergunta: "Quem era o presidente?", explica: "O presidente era Juscelino Kubitschek, o JK." }) },
        { re: /capital saiu do rio de janeiro/, w: () => ({ t: "escolha", opcoes: ["🏖️ Rio de Janeiro", "🏙️ São Paulo", "⛪ Salvador"], certo: 0, pergunta: "De qual cidade a capital saiu?", explica: "A capital saiu do Rio de Janeiro." }) },
        { re: /levar a capital para o centro/, w: () => ({ t: "escolha", opcoes: ["🗺️ Para ocupar e desenvolver o interior do país", "🌊 Porque o mar ia subir", "❄️ Por causa do frio"], certo: 0, explica: "A ideia era levar o desenvolvimento para o interior do Brasil." }) },
        // Geografia
        { re: /pinte o norte de verde/, w: () => ({ t: "cores", paleta: ["verde", "amarelo", "azul", "laranja", "roxo"], itens: [["Norte", "verde"], ["Nordeste", null], ["Centro-Oeste ⭐", "amarelo"], ["Sudeste", null], ["Sul", null]], explica: "Norte de verde e Centro-Oeste de amarelo. As outras regiões, da cor que quiser!" }) },
        { re: /pinte o centro-oeste de amarelo/, w: () => ({ t: "escolha", opcoes: ["⭐ Centro-Oeste", "🌴 Nordeste", "❄️ Sul"], certo: 0, pergunta: "Em que região fica o DF?", explica: "O Distrito Federal fica no Centro-Oeste." }) },
        { re: /continue com nordeste, sudeste e sul/, w: () => ({ t: "numero", max: 6, certo: 5, pergunta: "Quantas regiões tem o Brasil?", sufixo: "regiões", explica: "São 5: Norte, Nordeste, Centro-Oeste, Sudeste e Sul." }) },
        { re: /brasilia fica no centro-oeste/, w: () => ({ t: "escolha", opcoes: ["👍 Sim", "👎 Não"], certo: 0, explica: "Sim! Brasília fica no Centro-Oeste." }) },
        { re: /cole as fotos em ordem em uma tira/, w: () => ({ t: "ordenar", itens: ["🏠 casa", "🥖 padaria", "🚦 semáforo", "🏫 escola"], explica: "O caminho começa em casa e termina na escola." }) },
        { re: /separe em duas caixas/, w: () => ({ t: "caixas", caixas: ["🌳 NATURAL", "🏙️ MODIFICADA"], itens: [["🏞️ cachoeira", 0], ["🏙️ cidade", 1], ["🌋 vulcão", 0], ["🌉 ponte", 1], ["🏝️ praia deserta", 0], ["🛣️ estrada", 1]], explica: "Natural: sem mudanças feitas pelas pessoas. Modificada: com construções humanas." }) },
        { re: /explique uma escolha|conte o caminho|conte o que mais chamou|conte o que descobriu|grave um audio/, w: () => ({ t: "texto", ditado: true }) },
        // Inglês
        { re: /objeto red/, w: () => ({ t: "escolha", imagens: true, opcoes: ["🍓", "🫐", "🍌"], rotulos: ["morango", "mirtilo", "banana"], certo: 0, explica: "O morango é RED (vermelho)." }) },
        { re: /objeto blue/, w: () => ({ t: "escolha", imagens: true, opcoes: ["🍎", "🫐", "🌽"], rotulos: ["maçã", "mirtilo", "milho"], certo: 1, explica: "O mirtilo é BLUE (azul)." }) },
        { re: /red e vermelho\. escreva red/, w: () => ({ t: "escolha", opcoes: ["RED", "BLUE", "GREEN"], certo: 0, pergunta: "Toque na palavra RED.", explica: "RED = vermelho." }) },
        { re: /blue e azul\. escreva blue/, w: () => ({ t: "escolha", opcoes: ["YELLOW", "BLUE", "RED"], certo: 1, pergunta: "Toque na palavra BLUE.", explica: "BLUE = azul." }) },
        { re: /yellow e amarelo e green e verde/, w: () => ({ t: "escolha", opcoes: ["🟡 YELLOW", "🟢 GREEN"], certo: 0, pergunta: "Qual palavra é amarelo?", explica: "YELLOW = amarelo; GREEN = verde." }) },
        { re: /pinte (cada balao|os baloes)/, w: () => ({ t: "cores", paleta: ["vermelho", "azul", "amarelo", "verde"], rotuloPaleta: { vermelho: "RED", azul: "BLUE", amarelo: "YELLOW", verde: "GREEN" }, itens: [["🎈 RED", "vermelho"], ["🎈 BLUE", "azul"], ["🎈 YELLOW", "amarelo"], ["🎈 GREEN", "verde"]], explica: "RED vermelho, BLUE azul, YELLOW amarelo, GREEN verde." }) },
        { re: /cartao certo para completar o dialogo/, w: () => ({ t: "escolha", opcoes: ["😊 I'm fine, thank you!", "👋 Goodbye!", "🍎 Apple!"], certo: 0, pergunta: "— Hello! How are you? — ...", explica: "Para “How are you?” respondemos “I'm fine, thank you!”." }) },
        { re: /associe a figura a palavra/, w: () => ({ t: "ligar", pares: [["🍎", "apple"], ["🍊", "orange"], ["🍇", "grape"]], explica: "apple = maçã, orange = laranja, grape = uva." }) },
        { re: /jogo da memoria/, w: () => ({ t: "ligar", pares: [["🍌", "banana"], ["🍓", "strawberry"], ["🍉", "watermelon"]], explica: "strawberry = morango, watermelon = melancia." }) },
        // Artes
        { re: /abaporu.*o que voce ve|observe a obra ampliada/, w: () => ({ t: "escolha", opcoes: ["🌵 cacto", "☀️ sol", "🦶 pé enorme", "🚗 carro"], certos: [0, 1, 2], pergunta: "O que aparece no Abaporu?", explica: "O Abaporu tem um cacto, um sol e uma figura com pé enorme." }) },
        { re: /escolha (seu|o) material/, w: () => ({ t: "escolha", opcoes: ["✏️ lápis", "🎨 tinta", "✂️ colagem", "🟠 massinha"], livre: true }) },
        { re: /de um titulo/, w: () => ({ t: "texto", prefixo: "Título:", curto: true, ditado: true }) },
        { re: /monte sua sequencia com 4 cartas/, w: () => ({ t: "montar", cartas: ["👏 palma", "🦶 pé", "✋ pausa"], vagas: 4 }) },
        { re: /siga as cartas/, w: () => ({ t: "escolha", opcoes: ["👏 palma", "🦶 pé", "✋ pausa"], certo: 2, pergunta: "Qual carta quer dizer silêncio?", explica: "A pausa ✋ é o silêncio na música." }) },
        { re: /3 coisas de que voce gosta em voce/, w: () => ({ t: "escolha", opcoes: ["😊 sorriso", "👀 olhos", "💇 cabelo", "💛 jeito de ser", "🧠 inteligência", "🤝 ser amigo"], livre: true, multipla: true, minimo: 3 }) }
    ];
    function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

    function detectar(texto, ctx) {
        const t = norm(texto);
        for (const r of REGRAS) {
            const m = t.match(r.re);
            if (m) return r.w(m, ctx, t);
        }
        if (/_{2,}/.test(t)) return { t: "texto", curto: true };
        return null;
    }
    function contexto() { return { partes: 0, comeu: {} }; }
    /* Lista de etapas -> lista de campos */
    function deEtapas(linhas) {
        const ctx = contexto();
        return linhas.map(l => ({ p: l, w: detectar(l, ctx) }));
    }

    /* ---------- DESENHOS ---------- */
    function fatias(partes, cx, cy, r) {
        const lista = [];
        for (let i = 0; i < partes; i++) {
            const a0 = (i / partes) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / partes) * Math.PI * 2 - Math.PI / 2;
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            lista.push(`M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${partes === 1 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`);
        }
        return lista;
    }
    function grafico() {
        const d = [["🍌", 8], ["🍎", 5], ["🍇", 3], ["🍊", 6]];
        let s = `<svg class="int-grafico" viewBox="0 0 320 190" role="img" aria-label="Gráfico de barras: banana 8, maçã 5, uva 3, laranja 6">`;
        d.forEach(([f, v], i) => {
            const x = 30 + i * 72, h = v * 17;
            s += `<rect x="${x}" y="${160 - h}" width="48" height="${h}" rx="8" fill="${["#f5c518", "#e74c3c", "#8b5cf6", "#f08c2e"][i]}"/><text x="${x + 24}" y="${152 - h}" text-anchor="middle" font-size="16" font-weight="bold" fill="#26304a">${v}</text><text x="${x + 24}" y="184" text-anchor="middle" font-size="20">${f}</text>`;
        });
        return s + `<line x1="20" y1="160" x2="310" y2="160" stroke="#26304a" stroke-width="2"/></svg>`;
    }

    /* ---------- CAMPOS ---------- */
    const Campos = {};

    function chips(valores, rotulo, classe = "") {
        return `<div class="int-chips ${classe}" role="group" aria-label="${e(rotulo)}">${valores.map(v => `<button type="button" class="int-chip" data-v="${e(v)}" aria-pressed="false">${e(v)}</button>`).join("")}</div>`;
    }
    function selecionarUnico(raiz, alvo) {
        raiz.querySelectorAll(".int-chip").forEach(b => b.setAttribute("aria-pressed", b === alvo ? "true" : "false"));
    }

    Campos.fracao = (w, el) => {
        el.innerHTML = `<div class="int-fracao-linha">
            <div class="int-fracao" aria-live="polite"><span class="num">?</span><span class="barra-fr"></span><span class="den">${w.den}</span></div>
            ${chips(Array.from({ length: w.den + 1 }, (_, i) => i), "Escolha o número de cima da fração")}
        </div>`;
        let v = null;
        el.addEventListener("click", ev => { const b = ev.target.closest(".int-chip"); if (!b) return; v = Number(b.dataset.v); selecionarUnico(el, b); el.querySelector(".num").textContent = v; mudou(el); });
        return { valor: () => v, set: x => { v = x; if (x !== null) { el.querySelector(".num").textContent = x; selecionarUnico(el, el.querySelector(`.int-chip[data-v="${x}"]`)); } }, respondido: () => v !== null, certo: () => w.certo == null ? null : v === w.certo, resposta: () => `${w.certo}/${w.den}` };
    };

    Campos.numero = (w, el) => {
        if (w.entrada) {
            el.innerHTML = `<div class="int-numero-entrada">${w.prefixo ? `<span>${e(w.prefixo)}</span>` : ""}
                <button type="button" class="int-mais" data-d="-1" aria-label="Diminuir">−</button>
                <input type="number" inputmode="numeric" min="0" max="${w.max}" class="int-input-num" aria-label="${e(w.pergunta || "Sua resposta")}" placeholder="?">
                <button type="button" class="int-mais" data-d="1" aria-label="Aumentar">+</button>${w.sufixo ? `<span>${e(w.sufixo)}</span>` : ""}</div>`;
            const inp = el.querySelector("input");
            el.addEventListener("click", ev => { const b = ev.target.closest(".int-mais"); if (!b) return; inp.value = Math.max(0, (Number(inp.value) || 0) + Number(b.dataset.d)); mudou(el); });
            inp.addEventListener("input", () => mudou(el));
            return { valor: () => inp.value === "" ? null : Number(inp.value), set: x => { inp.value = x ?? ""; }, respondido: () => inp.value !== "", certo: () => w.certo == null ? null : Number(inp.value) === w.certo, resposta: () => String(w.certo) };
        }
        el.innerHTML = `<div class="int-numero">${w.prefixo ? `<span class="int-pref">${e(w.prefixo)}</span>` : ""}<output class="int-saida" aria-live="polite">?</output>${w.sufixo ? `<span class="int-pref">${e(w.sufixo)}</span>` : ""}</div>
            ${chips(Array.from({ length: (w.max || 10) + 1 }, (_, i) => i), w.pergunta || "Escolha o número")}`;
        let v = null;
        el.addEventListener("click", ev => { const b = ev.target.closest(".int-chip"); if (!b) return; v = Number(b.dataset.v); selecionarUnico(el, b); el.querySelector(".int-saida").textContent = v; mudou(el); });
        return { valor: () => v, set: x => { v = x; if (x !== null) { el.querySelector(".int-saida").textContent = x; selecionarUnico(el, el.querySelector(`.int-chip[data-v="${x}"]`)); } }, respondido: () => v !== null, certo: () => w.certo == null ? null : v === w.certo, resposta: () => (w.prefixo ? w.prefixo + " " : "") + w.certo + (w.sufixo ? " " + w.sufixo : "") };
    };

    function pizzaSVG(partes, pintadas, interativa) {
        const r = 110, c = 130;
        return `<svg class="int-pizza" viewBox="0 0 260 260" ${interativa ? `role="group" aria-label="Pizza com ${partes} fatias. Toque nas fatias para pintar."` : `role="img" aria-label="Pizza dividida em ${partes} partes"`}>
            <circle cx="${c}" cy="${c}" r="${r + 12}" fill="#e7b25b"/>
            ${fatias(partes, c, c, r).map((d, i) => `<path d="${d}" class="int-fatia" data-i="${i}" fill="${pintadas[i] ? CORES[pintadas[i]] : "#ffe08a"}" stroke="#c98a2b" stroke-width="3" ${interativa ? `tabindex="0" role="button" aria-label="Fatia ${i + 1}${pintadas[i] ? ", pintada de " + pintadas[i] : ""}"` : ""}/>`).join("")}
            <g pointer-events="none"><circle cx="100" cy="90" r="7" fill="#d9534f" opacity=".8"/><circle cx="165" cy="110" r="7" fill="#d9534f" opacity=".8"/><circle cx="120" cy="170" r="7" fill="#d9534f" opacity=".8"/><circle cx="175" cy="170" r="6" fill="#6b8e23" opacity=".8"/><circle cx="85" cy="140" r="6" fill="#6b8e23" opacity=".8"/></g>
        </svg>`;
    }
    Campos.pizzaVer = (w, el) => { el.innerHTML = `<div class="int-pizza-ver">${pizzaSVG(w.partes, [], false)}<p>${w.partes} partes iguais</p></div>`; return null; };

    Campos.pizza = (w, el) => {
        const pint = new Array(w.partes).fill(null);
        let cor = w.cores[0].nome;
        el.innerHTML = `<div class="int-pizza-area">
            <div class="int-paleta" role="radiogroup" aria-label="Escolha a cor">
                ${w.cores.map((c, i) => `<button type="button" class="int-cor" role="radio" aria-checked="${i === 0}" data-cor="${c.nome}" style="--c:${CORES[c.nome]}"><span class="bolinha"></span>${e(c.quem)} <small>(${c.nome})</small></button>`).join("")}
                <button type="button" class="int-cor" role="radio" aria-checked="false" data-cor="" style="--c:#ffe08a"><span class="bolinha"></span>Apagar</button>
            </div>
            <div class="int-pizza-svg"></div>
            <p class="int-contagem" aria-live="polite"></p>
        </div>`;
        const desenhar = () => {
            el.querySelector(".int-pizza-svg").innerHTML = pizzaSVG(w.partes, pint, true);
            el.querySelector(".int-contagem").textContent = w.cores.map(c => `${c.quem}: ${pint.filter(p => p === c.nome).length}`).join(" • ");
        };
        const pintar = i => { pint[i] = pint[i] === cor ? null : (cor || null); desenhar(); mudou(el); const f = el.querySelector(`.int-fatia[data-i="${i}"]`); if (f) f.focus(); };
        el.addEventListener("click", ev => {
            const c = ev.target.closest(".int-cor");
            if (c) { cor = c.dataset.cor; el.querySelectorAll(".int-cor").forEach(b => b.setAttribute("aria-checked", b === c ? "true" : "false")); return; }
            const f = ev.target.closest(".int-fatia"); if (f) pintar(Number(f.dataset.i));
        });
        el.addEventListener("keydown", ev => { const f = ev.target.closest(".int-fatia"); if (f && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); pintar(Number(f.dataset.i)); } });
        desenhar();
        return {
            valor: () => pint.slice(), set: x => { if (Array.isArray(x)) { x.forEach((v, i) => pint[i] = v); desenhar(); } },
            respondido: () => pint.some(Boolean),
            certo: () => w.cores.every(c => c.certo == null) ? null : w.cores.every(c => c.certo == null || pint.filter(p => p === c.nome).length === c.certo),
            resposta: () => w.cores.map(c => `${c.certo} fatias de ${c.nome} (${c.quem})`).join(" e ")
        };
    };

    Campos.escolha = (w, el) => {
        const multipla = w.multipla || Array.isArray(w.certos);
        const sel = new Set();
        el.innerHTML = `${w.grafico ? grafico() : ""}
            ${multipla ? `<p class="int-instrucao">Toque em ${w.minimo ? "pelo menos " + w.minimo : "todas as certas"}.</p>` : ""}
            <div class="int-opcoes ${w.imagens ? "imagens" : ""} ${w.opcoes.length > 3 && !w.imagens ? "grade" : ""}" role="group" aria-label="${e(w.pergunta || "Opções")}">
            ${w.opcoes.map((o, i) => `<button type="button" class="int-opcao" data-i="${i}" aria-pressed="false">${w.letras !== false && !w.imagens ? `<span class="int-letra">${"ABCDEFGH"[i]}</span>` : ""}<span class="int-txt">${e(o)}</span>${w.rotulos ? `<small>${e(w.rotulos[i])}</small>` : ""}</button>`).join("")}
            </div>`;
        el.addEventListener("click", ev => {
            const b = ev.target.closest(".int-opcao"); if (!b || b.disabled) return;
            const i = Number(b.dataset.i);
            if (multipla) { sel.has(i) ? sel.delete(i) : sel.add(i); } else { sel.clear(); sel.add(i); }
            el.querySelectorAll(".int-opcao").forEach(x => x.setAttribute("aria-pressed", sel.has(Number(x.dataset.i)) ? "true" : "false"));
            mudou(el);
        });
        return {
            valor: () => [...sel], set: x => { (x || []).forEach(i => sel.add(i)); el.querySelectorAll(".int-opcao").forEach(b => b.setAttribute("aria-pressed", sel.has(Number(b.dataset.i)) ? "true" : "false")); },
            respondido: () => sel.size >= (w.minimo || 1),
            certo: () => {
                if (w.livre) return null;
                if (Array.isArray(w.certos)) return sel.size === w.certos.length && w.certos.every(i => sel.has(i));
                return w.certo == null ? null : sel.has(w.certo) && sel.size === 1;
            },
            marcar: () => el.querySelectorAll(".int-opcao").forEach(b => { const i = Number(b.dataset.i); const ok = Array.isArray(w.certos) ? w.certos.includes(i) : i === w.certo; if (ok) b.classList.add("int-era-certa"); }),
            resposta: () => Array.isArray(w.certos) ? w.certos.map(i => w.opcoes[i]).join(", ") : w.opcoes[w.certo]
        };
    };

    Campos.letras = (w, el) => {
        const resp = w.palavras.map(() => null);
        let ativa = 0;
        el.innerHTML = `<div class="int-palavras">${w.palavras.map((p, i) => `
                <button type="button" class="int-palavra" data-i="${i}" aria-label="Palavra ${i + 1}: ${e(p.antes)} espaço ${e(p.depois)}"><span class="emoji" aria-hidden="true">${p.emoji}</span><span class="pal">${e(p.antes.toUpperCase())}<span class="vaga">?</span>${e(p.depois.toUpperCase())}</span></button>`).join("")}</div>
            <p class="int-instrucao">Toque na palavra e depois na letra certa:</p>
            <div class="int-cartas">${w.opcoes.map(o => `<button type="button" class="int-carta" data-v="${e(o)}" draggable="true">${e(o)}</button>`).join("")}</div>`;
        const pintar = () => el.querySelectorAll(".int-palavra").forEach((b, i) => { b.classList.toggle("ativa", i === ativa); b.querySelector(".vaga").textContent = resp[i] || "?"; b.classList.toggle("preenchida", !!resp[i]); });
        const colocar = (v, i = ativa) => { resp[i] = v; const prox = resp.findIndex(r => !r); ativa = prox >= 0 ? prox : i; pintar(); mudou(el); };
        el.addEventListener("click", ev => {
            const p = ev.target.closest(".int-palavra"); if (p) { ativa = Number(p.dataset.i); pintar(); return; }
            const c = ev.target.closest(".int-carta"); if (c) colocar(c.dataset.v);
        });
        el.addEventListener("dragstart", ev => { const c = ev.target.closest(".int-carta"); if (c) ev.dataTransfer.setData("text/plain", c.dataset.v); });
        el.addEventListener("dragover", ev => { if (ev.target.closest(".int-palavra")) ev.preventDefault(); });
        el.addEventListener("drop", ev => { const p = ev.target.closest(".int-palavra"); if (p) { ev.preventDefault(); colocar(ev.dataTransfer.getData("text/plain"), Number(p.dataset.i)); } });
        pintar();
        return { valor: () => resp.slice(), set: x => { (x || []).forEach((v, i) => resp[i] = v); pintar(); }, respondido: () => resp.every(Boolean), certo: () => resp.every((r, i) => r === w.palavras[i].certo), resposta: () => w.palavras.map(p => (p.antes + p.certo + p.depois).toUpperCase().replace(/(R+)/, "$1")).join(", ") };
    };

    Campos.ordenar = (w, el) => {
        const mostra = embaralhar(w.itens, w.itens.length + 3);
        let ordem = [];
        el.innerHTML = `<p class="int-instrucao">Toque na ordem certa (1º, 2º, 3º…). Toque de novo para desfazer.</p>
            <div class="int-ordenar">${mostra.map(t => `<button type="button" class="int-card-ord" data-t="${e(t)}" aria-pressed="false"><span class="int-pos" aria-hidden="true"></span>${e(t)}</button>`).join("")}</div>`;
        const pintar = () => el.querySelectorAll(".int-card-ord").forEach(b => { const k = ordem.indexOf(b.dataset.t); b.querySelector(".int-pos").textContent = k >= 0 ? k + 1 + "º" : ""; b.setAttribute("aria-pressed", k >= 0 ? "true" : "false"); b.setAttribute("aria-label", b.dataset.t + (k >= 0 ? ", posição " + (k + 1) : "")); });
        el.addEventListener("click", ev => { const b = ev.target.closest(".int-card-ord"); if (!b) return; const t = b.dataset.t; ordem = ordem.includes(t) ? ordem.filter(x => x !== t) : [...ordem, t]; pintar(); mudou(el); });
        return { valor: () => ordem.slice(), set: x => { ordem = x || []; pintar(); }, respondido: () => ordem.length === w.itens.length, certo: () => ordem.every((t, i) => t === w.itens[i]), resposta: () => w.itens.join(" → ") };
    };

    Campos.caixas = (w, el) => {
        const lugar = w.itens.map(() => null);
        let pego = null;
        el.innerHTML = `<p class="int-instrucao">Toque num cartão e depois na caixa certa (ou arraste).</p>
            <div class="int-soltos">${w.itens.map((it, i) => `<button type="button" class="int-item" data-i="${i}" draggable="true" aria-pressed="false">${e(it[0])}</button>`).join("")}</div>
            <div class="int-caixas">${w.caixas.map((c, k) => `<div class="int-caixa" data-k="${k}"><button type="button" class="int-caixa-titulo" data-k="${k}">${e(c)} <small>toque aqui para guardar</small></button><div class="int-caixa-itens"></div></div>`).join("")}</div>`;
        const pintar = () => {
            el.querySelectorAll(".int-item").forEach(b => { const i = Number(b.dataset.i); const alvo = lugar[i] === null ? el.querySelector(".int-soltos") : el.querySelector(`.int-caixa[data-k="${lugar[i]}"] .int-caixa-itens`); if (b.parentElement !== alvo) alvo.appendChild(b); b.setAttribute("aria-pressed", pego === i ? "true" : "false"); });
            el.classList.toggle("segurando", pego !== null);
        };
        const guardar = (k, i = pego) => { if (i === null) return; lugar[i] = k; pego = null; pintar(); mudou(el); };
        el.addEventListener("click", ev => {
            const it = ev.target.closest(".int-item");
            if (it) { const i = Number(it.dataset.i); if (lugar[i] !== null && pego === null) { pego = i; } else pego = pego === i ? null : i; pintar(); return; }
            const cx = ev.target.closest(".int-caixa-titulo, .int-caixa"); if (cx) guardar(Number(cx.dataset.k));
        });
        el.addEventListener("dragstart", ev => { const it = ev.target.closest(".int-item"); if (it) ev.dataTransfer.setData("text/plain", it.dataset.i); });
        el.addEventListener("dragover", ev => { if (ev.target.closest(".int-caixa")) ev.preventDefault(); });
        el.addEventListener("drop", ev => { const cx = ev.target.closest(".int-caixa"); if (cx) { ev.preventDefault(); guardar(Number(cx.dataset.k), Number(ev.dataTransfer.getData("text/plain"))); } });
        return { valor: () => lugar.slice(), set: x => { (x || []).forEach((v, i) => lugar[i] = v); pintar(); }, respondido: () => lugar.every(v => v !== null), certo: () => lugar.every((v, i) => v === w.itens[i][1]), resposta: () => w.caixas.map((c, k) => c + ": " + w.itens.filter(it => it[1] === k).map(it => it[0]).join(", ")).join(" | ") };
    };

    Campos.ligar = (w, el) => {
        const direita = embaralhar(w.pares.map(p => p[1]), w.pares.length);
        const liga = {}; let esq = null;
        el.innerHTML = `<p class="int-instrucao">Toque num item da esquerda e depois no par dele à direita.</p>
            <div class="int-ligar"><div class="int-col">${w.pares.map((p, i) => `<button type="button" class="int-lig esq" data-i="${i}" aria-pressed="false">${e(p[0])}<span class="int-marca"></span></button>`).join("")}</div>
            <div class="int-col">${direita.map(t => `<button type="button" class="int-lig dir" data-t="${e(t)}">${e(t)}<span class="int-marca"></span></button>`).join("")}</div></div>`;
        const tons = ["#5b54e8", "#18b6a4", "#ff8a65", "#e0a21b", "#ec6fa8", "#3b82f6"];
        const pintar = () => {
            el.querySelectorAll(".int-lig.esq").forEach(b => { const i = Number(b.dataset.i); b.setAttribute("aria-pressed", esq === i ? "true" : "false"); b.style.setProperty("--tom", liga[i] ? tons[i % tons.length] : "transparent"); b.querySelector(".int-marca").textContent = liga[i] ? "●" : ""; });
            el.querySelectorAll(".int-lig.dir").forEach(b => { const i = Object.keys(liga).find(k => liga[k] === b.dataset.t); b.style.setProperty("--tom", i !== undefined ? tons[i % tons.length] : "transparent"); b.querySelector(".int-marca").textContent = i !== undefined ? "●" : ""; });
        };
        el.addEventListener("click", ev => {
            const b = ev.target.closest(".int-lig"); if (!b) return;
            if (b.classList.contains("esq")) { esq = Number(b.dataset.i); }
            else if (esq !== null) { Object.keys(liga).forEach(k => { if (liga[k] === b.dataset.t) delete liga[k]; }); liga[esq] = b.dataset.t; esq = null; mudou(el); }
            pintar();
        });
        return { valor: () => Object.assign({}, liga), set: x => { Object.assign(liga, x || {}); pintar(); }, respondido: () => Object.keys(liga).length === w.pares.length, certo: () => w.pares.every((p, i) => liga[i] === p[1]), resposta: () => w.pares.map(p => p[0] + " → " + p[1]).join(" | ") };
    };

    Campos.cores = (w, el) => {
        const pint = w.itens.map(() => null);
        let cor = w.paleta[0];
        el.innerHTML = `<div class="int-paleta" role="radiogroup" aria-label="Escolha a cor">${w.paleta.map((c, i) => `<button type="button" class="int-cor" role="radio" aria-checked="${i === 0}" data-cor="${c}" style="--c:${CORES[c]}"><span class="bolinha"></span>${e((w.rotuloPaleta || {})[c] || c)}</button>`).join("")}</div>
            <div class="int-colorir">${w.itens.map((it, i) => `<button type="button" class="int-pintavel" data-i="${i}">${e(it[0])}</button>`).join("")}</div>`;
        const pintar = () => el.querySelectorAll(".int-pintavel").forEach(b => { const v = pint[Number(b.dataset.i)]; b.style.setProperty("--c", v ? CORES[v] : "#fff"); b.classList.toggle("pintado", !!v); b.setAttribute("aria-label", b.textContent + (v ? ", pintado de " + v : ", sem cor")); });
        el.addEventListener("click", ev => {
            const c = ev.target.closest(".int-cor"); if (c) { cor = c.dataset.cor; el.querySelectorAll(".int-cor").forEach(b => b.setAttribute("aria-checked", b === c ? "true" : "false")); return; }
            const p = ev.target.closest(".int-pintavel"); if (p) { const i = Number(p.dataset.i); pint[i] = pint[i] === cor ? null : cor; pintar(); mudou(el); }
        });
        pintar();
        return { valor: () => pint.slice(), set: x => { (x || []).forEach((v, i) => pint[i] = v); pintar(); }, respondido: () => pint.every(Boolean), certo: () => w.itens.every(it => it[1] == null) ? null : w.itens.every((it, i) => it[1] == null || pint[i] === it[1]), resposta: () => w.itens.filter(it => it[1]).map(it => it[0] + ": " + ((w.rotuloPaleta || {})[it[1]] || it[1])).join(", ") };
    };

    Campos.montar = (w, el) => {
        let seqc = [];
        el.innerHTML = `<div class="int-vagas" aria-live="polite"></div>
            <div class="int-cartas">${w.cartas.map(c => `<button type="button" class="int-carta grande" data-v="${e(c)}">${e(c)}</button>`).join("")}</div>
            <div class="botoes-linha"><button type="button" class="btn-mini int-desfazer">↩ Desfazer</button><button type="button" class="btn-mini int-tocar">▶ Ler minha sequência</button></div>`;
        const pintar = () => { el.querySelector(".int-vagas").innerHTML = Array.from({ length: w.vagas }, (_, i) => `<span class="int-vaga ${seqc[i] ? "cheia" : ""}">${e(seqc[i] || i + 1)}</span>`).join(""); };
        el.addEventListener("click", ev => {
            const c = ev.target.closest(".int-carta"); if (c && seqc.length < w.vagas) { seqc.push(c.dataset.v); pintar(); mudou(el); }
            if (ev.target.closest(".int-desfazer")) { seqc.pop(); pintar(); mudou(el); }
            if (ev.target.closest(".int-tocar") && typeof falar === "function") falar(seqc.join(", ") || "Monte sua sequência primeiro");
        });
        pintar();
        return { valor: () => seqc.slice(), set: x => { seqc = x || []; pintar(); }, respondido: () => seqc.length === w.vagas, certo: () => null, resposta: () => "" };
    };

    Campos.texto = (w, el) => {
        const id = uid("txt");
        const temVoz = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        el.innerHTML = `<div class="int-texto">${w.prefixo ? `<label for="${id}" class="int-pref">${e(w.prefixo)}</label>` : `<label for="${id}" class="sr-only">Sua resposta</label>`}
            ${w.curto ? `<input type="text" id="${id}" class="int-campo" placeholder="Escreva aqui">` : `<textarea id="${id}" rows="2" class="int-campo" placeholder="Escreva ou fale sua resposta"></textarea>`}
            ${temVoz ? `<button type="button" class="int-mic" aria-label="Falar a resposta">🎤</button>` : ""}</div>`;
        const campo = el.querySelector(".int-campo");
        campo.addEventListener("input", () => mudou(el));
        el.querySelector(".int-mic")?.addEventListener("click", ev => ditar(campo, ev.currentTarget));
        return { valor: () => campo.value, set: x => { campo.value = x || ""; }, respondido: () => campo.value.trim().length > 0, certo: () => null, resposta: () => "" };
    };

    function ditar(campo, botao) {
        const R = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!R) return;
        const rec = new R();
        rec.lang = "pt-BR"; rec.interimResults = false;
        botao.classList.add("ouvindo"); botao.textContent = "⏺";
        rec.onresult = ev => { campo.value = (campo.value ? campo.value + " " : "") + ev.results[0][0].transcript; campo.dispatchEvent(new Event("input", { bubbles: true })); };
        rec.onend = () => { botao.classList.remove("ouvindo"); botao.textContent = "🎤"; };
        rec.onerror = () => rec.onend();
        try { rec.start(); } catch (err) { rec.onend(); }
    }

    function mudou(el) { el.dispatchEvent(new CustomEvent("int-mudou", { bubbles: true })); }

    /* Cria um campo dentro de el. Retorna o controlador (ou null se for só ilustração). */
    function campo(w, el) {
        if (!w || !Campos[w.t]) return null;
        el.classList.add("int-campo-" + w.t);
        const ctrl = Campos[w.t](w, el);
        if (ctrl) ctrl.w = w;
        return ctrl;
    }

    /* ---------- BLOCO COM "CONFERIR" ---------- */
    function bloco(raiz, itens, opcoes = {}) {
        raiz.classList.add("int-bloco");
        const ctrls = [];
        raiz.innerHTML = `<ol class="int-lista">${itens.map((it, i) => `
            <li class="int-item-q" data-q="${i}">
                <div class="int-enunciado"><span class="int-num" aria-hidden="true">${i + 1}</span><p>${e(it.p)}${it.w && it.w.pergunta ? ` <strong class="int-pergunta">${e(it.w.pergunta)}</strong>` : ""}</p>
                <button type="button" class="int-ouvir" aria-label="Ouvir o item ${i + 1}">🔊</button></div>
                <div class="int-area"></div>
                <p class="int-retorno" aria-live="polite" hidden></p>
            </li>`).join("")}</ol>
            <div class="int-acoes">
                <button type="button" class="btn int-conferir">✅ Conferir</button>
                <button type="button" class="btn-outline int-denovo" hidden>🔄 Tentar de novo</button>
            </div>
            <div class="int-resultado" aria-live="polite" hidden></div>`;
        raiz.querySelectorAll(".int-item-q").forEach((li, i) => {
            const c = campo(itens[i].w, li.querySelector(".int-area"));
            ctrls.push(c);
            if (!c && !(itens[i].w && itens[i].w.t === "pizzaVer")) li.querySelector(".int-area").remove();
            li.querySelector(".int-ouvir").addEventListener("click", () => typeof falar === "function" && falar(itens[i].p + (itens[i].w && itens[i].w.pergunta ? ". " + itens[i].w.pergunta : "")));
        });
        if (opcoes.estado) ctrls.forEach((c, i) => c && opcoes.estado[i] !== undefined && c.set(opcoes.estado[i]));
        raiz.addEventListener("int-mudou", () => { if (opcoes.aoMudar) opcoes.aoMudar(ctrls.map(c => c ? c.valor() : null)); });
        let tentativa = 0;
        const conferir = () => {
            tentativa++;
            let total = 0, certos = 0, faltando = 0;
            raiz.querySelectorAll(".int-item-q").forEach((li, i) => {
                const c = ctrls[i]; const ret = li.querySelector(".int-retorno");
                li.classList.remove("int-ok", "int-quase", "int-falta");
                if (!c) return;
                if (!c.respondido()) { faltando++; li.classList.add("int-falta"); ret.hidden = false; ret.textContent = "👉 Falta responder este. Sem pressa!"; return; }
                const r = c.certo();
                if (r === null) { ret.hidden = false; ret.textContent = "💛 Resposta registrada. Muito bem!"; li.classList.add("int-ok"); return; }
                total++;
                if (r) { certos++; li.classList.add("int-ok"); ret.hidden = false; ret.textContent = "⭐ Isso mesmo! " + (c.w.explica || ""); }
                else { li.classList.add("int-quase"); ret.hidden = false; ret.textContent = "💡 Quase! Vamos olhar de novo: " + (c.w.explica || "a resposta é " + c.resposta() + "."); if (c.marcar) c.marcar(); }
            });
            const pct = total ? certos / total : (faltando ? 0 : 1);
            const estrelas = faltando && !certos ? 0 : pct >= .99 ? 3 : pct >= .5 ? 2 : 1;
            const res = raiz.querySelector(".int-resultado");
            res.hidden = false;
            res.innerHTML = `<div class="int-estrelas" aria-label="${estrelas} de 3 estrelas">${[1, 2, 3].map(k => `<span class="${k <= estrelas ? "acesa" : ""}" style="--i:${k}">★</span>`).join("")}</div>
                <p>${faltando ? `Faltam ${faltando} ${faltando === 1 ? "item" : "itens"}. Você consegue! ` : ""}${total ? `Você acertou ${certos} de ${total}. ` : ""}${pct >= .99 && !faltando ? "Parabéns, você arrasou! 🎉" : "Cada tentativa ajuda o cérebro a aprender. 💪"}</p>`;
            raiz.querySelector(".int-denovo").hidden = pct >= .99 && !faltando;
            if (opcoes.aoConferir) opcoes.aoConferir({ certos, total, faltando, estrelas, valores: ctrls.map(c => c ? c.valor() : null) });
            raiz.dispatchEvent(new CustomEvent("int-conferido", { bubbles: true, detail: { certos, total, faltando, estrelas, tentativa } }));
            return { certos, total, faltando, estrelas };
        };
        raiz.querySelector(".int-conferir").addEventListener("click", conferir);
        raiz.querySelector(".int-denovo").addEventListener("click", () => {
            raiz.querySelectorAll(".int-item-q.int-quase, .int-item-q.int-falta").forEach(li => {
                const i = Number(li.dataset.q); const area = li.querySelector(".int-area");
                const novo = document.createElement("div"); novo.className = "int-area"; area.replaceWith(novo);
                ctrls[i] = campo(itens[i].w, novo);
                li.classList.remove("int-quase", "int-falta"); li.querySelector(".int-retorno").hidden = true;
            });
            raiz.querySelector(".int-resultado").hidden = true;
            raiz.querySelector(".int-denovo").hidden = true;
            const primeiro = raiz.querySelector(".int-item-q .int-area button, .int-item-q .int-area input");
            if (primeiro) primeiro.focus();
        });
        return { conferir, ctrls };
    }

    /* Monta automaticamente os blocos [data-interativo] da página */
    function iniciar(raiz = document) {
        raiz.querySelectorAll("[data-interativo]:not([data-pronto])").forEach(el => {
            el.setAttribute("data-pronto", "");
            try {
                const dados = JSON.parse(el.getAttribute("data-interativo"));
                const itens = dados.etapas ? deEtapas(dados.etapas) : dados.questoes.map(q => ({ p: q.p, w: q.w }));
                bloco(el, itens);
            } catch (erro) { console.warn("Bloco interativo inválido", erro); }
        });
    }

    return { detectar, deEtapas, contexto, campo, bloco, iniciar, paraFala, pizzaSVG, CORES };
})();
