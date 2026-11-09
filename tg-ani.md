# 1 Introdução

Os jogos digitais narrativos constituem um campo relevante de investigação em software porque articulam sistemas computacionais, linguagem audiovisual, interação e modelagem de experiência. Diferentemente de mídias puramente lineares, o jogo permite que o sujeito não apenas acompanhe uma trajetória, mas a vivencie por meio de ações, ritmos, interrupções e respostas sistêmicas. No caso de experiências contemplativas, essa característica amplia a capacidade do software de representar estados subjetivos, sofrimento, memória e transformação interior, convertendo temas abstratos em situações interativas sensíveis.

Nesse contexto, o projeto **Ani אֲנִי** propõe uma aventura narrativa contemplativa em 2.5D, centrada em consciência, sofrimento e descoberta gradual de sentido. A logline do projeto o define como “uma aventura narrativa contemplativa em 2.5D sobre consciência, sofrimento e a descoberta lenta do sentido”. Sua sinopse apresenta Ani em seu quarto, às 23:47, presa à tela do celular, acompanhando o perfil de Malu numa rede social. Quando a bateria acaba e o quarto mergulha no escuro, ela se levanta e o explora em busca do carregador, e os objetos que encontra a levam para dentro das próprias memórias, um espaço ao mesmo tempo familiar e deformado, no qual memórias, silêncio e ruínas emocionais substituem objetivos tradicionais, combate ou tutoriais extensos. O nome **אֲנִי** significa “eu” em hebraico e sintetiza a intenção de aproximar jogador e protagonista, de modo que a experiência não seja observada à distância, mas habitada desde dentro. As características gerais do produto estão reunidas na Ficha do Produto (Quadro 3), na seção 1.1.1.

A originalidade do projeto reside no fato de que sua espinha dorsal não é uma estrutura de moralidade binária, mas uma jornada de percepção organizada em cinco atos filosóficos. O percurso parte do pessimismo ocidental, associado a Zapffe, Mainländer e Bahnsen, e avança em direção a filosofias contemplativas japonesas, como Wabi-Sabi, Mono no Aware, Ikigai e Yugen. Essa transição não é tratada como exposição teórica, mas como mudança de atmosfera, espaço, ritmo, mecânica e linguagem sensorial (Quadro 1).

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

O objetivo geral do projeto é conceber um jogo narrativo contemplativo que represente, por meio de sistemas, mecânicas e linguagem visual, uma jornada filosófica de transformação interior estruturada em cinco atos, do pessimismo existencial à contemplação, e desenvolver um protótipo funcional do início do Ato I, com cerca de dez minutos de jogo, que demonstre parte do design e das mecânicas propostos, aplicando práticas de engenharia de software no planejamento e na construção do projeto. Como objetivos específicos, destacam-se a consolidação da direção conceitual e filosófica do jogo, o levantamento e a classificação de requisitos, a modelagem dos fluxos principais por BPMN e casos de uso, o projeto de sistemas capazes de traduzir cada ato em interação e a implementação de um protótipo do início do Ato I coerente com a documentação produzida.

A justificativa do trabalho apoia-se na singularidade dos jogos digitais como meio para representar experiências internas e subjetivas. Em **Ani**, a ausência de combate, de HUD numérico permanente e de moralidade binária não decorre de limitação técnica, mas de aderência ao objeto de pesquisa. A única exceção são os minigames das barracas do parque, no Ato I: como reproduzem jogos de parque de diversões, exibem placar e interface própria enquanto duram, sem efeito sobre a progressão. Como o foco está na travessia do sofrimento, na observação e na transformação de percepção, a interface minimalista, as pausas, o silêncio e as mecânicas contemplativas tornam-se escolhas metodologicamente coerentes com o que se pretende investigar em software interativo.

O projeto é desenvolvido segundo a metodologia Cascata, com fases sequenciais de levantamento de requisitos, modelagem, design de sistemas e implementação. As ferramentas centrais do protótipo são HTML, CSS e JavaScript com a biblioteca Three.js, executados no navegador, o Visual Studio Code, o Sprite Fusion e o GPT-6 para a geração dos sprites, scripts em Python (NumPy e Pillow) para o tratamento deles e o Claude Opus 5.5 para a modelagem 3D dos cenários em Three.js. A organização deste documento acompanha esse percurso: após a introdução, apresenta-se o Termo de Abertura do Projeto; em seguida, o levantamento de requisitos, com BPMN, requisitos, regras, casos de uso, diagrama de classes e DER; depois, as ferramentas e métodos empregados; por fim, descreve-se o desenvolvimento do protótipo funcional. O Apêndice B apresenta a missão, a visão e os valores do projeto. O Apêndice C traz uma versão resumida do Game Design Document, que reúne a direção criativa da qual os requisitos foram derivados.

## 1.1 Termo de Abertura do Projeto (TAP)

O Termo de Abertura do Projeto (TAP) é o documento que formaliza a existência de um projeto e registra seus direcionadores iniciais. No gerenciamento de projetos, sua função é consolidar propósito, escopo preliminar, stakeholders, premissas, restrições e critérios de sucesso, oferecendo uma base de alinhamento entre os envolvidos. Segundo o Project Management Institute, o documento de abertura autoriza formalmente o projeto e define seus elementos estruturantes em nível inicial (PROJECT MANAGEMENT INSTITUTE, 2017).

No contexto acadêmico, o TAP exerce papel equivalente ao de um contrato de projeto, pois delimita o que será construído, quem participa do processo, quais recursos são previstos e quais limites precisam ser respeitados. Em trabalhos de software, esse artefato também favorece a rastreabilidade entre problema de pesquisa, objetivos, modelagem e implementação, reduzindo ambiguidades nas etapas subsequentes.

No caso de **Ani**, o TAP organiza a proposta de um jogo narrativo contemplativo em termos de gerenciamento, escopo e viabilidade. A seguir, apresenta-se o conteúdo completo do artefato, acrescido da contextualização do produto digital a ser entregue.

### 1.1.1 Identificação do Projeto

A identificação do projeto é apresentada no Quadro 2.

| Item | Descrição |
| --- | --- |
| Nome do projeto | Ani אֲנִי |
| Tipo | Jogo digital narrativo contemplativo |
| Área | Desenvolvimento de software e jogos digitais |
| Plataforma inicial | PC (Windows), como software instalado; o protótipo é executado no navegador |
| Motor de jogo | Jogo completo: Unreal Engine 5.4.4; protótipo: Three.js (biblioteca 3D sobre WebGL) |
| Linguagem principal | Jogo completo: C++; protótipo: JavaScript, com HTML e CSS |
| Natureza do projeto | Projeto autoral com finalidade acadêmica e prototipação, com apoio de ferramentas de IA generativa na produção dos sprites e na modelagem 3D do protótipo |

#### Ficha do Produto

As características do produto estão resumidas no Quadro 3.

| Item | Descrição |
| --- | --- |
| Título | Ani |
| Gênero | Aventura narrativa contemplativa em 2.5D |
| Plataforma principal | PC (Windows), como software instalado; o protótipo é executado no navegador |
| Engine | Jogo completo: Unreal Engine 5.4.4; protótipo: Three.js (biblioteca 3D sobre WebGL) |
| Linguagem | Jogo completo: C++; protótipo: JavaScript, com HTML e CSS |
| Câmera | Lateral, com planos em primeira pessoa e de cima nos momentos de inspeção |
| Público-alvo | 16 a 28 anos, com interesse em filosofia, arte e narrativas reflexivas |
| Tom | Sombrio, melancólico e contemplativo, com redenção gradual |
| Duração estimada | 3 a 5 horas por jornada |

### 1.1.2 Problema de Pesquisa

De que forma o design de um jogo narrativo pode representar eficazmente uma jornada filosófica de transformação interior e a construção da identidade de um personagem?

### 1.1.3 Objetivo Geral

Conceber um jogo narrativo contemplativo que represente, por meio de sistemas, mecânicas e linguagem visual, uma jornada filosófica de transformação interior estruturada em cinco atos, do pessimismo existencial à contemplação, e desenvolver um protótipo funcional do início do Ato I, com cerca de dez minutos de jogo, que demonstre parte do design e das mecânicas propostos, aplicando práticas de engenharia de software no planejamento e na construção do projeto.

### 1.1.4 Objetivos Específicos

- consolidar a direção conceitual e filosófica do jogo por meio do Game Design Document (GDD);
- levantar, classificar e documentar os requisitos funcionais, não funcionais e regras de negócio do sistema;
- modelar os fluxos principais do jogo utilizando BPMN e casos de uso;
- projetar sistemas e mecânicas que traduzam, em interação, cada etapa da jornada filosófica de Ani;
- implementar um protótipo funcional do início do Ato I, com cerca de dez minutos de jogo, coerente com a documentação produzida.

### 1.1.5 Justificativa

Jogos digitais constituem um meio singular para explorar experiências internas e subjetivas: a interatividade permite que o jogador não apenas observe uma jornada, mas a habite ativamente, vivenciando estados emocionais, percepções e transformações de dentro para fora. Essa capacidade imersiva distingue o jogo de outras mídias narrativas e o torna especialmente adequado para representar processos internos complexos, como identidade, sofrimento e transformação filosófica.

**Ani** parte dessa premissa para investigar como a filosofia pode funcionar como linguagem acessível dentro de um jogo narrativo. Correntes como o pessimismo existencial de Zapffe e Mainländer e filosofias contemplativas japonesas, como Wabi-Sabi, Mono no Aware e Yugen, carregam ideias densas que, quando traduzidas em espaço, mecânica e atmosfera, tornam-se experienciáveis sem depender de mediação teórica.

O jogo se torna, assim, não um veículo de ensino da filosofia, mas um modo de sentir o que ela descreve.

### 1.1.6 Metodologia / Tecnologias

O projeto é conduzido segundo a metodologia Cascata (Waterfall), com fases sequenciais e dependentes: levantamento de requisitos, modelagem, design de sistemas e implementação.

A modelagem utiliza BPMN para representação dos fluxos de gameplay e UML para casos de uso e estrutura do sistema, garantindo rastreabilidade entre as decisões conceituais do projeto e as decisões técnicas do protótipo.

As tecnologias e ferramentas utilizadas no protótipo são:

- HTML, CSS e JavaScript (módulos ES, sem etapa de build) para a estrutura, a interface e a lógica do jogo;
- Three.js para a renderização 3D dos cenários sobre WebGL, com pós-processamento próprio para a estética de pixel art;
- Web Audio API para os sons, sintetizados em tempo de execução;
- Sprite Fusion e GPT-6 para a geração das folhas de sprites e scripts em Python (NumPy e Pillow) para o recorte e o ajuste dessas folhas;
- Claude Opus 5.5 para a modelagem 3D dos cenários em Three.js;
- GitHub Actions e GitHub Pages para a verificação e a publicação do protótipo.

O jogo completo será desenvolvido na Unreal Engine 5.4.4, com C++, como software para PC. Para o protótipo, em vez da Unreal Engine, adotou-se essa base web, executada no navegador, que também torna a apresentação mais simples. O principal motivo foi o tempo disponível para o desenvolvimento: após análise, concluiu-se que, no prazo do projeto, o Three.js era a tecnologia mais adequada para o protótipo. A produção do protótipo contou com apoio de IA generativa: o GPT-6, ao lado do Sprite Fusion, na geração dos sprites, e o Claude Opus 5.5 na modelagem 3D dos cenários.

### 1.1.7 Escopo

#### Escopo Incluído

- concepção de um jogo narrativo contemplativo estruturado em cinco atos filosóficos;
- exploração lateral do quarto de Ani e de ambientes de memória, simbólicos e fragmentados;
- interação com objetos de memória, fragmentos narrativos e elementos contemplativos;
- diário de memórias como sistema central de registro e leitura;
- mecânicas principais por ato, como peso literal, ecos de decisão, restauração por aceitação e contemplação ativa;
- construção de atmosfera visual e sonora coerente com a jornada filosófica de Ani;
- desenvolvimento de um protótipo funcional para PC, executado no navegador, com o início do Ato I (cerca de dez minutos de jogo).

#### Conteúdo do Protótipo

O protótipo demonstra parte do design e das mecânicas do jogo por meio do início do Ato I:

- o celular de Ani em primeira pessoa, com um aplicativo de rede social em que ela acompanha o perfil de Malu;
- a exploração do quarto em visão lateral, com luz e escuro, interruptor, luminária de plasma, inspeção de objetos em primeira pessoa e a gaveta onde está a tirinha de fotos;
- a memória do parque de diversões, um ano antes, ao lado de Malu, com conversas, barracas e a volta na roda-gigante;
- minigames nas barracas do parque (estoure o balão, derrube as latas e pescaria), únicos momentos do jogo com placar e interface própria;
- comidas compradas nas barracas (algodão-doce, pipoca, churros e maçã do amor), que acabam aos poucos, mordida a mordida.

#### Escopo Não Incluído

- lançamento comercial do jogo;
- versão final completa com todo o conteúdo planejado, refinado e polido;
- no protótipo, o diário de memórias, as mecânicas por ato e os Atos II a V, que permanecem na concepção do jogo;
- portabilidade efetiva para consoles e dispositivos móveis;
- produção final de todos os assets artísticos e sonoros definitivos.

#### Principais Características do Produto

- Aventura narrativa contemplativa em 2.5D
- Progressão em cinco atos filosóficos
- Ausência de combate e moralidade binária
- Mundo mental simbólico e mutável
- Mecânicas que nascem e desaparecem conforme o significado de cada ato
- Diário de memórias como elemento narrativo central
- Crises de ansiedade como recurso sensorial e dramático
- Interface minimalista e diegética
- Final único, aberto e interpretativo

### 1.1.8 Principais Entregas

- conceito consolidado de **Ani** como jogo narrativo contemplativo;
- documentação funcional e estrutural de apoio ao desenvolvimento;
- modelagem dos principais fluxos e interações do sistema;
- protótipo jogável do início do Ato I (cerca de dez minutos de jogo), executado no navegador e publicado no GitHub Pages;
- base técnica e conceitual para evolução futura do projeto.

### 1.1.9 Stakeholders

Os stakeholders do projeto e seus papéis são apresentados no Quadro 4.

| Stakeholder | Papel |
| --- | --- |
| Autor do projeto | Responsável pela concepção, direção criativa e desenvolvimento |
| Orientador acadêmico | Responsável pelo acompanhamento metodológico e orientação do projeto |
| Banca avaliadora | Responsável pela análise crítica e avaliação da proposta |
| Jogador final | Público que vivencia a experiência interativa proposta |

### 1.1.10 Público-Alvo do Produto

O projeto é direcionado principalmente a pessoas entre 16 e 28 anos interessadas em:

- jogos narrativos e contemplativos;
- experiências artísticas interativas;
- temas ligados à filosofia, subjetividade e simbolismo;
- obras com atmosfera melancólica, reflexiva e interpretativa.

### 1.1.11 Premissas

- o projeto será desenvolvido inicialmente como experiência para PC;
- a direção conceitual atual será a principal referência para as próximas etapas;
- o protótipo priorizará a experiência central do jogo em vez de uma versão extensa de conteúdo;
- a proposta visual, sonora e mecânica poderá ser refinada conforme os testes e a maturação do projeto;
- a implementação buscará traduzir a jornada filosófica em interação jogável e atmosfera sensível.

### 1.1.12 Restrições

- tempo limitado para desenvolvimento e refinamento do protótipo, que levou à adoção de uma base web (Three.js) para o protótipo, mais rápida de produzir e de apresentar;
- escopo sujeito a ajustes conforme viabilidade técnica e maturação da proposta;
- recursos artísticos e sonoros ainda em fase de definição e produção;
- necessidade de concentrar esforços na experiência central do jogo antes da expansão de conteúdo.

### 1.1.13 Riscos Iniciais

Os riscos iniciais e seus impactos estão listados no Quadro 5.

| Risco | Impacto |
| --- | --- |
| Mudanças conceituais frequentes na direção do jogo | Retrabalho em design, sistemas e implementação |
| Escopo excessivamente amplo para o tempo disponível | Comprometimento da qualidade do protótipo |
| Dependência de assets visuais e sonoros ainda não finalizados | Atraso na consolidação da atmosfera desejada |
| Dificuldade em transformar filosofia em mecânicas claras | Distanciamento entre proposta conceitual e experiência jogável |
| Excesso de abstração narrativa | Redução da compreensão e do engajamento do jogador |
| Necessidade de trocar de tecnologia por falta de tempo | Retrabalho na base técnica do protótipo e na documentação |
| Dependência de IA generativa na produção dos sprites | Inconsistências entre quadros e personagens, que exigem correção por scripts próprios |
| Desempenho do protótipo no navegador em placas de vídeo modestas | Queda de quadros por segundo e perda da atmosfera pretendida |
| Limitações impostas pelo navegador (tela cheia só após um clique, suporte variável a controles) | Experiência menos imersiva ou controles indisponíveis em alguns navegadores |
| Progresso salvo no armazenamento do navegador | Perda do progresso se o jogador limpar os dados do navegador |

### 1.1.14 Cronograma Macro

1. Consolidação da direção conceitual, filosófica e estética do jogo.
2. Definição dos sistemas centrais, requisitos e fluxos de interação.
3. Modelagem estrutural e organização da base técnica do projeto.
4. Implementação das mecânicas principais e da navegação da experiência.
5. Integração de atmosfera visual, sonora e narrativa.
6. Refinamento do protótipo jogável.

### 1.1.15 Critério de Sucesso

O projeto será considerado bem-sucedido se conseguir entregar um protótipo funcional capaz de expressar com clareza a proposta central de **Ani**: uma jornada contemplativa, simbólica e interativa de transformação interior, coerente em suas mecânicas, atmosfera e identidade visual.

# 2 Levantamento de Requisitos

## 2.1 Elicitação e Especificação dos Requisitos

A elicitação de requisitos corresponde ao processo de identificar, compreender, negociar e documentar os serviços, restrições e comportamentos esperados de um sistema. Para Sommerville (2019), os requisitos expressam aquilo que o software deve fazer e as condições sob as quais deve operar; Pressman e Maxim (2016) destacam que a qualidade da solução depende fortemente da qualidade da descoberta inicial dessas necessidades. Em projetos digitais complexos, a elicitação não é apenas levantamento, mas também interpretação técnica do domínio.

