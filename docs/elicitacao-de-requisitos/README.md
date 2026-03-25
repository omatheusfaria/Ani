# Elicitacao de Requisitos

A elicitacao de requisitos e uma atividade central da Engenharia de Requisitos, voltada a identificar, investigar e detalhar as necessidades que um sistema deve atender. Diferentemente de uma simples coleta passiva, a elicitacao exige tecnicas capazes de descobrir requisitos explicitos, implicitos e refinados a partir de stakeholders, documentos e outros artefatos do projeto [1][2].

A importancia da elicitacao de requisitos esta em reduzir ambiguidades, alinhar expectativas e orientar a definicao correta do problema que o software precisa resolver. Quando bem conduzida, ela contribui para a comunicacao entre envolvidos, para a priorizacao de necessidades e para a construcao de um produto mais coerente com o objetivo do projeto [1][2].

No projeto **Ani**, a elicitacao de requisitos foi conduzida a partir de duas tecnicas centrais: um questionario exploratorio aplicado de forma remota e a introspeccao estruturada do designer como stakeholder primario. Como apoio a esse processo, o GDD foi utilizado como base conceitual para consolidar os requisitos levantados.

O Quadro 1 apresenta as tecnicas de elicitacao adotadas no projeto.

## Quadro 1 - Tecnicas de elicitacao utilizadas no projeto Ani

| Tecnica | Aplicacao no projeto | Resultado principal |
| --- | --- | --- |
| Questionario exploratorio | Aplicacao de formulario digital com perguntas sobre jogos narrativos contemplativos, atmosfera, exploracao, diario de memorias e progressao. | Levantamento inicial de percepcoes do publico-alvo sobre ritmo, atmosfera e ausencia de punicao sistemica. |
| Introspeccao estruturada | Analise reflexiva conduzida pelo autor do projeto, tomando o [GDD](../gdd.md) como referencia central. | Derivacao das funcionalidades, restricoes e comportamentos necessarios para viabilizar a experiencia pretendida. |
| Modelagem incremental | Uso progressivo de requisitos, casos de uso, diagramas e demais artefatos para refinar o que foi levantado. | Organizacao e rastreabilidade entre decisoes conceituais e especificacoes tecnicas. |

O Quadro 2 apresenta os principais stakeholders considerados durante a elicitacao.

## Quadro 2 - Stakeholders do projeto Ani na elicitacao de requisitos

| Stakeholder | Papel na elicitacao | Contribuicao principal |
| --- | --- | --- |
| Autor do projeto | Responsavel pela concepcao do jogo e pela derivacao principal dos requisitos. | Definicao da identidade do sistema, das mecanicas e das restricoes conceituais do projeto. |
| Orientador academico | Responsavel pelo acompanhamento metodologico da documentacao. | Apoio na validacao da estrutura dos artefatos e no direcionamento academico do trabalho. |
| Publico-alvo / participantes do questionario | Fonte exploratoria de percepcao e referencia de experiencia de uso. | Indicacoes sobre atmosfera, ritmo, interacao, acessibilidade e expectativa de experiencia contemplativa. |

No caso de **Ani**, o questionario teve alcance menor do que o inicialmente planejado e nem todas as respostas apresentaram detalhamento suficiente para aproveitamento analitico. Ainda assim, as respostas uteis forneceram insumos iniciais relevantes, especialmente sobre ritmo de progressao, valorizacao da atmosfera e rejeicao a punicoes sistemicas em uma experiencia contemplativa.

O Quadro 3 apresenta alguns dos principais resultados obtidos a partir da elicitacao de requisitos.

## Quadro 3 - Resultados da elicitacao de requisitos do projeto Ani

| Tema levantado | Resultado na documentacao |
| --- | --- |
| Progressao por atos | Consolidacao da estrutura em cinco atos filosoficos. |
| Diario e memorias | Definicao do diario como elemento central de registro narrativo. |
| Interacao com objetos | Diferenciacao entre objetos de memoria, restauraveis e contemplativos. |
| Persistencia de progresso | Definicao de save local com estado de jogo, diario e avancos. |
| Direcao contemplativa | Exclusao de combate e de moralidade binaria como eixo do sistema. |
| Ritmo e experiencia de uso | Reforco de uma progressao mais atmosferica, introspectiva e sem punicao excessiva. |

A documentacao complementar da elicitacao pode ser consultada em [elicitacao-de-requisitos.md](./elicitacao-de-requisitos.md).

## Referencias

[1] GOGUEN, Joseph; LINDE, Charlotte. *Techniques for Requirements Elicitation*. Disponivel em: <https://www.cs.ox.ac.uk/publications/publication2405-abstract.html>. Acesso em: 25 mar. 2026.

[2] IBM. *What is requirements management?* Disponivel em: <https://www.ibm.com/think/topics/what-is-requirements-management>. Acesso em: 25 mar. 2026.
