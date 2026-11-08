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
  // releituras sérias de obras famosas (spine = o que vai na lombada)
  { t: 'O REI DOS ANÉIS', spine: 'O REI DOS ANÉIS', c: '#3a2a1c', line: 'Atravessaram a Terra-média por um amigo. Eu não respondo nem mensagem.' },
  { t: 'O JOGO DAS COROAS', spine: 'JOGO DAS COROAS', c: '#1d2a44', line: 'Parei no terceiro livro. Não tava pronta pra outro casamento.' },
  { t: 'UM PEDAÇO VOL. 104', spine: 'UM PEDAÇO 104', c: '#e8e2d0', line: 'Mais de mil capítulos pra dizer que o tesouro é a amizade. Sei.' },
  { t: 'CAÇADOR X CAÇADOR VOL. 37', spine: 'CAÇADOR X CAÇADOR', c: '#2f6a4a', line: 'O autor some, volta, some de novo. Igual certas pessoas.' },
  { t: 'POEMAS DO FIM', c: '#8a3b4f', line: 'Sublinhei metade.' },
  { t: 'GUIA DE PLANTAS', c: '#3e7a5a', line: 'Matei três suculentas.' },
];
const FILL = ['#8a3b4f', '#2f5d8a', '#c9a24a', '#3e7a5a', '#5b3e8a', '#d0d0d8', '#1d1d24', '#a86b3a', '#2a2a40', '#7a2f2f'];

function spineTexture(title, color, seed, exact = false) {
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
      drawText(ctx, exact || title.length <= 15 ? title : title.slice(0, 15), 0, 0, { font: 'tiny', size: 8, color: ink });
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
      // sorteia, mas força os que ainda faltam quando a estante está acabando
      const left = BOOKS.length - special;
      const slotsLeft = (3 - s) * 14 + Math.max(0, (limit - z) / 0.045);
      const isSpecial = left > 0 && (r() < 0.3 || slotsLeft <= left * 1.5);
      const info = isSpecial ? BOOKS[special++] : null;
      const h = 0.22 + r() * 0.12;
      const t = 0.025 + r() * 0.03;
      const d = 0.17 + r() * 0.05;
      const color = info ? info.c : FILL[Math.floor(r() * FILL.length)];
      const cover = std({ color, roughness: 0.8 });
      const spine = new THREE.MeshStandardMaterial({ map: spineTexture(info?.spine || info?.t || '', color, s * 100 + Math.floor(z * 1000), !!info?.spine), roughness: 0.8 });
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
// Estilo low poly facetado (sombreamento chapado), lona verde-oliva
// com manchas de uso, fitas cinza por cima, bolso de baixo, bolso
// lateral, zíperes com puxadores de borracha e um bóton de carinha.
// ---------------------------------------------------------------

const BAG = {
  // lona preta (os nomes "olive" ficaram da primeira versão: são os tons do tecido)
  olive: '#25242a', oliveLight: '#302f37', oliveDark: '#1a191e', oliveWorn: '#3b3a44',
  strap: '#141317', strapLight: '#1d1c21', rubber: '#e2bb34',
  yellow: '#e8c53a', yellowDark: '#b8911f',
  lining: '#d9b23a',
};

// lona com manchas claras (desgaste) e pontinhos de trama
function canvasFabric(seed = 3) {
  return canvasTex(32, 32, (ctx) => {
    const r = seeded(seed);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const n = Math.sin(x * 0.45 + r() * 0.3) + Math.sin(y * 0.38 + x * 0.12) * 0.8;
        const k = n * 0.25 + 0.5 + (dith(x, y) - 0.5) * 0.35;
        px(ctx, x, y, k > 0.78 ? BAG.oliveLight : k < 0.22 ? BAG.oliveDark : BAG.olive);
      }
    // manchas gastas
    for (let i = 0; i < 5; i++) {
      const cx = r() * 32, cy = r() * 32, rad = 2 + r() * 3;
      for (let y = -6; y <= 6; y++)
        for (let x = -6; x <= 6; x++) {
          const d = Math.hypot(x, y) / rad;
          if (d < 1 && dith(x + 7, y + 3) > d * 0.9) px(ctx, Math.floor(cx + x) & 31, Math.floor(cy + y) & 31, BAG.oliveWorn);
        }
    }
    // trama
    for (let y = 1; y < 32; y += 4) for (let x = (y >> 2) & 1; x < 32; x += 3) px(ctx, x, y, BAG.oliveDark);
  }, { repeat: [2, 2] });
}

// fita (cadarço de mochila): listras no sentido do comprimento
function webbingTex() {
  return canvasTex(8, 16, (ctx) => {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = x === 0 || x === 7 ? '#0c0b0e' : x % 2 ? BAG.strap : BAG.strapLight;
      ctx.fillRect(x, 0, 1, 16);
    }
    // pesponto amarelo tracejado nas duas bordas
    for (let y = 0; y < 16; y += 4) {
      ctx.fillStyle = BAG.yellow;
      ctx.fillRect(1, y, 1, 2);
      ctx.fillRect(6, y + 2, 1, 2);
    }
  });
}

