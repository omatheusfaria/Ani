# Ani

Pixel art + cenários 3D (Three.js), em HTML, CSS e JavaScript puro.

## Como rodar

- **Windows:** dois cliques em `iniciar-servidor.bat`.
- **Linux (Ubuntu) / macOS:** no terminal, dentro da pasta do jogo, rode `./iniciar-servidor.sh`.

Ele abre http://localhost:5500. Deixe a janela do servidor aberta enquanto joga. Depois de qualquer mudança no código, é só apertar **F5**.

## O que já existe

**Menu principal (`js/scenes/menu.js`)**
Um olho em 3D, fechado no começo. Ao apertar qualquer tecla, ele acorda: as pálpebras abrem com
hesitação, uma "tela" acende piscando na frente dele e as opções aparecem refletidas na íris.
O olho segue o mouse, pisca sozinho e dilata a pupila ao trocar de opção.
Ao escolher Iniciar, o olho pisca e o jogo corta direto para a tela do celular.
Opções: Iniciar, Continuar, Configurações (som, tamanho dos pixels, tela cheia) e Créditos.

**Cena 1: o quarto, 23:47 (`js/scenes/quarto.js`)**
1. **Celular (primeira pessoa):** notificação da Malu, perfil no "Pixgram", posts, curtida sem querer
   (clique duplo → pânico), perfil vazio da Ani.
2. **Bateria acaba:** depois das primeiras interações e das falas, aparece o aviso de 1% e o celular apaga.
3. **Levantando da cama:** cutscene em primeira pessoa, no escuro.
4. **Visão lateral (estilo Until Then):** a Ani anda pelo quarto escuro (`W A S D` / setas: para os lados e para frente e para trás), acha o
   interruptor (tem uma figurinha que brilha no escuro) e acende a luz (`E`). Aí dá para ver o quarto todo:
   pôsteres de bandas, estante de livros, luminária de plasma, guarda-roupa, ingressos no chão,
   discos, mochila, roupas... Cada coisa tem uma fala quando ela procura o carregador.
   Com a luz acesa, cada coisa tem uma interação própria:
   - **Cortina:** abre e fecha com o tecido balançando; fechada, o luar some do quarto.
   - **Cama:** ela vai até a cama, levanta o travesseiro e devolve.
   - **Estante, criado-mudo e mochila:** a câmera voa para a primeira pessoa. O mouse mexe a cabeça,
     passar o mouse destaca as coisas e clicar examina. No criado-mudo, os raios da luminária de
     plasma seguem o mouse. `E`/`Esc`/botão direito voltam.
   - **Papéis no chão:** câmera no teto (plano zenital), com a Ani agachada vista de cima.
     Clique num papel e ele vem até a tela como papel de verdade; o mouse inclina. Clique de novo para devolver.
   - Chegando perto de um objeto, ele brilha de leve.
5. **Gaveta (primeira pessoa):** a gaveta da escrivaninha abre, ela acha o carregador e a tirinha de
   fotos de cabine dela com a Malu. A câmera dá um zoom contínuo até a última foto ocupar a tela.
6. **O flash:** com a foto em tela cheia, o flash da cabine carrega e estoura a tela de branco —
   e o jogo vai para a noite em que a foto foi tirada.

**Capítulo 1: o parque, um ano antes (`js/scenes/parque.js`)**
1. **Saindo da cabine:** o branco do flash assenta e vira a noite do parque (domingo, 12 de outubro, 19:42).
   Cartão do capítulo, faixas de cinema, a câmera recua e revela o parque. A máquina imprime a tirinha,
   a cortina abre e a Malu e a Ani saem. A conversa é em **balões pretos em cima da cabeça**; termina
   com a narração "Eu guardei." na caixa de baixo.
