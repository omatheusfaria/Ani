# Handoff — Ani-Game (TG Fatec)

Atualizado em 08/11/2026. Leia este arquivo inteiro antes de mexer no projeto.

## Sessão de 08/11 (feita no PC Windows) — LEIA PRIMEIRO

Neste dia o usuário trabalhou no PC Windows (`D:\Usuários\Desktop\Ani Game`). Tudo abaixo foi gravado
lá e **não tem commit**. No notebook, essas mudanças chegam pelo pacote `ani-game-mudancas-08-11.zip`
(extrair por cima da pasta do projeto, mantendo os caminhos). Antes de editar, confira se estão no
notebook, por exemplo procurando `addFoods` em `js/chars/ani.js` e `phonePause` em `js/engine/ui.js`.

Feito e aprovado pelo usuário:
1. **Interruptor do quarto** (`ani-interruptor-quadros.png`): animação da Ani apertando, apagar/acender
   a luz, tecla 3D basculante com mola (room.js `setSwitch`, quarto.js `SWITCH_SPOT`).
2. **Pausa no parque com o celular**: ESC → a Ani tira o celular do bolso e mexe (clip `celular` com
   seq/loop/out e camada de brilho aditiva); câmera chega em plano médio, DOF, luz fria da tela.
   O menu abre **na tela de um celular à esquerda, estilo app de Ajustes** (o usuário NÃO quer chat):
   Continuar, Som (barra), Pixels (‹ ›), Tela cheia (chave), Menu principal. ←→ ajustam (ui.pauseAdjust).
   A pausa congela roteiro, falas, minigame e roda-gigante.
3. **Comidas desenhadas nos sprites** (parque): pegar no balcão (x-pegando-x) e comer parada/andando
   (x-parada-x / x-andando-x), 4 estágios contínuos entre parada e andando. Ver parkfood.js abaixo.
4. **Rosto da Ani com a maçã**: o sorrisão foi trocado pelo rosto calmo como na pipoca
   (tools/ajustar-rosto-maca.py, parada e andando).

## Sessão de 08/11 à noite (notebook, pela ponte) — cena da tirinha

Feito (falta o usuário aprovar no jogo):
5. **Cena da tirinha com `assets/sprites/cena-cabine.png`**: a folha tem as duas na mesma célula.
   `tools/recortar-cena-dupla.py cena-cabine.png ani-cabine-quadros.png malu-cabine-quadros.png [previa.png]`
   separa as duas por uma "costura" (programação dinâmica entre as pernas), devolve para a Malu os fios
   laranja que caíram do lado da Ani (só o que fica ligado ao corpo dela: as fotinhas da tirinha também
   têm laranja), costura de volta pé/mão que passou da borda da célula e grava uma folha 6×4 de célula
   própria para cada (ANI_CABINE / MALU_CABINE em ani.js; quadros comentados lá).
   No `intro()` (parque.js): as duas saem da cabine andando para a direita (`Actor.lock` = anda virada
   para um lado), a Ani para, a Malu chega na fenda (B.slot), pega (evento 'pega': some a tirinha 3D,
   `sfx.page`), ri das fotos, vira, volta e entrega; a Ani fica com a tirinha DESENHADA na mão até o
   "Eu guardei." (não usa mais `stripHolder`/`pose(14)` nessa cena). As falas são as mesmas.
   API nova do WalkSprite: `addSheetClip(nome, def)` e `play(nome, { seq, loop, hold })` — hold segura o
   último quadro (a promessa resolve) até o próximo play()/stopClip(). `def.left` = quadros desenhados
   virados para a esquerda (não espelha quando ela olha para a esquerda). Na pausa em cena as
   animações de cena congelam (`clipPaused`); o celular da pausa continua mexendo.
