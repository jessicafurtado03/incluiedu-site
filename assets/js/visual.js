/* =====================================================
   INCLUIEDU • GERADOR VISUAL
   Cria, sem nenhuma API externa, ilustrações em SVG para
   cada etapa e a prévia "como vai ficar" da folha de
   atividade (download em PNG e impressão).
   ===================================================== */

const Visual = (() => {

    const CORES = { tinta: "#1f2a44", suave: "#eef1f8", indigo: "#5b54e8", teal: "#119c8d",
        coral: "#f0765a", sol: "#f5b53d", ceu: "#3d9be0", verde: "#3aa565", rosa: "#e0679a", cinza: "#9aa3b5" };

    const xml = t => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    /* ---------- ÍCONES DESENHADOS (caixa 100 x 100) ---------- */
    const ICONES = {
        ler: `<rect x="12" y="22" width="36" height="56" rx="6" fill="${CORES.indigo}"/><rect x="52" y="22" width="36" height="56" rx="6" fill="#7d77f0"/>
              <rect x="47" y="20" width="6" height="60" rx="3" fill="${CORES.tinta}"/>
              <path d="M20 36h20M20 46h20M20 56h14M60 36h20M60 46h20M60 56h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
        escrever: `<rect x="16" y="14" width="56" height="72" rx="8" fill="#fff" stroke="${CORES.tinta}" stroke-width="4"/>
              <path d="M26 32h36M26 44h36M26 56h22" stroke="${CORES.cinza}" stroke-width="4" stroke-linecap="round"/>
              <g transform="rotate(40 66 62)"><rect x="60" y="22" width="13" height="56" rx="3" fill="${CORES.sol}"/><path d="M60 78l6.5 14 6.5-14z" fill="${CORES.tinta}"/><rect x="60" y="18" width="13" height="8" rx="2" fill="${CORES.coral}"/></g>`,
        desenhar: `<circle cx="44" cy="50" r="34" fill="#fff" stroke="${CORES.tinta}" stroke-width="4"/>
              <circle cx="32" cy="38" r="7" fill="${CORES.coral}"/><circle cx="50" cy="30" r="7" fill="${CORES.sol}"/><circle cx="64" cy="44" r="7" fill="${CORES.teal}"/><circle cx="34" cy="60" r="7" fill="${CORES.indigo}"/>
              <g transform="rotate(35 74 66)"><rect x="70" y="40" width="9" height="40" rx="4" fill="${CORES.tinta}"/><path d="M70 40q4.5-14 9 0z" fill="${CORES.rosa}"/></g>`,
        observar: `<path d="M8 50q42-40 84 0q-42 40-84 0z" fill="#fff" stroke="${CORES.tinta}" stroke-width="5"/>
              <circle cx="50" cy="50" r="17" fill="${CORES.ceu}"/><circle cx="50" cy="50" r="8" fill="${CORES.tinta}"/><circle cx="56" cy="44" r="4" fill="#fff"/>`,
        ouvir: `<path d="M18 40h14l20-16v52l-20-16h-14z" fill="${CORES.teal}" stroke="${CORES.tinta}" stroke-width="4" stroke-linejoin="round"/>
              <path d="M62 38q8 12 0 24M70 30q16 20 0 40M78 22q24 28 0 56" fill="none" stroke="${CORES.tinta}" stroke-width="5" stroke-linecap="round"/>`,
        pergunta: `<path d="M14 20h72a8 8 0 0 1 8 8v36a8 8 0 0 1-8 8H44l-18 16v-16H14a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8z" fill="${CORES.sol}" stroke="${CORES.tinta}" stroke-width="4"/>
              <text x="50" y="60" font-size="40" font-weight="800" text-anchor="middle" fill="${CORES.tinta}" font-family="Segoe UI, Arial, sans-serif">?</text>`,
        contar: `<rect x="10" y="22" width="24" height="24" rx="6" fill="${CORES.coral}"/><rect x="38" y="22" width="24" height="24" rx="6" fill="${CORES.sol}"/><rect x="66" y="22" width="24" height="24" rx="6" fill="${CORES.teal}"/>
              <rect x="24" y="54" width="24" height="24" rx="6" fill="${CORES.indigo}"/><rect x="52" y="54" width="24" height="24" rx="6" fill="${CORES.rosa}"/>
              <text x="22" y="40" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">1</text><text x="50" y="40" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">2</text><text x="78" y="40" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">3</text><text x="36" y="72" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">4</text><text x="64" y="72" font-size="16" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">5</text>`,
        sol: `<circle cx="50" cy="44" r="18" fill="${CORES.sol}"/><g stroke="${CORES.sol}" stroke-width="5" stroke-linecap="round"><path d="M50 12v8M50 68v8M18 44h8M74 44h8M27 21l6 6M67 61l6 6M27 67l6-6M67 27l6-6"/></g>
              <path d="M10 86q10-8 20 0t20 0t20 0t20 0" fill="none" stroke="${CORES.ceu}" stroke-width="5" stroke-linecap="round"/><path d="M40 78q-4-8 0-14M56 78q4-8 0-14" stroke="${CORES.cinza}" stroke-width="3" fill="none" stroke-dasharray="3 4"/>`,
        nuvem: `<path d="M26 66h50a16 16 0 0 0 0-32a22 22 0 0 0-42-4a16 16 0 0 0-8 36z" fill="#fff" stroke="${CORES.tinta}" stroke-width="4"/>
              <path d="M30 84q4-8 0-14M50 84q4-8 0-14M70 84q4-8 0-14" stroke="${CORES.cinza}" stroke-width="3" fill="none" stroke-dasharray="3 4"/>`,
        chuva: `<path d="M24 52h50a15 15 0 0 0 0-30a21 21 0 0 0-40-4a15 15 0 0 0-10 34z" fill="#dfe6f2" stroke="${CORES.tinta}" stroke-width="4"/>
              <g fill="${CORES.ceu}"><path d="M30 62q-6 10 0 14q6-4 0-14z"/><path d="M50 66q-6 10 0 14q6-4 0-14z"/><path d="M70 62q-6 10 0 14q6-4 0-14z"/><path d="M40 78q-5 8 0 12q5-4 0-12z"/><path d="M60 78q-5 8 0 12q5-4 0-12z"/></g>`,
        mapa: `<path d="M10 22l26-8 28 8 26-8v64l-26 8-28-8-26 8z" fill="#e6f4ea" stroke="${CORES.tinta}" stroke-width="4" stroke-linejoin="round"/>
              <path d="M36 14v64M64 22v64" stroke="${CORES.tinta}" stroke-width="3"/><path d="M50 30c-9 0-14 7-14 13 0 10 14 22 14 22s14-12 14-22c0-6-5-13-14-13z" fill="${CORES.coral}"/><circle cx="50" cy="43" r="5" fill="#fff"/>`,
        dinheiro: `<rect x="8" y="26" width="64" height="38" rx="6" fill="${CORES.verde}" stroke="${CORES.tinta}" stroke-width="4"/><circle cx="40" cy="45" r="10" fill="#bfe8cc"/>
              <circle cx="72" cy="66" r="18" fill="${CORES.sol}" stroke="${CORES.tinta}" stroke-width="4"/><text x="72" y="73" font-size="18" font-weight="800" text-anchor="middle" fill="${CORES.tinta}" font-family="Arial">R$</text>`,
        musica: `<path d="M38 70V24l40-8v46" fill="none" stroke="${CORES.tinta}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="30" cy="72" rx="12" ry="9" fill="${CORES.rosa}"/><ellipse cx="70" cy="64" rx="12" ry="9" fill="${CORES.indigo}"/>`,
        estrela: `<path d="M50 10l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3z" fill="${CORES.sol}" stroke="${CORES.tinta}" stroke-width="4" stroke-linejoin="round"/>`,
        material: `<rect x="12" y="50" width="30" height="30" rx="5" fill="${CORES.coral}"/><rect x="46" y="50" width="30" height="30" rx="5" fill="${CORES.teal}"/><rect x="29" y="18" width="30" height="30" rx="5" fill="${CORES.sol}"/><circle cx="80" cy="30" r="12" fill="${CORES.indigo}"/>`,
        pensar: `<circle cx="46" cy="46" r="30" fill="#fde7d9" stroke="${CORES.tinta}" stroke-width="4"/><path d="M34 54q12 10 24 0" stroke="${CORES.tinta}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="36" cy="40" r="4" fill="${CORES.tinta}"/><circle cx="56" cy="40" r="4" fill="${CORES.tinta}"/>
              <circle cx="82" cy="18" r="9" fill="${CORES.sol}"/><circle cx="74" cy="34" r="4" fill="${CORES.sol}"/>`
    };

    const REGRAS = [
        ["chuva", /precipita|chuva/i], ["nuvem", /condensa|nuvem|nuvens/i], ["sol", /evapora|\bsol\b|aquece|vapor/i],
        ["ouvir", /ou[çc]a|ouvir|escute|[áa]udio|🔊/i], ["musica", /m[úu]sica|ritmo|cant/i],
        ["dinheiro", /r\$|troco|dinheiro|c[ée]dula|moeda/i], ["mapa", /mapa|regi[ãa]o|regi[õo]es|estado|brasil|caminho/i],
        ["desenhar", /desenh|pinte|pintar|colagem|cole |monte|crie|releitura|material:/i],
        ["escrever", /escreva|complete|anote|registre|t[íi]tulo/i], ["ler", /leia|ler |texto|f[áa]bula|livro|hist[óo]ria/i],
        ["contar", /conte|some|calcule|quant[oa]s|n[úu]mero/i], ["observar", /observe|veja|olhe|figura|imagem/i],
        ["material", /escolha|separe|pegue|objeto/i], ["pergunta", /\?|quem|qual|por que|quando/i]
    ];

    function chaveIcone(texto) {
        const r = REGRAS.find(([, re]) => re.test(texto));
        return r ? r[0] : "pensar";
    }

    function icone(chave, x, y, tamanho) {
        const s = tamanho / 100;
        return `<g transform="translate(${x} ${y}) scale(${s})">${ICONES[chave] || ICONES.pensar}</g>`;
    }

    /* ---------- FRAÇÕES: pizza desenhada ---------- */
    function pizza(cx, cy, r, partes, pintadas = [], destaque = []) {
        let s = `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#e9b26b"/>`;
        for (let i = 0; i < partes; i++) {
            const a0 = (i / partes) * Math.PI * 2 - Math.PI / 2;
            const a1 = ((i + 1) / partes) * Math.PI * 2 - Math.PI / 2;
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            let cor = "#ffe29a";
            if (pintadas.includes(i)) cor = "#f6a38f";
            if (destaque.includes(i)) cor = CORES.coral;
            s += `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${cor}" stroke="#a8682a" stroke-width="2.5"/>`;
        }
        return s;
    }

    function contextoFracao(textoCompleto) {
        const m = textoCompleto.match(/(?:dividida em|em)\s+(\d+)\s+partes/i) || textoCompleto.match(/(\d+)\s+partes iguais/i);
        const d = m ? Number(m[1]) : 0;
        return d >= 2 && d <= 16 ? d : 0;
    }

    /* Desenho principal de uma etapa (caixa tam x tam) */
    function desenhoEtapa(texto, ctx, x, y, tam) {
        if (ctx.partes && /pizza|partes|fra[çc][ãa]o|__\/|sobr|pinte/i.test(texto)) {
            const nums = (texto.match(/\d+/g) || []).map(Number).filter(n => n > 0 && n < ctx.partes);
            const r = tam * 0.4, cx = x + tam / 2, cy = y + tam / 2;
            const ja = [];
            ctx.comidas.forEach(n => { for (let k = 0; k < n; k++) ja.push(ja.length); });
            if (/sobr/i.test(texto)) {
                const resto = [];
                for (let i = ja.length; i < ctx.partes; i++) resto.push(i);
                return pizza(cx, cy, r, ctx.partes, ja, []) + marcaResto(cx, cy, r, ctx.partes, resto);
            }
            if (nums.length) {
                const n = nums[0];
                const novas = [];
                for (let k = 0; k < n; k++) novas.push(ja.length + k);
                ctx.comidas.push(n);
                return pizza(cx, cy, r, ctx.partes, ja, novas) +
                    `<text x="${cx}" y="${y + tam - 2}" font-size="${tam * 0.13}" font-weight="800" text-anchor="middle" fill="${CORES.tinta}" font-family="Segoe UI, Arial">${n}/${ctx.partes}</text>`;
            }
            return pizza(cx, cy, r, ctx.partes, /desenh|pinte/i.test(texto) ? ja : [], []);
        }
        return icone(chaveIcone(texto), x + tam * 0.08, y + tam * 0.08, tam * 0.84);
    }

    function marcaResto(cx, cy, r, partes, resto) {
        return resto.map(i => {
            const a = ((i + 0.5) / partes) * Math.PI * 2 - Math.PI / 2;
            return `<circle cx="${(cx + r * 0.62 * Math.cos(a)).toFixed(1)}" cy="${(cy + r * 0.62 * Math.sin(a)).toFixed(1)}" r="${r * 0.1}" fill="${CORES.verde}"/>`;
        }).join("");
    }

    /* ---------- TEXTO ---------- */
    function quebrar(texto, max) {
        const palavras = String(texto).split(/\s+/);
        const linhas = [];
        let atual = "";
        palavras.forEach(p => {
            if ((atual + " " + p).trim().length > max) { if (atual) linhas.push(atual); atual = p; }
            else atual = (atual + " " + p).trim();
        });
        if (atual) linhas.push(atual);
        return linhas;
    }

    function etapas(texto) {
        const linhas = String(texto || "").split("\n").map(l => l.trim()).filter(Boolean);
        const e = linhas.filter(l => /^etapa\s*\d+/i.test(l)).map(l => l.replace(/^etapa\s*\d+\s*[:.\-–]?\s*/i, ""));
        if (e.length) return e;
        return String(texto || "").replace(/\s+/g, " ").split(/(?<=[.?!])\s+/).filter(Boolean);
    }

    function lembretes(texto) {
        return String(texto || "").split("\n").map(l => l.trim()).filter(l => l && !/^etapa\s*\d+/i.test(l));
    }

    /* ---------- ILUSTRAÇÃO DE UMA ETAPA (tela do aluno) ---------- */
    function ilustracaoEtapa(textoCompleto, indice, cor = CORES.indigo) {
        const lista = etapas(textoCompleto);
        const ctx = { partes: contextoFracao(textoCompleto), comidas: [] };
        let desenho = "";
        lista.forEach((t, i) => { const d = desenhoEtapa(t, ctx, 20, 20, 260); if (i === indice) desenho = d; });
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="Ilustração da etapa ${indice + 1}">
            <rect x="4" y="4" width="292" height="292" rx="36" fill="${cor}" opacity=".10"/>${desenho}</svg>`;
    }

    /* ---------- FOLHA COMPLETA "COMO VAI FICAR" ---------- */
    function folha({ titulo, materia = "", turma = "", aluno = "", texto = "", cor = CORES.indigo, emoji = "" }) {
        const lista = etapas(texto);
        const extras = lembretes(texto);
        const ctx = { partes: contextoFracao(texto), comidas: [] };
        const W = 900, topo = 190, alturaEtapa = 196, base = 150 + (extras.length ? 70 : 0);
        const H = topo + lista.length * alturaEtapa + base;
        const tituloLinhas = quebrar(titulo, 34).slice(0, 2);
        let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Segoe UI, Roboto, Arial, sans-serif" role="img" aria-label="Prévia da atividade ${xml(titulo)}">`;
        s += `<rect width="${W}" height="${H}" fill="#fbfaf6"/>`;
        s += `<rect x="24" y="24" width="${W - 48}" height="146" rx="28" fill="${cor}"/>`;
        s += `<circle cx="${W - 90}" cy="70" r="70" fill="#fff" opacity=".12"/><circle cx="${W - 40}" cy="150" r="40" fill="#fff" opacity=".10"/>`;
        s += `<text x="56" y="62" font-size="18" font-weight="800" fill="#fff" opacity=".9" letter-spacing="2">${xml((materia || "ATIVIDADE").toUpperCase())}${turma ? " • " + xml(turma) : ""}</text>`;
        tituloLinhas.forEach((l, i) => { s += `<text x="56" y="${102 + i * 36}" font-size="32" font-weight="800" fill="#fff">${xml(l)}</text>`; });
        s += `<text x="56" y="${tituloLinhas.length > 1 ? 160 : 140}" font-size="18" fill="#fff" opacity=".92">${aluno ? "Para: " + xml(aluno) + " • " : ""}Faça uma etapa de cada vez</text>`;
        if (emoji) s += `<text x="${W - 90}" y="96" font-size="56" text-anchor="middle">${xml(emoji)}</text>`;

        lista.forEach((t, i) => {
            const y = topo + i * alturaEtapa;
            s += `<rect x="24" y="${y}" width="${W - 48}" height="${alturaEtapa - 16}" rx="24" fill="#fff" stroke="#e3e6ef" stroke-width="2"/>`;
            s += `<rect x="40" y="${y + 14}" width="152" height="152" rx="22" fill="${cor}" opacity=".10"/>`;
            s += desenhoEtapa(t, ctx, 46, y + 20, 140);
            s += `<circle cx="44" cy="${y + 18}" r="22" fill="${cor}"/><text x="44" y="${y + 26}" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">${i + 1}</text>`;
            const linhas = quebrar(t, 40);
            const fs = linhas.length > 4 ? 19 : 23;
            const lh = fs * 1.35;
            const y0 = y + 90 - ((Math.min(linhas.length, 5) - 1) * lh) / 2;
            s += `<text x="214" y="${y + 40}" font-size="15" font-weight="800" fill="${cor}" letter-spacing="1.5">ETAPA ${i + 1} DE ${lista.length}</text>`;
            linhas.slice(0, 5).forEach((l, k) => { s += `<text x="214" y="${(y0 + 12 + k * lh).toFixed(1)}" font-size="${fs}" font-weight="600" fill="${CORES.tinta}">${xml(l)}</text>`; });
            s += `<rect x="${W - 96}" y="${y + 62}" width="44" height="44" rx="10" fill="#fff" stroke="${cor}" stroke-width="3"/>`;
            s += `<text x="${W - 74}" y="${y + 128}" font-size="12" font-weight="700" fill="${CORES.cinza}" text-anchor="middle">FEITO</text>`;
        });

        let yb = topo + lista.length * alturaEtapa;
        if (extras.length) {
            s += `<rect x="24" y="${yb}" width="${W - 48}" height="56" rx="16" fill="#fff5d6"/>`;
            s += `<text x="48" y="${yb + 35}" font-size="18" font-weight="600" fill="#7a5a00">💡 ${xml(extras.join(" ").slice(0, 90))}</text>`;
            yb += 70;
        }
        s += `<text x="${W / 2}" y="${yb + 40}" font-size="20" font-weight="700" fill="${CORES.tinta}" text-anchor="middle">Ao terminar, pinte as estrelas:</text>`;
        [-1, 0, 1].forEach(k => { s += icone("estrela", W / 2 + k * 80 - 30, yb + 56, 60).replace(CORES.sol, "#fff"); });
        s += `<text x="${W / 2}" y="${H - 14}" font-size="13" fill="${CORES.cinza}" text-anchor="middle">IncluiEdu • Assistente de Inclusão Pedagógica</text>`;
        s += `</svg>`;
        return s;
    }

    /* ---------- EXPORTAR ---------- */
    function paraPNG(svg, escala = 2) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
            img.onload = () => {
                const c = document.createElement("canvas");
                c.width = img.width * escala; c.height = img.height * escala;
                const g = c.getContext("2d");
                g.scale(escala, escala);
                g.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                c.toBlob(b => b ? resolve(b) : reject(new Error("Falha ao gerar PNG")), "image/png");
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Falha ao desenhar a prévia")); };
            img.src = url;
        });
    }

    async function baixarPNG(svg, nome) {
        const blob = await paraPNG(svg);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = (nome || "atividade").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }

    function imprimir(svg, titulo) {
        const w = window.open("", "_blank");
        if (!w) return false;
        w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${xml(titulo || "Atividade")}</title>
            <style>@page{margin:10mm}body{margin:0;display:flex;justify-content:center}svg{width:100%;height:auto;max-width:190mm}</style></head>
            <body>${svg}<script>window.onload=()=>{setTimeout(()=>{window.print()},300)}<\/script></body></html>`);
        w.document.close();
        return true;
    }

    return { folha, ilustracaoEtapa, etapas, lembretes, baixarPNG, imprimir, paraPNG, icone, chaveIcone };
})();