No presente projeto, foi aplicado por formulário um questionário exploratório a 8 participantes com perfil próximo ao público-alvo, com cinco perguntas: o que atrai o participante em um jogo narrativo, e o que ele espera quanto à fluidez e à programação, às mecânicas, à arte e ao design, e à história e ao significado. As respostas foram, em geral, vagas e não geraram mecânicas nem decisões de design; as que tinham algum conteúdo aproveitável foram anonimizadas e resumidas no Apêndice A (os resumos não são transcrições; as respostas originais não foram preservadas). Nenhum requisito deste trabalho tem o questionário como fonte.

Por esse baixo aproveitamento, a elicitação foi conduzida principalmente por análise documental e refinamento iterativo. A documentação já existente do jogo funcionou como base primária para transformar intenções conceituais em exigências formais de software. Em especial, o documento de direção do projeto exerceu o papel de fonte de requisitos de produto, registrando narrativa, mecânicas, mundo, interface, áudio e especificações técnicas que depois foram convertidos em artefatos de engenharia.

Além da análise documental, o refinamento ocorreu pelo confronto entre intenção de design e viabilidade de implementação do protótipo. Isso permitiu distinguir funcionalidades centrais do protótipo, desdobrar mecânicas em regras verificáveis e traduzir elementos atmosféricos em restrições não funcionais e comportamentos do sistema. Tal processo foi particularmente importante porque **Ani** não depende apenas de ações visíveis, mas também de transformações internas, progressão sensorial e mudanças de leitura ao longo dos atos.

Quanto à classificação, adotou-se a distinção entre requisitos **evidentes**, cujo efeito é percebido pelo jogador, e requisitos **ocultos**, que ocorrem sem que o jogador perceba, independentemente de serem acionados por ele. Também se utilizou priorização por níveis, com destaque para Altíssima, Alta e Média, permitindo identificar o núcleo funcional indispensável do protótipo.

O conjunto de mecânicas e diretrizes do projeto orientou diretamente a geração dos requisitos. A mecânica de **Peso Literal**, no Ato I, originou RF013; **Ecos de Decisão**, no Ato II, originou RF014; a **Restauração por Aceitação**, no Ato III, originou RF015; a **Contemplação Ativa**, no Ato IV, originou RF016; e a **Dissolução de Mecânicas**, no Ato V, originou RF017. O **Sistema de Memórias** e o **Diário** originaram RF004 e RF005; as **Crises de Ansiedade** originaram RF018; a **jogabilidade autoexplicativa** sustentou RNF004; a **Progressão em cinco atos filosóficos** fundamentou RF012 e RF006; e a **direção de áudio por ato** fundamentou RF010.

Essa rastreabilidade mostra que os requisitos de **Ani** derivam de uma visão de produto em que atmosfera, percepção, tempo e transformação são tão importantes quanto comandos, colisão e persistência. Assim, a elicitação não apenas identificou funcionalidades, mas formalizou em linguagem de software a proposta filosófica, estética e interativa do projeto.

Os Quadros 6 e 7 sintetizam, respectivamente, a progressão visual e o clima sonoro previstos para cada ato, elementos atmosféricos que a elicitação traduziu em requisitos.

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

A BPMN (*Business Process Model and Notation*) é uma notação padronizada para modelagem de processos, utilizada para representar atividades, decisões, participantes e fluxos de execução de forma compreensível para públicos técnicos e não técnicos. Conforme a Object Management Group, a notação organiza visualmente a dinâmica de um processo e favorece sua comunicação, análise e aperfeiçoamento (OBJECT MANAGEMENT GROUP, 2014).

No contexto de software, a BPMN é útil para explicitar como o sistema responde às ações do usuário e quais validações ou laços condicionais estruturam a experiência. Em **Ani**, sua utilização é pertinente porque o ciclo principal de gameplay não se resume a movimentar a personagem, mas envolve explorar, interagir, classificar objetos, processar memórias, registrar progresso e decidir se a exploração continua ou se a sessão se encerra.

O loop de progressão documentado no projeto estabelece que cada ato segue cinco passos: explorar a casa e perceber mudanças; encontrar a passagem para uma memória ou região mental; atravessar a experiência central do ato; retornar à casa e registrar o avanço no diário; e abrir passagem para o ato seguinte. Esse ciclo é a origem conceitual do BPMN do projeto, pois transforma a progressão simbólica da experiência em um fluxo operacional observável e modelável, representado na Figura 1.

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
| RF001 | Movimentar personagem | Evidente | Altíssima | O sistema deve permitir que o jogador mova Ani pelo cenário, para os lados e em profundidade, por teclado ou gamepad. |
| RF002 | Colisão com cenário e objetos | Evidente | Altíssima | O sistema deve impedir que Ani ultrapasse paredes, pisos e objetos sólidos. |
| RF003 | Interagir com objetos | Evidente | Altíssima | O sistema deve permitir interação com objetos significativos para acessar memórias, fragmentos narrativos e elementos contemplativos do cenário. |
| RF004 | Sistema de memórias | Evidente | Altíssima | O sistema deve apresentar memórias como fragmentos narrativos, como cartas, bilhetes, fotografias e diários, acessíveis por meio da interação com o ambiente. Os fragmentos são encontrados em ordem linear, definida pela narrativa de cada ato. |
| RF005 | Diário de memórias | Evidente | Altíssima | O sistema deve registrar os fragmentos coletados em um diário estilizado acessível ao jogador. Os itens podem ganhar nova leitura visual ou contextual conforme os atos avançam. |
| RF006 | Desbloqueio progressivo do cenário | Evidente | Altíssima | O sistema deve desbloquear cômodos, passagens, portas e escadas conforme o jogador atravessa memórias e conclui o ciclo de progressão de cada ato, segundo a regra de conclusão de ato (RN003) e, no Ato I, a da sequência linear de memórias (RN004). |
| RF007 | Sistema de puzzles | Evidente | Alta | O sistema deve incluir puzzles contextuais integrados ao ambiente e à narrativa dos atos. |
| RF008 | Diálogos com personagens de memória | Evidente | Alta | O sistema deve apresentar diálogos textuais fragmentados para personagens de memória, como Mãe, Padrasto, Pretendente e Primo. |
| RF009 | Sistema de save/load | Evidente | Altíssima | O sistema deve salvar e carregar o progresso do jogador, incluindo ato atual, memórias registradas, estado do diário e estado visual da casa. |
| RF010 | Feedback sonoro e musical por ato | Evidente | Alta | O sistema deve adaptar trilha sonora e efeitos sonoros de acordo com o ato filosófico em curso. |
| RF011 | Suporte a gamepad | Evidente | Média | O sistema deve permitir que o jogo seja controlado também por gamepad. |
| RF012 | Progressão por atos filosóficos | Evidente | Altíssima | O sistema deve estruturar o jogo em cinco atos sequenciais, em que a progressão marca as etapas narrativas da jornada de Ani, mantendo a mesma identidade visual ao longo dos atos. |
| RF013 | Mecânica de peso literal no Ato I | Evidente | Alta | O sistema deve aumentar a sensação de peso no deslocamento de Ani a cada memória tocada no Ato I, tornando o avanço mais lento. |
| RF014 | Mecânica de ecos de decisão no Ato II | Evidente | Alta | O sistema deve permitir que o jogador revisite, no Ato II, situações em que tenta agir de outro modo, mantendo o resultado preso ao mesmo impasse narrativo. |
| RF015 | Mecânica de restauração por aceitação no Ato III | Evidente | Alta | O sistema deve permitir, no Ato III, a restauração de objetos quebrados sem apagar suas marcas, em linha com a ideia de Kintsugi. |
| RF016 | Mecânica de contemplação ativa no Ato IV | Evidente | Alta | O sistema deve revelar, no Ato IV, fragmentos de narração quando o jogador permanece em observação diante de elementos contemplativos do cenário. |
| RF017 | Dissolução de mecânicas no Ato V | Evidente | Alta | O sistema deve retirar progressivamente, no Ato V, as mecânicas centrais dos atos anteriores até restarem principalmente deslocamento e contemplação. |
| RF018 | Crises de ansiedade como elemento sensorial | Evidente | Alta | O sistema deve representar crises de ansiedade por distorção visual, fragmentação sonora e intensificação das manifestações, sem depender de um sistema de escolhas morais. |
| RF019 | Conclusão da sequência de memórias no Ato I | Oculto | Alta | O sistema deve acompanhar, no Ato I, a posição do jogador na sequência de memórias e liberar a passagem para o ato seguinte quando a última memória da sequência for registrada, conforme a RN004. |
| RF020 | Aviso de conteúdo sensível | Evidente | Alta | O sistema deve exibir, antes do início do jogo, um aviso sobre temas sensíveis (ansiedade, sofrimento psíquico), com indicação de onde buscar apoio. |
| RF021 | Pausar jogo | Evidente | Alta | O sistema deve permitir que o jogador pause a sessão em andamento, suspendendo o gameplay e exibindo o menu de pausa, e retome o jogo do mesmo ponto. |
| RF022 | Configurar vídeo e áudio | Evidente | Média | O sistema deve permitir que o jogador ajuste opções de vídeo e áudio a partir do menu inicial ou do menu de pausa. |
| RF023 | Sair do jogo | Evidente | Alta | O sistema deve permitir que o jogador encerre a aplicação, pedindo confirmação antes de sair. |
| RF024 | Celular em primeira pessoa | Evidente | Alta | O sistema deve permitir que o jogador use o celular de Ani em primeira pessoa, navegando por um aplicativo de rede social com feed, perfis e publicações, e interagindo com elas, como abrir e curtir. |
| RF025 | Iluminação do ambiente | Evidente | Alta | O sistema deve permitir que o jogador acenda e apague a luz dos cômodos por meio de interruptores e ligue fontes de luz próprias, como luminárias, aplicando a regra de interação no escuro (RN007). |
| RF026 | Inspeção de objetos em primeira pessoa | Evidente | Média | O sistema deve permitir que o jogador examine de perto conjuntos de objetos do cenário, como estantes, móveis e mochilas, em visão de primeira pessoa ou vista de cima, selecionando cada item para ver sua descrição. |
| RF027 | Acesso a memórias por objeto-portal | Evidente | Altíssima | O sistema deve levar Ani do presente para uma memória quando o jogador interage com um objeto ligado a ela, como uma fotografia. |
| RF028 | Compra e consumo de comidas | Evidente | Média | O sistema deve permitir que o jogador compre comidas nas barracas das memórias e que as personagens as consumam aos poucos, em estágios visíveis, paradas ou andando. |
| RF029 | Minigames | Evidente | Média | O sistema deve oferecer minigames nas barracas do parque de diversões, com placar e interface próprios durante a partida, aplicando a regra de minigames sem efeito na progressão (RN008). |
| RF030 | Personagem acompanhante | Evidente | Média | O sistema deve fazer com que personagens de memória acompanhem Ani pelo cenário em determinadas fases, seguindo-a e comentando os lugares e as ações do jogador. |
| RF031 | Salvamento automático | Oculto | Alta | O sistema deve salvar o progresso automaticamente ao atingir pontos de salvamento definidos pela narrativa, sem ação do jogador. |

Observa-se uma distribuição de 9 requisitos com prioridade Altíssima, 16 com prioridade Alta e 6 com prioridade Média. Pela classificação adotada, há 29 requisitos evidentes e 2 ocultos. O bloco RF012 a RF019 concentra as mecânicas filosóficas por ato e, como seus efeitos são percebidos pelo jogador, é quase todo evidente; apenas o RF019 permanece oculto, pois o jogador percebe a abertura da passagem (RF006), mas não o acompanhamento da sequência de memórias que a determina. O RF031 também é oculto, porque o salvamento automático acontece em segundo plano. Os requisitos RF024 a RF031 descrevem as mecânicas do início do Ato I: o celular, a iluminação dos cômodos, a inspeção de objetos, a passagem para as memórias, as comidas, os minigames e o personagem acompanhante.

## 2.4 Requisitos Não Funcionais

Requisitos não funcionais expressam restrições de qualidade, desempenho, usabilidade, portabilidade e demais condições que moldam como o sistema deve operar. Segundo Sommerville (2019), eles não descrevem serviços específicos, mas propriedades e limites que influenciam o comportamento global do software. Pressman e Maxim (2016) reforçam que tais requisitos afetam diretamente a aceitabilidade do produto.

Em **Ani**, os RNFs não se limitam a desempenho técnico. Eles também registram compromissos com portabilidade, acessibilidade, localização e jogabilidade autoexplicativa. Assim, os requisitos não funcionais delimitam condições de qualidade que ajudam a preservar a proposta contemplativa do jogo.

O Quadro X apresenta os requisitos não funcionais do sistema, indicando os critérios de qualidade e suas respectivas classificações.

| Código | Nome | Requisito | Tipo | Classificação |
| --- | --- | --- | --- | --- |
| RNF001 | Desempenho mínimo | O sistema deve manter taxa mínima de 60 FPS em hardware equivalente a Intel HD Graphics e 4 GB de RAM. | Desempenho | Obrigatório, Permanente |
| RNF002 | Carregamento e integridade dos saves | O sistema deve carregar saves locais em menos de 5 segundos e preservar a integridade dos dados de progresso por ato. | Confiabilidade | Obrigatório, Permanente |
| RNF003 | Portabilidade de código e assets | O sistema deve ser estruturado de forma a permitir adaptação para outras plataformas com alterações mínimas no código e nos assets. | Portabilidade | Desejável, Permanente |
| RNF004 | Jogabilidade autoexplicativa | O sistema deve permitir que novos jogadores compreendam as mecânicas básicas sem necessidade de tutorial extenso ou instruções constantes em tela. | Usabilidade | Obrigatório, Permanente |
| RNF005 | Internacionalização de textos | O sistema deve suportar internacionalização por meio de arquivos externos de texto, permitindo tradução para outros idiomas. | Internacionalização | Obrigatório, Transitório |
| RNF006 | Acessibilidade sensorial e de áudio | O sistema deve oferecer recursos de acessibilidade, incluindo controle de intensidade visual, legendas para efeitos sonoros e controle independente de volume por camada de áudio. | Acessibilidade | Obrigatório, Permanente |

Os RNFs podem ser agrupados por tema da seguinte forma: desempenho e persistência em RNF001 e RNF002; portabilidade em RNF003; usabilidade em RNF004; internacionalização em RNF005; e acessibilidade sensorial e de áudio em RNF006.

## 2.5 Regras de Negócio

Regras de negócio são enunciados que impõem restrições, condições ou políticas sobre o comportamento de um sistema dentro de seu domínio. Em termos de modelagem, elas definem o que pode, deve ou não deve acontecer em determinados cenários, garantindo coerência operacional entre objetivos, entidades e processos. Em projetos de software, essas regras exercem papel fundamental na transformação de intenções de domínio em comportamentos verificáveis.

No caso de **Ani**, as regras de negócio não se limitam a validações administrativas; elas traduzem diretamente opções filosóficas e narrativas do projeto. A regra de convergência dos ecos de decisão, por exemplo, expressa em linguagem sistêmica a irresolução do Ato II, em que diferentes tentativas do jogador ainda convergem para o mesmo impasse narrativo.

O Quadro X apresenta as regras de negócio do sistema, descrevendo as restrições conceituais que orientam a progressão e o comportamento narrativo de **Ani**.

| Código | Nome | Descrição |
| --- | --- | --- |
| RN001 | Registro único de memória | Cada fragmento de memória pode ser registrado apenas uma vez no diário. |
| RN002 | Progressão fixa entre atos | A progressão entre atos ocorre de forma sequencial, seguindo a ordem definida no GDD, sem possibilidade de retorno ou salto de ordem. |
| RN003 | Critério de avanço por conclusão de ato | A progressão para o ato seguinte depende da conclusão dos critérios do ato atual. |
| RN004 | Sequência linear de memórias no Ato I | No Ato I, as memórias são percorridas em uma sequência fixa, definida pela narrativa: cada memória só fica disponível depois que a anterior é registrada, e a passagem para o ato seguinte é liberada quando a última memória da sequência é registrada. |
| RN005 | Ressignificação de objetos e memórias | Um fragmento pode assumir diferentes interpretações ao longo da progressão do jogo, sem alteração de sua identidade original no diário. |
| RN006 | Convergência dos ecos de decisão | Nos momentos de eco de decisão no Ato II, diferentes interações do jogador levam ao mesmo impasse narrativo. |
| RN007 | Interação no escuro | Com a luz do cômodo apagada, Ani não consegue examinar objetos: somente interruptores e fontes de luz próprias, como luminárias, podem ser acionados; nos demais casos, Ani informa que precisa acender a luz. |
| RN008 | Minigames sem efeito na progressão | O resultado dos minigames não altera a progressão da narrativa nem é exigido para avançar. |

Em termos de rastreabilidade, RN001 origina-se da seção de exploração e diário; RN002 decorre da estrutura narrativa em cinco atos; RN003 decorre da conclusão de cada ato; RN004 deriva do Ato I e da mecânica de peso literal; RN005 origina-se da exploração, do diário e da ressignificação de objetos; RN006 vem diretamente do Ato II e dos ecos de decisão; RN007 decorre da iluminação dos cômodos (RF025); e RN008, dos minigames do parque (RF029).

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
| UC-S010 | Sair do Jogo | Jogador |
| UC-S011 | Salvar Jogo | Jogador |
| UC-S012 | Continuar Jogo | Jogador |
| UC-S013 | Iniciar Novo Jogo | Jogador |
| UC-S014 | Resolver Puzzle | Jogador |
| UC-S015 | Usar Celular | Jogador |
| UC-S016 | Comprar e Consumir Comida | Jogador |
| UC-S017 | Jogar Minigame | Jogador |

[Figura 2 – Diagrama de Casos de Uso de Ani]