// caixa arredondada facetada com deformação (fica com cara de "modelada à mão")
function facetBox(w, h, d, r, seg, mat, deform) {
  const geo = new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    deform?.(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// "Gruda" um caminho na superfície de uma malha: raios vindos de fora
const _rc = new THREE.Raycaster();
function wrap(meshes, rays, lift = 0) {
  const out = [];
  for (const [o, d] of rays) {
    _rc.set(o, d);
    const hit = _rc.intersectObjects(meshes, false)[0];
    if (!hit) continue;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    out.push({ p: hit.point.clone().addScaledVector(n, lift), n });
  }
  // suaviza as normais (as faces são chapadas)
  return out.map((s, i) => {
    const n = s.n.clone();
    if (out[i - 1]) n.add(out[i - 1].n);
    if (out[i + 1]) n.add(out[i + 1].n);
    return { p: s.p, n: n.normalize() };
  });
}

// raios em volta de um retângulo arredondado num plano (para fitas e zíperes)
// plane 'yz' (fita que passa por cima), 'xy' (contorno da frente) ou 'x' (reta horizontal)
function rectRays({ plane, at, cx, cy, hw, hh, rad, from, to, n = 40, grow = 0.15 }) {
  // perímetro: começa embaixo na frente e sobe (sentido anti-horário visto de +x / de frente)
  const R = rad + grow;
  const segs = [];
  const W = hw - rad, H = hh - rad;
  const pts = [];
  const push = (a, b, na, nb) => pts.push([a, b, na, nb]);
  // lado "frente/direita" subindo, canto, topo, canto, lado "trás/esquerda" descendo
  const steps = 10;
  for (let i = 0; i <= steps; i++) push(cx + hw + grow, cy - H + (2 * H * i) / steps, 1, 0);
  for (let i = 1; i <= steps; i++) {
    const a = (Math.PI / 2) * (i / steps);
    push(cx + W + Math.cos(a) * R, cy + H + Math.sin(a) * R, Math.cos(a), Math.sin(a));
  }
  for (let i = 1; i <= steps; i++) push(cx + W - (2 * W * i) / steps, cy + hh + grow, 0, 1);
  for (let i = 1; i <= steps; i++) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    push(cx - W + Math.cos(a) * R, cy + H + Math.sin(a) * R, Math.cos(a), Math.sin(a));
  }
  for (let i = 1; i <= steps; i++) push(cx - hw - grow, cy + H - (2 * H * i) / steps, -1, 0);
  // reamostra entre from e to (0..1 do caminho) com espaçamento igual
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1];
  const rays = [];
  for (let k = 0; k <= n; k++) {
    const s = (from + (to - from) * (k / n)) * total;
    let j = 1;
    while (j < cum.length - 1 && cum[j] < s) j++;
    const f = (s - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
    const a = pts[j - 1], b = pts[j];
    const u = a[0] + (b[0] - a[0]) * f, w = a[1] + (b[1] - a[1]) * f;
    let nu = a[2] + (b[2] - a[2]) * f, nw = a[3] + (b[3] - a[3]) * f;
    const l = Math.hypot(nu, nw) || 1;
    nu /= l;
    nw /= l;
    if (plane === 'yz') rays.push([new THREE.Vector3(at, w, u), new THREE.Vector3(0, -nw, -nu)]);
    else rays.push([new THREE.Vector3(u, w, at), new THREE.Vector3(-nu, -nw, 0)]);
  }
  return rays;
}

// fita chata (com espessura) passando pelos pontos
function ribbon(samples, width, thick, mat, { side = null, uvScale = 20 } = {}) {
  const pos = [], uv = [], idx = [];
  let len = 0;
  samples.forEach((s, i) => {
    const a = samples[Math.max(0, i - 1)].p, b = samples[Math.min(samples.length - 1, i + 1)].p;
    const tan = b.clone().sub(a).normalize();
    const sd = side ? side.clone() : new THREE.Vector3().crossVectors(tan, s.n).normalize();
    if (i > 0) len += s.p.distanceTo(samples[i - 1].p);
    const hw = width / 2;
    const p0 = s.p.clone().addScaledVector(sd, -hw), p1 = s.p.clone().addScaledVector(sd, hw);
    const p2 = p1.clone().addScaledVector(s.n, thick), p3 = p0.clone().addScaledVector(s.n, thick);
    for (const q of [p0, p1, p2, p3]) pos.push(q.x, q.y, q.z);
    const v = len * uvScale;
    uv.push(0, v, 1, v, 1, v, 0, v);
    if (i > 0) {
      const o = (i - 1) * 4, c = i * 4;
      idx.push(o + 3, o + 2, c + 2, o + 3, c + 2, c + 3); // cima
      idx.push(o + 0, o + 3, c + 3, o + 0, c + 3, c + 0); // borda
      idx.push(o + 2, o + 1, c + 1, o + 2, c + 1, c + 2); // borda
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// zíper: trilho escuro + dentinhos
function zipperAlong(samples, group, { teeth = true } = {}) {
  if (samples.length < 2) return;
  const curve = new THREE.CatmullRomCurve3(samples.map((s) => s.p.clone().addScaledVector(s.n, 0.002)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, samples.length * 2, 0.0035, 4, false), std({ color: '#1c1a20', roughness: 0.6 }));
  group.add(tube);
  if (!teeth) return;
  const tm = std({ color: '#55525c', roughness: 0.4, metalness: 0.3 });
  const geo = new THREE.BoxGeometry(0.004, 0.003, 0.004);
  const inst = new THREE.InstancedMesh(geo, tm, samples.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  samples.forEach((s, i) => {
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.n);
    m4.compose(s.p.clone().addScaledVector(s.n, 0.004), q, new THREE.Vector3(1, 1, 1));
    inst.setMatrixAt(i, m4);
  });
  group.add(inst);
}

// puxador de borracha (estilo cordinha com ponteira) — pendurado, balança
function zipPull(len = 0.03) {
  const g = new THREE.Group();
  const slider = rbox(0.012, 0.006, 0.009, std({ color: '#4a4750', roughness: 0.35, metalness: 0.6 }), 0.002);
  g.add(slider);
  const cord = cyl(0.0018, 0.0018, len * 0.5, std({ color: '#141317', roughness: 0.8 }), 5);
  cord.position.y = -len * 0.25;
  g.add(cord);
  const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0045, len * 0.45, 3, 6), std({ color: BAG.rubber, roughness: 0.55 }));
  tip.position.y = -len * 0.72;
  tip.castShadow = true;
  g.add(tip);
  return g;
}

// bóton de carinha sorridente
function smileyPin(r = 0.024) {
  const face = canvasTex(24, 24, (ctx) => {
    ctx.fillStyle = '#e8c53a';
    ctx.fillRect(0, 0, 24, 24);
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 24; x++) {
        const d = Math.hypot(x - 11.5, y - 11.5);
        if (d > 10.5 && d < 12) px(ctx, x, y, '#b8911f');
        else if (d < 10.5 && dith(x, y) < 0.18 && x + y > 30) px(ctx, x, y, '#d4ad2c');
        else if (d < 10.5 && dith(x, y) < 0.12 && x + y < 14) px(ctx, x, y, '#f7e27a');
      }
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(8, 7, 2, 4);
    ctx.fillRect(14, 7, 2, 4);
    for (let x = 6; x <= 17; x++) {
      const y = Math.round(14 + Math.sin(((x - 6) / 11) * Math.PI) * 3);
      ctx.fillRect(x, y, 1, 1);
    }
    px(ctx, 5, 13, '#1a1420');
    px(ctx, 18, 13, '#1a1420');
  }, { wrap: false });
  const side = std({ color: '#c9c4d0', roughness: 0.3, metalness: 0.7 });
  const top = new THREE.MeshStandardMaterial({ map: face, roughness: 0.35 });
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.02, 0.004, 18), [side, top, side]);
  pin.castShadow = true;
  return pin;
}

