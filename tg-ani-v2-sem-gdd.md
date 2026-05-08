# 1 Introdução

Os jogos digitais narrativos constituem um campo relevante de investigação em software porque articulam sistemas computacionais, linguagem audiovisual, interação e modelagem de experiência. Diferentemente de mídias puramente lineares, o jogo permite que o sujeito não apenas acompanhe uma trajetória, mas a vivencie por meio de ações, ritmos, interrupções e respostas sistêmicas. No caso de experiências contemplativas, essa característica amplia a capacidade do software de representar estados subjetivos, sofrimento, memória e transformação interior, convertendo temas abstratos em situações interativas sensíveis.

Nesse contexto, o projeto **Ani אֲנִי** propõe um side-scroller narrativo contemplativo centrado em consciência, sofrimento e descoberta gradual de sentido. A logline do projeto o define como “um side-scroller narrativo contemplativo sobre consciência, sofrimento e a descoberta lenta do sentido”. Sua sinopse apresenta Ani despertando em um espaço que parece sua própria mente, ao mesmo tempo familiar e deformado, no qual memórias, silêncio e ruínas emocionais substituem objetivos tradicionais, combate ou tutoriais extensos. O nome **אֲנִי** significa “eu” em hebraico e sintetiza a intenção de aproximar jogador e protagonista, de modo que a experiência não seja observada à distância, mas habitada desde dentro.

| Item | Descrição |
| --- | --- |
| Título | Ani |
| Gênero | Side-scroller narrativo contemplativo |
| Plataforma principal | PC (Windows) |
| Engine | Unity |
| Linguagem | C# |
| Câmera | Lateral fixa com zoom narrativo |
| Público-alvo | 16 a 28 anos, com interesse em filosofia, arte e narrativas reflexivas |
| Tom | Sombrio, melancólico e contemplativo, com redenção gradual |
| Duração estimada | 3 a 5 horas por jornada |

A originalidade do projeto reside no fato de que sua espinha dorsal não é uma estrutura de moralidade binária, mas uma jornada de percepção organizada em cinco atos filosóficos. O percurso parte do pessimismo ocidental, associado a Zapffe, Mainlander e Bahnsen, e avança em direção a filosofias contemplativas japonesas, como Wabi-Sabi, Mono no Aware, Ikigai e Yugen. Essa transição não é tratada como exposição teórica, mas como mudança de atmosfera, espaço, ritmo, mecânica e linguagem sensorial.

| Ato | Referência Filosófica | Tom | Símbolo |
| --- | --- | --- | --- |
| I | Zapffe | O peso da consciência | Relógio parado |
| II | Mainländer e Bahnsen | A vontade que se devora e o loop irresolúvel | Corredor em loop |
| III | Wabi-Sabi | Beleza no quebrado | Kintsugi |
| IV | Mono no Aware e Ikigai | Sentir o que passa e encontrar um fio de sentido | Pétalas de cerejeira |
| V | Yugen | O que não cabe em palavras | Estrela solitária |

Os princípios que orientam a direção do projeto reforçam essa identidade conceitual:

- O jogo não é sobre vencer o sofrimento, mas atravessá-lo.
- Não existe sistema de moralidade binária.
- Não há combate como eixo principal da experiência.
- As mecânicas existem para produzir sensação e significado, não para gamificar emoção.
- O silêncio, a pausa e a observação são tão importantes quanto a interação.

A questão-problema que conduz o trabalho é a seguinte: “De que forma o design de um jogo narrativo pode representar eficazmente uma jornada filosófica de transformação interior e a construção da identidade de um personagem?”. A hipótese adotada sustenta que, quando articuladas de forma coerente, mecânicas, progressão visual, direção sonora e organização espacial podem traduzir filosofia em experiência sensível, dispensando a necessidade de mediação teórica explícita para que o jogador perceba a transformação proposta.

O objetivo geral do projeto é desenvolver um protótipo funcional de jogo narrativo contemplativo que represente, por meio de sistemas, mecânicas e linguagem visual, uma jornada filosófica de transformação interior estruturada em cinco atos, do pessimismo existencial à contemplação, aplicando práticas de engenharia de software no planejamento e na construção do projeto. Como objetivos específicos, destacam-se a consolidação da direção conceitual e filosófica do jogo, o levantamento e a classificação de requisitos, a modelagem dos fluxos principais por BPMN e casos de uso, o projeto de sistemas capazes de traduzir cada ato em interação e a implementação de um protótipo coerente com a documentação produzida.

A justificativa do trabalho apoia-se na singularidade dos jogos digitais como meio para representar experiências internas e subjetivas. Em **Ani**, a ausência de combate, de HUD numérico permanente e de moralidade binária não decorre de limitação técnica, mas de aderência ao objeto de pesquisa. Como o foco está na travessia do sofrimento, na observação e na transformação de percepção, a interface minimalista, as pausas, o silêncio e as mecânicas contemplativas tornam-se escolhas metodologicamente coerentes com o que se pretende investigar em software interativo.

O projeto é desenvolvido segundo a metodologia Cascata, com fases sequenciais de levantamento de requisitos, modelagem, design de sistemas e implementação. As ferramentas centrais registradas no projeto são Unity, C#, Aseprite, Photoshop/Illustrator e Audacity/FMOD. A organização deste documento acompanha esse percurso: após a introdução, apresenta-se o Termo de Abertura do Projeto; em seguida, o levantamento de requisitos, com BPMN, requisitos, regras, casos de uso, diagrama de classes e DER; depois, as ferramentas e métodos empregados; por fim, descreve-se o desenvolvimento do protótipo funcional.

# 1.1 Termo de Abertura do Projeto (TAP)

O Termo de Abertura do Projeto (TAP) é o documento que formaliza a existência de um projeto e registra seus direcionadores iniciais. No gerenciamento de projetos, sua função é consolidar propósito, escopo preliminar, stakeholders, premissas, restrições e critérios de sucesso, oferecendo uma base de alinhamento entre os envolvidos. Segundo o Project Management Institute, o documento de abertura autoriza formalmente o projeto e define seus elementos estruturantes em nível inicial (PROJECT MANAGEMENT INSTITUTE, 2017).

No contexto acadêmico, o TAP exerce papel equivalente ao de um contrato de projeto, pois delimita o que será construído, quem participa do processo, quais recursos são previstos e quais limites precisam ser respeitados. Em trabalhos de software, esse artefato também favorece a rastreabilidade entre problema de pesquisa, objetivos, modelagem e implementação, reduzindo ambiguidades nas etapas subsequentes.

No caso de **Ani**, o TAP organiza a proposta de um jogo narrativo contemplativo em termos de gerenciamento, escopo e viabilidade. A seguir, apresenta-se o conteúdo completo do artefato, acrescido da contextualização do produto digital a ser entregue.

## 1. Identificação do Projeto

| Item | Descrição |
| --- | --- |
| Nome do projeto | Ani אני |
| Tipo | Jogo digital narrativo contemplativo |
| Área | Desenvolvimento de software e jogos digitais |
| Plataforma inicial | PC (Windows) |
| Motor de jogo | Unity |
| Linguagem principal | C# |
| Natureza do projeto | Projeto autoral com finalidade acadêmica e prototipação |

### Ficha do Produto

| Item | Descrição |
| --- | --- |
| Título | Ani |
| Gênero | Side-scroller narrativo contemplativo |
| Plataforma principal | PC (Windows) |
| Engine | Unity |
| Linguagem | C# |
| Câmera | Lateral fixa com zoom narrativo |
| Público-alvo | 16 a 28 anos, com interesse em filosofia, arte e narrativas reflexivas |
| Tom | Sombrio, melancólico e contemplativo, com redenção gradual |
| Duração estimada | 3 a 5 horas por jornada |

## 2. Problema de Pesquisa

De que forma o design de um jogo narrativo pode representar eficazmente uma jornada filosófica de transformação interior e a construção da identidade de um personagem?

## 3. Objetivo Geral

Desenvolver um protótipo funcional de jogo narrativo contemplativo que represente, por meio de sistemas, mecânicas e linguagem visual, uma jornada filosófica de transformação interior estruturada em cinco atos, do pessimismo existencial à contemplação, aplicando práticas de engenharia de software no planejamento e na construção do projeto.

## 4. Objetivos Específicos

- consolidar a direção conceitual e filosófica do jogo por meio do Game Design Document (GDD);
- levantar, classificar e documentar os requisitos funcionais, não funcionais e regras de negócio do sistema;
- modelar os fluxos principais do jogo utilizando BPMN e casos de uso;
- projetar sistemas e mecânicas que traduzam, em interação, cada etapa da jornada filosófica de Ani;
- implementar um protótipo funcional coerente com a documentação produzida.

## 5. Justificativa

Jogos digitais constituem um meio singular para explorar experiências internas e subjetivas: a interatividade permite que o jogador não apenas observe uma jornada, mas a habite ativamente, vivenciando estados emocionais, percepções e transformações de dentro para fora. Essa capacidade imersiva distingue o jogo de outras mídias narrativas e o torna especialmente adequado para representar processos internos complexos, como identidade, sofrimento e transformação filosófica.

**Ani** parte dessa premissa para investigar como a filosofia pode funcionar como linguagem acessível dentro de um jogo narrativo. Correntes como o pessimismo existencial de Zapffe e Mainlander e filosofias contemplativas japonesas, como Wabi-Sabi, Mono no Aware e Yugen, carregam ideias densas que, quando traduzidas em espaço, mecânica e atmosfera, tornam-se experienciáveis sem depender de mediação teórica.

O jogo se torna, assim, não um veículo de ensino da filosofia, mas um modo de sentir o que ela descreve.

## 6. Metodologia / Tecnologias