Os casos de uso articulam-se diretamente com as mecânicas do projeto: UC-S001 relaciona-se a RF001, RF002 e RF011 e à exploração em visão lateral; UC-S002 conecta-se a RF003, RF004, RF015 e RF016, cobrindo objetos significativos e mecânicas por ato, além da iluminação dos cômodos (RF025 e RN007), da inspeção em primeira pessoa (RF026) e do objeto que leva às memórias (RF027); UC-S003 deriva de RF008 e dos personagens de memória, incluindo o personagem acompanhante (RF030); UC-S004 e UC-S005 conectam-se a RF005 e ao diário de memórias; UC-S006 corresponde a RF021 (pausa); UC-S007, UC-S008 e UC-S009, a RF022 (configurações de vídeo e áudio); UC-S010, a RF023 (saída); UC-S011 e UC-S012 correspondem a RF009, salvando e carregando o progresso, com o salvamento automático (RF031) no UC-S011; UC-S013 corresponde a RF020 (aviso de conteúdo sensível), a RF012 (início no Ato I) e a RF009 (sobrescrita do save anterior); UC-S014 corresponde a RF007 (puzzles contextuais); UC-S015, a RF024 (celular) e a RF018 (o momento de pânico); UC-S016, a RF028 (comidas); e UC-S017, a RF029 (minigames) e à RN008.

Os Quadros 12 a 28 detalham cada caso de uso, com pré-condição, cenário principal, pós-condição e cenários alternativos.

### Caso de Uso: UC-S001 - Movimentar Personagem

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S001 |
| Descrição | Este caso de uso tem por objetivo permitir a movimentação de Ani pelo cenário em visão lateral, para os lados e em profundidade. |
| Ator Primário | Jogador |
| Pré-condição | Jogo iniciado com Ani carregado. |
| Cenário Principal | 1. Jogador aciona o comando de movimento (teclado ou gamepad).<br>2. Sistema captura a entrada.<br>3. Sistema aplica movimento no personagem.<br>4. Sistema verifica colisões.<br>5. Ani é movido corretamente pelo cenário. |
| Pós-condição | A posição de Ani é atualizada para uma coordenada válida no cenário, respeitando os limites e obstáculos existentes. |
| Cenários Alternativos | 4a. Colisão detectada:<br>4a.1. O sistema bloqueia o movimento. |

### Caso de Uso: UC-S002 - Interagir com Objetos

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S002 |
| Descrição | Este caso de uso permite que o jogador interaja com objetos significativos para acessar memórias, fragmentos narrativos ou elementos contemplativos do cenário. |
| Ator Primário | Jogador |
| Pré-condição | Ani deve estar próximo de um objeto interativo. |
| Cenário Principal | 1. Jogador aciona o comando de interação.<br>2. Sistema identifica o tipo de objeto interativo.<br>3. Sistema ativa o conteúdo associado, como um pensamento de Ani, a inspeção do objeto em primeira pessoa, a passagem para uma memória, um fragmento textual, um objeto restaurável ou um evento contemplativo.<br>4. Quando aplicável, o conteúdo é registrado no diário de Ani. |
| Pós-condição | O conteúdo associado ao objeto é disponibilizado ao jogador e, quando aplicável, registrado no diário de memórias. |
| Cenários Alternativos | 1a. Elemento contemplativo (Ato IV):<br>1a.1. Jogador mantém Ani parada diante do elemento, sem acionar a interação.<br>1a.2. Ao completar o tempo mínimo de observação, o sistema revela o fragmento de narração associado (RF016).<br>1a.3. Se Ani se afastar antes disso, nada é revelado.<br>1b. O cômodo está escuro (RN007):<br>1b.1. Se o objeto for um interruptor ou uma fonte de luz própria, o sistema acende ou apaga a luz.<br>1b.2. Caso contrário, o sistema exibe a fala de que Ani não consegue enxergar e precisa acender a luz, sem ativar o conteúdo.<br>2a. Objeto não interativo:<br>2a.1. Nada acontece.<br>3a. Inspeção em primeira pessoa:<br>3a.1. Jogador escolhe um item do conjunto e o sistema exibe sua descrição.<br>3a.2. Jogador aciona o comando de voltar e o sistema retorna à visão lateral.<br>3b. Objeto-portal:<br>3b.1. O sistema leva Ani do presente para a memória ligada ao objeto. |

### Caso de Uso: UC-S003 - Dialogar com Personagens

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S003 |
| Descrição | Este caso de uso tem por objetivo permitir a interação narrativa com personagens de memória. |
| Ator Primário | Jogador |
| Pré-condição | Ani deve estar próximo de um personagem interativo. |
| Cenário Principal | 1. Jogador aciona a interação.<br>2. Sistema identifica o personagem de memória.<br>3. Sistema exibe diálogo textual fragmentado.<br>4. Jogador avança o texto.<br>5. Quando aplicável, o conteúdo é registrado como memória narrativa ou reforço simbólico do ato atual. |
| Pós-condição | O diálogo é concluído e o estado narrativo associado à interação é atualizado pelo sistema. |
| Cenários Alternativos | 1a. Jogador ignora o personagem:<br>1a.1. O diálogo não é iniciado.<br>1b. Diálogo iniciado pela cena:<br>1b.1. Ao chegar a um ponto da narrativa, o sistema inicia o diálogo sem acionamento do jogador, e o fluxo segue no passo 3.<br>1c. Personagem acompanhante (RF030):<br>1c.1. Quando Ani interage com um lugar, o personagem que a acompanha responde com uma fala, e o fluxo segue no passo 3. |

### Caso de Uso: UC-S004 - Consultar Documentos Coletados

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S004 |
| Descrição | Este caso de uso permite que o jogador consulte documentos e fragmentos já registrados no diário de memórias. |
| Ator Primário | Jogador |
| Pré-condição | Pelo menos uma memória coletada. |
| Cenário Principal | 1. Jogador acessa o diário.<br>2. Sistema abre o documento selecionado.<br>3. Jogador lê o conteúdo. |
| Pós-condição | O documento selecionado é disponibilizado para leitura dentro do diário de memórias. |
| Cenários Alternativos | 2a. O diário não contém documentos:<br>2a.1. O sistema exibe páginas em branco. |

### Caso de Uso: UC-S005 - Acessar Diário de Memórias

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S005 |
| Descrição | Este caso de uso tem por objetivo permitir que o jogador acesse e navegue pelo diário de memórias de Ani. |
| Ator Primário | Jogador |
| Pré-condição | Jogo em execução. |
| Cenário Principal | 1. Jogador aciona o comando do diário de memórias.<br>2. Sistema abre uma interface estilizada em forma de diário.<br>3. Jogador navega pelas páginas. |
| Pós-condição | O diário de memórias é disponibilizado para navegação pelo jogador. |
| Cenários Alternativos | 2a. O diário de memórias está vazio:<br>2a.1. O sistema mostra páginas sem conteúdo. |

### Caso de Uso: UC-S006 - Pausar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S006 |
| Descrição | Este caso de uso permite que o jogador suspenda temporariamente a sessão em andamento. |
| Ator Primário | Jogador |
| Pré-condição | Sessão em andamento. |
| Cenário Principal | 1. Jogador aciona o comando de pausa.<br>2. Sistema suspende o gameplay.<br>3. Exibe o menu de pausa. |
| Pós-condição | O estado da sessão é atualizado para pausado, mantendo o jogo suspenso até nova ação do jogador. |
| Cenários Alternativos | 3a. Jogador retoma o jogo:<br>3a.1. O jogo volta ao estado normal.<br>3b. Jogador escolhe voltar ao menu principal:<br>3b.1. Sistema fecha o menu de pausa, deixa a cena em curso e exibe o menu principal. |

### Caso de Uso: UC-S007 - Configurar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S007 |
| Descrição | Este caso de uso tem por objetivo permitir que o jogador ajuste opções gerais da experiência de jogo. |
| Ator Primário | Jogador |
| Pré-condição | Menu de pausa ou inicial aberto. |
| Cenário Principal | 1. Jogador acessa o menu de configurações.<br>2. Sistema exibe opções de vídeo e áudio.<br>3. Jogador altera os valores. |
| Pós-condição | As configurações selecionadas são aplicadas conforme as opções alteradas pelo jogador. |
| Cenários Alternativos | 3a. Jogador volta ao menu anterior:<br>3a.1. As alterações feitas já estão aplicadas e salvas. |

### Caso de Uso: UC-S008 - Ajustar Configurações de Vídeo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S008 |
| Descrição | Este caso de uso permite que o jogador ajuste parâmetros visuais, como resolução e qualidade gráfica. |
| Ator Primário | Jogador |
| Pré-condição | Menu de configurações aberto. |
| Cenário Principal | 1. Jogador seleciona as opções de vídeo.<br>2. Sistema aplica as alterações.<br>3. Exibe o resultado em tempo real. |
| Pós-condição | O estado de configuração de vídeo da sessão é atualizado conforme os parâmetros selecionados. |
| Cenários Alternativos | 2a. O hardware não suporta a opção escolhida:<br>2a.1. O sistema retorna à configuração padrão. |

### Caso de Uso: UC-S009 - Ajustar Configurações de Áudio

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S009 |
| Descrição | Este caso de uso permite que o jogador ajuste volumes de música e efeitos sonoros. |
| Ator Primário | Jogador |
| Pré-condição | Menu de configurações aberto. |
| Cenário Principal | 1. Jogador altera o volume da música e dos efeitos.<br>2. Sistema aplica a alteração.<br>3. Testa a configuração em tempo real. |
| Pós-condição | O estado de configuração de áudio é atualizado conforme as preferências definidas pelo jogador. |
| Cenários Alternativos | 2a. A alteração é inválida:<br>2a.1. O sistema restaura os valores padrão. |

### Caso de Uso: UC-S010 - Sair do Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S010 |
| Descrição | Este caso de uso permite que o jogador encerre a sessão de jogo. |
| Ator Primário | Jogador |
| Pré-condição | Jogo em execução. |
| Cenário Principal | 1. Jogador seleciona sair.<br>2. Sistema exibe uma mensagem de confirmação.<br>3. Se confirmado, encerra a aplicação. |
| Pós-condição | A sessão de jogo é finalizada e o estado de execução da aplicação é encerrado. |
| Cenários Alternativos | 3a. Jogador cancela a confirmação:<br>3a.1. A sessão continua. |

### Caso de Uso: UC-S011 - Salvar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S011 |
| Descrição | Este caso de uso tem por objetivo registrar o progresso do jogador em armazenamento local para continuidade futura. |
| Ator Primário | Jogador |
| Pré-condição | Sessão em andamento. |
| Cenário Principal | 1. Jogador solicita salvar.<br>2. Sistema coleta o estado atual do jogo, incluindo o ato e a cena em curso e, quando houver, as memórias registradas, o estado do diário e o estado visual da casa.<br>3. Sistema grava o progresso no armazenamento local. |
| Pós-condição | O progresso do jogador é persistido localmente, permitindo a continuidade da sessão em momento posterior. |
| Cenários Alternativos | 1a. Salvamento automático (RF031):<br>1a.1. Ao atingir um ponto de salvamento da narrativa, o sistema executa os passos 2 e 3 sem ação do jogador.<br>3a. Ocorre erro na gravação:<br>3a.1. O sistema notifica o jogador. |

### Caso de Uso: UC-S012 - Continuar Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S012 |
| Descrição | Este caso de uso permite que o jogador retome a jornada a partir do progresso salvo localmente. |
| Ator Primário | Jogador |
| Pré-condição | Menu inicial aberto. |
| Cenário Principal | 1. Jogador seleciona a opção de continuar no menu inicial; se ainda não viu o aviso nesse acesso, o Sistema exibe o aviso sobre temas sensíveis, e o Jogador confirma.<br>2. Sistema lê o progresso salvo.<br>3. Sistema restaura o ato e a cena em curso e, quando houver, as memórias registradas, o estado do diário e o estado visual da casa.<br>4. Sistema carrega o cenário correspondente e devolve o controle ao jogador. |
| Pós-condição | A sessão é retomada no ponto em que o progresso foi salvo. |
| Cenários Alternativos | 1a. Não existe progresso salvo:<br>1a.1. A opção de continuar fica indisponível no menu inicial.<br>2a. O progresso salvo não pode ser lido:<br>2a.1. O sistema notifica o jogador e retorna ao menu inicial. |

### Caso de Uso: UC-S013 - Iniciar Novo Jogo

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S013 |
| Descrição | Este caso de uso permite que o jogador inicie uma nova jornada a partir do Ato I, depois de ver o aviso de conteúdo sensível. |
| Ator Primário | Jogador |
| Pré-condição | Menu inicial aberto. |
| Cenário Principal | 1. Jogador seleciona a opção de novo jogo no menu inicial.<br>2. Sistema exibe o aviso sobre temas sensíveis (ansiedade, sofrimento psíquico), com indicação de onde buscar apoio.<br>3. Jogador confirma e prossegue após o aviso.<br>4. Sistema cria um novo estado de jogo e inicia o Ato I.<br>5. Sistema carrega o cenário inicial e entrega o controle ao jogador. |
| Pós-condição | Uma nova sessão é iniciada no Ato I, sem progresso anterior. |
| Cenários Alternativos | 1a. Existe um save anterior:<br>1a.1. Sistema pede confirmação para sobrescrever o progresso salvo.<br>1a.2. Se o jogador confirmar, o fluxo segue no passo 2 e o novo progresso substitui o save anterior.<br>1a.3. Se o jogador recusar, o sistema retorna ao menu inicial sem alterar o save. |

### Caso de Uso: UC-S014 - Resolver Puzzle

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S014 |
| Descrição | Este caso de uso permite que o jogador resolva um puzzle contextual integrado ao ambiente e à narrativa do ato em curso. |
| Ator Primário | Jogador |
| Pré-condição | Ani diante de um puzzle disponível no cenário do ato atual. |
| Cenário Principal | 1. Jogador aciona a interação com o puzzle.<br>2. Sistema abre o puzzle e apresenta seus elementos.<br>3. Jogador faz uma tentativa.<br>4. Sistema verifica a tentativa.<br>5. Sistema registra o puzzle como concluído. |
| Pós-condição | O puzzle fica registrado como concluído. |
| Cenários Alternativos | 3a. Jogador sai do puzzle a qualquer momento antes de concluí-lo:<br>3a.1. Sistema fecha o puzzle e o devolve ao estado inicial, sem salvar progresso parcial.<br>4a. A tentativa está incorreta:<br>4a.1. Sistema indica que a tentativa não resolveu o puzzle, sem punição sistêmica.<br>4a.2. O fluxo retorna ao passo 3. |

### Caso de Uso: UC-S015 - Usar Celular

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S015 |
| Descrição | Este caso de uso permite que o jogador use o celular de Ani em primeira pessoa e navegue pelo aplicativo de rede social. |
| Ator Primário | Jogador |
| Pré-condição | Cena em que Ani está com o celular em mãos. |
| Cenário Principal | 1. Jogador navega pelo feed e pelos perfis do aplicativo.<br>2. Sistema exibe as publicações e os pensamentos de Ani sobre elas.<br>3. Jogador interage com uma publicação, como abrir ou curtir.<br>4. Sistema atualiza a tela e, quando aplicável, mostra a reação de Ani. |
| Pós-condição | O estado do aplicativo e da cena é atualizado conforme as ações do jogador. |
| Cenários Alternativos | 3a. Curtida sem querer (toque duplo):<br>3a.1. Sistema registra a curtida e mostra o momento de pânico de Ani, com distorção na tela (RF018).<br>4a. A bateria do celular acaba:<br>4a.1. Sistema exibe o aviso de bateria fraca, desliga o celular e encerra a cena. |

### Caso de Uso: UC-S016 - Comprar e Consumir Comida

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S016 |
| Descrição | Este caso de uso permite que o jogador compre comidas nas barracas das memórias e que as personagens as consumam. |
| Ator Primário | Jogador |
| Pré-condição | Ani próxima de uma barraca de comida, dentro de uma memória. |
| Cenário Principal | 1. Jogador aciona a interação com a barraca.<br>2. Sistema mostra a personagem pegando a comida no balcão.<br>3. A personagem consome a comida aos poucos, parada ou andando.<br>4. Sistema avança o estágio da comida a cada mordida, até ela acabar. |
| Pós-condição | A comida é consumida por completo e a personagem fica com as mãos livres. |
| Cenários Alternativos | 3a. A personagem acompanhante divide a comida:<br>3a.1. Sistema avança um estágio da comida de Ani, e o fluxo segue no passo 3. |

### Caso de Uso: UC-S017 - Jogar Minigame

| Campo | Conteúdo |
| --- | --- |
| ID | UC-S017 |
| Descrição | Este caso de uso permite que o jogador jogue os minigames das barracas do parque de diversões. |
| Ator Primário | Jogador |
| Pré-condição | Ani diante de uma barraca de minigame, na memória do parque. |
| Cenário Principal | 1. Jogador aciona a interação com a barraca.<br>2. Sistema abre o minigame, com placar e interface próprios.<br>3. Jogador realiza as jogadas.<br>4. Sistema atualiza o placar a cada jogada.<br>5. Ao fim da partida, o sistema exibe o resultado e devolve Ani ao parque. |
| Pós-condição | Ani volta ao parque; o resultado do minigame não altera a progressão (RN008). |
| Cenários Alternativos | 3a. A personagem acompanhante também joga:<br>3a.1. Sistema alterna a vez com a personagem acompanhante e compara os placares, e o fluxo segue no passo 5. |

## 2.7 Diagrama de Classes

O Diagrama de Classes UML representa estruturalmente os elementos de um sistema orientado a objetos, indicando classes, atributos, operações e relacionamentos. Segundo a IBM, diagramas UML auxiliam a representar diferentes perspectivas de um sistema, enquanto a Visual Paradigm destaca que o diagrama de classes descreve a estrutura do sistema por meio de classes, atributos, métodos e relações (IBM, s.d.c, online; Visual Paradigm, s.d., online).

Sua importância neste trabalho está em mostrar como a experiência contemplativa de **Ani** é traduzida em entidades de software com responsabilidades definidas. Ao explicitar a estrutura do jogo, o diagrama favorece a rastreabilidade entre requisitos, regras de negócio, persistência e implementação. A modelagem gráfica correspondente é apresentada na Figura 3, e a estrutura textual das classes é detalhada a seguir.

[Figura 3 – Diagrama de Classes de Ani]

