---
name: "tg-ani-documentacao"
description: "Use ao criar, revisar ou corrigir qualquer documento do TG Ani (GDD, TAP, requisitos, casos de uso, diagramas, capítulos do TG) para manter padrão Fatec/ABNT e consistência."
---

# Documentação do TG "Ani אֲנִי"

Projeto: Trabalho de Graduação de ADS (Fatec Franca "Dr. Thomaz Novelino") sobre o jogo narrativo contemplativo Ani, aventura narrativa contemplativa em 2.5D para PC. O jogo completo será feito na Unreal Engine 5.4.4, com C++, como software para PC; o **protótipo** deste TG (início do Ato I, cerca de dez minutos) é feito em **HTML, CSS e JavaScript com Three.js** e roda no navegador (fica em `jogo/`). Para o protótipo, a tecnologia prevista era Unreal Engine 5.4.4 com C++; a troca, motivada pelo tempo disponível, está registrada no TAP (1.1.6). Metodologia de desenvolvimento: Cascata. Modelo oficial: `tg-modelo-prjSoftware-ads-v2023ago.docx` (fica na pasta local do repositório, mas não é versionado: `*.docx` está no `.gitignore`). Na dúvida sobre formato, abra o modelo e confira; ele prevalece sobre esta skill.

Estado atual: a fase de requisitos e design da Cascata está completa. O que resta no TG (Resumo/Abstract, Desenvolvimento, Resultados e Discussão, Considerações Finais) depende do jogo implementado.

## Fonte de verdade
O repositório é a única fonte, e a `main` do GitHub faz parte dele: antes de trabalhar, sincronize com o remoto (`git fetch` e integre o que houver). Documentos anexados em outros lugares (por exemplo, no projeto do claude.ai) podem estar desatualizados e não valem contra o repositório.

Dentro do repositório, a ordem de precedência é:
1. `gdd.md`: narrativa, personagens, atos, mecânicas.
2. Notas individuais do cofre Obsidian, uma por item:
   - `docs/requisitos/funcionais/RFxxx.md`
   - `docs/requisitos/nao-funcionais/RNFxxx.md`
   - `docs/regras-de-negocio/RNxxx.md`
   - `docs/casos-de-uso/UC-Sxxx.md`
3. `docs/diagrama-de-classe/diagrama-de-classe.drawio` (fonte de classes, atributos, métodos e associações) e o DER (`der.md` e seu `.drawio`).
4. Derivados: os consolidados (`requisitos-funcionais.md` etc.), os diagramas de atividades, estados e sequência em `docs/diagramas/` e o rascunho único do TG (`tg-ani.md`). A versão antiga está em `docs/arquivo/tg-ani-v1.md` e não é mais editada.

**Toda edição de requisito, regra ou caso de uso é feita na nota individual.** Os consolidados são gerados por `scripts/gerar_consolidados.py` e nunca são editados à mão. Depois de alterar notas, rode o script; para só conferir, use `--verificar`. Se um derivado divergir da fonte, corrija o derivado, a menos que o usuário decida o contrário.

Relacionamentos que aparecem só no TG são fracos: registre a fonte e peça confirmação ao usuário.

A lista de trabalho é `docs/correcoes-pendentes.md`. Ao resolver um item, marque-o ali no mesmo commit. Notas de trabalho para seções futuras do TG ficam em `docs/notas-de-trabalho/` (por exemplo, `consideracoes-finais.md`).

## BPMN: não alterar
O BPMN é mantido como está por decisão do autor. Não edite os arquivos do BPMN nem proponha remodelá-lo. Divergências entre o BPMN e o canon (por exemplo, o termo "inventário" ou a ausência dos atos) não são corrigidas; se o usuário pedir, apenas relate.

