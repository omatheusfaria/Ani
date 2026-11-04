# Elicitação de Requisitos

A elicitação de requisitos é uma atividade central da Engenharia de Requisitos, voltada a identificar, investigar e detalhar as necessidades que um sistema deve atender. Diferentemente de uma simples coleta passiva, a elicitação exige técnicas capazes de descobrir requisitos explícitos, implícitos e refinados a partir de stakeholders, documentos e outros artefatos do projeto [1][2].

A importância da elicitação de requisitos está em reduzir ambiguidades, alinhar expectativas e orientar a definição correta do problema que o software precisa resolver. Quando bem conduzida, ela contribui para a comunicação entre envolvidos, para a priorização de necessidades e para a construção de um produto mais coerente com o objetivo do projeto [1][2].

No projeto **Ani**, foi aplicado um questionário exploratório a 8 participantes do público-alvo, mas suas respostas foram, em geral, vagas e não geraram mecânicas nem decisões de design. Por esse baixo aproveitamento, a especificação se apoiou principalmente na análise documental do GDD e na introspecção estruturada do designer como stakeholder primário. Como etapa complementar de organização, a modelagem incremental foi utilizada para refinar e consolidar os requisitos levantados.

O Quadro 1 apresenta as técnicas de elicitação adotadas no projeto.

## Quadro 1 - Técnicas de elicitação utilizadas no projeto Ani

| Técnica | Aplicação no projeto | Resultado principal |
| --- | --- | --- |
| Análise documental | Leitura sistemática do [GDD](../gdd.md) como fonte primária de requisitos. | Derivação das funcionalidades, restrições e comportamentos a partir da narrativa, das mecânicas, do mundo, da interface, do áudio e das especificações técnicas. |
| Introspecção estruturada | Análise reflexiva conduzida pelo autor do projeto, tomando o [GDD](../gdd.md) como referência central. | Avaliação de quais funcionalidades, comportamentos e restrições o sistema precisa ter para viabilizar a experiência pretendida. |
| Questionário exploratório | Formulário digital com cinco perguntas, respondido por 8 participantes do público-alvo. | Baixo aproveitamento: as respostas foram, em geral, vagas e não geraram mecânicas nem decisões de design. |
| Modelagem incremental | Uso progressivo de requisitos, casos de uso, diagramas e demais artefatos para refinar o que foi levantado. | Organização e rastreabilidade entre decisões conceituais e especificações técnicas. |

O Quadro 2 apresenta os principais stakeholders considerados durante a elicitação.

## Quadro 2 - Stakeholders do projeto Ani na elicitação de requisitos

| Stakeholder | Papel na elicitação | Contribuição principal |
| --- | --- | --- |
| Autor do projeto | Responsável pela concepção do jogo e pela derivação principal dos requisitos. | Definição da identidade do sistema, das mecânicas e das restrições conceituais do projeto. |
| Orientador acadêmico | Responsável pelo acompanhamento metodológico da documentação. | Apoio na validação da estrutura dos artefatos e no direcionamento acadêmico do trabalho. |
| Público-alvo / participantes do questionário | Respondentes do questionário exploratório. | Percepções gerais, registradas em resumo no Apêndice A, que não geraram mecânicas nem decisões de design. |

No caso de **Ani**, o questionário teve baixo aproveitamento: as respostas foram, em geral, vagas. As que tinham algum conteúdo aproveitável foram resumidas e anonimizadas no Apêndice A; os resumos não são transcrições, porque as respostas originais não foram preservadas. Nenhum requisito do projeto tem o questionário como fonte.

O Quadro 3 apresenta alguns dos principais resultados obtidos a partir da elicitação de requisitos.

## Quadro 3 - Resultados da elicitação de requisitos do projeto Ani

| Tema levantado | Resultado na documentação |
| --- | --- |
| Progressão por atos | Consolidação da estrutura em cinco atos filosóficos. |
| Diário e memórias | Definição do diário como elemento central de registro narrativo. |
| Interação com objetos | Diferenciação entre objetos de memória, restauráveis e contemplativos. |
| Persistência de progresso | Definição de save local com estado de jogo, diário e avanços. |
| Direção contemplativa | Exclusão de combate e de moralidade binária como eixo do sistema. |
| Ritmo e experiência de uso | Reforço de uma progressão mais atmosférica, introspectiva e sem punição excessiva. |

O Quadro 4 apresenta algumas histórias de usuário derivadas do levantamento realizado.

## Quadro 4 - Histórias de usuário derivadas da elicitação

| Código | História de usuário |
| --- | --- |
| US01 | Como jogador, quero explorar cenários com fluidez e responsividade para que a imersão não seja quebrada por problemas técnicos. |
| US02 | Como jogador, quero que a atmosfera visual e sonora acompanhe o estado emocional da jornada para que a experiência tenha impacto sensorial e narrativo. |
| US03 | Como jogador, quero uma experiência contemplativa e interpretativa para que o jogo provoque reflexão sem depender de combate ou punição excessiva. |
| US04 | Como jogador, quero perceber transformações no mundo e na narrativa conforme avanço para que a progressão pareça significativa. |

As perguntas do formulário e os resumos das respostas selecionadas encontram-se no Apêndice A, disponível em [apendice-questionario.md](./apendice-questionario.md). A documentação complementar da elicitação pode ser consultada em [elicitacao-de-requisitos.md](./elicitacao-de-requisitos.md).

## Referências

[1] GOGUEN, Joseph; LINDE, Charlotte. *Techniques for Requirements Elicitation*. Disponível em: <https://www.cs.ox.ac.uk/publications/publication2405-abstract.html>. Acesso em: 25.mar.2026.

[2] IBM. *What is requirements management?* Disponível em: <https://www.ibm.com/think/topics/what-is-requirements-management>. Acesso em: 22.mar.2026.
