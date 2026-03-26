# Diagrama Entidade-Relacionamento

O diagrama entidade-relacionamento (DER) é uma técnica de modelagem usada para representar entidades, atributos e relacionamentos de um domínio de dados. Em projetos de software, esse tipo de diagrama ajuda a organizar de forma lógica quais informações precisam existir, como se conectam e quais dependências devem ser respeitadas na persistência [1][2].

A importância do DER está em estruturar os dados do sistema antes da implementação definitiva do mecanismo de armazenamento. Com ele, é possível identificar cardinalidades, dependências e agrupamentos coerentes, reduzindo ambiguidades e facilitando tanto a persistência quanto a manutenção futura da aplicação [1][2].

No projeto **Ani**, o DER é especialmente importante porque o jogo trabalha com progresso narrativo, diário, memórias, objetos interativos e estado salvo da experiência. Mesmo que o salvamento final seja feito por arquivo JSON, a modelagem entidade-relacionamento continua útil para definir quais dados existem no save e como eles se relacionam de forma consistente.

A Figura 1 apresenta o diagrama entidade-relacionamento do projeto **Ani**, elaborado conforme o modelo estudado nas aulas de Engenharia de Software.

## Figura 1 - Diagrama Entidade-Relacionamento do projeto Ani

![Figura 1 - Diagrama Entidade-Relacionamento do projeto Ani](./diagrama-entidade-relacionamento.drawio.svg)

O diagrama evidencia a estrutura dos dados persistidos do jogo e mostra como o progresso do jogador se relaciona com atos, cenários, diário, memórias e objetos interativos.

O Quadro 1 apresenta as entidades, atributos e especializações modeladas no DER.

## Quadro 1 - Estrutura de entidades do projeto Ani

| Entidade | Atributos | Observação |
| --- | --- | --- |
| `Save` | `id_save`, `data_criacao`, `data_ultima_atualizacao` | Representa o estado geral salvo da partida. |
| `Ato` | `id_ato`, `nome`, `descricao` | Representa cada etapa narrativa e filosófica do jogo. |
| `Cenario` | `id_cenario`, `nome`, `tipo`, `descricao` | Representa os cenários vinculados aos atos. |
| `Diario` | `id_diario`, `titulo`, `descricao` | Representa o diário associado ao progresso do jogador. |
| `EntradaDiario` | `id_entrada`, `titulo`, `texto`, `ordem` | Representa cada registro exibido dentro do diário. |
| `Memoria` | `id_memoria`, `titulo`, `conteudo`, `tipo` | Representa os fragmentos narrativos acessados ao longo da experiência. |
| `ObjetoInterativo` | `id_objeto`, `nome`, `descricao` | Entidade genérica para objetos com interação e impacto narrativo. |
| `ObjetoMemoria` | `gatilhoNarrativo` | Especialização de `ObjetoInterativo` voltada a revelar memórias. |
| `ObjetoRestauravel` | `estado` | Especialização de `ObjetoInterativo` voltada à restauração de objetos. |
| `ObjetoContemplativo` | `tempoMinimoObservacao` | Especialização de `ObjetoInterativo` voltada a eventos contemplativos. |

O Quadro 2 apresenta os relacionamentos e as cardinalidades observadas no diagrama.

## Quadro 2 - Relacionamentos do projeto Ani

| Relacionamento | Entidades envolvidas | Cardinalidade interpretada |
| --- | --- | --- |
| `estaEm` | `Save` e `Ato` | Cada save está em um ato; um ato pode estar associado a vários saves. |
| `Contem` | `Ato` e `Cenario` | Um ato contém um ou vários cenários; cada cenário pertence a um ato. |
| `Pertence` | `ObjetoInterativo` e `Cenario` | Cada objeto interativo pertence a um cenário; um cenário pode possuir zero ou vários objetos interativos. |
| `Possui` | `Save` e `Diario` | Cada save possui um diário associado. |
| `Contem` | `Diario` e `EntradaDiario` | Um diário pode conter zero ou várias entradas. |
| `Referencia` | `EntradaDiario` e `Memoria` | Uma entrada pode referenciar uma memória, mantendo o vínculo narrativo no diário. |
| `Revela` | `ObjetoMemoria` e `Memoria` | O objeto de memória atua como gatilho para revelar uma memória. |
| Especialização | `ObjetoInterativo` e seus subtipos | O DER mostra uma generalização para `ObjetoMemoria`, `ObjetoRestauravel` e `ObjetoContemplativo`. |

Essa modelagem ficou coerente com a natureza do jogo porque separa claramente o que é progresso salvo, o que é estrutura narrativa e o que é interação de mundo. Em vez de transformar todas as classes do projeto em entidades de dados, o diagrama foca no que realmente precisa ser organizado para persistência e recuperação da experiência do jogador.

A documentação complementar do DER pode ser consultada em [der.md](./der.md). Os arquivos do diagrama podem ser consultados em [diagrama-entidade-relacionamento.drawio](./diagrama-entidade-relacionamento.drawio) e [diagrama-entidade-relacionamento.drawio.svg](./diagrama-entidade-relacionamento.drawio.svg).

## Referências

[1] IBM. *What is an entity relationship diagram?* Disponível em: <https://www.ibm.com/think/topics/entity-relationship-diagram>. Acesso em: 25 mar. 2026.

[2] LUCIDCHART. *What is an Entity Relationship Diagram (ERD)?* Disponível em: <https://www.lucidchart.com/pages/er-diagrams/>. Acesso em: 25 mar. 2026.
