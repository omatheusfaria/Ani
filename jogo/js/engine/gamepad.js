// Controle de Xbox (Gamepad API, mapeamento "standard" do navegador).
//
// A ideia é não mexer na lógica das cenas: o controle vira as mesmas
// entradas que elas já entendem.
//   - botões e direcional → eventos de tecla falsos (Enter, Escape, setas...)
//     os eventos falsos vêm com e.pad = true (a cena pode tratar diferente do teclado)
//   - analógico esquerdo → andar com velocidade analógica (game.pad.move())
//   - não existe cursor: nas telas de escolher (celular, estante, papéis) o
//     analógico e o direcional trocam o item selecionado, igual ao menu
//
// Cada cena pode dizer como quer o controle a cada quadro:
//   padMode()  'walk'    analógico esquerdo anda (move())
//              'select'  esquerdo/direcional = setas (trocar item); direito rola (onWheel)
//              'look'    os dois analógicos movem game.mouse (olhar/inclinar), volta ao centro
//              'look-rs' esquerdo/direcional = setas; direito olha (game.mouse)
//              'aim'     minigames: o analógico esquerdo move a mira (game.mouse), sem voltar ao centro
//              null      esquerdo/direcional = setas (padrão)
//   onPad(btn) chance de tratar um botão do seu jeito; true = já tratou
//
// Vibração: alguns sons importantes (flash, impacto, notificação...) também
// tremem o controle, só quando o jogador está usando o controle.

const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, MENU: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15, HOME: 16 };
const NAMES = Object.fromEntries(Object.entries(B).map(([k, v]) => [v, k]));

const DEAD = 0.2; // zona morta radial dos analógicos
const REPEAT_DELAY = 0.38; // segurando uma direção em menu: espera e repete
const REPEAT_RATE = 0.11;

// Sons que também vibram: [forte, fraco, duração ms]
const RUMBLE = {
  impact: [0.9, 0.6, 230],
  flash: [0.55, 1.0, 180],
  thump: [0.5, 0.2, 120],
  powerDown: [0.35, 0.08, 420],
  notify: [0.22, 0.55, 260], // o celular vibrando na mão
  warn: [0.2, 0.4, 120],
  like: [0, 0.45, 70],
  drawer: [0.25, 0.15, 140],
  balloonPop: [0.08, 0.5, 60],
  click: [0, 0.3, 40],
  tap: [0, 0.16, 24],
  select: [0, 0.14, 30],
  heartbeat: [0.45, 0.05, 90],
  zap: [0.05, 0.3, 45], // os raios do plasma no dedo
};

const isXbox = (id) => /xbox|xinput|045e|microsoft/i.test(id || '');

// Analógico com zona morta radial e reescala (sem "degrau" na borda da zona morta)
function stick(x, y) {
  const m = Math.hypot(x, y);
  if (m < DEAD) return { x: 0, y: 0, m: 0 };
  const k = Math.min(1, (m - DEAD) / (1 - DEAD)) / m;
  return { x: x * k, y: y * k, m: Math.min(1, (m - DEAD) / (1 - DEAD)) };
}

// Lê um controle e devolve sempre no layout "standard".
// O Firefox no Linux às vezes entrega o Xbox sem mapeamento: arrumamos aqui.
function readPad(gp) {
  const btn = (i) => {
    const b = gp.buttons[i];
    return b ? (typeof b === 'object' ? b.pressed || b.value > 0.5 : b > 0.5) : false;
  };
  const ax = (i) => gp.axes[i] || 0;
  if (gp.mapping === 'standard' || !isXbox(gp.id) || gp.axes.length < 8) {
    const b = [];
    for (let i = 0; i < 17; i++) b[i] = btn(i);
    return { b, lx: ax(0), ly: ax(1), rx: ax(2), ry: ax(3) };
  }
  // layout do driver xpad do Linux
  const b = [];
  b[B.A] = btn(0); b[B.B] = btn(1); b[B.X] = btn(2); b[B.Y] = btn(3);
  b[B.LB] = btn(4); b[B.RB] = btn(5);
  b[B.LT] = ax(2) > 0.3; b[B.RT] = ax(5) > 0.3;
  b[B.VIEW] = btn(6); b[B.MENU] = btn(7); b[B.HOME] = btn(8);
  b[B.LS] = btn(9); b[B.RS] = btn(10);
  b[B.UP] = ax(7) < -0.5; b[B.DOWN] = ax(7) > 0.5; b[B.LEFT] = ax(6) < -0.5; b[B.RIGHT] = ax(6) > 0.5;
  return { b, lx: ax(0), ly: ax(1), rx: ax(3), ry: ax(4) };
}

