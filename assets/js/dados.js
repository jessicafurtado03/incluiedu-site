/* Dados iniciais do IncluiEdu: matérias e exemplos (fictícios) usados na primeira execução. */
const DADOS_MATERIAS = [
 {
  "slug": "portugues",
  "nome": "Língua Portuguesa",
  "emoji": "📖",
  "cor": "#d97706",
  "resumo": "Leitura, escrita e interpretação com textos acessíveis, apoio visual e diferentes formas de resposta.",
  "aulas": [
   {
    "titulo": "Interpretação de fábula: A cigarra e a formiga",
    "ano": "6º ano",
    "objetivo": "Identificar personagens, conflito e moral de uma fábula.",
    "original": "Leia a fábula A cigarra e a formiga. Quem são os personagens? Qual é o problema da história? Qual é a moral da fábula? Você concorda com a atitude da formiga? Justifique.",
    "adaptada": [
     "Ouça a fábula (🔊) e acompanhe com as imagens.",
     "Circule os PERSONAGENS: cigarra, formiga, sol.",
     "O PROBLEMA: a cigarra ficou sem ____ no inverno.",
     "A MORAL: escolha a frase certa entre duas opções.",
     "Você concorda com a formiga? Responda falando ou desenhando."
    ],
    "perfil": "Dislexia",
    "estrategias": [
     "Áudio",
     "Palavras-chave",
     "Resposta oral"
    ]
   },
   {
    "titulo": "Produção de texto: bilhete",
    "ano": "3º ano",
    "objetivo": "Escrever um bilhete com destinatário, mensagem e assinatura.",
    "original": "Escreva um bilhete para um colega convidando-o para brincar no recreio. Lembre-se de colocar para quem é, a mensagem, a despedida e quem escreveu.",
    "adaptada": [
     "Veja o modelo de bilhete com cores: PARA (azul), MENSAGEM (verde), ASSINATURA (laranja).",
     "Escolha o colega: escreva o nome depois de “Para:”.",
     "Complete: “Vamos brincar de ______ no recreio?”",
     "Escreva seu nome no final."
    ],
    "perfil": "Deficiência intelectual",
    "estrategias": [
     "Modelo pronto",
     "Apoio visual",
     "Frases para completar"
    ]
   },
   {
    "titulo": "Ortografia: palavras com R e RR",
    "ano": "2º ano",
    "objetivo": "Diferenciar o som de R e RR entre vogais.",
    "original": "Complete as palavras com R ou RR: ca__o, ba__ata, ga__afa, ca__inho, te__a, macaco.",
    "adaptada": [
     "Ouça cada palavra com o som bem marcado.",
     "Olhe a figura: 🚗 ca__o (R ou RR?)",
     "Arraste a letra certa para cada palavra (cartões).",
     "Leia a palavra completa em voz alta."
    ],
    "perfil": "TDAH",
    "estrategias": [
     "Uma palavra por vez",
     "Imagens",
     "Material manipulável"
    ]
   }
  ]
 },
 {
  "slug": "matematica",
  "nome": "Matemática",
  "emoji": "➗",
  "cor": "#5b5bd6",
  "resumo": "Números, operações e frações com material concreto, etapas curtas e representação visual.",
  "aulas": [
   {
    "titulo": "Frações com pizza",
    "ano": "5º ano",
    "objetivo": "Reconhecer frações como partes de um inteiro.",
    "original": "Uma pizza foi dividida em 8 partes iguais. Joana comeu 3 partes e Davi comeu 2 partes. Que fração da pizza Joana comeu? Que fração Davi comeu? Quantas partes sobraram? Represente a resposta com um desenho.",
    "adaptada": [
     "Observe a pizza dividida em 8 partes iguais 🍕.",
     "Joana comeu 3 partes. Escreva: __/8.",
     "Davi comeu 2 partes. Escreva: __/8.",
     "Conte quantas partes sobraram.",
     "Pinte a pizza: vermelho = Joana, azul = Davi."
    ],
    "perfil": "TDAH",
    "estrategias": [
     "Etapas curtas",
     "Apoio visual",
     "Pausas"
    ]
   },
   {
    "titulo": "Sistema monetário: o mercadinho",
    "ano": "3º ano",
    "objetivo": "Resolver situações de compra e troco com cédulas e moedas.",
    "original": "Maria tem R$ 20,00 e comprou um caderno de R$ 12,00 e uma caneta de R$ 3,00. Quanto ela gastou? Quanto recebeu de troco?",
    "adaptada": [
     "Pegue as cédulas de brinquedo: R$ 20,00.",
     "Separe R$ 12,00 para o caderno 📒.",
     "Separe R$ 3,00 para a caneta 🖊️.",
     "Conte o dinheiro que sobrou: esse é o troco."
    ],
    "perfil": "Deficiência intelectual",
    "estrategias": [
     "Material concreto",
     "Situação do cotidiano",
     "Etapas"
    ]
   },
   {
    "titulo": "Gráfico de barras: frutas preferidas",
    "ano": "4º ano",
    "objetivo": "Ler e interpretar dados em gráfico de barras.",
    "original": "Observe o gráfico com as frutas preferidas da turma e responda: qual fruta teve mais votos? Qual teve menos? Quantos alunos votaram ao todo?",
    "adaptada": [
     "Gráfico ampliado, com alto contraste e números em cada barra.",
     "Passe o dedo na barra mais alta: qual fruta é?",
     "Agora a barra mais baixa.",
     "Some os números das barras (pode usar a calculadora)."
    ],
    "perfil": "Baixa visão",
    "estrategias": [
     "Fonte ampliada",
     "Alto contraste",
     "Gráfico tátil"
    ]
   }
  ]
 },
 {
  "slug": "ciencias",
  "nome": "Ciências",
  "emoji": "🔬",
  "cor": "#14b8a6",
  "resumo": "Fenômenos da natureza e do corpo humano com experimentos, imagens e vídeos legendados.",
  "aulas": [
   {
    "titulo": "O ciclo da água",
    "ano": "5º ano",
    "objetivo": "Compreender as etapas do ciclo da água.",
    "original": "Leia o texto sobre o ciclo da água. Explique o que é evaporação, condensação e precipitação. Desenhe o ciclo da água com setas.",
    "adaptada": [
     "Ouça o texto 🔊 e veja as figuras ampliadas.",
     "Evaporação: o sol aquece a água e ela vira vapor ☀️.",
     "Condensação: o vapor esfria e forma nuvens ☁️.",
     "Precipitação: a água cai como chuva 🌧️.",
     "Cole as figuras na ordem certa do ciclo."
    ],
    "perfil": "Baixa visão",
    "estrategias": [
     "Fonte ampliada",
     "Áudio",
     "Figuras para montar"
    ]
   },
   {
    "titulo": "Os cinco sentidos",
    "ano": "1º ano",
    "objetivo": "Relacionar os órgãos dos sentidos às suas funções.",
    "original": "Ligue cada órgão do sentido à sua função: olhos, nariz, boca, orelhas e pele.",
    "adaptada": [
     "Experimente: toque em objetos (áspero, liso) com os olhos fechados.",
     "Cheire: café, limão, flor.",
     "Ligue a figura do órgão ao objeto que você sentiu.",
     "Conte para a turma qual sentido você mais gostou."
    ],
    "perfil": "TEA",
    "estrategias": [
     "Experiência concreta",
     "Rotina antecipada",
     "Respeito sensorial"
    ]
   },
   {
    "titulo": "Plantas: do que elas precisam?",
    "ano": "2º ano",
    "objetivo": "Identificar água, luz e solo como necessidades das plantas.",
    "original": "Escreva um texto explicando o que as plantas precisam para viver e crescer.",
    "adaptada": [
     "Observe 3 feijões: com água e luz, sem água, sem luz.",
     "Tire uma foto ou desenhe cada um depois de 5 dias.",
     "Marque ✓ no que a planta precisa: água, luz, solo, chocolate.",
     "Grave um áudio contando o que descobriu."
    ],
    "perfil": "Surdez",
    "estrategias": [
     "Experimento",
     "Registro visual",
     "Vídeo em Libras"
    ]
   }
  ]
 },
 {
  "slug": "historia",
  "nome": "História",
  "emoji": "🏛️",
  "cor": "#dc2626",
  "resumo": "Tempo, memória e sociedade com linhas do tempo visuais, imagens e histórias de vida.",
  "aulas": [
   {
    "titulo": "Linha do tempo da minha vida",
    "ano": "2º ano",
    "objetivo": "Organizar fatos da própria vida em ordem cronológica.",
    "original": "Escreva os principais acontecimentos da sua vida em ordem, desde que você nasceu até hoje.",
    "adaptada": [
     "Traga 4 fotos (ou desenhos) de momentos da sua vida.",
     "Coloque as fotos em ordem: bebê → hoje.",
     "Escreva ou fale uma palavra para cada foto.",
     "Apresente sua linha do tempo para a turma."
    ],
    "perfil": "Deficiência intelectual",
    "estrategias": [
     "Imagens pessoais",
     "Ordem concreta",
     "Apresentação oral"
    ]
   },
   {
    "titulo": "Povos indígenas do Brasil",
    "ano": "4º ano",
    "objetivo": "Reconhecer a diversidade dos povos indígenas e suas contribuições.",
    "original": "Leia o texto sobre os povos indígenas e responda: o que são povos indígenas? Cite três contribuições indígenas para a cultura brasileira.",
    "adaptada": [
     "Assista ao vídeo legendado sobre povos indígenas.",
     "Veja as imagens: mandioca, rede, palavras como 'pipoca'.",
     "Escolha 3 imagens que mostram contribuições indígenas.",
     "Conte o que mais chamou sua atenção."
    ],
    "perfil": "Surdez",
    "estrategias": [
     "Vídeo legendado",
     "Libras",
     "Imagens"
    ]
   },
   {
    "titulo": "Construção de Brasília",
    "ano": "5º ano",
    "objetivo": "Compreender por que e como Brasília foi construída.",
    "original": "Pesquise e escreva sobre a construção de Brasília: quando foi inaugurada, quem foi o presidente e por que a capital foi transferida.",
    "adaptada": [
     "Etapa 1: Brasília foi inaugurada em 21 de abril de 1960.",
     "Etapa 2: O presidente era Juscelino Kubitschek.",
     "Etapa 3: A capital saiu do Rio de Janeiro para o centro do país.",
     "Etapa 4: Responda: por que levar a capital para o centro?"
    ],
    "perfil": "TDAH",
    "estrategias": [
     "Etapas curtas",
     "Palavras-chave",
     "Pausas"
    ]
   }
  ]
 },
 {
  "slug": "geografia",
  "nome": "Geografia",
  "emoji": "🗺️",
  "cor": "#16a34a",
  "resumo": "Espaço, mapas e paisagens com mapas táteis, cores e exploração do lugar onde o aluno vive.",
  "aulas": [
   {
    "titulo": "Regiões do Brasil",
    "ano": "6º ano",
    "objetivo": "Localizar as cinco regiões brasileiras no mapa.",
    "original": "Observe o mapa do Brasil. Pinte cada região com uma cor diferente. Escreva o nome de um estado de cada região. Em qual região fica Brasília?",
    "adaptada": [
     "Use o mapa em relevo ou ampliado.",
     "Pinte o Norte de verde.",
     "Pinte o Centro-Oeste de amarelo e encontre o DF ⭐.",
     "Continue com Nordeste, Sudeste e Sul.",
     "Responda: Brasília fica no Centro-Oeste?"
    ],
    "perfil": "Baixa visão",
    "estrategias": [
     "Mapa tátil",
     "Alto contraste",
     "Uma região por vez"
    ]
   },
   {
    "titulo": "O caminho de casa até a escola",
    "ano": "2º ano",
    "objetivo": "Representar trajetos usando pontos de referência.",
    "original": "Desenhe o mapa do caminho da sua casa até a escola, com os pontos de referência.",
    "adaptada": [
     "Com a família, tire 3 fotos de lugares do caminho.",
     "Cole as fotos em ordem em uma tira de papel.",
     "Desenhe setas entre elas.",
     "Conte o caminho para um colega."
    ],
    "perfil": "TEA",
    "estrategias": [
     "Fotos reais",
     "Sequência visual",
     "Previsibilidade"
    ]
   },
   {
    "titulo": "Paisagem natural e modificada",
    "ano": "3º ano",
    "objetivo": "Diferenciar paisagens naturais e modificadas pelo ser humano.",
    "original": "Escreva a diferença entre paisagem natural e paisagem modificada e dê exemplos.",
    "adaptada": [
     "Veja 6 fotos de paisagens.",
     "Separe em duas caixas: NATURAL 🌳 e MODIFICADA 🏙️.",
     "Explique uma escolha falando ou escrevendo."
    ],
    "perfil": "Dislexia",
    "estrategias": [
     "Classificação com imagens",
     "Resposta oral"
    ]
   }
  ]
 },
 {
  "slug": "ingles",
  "nome": "Inglês",
  "emoji": "🌎",
  "cor": "#0ea5e9",
  "resumo": "Vocabulário e comunicação com músicas, imagens, gestos e repetição divertida.",
  "aulas": [
   {
    "titulo": "Colors (as cores)",
    "ano": "1º ano",
    "objetivo": "Reconhecer e nomear cores em inglês.",
    "original": "Write the colors in English: vermelho, azul, amarelo, verde.",
    "adaptada": [
     "Ouça a música das cores 🎵.",
     "Mostre um objeto RED (vermelho).",
     "Mostre um objeto BLUE (azul).",
     "Pinte cada balão com a cor que ouvir."
    ],
    "perfil": "Dislexia",
    "estrategias": [
     "Áudio",
     "Imagens",
     "Movimento"
    ]
   },
   {
    "titulo": "Greetings (cumprimentos)",
    "ano": "3º ano",
    "objetivo": "Usar cumprimentos simples em inglês.",
    "original": "Complete the dialogue: A: Hello! B: ____. A: How are you? B: ____.",
    "adaptada": [
     "Veja os cartões com desenhos: 👋 Hello, 😊 I'm fine.",
     "Pratique com um colega usando os cartões.",
     "Escolha o cartão certo para completar o diálogo."
    ],
    "perfil": "TEA",
    "estrategias": [
     "Roteiro visual",
     "Prática em dupla",
     "Previsibilidade"
    ]
   },
   {
    "titulo": "Fruits (frutas)",
    "ano": "4º ano",
    "objetivo": "Ampliar vocabulário de alimentos.",
    "original": "Translate: banana, maçã, laranja, uva, morango.",
    "adaptada": [
     "Associe a figura à palavra: 🍎 apple, 🍊 orange, 🍇 grape.",
     "Repita em voz alta.",
     "Jogo da memória com figura e palavra."
    ],
    "perfil": "Surdez",
    "estrategias": [
     "Imagens",
     "Datilologia em Libras",
     "Jogo"
    ]
   }
  ]
 },
 {
  "slug": "artes",
  "nome": "Artes",
  "emoji": "🎨",
  "cor": "#7c3aed",
  "resumo": "Expressão, criação e apreciação com materiais variados e muitas formas de participar.",
  "aulas": [
   {
    "titulo": "Releitura de Tarsila do Amaral",
    "ano": "5º ano",
    "objetivo": "Apreciar e reinterpretar uma obra da arte brasileira.",
    "original": "Observe a obra Abaporu, de Tarsila do Amaral, e faça uma releitura usando lápis de cor.",
    "adaptada": [
     "Observe a obra ampliada e ouça a audiodescrição.",
     "Escolha o material: lápis, tinta, colagem ou massinha.",
     "Crie sua versão do Abaporu.",
     "Dê um título para a sua obra."
    ],
    "perfil": "Deficiência física",
    "estrategias": [
     "Materiais adaptados",
     "Audiodescrição",
     "Escolha do formato"
    ]
   },
   {
    "titulo": "Ritmo com o corpo",
    "ano": "2º ano",
    "objetivo": "Explorar ritmos usando sons do corpo.",
    "original": "Crie uma sequência rítmica com palmas e pés e apresente para a turma.",
    "adaptada": [
     "Sinta a vibração do tambor com as mãos 🥁.",
     "Siga as cartas: 👏 palma, 🦶 pé, ✋ pausa.",
     "Monte sua sequência com 4 cartas.",
     "Apresente com um colega."
    ],
    "perfil": "Surdez",
    "estrategias": [
     "Vibração",
     "Cartões visuais",
     "Dupla"
    ]
   },
   {
    "titulo": "Autorretrato com colagem",
    "ano": "3º ano",
    "objetivo": "Representar a si mesmo valorizando a própria identidade.",
    "original": "Desenhe seu autorretrato.",
    "adaptada": [
     "Olhe-se no espelho e diga 3 coisas de que você gosta em você.",
     "Escolha recortes de revista para montar seu rosto.",
     "Cole e complete com desenho se quiser."
    ],
    "perfil": "TEA",
    "estrategias": [
     "Passo a passo",
     "Escolhas",
     "Tempo flexível"
    ]
   }
  ]
 }
];