## Decisões fixas (canon)
- Nome: **Ani אֲנִי** (com niqqud na primeira menção de cada documento). A classe da protagonista no diagrama também se chama `Ani` (nunca `Player`).
- Protagonista: Mulher Cis de aproximadamente 24 anos. Use os pronomes correspondentes em todos os arquivos.
- Engine e linguagem: separe sempre o jogo completo (Unreal Engine 5.4.4 e C++, software para PC; é ele que o diagrama de classes e os demais diagramas UML modelam) do protótipo (Three.js 0.170 e JavaScript, com HTML e CSS, no navegador). As ferramentas listadas no TAP, nos recursos utilizados e no capítulo 3 são as do protótipo. Enhanced Input, GameMode, GameInstance e delegate valem para o jogo completo; o capítulo 4 descreve o protótipo e será reescrito a partir do código real em `jogo/`.
- IA generativa: a produção do protótipo teve apoio de GPT-6 (sprites, com o Sprite Fusion) e Claude Opus 5.5 (modelagem 3D em Three.js); isso é declarado no TAP.
- Casa: o núcleo é a casa de Ani, a começar pelo quarto, um espaço vivido (pôsteres, estante, discos, luminária de plasma). Nunca descreva a casa como "cinzenta, incompleta".
- Atos e visual: os atos marcam etapas narrativas, sem grandes mudanças de paleta; a identidade visual se mantém (RF012). Só a luz e a atmosfera variam com a narrativa, e as memórias seguem o tom da lembrança (felizes, como o parque, são quentes e iluminadas).
- Sem arquétipos: O Arquiteto, A Ceramista e A Criança saíram do jogo. Personagens: os de memória (Mãe, Padrasto, Pretendente/Malu, Primo) e as manifestações.
- Memórias em ordem linear (RF004): a ordem de descoberta é definida pela narrativa de cada ato.
- Sem remapeamento de controles: o antigo RF024 e o antigo UC-S010 foram excluídos; RF022 cobre só vídeo e áudio. RNF006 (acessibilidade) vale para o jogo final, não para o protótipo.
- Mecânicas do início do Ato I: RF024 a RF031 (celular, iluminação, inspeção, objeto-portal, comidas, minigames, acompanhante, salvamento automático), RN007 e RN008, UC-S015 a UC-S017.
- Mundo: o jogo parte do presente, no quarto de Ani, e se aprofunda na mente dela; objetos do quarto funcionam como portais para memórias vividas dentro da cabeça dela (a tirinha de fotos leva à memória do parque).
- Atos e capítulos: no jogo, cada ato aparece como "Capítulo" (Ato I = Capítulo 1) e se divide em fases. Na documentação, use "ato". O Ato I começa no quarto (presente) e tem o parque como uma de suas fases; as demais fases ainda serão desenvolvidas.
- Malu (Malu Ferraz) é a pretendente de Ani. Nos personagens de memória, use "Pretendente" (nunca "Namorada").
- Cinco atos: I Zapffe (peso), II Mainländer/Bahnsen (ecos de decisão), III Wabi-Sabi (Kintsugi), IV Mono no Aware/Ikigai (contemplação ativa), V Yugen (dissolução).
- Grafias: "Mainländer", "irresolúvel", "Kintsugi", "Wabi-Sabi", "Mono no Aware", "Yugen".
- Termo do sistema de memórias: "diário de memórias" (nunca "inventário"), exceto no BPMN, que não é alterado.
- Controles: teclado e gamepad no padrão Xbox (analógico esquerdo/direcional para mover para os lados e em profundidade, A para interagir, B para voltar, analógico direito para olhar e rolar o feed em primeira pessoa, Y para o diário, ainda fora do protótipo, Menu para pausar). Fluxos de casos de uso usam "aciona o comando de…" e as tabelas de controles citam os dois.
- Sem combate, sem moralidade, sem HUD, sem finais múltiplos, sem punição sistêmica (morte/game over), sem opção de pular cenas. Exceção registrada: os minigames das barracas do parque (Ato I) têm placar e HUD próprios enquanto duram, sem efeito na progressão.
- O jogo exibe um aviso de conteúdo sensível (com o CVV, 188) antes de começar, a cada acesso (RF020, ligado ao UC-S013 e ao UC-S012). A classificação indicativa não é exibida enquanto o protótipo não for comercializado; se for, autoclassificar pelo Guia Prático (análise de 09.nov.2026: não recomendado para menores de 10 anos, descritor "Temas sensíveis").
- Sequência linear de memórias do Ato I (o ato termina quando a última memória da sequência é registrada; não há limiar mínimo): descrita só na RN004; RF006 e RF019 citam a RN004 sem repeti-la.
- Puzzles (RF007, UC-S014): têm várias etapas (abrir, tentar, errar sem punição, concluir). O jogador pode sair a qualquer momento e o puzzle volta ao estado inicial, sem salvar progresso parcial. Não há botão de dica nos requisitos (registrado como possibilidade futura). Quantidade e distribuição por ato são definidas no level design, durante a implementação. Os tipos de puzzle ainda estão como [definir]; não invente.

## Elicitação (fato registrado, não alterar)
- Foi aplicado um questionário a 8 participantes. As respostas foram vagas e não geraram mecânicas nem decisões de design; a especificação se apoiou na análise do GDD e na introspecção do autor.
- As respostas originais não foram preservadas. O Apêndice A se chama "Perguntas do questionário e resumos das respostas selecionadas" e declara que traz resumos. Nunca apresente os resumos como respostas literais, nunca invente respostas e nunca atribua ao questionário requisitos que vieram de outra fonte.

## Formatos exigidos pelo modelo da Fatec
O modelo marca as opções com caixas de seleção, por exemplo `( ) Oculto (X) Evidente`. Os consolidados seguem esse formato.

