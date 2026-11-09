import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { drawText } from '../engine/pixeltext.js';
import { TX, buildBed, buildNightstand, buildDesk, buildChair, buildWardrobe, buildBookshelf, buildBackpack, Curtain, pillow as softPillow } from './furniture.js';
import { makePapers } from './papers.js';

// ===============================================================
// O quarto da protagonista à noite: 3D low-poly com texturas em
// pixel art (estilo Until Then). Sala de 6 x 5 metros, chão em y = 0.
// Parede do fundo em z = -2,5; a câmera lateral fica do lado z > 0.
// ===============================================================

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER[(x & 3) + (y & 3) * 4] + 0.5) / 16;

function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function tex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  return t;
}

function px(ctx, x, y, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 1, 1);
}

function noise(ctx, w, h, colors, amount, r) {
  for (let i = 0; i < w * h * amount; i++) px(ctx, Math.floor(r() * w), Math.floor(r() * h), colors[Math.floor(r() * colors.length)]);
}

// ---------------------------------------------------------------
// Texturas
// ---------------------------------------------------------------

const T = {
  floor: () =>
    tex(64, 64, (ctx) => {
      const r = seeded(3);
      const cols = ['#4a3428', '#523a2c', '#45302a', '#563f2f'];
      for (let row = 0; row < 8; row++) {
        const y = row * 8;
        const joint = Math.floor(r() * 64);
        ctx.fillStyle = cols[row % cols.length];
        ctx.fillRect(0, y, 64, 8);
        ctx.fillStyle = '#2a1c16';
        ctx.fillRect(0, y, 64, 1);
        ctx.fillRect(joint, y, 1, 8);
        for (let i = 0; i < 18; i++) px(ctx, Math.floor(r() * 64), y + 2 + Math.floor(r() * 5), r() < 0.5 ? '#3d2a21' : '#5e4534');
      }
    }, [6, 5]),

  wall: (repeat) =>
    tex(32, 32, (ctx) => {
      const r = seeded(9);
      ctx.fillStyle = '#2a2236';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#2e2539';
      for (let x = 0; x < 32; x += 8) ctx.fillRect(x, 0, 3, 32);
      for (let y = 4; y < 32; y += 8) for (let x = 5; x < 32; x += 8) {
        px(ctx, x, y, '#3a2f4a');
        px(ctx, x - 1, y + 1, '#3a2f4a');
        px(ctx, x + 1, y + 1, '#3a2f4a');
        px(ctx, x, y + 2, '#3a2f4a');
      }
      noise(ctx, 32, 32, ['#261f31', '#30283c'], 0.08, r);
    }, repeat),

  sheet: () =>
    tex(32, 32, (ctx) => {
      ctx.fillStyle = '#cbc3d8';
      ctx.fillRect(0, 0, 32, 32);
      const r = seeded(5);
      for (let i = 0; i < 9; i++) {
        let x = r() * 32, y = r() * 32;
        for (let s = 0; s < 8; s++) px(ctx, Math.floor(x += 1), Math.floor(y += r() - 0.5), '#b3aac4');
      }
    }),

  plaid: () =>
    tex(32, 32, (ctx) => {
      ctx.fillStyle = '#3b2a55';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#5a3d7a';
      for (let i = 0; i < 32; i += 8) {
        ctx.fillRect(i, 0, 3, 32);
        ctx.fillRect(0, i, 32, 3);
      }
      ctx.fillStyle = '#7b55a0';
      for (let i = 0; i < 32; i += 8) for (let j = 0; j < 32; j += 8) ctx.fillRect(i, j, 3, 3);
      ctx.fillStyle = '#16101f';
      for (let i = 5; i < 32; i += 8) {
        ctx.fillRect(i, 0, 1, 32);
        ctx.fillRect(0, i, 32, 1);
      }
    }, [3, 2]),

  rug: () =>
    tex(48, 32, (ctx) => {
      const cols = ['#2d5d63', '#1d3d44', '#c86b5a', '#1d3d44'];
      for (let y = 0; y < 32; y++) {
        ctx.fillStyle = cols[Math.floor(y / 4) % cols.length];
        ctx.fillRect(0, y, 48, 1);
      }
      for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) if (dith(x, y) < 0.12) px(ctx, x, y, '#0f2328');
      ctx.fillStyle = '#d9cbb3';
      for (let x = 0; x < 48; x += 2) {
        ctx.fillRect(x, 0, 1, 2);
        ctx.fillRect(x, 30, 1, 2);
      }
    }),

  darkWood: () =>
    tex(32, 32, (ctx) => {
      ctx.fillStyle = '#3a2a22';
      ctx.fillRect(0, 0, 32, 32);
      const r = seeded(11);
      for (let y = 0; y < 32; y += 3) {
        ctx.fillStyle = r() < 0.5 ? '#33251e' : '#413026';
        ctx.fillRect(0, y, 32, 1);
      }
    }),

  city: () =>
    tex(96, 80, (ctx) => {
      const r = seeded(21);
      const sky = ['#070a1f', '#0e1235', '#1b1b4a', '#2d2257'];
      for (let y = 0; y < 80; y++) {
        const k = (y / 80) * (sky.length - 1);
        const i = Math.min(sky.length - 2, Math.floor(k));
        for (let x = 0; x < 96; x++) px(ctx, x, y, sky[k - i > dith(x, y) ? i + 1 : i]);
      }
      for (let i = 0; i < 40; i++) px(ctx, Math.floor(r() * 96), Math.floor(r() * 40), '#ffffff');
      ctx.fillStyle = '#f2efd9';
      for (let j = -6; j < 6; j++) {
        const w = Math.round(Math.sqrt(36 - (j + 0.5) ** 2));
        ctx.fillRect(72 - w, 16 + j, w * 2, 1);
      }
      let x = 0;
      while (x < 96) {
        const w = 6 + Math.floor(r() * 10);
        const h = 18 + Math.floor(r() * 40);
        ctx.fillStyle = r() < 0.5 ? '#0b0c1c' : '#101126';
        ctx.fillRect(x, 80 - h, w, h);
        for (let wy = 80 - h + 3; wy < 78; wy += 4)
          for (let wx = x + 2; wx < x + w - 1; wx += 3)
            if (r() < 0.32) px(ctx, wx, wy, r() < 0.75 ? '#ffcf6e' : '#7fe3ff'), px(ctx, wx, wy + 1, r() < 0.75 ? '#e0a94e' : '#5cbcd8');
        if (r() < 0.3) px(ctx, x + Math.floor(w / 2), 80 - h - 1, '#ff3b3b');
        x += w + 1;
      }
    }),

  curtain: () =>
    tex(16, 32, (ctx) => {
      for (let x = 0; x < 16; x++) {
        const k = (Math.sin((x / 16) * Math.PI * 4) + 1) / 2;
        ctx.fillStyle = k > 0.66 ? '#2f5560' : k > 0.33 ? '#24434c' : '#1a3138';
        ctx.fillRect(x, 0, 1, 32);
      }
    }),

  clock: () =>
    tex(32, 12, (ctx) => {
      ctx.fillStyle = '#08070b';
      ctx.fillRect(0, 0, 32, 12);
      drawText(ctx, '23:47', 16, 1, { font: 'tiny', size: 8, weight: 700, color: '#ff3048', align: 'center' });
    }),

  laptop: () =>
    tex(32, 24, (ctx) => {
      ctx.fillStyle = '#2c2c36';
      ctx.fillRect(0, 0, 32, 24);
      const stickers = [['#ff6b9a', 4, 4, 6, 5], ['#7fe3ff', 20, 3, 7, 4], ['#ffe36b', 12, 13, 5, 5], ['#b48cff', 23, 15, 5, 6]];
      for (const [c, x, y, w, h] of stickers) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, w, h);
      }
      px(ctx, 14, 15, '#1d1d25');
      px(ctx, 15, 15, '#1d1d25');
    }),

  poster1: () =>
    tex(48, 64, (ctx) => {
      ctx.fillStyle = '#121016';
      ctx.fillRect(0, 0, 48, 64);
      // mariposa simétrica
      const wing = ['.......xxx', '....xxxxxx', '..xxxxx.xx', '.xxxx..xxx', 'xxxx.xxxxx', 'xxxxxxxxxx', '.xxxxxxxx.', '..xxxxxx..', '...xxxx.x.', '....xxx..x', '.....xx...'];
      wing.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch !== 'x') return;
        px(ctx, 13 + i, 20 + j, '#d9d0e8');
        px(ctx, 34 - i, 20 + j, '#d9d0e8');
      }));
      ctx.fillStyle = '#121016';
      ctx.fillRect(23, 18, 2, 16);
      ctx.fillStyle = '#d9d0e8';
      ctx.fillRect(23, 21, 2, 10);
      drawText(ctx, 'MOTH', 24, 4, { size: 12, weight: 700, color: '#f0e8ff', align: 'center' });
      drawText(ctx, 'TOUR 2026', 24, 50, { font: 'tiny', size: 8, color: '#ff6b9a', align: 'center' });
    }),

  poster2: () =>
    tex(40, 40, (ctx) => {
      ctx.fillStyle = '#1d1640';
      ctx.fillRect(0, 0, 40, 40);
      const r = seeded(4);
      for (let i = 0; i < 20; i++) px(ctx, Math.floor(r() * 40), Math.floor(r() * 40), '#cfc8ff');
      ctx.fillStyle = '#f3e9b8';
      for (let j = -10; j < 10; j++) {
        const w = Math.round(Math.sqrt(100 - (j + 0.5) ** 2));
        ctx.fillRect(20 - w, 20 + j, w * 2, 1);
      }
      ctx.fillStyle = '#1d1640';
      for (let j = -9; j < 9; j++) {
        const w = Math.round(Math.sqrt(81 - (j + 0.5) ** 2));
        ctx.fillRect(25 - w, 17 + j, w * 2, 1);
      }
      ctx.fillStyle = '#0c0a1a';
      ctx.fillRect(0, 0, 40, 1);
      ctx.fillRect(0, 39, 40, 1);
      ctx.fillRect(0, 0, 1, 40);
      ctx.fillRect(39, 0, 1, 40);
    }),

  poster3: () =>
    tex(48, 64, (ctx) => {
      const sky = ['#ff9a5c', '#e2576b', '#7b2f7a', '#2b1d5c'];
      for (let y = 0; y < 64; y++) {
        const k = ((63 - y) / 64) * (sky.length - 1);
        const i = Math.min(sky.length - 2, Math.floor(k));
        for (let x = 0; x < 48; x++) px(ctx, x, y, sky[k - i > dith(x, y) ? i + 1 : i]);
      }
      ctx.fillStyle = '#1a0f2a';
      for (let x = 0; x < 48; x++) {
        const h = 14 + Math.abs(((x * 7) % 23) - 11);
        ctx.fillRect(x, 64 - h, 1, h);
      }
      for (let i = 0; i < 5; i++) px(ctx, 30 + i, 10 + i, '#ffffff');
      drawText(ctx, 'STARFALL', 24, 26, { font: 'tiny', size: 8, weight: 700, color: '#fff2c2', align: 'center' });
      drawText(ctx, 'II', 24, 35, { font: 'tiny', size: 8, weight: 700, color: '#fff2c2', align: 'center' });
    }),

  books: () =>
    tex(32, 12, (ctx) => {
      const cols = ['#8a3b4f', '#2f5d8a', '#c9a24a', '#3e7a5a', '#5b3e8a', '#d0d0d8', '#1d1d24'];
      let x = 0;
      const r = seeded(8);
      while (x < 32) {
        const w = 2 + Math.floor(r() * 3);
        const h = 8 + Math.floor(r() * 4);
        ctx.fillStyle = cols[Math.floor(r() * cols.length)];
        ctx.fillRect(x, 12 - h, w, h);
        x += w;
      }
    }),


  poster4: () =>
    tex(48, 64, (ctx) => {
      for (let y = 0; y < 64; y++) for (let x = 0; x < 48; x++) px(ctx, x, y, dith(x, y) < y / 90 ? '#2a1a4a' : '#1a1030');
      // fantasma
      ctx.fillStyle = '#e8e2ff';
      for (let j = -9; j < 9; j++) {
        const w = Math.round(Math.sqrt(81 - (j + 0.5) ** 2));
        if (j < 0) ctx.fillRect(24 - w, 26 + j, w * 2, 1);
      }
      ctx.fillRect(15, 26, 18, 10);
      for (let i = 0; i < 3; i++) ctx.fillRect(15 + i * 6, 36, 4, 2);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(19, 23, 3, 4);
      ctx.fillRect(26, 23, 3, 4);
      drawText(ctx, 'VELVET', 24, 42, { font: 'tiny', size: 8, color: '#c9a6ff', align: 'center' });
      drawText(ctx, 'GHOSTS', 24, 51, { font: 'tiny', size: 8, color: '#c9a6ff', align: 'center' });
    }),

  poster5: () =>
    tex(40, 56, (ctx) => {
      ctx.fillStyle = '#071410';
      ctx.fillRect(0, 0, 40, 56);
      // caveira neon
      const skull = ['..xxxxxx..', '.xxxxxxxx.', 'xxxxxxxxxx', 'xx..xx..xx', 'xx..xx..xx', 'xxxxxxxxxx', '.xxx..xxx.', '..xxxxxx..', '..x.x.x.x.'];
      skull.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch !== 'x') return;
        ctx.fillStyle = '#4dff9a';
        ctx.fillRect(10 + i * 2, 8 + j * 2, 2, 2);
      }));
      drawText(ctx, 'NEON', 20, 34, { font: 'tiny', size: 8, color: '#4dff9a', align: 'center' });
      drawText(ctx, 'CRYPT', 20, 43, { font: 'tiny', size: 8, color: '#4dff9a', align: 'center' });
    }),

  poster6: () =>
    tex(32, 44, (ctx) => {
      ctx.fillStyle = '#f0c8d8';
      ctx.fillRect(0, 0, 32, 44);
      ctx.fillStyle = '#7a3a5a';
      for (let j = -6; j < 6; j++) {
        const w = Math.round(Math.sqrt(36 - (j + 0.5) ** 2));
        ctx.fillRect(16 - w, 16 + j, w * 2, 1);
      }
      ctx.fillStyle = '#f0c8d8';
      ctx.fillRect(13, 14, 2, 2);
      ctx.fillRect(18, 14, 2, 2);
      ctx.fillRect(13, 19, 6, 1);
      drawText(ctx, 'SAD', 16, 26, { font: 'tiny', size: 8, color: '#7a3a5a', align: 'center' });
      drawText(ctx, 'CLUB', 16, 34, { font: 'tiny', size: 8, color: '#7a3a5a', align: 'center' });
    }),

  wardrobe: () =>
    tex(32, 72, (ctx) => {
      ctx.fillStyle = '#2b2230';
      ctx.fillRect(0, 0, 32, 72);
      ctx.fillStyle = '#231b28';
      for (let y = 0; y < 72; y += 3) ctx.fillRect(0, y, 32, 1);
      ctx.fillStyle = '#120d15';
      ctx.fillRect(15, 2, 2, 68);
      ctx.fillRect(1, 1, 30, 1);
      ctx.fillRect(1, 70, 30, 1);
      ctx.fillStyle = '#b9b2c6';
      ctx.fillRect(12, 34, 1, 6);
      ctx.fillRect(19, 34, 1, 6);
      // adesivos
      const st = [['#ff6b9a', 4, 10, 5, 4], ['#ffe36b', 22, 14, 4, 4], ['#7fe3ff', 5, 52, 6, 3], ['#b48cff', 23, 46, 5, 6], ['#4dff9a', 8, 22, 3, 3]];
      for (const [c, x, y, w, h] of st) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
      // estrela
      ctx.fillStyle = '#fff2b0';
      ctx.fillRect(24, 26, 1, 5); ctx.fillRect(22, 28, 5, 1);
    }),

  door: () =>
    tex(32, 64, (ctx) => {
      ctx.fillStyle = '#3a2f3a';
      ctx.fillRect(0, 0, 32, 64);
      ctx.fillStyle = '#30262f';
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillRect(4, 34, 24, 26);
      ctx.fillStyle = '#c9c2d6';
      ctx.fillRect(25, 32, 3, 2);
      // aviso pendurado
      ctx.fillStyle = '#e8e2d0';
      ctx.fillRect(9, 10, 14, 9);
      drawText(ctx, 'NÃO', 16, 10, { font: 'tiny', size: 8, color: '#a8324d', align: 'center' });
    }),

  ticket: () =>
    tex(40, 16, (ctx) => {
      ctx.fillStyle = '#f2e6c8';
      ctx.fillRect(0, 0, 40, 16);
      ctx.fillStyle = '#ff6b9a';
      ctx.fillRect(0, 0, 9, 16);
      ctx.fillStyle = '#f2e6c8';
      for (let y = 1; y < 16; y += 3) ctx.fillRect(9, y, 1, 1);
      drawText(ctx, 'MOTH', 11, 0, { font: 'tiny', size: 8, color: '#2a1a2a' });
      drawText(ctx, 'SÁB 22H', 11, 7, { font: 'tiny', size: 8, color: '#7a3a5a' });
    }),

  cork: () =>
    tex(48, 32, (ctx) => {
      const r = seeded(31);
      ctx.fillStyle = '#a77a4f';
      ctx.fillRect(0, 0, 48, 32);
      noise(ctx, 48, 32, ['#946a43', '#b98b5c', '#8a6040'], 0.35, r);
      ctx.fillStyle = '#4a3020';
      ctx.fillRect(0, 0, 48, 1); ctx.fillRect(0, 31, 48, 1); ctx.fillRect(0, 0, 1, 32); ctx.fillRect(47, 0, 1, 32);
      // bilhetes, um ingresso velho, pins
      const notes = [['#fff2a8', 4, 4, 10, 9], ['#ffc2d6', 30, 5, 11, 9], ['#c2f0ff', 18, 17, 10, 10], ['#f2e6c8', 4, 19, 12, 6]];
      for (const [c, x, y, w, h] of notes) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
      ctx.fillStyle = '#6a6070';
      for (const [x, y, w] of [[6, 7, 6], [6, 9, 5], [32, 8, 7], [32, 10, 5], [20, 20, 6], [20, 22, 4]]) ctx.fillRect(x, y, w, 1);
      ctx.fillStyle = '#ff3b5c';
      for (const [x, y] of [[9, 4], [35, 5], [23, 17], [10, 19]]) ctx.fillRect(x, y, 1, 1);
    }),

  vinyl: () =>
    tex(24, 24, (ctx) => {
      ctx.fillStyle = '#e04f6a';
      ctx.fillRect(0, 0, 24, 24);
      ctx.fillStyle = '#1a1420';
      for (let j = -8; j < 8; j++) {
        const w = Math.round(Math.sqrt(64 - (j + 0.5) ** 2));
        ctx.fillRect(12 - w, 12 + j, w * 2, 1);
      }
      ctx.fillStyle = '#ffe36b';
      ctx.fillRect(11, 11, 2, 2);
    }),

  plasmaBase: () =>
    tex(8, 8, (ctx) => {
      ctx.fillStyle = '#121016';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#2a2633';
      ctx.fillRect(0, 2, 8, 1);
    }),

  glow: () =>
    tex(16, 16, (ctx) => {
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++) {
          const d = Math.hypot(x - 7.5, y - 7.5) / 8;
          if (d < 1 && dith(x, y) < (1 - d) ** 1.5) px(ctx, x, y, '#ffffff');
        }
    }),
};