As classes do projeto refletem diretamente sua arquitetura conceitual. `Ato` sintetiza os cinco atos filosóficos; `Memoria`, `Diario` e `EntradaDiario` formalizam o sistema de memórias; `ObjetoMemoria` representa o gatilho interativo de revelação de memórias; `ObjetoRestauravel` traduz a lógica de Kintsugi do Ato III; `ObjetoContemplativo` traduz a contemplação ativa do Ato IV; `NPC` e `Dialogo` representam personagens de memória e seus fluxos textuais; `Ani` constitui a representação sistêmica da protagonista como sujeito da experiência; `EcoDecisao` registra as tentativas do jogador nos ecos de decisão do Ato II; e `Save` reúne o progresso persistido da partida, como a entidade SAVE do DER. As mecânicas do início do Ato I acrescentam `Celular` e `Publicacao`, que representam o celular em primeira pessoa e o feed (RF024); `Interruptor` e `FonteDeLuz`, que controlam a iluminação dos cômodos (RF025, RN007), com o atributo `iluminado` de `Cenario`; `ObjetoInspecionavel`, para a inspeção de objetos em primeira pessoa (RF026); `Barraca`, `Comida` e `Minigame`, para as barracas do parque (RF028, RF029, RN008); e `Configuracao`, que guarda as opções de vídeo e áudio (RF022). `ObjetoMemoria` leva Ani ao `Cenario` da memória (RF027), `Memoria.ordem` indica a posição da memória na sequência linear do ato (RN004), `Ato.totalMemorias` guarda o tamanho dessa sequência e `NPC.acompanhando` indica a personagem que segue Ani pelo cenário (RF030).

`Jogo` e `Ani` mantêm uma associação bidirecional de multiplicidade 1 : 1: `Jogo` alcança o `Diario` por meio de `Ani`, sem associação direta entre `Jogo` e `Diario`, e `Ani` alcança `Jogo` para notificar o início e o fim das crises de ansiedade por meio de `Jogo.alterarEstado()`. Na implementação em Unreal Engine, essa notificação de `Ani` para `Jogo` é feita por um *delegate*: `Ani` dispara o evento, e `Jogo`, inscrito nele, altera o estado da sessão, o que evita que a personagem dependa diretamente da classe de jogo.

Os tipos dos atributos seguem a Unreal Engine 5 / C++ (`bool`, `int32`, `float`, `FString`, `FDateTime`, `TArray<...>`). Os nomes das classes e enumerações do modelo omitem os prefixos da convenção da Unreal (`U` para classes derivadas de `UObject`, `A` para atores, `F` para estruturas e `E` para enumerações), que podem ser aplicados na implementação.

### Classe: Jogo
**Atributos:**
- `- titulo: FString`
- `- atoAtual: Ato`
- `- cenarioAtual: Cenario`
- `- estadoAtual: EstadoJogo`

**Métodos:**
- `+ iniciar()`
- `+ pausar()`
- `+ retomar()`
- `+ encerrar()`
- `+ salvarProgresso()`
- `+ carregarProgresso()`
- `+ alterarEstado(novoEstado: EstadoJogo)`

### Classe: Personagem
**Atributos:**
- `- nome: FString`
- `- posicaoX: float`
- `- posicaoY: float`
- `- posicaoZ: float`
- `- sprite: FString`
- `- velocidade: float`

**Métodos:**
- `+ mover()`

### Classe: Ani
**Atributos:**
- `- estadoEmocional: EstadoEmocional`
- `- diario: Diario`

**Métodos:**
- `+ interagir()`
- `+ observar()`
- `+ registrarMemoria()`
- `+ iniciarCrise()`
- `+ encerrarCrise()`

### Classe: NPC
**Atributos:**
- `- tipo: TipoNPC`
- `- acompanhando: bool`

**Métodos:**
- `+ falar()`
- `+ interagir()`
- `+ seguir()`

### Classe: Dialogo
**Atributos:**
- `- id: int32`
- `- linhas: TArray<FString>`
- `- fragmentado: bool`

**Métodos:**
- `+ iniciar()`
- `+ avançar()`
- `+ encerrar()`

### Classe: ObjetoInterativo
**Atributos:**
- `- id: int32`
- `- descricao: FString`

**Métodos:**
- `+ ativar()`

### Classe: ObjetoMemoria
**Atributos:**
- `- coletada: bool`

**Métodos:**
- `+ exibir()`
- `+ registrarNoDiario()`
- `+ abrirMemoria()`

### Classe: Memoria
**Atributos:**
- `- id: int32`
- `- titulo: FString`
- `- conteudo: FString`
- `- atoOrigem: int32`
- `- ordem: int32`
- `- coletada: bool`

**Métodos:**
- `+ registrar()`
- `+ atualizarLeitura()`

### Classe: Diario
**Atributos:**
- `- entradas: TArray<EntradaDiario>`

**Métodos:**
- `+ abrir()`
- `+ adicionarEntrada()`
- `+ consultarEntrada()`
- `+ restaurar()`

### Classe: EntradaDiario
**Atributos:**
- `- titulo: FString`
- `- conteudo: FString`
- `- tipo: TipoEntradaDiario`

**Métodos:**
- `+ atualizarLeitura()`

### Classe: Cenario
**Atributos:**
- `- nome: FString`
- `- desbloqueado: bool`
- `- iluminado: bool`

**Métodos:**
- `+ carregarCenario()`
- `+ desbloquearArea()`
- `+ restaurarEstado()`

### Classe: Ato
**Atributos:**
- `- id: int32`
- `- nome: FString`
- `- descricao: FString`
- `- concluido: bool`
- `- totalMemorias: int32`

**Métodos:**
- `+ iniciarAto()`
- `+ verificarConclusao()`
- `+ concluirAto()`

### Classe: ObjetoRestauravel
**Atributos:**
- `- estado: EstadoObjeto`

**Métodos:**
- `+ restaurar()`

### Classe: ObjetoContemplativo
**Atributos:**
- `- tempoMinimoObservacao: float`

**Métodos:**
- `+ observar()`
- `+ liberarNarracao()`

### Classe: EcoDecisao
**Atributos:**
- `- id: int32`
- `- tentativas: int32`
- `- desfecho: FString`

**Métodos:**
- `+ registrarTentativa()`
- `+ conduzirAoImpasse()`

### Classe: Save
**Atributos:**
- `- idSave: int32`
- `- dataCriacao: FDateTime`
- `- dataUltimaAtualizacao: FDateTime`

**Métodos:**
- `+ salvar()`
- `+ carregar()`

### Classe: Celular
**Atributos:**
- `- bateria: int32`
- `- ligado: bool`

**Métodos:**
- `+ ligar()`
- `+ desligar()`
- `+ rolarFeed()`

### Classe: Publicacao
**Atributos:**
- `- autor: FString`
- `- legenda: FString`
- `- curtida: bool`

**Métodos:**
- `+ curtir()`

### Classe: Interruptor
**Atributos:**
- `- cenario: Cenario`

**Métodos:**
- `+ alternarIluminacao()`

### Classe: FonteDeLuz
**Atributos:**
- `- acesa: bool`

**Métodos:**
- `+ acender()`
- `+ apagar()`

### Classe: ObjetoInspecionavel
**Atributos:**
- `- itens: TArray<FString>`

**Métodos:**
- `+ inspecionar()`

### Classe: Barraca
**Atributos:**
- `- nome: FString`

**Métodos:**
- `+ venderComida()`
- `+ abrirMinigame()`

### Classe: Comida
**Atributos:**
- `- nome: FString`
- `- estagio: int32`

**Métodos:**
- `+ consumir()`

### Classe: Minigame
**Atributos:**
- `- nome: FString`
- `- placar: int32`

**Métodos:**
- `+ iniciar()`
- `+ registrarJogada()`
- `+ encerrar()`

### Classe: Configuracao
**Atributos:**
- `- volume: float`
- `- resolucao: FString`
- `- telaCheia: bool`

**Métodos:**
- `+ aplicar()`
- `+ restaurarPadrao()`

### Enumerações

O Quadro 29 lista as enumerações usadas como tipos de atributos.

| Enumeração | Valores |
| --- | --- |
| TipoNPC | `NpcMemoria`, `Aparicao` |
| EstadoEmocional | `Neutro`, `Ansioso`, `Deprimido`, `Contemplativo`, `Sereno`, `Medo` |
| TipoEntradaDiario | `Memoria`, `Documento`, `Fotografia`, `Objeto`, `Contemplacao` |
| EstadoObjeto | `Quebrado`, `Restaurado` |
| EstadoJogo | `Menu`, `Jogando`, `Pausado`, `Crise`, `Encerrado` |

### Relacionamentos entre Classes

O Quadro 30 resume os relacionamentos entre as classes e suas multiplicidades.

| Classe Origem | Tipo de Relacionamento | Classe Destino | Multiplicidade |
| --- | --- | --- | --- |
| Jogo | Composição | Ato | 1 para 1..* |
| Jogo | Composição | Cenario | 1 para 1..* |
| Ani | Herança | Personagem | 1 para 1 |
| NPC | Herança | Personagem | 1 para 1 |
| Ani | Composição | Diario | 1 para 1 |
| Jogo | Associação (bidirecional) | Ani | 1 para 1 |
| Ani | Associação | ObjetoInterativo | 1 para 0..* |
| NPC | Composição | Dialogo | 1 para 0..* |
| Cenario | Composição | NPC | 1 para 0..* |
| Cenario | Composição | ObjetoInterativo | 1 para 0..* |
| ObjetoMemoria | Herança | ObjetoInterativo | 1 para 1 |
| ObjetoRestauravel | Herança | ObjetoInterativo | 1 para 1 |
| ObjetoContemplativo | Herança | ObjetoInterativo | 1 para 1 |
| ObjetoMemoria | Associação | Memoria | 1 para 1 |
| ObjetoMemoria | Associação | Ato | 0..* para 0..1 |
| Memoria | Associação | EntradaDiario | 1 para 1 |
| Diario | Composição | EntradaDiario | 1 para 0..* |
| Ato | Associação | Cenario | 1 para 1..* |
| Ato | Associação | EcoDecisao | 1 para 0..* |
| Jogo | Associação | Save | 1 para 0..* |
| Save | Associação | Ato | 0..* para 1 |
| Save | Associação | Diario | 1 para 1 |
| Ani | Associação | Celular | 1 para 1 |
| Celular | Composição | Publicacao | 1 para 0..* |
| Jogo | Composição | Configuracao | 1 para 1 |
| Interruptor | Herança | ObjetoInterativo | 1 para 1 |
| FonteDeLuz | Herança | ObjetoInterativo | 1 para 1 |
| ObjetoInspecionavel | Herança | ObjetoInterativo | 1 para 1 |
| Barraca | Herança | ObjetoInterativo | 1 para 1 |
| Barraca | Associação | Comida | 1 para 0..* |
| Barraca | Associação | Minigame | 1 para 0..1 |
| ObjetoMemoria | Associação | Cenario | 0..* para 1 |

## 2.8 Diagramas de Atividades

O diagrama de atividades da UML representa o fluxo de controle de um processo ou de uma funcionalidade, mostrando as ações executadas, as decisões, os laços e o ponto em que o fluxo termina. Sommerville (2019) destaca que esse diagrama ajuda a mostrar as atividades que compõem um processo e a ordem em que ocorrem, e a IBM o inclui entre os diagramas comportamentais da UML usados para descrever a dinâmica do sistema (IBM, s.d.c, online).

Sua importância neste trabalho está em detalhar, passo a passo, fluxos que os casos de uso descrevem apenas em texto, separando o que cabe ao jogador e o que cabe ao sistema por meio de raias. Assim, decisões e repetições ficam visíveis antes da implementação. Os diagramas foram elaborados no draw.io e estão em `docs/diagramas/`.

### Atividade: Resolver Puzzle (UC-S014)

A Figura 4 apresenta o fluxo de resolução de um puzzle descrito no UC-S014. O jogador abre o puzzle e faz tentativas até acertar; uma tentativa errada não gera punição sistêmica e devolve o fluxo à próxima tentativa. A qualquer momento antes da conclusão, o jogador pode sair do puzzle, que volta ao estado inicial sem salvar progresso parcial.

[Figura 4 – Diagrama de Atividades: Resolver Puzzle]

### Atividade: Progressão do Ato I pela sequência de memórias (RN004)

A Figura 5 apresenta o ciclo de progressão do Ato I. A cada objeto de memória ainda não registrado (RN001), o sistema registra a memória no diário (RF005), aumenta o peso no deslocamento de Ani (RF013) e avança para a próxima memória da sequência do ato (RF019). Quando a memória registrada é a última da sequência definida na RN004, a passagem para o ato seguinte é liberada (RF006).

[Figura 5 – Diagrama de Atividades: Progressão do Ato I pela sequência de memórias]

## 2.9 Diagrama de Estados

O diagrama de máquina de estados da UML representa os estados pelos quais um objeto passa ao longo de sua existência e os eventos que provocam a transição de um estado para outro. Segundo Sommerville (2019), esse tipo de modelo mostra como o sistema reage a eventos internos e externos, e a IBM o inclui entre os diagramas comportamentais da UML (IBM, s.d.c, online). Como um jogo digital responde continuamente a eventos do jogador, esse modelo é adequado para descrever o ciclo de uma sessão de jogo.

Em **Ani**, o diagrama de estados descreve o ciclo de vida da sessão de jogo controlada pela classe `Jogo`. Ele deixa explícito em que situações o jogador pode pausar, retomar ou encerrar a sessão, e como a crise de ansiedade se sobrepõe à exploração sem interrompê-la por punição sistêmica.

### Estados da classe Jogo

A Figura 6 apresenta os estados da classe `Jogo`, registrados no atributo `estadoAtual` com os valores da enumeração `EstadoJogo`: Menu, Jogando, Pausado, Crise (crise de ansiedade) e Encerrado. As transições são rotuladas pelo evento que as dispara e pelo método correspondente do diagrama de classes: `iniciar()` para um novo jogo (UC-S013), `carregarProgresso()` para continuar (UC-S012), com a condição de guarda [leitura bem-sucedida], já que uma falha na leitura mantém o jogo no menu, `pausar()` para a pausa e `retomar()` para a retomada (UC-S006), `alterarEstado(Menu)` para a volta ao menu principal a partir da pausa (UC-S006, 3b) e `encerrar()` para a saída confirmada (UC-S010). Todas as mudanças de estado passam por `Jogo.alterarEstado(novoEstado)`, chamado por esses métodos. A crise de ansiedade (RF018) começa e termina em `Ani`: `iniciarCrise()` e `encerrarCrise()` alteram o `estadoEmocional` da personagem e chamam `Jogo.alterarEstado(Crise)` e `Jogo.alterarEstado(Jogando)`, respectivamente; por isso, no diagrama, essas transições têm como evento o início e o fim da crise e como ação `alterarEstado()`.

[Figura 6 – Diagrama de Estados da classe Jogo]

## 2.10 Diagramas de Sequência

O diagrama de sequência da UML representa a troca de mensagens entre os objetos que participam de uma interação, organizada na ordem em que acontece ao longo do tempo. Sommerville (2019) aponta que esse diagrama é usado para modelar as interações entre atores e objetos de um caso de uso, e a IBM o classifica entre os diagramas de interação da UML (IBM, s.d.c, online).

Sua importância neste trabalho está em ligar os casos de uso ao diagrama de classes: cada mensagem corresponde a um método existente, o que permite verificar se as classes modeladas são suficientes para realizar os fluxos descritos.

### Sequência: Interagir com objeto, registrar memória e consultar o diário (UC-S002 / UC-S005)

A Figura 7 apresenta a interação com um objeto de memória. O jogador aciona o comando de interação, recebido por `Ani` (`interagir()`), que ativa o `ObjetoMemoria`; este exibe seu conteúdo. Se o objeto ainda não foi coletado (RN001), `Ani` registra a memória: o `ObjetoMemoria` aciona `Memoria.registrar()`, e `Ani` adiciona ao seu `Diario` uma nova `EntradaDiario`; se já foi coletado, nenhuma entrada nova é criada. Depois, ao acionar o comando do diário (UC-S005), `Ani` abre o `Diario`, e o jogador consulta a entrada registrada; se o diário estiver vazio, são exibidas páginas sem conteúdo.

[Figura 7 – Diagrama de Sequência: Interagir com objeto, registrar memória e consultar o diário]

### Sequência: Salvar e continuar jogo (UC-S011 / UC-S012)

A Figura 8 apresenta a persistência do progresso. Ao salvar (UC-S011), o jogador aciona o comando e `Jogo.salvarProgresso()` coleta o ato em curso, o estado do diário (alcançado por meio de `Ani`) e o estado visual da casa e chama `Save.salvar()`, que grava o arquivo local; em caso de erro, o jogador é notificado. Uma nota no diagrama registra que o salvamento também acontece de forma automática nos pontos de salvamento da narrativa (RF031; UC-S011, 1a); nesse caso, a sequência começa em `salvarProgresso()`, sem o comando do jogador. Ao continuar (UC-S012), `Jogo.carregarProgresso()` aciona `Save.carregar()`; se a leitura for bem-sucedida, `Jogo` restaura o ato em curso (`atoAtual`), as memórias registradas e o diário (`Diario.restaurar()`, alcançado por meio de `Ani`) e o estado visual da casa (`Cenario.restaurarEstado()`), carrega o cenário, passa o estado para Jogando (`alterarEstado(Jogando)`) e devolve o controle ao jogador no ponto salvo; se a leitura falhar, o jogador é notificado e retorna ao menu inicial.

[Figura 8 – Diagrama de Sequência: Salvar e continuar jogo]

## 2.11 Diagrama Entidade-Relacionamento (DER)

O Diagrama Entidade-Relacionamento é um modelo conceitual voltado à representação de dados, entidades, atributos e relacionamentos de um domínio. A IBM descreve o DER como uma forma de visualizar entidades e relações em um domínio de dados, enquanto a Lucidchart destaca seu papel na organização lógica das informações e na compreensão das cardinalidades entre entidades (IBM, s.d.d, online; Lucidchart, s.d., online).

No presente projeto, o DER deriva do Diagrama de Classes e das Regras de Negócio para representar aquilo que precisa ser persistido no jogo. Seu foco incide sobre progresso do jogador, memórias coletadas, estado do diário e relações mínimas entre atos, cenários e objetos interativos, especialmente em função de RF009, RN001 e RN005.

A modelagem gráfica correspondente é apresentada na Figura 9, e a descrição textual das entidades é detalhada na sequência.

[Figura 9 – Diagrama Entidade-Relacionamento de Ani]