O projeto é conduzido segundo a metodologia Cascata (Waterfall), com fases sequenciais e dependentes: levantamento de requisitos, modelagem, design de sistemas e implementação.

A modelagem utiliza BPMN para representação dos fluxos de gameplay e UML para casos de uso e estrutura do sistema, garantindo rastreabilidade entre as decisões conceituais do projeto e as decisões técnicas do protótipo.

As tecnologias e ferramentas utilizadas são:

- Unity como motor de jogo;
- C# como linguagem de programação;
- Aseprite para sprites e animações;
- Photoshop / Illustrator para ilustrações e texturas;
- Audacity / FMOD para design sonoro e efeitos de áudio.

## 7. Escopo

### Escopo Incluído

- desenvolvimento de um jogo narrativo contemplativo estruturado em cinco atos filosóficos;
- exploração lateral em ambientes simbólicos e fragmentados;
- interação com objetos de memória, fragmentos narrativos e elementos contemplativos;
- diário de memórias como sistema central de registro e leitura;
- implementação das mecânicas principais por ato, como peso literal, ecos de decisão, restauração por aceitação e contemplação ativa;
- construção de atmosfera visual e sonora coerente com a jornada filosófica de Ani;
- desenvolvimento de um protótipo funcional para PC.

### Escopo Não Incluído

- lançamento comercial do jogo;
- versão final completa com todo o conteúdo planejado, refinado e polido;
- portabilidade efetiva para consoles ou outras plataformas;
- produção final de todos os assets artísticos e sonoros definitivos.

### Principais Características do Produto

- Side-scroller narrativo contemplativo
- Progressão em cinco atos filosóficos
- Ausência de combate e moralidade binária
- Mundo mental simbólico e mutável
- Mecânicas que nascem e desaparecem conforme o significado de cada ato
- Diário de memórias como elemento narrativo central
- Crises de ansiedade como recurso sensorial e dramático
- Interface minimalista e diegética
- Final único, aberto e interpretativo

## 8. Principais Entregas

- conceito consolidado de **Ani** como jogo narrativo contemplativo;
- documentação funcional e estrutural de apoio ao desenvolvimento;
- modelagem dos principais fluxos e interações do sistema;
- protótipo jogável da experiência central;
- base técnica e conceitual para evolução futura do projeto.

## 9. Stakeholders

| Stakeholder | Papel |
| --- | --- |
| Autor do projeto | Responsável pela concepção, direção criativa e desenvolvimento |
| Orientador acadêmico | Responsável pelo acompanhamento metodológico e orientação do projeto |
| Banca avaliadora | Responsável pela análise crítica e avaliação da proposta |
| Jogador final | Público que vivencia a experiência interativa proposta |

## 10. Público-Alvo do Produto

O projeto é direcionado principalmente a pessoas entre 16 e 28 anos interessadas em:

- jogos narrativos e contemplativos;
- experiências artísticas interativas;
- temas ligados à filosofia, subjetividade e simbolismo;
- obras com atmosfera melancólica, reflexiva e interpretativa.

## 11. Premissas

- o projeto será desenvolvido inicialmente como experiência para PC;
- a direção conceitual atual será a principal referência para as próximas etapas;
- o protótipo priorizará a experiência central do jogo em vez de uma versão extensa de conteúdo;
- a proposta visual, sonora e mecânica poderá ser refinada conforme os testes e a maturação do projeto;
- a implementação buscará traduzir a jornada filosófica em interação jogável e atmosfera sensível.

## 12. Restrições

- tempo limitado para desenvolvimento e refinamento do protótipo;
- escopo sujeito a ajustes conforme viabilidade técnica e maturação da proposta;
- recursos artísticos e sonoros ainda em fase de definição e produção;
- necessidade de concentrar esforços na experiência central do jogo antes da expansão de conteúdo.

## 13. Riscos Iniciais

| Risco | Impacto |
| --- | --- |
| Mudanças conceituais frequentes na direção do jogo | Retrabalho em design, sistemas e implementação |
| Escopo excessivamente amplo para o tempo disponível | Comprometimento da qualidade do protótipo |
| Dependência de assets visuais e sonoros ainda não finalizados | Atraso na consolidação da atmosfera desejada |
| Dificuldade em transformar filosofia em mecânicas claras | Distanciamento entre proposta conceitual e experiência jogável |
| Excesso de abstração narrativa | Redução da compreensão e do engajamento do jogador |

## 14. Cronograma Macro

1. Consolidação da direção conceitual, filosófica e estética do jogo.
2. Definição dos sistemas centrais, requisitos e fluxos de interação.
3. Modelagem estrutural e organização da base técnica do projeto.
4. Implementação das mecânicas principais e da navegação da experiência.
5. Integração de atmosfera visual, sonora e narrativa.
6. Refinamento do protótipo jogável.

## 15. Critério de Sucesso

O projeto será considerado bem-sucedido se conseguir entregar um protótipo funcional capaz de expressar com clareza a proposta central de **Ani**: uma jornada contemplativa, simbólica e interativa de transformação interior, coerente em suas mecânicas, atmosfera e identidade visual.

# 2 Levantamento de Requisitos

## 2.1 Elicitação e Especificação dos Requisitos

A elicitação de requisitos corresponde ao processo de identificar, compreender, negociar e documentar os serviços, restrições e comportamentos esperados de um sistema. Para Sommerville (2019), os requisitos expressam aquilo que o software deve fazer e as condições sob as quais deve operar; Pressman e Maxim (2016) destacam que a qualidade da solução depende fortemente da qualidade da descoberta inicial dessas necessidades. Em projetos digitais complexos, a elicitação não é apenas levantamento, mas também interpretação técnica do domínio.

No presente projeto, a elicitação foi conduzida principalmente por análise documental e refinamento iterativo. A documentação já existente do jogo funcionou como base primária para transformar intenções conceituais em exigências formais de software. Em especial, o documento de direção do projeto exerceu o papel de fonte de requisitos de produto, registrando narrativa, mecânicas, mundo, interface, áudio e especificações técnicas que depois foram convertidos em artefatos de engenharia.

Além da análise documental, o refinamento ocorreu pelo confronto entre intenção de design e viabilidade de implementação na engine Unity. Isso permitiu distinguir funcionalidades centrais do protótipo, desdobrar mecânicas em regras verificáveis e traduzir elementos atmosféricos em restrições não funcionais e comportamentos do sistema. Tal processo foi particularmente importante porque **Ani** não depende apenas de ações visíveis, mas também de transformações internas, progressão sensorial e mudanças de leitura ao longo dos atos.

Quanto à classificação, adotou-se a distinção entre requisitos **evidentes**, visíveis ao usuário final em suas interações diretas, e requisitos **ocultos**, relacionados à organização interna da progressão, às mecânicas por ato e aos efeitos sistêmicos que moldam a experiência. Também se utilizou priorização por níveis, com destaque para Altíssima, Alta e Média, permitindo identificar o núcleo funcional indispensável do protótipo.

O conjunto de mecânicas e diretrizes do projeto orientou diretamente a geração dos requisitos. A mecânica de **Peso Literal**, no Ato I, originou RF013; **Ecos de Decisão**, no Ato II, originou RF014; a **Restauração por Aceitação**, no Ato III, originou RF015; a **Contemplação Ativa**, no Ato IV, originou RF016; e a **Dissolução de Mecânicas**, no Ato V, originou RF017. O **Sistema de Memórias** e o **Diário** originaram RF004 e RF005; as **Crises de Ansiedade** originaram RF018; a **jogabilidade autoexplicativa** sustentou RNF004; a **Progressão em cinco atos filosóficos** fundamentou RF012 e RF006; e a **direção de áudio por ato** fundamentou RF010.

Essa rastreabilidade mostra que os requisitos de **Ani** derivam de uma visão de produto em que atmosfera, percepção, tempo e transformação são tão importantes quanto comandos, colisão e persistência. Assim, a elicitação não apenas identificou funcionalidades, mas formalizou em linguagem de software a proposta filosófica, estética e interativa do projeto.

| Ato | Paleta | Atmosfera |
| --- | --- | --- |
| I | Cinza-chumbo e preto profundo | Claustrofobia, tetos baixos, relógios parados |
| II | Cinza-azulado e sombras densas | Labirinto, repetição e desorientação |
| III | Ocre, marrom e ouro nas rachaduras | Quietude, musgo, frestas de luz |
| IV | Azul-índigo, rosa-cerejeira e dourado | Abertura, respiro, contemplação |
| V | Azul muito escuro, quase preto | Imensidão, vazio e coexistência simbólica |

| Ato | Clima Sonoro | Elementos |
| --- | --- | --- |
| I | Peso e clausura | Silêncio pesado, rangidos, passos ecoados, relógios que não andam |
| II | Loop e distorção | Repetições ligeiramente erradas, batimentos, ecos codificados |
| III | Textura e imperfeição | Cordas imperfeitas, cerâmica, madeira, presença tátil dos sons |
| IV | Abertura e passagem | Flauta, vento, sino distante, queda de pétalas e pausas longas |
| V | Imensidão e silêncio | Sustentação mínima, espaço entre notas e sensação de vazio |

## 2.2 BPMN

A BPMN (*Business Process Model and Notation*) é uma notação padronizada para modelagem de processos, utilizada para representar atividades, decisões, participantes e fluxos de execução de forma compreensível para públicos técnicos e não técnicos. Conforme a Object Management Group, a notação organiza visualmente a dinâmica de um processo e favorece sua comunicação, análise e aperfeiçoamento (OBJECT MANAGEMENT GROUP, 2011).

No contexto de software, a BPMN é útil para explicitar como o sistema responde às ações do usuário e quais validações ou laços condicionais estruturam a experiência. Em **Ani**, sua utilização é pertinente porque o ciclo principal de gameplay não se resume a movimentar a personagem, mas envolve explorar, interagir, classificar objetos, processar memórias, registrar progresso e decidir se a exploração continua ou se a sessão se encerra.

