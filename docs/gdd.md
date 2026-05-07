# GDD: Ani

## O que é o GDD

Um *Game Design Document* (GDD) é o documento que organiza e registra a visão geral de um jogo, reunindo elementos como proposta conceitual, narrativa, mecânicas, direção estética, interface, público-alvo e diretrizes técnicas. Em termos de desenvolvimento, ele funciona como uma referência estruturadora para que as decisões criativas e de implementação permaneçam coerentes ao longo do projeto [1][2].

## Importância do GDD

A importância do GDD está em transformar uma ideia de jogo em uma base documental consistente. Ao consolidar a experiência pretendida, suas regras, seus objetivos e sua identidade, o documento reduz ambiguidades, favorece a comunicação entre os envolvidos e oferece rastreabilidade entre concepção, modelagem e desenvolvimento [1][2].

## Status do Documento

Este documento registra a direção criativa, filosófica, narrativa e técnica atualmente adotada para **Ani**.

- O conteúdo ainda está em evolução e pode conter pontos a revisar conforme o projeto amadurecer.
- O objetivo deste arquivo é consolidar a direção criativa do jogo em um formato Markdown versionável.

## 1. Introdução

### Visão

**Ani** é uma experiência contemplativa e emocional que conduz o jogador por uma jornada filosófica de sofrimento, percepção e transformação interior. Em vez de se apoiar em escolhas morais tradicionais, o jogo acompanha a mudança da forma como a protagonista percebe a existência.

Ani é uma mulher comum em colapso existencial, atravessando espaços mentais distorcidos, memórias fragmentadas e manifestações simbólicas da própria consciência. O nome da protagonista vem do hebraico **אני**, que significa **"eu"**. A proposta é aproximar jogador e personagem: o jogador não observa Ani à distância, ele habita sua experiência.

### Logline

Um side-scroller narrativo contemplativo sobre consciência, sofrimento e a descoberta lenta do sentido.

### Sinopse

Ani acorda em um lugar que parece sua própria mente: familiar, mas deformado; íntimo, mas opressivo. Não há mapa, não há tutorial explícito e não há inimigos no sentido tradicional. O que existe são memórias, silêncio, ruínas emocionais e o peso de existir com consciência demais.

*→ Formalizado em RNF004 — Jogabilidade autoexplicativa (docs/requisitos/requisitos-nao-funcionais.md).*

Ao longo de cinco atos, o mundo não muda porque o jogador escolheu entre certo e errado. Ele muda porque Ani muda. A cada etapa, o jogo abandona um pouco do pessimismo radical que marca o início da jornada e se aproxima de filosofias contemplativas orientais que acolhem imperfeição, impermanência e mistério.