### Requisitos funcionais (Quadro "Requisitos Funcionais do sistema")
- Cabeçalho do item: `RFxxx-Nome` | Categoria: (Oculto / Evidente) | Prioridade: (Altíssima / Alta / Média / Baixa).
- Linha seguinte: **Descrição**: "O sistema deve…".
- Não há coluna de ator.
- Categoria: **Evidente** quando o jogador percebe o efeito do requisito, mesmo que não o acione; **Oculto** quando ele ocorre sem o jogador perceber (contagens internas, salvamento em segundo plano). Num jogo narrativo, a maioria dos RFs é Evidente; isso é esperado.

### Requisitos não funcionais (Quadro "Requisitos Não Funcionais do sistema")
- Uma linha por RNF: `RNFxxx-Nome` | descrição ("O sistema…") | Tipo | (Desejável / Obrigatório) | (Permanente / Transitório).
- As duas classificações são obrigatórias e independentes.

### Regras de negócio (Quadro "Regras de Negócio do sistema")
- `RNxxx - Nome` seguido de **Descrição**.

### Casos de uso
- Cada caso de uso tem seu próprio quadro: "Quadro N – Use Case Nome", com a primeira linha "Caso de Uso – Nome".
- Campos, nesta ordem: ID, Descrição, Ator Primário, Pré-condição, Cenário Principal, Pós-condição, Cenário Alternativo (numerado pelo passo do principal: 4a, 4a.1).
- O ator primário é quem inicia o cenário principal.
- Obrigatórios: Índice de Casos de Uso e Diagrama de Casos de Uso. A especificação de cada caso de uso é a critério do orientador.
- Relações opcionais usam «extend» (nunca "extends"). Casos que estendem outros não precisam de ligação direta com o Jogador.
- Campos de trabalho (nome revisado, observações arquiteturais, indicação) ficam só nas notas e não vão para o TG.
- Referência rápida: UC-S001 exploração/movimentação (também recebe RF010, RF011, RF012 e RF018); UC-S002 Interagir com Objetos; UC-S006 Pausar (estendido por UC-S007, UC-S010, UC-S011); UC-S012 Continuar Jogo; UC-S013 Iniciar Novo Jogo; UC-S014 Resolver Puzzle; UC-S015 Usar Celular; UC-S016 Comprar e Consumir Comida; UC-S017 Jogar Minigame.

### IDs
- `RF001`, `RNF001`, `RN001`: sequência contínua, sem saltos. Ao remover um item, renumere os seguintes e propague a renumeração.
- Casos de uso: o modelo mostra `UC 001`; o projeto usa `UC-S001` por escolha própria. Mantenha `UC-S001` em todos os arquivos.

## Estrutura do TG (modelo Fatec, com as decisões do projeto)
- Capa, folha de rosto, Resumo (100 a 250 palavras, parágrafo único, 3 a 6 palavras-chave em ordem alfabética) e Abstract (em itálico).
- **1 Introdução**: tema, questão-problema, hipóteses, objetivos, justificativa, relevância, metodologias e estrutura de capítulos.
  - **1.1 TAP**, com subseções 1.1.1 em diante.
- **Viabilidade: não entra** (confirmado com o orientador). Por isso a numeração abaixo começa em 2.
- **2 Levantamento de Requisitos**: elicitação, BPMN, RF, RNF, regras de negócio, casos de uso, 2.7 diagrama de classes, 2.8 atividades, 2.9 estados, 2.10 sequência, 2.11 DER. A Matriz de Rastreabilidade foi **omitida por decisão do autor**.
- **3 Ferramentas e Métodos**: cada ferramenta com versão, tipo de licença, site oficial e justificativa. Nunca preencha uma versão sem confirmação: use "[preencher]".
- **4 Desenvolvimento**: processo, trechos de código comentados e capturas de tela.
- **5 Resultados e Discussão**: Análise de Portabilidade, Cálculo das Métricas e Proposta Comercial.
- Considerações Finais e Referências.
- Apêndices: A = perguntas do questionário e resumos das respostas; B = missão, visão e valores (aprovados); C = GDD resumido (pode ser removido depois). Confirmar com o orientador se A e B ficam como Apêndice ou Anexo.

Se a numeração real do `tg-ani.md` divergir desta lista, siga o arquivo e avise o usuário. Ao inserir figuras, renumere as seguintes para manter a sequência contínua.

## Regras gerais de redação do modelo
- Todo quadro, tabela ou figura é citado no texto antes de aparecer.
- Cada seção conceitual (RF, caso de uso, diagramas etc.) explica o que é e sua importância citando fontes.

