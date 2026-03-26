# GDD: Ani

## O que e o GDD

Um *Game Design Document* (GDD) e o documento que organiza e registra a visao geral de um jogo, reunindo elementos como proposta conceitual, narrativa, mecanicas, direcao estetica, interface, publico-alvo e diretrizes tecnicas. Em termos de desenvolvimento, ele funciona como uma referencia estruturadora para que as decisoes criativas e de implementacao permanecam coerentes ao longo do projeto [1][2].

## Importancia do GDD

A importancia do GDD esta em transformar uma ideia de jogo em uma base documental consistente. Ao consolidar a experiencia pretendida, suas regras, seus objetivos e sua identidade, o documento reduz ambiguidades, favorece a comunicacao entre os envolvidos e oferece rastreabilidade entre concepcao, modelagem e desenvolvimento [1][2].

## Status do Documento

Este documento registra a direcao criativa, filosofica, narrativa e tecnica atualmente adotada para **Ani**.

- O conteudo ainda esta em evolucao e pode conter pontos a revisar conforme o projeto amadurecer.
- O objetivo deste arquivo e consolidar a direcao criativa do jogo em um formato Markdown versionavel.

## 1. Introducao

### Visao

**Ani** e uma experiencia contemplativa e emocional que conduz o jogador por uma jornada filosofica de sofrimento, percepcao e transformacao interior. Em vez de se apoiar em escolhas morais tradicionais, o jogo acompanha a mudanca da forma como o protagonista percebe a existencia.

Ani e um homem comum em colapso existencial, atravessando espacos mentais distorcidos, memorias fragmentadas e manifestacoes simbolicas da propria consciencia. O nome do protagonista vem do hebraico **אני**, que significa **"eu"**. A proposta e aproximar jogador e personagem: o jogador nao observa Ani a distancia, ele habita sua experiencia.

### Logline

Um side-scroller narrativo contemplativo sobre consciencia, sofrimento e a descoberta lenta do sentido.

### Sinopse

Ani acorda em um lugar que parece sua propria mente: familiar, mas deformado; intimo, mas opressivo. Nao ha mapa, nao ha tutorial explicito e nao ha inimigos no sentido tradicional. O que existe sao memorias, silencio, ruinas emocionais e o peso de existir com consciencia demais.

Ao longo de cinco atos, o mundo nao muda porque o jogador escolheu entre certo e errado. Ele muda porque Ani muda. A cada etapa, o jogo abandona um pouco do pessimismo radical que marca o inicio da jornada e se aproxima de filosofias contemplativas orientais que acolhem imperfeicao, impermanencia e misterio.

### Ficha Tecnica

| Item | Descricao |
| --- | --- |
| Titulo | Ani |
| Genero | Side-scroller narrativo contemplativo |
| Plataforma principal | PC (Windows) |
| Engine | Unity |
| Linguagem | C# |
| Camera | Lateral fixa com zoom narrativo |
| Publico-alvo | 16 a 28 anos, com interesse em filosofia, arte e narrativas reflexivas |
| Tom | Sombrio, melancolico e contemplativo, com redencao gradual |
| Duracao estimada | 3 a 5 horas por jornada |

## 2. Pilar Conceitual

### A Transicao Filosofica

A espinha dorsal de **Ani** nao e uma historia de moralidade, mas uma historia de percepcao.

O jogo comeca imerso em correntes pessimistas da filosofia ocidental e, ao longo dos cinco atos, caminha em direcao a filosofias contemplativas japonesas. Essa transicao nao e didatica nem explicada em excesso. Ela se manifesta no ambiente, na musica, na estrutura do espaco, nas mecanicas e no ritmo da experiencia.

### Eixo Filosofico por Ato

