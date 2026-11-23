/* IncluiEdu: arquivo antigo. Se uma página antiga ficou guardada no cache do
   navegador e carregou este script, recarrega a versão nova da página. */
(function () {
    try {
        if (sessionStorage.getItem("incluiedu_atualizado")) return;
        sessionStorage.setItem("incluiedu_atualizado", "1");
    } catch (e) { /* segue */ }
    var url = location.pathname + "?atualizado=" + Date.now() + location.hash;
    location.replace(url);
})();