export class GamepadInput {
  constructor(game) {
    this.game = game;
    this.index = -1; // controle em uso
    this.prev = [];
    this.state = null;
    this.mode = 'kb'; // 'kb' (teclado/mouse) ou 'pad'
    this.dirs = { up: false, down: false, left: false, right: false };
    this.repeatT = { up: 0, down: 0, left: 0, right: 0 };
    this.walk = { x: 0, y: 0 };

    window.addEventListener('gamepadconnected', (e) => this.onConnect(e.gamepad));
    window.addEventListener('gamepaddisconnected', (e) => this.onDisconnect(e.gamepad));
    this.wrapSfx();
  }

  // ---------------------------------------------------------------
  // Conectar / desconectar
  // ---------------------------------------------------------------

  onConnect(gp) {
    if (this.index < 0) this.index = gp.index;
    const name = isXbox(gp.id) ? 'CONTROLE XBOX' : 'CONTROLE';
    // o navegador só avisa depois de um botão apertado: já estamos no controle
    this.setMode('pad');
    this.game.ui.toast(`${name} CONECTADO`);
    this.rumble(0.2, 0.4, 120, gp);
  }

  onDisconnect(gp) {
    if (gp.index !== this.index) return;
    this.index = -1;
    this.release();
    const { ui } = this.game;
    ui.toast('CONTROLE DESCONECTADO', true);
    if (this.mode === 'pad') {
      // no meio do jogo: pausa sozinho, como nos consoles
      const scene = this.game.current;
      const m = scene?.padMode?.();
      if ((m === 'walk' || m === 'select') && !ui.pauseOpen) scene.openPause?.();
      this.setMode('kb');
    }
  }