O loop de progressão documentado no projeto estabelece que cada ato segue cinco passos: explorar a casa e perceber mudanças; encontrar a passagem para uma memória ou região mental; atravessar a experiência central do ato; retornar à casa e registrar o avanço no diário; e abrir passagem para o ato seguinte. Esse ciclo é a origem conceitual do BPMN do projeto, pois transforma a progressão simbólica da experiência em um fluxo operacional observável e modelável.

[Figura 1 – Diagrama BPMN do ciclo principal de gameplay de Ani]

### Objetivo do Processo

O processo modela o ciclo principal de progressão do jogador durante a exploração do jogo, desde a abertura da aplicação até o encerramento da exploração e o fim da sessão.

### Participantes

O BPMN está organizado em três raias:

- **Usuário**: representa as ações executadas diretamente pelo jogador.
- **App usuário**: representa as respostas da aplicação, como carregamento de tela, cenário, memória e retorno à exploração.
- **Sistema**: representa validações, armazenamento de itens e verificações de progresso.

### Fluxo Principal

1. O jogador abre o jogo.
2. A aplicação carrega o menu inicial.
3. O jogador seleciona um novo jogo.
4. A aplicação carrega o cenário principal.
5. O jogador inicia a exploração do mapa.
6. Durante a exploração, o jogador interage com um objeto.
7. O sistema verifica o tipo do objeto interagido.
8. Se o objeto for um objeto de memória, a aplicação carrega a memória correspondente.
9. O jogador explora o cenário da memória.
10. O jogador finaliza a memória.
11. Se o objeto for um objeto comum, a aplicação carrega o objeto diretamente.
12. Em ambos os casos, o sistema armazena o objeto no inventário.
13. O sistema verifica se toda a exploração já foi concluída.
14. Se ainda houver objetos, a aplicação retorna o jogador à exploração.
15. Se a exploração estiver completa, o sistema finaliza a exploração.
16. O processo termina com o fim do jogo.

### Pontos de Decisão

#### Verificação do Tipo de Objeto

Após a interação com um objeto, o sistema segue um gateway exclusivo com dois caminhos:

- **Objeto de memória**: leva ao carregamento de memória, à exploração do cenário da memória e à finalização da memória.
- **Objeto comum**: leva ao carregamento direto do objeto.

#### Verificação de Progresso

Depois do armazenamento do objeto no inventário, o sistema verifica se o jogador já explorou tudo.

- **Ainda há objetos**: o fluxo retorna à exploração do mapa.
- **Exploração completa**: o fluxo segue para a finalização da exploração e o encerramento da sessão.

### Interpretação do Processo

O diagrama representa um loop central de gameplay:

- explorar;
- interagir;
- classificar o objeto;
- processar memória ou item comum;
- registrar progresso;
- decidir entre continuar explorando ou encerrar.

Esse fluxo ajuda a visualizar a lógica macro da progressão do jogo e reforça a relação entre exploração, memórias e avanço estrutural da experiência.

### Observações

- O BPMN atual representa bem a estrutura geral do ciclo de exploração.
- Como o projeto passou por reformulação conceitual, este processo pode precisar de revisão futura para refletir com mais precisão a nova direção filosófica do projeto.
- A remoção da etapa de escolha explícita dentro da memória deixa o BPMN mais alinhado com a direção atual, que prioriza exploração, contemplação e progressão narrativa.

O uso da BPMN é importante neste projeto porque aproxima visão conceitual e lógica de execução. Ao representar em processo aquilo que, no plano narrativo, é uma travessia de memória e transformação, o diagrama fortalece a rastreabilidade entre design, requisitos e futura implementação.

## 2.3 Requisitos Funcionais

Requisitos funcionais descrevem os serviços e comportamentos que o sistema deve oferecer ao usuário ou executar internamente para atender ao propósito do software. Para Sommerville (2019), eles definem as funções do sistema e suas respostas a entradas, situações e regras operacionais. Em um jogo digital, isso inclui não apenas comandos e menus, mas também mecânicas, regras de progressão, persistência e respostas sensoriais organizadas por software.

Em **Ani**, os requisitos funcionais descrevem tanto funcionalidades convencionais quanto mecanismos capazes de converter intenção artística em experiência jogável. Assim, além de mover a personagem, interagir com objetos ou salvar progresso, os RFs também formalizam peso literal, ecos de decisão, contemplação ativa, dissolução de mecânicas e adaptação sonora por ato.

O Quadro X apresenta os requisitos funcionais do sistema, organizados por código, título, categoria, prioridade e descrição.

| Código | Título | Categoria | Prioridade | Descrição |
| --- | --- | --- | --- | --- |
| RF001 | Movimentar personagem | Evidente | Altíssima | O sistema deve permitir que o jogador mova Ani lateralmente usando teclado. |
| RF002 | Colisão com cenário e objetos | Evidente | Altíssima | O sistema deve impedir que Ani ultrapasse paredes, pisos e objetos sólidos. |
| RF003 | Interagir com objetos | Evidente | Altíssima | O sistema deve permitir interação com objetos significativos para acessar memórias, fragmentos narrativos e elementos contemplativos do cenário. |
| RF004 | Sistema de memórias | Evidente | Altíssima | O sistema deve apresentar memórias como fragmentos narrativos, como cartas, bilhetes, fotografias e diários, acessíveis por meio da interação com o ambiente. Como o jogador pode interagir com diferentes objetos de memória, a ordem de descoberta desses fragmentos pode variar entre sessões e trajetórias dentro de um mesmo ato. |
| RF005 | Diário de memórias | Evidente | Altíssima | O sistema deve registrar os fragmentos coletados em um diário estilizado acessível ao jogador. Os itens podem ganhar nova leitura visual ou contextual conforme os atos avançam. |
| RF006 | Desbloqueio progressivo do cenário | Evidente | Altíssima | O sistema deve desbloquear cômodos, passagens, portas e escadas conforme o jogador atravessa memórias e conclui o ciclo de progressão de cada ato. No Ato I, a passagem para o ato seguinte deve exigir apenas uma quantidade mínima de memórias, sem obrigar o jogador a visualizar todas as memórias disponíveis. |
| RF007 | Sistema de puzzles | Evidente | Alta | O sistema deve incluir puzzles contextuais integrados ao ambiente e à narrativa dos atos. |
| RF008 | Diálogos com personagens de memória e arquétipos | Evidente | Alta | O sistema deve apresentar diálogos textuais fragmentados para personagens de memória, como Mãe, Padrasto, Namorada e Primo, e para arquétipos filosóficos, como O Arquiteto, A Ceramista e A Criança. |
| RF009 | Sistema de save/load | Evidente | Altíssima | O sistema deve salvar e carregar o progresso do jogador, incluindo ato atual, memórias registradas, estado do diário e estado visual da casa. |
| RF010 | Feedback sonoro e musical por ato | Evidente | Alta | O sistema deve adaptar trilha sonora e efeitos sonoros de acordo com o ato filosófico em curso. |
| RF011 | Suporte a gamepad | Evidente | Média | O sistema deve permitir que o jogo seja controlado também por gamepad. |
| RF012 | Progressão por atos filosóficos | Oculto | Altíssima | O jogo deve ser estruturado em cinco atos sequenciais, com mudança de atmosfera, paleta, comportamento das manifestações e mecânicas conforme a progressão. |
| RF013 | Mecânica de peso literal no Ato I | Oculto | Alta | No Ato I, cada memória tocada deve aumentar a sensação de peso no deslocamento de Ani, tornando o avanço mais lento. |
| RF014 | Mecânica de ecos de decisão no Ato II | Oculto | Alta | No Ato II, o jogador deve poder revisitar situações em que tenta agir de outro modo, mas o resultado permanece preso ao mesmo impasse narrativo. |
| RF015 | Mecânica de restauração por aceitação no Ato III | Evidente | Alta | No Ato III, o sistema deve permitir a restauração de objetos quebrados sem apagar suas marcas, em linha com a ideia de Kintsugi. |
| RF016 | Mecânica de contemplação ativa no Ato IV | Oculto | Alta | No Ato IV, o sistema deve revelar fragmentos de narração quando o jogador permanece em observação diante de elementos contemplativos do cenário. |
| RF017 | Dissolução de mecânicas no Ato V | Oculto | Alta | No Ato V, o sistema deve retirar progressivamente as mecânicas centrais dos atos anteriores até restarem principalmente deslocamento e contemplação. |
| RF018 | Crises de ansiedade como elemento sensorial | Oculto | Alta | O sistema deve representar crises de ansiedade por distorção visual, fragmentação sonora e intensificação das manifestações, sem depender de um sistema de escolhas morais. |
| RF019 | Desbloqueio mínimo de memórias no Ato I | Oculto | Alta | No Ato I, a passagem para o ato seguinte deve ser liberada após a coleta de uma quantidade mínima de memórias. Esse limiar existe para permitir que o jogador avance sem consumir todas as memórias do ato. O valor exato pode ser ajustado durante o refinamento do projeto. |

Observa-se uma distribuição de 8 requisitos com prioridade Altíssima, 10 com prioridade Alta e 1 com prioridade Média. Pela classificação registrada no artefato-fonte, há 12 requisitos marcados como Evidentes e 7 como Ocultos; ainda assim, o bloco RF012 a RF019 concentra diretamente as mecânicas filosóficas por ato, com a ressalva de que RF015 está rotulado como Evidente no documento mesmo integrando esse conjunto conceitual.

## 2.4 Requisitos Não Funcionais

