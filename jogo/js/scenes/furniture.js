import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { drawText } from '../engine/pixeltext.js';

// ===============================================================
// Móveis com cara de Until Then: formas arredondadas e macias,
// tecidos com caimento, texturas em pixel art. Tudo com poucos
// polígonos e materiais simples, para rodar leve no navegador.
// ===============================================================

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER[(x & 3) + (y & 3) * 4] + 0.5) / 16;
const seeded = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

function canvasTex(w, h, draw, { repeat = [1, 1], wrap = true } = {}) {
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
  if (wrap) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.userData.canvas = c;
  return t;
}
const px = (ctx, x, y, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 1, 1);
};

// --- Texturas ---
export const TX = {
  // madeira escura com veios
  wood: (seed = 1, base = ['#4a3428', '#3f2c22', '#563d2f']) =>
    canvasTex(32, 32, (ctx) => {
      const r = seeded(seed);
      for (let y = 0; y < 32; y++) {
        const k = Math.sin(y * 0.55 + r() * 0.4) * 0.5 + 0.5;
        ctx.fillStyle = k > 0.66 ? base[2] : k > 0.33 ? base[0] : base[1];
        ctx.fillRect(0, y, 32, 1);
      }
      for (let i = 0; i < 26; i++) {
        let x = r() * 32;
        const y = Math.floor(r() * 32);
        for (let s = 0; s < 6; s++) px(ctx, Math.floor((x += 1)) % 32, y, base[1]);
      }
    }),
  // madeira pintada (roxo escuro) com desgaste
  painted: () =>
    canvasTex(32, 32, (ctx) => {
      const r = seeded(77);
      ctx.fillStyle = '#3a2a44';
      ctx.fillRect(0, 0, 32, 32);
      for (let y = 0; y < 32; y += 2) {
        ctx.fillStyle = r() < 0.5 ? '#35263f' : '#3f2e4a';
        ctx.fillRect(0, y, 32, 1);
      }
      for (let i = 0; i < 18; i++) px(ctx, Math.floor(r() * 32), Math.floor(r() * 32), '#5a4a66');
    }),
  sheet: () =>
    canvasTex(32, 32, (ctx) => {
      ctx.fillStyle = '#d6cfe0';
      ctx.fillRect(0, 0, 32, 32);
      const r = seeded(5);
      for (let i = 0; i < 9; i++) {
        let x = r() * 32, y = r() * 32;
        for (let s = 0; s < 8; s++) px(ctx, Math.floor((x += 1)) % 32, Math.floor((y += r() - 0.5)) & 31, '#bdb4cc');
      }
    }),
  plaid: () =>
    canvasTex(32, 32, (ctx) => {
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
    }, { repeat: [3, 3] }),
  velvet: () =>
    canvasTex(16, 32, (ctx) => {
      for (let y = 0; y < 32; y++)
        for (let x = 0; x < 16; x++) px(ctx, x, y, dith(x, y) < 0.25 ? '#244a54' : '#2c5a66');
      ctx.fillStyle = '#1c3a42';
      ctx.fillRect(0, 30, 16, 2);
    }, { repeat: [3, 1] }),
};

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0, ...o });
const metal = () => new THREE.MeshStandardMaterial({ color: '#b9b4c4', roughness: 0.35, metalness: 0.8 });

