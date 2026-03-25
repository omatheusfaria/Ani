# Documentacao do DER

## Entidades principais

### Save

Representa a unidade de persistencia da partida.

| Campo | Descricao |
| --- | --- |
| `id_save` | Identificador do save. |
| `data_criacao` | Data de criacao do registro de save. |
| `data_ultima_atualizacao` | Data da ultima alteracao do save. |

### Ato

Representa cada etapa da progressao narrativa do jogo.

| Campo | Descricao |
| --- | --- |
| `id_ato` | Identificador do ato. |
| `nome` | Nome do ato. |
| `descricao` | Descricao do ato. |

### Cenario

Representa os cenarios pertencentes aos atos.

| Campo | Descricao |
| --- | --- |
| `id_cenario` | Identificador do cenario. |
| `nome` | Nome do cenario. |
| `tipo` | Tipo do cenario. |
| `descricao` | Descricao resumida do cenario. |

### Diario

Representa o diario associado ao progresso salvo.

| Campo | Descricao |
| --- | --- |
| `id_diario` | Identificador do diario. |
| `titulo` | Titulo do diario. |
| `descricao` | Descricao do diario. |

### EntradaDiario

Representa cada entrada consultavel no diario.

| Campo | Descricao |
| --- | --- |
| `id_entrada` | Identificador da entrada. |
| `titulo` | Titulo exibido no diario. |
| `texto` | Conteudo textual da entrada. |
| `ordem` | Ordem de apresentacao da entrada. |

### Memoria

Representa os fragmentos narrativos relacionados ao diario e aos objetos do mundo.

| Campo | Descricao |
| --- | --- |
| `id_memoria` | Identificador da memoria. |
| `titulo` | Titulo da memoria. |
| `conteudo` | Conteudo da memoria. |
| `tipo` | Tipo da memoria. |

### ObjetoInterativo

Representa a superentidade dos objetos interativos do jogo.

| Campo | Descricao |
| --- | --- |
| `id_objeto` | Identificador do objeto. |
| `nome` | Nome do objeto. |
| `descricao` | Descricao do objeto. |

## Especializacoes

O diagrama mostra uma especializacao de `ObjetoInterativo` em tres subtipos:

| Subtipo | Atributo proprio | Finalidade |
| --- | --- | --- |
| `ObjetoMemoria` | `gatilhoNarrativo` | Dispara a revelacao de memorias. |
| `ObjetoRestauravel` | `estado` | Guarda o estado de objetos restauraveis. |
| `ObjetoContemplativo` | `tempoMinimoObservacao` | Controla interacoes contemplativas por tempo de observacao. |

## Relacionamentos

| Relacionamento | Descricao |
| --- | --- |
| `Save` `estaEm` `Ato` | Define em qual ato o save se encontra. |
| `Ato` `Contem` `Cenario` | Liga cada ato aos cenarios que o compoem. |
| `ObjetoInterativo` `Pertence` `Cenario` | Define que cada objeto interativo pertence a um cenario. |
| `Save` `Possui` `Diario` | Associa o save ao diario do jogador. |
| `Diario` `Contem` `EntradaDiario` | Estrutura as entradas internas do diario. |
| `EntradaDiario` `Referencia` `Memoria` | Liga as entradas do diario aos fragmentos narrativos. |
| `ObjetoMemoria` `Revela` `Memoria` | Mostra que determinados objetos sao gatilhos para memorias. |

## Justificativa da modelagem

Esse DER ficou coerente com o projeto porque:

- representa o progresso salvo do jogador por meio de `Save`;
- organiza a progressao narrativa com `Ato` e `Cenario`;
- preserva o papel central do `Diario` e das `Memoria`;
- modela objetos interativos com heranca, sem perder as diferencas entre tipos de objeto;
- evita trazer para o DER elementos mais comportamentais, que fazem mais sentido no diagrama de classes do que no modelo de dados.

Mesmo em um jogo que use JSON para save, essa estrutura continua valida como modelo conceitual de persistencia.