// ---------------------------------------------------------------
// Construção
// ---------------------------------------------------------------

const lam = (o) => new THREE.MeshLambertMaterial(o);

function box(group, w, h, d, mat, x, y, z, { cast = true, receive = true, ry = 0, rz = 0 } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.rotation.z = rz;
  m.castShadow = cast;
  m.receiveShadow = receive;
  group.add(m);
  return m;
}

function plane(group, w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, 0);
  m.receiveShadow = true;
  group.add(m);
  return m;
}

function polaroid(group, img, x, y, z, rot, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.set(0, ry, rot);
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.24), lam({ color: '#e9e4ee' }));
  g.add(frame);
  const t = new THREE.CanvasTexture(img);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), lam({ map: t }));
  photo.position.set(0, 0.018, 0.002);
  g.add(photo);
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.025), new THREE.MeshBasicMaterial({ color: '#d8cfa0', transparent: true, opacity: 0.8 }));
  tape.position.set(0, 0.115, 0.003);
  tape.rotation.z = 0.15;
  g.add(tape);
  group.add(g);
  return g;
}

// ---------------------------------------------------------------
// Luminária de plasma: um sprite animado (sempre virado para a câmera)
// ---------------------------------------------------------------

function plasmaLamp() {
  const S = 48;
  const C = S / 2 - 0.5;
  const R = 20;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.24, 0.24, 1);
  const tendrils = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2, v: 0 }));
  let acc = 1;
  let touch = null; // ponto tocado (pixels do canvas) ou null
  let touchK = 0;

  const line = (x0, y0, x1, y1, col) => {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= n; i++) px(ctx, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), col);
  };
  const bolt = (ang, len, colA, colB, jitter = 0.5) => {
    let x = C, y = C;
    const steps = 8;
    for (let s = 1; s <= steps; s++) {
      const k = (s / steps) * len;
      const a2 = ang + (Math.random() - 0.5) * jitter;
      const nx = C + Math.cos(a2) * k, ny = C + Math.sin(a2) * k;
      line(x, y, nx, ny, s > steps * 0.6 ? colB : colA);
      x = nx;
      y = ny;
    }
    return [x, y];
  };

  function draw(on) {
    ctx.clearRect(0, 0, S, S);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const d = Math.hypot(x - C, y - C);
        if (d < R + 1 && d >= R) px(ctx, x, y, on ? '#b9a6ff' : '#4a4060');
        else if (d < R && dith(x, y) < (on ? 0.2 + touchK * 0.15 : 0.1)) px(ctx, x, y, on ? '#3a1858' : '#1a1428');
      }
    // brilho do vidro
    px(ctx, Math.round(C - R * 0.55), Math.round(C - R * 0.6), '#ffffff');
    px(ctx, Math.round(C - R * 0.45), Math.round(C - R * 0.7), '#d9ccff');
    if (!on) return;
    const touchAng = touch ? Math.atan2(touch.y - C, touch.x - C) : 0;
    for (const td of tendrils) {
      td.v += (Math.random() - 0.5) * 0.5;
      td.v *= 0.8;
      td.a += td.v * 0.3;
      if (touch) {
        // os raios são puxados para o dedo
        let diff = Math.atan2(Math.sin(touchAng - td.a), Math.cos(touchAng - td.a));
        td.a += diff * 0.08 * touchK;
      }
      const [ex, ey] = bolt(td.a, R - 1, '#c77bff', '#ff9bf2');
      px(ctx, Math.round(ex), Math.round(ey), '#ffffff');
    }
    if (touch && touchK > 0.2) {
      // raio principal grosso até o ponto tocado
      const len = Math.min(R - 1, Math.hypot(touch.x - C, touch.y - C));
      for (let k = 0; k < 2; k++) bolt(touchAng + (k - 0.5) * 0.06, len, '#ffd6ff', '#ffffff', 0.35);
      ctx.fillStyle = '#ffffff';
      const tx = Math.round(C + Math.cos(touchAng) * len), ty = Math.round(C + Math.sin(touchAng) * len);
      ctx.fillRect(tx - 1, ty - 1, 3, 3);
    }
    ctx.fillStyle = '#ffe6ff';
    ctx.fillRect(Math.round(C) - 2, Math.round(C) - 2, 5, 5);
    ctx.fillStyle = '#ff9bf2';
    ctx.fillRect(Math.round(C) - 3, Math.round(C) - 1, 7, 3);
    ctx.fillRect(Math.round(C) - 1, Math.round(C) - 3, 3, 7);
  }

  return {
    sprite,
    // uv do sprite (0..1) ou null
    setTouch(uv) {
      touch = uv ? { x: uv.x * S, y: (1 - uv.y) * S } : null;
      if (touch && Math.hypot(touch.x - C, touch.y - C) > R) touch = null;
    },
    get touching() {
      return !!touch;
    },
    update(dt, on) {
      touchK += ((touch ? 1 : 0) - touchK) * Math.min(1, dt * 8);
      acc += dt;
      if (acc > 0.06) {
        acc = 0;
        draw(on);
        t.needsUpdate = true;
      }
      mat.color.setScalar(on ? 1.8 + touchK * 0.8 : 0.5);
    },
  };
}

