# Documentação do DER

## Entidades principais

### Save

Representa a unidade de persistência da partida.

| Campo | Descrição |
| --- | --- |
| `id_save` | Identificador do save. |
| `data_criacao` | Data de criação do registro de save. |
| `data_ultima_atualizacao` | Data da última alteração do save. |

### Ato

Representa cada etapa da progressão narrativa do jogo.

| Campo | Descrição |
| --- | --- |
| `id_ato` | Identificador do ato. |
| `nome` | Nome do ato. |
| `descricao` | Descrição do ato. |

### Cenario

Representa os cenários pertencentes aos atos.

| Campo | Descrição |
| --- | --- |
| `id_cenario` | Identificador do cenário. |
| `nome` | Nome do cenário. |
| `tipo` | Tipo do cenário. |
| `descricao` | Descrição resumida do cenário. |

### Diario

Representa o diário associado ao progresso salvo.

| Campo | Descrição |
| --- | --- |
| `id_diario` | Identificador do diário. |
| `titulo` | Título do diário. |
| `descricao` | Descrição do diário. |

### EntradaDiario

Representa cada entrada consultável no diário.

| Campo | Descrição |
| --- | --- |
| `id_entrada` | Identificador da entrada. |
| `titulo` | Título exibido no diário. |
| `texto` | Conteúdo textual da entrada. |
| `ordem` | Ordem de apresentação da entrada. |

### Memoria

Representa os fragmentos narrativos relacionados ao diário e aos objetos do mundo.

| Campo | Descrição |
| --- | --- |
| `id_memoria` | Identificador da memória. |
| `titulo` | Título da memória. |
| `conteudo` | Conteúdo da memória. |
| `tipo` | Tipo da memória. |

### ObjetoInterativo

Representa a superentidade dos objetos interativos do jogo.

| Campo | Descrição |
| --- | --- |
| `id_objeto` | Identificador do objeto. |
| `nome` | Nome do objeto. |
| `descricao` | Descrição do objeto. |

## Especializações

O diagrama mostra uma especialização de `ObjetoInterativo` em três subtipos:

| Subtipo | Atributo próprio | Finalidade |
| --- | --- | --- |
| `ObjetoMemoria` | `gatilhoNarrativo` | Dispara a revelação de memórias. |
| `ObjetoRestauravel` | `estado` | Guarda o estado de objetos restauráveis. |
| `ObjetoContemplativo` | `tempoMinimoObservacao` | Controla interações contemplativas por tempo de observação. |

## Relacionamentos

| Relacionamento | Descrição |
| --- | --- |
| `Save` `estaEm` `Ato` | Define em qual ato o save se encontra. |
| `Ato` `Contem` `Cenario` | Liga cada ato aos cenários que o compõem. |
| `ObjetoInterativo` `Pertence` `Cenario` | Define que cada objeto interativo pertence a um cenário. |
| `Save` `Possui` `Diario` | Associa o save ao diário do jogador. |
| `Diario` `Contem` `EntradaDiario` | Estrutura as entradas internas do diário. |
| `EntradaDiario` `Referencia` `Memoria` | Liga as entradas do diário aos fragmentos narrativos. |
| `ObjetoMemoria` `Revela` `Memoria` | Mostra que determinados objetos são gatilhos para memórias. |

## Justificativa da modelagem

Esse DER ficou coerente com o projeto porque:

- representa o progresso salvo do jogador por meio de `Save`;
- organiza a progressão narrativa com `Ato` e `Cenario`;
- preserva o papel central do `Diario` e das `Memoria`;
- modela objetos interativos com herança, sem perder as diferenças entre tipos de objeto;
- evita trazer para o DER elementos mais comportamentais, que fazem mais sentido no diagrama de classes do que no modelo de dados.

Mesmo em um jogo que use JSON para save, essa estrutura continua válida como modelo conceitual de persistência.