Requisitos não funcionais expressam restrições de qualidade, desempenho, usabilidade, portabilidade e demais condições que moldam como o sistema deve operar. Segundo Sommerville (2019), eles não descrevem serviços específicos, mas propriedades e limites que influenciam o comportamento global do software. Pressman e Maxim (2016) reforçam que tais requisitos afetam diretamente a aceitabilidade do produto.

Em **Ani**, os RNFs não se limitam a desempenho técnico. Eles também registram compromissos com portabilidade, acessibilidade, localização, jogabilidade autoexplicativa e tratamento responsável de conteúdo sensível. Assim, os requisitos não funcionais delimitam condições de qualidade que ajudam a preservar a proposta contemplativa do jogo.

O Quadro X apresenta os requisitos não funcionais do sistema, indicando os critérios de qualidade e suas respectivas classificações.

| Código | Requisito | Classificação |
| --- | --- | --- |
| RNF001 | O sistema deve manter taxa mínima de 60 FPS em hardware equivalente a Intel HD Graphics e 4 GB de RAM. | Obrigatório, permanente |
| RNF002 | O sistema deve carregar saves locais em menos de 5 segundos e preservar a integridade dos dados de progresso por ato. | Obrigatório, permanente |
| RNF003 | O sistema deve ser estruturado de forma a permitir adaptação para outras plataformas com alterações mínimas no código e nos assets. | Desejável, permanente |
| RNF004 | O sistema deve permitir que novos jogadores compreendam as mecânicas básicas sem necessidade de tutorial extenso ou instruções constantes em tela. | Obrigatório, permanente |
| RNF005 | O sistema deve exibir aviso de conteúdo sensível e permitir ao jogador pular cenas de alta carga emocional sem comprometer a continuidade narrativa. | Obrigatório, permanente |
| RNF006 | O sistema deve suportar internacionalização por meio de arquivos externos de texto, permitindo tradução para outros idiomas. | Obrigatório, transitório |
| RNF007 | O sistema deve oferecer recursos de acessibilidade, incluindo controle de intensidade visual, legendas para efeitos sonoros e controle independente de volume por camada de áudio. | Obrigatório, permanente |

Os RNFs podem ser agrupados por tema da seguinte forma: desempenho e persistência em RNF001 e RNF002; portabilidade em RNF003; usabilidade em RNF004; saúde mental e conteúdo sensível em RNF005; internacionalização em RNF006; e acessibilidade sensorial e de áudio em RNF007.

## 2.5 Regras de Negócio

Regras de negócio são enunciados que impõem restrições, condições ou políticas sobre o comportamento de um sistema dentro de seu domínio. Em termos de modelagem, elas definem o que pode, deve ou não deve acontecer em determinados cenários, garantindo coerência operacional entre objetivos, entidades e processos. Em projetos de software, essas regras exercem papel fundamental na transformação de intenções de domínio em comportamentos verificáveis.

No caso de **Ani**, as regras de negócio não se limitam a validações administrativas; elas traduzem diretamente opções filosóficas e narrativas do projeto. A regra de convergência dos ecos de decisão, por exemplo, expressa em linguagem sistêmica a irresolução do Ato II, em que diferentes tentativas do jogador ainda convergem para o mesmo impasse narrativo.

O Quadro X apresenta as regras de negócio do sistema, descrevendo as restrições conceituais que orientam a progressão e o comportamento narrativo de **Ani**.

| Código | Nome | Descrição |
| --- | --- | --- |
| RN001 | Registro único de memória | Cada fragmento de memória pode ser registrado apenas uma vez no diário. |
| RN002 | Progressão fixa entre atos | A progressão entre atos ocorre de forma sequencial, seguindo a ordem definida no projeto, sem possibilidade de retorno ou salto de ordem. |
| RN003 | Critério de avanço por conclusão de ato | A progressão para o ato seguinte depende da conclusão dos critérios do ato atual. |
| RN004 | Avanço parcial no Ato I | No Ato I, o avanço não exige a visualização de todas as memórias, apenas o cumprimento de um limiar mínimo definido. |
| RN005 | Ressignificação de objetos e memórias | Um fragmento pode assumir diferentes interpretações ao longo da progressão do jogo, sem alteração de sua identidade original no diário. |
| RN006 | Convergência dos ecos de decisão | Nos momentos de eco de decisão no Ato II, diferentes interações do jogador levam ao mesmo impasse narrativo. |

Em termos de rastreabilidade, RN001 origina-se da seção de exploração e diário; RN002 decorre da estrutura narrativa em cinco atos; RN003 decorre da conclusão de cada ato; RN004 deriva do Ato I e da mecânica de peso literal; RN005 origina-se da exploração, do diário e da ressignificação de objetos; e RN006 vem diretamente do Ato II e dos ecos de decisão.

## 2.6 Casos de Uso

Casos de uso são descrições estruturadas das interações entre atores e sistema, com o objetivo de evidenciar como determinadas funcionalidades são acionadas e quais respostas são esperadas. Na perspectiva da UML, esse artefato contribui para a compreensão do comportamento externo do sistema, permitindo documentar cenários principais, pré-condições, pós-condições e caminhos alternativos. A IBM destaca que diagramas e visões de caso de uso ajudam a representar as funcionalidades esperadas do sistema e a relação entre atores externos e serviços oferecidos pela aplicação (IBM, s.d.a, online; IBM, s.d.b, online).

Sua importância reside em tornar explícito quem aciona o sistema, em que condições, com quais passos principais e com quais alternativas. Em projetos de software interativo, esse tipo de artefato ajuda a conectar requisitos abstratos a fluxos operacionais verificáveis, servindo como ponte entre análise e implementação. Essa modelagem também favorece a comunicação entre os envolvidos no projeto, pois delimita o escopo funcional do sistema e torna mais clara a ligação entre atores, objetivos e funcionalidades (IBM, s.d.a, online; IBM, s.d.b, online).

Em **Ani**, os casos de uso foram derivados dos requisitos funcionais e das mecânicas do projeto. Eles cobrem tanto ações clássicas, como movimentar, pausar e salvar, quanto interações alinhadas ao núcleo da experiência, como ativar objetos significativos, acessar o diário de memórias e carregar cenários coerentes com a progressão por atos.

O Quadro X apresenta o índice de casos de uso do sistema, enquanto a modelagem gráfica correspondente é apresentada na Figura 2.

| ID | Nome do Caso de Uso | Ator Primário |
| --- | --- | --- |
| UC-S001 | Movimentar Personagem | Jogador |
| UC-S002 | Interagir com Objetos | Jogador |
| UC-S003 | Dialogar com Personagens | Jogador |
| UC-S004 | Consultar Documentos Coletados | Jogador |
| UC-S005 | Acessar Diário de Memórias | Jogador |
| UC-S006 | Pausar Jogo | Jogador |
| UC-S007 | Configurar Jogo | Jogador |
| UC-S008 | Ajustar Configurações de Vídeo | Jogador |
| UC-S009 | Ajustar Configurações de Áudio | Jogador |
| UC-S010 | Configurar Controles | Jogador |
| UC-S011 | Sair do Jogo | Jogador |
| UC-S012 | Salvar Jogo | Jogador |

[Figura 2 – Diagrama de Casos de Uso de Ani]

Os casos de uso articulam-se diretamente com as mecânicas do projeto: UC-S001 relaciona-se a RF001 e à exploração lateral; UC-S002 conecta-se a RF003, RF004, RF015 e RF016, cobrindo objetos significativos e mecânicas por ato; UC-S003 deriva de RF008 e dos personagens de memória e arquétipos; UC-S004 e UC-S005 conectam-se a RF005 e ao diário de memórias; e UC-S012 corresponde a RF009 e à persistência descrita nas especificações técnicas.

### Caso de Uso: UC-S001 - Movimentar Personagem

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S001 |
| Descrição | Este caso de uso tem por objetivo permitir a movimentação de Ani pelo cenário durante a exploração lateral. |
| Ator Primário | Jogador |
| Pré-condição | Jogo iniciado com Ani carregado. |
| Cenário Principal | 1. Jogador pressiona teclas de movimento.<br>2. Sistema captura a entrada.<br>3. Sistema aplica movimento no personagem.<br>4. Sistema verifica colisões.<br>5. Ani é movido corretamente pelo cenário. |
| Pós-condição | A posição de Ani é atualizada para uma coordenada válida no cenário, respeitando os limites e obstáculos existentes. |
| Cenários Alternativos | - Se ocorrer colisão, o movimento é bloqueado. |

### Caso de Uso: UC-S002 - Interagir com Objetos

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S002 |
| Descrição | Este caso de uso permite que o jogador interaja com objetos significativos para acessar memórias, fragmentos narrativos ou elementos contemplativos do cenário. |
| Ator Primário | Jogador |
| Pré-condição | Ani deve estar próximo de um objeto interativo. |
| Cenário Principal | 1. Jogador pressiona a tecla de interação.<br>2. Sistema identifica o tipo de objeto interativo.<br>3. Sistema ativa o conteúdo associado, como memória, fragmento textual, objeto restaurável ou evento contemplativo.<br>4. Quando aplicável, o conteúdo é registrado no diário de Ani. |
| Pós-condição | O conteúdo associado ao objeto é disponibilizado ao jogador e, quando aplicável, registrado no diário de memórias. |
| Cenários Alternativos | - Se o objeto não for interativo, nada acontece. |

### Caso de Uso: UC-S003 - Dialogar com Personagens

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S003 |
| Descrição | Este caso de uso tem por objetivo permitir a interação narrativa com personagens de memória e arquétipos filosóficos. |
| Ator Primário | Jogador |
| Pré-condição | Ani deve estar próximo de um personagem interativo. |
| Cenário Principal | 1. Jogador aciona a interação.<br>2. Sistema identifica se a entidade é um personagem de memória ou um arquétipo filosófico.<br>3. Sistema exibe diálogo textual fragmentado.<br>4. Jogador avança o texto.<br>5. Quando aplicável, o conteúdo é registrado como memória narrativa ou reforço simbólico do ato atual. |
| Pós-condição | O diálogo é concluído e o estado narrativo associado à interação é atualizado pelo sistema. |
| Cenários Alternativos | - Se o jogador ignorar o NPC, o diálogo não é iniciado. |

