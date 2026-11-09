<!-- Gerado por scripts/gerar_consolidados.py a partir das notas individuais. Não edite à mão. -->

# Requisitos Funcionais

Requisitos funcionais descrevem as funcionalidades, os serviços e os comportamentos que o sistema deve oferecer para atender às necessidades dos usuários e aos objetivos do projeto. Eles indicam, portanto, o que o software deve fazer, incluindo ações, respostas, operações e interações esperadas durante seu uso [1].

No projeto **Ani**, os requisitos funcionais reúnem as funcionalidades atualmente alinhadas ao GDD reformulado, incluindo movimentação, interação com objetos, sistema de memórias, progressão por atos e mecânicas específicas da experiência narrativa.

**Quadro 1 – Requisitos Funcionais do sistema**

| RF001-Movimentar personagem | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador mova Ani pelo cenário, para os lados e em profundidade, por teclado ou gamepad. | | |

| RF002-Colisão com cenário e objetos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve impedir que Ani ultrapasse paredes, pisos e objetos sólidos. | | |

| RF003-Interagir com objetos | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir interação com objetos significativos para acessar memórias, fragmentos narrativos e elementos contemplativos do cenário. | | |

| RF004-Sistema de memórias | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve apresentar memórias como fragmentos narrativos, como cartas, bilhetes, fotografias e diários, acessíveis por meio da interação com o ambiente. Os fragmentos são encontrados em ordem linear, definida pela narrativa de cada ato. | | |

| RF005-Diário de memórias | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve registrar os fragmentos coletados em um diário estilizado acessível ao jogador. Os itens podem ganhar nova leitura visual ou contextual conforme os atos avançam. | | |

| RF006-Desbloqueio progressivo do cenário | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve desbloquear cômodos, passagens, portas e escadas conforme o jogador atravessa memórias e conclui o ciclo de progressão de cada ato, segundo a regra de conclusão de ato (RN003) e, no Ato I, a de avanço parcial (RN004). | | |

| RF007-Sistema de puzzles | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve incluir puzzles contextuais integrados ao ambiente e à narrativa dos atos. | | |

| RF008-Diálogos com personagens de memória | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve apresentar diálogos textuais fragmentados para personagens de memória, como Mãe, Padrasto, Pretendente e Primo. | | |

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
| **Descrição**: O sistema deve estruturar o jogo em cinco atos sequenciais, em que a progressão marca as etapas narrativas da jornada de Ani, mantendo a mesma identidade visual ao longo dos atos. | | |

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
| **Descrição**: O sistema deve exibir, antes do início do jogo, um aviso sobre temas sensíveis (ansiedade, sofrimento psíquico), com indicação de onde buscar apoio. | | |

| RF021-Pausar jogo | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador pause a sessão em andamento, suspendendo o gameplay e exibindo o menu de pausa, e retome o jogo do mesmo ponto. | | |

| RF022-Configurar vídeo e áudio | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador ajuste opções de vídeo e áudio a partir do menu inicial ou do menu de pausa. | | |

| RF023-Sair do jogo | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador encerre a aplicação, pedindo confirmação antes de sair. | | |

| RF024-Celular em primeira pessoa | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador use o celular de Ani em primeira pessoa, navegando por um aplicativo de rede social com feed, perfis e publicações, e interagindo com elas, como abrir e curtir. | | |

| RF025-Iluminação do ambiente | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador acenda e apague a luz dos cômodos por meio de interruptores e ligue fontes de luz próprias, como luminárias, aplicando a regra de interação no escuro (RN007). | | |

| RF026-Inspeção de objetos em primeira pessoa | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador examine de perto conjuntos de objetos do cenário, como estantes, móveis e mochilas, em visão de primeira pessoa ou vista de cima, selecionando cada item para ver sua descrição. | | |

| RF027-Acesso a memórias por objeto-portal | Categoria: (  ) Oculto (X) Evidente | Prioridade: (X) Altíssima (  ) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve levar Ani do presente para uma memória quando o jogador interage com um objeto ligado a ela, como uma fotografia. | | |

| RF028-Compra e consumo de comidas | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve permitir que o jogador compre comidas nas barracas das memórias e que as personagens as consumam aos poucos, em estágios visíveis, paradas ou andando. | | |

| RF029-Minigames | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve oferecer minigames nas barracas do parque de diversões, com placar e interface próprios durante a partida, aplicando a regra de minigames sem efeito na progressão (RN008). | | |

| RF030-Personagem acompanhante | Categoria: (  ) Oculto (X) Evidente | Prioridade: (  ) Altíssima (  ) Alta (X) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve fazer com que personagens de memória acompanhem Ani pelo cenário em determinadas fases, seguindo-a e comentando os lugares e as ações do jogador. | | |

| RF031-Salvamento automático | Categoria: (X) Oculto (  ) Evidente | Prioridade: (  ) Altíssima (X) Alta (  ) Média (  ) Baixa |
| --- | --- | --- |
| **Descrição**: O sistema deve salvar o progresso automaticamente ao atingir pontos de salvamento definidos pela narrativa, sem ação do jogador. | | |

## Referência

[1] IBM. *What is requirements management?* Disponível em: <https://www.ibm.com/think/topics/what-is-requirements-management>. Acesso em: 22.mar.2026.