Ao contrário do diagrama de classes, o DER não representa todas as classes do projeto: ele se concentra no que precisa ser persistido para recuperar a experiência do jogador. Por isso, classes comportamentais como `Jogo`, `Ani`, `NPC` e `Dialogo` não viram entidades, e o progresso salvo é representado pela entidade SAVE. Mesmo com o salvamento feito em arquivo JSON, a estrutura vale como modelo conceitual de persistência.

### Entidade: SAVE
Representa a unidade de persistência da partida.
**Atributos:** id_save (PK), data_criacao, data_ultima_atualizacao
**Relacionamentos:**
- estaEm ATO: cada save está em um ato; um ato pode estar associado a vários saves.
- estaEm CENARIO: cada save está em um cenário, onde o jogo continua ao ser carregado.
- Possui DIARIO: cada save possui um diário associado.

### Entidade: ATO
Representa cada etapa da progressão narrativa do jogo; `total_memorias` guarda a quantidade de memórias da sequência linear do ato (RN004).
**Atributos:** id_ato (PK), nome, descricao, concluido, total_memorias
**Relacionamentos:**
- Contem CENARIO: um ato contém um ou vários cenários; cada cenário pertence a um ato.
- estaEm (com SAVE): um ato pode estar associado a vários saves.

### Entidade: CENARIO
Representa os cenários pertencentes aos atos.
**Atributos:** id_cenario (PK), nome, descricao, desbloqueado
**Relacionamentos:**
- Contem (com ATO): cada cenário pertence a um ato.
- Pertence (com OBJETO_INTERATIVO): um cenário pode possuir zero ou vários objetos interativos.
- estaEm (com SAVE): um cenário pode estar associado a vários saves.

### Entidade: DIARIO
Representa o diário associado ao progresso salvo.
**Atributos:** id_diario (PK), titulo, descricao
**Relacionamentos:**
- Possui (com SAVE): cada diário pertence a um save.
- Contem ENTRADA_DIARIO: um diário pode conter zero ou várias entradas.

### Entidade: ENTRADA_DIARIO
Representa cada entrada consultável no diário.
**Atributos:** id_entrada (PK), titulo, texto, ordem
**Relacionamentos:**
- Contem (com DIARIO): cada entrada pertence a um diário.
- Referencia MEMORIA: uma entrada pode referenciar uma memória, mantendo o vínculo narrativo no diário.

### Entidade: MEMORIA
Representa os fragmentos narrativos relacionados ao diário e aos objetos do mundo.
**Atributos:** id_memoria (PK), titulo, conteudo, ato_origem, ordem, coletada
**Relacionamentos:**
- Referencia (com ENTRADA_DIARIO): pode ser referenciada por uma entrada do diário.
- Revela (com OBJETO_MEMORIA): é revelada por um objeto de memória.

### Entidade: OBJETO_INTERATIVO
Superentidade dos objetos interativos do jogo.
**Atributos:** id_objeto (PK), nome, descricao
**Relacionamentos:**
- Pertence CENARIO: cada objeto interativo pertence a um cenário.
- Especialização em OBJETO_MEMORIA, OBJETO_RESTAURAVEL e OBJETO_CONTEMPLATIVO.

### Entidade: OBJETO_MEMORIA
Subtipo que dispara a revelação e o registro de memórias.
**Atributos:** coletada (herda id_objeto de OBJETO_INTERATIVO)
**Relacionamentos:**
- Revela MEMORIA: atua como gatilho para revelar uma memória.

### Entidade: OBJETO_RESTAURAVEL
Subtipo que guarda o estado de objetos restauráveis do Ato III.
**Atributos:** estado (herda id_objeto de OBJETO_INTERATIVO)

### Entidade: OBJETO_CONTEMPLATIVO
Subtipo que controla a contemplação por tempo de observação do Ato IV.
**Atributos:** tempoMinimoObservacao (herda id_objeto de OBJETO_INTERATIVO)

### Entidade: CONFIGURACAO
Representa as opções de vídeo e áudio escolhidas pelo jogador (RF022). É salva à parte do progresso e, por isso, não se relaciona com SAVE: as opções continuam valendo quando o jogador inicia um novo jogo.
**Atributos:** id_configuracao (PK), volume, resolucao, tela_cheia

# 3 Ferramentas e Métodos

A seleção de ferramentas do projeto foi orientada por três critérios centrais: adequação às especificações técnicas definidas para o jogo, suporte consolidado na comunidade de desenvolvimento de jogos e compatibilidade com a metodologia Cascata adotada no planejamento. Como o protótipo combina exploração lateral, progressão por atos, direção visual autoral e áudio adaptativo, tornou-se necessário escolher recursos que atendessem tanto às demandas de implementação quanto à coerência estética e documental.

Além disso, as ferramentas utilizadas apresentam licenças compatíveis com uso acadêmico e estão alinhadas às tecnologias registradas no Termo de Abertura do Projeto. Sempre que os artefatos-fonte não informam versão específica utilizada, essa ausência é explicitada, a fim de preservar a fidelidade documental.

### Ferramenta: Three.js
**Versão utilizada:** 0.170.0  
**Tipo de licença:** MIT, código aberto  
**Site oficial:** <https://threejs.org/>  
**Função no projeto:** biblioteca de renderização 3D sobre WebGL, responsável pelos cenários, câmeras, luzes e pelo pós-processamento que dá ao protótipo a estética de pixel art.  
**Justificativa de escolha:** roda diretamente no navegador, sem instalação nem etapa de build, e oferece controle fino sobre iluminação, câmera e pós-processamento, o que permitiu combinar cenários 3D estilizados com personagens em pixel art.

### Ferramenta: JavaScript, HTML e CSS
**Versão utilizada:** ECMAScript 2022 (módulos ES); HTML e CSS nos padrões atuais dos navegadores  
**Tipo de licença:** padrões abertos (Ecma International, WHATWG e W3C), sem licença de uso  
**Site oficial:** <https://tc39.es/ecma262/>, <https://html.spec.whatwg.org/> e <https://www.w3.org/Style/CSS/>  
**Função no projeto:** JavaScript implementa a lógica do jogo (cenas, interação, diálogos, minigames e salvamento); HTML e CSS estruturam e estilizam a interface sobreposta ao jogo.  
**Justificativa de escolha:** executam nativamente em qualquer navegador moderno, sem compilação, e dão acesso direto às APIs usadas pelo protótipo: WebGL para a imagem, Web Audio para os sons sintetizados, Gamepad para o controle e armazenamento local para o salvamento.

### Ferramenta: Visual Studio Code
**Versão utilizada:** 1.145.0  
**Tipo de licença:** licença de software da Microsoft para a distribuição oficial (o código-fonte Code - OSS é MIT)  
**Site oficial:** <https://code.visualstudio.com/>  
**Função no projeto:** editor do código JavaScript do jogo, dos scripts em Python e da documentação em Markdown.  
**Justificativa de escolha:** é leve, tem suporte nativo a JavaScript e reúne edição de código, terminal e controle de versão em um só ambiente.

### Ferramenta: Sprite Fusion
**Versão utilizada:** não se aplica (serviço web)  
**Tipo de licença:** proprietária, por assinatura  
**Site oficial:** <https://www.spritefusion.com/>  
**Função no projeto:** geração das folhas de sprites em pixel art das personagens, das animações de cena e de objetos.  
**Justificativa de escolha:** é um gerador voltado especificamente a pixel art, com grade de pixels e paleta consistentes, o que permitiu produzir folhas de animação das personagens mantendo o mesmo estilo visual.

### Ferramenta: Python, NumPy e Pillow
**Versão utilizada:** [preencher]  
**Tipo de licença:** Python Software Foundation License (Python), BSD (NumPy) e MIT-CMU (Pillow), todas de código aberto  
**Site oficial:** <https://www.python.org/>, <https://numpy.org/> e <https://python-pillow.org/>  
**Função no projeto:** scripts da pasta `tools/` que recortam as folhas de sprites, alinham os quadros pelos pés, separam camadas de brilho e ajustam detalhes das personagens.  
**Justificativa de escolha:** automatizam tarefas repetitivas de tratamento de imagem com precisão de pixel, o que garante que todas as folhas cheguem ao jogo no mesmo formato.

### Ferramenta: GPT-6
**Versão utilizada:** GPT-6  
**Tipo de licença:** proprietária, acesso por assinatura ou API (OpenAI)  
**Site oficial:** <https://openai.com/>  
**Função no projeto:** geração de imagens de referência e de folhas de sprites das personagens, de objetos e de animações de cena.  
**Justificativa de escolha:** complementa o Sprite Fusion na produção dos sprites, gerando a partir de descrições em texto as poses e cenas específicas que o jogo precisava, no mesmo estilo de pixel art.

### Ferramenta: Claude Opus 5.5
**Versão utilizada:** Claude Opus 5.5  
**Tipo de licença:** proprietária, acesso por assinatura ou API (Anthropic)  
**Site oficial:** <https://www.anthropic.com/claude>  
**Função no projeto:** modelagem 3D dos cenários em Three.js, como o quarto de Ani e o parque de diversões, escritos diretamente em código.  
**Justificativa de escolha:** como o Three.js monta os cenários por código, um assistente capaz de escrever esse código permitiu construir os ambientes 3D dentro do prazo, o que se alinha ao motivo da troca de tecnologia.

### Ferramenta: draw.io (diagrams.net)
**Versão utilizada:** 29.6.5  
**Tipo de licença:** Apache 2.0, código aberto  
**Site oficial:** <https://www.drawio.com/>  
**Função no projeto:** modelagem de diagramas UML, BPMN e demais artefatos estruturais.  
**Justificativa de escolha:** foi utilizada para representar visualmente a estrutura do sistema e o fluxo principal de gameplay, fortalecendo a documentação e a rastreabilidade entre modelagem e implementação.

### Ferramenta: Git e GitHub
**Versão utilizada:** Git 2.48.1.windows.1; GitHub não se aplica (plataforma web)  
**Tipo de licença:** GPLv2 (Git); proprietária, com uso gratuito e pago (GitHub)  
**Site oficial:** <https://git-scm.com/> e <https://github.com/>  
**Função no projeto:** controle de versão do código e da documentação; o GitHub Actions confere a sintaxe dos arquivos JavaScript e Python a cada envio, e o GitHub Pages publica o protótipo jogável na web.  
**Justificativa de escolha:** mantêm o histórico de alterações e permitem que cada versão do protótipo fique disponível para teste no navegador, sem instalação.

O Quadro 31 relaciona cada artefato do projeto à ferramenta ou ao meio de produção utilizado.

| Artefato | Ferramenta / Meio de produção |
| --- | --- |
| GDD | Markdown |
| TAP | Markdown |
| BPMN | draw.io / diagrams.net |
| Diagrama de Classes | draw.io / diagrams.net |
| Código-fonte | HTML / CSS / JavaScript / Three.js / Visual Studio Code |
| Assets visuais | Sprite Fusion / GPT-6 / Python (NumPy, Pillow) |
| Modelagem 3D dos cenários | Claude Opus 5.5 / Three.js |
| Assets de áudio | Web Audio API (sons sintetizados no código) |
| Publicação do protótipo | GitHub Actions / GitHub Pages |

# 4 Desenvolvimento

Este capítulo descreve a implementação do protótipo de **Ani**, que cobre o início do Ato I, com cerca de dez minutos de jogo: o quarto de Ani no presente, o celular, a busca pelo carregador no escuro e a passagem, pela tirinha de fotos, para a memória do parque de diversões. Como registrado no TAP (1.1.6), o protótipo foi feito em HTML, CSS e JavaScript com Three.js 0.170 e roda no navegador; o jogo completo segue planejado em Unreal Engine 5.4.4 com C++, e é ele que os diagramas UML do capítulo 2 modelam.

Seguindo a Cascata, a implementação começou depois da especificação de requisitos e do design. O protótipo foi construído cena a cena, na ordem em que o jogador as percorre (menu, quarto, parque), e cada mecânica foi testada no navegador assim que ficou pronta. O código é versionado no Git, no mesmo repositório da documentação (pasta `jogo/`), e publicado no GitHub Pages por um fluxo do GitHub Actions a cada envio para a ramificação principal. O protótipo não tem etapa de compilação: o navegador carrega os módulos JavaScript diretamente.

## 4.1 Arquitetura do Protótipo

O protótipo é organizado em módulos JavaScript (ES Modules), carregados a partir do `index.html`. O Three.js é importado por um *import map*, sem gerenciador de pacotes. A estrutura de pastas separa o motor do jogo (renderização, áudio, interface e entrada) das cenas e dos personagens:

```text
jogo/
  index.html            página, import map e camadas de interface em HTML
  css/style.css         caixas de fala, balões, pausa, aviso e HUD dos minigames
  js/main.js            objeto game, entrada (mouse, teclado, controle), loop e save
  js/engine/            renderer.js, audio.js, ui.js, gamepad.js, tween.js, aviso.js
  js/scenes/            menu.js, quarto.js (+ room.js, furniture.js, papers.js, cinema.js),
                        parque.js (+ park.js, parkfx.js, parkfood.js, minigames.js,
                        wheelride.js, photostrip.js)
  js/phone/             app.js (aplicativo de rede social) e posts.js
  js/chars/ani.js       sprites de Ani e Malu e suas animações
  assets/               sprites (PNG) e fontes
  tools/                scripts Python que recortam e alinham as folhas de sprites
```

O centro da arquitetura é o objeto `game`, criado em `main.js`. Ele reúne o renderizador, o áudio, a interface, as configurações e o save, e guarda a cena atual. Cada cena (`MenuScene`, `QuartoScene` e `ParkScene`) segue o mesmo contrato: `enter()` e `exit()` na troca de cena, `update(dt, t)` a cada quadro e métodos de entrada (`onKey`, `onPointerDown`, `onWheel`) que `main.js` repassa. O Código 1 mostra esse objeto, a troca de cenas e o laço principal.

[Código 1 – Objeto `game`, troca de cenas e laço principal (`js/main.js`)]

```js
const game = {
  renderer, sfx, ui, canvas, settings,
  // ... (mouse, modo de entrada, saveSettings)
  scenes: {},
  current: null,
  save: {
    get: () => { /* lê 'ani:save' do localStorage */ },
    set: (data) => writeJSON(SAVE_KEY, data),
  },
  goTo(name, opts = {}) {
    this.current?.exit?.();          // a cena atual se desmonta
    this.current = this.scenes[name];
    this.current.enter(opts);        // a nova cena começa
  },
};

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); // passo limitado: sem saltos após travadas
  last = now;
  time += dt;
  pad.update(dt);                                  // lê o controle
  const scene = game.current;
  if (scene) {
    scene.update(dt, time);                        // lógica da cena
    renderer.render(scene.scene, scene.camera, time);
  }
  requestAnimationFrame(frame);
}
```

O limite de 0,05 s no passo de tempo evita que uma queda de desempenho faça os personagens atravessarem móveis ou que as animações pulem etapas. Todas as cenas recebem o mesmo `dt`, e as animações de câmera, falas e transições usam um gerenciador de interpolações (`Tweens`, em `tween.js`) atualizado com ele.

O diagrama de classes da seção 2.7 modela o jogo completo, em Unreal Engine. O protótipo não reproduz essas classes uma a uma: em JavaScript, várias responsabilidades ficam em funções e objetos das cenas. O Quadro 32 relaciona cada classe do modelo ao elemento do protótipo que cumpre o seu papel.

| Classe do modelo | Elemento no protótipo | Arquivo |
| --- | --- | --- |
| `Jogo` | Objeto `game`: cena atual, troca de cenas, save e configurações | `js/main.js` |
| `Cenario` | Cenas `MenuScene`, `QuartoScene` e `ParkScene`; o quarto é montado em `room.js` e o parque em `park.js` | `js/scenes/` |
| `Personagem`, `Ani` | `WalkSprite` e `AniSprite` (sprite e animações); a posição em x e z fica com a cena | `js/chars/ani.js` |
| `NPC` | Malu: `WalkSprite` com a folha da Malu, movida pela classe `Actor` | `js/chars/ani.js`, `js/scenes/parque.js` |
| `Dialogo` | `ui.say()` (caixa embaixo) e `ui.bubble()` (balão sobre a cabeça) | `js/engine/ui.js` |
| `Celular`, `Publicacao` | `PhoneApp` (aplicativo "Pixgram") e a lista de publicações | `js/phone/app.js`, `js/phone/posts.js` |
| `ObjetoInterativo` | Lista `interactables` do quarto e do parque | `js/scenes/room.js`, `js/scenes/park.js` |
| `Interruptor`, `FonteDeLuz` | `room.setSwitch()` e `room.setPlasma()` | `js/scenes/room.js`, `js/scenes/quarto.js` |
| `ObjetoInspecionavel` | `enterInspect()` e `enterZenital()` (estante, criado-mudo, mochila e papéis) | `js/scenes/quarto.js` |
| `ObjetoMemoria` | Gaveta e tirinha de fotos (`openDrawer()`, `makePhotoStrip()`) | `js/scenes/quarto.js`, `js/scenes/photostrip.js` |
| `Barraca`, `Comida` | Barracas do parque, `Snacks` e `makeFood()` | `js/scenes/park.js`, `js/scenes/parkfood.js` |
| `Minigame` | `Minigames`, com `Balloons`, `Cans` e `Fishing` | `js/scenes/minigames.js` |
| `Configuracao` | Objeto `settings`, salvo em `ani:config` | `js/main.js`, `js/scenes/menu.js` |
| `Save` | `game.save`, salvo em `ani:save` | `js/main.js` |
| `Memoria`, `Diario`, `EntradaDiario`, `Ato`, `EcoDecisao`, `ObjetoRestauravel`, `ObjetoContemplativo` | Sem correspondente no protótipo (previstos; ver seção 4.3) | – |

O fluxo de dados do protótipo pode ser resumido assim:

```text
Entrada (teclado e mouse, ou controle Xbox convertido em teclas por gamepad.js)
  → main.js (game.keyDown, pointerdown, wheel)
    → cena atual (onKey, onPointerDown, onWheel)
      → interact(it): interruptor, luminária, inspeção, gaveta, barraca, minigame
        → ui.say() / ui.bubble()      falas
        → sfx.*()                     sons sintetizados
        → game.goTo('parque')         objeto-portal
  → loop: cena.update(dt) → renderer.render(cena, câmera)
  → game.save.set({ cena })           salvamento automático
  → game.settings / saveSettings()    volume, pixels e tela cheia
```