| Ato | Referencia Filosofica | Tom | Simbolo |
| --- | --- | --- | --- |
| I | Zapffe | O peso da consciencia | Relogio parado |
| II | Mainlander e Bahnsen | A vontade que se devora e o loop irresoluvel | Corredor em loop |
| III | Wabi-Sabi | Beleza no quebrado | Kintsugi |
| IV | Mono no Aware e Ikigai | Sentir o que passa e encontrar um fio de sentido | Petalas de cerejeira |
| V | Yugen | O que nao cabe em palavras | Estrela solitaria |

### Principios de Direcao

- O jogo nao e sobre vencer o sofrimento, mas atravessa-lo.
- Nao existe sistema de moralidade binaria.
- Nao ha combate como eixo principal da experiencia.
- As mecanicas existem para produzir sensacao e significado, nao para gamificar emocao.
- O silencio, a pausa e a observacao sao tao importantes quanto a interacao.

## 3. Mundo do Jogo

### Estrutura Geral

O jogo se passa inteiramente na mente de Ani, representada como um espaco arquitetonico impossivel: apartamentos que se repetem, corredores alagados, ruinas em loop, jardins noturnos e cenarios familiares ligeiramente errados.

O nucleo central e a casa de Ani, inicialmente cinzenta, incompleta e sufocante. Conforme os atos avancam, ela ganha textura, luz e reorganizacao espacial. Novos comodos, passagens, portas e escadas surgem a medida que a jornada se aprofunda.

### Cenarios de Memoria

As memorias aparecem como extensoes da casa e como portais para fragmentos do passado.

- Casa de infancia em epocas diferentes
- Escola com corredores alongados e rostos indistintos
- Trabalho como escritorio repetido em variacoes
- Ruas familiares, porem deslocadas
- Hospital com atmosfera branca e opressiva
- Bares e espacos sociais, onde a ansiedade se intensifica

### Progressao Visual por Ato

| Ato | Paleta | Atmosfera |
| --- | --- | --- |
| I | Cinza-chumbo e preto profundo | Claustrofobia, tetos baixos, relogios parados |
| II | Cinza-azulado e sombras densas | Labirinto, repeticao e desorientacao |
| III | Ocre, marrom e ouro nas rachaduras | Quietude, musgo, frestas de luz |
| IV | Azul-indigo, rosa-cerejeira e dourado | Abertura, respiro, contemplacao |
| V | Azul muito escuro quase preto | Imensidao, vazio e coexistencia simbolica |

## 4. Narrativa

### Estrutura Geral

A narrativa de **Ani** e organizada em cinco atos. Cada ato corresponde a uma transformacao filosofica e emocional, com linguagem visual, sonora e mecanica proprias.

### Ato I: O Peso

**Referencia:** Zapffe  
**Ideia central:** a consciencia como fardo

Ani desperta em um apartamento escuro, apertado e opressivo. Tudo parece minimamente familiar, mas deslocado. O mundo pesa. Os objetos da memoria aparecem espalhados, e lembrar exige esforco.

O encerramento do ato acontece quando Ani encontra uma porta que nao conduz a libertacao, mas a uma descida ainda mais profunda.

### Ato II: O Abismo

**Referencia:** Mainlander e Bahnsen  
**Ideia central:** a vontade que se contradiz e se devora

Ani atravessa ruinas subterraneas e espacos em loop. Figuras sem rosto nao atacam, apenas refletem e distorcem sua presenca. O labirinto e propositalmente contraditorio. O jogador se perde porque a propria estrutura do ato comunica irresolucao.

O centro simbolico desse trecho e **O Arquiteto**, figura que constroi estruturas que desabam assim que terminam.

### Ato III: A Rachadura

**Referencia:** Wabi-Sabi  
**Ideia central:** a beleza do que esta quebrado

O mundo nao se torna subitamente belo, mas se torna honesto. As ruinas continuam presentes, porem agora possuem textura, musgo, luz e marcas assumidas. Objetos quebrados nao sao restaurados ao estado original; sao ressignificados.

O principal simbolo do ato e o **Kintsugi**, a ceramica remontada com ouro.

### Ato IV: A Passagem