function rbox(w, h, d, mat, r = 0.012, seg = 2) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function at(obj, x, y, z, ry = 0) {
  obj.position.set(x, y, z);
  obj.rotation.y = ry;
  return obj;
}
function cyl(rt, rb, h, mat, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Travesseiro fofo: caixa arredondada com as bordas "murchas"
export function pillow(w, h, d, mat) {
  const geo = new RoundedBoxGeometry(w, h, d, 4, Math.min(h / 2 - 0.001, 0.05));
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2), z = p.getZ(i) / (d / 2);
    const e = Math.max(Math.abs(x), Math.abs(z));
    p.setY(i, p.getY(i) * (1 - 0.55 * Math.pow(e, 3)));
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Tecido caindo sobre a cama (edredom): plano dobrado com rugas
function duvet({ w, d, top, halfDepth, footX, mat }) {
  const geo = new THREE.PlaneGeometry(w, d, 36, 30);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const dz = Math.max(0, Math.abs(z) - halfDepth);
    const dx = Math.max(0, x - footX);
    const drop = Math.max(dz, dx);
    let y = top + 0.018 * Math.sin(x * 7.3 + z * 2.1) + 0.012 * Math.sin(z * 11 - x * 3) + 0.02 * Math.exp(-((x + 0.2) ** 2) * 4);
    y -= Math.min(drop * 2.2, top - 0.3);
    const out = Math.min(drop, 0.06) * 0.5;
    p.setXYZ(i, x + (dx > 0 ? out : 0), y, z + (dz > 0 ? Math.sign(z) * out : 0));
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.material.side = THREE.DoubleSide;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------
// Cama (cabeceira na parede da esquerda)
// ---------------------------------------------------------------
export function buildBed() {
  const g = new THREE.Group();
  const wood = std({ map: TX.wood(3), roughness: 0.7 });
  // estrado e pés
  g.add(at(rbox(2.4, 0.22, 1.3, wood, 0.03), -1.55, 0.17, -1.85));
  for (const [x, z] of [[-2.7, -2.45], [-0.4, -2.45], [-2.7, -1.25], [-0.4, -1.25]]) g.add(at(cyl(0.03, 0.025, 0.08, wood, 8), x, 0.04, z));
  // cabeceira com ripas
  g.add(at(rbox(0.07, 1.05, 0.07, wood, 0.02), -2.78, 0.6, -2.47));
  g.add(at(rbox(0.07, 1.05, 0.07, wood, 0.02), -2.78, 0.6, -1.23));
  g.add(at(rbox(0.08, 0.08, 1.32, wood, 0.03), -2.78, 1.1, -1.85));
  g.add(at(rbox(0.06, 0.06, 1.24, wood, 0.02), -2.78, 0.42, -1.85));
  for (let i = 0; i < 6; i++) g.add(at(rbox(0.035, 0.6, 0.06, wood, 0.012), -2.78, 0.75, -2.3 + i * 0.09 + 0.05));
  // colchão
  g.add(at(rbox(2.3, 0.2, 1.22, std({ map: TX.sheet(), roughness: 0.9 }), 0.07, 3), -1.55, 0.38, -1.85));
  // edredom xadrez caindo pelas bordas
  const dv = duvet({ w: 1.75, d: 1.5, top: 0.51, halfDepth: 0.61, footX: 0.62, mat: std({ map: TX.plaid(), roughness: 0.95 }) });
  dv.position.set(-1.0, 0, -1.85);
  g.add(dv);
  // dobra do lençol perto dos travesseiros
  const fold = pillow(0.32, 0.06, 1.24, std({ map: TX.sheet(), roughness: 0.9 }));
  fold.position.set(-1.92, 0.52, -1.85);
  g.add(fold);
  // travesseiros
  const pw = pillow(0.46, 0.15, 0.62, std({ color: '#e6e0ee', roughness: 0.95 }));
  at(pw, -2.45, 0.56, -2.08, 0.12);
  g.add(pw);
  const pb = pillow(0.44, 0.15, 0.56, std({ color: '#25212e', roughness: 0.95 }));
  at(pb, -2.38, 0.57, -1.55, -0.1);
  pb.rotation.z = 0.08;
  g.add(pb);
  // gatinho de pelúcia
  const plush = std({ color: '#1d1a24', roughness: 1 });
  const cat = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), plush);
  body.scale.set(1, 0.85, 0.9);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), plush);
  head.position.set(0, 0.11, 0.02);
  const earGeo = new THREE.ConeGeometry(0.025, 0.05, 4);
  const e1 = new THREE.Mesh(earGeo, plush), e2 = new THREE.Mesh(earGeo, plush);
  e1.position.set(-0.04, 0.17, 0.02);
  e2.position.set(0.04, 0.17, 0.02);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#ffe36b' });
  const ey1 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), eyeM), ey2 = ey1.clone();
  ey1.position.set(-0.025, 0.12, 0.085);
  ey2.position.set(0.025, 0.12, 0.085);
  cat.add(body, head, e1, e2, ey1, ey2);
  cat.position.set(-2.1, 0.6, -2.18);
  cat.rotation.y = 0.5;
  g.add(cat);
  return { group: g, pillow: pw, pillowDark: pb };
}