### Caso de Uso: UC-S004 - Consultar Documentos Coletados

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S004 |
| Descrição | Este caso de uso permite que o jogador consulte documentos e fragmentos já registrados no diário de memórias. |
| Ator Primário | Jogador |
| Pré-condição | Pelo menos uma memória coletada. |
| Cenário Principal | 1. Jogador acessa o diário.<br>2. Sistema abre o documento selecionado.<br>3. Jogador lê o conteúdo. |
| Pós-condição | O documento selecionado é disponibilizado para leitura dentro do diário de memórias. |
| Cenários Alternativos | - Se o diário não contiver documentos, exibe páginas em branco. |

### Caso de Uso: UC-S005 - Acessar Diário de Memórias

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S005 |
| Descrição | Este caso de uso tem por objetivo permitir que o jogador acesse e navegue pelo diário de memórias de Ani. |
| Ator Primário | Jogador |
| Pré-condição | Jogo em execução. |
| Cenário Principal | 1. Jogador pressiona a tecla de inventário.<br>2. Sistema abre uma interface estilizada em forma de diário.<br>3. Jogador navega pelas páginas. |
| Pós-condição | O diário de memórias é disponibilizado para navegação pelo jogador. |
| Cenários Alternativos | - Se o inventário estiver vazio, mostra páginas sem conteúdo. |

### Caso de Uso: UC-S006 - Pausar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S006 |
| Descrição | Este caso de uso permite que o jogador suspenda temporariamente a sessão em andamento. |
| Ator Primário | Jogador |
| Pré-condição | Sessão em andamento. |
| Cenário Principal | 1. Jogador pressiona a tecla de pausa.<br>2. Sistema suspende o gameplay.<br>3. Exibe o menu de pausa. |
| Pós-condição | O estado da sessão é atualizado para pausado, mantendo o jogo suspenso até nova ação do jogador. |
| Cenários Alternativos | - Se o jogador retomar, o jogo volta ao estado normal. |

### Caso de Uso: UC-S007 - Configurar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S007 |
| Descrição | Este caso de uso tem por objetivo permitir que o jogador ajuste opções gerais da experiência de jogo. |
| Ator Primário | Jogador |
| Pré-condição | Menu de pausa ou inicial aberto. |
| Cenário Principal | 1. Jogador acessa o menu de configurações.<br>2. Sistema exibe opções de vídeo, áudio e controles.<br>3. Jogador altera os valores. |
| Pós-condição | As configurações selecionadas são aplicadas conforme as opções alteradas pelo jogador. |
| Cenários Alternativos | - Se o jogador cancelar, as alterações não são salvas. |

### Caso de Uso: UC-S008 - Ajustar Configurações de Vídeo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S008 |
| Descrição | Este caso de uso permite que o jogador ajuste parâmetros visuais, como resolução e qualidade gráfica. |
| Ator Primário | Jogador |
| Pré-condição | Menu de configurações aberto. |
| Cenário Principal | 1. Jogador seleciona as opções de vídeo.<br>2. Sistema aplica as alterações.<br>3. Exibe o resultado em tempo real. |
| Pós-condição | O estado de configuração de vídeo da sessão é atualizado conforme os parâmetros selecionados. |
| Cenários Alternativos | - Se o hardware não suportar, o sistema retorna à configuração padrão. |

### Caso de Uso: UC-S009 - Ajustar Configurações de Áudio

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S009 |
| Descrição | Este caso de uso permite que o jogador ajuste volumes de música e efeitos sonoros. |
| Ator Primário | Jogador |
| Pré-condição | Menu de configurações aberto. |
| Cenário Principal | 1. Jogador altera o volume da música e dos efeitos.<br>2. Sistema aplica a alteração.<br>3. Testa a configuração em tempo real. |
| Pós-condição | O estado de configuração de áudio é atualizado conforme as preferências definidas pelo jogador. |
| Cenários Alternativos | - Se a alteração for inválida, o sistema restaura os valores padrão. |

### Caso de Uso: UC-S010 - Configurar Controles

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S010 |
| Descrição | Este caso de uso tem por objetivo permitir que o jogador personalize teclas e entradas de gamepad. |
| Ator Primário | Jogador |
| Pré-condição | Menu de configurações aberto. |
| Cenário Principal | 1. Jogador seleciona a opção de controles.<br>2. Sistema permite redefinir teclas.<br>3. Jogador confirma as alterações. |
| Pós-condição | As configurações de controle são atualizadas e salvas para uso em sessões futuras. |
| Cenários Alternativos | - Se o jogador cancelar, o sistema mantém a configuração anterior. |

### Caso de Uso: UC-S011 - Sair do Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S011 |
| Descrição | Este caso de uso permite que o jogador encerre a sessão de jogo. |
| Ator Primário | Jogador |
| Pré-condição | Jogo em execução. |
| Cenário Principal | 1. Jogador seleciona sair.<br>2. Sistema exibe uma mensagem de confirmação.<br>3. Se confirmado, encerra a aplicação. |
| Pós-condição | A sessão de jogo é finalizada e o estado de execução da aplicação é encerrado. |
| Cenários Alternativos | - Se o jogador cancelar, a sessão continua. |

### Caso de Uso: UC-S012 - Salvar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S012 |
| Descrição | Este caso de uso tem por objetivo registrar o progresso do jogador em arquivo local para continuidade futura. |
| Ator Primário | Jogador |
| Pré-condição | Sessão em andamento. |
| Cenário Principal | 1. Jogador solicita salvar.<br>2. Sistema coleta o estado atual do jogo, incluindo o ato em curso, as memórias registradas, o estado do diário e o estado visual da casa.<br>3. Sistema grava o arquivo de save. |
| Pós-condição | O progresso do jogador é persistido em arquivo local, permitindo a continuidade da sessão em momento posterior. |
| Cenários Alternativos | - Se ocorrer erro, o sistema notifica o jogador. |

## 2.7 Diagrama de Classes

O Diagrama de Classes UML representa estruturalmente os elementos de um sistema orientado a objetos, indicando classes, atributos, operações e relacionamentos. Segundo a IBM, diagramas UML auxiliam a representar diferentes perspectivas de um sistema, enquanto a Visual Paradigm destaca que o diagrama de classes descreve a estrutura do sistema por meio de classes, atributos, métodos e relações (IBM, s.d.c, online; Visual Paradigm, s.d., online).

Sua importância neste trabalho está em mostrar como a experiência contemplativa de **Ani** é traduzida em entidades de software com responsabilidades definidas. Ao explicitar a estrutura do jogo, o diagrama favorece a rastreabilidade entre requisitos, regras de negócio, persistência e implementação. A modelagem gráfica correspondente é apresentada na Figura 3, e a estrutura textual das classes é detalhada a seguir.

[Figura 3 – Diagrama de Classes de Ani]

As classes do projeto refletem diretamente sua arquitetura conceitual. `Ato` sintetiza os cinco atos filosóficos; `Memoria`, `Diario` e `EntradaDiario` formalizam o sistema de memórias; `ObjetoRestauravel` traduz a lógica de Kintsugi do Ato III; `ElementoContemplativo` traduz a contemplação ativa do Ato IV; `NPC` representa personagens de memória e arquétipos; e `Player` constitui a representação sistêmica de Ani como sujeito da experiência.

### Classe: Jogo
**Atributos:**
- `- titulo: string`
- `- atoAtual: Ato`
- `- cenarioAtual: Cenario`

**Métodos:**
- `+ iniciar()`
- `+ pausar()`
- `+ encerrar()`
- `+ carregarProgresso()`

### Classe: Personagem
**Atributos:**
- `- posicaoX: float`
- `- posicaoY: float`
- `- sprite: string`

**Métodos:**
- `+ mover()`

### Classe: Player
**Atributos:**
- `- estadoEmocional: string`
- `- diario: Diario`

**Métodos:**
- `+ interagir()`
- `+ observar()`
- `+ registrarMemoria()`

### Classe: NPC
**Atributos:**
- `- nome: string`
- `- tipo: string`

**Métodos:**
- `+ falar()`
- `+ interagir()`

### Classe: ObjetoInterativo
**Atributos:**
- `- id: int`
- `- tipo: string`
- `- descricao: string`

**Métodos:**
- `+ ativar()`

### Classe: Memoria
**Atributos:**
- `- coletada: boolean`
- `- conteudo: string`
- `- atoOrigem: int`

**Métodos:**
- `+ exibir()`
- `+ registrarNoDiario()`

### Classe: Diario
**Atributos:**
- `- entradas: List<EntradaDiario>`

**Métodos:**
- `+ abrir()`
- `+ adicionarEntrada()`
- `+ consultarEntrada()`

### Classe: EntradaDiario
**Atributos:**
- `- titulo: string`
- `- conteudo: string`
- `- tipo: string`

**Métodos:**
- `+ atualizarLeitura()`

### Classe: Cenario
**Atributos:**
- `- nome: string`
- `- tipo: string`
- `- desbloqueado: boolean`

**Métodos:**
- `+ carregarCenario()`
- `+ desbloquearArea()`

### Classe: Ato
**Atributos:**
- `- id: int`
- `- nome: string`
- `- descricao: string`

**Métodos:**
- `+ iniciarAto()`
- `+ concluirAto()`

### Classe: ElementoContemplativo
**Atributos:**
- `- descricao: string`
- `- tempoMinimoObservacao: float`

