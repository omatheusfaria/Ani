# Diagrama de Classes

O diagrama de classes é um diagrama estrutural da UML utilizado para representar classes, atributos, métodos e relacionamentos entre os elementos de um sistema. Esse tipo de diagrama permite visualizar a estrutura estática da aplicação e como seus componentes se organizam em termos de responsabilidades e associações [1][2].

A importância do diagrama de classes está em apoiar a modelagem da arquitetura do sistema antes e durante a implementação. Ao explicitar classes, operações e vínculos entre objetos, ele facilita o entendimento da solução, orienta a organização do código e contribui para a comunicação técnica entre os envolvidos no projeto [1][2].

No projeto **Ani**, o diagrama de classes é importante porque descreve a base estrutural dos principais elementos do jogo, como o estado geral da sessão, a personagem Ani, NPCs, diálogos, memórias, diário, atos, cenários e objetos interativos. Com isso, o artefato organiza a visão estrutural do sistema de forma coerente com a versão atual do projeto.

A Figura 1 apresenta o diagrama de classes do projeto **Ani**, elaborado conforme o modelo estudado nas aulas de Engenharia de Software.

## Figura 1 - Diagrama de Classes do projeto Ani

![Figura 1 - Diagrama de Classes do projeto Ani](./diagrama-de-classe.drawio.svg)

O diagrama evidencia os principais componentes estruturais do sistema e as relações entre entidades centrais da experiência jogável, contribuindo para a organização da implementação do projeto.

O Quadro 1 apresenta a estrutura de classes, atributos e métodos modelada para o projeto.

## Quadro 1 - Estrutura de classes do projeto Ani

| Classe | Atributos | Métodos |
| --- | --- | --- |
| Jogo | `titulo : FString`, `atoAtual : Ato`, `cenarioAtual : Cenario`, `estadoAtual : EstadoJogo` | `iniciar()`, `pausar()`, `retomar()`, `encerrar()`, `carregarProgresso()` |
| Personagem | `nome : FString`, `posicaoX : float`, `posicaoY : float`, `sprite : FString`, `velocidade : float` | `mover()` |
| Ani | `estadoEmocional : EstadoEmocional`, `diario : Diario` | `interagir()`, `observar()`, `registrarMemoria()` |
| NPC | `tipo : TipoNPC` | `falar()`, `interagir()` |
| Dialogo | `id : int32`, `linhas : TArray<FString>`, `fragmentado : bool` | `iniciar()`, `avançar()`, `encerrar()` |
| ObjetoInterativo | `id : int32`, `descricao : FString` | `ativar()` |
| ObjetoMemoria | `coletada : bool` | `exibir()`, `registrarNoDiario()` |
| Memoria | `id : int32`, `titulo : FString`, `conteudo : FString`, `atoOrigem : int32`, `coletada : bool` | `registrar()`, `atualizarLeitura()` |
| Diario | `entradas : TArray<EntradaDiario>` | `abrir()`, `adicionarEntrada()`, `consultarEntrada()` |
| EntradaDiario | `titulo : FString`, `conteudo : FString`, `tipo : TipoEntradaDiario` | `atualizarLeitura()` |
| Cenario | `nome : FString`, `desbloqueado : bool` | `carregarCenario()`, `desbloquearArea()` |
| Ato | `id : int32`, `nome : FString`, `descricao : FString`, `concluido : bool`, `limiarMemorias : int32` | `iniciarAto()`, `verificarConclusao()`, `concluirAto()` |
| ObjetoRestauravel | `estado : EstadoObjeto` | `restaurar()` |
| ObjetoContemplativo | `tempoMinimoObservacao : float` | `observar()`, `liberarNarracao()` |
| EcoDecisao | `id : int32`, `tentativas : int32`, `desfecho : FString` | `registrarTentativa()`, `conduzirAoImpasse()` |
| Save | `idSave : int32`, `dataCriacao : FDateTime`, `dataUltimaAtualizacao : FDateTime` | `salvar()`, `carregar()` |