6. **Abertura do quarto (celular)**: o celular ficava longe/minúsculo porque a distância era
   "1 px da tela = 1 px do jogo" com `renderer.h`, que muda com a janela (janela de 647 px + PEQUENOS
   → escala 1 → h = 647 → celular a 1,7 m, atrás da beira da cama). Agora: tela ocupa PHONE_FILL (0,66)
   da altura em qualquer janela/resolução (a interface é nítida, não precisa de 1:1) e o aparelho tem
   tamanho real (phoneRig.scale = PHONE_K 0,24) a ~23 cm do rosto. Câmera FP_EYE encostada nos
   travesseiros olhando por cima do edredom; o "levantar" sai dali para a beira da cama.
   Mão = sprite `mao-celular-quadros.png` (`tools/recortar-mao-celular.py mao-celular.png saida.png
   [previa.png]`): tira a tela preta e a moldura desenhadas, alinha os quadros pela tela, devolve o
   contorno do polegar e continua a manga para fora da célula (o corte fica fora da tela). O modelo 3D
   (moldura do tamanho da desenhada) fica atrás; o polegar fica no passe pixelado por cima da tela HD.
   Polegar: HAND_TAP no toque, HAND_SWIPES no scroll-tick, HAND_IDLE de vez em quando.
   `js/phone/hands.js` (mãos antigas em canvas) não é mais usado.
7. **Boca falando** (`ani-conversando` / `malu-conversando`, recortadas com `tools/recortar-comida.py`,
   que agora acha as células pelos vãos quando a folha não é 6×4 de 256): ANI_TALK / MALU_TALK em
   ani.js. `parque.say()` chama talkStart → a boca abre/fecha no ritmo das letras do balão
   (ui.bubble ganhou `onChar`/`onTyped`) e fecha na pontuação; falas ≥ 38 letras podem usar o gesto de
   mão; a Malu às vezes termina com o sorrisinho (16). Só fala com a folha se estiver parada e de mãos
   livres (comendo, andando ou em clip de cena fica como está). Corrigido: `play(..., {hold})` não
   segurava o quadro se um quadro lento pulasse o trecho inteiro.
8. **Travesseiro** (`ani-travesseiro.png` → `ani-travesseiro-quadros.png` com
   `tools/recortar-comida.py ani ... --sem-branco --apagar-soltos=0,1,2,3,22,23 --medir=9,16`):
   o travesseiro da cabeceira virou sprite (`travesseiro.png` → `travesseiro-quadro.png` por
   `tools/recortar-objeto.py entrada saida 89`, mesmo tamanho do desenhado na folha), tingido com o
   preenchimento da Ani (FILL_DARK/LIT) e brilho de interação na cor; o 3D (`room.pillow`) fica
   escondido. `liftPillow`: anda até a beira, estica o corpo (0–3), o travesseiro voa da cama até
   `ani.clipPoint('travesseiro', ...grab)` e no quadro 9 vira o desenhado; abraça (10–14, olhos
   fechados) com "Nem embaixo do travesseiro."; 15→16 abaixa, o travesseiro volta voando de `drop`
   para a cama e ela se endireita (3→0). Os quadros agachada até o chão (4–8, 17–21) não são usados.
   Novo no WalkSprite: `clipTexel(nome)` e `clipPoint(nome, dxPx, dyPx)` (ponto desenhado → mundo).
9. **Boca na cena da cabine**: lá elas seguram poses da folha da cabine (a Malu com a tirinha), então
   a folha de conversa não serve. `tools/boca-aberta.py folha FW FH saida quadro:x,y ... [previa]`
   acha a linha da boca perto do ponto e desenha uma boca aberta (3×2 em rosto miúdo, 5×3 normal) numa
   5ª linha da folha. ani/malu-cabine-quadros.png agora têm ROWS: 5 e `mouth` (pose → boca aberta).
   A fala tem o modo 'boca': com uma pose de cena que tem `mouth`, alterna pose/boca aberta sem sair
   da pose (canTalk devolve 'fala' | 'boca' | false). `sheetClip` aceita `def.ROWS`.
10. **Final da roda-gigante com `cena-final.png`**: as costas das duas (antes em canvas, com a Malu
   "encostando" por rotação) viraram um sprite só da folha, recortada por
   `tools/recortar-cena-costas.py cena-final.png cena-final-quadros.png [previa]` (acha os quadros pelos
   vãos — na folha eles não batem com a grade de 256 —, alinha pela cintura, contorno de luz quente à
   direita/frio à esquerda). wheelride.js: BACK_IDLE (0–1–2–1) → na hora de encostar BACK_LEAN (4 vira,
   6 olha a Ani, 7–10 inclina, 12–16 se aninha) → BACK_REST (18–22, respirando). Quadros 5, 11, 17 e 23
   vêm cortados na borda direita da folha original: não usar (ou pedir a folha de novo).
