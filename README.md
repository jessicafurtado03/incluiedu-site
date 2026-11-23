# IncluiEdu – Assistente de Inclusão Pedagógica

Projeto acadêmico (Análise e Desenvolvimento de Sistemas • InnovaDay 2026)
Equipe: Jéssica Furtado da Silva e José Edilson de Araujo Souza Junior • Orientação: Profa. Maristela Oliveira

Site estático (HTML, CSS e JavaScript) com banco de dados **IndexedDB** no navegador.

## Como começar
1. Abra `index.html` e clique em **Criar conta** (conta de professor).
2. A conta já começa com 5 alunos e 7 atividades de exemplo (etiqueta “exemplo”), que podem ser editados ou excluídos.
3. Cadastre alunos, crie atividades, gere a adaptação com a prévia visual (PNG/impressão) e registre resultados.
4. No perfil de cada aluno, em **Acesso do aluno**, crie o usuário e a senha que ele usará para entrar na Área do Aluno.

## Dados
- Banco IndexedDB `incluiedu` com as tabelas: usuarios, alunos, atividades, adaptacoes, resultados, materias e meta.
- Senhas guardadas com SHA-256 + sal (SubtleCrypto).
- Os dados ficam neste navegador/dispositivo. Em **Configurações** há exportação e importação de backup (JSON).
- Dados antigos do LocalStorage são migrados automaticamente na primeira abertura.

## Estrutura
- `assets/js/db.js` – banco de dados e criptografia das senhas
- `assets/js/dados.js` – matérias e exemplos iniciais
- `assets/js/visual.js` – ilustrações e folha de atividade em SVG (PNG e impressão)
- `assets/js/ui.js` – acessibilidade, avisos, vídeos, cronômetro e quizzes
- `assets/js/app.js` – contas, CRUD e áreas do professor e do aluno

Imagens: Wikimedia Commons (licenças Creative Commons). Créditos em `sobre.html#creditos`.