// ---------------------------------------------------------------
// Criado-mudo com gaveta e objetos
// ---------------------------------------------------------------
export function buildNightstand() {
  const g = new THREE.Group();
  const wood = std({ map: TX.wood(9), roughness: 0.7 });
  g.add(at(rbox(0.48, 0.44, 0.42, wood, 0.02), 0.12, 0.28, -2.22));
  g.add(at(rbox(0.54, 0.035, 0.46, wood, 0.012), 0.12, 0.515, -2.21));
  for (const [x, z] of [[-0.08, -2.4], [0.32, -2.4], [-0.08, -2.04], [0.32, -2.04]]) g.add(at(cyl(0.018, 0.014, 0.06, wood, 6), x, 0.03, z));
  g.add(at(rbox(0.42, 0.15, 0.02, std({ map: TX.wood(10), roughness: 0.6 }), 0.008), 0.12, 0.38, -2.0));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), metal());
  knob.position.set(0.12, 0.38, -1.985);
  g.add(knob);

  // objetos em cima (y = 0.533)
  const Y = 0.533;
  const items = {};
  // despertador
  const clock = new THREE.Group();
  clock.add(rbox(0.16, 0.09, 0.07, std({ color: '#141218', roughness: 0.4 }), 0.02));
  clock.position.set(0.3, Y + 0.045, -2.12);
  clock.rotation.y = -0.35;
  g.add(clock);
  items.clock = clock;
  // copo d'água
  const glass = new THREE.Group();
  const gm = new THREE.MeshStandardMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.35, roughness: 0.1 });
  glass.add(cyl(0.032, 0.028, 0.1, gm, 12));
  const water = cyl(0.029, 0.026, 0.06, new THREE.MeshStandardMaterial({ color: '#7fa6d8', transparent: true, opacity: 0.45, roughness: 0.05 }), 12);
  water.position.y = -0.018;
  glass.add(water);
  glass.position.set(0.31, Y + 0.05, -2.33);
  g.add(glass);
  items.glass = glass;
  // porta-retrato virado para baixo
  const frame = new THREE.Group();
  frame.add(rbox(0.13, 0.012, 0.17, std({ color: '#2a2230', roughness: 0.6 }), 0.004));
  const backPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.13), std({ color: '#8a6e50', roughness: 1 }));
  const standLeg = rbox(0.022, 0.006, 0.09, std({ color: '#6b5238', roughness: 1 }), 0.002);
  standLeg.position.set(0, 0.009, 0.01);
  frame.add(standLeg);
  for (const [x, z] of [[-0.045, -0.06], [0.045, -0.06], [-0.045, 0.06], [0.045, 0.06]]) {
    const clip = rbox(0.01, 0.004, 0.006, metal(), 0.001);
    clip.position.set(x, 0.008, z);
    frame.add(clip);
  }
  backPlate.rotation.x = -Math.PI / 2;
  backPlate.position.y = 0.0065;
  frame.add(backPlate);
  frame.position.set(0.17, Y + 0.007, -2.36);
  frame.rotation.y = 0.4;
  g.add(frame);
  items.frame = frame;
  // potinho de anéis (com uma folhinha verde lá dentro)
  const dish = new THREE.Group();
  const cer = std({ color: '#e8dfe8', roughness: 0.4 });
  dish.add(cyl(0.05, 0.035, 0.018, cer, 14));
  const ringM = metal();
  for (const [x, z, r] of [[-0.015, 0.01, 0.4], [0.018, -0.008, 1.2], [0.0, -0.02, 2]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.0025, 6, 14), ringM);
    ring.rotation.set(Math.PI / 2 - 0.2, r, 0);
    ring.position.set(x, 0.012, z);
    dish.add(ring);
  }
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.007, 8), new THREE.MeshStandardMaterial({ color: '#5fbf7a', roughness: 0.4 }));
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.set(0.02, 0.0105, 0.018);
  leaf.scale.set(1, 1.4, 1);
  dish.add(leaf);
  dish.position.set(-0.05, Y + 0.009, -2.08);
  g.add(dish);
  items.dish = dish;
  return { group: g, items };
}

// ---------------------------------------------------------------
// Escrivaninha (o tampo e as pernas; a gaveta vem do room.js)
// ---------------------------------------------------------------
export function buildDesk(DX, DZ) {
  const g = new THREE.Group();
  const wood = std({ map: TX.wood(21), roughness: 0.65 });
  g.add(at(rbox(1.32, 0.045, 0.62, wood, 0.015), DX, 0.752, DZ));
  for (const [dx, dz] of [[-0.6, -0.26], [0.6, -0.26], [-0.6, 0.26], [0.6, 0.26]]) g.add(at(cyl(0.025, 0.018, 0.73, wood, 8), DX + dx, 0.365, DZ + dz));
  g.add(at(rbox(0.015, 0.14, 0.56, wood, 0.005), DX - 0.335, 0.655, DZ));
  g.add(at(rbox(0.015, 0.14, 0.56, wood, 0.005), DX + 0.335, 0.655, DZ));
  g.add(at(rbox(0.68, 0.012, 0.56, wood, 0.004), DX, 0.58, DZ));
  g.add(at(rbox(1.2, 0.04, 0.02, wood, 0.01), DX, 0.1, DZ - 0.26)); // travessa
  return g;
}

export function buildChair() {
  const g = new THREE.Group();
  const m = std({ color: '#2c2836', roughness: 0.6 });
  const cushion = std({ color: '#5e2c66', roughness: 0.95 });
  g.add(at(rbox(0.42, 0.04, 0.42, m, 0.015), 0, 0.45, 0));
  g.add(at(pillow(0.38, 0.05, 0.38, cushion), 0, 0.49, 0));
  g.add(at(rbox(0.4, 0.26, 0.035, m, 0.015), 0, 0.82, -0.19));
  g.add(at(rbox(0.03, 0.36, 0.03, m, 0.01), -0.17, 0.64, -0.19));
  g.add(at(rbox(0.03, 0.36, 0.03, m, 0.01), 0.17, 0.64, -0.19));
  for (const [dx, dz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) g.add(at(cyl(0.016, 0.013, 0.44, m, 6), dx, 0.22, dz));
  return g;
}

// ---------------------------------------------------------------
// Guarda-roupa
// ---------------------------------------------------------------
function sticker(w, h, draw) {
  const t = canvasTex(Math.round(w * 400), Math.round(h * 400), draw, { wrap: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.5, roughness: 0.5 }));
  return m;
}