const DADOS_EXEMPLOS = {
 "alunos": [
  {
   "ref": "a1",
   "nome": "Davi Almeida",
   "turma": "5º Ano A",
   "caracteristicas": "TDAH. Perde o foco em textos longos e se beneficia de pausas entre as etapas. Gosta de desafios curtos.",
   "recursos": "Instruções curtas, apoio visual, etapas numeradas, tempo adicional."
  },
  {
   "ref": "a2",
   "nome": "Marina Souza",
   "turma": "5º Ano A",
   "caracteristicas": "Baixa visão. Lê melhor com fonte ampliada e alto contraste.",
   "recursos": "Fonte ampliada (24pt), alto contraste, leitura em voz alta, lupa."
  },
  {
   "ref": "a3",
   "nome": "Pedro Henrique",
   "turma": "5º Ano A",
   "caracteristicas": "TEA (autismo). Prefere rotina previsível, linguagem objetiva e exemplos concretos.",
   "recursos": "Rotina visual, linguagem direta, material concreto, antecipação das etapas."
  },
  {
   "ref": "a4",
   "nome": "Sofia Martins",
   "turma": "6º Ano B",
   "caracteristicas": "Surdez. Comunicação principal em Libras; português escrito como segunda língua.",
   "recursos": "Intérprete de Libras, vídeos com legenda, imagens e esquemas visuais."
  },
  {
   "ref": "a5",
   "nome": "Gabriel Costa",
   "turma": "6º Ano B",
   "caracteristicas": "Dislexia. Leitura lenta e troca de letras; compreende muito bem quando escuta.",
   "recursos": "Áudio das instruções, palavras-chave destacadas, respostas orais."
  }
 ],
 "atividades": [
  {
   "ref": "t1",
   "titulo": "Frações com pizza",
   "materia": "matematica",
   "turma": "5º Ano A",
   "objetivo": "Reconhecer frações como partes de um inteiro.",
   "conteudo": "Uma pizza foi dividida em 8 partes iguais. Joana comeu 3 partes e Davi comeu 2 partes. Que fração da pizza Joana comeu? Que fração Davi comeu? Quantas partes sobraram? Represente a resposta com um desenho."
  },
  {
   "ref": "t2",
   "titulo": "O ciclo da água",
   "materia": "ciencias",
   "turma": "5º Ano A",
   "objetivo": "Compreender as etapas do ciclo da água.",
   "conteudo": "Leia o texto sobre o ciclo da água. Explique o que é evaporação. Explique o que é condensação. Explique o que é precipitação. Desenhe o ciclo da água com setas."
  },
  {
   "ref": "t3",
   "titulo": "Interpretação: A cigarra e a formiga",
   "materia": "portugues",
   "turma": "6º Ano B",
   "objetivo": "Identificar personagens, conflito e moral de uma fábula.",
   "conteudo": "Leia a fábula A cigarra e a formiga. Quem são os personagens? Qual é o problema da história? Qual é a moral da fábula? Você concorda com a atitude da formiga? Justifique."
  },
  {
   "ref": "t4",
   "titulo": "Regiões do Brasil",
   "materia": "geografia",
   "turma": "6º Ano B",
   "objetivo": "Localizar as cinco regiões brasileiras no mapa.",
   "conteudo": "Observe o mapa do Brasil. Pinte cada região com uma cor diferente. Escreva o nome de um estado de cada região. Em qual região fica Brasília?"
  },
  {
   "ref": "t5",
   "titulo": "Construção de Brasília",
   "materia": "historia",
   "turma": "5º Ano A",
   "objetivo": "Compreender por que e como Brasília foi construída.",
   "conteudo": "Pesquise sobre a construção de Brasília. Quando a cidade foi inaugurada? Quem era o presidente? Por que a capital foi transferida para o centro do país?"
  },
  {
   "ref": "t6",
   "titulo": "Colors (as cores)",
   "materia": "ingles",
   "turma": "5º Ano A",
   "objetivo": "Reconhecer e nomear cores em inglês.",
   "conteudo": "Ouça a música das cores. Escreva em inglês: vermelho, azul, amarelo e verde. Pinte cada balão com a cor indicada."
  },
  {
   "ref": "t7",
   "titulo": "Releitura do Abaporu",
   "materia": "artes",
   "turma": "5º Ano A",
   "objetivo": "Apreciar e reinterpretar uma obra da arte brasileira.",
   "conteudo": "Observe a obra Abaporu, de Tarsila do Amaral. Escolha um material. Faça a sua releitura da obra. Dê um título para a sua criação."
  }
 ],
 "adaptacoes": [
  {
   "atividade": "t1",
   "aluno": "a1",
   "estrategias": [
    "Utilizar instruções mais curtas",
    "Dividir a atividade em etapas",
    "Utilizar apoio visual"
   ],
   "texto": "Etapa 1: Observe a pizza dividida em 8 partes iguais.\nEtapa 2: Joana comeu 3 partes. Escreva a fração: __/8.\nEtapa 3: Davi comeu 2 partes. Escreva a fração: __/8.\nEtapa 4: Conte quantas partes sobraram.\nEtapa 5: Faça um desenho da pizza e pinte as partes comidas."
  },
  {
   "atividade": "t2",
   "aluno": "a2",
   "estrategias": [
    "Ampliar a fonte e usar alto contraste",
    "Disponibilizar áudio"
   ],
   "texto": "Etapa 1: Ouça o texto sobre o ciclo da água.\nEtapa 2: Evaporação: o sol aquece a água, que vira vapor. Explique com suas palavras.\nEtapa 3: Condensação: o vapor esfria e forma nuvens. Explique.\nEtapa 4: Precipitação: a água cai como chuva. Explique.\nEtapa 5: Monte o ciclo com as figuras ampliadas."
  },
  {
   "atividade": "t3",
   "aluno": "a5",
   "estrategias": [
    "Disponibilizar áudio",
    "Destacar palavras-chave",
    "Permitir resposta oral"
   ],
   "texto": "Etapa 1: Ouça a fábula A CIGARRA e a FORMIGA.\nEtapa 2: Quem são os PERSONAGENS?\nEtapa 3: Qual é o PROBLEMA da história?\nEtapa 4: Qual é a MORAL? Você pode responder falando."
  },
  {
   "atividade": "t2",
   "aluno": "a1",
   "estrategias": [
    "Utilizar instruções mais curtas",
    "Dividir a atividade em etapas",
    "Utilizar apoio visual"
   ],
   "texto": "Etapa 1: Veja a figura do ciclo da água.\nEtapa 2: EVAPORAÇÃO: o sol aquece a água e ela vira vapor.\nEtapa 3: CONDENSAÇÃO: o vapor esfria e forma nuvens.\nEtapa 4: PRECIPITAÇÃO: a água cai como chuva.\nEtapa 5: DESENHE o ciclo com setas."
  },
  {
   "atividade": "t5",
   "aluno": "a1",
   "estrategias": [
    "Dividir a atividade em etapas",
    "Destacar palavras-chave",
    "Prever pausas entre as etapas"
   ],
   "texto": "Etapa 1: Brasília foi inaugurada em 21 de abril de 1960. QUAL é o ano?\nEtapa 2: O presidente era Juscelino Kubitschek (JK). QUEM era o presidente?\nEtapa 3: A capital saiu do Rio de Janeiro e foi para o centro do país.\nEtapa 4: Na sua opinião, POR QUE levar a capital para o centro?"
  },
  {
   "atividade": "t6",
   "aluno": "a1",
   "estrategias": [
    "Disponibilizar áudio",
    "Utilizar apoio visual"
   ],
   "texto": "Etapa 1: Ouça as cores: RED, BLUE, YELLOW, GREEN.\nEtapa 2: RED é vermelho. Escreva RED.\nEtapa 3: BLUE é azul. Escreva BLUE.\nEtapa 4: YELLOW é amarelo e GREEN é verde.\nEtapa 5: Pinte os balões com as cores que você aprendeu."
  },
  {
   "atividade": "t7",
   "aluno": "a3",
   "estrategias": [
    "Antecipar as etapas com rotina visual",
    "Considerar tempo adicional"
   ],
   "texto": "Etapa 1: Observe o Abaporu, de Tarsila do Amaral. O que você vê?\nEtapa 2: Escolha seu material: lápis, tinta, colagem ou massinha.\nEtapa 3: Crie a sua versão do Abaporu.\nEtapa 4: Dê um título para a sua obra."
  }
 ],
 "resultados": [
  {
   "aluno": "a1",
   "atividade": "t1",
   "nivel": "independente",
   "observacao": "Concluiu as 5 etapas com autonomia. As pausas ajudaram."
  },
  {
   "aluno": "a2",
   "atividade": "t2",
   "nivel": "auxilio",
   "observacao": "Precisou de ajuda na etapa 4; fonte ampliada funcionou bem."
  },
  {
   "aluno": "a5",
   "atividade": "t3",
   "nivel": "independente",
   "observacao": "Respondeu oralmente com ótima compreensão da moral."
  },
  {
   "aluno": "a3",
   "atividade": "t4",
   "nivel": "auxilio",
   "observacao": "Com a rotina visual antecipada, completou 4 de 5 regiões."
  },
  {
   "aluno": "a4",
   "atividade": "t2",
   "nivel": "independente",
   "observacao": "O vídeo com Libras fez toda a diferença."
  },
  {
   "aluno": "a1",
   "atividade": "t5",
   "nivel": "nao-concluiu",
   "observacao": "Faltou tempo; retomar a etapa 4 na próxima aula com tempo extra."
  }
 ]
};