// ---------------------------------------------------------------
// Chaveiro de chapéu de palha (pendurado no puxador, com física de pêndulo)
// ---------------------------------------------------------------
function strawTex() {
  return canvasTex(24, 24, (ctx) => {
    const r = seeded(91);
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 24; x++) {
        const k = (Math.sin(x * 1.7 + y * 0.9) + Math.sin(y * 1.9 - x * 0.6)) * 0.25 + 0.5 + (r() - 0.5) * 0.35;
        px(ctx, x, y, k > 0.72 ? '#f6dc5e' : k < 0.3 ? '#c99b22' : '#e8c03a');
      }
  });
}

function strawHat() {
  const g = new THREE.Group();
  const straw = new THREE.MeshStandardMaterial({ map: strawTex(), roughness: 0.85, flatShading: true });
  // perfil (raio, altura) girado: aba com borda arredondada + copa em domo
  const prof = [
    [0.0, 0.019], [0.006, 0.0185], [0.011, 0.016], [0.0145, 0.011], [0.0158, 0.005],
    [0.016, 0.0015], [0.024, 0.0012], [0.0262, 0.0002], [0.0262, -0.0012], [0.024, -0.0018], [0.0, -0.0018],
  ].reverse().map(([x, y]) => new THREE.Vector2(x, y));
  const hat = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), straw);
  hat.castShadow = true;
  g.add(hat);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0162, 0.0164, 0.004, 18, 1, true), std({ color: '#c42f2c', roughness: 0.6, side: THREE.DoubleSide }));
  band.position.y = 0.0035;
  g.add(band);
  // furinho na aba para a argolinha
  const hole = new THREE.Mesh(new THREE.TorusGeometry(0.0022, 0.0009, 4, 8), std({ color: '#b39028', roughness: 0.8 }));
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 0.0012, -0.0235);
  g.add(hole);
  return g;
}

function makeKeychain() {
  const pivot = new THREE.Group(); // fica no puxador; tudo pendurado embaixo
  const swing = new THREE.Group();
  pivot.add(swing);
  const chrome = std({ color: '#d8d4e0', roughness: 0.2, metalness: 0.95 });
  // argola (duas voltas, levemente separadas)
  const ring = new THREE.Group();
  for (const o of [0, 0.0012]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.009, 0.0011, 5, 18), chrome);
    t.position.z = o;
    ring.add(t);
  }
  ring.position.y = -0.009;
  swing.add(ring);
  // correntinha
  let y = -0.019;
  for (let i = 0; i < 3; i++) {
    const link = new THREE.Mesh(new THREE.TorusGeometry(0.0028, 0.0007, 4, 8), chrome);
    link.scale.set(0.8, 1.3, 1);
    link.position.y = y;
    link.rotation.y = i % 2 ? Math.PI / 2 : 0;
    swing.add(link);
    y -= 0.0055;
  }
  // chapéu: aba "em pé", copa virada para a frente
  const twist = new THREE.Group();
  twist.position.y = y - 0.0005;
  swing.add(twist);
  const hat = strawHat();
  hat.rotation.x = Math.PI / 2; // copa para +z
  hat.position.y = -0.0235;
  twist.add(hat);
  // área de clique maior que o chapéu (é pequenininho)
  const hit = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = -0.045;
  swing.add(hit);

  // pêndulo amortecido (balanço para frente/trás e para os lados) + giro na corrente
  const REST = -0.12; // inclinado para fora (encostado na barriga da mochila)
  const st = { ax: REST, az: 0, vx: 0, vz: 0, tw: 0.25, vt: 0, lastH: 0 };
  const poke = (k = 1) => {
    st.vx += (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2) * k;
    st.vz += (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 3) * k;
    st.vt += (Math.random() < 0.5 ? -1 : 1) * 14 * k;
  };
  const tick = (dt, t, h = 0) => {
    if (h > 0.5 && st.lastH <= 0.5) poke(0.35); // passou o mouse: balancinho
    st.lastH = h;
    const steps = Math.ceil(dt / 0.008);
    const s = dt / steps;
    for (let i = 0; i < steps; i++) {
      // brisa de leve quando parado
      const air = Math.sin(t * 0.9) * 0.004;
      st.vx += (-150 * (st.ax - REST) - 2.2 * st.vx + air) * s;
      st.vz += (-150 * st.az - 2.2 * st.vz) * s;
      st.vt += (-30 * (st.tw - 0.25) - 2.5 * st.vt) * s;
      st.ax += st.vx * s;
      st.az += st.vz * s;
      st.tw += st.vt * s;
    }
    // não entra na mochila: bate no tecido e volta
    if (st.ax > 0.04) {
      st.ax = 0.04;
      st.vx = -Math.abs(st.vx) * 0.4;
    }
    swing.rotation.set(st.ax, 0, st.az);
    twist.rotation.y = st.tw;
  };
  const reset = () => Object.assign(st, { ax: REST, az: 0, vx: 0, vz: 0, tw: 0.25, vt: 0 });
  pivot.userData.keychain = { tick, poke, reset };
  return pivot;
}

