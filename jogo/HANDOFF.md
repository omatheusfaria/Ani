# Handoff — Ani (para continuar em outra sessão)

Última atualização: 07/11/2026. Repositório privado: https://github.com/omatheusfaria/Ani-Game (branch `main`).

## Em uma frase

Jogo web narrativo em **pixel art + cenários 3D (Three.js)**, no estilo de *Until Then*, feito em HTML/CSS/JS puro,
sem build. Roda em `http://localhost:5500` (`iniciar-servidor.sh` no Linux, `iniciar-servidor.bat` no Windows).

## Como o usuário gosta de trabalhar

- Conversa em **português**. Pede listas passo a passo quando ele precisa fazer algo.
- Tudo tem que **rodar no localhost** para ele testar; **nada de mandar ZIP**.
- Agora o código vive no **GitHub** e na pasta `Ani-Game` da Área de Trabalho do notebook (Ubuntu).
  Fluxo combinado: mudar → testar → commit/push → ele dá `git pull` (ou a sessão escreve direto na pasta, se o
  computador estiver ligado à conversa).
- Muito **"game feel"**: tudo fluido, com easing, sons, pequenos pulos/brilhos, UI de jogo (não de site).
- Ele testa e manda prints com feedback numerado. Corrigir com cuidado o que ele aponta (ex.: as mãos
  precisaram ser refeitas duas vezes).

## História e regras de roteiro (não quebrar)

- Protagonista: **Ani**, garota alternativa, chanel preto curto, moletom escuro, meia listrada, coturno.
- Ela stalkeia **Malu Ferraz** (`malu.ferraz`, mesma idade) no "Pixgram" (rede social fictícia).
  O perfil dela é `ani.zero`, sem nenhum post.
- **Ani é lésbica, mas isso NUNCA fica explícito nos diálogos.**
- **Anel de trevo** no polegar: tinha 2 folhas, ela arrancou uma; ficou só uma folha e uma rachadura.
  **Nunca é mencionado em diálogo.** (No potinho do criado-mudo há uma folhinha verde solta — também sem fala.)
- Datas: a tirinha da cabine de fotos e o recibo são de **12/10/25**. O show (banda fictícia MOTH) é **sáb 07 nov**.

## Fluxo do jogo até agora

1. **Menu** (`js/scenes/menu.js`): olho 3D que abre; opções refletidas na íris. Iniciar → olho pisca → corte direto
   para o celular.
2. **Celular** (primeira pessoa): notificação da Malu, perfil, posts, curtida sem querer, perfil vazio da Ani.
3. **Bateria acaba** depois das primeiras interações → "Não. Agora não." → "Cadê a porcaria do carregador?"
4. **Levantando** (cutscene em primeira pessoa, no escuro).
5. **Quarto em visão lateral** (diorama tipo Until Then): andar com A/D ou setas, `E` interage.
   Escuro → acha o interruptor (figurinha que brilha) → luz acende. Interações:
   - **Cortina**: abre/fecha animada; fechada, some o luar.
   - **Travesseiro**: ela vai até a cama, levanta o travesseiro branco, "Nem embaixo do travesseiro.", devolve.
   - **Estante / criado-mudo / mochila**: câmera voa para **primeira pessoa**; mouse olha, hover destaca, clique
     examina; no criado-mudo os **raios da luminária de plasma seguem o mouse**. `E`/`Esc`/botão direito voltam.
   - **Papéis no chão**: **plano zenital** (câmera no teto, Ani agachada vista de cima). Clicar num papel faz ele
     subir até a tela como **papel texturizado 3D** (não é modal HTML); mouse inclina; clique/Esc devolve.
   - Roupas e guarda-roupa: só falas. O guarda-roupa **não abre** (pedido do usuário: "por enquanto").
   - Depois de 2 lugares revistados aparece a dica: "Talvez... na gaveta da escrivaninha."
6. **Gaveta** (primeira pessoa): carregador + tirinha de fotos da Ani com a Malu → zoom contínuo até a foto
   ocupar a tela → **"CAPÍTULO 1 / UM ANO ANTES"**. É daqui que o jogo continua (próximo grande passo).

## Painel /admin

`http://localhost:5500/admin` — login com o usuário e a senha que o dono do projeto definiu (no código só existe o
hash SHA-256 de `usuário:senha`, em `admin/index.html`). Pula para: `menu, celular, perfil, bateria, levantar,
escuro, luz, gaveta, capitulo, estante, criado, mochila, papeis, travesseiro, cortina`
(atalho: `index.html?pular=<id>`, exige o login na mesma aba; tela "CLIQUE PARA COMEÇAR" libera o áudio).

## Arquitetura (onde mexer)

