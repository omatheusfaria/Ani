import * as THREE from 'three';
import { PixelRenderer } from './engine/renderer.js';
import { Sfx } from './engine/audio.js';
import { UI } from './engine/ui.js';
import { loadFonts } from './engine/pixeltext.js';
import { GamepadInput } from './engine/gamepad.js';
import { MenuScene } from './scenes/menu.js';
import { QuartoScene } from './scenes/quarto.js';
import { ParkScene } from './scenes/parque.js';

// ---------------------------------------------------------------
// Configurações e save (guardados no navegador)
// ---------------------------------------------------------------

const SETTINGS_KEY = 'ani:config';
const SAVE_KEY = 'ani:save';

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? { ...fallback, ...JSON.parse(v) } : { ...fallback };
  } catch {
    return { ...fallback };
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

// ---------------------------------------------------------------
// Jogo
// ---------------------------------------------------------------

const canvas = document.getElementById('game');
const renderer = new PixelRenderer(canvas);
renderer.setRows(settings.rows);
const sfx = new Sfx();
sfx.setVolume(settings.volume);
const ui = new UI(sfx);

const game = {
  renderer,
  sfx,
  ui,
  canvas,
  settings,
  mouse: new THREE.Vector2(0, 0), // posição do mouse de -1 a 1 (o cursor do controle também mexe aqui)
  inputMode: 'kb', // 'kb' (teclado/mouse) ou 'pad' (controle)
  scenes: {},
  current: null,
  saveSettings() {
    writeJSON(SETTINGS_KEY, settings);
  },
  save: {
    get: () => {
      try {
        const v = localStorage.getItem(SAVE_KEY);
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    },
    set: (data) => writeJSON(SAVE_KEY, data),
  },
  goTo(name, opts = {}) {
    this.current?.exit?.();
    this.current = this.scenes[name];
    this.current.enter(opts);
  },
};

await loadFonts();

game.scenes.menu = new MenuScene(game);
game.scenes.quarto = new QuartoScene(game);
game.scenes.parque = new ParkScene(game);

// ---------------------------------------------------------------
// Entrada (mouse, roda, teclado e controle)
// ---------------------------------------------------------------

const pad = new GamepadInput(game);
game.pad = pad;

function toNdc(e) {
  game.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
}

// Teclas: o teclado de verdade e o controle (eventos falsos) passam por aqui
game.keyDown = (e) => {
  sfx.unlock();
  if (game.onAnyPress?.()) return;
  // Enter/Espaço (A no controle) aceleram e pulam falas, quando a cena deixa
  if (!ui.pauseOpen && !e.repeat && ['Enter', 'Space'].includes(e.code) && game.current?.dialogKey?.() && ui.advance()) return;
  // menu de pausa: setas escolhem, Enter confirma (Esc continua indo para a cena, que fecha)
  if (ui.pauseOpen && e.code !== 'Escape') {
    if (['ArrowUp', 'KeyW'].includes(e.code)) ui.pauseMove(-1);
    else if (['ArrowDown', 'KeyS'].includes(e.code)) ui.pauseMove(1);
    else if (['Enter', 'Space', 'KeyE'].includes(e.code) && !e.repeat) ui.pauseActivate();
    return;
  }
  game.current?.onKey?.(e);
};
game.keyUp = (e) => game.current?.onKeyUp?.(e);

// mouse de verdade: só volta para o modo teclado/mouse se andar de fato (não por tremidinha)
let mouseTravel = 0;
window.addEventListener('pointermove', (e) => {
  if (game.inputMode === 'pad') {
    mouseTravel += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    if (mouseTravel < 12) return;
    pad.useKeyboard();
  }
  mouseTravel = 0;
  toNdc(e);
  game.current?.onPointerMove?.(e);
});
// tela cheia pedida pelo controle: entra no próximo clique ou tecla de verdade
function pendingFullscreen() {
  if (!game.wantFullscreen) return;
  game.wantFullscreen = false;
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
}

window.addEventListener('pointerdown', (e) => {
  sfx.unlock();
  pendingFullscreen();
  pad.useKeyboard();
  toNdc(e);
  if (ui.pauseOpen) return;
  // clique na fala: 1º completa o texto, 2º pula. Na caixa/balão sempre; no resto
  // da tela só quando o clique não tem outro uso (no celular o clique toca na tela)
  if (e.button === 0) {
    const onDlg = e.target?.closest?.('#subtitle, .bubble');
    if ((onDlg || game.current?.dialogClick?.()) && ui.advance()) return;
  }
  game.current?.onPointerDown?.(e);
});
window.addEventListener('pointerup', (e) => {
  toNdc(e);
  if (ui.pauseOpen) return;
  game.current?.onPointerUp?.(e);
});
window.addEventListener('wheel', (e) => {
  if (ui.pauseOpen) return;
  game.current?.onWheel?.(e);
}, { passive: true });
window.addEventListener('keydown', (e) => {
  if (e.code !== 'F11') pendingFullscreen();
  pad.useKeyboard();
  if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
  game.keyDown(e);
});
window.addEventListener('keyup', (e) => game.keyUp(e));
window.addEventListener('blur', () => {
  pad.release();
  game.current?.onKeyUp?.({ code: '*' }) || game.current?.keys?.clear?.();
});
window.addEventListener('contextmenu', (e) => e.preventDefault());

// ---------------------------------------------------------------
// Loop
// ---------------------------------------------------------------

let last = performance.now();
let time = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;
  pad.update(dt);
  const scene = game.current;
  if (scene) {
    scene.update(dt, time);
    renderer.render(scene.scene, scene.camera, time);
  }
  requestAnimationFrame(frame);
}

// Atalho vindo do /admin (index.html?pular=parte), só com login feito
const params = new URLSearchParams(location.search);
let pendingJump = params.get('pular');
let adminOk = false;
try {
  adminOk = sessionStorage.getItem('ani:admin') === '1';
} catch {
  /* sem armazenamento */
}
if (pendingJump && adminOk) {
  // o navegador só libera o som depois de um clique: esperamos um
  ui.prompt('CLIQUE PARA COMEÇAR');
  const start = () => {
    window.removeEventListener('pointerdown', start, true);
    window.removeEventListener('keydown', start, true);
    game.onAnyPress = null;
    sfx.unlock();
    ui.prompt(null);
    if (pendingJump === 'menu') game.goTo('menu');
    else if (pendingJump.startsWith('parque')) game.goTo('parque', { jump: pendingJump });
    else game.goTo('quarto', { jump: pendingJump });
    pendingJump = null;
  };
  window.addEventListener('pointerdown', start, true);
  window.addEventListener('keydown', start, true);
  // botão do controle também começa
  game.onAnyPress = () => {
    start();
    return true;
  };
} else {
  game.goTo('menu');
}
requestAnimationFrame(frame);

// Atalho para testes no console do navegador: window.game
window.game = game;
