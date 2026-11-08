# Handoff — Ani-Game (TG Fatec)

Atualizado em 07/11/2026. Leia este arquivo inteiro antes de mexer no projeto.

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
- Git: as mudanças das últimas sessões estão **só no disco do notebook**, sem commit e sem push.
  Não faça commit nem push sem ele pedir.

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
                          intro: flash → cartão → grua → tirinha → cortina → conversa em balões pretos
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
