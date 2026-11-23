/* =====================================================
   INCLUIEDU • IMPORTAR DADOS ANTIGOS DESTE NAVEGADOR
   Antes da nuvem, tudo ficava no IndexedDB do navegador.
   Depois do login, se houver dados antigos da mesma conta,
   oferecemos enviar tudo para a nuvem (uma vez só).
   ===================================================== */

const CHAVE_IMPORTADO = id => "incluiedu_importado_" + id;

/* Envia tabelas (do navegador antigo ou de um arquivo de backup) para a conta atual, renumerando os ids */
async function enviarParaNuvem(tabelas, { email, localId } = {}) {
    const u = App.usuario;
    const lista = t => Array.isArray(tabelas[t]) ? tabelas[t] : [];
    const semId = r => { const c = Object.assign({}, r); delete c.id; delete c.senhaHash; delete c.sal; return c; };
    const alvoLogin = String(email || u.email || "").toLowerCase();
    if (localId === undefined) {
        const porEmail = lista("usuarios").find(x => [String(x.email || "").toLowerCase(), String(x.login || "").toLowerCase()].includes(alvoLogin) || String(x.email || "").toLowerCase() === loginVisivel(u).toLowerCase());
        const profs = lista("usuarios").filter(x => x.tipo === "professor");
        localId = porEmail ? porEmail.id : (u.tipo === "professor" && profs.length === 1 ? profs[0].id : null);
    }
    const n = { alunos: 0, atividades: 0, adaptacoes: 0, resultados: 0, pontos: 0, tempo: 0, sugestoes: 0 };
    if (localId === null || localId === undefined) return n;
    const matLocal = lista("materias"), matNuvem = MATERIAS_FIXAS();
    const materiaNova = id => { const m = matLocal.find(x => x.id === id); const f = m && matNuvem.find(x => x.slug === m.slug); return f ? f.id : (matLocal.length ? null : id); };
    const mapaAluno = {}, mapaAtv = {};
    const escopos = u.tipo === "professor" ? [[localId, u.id]] : [[-localId, u.professorId < 0 ? u.professorId : -u.id]];
    for (const [origem, destino] of escopos) {
        for (const a of lista("alunos").filter(x => x.professorId === origem)) { mapaAluno[a.id] = await DB.salvar("alunos", Object.assign(semId(a), { professorId: destino })); n.alunos++; }
        for (const t of lista("atividades").filter(x => x.professorId === origem)) { mapaAtv[t.id] = await DB.salvar("atividades", Object.assign(semId(t), { professorId: destino, materiaId: materiaNova(t.materiaId) })); n.atividades++; }
        for (const d of lista("adaptacoes").filter(x => x.professorId === origem)) {
            const aluno = mapaAluno[d.alunoId] || (u.tipo === "aluno" ? u.alunoId : null);
            if (!aluno || !mapaAtv[d.atividadeId]) continue;
            await DB.salvar("adaptacoes", Object.assign(semId(d), { professorId: destino, alunoId: aluno, atividadeId: mapaAtv[d.atividadeId] })); n.adaptacoes++;
        }
        for (const r of lista("resultados").filter(x => x.professorId === origem)) {
            if (!mapaAluno[r.alunoId] || !mapaAtv[r.atividadeId]) continue;
            await DB.salvar("resultados", Object.assign(semId(r), { professorId: destino, alunoId: mapaAluno[r.alunoId], atividadeId: mapaAtv[r.atividadeId] })); n.resultados++;
        }
    }
    if (u.tipo === "aluno") {
        const jaTem = new Set((await DB.onde("pontos", "usuarioId", u.id)).map(p => p.ref));
        for (const p of lista("pontos").filter(x => x.usuarioId === localId && !jaTem.has(x.ref))) { await DB.salvar("pontos", Object.assign(semId(p), { usuarioId: u.id })); n.pontos++; }
        for (const t of lista("tempo").filter(x => x.usuarioId === localId)) {
            const chave = u.id + "|" + t.dia;
            const atual = await DB.buscar("tempo", chave);
            await DB.salvar("tempo", { chave, usuarioId: u.id, dia: t.dia, segundos: Math.max(t.segundos || 0, atual ? atual.segundos || 0 : 0) }); n.tempo++;
        }
    }
    for (const g of lista("sugestoes").filter(x => x.usuarioId === localId)) { await DB.salvar("sugestoes", Object.assign(semId(g), { usuarioId: u.id })); n.sugestoes++; }
    return n;
}