## 4.2 Sistemas Implementados

As seções a seguir descrevem cada sistema do protótipo, com os requisitos e as regras que ele atende, as classes do modelo a que corresponde, um trecho de código comentado e, quando possível, uma captura de tela.

### 4.2.1 Renderização em Pixel Art sobre Cenários 3D

O visual de **Ani** combina personagens em pixel art com cenários modelados em 3D. Para que os dois convivam, o renderizador desenha a cena 3D numa resolução baixa, que o CSS amplia sem suavização, e aplica um pós-processamento com brilho (*bloom*), gradação de cor, vinheta, granulado, aberração cromática, *glitch* e *dithering*. Os feixes de luar, a névoa e a profundidade de campo são calculados num passe de luz próprio, em meia resolução.

- **Arquivos:** `js/engine/renderer.js`, `js/scenes/cinema.js`, `js/scenes/parkfx.js`
- **Requisitos correspondentes:** RF012 (mesma identidade visual ao longo dos atos), RNF001
- **Classes do modelo:** `Cenario`
- **Trecho de código:** Código 2
- **Captura de tela:** Figura 10

O tamanho do pixel é definido pela quantidade de linhas da imagem, escolhida pelo jogador no menu (pixels grandes, médios ou pequenos). O Código 2 mostra como o renderizador calcula a resolução interna a partir dessa escolha.

[Código 2 – Resolução interna da pixel art (`js/engine/renderer.js`)]

```js
setRows(rows) {
  this.targetRows = rows;           // 270, 360 ou 480 linhas (menu > Pixels)
  this.resize();
}

resize() {
  // cada pixel do jogo ocupa s × s pixels da tela
  const s = Math.max(1, Math.round(window.innerHeight / this.targetRows));
  this.scale = s;
  this.w = Math.max(1, Math.floor(window.innerWidth / s));
  this.h = Math.max(1, Math.floor(window.innerHeight / s));
  // ... (com o passe nítido do celular ligado, o canvas fica em resolução cheia)
  this.gl.setPixelRatio(1);
  this.gl.setSize(this.w, this.h, false);  // o canvas é ampliado pelo CSS sem suavização
  this.rt.setSize(this.w, this.h);         // cena 3D (cor HDR + profundidade)
  this.rtLit.setSize(this.w, this.h);      // cena + passe de luz
  // ...
}
```

Como o fator de escala é sempre inteiro, cada pixel do jogo vira um bloco quadrado de pixels da tela, sem distorção. A Figura 10 mostra o resultado no quarto com a luz acesa: o cone de luz do lustre, os feixes de luar entrando pela janela e a sombra de Ani projetada pelo próprio sprite.

[Figura 10 – Quarto de Ani com a luz acesa, em pixel art sobre o cenário 3D]

A tela do celular é a exceção: como precisa ser legível, ela é desenhada numa segunda passada em resolução cheia, por cima da pixel art, enquanto o dedo de Ani, que passa na frente da tela, continua pixelado.

### 4.2.2 Personagens em Sprites

Ani e Malu são sprites 2D colocados no mundo 3D. As folhas de sprites foram geradas com o Sprite Fusion e o GPT-6, em grades de 6 × 4 quadros, e depois recortadas e alinhadas por scripts Python (pasta `tools/`), que igualam a altura dos quadros e alinham cada um pelos pés e pelo rosto. No jogo, cada folha é descrita por uma configuração que diz o tamanho da célula, os quadros de cada animação e a escala em metros.

- **Arquivos:** `js/chars/ani.js`, `tools/*.py`
- **Requisitos correspondentes:** RF001, RF008, RF028
- **Classes do modelo:** `Personagem`, `Ani`, `NPC`
- **Trecho de código:** Código 3

[Código 3 – Configuração da folha de caminhada de Ani (`js/chars/ani.js`)]

```js
export const ANI_SPRITE = {
  url: new URL('../../assets/sprites/ani-andando.png', import.meta.url).href,
  FW: 168, FH: 246, FOOT_PAD: 6, COUNT: 13,     // célula de 168 × 246 px, 13 quadros
  WALK: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],         // caminhada: dois passos
  IDLE: 10, HALF: 11, BLINK: 12,                // parada e piscando
  TEXEL: 1.62 / 234,  // Ani tem 234 px de altura na folha → 1,62 m no mundo
  PX: 234,
  LEG_OFF: -4,
  STRIDE: 1.2,        // metros por ciclo de caminhada: os pés não "patinam"
};
```

A classe `WalkSprite` escolhe o quadro pela velocidade do personagem, faz Ani piscar em intervalos aleatórios e toca animações extras com eventos em quadros específicos, como o quadro em que o dedo encosta no interruptor e a luz muda. A Malu usa a mesma classe, com a sua folha. As duas também têm folhas para falar, comer e para as cenas da cabine de fotos.

### 4.2.3 Movimentação e Colisão em 2.5D

No quarto e no parque, a câmera acompanha Ani de lado, e o jogador a move para os lados e em profundidade, para frente e para o fundo do cenário. Os móveis do quarto viram retângulos no chão, vistos de cima, que ela contorna; tapetes e papéis, por serem baixos, ficam de fora.

- **Arquivos:** `js/scenes/quarto.js`, `js/scenes/parque.js`
- **Requisitos correspondentes:** RF001, RF002, RF011
- **Casos de uso:** UC-S001
- **Classes do modelo:** `Ani`, `Personagem`
- **Trecho de código:** Código 4

[Código 4 – Movimento em x e z com colisão (`js/scenes/quarto.js`)]

```js
// direção pelo teclado; sem tecla, o analógico do controle (inclinar pouco = passo lento)
let dir = (right ? 1 : 0) - (left ? 1 : 0);
let dirZ = (back ? 1 : 0) - (fwd ? 1 : 0);
if (!dir && !dirZ) { const st = this.game.pad?.move(); if (st) { dir = st.x; dirZ = st.y; } }

// na diagonal não anda mais rápido; a velocidade começa e para com peso (damp)
const n = Math.hypot(dir, dirZ * DEPTH_SPEED) > 1 ? 1 / Math.hypot(dir, dirZ * DEPTH_SPEED) : 1;
this.vel = damp(this.vel, this.busy ? 0 : dir * WALK_SPEED * n, 10, dt);
this.velZ = damp(this.velZ, this.busy ? 0 : dirZ * WALK_SPEED * DEPTH_SPEED * n, 10, dt);

// x e z separados: encostando num móvel, ela desliza pela lateral dele
const nx = clamp(this.x + this.vel * dt, lane.minX, lane.maxX);
if (nx === this.x + this.vel * dt && (stuck || !this.blocked(nx, this.z))) this.x = nx;
else this.vel = 0;
const nz = clamp(this.z + this.velZ * dt, Z_MIN, Z_MAX);
if (nz === this.z + this.velZ * dt && (stuck || !this.blocked(this.x, nz))) this.z = nz;
else this.velZ = 0;

// blocked(x, z): o ponto está dentro de algum retângulo de móvel?
blocked(x, z) {
  return this.obstacles.some((o) => x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1);
}
```

Testar o movimento em x e em z separadamente faz Ani deslizar ao longo de um móvel em vez de parar de vez quando o jogador anda na diagonal. Os limites da faixa (`lane`) e de profundidade (`Z_MIN`, `Z_MAX`) funcionam como as paredes. A câmera lateral segue Ani com uma folga à frente, na direção em que ela olha, e recua um pouco quando ela vem para a frente do cenário.

### 4.2.4 Celular em Primeira Pessoa

O jogo começa com Ani deitada no escuro, às 23:47, olhando o celular. O celular é um modelo 3D segurado pela mão de Ani, em sprite, e a tela mostra o "Pixgram", uma rede social fictícia desenhada num *canvas* e aplicada como textura. O jogador vê a notificação da Malu, abre o perfil dela, rola o feed, abre publicações e pode curtir com um toque duplo.

- **Arquivos:** `js/phone/app.js`, `js/phone/posts.js`, `js/scenes/quarto.js`
- **Requisitos correspondentes:** RF024
- **Casos de uso:** UC-S015
- **Classes do modelo:** `Celular`, `Publicacao`
- **Trecho de código:** Código 5
- **Captura de tela:** Figura 11

[Figura 11 – Celular em primeira pessoa com o perfil da Malu no aplicativo Pixgram]

A bateria acaba sozinha, mas só depois que o jogador se envolve com o aplicativo e quando nenhuma fala está na tela, para não cortar um momento no meio. O Código 5 mostra essa regra.

[Código 5 – A bateria acaba depois do envolvimento com o aplicativo (`js/scenes/quarto.js`)]

```js
updateBattery(dt) {
  const { ui } = this.game;
  const e = this.engage;
  if (e.profile) this.idleClock += dt;
  // só depois de ver o perfil e abrir um post, ir mais fundo, ver o próprio perfil
  // ou ficar 35 s parado no perfil
  const engaged = e.profile && (e.posts >= 1 || e.deep || e.me || this.idleClock > 35);
  const calm = !ui.speaking && this.panic < 0.15 && !this.app.trans;
  if (!engaged || !calm) return;
  this.batteryClock += dt;
  if (this.batteryStage === 0 && this.batteryClock > 2.5) {
    this.batteryStage = 1;
    this.app.lowBattery();               // aviso de 1% na tela
    this.game.sfx.warn();
    this.buzz = 0.5;                     // o celular vibra na mão
    ui.say('1%? Não, não, não...', { hold: 1.8 });
  } else if (this.batteryStage === 1 && this.batteryClock > 7.5) {
    this.batteryStage = 2;
    this.phoneDies();                    // a tela apaga e o quarto fica no escuro
  }
}
```

Quando o celular apaga, uma cena em primeira pessoa mostra Ani se levantando da cama, e o jogo passa para a visão lateral, no quarto escuro.

### 4.2.5 Momento de Pânico

Se o jogador curte sem querer uma publicação antiga da Malu, Ani entra em pânico. É a primeira aparição, ainda breve, da crise de ansiedade descrita no RF018: a tela treme, fica avermelhada, sofre distorções (*glitch* e aberração cromática) e o coração dispara, com batimentos que aceleram conforme a intensidade.

- **Arquivos:** `js/scenes/quarto.js`, `js/engine/renderer.js`, `js/engine/audio.js`
- **Requisitos correspondentes:** RF018 (parcial)
- **Classes do modelo:** `Ani` (`iniciarCrise()`, `encerrarCrise()`)
- **Trecho de código:** Código 6
- **Captura de tela:** Figura 12

[Código 6 – Efeitos do pânico na imagem e no som (`js/scenes/quarto.js`)]

```js
// this.panic vai de 0 a 1 e cai devagar sozinho
this.panic = Math.max(0, this.panic - dt * 0.12);
if (this.panic > 0.12 && t > this.nextBeat) {
  sfx.heartbeat(clamp(this.panic + 0.3));                 // batimento sintetizado
  this.nextBeat = t + lerp(1.1, 0.45, this.panic);        // mais pânico, coração mais rápido
}
fx.glitch = damp(fx.glitch, this.panic * 0.25, 5, dt);
fx.aberration = 0.0018 + this.panic * 0.008;
fx.tint.setRGB(1 + this.panic * 0.25, 1 - this.panic * 0.22, 1 - this.panic * 0.2); // avermelha
fx.shakeX = (Math.random() - 0.5) * this.panic * 4;       // tremor da tela
fx.shakeY = (Math.random() - 0.5) * this.panic * 3;
fx.vignette = 0.6 + this.panic * 0.35;                    // a visão se fecha
```

Todos os efeitos saem de um único valor, `panic`, que sobe no susto e cai sozinho com o tempo; assim, a crise se acalma de forma gradual, sem punição nem perda de progresso. O aviso de conteúdo, apresentado na seção 4.2.12, cita esse momento. A Figura 12 mostra a tela durante o pânico.

[Figura 12 – Momento de pânico: tela avermelhada, distorção e tremor]

### 4.2.6 Iluminação e Interação no Escuro

Sem a luz do celular, o quarto fica no escuro, iluminado só pelo luar. Ani precisa achar o interruptor, que tem uma figurinha que brilha no escuro, para acender a luz e procurar o carregador. Enquanto o quarto está escuro, qualquer interação mostra uma fala de que não dá para ver, e os objetos aparecem com o rótulo "???"; a única exceção é a luminária de plasma, que pode ser ligada e continua acesa mesmo com a luz apagada.

- **Arquivos:** `js/scenes/quarto.js`, `js/scenes/room.js`, `js/scenes/cinema.js`
- **Requisitos correspondentes:** RF025, RF003
- **Regras de negócio:** RN007
- **Casos de uso:** UC-S002
- **Classes do modelo:** `Interruptor`, `FonteDeLuz`, `Cenario` (`iluminado`)
- **Trecho de código:** Código 7
- **Captura de tela:** Figuras 13 e 14

[Código 7 – Interação no escuro e luminária de plasma (`js/scenes/quarto.js`)]

```js
async interact(it) {
  if (this.busy || !it) return;
  const dark = this.room.light < 0.5;          // RN007: o quarto está escuro?
  this.busy = true;
  if (it.id === 'interruptor') return this.useSwitch(it);  // acende ou apaga
  // ... (Ani estica o braço e se vira para o objeto)
  if (dark && it.id === 'criado') {
    this.togglePlasma();                        // a única coisa que funciona no escuro
  } else if (dark) {
    sfx.deny();                                 // falas que se revezam a cada tentativa
    ui.say(DARK_LINES[this.darkTries++ % DARK_LINES.length], { hold: 1.8 });
  } else if (it.id === 'gaveta') {
    // ... com a luz acesa, cada objeto tem a sua interação
  }
}

togglePlasma() {
  const on = !this.room.plasmaOn;
  sfx.click();
  this.room.setPlasma(on);      // fica acesa mesmo com o quarto escuro
  if (on) sfx.hum();
}
```

Ao usar o interruptor, Ani anda até a parede e toca a animação de apertar; a luz muda no quadro em que o dedo encosta na tecla. Acender a luz também muda a gradação de cor da cena, de índigo e prata no escuro para âmbar com a luz acesa, e simula o olho se adaptando: a imagem estoura e depois assenta. A Figura 13 mostra o quarto escuro com a luminária ligada e a Figura 14, a fala que aparece ao tentar interagir com um objeto no escuro.

[Figura 13 – Quarto no escuro com a luminária de plasma ligada]

[Figura 14 – Interação no escuro: o objeto aparece como "???" e Ani diz que não consegue ver]

### 4.2.7 Inspeção de Objetos

Com a luz acesa, cada objeto do quarto tem uma interação própria. Na estante, no criado-mudo e na mochila, a câmera voa da visão lateral para a primeira pessoa: o mouse move a cabeça de Ani, passar sobre um item o destaca e clicar o examina, com uma fala. Os papéis no chão são vistos de cima, com Ani agachada, e o papel escolhido vem até a tela como um papel de verdade. A cortina abre e fecha, e na cama Ani levanta o travesseiro.

- **Arquivos:** `js/scenes/quarto.js`, `js/scenes/furniture.js`, `js/scenes/papers.js`
- **Requisitos correspondentes:** RF026, RF003
- **Casos de uso:** UC-S002
- **Classes do modelo:** `ObjetoInspecionavel`, `ObjetoInterativo`
- **Trecho de código:** Código 8
- **Captura de tela:** Figuras 15 e 16

[Código 8 – Examinar o item escolhido na inspeção (`js/scenes/quarto.js`)]

```js
inspectClick() {
  const ins = this.inspect;
  if (!ins?.hover) return;               // item sob o mouse (ou escolhido pelo controle)
  const tg = ins.hover;
  tg.jump = 1;                           // o item dá um pulinho
  if (tg.kind === 'book') {
    for (const o of ins.targets) if (o !== tg) o.picked = false;
    tg.picked = !tg.picked;              // o livro sai da estante ou volta
    sfx.page();
    if (tg.picked) ui.say(tg.line, { hold: 2.2 });
  } else {
    const snd = tg.obj.userData.sound;   // cada objeto pode ter o seu som
    if (snd && sfx[snd]) sfx[snd]();
    else if (tg.kind === 'bag') sfx.rustle();
    else sfx.tap();
    tg.obj.userData.poke?.();            // e uma reação própria
    ui.say(tg.line, { hold: 2.2 });
  }
}
```

Nos objetos que Ani revista procurando o carregador, uma contagem guarda os lugares já vistos; depois de dois, ela lembra da gaveta da escrivaninha. Essa dica conduz o jogador ao objeto-portal sem instruções na tela, em linha com o RNF004. As Figuras 15 e 16 mostram a inspeção da estante e os papéis vistos de cima.

[Figura 15 – Inspeção da estante em primeira pessoa]

[Figura 16 – Papéis no chão vistos de cima]

### 4.2.8 Objeto-Portal: da Gaveta à Memória do Parque

Na gaveta da escrivaninha, Ani acha o carregador e uma tirinha de fotos de cabine dela com a Malu. A câmera se aproxima até a última foto ocupar a tela inteira; então o flash da cabine carrega, estoura a tela de branco e o jogo passa para a noite em que a foto foi tirada, um ano antes, no parque de diversões. A tirinha é o objeto ligado à memória, e o flash é a passagem do presente para a lembrança.

- **Arquivos:** `js/scenes/quarto.js`, `js/scenes/photostrip.js`, `js/scenes/parque.js`
- **Requisitos correspondentes:** RF027, RF004 (parcial)
- **Casos de uso:** UC-S002
- **Classes do modelo:** `ObjetoMemoria` (`abrirMemoria()`), `Cenario`
- **Trecho de código:** Código 9
- **Captura de tela:** Figuras 17 e 18

[Código 9 – O flash da foto leva à memória do parque (`js/scenes/quarto.js`)]

```js
// zoom contínuo até a última foto da tirinha ocupar a tela (4,2 s)
await tw.to({
  duration: 4.2, ease: ease.inOutCubic,
  onUpdate: (k) => {
    cam.position.lerpVectors(start, endPos, k);
    cam.quaternion.slerpQuaternions(q0, q1, ease.inOutSine(k));
  },
});
// o flash: a foto "acontece" de novo
this.mode = 'photo';
await tw.wait(1.1);
sfx.flashCharge();                                  // o flash carrega
await tw.to({ duration: 0.55, ease: ease.inQuad, onUpdate: (k) => (fx.flash = k * 0.16) });
sfx.flash();
fx.flash = 1;                                       // tela branca
fx.bars = 1;                                        // faixas de cinema
this.game.goTo('parque', { flash: true });          // a memória começa no mesmo branco
```

