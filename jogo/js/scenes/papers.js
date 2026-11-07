import * as THREE from 'three';
import { drawText } from '../engine/pixeltext.js';

// ===============================================================
// Papéis caídos no chão. Cada um é uma folha 3D com textura de papel
// (grão, dobras, tinta), que pode ser pega e vista de perto.
// ===============================================================

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER[(x & 3) + (y & 3) * 4] + 0.5) / 16;
const seeded = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

function paperCanvas(w, h, base, seed, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const r = seeded(seed);
  ctx.fillStyle = base[0];
  ctx.fillRect(0, 0, w, h);
  // grão do papel
  for (let i = 0; i < w * h * 0.08; i++) {
    ctx.fillStyle = base[1 + Math.floor(r() * (base.length - 1))];
    ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  }
  draw(ctx, w, h, r);
  return c;
}

// Dobra (vinco) e cantos gastos
function crease(ctx, w, h, x, color = 'rgba(0,0,0,0.12)') {
  ctx.fillStyle = color;
  ctx.fillRect(x, 0, 1, h);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 1, 0, 1, h);
}

function ticket(seat, seed) {
  return paperCanvas(200, 80, ['#f2e6c8', '#e8dab8', '#f7eed6'], seed, (ctx, w, h, r) => {
    // canhoto rosa com picote
    ctx.fillStyle = '#ff6b9a';
    ctx.fillRect(0, 0, 44, h);
    ctx.fillStyle = '#e04f7f';
    for (let y = 0; y < h; y += 2) if (r() < 0.3) ctx.fillRect(Math.floor(r() * 44), y, 1, 1);
    ctx.fillStyle = '#f2e6c8';
    for (let y = 2; y < h; y += 5) ctx.fillRect(44, y, 2, 2);
    ctx.save();
    ctx.translate(18, 70);
    ctx.rotate(-Math.PI / 2);
    drawText(ctx, 'ADMIT ONE', 0, 0, { font: 'tiny', size: 8, color: '#5a1830' });
    ctx.restore();
    drawText(ctx, `Nº ${seat}`, 22, 4, { font: 'tiny', size: 8, color: '#5a1830', align: 'center' });
    // corpo
    drawText(ctx, 'MOTH', 54, 4, { size: 24, weight: 700, color: '#2a1a2a' });
    drawText(ctx, 'TOUR 2026', 140, 13, { font: 'tiny', size: 8, color: '#7a3a5a' });
    ctx.fillStyle = '#2a1a2a';
    ctx.fillRect(54, 36, 138, 1);
    drawText(ctx, 'SÁB · 07 NOV · 22H', 54, 41, { font: 'tiny', size: 8, color: '#2a1a2a' });
    drawText(ctx, 'PISTA · R$ 120,00', 54, 52, { font: 'tiny', size: 8, color: '#2a1a2a' });
    // código de barras
    for (let x = 150; x < 194; x++) if (r() < 0.55) {
      ctx.fillStyle = '#2a1a2a';
      ctx.fillRect(x, 44, 1, 26);
    }
    // mariposinha
    ctx.fillStyle = '#7a3a5a';
    for (const [x, y] of [[178, 6], [180, 7], [182, 6], [179, 8], [181, 8], [180, 9]]) ctx.fillRect(x, y, 2, 2);
    crease(ctx, w, h, 122);
  });
}

function receipt() {
  return paperCanvas(96, 190, ['#f4f2ee', '#e9e6e0', '#fbfaf7'], 91, (ctx, w, h) => {
    // bordas serrilhadas
    ctx.clearRect(0, 0, w, 3);
    ctx.clearRect(0, h - 3, w, 3);
    ctx.fillStyle = '#f4f2ee';
    for (let x = 0; x < w; x += 4) {
      ctx.fillRect(x, 1, 2, 2);
      ctx.fillRect(x + 2, h - 3, 2, 2);
    }
    const ink = '#4a4a58';
    const faded = '#8a8a96';
    let y = 10;
    const line = (t, o = {}) => {
      drawText(ctx, t, o.align === 'center' ? w / 2 : 8, y, { font: 'tiny', size: 8, color: o.color || ink, align: o.align || 'left' });
      y += o.gap || 10;
    };
    line('CABINE FOTO', { align: 'center' });
    line('SHOPPING NORTE', { align: 'center', color: faded });
    y += 4;
    line('12/10/25   19:42', { color: faded });
    line('------------------', { color: faded });
    line('4 FOTOS');
    line('     R$ 15,00');
    line('2 PESSOAS', { color: faded });
    line('------------------', { color: faded });
    line('TOTAL  R$ 15,00');
    y += 6;
    line('OBRIGADO :)', { align: 'center' });
    line('VOLTE SEMPRE', { align: 'center', color: faded });
    // tinta térmica apagando
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = '#f4f2ee';
      ctx.fillRect(Math.floor(Math.random() * w), 60 + Math.floor(Math.random() * 60), 1, 1);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 95, w, 1);
  });
}