// ---------------------------------------------------------------
// Estojo de silicone roxo com zíper grosso
// ---------------------------------------------------------------
function makePencilCase() {
  const g = new THREE.Group();
  const L = 0.15, H = 0.056, D = 0.062, R = 0.018;
  const blue = std({ color: '#7448b8', roughness: 0.5 }); // roxo
  const blueLight = std({ color: '#8457c9', roughness: 0.45 });
  g.add(rbox(L, H, D, blue, R, 4));
  // painéis em relevo nas duas faces (aquela borda "afundada" da referência)
  for (const s of [-1, 1]) {
    const panel = rbox(L - 0.036, H - 0.024, 0.005, blueLight, 0.008, 3);
    panel.position.z = s * (D / 2 - 0.0013);
    g.add(panel);
  }
  // caminho do zíper: reta por cima, dobra o canto e desce pela ponta esquerda
  const pts = [], nrm = [];
  const cx = -L / 2 + R, cy = H / 2 - R, e = 0.0005;
  for (let i = 0; i <= 18; i++) {
    const x = L / 2 - 0.02 - ((L / 2 - 0.02 - cx) * i) / 18;
    pts.push(new THREE.Vector3(x, H / 2 + e, 0));
    nrm.push(new THREE.Vector3(0, 1, 0));
  }
  for (let i = 1; i <= 6; i++) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / 6);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * (R + e), cy + Math.sin(a) * (R + e), 0));
    nrm.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
  }
  for (let i = 1; i <= 5; i++) {
    pts.push(new THREE.Vector3(-L / 2 - e, cy - (cy + 0.004) * (i / 5), 0));
    nrm.push(new THREE.Vector3(-1, 0, 0));
  }
  const samples = pts.map((p, i) => ({ p, n: nrm[i] }));
  g.add(ribbon(samples, 0.011, 0.0012, std({ color: '#2a2a30', roughness: 0.8 }), { side: new THREE.Vector3(0, 0, 1) }));
  // dentes grandões, alternados
  const tm = std({ color: '#3a3a42', roughness: 0.35, metalness: 0.2 });
  const tooth = new THREE.BoxGeometry(0.0028, 0.0026, 0.0045);
  const curve = new THREE.CatmullRomCurve3(pts);
  const count = 44;
  const inst = new THREE.InstancedMesh(tooth, tm, count);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const p = curve.getPointAt(u), tan = curve.getTangentAt(u);
    const n = new THREE.Vector3(0, 0, 1).cross(tan).normalize().negate();
    q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tan, n, new THREE.Vector3(0, 0, 1)));
    const off = new THREE.Vector3(0, 0, i % 2 ? 0.0022 : -0.0022);
    m4.compose(p.clone().addScaledVector(n, 0.0018).add(off), q, new THREE.Vector3(1, 1, 1));
    inst.setMatrixAt(i, m4);
  }
  inst.castShadow = true;
  g.add(inst);
  // cursor + puxador (lingueta com furo) na ponta esquerda — balança
  const end = pts[pts.length - 1];
  const slider = rbox(0.008, 0.012, 0.009, std({ color: '#55535c', roughness: 0.35, metalness: 0.5 }), 0.002);
  slider.position.copy(end).add(new THREE.Vector3(-0.002, 0, 0));
  g.add(slider);
  const tabShape = new THREE.Shape();
  tabShape.moveTo(-0.004, 0);
  tabShape.lineTo(0.004, 0);
  tabShape.lineTo(0.0065, -0.016);
  tabShape.absarc(0, -0.017, 0.0065, 0, Math.PI, true);
  tabShape.lineTo(-0.004, 0);
  const hole = new THREE.Path();
  hole.absarc(0, -0.0175, 0.0028, 0, Math.PI * 2, false);
  tabShape.holes.push(hole);
  const tabGeo = new THREE.ExtrudeGeometry(tabShape, { depth: 0.0022, bevelEnabled: true, bevelThickness: 0.0006, bevelSize: 0.0006, bevelSegments: 1, curveSegments: 10 });
  tabGeo.translate(0, 0, -0.0011);
  const tabPivot = new THREE.Group();
  tabPivot.position.copy(end).add(new THREE.Vector3(-0.005, -0.004, 0));
  const tab = new THREE.Mesh(tabGeo, std({ color: '#4d4b55', roughness: 0.5, metalness: 0.2 }));
  tab.castShadow = true;
  tabPivot.add(tab);
  tabPivot.rotation.y = Math.PI / 2;
  g.add(tabPivot);

  const st = { a: 0, v: 0 };
  g.userData.tick = (dt, t, h) => {
    st.v += (-120 * st.a - 3 * st.v) * dt;
    st.a += st.v * dt;
    tabPivot.rotation.z = st.a - g.rotation.z * 0.6;
  };
  g.userData.poke = () => (st.v += 9);
  g.userData.reset = () => Object.assign(st, { a: 0, v: 0 });
  g.userData.sound = 'zipShort';
  return g;
}