**Métodos:**
- `+ observar()`
- `+ liberarNarracao()`

### Classe: ObjetoRestauravel
**Atributos:**
- `- estado: string`

**Métodos:**
- `+ restaurar()`

| Classe Origem | Tipo de Relacionamento | Classe Destino | Multiplicidade |
| --- | --- | --- | --- |
| Jogo | Composição | Ato | 1 para 1..* |
| Jogo | Composição | Cenario | 1 para 1..* |
| Player | Herança | Personagem | 1 para 1 |
| NPC | Herança | Personagem | 1 para 1 |
| Player | Composição | Diario | 1 para 1 |
| Player | Associação | ObjetoInterativo | 1 para 0..* |
| Memoria | Herança | ObjetoInterativo | 1 para 1 |
| ObjetoRestauravel | Herança | ObjetoInterativo | 1 para 1 |
| ElementoContemplativo | Herança | ObjetoInterativo | 1 para 1 |
| Memoria | Associação | Ato | 0..* para 0..1 |
| Diario | Composição | EntradaDiario | 1 para 0..* |

## 2.8 Diagrama Entidade-Relacionamento (DER)

O Diagrama Entidade-Relacionamento é um modelo conceitual voltado à representação de dados, entidades, atributos e relacionamentos de um domínio. A IBM descreve o DER como uma forma de visualizar entidades e relações em um domínio de dados, enquanto a Lucidchart destaca seu papel na organização lógica das informações e na compreensão das cardinalidades entre entidades (IBM, s.d.d, online; Lucidchart, s.d., online).

No presente projeto, o DER deriva do Diagrama de Classes e das Regras de Negócio para representar aquilo que precisa ser persistido no jogo. Seu foco incide sobre progresso do jogador, memórias coletadas, estado do diário e relações mínimas entre atos, cenários e objetos interativos, especialmente em função de RF009, RN001 e RN005.

A modelagem gráfica correspondente é apresentada na Figura 4, e a descrição textual das entidades é detalhada na sequência.

[Figura 4 – Diagrama Entidade-Relacionamento de Ani]

### Entidade: JOGO
**Atributos:** id (PK), titulo, atoAtual, cenarioAtual
**Relacionamentos:**
- Relaciona-se com ATO (cardinalidade: 1:N)
- Relaciona-se com CENARIO (cardinalidade: 1:N)
**Origem no GDD:** seção 10, Especificações Técnicas

### Entidade: ATO
**Atributos:** id (PK), nome, descricao, referenciaFilosofica, simbolo, paletaCor, climaSonoro
**Relacionamentos:**
- Relaciona-se com JOGO (cardinalidade: N:1)
- Relaciona-se com CENARIO (cardinalidade: 1:N)
- Relaciona-se com MEMORIA (cardinalidade: 1:N)
**Origem no GDD:** seções 2, 3 e 4

### Entidade: CENARIO
**Atributos:** id (PK), nome, tipo, desbloqueado, idAto (FK)
**Relacionamentos:**
- Relaciona-se com ATO (cardinalidade: N:1)
- Relaciona-se com OBJETO_INTERATIVO (cardinalidade: 1:N)
**Origem no GDD:** seção 3, Mundo do Jogo

### Entidade: PLAYER
**Atributos:** id (PK), posicaoX, posicaoY, sprite, estadoEmocional, idDiario (FK)
**Relacionamentos:**
- Relaciona-se com DIARIO (cardinalidade: 1:1)
- Relaciona-se com OBJETO_INTERATIVO (cardinalidade: N:M)
**Origem no GDD:** seções 5 e 6

### Entidade: NPC
**Atributos:** id (PK), nome, tipo, sprite, idCenario (FK)
**Relacionamentos:**
- Relaciona-se com CENARIO (cardinalidade: N:1)
**Origem no GDD:** seção 5

### Entidade: OBJETO_INTERATIVO
**Atributos:** id (PK), tipo, descricao, idCenario (FK)
**Relacionamentos:**
- Relaciona-se com CENARIO (cardinalidade: N:1)
- Relaciona-se com MEMORIA (cardinalidade: 1:0..1)
**Origem no GDD:** seção 6

### Entidade: OBJETO_RESTAURAVEL
**Atributos:** id (PK, FK → OBJETO_INTERATIVO), estado
**Relacionamentos:**
- Relaciona-se com OBJETO_INTERATIVO (cardinalidade: 1:1, especialização)
**Origem no GDD:** seção 6, Ato III

### Entidade: ELEMENTO_CONTEMPLATIVO
**Atributos:** id (PK, FK → OBJETO_INTERATIVO), descricao, tempoMinimoObservacao
**Relacionamentos:**
- Relaciona-se com OBJETO_INTERATIVO (cardinalidade: 1:1, especialização)
**Origem no GDD:** seção 6, Ato IV

### Entidade: MEMORIA
**Atributos:** id (PK), conteudo, coletada, atoOrigem, idObjetoInterativo (FK)
**Relacionamentos:**
- Relaciona-se com OBJETO_INTERATIVO (cardinalidade: N:1)
- Relaciona-se com ENTRADA_DIARIO (cardinalidade: 1:0..1)
**Origem no GDD:** seção 6, Exploração e Diário de Memórias

### Entidade: DIARIO
**Atributos:** id (PK), idPlayer (FK)
**Relacionamentos:**
- Relaciona-se com PLAYER (cardinalidade: 1:1)
- Relaciona-se com ENTRADA_DIARIO (cardinalidade: 1:N)
**Origem no GDD:** seção 6, Diário de Memórias

### Entidade: ENTRADA_DIARIO
**Atributos:** id (PK), titulo, conteudo, tipo, idDiario (FK), idMemoria (FK)
**Relacionamentos:**
- Relaciona-se com DIARIO (cardinalidade: N:1)
- Relaciona-se com MEMORIA (cardinalidade: N:1)
**Origem no GDD:** seção 6, Diário de Memórias

# 3 Ferramentas e Métodos

A seleção de ferramentas do projeto foi orientada por três critérios centrais: adequação às especificações técnicas definidas para o jogo, suporte consolidado na comunidade de desenvolvimento de jogos e compatibilidade com a metodologia Cascata adotada no planejamento. Como o protótipo combina exploração lateral, progressão por atos, direção visual autoral e áudio adaptativo, tornou-se necessário escolher recursos que atendessem tanto às demandas de implementação quanto à coerência estética e documental.

Além disso, as ferramentas utilizadas apresentam licenças compatíveis com uso acadêmico e estão alinhadas às tecnologias registradas no Termo de Abertura do Projeto. Sempre que os artefatos-fonte não informam versão específica utilizada, essa ausência é explicitada, a fim de preservar a fidelidade documental.

### Ferramenta: Unity
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** Unity Personal (uso educacional)  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** motor de jogo responsável pela implementação do protótipo, gerenciamento de cenas, lógica de gameplay, física, interface e integração audiovisual.  
**Justificativa de escolha:** foi escolhida por suportar desenvolvimento 2D com side-scroller lateral, câmera lateral fixa e elementos 3D estilizados, conforme a base técnica do projeto. Também oferece suporte a partículas e efeitos úteis para distorção emocional e transições por ato.

### Ferramenta: C#
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** não especificada nos artefatos-fonte  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** linguagem principal de programação para implementação dos sistemas do jogo.  
**Justificativa de escolha:** foi adotada por ser a linguagem nativa da Unity e por favorecer modelagem orientada a objetos coerente com o diagrama de classes, especialmente na organização de `Jogo`, `Ato`, `Player`, `Memoria` e `Diario`.

### Ferramenta: Aseprite
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** proprietária, paga, uso perpétuo  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** produção de sprites e animações 2D.  
**Justificativa de escolha:** adequa-se à produção visual de sprites com estética de desenho à mão, aquarela e grafite, em conformidade com a direção visual e a textura artesanal previstas para o jogo.

### Ferramenta: Adobe Photoshop / Adobe Illustrator
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** Creative Cloud, assinatura  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** criação de ilustrações, texturas, paletas e elementos gráficos de interface.  
**Justificativa de escolha:** essas ferramentas apoiam a produção de assets visuais de maior fidelidade, incluindo as paletas por ato e os elementos do diário de memórias, fundamentais para a progressão visual e para a interface diegética.

### Ferramenta: Audacity
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** GPL, código aberto  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** gravação e edição de efeitos sonoros e trilhas de apoio.  
**Justificativa de escolha:** foi empregado por permitir editar material sonoro alinhado à direção de áudio por ato, incluindo ruídos, ambiências e elementos de crise de ansiedade previstos no projeto.

### Ferramenta: FMOD
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** FMOD for Education, gratuita para projetos acadêmicos  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** middleware de áudio adaptativo para jogos.  
**Justificativa de escolha:** permite controlar trilha e camadas sonoras de acordo com estado emocional e ato em curso, sendo especialmente útil para implementar a transição filosófica do áudio ao longo da jornada.

### Ferramenta: draw.io (diagrams.net)
**Versão utilizada:** não especificada nos artefatos-fonte  
**Tipo de licença:** Apache 2.0, código aberto  
**Site oficial:** não especificado nos artefatos-fonte  
**Função no projeto:** modelagem de diagramas UML, BPMN e demais artefatos estruturais.  
**Justificativa de escolha:** foi utilizada para representar visualmente a estrutura do sistema e o fluxo principal de gameplay, fortalecendo a documentação e a rastreabilidade entre modelagem e implementação.

| Artefato | Ferramenta / Meio de produção |
| --- | --- |
| GDD | Markdown |
| TAP | Markdown |
| BPMN | draw.io / diagrams.net |
| Diagrama de Classes | draw.io / diagrams.net |
| Código-fonte | Unity / C# |
| Assets visuais | Aseprite / Photoshop |
| Assets de áudio | Audacity / FMOD |