```
index.html              canvas#game + #ui (prompt, title, caption, subtitle, hint, interact, chapter, pause)
js/main.js              settings/save (localStorage), entrada, loop, ?pular do admin, window.game
js/engine/renderer.js   PixelRenderer: render em baixa resolução (360 linhas) + pós (bloom, aberração,
                        glitch, grão, vinheta, dithering Bayer, fade pontilhado). renderer.fx.* controla tudo
js/engine/tween.js      Tweens com Promises (to/wait/clear) + easings (ease.*), damp()
js/engine/audio.js      Sfx sintetizado via Web Audio (sem arquivos): step, rustle, cloth, rings, page,
                        zipper, pop, zap, whooshSoft, thump, hover, tap, etc. + ambientes 'menu'/'quarto'
js/engine/pixeltext.js  texto pixel nítido em canvas: FONTS {ui: Pixelify Sans, tiny: Tiny5}
js/engine/ui.js         say/sayWait (balão), interact(texto,x,y,tecla), hint, caption, chapter, pause
js/scenes/menu.js       o olho
js/scenes/quarto.js     a cena toda: modos phone → dying → standup → side → inspect/zen → drawer → photo
                        LINES (falas), INSPECT (poses de câmera), NIGHTSTAND, jumpTo (admin)
js/scenes/room.js       monta o quarto: texturas T.*, luzes, plasmaLamp(), gaveta, interactables, setCurtain,
                        setPlasmaTouch, update(t,dt)
js/scenes/furniture.js  móveis "macios" (RoundedBox): buildBed, buildNightstand, buildDesk, buildChair,
                        buildWardrobe, buildBookshelf (BOOKS com títulos/falas), buildBackpack, Curtain, setGlow
js/scenes/papers.js     ingressos, recibo, bilhete (canvas → textura, folha levemente curvada)
js/scenes/photostrip.js tirinha da cabine (sépia)
js/chars/ani.js         Ani lateral feita por código (quadros 0-3 parada, 4-11 andando, 12 alcançar,
                        13 pegar à frente, 14 segurar no alto; pose(n) trava um quadro) + AniTop (vista de cima)
js/phone/app.js         app Pixgram (telas lock/profile/post/me, bateria)
js/phone/posts.js       PROFILE (Malu), SELF (Ani), POSTS (pixel art procedural), POST_THOUGHTS
js/phone/hands.js       mãos segurando o celular, com o anel de trevo
assets/fonts            Pixelify Sans 400/700 + Tiny5 (OFL)
assets/sprites          gerados no Sprite Fusion; usados: protagonista_retrato.png, malu_retrato.png
```

Padrões importantes:
- Sequências async usam **token** (`const tok = ++this.token; ... if (tok !== this.token) return;`) para cancelar.
- Câmeras do quarto: `fpCam` (celular/levantar), `sideCam` (lateral: pos `(camX, 1.5, 3.35)`, olha
  `(camX, 0.98, -1.2)`, fov 44), `closeCam` (vistas de perto e zenital), `drawerCam`.
- Corredor onde ela anda: `lane.z = -0.72`, x de -2.45 a 2.72. Cada interactable tem `x` no corredor, `anchor`
  (balão) e `obj` (brilho ao chegar perto).
- **Texto pixel**: Pixelify fica nítida só a partir de 11–12 px; Tiny5 só em 8 px (sem negrito).
- Texturas pixel: `NearestFilter`, sem mipmap, `SRGBColorSpace`.

## Como testar sem jogar tudo

- Console (F12): `game.goTo('quarto', { jump: 'estante' })` (qualquer id do admin).
- Teste automatizado que funcionou bem: Chromium headless (Playwright) com
  `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, viewport 1280×720; é lento, então use os
  jumps acima e espere ~4–7 s antes do print. Para hover em 3D, projete o objeto (`v.project(q.camera)`) e mova
  o mouse 2–3 vezes, porque a câmera mexe com o mouse.

## Detalhes técnicos / pegadinhas

- Sprite Fusion (MCP `https://www.spritefusion.com/mcp`) está com **0 créditos**. Todo o resto é procedural.
- `servidor.py` manda `no-cache`, então F5 comum sempre pega a versão nova.
- Um 404 no console é só o favicon (não existe).
- Pequenos pontos conhecidos: o rosto da Ani de lado fica bem claro no escuro (o usuário não reclamou);
  no bilhete o acento de "saída" quase não aparece.
- Se o notebook já tinha um `iniciar-servidor.sh` próprio fora do Git, o `git pull` pode reclamar desse arquivo:
  renomeie o local antes de puxar (o do repositório usa `python3 servidor.py 5500` e abre o navegador).

## Próximos passos prováveis

- **Capítulo 1 — "um ano antes"**: começa da foto em tela cheia (`mode 'photo'` em `quarto.js`). Ainda não existe
  nada depois do card do capítulo. Combinar com o usuário onde/como começa (escola? o dia da cabine de fotos?).
- Guarda-roupa abrir (o usuário disse "não precisa abrir agora").
- Continuar (menu) já lê o save `ani:save`; definir o que salvar quando o Capítulo 1 existir.