function note() {
  return paperCanvas(130, 120, ['#f6f3ea', '#ece7da', '#fbf9f2'], 33, (ctx, w, h, r) => {
    // pauta de caderno
    ctx.fillStyle = '#b9cbe6';
    for (let y = 18; y < h; y += 12) ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = '#e6a0a8';
    ctx.fillRect(14, 0, 1, h);
    // borda rasgada em cima
    ctx.clearRect(0, 0, w, 2);
    for (let x = 0; x < w; x++) {
      const d = Math.floor(r() * 4);
      ctx.clearRect(x, 0, 1, d);
    }
    // "letra de mão": cada letra levemente torta
    const hand = (text, x, y) => {
      let cx = x;
      for (const ch of text) {
        const dy = Math.round(Math.sin(cx * 0.7) * 1);
        cx += drawText(ctx, ch, cx, y + dy, { size: 12, color: '#2b3f8a' }) + (ch === ' ' ? 3 : 1);
      }
    };
    hand('me espera', 22, 21);
    hand('na saída?', 22, 45);
    hand('— M', 70, 82);
    // estrelinha rabiscada
    ctx.fillStyle = '#2b3f8a';
    for (const [x, y] of [[104, 30], [103, 31], [105, 31], [104, 32], [102, 32], [106, 32], [104, 33]]) ctx.fillRect(x, y, 1, 1);
    // vincos de quando foi dobrado em quatro
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(w / 2, 0, 1, h);
    ctx.fillRect(0, h / 2, w, 1);
  });
}

function toTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Folha com leve ondulação (não é um plano perfeito)
function sheet(canvas, w, h, curl = 0.006) {
  const geo = new THREE.PlaneGeometry(w, h, 12, 6);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / w, y = p.getY(i) / h;
    p.setZ(i, curl * (Math.cos(x * Math.PI) * 0.6 + Math.sin(y * 4 + x * 2) * 0.4));
  }
  geo.computeVertexNormals();
  const map = toTexture(canvas);
  // emissiveMap = a própria textura: quando a folha vem para perto da câmera,
  // o emissive acende e ela fica legível independente da luz do quarto
  const mat = new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: '#000000', roughness: 0.95, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 });
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

// Papéis no chão, em volta de (0,7, -0,6)
export function makePapers() {
  const list = [
    { id: 'ingresso1', label: 'Ingresso', canvas: ticket('0412', 5), w: 0.2, h: 0.08, pos: [0.62, -0.62], rot: 0.45,
      line: 'O show é sábado.' },
    { id: 'ingresso2', label: 'Outro ingresso', canvas: ticket('0413', 9), w: 0.2, h: 0.08, pos: [0.82, -0.78], rot: -0.3,
      line: 'Dois. Eu comprei dois.' },
    { id: 'recibo', label: 'Recibo', canvas: receipt(), w: 0.075, h: 0.148, pos: [0.42, -0.5], rot: 1.2,
      line: 'Guardei até o recibo.' },
    { id: 'bilhete', label: 'Bilhete', canvas: note(), w: 0.13, h: 0.12, pos: [0.95, -0.48], rot: -0.8,
      line: 'A letra dela.' },
  ];
  return list.map((p, i) => {
    const mesh = sheet(p.canvas, p.w, p.h);
    mesh.rotation.set(-Math.PI / 2, 0, p.rot);
    mesh.position.set(p.pos[0], 0.008 + i * 0.0015, p.pos[1]);
    mesh.userData.home = { pos: mesh.position.clone(), quat: mesh.quaternion.clone() };
    return { ...p, mesh };
  });
}