// ---------------------------------------------------------------
// Gaveta da escrivaninha (com o carregador e a tirinha de fotos)
// ---------------------------------------------------------------

function makeDrawer(wood, strip) {
  const g = new THREE.Group();
  const inner = lam({ color: '#3a2c24' });
  box(g, 0.58, 0.012, 0.5, inner, 0, 0.006, 0, { cast: false });
  box(g, 0.012, 0.1, 0.5, inner, -0.29, 0.05, 0, { cast: false });
  box(g, 0.012, 0.1, 0.5, inner, 0.29, 0.05, 0, { cast: false });
  box(g, 0.58, 0.1, 0.012, inner, 0, 0.05, -0.25, { cast: false });
  box(g, 0.64, 0.13, 0.022, wood, 0, 0.06, 0.26);
  box(g, 0.14, 0.016, 0.025, lam({ color: '#b9b2c6' }), 0, 0.07, 0.282);

  // Carregador (fonte + cabo enrolado)
  const white = lam({ color: '#e9e6ee' });
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.028, 0.06, 2, 0.006), white);
  brick.position.set(-0.17, 0.027, -0.06);
  brick.rotation.y = 0.4;
  g.add(brick);
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2 * 3;
    const rr = 0.055 + Math.sin(i * 0.7) * 0.006;
    pts.push(new THREE.Vector3(-0.1 + Math.cos(a) * rr, 0.017 + (i % 9) * 0.0008, 0.07 + Math.sin(a) * rr * 0.8));
  }
  pts.push(new THREE.Vector3(-0.17, 0.02, -0.03));
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0035, 5), white);
  g.add(cable);

  // Canetas, post-its e uma palheta
  const pen = (x, z, ry, col) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6), lam({ color: col }));
    m.rotation.set(Math.PI / 2, 0, ry);
    m.position.set(x, 0.018, z);
    g.add(m);
  };
  pen(0.18, -0.12, 0.3, '#2b4fa8');
  pen(0.21, -0.1, 0.5, '#1d1a24');
  const note = (x, z, ry, col) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), lam({ color: col }));
    m.rotation.set(-Math.PI / 2, 0, ry);
    m.position.set(x, 0.0135, z);
    g.add(m);
  };
  note(0.17, 0.1, 0.2, '#fff2a8');
  note(0.2, 0.13, -0.15, '#ffc2d6');
  const pick = new THREE.Mesh(new THREE.CircleGeometry(0.012, 3), lam({ color: '#b48cff' }));
  pick.rotation.set(-Math.PI / 2, 0, 0.6);
  pick.position.set(-0.02, 0.0136, -0.15);
  g.add(pick);

  // Tirinha de fotos
  let stripMesh = null;
  if (strip) {
    const t = new THREE.CanvasTexture(strip);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    stripMesh = new THREE.Mesh(new THREE.PlaneGeometry(strip.width * 0.0005, strip.height * 0.0005), lam({ map: t }));
    stripMesh.rotation.set(-Math.PI / 2, 0, 0.18);
    stripMesh.position.set(0.05, 0.0138, 0.02);
    g.add(stripMesh);
  }
  return { group: g, stripMesh };
}

