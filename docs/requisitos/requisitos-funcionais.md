<!-- Gerado por scripts/gerar_consolidados.py a partir das notas individuais. Não edite à mão. -->

# Requisitos Funcionais

Requisitos funcionais descrevem as funcionalidades, os serviços e os comportamentos que o sistema deve oferecer para atender às necessidades dos usuários e aos objetivos do projeto. Eles indicam, portanto, o que o software deve fazer, incluindo ações, respostas, operações e interações esperadas durante seu uso [1].

No projeto **Ani**, os requisitos funcionais reúnem as funcionalidades atualmente alinhadas ao GDD reformulado, incluindo movimentação, interação com objetos, sistema de memórias, progressão por atos e mecânicas específicas da experiência narrativa.

**Quadro 1 – Requisitos Funcionais do sistema**

| RF001-Movimentar personagem | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador mova Ani lateralmente por teclado ou gamepad. | | |

| RF002-Colisão com cenário e objetos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve impedir que Ani ultrapasse paredes, pisos e objetos sólidos. | | |

| RF003-Interagir com objetos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir interação com objetos significativos para acessar memórias, fragmentos narrativos e elementos contemplativos do cenário. | | |

| RF004-Sistema de memórias | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve apresentar memórias como fragmentos narrativos, como cartas, bilhetes, fotografias e diários, acessíveis por meio da interação com o ambiente. Como o jogador pode interagir com diferentes objetos de memória, a ordem de descoberta desses fragmentos pode variar entre sessões e trajetórias dentro de um mesmo ato. | | |

| RF005-Diário de memórias | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve registrar os fragmentos coletados em um diário estilizado acessível ao jogador. Os itens podem ganhar nova leitura visual ou contextual conforme os atos avançam. | | |

| RF006-Desbloqueio progressivo do cenário | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve desbloquear cômodos, passagens, portas e escadas conforme o jogador atravessa memórias e conclui o ciclo de progressão de cada ato, segundo a regra de conclusão de ato (RN003) e, no Ato I, a de avanço parcial (RN004). | | |

| RF007-Sistema de puzzles | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve incluir puzzles contextuais integrados ao ambiente e à narrativa dos atos. | | |

| RF008-Diálogos com personagens de memória e arquétipos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve apresentar diálogos textuais fragmentados para personagens de memória, como Mãe, Padrasto, Namorada e Primo, e para arquétipos filosóficos, como O Arquiteto, A Ceramista e A Criança. | | |

| RF009-Sistema de save/load | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve salvar e carregar o progresso do jogador, incluindo ato atual, memórias registradas, estado do diário e estado visual da casa. | | |

| RF010-Feedback sonoro e musical por ato | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve adaptar trilha sonora e efeitos sonoros de acordo com o ato filosófico em curso. | | |

| RF011-Suporte a gamepad | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogo seja controlado também por gamepad. | | |

| RF012-Progressão por atos filosóficos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve estruturar o jogo em cinco atos sequenciais, com mudança de atmosfera, paleta, comportamento das manifestações e mecânicas conforme a progressão. | | |

| RF013-Mecânica de peso literal no Ato I | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve aumentar a sensação de peso no deslocamento de Ani a cada memória tocada no Ato I, tornando o avanço mais lento. | | |

| RF014-Mecânica de ecos de decisão no Ato II | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador revisite, no Ato II, situações em que tenta agir de outro modo, mantendo o resultado preso ao mesmo impasse narrativo. | | |

| RF015-Mecânica de restauração por aceitação no Ato III | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir, no Ato III, a restauração de objetos quebrados sem apagar suas marcas, em linha com a ideia de Kintsugi. | | |

| RF016-Mecânica de contemplação ativa no Ato IV | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve revelar, no Ato IV, fragmentos de narração quando o jogador permanece em observação diante de elementos contemplativos do cenário. | | |

| RF017-Dissolução de mecânicas no Ato V | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve retirar progressivamente, no Ato V, as mecânicas centrais dos atos anteriores até restarem principalmente deslocamento e contemplação. | | |

| RF018-Crises de ansiedade como elemento sensorial | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve representar crises de ansiedade por distorção visual, fragmentação sonora e intensificação das manifestações, sem depender de um sistema de escolhas morais. | | |

| RF019-Desbloqueio mínimo de memórias no Ato I | Categoria: (X) Oculto (  ) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve contar, no Ato I, as memórias coletadas e liberar a passagem para o ato seguinte quando a contagem atingir o limiar mínimo definido na RN004. | | |

| RF020-Aviso de conteúdo sensível | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve exibir, antes do início do jogo, um aviso sobre temas sensíveis (ansiedade, sofrimento psíquico). | | |

## Referência

[1] IBM. *What is requirements management?* Disponível em: <https://www.ibm.com/think/topics/what-is-requirements-management>. Acesso em: 22.mar.2026.