11. **GitHub Actions → GitHub Pages** (`.github/workflows/publicar.yml`): a cada push no main confere a
   sintaxe dos .js (node --check) e das ferramentas Python e publica index.html, admin/, css/, js/ e
   assets/ no Pages. Precisa uma vez: Settings → Pages → Source: "GitHub Actions". O link fica
   https://omatheusfaria.github.io/Ani-Game/ (o /admin funciona: o login é só no navegador).

Pendências:
- Travesseiro: feito pela leitura "pegar da cama" (o usuário não respondeu a encenação; se ele quiser
  o travesseiro no chão como na folha, dá para usar os quadros 4–8 / 17–21 que ficaram de fora).
- Commit/push só quando ele pedir.

## O projeto

Jogo narrativo em pixel art com cenários 3D (Three.js 0.170, HTML/CSS/JS puro, sem build).
Referência de estilo: **Until Then** (visão lateral, diálogos em caixa embaixo e balões em cima da cabeça,
luz de cinema). Repositório: `omatheusfaria/Ani-Game`.

Pasta no notebook do usuário (Ubuntu): `/home/fridhum/Área de trabalho/Ani-Game`.
O usuário roda o servidor com `./iniciar-servidor.sh` (http://localhost:5500) e testa com F5.

## Como trabalhar com o usuário

- **Responder em português.** Comentários do código também em português.
- Ele pede sempre "game feel", "motion", "iluminação cinematográfica suave" e "game UI design".
  Mostre o resultado com prints e GIFs, sem relatório longo.
- Acesso ao computador: só **ler e gravar arquivos** na pasta do projeto, pela ponte do app desktop.
  Não há terminal no notebook. Ele mesmo roda os comandos.
- Ele **recusou** acesso a `~/TG`. Peça só a pasta mínima necessária.
- Fluxo seguro:
  1. Copiar os arquivos do notebook para a sessão (stage).
  2. Editar e testar a cópia local.
  3. Gravar de volta usando o `mtime` esperado, para não apagar edições dele.
  4. Puxar de novo e comparar (`cmp`).
  - Nota: PNG pode voltar re-codificado. Compare os pixels, não os bytes.
- Git: as mudanças das últimas sessões estão **sem commit e sem push** (as de 08/11 vieram do Windows
  pelo zip). Não faça commit nem push sem ele pedir.
- No PC Windows a ponte tinha um shell (VM Linux, pasta em `$HOME/mnt/<pasta>`); no notebook pode não ter.
- Ferramentas de sprite (Python + numpy + Pillow), rodam no computador dele:
  - `tools/recortar-folha.py`: folhas do Sprite Fusion → tira de células 168×246 (ani-interruptor, ani-celular).
  - `tools/separar-brilho.py`: separa o brilho da tela do celular do corpo.
  - `tools/recortar-comida.py ani|malu entrada.png saida-quadros.png`: grade 6×4 com célula própria.
  - `tools/ajustar-rosto-maca.py`: rodar depois de recortar as folhas da maçã da Ani.
  - `tools/recortar-cena-dupla.py`: folha de cena com as duas na mesma célula → uma folha para cada.

## Testes (na sessão em nuvem)

- Copie o projeto para uma pasta local e crie um `test.html`.
  - É o `index.html` com o import map apontando para `/node_modules/three/build/three.module.js` e `/node_modules/three/examples/jsm/`.
  - Instale com `npm i three@0.170.0`.
- Playwright + Chrome com SwiftShader:
  - Flags: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
  - É bem lento: ~2 s por print, e a cutscene inteira do parque leva ~7 min de relógio.
  - Servidor: `python3 -m http.server`.
- Para pular para uma parte, use `game.goTo('quarto' | 'parque', { jump: '...' })`.
  - No jogo real: `index.html?pular=<id>`, com login feito no `/admin`.
- GIF com tempo controlado: substitua `scene.update` por um passo manual (`window.__step(dt)`) e tire um print por quadro.
- `node --check` em todos os `.js` antes de gravar.
- Controle falso para testes: no `addInitScript`, troque `navigator.getGamepads` por um objeto com
  `mapping: 'standard'`, `axes[4]`, `buttons[17]` e `vibrationActuator.playEffect`, e dispare `gamepadconnected`.
  Para GIF com tempo controlado, troque também o `requestAnimationFrame` por uma fila manual.

## Arquitetura (o que importa)

```
js/main.js              cenas: menu, quarto, parque; atalhos ?pular= (ids 'parque*' vão para o parque)
js/engine/renderer.js   pixel art (360 linhas), cadeia de pós:
                          cena → lightPass da cena (opcional: {volume, composite})
                          → bloom largo → final (gradação, exposição, vinheta, granulado, dithering)
                        passe nítido opcional (scene.userData.hd = { layer, active }): a camada é desenhada de
                          novo em resolução cheia por cima do pixel art (a tela do celular). Onde o passe
                          pixelado grava alfa < 0.5 (PixelRenderer.markHD) o nítido aparece; o dedo fica pixelado
                        fx.* controlados pelas cenas, incluindo:
                          flash (branco liso) e flashColor
                          bars (faixas de cinema)
                          fade/fadeColor (dissolução pontilhada)
js/engine/ui.js         ui.say (caixa embaixo), ui.bubble/bubbleWait (balão com anchor por quadro),
                        ui.caption, ui.chapter, ui.hint, ui.interact, ui.pause (setas/direcional + Enter/A),
                        ui.toast, ui.cursor (cursor do controle), ui.setInputMode('kb' | 'pad')
js/engine/gamepad.js    controle de Xbox (Gamepad API). Vira as entradas que as cenas já entendem:
                          botões/direcional → teclas falsas (A=Enter, B=Backspace, Menu/Exibir=Escape, setas)
                          por cena, padMode(): 'walk' (analógico anda: game.pad.move()), 'select' (setas trocam o
                          item + direito rola), 'look'/'look-rs' (mexe game.mouse), null (setas). onPad(btn) = botão
                          do seu jeito. Eventos falsos vêm com e.pad = true.
                          SEM CURSOR (pedido do usuário): celular, estante, criado, mochila e papéis escolhem item
                          com direcional/analógico, igual ao menu (quarto.padKey + spatialPick; app.padNav/padPress
                          com moldura de foco que desliza). Plasma: escolher + A = os raios seguem o analógico; A/B solta.
                          vibração: alguns sons (flash, impacto, notify...) também tremem o controle
                          desconectar no meio do jogo abre a pausa
js/engine/glyphs.js     ícones dos botões. As cenas escrevem as dicas como teclado ('<b>E</b> INTERAGIR');
                        no modo controle a UI troca por botões (padHint/padKey/padPrompt)
                        Dicas = TUTORIAL (pedido do usuário): só no quarto (ui.setHintScope('quarto')), cada dica
                        uma vez por sessão (teclado e controle contam separado) e some sozinha. Nunca no parque,
                        no menu ou na pausa.
                        Tela cheia: o navegador não aceita botão de controle como gesto; o menu avisa
                        "USE F11 OU CLIQUE" e o próximo clique/tecla entra (game.wantFullscreen)
js/engine/audio.js      sons sintetizados (Web Audio)
                        ambient('menu' | 'quarto' | 'parque')
                          'parque' = murmúrio + valsa de realejo com agendamento
                        efeitos: flash(), flashCharge(), printer(), balloonPop()
js/chars/ani.js         WalkSprite(cfg) genérico
                          ANI_SPRITE: ani-andando.png
                          MALU_SPRITE: malu-andando.png, 13 quadros = 10 de passo + parada, meio-piscar, piscar
                        setFill / setRim / reach / pose(13|14)
                        vira seco (sem animação de virada)
                        Animações extras (ANI_CLIPS): addClip / play(nome, {onEvent}) → Promise / stopClip.
                          Troca a textura do material só enquanto toca; eventos marcados na seq ('press').
                          interruptor: ani-interruptor-quadros.png (24 quadros, mesma célula 168×246)
                          celular: ani-celular-quadros.png + ani-celular-brilho.png (o cone de luz da
                            tela separado por tools/separar-brilho.py, desenhado como camada aditiva)
                          Clip com loop/out: seq → 'loop' (repete) → release() toca o 'out'.
                          Folhas novas do Sprite Fusion (6×4 de 256 px): tools/recortar-folha.py
                          entrada.png saida.png [previa.png] → binariza o alfa e alinha pelos pés
js/phone/app.js         app "Pixgram". Interface NÍTIDA de app de verdade (canvas 4×, fonte do sistema, ícones
                        vetoriais); só as fotos (posts, avatares, papel de parede) são pixeladas. Coordenadas e
                        hits continuam em 132×276. Celular desligado: reflexo do rosto da Ani (makeReflection)
js/scenes/quarto.js     Cena 1 (23:47), em etapas:
                          celular → bateria → levantar → visão lateral (WASD) → gaveta → zoom na foto
                          → FLASH → goTo('parque')
                        Interruptor: useSwitch() anda até SWITCH_SPOT (2.385, −0.3), toca o clip e, no quadro
                          'press', vira a tecla (room.setSwitch) e acende/apaga (lightsOn/lightsOff). Dá para
                          apagar de novo; a fala do carregador só sai na 1ª vez. A tecla é basculante com mola.
                        em 1ª pessoa o feixe de luar é atenuado (fpVolK)
js/scenes/cinema.js     luz do quarto: luar volumétrico em meia resolução + blur, cone do lustre,
                        sombra da Ani (sprite), poeira
js/scenes/parque.js     Capítulo 1 (ParkScene)
                          intro: flash → cartão → grua → tirinha → cortina → cena da cabine (folhas ANI/MALU_CABINE)
                                 → conversa em balões pretos
                                 → "Eu guardei."
                          startFree: andar livre, a Malu segue
                          interact: falas por barraca e resposta da Malu
                          ending: bilheteria → grua até a roda-gigante → "CONTINUA"
                        Actor (walkTo com arrive/aceleração)
                        rig de câmera: follow 'ani' | 'duas' | 'close', ou alvo livre com lambda
                        "rebatedor" (PointLight que segue as duas)
                        Pausa (ESC / MENU): pausa de verdade em qualquer modo (tweens, personagens,
                          minigame e roda congelam; o parque segue vivo ao fundo). Andando livre, a Ani
                          vira para a esquerda e toca o clip 'celular' (tira do bolso → fica rolando a tela
                          em loop → release() guarda); câmera em plano médio com ela no terço da direita,
                          fundo desfocado (uDof/uFocus) e phoneLight fria no rosto (segue ani.glowK).
                          O menu abre na tela do celular, à esquerda, como o app de Ajustes:
                          ui.pause(opções, { phone: PHONE_INFO }). Opções com kind 'link' | 'toggle' |
                          'slider' | 'choice' (Continuar, Som, Pixels, Tela cheia, Menu principal);
                          ←→ ajustam (ui.pauseAdjust), destaque desliza entre as linhas (.ph-cursor).
                          PIXEL_OPTIONS vem de menu.js (mesmos valores das Configurações).
js/scenes/park.js       monta o parque
                          Kit: geometria estática fundida com cor por vértice; 1 malha acesa + 1 que brilha
                            + grupos por material (o.mat): madeira com veio (woodMat/boardMat, kit.tbox com UV
                            em metros), frente de balcão pintada (panelMat). Rotação com o.order ('YXZ')
                          barracas: colunas torneadas, toldo curvo com franja e luzinhas (awningPro, fairy),
                            placas em arco (topSign), lanternas (stallLight); pipoca é carrinho com rodas de raio
                          Bulbs: lâmpadas instanciadas com padrões steady/chase/twinkle/wave/blink/slow
                          sign(): placas em canvas, ~80 px por metro (mais que isso as letras quebram)
                        LANE: x -11.6..16.6, z -0.95..0.35. Frente das barracas: z = -1.55
                        x das barracas: pipoca -10.6 · algodão -7.6 · pescaria -4.3 · CABINE 0 · argola 3.6
                                        · balões 6.9 · latas 10.2 · churros 13.4 · bilheteria 16.4
                        fundo: carrossel (-6.6, -9.2) · circo (3.4, -13) · roda-gigante (12.6, hub y 8.6, z -17.5)
                               · árvores z -38 · cidade z -95 · céu em shader (estrelas, nuvens, lua)
js/scenes/parkfood.js   comidas (algodão-doce, pipoca, churros, maçã do amor). Quem tem a comida desenhada
                        (ANI_FOOD / MALU_FOOD em ani.js) pega no balcão com a folha x-pegando-x (o modelo 3D só
                        voa até a mão e some no quadro 'pega') e come pelo sprite: folhas x-parada-x / x-andando-x,
                        4 linhas = 4 estágios. O estágio é comum às duas folhas (WalkSprite.food.level): parada
                        ela morde e segura; andando belisca no passo; o tempo de cada estágio vale nas duas.
                        Sem folha: modelo 3D na mão com mordidas (Snacks). A Malu rouba um pedaço do algodão
                        da Ani (skipBite pula um estágio). Em cena/pausa: eatBusy segura sem morder.
                        Folhas recortadas com tools/recortar-comida.py (grade 6×4, célula própria, H = altura).
                        Maçã da Ani: depois de recortar, rodar tools/ajustar-rosto-maca.py (tira o sorrisão:
                        cabeça do quadro neutro, olhos fechados num traço como na pipoca).
js/scenes/minigames.js  3 minigames com HUD próprio (retratos com placar, munição, força, tempo, miras):
                          baloes (dardos, mira que balança, Malu joga depois), latas (força + física),
                          pescaria (anzol na hora em que a argolinha passa, 25 s). padMode 'aim' no controle
js/scenes/wheelride.js  final do Capítulo 1: volta na roda-gigante. Cabine detalhada pendurada na gôndola 0
                        (na frente dos aros), closes alternados, a roda para no alto, plano de costas
                        (sprites de costas em canvas) com a cidade acesa, estrela cadente, "CONTINUA"
js/scenes/parkfx.js     passe composite do parque:
                          halos analíticos de até 24 luzes na névoa (addGlow)
                          névoa de profundidade
                          desfoque de fundo (DOF)
                        partículas (addPoints): mariposas, poeira, vapor
admin/index.html        atalhos; grupo "CAPÍTULO 1 · O PARQUE" (parque, parque-livre, parque-roda)
```

## História / continuidade

- Ani: protagonista, roupa preta (precisa de mais preenchimento de luz).
  Malu Ferraz: "fotografia e mar · rio de janeiro".
- Presente: Ani stalkeia o perfil da Malu às 23:47, curte uma foto sem querer e o celular morre.
  Acha a tirinha da cabine na gaveta.
- Tirinha: data **12.10.25** (domingo, Dia das Crianças). Recibo: "outubro do ano passado".
  Ingressos de um show de **março**, nunca usados (gancho futuro).
- Capítulo 1: no parque, um ano antes. A Malu disse "Eu pago o algodão-doce, você paga a roda-gigante".
  Termina na roda-gigante: a Malu convida para o show de março (MOTH), "Eu compro os ingressos",
  a Ani promete. Lá no alto, de costas, vendo a cidade. Narração: "Eu nunca fui naquele show."
  (os ingressos nunca usados da gaveta). Próximo: Capítulo 2 / volta ao presente.
- Livros na estante: paródias sérias ("Um pedaço" = One Piece etc.). Datas sempre antigas (6+ meses).

## Pendências e ideias

- **Desempenho em GPU real ainda não confirmado.** Se cair FPS:
  - reduzir lâmpadas (Bulbs) e as amostras do DOF;
  - reduzir o número de glows (MAX_GLOWS = 24; hoje usa 23).
- Falas: clique (ou Enter/A em cena) completa o texto; segundo clique pula para a próxima.
- Com a pausa aberta as falas esperam (ui.nap respeita ui.pauseOpen), também no quarto.
- O save e o "Continuar" do menu ainda não levam ao parque.
- Os balões ancoram no topo da placa do sprite (Box3), não exatamente na cabeça.
- A cutscene do parque não tem um botão de pular a cena inteira (só as falas).
- Atalhos novos no /admin: parque-gondola (direto para a roda-gigante).
