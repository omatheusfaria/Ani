import * as THREE from 'three';
import { PixelRenderer } from './engine/renderer.js';
import { Sfx } from './engine/audio.js';
import { UI } from './engine/ui.js';
import { loadFonts } from './engine/pixeltext.js';
import { MenuScene } from './scenes/menu.js';
import { QuartoScene } from './scenes/quarto.js';

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
  mouse: new THREE.Vector2(0, 0), // posição do mouse de -1 a 1
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

// ---------------------------------------------------------------
// Entrada (mouse, roda, teclado)
// ---------------------------------------------------------------

function toNdc(e) {
  game.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
}

window.addEventListener('pointermove', (e) => {
  toNdc(e);
  game.current?.onPointerMove?.(e);
});
window.addEventListener('pointerdown', (e) => {
  sfx.unlock();
  toNdc(e);
  if (ui.pauseOpen) return;
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
  sfx.unlock();
  if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
  game.current?.onKey?.(e);
});
window.addEventListener('keyup', (e) => game.current?.onKeyUp?.(e));
window.addEventListener('blur', () => game.current?.onKeyUp?.({ code: '*' }) || game.current?.keys?.clear?.());
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
    sfx.unlock();
    ui.prompt(null);
    if (pendingJump === 'menu') game.goTo('menu');
    else game.goTo('quarto', { jump: pendingJump });
    pendingJump = null;
  };
  window.addEventListener('pointerdown', start, true);
  window.addEventListener('keydown', start, true);
} else {
  game.goTo('menu');
}
requestAnimationFrame(frame);

// Atalho para testes no console do navegador: window.game
window.game = game;