export function buildWardrobe() {
  const g = new THREE.Group();
  const paint = std({ map: TX.painted(), roughness: 0.6 });
  const paintDark = std({ color: '#2a1f32', roughness: 0.7 });
  const W = 0.86, H = 1.96, D = 0.55, X = 2.55, Z = -2.2;
  const front = Z + D / 2;
  // corpo, rodapé e moldura
  g.add(at(rbox(W, H, D, paint, 0.015), X, 0.1 + H / 2, Z));
  g.add(at(rbox(W + 0.04, 0.08, D + 0.04, paintDark, 0.015), X, 0.06, Z));
  for (const dx of [-0.38, 0.38]) g.add(at(cyl(0.022, 0.02, 0.03, paintDark, 8), X + dx, 0.012, front - 0.05));
  g.add(at(rbox(W + 0.08, 0.05, D + 0.07, paintDark, 0.015), X, 0.1 + H + 0.02, Z + 0.01));
  g.add(at(rbox(W + 0.03, 0.03, D + 0.04, paint, 0.01), X, 0.1 + H - 0.01, Z + 0.01));
  // portas com almofadas em relevo
  for (const side of [-1, 1]) {
    const dx = side * (W / 4 + 0.002);
    const door = new THREE.Group();
    door.add(rbox(W / 2 - 0.012, H - 0.12, 0.022, paint, 0.008));
    for (const [py, ph] of [[0.42, 0.58], [-0.36, 0.86]]) {
      const panel = rbox(W / 2 - 0.1, ph, 0.012, paint, 0.012, 3);
      panel.position.set(0, py, 0.014);
      door.add(panel);
      const groove = new THREE.Mesh(new THREE.PlaneGeometry(W / 2 - 0.085, ph + 0.015), paintDark);
      groove.position.set(0, py, 0.0115);
      door.add(groove);
    }
    door.position.set(X + dx, 0.1 + H / 2, front + 0.011);
    g.add(door);
    // puxador de metal
    const handle = new THREE.Group();
    const bar = cyl(0.007, 0.007, 0.16, metal(), 8);
    handle.add(bar);
    const p1 = cyl(0.005, 0.005, 0.03, metal(), 6), p2 = p1.clone();
    p1.rotation.x = p2.rotation.x = Math.PI / 2;
    p1.position.set(0, 0.06, -0.015);
    p2.position.set(0, -0.06, -0.015);
    handle.add(p1, p2);
    handle.position.set(X + side * 0.035, 0.1 + H / 2 + 0.05, front + 0.05);
    g.add(handle);
  }
  // fechadura
  const key = new THREE.Mesh(new THREE.CircleGeometry(0.009, 8), new THREE.MeshBasicMaterial({ color: '#0d0a12' }));
  key.position.set(X + 0.035, 0.1 + H / 2 - 0.06, front + 0.048);
  g.add(key);

  // adesivos e polaroide nas portas
  const fz = front + 0.0375;
  const st = [
    [0.09, 0.09, X - 0.27, 1.62, 0.1, (ctx, w, h) => { // estrela
      ctx.fillStyle = '#ffe36b';
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const a = Math.atan2(y - h / 2, x - w / 2), r = Math.hypot(x - w / 2, y - h / 2) / (w / 2);
        if (r < 0.45 + 0.4 * Math.abs(Math.cos(a * 2.5))) ctx.fillRect(x, y, 1, 1);
      }
    }],
    [0.11, 0.1, X + 0.24, 1.48, -0.15, (ctx, w, h) => { // coração
      ctx.fillStyle = '#ff6b9a';
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const u = (x / w - 0.5) * 2.4, v = (0.4 - y / h) * 2.4;
        if ((u * u + v * v - 1) ** 3 - u * u * v * v * v < 0) ctx.fillRect(x, y, 1, 1);
      }
    }],
    [0.16, 0.07, X - 0.22, 0.62, -0.08, (ctx, w, h) => { // logo de banda
      ctx.fillStyle = '#121016';
      ctx.fillRect(0, 0, w, h);
      drawText(ctx, 'MOTH', w / 2, 4, { size: 16, weight: 700, color: '#f0e8ff', align: 'center' });
    }],
    [0.1, 0.1, X + 0.22, 0.85, 0.2, (ctx, w, h) => { // lua
      ctx.fillStyle = '#b48cff';
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d1 = Math.hypot(x - w / 2, y - h / 2), d2 = Math.hypot(x - w * 0.65, y - h * 0.38);
        if (d1 < w * 0.45 && d2 > w * 0.36) ctx.fillRect(x, y, 1, 1);
      }
    }],
    [0.13, 0.05, X + 0.2, 1.2, -0.05, (ctx, w, h) => { // "NÃO ABRA"
      ctx.fillStyle = '#e8e2d0';
      ctx.fillRect(0, 0, w, h);
      drawText(ctx, 'NÃO ABRA', w / 2, 2, { font: 'tiny', size: 16, color: '#a8324d', align: 'center' });
    }],
  ];
  for (const [w, h, x, y, rz, draw] of st) {
    const s = sticker(w, h, draw);
    s.position.set(x, y, fz);
    s.rotation.z = rz;
    g.add(s);
  }

  // bolsa de pano pendurada no puxador
  const tote = sticker(0.26, 0.34, (ctx, w, h) => {
    ctx.fillStyle = '#d9cfb8';
    ctx.fillRect(0, h * 0.25, w, h * 0.75);
    ctx.fillStyle = '#b8ad96';
    ctx.fillRect(0, h * 0.25, w, 3);
    ctx.strokeStyle = '#d9cfb8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.27, w * 0.32, Math.PI, 0);
    ctx.stroke();
    drawText(ctx, 'SAVE', w / 2, h * 0.45, { size: 24, weight: 700, color: '#2a1f32', align: 'center' });
    drawText(ctx, 'THE BATS', w / 2, h * 0.65, { size: 16, color: '#2a1f32', align: 'center' });
  });
  tote.position.set(X - 0.1, 1.0, front + 0.07);
  tote.rotation.set(0.06, 0, 0.05);
  g.add(tote);

  // cachecol listrado jogado por cima da porta
  const scarfGeo = new THREE.PlaneGeometry(0.1, 0.9, 1, 16);
  const sp = scarfGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const y = sp.getY(i);
    const t = (0.45 - y) / 0.9; // 0 no topo
    // passa por cima da porta: parte de trás, topo, frente
    const zz = t < 0.15 ? -0.05 + t * 0.6 : 0.04 + Math.sin(t * 9) * 0.008;
    const yy = t < 0.15 ? 0.45 + Math.sin(t * 20) * 0.02 : 0.45 - (t - 0.15) * 1.0;
    sp.setXYZ(i, sp.getX(i) + Math.sin(t * 6) * 0.01, yy, zz);
  }
  scarfGeo.computeVertexNormals();
  const scarf = new THREE.Mesh(scarfGeo, std({
    map: canvasTex(4, 32, (ctx) => {
      for (let y = 0; y < 32; y++) {
        ctx.fillStyle = Math.floor(y / 3) % 2 ? '#1a1420' : '#a8324d';
        ctx.fillRect(0, y, 4, 1);
      }
    }),
    side: THREE.DoubleSide,
    roughness: 1,
  }));
  scarf.position.set(X + 0.3, 0.1 + H - 0.42, front);
  scarf.castShadow = true;
  g.add(scarf);

  // caixas em cima
  const box1 = rbox(0.42, 0.22, 0.38, std({ color: '#c9b79c', roughness: 0.9 }), 0.01);
  box1.position.set(X - 0.12, 0.1 + H + 0.16, Z);
  box1.rotation.y = 0.08;
  g.add(box1);
  const box2 = rbox(0.3, 0.14, 0.26, std({ color: '#6a5a8a', roughness: 0.9 }), 0.01);
  box2.position.set(X + 0.16, 0.1 + H + 0.12, Z - 0.02);
  box2.rotation.y = -0.15;
  g.add(box2);
  return g;
}