**Referencia:** Mono no Aware e Ikigai  
**Ideia central:** sentir a impermanencia e reconhecer pequenos fios de sentido

Pela primeira vez, Ani alcanca um espaco aberto: um jardim noturno com cerejeiras e lanternas. As manifestacoes deixam de ser apenas ameacadoras e passam a existir como presencas do passado. O jogo convida o jogador a parar, observar e aceitar o que nao pode ser retido.

Nesse ato surge **A Crianca**, figura associada a atencao plena e ao gesto simples.

### Ato V: O Limiar

**Referencia:** Yugen  
**Ideia central:** o misterio que nao cabe em palavras

O ato final acontece em um espaco aberto e indefinido, onde fragmentos dos atos coexistem. As mecanicas sao retiradas progressivamente ate restar apenas caminhar, observar e ouvir.

O encerramento e deliberadamente aberto. O jogo nao explica tudo, nao fecha todos os sentidos e nao entrega resposta definitiva sobre o destino de Ani.

## 5. Personagens

### Ani

- Homem de aproximadamente 32 anos
- Humano comum, sem poderes ou missao heroica
- Sua identidade e ponto de partida, nao recompensa final
- Visualmente comeca quase como silhueta e ganha presenca ao longo dos atos

### Personagens de Memoria

Esses personagens aparecem principalmente como ecos do passado e nao como companheiros estaveis no presente narrativo.

| Personagem | Tipo | Papel Narrativo |
| --- | --- | --- |
| Mae | Familia / memoria | Ancora emocional importante, ligada a protecao e sufocamento |
| Padrasto | Familia / memoria | Presenca pesada, associada a distorcao e opressao |
| Namorada | Familia / memoria | Memoria mais recente, ligada a fragilidade afetiva |
| Primo | Familia / memoria | Presenca leve em contraste com os momentos mais densos |

### Arquetipos

| Personagem | Papel |
| --- | --- |
| O Arquiteto | Manifestacao da contradicao irresoluvel do Ato II |
| A Ceramista | Manifestacao do Wabi-Sabi e da aceitacao das fendas |
| A Crianca | Manifestacao do Ikigai, da atencao e da presenca |

### Manifestacoes

As manifestacoes sao figuras sem rosto que refletem Ani. Elas nao funcionam como inimigos tradicionais. Em alguns momentos espelham, observam, sussurram ou intensificam crises emocionais.

## 6. Mecanicas

### Principio Central

**Ani** nao possui sistema de combate, sistema de moralidade, pontuacao ou arvore de escolhas com multiplos finais baseados em bom ou mau comportamento. As mecanicas existem para dar corpo as ideias do jogo.

### Mecanicas por Ato

#### Ato I: Peso Literal

Cada memoria tocada adiciona peso ao movimento de Ani. Ignorar o passado parece mais confortavel, mas impede o avanco.

#### Ato II: Ecos de Decisao

Ani revive certos momentos e pode tentar agir de outro modo, mas o resultado continua preso ao mesmo impasse. A mecanica comunica repeticao e contradicao.

#### Ato III: Restauracao por Aceitacao

Objetos quebrados podem ser restaurados, mas nunca apagando suas marcas. O gesto e de aceitacao, nao de retorno ao estado original.

#### Ato IV: Contemplacao Ativa

Parar diante de elementos especificos do cenario libera memoria, narracao e sentido. A observacao passa a ser uma forma central de interacao.

#### Ato V: Dissolucao das Mecanicas

As mecanicas do jogo sao progressivamente removidas ate restar apenas caminhar e contemplar.

### Exploracao e Diario de Memorias

Ani explora a casa e suas memorias interagindo com objetos significativos. Cartas, bilhetes, fotografias e fragmentos textuais ficam registrados em um diario de memorias com estetica manual.

O mesmo item pode adquirir nova leitura conforme os atos avancam. A mudanca esta menos no texto bruto e mais no contexto em que ele e reencontrado.

### Ansiedade e Respiracao

Crises de ansiedade continuam como uma das bases sensoriais do jogo.

