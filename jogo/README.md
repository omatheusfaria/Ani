# Ani

Pixel art + cenários 3D (Three.js), em HTML, CSS e JavaScript puro.

## Como rodar

Dê dois cliques em `iniciar-servidor.bat`. Ele abre http://localhost:5500.
Deixe a janela preta aberta enquanto joga. Depois de qualquer mudança no código, é só apertar **F5**.

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
4. **Visão lateral (estilo Until Then):** a Ani anda pelo quarto escuro (`A D` / setas), acha o
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
6. **Capítulo 1 — um ano antes:** é daqui que o jogo continua.

`Esc` volta no app ou abre a pausa.

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
js/phone/app.js         o app de rede social
js/phone/posts.js       fotos dos posts (pixel art procedural), legendas e pensamentos
js/phone/hands.js       mãos segurando o celular (com o anel de trevo)
js/chars/ani.js         a Ani de lado, andando (pixel art feita por código)
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

## Dicas de teste

No console do navegador (F12), `game.goTo('quarto')` pula direto para o celular.
Pular direto para a visão lateral: `const q = game.scenes.quarto; q.token++; q.tweens.clear(); q.phoneRig.visible = false; game.renderer.fx.fade = 0; q.enterSide()`.
Para apagar o save: `localStorage.removeItem('ani:save')`.