// ---------------------------------------------------------------
// Estante com livros de verdade (cada lombada tem título)
// ---------------------------------------------------------------
export const BOOKS = [
  { t: 'CARTAS NÃO ENVIADAS', c: '#2b2a44', line: 'Escrevi umas. Nunca mandei.' },
  { t: 'TARÔ PARA INICIANTES', c: '#5e2c66', line: 'A carta da Torre saiu três vezes seguidas.' },
  { t: 'CORVOS DE INVERNO', c: '#1c2e2a', line: 'Li duas vezes.' },
  { t: 'A LUA SABE', c: '#1d1640', line: 'Esse foi presente.' },
  { t: 'BIOLOGIA 2º ANO', c: '#2f7a4a', line: 'Prova segunda. Não estudei.' },
  { t: 'MANGÁ VOL. 7', c: '#d0d0d8', line: 'Falta o volume 8.' },
  { t: 'POEMAS DO FIM', c: '#8a3b4f', line: 'Sublinhei metade.' },
  { t: 'GUIA DE PLANTAS', c: '#3e7a5a', line: 'Matei três suculentas.' },
];
const FILL = ['#8a3b4f', '#2f5d8a', '#c9a24a', '#3e7a5a', '#5b3e8a', '#d0d0d8', '#1d1d24', '#a86b3a', '#2a2a40', '#7a2f2f'];

function spineTexture(title, color, seed) {
  const r = seeded(seed);
  return canvasTex(16, 96, (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 96);
    const light = ['#d0d0d8', '#c9a24a', '#e8e2d0'].includes(color);
    const ink = light ? '#2a1f32' : '#e8dcc0';
    ctx.fillStyle = ink;
    ctx.fillRect(0, 6, 16, 1);
    ctx.fillRect(0, 89, 16, 1);
    if (r() < 0.5) {
      ctx.fillRect(0, 9, 16, 1);
      ctx.fillRect(0, 86, 16, 1);
    }
    if (title) {
      ctx.save();
      ctx.translate(4, 84);
      ctx.rotate(-Math.PI / 2);
      drawText(ctx, title.length > 15 ? title.slice(0, 15) : title, 0, 0, { font: 'tiny', size: 8, color: ink });
      ctx.restore();
    }
  }, { wrap: false });
}