// ---------------------------------------------------------------
// Fone intra-auricular com fio chato (todo branco)
// ---------------------------------------------------------------
function makeEarphones() {
  const g = new THREE.Group();
  // brancos um pouco abaixo do limite do bloom (senão o fone fica com um halo e parece selecionado)
  const teal = std({ color: '#b3b4bb', roughness: 0.8 }); // fio
  const white = std({ color: '#c9cad0', roughness: 0.45 });
  const silicone = std({ color: '#b9bac1', roughness: 0.7 });
  const gold = std({ color: '#e3b34c', roughness: 0.25, metalness: 1 });

  const bud = (letter) => {
    const b = new THREE.Group();
    const shell = cyl(0.0085, 0.0075, 0.013, white, 12);
    shell.rotation.x = Math.PI / 2;
    b.add(shell);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), white);
    back.rotation.x = -Math.PI / 2;
    back.position.z = -0.0065;
    back.scale.z = 0.5;
    b.add(back);
    const nozzle = cyl(0.0045, 0.0045, 0.005, teal, 10);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.z = 0.009;
    b.add(nozzle);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 8), silicone);
    tip.scale.set(1, 1, 0.75);
    tip.position.z = 0.0135;
    b.add(tip);
    const stem = rbox(0.005, 0.012, 0.005, white, 0.0018);
    stem.position.set(0, -0.0095, -0.002);
    stem.rotation.x = 0.25;
    b.add(stem);
    if (letter) {
      // "R" em pixel art (5x7) num adesivo minúsculo
      const R = ['1110', '1001', '1001', '1110', '1010', '1001', '1001'];
      const tex = canvasTex(8, 9, (ctx) => {
        ctx.fillStyle = '#8c8d96';
        R.forEach((row, y) => [...row].forEach((c, x) => c === '1' && ctx.fillRect(2 + x, 1 + y, 1, 1)));
      }, { wrap: false });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.0075, 0.0085), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.4 }));
      s.position.set(0, 0.0005, -0.0109);
      s.rotation.y = Math.PI;
      b.add(s);
    }
    b.traverse((o) => o.isMesh && (o.castShadow = true));
    return b;
  };
  const left = bud(null);
  left.position.set(-0.025, 0.012, 0.012);
  left.rotation.set(-0.5, 0.6, 0.2);
  const right = bud('R');
  right.position.set(0.02, 0.016, -0.004);
  right.rotation.set(0.3, -2.4, -0.3);
  g.add(left, right);

  // fio chato: duas pernas até o controle, depois um fio só, embolado até o plugue
  const flat = (pts, w = 0.0034) => {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const N = pts.length * 10;
    const samples = [];
    for (let i = 0; i <= N; i++) {
      const p = curve.getPointAt(i / N);
      const tan = curve.getTangentAt(i / N);
      // fio deitado: normal quase sempre para cima, com uma torcidinha
      const tw = Math.sin(i * 0.35) * 0.7;
      samples.push({ p, n: new THREE.Vector3(0, 1, 0).applyAxisAngle(tan, tw).normalize() });
    }
    return ribbon(samples, w, 0.0011, teal);
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const remote = V(0.0, 0.004, 0.03);
  g.add(flat([V(-0.026, 0.002, 0.008), V(-0.03, 0.0, 0.022), V(-0.012, 0.003, 0.03), remote]));
  g.add(flat([V(0.021, 0.006, -0.012), V(0.04, 0.002, 0.002), V(0.03, 0.0, 0.026), V(0.012, 0.004, 0.032), remote]));
  // pedacinho de fio descascado perto do fone esquerdo (por isso só funciona de um lado)
  const copper = cyl(0.0012, 0.0012, 0.006, std({ color: '#d98a4a', roughness: 0.3, metalness: 0.8 }), 5);
  copper.position.set(-0.029, 0.001, 0.016);
  copper.rotation.set(Math.PI / 2, 0, 0.35);
  g.add(copper);
  // controle com botão
  const rem = rbox(0.016, 0.006, 0.007, white, 0.0028, 3);
  rem.position.copy(remote);
  rem.rotation.y = 0.1;
  g.add(rem);
  const btn = rbox(0.007, 0.002, 0.004, silicone, 0.0009);
  btn.position.copy(remote).add(V(0, 0.0035, 0));
  btn.rotation.y = 0.1;
  g.add(btn);
  // fio principal: voltas embaralhadas até o plugue
  const jackAt = V(-0.045, 0.004, -0.02);
  g.add(flat([
    remote, V(-0.012, 0.0, 0.034), V(-0.04, 0.002, 0.03), V(-0.052, 0.006, 0.004), V(-0.03, 0.009, -0.024),
    V(0.008, 0.007, -0.03), V(0.04, 0.004, -0.024), V(0.05, 0.001, 0.0), V(0.03, 0.005, 0.018),
    V(-0.0, 0.009, 0.006), V(-0.028, 0.006, -0.008), jackAt,
  ]));
  // plugue P2: capa branca + ponta dourada com aneizinhos pretos
  const jack = new THREE.Group();
  const sleeve = cyl(0.0032, 0.0028, 0.014, teal, 10);
  jack.add(sleeve);
  const pin = cyl(0.0012, 0.0012, 0.012, gold, 8);
  pin.position.y = 0.012;
  jack.add(pin);
  for (const yy of [0.0095, 0.0125]) {
    const band = cyl(0.00125, 0.00125, 0.0006, std({ color: '#111', roughness: 0.5 }), 8);
    band.position.y = yy;
    jack.add(band);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.0012, 6, 4), gold);
  knob.position.y = 0.018;
  jack.add(knob);
  jack.position.copy(jackAt);
  jack.rotation.set(0, 0, Math.PI / 2 + 0.3);
  jack.rotation.y = 0.5;
  g.add(jack);
  g.traverse((o) => o.isMesh && (o.castShadow = true));

  // os fones dão um pulinho quando clica
  const st = { k: 0 };
  g.userData.tick = (dt) => {
    st.k = Math.max(0, st.k - dt * 2.4);
    const hop = Math.sin(st.k * Math.PI * 2) * st.k;
    left.position.y = 0.012 + Math.max(0, hop) * 0.02;
    right.position.y = 0.016 + Math.max(0, Math.sin(st.k * Math.PI * 2 - 0.6) * st.k) * 0.02;
    left.rotation.z = 0.2 + hop * 0.6;
  };
  g.userData.poke = () => (st.k = 1);
  g.userData.reset = () => (st.k = 0);
  g.userData.sound = 'earbud';
  return g;
}