async function dadosDoNavegadorAntigo() {
    if (!("indexedDB" in window) || typeof DBLocal === "undefined") return null;
    if (indexedDB.databases) {
        const bancos = await indexedDB.databases().catch(() => []);
        if (!bancos.some(b => b.name === "incluiedu")) return null;
    } else return null;
    const dados = await DBLocal.exportar();
    DBLocal._conexao && DBLocal._conexao.close(); DBLocal._conexao = null;
    return dados.tabelas;
}

async function oferecerImportacao() {
    const u = App.usuario;
    if (!u || localStorage.getItem(CHAVE_IMPORTADO(u.authId))) return;
    const tabelas = await dadosDoNavegadorAntigo();
    if (!tabelas) return;
    const login = loginVisivel(u).toLowerCase(), email = String(u.email || "").toLowerCase();
    const local = (tabelas.usuarios || []).find(x => [email, login].includes(String(x.email || "").toLowerCase()));
    if (!local) return;
    const de = t => (tabelas[t] || []);
    const escopo = u.tipo === "professor" ? local.id : -local.id;
    const qtd = { alunos: de("alunos").filter(x => x.professorId === escopo).length, atividades: de("atividades").filter(x => x.professorId === escopo).length,
        adaptacoes: de("adaptacoes").filter(x => x.professorId === escopo).length, pontos: de("pontos").filter(x => x.usuarioId === local.id).length };
    if (!Object.values(qtd).some(Boolean)) return;
    const b = document.createElement("section");
    b.className = "banner-importar"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Importar dados deste navegador");
    b.innerHTML = `<span aria-hidden="true">📦</span>
        <div><strong>Encontramos dados salvos só neste navegador</strong>
        <p>${[qtd.alunos && qtd.alunos + " alunos", qtd.atividades && qtd.atividades + " atividades", qtd.adaptacoes && qtd.adaptacoes + " adaptações", qtd.pontos && qtd.pontos + " registros de pontos"].filter(Boolean).join(", ")}. Envie para a sua conta na nuvem para ver em qualquer aparelho.</p></div>
        <div class="botoes-linha"><button type="button" class="btn" id="btnImportarNavegador">Importar dados deste navegador</button><button type="button" class="btn-outline" id="btnImportarDepois">Agora não</button></div>`;
    (document.querySelector("main") || document.body).prepend(b);
    b.querySelector("#btnImportarDepois").addEventListener("click", () => { b.remove(); });
    b.querySelector("#btnImportarNavegador").addEventListener("click", async ev => {
        ev.currentTarget.disabled = true; ev.currentTarget.textContent = "Importando…";
        try {
            const n = await enviarParaNuvem(tabelas, { localId: local.id });
            localStorage.setItem(CHAVE_IMPORTADO(u.authId), new Date().toISOString());
            b.innerHTML = `<span aria-hidden="true">✅</span><div><strong>Dados importados para a nuvem!</strong><p>${n.alunos} alunos, ${n.atividades} atividades, ${n.adaptacoes} adaptações, ${n.resultados} resultados, ${n.pontos} pontos.</p></div>`;
            setTimeout(() => location.reload(), 1600);
        } catch (erro) { avisar("Não foi possível importar: " + erro.message, "erro"); ev.currentTarget.disabled = false; ev.currentTarget.textContent = "Tentar de novo"; }
    });
}