export function buildBookshelf() {
  const g = new THREE.Group(); // estante virada para +x (encostada na parede da esquerda)
  const wood = std({ map: TX.wood(33), roughness: 0.7 });
  const H = 1.8, D = 0.3, W = 1.0;
  g.add(at(rbox(D, H, 0.03, wood, 0.008), 0, H / 2, -W / 2));
  g.add(at(rbox(D, H, 0.03, wood, 0.008), 0, H / 2, W / 2));
  g.add(at(rbox(0.02, H, W, wood, 0.005), -D / 2 + 0.01, H / 2, 0));
  const shelvesY = [];
  for (let i = 0; i < 5; i++) {
    const y = 0.03 + i * 0.43;
    shelvesY.push(y);
    g.add(at(rbox(D, 0.03, W - 0.02, wood, 0.006), 0, y, 0));
  }

  const books = [];
  const pages = std({ color: '#e8e0cc', roughness: 1 });
  const r = seeded(4);
  let special = 0;
  for (let s = 0; s < 4; s++) {
    let z = -W / 2 + 0.05;
    const limit = s === 0 ? W / 2 - 0.25 : W / 2 - 0.06;
    while (z < limit) {
      const isSpecial = special < BOOKS.length && r() < 0.3;
      const info = isSpecial ? BOOKS[special++] : null;
      const h = 0.22 + r() * 0.12;
      const t = 0.025 + r() * 0.03;
      const d = 0.17 + r() * 0.05;
      const color = info ? info.c : FILL[Math.floor(r() * FILL.length)];
      const cover = std({ color, roughness: 0.8 });
      const spine = new THREE.MeshStandardMaterial({ map: spineTexture(info?.t || '', color, s * 100 + Math.floor(z * 1000)), roughness: 0.8 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(d, h, t), [spine, cover, pages, pages, cover, cover]);
      book.castShadow = true;
      book.receiveShadow = true;
      const lean = r() < 0.08 ? 0.18 : 0;
      book.position.set(D / 2 - d / 2 - 0.01, shelvesY[s] + 0.015 + h / 2, z + t / 2);
      book.rotation.x = lean;
      book.userData = { info, title: info?.t, baseX: book.position.x, color };
      g.add(book);
      books.push(book);
      z += t + 0.002 + (lean ? 0.03 : 0);
    }
  }
  // enfeites na prateleira de cima
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), std({ color: '#e8e2d0', roughness: 0.5 }));
  skull.scale.set(0.9, 1, 1.1);
  skull.position.set(0.02, shelvesY[4] + 0.07, 0.25);
  g.add(skull);
  const candle = cyl(0.03, 0.03, 0.09, std({ color: '#2a1f32', roughness: 0.9 }), 10);
  candle.position.set(0.02, shelvesY[4] + 0.06, -0.2);
  g.add(candle);
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), std({ color: '#3e7a5a', roughness: 0.9 }));
  plant.position.set(0.02, shelvesY[0] + 0.3, 0.38);
  g.add(plant);
  const pot = cyl(0.05, 0.04, 0.08, std({ color: '#b5654a' }), 10);
  pot.position.set(0.02, shelvesY[0] + 0.2, 0.38);
  g.add(pot);
  return { group: g, books };
}

// ---------------------------------------------------------------
// Cortina de veludo com caimento animado
// ---------------------------------------------------------------
export class Curtain {
  constructor({ anchorX, dir, y, z, mat, openW = 0.3, closedW = 0.9, height = 1.5 }) {
    this.anchorX = anchorX; // lado preso à parede
    this.dir = dir; // 1 = cresce para a direita
    this.openW = openW;
    this.closedW = closedW;
    this.h = height;
    this.geo = new THREE.PlaneGeometry(1, height, 24, 6);
    this.base = this.geo.attributes.position.array.slice();
    this.geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.geo.attributes.position.count * 3), 3));
    mat.vertexColors = true;
    this.mesh = new THREE.Mesh(this.geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, y, z);
    this.k = 0; // 0 = aberta, 1 = fechada
    this.wave = 0; // balanço depois de mexer
    this.lastK = -1;
    this.update(0, 0);
  }
  update(t, dt) {
    this.wave = Math.max(0, this.wave - dt * 0.7);
    if (this.k === this.lastK && this.wave <= 0) return;
    this.lastK = this.k;
    const p = this.geo.attributes.position;
    const k = this.k;
    const width = lerpN(this.openW, this.closedW, k);
    const folds = lerpN(9, 5, k); // mais dobras quando recolhida
    const amp = lerpN(0.05, 0.034, k);
    const col = this.geo.attributes.color;
    const half = this.h / 2;
    for (let i = 0; i < p.count; i++) {
      const u = this.base[i * 3] + 0.5; // 0..1 a partir da parede
      const v = this.base[i * 3 + 1];
      const hang = (half - v) / this.h; // 0 em cima, 1 embaixo
      // a barra de baixo atrasa um pouco em relação ao varão (tecido pesado)
      const lag = this.wave * Math.sin(t * 5 + u * 4) * 0.035 * hang * u;
      const x = this.anchorX + this.dir * (u * width + lag);
      const z = Math.sin(u * folds * Math.PI) * amp * (0.45 + 0.55 * u) + this.wave * Math.sin(t * 7 + u * 6 + hang * 2) * 0.012 * hang;
      p.setXYZ(i, x, v, z);
      // sombra nos vincos das dobras (pixel art gosta de contraste)
      const s = Math.abs(Math.sin(u * folds * Math.PI));
      const shade = 0.45 + 0.55 * Math.pow(s, 0.6) - hang * 0.08;
      col.setXYZ(i, shade, shade, shade);
    }
    p.needsUpdate = true;
    col.needsUpdate = true;
    this.geo.computeVertexNormals();
    this.geo.computeBoundingSphere();
  }
}
const lerpN = (a, b, k) => a + (b - a) * k;