  // ---------------------------------------------------------------
  // Teclado ↔ controle (troca os ícones das dicas)
  // ---------------------------------------------------------------

  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.game.inputMode = mode;
    document.body.classList.toggle('pad', mode === 'pad');
    this.game.ui.setInputMode(mode);
    if (mode === 'kb') this.release();
  }

  // chamado pelo main.js quando o teclado ou o mouse de verdade são usados
  useKeyboard() {
    this.setMode('kb');
  }

  // solta tudo o que estava apertado (não deixa tecla "presa" na cena)
  release() {
    for (const d of Object.keys(this.dirs)) if (this.dirs[d]) this.setDir(d, false);
    this.walk.x = this.walk.y = 0;
  }

  // ---------------------------------------------------------------
  // Vibração
  // ---------------------------------------------------------------

  rumble(strong, weak, ms, gp = null) {
    if (!gp) {
      if (this.mode !== 'pad' || this.index < 0) return;
      gp = navigator.getGamepads?.()[this.index];
    }
    const act = gp?.vibrationActuator;
    if (!act?.playEffect) return;
    try {
      act.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
    } catch {
      /* controle sem vibração */
    }
  }

  wrapSfx() {
    const sfx = this.game.sfx;
    for (const [name, [s, w, ms]] of Object.entries(RUMBLE)) {
      const fn = sfx[name];
      if (typeof fn !== 'function') continue;
      sfx[name] = (...args) => {
        const k = name === 'heartbeat' ? Math.min(1, args[0] ?? 1) : name === 'balloonPop' ? Math.min(1, args[0] ?? 1) : 1;
        this.rumble(s * k, w * k, ms);
        return fn.apply(sfx, args);
      };
    }
  }

  // ---------------------------------------------------------------
  // Saídas para as cenas
  // ---------------------------------------------------------------

  // Andar: vetor do analógico esquerdo, x = lados, y = frente(-1)/fundo... (+1 = para a câmera)
  move() {
    if (this.mode !== 'pad' || this.game.ui.pauseOpen) return { x: 0, y: 0 };
    return this.walk;
  }

  key(code, down, repeat = false) {
    const e = { code, key: code, repeat, pad: true, preventDefault() {}, stopPropagation() {} };
    if (down) this.game.keyDown(e);
    else this.game.keyUp(e);
  }

  setDir(d, on, repeat = false) {
    const code = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[d];
    if (!repeat) this.dirs[d] = on;
    this.key(code, on, repeat);
  }

  // ---------------------------------------------------------------
  // Botões
  // ---------------------------------------------------------------

  press(i) {
    const { ui, sfx } = this.game;
    const scene = this.game.current;
    const name = NAMES[i];
    sfx.unlock(); // nem todo navegador libera o som pelo controle; não custa tentar
    if (this.game.onAnyPress?.()) return; // "aperte para começar"
    const mode = scene?.padMode?.() ?? null;

    if (ui.pauseOpen) {
      if (name === 'A') this.key('Enter', true);
      else if (name === 'B' || name === 'MENU' || name === 'VIEW') this.key('Escape', true);
      return;
    }
    if (name === 'MENU' || name === 'VIEW') return this.key('Escape', true);
    if (scene?.onPad?.(name, mode)) return;
    if (name === 'A') this.key('Enter', true);
    else if (name === 'B') this.key('Backspace', true);
  }

  unpress(i) {
    const name = NAMES[i];
    if (name === 'A') this.key('Enter', false);
    else if (name === 'B') this.key('Backspace', false);
    else if (name === 'MENU' || name === 'VIEW') this.key('Escape', false);
  }

  // ---------------------------------------------------------------
  // Por quadro
  // ---------------------------------------------------------------

  update(dt) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = this.index >= 0 ? pads[this.index] : null;
    if (!gp) {
      // pega o primeiro controle que apertar algo
      for (const p of pads) {
        if (p && p.connected && p.buttons.some((b) => b.pressed)) {
          gp = p;
          this.index = p.index;
          break;
        }
      }
    }
    if (!gp) return;
    const s = readPad(gp);
    const L = stick(s.lx, s.ly);
    const R = stick(s.rx, s.ry);

    // qualquer coisa no controle = modo controle
    if (s.b.some(Boolean) || L.m > 0.35 || R.m > 0.35) this.setMode('pad');
    if (this.mode !== 'pad') {
      this.prev = s.b;
      return;
    }

    const { ui } = this.game;
    const scene = this.game.current;
    const mode = ui.pauseOpen ? null : scene?.padMode?.() ?? null;

    // botões (borda de subida/descida)
    for (let i = 0; i < 17; i++) {
      if (i >= B.UP && i <= B.RIGHT) continue; // direcional vai junto com o analógico
      if (s.b[i] && !this.prev[i]) this.press(i);
      else if (!s.b[i] && this.prev[i]) this.unpress(i);
    }
    this.prev = s.b;

    // direções digitais: direcional sempre; analógico esquerdo quando a cena não usa ele
    const stickArrows = mode === null || mode === 'look-rs' || mode === 'select';
    // (no 'aim' o direcional ainda vira setas: dá para mirar no direcional também)
    // no analógico só vale o eixo dominante (na diagonal não pula dois itens de uma vez)
    const hx = Math.abs(L.x) >= Math.abs(L.y) ? L.x : 0;
    const hy = Math.abs(L.y) > Math.abs(L.x) ? L.y : 0;
    const want = {
      up: s.b[B.UP] || (stickArrows && this.axisDir(hy, -1, this.dirs.up)),
      down: s.b[B.DOWN] || (stickArrows && this.axisDir(hy, 1, this.dirs.down)),
      left: s.b[B.LEFT] || (stickArrows && this.axisDir(hx, -1, this.dirs.left)),
      right: s.b[B.RIGHT] || (stickArrows && this.axisDir(hx, 1, this.dirs.right)),
    };
    for (const d of Object.keys(want)) {
      if (want[d] && !this.dirs[d]) {
        this.setDir(d, true);
        this.repeatT[d] = REPEAT_DELAY;
      } else if (!want[d] && this.dirs[d]) this.setDir(d, false);
      else if (want[d] && mode !== 'walk') {
        // segurando: repete (menus, rolar o celular)
        this.repeatT[d] -= dt;
        if (this.repeatT[d] <= 0) {
          this.repeatT[d] += REPEAT_RATE;
          this.setDir(d, true, true);
        }
      }
    }

    // andar
    if (mode === 'walk') {
      let x = L.x, y = L.y;
      const m = L.m;
      // quase na horizontal/vertical: trava no eixo (ela não vira de lado sem querer)
      if (m > 0 && Math.abs(x) < 0.28 * m) x = 0;
      if (m > 0 && Math.abs(y) < 0.28 * m) y = 0;
      // passo lento com o analógico pouco inclinado; a partir de 70% é a velocidade cheia
      const sp = Math.min(1, m / 0.7);
      const n = Math.hypot(x, y) || 1;
      this.walk.x = (x / n) * sp;
      this.walk.y = (y / n) * sp;
    } else {
      this.walk.x = this.walk.y = 0;
    }

    // analógico direito rola (celular)
    if (mode === 'select' && R.m > 0 && scene?.onWheel) {
      scene.onWheel({ deltaY: Math.sign(R.y) * R.y * R.y * 1200 * dt, pad: true });
    }

    // mira dos minigames: anda com o analógico e fica onde parou (curva: pouco = preciso)
    if (mode === 'aim') {
      const S = L.m >= R.m ? L : R;
      if (S.m > 0) {
        const m = this.game.mouse;
        const sp = 1.15 * Math.pow(S.m, 1.5) / S.m;
        const aspect = window.innerHeight / window.innerWidth;
        m.x = Math.max(-0.98, Math.min(0.98, m.x + S.x * sp * dt * 2 * aspect));
        m.y = Math.max(-0.98, Math.min(0.98, m.y - S.y * sp * dt * 2));
      }
    }

    // olhar
    if (mode === 'look' || mode === 'look-rs') {
      const S = mode === 'look' && L.m > R.m ? L : R;
      const m = this.game.mouse;
      const k = 1 - Math.exp(-9 * dt);
      m.x += (S.x - m.x) * k;
      m.y += (-S.y - m.y) * k;
    }
  }

  // analógico como seta, com histerese (não fica piscando na borda)
  axisDir(v, sign, held) {
    return v * sign > (held ? 0.35 : 0.55);
  }
}
