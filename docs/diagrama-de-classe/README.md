# Diagrama de Classes

O diagrama de classes é um diagrama estrutural da UML utilizado para representar classes, atributos, métodos e relacionamentos entre os elementos de um sistema. Esse tipo de diagrama permite visualizar a estrutura estática da aplicação e como seus componentes se organizam em termos de responsabilidades e associações [1][2].

A importância do diagrama de classes está em apoiar a modelagem da arquitetura do sistema antes e durante a implementação. Ao explicitar classes, operações e vínculos entre objetos, ele facilita o entendimento da solução, orienta a organização do código e contribui para a comunicação técnica entre os envolvidos no projeto [1][2].

No projeto **Ani**, o diagrama de classes é importante porque descreve a base estrutural dos principais elementos do jogo, como personagem, memórias, diálogos, objetos interativos, gerenciamento de cenário, persistência de dados e configuração da aplicação.

A Figura 1 apresenta o diagrama de classes do projeto **Ani**, elaborado conforme o modelo estudado nas aulas de Engenharia de Software.

## Figura 1 - Diagrama de Classes do projeto Ani

![Figura 1 - Diagrama de Classes do projeto Ani](./diagrama-de-classe.drawio.svg)

O diagrama evidencia os principais componentes estruturais do sistema e as relações entre entidades centrais da experiência jogável, contribuindo para a organização da implementação do projeto.

O Quadro 1 apresenta a estrutura de classes, atributos e métodos modelada para o projeto.

## Quadro 1 - Estrutura de classes do projeto Ani

| Classe | Atributos | Métodos |
| --- | --- | --- |
| Jogo | Não há atributos explícitos no diagrama. | `iniciar()`, `pausar()`, `encerrar()` |
| Personagem | `posicaoX : float`, `posicaoY : float`, `sprite : string` | `mover()` |
| Ani | Não há atributos explícitos no diagrama. | `pular()`, `interagir()` |
| NPC | `nome : string` | `falar()` |
| ControleMovimento | Não há atributos explícitos no diagrama. | `processarEntrada()` |
| Colisao | Não há atributos explícitos no diagrama. | `detectar()`, `bloquearMovimento()` |
| ObjetoInterativo | `id : int`, `tipo : string` | `ativar()` |
| Memoria | `id : int`, `conteudo : string` | `exibir()` |
| DecisaoMoral | Não há atributos explícitos no diagrama. | `aplicarEscolha()` |
| Diario | `entradas : List<Memoria>` | `adicionarMemoria()`, `abrir()` |
| Dialogo | `falas : List<string>` | `exibirDialogo()` |
| GerenciadorCenario | Não há atributos explícitos no diagrama. | `carregarCenario()`, `transicionar()` |
| GerenciadorDecisoes | Não há atributos explícitos no diagrama. | `aplicarConsequencia()` |
| SaveLoad | Não há atributos explícitos no diagrama. | `salvar()`, `carregar()` |
| Configuracao | `video : string`, `audio : string`, `controles : string` | `aplicar()` |

O conjunto dessas classes mostra a separação entre lógica de jogo, entidades do domínio narrativo, componentes de interação e serviços de suporte. Essa organização é relevante para o projeto porque ajuda a distribuir responsabilidades entre os elementos do sistema e favorece uma implementação mais clara, modular e alinhada aos requisitos já definidos.

O arquivo do diagrama pode ser consultado em [diagrama-de-classe.drawio.svg](./diagrama-de-classe.drawio.svg).

## Referências

[1] IBM. *UML diagrams*. Disponível em: <https://www.ibm.com/docs/en/radfws/9.6.1?topic=diagrams-uml>. Acesso em: 22 mar. 2026.

[2] VISUAL PARADIGM. *What is Class Diagram?* Disponível em: <https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/>. Acesso em: 22 mar. 2026.