// ---------------------------------------------------------------
// Corpo da mochila (o mesmo modelo serve fechado e aberto)
// ---------------------------------------------------------------
function buildBagBody(open) {
  const W = 0.3, D = 0.18, H = open ? 0.37 : 0.4, RAD = open ? 0.05 : 0.075;
  const g = new THREE.Group();
  const fabric = std({ map: canvasFabric(3), roughness: 0.95, flatShading: true });
  const fabricDark = std({ map: canvasFabric(8), color: '#d8d8d0', roughness: 0.95, flatShading: true });
  const web = std({ map: webbingTex(), roughness: 0.85, flatShading: true });

  // corpo: mais estreito em cima, barriga na frente, um pouco irregular
  const body = facetBox(W, H, D, RAD, 3, fabric, (v) => {
    v.y += H / 2;
    const ty = v.y / H;
    if (open && v.y > H - RAD) v.y = H - (H - v.y) * 0.22; // boca reta em cima
    v.x *= 1 - 0.1 * ty * ty;
    const nx = v.x / (W / 2), ny = (v.y - H * 0.5) / (H * 0.5);
    if (v.z > 0) v.z += 0.02 * Math.max(0, 1 - nx * nx) * Math.max(0, 1 - ny * ny);
    else v.z *= 0.92;
    v.x += 0.003 * Math.sin(v.y * 37 + v.z * 23);
    v.z += 0.003 * Math.sin(v.x * 41 + v.y * 29);
  });
  g.add(body);

  // bolso de baixo (o "rolinho" na frente)
  const PW = W + 0.02, PH = 0.12, PD = 0.1, PY = 0.068, PZ = D / 2 + 0.03;
  const pocket = facetBox(PW, PH, PD, 0.035, 2, fabricDark, (v) => {
    v.y += PY;
    v.z += PZ;
    if (v.z > PZ) v.z += 0.008 * Math.max(0, 1 - (v.x / (PW / 2)) ** 2);
    v.y += 0.002 * Math.sin(v.x * 50);
  });
  g.add(pocket);

  // bolso lateral (lado direito)
  const SW = 0.06, SH = 0.16, SD = 0.12, SX = W / 2 - 0.005, SY = 0.15, SZ = 0.012;
  const side = facetBox(SW, SH, SD, 0.026, 2, fabricDark, (v) => {
    v.x += SX + 0.018;
    v.y += SY;
    v.z += SZ;
    if (v.x > SX + 0.018) v.x += 0.008 * Math.max(0, 1 - (v.z / (SD / 2)) ** 2);
  });
  g.add(side);

  g.updateMatrixWorld(true);

  // fitas verticais: sobem pela frente, passam por cima e descem nas costas
  for (const sx of [-0.085, 0.085]) {
    const s = wrap([body], rectRays({ plane: 'yz', at: sx, cx: 0, cy: H / 2, hw: D / 2 + 0.02, hh: H / 2, rad: RAD, from: 0.05, to: open ? 0.33 : 0.62, n: 36 }), 0.0006);
    g.add(ribbon(s.filter((q) => q.p.y > PY + PH / 2 - 0.01 || q.p.z < 0), 0.026, 0.0035, web, { side: new THREE.Vector3(1, 0, 0) }));
    // a mesma fita abraçando o bolso de baixo
    const ps = wrap([pocket], rectRays({ plane: 'yz', at: sx, cx: PZ + 0.005, cy: PY, hw: PD / 2 + 0.01, hh: PH / 2, rad: 0.035, from: 0.0, to: 0.62, n: 24 }), 0.0006);
    g.add(ribbon(ps, 0.026, 0.0035, web, { side: new THREE.Vector3(1, 0, 0) }));
    // fivela onde a fita encontra o bolso
    const buckle = rbox(0.03, 0.012, 0.006, std({ color: BAG.yellow, roughness: 0.45 }), 0.002);
    const top = ps.reduce((a, b) => (b.p.y > a.p.y ? b : a));
    buckle.position.copy(top.p).add(new THREE.Vector3(0, -0.004, 0.004));
    buckle.rotation.x = -0.3;
    g.add(buckle);
  }

  // zíper do bolso de baixo + puxador
  const pz = wrap([pocket], Array.from({ length: 30 }, (_, i) => {
    const x = -0.13 + (0.26 * i) / 29;
    return [new THREE.Vector3(x, PY - 0.022, 0.5), new THREE.Vector3(0, 0, -1)];
  }));
  zipperAlong(pz, g);
  const pPull = zipPull(0.028);
  pPull.position.copy(pz[Math.floor(pz.length * 0.7)].p).add(new THREE.Vector3(0, 0, 0.006));
  pPull.rotation.z = 0.15;
  g.add(pPull);

  // zíper do bolso lateral (vertical) + puxador
  const sz = wrap([side], Array.from({ length: 18 }, (_, i) => {
    const y = SY - 0.06 + (0.12 * i) / 17;
    return [new THREE.Vector3(0.5, y, SZ + 0.025), new THREE.Vector3(-1, 0, 0)];
  }));
  zipperAlong(sz, g);
  const sPull = zipPull(0.026);
  sPull.position.copy(sz[sz.length - 1].p).add(new THREE.Vector3(0.006, 0.0, 0));
  sPull.rotation.set(0, Math.PI / 2, 0.1);
  g.add(sPull);

  // alças acolchoadas nas costas
  const padded = std({ map: canvasFabric(12), color: '#c8c8bc', roughness: 0.95, flatShading: true });
  for (const sx of [-0.075, 0.075]) {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const k = i / 14;
      const y = H - 0.05 - k * (H - 0.11);
      const z = -D / 2 * 0.92 - 0.012 - Math.sin(k * Math.PI) * 0.045;
      pts.push({ p: new THREE.Vector3(sx + Math.sin(k * Math.PI) * 0.01 * Math.sign(sx), y, z), n: new THREE.Vector3(0, Math.cos(k * Math.PI) * 0.2, -1).normalize() });
    }
    g.add(ribbon(pts, 0.05, 0.014, padded, { side: new THREE.Vector3(1, 0, 0) }));
  }

  // alça de mão em cima
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 4, 10, Math.PI), web);
  handle.scale.set(1, 0.8, 1.6);
  handle.position.set(0, H - (open ? 0.004 : 0.012), -D / 2 + (open ? 0.012 : 0.03));
  handle.rotation.x = open ? -0.5 : -0.15;
  handle.castShadow = true;
  g.add(handle);

  // bóton de carinha entre as fitas
  const pinHit = wrap([body], [[new THREE.Vector3(-0.005, H * 0.68, 0.5), new THREE.Vector3(0, 0, -1)]])[0];
  const pin = smileyPin(0.026);
  pin.position.copy(pinHit.p).addScaledVector(pinHit.n, 0.0015);
  pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pinHit.n);
  pin.rotateY(0.25);
  g.add(pin);

  return { group: g, body, W, D, H, fabric, web };
}