# 4 Desenvolvimento

## 4.1 Arquitetura do Sistema

A arquitetura geral do protótipo é organizada a partir de uma estrutura orientada a objetos compatível com a modelagem apresentada no Diagrama de Classes. O estado global do jogo é centralizado na classe `Jogo`, que mantém referências ao ato atual e ao cenário atual, enquanto a progressão filosófica é controlada pela classe `Ato`. A partir dessa base, o sistema articula exploração, interação, ativação de conteúdo narrativo, persistência e transição entre cenários.

Do ponto de vista operacional, a entrada do jogador é convertida em ações de movimentação, interação, observação e consulta ao diário. Essas ações incidem sobre o `Player`, que por sua vez aciona objetos interativos, registra memórias no diário, observa elementos contemplativos e participa da progressão entre atos. `Cenario`, `Memoria`, `Diario`, `ObjetoRestauravel` e `ElementoContemplativo` distribuem responsabilidades específicas de carregamento, registro, ressignificação e liberação de conteúdo.

O fluxo principal de dados do protótipo pode ser descrito da seguinte forma:

```text
Input (WASD / E / Tab)
  → InputManager
    → GameManager
      → Player (mover, interagir, observar, registrarMemoria)
        → ObjetoInterativo.ativar()
          → Memoria.registrarNoDiario() → Diario.adicionarEntrada()
          → ObjetoRestauravel.restaurar()
          → ElementoContemplativo.liberarNarracao()
      → Cenario.carregarCenario()
      → Ato.iniciarAto() / Ato.concluirAto()
        → Jogo.carregarProgresso()
```

Essa organização evidencia que a progressão por atos é controlada por `Ato`, ao passo que `Jogo` concentra o estado global e a continuidade da sessão. Com isso, a arquitetura consegue sustentar uma experiência em que atmosfera, memória e progressão possuem suporte estrutural claro.

## 4.2 Sistemas Implementados

### 4.2.1 Sistema de Movimentação e Colisão

O sistema de movimentação e colisão constitui a base da exploração lateral do jogo. Seu papel é permitir deslocamento contínuo e legível da personagem pelo cenário, ao mesmo tempo em que impede a travessia de paredes, objetos sólidos e limites físicos do espaço jogável.

- **Classes envolvidas:** `Player`, `Personagem`
- **Requisito funcional correspondente:** RF001, RF002
- **Regra de negócio correspondente:** não se aplica diretamente
- **Princípio do projeto que originou o sistema:** exploração lateral como eixo primário de interação e interface de controles reduzida
- **Trecho de código relevante:** `[Código 1 — rotina de leitura de input horizontal e validação de colisão do personagem]`
- **Captura de tela comentada:** `[Figura 5 – Deslocamento de Ani em cenário lateral com bloqueio por obstáculo sólido]`

A implementação prevista depende da captura de entrada por teclado, aplicação de velocidade ao personagem e verificação de colisão antes da confirmação do deslocamento. Como a proposta do jogo privilegia contemplação e ritmo, esse sistema deve ser estável e responsivo sem competir com a atmosfera geral da experiência.

### 4.2.2 Sistema de Memórias e Diário

O sistema de memórias e diário conecta exploração, narrativa e persistência. Objetos interativos funcionam como gatilhos de fragmentos narrativos e, quando aplicável, registram conteúdo no diário de memórias de Ani. Esse sistema também sustenta a possibilidade de releitura de itens já conhecidos conforme o avanço do jogo.

- **Classes envolvidas:** `ObjetoInterativo`, `Memoria`, `Diario`, `EntradaDiario`
- **Requisito funcional correspondente:** RF003, RF004, RF005
- **Regra de negócio correspondente:** RN001, RN005
- **Princípio do projeto que originou o sistema:** exploração e diário de memórias como centro da experiência
- **Trecho de código relevante:** `[Código 2 — fluxo de ativação de objeto interativo, criação de memória e adição de entrada ao diário]`
- **Captura de tela comentada:** `[Figura 6 – Registro de fragmento narrativo no diário após interação com objeto de memória]`

Quando o jogador interage com um objeto significativo, o sistema identifica seu tipo, ativa a memória ou evento correspondente e, se cabível, cria ou atualiza uma entrada no diário. RN001 impede duplicidade de registros, RF004 permite ordem variável de descoberta dos fragmentos, e RN005 assegura que o mesmo item possa adquirir nova interpretação sem perder sua identidade base.

### 4.2.3 Sistema de Progressão por Atos

O sistema de progressão por atos organiza a jornada em cinco etapas sequenciais, cada qual associada a atmosfera, visual, mecânicas e estados narrativos próprios. Ele controla desbloqueio de cenários, mudança de ato e verificação dos critérios mínimos de avanço.

- **Classes envolvidas:** `Ato`, `Jogo`, `Cenario`
- **Requisito funcional correspondente:** RF006, RF012, RF019
- **Regra de negócio correspondente:** RN002, RN003, RN004
- **Princípio do projeto que originou o sistema:** jornada filosófica em cinco atos sequenciais
- **Trecho de código relevante:** `[Código 3 — verificação de conclusão de ato e desbloqueio do cenário seguinte]`
- **Captura de tela comentada:** `[Figura 7 – Transição de ato com alteração de cenário e atmosfera]`

O sistema detecta a conclusão de cada etapa pela combinação entre exploração, memórias e eventos centrais do ato corrente. No Ato I, RN004 permite avanço mediante um limiar mínimo de memórias, sem exigir exaustão total do conteúdo disponível.

| Ato | Referência Filosófica | Tom | Símbolo |
| --- | --- | --- | --- |
| I | Zapffe | O peso da consciência | Relógio parado |
| II | Mainlander e Bahnsen | A vontade que se devora e o loop irresolúvel | Corredor em loop |
| III | Wabi-Sabi | Beleza no quebrado | Kintsugi |
| IV | Mono no Aware e Ikigai | Sentir o que passa e encontrar um fio de sentido | Pétalas de cerejeira |
| V | Yugen | O que não cabe em palavras | Estrela solitária |

### 4.2.4 Mecânica de Peso Literal (Ato I)

A mecânica de peso literal transforma o contato com memórias em alteração sensível do deslocamento da personagem. Cada lembrança tocada aumenta a sensação de peso, tornando o movimento mais lento e comunicando, por software, a ideia de consciência como fardo.

- **Classes envolvidas:** `Player`, `Ato`, `Memoria`
- **Requisito funcional correspondente:** RF013
- **Regra de negócio correspondente:** RN004
- **Princípio do projeto que originou o sistema:** Ato I como experiência do peso da consciência
- **Trecho de código relevante:** `[Código 4 — ajuste progressivo da velocidade do personagem conforme memórias coletadas]`
- **Captura de tela comentada:** `[Figura 8 – Redução perceptível da velocidade de Ani após contato com memórias do Ato I]`

Embora o sistema produza dificuldade sensorial de avanço, ele não configura punição explícita. A intenção é que o corpo da mecânica represente a tensão existencial do ato, não que imponha fracasso convencional ao jogador.

### 4.2.5 Mecânica de Ecos de Decisão (Ato II)

Os ecos de decisão estruturam situações em que o jogador tenta variar sua ação, mas retorna ao mesmo impasse narrativo. A mecânica traduz a contradição irresolúvel do Ato II e comunica a ideia de vontade que se devora.

- **Classes envolvidas:** `Player`, `Ato`, `Memoria`
- **Requisito funcional correspondente:** RF014
- **Regra de negócio correspondente:** RN006
- **Princípio do projeto que originou o sistema:** irresolução filosófica do Ato II
- **Trecho de código relevante:** `[Código 5 — recondução de estados alternativos para um mesmo desfecho narrativo]`
- **Captura de tela comentada:** `[Figura 9 – Corredor em loop com recorrência de situação decisória convergente]`

A implementação exige armazenamento de tentativas, reentrada em eventos e convergência controlada de resultado. Com isso, a mecânica preserva a sensação de tentativa do jogador sem romper a coerência filosófica da etapa.

### 4.2.6 Mecânica de Restauração por Aceitação (Ato III)

Essa mecânica permite restaurar objetos quebrados sem apagar suas marcas, em consonância com o símbolo do Kintsugi. O sistema precisa distinguir visual e logicamente estado quebrado, restaurado com marcas e referência original, quando aplicável.

- **Classes envolvidas:** `ObjetoRestauravel`, `ObjetoInterativo`
- **Requisito funcional correspondente:** RF015
- **Regra de negócio correspondente:** RN005
- **Princípio do projeto que originou o sistema:** beleza do quebrado e aceitação da rachadura
- **Trecho de código relevante:** `[Código 6 — mudança de estado de objeto restaurável e atualização visual após interação]`
- **Captura de tela comentada:** `[Figura 10 – Objeto do Ato III antes e depois da restauração, preservando marcas]`

O valor sistêmico da mecânica está menos na reparação utilitária e mais na ressignificação. O objeto deixa de ser apenas quebrado, mas não retorna a uma pureza anterior, reforçando a proposta de aceitação do dano como parte da forma final.

### 4.2.7 Mecânica de Contemplação Ativa (Ato IV)

A contemplação ativa converte a pausa em forma de interação. Em vez de exigir comando explícito, o sistema detecta permanência da personagem diante de elementos específicos por um tempo mínimo e, então, libera memória, narração ou efeito simbólico.

- **Classes envolvidas:** `ElementoContemplativo`, `Player`
- **Requisito funcional correspondente:** RF016
- **Regra de negócio correspondente:** não se aplica diretamente
- **Princípio do projeto que originou o sistema:** observação, impermanência e presença
- **Trecho de código relevante:** `[Código 7 — temporizador de observação e disparo de narração contemplativa]`
- **Captura de tela comentada:** `[Figura 11 – Jardim do Ato IV com ativação de memória por permanência em observação]`