A cena do parque começa no mesmo branco do flash, que assenta e revela a noite: as duas saem da cabine, a Malu pega a tirinha na máquina, ri das fotos e a entrega para Ani, que diz "Eu guardei.". A Figura 17 mostra a tirinha na gaveta, pouco antes do zoom, e a Figura 18, o cartão do Capítulo 1 que abre a memória do parque.

[Figura 17 – A tirinha de fotos na gaveta da escrivaninha, objeto-portal para a memória do parque]

[Figura 18 – Início da memória: o cartão do Capítulo 1 sobre a noite do parque]

### 4.2.9 Diálogos e Personagem Acompanhante

O protótipo usa dois tipos de fala, como em jogos narrativos do mesmo estilo. A caixa embaixo da tela é usada para pensamentos e para a interação com objetos; o balão sobre a cabeça, para a conversa entre personagens, e acompanha o personagem na tela. O texto aparece letra a letra; um clique completa a fala e outro a pula. Enquanto o balão é escrito, a boca do sprite abre e fecha no ritmo das letras.

No parque, a Malu acompanha Ani pela rua das barracas, um pouco atrás e mais para o fundo, comenta algumas barracas quando está perto e participa das compras e dos minigames.

- **Arquivos:** `js/engine/ui.js`, `js/scenes/parque.js`
- **Requisitos correspondentes:** RF008, RF030
- **Casos de uso:** UC-S003
- **Classes do modelo:** `NPC` (`acompanhando`, `seguir()`), `Dialogo`
- **Trecho de código:** Código 10
- **Captura de tela:** Figuras 19 e 20

[Código 10 – A Malu acompanha Ani sem grudar (`js/scenes/parque.js`)]

```js
if (this.mode === 'free' && (!M.target || M.target.follow)) {
  // ponto de destino: do lado oposto ao que Ani olha, um pouco mais para o fundo
  const side = -(this.pauseFacing || this.ani.facing);
  const gx = clamp(A.x + side * 1.05, LANE.minX, LANE.maxX);
  const gz = clamp(A.z - 0.28, LANE.minZ, LANE.maxZ);
  const d = Math.hypot(gx - M.x, gz - M.z);
  const speed = Math.min(2.3, 1.15 + d * 0.6);    // mais longe, anda mais rápido
  if (M.target) {                                 // já está indo: atualiza o destino
    M.target.x = gx; M.target.z = gz; M.target.speed = speed;
  } else if (d > 0.9) {                           // só sai do lugar se ficou para trás
    M.walkTo(gx, gz, speed);
    M.target.follow = true;
  } else if (Math.abs(A.x - M.x) > 0.2) M.face(Math.sign(A.x - M.x)); // parada, olha para Ani
}
```

A zona de tolerância de 0,9 m evita que a Malu se mexa a cada passo de Ani, o que pareceria mecânico. A classe `Actor` faz a chegada desacelerando e a saída acelerando, para que o movimento tenha peso. A Figura 19 mostra a conversa em balões na saída da cabine de fotos e a Figura 20, as duas na rua das barracas.

[Figura 19 – Conversa em balões entre Ani e Malu na saída da cabine de fotos]

[Figura 20 – Ani e Malu na rua das barracas do parque]

### 4.2.10 Compra e Consumo de Comidas

Nas barracas de algodão-doce, pipoca e churros com maçã do amor, as duas vão até o balcão, conversam, quem paga estende a mão e os pedidos voam do balcão até a mão de cada uma. Depois, cada uma come aos poucos, parada ou andando, e a comida diminui em estágios visíveis até acabar. Se a Malu terminar o algodão-doce antes, ela rouba um pedaço do de Ani.

- **Arquivos:** `js/scenes/parque.js`, `js/scenes/parkfood.js`, `js/chars/ani.js`
- **Requisitos correspondentes:** RF028
- **Casos de uso:** UC-S016
- **Classes do modelo:** `Barraca`, `Comida` (`estagio`, `consumir()`)
- **Trecho de código:** Código 11
- **Captura de tela:** Figura 21

[Código 11 – Cada mordida avança um estágio da comida (`js/scenes/parkfood.js`)]

```js
// Snacks.update(): para cada personagem com comida na mão (h), a cada quadro
if (h.bite) {
  // mordida: a mão sobe até a boca, segura e volta
  const b = h.bite;
  b.t += dt;
  const up = 0.32, hold = 0.38, down = 0.4;
  let k;
  if (b.t < up) k = ease.outCubic(b.t / up);                 // subindo
  else if (b.t < up + hold) {
    k = 1;                                                   // na boca
    if (!b.chomp) {
      b.chomp = true;
      h.stage++;                                               // próximo estágio
      h.mesh.userData.bite?.(h.stage / h.mesh.userData.stages); // a comida encolhe
      this.sfx.munch?.();
      this.crumbsAt(this.mouth(actor), h.kind, h.kind === 'pipoca' ? 9 : 6); // farelos
    }
  } else k = 1 - ease.inOutSine(clamp((b.t - up - hold) / down)); // descendo
  target = hand.clone().lerp(this.mouth(actor), k);
  if (b.t > up + hold + down) {
    h.bite = null;
    h.timer = 3 + Math.random() * 2.5;                       // próxima mordida em 3 a 5,5 s
    if (h.stage >= h.mesh.userData.stages) {                 // acabou
      this.drop(actor);
      this.onFinish?.(actor, h.kind);
    }
  }
} else if (!busy) {
  h.timer -= dt;
  if (h.timer <= 0) h.bite = { t: 0 };                       // hora da próxima mordida
}
```

Quando a comida tem folha de sprite própria, como acontece com Ani e Malu, o sprite cuida dos quadros de comer, com quatro estágios contínuos entre parada e andando; o modelo 3D do Código 11 é usado quando não há folha. A Figura 21 mostra as duas comendo algodão-doce.

[Figura 21 – Ani e Malu com algodão-doce comprado na barraca]

### 4.2.11 Minigames

Três barracas têm minigames: Estoure o Balão (dardos, com uma mira que balança como uma mão nervosa), Derrube as Latas (mira e força: segurar e soltar na faixa certa) e Pescaria (descer o anzol quando a argolinha do patinho passar). A câmera assume o olhar de Ani, Ani joga primeiro e a Malu depois, e o placar compara as duas. Os minigames são a exceção registrada à ausência de HUD e de pontuação: o placar e a interface existem só enquanto a partida dura, e o resultado muda apenas o comentário das duas, nunca a progressão.

- **Arquivos:** `js/scenes/minigames.js`, `js/scenes/parque.js`
- **Requisitos correspondentes:** RF029
- **Regras de negócio:** RN008
- **Casos de uso:** UC-S017
- **Classes do modelo:** `Minigame` (`placar`, `iniciar()`, `registrarJogada()`, `encerrar()`), `Barraca`
- **Trecho de código:** Código 12
- **Captura de tela:** Figura 22

[Código 12 – O resultado do minigame só escolhe as falas (`js/scenes/parque.js`)]

```js
async playGame(it) {
  const L = GAMES[it.id];                          // falas antes e depois, por resultado
  this.busy = true;
  // ... (as duas andam até a barraca e a câmera enquadra as duas)
  await Promise.all([this.A.walkTo(it.x - 0.2, LANE.minZ, 1.4),
                     this.M.walkTo(it.x - 1.1, LANE.minZ + 0.08, 1.5)]);
  if (!this.talked.has(it.id)) { this.talked.add(it.id); await this.sayAll(L.pre); }
  this.mode = 'game';
  const r = await this.mg.play(it.id);             // { res: 'win' | 'lose' | 'tie', ani, malu }
  this.mode = 'cut';
  await this.sayAll(L[r.res] || L.tie);            // RN008: o placar só muda o comentário
  this.mode = 'free';                              // e o jogador volta a andar livre
  this.busy = false;
  // ...
}
```

Os três minigames aceitam mouse, teclado e controle. A Figura 22 mostra a partida de Estoure o Balão, com o placar das duas.

[Figura 22 – Minigame Estoure o Balão, com placar e interface próprios durante a partida]

### 4.2.12 Menu Principal, Aviso de Conteúdo e Configurações

O menu principal é um olho em 3D, fechado no começo. Ao apertar qualquer tecla, ele acorda, uma tela acende na frente dele e as opções aparecem refletidas na íris; o olho segue o mouse e pisca sozinho. As opções são Iniciar, Continuar, Configurações (som, tamanho dos pixels e tela cheia) e Créditos. As configurações também ficam no menu de pausa do parque e são salvas no navegador.

Ao escolher Iniciar ou Continuar, o jogo mostra o aviso de conteúdo sensível antes de começar, uma vez a cada acesso. O aviso cita a ansiedade, a solidão e o sofrimento psíquico abordados no jogo, inclusive o momento de crise com tremor e distorção na tela, e indica o CVV (Centro de Valorização da Vida), pelo telefone 188 ou pelo chat. Ele só fecha quando o jogador confirma, e só aceita a confirmação depois de 1,2 s, para não ser pulado sem leitura.

- **Arquivos:** `js/scenes/menu.js`, `js/engine/aviso.js`, `js/main.js`
- **Requisitos correspondentes:** RF020, RF022
- **Casos de uso:** UC-S007, UC-S013, UC-S012
- **Classes do modelo:** `Configuracao`, `Jogo`
- **Trecho de código:** Código 13
- **Captura de tela:** Figuras 23 e 24

[Código 13 – O aviso de conteúdo antes de o jogo começar (`js/scenes/menu.js` e `js/engine/aviso.js`)]

```js
// menu.js: Iniciar e Continuar passam por aqui
if (!this.game.avisoVisto) {
  await showContentNotice(this.game);   // espera o jogador confirmar
  this.game.avisoVisto = true;          // uma vez a cada acesso
}
this.game.goTo('quarto');

// aviso.js: a confirmação só vale depois de TEMPO_MINIMO (1,2 s)
const pronto = () => (performance.now() - t0) / 1000 >= TEMPO_MINIMO;
const fechar = () => {
  if (fechado || !pronto()) return;
  fechado = true;
  // ... (som de confirmação)
  window.removeEventListener('keydown', onKey, true);
  game.onAnyPress = null;               // as entradas voltam para o jogo
  el.classList.remove('show');
  setTimeout(() => { el.innerHTML = ''; resolve(); }, 450);
};
```

A Figura 23 mostra o menu principal e a Figura 24, o aviso de conteúdo.

[Figura 23 – Menu principal: as opções refletidas na íris do olho]

[Figura 24 – Aviso de conteúdo sensível, com a indicação do CVV]

### 4.2.13 Pausa

A tecla Esc, ou o botão Menu do controle, pausa o jogo. No quarto, o menu de pausa oferece Continuar e Menu principal. No parque, a pausa é diegética: Ani tira o celular do bolso, a câmera se aproxima e o menu abre na tela do celular, no estilo de um aplicativo de ajustes, com Continuar, Som, Pixels, Tela cheia e Menu principal. A pausa congela o roteiro, as falas, os minigames e a roda-gigante.

- **Arquivos:** `js/engine/ui.js`, `js/scenes/quarto.js`, `js/scenes/parque.js`
- **Requisitos correspondentes:** RF021, RF022
- **Casos de uso:** UC-S006, UC-S007
- **Classes do modelo:** `Jogo` (`pausar()`, `retomar()`, `alterarEstado()`)
- **Trecho de código:** Código 14
- **Captura de tela:** Figura 25

[Código 14 – Menu de pausa do quarto (`js/scenes/quarto.js`)]

```js
openPause() {
  const { ui, sfx } = this.game;
  sfx.back();
  this.keys.clear();                      // solta as teclas: Ani não sai andando sozinha
  ui.pause([
    { label: 'CONTINUAR', action: () => ui.pause(null) },
    { label: 'MENU PRINCIPAL', action: () => { ui.pause(null); this.toMenu(); } },
  ]);
}
```

Enquanto `ui.pauseOpen` é verdadeiro, `main.js` desvia as teclas para o menu de pausa e não as repassa à cena, o que suspende o jogo sem desmontá-lo; ao continuar, tudo segue do mesmo ponto. A Figura 25 mostra a pausa no parque.

[Figura 25 – Pausa no parque: o menu abre na tela do celular de Ani]

### 4.2.14 Salvamento

O progresso e as configurações ficam no armazenamento local do navegador (`localStorage`), em duas chaves: `ani:save`, com o ponto do jogo, e `ani:config`, com o volume e o tamanho dos pixels. No protótipo, o salvamento é automático e acontece no início do quarto, quando o celular aparece; a opção Continuar do menu só fica disponível depois disso.

- **Arquivos:** `js/main.js`, `js/scenes/quarto.js`, `js/scenes/menu.js`
- **Requisitos correspondentes:** RF009 (parcial), RF031 (parcial), RNF002
- **Casos de uso:** UC-S011, UC-S012
- **Classes do modelo:** `Save`, `Configuracao`, `Jogo` (`salvarProgresso()`, `carregarProgresso()`)
- **Trecho de código:** Código 15

[Código 15 – Leitura e gravação no armazenamento local (`js/main.js`)]

```js
function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? { ...fallback, ...JSON.parse(v) } : { ...fallback };
  } catch {
    return { ...fallback };    // navegador sem armazenamento: valores padrão
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* navegador sem armazenamento: segue sem salvar */
  }
}
const settings = readJSON(SETTINGS_KEY, { volume: 1, rows: 360 });

// quarto.js, enterPhone(): ponto de salvamento automático (RF031)
save.set({ cena: 'quarto' });
```

As leituras e gravações ficam dentro de `try/catch` porque o armazenamento pode estar bloqueado, por exemplo numa janela anônima; nesse caso o jogo continua, só que sem salvar. A estrutura completa do save, com ato, memórias, diário e estado da casa, depende dos sistemas previstos na seção 4.3.

### 4.2.15 Áudio Sintetizado

O protótipo não usa arquivos de som: todos os efeitos e ambientes são sintetizados em tempo real com a Web Audio API, a partir de osciladores e de ruído filtrado. Cada cena tem o seu ambiente sonoro: o menu, um zumbido grave; o quarto, o ruído baixo da cidade ao longe e um zumbido elétrico; o parque, o murmúrio das pessoas e uma valsa de realejo ao longe. Como os navegadores só liberam o áudio depois de um gesto do jogador, o contexto de áudio é criado no primeiro clique ou tecla.

- **Arquivos:** `js/engine/audio.js`
- **Requisitos correspondentes:** RF010 (parcial)
- **Trecho de código:** Código 16

[Código 16 – Um tom sintetizado com envelope (`js/engine/audio.js`)]

```js
tone(freq, { type = 'square', dur = 0.06, vol = 0.06, slide = 0, delay = 0, attack = 0.004, pan = 0 } = {}) {
  if (!this.ctx) return;                       // áudio ainda não liberado pelo navegador
  const t = this.ctx.currentTime + delay;
  const o = this.ctx.createOscillator();
  o.type = type;                               // 'sine', 'square', 'sawtooth', 'triangle'
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  let out = this._env(o, t, attack, vol, dur); // envelope: sobe em attack, cai em dur
  // ... (posição no estéreo, quando pedida)
  out.connect(this.master);                    // volume geral (menu > Som)
  o.start(t);
  o.stop(t + attack + dur + 0.05);
}

// exemplos: cada som do jogo é uma combinação de tons e ruídos
tap() { this.tone(2400, { type: 'sine', dur: 0.018, vol: 0.05 }); }
pop() { this.tone(660, { type: 'sine', dur: 0.06, vol: 0.05, slide: 420 }); }
```

Sintetizar os sons dispensou a busca e o licenciamento de arquivos de áudio e deixa cada efeito ajustável no código, como o batimento do pânico, cuja velocidade acompanha a intensidade (Código 6).

### 4.2.16 Suporte a Gamepad e Mapeamento de Controles

Todo o protótipo pode ser jogado com um controle no padrão Xbox, sem configuração. Para não duplicar a lógica das cenas, o módulo `gamepad.js` converte os botões em eventos de tecla (A vira Enter, B vira Backspace, Menu vira Esc) e o analógico esquerdo em velocidade analógica, de modo que inclinar pouco faz Ani andar devagar. Não há cursor: no celular, na estante, no criado-mudo, na mochila e nos papéis, o direcional troca o item escolhido, como num menu. Alguns sons importantes também fazem o controle vibrar.

- **Arquivos:** `js/engine/gamepad.js`, `js/engine/glyphs.js`
- **Requisitos correspondentes:** RF011, RF001, RNF004
- **Trecho de código:** Código 17

[Código 17 – Botões do controle convertidos nas teclas que as cenas já entendem (`js/engine/gamepad.js`)]

```js
press(i) {
  const { ui, sfx } = this.game;
  const scene = this.game.current;
  const name = NAMES[i];                         // 'A', 'B', 'MENU'...
  sfx.unlock();                                  // nem todo navegador libera o som pelo controle
  if (this.game.onAnyPress?.()) return;          // "aperte para começar" e aviso de conteúdo
  const mode = scene?.padMode?.() ?? null;       // a cena diz como quer o controle
  if (ui.pauseOpen) {
    if (name === 'A') this.key('Enter', true);
    else if (name === 'B' || name === 'MENU' || name === 'VIEW') this.key('Escape', true);
    return;
  }
  if (name === 'MENU' || name === 'VIEW') return this.key('Escape', true); // pausa
  if (scene?.onPad?.(name, mode)) return;        // a cena pode tratar o botão do seu jeito
  if (name === 'A') this.key('Enter', true);     // interagir / confirmar
  else if (name === 'B') this.key('Backspace', true); // voltar
}
```

As dicas de botões aparecem só no quarto, uma vez, como tutorial, e mudam entre teclado e controle conforme o dispositivo que o jogador está usando. O Quadro 33 apresenta o mapeamento dos controles.