2. **Rua das barracas (livre):** pipoca, algodão-doce, pescaria (patinhos girando), cabine de fotos, argola,
   estoure o balão (os balões estouram sozinhos de vez em quando), derrube as latas, churros & maçã do amor e
   a bilheteria da roda-gigante. Ao fundo: carrossel girando, lona de circo, quiosques, gente passando,
   a roda-gigante com lâmpadas em onda, árvores, a cidade, estrelas e a lua. A Malu acompanha a Ani e
   comenta algumas barracas.
3. **Bilheteria:** a câmera sobe até a roda-gigante e o capítulo "continua".

Luz do parque (`js/scenes/parkfx.js`): halo de cada lâmpada na névoa calculado de forma exata (liso, sem
serrilhado), névoa de profundidade, desfoque no fundo (as lâmpadas longe viram bolinhas) e partículas
(mariposas nas lâmpadas, poeira, vapor das barracas). Som: murmúrio de gente e uma valsa de realejo ao longe.

`Esc` volta no app ou abre a pausa.

**Controle de Xbox:** funciona em tudo, sem configurar. Analógico esquerdo anda (pouco inclinado = passo lento),
`A` interage/confirma, `B` volta, `Menu` pausa. Não tem cursor: no celular, na estante, no criado-mudo, na mochila
e nos papéis o direcional (ou o analógico) troca o item escolhido, como no menu; `A` usa (2× `A` curte) e o
analógico direito rola o feed. No plasma, `A` faz os raios seguirem o analógico. As dicas de botões aparecem só
no quarto, uma vez, como tutorial. Tela cheia pelo controle: o navegador exige um clique ou `F11`.

## Estrutura

```
index.html              página
css/style.css           interface em HTML (balões, dicas, pausa) e fontes
js/main.js              inicia o jogo, entrada (mouse/teclado), loop, save
js/engine/renderer.js   renderização pixelada + pós-processamento (bloom, glitch, dithering)
js/engine/audio.js      sons sintetizados (sem arquivos de áudio)
js/engine/tween.js      animações e easings
js/engine/pixeltext.js  texto pixel art nítido dentro de canvas
js/engine/ui.js         balões de pensamento, dicas, pausa
js/scenes/menu.js       menu do olho
js/scenes/quarto.js     cena do quarto + celular
js/scenes/room.js       o quarto: monta tudo, luzes, luminária de plasma, gaveta, interações
js/scenes/furniture.js  móveis (cama, criado-mudo, escrivaninha, guarda-roupa, estante, cortina, mochila)
js/scenes/papers.js     ingressos, recibo e bilhete (papéis texturizados)
js/scenes/cinema.js     luz de cinema do quarto (feixes de luar, cone do lustre, poeira)
js/scenes/parque.js     Capítulo 1: o parque (cutscene da cabine, conversa, andar livre, final)
js/scenes/park.js       o parque: barracas, jogos, roda-gigante, carrossel, céu, gente, lâmpadas
js/scenes/parkfx.js     luz de cinema do parque (halos na névoa, profundidade de campo, partículas)
js/phone/app.js         o app de rede social
js/phone/posts.js       fotos dos posts (pixel art procedural), legendas e pensamentos
js/phone/hands.js       mãos segurando o celular (com o anel de trevo)
js/chars/ani.js         Ani e Malu andando (ani-andando.png / malu-andando.png, feitos de ani-direita.png e malu-direita.png) + Ani vista de cima
js/scenes/photostrip.js tirinha de fotos de cabine
assets/sprites/         sprites gerados no Sprite Fusion (tag "ani-game"); o jogo usa
                        protagonista_retrato.png e malu_retrato.png
assets/fonts/           Pixelify Sans e Tiny5 (licença OFL)
```

## Editar textos rápido