// ---------------------------------------------------------------
// Mochila: fechada (no chão) e aberta (vista de perto, com as coisas)
// ---------------------------------------------------------------
export function buildBackpack() {
  const purple = std({ color: '#4a2f5e', roughness: 0.95 });
  const darker = std({ color: '#3a2449', roughness: 0.95 });

  const closed = new THREE.Group();
  closed.add(pillow(0.3, 0.38, 0.18, purple));
  const pocket = pillow(0.22, 0.16, 0.06, darker);
  pocket.position.set(0, -0.08, 0.1);
  closed.add(pocket);
  const patch = sticker(0.07, 0.07, (ctx, w, h) => {
    ctx.fillStyle = '#e04f6a';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1420';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.32, 0, Math.PI * 2);
    ctx.fill();
  });
  patch.position.set(0.06, 0.08, 0.092);
  closed.add(patch);
  // alças
  const strapGeo = new THREE.TorusGeometry(0.1, 0.012, 6, 16, Math.PI);
  const strap = new THREE.Mesh(strapGeo, darker);
  strap.position.set(0, 0.17, -0.06);
  strap.rotation.set(0, Math.PI / 2, 0);
  closed.add(strap);

  // --- aberta: em pé, zíper aberto em cima, as coisas aparecendo ---
  const open = new THREE.Group();
  const BH = 0.36;
  const body = rbox(0.32, BH, 0.2, purple, 0.06, 3);
  body.position.y = BH / 2;
  open.add(body);
  const pocket2 = pillow(0.24, 0.17, 0.06, darker);
  pocket2.position.set(0, 0.11, 0.105);
  open.add(pocket2);
  const patch2 = patch.clone();
  patch2.position.set(0.07, 0.24, 0.101);
  open.add(patch2);
  // boca aberta: fundo escuro + as duas fileiras do zíper
  const mouthShape = new THREE.Shape();
  const mw = 0.13, md = 0.065, mr = 0.05;
  mouthShape.moveTo(-mw + mr, -md);
  mouthShape.lineTo(mw - mr, -md);
  mouthShape.quadraticCurveTo(mw, -md, mw, -md + mr * 0.6);
  mouthShape.lineTo(mw, md - mr * 0.6);
  mouthShape.quadraticCurveTo(mw, md, mw - mr, md);
  mouthShape.lineTo(-mw + mr, md);
  mouthShape.quadraticCurveTo(-mw, md, -mw, md - mr * 0.6);
  mouthShape.lineTo(-mw, -md + mr * 0.6);
  mouthShape.quadraticCurveTo(-mw, -md, -mw + mr, -md);
  const mouth = new THREE.Mesh(new THREE.ShapeGeometry(mouthShape, 6), new THREE.MeshBasicMaterial({ color: '#07050b' }));
  mouth.rotation.x = -Math.PI / 2;
  mouth.position.y = BH + 0.002;
  open.add(mouth);
  const zipMat = std({ color: '#c9c4d4', roughness: 0.3, metalness: 0.7 });
  const zipPts = mouthShape.getSpacedPoints(48).map((v) => new THREE.Vector3(v.x * 1.08, BH + 0.004, -v.y * 1.12));
  const zipLine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zipPts, true), 64, 0.006, 4, true), std({ color: '#1a1220', roughness: 0.6 }));
  open.add(zipLine);
  for (let i = 0; i < 48; i += 2) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.006), zipMat);
    tooth.position.copy(zipPts[i]).add(new THREE.Vector3(0, 0.005, 0));
    open.add(tooth);
  }
  // puxador do zíper pendurado na frente, com o chaveiro
  const pull = rbox(0.012, 0.03, 0.004, zipMat, 0.002);
  pull.position.set(0.14, BH - 0.01, 0.075);
  pull.rotation.z = 0.3;
  open.add(pull);
  // alças nas costas
  const strap2 = new THREE.Mesh(strapGeo, darker);
  strap2.position.set(0, BH - 0.02, -0.1);
  strap2.rotation.set(0, Math.PI / 2, 0);
  open.add(strap2);

  const items = [];
  const add = (obj, label, line, x, y, z, rx = 0, ry = 0, rz = 0) => {
    obj.position.set(x, y, z);
    obj.rotation.set(rx, ry, rz);
    obj.userData = { label, line, base: obj.position.clone() };
    open.add(obj);
    items.push(obj);
  };
  // caderno de desenho com adesivos
  const sketch = new THREE.Group();
  sketch.add(rbox(0.16, 0.012, 0.22, std({ color: '#1d1a24', roughness: 0.8 }), 0.004));
  const cover = sticker(0.14, 0.2, (ctx, w, h) => {
    ctx.fillStyle = '#1d1a24';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffe36b';
    ctx.fillRect(6, 8, 10, 10);
    ctx.fillStyle = '#ff6b9a';
    ctx.fillRect(w - 20, 14, 12, 8);
    ctx.fillStyle = '#b48cff';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.6, 12, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, 'SKETCH', w / 2, h - 18, { font: 'tiny', size: 8, color: '#e8dcc0', align: 'center' });
  });
  cover.rotation.x = -Math.PI / 2;
  cover.position.y = 0.007;
  sketch.add(cover);
  add(sketch, 'Caderno de desenho', 'Caderno de desenho. Tá quase cheio.', -0.07, 0.37, -0.035, 1.25, 0.15, -0.12);
  // fone de ouvido quebrado
  const ear = new THREE.Group();
  const white = std({ color: '#e9e6ee', roughness: 0.4 });
  const bud1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), white);
  const bud2 = bud1.clone();
  bud2.position.set(0.05, 0.005, 0.02);
  const wirePts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, -0.01, 0.05), new THREE.Vector3(0.05, 0, 0.02), new THREE.Vector3(0.03, -0.01, 0.09), new THREE.Vector3(0.0, -0.005, 0.11)];
  ear.add(bud1, bud2, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePts), 24, 0.002, 4), white));
  add(ear, 'Fone de ouvido', 'Só funciona de um lado.', 0.06, 0.375, 0.035, 0.2, 0.6, 0);
  // prova com nota vermelha
  const test = sticker(0.12, 0.16, (ctx, w, h) => {
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#b9cbe6';
    for (let y = 14; y < h; y += 7) ctx.fillRect(0, y, w, 1);
    drawText(ctx, 'FÍSICA', 4, 2, { font: 'tiny', size: 8, color: '#2a2a40' });
    drawText(ctx, '4,5', w - 4, 2, { size: 16, weight: 700, color: '#d02a3a', align: 'right' });
    ctx.strokeStyle = '#d02a3a';
    ctx.beginPath();
    ctx.arc(w - 15, 11, 12, 0, Math.PI * 2);
    ctx.stroke();
  });
  test.material.side = THREE.DoubleSide;
  add(test, 'Prova de física', '4,5 em física. Ninguém precisa saber.', 0.04, 0.42, -0.04, -0.25, -0.2, 0.15);
  // estojo
  const pencil = pillow(0.14, 0.04, 0.05, std({ color: '#ff8fb8', roughness: 0.9 }));
  add(pencil, 'Estojo', 'Canetas que não funcionam e uma borracha mordida.', -0.07, 0.375, 0.04, 0, 0.35, 0.25);
  // chaveiro de fantasminha
  const ghost = new THREE.Group();
  const gm = std({ color: '#f2eef8', roughness: 0.8 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), gm);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.03, 10), gm);
  tail.position.y = -0.02;
  tail.rotation.x = Math.PI;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.002, 6, 12), metal());
  ring.position.y = 0.03;
  const eyeM = new THREE.MeshBasicMaterial({ color: '#1a1420' });
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.003, 4, 4), eyeM), e2 = e1.clone();
  e1.position.set(-0.007, 0.004, 0.018);
  e2.position.set(0.007, 0.004, 0.018);
  ghost.add(head, tail, ring, e1, e2);
  add(ghost, 'Chaveiro', 'Ganhei numa máquina de pegar bichinho.', 0.15, 0.3, 0.095, 0.2, 0, 0.2);
  // chiclete
  const gum = rbox(0.06, 0.012, 0.03, std({ color: '#3fbf8a', roughness: 0.5 }), 0.004);
  add(gum, 'Chiclete', 'Chiclete de menta. Pelo menos isso.', 0.1, 0.368, -0.03, 0, -0.5, 0.05);

  open.visible = false;
  return { closed, open, items };
}

// ---------------------------------------------------------------
// Brilho de destaque (passar o mouse / chegar perto). k de 0 a 1.
// Guarda o emissive original de cada material na primeira vez.
// ---------------------------------------------------------------
const GLOW = new THREE.Color('#6a5a92');
export function setGlow(obj, k, color = GLOW) {
  if (!obj) return;
  obj.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m || !m.emissive) continue;
      if (!m.userData.e0) m.userData.e0 = m.emissive.clone();
      m.emissive.copy(m.userData.e0).lerp(color, k);
    }
  });
}