export function buildBackpack() {
  // --- fechada: zíper principal contornando a frente, chaveiro pendurado ---
  const closed = new THREE.Group();
  const cb = buildBagBody(false);
  closed.add(cb.group);
  const mainZip = wrap([cb.body], rectRays({ plane: 'xy', at: cb.D / 2 - 0.035, cx: 0, cy: cb.H / 2, hw: cb.W / 2, hh: cb.H / 2, rad: 0.075, from: 0.24, to: 0.82, n: 50 }));
  zipperAlong(mainZip, closed);
  const cPull = zipPull(0.03);
  const zEnd = mainZip[2];
  cPull.position.copy(zEnd.p).addScaledVector(zEnd.n, 0.006);
  closed.add(cPull);
  const keyClosed = makeKeychain();
  keyClosed.position.copy(cPull.position).addScaledVector(zEnd.n, 0.004).add(new THREE.Vector3(0, -0.028, 0));
  keyClosed.rotation.y = Math.atan2(zEnd.n.x, zEnd.n.z);
  keyClosed.scale.setScalar(1.15);
  closed.add(keyClosed);

  // --- aberta: em pé, aba jogada para trás, as coisas aparecendo ---
  const open = new THREE.Group();
  const bagScale = new THREE.Group(); // só a mochila (para o "respiro" ao abrir)
  open.add(bagScale);
  const ob = buildBagBody(true);
  bagScale.add(ob.group);
  const BH = ob.H;

  // boca: fundo escuro + borda de tecido + duas fileiras de dentes
  const mouthShape = new THREE.Shape();
  const mw = 0.122, md = 0.062, mr = 0.045;
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
  mouth.position.y = BH + 0.003;
  bagScale.add(mouth);
  const rimPts = mouthShape.getSpacedPoints(56).map((v) => new THREE.Vector3(v.x * 1.06, BH + 0.006, -v.y * 1.1));
  const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 56, 0.011, 5, true), ob.fabric);
  rim.castShadow = true;
  bagScale.add(rim);
  const zipMat = std({ color: '#4a4750', roughness: 0.4, metalness: 0.4 });
  const rimCurve = new THREE.CatmullRomCurve3(rimPts, true);
  const TN = 150;
  const tooth = new THREE.BoxGeometry(0.0024, 0.0022, 0.0042);
  const teeth = new THREE.InstancedMesh(tooth, zipMat, TN);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < TN; i++) {
    const u = i / TN;
    const p = rimCurve.getPointAt(u), t = rimCurve.getTangentAt(u);
    const out = new THREE.Vector3(t.z, 0, -t.x).normalize(); // para fora da boca
    q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), t);
    m4.compose(p.clone().add(new THREE.Vector3(0, 0.0105, 0)).addScaledVector(out, i % 2 ? 0.0028 : -0.0028), q, new THREE.Vector3(1, 1, 1));
    teeth.setMatrixAt(i, m4);
  }
  bagScale.add(teeth);
  const tape = new THREE.Mesh(new THREE.TubeGeometry(rimCurve, 80, 0.0055, 4, true), std({ color: '#2a282e', roughness: 0.8 }));
  tape.scale.set(1, 0.35, 1);
  tape.position.y = (BH + 0.006) * 0.65 + 0.0085;
  bagScale.add(tape);

  // aba de cima jogada para trás (forro laranja virado para a frente)
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, BH + 0.006, -ob.D / 2 + 0.01);
  bagScale.add(flapPivot);
  const bend = (v) => (v.y += 0.006 * Math.sin(v.x * 30) - 0.012 * (v.z / ob.D) ** 2);
  const flap = facetBox(ob.W * 0.94, 0.028, ob.D * 0.86, 0.013, 2, ob.fabric, (v) => {
    v.z += ob.D * 0.43;
    bend(v);
  });
  flapPivot.add(flap);
  const lining = facetBox(ob.W * 0.84, 0.004, ob.D * 0.74, 0.0015, 1, std({ color: BAG.lining, roughness: 0.9, flatShading: true }), (v) => {
    v.z += ob.D * 0.45;
    v.y -= 0.0155;
    bend(v);
  });
  flapPivot.add(lining);
  const FLAP_OPEN = -2.85;
  flapPivot.rotation.x = FLAP_OPEN;

  // puxador principal no canto da frente, com o chaveiro
  const oPull = zipPull(0.032);
  oPull.position.set(0.112, BH + 0.006, 0.07);
  oPull.rotation.set(-0.55, 0, 0.08);
  bagScale.add(oPull);

  const items = [];
  const add = (obj, label, line, x, y, z, rx = 0, ry = 0, rz = 0) => {
    obj.position.set(x, y, z);
    obj.rotation.set(rx, ry, rz);
    obj.userData = { ...obj.userData, label, line, base: obj.position.clone() };
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
  add(sketch, 'Caderno de desenho', 'Caderno de desenho. Tá quase cheio.', -0.06, 0.37, -0.04, 1.3, 0.12, -0.1);
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
  add(test, 'Prova de física', '4,5 em física. Ninguém precisa saber.', 0.045, 0.415, -0.045, -0.25, -0.2, 0.15);
  // estojo
  add(makePencilCase(), 'Estojo', 'Canetas que não funcionam e uma borracha mordida.', -0.052, 0.392, 0.012, -0.32, 0.28, 0.32);
  // fone de ouvido
  add(makeEarphones(), 'Fone de ouvido', 'Só funciona de um lado.', 0.065, 0.385, 0.022, 0.1, -0.2, -0.04);
  // chiclete
  const gum = rbox(0.06, 0.012, 0.03, std({ color: '#3fbf8a', roughness: 0.5 }), 0.004);
  add(gum, 'Chiclete', 'Chiclete de menta. Pelo menos isso.', 0.095, 0.376, -0.035, 0.05, -0.5, 0.08);
  // chaveiro pendurado no puxador (não sobe com o mouse: balança)
  const key = makeKeychain();
  key.scale.setScalar(1.25);
  key.userData.custom = true;
  key.userData.hover = 0;
  key.userData.tick = (dt, t, h) => (key.userData.hover = h);
  key.userData.poke = () => key.userData.keychain.poke(1);
  key.userData.reset = () => {
    key.userData.hover = 0;
    key.userData.keychain.reset();
  };
  key.userData.sound = 'jingle';
  add(key, 'Chaveiro', 'Chapéu de palha. Ganhei numa máquina de pegar bichinho.', 0.114, BH - 0.024, 0.097);

  // "respiro" ao abrir: a mochila amassa e estufa, a aba cai pra trás com mola
  const pop = { t: 1, on: false };
  const api = {
    closed, open, items,
    pop() {
      pop.t = 0;
      pop.on = true;
      flapPivot.rotation.x = -0.2;
      key.userData.keychain.poke(1.2);
    },
    update(t, dt) {
      keyClosed.userData.keychain.tick(dt, t, 0);
      if (!open.visible) return;
      if (pop.on) {
        pop.t += dt;
        const k = pop.t;
        const s = Math.exp(-k * 7) * Math.sin(k * 26);
        bagScale.scale.set(1 + s * 0.05, 1 - s * 0.08, 1 + s * 0.05);
        const f = Math.min(1, k / 0.35);
        flapPivot.rotation.x = -0.2 + (FLAP_OPEN + 0.2) * (1 - Math.pow(1 - f, 3)) + Math.exp(-k * 6) * Math.sin(k * 20) * 0.15 * f;
        if (k > 1.4) {
          pop.on = false;
          bagScale.scale.set(1, 1, 1);
          flapPivot.rotation.x = FLAP_OPEN;
        }
      }
      key.userData.keychain.tick(dt, t, key.userData.hover);
    },
    nudgeClosed() {
      keyClosed.userData.keychain.poke(0.8);
    },
  };
  open.visible = false;
  return api;
}

// squash & stretch genérico para quando clica num item (jump vai de 1 a 0)
export function squash(obj, jump) {
  const s = Math.sin(jump * Math.PI * 2.5) * jump * jump * 0.22;
  obj.scale.set(1 - s * 0.5, 1 + s, 1 - s * 0.5);
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
