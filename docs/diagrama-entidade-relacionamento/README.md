# Diagrama Entidade-Relacionamento

O diagrama entidade-relacionamento (DER) e uma tecnica de modelagem usada para representar entidades, atributos e relacionamentos de um dominio de dados. Em projetos de software, esse tipo de diagrama ajuda a organizar de forma logica quais informacoes precisam existir, como se conectam e quais dependencias devem ser respeitadas na persistencia [1][2].

A importancia do DER esta em estruturar os dados do sistema antes da implementacao definitiva do mecanismo de armazenamento. Com ele, e possivel identificar cardinalidades, dependencias e agrupamentos coerentes, reduzindo ambiguidades e facilitando tanto a persistencia quanto a manutencao futura da aplicacao [1][2].

No projeto **Ani**, o DER e especialmente importante porque o jogo trabalha com progresso narrativo, diario, memorias, objetos interativos e estado salvo da experiencia. Mesmo que o salvamento final seja feito por arquivo JSON, a modelagem entidade-relacionamento continua util para definir quais dados existem no save e como eles se relacionam de forma consistente.

A Figura 1 apresenta o diagrama entidade-relacionamento do projeto **Ani**, elaborado conforme o modelo estudado nas aulas de Engenharia de Software.

## Figura 1 - Diagrama Entidade-Relacionamento do projeto Ani

![Figura 1 - Diagrama Entidade-Relacionamento do projeto Ani](./diagrama-entidade-relacionamento.drawio.svg)

O diagrama evidencia a estrutura dos dados persistidos do jogo e mostra como o progresso do jogador se relaciona com atos, cenarios, diario, memorias e objetos interativos.

O Quadro 1 apresenta as entidades, atributos e especializacoes modeladas no DER.

## Quadro 1 - Estrutura de entidades do projeto Ani

| Entidade | Atributos | Observacao |
| --- | --- | --- |
| `Save` | `id_save`, `data_criacao`, `data_ultima_atualizacao` | Representa o estado geral salvo da partida. |
| `Ato` | `id_ato`, `nome`, `descricao` | Representa cada etapa narrativa e filosofica do jogo. |
| `Cenario` | `id_cenario`, `nome`, `tipo`, `descricao` | Representa os cenarios vinculados aos atos. |
| `Diario` | `id_diario`, `titulo`, `descricao` | Representa o diario associado ao progresso do jogador. |
| `EntradaDiario` | `id_entrada`, `titulo`, `texto`, `ordem` | Representa cada registro exibido dentro do diario. |
| `Memoria` | `id_memoria`, `titulo`, `conteudo`, `tipo` | Representa os fragmentos narrativos acessados ao longo da experiencia. |
| `ObjetoInterativo` | `id_objeto`, `nome`, `descricao` | Entidade generica para objetos com interacao e impacto narrativo. |
| `ObjetoMemoria` | `gatilhoNarrativo` | Especializacao de `ObjetoInterativo` voltada a revelar memorias. |
| `ObjetoRestauravel` | `estado` | Especializacao de `ObjetoInterativo` voltada a restauracao de objetos. |
| `ObjetoContemplativo` | `tempoMinimoObservacao` | Especializacao de `ObjetoInterativo` voltada a eventos contemplativos. |

O Quadro 2 apresenta os relacionamentos e as cardinalidades observadas no diagrama.

## Quadro 2 - Relacionamentos do projeto Ani

| Relacionamento | Entidades envolvidas | Cardinalidade interpretada |
| --- | --- | --- |
| `estaEm` | `Save` e `Ato` | Cada save esta em um ato; um ato pode estar associado a varios saves. |
| `Contem` | `Ato` e `Cenario` | Um ato contem um ou varios cenarios; cada cenario pertence a um ato. |
| `Pertence` | `ObjetoInterativo` e `Cenario` | Cada objeto interativo pertence a um cenario; um cenario pode possuir zero ou varios objetos interativos. |
| `Possui` | `Save` e `Diario` | Cada save possui um diario associado. |
| `Contem` | `Diario` e `EntradaDiario` | Um diario pode conter zero ou varias entradas. |
| `Referencia` | `EntradaDiario` e `Memoria` | Uma entrada pode referenciar uma memoria, mantendo o vinculo narrativo no diario. |
| `Revela` | `ObjetoMemoria` e `Memoria` | O objeto de memoria atua como gatilho para revelar uma memoria. |
| Especializacao | `ObjetoInterativo` e seus subtipos | O DER mostra uma generalizacao para `ObjetoMemoria`, `ObjetoRestauravel` e `ObjetoContemplativo`. |

Essa modelagem ficou coerente com a natureza do jogo porque separa claramente o que e progresso salvo, o que e estrutura narrativa e o que e interacao de mundo. Em vez de transformar todas as classes do projeto em entidades de dados, o diagrama foca no que realmente precisa ser organizado para persistencia e recuperacao da experiencia do jogador.

A documentacao complementar do DER pode ser consultada em [der.md](./der.md). Os arquivos do diagrama podem ser consultados em [diagrama-entidade-relacionamento.drawio](./diagrama-entidade-relacionamento.drawio) e [diagrama-entidade-relacionamento.drawio.svg](./diagrama-entidade-relacionamento.drawio.svg).

## Referencias

[1] IBM. *What is an entity relationship diagram?* Disponivel em: <https://www.ibm.com/think/topics/entity-relationship-diagram>. Acesso em: 25 mar. 2026.

[2] LUCIDCHART. *What is an Entity Relationship Diagram (ERD)?* Disponivel em: <https://www.lucidchart.com/pages/er-diagrams/>. Acesso em: 25 mar. 2026.