## Regras de diagramas UML
- O diagrama de classes é a fonte de métodos e associações. Diagramas de atividades, estados e sequência só usam classes, métodos e associações que existem nele. Se faltar algum, liste para o usuário decidir e registre em `correcoes-pendentes.md`; nunca invente.
- Losango cheio = composição; losango vazio = agregação. O texto descreve o mesmo tipo que o .drawio mostra. Jogo→Ato e Jogo→Cenario são composições; Ato–Cenario é 1 : 1..*.
- Arquitetura atual de `Jogo`:
  - atributo `estadoAtual : EstadoJogo` (Menu, Jogando, Pausado, Crise, Encerrado);
  - toda transição de estado passa por `alterarEstado(novoEstado: EstadoJogo)` (`pausar()`, `retomar()`, `encerrar()` e a crise);
  - `salvarProgresso()` coleta ato, diário e casa e chama `Save.salvar()`; o Jogador aciona o comando, nunca chama `Save` direto;
  - `carregarProgresso()` restaura ato, `Diario.restaurar()`, `Cenario.restaurarEstado()` e carrega o cenário.
- Associação bidirecional `Jogo` ↔ `Ani` (1 : 1). `Jogo` alcança o `Diario` por meio de `Ani`, sem associação direta. `Ani` chama `Diario.adicionarEntrada()`.
- A crise é estado emocional de `Ani` (`iniciarCrise()`, `encerrarCrise()`), que notifica `Jogo` por `alterarEstado(Crise / Jogando)`. No jogo completo, em Unreal, essa notificação é um delegate.
- Toda classe citada no texto existe no diagrama ou é marcada como "fora do escopo do diagrama".
- Toda relação do diagrama consta nas tabelas de relacionamento do texto.
- Tipos de atributos no estilo Unreal/C++ (o diagrama modela o jogo completo): `bool`, `int32`, `float`, `FString`, `TArray<...>`. Nomes de classe e enums ficam sem prefixos `U`/`A`/`F`/`E`, que são da implementação.
- **Todos os diagramas são feitos no draw.io**, para o usuário editar com o mouse e para o TG ter um estilo visual único (preto e branco, título em caixa de texto em negrito, formas UML nativas). Não use PlantUML nem outro formato textual.
- Diagramas de atividades, estados e sequência ficam em `docs/diagramas/` como `.drawio`; o `.drawio.svg` ao lado é gerado pelo usuário. Todo SVG exportado usa o sufixo `.drawio.svg` (nunca só `.svg`).
- O layout dos diagramas é feito pelo usuário. Ao alterar conteúdo de um `.drawio` existente, edite só as células necessárias e preserve posições e formas; nunca regere o arquivo inteiro.
- Nos diagramas de sequência, prenda as mensagens às linhas de vida (arestas com origem e destino nas linhas de vida), para que acompanhem quando o usuário arrastar uma linha de vida.
- Ao criar ou editar qualquer `.drawio`, valide o XML e avise o usuário para abrir e salvar o `.drawio.svg` (ele usa a extensão Draw.io Integration no VS Code). Não edite o SVG à mão se puder evitar.

## Referências
- Siga a ABNT NBR 6023:2002, como o modelo exige, com acesso no formato "Acesso em: 22.mar.2026" (confirmar com o orientador). Citações de internet no texto: "(chave, data ou s.d., online)".
- Uma única edição por obra. BPMN: OMG, BPMN 2.0.2, 2014.
- Toda citação no texto tem entrada nas referências, e vice-versa.

## Checklist antes de concluir qualquer alteração
1. A alteração foi feita na nota individual (não no consolidado)? Depois disso, `scripts/gerar_consolidados.py` foi rodado?
2. Buscar (grep) os termos alterados em TODOS os arquivos e propagar a mudança (TG, GDD, TAP, diagramas, READMEs), exceto o BPMN.
3. Verificar o canon (protagonista, engine, grafias, atos, "diário de memórias", controles, puzzles).
4. Verificar a numeração contínua dos IDs e das figuras.
5. Verificar o frontmatter das notas: relacionamentos como IDs em texto puro e `rastreabilidade_pendente` atualizado.
6. Diagramas alterados: XML do `.drawio` validado e usuário avisado para reexportar o `.drawio.svg`.
7. Atualizar `docs/correcoes-pendentes.md`.
8. Antes de editar ou regerar qualquer arquivo, rode `git status`. Se ele tiver alterações não commitadas que o assistente não fez (layout salvo pelo usuário, edições de outra sessão), não sobrescreva nem commite: pare e pergunte se deve commitá-las primeiro.
9. Nunca usar push forçado; se o remoto tiver commits novos, integrar com merge e mostrar os conflitos ao usuário.
10. Listar ao usuário o que mudou, arquivo por arquivo.