*→ Formalizado em RF012 — Progressão por atos filosóficos e RN002 — Progressão fixa entre atos (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

### Ficha Técnica

A tabela a seguir apresenta a ficha técnica base do projeto **Ani**.

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

## 2. Pilar Conceitual

### A Transição Filosófica

A espinha dorsal de **Ani** não é uma história de moralidade, mas uma história de percepção.

O jogo começa imerso em correntes pessimistas da filosofia ocidental e, ao longo dos cinco atos, caminha em direção a filosofias contemplativas japonesas. Essa transição não é didática nem explicada em excesso. Ela se manifesta no ambiente, na música, na estrutura do espaço, nas mecânicas e no ritmo da experiência.

*→ Formalizado em RF010 — Feedback sonoro e musical por ato e RF012 — Progressão por atos filosóficos (docs/requisitos/requisitos-funcionais.md).*

### Eixo Filosófico por Ato

A tabela a seguir apresenta o eixo filosófico que orienta cada ato da jornada de **Ani**.

| Ato | Referência Filosófica | Tom | Símbolo |
| --- | --- | --- | --- |
| I | Zapffe | O peso da consciência | Relógio parado |
| II | Mainländer e Bahnsen | A vontade que se devora e o loop irresolúvel | Corredor em loop |
| III | Wabi-Sabi | Beleza no quebrado | Kintsugi |
| IV | Mono no Aware e Ikigai | Sentir o que passa e encontrar um fio de sentido | Pétalas de cerejeira |
| V | Yugen | O que não cabe em palavras | Estrela solitária |

*→ Sequência formalizada em RF012 — Progressão por atos filosóficos e RN002 — Progressão fixa entre atos (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

### Princípios de Direção

- O jogo não é sobre vencer o sofrimento, mas atravessá-lo.
- Não existe sistema de moralidade binária.
- Não há combate como eixo principal da experiência.
- As mecânicas existem para produzir sensação e significado, não para gamificar emoção.
- O silêncio, a pausa e a observação são tão importantes quanto a interação.

## 3. Mundo do Jogo

### Estrutura Geral

O jogo se passa inteiramente na mente de Ani, representada como um espaço arquitetônico impossível: apartamentos que se repetem, corredores alagados, ruínas em loop, jardins noturnos e cenários familiares ligeiramente errados.

O núcleo central é a casa de Ani, inicialmente cinzenta, incompleta e sufocante. Conforme os atos avançam, ela ganha textura, luz e reorganização espacial. Novos cômodos, passagens, portas e escadas surgem à medida que a jornada se aprofunda.

*→ Formalizado em RF006 — Desbloqueio progressivo do cenário (docs/requisitos/requisitos-funcionais.md).*

### Cenários de Memória

As memórias aparecem como extensões da casa e como portais para fragmentos do passado.

*→ Formalizado em RF004 — Sistema de memórias (docs/requisitos/requisitos-funcionais.md).*

- Casa de infância em épocas diferentes
- Escola com corredores alongados e rostos indistintos
- Trabalho como escritório repetido em variações
- Ruas familiares, porém deslocadas
- Hospital com atmosfera branca e opressiva
- Bares e espaços sociais, onde a ansiedade se intensifica

### Progressão Visual por Ato

A tabela a seguir apresenta a progressão visual planejada para cada ato do jogo.

| Ato | Paleta | Atmosfera |
| --- | --- | --- |
| I | Cinza-chumbo e preto profundo | Claustrofobia, tetos baixos, relógios parados |
| II | Cinza-azulado e sombras densas | Labirinto, repetição e desorientação |
| III | Ocre, marrom e ouro nas rachaduras | Quietude, musgo, frestas de luz |
| IV | Azul-índigo, rosa-cerejeira e dourado | Abertura, respiro, contemplação |
| V | Azul muito escuro, quase preto | Imensidão, vazio e coexistência simbólica |

*→ Relacionado a RF012 — Progressão por atos filosóficos; a direção visual permanece definida neste GDD (docs/requisitos/requisitos-funcionais.md).*

## 4. Narrativa

### Estrutura Geral

A narrativa de **Ani** é organizada em cinco atos. Cada ato corresponde a uma transformação filosófica e emocional, com linguagem visual, sonora e mecânica próprias.

*→ Formalizado em RF012 — Progressão por atos filosóficos e RN002 — Progressão fixa entre atos (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

### Ato I: O Peso

**Referência:** Zapffe  
**Ideia central:** a consciência como fardo

Ani desperta em um apartamento escuro, apertado e opressivo. Tudo parece minimamente familiar, mas deslocado. O mundo pesa. Os objetos da memória aparecem espalhados, e lembrar exige esforço.

*→ Formalizado em RF013 — Mecânica de peso literal no Ato I e RF019 — Desbloqueio mínimo de memórias no Ato I (docs/requisitos/requisitos-funcionais.md).*

O encerramento do ato acontece quando Ani encontra uma porta que não conduz à libertação, mas a uma descida ainda mais profunda.

*→ Formalizado em RN003 — Critério de avanço por conclusão de ato (docs/requisitos/regras-de-negocio.md).*

### Ato II: O Abismo

**Referência:** Mainländer e Bahnsen  
**Ideia central:** a vontade que se contradiz e se devora

Ani atravessa ruínas subterrâneas e espaços em loop. Figuras sem rosto não atacam, apenas refletem e distorcem sua presença. O labirinto é propositalmente contraditório. O jogador se perde porque a própria estrutura do ato comunica irresolução.

*→ Formalizado em RF014 — Mecânica de ecos de decisão no Ato II e RN006 — Convergência dos ecos de decisão (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

O centro simbólico desse trecho é **O Arquiteto**, figura que constrói estruturas que desabam assim que terminam.

*→ Formalizado em RF008 — Diálogos com personagens de memória e arquétipos (docs/requisitos/requisitos-funcionais.md).*

### Ato III: A Rachadura

**Referência:** Wabi-Sabi  
**Ideia central:** a beleza do que está quebrado

O mundo não se torna subitamente belo, mas se torna honesto. As ruínas continuam presentes, porém agora possuem textura, musgo, luz e marcas assumidas. Objetos quebrados não são restaurados ao estado original; são ressignificados.

*→ Formalizado em RF015 — Mecânica de restauração por aceitação no Ato III e RN005 — Ressignificação de objetos e memórias (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

O principal símbolo do ato é o **Kintsugi**, a cerâmica remontada com ouro.

### Ato IV: A Passagem

**Referência:** Mono no Aware e Ikigai  
**Ideia central:** sentir a impermanência e reconhecer pequenos fios de sentido

Pela primeira vez, Ani alcança um espaço aberto: um jardim noturno com cerejeiras e lanternas. As manifestações deixam de ser apenas ameaçadoras e passam a existir como presenças do passado. O jogo convida o jogador a parar, observar e aceitar o que não pode ser retido.

*→ Formalizado em RF016 — Mecânica de contemplação ativa no Ato IV (docs/requisitos/requisitos-funcionais.md).*

Nesse ato surge **A Criança**, figura associada à atenção plena e ao gesto simples.

*→ Formalizado em RF008 — Diálogos com personagens de memória e arquétipos (docs/requisitos/requisitos-funcionais.md).*

### Ato V: O Limiar

**Referência:** Yugen  
**Ideia central:** o mistério que não cabe em palavras

O ato final acontece em um espaço aberto e indefinido, onde fragmentos dos atos coexistem. As mecânicas são retiradas progressivamente até restar apenas caminhar, observar e ouvir.

*→ Formalizado em RF017 — Dissolução de mecânicas no Ato V (docs/requisitos/requisitos-funcionais.md).*

O encerramento é deliberadamente aberto. O jogo não explica tudo, não fecha todos os sentidos e não entrega resposta definitiva sobre o destino de Ani.

## 5. Personagens

### Ani

- Mulher de aproximadamente 24 anos
- Uma mulher comum, sem poderes ou missão heroica
- Sua identidade é ponto de partida, não recompensa final
- Visualmente começa quase como silhueta e ganha presença ao longo dos atos

### Personagens de Memória

Esses personagens aparecem principalmente como ecos do passado e não como companheiros estáveis no presente narrativo.

*→ Formalizado em RF008 — Diálogos com personagens de memória e arquétipos (docs/requisitos/requisitos-funcionais.md).*

| Personagem | Tipo | Papel Narrativo |
| --- | --- | --- |
| Mãe | Família / memória | Âncora emocional importante, ligada à proteção e ao sufocamento |
| Padrasto | Família / memória | Presença pesada, associada à distorção e à opressão |
| Namorada | Família / memória | Memória mais recente, ligada à fragilidade afetiva |
| Primo | Família / memória | Presença leve em contraste com os momentos mais densos |

### Arquétipos

A tabela a seguir apresenta os arquétipos filosóficos que acompanham a jornada simbólica de Ani.

| Personagem | Papel |
| --- | --- |
| O Arquiteto | Manifestação da contradição irresolúvel do Ato II |
| A Ceramista | Manifestação do Wabi-Sabi e da aceitação das fendas |
| A Criança | Manifestação do Ikigai, da atenção e da presença |

*→ Formalizado em RF008 — Diálogos com personagens de memória e arquétipos (docs/requisitos/requisitos-funcionais.md).*

### Manifestações

As manifestações são figuras sem rosto que refletem Ani. Elas não funcionam como inimigos tradicionais. Em alguns momentos, espelham, observam, sussurram ou intensificam crises emocionais.

*→ Formalizado em RF018 — Crises de ansiedade como elemento sensorial (docs/requisitos/requisitos-funcionais.md).*

## 6. Mecânicas

### Princípio Central

**Ani** não possui sistema de combate, sistema de moralidade, pontuação ou árvore de escolhas com múltiplos finais baseados em bom ou mau comportamento. As mecânicas existem para dar corpo às ideias do jogo.

### Mecânicas por Ato

#### Ato I: Peso Literal

Cada memória tocada adiciona peso ao movimento de Ani. Ignorar o passado parece mais confortável, mas impede o avanço.

*→ Formalizado em RF013 — Mecânica de peso literal no Ato I e RN004 — Avanço parcial no Ato I (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

#### Ato II: Ecos de Decisão

Ani revive certos momentos e pode tentar agir de outro modo, mas o resultado continua preso ao mesmo impasse. A mecânica comunica repetição e contradição.

*→ Formalizado em RF014 — Mecânica de ecos de decisão no Ato II e RN006 — Convergência dos ecos de decisão (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

#### Ato III: Restauração por Aceitação

Objetos quebrados podem ser restaurados, mas nunca apagando suas marcas. O gesto é de aceitação, não de retorno ao estado original.

*→ Formalizado em RF015 — Mecânica de restauração por aceitação no Ato III e RN005 — Ressignificação de objetos e memórias (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

#### Ato IV: Contemplação Ativa

Parar diante de elementos específicos do cenário libera memória, narração e sentido. A observação passa a ser uma forma central de interação.

*→ Formalizado em RF016 — Mecânica de contemplação ativa no Ato IV (docs/requisitos/requisitos-funcionais.md).*

#### Ato V: Dissolução das Mecânicas

As mecânicas do jogo são progressivamente removidas até restar apenas caminhar e contemplar.

*→ Formalizado em RF017 — Dissolução de mecânicas no Ato V (docs/requisitos/requisitos-funcionais.md).*

### Exploração e Diário de Memórias

Ani explora a casa e suas memórias interagindo com objetos significativos. Cartas, bilhetes, fotografias e fragmentos textuais ficam registrados em um diário de memórias com estética manual.

*→ Formalizado em RF003 — Interagir com objetos, RF004 — Sistema de memórias, RF005 — Diário de memórias e UC-S004 — Interagir com Objeto (docs/requisitos/requisitos-funcionais.md; docs/caso-de-uso/README.md).*

O mesmo item pode adquirir nova leitura conforme os atos avançam. A mudança está menos no texto bruto e mais no contexto em que ele é reencontrado.

*→ Formalizado em RN001 — Registro único de memória e RN005 — Ressignificação de objetos e memórias (docs/requisitos/regras-de-negocio.md).*

### Ansiedade e Respiração

Crises de ansiedade continuam como uma das bases sensoriais do jogo.

- O ambiente se distorce
- O som se fragmenta
- As manifestações se multiplicam
- A respiração de Ani se torna indicador importante do estado emocional

*→ Formalizado em RF018 — Crises de ansiedade como elemento sensorial e apoiado por RNF007 — Acessibilidade sensorial e de áudio (docs/requisitos/requisitos-funcionais.md; docs/requisitos/requisitos-nao-funcionais.md).*

## 7. Interface

### Filosofia de UI

A interface deve ser quase invisível. O jogo comunica estado por atmosfera, som, ritmo, distorção e comportamento do cenário.

*→ Diretriz definida neste GDD e apoiada por RNF004 — Jogabilidade autoexplicativa (docs/requisitos/requisitos-nao-funcionais.md).*

### Diretrizes

- Sem HUD permanente
- Sem barras numéricas
- Ícones discretos e rabiscados
- Diário de memórias acessível como objeto diegético
- A respiração funciona como indicador sensorial recorrente

*→ Formalizado em RF005 — Diário de memórias e RNF007 — Acessibilidade sensorial e de áudio (docs/requisitos/requisitos-funcionais.md; docs/requisitos/requisitos-nao-funcionais.md).*

### Controles no PC

A tabela a seguir apresenta os controles previstos para a versão de PC.

| Ação | Controle |
| --- | --- |
| Movimento | WASD ou setas |
| Interagir | E ou clique esquerdo |
| Diário de memórias | Tab |
| Contemplar | Sem botão dedicado; depende de parar e observar |

*→ Formalizado em RF001 — Movimentar personagem, RF003 — Interagir com objetos, RF005 — Diário de memórias e UC-S001/UC-S004/UC-S007 (docs/requisitos/requisitos-funcionais.md; docs/caso-de-uso/README.md).*

## 8. Áudio

### Princípio Sonoro

O áudio acompanha a transição filosófica do jogo: parte de um espaço abafado e claustrofóbico e gradualmente se torna mais orgânico, silencioso e contemplativo. O silêncio não é ausência de conteúdo, mas parte da linguagem.

*→ Formalizado em RF010 — Feedback sonoro e musical por ato (docs/requisitos/requisitos-funcionais.md).*

### Direção por Ato

A tabela a seguir apresenta a direção sonora associada a cada ato do jogo.

| Ato | Clima Sonoro | Elementos |
| --- | --- | --- |
| I | Peso e clausura | Silêncio pesado, rangidos, passos ecoados, relógios que não andam |
| II | Loop e distorção | Repetições ligeiramente erradas, batimentos, ecos codificados |
| III | Textura e imperfeição | Cordas imperfeitas, cerâmica, madeira, presença tátil dos sons |
| IV | Abertura e passagem | Flauta, vento, sino distante, queda de pétalas e pausas longas |
| V | Imensidão e silêncio | Sustentação mínima, espaço entre notas e sensação de vazio |

*→ Formalizado em RF010 — Feedback sonoro e musical por ato (docs/requisitos/requisitos-funcionais.md).*

### Vozes e Efeitos

- NPCs se comunicam principalmente por texto
- Crises de ansiedade usam sussurros humanos distorcidos
- Memórias felizes trazem sons urbanos suaves e papel sendo folheado
- Memórias traumáticas usam abafamento, ruído e silêncio súbito
- Interações materiais devem soar táteis, íntimas e físicas

*→ Formalizado em RF008 — Diálogos com personagens de memória e arquétipos e RF018 — Crises de ansiedade como elemento sensorial (docs/requisitos/requisitos-funcionais.md).*

## 9. Principais Características

- Side-scroller narrativo contemplativo
- Progressão em cinco atos filosóficos
- Ausência de combate e moralidade binária
- Mundo mental simbólico e mutável
- Mecânicas que nascem e desaparecem conforme o significado de cada ato
- Diário de memórias como elemento narrativo central
- Crises de ansiedade como recurso sensorial e dramático
- Interface minimalista e diegética
- Final único, aberto e interpretativo

## 10. Especificações Técnicas

### Base Técnica

A tabela a seguir apresenta a base técnica atualmente definida para o projeto.

| Item | Direção Atual |
| --- | --- |
| Engine | Unity |
| Linguagem | C# |
| Plataforma inicial | PC (Windows) |
| Estrutura visual | Side-scroller lateral com elementos 3D estilizados |
| Câmera | Lateral fixa com zoom narrativo |
| Texturas | Estética de desenho à mão, aquarela e grafite |
| Efeitos visuais | Distorção emocional, vinheta dinâmica e transições de cor por ato |

*→ Formalizado em RNF001 — Desempenho mínimo e RNF003 — Portabilidade de código e assets (docs/requisitos/requisitos-nao-funcionais.md).*

### Loop de Progressão

Cada ato segue um ciclo estrutural simples:

*→ Fluxo representado no diagrama BPMN (docs/bpmn/README.md); progressão formalizada em RF006, RF012, RN002 e RN003 (docs/requisitos/requisitos-funcionais.md; docs/requisitos/regras-de-negocio.md).*

1. Explorar a casa e perceber o que mudou.
2. Encontrar a passagem para uma memória ou região mental.
3. Atravessar a experiência central do ato.
4. Retornar à casa e registrar o avanço no diário.
5. Abrir passagem para o ato seguinte.

*→ Interações representadas em UC-S004 — Interagir com Objeto, UC-S006 — Ler Documentos e UC-S016 — Salvar Jogo (docs/caso-de-uso/README.md).*

## 11. Encerramento

**Ani** não é um jogo sobre oferecer respostas definitivas. É um jogo sobre aprender a viver com perguntas, com rachaduras, com silêncio e com aquilo que continua sem nome mesmo depois que a jornada termina.

## Referências

[1] FULLERTON, Tracy. *Game Design Workshop: A Playcentric Approach to Creating Innovative Games*. 4. ed. Boca Raton: CRC Press, 2019.

[2] ADAMS, Ernest. *Fundamentals of Game Design*. 3. ed. Berkeley: New Riders, 2014.