- O ambiente se distorce
- O som se fragmenta
- As manifestacoes se multiplicam
- A respiracao de Ani se torna indicador importante do estado emocional

## 7. Interface

### Filosofia de UI

A interface deve ser quase invisivel. O jogo comunica estado por atmosfera, som, ritmo, distorcao e comportamento do cenario.

### Diretrizes

- Sem HUD permanente
- Sem barras numericas
- Icones discretos e rabiscados
- Diario de memorias acessivel como objeto diegetico
- A respiracao funciona como indicador sensorial recorrente

### Controles no PC

| Acao | Controle |
| --- | --- |
| Movimento | WASD ou setas |
| Interagir | E ou clique esquerdo |
| Diario de memorias | Tab |
| Contemplar | Sem botao dedicado; depende de parar e observar |

## 8. Audio

### Principio Sonoro

O audio acompanha a transicao filosofica do jogo: parte de um espaco abafado e claustrofobico e gradualmente se torna mais organico, silencioso e contemplativo. O silencio nao e ausencia de conteudo, mas parte da linguagem.

### Direcao por Ato

| Ato | Clima Sonoro | Elementos |
| --- | --- | --- |
| I | Peso e clausura | Silencio pesado, rangidos, passos ecoados, relogios que nao andam |
| II | Loop e distorcao | Repeticoes ligeiramente erradas, batimentos, ecos codificados |
| III | Textura e imperfeicao | Cordas imperfeitas, ceramica, madeira, presenca tatil dos sons |
| IV | Abertura e passagem | Flauta, vento, sino distante, queda de petalas e pausas longas |
| V | Imensidao e silencio | Sustentacao minima, espaco entre notas e sensacao de vazio |

### Vozes e Efeitos

- NPCs se comunicam principalmente por texto
- Crises de ansiedade usam sussurros humanos distorcidos
- Memorias felizes trazem sons urbanos suaves e papel sendo folheado
- Memorias traumaticas usam abafamento, ruido e silencio subito
- Interacoes materiais devem soar tateis, intimas e fisicas

## 9. Principais Caracteristicas

- Side-scroller narrativo contemplativo
- Progressao em cinco atos filosoficos
- Ausencia de combate e moralidade binaria
- Mundo mental simbolico e mutavel
- Mecanicas que nascem e desaparecem conforme o significado de cada ato
- Diario de memorias como elemento narrativo central
- Crises de ansiedade como recurso sensorial e dramatico
- Interface minimalista e diegetica
- Final unico, aberto e interpretativo

## 10. Especificacoes Tecnicas

### Base Tecnica

| Item | Direcao Atual |
| --- | --- |
| Engine | Unity |
| Linguagem | C# |
| Plataforma inicial | PC (Windows) |
| Estrutura visual | Side-scroller lateral com elementos 3D estilizados |
| Camera | Lateral fixa com zoom narrativo |
| Texturas | Estetica de desenho a mao, aquarela e grafite |
| Efeitos visuais | Distorcao emocional, vinheta dinamica e transicoes de cor por ato |

### Loop de Progressao

Cada ato segue um ciclo estrutural simples:

1. Explorar a casa e perceber o que mudou.
2. Encontrar a passagem para uma memoria ou regiao mental.
3. Atravessar a experiencia central do ato.
4. Retornar a casa e registrar o avanco no diario.
5. Abrir passagem para o ato seguinte.

## 11. Encerramento

**Ani** nao e um jogo sobre oferecer respostas definitivas. E um jogo sobre aprender a viver com perguntas, com rachaduras, com silencio e com aquilo que continua sem nome mesmo depois que a jornada termina.

## Referencias

[1] FULLERTON, Tracy. *Game Design Workshop: A Playcentric Approach to Creating Innovative Games*. 4. ed. Boca Raton: CRC Press, 2018.

[2] ADAMS, Ernest. *Fundamentals of Game Design*. 3. ed. Berkeley: New Riders, 2014.