| Ação | Teclado e mouse | Gamepad (padrão Xbox) |
| --- | --- | --- |
| Movimento (para os lados e em profundidade) | WASD ou setas | Analógico esquerdo ou direcional |
| Interagir e confirmar | E, Enter ou clique esquerdo | A |
| Voltar | Esc ou botão direito | B |
| Olhar e escolher itens em primeira pessoa | Mouse | Analógico direito ou direcional |
| Rolar o feed do celular | Roda do mouse | Analógico direito |
| Pausar | Esc | Menu (☰) |
| Diário de memórias (previsto; fora do protótipo) | Tab | Y |

## 4.3 Sistemas Previstos para o Jogo Completo

Os sistemas a seguir constam dos requisitos e dos diagramas do capítulo 2, mas ficam fora do protótipo, que cobre apenas o início do Ato I. Eles serão implementados no jogo completo, em Unreal Engine 5.4.4 com C++.

- **Diário de memórias** (RF005, RN001, RN005): registro único de cada fragmento coletado, consulta pelo diário e releitura dos itens ao longo dos atos, com as classes `Memoria`, `Diario` e `EntradaDiario`.
- **Progressão por atos e sequência de memórias** (RF006, RF012, RF019, RN002 a RN004): os cinco atos em ordem fixa, a sequência linear de memórias de cada ato e o desbloqueio de cômodos, passagens e escadas da casa, com as classes `Ato` e `Cenario`.
- **Mecânicas filosóficas dos atos** (RF013 a RF017): o peso literal do Ato I, os ecos de decisão do Ato II (`EcoDecisao`, RN006), a restauração por aceitação do Ato III (`ObjetoRestauravel`), a contemplação ativa do Ato IV (`ObjetoContemplativo`) e a dissolução das mecânicas no Ato V.
- **Crises de ansiedade completas** (RF018): além do momento de pânico do protótipo, as manifestações, a respiração de Ani e o som fragmentado, com o estado Crise da classe `Jogo`.
- **Puzzles contextuais** (RF007, UC-S014): puzzles de várias etapas, sem punição pelo erro e com saída a qualquer momento.
- **Trilha e efeitos por ato** (RF010): a direção sonora de cada ato, descrita no GDD.
- **Save completo** (RF009, RNF002): ato atual, memórias registradas, estado do diário e estado visual da casa.
- **Sair do jogo** (RF023): no navegador, a sessão termina ao fechar a aba; a opção de sair, com confirmação, é do software para PC.

Na Unreal Engine, a arquitetura segue os diagramas do capítulo 2. A entrada será tratada pelo Enhanced Input, que associa a mesma *Input Action* à tecla e ao botão do controle, papel que no protótipo é do `gamepad.js`. O *GameMode* e a *GameInstance*, junto com a classe `Jogo`, guardarão o estado da sessão entre trocas de nível, e a notificação de `Ani` para `Jogo` no início e no fim das crises será feita por um *delegate*.

## 4.4 Atendimento dos Requisitos no Protótipo

O Quadro 34 mostra a situação de cada requisito no protótipo: atendido, atendido em parte ou fora do protótipo, quando o requisito depende de partes do jogo que ainda não foram construídas.

| Requisito | Situação no protótipo | Observação |
| --- | --- | --- |
| RF001 Movimentar personagem | Atendido | No quarto e no parque, para os lados e em profundidade, por teclado ou controle (4.2.3) |
| RF002 Colisão com cenário e objetos | Atendido | Móveis como retângulos no chão e limites da faixa (4.2.3) |
| RF003 Interagir com objetos | Atendido | Objetos do quarto e barracas do parque (4.2.6 e 4.2.7) |
| RF004 Sistema de memórias | Parcial | A tirinha de fotos leva à memória do parque; a sequência de fragmentos ainda não existe |
| RF005 Diário de memórias | Fora do protótipo | Previsto (4.3) |
| RF006 Desbloqueio progressivo do cenário | Fora do protótipo | A passagem para o parque é feita pelo objeto-portal (RF027) |
| RF007 Sistema de puzzles | Fora do protótipo | Previsto (4.3) |
| RF008 Diálogos com personagens de memória | Parcial | Conversas com a Malu (Pretendente); os demais personagens de memória ficam para o jogo completo |
| RF009 Sistema de save/load | Parcial | Salva o ponto do jogo no navegador; ato, memórias, diário e casa ainda não (4.2.14) |
| RF010 Feedback sonoro e musical por ato | Parcial | Ambiente sonoro por cena, sintetizado; a variação por ato depende dos demais atos (4.2.15) |
| RF011 Suporte a gamepad | Atendido | Controle no padrão Xbox em todo o protótipo (4.2.16) |
| RF012 Progressão por atos filosóficos | Parcial | Só o início do Ato I; a identidade visual é a mesma em todas as cenas |
| RF013 Mecânica de peso literal no Ato I | Fora do protótipo | Previsto (4.3) |
| RF014 Ecos de decisão no Ato II | Fora do protótipo | Previsto (4.3) |
| RF015 Restauração por aceitação no Ato III | Fora do protótipo | Previsto (4.3) |
| RF016 Contemplação ativa no Ato IV | Fora do protótipo | Previsto (4.3) |
| RF017 Dissolução de mecânicas no Ato V | Fora do protótipo | Previsto (4.3) |
| RF018 Crises de ansiedade como elemento sensorial | Parcial | Momento de pânico com tremor, distorção e batimentos (4.2.5) |
| RF019 Conclusão da sequência de memórias no Ato I | Fora do protótipo | Depende da sequência de memórias (4.3) |
| RF020 Aviso de conteúdo sensível | Atendido | Antes de o jogo começar, com o CVV (4.2.12) |
| RF021 Pausar jogo | Atendido | No quarto e no parque (4.2.13) |
| RF022 Configurar vídeo e áudio | Atendido | Som, pixels e tela cheia no menu inicial e na pausa do parque (4.2.12 e 4.2.13) |
| RF023 Sair do jogo | Fora do protótipo | No navegador, a sessão termina ao fechar a aba |
| RF024 Celular em primeira pessoa | Atendido | Aplicativo Pixgram (4.2.4) |
| RF025 Iluminação do ambiente | Atendido | Interruptor e luminária de plasma (4.2.6) |
| RF026 Inspeção de objetos em primeira pessoa | Atendido | Estante, criado-mudo, mochila e papéis (4.2.7) |
| RF027 Acesso a memórias por objeto-portal | Atendido | Tirinha de fotos e flash da cabine (4.2.8) |
| RF028 Compra e consumo de comidas | Atendido | Algodão-doce, pipoca, churros e maçã do amor (4.2.10) |
| RF029 Minigames | Atendido | Estoure o Balão, Derrube as Latas e Pescaria (4.2.11) |
| RF030 Personagem acompanhante | Atendido | A Malu no parque (4.2.9) |
| RF031 Salvamento automático | Parcial | Um ponto de salvamento, no início do quarto (4.2.14) |
| RNF001 Desempenho mínimo | A avaliar | Medição prevista no capítulo 5 |
| RNF002 Carregamento e integridade dos saves | Atendido | O save local é lido no início, sem espera perceptível |
| RNF003 Portabilidade de código e assets | A avaliar | Análise de portabilidade prevista no capítulo 5 |
| RNF004 Jogabilidade autoexplicativa | Atendido | Dicas de botões só no quarto, uma vez, e rótulos de interação junto aos objetos |
| RNF005 Internacionalização de textos | Fora do protótipo | Os textos ainda ficam no código |
| RNF006 Acessibilidade sensorial e de áudio | Fora do protótipo | Por decisão do autor, vale para o jogo final |

Dos 31 requisitos funcionais, 14 são atendidos pelo protótipo, 7 de forma parcial e 10 ficam fora dele. Os atendidos concentram-se nas mecânicas do início do Ato I (RF024 a RF030), na movimentação e na interação, e na estrutura de sessão (aviso, pausa, configurações e gamepad). Os requisitos fora do protótipo são, na maior parte, os das mecânicas dos demais atos, que não fazem parte do escopo definido no TAP.

# Referências

IBM. *Creating use-case diagrams*. Disponível em: <https://www.ibm.com/docs/en/dma?topic=diagrams-creating-use-case>. Acesso em: 22.mar.2026.

IBM. *Use case view*. Disponível em: <https://www.ibm.com/docs/en/systems-engineering/1.5.0?topic=views-use-case-view>. Acesso em: 22.mar.2026.

IBM. *UML diagrams*. Disponível em: <https://www.ibm.com/docs/en/radfws/9.6.1?topic=diagrams-uml>. Acesso em: 22.mar.2026.

IBM. *What is an entity relationship diagram?* Disponível em: <https://www.ibm.com/think/topics/entity-relationship-diagram>. Acesso em: 25.mar.2026.

LUCIDCHART. *What is an Entity Relationship Diagram (ERD)?* Disponível em: <https://www.lucidchart.com/pages/er-diagrams/>. Acesso em: 25.mar.2026.

OBJECT MANAGEMENT GROUP. *Business Process Model and Notation (BPMN), Version 2.0.2*. Needham: OMG, 2014.

PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de Software: uma abordagem profissional*. 8. ed. Porto Alegre: AMGH, 2016.

PROJECT MANAGEMENT INSTITUTE. *Um Guia do Conhecimento em Gerenciamento de Projetos (Guia PMBOK)*. 6. ed. Newtown Square: PMI, 2017.

SOMMERVILLE, Ian. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

VISUAL PARADIGM. *What is Class Diagram?* Disponível em: <https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/>. Acesso em: 22.mar.2026.

# Apêndice A - Perguntas do questionário e resumos das respostas selecionadas

Este apêndice apresenta as perguntas do formulário aplicado ao público-alvo e resumos anônimos das respostas consideradas mais úteis para a elicitação de requisitos do projeto **Ani**.

O formulário foi respondido por 8 participantes. As respostas foram, em geral, vagas e não geraram mecânicas nem decisões de design.

Os textos abaixo são resumos das respostas, não transcrições: as respostas originais do formulário não foram preservadas. Os nomes dos participantes foram removidos. Respostas muito vagas, ofensivas, sem relação com o projeto ou pouco aproveitáveis do ponto de vista analítico não foram reproduzidas.

## 1. O que mais te atrai em um jogo narrativo?

### Resumos das respostas selecionadas

- Participante A: reflexões filosóficas e profundas.
- Participante B: estilo de arte e trilha sonora únicos.
- Participante C: enredo complexo e com possibilidade de interpretação.

### Síntese

As respostas indicam interesse por jogos que combinam impacto estético, profundidade temática e narrativa com valor reflexivo.

## 2. Sobre a fluidez e a programação

### Resumos das respostas selecionadas

- Participante A: espera controles responsivos, interações fluidas e transições visuais e sonoras sem quebras de imersão.
- Participante B: espera uma experiência intuitiva, sem atrasos, travamentos ou elementos técnicos que prejudiquem a atmosfera.
- Participante C: espera gameplay fluida, carregamento rápido e boa precisão nos controles.

### Síntese

As respostas reforçam requisitos ligados à responsividade, estabilidade, fluidez e preservação da imersão.

## 3. Sobre as mecânicas de jogo

### Resumos das respostas selecionadas

- Participante A: espera exploração significativa, com cenários que tenham algo a contar e impacto emocional perceptível.
- Participante B: valoriza descoberta de memórias, caminhos de exploração e interação com elementos narrativos do cenário.
- Participante C: deseja que a exploração produza consequências perceptíveis no mundo e na experiência do personagem.

### Síntese

As respostas mostram preferência por mecânicas de exploração com função narrativa, em vez de interações puramente instrumentais. Sugestões muito distantes da proposta consolidada do projeto, como combate central ou estrutura fortemente ramificada, não foram adotadas como base principal.

## 4. Sobre a arte e o design

### Resumos das respostas selecionadas

- Participante A: espera uma estética que comunique emoção de forma sutil e acompanhe a jornada do personagem.
- Participante B: deseja um estilo visual poético, com trilha delicada e introspectiva.
- Participante C: espera coerência entre arte, música e narrativa ao longo da progressão.

### Síntese

As respostas apontam para a importância de uma direção artística sensível, coerente e articulada com o estado emocional do jogo.

## 5. Sobre a história e o significado

### Resumos das respostas selecionadas

- Participante A: espera uma experiência que deixe algo significativo e confie na interpretação do jogador.
- Participante B: espera reflexão sobre a própria vida e impacto emocional duradouro.
- Participante C: espera uma história ligada à filosofia, relações humanas e leitura sensível do mundo.

### Síntese

As respostas reforçam que o jogo deve buscar significado, densidade interpretativa e reflexão, sem depender apenas de explicações diretas.

## 6. Temas recorrentes nos resumos das respostas

Os resumos das respostas selecionadas giram em torno dos seguintes temas, que não chegaram a gerar mecânicas nem decisões de design:

- necessidade de movimentação e interação fluidas;
- valorização da atmosfera visual e sonora;
- importância da exploração com função narrativa;
- centralidade de memórias, diário e simbolismo;
- preferência por uma experiência reflexiva, interpretativa e emocionalmente significativa.

# Apêndice B - Missão, visão e valores

**Missão:** oferecer ao jogador uma experiência narrativa contemplativa em que atravessar o sofrimento de Ani, por meio da memória, da observação e do silêncio, convide à reflexão sobre consciência e sentido.

**Visão:** mostrar que um jogo digital pode representar, com profundidade e cuidado, uma jornada filosófica de transformação interior, e servir de referência para projetos narrativos que tratam de experiências subjetivas.

**Valores:**

- **Contemplação:** o silêncio, a pausa e a observação valem tanto quanto a ação.
- **Honestidade emocional:** o sofrimento é atravessado, não vencido nem romantizado.
- **Aceitação da imperfeição:** o que está quebrado é ressignificado, não apagado.
- **Interpretação aberta:** o jogo confia no jogador e não entrega respostas definitivas.
- **Coerência entre forma e sentido:** mecânica, arte e som existem para produzir significado.

# Apêndice C - Game Design Document (versão resumida)

Este apêndice resume o Game Design Document (GDD) de **Ani**, mantido na íntegra no repositório do projeto (`docs/gdd.md`). Ele registra a direção criativa que originou os requisitos apresentados no capítulo 2.

## C.1 Visão e ficha técnica

**Ani** é uma aventura narrativa contemplativa em 2.5D sobre consciência, sofrimento e a descoberta lenta do sentido. A protagonista é uma mulher comum, de aproximadamente 24 anos, em colapso existencial; seu nome vem do hebraico **אֲנִי**, "eu". O jogo não acompanha escolhas morais, e sim a mudança na forma como Ani percebe a existência. O Quadro 35 reúne a ficha técnica do jogo.

| Item | Descrição |
| --- | --- |
| Gênero | Aventura narrativa contemplativa em 2.5D |
| Plataforma | PC (Windows); o protótipo é executado no navegador |
| Engine e linguagem | Jogo completo: Unreal Engine 5.4.4 e C++; protótipo: Three.js (WebGL) e JavaScript |
| Câmera | Lateral, com planos em primeira pessoa e de cima nos momentos de inspeção |
| Público-alvo | 16 a 28 anos, com interesse em filosofia, arte e narrativas reflexivas |
| Tom | Sombrio, melancólico e contemplativo, com redenção gradual |
| Duração estimada | 3 a 5 horas |

## C.2 Pilar conceitual e atos

A jornada parte do pessimismo da filosofia ocidental e caminha, em cinco atos de ordem fixa, para filosofias contemplativas japonesas. A transição se manifesta no ambiente, no som, nas mecânicas e no ritmo, sem explicação didática. O Quadro 36 resume os cinco atos.

| Ato | Referência | Ideia central | Símbolo | Mecânica própria |
| --- | --- | --- | --- | --- |
| I - O Peso | Zapffe | A consciência como fardo | Relógio parado | Peso literal: cada memória tocada torna o movimento mais lento |
| II - O Abismo | Mainländer e Bahnsen | A vontade que se contradiz | Corredor em loop | Ecos de decisão: agir de outro modo leva ao mesmo impasse |
| III - A Rachadura | Wabi-Sabi | A beleza do que está quebrado | Kintsugi | Restauração por aceitação: o objeto é restaurado sem apagar as marcas |
| IV - A Passagem | Mono no Aware e Ikigai | Sentir o que passa e achar um fio de sentido | Pétalas de cerejeira | Contemplação ativa: parar e observar libera narração |
| V - O Limiar | Yugen | O que não cabe em palavras | Estrela solitária | Dissolução: as mecânicas somem até restar caminhar e contemplar |

Princípios de direção: o jogo não é sobre vencer o sofrimento, mas atravessá-lo; não há combate nem moralidade binária; as mecânicas existem para produzir sensação e significado; o silêncio e a observação valem tanto quanto a interação. O final é único, aberto e interpretativo.

## C.3 Mundo, personagens e sistemas

O jogo parte do presente, no quarto de Ani, e se aprofunda na mente dela: objetos do quarto funcionam como portais para memórias vividas dentro da própria cabeça. O núcleo é a casa da protagonista, a começar pelo quarto, um espaço vivido e cheio de marcas de quem ela é, que ganha novos cômodos e passagens conforme os atos avançam. Dela partem cenários de memória, como a casa de infância, a escola, o trabalho, as ruas, o hospital, os espaços sociais e o parque de diversões do Ato I, entre outros. A identidade visual se mantém ao longo dos atos, que marcam etapas narrativas; a luz e a atmosfera variam para servir à narrativa, e as memórias felizes, como o parque, têm cores quentes e iluminadas.

Os personagens se dividem em personagens de memória (Mãe, Padrasto, Pretendente e Primo) e manifestações, figuras sem rosto que refletem Ani e intensificam as crises, sem agir como inimigos.

Os sistemas transversais são a exploração com diário de memórias, em que cartas, bilhetes e fotografias ficam registrados e ganham nova leitura ao longo dos atos, e as crises de ansiedade, representadas por distorção visual, som fragmentado e respiração. A interface é quase invisível: sem HUD permanente nem barras numéricas (exceto nos minigames do parque), com menus diegéticos, como a pausa aberta na tela do celular de Ani, e o diário como objeto diegético. O áudio vai do abafado e claustrofóbico ao orgânico e silencioso, com direção própria em cada ato.

Cada ato segue o mesmo ciclo: explorar a casa, encontrar a passagem para uma memória, atravessar a experiência central do ato, registrar o avanço no diário e abrir a passagem para o ato seguinte.
