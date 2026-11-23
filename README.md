# IncluiEdu – Assistente de Inclusão Pedagógica

Projeto acadêmico (Análise e Desenvolvimento de Sistemas • InnovaDay 2026)
Equipe: Jéssica Furtado da Silva e José Edilson de Araujo Souza Junior • Orientação: Profa. Maristela Oliveira

Site estático (HTML, CSS e JavaScript) publicado no GitHub Pages, com contas e dados na nuvem (**Supabase**: PostgreSQL + Auth, região São Paulo).

## Como começar
1. Abra o site e clique em **Criar conta** (professor ou aluno).
2. A conta de professor pode começar com 5 alunos e 7 atividades de exemplo (etiqueta “exemplo”), que podem ser editados ou excluídos.
3. Cadastre alunos, crie atividades, gere a adaptação com a prévia visual (PNG/impressão) e registre resultados.
4. No perfil de cada aluno, em **Acesso do aluno**, crie o usuário e a senha que ele usará para entrar na Área do Aluno.
5. O aluno também pode criar a própria conta e se vincular com o **código da turma** (IE-XXXXXX) ou o e-mail do professor.

## Dados
- Tabelas: usuarios (perfil ligado à conta de login), alunos, atividades, adaptacoes, resultados, pontos, tempo e sugestoes. Cada registro guarda os campos de busca em colunas e o resto em `dados` (jsonb).
- Segurança por linha (RLS) em todas as tabelas: o professor vê só os próprios registros; o aluno vê e responde só as próprias adaptações, resultados e pontos.
- Login com e-mail e senha. Usuários de aluno sem e-mail (ex.: `laura.5b`) usam um e-mail interno `laura.5b@aluno.incluiedu.local`, que nunca recebe mensagens.
- Dados antigos salvos no navegador (versões anteriores) podem ser enviados para a conta pelo aviso **Importar dados deste navegador**, que aparece depois do login.
- Em **Configurações** há exportação de backup (JSON) e importação de backups antigos.

## Estrutura
- `assets/js/db.js` – conexão com o banco na nuvem (mesma interface DB.* de antes)
- `assets/js/db-local.js` – leitura do banco antigo do navegador (para importar)
- `assets/js/migracao.js` – importação dos dados antigos para a nuvem
- `assets/js/dados.js` – matérias e exemplos iniciais
- `assets/js/interativo.js`, `jogos.js`, `engajamento.js` – exercícios interativos, mini-jogos, pontos e tempo de estudo
- `assets/js/visual.js` – ilustrações e folha de atividade em SVG (PNG e impressão)
- `assets/js/ui.js` – acessibilidade, avisos, vídeos, cronômetro e quizzes
- `assets/js/app.js` – contas, CRUD e áreas do professor e do aluno

Imagens: Wikimedia Commons (licenças Creative Commons). Créditos em `sobre.html#creditos`.