// ---------------------------------------------------------------
// Construção do quarto
// ---------------------------------------------------------------

export function buildRoom({ posts, strip }) {
  const group = new THREE.Group();

  // Chão, paredes e teto
  plane(group, 6, 5, lam({ map: T.floor() }), 0, 0, 0, 0, -Math.PI / 2);
  plane(group, 6, 2.8, lam({ map: T.wall([6, 2.8]) }), 0, 1.4, -2.5);
  plane(group, 5, 2.8, lam({ map: T.wall([5, 2.8]) }), -3, 1.4, 0, Math.PI / 2);
  plane(group, 5, 2.8, lam({ map: T.wall([5, 2.8]) }), 3, 1.4, 0, -Math.PI / 2);
  plane(group, 6, 2.8, lam({ map: T.wall([6, 2.8]) }), 0, 1.4, 2.5, Math.PI);
  plane(group, 6, 5, lam({ color: '#120e19' }), 0, 2.8, 0, 0, Math.PI / 2);
  const skirting = lam({ color: '#1a1422' });
  box(group, 6, 0.1, 0.03, skirting, 0, 0.05, -2.485, { cast: false });
  box(group, 0.03, 0.1, 5, skirting, -2.985, 0.05, 0, { cast: false });
  box(group, 0.03, 0.1, 5, skirting, 2.985, 0.05, 0, { cast: false });

  // Tapete
  const rug = plane(group, 2.2, 1.4, lam({ map: T.rug() }), 0.3, 0.006, -0.5, 0, -Math.PI / 2);
  rug.rotation.z = 0.06;

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0, ...o });
  const rb = (w, h, d, mat, x, y, z, r = 0.012, ry = 0) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    group.add(m);
    return m;
  };

  // --- Cama (encostada na parede do fundo, cabeceira à esquerda) ---
  const bed = buildBed();
  group.add(bed.group);
  bed.pillow.userData.home = { pos: bed.pillow.position.clone(), quat: bed.pillow.quaternion.clone() };

  // --- Criado-mudo com despertador e luminária de plasma ---
  const ns = buildNightstand();
  group.add(ns.group);
  const NY = 0.533;
  ns.items.dish.position.set(-0.07, NY + 0.009, -2.07);
  ns.items.frame.position.set(0.19, NY + 0.007, -2.27);
  ns.items.frame.rotation.y = 0.5;
  ns.items.clock.position.set(0.3, NY + 0.045, -2.1);
  ns.items.glass.position.set(0.33, NY + 0.05, -2.36);
  const clockFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.13, 0.052),
    new THREE.MeshBasicMaterial({ map: T.clock(), toneMapped: false, color: new THREE.Color(1.6, 1.6, 1.6) })
  );
  clockFace.position.set(0, 0, 0.0362);
  ns.items.clock.add(clockFace);
  const clockLight = new THREE.PointLight('#ff2b40', 0.2, 0, 2);
  clockLight.position.set(0.28, 0.6, -1.9);
  group.add(clockLight);
  const PLASMA = new THREE.Vector3(0.0, 0.725, -2.3);
  const plasmaBase = new THREE.Group();
  const baseMat = std({ color: '#121016', roughness: 0.35, metalness: 0.4 });
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.05, 20), baseMat);
  b1.position.y = 0.025;
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.03, 20), baseMat);
  b2.position.y = 0.065;
  const ledRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.004, 6, 24), new THREE.MeshBasicMaterial({ color: '#c46bff', toneMapped: false }));
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.y = 0.04;
  plasmaBase.add(b1, b2, ledRing);
  plasmaBase.position.set(PLASMA.x, NY, PLASMA.z);
  b1.castShadow = b2.castShadow = true;
  group.add(plasmaBase);
  const plasma = plasmaLamp();
  plasma.sprite.position.copy(PLASMA);
  group.add(plasma.sprite);
  const plasmaLight = new THREE.PointLight('#c46bff', 0, 0, 2);
  const PLASMA_LIGHT = new THREE.Vector3(PLASMA.x, 0.72, -2.05);
  plasmaLight.position.copy(PLASMA_LIGHT);
  group.add(plasmaLight);
  const plasmaTarget = PLASMA_LIGHT.clone();

  // --- Escrivaninha embaixo da janela, com gaveta ---
  const DX = 1.35, DZ = -2.15;
  group.add(buildDesk(DX, DZ));
  const deskWood = std({ map: TX.wood(21), roughness: 0.65 });
  const drawer = makeDrawer(deskWood, strip);
  const DRAWER_Z = DZ + 0.01;
  drawer.group.position.set(DX, 0.6, DRAWER_Z);
  group.add(drawer.group);
  // notebook fechado com adesivos
  const laptop = rb(0.42, 0.024, 0.3, std({ map: T.laptop(), roughness: 0.4, metalness: 0.3 }), DX - 0.2, 0.787, DZ - 0.02, 0.012, 0.2);
  laptop.material.map.wrapS = laptop.material.map.wrapT = THREE.ClampToEdgeWrapping;
  // caneca com canetas
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 18, 1, true), std({ color: '#5e2c66', roughness: 0.4, side: THREE.DoubleSide }));
  cup.position.set(DX + 0.38, 0.825, DZ - 0.1);
  cup.castShadow = true;
  group.add(cup);
  const cupBottom = new THREE.Mesh(new THREE.CircleGeometry(0.036, 18), std({ color: '#3a1a40' }));
  cupBottom.rotation.x = -Math.PI / 2;
  cupBottom.position.set(DX + 0.38, 0.78, DZ - 0.1);
  group.add(cupBottom);
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.15, 6), std({ color: ['#ff6b9a', '#1d1a24', '#7fe3ff'][i] }));
    p.position.set(DX + 0.37 + i * 0.012, 0.88, DZ - 0.1);
    p.rotation.z = (i - 1) * 0.22;
    group.add(p);
  }
  // vaso com planta (folhas macias, sem facetas)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.11, 16), std({ color: '#b5654a', roughness: 0.9 }));
  pot.position.set(DX + 0.52, 0.83, DZ - 0.15);
  pot.castShadow = true;
  group.add(pot);
  const leafMat = std({ color: '#3e7a5a', roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), leafMat);
    leaf.scale.set(0.5, 1.3, 0.25);
    leaf.position.set(DX + 0.52 + Math.cos(a) * 0.04, 0.95 + (i % 2) * 0.03, DZ - 0.15 + Math.sin(a) * 0.04);
    leaf.rotation.set(Math.sin(a) * 0.6, -a, Math.cos(a) * 0.6);
    leaf.castShadow = true;
    group.add(leaf);
  }
  // cadeira afastada para o lado
  const chair = buildChair();
  chair.position.set(DX + 0.75, 0, -1.55);
  chair.rotation.y = -0.7;
  group.add(chair);

  // Janela com a cidade à noite
  const WX = DX, WY = 1.68;
  plane(group, 1.2, 1.0, new THREE.MeshBasicMaterial({ map: T.city() }), WX, WY, -2.49);
  const frame = std({ color: '#4a4458', roughness: 0.6 });
  rb(1.32, 0.07, 0.09, frame, WX, WY + 0.535, -2.465, 0.02);
  rb(1.4, 0.06, 0.16, frame, WX, WY - 0.535, -2.44, 0.02); // parapeito
  rb(0.07, 1.1, 0.09, frame, WX - 0.63, WY, -2.465, 0.02);
  rb(0.07, 1.1, 0.09, frame, WX + 0.63, WY, -2.465, 0.02);
  rb(0.03, 1.0, 0.05, frame, WX, WY, -2.465, 0.01);
  rb(1.2, 0.025, 0.04, frame, WX, WY + 0.12, -2.465, 0.01);
  // varão e cortinas de veludo
  const ROD_Y = WY + 0.72;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.0, 10), std({ color: '#b9b4c4', roughness: 0.3, metalness: 0.8 }));
  rod.rotation.z = Math.PI / 2;
  rod.position.set(WX, ROD_Y, -2.4);
  group.add(rod);
  for (const sx of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 10), rod.material);
    fin.position.set(WX + sx * 1.0, ROD_Y, -2.4);
    group.add(fin);
  }
  const velvet = std({ map: TX.velvet(), roughness: 0.95, side: THREE.DoubleSide });
  const CURTAIN_H = 1.62;
  const curtains = [
    new Curtain({ anchorX: WX - 0.92, dir: 1, y: ROD_Y - 0.03 - CURTAIN_H / 2, z: -2.38, mat: velvet, openW: 0.3, closedW: 0.97, height: CURTAIN_H }),
    new Curtain({ anchorX: WX + 0.92, dir: -1, y: ROD_Y - 0.03 - CURTAIN_H / 2, z: -2.36, mat: velvet, openW: 0.3, closedW: 0.97, height: CURTAIN_H }),
  ];
  const curtainGroup = new THREE.Group();
  for (const c of curtains) curtainGroup.add(c.mesh);
  group.add(curtainGroup);
  // argolas: acompanham a borda de cada cortina
  const ringGeo = new THREE.TorusGeometry(0.02, 0.004, 6, 12);
  const curtainRings = curtains.map(() => Array.from({ length: 7 }, () => {
    const r = new THREE.Mesh(ringGeo, rod.material);
    r.position.set(0, ROD_Y, -2.4);
    group.add(r);
    return r;
  }));
  let curtainK = 0;
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.3),
    new THREE.MeshBasicMaterial({ map: T.glow(), color: '#3f56b8', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(WX - 0.15, 0.012, -1.2);
  group.add(patch);

  // --- Guarda-roupa no canto direito ---
  const wardrobe = buildWardrobe();
  group.add(wardrobe);
  // pilha de roupas no chão (tecido mole, nada de facetas)
  const clothes = [
    ['#25232d', 1.95, -1.36, 0.36, 0.3, 0.4],
    ['#1d3a5a', 2.1, -1.24, 0.3, 0.24, -0.5],
    ['#3a2a3a', 1.86, -1.18, 0.26, 0.22, 1.2],
    ['#141218', 2.0, -1.3, 0.22, 0.2, 2.2],
  ];
  const clothesGroup = new THREE.Group();
  clothes.forEach(([col, x, z, w, d, ry], i) => {
    const m = softPillow(w, 0.07 + i * 0.01, d, std({ color: col, roughness: 1 }));
    m.position.set(x, 0.035 + i * 0.03, z);
    m.rotation.set((i % 2 ? 0.08 : -0.06), ry, (i % 2 ? -0.1 : 0.07));
    clothesGroup.add(m);
  });
  // manga de moletom caindo para fora
  const sleeveMesh = softPillow(0.26, 0.05, 0.07, std({ color: '#25232d', roughness: 1 }));
  sleeveMesh.position.set(1.76, 0.03, -1.4);
  sleeveMesh.rotation.y = 0.5;
  clothesGroup.add(sleeveMesh);
  group.add(clothesGroup);

  // --- Porta e interruptor (parede da direita) ---
  plane(group, 0.9, 2.05, lam({ map: T.door() }), 2.985, 1.025, 0.85, -Math.PI / 2);
  rb(0.05, 2.12, 0.07, frame, 2.975, 1.06, 0.38, 0.015);
  rb(0.05, 2.12, 0.07, frame, 2.975, 1.06, 1.32, 0.015);
  rb(0.05, 0.07, 1.01, frame, 2.975, 2.1, 0.85, 0.015);
  const SWITCH = new THREE.Vector3(2.98, 1.15, -0.35);
  rb(0.02, 0.12, 0.08, std({ color: '#d8d2e0', roughness: 0.4 }), SWITCH.x, SWITCH.y, SWITCH.z, 0.008);
  // tecla basculante: gira no meio; acesa = parte de cima afundada, apagada = parte de baixo
  const toggle = new THREE.Group();
  toggle.position.set(SWITCH.x - 0.012, SWITCH.y, SWITCH.z);
  group.add(toggle);
  const keyMat = std({ color: '#f4f0f8', roughness: 0.35 });
  const key = new THREE.Mesh(new RoundedBoxGeometry(0.014, 0.07, 0.042, 2, 0.005), keyMat);
  key.castShadow = false;
  key.receiveShadow = true;
  toggle.add(key);
  // frisinho na metade de baixo (onde o dedo aperta para apagar) e o vão da moldura
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.004, 0.03), std({ color: '#c9c2d4', roughness: 0.5 }));
  ridge.position.set(-0.0075, -0.022, 0);
  toggle.add(ridge);
  rb(0.004, 0.08, 0.05, std({ color: '#bfb8ca', roughness: 0.6 }), SWITCH.x - 0.008, SWITCH.y, SWITCH.z, 0.001);
  let switchOn = 0, switchK = 0, switchV = 0; // estado, posição (0 apagada → 1 acesa) e velocidade da mola
  const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.2, 1.0), toneMapped: false }));
  sticker.position.set(2.968, 1.27, -0.35);
  sticker.rotation.y = -Math.PI / 2;
  group.add(sticker);
  // coturnos perto da porta
  const bootMat = std({ color: '#141218', roughness: 0.45 });
  for (const [x, z, ry] of [[2.55, 0.25, 0.2], [2.7, 0.32, -0.15]]) {
    const boot = new THREE.Group();
    const sole = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.035, 0.27, 2, 0.015), std({ color: '#3a3542', roughness: 0.9 }));
    sole.position.y = 0.017;
    const shaft = new THREE.Mesh(new RoundedBoxGeometry(0.095, 0.2, 0.12, 2, 0.04), bootMat);
    shaft.position.set(0, 0.13, -0.07);
    const toe = new THREE.Mesh(new RoundedBoxGeometry(0.095, 0.075, 0.16, 2, 0.035), bootMat);
    toe.position.set(0, 0.065, 0.05);
    boot.add(sole, shaft, toe);
    boot.traverse((o) => o.isMesh && (o.castShadow = true));
    boot.position.set(x, 0, z);
    boot.rotation.y = ry;
    group.add(boot);
  }

  // --- Estante de livros (parede da esquerda) ---
  const shelf = buildBookshelf();
  shelf.group.position.set(-2.83, 0, -0.35);
  group.add(shelf.group);
  // discos de vinil
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.008, 28), std({ color: i % 2 ? '#1a1420' : '#221b2a', roughness: 0.3 }));
    d.position.set(-2.4, 0.004 + i * 0.009, 0.45);
    d.rotation.y = i;
    group.add(d);
  }
  const sleeve = plane(group, 0.3, 0.3, lam({ map: T.vinyl() }), -2.66, 0.15, 0.55, Math.PI / 2 - 0.2);
  sleeve.rotation.z = 0.15;

  // --- Mochila (no chão, encostada na cama) ---
  const bag = buildBackpack();
  bag.closed.position.set(-0.62, 0, -1.02);
  bag.closed.rotation.set(-0.1, 0.4, 0);
  bag.open.position.set(-0.62, 0, -1.02);
  bag.open.rotation.set(-0.08, 0.4, 0);
  group.add(bag.closed, bag.open);

  // --- Papéis caídos no chão (ingressos, recibo, bilhete) ---
  const papers = makePapers();
  const papersGroup = new THREE.Group();
  for (const p of papers) papersGroup.add(p.mesh);
  group.add(papersGroup);

  // --- Pôsteres e quadros ---
  plane(group, 0.5, 0.67, lam({ map: T.poster1() }), -2.05, 1.72, -2.49);
  plane(group, 0.38, 0.38, lam({ map: T.poster2() }), -1.35, 1.95, -2.49);
  plane(group, 0.42, 0.56, lam({ map: T.poster4() }), 0.38, 1.95, -2.49);
  plane(group, 0.5, 0.33, lam({ map: T.cork() }), 0.38, 1.3, -2.49);
  plane(group, 0.36, 0.5, lam({ map: T.poster5() }), -2.985, 1.75, -1.55, Math.PI / 2);
  plane(group, 0.6, 0.8, lam({ map: T.poster3() }), 2.985, 1.75, -1.1, -Math.PI / 2);
  plane(group, 0.32, 0.44, lam({ map: T.poster6() }), 2.985, 1.85, -0.3, -Math.PI / 2);
  if (posts) {
    polaroid(group, posts[22].small, -0.95, 1.55, -2.488, 0.12);
    polaroid(group, posts[21].small, -0.68, 1.62, -2.488, -0.09);
    polaroid(group, posts[18].small, -0.8, 1.32, -2.488, 0.05);
  }

  // --- Varal de luzinhas (acima da cama) ---
  const bulbs = [];
  const wire = [];
  const a = new THREE.Vector3(-2.75, 2.3, -2.46);
  const b = new THREE.Vector3(-0.1, 2.3, -2.46);
  const warm = ['#ffcf7a', '#ff9ec4', '#9ee7ff', '#ffe9a8'];
  const N = 20;
  for (let i = 0; i <= 40; i++) {
    const k = i / 40;
    wire.push(new THREE.Vector3(THREE.MathUtils.lerp(a.x, b.x, k), a.y - Math.sin(k * Math.PI) * 0.3, a.z));
  }
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wire), new THREE.LineBasicMaterial({ color: '#0d0a12' })));
  const bulbGeo = new THREE.IcosahedronGeometry(0.024, 0);
  for (let i = 0; i < N; i++) {
    const k = (i + 0.5) / N;
    const col = new THREE.Color(warm[i % warm.length]);
    const m = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: col.clone(), toneMapped: false }));
    m.position.set(THREE.MathUtils.lerp(a.x, b.x, k), a.y - Math.sin(k * Math.PI) * 0.3 - 0.03, a.z + 0.01);
    m.userData = { base: col, phase: Math.random() * 6.28, speed: 0.6 + Math.random() * 1.4 };
    group.add(m);
    bulbs.push(m);
  }
  // luz quente de preenchimento perto do guarda-roupa (senão o canto some)
  const fillLight = new THREE.PointLight('#ffb08a', 0, 0, 2);
  fillLight.position.set(1.9, 1.7, -1.0);
  group.add(fillLight);
  const fairyLight = new THREE.PointLight('#ff9d5c', 0, 0, 2);
  fairyLight.position.set(-1.4, 2.0, -2.15);
  group.add(fairyLight);

  // --- Lustre do teto ---
  const LAMP = new THREE.Vector3(0.1, 2.45, -0.95);
  const lampWire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(LAMP.x, 2.8, LAMP.z), new THREE.Vector3(LAMP.x, LAMP.y + 0.08, LAMP.z)]),
    new THREE.LineBasicMaterial({ color: '#0d0a12' })
  );
  group.add(lampWire);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.22, 0.17, 12, 1, true), lam({ color: '#d8cbb8', side: THREE.DoubleSide }));
  shade.position.copy(LAMP);
  group.add(shade);
  const bulbMat = new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), bulbMat);
  bulb.position.copy(LAMP).add(new THREE.Vector3(0, -0.06, 0));
  group.add(bulb);
  const ceiling = new THREE.PointLight('#ffd7a8', 0, 0, 2);
  ceiling.position.copy(LAMP).add(new THREE.Vector3(0, -0.15, 0));
  group.add(ceiling);

  // --- Luzes gerais ---
  const hemi = new THREE.HemisphereLight('#2c2552', '#07060c', 0.08);
  group.add(hemi);
  const moon = new THREE.DirectionalLight('#7f9cff', 0.75);
  // lua baixa e de lado: os feixes atravessam o quarto na diagonal (cinema)
  moon.position.set(4.0, 2.82, -3.79);
  moon.target.position.set(0.6, 0, 0.3);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 12 });
  moon.shadow.bias = -0.002;
  group.add(moon, moon.target);

  group.traverse((o) => {
    if (o.isMesh && o.material?.isMeshBasicMaterial) o.castShadow = false;
  });

  // --- Objetos com interação (posição no corredor onde ela anda) ---
  const lampParts = [shade, bulb, lampWire];
  const interactables = [
    { id: 'estante', x: -2.3, label: 'Estante', anchor: new THREE.Vector3(-2.65, 1.95, -0.35), obj: shelf.group },
    { id: 'cama', x: -1.7, label: 'Travesseiro', anchor: new THREE.Vector3(-1.75, 0.95, -1.4), obj: bed.pillow },
    { id: 'mochila', x: -0.62, label: 'Mochila', anchor: new THREE.Vector3(-0.62, 0.62, -1.02), obj: bag.closed },
    { id: 'criado', x: 0.08, label: 'Criado-mudo', anchor: new THREE.Vector3(0.1, 1.0, -2.1), obj: ns.group },
    { id: 'ingressos', x: 0.62, label: 'Papéis no chão', anchor: new THREE.Vector3(0.68, 0.35, -0.62), obj: papersGroup },
    { id: 'cortina', x: 1.02, label: 'Fechar cortina', anchor: new THREE.Vector3(WX - 0.6, 2.25, -2.38), obj: curtainGroup },
    { id: 'gaveta', x: 1.45, label: 'Gaveta', anchor: new THREE.Vector3(DX, 1.0, -1.85), obj: drawer.group },
    { id: 'roupas', x: 1.95, label: 'Roupas', anchor: new THREE.Vector3(1.95, 0.45, -1.3), obj: clothesGroup },
    { id: 'armario', x: 2.35, label: 'Guarda-roupa', anchor: new THREE.Vector3(2.55, 2.1, -1.9), obj: wardrobe },
    { id: 'interruptor', x: 2.72, label: 'Interruptor', anchor: new THREE.Vector3(2.9, 1.42, -0.35) },
  ];

  let light = 0;
  let flicker = 1;
  let plasmaTouch = 0;
  let plasmaOn = false; // ligada à mão: fica acesa mesmo com o quarto escuro

  // dados para a iluminação cinematográfica (cinema.js)
  const cineOpen = new THREE.Vector2();
  const cine = {
    win: new THREE.Vector4(WX - 0.6, WX + 0.6, WY - 0.5, WY + 0.5),
    winZ: -2.46,
    mull: new THREE.Vector2(WX, WY + 0.12),
    lamp: LAMP.clone().add(new THREE.Vector3(0, -0.02, 0)),
    moon,
    ceiling,
    beamGain: 3.2,
    patch,
    // faixa da janela que as cortinas deixam aberta
    get open() {
      const [L, R] = curtains;
      return cineOpen.set(L.anchorX + lerpN(L.openW, L.closedW, L.k), R.anchorX - lerpN(R.openW, R.closedW, R.k));
    },
  };

  return {
    group,
    cine,
    lane: { z: -0.72, minX: -2.45, maxX: 2.72 },
    interactables,
    bed,
    pillow: bed.pillow,
    nightstand: ns,
    plasma,
    books: shelf.books,
    shelf: shelf.group,
    backpack: bag,
    papers,
    lampParts,
    drawer: {
      group: drawer.group,
      stripMesh: drawer.stripMesh,
      setOpen(k) {
        drawer.group.position.z = DRAWER_Z + 0.34 * k;
      },
    },
    toggle,
    sticker,
    // tecla do interruptor (só a peça 3D; a luz é setLight). snap = sem animar
    setSwitch(on, snap = false) {
      switchOn = on ? 1 : 0;
      if (snap) {
        switchK = switchOn;
        switchV = 0;
      }
    },
    get switchOn() {
      return switchOn === 1;
    },
    get light() {
      return light;
    },
    get flicker() {
      return flicker;
    },
    setLight(k, f = 1) {
      light = k;
      flicker = f;
    },
    get curtain() {
      return curtainK;
    },
    // k: 0 aberta, 1 fechada. stagger: atraso da cortina da direita (0..1)
    setCurtain(kL, kR = kL) {
      curtains[0].k = kL;
      curtains[1].k = kR;
      curtainK = (kL + kR) / 2;
    },
    shakeCurtains(amount = 1) {
      for (const c of curtains) c.wave = Math.max(c.wave, amount);
    },
    // luminária de plasma ligada pela Ani (no escuro é a única coisa que ela consegue ligar)
    get plasmaOn() {
      return plasmaOn;
    },
    setPlasma(on) {
      plasmaOn = !!on;
    },
    // uv do sprite da luminária (ou null) e o ponto 3D correspondente
    setPlasmaTouch(uv, world) {
      plasma.setTouch(uv);
      if (uv && plasma.touching && world) plasmaTarget.copy(world).lerp(PLASMA, 0.25);
      else plasmaTarget.copy(PLASMA_LIGHT);
    },
    update(t, dt = 0.016) {
      const k = light * flicker;
      hemi.intensity = lerpN(0.08, 0.75, k);
      ceiling.intensity = 12 * k;
      bulbMat.color.setScalar(3 * k);
      fairyLight.intensity = 1.6 * light;
      fillLight.intensity = 1.3 * k;
      plasmaTouch += ((plasma.touching ? 1 : 0) - plasmaTouch) * Math.min(1, dt * 8);
      // acesa com a luz do quarto ou quando ela liga à mão (aí brilha sozinha no escuro)
      const plasmaLit = light > 0.5 || plasmaOn;
      plasmaLight.intensity = (0.7 + plasmaTouch * 1.1) * (plasmaOn ? 1 : light);
      plasmaLight.position.lerp(plasmaTarget, Math.min(1, dt * 10));
      ledRing.material.color.setRGB(0.77, 0.42, 1).multiplyScalar(plasmaLit ? 1.4 + plasmaTouch : 0.25);
      plasma.update(dt, plasmaLit);
      bag.update(t, dt);
      sticker.visible = light < 0.5;
      // tecla: mola rígida com um tiquinho de passada (clique físico)
      switchV += ((switchOn - switchK) * 900 - switchV * 30) * dt;
      switchK += switchV * dt;
      toggle.rotation.z = lerpN(0.22, -0.22, switchK); // + = topo para fora (apagada)
      for (const bulbM of bulbs) {
        const { base, phase, speed } = bulbM.userData;
        const tw = 0.75 + 0.25 * Math.sin(t * speed + phase);
        bulbM.material.color.copy(base).multiplyScalar(light > 0.5 ? 2.4 * tw : 0.1);
      }
      // cortinas: tecido, argolas, luar
      curtains.forEach((c, i) => {
        c.update(t, dt);
        const w = lerpN(c.openW, c.closedW, c.k);
        curtainRings[i].forEach((r, j) => {
          r.position.x = c.anchorX + c.dir * (j / 6) * w;
        });
      });
      // nuvens passando na frente da lua: o luar respira devagar
      const cloud = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.13) * Math.sin(t * 0.071 + 1.3));
      moon.intensity = 0.75 * (1 - 0.82 * curtainK) * cloud;
      patch.material.opacity = 0.32 * (1 - 0.92 * curtainK);
    },
  };
}

function lerpN(a, b, k) {
  return a + (b - a) * k;
}