- Perfis, nomes e posts: `js/phone/posts.js` (`PROFILE` = Malu, `SELF` = Ani, `POSTS`, `POST_THOUGHTS`).
- Pensamentos no celular: `js/scenes/quarto.js`, função `onAppEvent`.
- Falas ao procurar o carregador: `js/scenes/quarto.js`, objeto `LINES` (e `NIGHTSTAND`).
- Livros da estante: `js/scenes/furniture.js`, lista `BOOKS`. Coisas da mochila: `buildBackpack`.
- Textos dos papéis: `js/scenes/papers.js`.
- Opções e créditos do menu: `js/scenes/menu.js`, função `buildItems`.
- Título no canto do menu: `index.html` (`<div id="title">`).

## Painel /admin (pular para qualquer parte)

Abra http://localhost:5500/admin, entre com o usuário e a senha combinados e escolha onde começar:
menu, celular, perfil da Malu, bateria acabando, levantando da cama, quarto no escuro, quarto com luz,
gaveta ou o Capítulo 1. Também dá para cair direto em cada detalhe do quarto: estante, criado-mudo,
mochila, papéis no chão, travesseiro e cortina. Também tem um botão para apagar o save.
O login dura até fechar a aba. Obs.: é uma proteção simples, só para organizar; o jogo roda todo no navegador.

## Iluminação de cinema (quarto)

Em `js/scenes/cinema.js` e no `js/engine/renderer.js`:

- **Feixes de luar volumétricos** entrando pela janela na diagonal, com os caixilhos, as cortinas
  (fechar a cortina corta o feixe), estrias de raio e poeira se mexendo no ar.
- **Recorte da janela** projetado no chão, no tapete e nela.
- **A Ani faz sombra de verdade**: a silhueta do sprite bloqueia o luar (no chão e dentro do feixe)
  e a luz do lustre (a sombra gira conforme ela anda).
- **Cone de luz quente** do lustre quando a luz está acesa, e grãos de poeira que só brilham dentro
  da luz e abrem caminho quando ela passa.
- **Bloom largo**, **gradação de cor** por estado (escuro: índigo/prata; aceso: âmbar) e o
  **olho se adaptando**: ao acender a imagem estoura e assenta; ao apagar escurece e vai abrindo.
- As nuvens passam na frente da lua (o luar "respira" devagar).

Ajustes rápidos em `QuartoScene.updateCinema()` (quarto.js) e `beamGain` em `room.js`.

## Diálogos (estilo Until Then)

- **Caixa embaixo**, para interação com cenário/objetos e pensamentos: `ui.say('Texto', { hold: 2 })`
  (ou `await ui.sayWait(...)` para encadear falas).
- **Balão em cima da cabeça**, para conversa entre personagens. Na cena do quarto:
  `await this.speak('Texto')` fala pela Ani; para outro personagem passe o mesh dele:
  `await this.speak('Oi!', { who: malu.mesh, id: 'malu' })`. Cada `id` tem o próprio balão,
  que acompanha o personagem na tela.
- Letra: Patrick Hand (licença OFL, em `assets/fonts/`).

## Dicas de teste

No console do navegador (F12), `game.goTo('quarto')` pula direto para o celular.
Pular direto para a visão lateral: `const q = game.scenes.quarto; q.token++; q.tweens.clear(); q.phoneRig.visible = false; game.renderer.fx.fade = 0; q.enterSide()`.
Para apagar o save: `localStorage.removeItem('ani:save')`.

## Novidades do parque (Capítulo 1)

- **Comprar e comer:** algodão-doce (a Malu paga), pipoca e churros/maçã do amor. O item vai para a mão
  de cada uma e acaba aos poucos, mordida a mordida.
- **Minigames:** *Estoure o balão* (dardos, a mira balança; a Malu joga depois), *Derrube as latas*
  (segure para dar força e solte na faixa verde) e *Pescaria* (desça o anzol quando a argolinha passar).
  Mouse, teclado ou controle.
- **Final:** a volta na roda-gigante, com closes, a roda parando no alto e a cidade inteira acesa.
- **Falas:** clique para completar o texto; clique de novo para pular.
- **Celular:** a interface do app é nítida como um app de verdade; só as fotos são pixeladas.