Os tipos dos atributos seguem a Unreal Engine 5 / C++ (`bool`, `int32`, `float`, `FString`, `FDateTime`, `TArray<...>`). Os nomes das classes e enumerações do modelo omitem os prefixos da convenção da Unreal (`U` para classes derivadas de `UObject`, `A` para atores, `F` para estruturas e `E` para enumerações), que podem ser aplicados na implementação.

O Quadro 2 apresenta as enumerações utilizadas para restringir valores recorrentes da modelagem.

## Quadro 2 - Enumerações do projeto Ani

| Enumeração | Valores |
| --- | --- |
| TipoNPC | `NpcMemoria`, `Arquetipo`, `Aparicao` |
| EstadoEmocional | `Neutro`, `Ansioso`, `Deprimido`, `Contemplativo`, `Sereno`, `Medo` |
| TipoEntradaDiario | `Memoria`, `Documento`, `Fotografia`, `Objeto`, `Contemplacao` |
| EstadoObjeto | `Quebrado`, `Restaurado` |
| EstadoJogo | `Menu`, `Jogando`, `Pausado`, `Crise`, `Encerrado` |

O Quadro 3 sintetiza os principais relacionamentos representados no diagrama.

## Quadro 3 - Relacionamentos entre classes

| Classe Origem | Tipo de Relacionamento | Classe Destino | Multiplicidade |
| --- | --- | --- | --- |
| Jogo | Composição | Ato | `Jogo 1` para `Ato 1..*` |
| Jogo | Composição | Cenario | `Jogo 1` para `Cenario 1..*` |
| Ani | Herança / Generalização | Personagem | Especialização de `Personagem` |
| NPC | Herança / Generalização | Personagem | Especialização de `Personagem` |
| Ani | Composição | Diario | `Ani 1` para `Diario 1` |
| Ani | Associação | ObjetoInterativo | `Ani 1` para `ObjetoInterativo 0..*` |
| NPC | Composição | Dialogo | `NPC 1` para `Dialogo 0..*` |
| Cenario | Composição | NPC | `Cenario 1` para `NPC 0..*` |
| Cenario | Composição | ObjetoInterativo | `Cenario 1` para `ObjetoInterativo 0..*` |
| ObjetoMemoria | Herança / Generalização | ObjetoInterativo | Especialização de `ObjetoInterativo` |
| ObjetoRestauravel | Herança / Generalização | ObjetoInterativo | Especialização de `ObjetoInterativo` |
| ObjetoContemplativo | Herança / Generalização | ObjetoInterativo | Especialização de `ObjetoInterativo` |
| ObjetoMemoria | Associação | Memoria | `ObjetoMemoria 1` para `Memoria 1` |
| ObjetoMemoria | Associação | Ato | `ObjetoMemoria 0..*` para `Ato 0..1` |
| Memoria | Associação | EntradaDiario | `Memoria 1` para `EntradaDiario 1` |
| Diario | Composição | EntradaDiario | `Diario 1` para `EntradaDiario 0..*` |
| Ato | Associação | Cenario | `Ato 1` para `Cenario 1..*` |
| Ato | Associação | EcoDecisao | `Ato 1` para `EcoDecisao 0..*` |
| Jogo | Associação | Save | `Jogo 1` para `Save 0..*` |
| Save | Associação | Ato | `Save 0..*` para `Ato 1` |
| Save | Associação | Diario | `Save 1` para `Diario 1` |

O conjunto dessas classes mostra a separação entre a lógica principal do jogo, a personagem controlada, os elementos narrativos, os objetos de interação e os artefatos de registro da experiência do jogador. Essa organização é relevante para o projeto porque ajuda a distribuir responsabilidades entre os elementos do sistema e favorece uma implementação mais clara, modular e alinhada aos requisitos já definidos.

O arquivo do diagrama pode ser consultado em [diagrama-de-classe.drawio](./diagrama-de-classe.drawio) e sua versão de visualização em [diagrama-de-classe.drawio.svg](./diagrama-de-classe.drawio.svg).

## Referências

[1] IBM. *UML diagrams*. Disponível em: <https://www.ibm.com/docs/en/radfws/9.6.1?topic=diagrams-uml>. Acesso em: 22.mar.2026.

[2] VISUAL PARADIGM. *What is Class Diagram?* Disponível em: <https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/>. Acesso em: 22.mar.2026.