A mecânica é coerente com a filosofia de interface invisível do projeto, pois a ação emerge do ritmo do jogador e não da presença de um botão dedicado. O sistema interpreta a pausa como gesto significativo.

### 4.2.8 Dissolução de Mecânicas (Ato V)

No Ato V, o protótipo abandona progressivamente mecânicas dos atos anteriores até restarem principalmente caminhar, observar e ouvir. A retirada de sistemas não é ausência de design, mas parte do design da etapa final.

- **Classes envolvidas:** `Ato`, `Jogo`, `Player`
- **Requisito funcional correspondente:** RF017
- **Regra de negócio correspondente:** RN002
- **Princípio do projeto que originou o sistema:** o mistério que não cabe em palavras
- **Trecho de código relevante:** `[Código 8 — desativação progressiva de subsistemas conforme avanço do Ato V]`
- **Captura de tela comentada:** `[Figura 12 – Cenário final com mecânicas reduzidas e predominância de contemplação]`

A implementação exige controle condicional sobre sistemas previamente ativos, para que desapareçam em sequência coerente com a jornada do jogador. Essa dissolução reconfigura a própria linguagem de interação do jogo no desfecho.

### 4.2.9 Sistema de Crises de Ansiedade

O sistema de crises de ansiedade atua no plano sensorial, alterando imagem, som e presença das manifestações sem impor punição sistêmica explícita. Trata-se de um conjunto de efeitos voltado a expressar estados emocionais intensificados.

- **Classes envolvidas:** `Player`, `Cenario`
- **Requisito funcional correspondente:** RF018
- **Regra de negócio correspondente:** não se aplica diretamente
- **Princípio do projeto que originou o sistema:** ansiedade e respiração como base sensorial
- **Trecho de código relevante:** `[Código 9 — acionamento de distorção visual, fragmentação sonora e aumento de manifestações]`
- **Captura de tela comentada:** `[Figura 13 – Episódio de crise com distorção visual e reforço atmosférico]`

Os efeitos esperados incluem distorção visual, fragmentação sonora e intensificação das manifestações, com a respiração de Ani funcionando como indicador sensorial. O impacto do sistema é atmosférico e emocional, não quantitativo.

| Elemento | Direção sonora e funcional |
| --- | --- |
| NPCs | Comunicação prioritariamente textual |
| Crises de ansiedade | Sussurros humanos distorcidos |
| Memórias felizes | Sons urbanos suaves e papel sendo folheado |
| Memórias traumáticas | Abafamento, ruído e silêncio súbito |
| Interações materiais | Sons táteis, íntimos e físicos |

### 4.2.10 Sistema de Save/Load

O sistema de save/load é responsável por preservar continuidade da sessão e permitir retomada do progresso sem perda de integridade. Seu escopo inclui persistência do ato atual, memórias registradas, estado do diário e estado visual da casa.

- **Classes envolvidas:** `Jogo`, `Diario`, `Ato`, `Cenario`
- **Requisito funcional correspondente:** RF009
- **Regra de negócio correspondente:** RN001
- **Princípio do projeto que originou o sistema:** continuidade estrutural da jornada por atos
- **Trecho de código relevante:** `[Código 10 — serialização do estado global do jogo e restauração de progresso]`
- **Captura de tela comentada:** `[Figura 14 – Continuidade da sessão após carregamento de save local]`

O sistema deve operar em consonância com RNF002, segundo o qual os saves locais devem carregar em menos de cinco segundos e preservar a integridade dos dados persistidos. Isso exige um modelo de dados compatível com a estrutura do diário, dos cenários e dos atos.

### 4.2.11 Interface e Controles

A interface do projeto segue uma filosofia de quase invisibilidade. Em vez de HUD permanente e barras numéricas, o estado do jogo é comunicado por atmosfera, distorção, respiração, ícones discretos e pelo próprio diário de memórias como objeto diegético.

- **Classes envolvidas:** `Jogo`, `Diario`
- **Requisitos correspondentes:** RF005, RNF004
- **Regra de negócio correspondente:** não se aplica diretamente
- **Princípio do projeto que originou o sistema:** interface mínima, sensorial e integrada ao mundo
- **Trecho de código relevante:** `[Código 11 — abertura do diário diegético e acionamento de indicadores discretos de interação]`
- **Captura de tela comentada:** `[Figura 15 – Interface do diário e ausência de HUD permanente durante exploração]`

| Ação | Controle |
| --- | --- |
| Movimento | WASD ou setas |
| Interagir | E ou clique esquerdo |
| Diário de memórias | Tab |
| Contemplar | Sem botão dedicado; depende de parar e observar |

### 4.2.12 Sistema de Áudio Adaptativo

O sistema de áudio adaptativo organiza trilha e efeitos de forma coerente com a mudança filosófica entre os atos. Seu papel é garantir que o som não apenas acompanhe a cena, mas participe da construção de sentido da jornada.

- **Classes envolvidas:** integração sistêmica com `Jogo`, `Ato` e eventos do cenário
- **Requisito funcional correspondente:** RF010
- **Regra de negócio correspondente:** não se aplica diretamente
- **Princípio do projeto que originou o sistema:** o áudio acompanha a transição filosófica do jogo
- **Trecho de código relevante:** `[Código 12 — transição de parâmetros e camadas sonoras por ato no middleware de áudio]`
- **Captura de tela comentada:** `[Figura 16 – Configuração sonora de ato com trilha adaptada ao estado da jornada]`

| Ato | Clima Sonoro | Elementos |
| --- | --- | --- |
| I | Peso e clausura | Silêncio pesado, rangidos, passos ecoados, relógios que não andam |
| II | Loop e distorção | Repetições ligeiramente erradas, batimentos, ecos codificados |
| III | Textura e imperfeição | Cordas imperfeitas, cerâmica, madeira, presença tátil dos sons |
| IV | Abertura e passagem | Flauta, vento, sino distante, queda de pétalas e pausas longas |
| V | Imensidão e silêncio | Sustentação mínima, espaço entre notas e sensação de vazio |

## 4.3 Capturas de Tela e Funcionalidades

[Figura 17 – Tela inicial / menu]  
Descrição: a imagem deve mostrar o menu inicial do jogo, evidenciando o início da jornada e a identidade visual contemplativa da interface.

[Figura 18 – Exploração do cenário no Ato I]  
Descrição: a imagem deve mostrar Ani explorando o cenário inicial, com destaque para a lentidão do movimento após o contato com memórias, evidenciando RF013.

[Figura 19 – Diário de memórias aberto]  
Descrição: a imagem deve mostrar a interface diegética do diário, com entradas registradas e leitura de um fragmento narrativo associado a RF005.

[Figura 20 – Cenário do Ato II em corredor em loop]  
Descrição: a imagem deve mostrar um espaço repetitivo e desorientador, evidenciando a mecânica de ecos de decisão e o impasse do Ato II.

[Figura 21 – Mecânica de restauração no Ato III]  
Descrição: a imagem deve mostrar um objeto antes e depois da restauração, preservando rachaduras visíveis, em consonância com RF015.

[Figura 22 – Jardim contemplativo do Ato IV]  
Descrição: a imagem deve mostrar Ani parada diante de um elemento contemplativo, com liberação de narração ou memória após observação prolongada.

[Figura 23 – Crise de ansiedade com distorção visual]  
Descrição: a imagem deve mostrar distorções de tela, intensificação de manifestações e atmosfera sonora associada à crise, evidenciando RF018.

[Figura 24 – Cenário do Ato V com dissolução de mecânicas]  
Descrição: a imagem deve mostrar um espaço aberto e indefinido, com redução perceptível de sistemas de interação e predominância de movimento e contemplação.

# Referências

IBM. *Creating use-case diagrams*. Disponível em: <https://www.ibm.com/docs/en/dma?topic=diagrams-creating-use-case>. Acesso em: 22 mar. 2026.

IBM. *Use case view*. Disponível em: <https://www.ibm.com/docs/en/systems-engineering/1.5.0?topic=views-use-case-view>. Acesso em: 22 mar. 2026.

IBM. *UML diagrams*. Disponível em: <https://www.ibm.com/docs/en/radfws/9.6.1?topic=diagrams-uml>. Acesso em: 22 mar. 2026.

IBM. *What is an entity relationship diagram?* Disponível em: <https://www.ibm.com/think/topics/entity-relationship-diagram>. Acesso em: 25 mar. 2026.

LUCIDCHART. *What is an Entity Relationship Diagram (ERD)?* Disponível em: <https://www.lucidchart.com/pages/er-diagrams/>. Acesso em: 25 mar. 2026.

OBJECT MANAGEMENT GROUP. *Business Process Model and Notation (BPMN) Version 2.0*. Needham: OMG, 2011. Disponível em: https://www.omg.org/spec/BPMN/2.0. Acesso em: 2024.

PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de Software: uma abordagem profissional*. 8. ed. Porto Alegre: AMGH, 2016.

PROJECT MANAGEMENT INSTITUTE. *Um Guia do Conhecimento em Gerenciamento de Projetos (Guia PMBOK)*. 6. ed. Newtown Square: PMI, 2017.

ROGERS, Scott. *Level Up!: The Guide to Great Video Game Design*. 2. ed. Chichester: Wiley, 2014.

SCHELL, Jesse. *A Arte de Game Design: o livro dos elementos*. Rio de Janeiro: Elsevier, 2011.

SOMMERVILLE, Ian. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

VISUAL PARADIGM. *What is Class Diagram?* Disponível em: <https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/>. Acesso em: 22 mar. 2026.
