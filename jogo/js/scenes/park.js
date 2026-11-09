import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { drawText, measure } from '../engine/pixeltext.js';

// ===============================================================
// O parque de diversões (Capítulo 1: domingo, 12 de outubro, 19:42)
//
// Visão lateral como no quarto. A rua das barracas corre em x:
//
//   pipoca · algodão-doce · pescaria · CABINE DE FOTOS · argola ·
//   balões · latas · churros & maçã do amor · bilheteria da roda-gigante
//
// Atrás: carrossel girando, lona de circo, uma segunda fileira de
// quiosques, gente passando, a roda-gigante gigante no fundo, árvores
// e a cidade. Varais de lâmpadas e bandeirinhas por cima de tudo.
//
// Desempenho: tudo que é parado vira UMA malha com cor por vértice
// (Kit) — uma para as partes iluminadas e outra para as que brilham.
// Lâmpadas são instâncias (Bulbs) animadas por padrão (corrida,
// pisca, arco-íris).
// ===============================================================

const V3 = THREE.Vector3;
const rnd = (a, b) => a + Math.random() * (b - a);
let seed = 7;
const srand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export const LANE = { minX: -11.6, maxX: 16.6, minZ: -0.95, maxZ: 0.35, z: -0.35 };

// ---------------------------------------------------------------
// Kit: junta caixas, cilindros e esferas em uma malha só
// ---------------------------------------------------------------
class Kit {
  constructor() {
    this.parts = { lit: [], glow: [] };
    this.mats = new Map(); // material → geometrias (madeira com textura, painéis pintados...)
    this.origin = new THREE.Matrix4();
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
  }
  at(x = 0, y = 0, z = 0, ry = 0) {
    this.origin.compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new V3(1, 1, 1));
    return this;
  }
  add(geo, color, o = {}) {
    const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, sx = s, sy = s, sz = s, glow = false, k = 1, jit = 0.04, mat = null, order = 'XYZ' } = o;
    this._q.setFromEuler(this._e.set(rx, ry, rz, order));
    this._m.compose(new V3(x, y, z), this._q, new V3(sx, sy, sz)).premultiply(this.origin);
    geo.applyMatrix4(this._m);
    const c = new THREE.Color(color);
    const j = 1 + (srand() - 0.5) * jit * 2;
    c.multiplyScalar(k * j);
    const n = geo.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    if (mat) {
      if (!this.mats.has(mat)) this.mats.set(mat, []);
      this.mats.get(mat).push(geo);
    } else (glow ? this.parts.glow : this.parts.lit).push(geo);
    return geo;
  }
  // caixa com textura repetindo em metros (tábuas não esticam): o.mat + o.tile
  tbox(w, h, d, color, o = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    boxUV(geo, w, h, d, o.tile || 0.5);
    return this.add(geo, color, { ...o, y: (o.y || 0) + h / 2 });
  }
  // caixa com o y na BASE (mais fácil de empilhar)
  box(w, h, d, color, o = {}) {
    return this.add(new THREE.BoxGeometry(w, h, d), color, { ...o, y: (o.y || 0) + h / 2 });
  }
  cyl(rt, rb, h, color, o = {}, seg = 10) {
    return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), color, { ...o, y: (o.y || 0) + h / 2 });
  }
  ball(r, color, o = {}, seg = 8) {
    return this.add(new THREE.SphereGeometry(r, seg, Math.max(4, seg >> 1)), color, o);
  }
  // barra entre dois pontos (postes inclinados, raios, varetas)
  bar(a, b, t, color, o = {}) {
    const d = new V3().subVectors(b, a);
    const len = d.length();
    const geo = new THREE.BoxGeometry(t, len, t);
    const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.normalize());
    const m = new THREE.Matrix4().compose(new V3().addVectors(a, b).multiplyScalar(0.5), q, new V3(1, 1, 1));
    geo.applyMatrix4(m);
    return this.add(geo, color, o);
  }
  build(name = 'kit') {
    const g = new THREE.Group();
    g.name = name;
    const merge = (list, mat) => {
      if (!list.length) return;
      // mergeGeometries quer todos com os mesmos atributos (posição, normal, uv, cor)
      const geo = mergeGeometries(list, false);
      const mesh = new THREE.Mesh(geo, mat);
      g.add(mesh);
      list.forEach((x) => x.dispose());
    };
    merge(this.parts.lit, new THREE.MeshLambertMaterial({ vertexColors: true }));
    merge(this.parts.glow, new THREE.MeshBasicMaterial({ vertexColors: true }));
    for (const [mat, list] of this.mats) merge(list, mat);
    this.parts = { lit: [], glow: [] };
    this.mats = new Map();
    return g;
  }
}

// UV da caixa em metros/tile (cada face do BoxGeometry tem 4 vértices: +x -x +y -y +z -z)
function boxUV(geo, w, h, d, tile) {
  const uv = geo.attributes.uv;
  const faces = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++)
    for (let i = 0; i < 4; i++) {
      const j = f * 4 + i;
      uv.setXY(j, uv.getX(j) * (faces[f][0] / tile), uv.getY(j) * (faces[f][1] / tile));
    }
  uv.needsUpdate = true;
  return geo;
}

// ---------------------------------------------------------------
// Lâmpadas (instâncias): cada uma com cor e padrão próprios
// ---------------------------------------------------------------
const OFF = new THREE.Color('#3a2c26');
export class Bulbs {
  constructor(max, r = 0.04) {
    this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' }), max);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.list = [];
    this.on = 1; // geral (para o "apagão" e para acender devagar)
    this._c = new THREE.Color();
    this._m = new THREE.Matrix4();
  }
  add(x, y, z, color, { pattern = 'steady', phase = 0, k = 2.4, s = 1 } = {}) {
    const i = this.mesh.count++;
    this._m.makeScale(s, s, s).setPosition(x, y, z);
    this.mesh.setMatrixAt(i, this._m);
    this.list.push({ color: new THREE.Color(color), pattern, phase, k, i });
    return i;
  }
  update(t) {
    const c = this._c;
    for (const b of this.list) {
      let v;
      switch (b.pattern) {
        case 'chase': // letreiro clássico: duas acesas, uma apagada, correndo
          v = (Math.floor(t * 7) + b.phase) % 3 === 0 ? 0.12 : 1;
          break;
        case 'slow': // respiração lenta
          v = 0.55 + 0.45 * Math.sin(t * 1.6 + b.phase * 0.7);
          break;
        case 'twinkle':
          v = 0.7 + 0.3 * Math.sin(t * (2 + (b.phase % 5) * 0.4) + b.phase * 12.9);
          break;
        case 'wave': // onda que passa pela roda
          v = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.4 - b.phase * 0.55), 3);
          break;
        case 'blink':
          v = Math.sin(t * 5 + b.phase) > 0 ? 1 : 0.15;
          break;
        default:
          v = 0.94 + 0.06 * Math.sin(t * 21 + b.phase * 7);
      }
      v *= this.on;
      c.copy(OFF).lerp(b.color, Math.min(1, v)).multiplyScalar(1 + (b.k - 1) * v);
      this.mesh.setColorAt(b.i, c);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}

// ---------------------------------------------------------------
// Texturas em canvas
// ---------------------------------------------------------------
function canvasTex(w, h, draw, { repeat = null, mip = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = mip ? THREE.NearestMipmapLinearFilter : THREE.NearestFilter;
  t.generateMipmaps = mip;
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  t.canvas = c;
  return t;
}

// Placa com letras em pixel art. Retorna a malha (plano) já posicionada.
// glow > 1 faz as letras estourarem no bloom.
function sign(text, { w = 1.4, h = 0.36, bg = '#1c1420', fg = '#ffe9b8', edge = '#d9a84a', size = 15, sub = null, subSize = 8, glow = 1.12, lit = false, outline = null } = {}) {
  // ~80 pixels por metro: mais ou menos 1 texel = 1 pixel da tela na distância da rua
  // (mais que isso a placa encolhe na tela e as letras quebram)
  const PX = 80;
  const cw = Math.round(w * PX), ch = Math.round(h * PX);
  const tex = canvasTex(cw, ch, (ctx) => {
    if (outline) return arched(ctx);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    // moldura de 2 px com cantos recortados
    ctx.fillStyle = edge;
    ctx.fillRect(2, 1, cw - 4, 2);
    ctx.fillRect(2, ch - 3, cw - 4, 2);
    ctx.fillRect(1, 2, 2, ch - 4);
    ctx.fillRect(cw - 3, 2, 2, ch - 4);
    ctx.clearRect(0, 0, 1, 1);
    ctx.clearRect(cw - 1, 0, 1, 1);
    ctx.clearRect(0, ch - 1, 1, 1);
    ctx.clearRect(cw - 1, ch - 1, 1, 1);
    let s = size;
    while (s > 8 && measure(text, s, 700) > cw - 12) s -= 1;
    const th = Math.ceil(s * 1.35);
    const total = th + (sub ? subSize + 4 : 0);
    const y0 = Math.round((ch - total) / 2);
    // sombra das letras (profundidade)
    drawText(ctx, text, cw / 2 + 1, y0 + 1, { size: s, color: '#120a10', align: 'center', weight: 700 });
    drawText(ctx, text, cw / 2, y0, { size: s, color: fg, align: 'center', weight: 700 });
    if (sub) drawText(ctx, sub, cw / 2, y0 + th + 2, { size: subSize, color: edge, align: 'center', font: 'tiny' });
  });
  // placa recortada pelo contorno (arco em cima): fundo, borda dupla e texto na parte reta
  function arched(ctx) {
    ctx.clearRect(0, 0, cw, ch);
    const P = (a, b) => [(a / w + 0.5) * cw, (0.5 - b / h) * ch];
    const path = (inset) => {
      ctx.beginPath();
      outline.forEach(([a, b], i) => {
        const [px, py] = P(a, b);
        const cx = cw / 2, cy = ch * 0.62;
        const k = 1 - inset / Math.max(cw, ch) * 2.2;
        const qx = cx + (px - cx) * k, qy = cy + (py - cy) * k;
        if (i) ctx.lineTo(qx, qy);
        else ctx.moveTo(qx, qy);
      });
      ctx.closePath();
    };
    path(0);
    ctx.fillStyle = edge;
    ctx.fill();
    path(2);
    ctx.fillStyle = '#120a10';
    ctx.fill();
    path(4);
    ctx.fillStyle = bg;
    ctx.fill();
    // brilho de verniz no alto do arco
    ctx.save();
    path(4);
    ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
    let s = size;
    while (s > 8 && measure(text, s, 700) > cw - 16) s -= 1;
    const th = Math.ceil(s * 1.35);
    const total = th + (sub ? subSize + 4 : 0);
    const y0 = Math.round(ch * 0.6 - total / 2);
    drawText(ctx, text, cw / 2 + 1, y0 + 1, { size: s, color: '#120a10', align: 'center', weight: 700 });
    drawText(ctx, text, cw / 2, y0, { size: s, color: fg, align: 'center', weight: 700 });
    if (sub) drawText(ctx, sub, cw / 2, y0 + th + 2, { size: subSize, color: edge, align: 'center', font: 'tiny' });
  }
  const mat = lit
    ? new THREE.MeshLambertMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: glow - 1, transparent: true, alphaTest: 0.5 })
    : new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5 });
  if (!lit) mat.color.setScalar(glow);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  return m;
}

// moldura de lâmpadas em volta de um retângulo (centro x,y; plano z)
function bulbFrame(bulbs, cx, cy, z, w, h, color, { step = 0.12, pattern = 'chase', k = 2.6 } = {}) {
  let n = 0;
  const nx = Math.max(2, Math.round(w / step)), ny = Math.max(1, Math.round(h / step));
  for (let i = 0; i <= nx; i++) {
    bulbs.add(cx - w / 2 + (w * i) / nx, cy + h / 2, z, color, { pattern, phase: n++, k });
    bulbs.add(cx + w / 2 - (w * i) / nx, cy - h / 2, z, color, { pattern, phase: n++ + 40, k });
  }
  for (let j = 1; j < ny; j++) {
    bulbs.add(cx + w / 2, cy + h / 2 - (h * j) / ny, z, color, { pattern, phase: n++, k });
    bulbs.add(cx - w / 2, cy - h / 2 + (h * j) / ny, z, color, { pattern, phase: n++ + 40, k });
  }
}

// ---------------------------------------------------------------
// Toldo listrado com babado (as barracas)
// x0..x1, altura da borda da frente y, frente em z, profundidade d
// ---------------------------------------------------------------
function awning(kit, x0, x1, y, z, d, cols, { stripe = 0.24, rise = 0.32 } = {}) {
  const n = Math.max(2, Math.round((x1 - x0) / stripe));
  const sw = (x1 - x0) / n;
  const ang = Math.atan2(rise, d);
  const len = Math.hypot(rise, d);
  for (let i = 0; i < n; i++) {
    const cx = x0 + sw * (i + 0.5);
    const col = cols[i % cols.length];
    kit.add(new THREE.BoxGeometry(sw + 0.002, 0.03, len), col, { x: cx, y: y + rise / 2, z: z - d / 2, rx: ang });
    // babado: meio disco pendurado na frente
    const g = new THREE.CylinderGeometry(sw / 2, sw / 2, 0.025, 10, 1, false, -Math.PI / 2, Math.PI);
    kit.add(g, col, { x: cx, y: y + 0.005, z: z + 0.012, rx: Math.PI / 2, k: 0.96 });
  }
  // cordão da borda
  kit.box(x1 - x0 + 0.04, 0.03, 0.04, '#f4e6c8', { x: (x0 + x1) / 2, y: y - 0.01, z: z + 0.01, k: 0.9 });
}

// ---------------------------------------------------------------
// Gente (pixel art em canvas): 3 quadros (parada, passo A, passo B)
// ---------------------------------------------------------------
const PW = 40, PH = 96;
function drawPerson(ctx, ox, f, o) {
  const { skin, hair, top, legs, kid, style, accent } = o;
  const s = kid ? 0.66 : 1;
  const base = PH - 2;
  const px = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(ox + x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  };
  const legH = 36 * s, bodyH = 30 * s, headR = 7 * s;
  const cx = PW / 2;
  const hip = base - legH;
  // pernas (passo)
  const sw = f === 0 ? 0 : f === 1 ? 4 : -4;
  px(cx - 5 * s + sw * 0.6, hip, 4 * s, legH, legs);
  px(cx + 1 * s - sw * 0.6, hip, 4 * s, legH, legs);
  px(cx - 6 * s + sw * 0.6, base - 3, 6 * s, 3, '#1a1418');
  px(cx + 1 * s - sw * 0.6, base - 3, 6 * s, 3, '#1a1418');
  // tronco
  const sh = hip - bodyH;
  px(cx - 7 * s, sh + 2, 14 * s, bodyH, top);
  px(cx - 6 * s, sh, 12 * s, 3, top);
  if (style === 'saia') px(cx - 8 * s, hip - 4, 16 * s, 12 * s, accent || top);
  // braços (balançam ao andar)
  px(cx - 9 * s - sw * 0.3, sh + 3, 3 * s, 22 * s, top);
  px(cx + 6 * s + sw * 0.3, sh + 3, 3 * s, 22 * s, top);
  px(cx - 9 * s - sw * 0.3, sh + 3 + 22 * s, 3 * s, 4 * s, skin);
  px(cx + 6 * s + sw * 0.3, sh + 3 + 22 * s, 3 * s, 4 * s, skin);
  // pescoço e cabeça
  px(cx - 2 * s, sh - 4 * s, 4 * s, 5 * s, skin);
  const hy = sh - 4 * s - headR;
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(ox + cx, hy, headR * 0.9, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  // cabelo
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(ox + cx, hy - headR * 0.25, headR * 0.98, headR * 0.82, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  if (style === 'longo' || style === 'saia') px(cx - headR, hy - 2, headR * 0.7, headR * 2.6, hair);
  if (style === 'coque') {
    ctx.beginPath();
    ctx.arc(ox + cx - 2, hy - headR - 2, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (style === 'bone') {
    px(cx - headR, hy - headR * 0.9, headR * 2, headR * 0.7, accent || '#c33');
    px(cx, hy - headR * 0.4, headR * 1.4, 2, accent || '#c33');
  }
}

function personTexture(o) {
  return canvasTex(PW * 3, PH, (ctx) => {
    for (let f = 0; f < 3; f++) drawPerson(ctx, f * PW, f, o);
    // binariza o alfa (pixel art sem borda borrada)
    const img = ctx.getImageData(0, 0, PW * 3, PH);
    for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 120 ? 255 : 0;
    ctx.putImageData(img, 0, 0);
  }, { mip: true });
}

const PEOPLE = [
  { skin: '#c98e6e', hair: '#2a1a14', top: '#3c6fb0', legs: '#2a2c44', style: 'curto' },
  { skin: '#e2b49a', hair: '#6a3a22', top: '#c94a5a', legs: '#30283a', style: 'longo' },
  { skin: '#8a5a40', hair: '#151012', top: '#f0c040', legs: '#2c3a2c', style: 'bone', accent: '#2a4a9a' },
  { skin: '#f0c8b0', hair: '#d9a860', top: '#8a5ac0', legs: '#3a2a30', style: 'saia', accent: '#5a3a8a' },
  { skin: '#b07a5a', hair: '#1a1210', top: '#3a9a7a', legs: '#24242e', style: 'coque' },
  { skin: '#d9a080', hair: '#3a2418', top: '#e07a3a', legs: '#2a3050', style: 'curto', kid: true },
  { skin: '#a06a4a', hair: '#1a1210', top: '#f2f0e8', legs: '#3a3a52', style: 'curto' },
  { skin: '#e8c0a0', hair: '#2a1a14', top: '#ff8ab0', legs: '#4a3a5a', style: 'longo', kid: true },
];

// ===============================================================
// Monta o parque
// ===============================================================
export function buildPark(fx, { stripCanvas = null } = {}) {
  seed = 7;
  const root = new THREE.Group();
  const kit = new Kit();
  const bulbs = new Bulbs(2600, 0.035);
  const bigBulbs = new Bulbs(700, 0.055);
  root.add(bulbs.mesh, bigBulbs.mesh);
  const anim = []; // funções (t, dt) chamadas todo quadro
  const interactables = [];
  const lights = [];
  const signs = [];
  const addSign = (m, x, y, z, ry = 0) => {
    m.position.set(x, y, z);
    m.rotation.y = ry;
    root.add(m);
    signs.push(m);
    return m;
  };
  const point = (x, y, z, color, intensity, distance = 7, glow = null) => {
    const l = new THREE.PointLight(color, intensity, distance, 1.6);
    l.position.set(x, y, z);
    root.add(l);
    lights.push(l);
    if (glow) fx.addGlow(l.position, color, glow);
    return l;
  };

  // ------------------------------------------------------------
  // Céu: azul da noite com o resto do pôr do sol rosado no horizonte,
  // estrelas, nuvens finas iluminadas por baixo pela cidade e lua.
  // ------------------------------------------------------------
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uStars: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uStars;
      varying vec3 vDir;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        vec3 top = vec3(0.012, 0.016, 0.06);
        vec3 mid = vec3(0.05, 0.05, 0.16);
        vec3 hor = vec3(0.30, 0.14, 0.26);
        vec3 glow = vec3(0.62, 0.30, 0.26);
        vec3 c = mix(mid, top, smoothstep(0.05, 0.6, y));
        c = mix(hor, c, smoothstep(-0.02, 0.22, y));
        c += glow * exp(-max(y, 0.0) * 22.0) * 0.55;  // brilho da cidade no horizonte
        // nuvens finas, iluminadas por baixo (laranja-rosado)
        vec2 uv = d.xz / max(y + 0.12, 0.05);
        float cl = n(uv * 0.9 + vec2(uTime * 0.004, 0.0)) * 0.6 + n(uv * 2.3 - vec2(uTime * 0.006, 0.0)) * 0.4;
        cl = smoothstep(0.55, 0.85, cl) * smoothstep(0.03, 0.15, y) * (1.0 - smoothstep(0.35, 0.7, y));
        c = mix(c, vec3(0.20, 0.11, 0.20), cl * 0.6);
        // estrelas (mais no alto, piscando)
        vec2 sp = d.xz / (y + 1.0) * 380.0;
        vec2 cell = floor(sp);
        float s = h(cell);
        float star = step(0.9965, s) * smoothstep(0.5, 0.0, length(fract(sp) - 0.5));
        star *= (0.6 + 0.4 * sin(uTime * (1.0 + s * 3.0) + s * 40.0)) * smoothstep(0.12, 0.45, y) * (1.0 - cl);
        c += vec3(0.9, 0.92, 1.0) * star * 1.4;
        // mais estrelas (miudinhas) quando a cena pede: o céu do alto da roda
        if (uStars > 0.0) {
          vec2 sp2 = d.xz / (y + 1.0) * 620.0;
          float s2 = h(floor(sp2) + 7.0);
          float st2 = step(0.993, s2) * smoothstep(0.45, 0.0, length(fract(sp2) - 0.5));
          st2 *= (0.5 + 0.5 * sin(uTime * (0.7 + s2 * 2.0) + s2 * 60.0)) * smoothstep(0.06, 0.35, y) * (1.0 - cl * 0.7);
          c += vec3(0.85, 0.9, 1.0) * st2 * uStars * 1.1;
          c = mix(c, c * vec3(0.85, 0.9, 1.15), uStars * 0.25 * smoothstep(0.2, 0.7, y));
        }
        // lua (crescente), alto à esquerda
        vec3 md = normalize(vec3(-0.55, 0.52, -0.66));
        float m = dot(d, md);
        float disc = smoothstep(0.99955, 0.99965, m);
        vec3 md2 = normalize(md + vec3(0.012, 0.004, 0.0));
        disc *= 1.0 - smoothstep(0.99955, 0.99965, dot(d, md2)) * 0.92;
        c += vec3(1.0, 0.95, 0.85) * disc * 2.4;
        c += vec3(0.5, 0.55, 0.8) * pow(max(m, 0.0), 900.0) * 0.25;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), skyMat);
  root.add(sky);
  const skyCtl = { stars: 0 };
  anim.push((t, dt) => {
    skyMat.uniforms.uTime.value = t;
    skyMat.uniforms.uStars.value += (skyCtl.stars - skyMat.uniforms.uStars.value) * Math.min(1, (dt || 0.016) * 0.8);
  });

  // cidade no horizonte (prédios com janelas acesas) e morros
  const city = canvasTex(1024, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    let x = 0;
    while (x < w) {
      const bw = 10 + srand() * 34;
      const bh = 14 + Math.pow(srand(), 1.8) * 90;
      ctx.fillStyle = srand() < 0.5 ? '#0b0b1f' : '#0e0d24';
      ctx.fillRect(x, h - bh, bw, bh);
      // janelas
      for (let wy = h - bh + 4; wy < h - 4; wy += 5)
        for (let wx = x + 2; wx < x + bw - 2; wx += 4)
          if (srand() < 0.34) {
            const r = srand();
            ctx.fillStyle = r < 0.62 ? '#ffd38a' : r < 0.88 ? '#a8c8ff' : '#ffb0d0';
            ctx.fillRect(wx, wy, 2, 2);
          }
      if (bh > 70 && srand() < 0.6) {
        ctx.fillStyle = '#ff4040';
        ctx.fillRect(x + bw / 2, h - bh - 4, 2, 2); // luz de antena
      }
      x += bw + srand() * 6;
    }
    // ruas: fileiras de luzinhas alaranjadas lá embaixo e o brilho da cidade
    for (let i = 0; i < 520; i++) {
      ctx.fillStyle = srand() < 0.8 ? '#ffb060' : '#fff0c0';
      ctx.fillRect(Math.floor(srand() * w), h - 2 - Math.floor(srand() * 7), 1, 1);
    }
  });
  const cityMat = new THREE.MeshBasicMaterial({ map: city, transparent: true, alphaTest: 0.5, fog: false });
  cityMat.color.setScalar(1.0);
  const cityMesh = new THREE.Mesh(new THREE.PlaneGeometry(220, 27.5), cityMat);
  cityMesh.position.set(10, 11, -95);
  root.add(cityMesh);

  const hills = canvasTex(512, 64, (ctx, w, h) => {
    ctx.fillStyle = '#0a0a1a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) ctx.lineTo(x, h * 0.45 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.037) * 5 + srand() * 2);
    ctx.lineTo(w, h);
    ctx.fill();
  });
  const hillMesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 14), new THREE.MeshBasicMaterial({ map: hills, transparent: true, alphaTest: 0.5 }));
  hillMesh.position.set(10, 4, -70);
  root.add(hillMesh);

  // árvores (silhuetas com algumas luzinhas penduradas)
  const trees = canvasTex(1024, 160, (ctx, w, h) => {
    for (let i = 0; i < 46; i++) {
      const x = srand() * w, r = 12 + srand() * 22, y = h - 24 - srand() * 30;
      ctx.fillStyle = '#0c0e1c';
      ctx.fillRect(x - 2, y, 4, h - y);
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(x + (srand() - 0.5) * r, y - srand() * r * 0.8, r * (0.5 + srand() * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillRect(0, h - 26, w, 26);
  });
  const treeMesh = new THREE.Mesh(new THREE.PlaneGeometry(130, 20), new THREE.MeshBasicMaterial({ map: trees, transparent: true, alphaTest: 0.5 }));
  treeMesh.position.set(8, 5.5, -38);
  root.add(treeMesh);
  for (let i = 0; i < 70; i++) bulbs.add(-50 + srand() * 120, 1.5 + srand() * 6, -37.6, ['#ffcf7a', '#ff9ac0', '#9ad8ff'][i % 3], { pattern: 'twinkle', phase: i * 3.1, k: 1.6 });

  // ------------------------------------------------------------
  // Chão: piso de pedra portuguesa escuro + terra batida + sujeirinha
  // ------------------------------------------------------------
  const ground = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2d2733';
    ctx.fillRect(0, 0, w, h);
    // pedrinhas
    for (let y = 0; y < h; y += 4)
      for (let x = (y / 4) % 2 ? 2 : 0; x < w; x += 4) {
        const v = 38 + srand() * 14;
        ctx.fillStyle = `rgb(${v + 4},${v - 2},${v + 10})`;
        ctx.fillRect(x, y, 3, 3);
      }
    // ondas de pedra portuguesa (calçadão)
    ctx.fillStyle = '#4a4252';
    for (let x = 0; x < w; x++) {
      const y = 128 + Math.sin((x / w) * Math.PI * 4) * 18;
      ctx.fillRect(x, Math.round(y), 1, 6);
      ctx.fillRect(x, Math.round(y) + 40, 1, 4);
    }
    // sujeira de parque: pipoca, ingressos, confete, tampinhas
    const bits = ['#f6e7b0', '#f6e7b0', '#f2c24a', '#e85a7a', '#5ac0e8', '#8ae07a', '#c9c3d8'];
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = bits[i % bits.length];
      const x = srand() * w, y = srand() * h;
      if (i % 9 === 0) ctx.fillRect(x, y, 4, 2); // ingresso
      else ctx.fillRect(x, y, i % 3 ? 1 : 2, 1);
    }
    // manchas (refrigerante, sombra de chiclete)
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = 'rgba(10,8,14,0.35)';
      ctx.beginPath();
      ctx.ellipse(srand() * w, srand() * h, 4 + srand() * 8, 2 + srand() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { repeat: [40, 30], mip: true });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 120), new THREE.MeshLambertMaterial({ map: ground }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(10, 0, -40);
  root.add(floor);

  // sombras de contato macias (debaixo das barracas e das pessoas)
  const blobTex = canvasTex(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(0,0,0,0.75)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
  blobTex.magFilter = blobTex.minFilter = THREE.LinearFilter;
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  const blob = (x, z, w, d, o = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), o === 1 ? blobMat : blobMat.clone());
    if (o !== 1) m.material.opacity = o;
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.004, z);
    root.add(m);
    return m;
  };
  // poças de luz no chão (quentes, aditivas): o "pool" de cada barraca
  const poolTex = canvasTex(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
  poolTex.magFilter = poolTex.minFilter = THREE.LinearFilter;
  const pool = (x, z, w, d, color, k = 0.35) => {
    const mat = new THREE.MeshBasicMaterial({ map: poolTex, color: new THREE.Color(color).multiplyScalar(k), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.006, z);
    root.add(m);
    return m;
  };

  // ------------------------------------------------------------
  // Peças comuns das barracas (mais detalhe: madeira com veio, painéis
  // pintados, colunas torneadas, toldo curvo com franja e luzinhas)
  // ------------------------------------------------------------
  const FRONT = -1.55; // frente das barracas (balcão)
  const WOOD = '#5a3d33', WOOD_D = '#3a2627', CREAM = '#f1e2c4', METAL = '#3a3848';

  // madeira neutra (o vertex color pinta): tábuas com veio, frestas e nós
  const woodCanvas = (vertical) => canvasTex(128, 128, (ctx, w, h) => {
    const P = 4; // tábuas por textura
    for (let i = 0; i < P; i++) {
      const v = 200 + srand() * 34;
      ctx.fillStyle = `rgb(${v},${v - 8},${v - 16})`;
      if (vertical) ctx.fillRect((i * w) / P, 0, w / P, h);
      else ctx.fillRect(0, (i * h) / P, w, h / P);
    }
    // veio: linhas finas onduladas
    for (let k = 0; k < 90; k++) {
      const a = srand() * (vertical ? w : h), len = 20 + srand() * 60, off = srand() * (vertical ? h : w);
      ctx.fillStyle = `rgba(90,60,40,${0.12 + srand() * 0.16})`;
      for (let t = 0; t < len; t++) {
        const q = a + Math.sin((t + off) * 0.11) * 1.2;
        if (vertical) ctx.fillRect(Math.round(q), Math.round((off + t) % h), 1, 1);
        else ctx.fillRect(Math.round((off + t) % w), Math.round(q), 1, 1);
      }
    }
    // frestas entre as tábuas + brilho na borda de cima
    for (let i = 0; i < P; i++) {
      const p = Math.round((i * (vertical ? w : h)) / P);
      ctx.fillStyle = 'rgba(30,18,14,0.75)';
      if (vertical) ctx.fillRect(p, 0, 1, h);
      else ctx.fillRect(0, p, w, 1);
      ctx.fillStyle = 'rgba(255,240,220,0.18)';
      if (vertical) ctx.fillRect(p + 1, 0, 1, h);
      else ctx.fillRect(0, p + 1, w, 1);
    }
    // nós e pregos
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = 'rgba(70,40,28,0.45)';
      ctx.beginPath();
      ctx.ellipse(srand() * w, srand() * h, vertical ? 2 : 4, vertical ? 4 : 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(40,36,44,0.8)';
    for (let i = 0; i < P; i++) for (const e of [4, (vertical ? h : w) - 5]) {
      const c = Math.round(((i + 0.5) * (vertical ? w : h)) / P);
      if (vertical) ctx.fillRect(c, e, 1, 1);
      else ctx.fillRect(e, c, 1, 1);
    }
  }, { mip: true });
  const woodTex = woodCanvas(false);
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
  const boardTex = woodCanvas(true);
  boardTex.wrapS = boardTex.wrapT = THREE.RepeatWrapping;
  const woodMat = new THREE.MeshLambertMaterial({ map: woodTex, vertexColors: true });
  const boardMat = new THREE.MeshLambertMaterial({ map: boardTex, vertexColors: true });

  // frente do balcão pintada: painéis com moldura em relevo, filete dourado,
  // tachinhas e uma faixa de triângulos embaixo (como nas barracas de verdade)
  function panelMat(w, h, base, trim, accent) {
    const PX = 110;
    const cw = Math.max(32, Math.round(w * PX)), ch = Math.max(16, Math.round(h * PX));
    const tex = canvasTex(cw, ch, (ctx) => {
      const B = new THREE.Color(base), T = new THREE.Color(trim);
      const css = (c, k = 1) => `rgb(${Math.min(255, c.r * 255 * k) | 0},${Math.min(255, c.g * 255 * k) | 0},${Math.min(255, c.b * 255 * k) | 0})`;
      ctx.fillStyle = css(B);
      ctx.fillRect(0, 0, cw, ch);
      // veio vertical leve (madeira pintada)
      for (let x = 0; x < cw; x += 2) {
        ctx.fillStyle = `rgba(0,0,0,${0.04 + srand() * 0.05})`;
        ctx.fillRect(x, 0, 1, ch);
      }
      const top = 7, kick = Math.round(ch * 0.2);
      // faixa de cima com tachinhas
      ctx.fillStyle = css(B, 0.78);
      ctx.fillRect(0, 0, cw, top);
      for (let x = 6; x < cw - 3; x += 10) {
        ctx.fillStyle = css(T, 1.1);
        ctx.fillRect(x, 3, 2, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(x, 3, 1, 1);
      }
      // painéis
      const n = Math.max(1, Math.round(w / 0.62));
      const gap = 7, pw = (cw - gap * (n + 1)) / n, py = top + 6, ph = ch - top - kick - 12;
      for (let i = 0; i < n; i++) {
        const px = gap + i * (pw + gap);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; // sombra (relevo para dentro)
        ctx.fillRect(px, py, pw, 2);
        ctx.fillRect(px, py, 2, ph);
        ctx.fillStyle = 'rgba(255,240,220,0.22)'; // luz embaixo/direita
        ctx.fillRect(px, py + ph - 2, pw, 2);
        ctx.fillRect(px + pw - 2, py, 2, ph);
        ctx.fillStyle = css(B, 0.86);
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
        // filete
        ctx.strokeStyle = css(T);
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(px + 5) + 0.5, Math.round(py + 5) + 0.5, Math.round(pw - 10), Math.round(ph - 10));
        // losango no centro
        const cx = Math.round(px + pw / 2), cy = Math.round(py + ph / 2);
        ctx.fillStyle = css(new THREE.Color(accent));
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx + 5, cy);
        ctx.lineTo(cx, cy + 6);
        ctx.lineTo(cx - 5, cy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(cx - 1, cy - 4, 1, 2);
      }
      // rodapé com triângulos
      const ky = ch - kick;
      ctx.fillStyle = css(B, 0.62);
      ctx.fillRect(0, ky, cw, kick);
      const tw = 12;
      for (let x = 0, i = 0; x < cw; x += tw, i++) {
        ctx.fillStyle = i % 2 ? css(new THREE.Color(accent), 0.95) : css(T, 0.95);
        ctx.beginPath();
        ctx.moveTo(x, ky + 2);
        ctx.lineTo(x + tw, ky + 2);
        ctx.lineTo(x + tw / 2, ch - 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = css(T);
      ctx.fillRect(0, ky, cw, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, ch - 2, cw, 2);
    }, { mip: true });
    return new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.12 });
  }

  // Toldo curvo listrado: lona com espessura, faixa + franja recortada na frente
  // e nas laterais, cordão com pompons e braços de ferro
  function awningPro(x0, x1, y, z, d, cols, { stripe = 0.24, rise = 0.32, sides = true, band = 0.07 } = {}) {
    const n = Math.max(2, Math.round((x1 - x0) / stripe));
    const sw = (x1 - x0) / n;
    const prof = (u) => y + rise * (1 - u) + Math.sin(u * Math.PI) * 0.07; // u: 0 fundo → 1 frente
    const pz = (u) => z - d + u * d;
    for (let i = 0; i < n; i++) {
      const cx = x0 + sw * (i + 0.5);
      const col = cols[i % cols.length];
      const geo = new THREE.BoxGeometry(sw + 0.003, 0.022, 1, 1, 1, 10);
      const pos = geo.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const u = pos.getZ(v) + 0.5;
        pos.setXYZ(v, pos.getX(v) + cx, pos.getY(v) + prof(u), pz(u));
      }
      geo.computeVertexNormals();
      kit.add(geo, col, { jit: 0.02 });
      // faixa da frente + franja (meio disco) com pompom
      kit.box(sw + 0.002, band, 0.018, col, { x: cx, y: y - band + 0.01, z: z + 0.006, k: 0.93 });
      const g = new THREE.CylinderGeometry(sw / 2, sw / 2, 0.018, 12, 1, false, -Math.PI / 2, Math.PI);
      kit.add(g, col, { x: cx, y: y - band + 0.012, z: z + 0.006, rx: Math.PI / 2, k: 0.9 });
      kit.ball(0.016, CREAM, { x: cx, y: y - band - sw / 2 + 0.01, z: z + 0.012, k: 0.95 });
    }
    // cordão da borda
    kit.add(new THREE.CylinderGeometry(0.012, 0.012, x1 - x0 + 0.04, 6), CREAM, { x: (x0 + x1) / 2, y: y + 0.008, z: z + 0.018, rz: Math.PI / 2, k: 0.9 });
    if (sides) {
      // laterais: franja acompanhando a curva
      const m = Math.max(3, Math.round(d / 0.16));
      for (const sx of [x0, x1]) {
        for (let k = 0; k < m; k++) {
          const u0 = k / m, u1 = (k + 1) / m, um = (u0 + u1) / 2;
          const a = new V3(sx, prof(u0) - band / 2, pz(u0)), b = new V3(sx, prof(u1) - band / 2, pz(u1));
          kit.bar(a, b, 0.014, cols[k % cols.length], { sx: 1, k: 0.85 });
          const seg = a.distanceTo(b);
          const hd = new THREE.CylinderGeometry(seg / 2, seg / 2, 0.014, 10, 1, false, -Math.PI / 2, Math.PI);
          kit.add(hd, cols[k % cols.length], { x: sx, y: prof(um) - band, z: pz(um), rx: Math.PI / 2, ry: Math.PI / 2, order: 'YXZ', k: 0.85 });
        }
      }
    }
  }

  // cordão de luzinhas (fio fino + lâmpadas pequenas piscando devagar)
  function fairy(a, b, sag, n, cols = ['#ffd9a0', '#ffd9a0', '#ffb0c8', '#fff0d0']) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const p = new V3().lerpVectors(a, b, u);
      p.y -= Math.sin(u * Math.PI) * sag;
      pts.push(p);
      if (i > 0 && i < n) bulbs.add(p.x, p.y - 0.025, p.z, cols[i % cols.length], { pattern: 'twinkle', phase: i * 2.3 + a.x, k: 2.1, s: 0.75 });
    }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#141016' })));
  }

  // coluna torneada (base, fuste com anéis e bulbo, capitel)
  function turnedPost(x, z, h, col, trim) {
    kit.box(0.13, 0.12, 0.13, col, { x, z, k: 0.78 });
    kit.box(0.15, 0.025, 0.15, trim, { x, y: 0.12, z });
    kit.cyl(0.032, 0.036, h - 0.34, col, { x, y: 0.145, z }, 10);
    kit.ball(0.052, col, { x, y: 0.3, z, sy: 1.5 }, 10);
    for (const yy of [0.42, h * 0.55, h - 0.32]) kit.cyl(0.046, 0.046, 0.03, trim, { x, y: yy, z }, 10);
    kit.box(0.12, 0.09, 0.12, col, { x, y: h - 0.2, z, k: 0.9 });
    kit.box(0.15, 0.03, 0.15, trim, { x, y: h - 0.11, z });
  }

  // estrutura: balcão, laterais, fundo, colunas e toldo
  function stall(x, w, { cols, counter = '#7a2a35', trim = '#e9b84a', back = '#3a2a3a', roofY = 2.25, depth = 1.35, counterH = 0.95, accent = null } = {}) {
    const z0 = FRONT, zb = FRONT - depth;
    kit.at(0, 0, 0);
    // piso de tábuas
    kit.tbox(w + 0.12, 0.08, depth + 0.12, '#6a4a3e', { x, z: (z0 + zb) / 2, mat: woodMat, tile: 0.5 });
    // fundo e laterais em tábuas verticais pintadas
    kit.tbox(w, roofY + 0.1, 0.06, back, { x, z: zb + 0.03, mat: boardMat, tile: 0.6, k: 1.15 });
    kit.tbox(0.06, roofY, depth, back, { x: x - w / 2 + 0.03, z: (z0 + zb) / 2, k: 0.95, mat: boardMat, tile: 0.6 });
    kit.tbox(0.06, roofY, depth, back, { x: x + w / 2 - 0.03, z: (z0 + zb) / 2, k: 0.95, mat: boardMat, tile: 0.6 });
    // moldura interna do fundo (rodapé e cimalha)
    kit.box(w - 0.1, 0.06, 0.03, trim, { x, y: 0.1, z: zb + 0.07, k: 0.7 });
    kit.box(w - 0.1, 0.05, 0.03, trim, { x, y: roofY - 0.12, z: zb + 0.07, k: 0.7 });
    // balcão: corpo, frente pintada, tampo grosso com borda arredondada e friso
    kit.tbox(w - 0.04, counterH, 0.14, counter, { x, z: z0 - 0.07, mat: boardMat, tile: 0.6 });
    const front = new THREE.PlaneGeometry(w - 0.08, counterH - 0.06);
    kit.add(front, '#ffffff', { x, y: counterH / 2 + 0.01, z: z0 + 0.002, jit: 0, mat: panelMat(w - 0.08, counterH - 0.06, counter, trim, accent || cols[0]) });
    kit.tbox(w + 0.06, 0.055, 0.3, '#8a5a40', { x, y: counterH, z: z0 - 0.06, mat: woodMat, tile: 0.45 });
    kit.add(new THREE.CylinderGeometry(0.028, 0.028, w + 0.06, 8), '#8a5a40', { x, y: counterH + 0.028, z: z0 + 0.09, rz: Math.PI / 2, k: 1.05 });
    kit.box(w - 0.02, 0.035, 0.03, trim, { x, y: counterH - 0.04, z: z0 + 0.012, k: 1.05 });
    // colunas da frente
    turnedPost(x - w / 2 + 0.05, z0 - 0.02, roofY, CREAM, trim);
    turnedPost(x + w / 2 - 0.05, z0 - 0.02, roofY, CREAM, trim);
    // teto, testeira e toldo
    kit.tbox(w + 0.12, 0.06, depth + 0.12, WOOD_D, { x, y: roofY + 0.1, z: (z0 + zb) / 2, mat: woodMat });
    kit.box(w + 0.14, 0.14, 0.04, trim, { x, y: roofY + 0.04, z: z0 + 0.02, k: 0.75 });
    awningPro(x - w / 2 - 0.1, x + w / 2 + 0.1, roofY - 0.04, z0 + 0.46, 0.62, cols, { rise: 0.34 });
    // braços de ferro do toldo
    for (const sx of [x - w / 2 + 0.05, x + w / 2 - 0.05]) kit.bar(new V3(sx, roofY - 0.25, z0 - 0.02), new V3(sx, roofY - 0.02, z0 + 0.42), 0.014, '#2a2630');
    // luzinhas penduradas embaixo da franja
    fairy(new V3(x - w / 2 - 0.05, roofY - 0.2, z0 + 0.5), new V3(x + w / 2 + 0.05, roofY - 0.2, z0 + 0.5), 0.14, Math.round(w * 7));
    blob(x, z0 - depth / 2 + 0.2, w + 1.0, depth + 1.2, 0.8);
  }

  // contorno da placa em arco (pontos em metros, centro 0,0)
  function archOutline(w, h, arch) {
    const pts = [];
    const hw = w / 2, hh = h / 2;
    pts.push([-hw, -hh], [hw, -hh], [hw, hh - arch * 0.15]);
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const xx = hw - u * w;
      pts.push([xx, hh - arch * 0.15 + Math.sin(u * Math.PI) * arch]);
    }
    pts.push([-hw, hh - arch * 0.15]);
    return pts;
  }

  // placa grande em arco em cima do toldo, com lâmpadas no contorno
  function topSign(x, text, { w = 1.7, h = 0.42, y = 2.95, z = FRONT + 0.3, color = '#ffd27a', arch = 0.16, ...o } = {}) {
    const outline = archOutline(w, h, arch);
    const m = sign(text, { w, h: h + arch, outline: outline.map(([a, b]) => [a, b - arch / 2]), ...o });
    addSign(m, x, y + arch / 2 - 0.01, z);
    // suportes e placa de fundo recortada (madeira escura com borda)
    kit.box(0.05, 0.6, 0.05, WOOD_D, { x: x - w * 0.35, y: y - 0.75, z: z - 0.04 });
    kit.box(0.05, 0.6, 0.05, WOOD_D, { x: x + w * 0.35, y: y - 0.75, z: z - 0.04 });
    const shape = new THREE.Shape(outline.map(([a, b]) => new THREE.Vector2(a * 1.04, b * 1.04 + (b > 0 ? 0.02 : -0.02))));
    const eg = mergeVertices(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }));
    kit.add(eg, '#2a1a20', { x, y, z: z - 0.065 });
    // lâmpadas acompanhando o arco e a base
    const per = [];
    for (let i = 0; i < outline.length; i++) {
      const [ax, ay] = outline[i], [bx, by] = outline[(i + 1) % outline.length];
      const len = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(1, Math.round(len / 0.13));
      for (let k = 0; k < steps; k++) per.push([ax + ((bx - ax) * k) / steps, ay + ((by - ay) * k) / steps]);
    }
    let last = null, ph = 0;
    for (const [px, py] of per) {
      if (last && Math.hypot(px - last[0], py - last[1]) < 0.1) continue;
      bigBulbs.add(x + px * 1.02, y + py * 1.02 + (py > 0 ? 0.012 : -0.012), z + 0.02, color, { pattern: 'chase', phase: ph++, k: 2.6 });
      last = [px, py];
    }
    return m;
  }

  // lanterna pendurada (armação de ferro, vidro aceso) + luz real + halo
  function stallLight(x, color = '#ffb36a', { y = 2.0, z = FRONT + 0.05, intensity = 4.5, glow = 1.0, dist = 6.5 } = {}) {
    const D = '#1c1820';
    kit.cyl(0.004, 0.004, 0.22, D, { x, y: y + 0.12, z });
    kit.add(new THREE.TorusGeometry(0.02, 0.005, 4, 10), D, { x, y: y + 0.34, z });
    kit.add(new THREE.ConeGeometry(0.075, 0.07, 4), D, { x, y: y + 0.105, z, ry: Math.PI / 4 });
    kit.box(0.11, 0.014, 0.11, D, { x, y: y + 0.06, z });
    kit.box(0.08, 0.11, 0.08, color, { x, y: y - 0.055, z, glow: true, k: 1.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) kit.box(0.012, 0.125, 0.012, D, { x: x + sx * 0.045, y: y - 0.062, z: z + sz * 0.045 });
    kit.box(0.1, 0.014, 0.1, D, { x, y: y - 0.075, z });
    bigBulbs.add(x, y, z, color, { k: 3.4, s: 0.9 });
    const l = point(x, y - 0.1, z + 0.25, color, intensity, dist, { power: 3.2 * glow, core: 0.22, reach: 1.8 });
    pool(x, z + 0.7, 3.6, 2.4, color, 0.22);
    return l;
  }

  // prêmios de pelúcia (ursinhos simples de caixas e bolas)
  function plush(x, y, z, col, s = 1) {
    kit.ball(0.12 * s, col, { x, y: y + 0.12 * s, z, sy: 1.1 });
    kit.ball(0.09 * s, col, { x, y: y + 0.3 * s, z: z + 0.01 });
    kit.ball(0.035 * s, col, { x: x - 0.07 * s, y: y + 0.38 * s, z, k: 0.9 });
    kit.ball(0.035 * s, col, { x: x + 0.07 * s, y: y + 0.38 * s, z, k: 0.9 });
    kit.ball(0.04 * s, CREAM, { x, y: y + 0.27 * s, z: z + 0.08 * s, k: 0.95 });
    kit.ball(0.012 * s, '#111', { x: x - 0.035 * s, y: y + 0.32 * s, z: z + 0.085 * s });
    kit.ball(0.012 * s, '#111', { x: x + 0.035 * s, y: y + 0.32 * s, z: z + 0.085 * s });
  }

  // fileira de pelúcias penduradas no alto da barraca
  function prizeRow(x, w, y, z, cols) {
    kit.box(w, 0.02, 0.02, '#c9c3d8', { x, y: y + 0.48, z });
    const n = Math.floor(w / 0.32);
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + 0.16 + i * (w / n);
      kit.box(0.006, 0.08, 0.006, '#c9c3d8', { x: px, y: y + 0.4, z });
      plush(px, y, z, cols[i % cols.length], 0.85 + (i % 3) * 0.12);
    }
  }

  // vendedor atrás do balcão (pixel art iluminado pela barraca)
  const people = [];
  function personMesh(o, h = 1.7) {
    const tex = personTexture(o);
    tex.repeat.set(1 / 3, 1);
    const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(h * (PW / PH), h);
    geo.translate(0, h / 2 - 0.02, 0);
    const m = new THREE.Mesh(geo, mat);
    m.userData.tex = tex;
    return m;
  }
  const vendors = [];
  function vendor(x, z, o) {
    const m = personMesh(o);
    m.position.set(x, 0.08, z);
    root.add(m);
    vendors.push(m);
    const ph = srand() * 6;
    anim.push((t) => {
      m.position.y = 0.08 + Math.abs(Math.sin(t * 1.3 + ph)) * 0.015;
      m.scale.x = Math.sin(t * 0.21 + ph) > 0.6 ? -1 : 1; // olha para o lado de vez em quando
    });
    return m;
  }

  const inter = (id, x, label, line, extra = {}) => {
    const it = { id, x, label, line, anchor: new V3(x, 1.65, FRONT + 0.2), ...extra };
    interactables.push(it);
    return it;
  };

  // ============================================================
  // 1. CABINE DE FOTOS (x = 0) — onde a cena começa
  // ============================================================
  const booth = (() => {
    const x = 0, w = 1.4, d = 1.15, H = 2.25;
    const z0 = FRONT + 0.1, zb = z0 - d;
    const RED = '#7e1c30', GOLD = '#d9a84a';
    kit.at(0, 0, 0);
    kit.box(w + 0.12, 0.1, d + 0.12, '#24161c', { x, z: (z0 + zb) / 2 });
    // paredes (oca por dentro: dá para ver quando a cortina abre)
    kit.box(w, H, 0.06, RED, { x, y: 0.1, z: zb + 0.03 });
    kit.box(0.06, H, d, RED, { x: x - w / 2 + 0.03, y: 0.1, z: (z0 + zb) / 2, k: 0.8 });
    kit.box(0.06, H, d, RED, { x: x + w / 2 - 0.03, y: 0.1, z: (z0 + zb) / 2, k: 0.8 });
    kit.box(w + 0.1, 0.12, d + 0.1, '#5a1424', { x, y: H + 0.1, z: (z0 + zb) / 2 });
    // painel da direita (fachada) com moldura dourada
    const pw = 0.52;
    const px = x + w / 2 - pw / 2;
    kit.box(pw, H, 0.08, RED, { x: px, y: 0.1, z: z0 - 0.04, k: 1.05 });
    kit.box(pw + 0.02, 0.04, 0.1, GOLD, { x: px, y: 0.1 + H - 0.08, z: z0 - 0.04 });
    kit.box(pw + 0.02, 0.04, 0.1, GOLD, { x: px, y: 0.18, z: z0 - 0.04 });
    kit.box(0.04, H, 0.1, GOLD, { x: px - pw / 2, y: 0.1, z: z0 - 0.04 });
    // faixa de cima com a abertura da cortina (lado esquerdo)
    kit.box(w - pw, 0.26, 0.08, RED, { x: x - pw / 2, y: H - 0.16, z: z0 - 0.04, k: 1.05 });
    kit.box(w - pw, 0.04, 0.1, GOLD, { x: x - pw / 2, y: H - 0.18, z: z0 - 0.04 });
    // varão da cortina
    kit.add(new THREE.CylinderGeometry(0.015, 0.015, w - pw - 0.04, 6), '#d9d0c0', { x: x - pw / 2, y: H - 0.24, z: z0 + 0.0, rz: Math.PI / 2 });
    // por dentro: banquinho, tela da câmera e o flash
    kit.cyl(0.18, 0.18, 0.05, '#2a1a22', { x: x - 0.22, y: 0.5, z: zb + 0.5 });
    kit.cyl(0.04, 0.04, 0.4, METAL, { x: x - 0.22, y: 0.1, z: zb + 0.5 });
    kit.box(0.5, 0.36, 0.04, '#141018', { x: x - 0.2, y: 1.05, z: zb + 0.08 });
    kit.box(0.42, 0.28, 0.01, '#9ad0ff', { x: x - 0.2, y: 1.09, z: zb + 0.105, glow: true, k: 0.55 });
    kit.box(0.5, 0.12, 0.05, '#e8e4f0', { x: x - 0.2, y: 1.55, z: zb + 0.09, glow: true, k: 0.9 });
    // fachada: amostras de fotos (tirinhas penduradas) e a fenda da foto
    const samples = canvasTex(48, 96, (ctx) => {
      ctx.fillStyle = '#2a0e18';
      ctx.fillRect(0, 0, 48, 96);
      const tones = [['#e9c9a3', '#c98e6e'], ['#e7b9b4', '#8a5ac0'], ['#cfe0f0', '#3c6fb0']];
      for (let s = 0; s < 2; s++)
        for (let i = 0; i < 4; i++) {
          const [bg, f] = tones[(s + i) % 3];
          ctx.fillStyle = '#f3efe6';
          ctx.fillRect(6 + s * 20, 6 + i * 21, 16, 19);
          ctx.fillStyle = bg;
          ctx.fillRect(7 + s * 20, 7 + i * 21, 14, 14);
          ctx.fillStyle = f;
          ctx.beginPath();
          ctx.arc(11 + s * 20, 14 + i * 21, 3, 0, 7);
          ctx.arc(17 + s * 20, 15 + i * 21, 3, 0, 7);
          ctx.fill();
        }
    });
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.72), new THREE.MeshLambertMaterial({ map: samples, emissiveMap: samples, emissive: '#ffffff', emissiveIntensity: 0.25 }));
    sm.position.set(px, 1.45, z0 + 0.005);
    root.add(sm);
    // fenda da foto (cromada) + moedeiro + preço
    kit.box(0.24, 0.05, 0.03, '#c9c3d8', { x: px, y: 0.88, z: z0 + 0.01, k: 1.2 });
    kit.box(0.2, 0.012, 0.035, '#050305', { x: px, y: 0.9, z: z0 + 0.012 });
    kit.box(0.08, 0.12, 0.03, '#c9c3d8', { x: px + 0.12, y: 0.62, z: z0 + 0.01 });
    const price = sign('R$ 10', { w: 0.3, h: 0.1, bg: '#1a0a10', fg: '#ffe9b8', edge: GOLD, size: 8, glow: 1.2 });
    addSign(price, px, 1.0, z0 + 0.012);
    // letreiro
    topSign(x, 'CABINE DE FOTOS', { w: 1.6, h: 0.42, y: 2.88, z: z0 + 0.02, bg: '#2a0a16', fg: '#ffe2f0', edge: GOLD, color: '#ffd27a', sub: '4 POSES · 1 TIRINHA', glow: 1.2 });
    // estrela em cima
    kit.ball(0.07, '#ffd27a', { x, y: 3.32, z: z0, glow: true, k: 2.2 });
    blob(x, (z0 + zb) / 2 + 0.2, w + 1.0, d + 1.2, 0.85);

    // cortina: 7 tiras listradas (as cores da foto da tirinha)
    const curtain = new THREE.Group();
    const cw = w - pw - 0.06;
    const n = 7;
    const strips = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.BoxGeometry(cw / n + 0.004, 1.8, 0.025);
      g.translate(0, -0.9, 0);
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: i % 2 ? '#d9a29e' : '#efd2b0' }));
      m.userData.base = -cw / 2 + (cw / n) * (i + 0.5);
      m.position.set(m.userData.base, 0, 0);
      curtain.add(m);
      strips.push(m);
    }
    curtain.position.set(x - pw / 2 - 0.03, H - 0.25, z0 + 0.015);
    root.add(curtain);
    const cur = { open: 0, sway: 0, swayV: 0 };
    anim.push((t, dt) => {
      cur.swayV += (-cur.sway * 60 - cur.swayV * 5) * dt;
      cur.sway += cur.swayV * dt;
      strips.forEach((m, i) => {
        const b = m.userData.base;
        // abre juntando as tiras para a esquerda, com dobras
        const tx = lerpN(b, -cw / 2 + 0.03 + i * 0.018, cur.open);
        m.position.x = tx;
        m.scale.x = 1 - cur.open * 0.75;
        m.rotation.z = Math.sin(t * 1.4 + i) * 0.006 + cur.sway * (0.4 + i * 0.12) * 0.04;
        m.rotation.y = cur.open * (i % 2 ? 0.5 : -0.5);
      });
    });

    // luz de dentro (quente) e o flash (branco, forte, por um instante)
    const inside = point(x - 0.2, 1.6, zb + 0.6, '#ffc9a0', 1.2, 3.5);
    const flash = point(x - 0.2, 1.4, z0 + 0.3, '#f4f6ff', 0, 9, { power: 0, core: 0.4, reach: 3.0 });
    const flashGlow = fx.glows[fx.glows.length - 1];
    // tirinha saindo da fenda
    let strip = null;
    if (stripCanvas) {
      const tex = new THREE.CanvasTexture(stripCanvas);
      tex.magFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      strip = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.21), new THREE.MeshLambertMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.35, side: THREE.DoubleSide }));
      strip.position.set(px, 0.9, z0 + 0.02);
      strip.scale.y = 0.001;
      strip.visible = false;
      root.add(strip);
    }
    const it = inter('cabine', x, 'Cabine de fotos', 'Quatro poses. A Malu fez careta em três. Eu pisquei em quatro.', { anchor: new V3(x, 2.2, z0) });
    return { x, z0, zb, curtain: cur, inside, flash, flashGlow, strip, slot: new V3(px, 0.9, z0 + 0.02), it };
  })();

  // ============================================================
  // 2. ALGODÃO-DOCE (x = -7.6)
  // ============================================================
  {
    const x = -7.6, w = 2.1;
    stall(x, w, { cols: ['#f08cb0', '#f6e9f0'], counter: '#c45a8a', trim: '#ffe2f0', back: '#4a2a44' });
    // máquina: bacia de inox, cabeça girando e a nuvem rosa
    kit.at(0, 0, 0);
    kit.cyl(0.32, 0.26, 0.22, '#c9c3d8', { x: x - 0.45, y: 1.0, z: FRONT - 0.3, k: 1.1 }, 16);
    kit.cyl(0.3, 0.3, 0.02, '#5a5468', { x: x - 0.45, y: 1.21, z: FRONT - 0.3 }, 16);
    const fluff = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.09 + srand() * 0.06, 8, 6), new THREE.MeshLambertMaterial({ color: '#ffb3d6', emissive: '#ff6aa8', emissiveIntensity: 0.25 }));
      const a = (i / 9) * Math.PI * 2;
      b.position.set(Math.cos(a) * 0.17, 0.05 + srand() * 0.07, Math.sin(a) * 0.17);
      fluff.add(b);
    }
    fluff.position.set(x - 0.45, 1.17, FRONT - 0.3);
    root.add(fluff);
    anim.push((t) => {
      fluff.rotation.y = t * 5;
      fluff.children.forEach((b, i) => (b.scale.setScalar(0.9 + Math.sin(t * 3 + i) * 0.12)));
    });
    // saquinhos pendurados (rosa e azul) na frente
    kit.box(w - 0.2, 0.02, 0.02, '#c9c3d8', { x, y: 1.95, z: FRONT + 0.1 });
    for (let i = 0; i < 8; i++) {
      const bx = x - w / 2 + 0.25 + i * 0.23;
      const col = i % 2 ? '#9ad8ff' : '#ffb3d6';
      kit.box(0.006, 0.1, 0.006, '#c9c3d8', { x: bx, y: 1.85, z: FRONT + 0.1 });
      kit.ball(0.09, col, { x: bx, y: 1.72, z: FRONT + 0.1, sy: 1.35, k: 1.05 });
      kit.box(0.05, 0.04, 0.05, '#f6f2ea', { x: bx, y: 1.58, z: FRONT + 0.1 });
    }
    // algodões no palito num suporte
    for (let i = 0; i < 4; i++) {
      kit.cyl(0.01, 0.01, 0.3, '#f6f2ea', { x: x + 0.4 + i * 0.13, y: 1.0, z: FRONT - 0.15 });
      kit.ball(0.11, i % 2 ? '#9ad8ff' : '#ffb3d6', { x: x + 0.4 + i * 0.13, y: 1.38, z: FRONT - 0.15, sy: 1.2 });
    }
    // balões de gás amarrados na barraca
    const bal = new THREE.Group();
    const bc = ['#ff5a7a', '#ffd34a', '#5ac0ff', '#8ae07a', '#c08aff', '#ff9a4a'];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshLambertMaterial({ color: bc[i], emissive: bc[i], emissiveIntensity: 0.12 }));
      b.scale.y = 1.18;
      b.position.y = 0.9;
      const str = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.9, 0.004), new THREE.MeshBasicMaterial({ color: '#d9d0c0' }));
      str.position.y = 0.45;
      g.add(b, str);
      g.position.set((i - 2.5) * 0.12, 0, (i % 2) * 0.1);
      g.rotation.z = (i - 2.5) * 0.12;
      bal.add(g);
    }
    bal.position.set(x + w / 2 + 0.1, 1.9, FRONT + 0.05);
    root.add(bal);
    anim.push((t) => bal.children.forEach((g, i) => {
      g.rotation.z = (i - 2.5) * 0.12 + Math.sin(t * 0.9 + i * 1.7) * 0.08;
      g.rotation.x = Math.sin(t * 0.7 + i) * 0.06;
    }));
    topSign(x, 'ALGODÃO-DOCE', { bg: '#3a0e2a', fg: '#ffd6ea', edge: '#ff8ac0', color: '#ff9ac8', sub: 'ROSA · AZUL · OS DOIS' });
    stallLight(x - 0.4, '#ffb0c8', { intensity: 4 });
    vendor(x + 0.1, FRONT - 0.75, PEOPLE[3]);
    inter('algodao', x, 'Comprar algodão-doce', 'Rosa ou azul? A Malu sempre escolhe os dois. E sempre come o meu.', { malu: 'Os dois. Óbvio.' });
  }

  // ============================================================
  // 3. PIPOCA (carrinho de rua, x = -10.6): caixa vermelha com painel creme
  //    pintado, vitrine de vidro com pipoca quente, rodas de raio, toldo listrado
  // ============================================================
  {
    const x = -10.6, z = FRONT - 0.3;
    const RED = '#b8202e', GOLD = '#d9a84a';
    kit.at(0, 0, 0);
    // corpo (madeira pintada) e tampo
    kit.tbox(1.2, 0.66, 0.62, RED, { x, y: 0.3, z, mat: boardMat, tile: 0.5 });
    kit.tbox(1.28, 0.045, 0.7, CREAM, { x, y: 0.96, z, mat: woodMat, tile: 0.4, k: 0.95 });
    kit.box(1.24, 0.04, 0.66, '#7a1420', { x, y: 0.28, z });
    // painel da frente: creme com letras vermelhas, filete e estrelas douradas
    const panel = canvasTex(120, 56, (ctx, w, h) => {
      ctx.fillStyle = '#7a1420';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#efe0c2';
      ctx.beginPath();
      ctx.roundRect(4, 4, w - 8, h - 8, 6);
      ctx.fill();
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(7.5, 7.5, w - 15, h - 15, 4);
      ctx.stroke();
      // arabescos nas pontas
      ctx.strokeStyle = 'rgba(190,140,60,0.8)';
      for (const sx of [1, -1]) {
        ctx.beginPath();
        ctx.arc(w / 2 + sx * 40, h - 14, 4, 0, Math.PI * 1.5);
        ctx.stroke();
      }
      drawText(ctx, 'PIPOCA', w / 2 + 1, 15, { size: 17, weight: 700, color: '#3a0a10', align: 'center' });
      drawText(ctx, 'PIPOCA', w / 2, 14, { size: 17, weight: 700, color: '#c4283a', align: 'center' });
      ctx.fillStyle = GOLD;
      for (const sx of [14, w - 18]) {
        ctx.fillRect(sx + 1, 24, 2, 6);
        ctx.fillRect(sx - 1, 26, 6, 2);
      }
      drawText(ctx, 'DOCE · SALGADA', w / 2, 37, { size: 8, color: '#8a3a2a', align: 'center', font: 'tiny' });
    }, { mip: true });
    kit.add(new THREE.PlaneGeometry(1.04, 0.5), '#ffffff', { x, y: 0.62, z: z + 0.312, jit: 0, mat: new THREE.MeshLambertMaterial({ map: panel, vertexColors: true, emissive: '#2a1a10', emissiveMap: panel }) });
    for (const sx of [-0.5, 0.5]) for (const sy of [0.4, 0.84]) kit.ball(0.018, GOLD, { x: x + sx, y: sy, z: z + 0.32, k: 1.2 });
    // rodas de raio (as duas do lado esquerdo) e pezinhos do outro lado
    for (const sz of [-0.34, 0.34]) {
      const wx = x - 0.32, wy = 0.3;
      kit.add(new THREE.TorusGeometry(0.28, 0.026, 6, 22), '#1a1418', { x: wx, y: wy, z: z + sz });
      kit.add(new THREE.TorusGeometry(0.255, 0.014, 4, 22), RED, { x: wx, y: wy, z: z + sz });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        kit.bar(new V3(wx, wy, z + sz), new V3(wx + Math.cos(a) * 0.25, wy + Math.sin(a) * 0.25, z + sz), 0.016, RED);
      }
      kit.add(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 10), GOLD, { x: wx, y: wy, z: z + sz, rx: Math.PI / 2, k: 1.1 });
      kit.box(0.05, 0.3, 0.05, RED, { x: x + 0.5, z: z + sz * 0.8 });
    }
    // alça
    kit.bar(new V3(x + 0.62, 0.8, z - 0.2), new V3(x + 0.86, 0.86, z - 0.2), 0.03, RED);
    kit.bar(new V3(x + 0.62, 0.8, z + 0.2), new V3(x + 0.86, 0.86, z + 0.2), 0.03, RED);
    kit.add(new THREE.CylinderGeometry(0.022, 0.022, 0.44, 8), '#e8e4f0', { x: x + 0.86, y: 0.86, z, rx: Math.PI / 2 });
    // vitrine: colunas, pipoca quente lá dentro e a panelinha prateada pendurada
    const vx = x - 0.12;
    for (const sx of [-0.4, 0.4]) for (const sz of [-0.24, 0.24]) kit.box(0.035, 0.66, 0.035, RED, { x: vx + sx, y: 0.98, z: z + sz });
    kit.box(0.84, 0.035, 0.52, RED, { x: vx, y: 1.64, z });
    kit.box(0.78, 0.6, 0.02, '#5a2a10', { x: vx, y: 1.0, z: z - 0.24, glow: true, k: 0.5 });
    for (let i = 0; i < 110; i++) {
      const px = vx - 0.36 + srand() * 0.72, pzz = z - 0.2 + srand() * 0.42;
      const hgt = 0.06 + Math.pow(srand(), 1.6) * 0.3 * (1 - Math.abs(px - vx) * 1.2);
      kit.ball(0.026 + srand() * 0.02, i % 6 ? '#fff1c0' : '#f2c24a', { x: px, y: 1.02 + hgt * srand(), z: pzz, glow: true, k: 0.7 + srand() * 0.45 });
    }
    kit.cyl(0.12, 0.1, 0.12, '#c9c3d8', { x: vx + 0.1, y: 1.42, z, k: 1.2 }, 14);
    kit.cyl(0.004, 0.004, 0.1, '#c9c3d8', { x: vx + 0.1, y: 1.54, z });
    // vidro (reflexo leve)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.62), new THREE.MeshBasicMaterial({ color: '#ffe6c0', transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending }));
    glass.position.set(vx, 1.3, z + 0.255);
    root.add(glass);
    kit.box(0.04, 0.64, 0.004, '#ffffff', { x: vx - 0.22, y: 1.0, z: z + 0.258, glow: true, k: 0.18, rz: 0.25 }); // brilho no vidro
    // caixinhas listradas com pipoca em cima do tampo
    for (let i = 0; i < 3; i++) {
      const bx = x + 0.38 + (i % 2) * 0.1, bz = z - 0.12 + i * 0.13;
      for (let st = 0; st < 4; st++) kit.box(0.022, 0.15, 0.09, st % 2 ? CREAM : '#d02838', { x: bx - 0.034 + st * 0.022, y: 1.0, z: bz });
      for (let k = 0; k < 5; k++) kit.ball(0.026, '#fff1c0', { x: bx + (srand() - 0.5) * 0.06, y: 1.17 + srand() * 0.03, z: bz + (srand() - 0.5) * 0.05, glow: true, k: 0.75 });
    }
    // toldo: quatro colunas, telhado listrado em pirâmide e franja nos quatro lados
    for (const sx of [-0.56, 0.56]) for (const sz of [-0.32, 0.32]) kit.cyl(0.022, 0.022, 1.0, RED, { x: x + sx, y: 1.0, z: z + sz }, 8);
    for (let i = 0; i < 8; i++) {
      kit.add(new THREE.ConeGeometry(0.92, 0.42, 4, 1, false, Math.PI / 4 + (i * Math.PI) / 4, Math.PI / 4), i % 2 ? CREAM : '#c4283a', { x, y: 2.21, z, sz: 0.62 });
    }
    const VAL = 0.07;
    for (const [len, px, pz2, ry] of [[1.3, x, z + 0.4, 0], [1.3, x, z - 0.4, 0], [0.8, x - 0.65, z, Math.PI / 2], [0.8, x + 0.65, z, Math.PI / 2]]) {
      const nS = Math.round(len / 0.13);
      for (let i = 0; i < nS; i++) {
        const u = (i + 0.5) / nS - 0.5;
        const ox = ry ? 0 : u * len, oz = ry ? u * len : 0;
        const col = i % 2 ? CREAM : '#c4283a';
        kit.box(len / nS + 0.002, VAL, 0.016, col, { x: px + ox, y: 1.93, z: pz2 + oz, ry });
        const g = new THREE.CylinderGeometry(len / nS / 2, len / nS / 2, 0.016, 10, 1, false, -Math.PI / 2, Math.PI);
        kit.add(g, col, { x: px + ox, y: 1.935, z: pz2 + oz, rx: Math.PI / 2, ry, order: 'YXZ', k: 0.92 });
      }
    }
    kit.ball(0.05, GOLD, { x, y: 2.44, z, k: 1.2 });
    kit.cyl(0.01, 0.01, 0.12, GOLD, { x, y: 2.42, z });
    // lanterna na quina e luz quente da vitrine
    stallLight(x + 0.56, '#ffcf8a', { y: 1.72, z: z + 0.42, intensity: 2.2, glow: 0.7, dist: 4 });
    point(x - 0.1, 1.3, z + 0.5, '#ffd08a', 3.2, 6, { power: 3.4, core: 0.4, reach: 1.6 });
    pool(x, z + 0.9, 3, 2, '#ffd08a', 0.25);
    blob(x, z, 2, 1.4, 0.8);
    vendor(x - 0.85, z - 0.35, PEOPLE[2]);
    fx.addPoints(10, 2, () => new V3(x + rnd(-0.3, 0.3), 1.8, z));
    inter('pipoca', x, 'Comprar pipoca', 'Cheiro de manteiga e açúcar queimado. Cheiro de outubro.', { anchor: new V3(x, 2.1, z + 0.3) });
  }

  const pond = { angle: 0, speed: 1, ducks: null, center: null }; // pescaria (minigame)
  // ============================================================
  // 4. PESCARIA (x = -4.3): piscininha com patinhos girando
  // ============================================================
  {
    const x = -4.3, w = 2.2;
    stall(x, w, { cols: ['#3fa6a0', '#f1e2c4'], counter: '#2a6a7a', trim: '#ffd34a', back: '#203048', counterH: 0.42 });
    kit.at(0, 0, 0);
    // piscina redonda na frente do balcão
    const pz = FRONT + 0.05;
    kit.add(new THREE.TorusGeometry(0.7, 0.07, 6, 24), '#2a8ad0', { x, y: 0.7, z: pz - 0.55, rx: Math.PI / 2, sy: 0.5 });
    kit.cyl(0.7, 0.72, 0.64, '#2a6a9a', { x, y: 0.06, z: pz - 0.55, sz: 0.5 }, 24);
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.66, 24), new THREE.MeshLambertMaterial({ color: '#3ab0e0', emissive: '#1a6aa0', emissiveIntensity: 0.4 }));
    water.rotation.x = -Math.PI / 2;
    water.scale.y = 0.5;
    water.position.set(x, 0.67, pz - 0.55);
    root.add(water);
    const ducks = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const d = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshLambertMaterial({ color: '#ffd34a' }));
      body.scale.set(1.3, 0.8, 1);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), body.material);
      head.position.set(0.04, 0.05, 0);
      const beak = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), new THREE.MeshLambertMaterial({ color: '#ff7a2a' }));
      beak.position.set(0.075, 0.05, 0);
      // argolinha em cima da cabeça (onde o anzol engancha)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 4, 10), new THREE.MeshLambertMaterial({ color: '#e8e4f0' }));
      ring.position.set(0.04, 0.095, 0);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.006, 4, 3), new THREE.MeshBasicMaterial({ color: '#111' }));
      eye.position.set(0.06, 0.06, 0.025);
      d.add(body, head, beak, ring, eye);
      d.userData.n = [7, 3, 12, 5, 9, 1, 14, 6, 11, 2][i];
      d.userData.a = (i / 10) * Math.PI * 2;
      ducks.add(d);
    }
    ducks.position.set(x, 0.7, pz - 0.55);
    root.add(ducks);
    pond.ducks = ducks;
    pond.center = new V3(x, 0.7, pz - 0.55);
    anim.push((t, dt) => {
      pond.angle += dt * 0.45 * pond.speed;
      ducks.children.forEach((d, i) => {
        if (d.userData.caught) return;
        const a = d.userData.a + pond.angle;
        d.position.set(Math.cos(a) * 0.5, Math.sin(t * 3 + i) * 0.008, Math.sin(a) * 0.25);
        d.rotation.y = -a - Math.PI / 2;
      });
    });
    // varinhas de pescar encostadas
    for (let i = 0; i < 3; i++) {
      kit.bar(new V3(x + 0.75 + i * 0.07, 0.1, pz - 0.2), new V3(x + 0.55 + i * 0.1, 1.5, pz - 0.35), 0.015, '#d9a84a');
    }
    // prateleiras de prêmios no fundo (chaveiros e bichinhos)
    for (let r = 0; r < 3; r++) {
      kit.box(w - 0.2, 0.04, 0.3, WOOD, { x, y: 0.8 + r * 0.42, z: FRONT - 1.15 });
      for (let i = 0; i < 7; i++) {
        const px = x - w / 2 + 0.25 + i * 0.27;
        if (r === 2) plush(px, 0.84 + r * 0.42, FRONT - 1.15, ['#ff8ab0', '#8ae07a', '#c08aff', '#ffd34a'][i % 4], 0.7);
        else kit.box(0.1, 0.12, 0.06, ['#ff5a7a', '#5ac0ff', '#ffd34a', '#8ae07a'][(i + r) % 4], { x: px, y: 0.84 + r * 0.42, z: FRONT - 1.12, k: 1.1 });
      }
    }
    topSign(x, 'PESCARIA', { bg: '#0a2a3a', fg: '#c8fff4', edge: '#3fe0c0', color: '#9affe0', sub: 'TODO PATINHO GANHA' });
    stallLight(x, '#ffcf9a', { intensity: 4.2 });
    vendor(x + 0.6, FRONT - 0.8, PEOPLE[6]);
    inter('pescaria', x, 'Jogar: pescaria', 'Todo patinho tem um número embaixo. Todo número dá chaveiro.', { malu: 'Esse chaveiro feio aí? Eu tenho até hoje.' });
  }

  // ============================================================
  // 5. ARGOLA (x = 3.6): garrafas verdes em degraus
  // ============================================================
  {
    const x = 3.6, w = 2.2;
    stall(x, w, { cols: ['#e8b03a', '#c4283a'], counter: '#8a1a28', trim: '#ffd34a', back: '#3a2020' });
    kit.at(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const y = 0.95 + r * 0.16, z = FRONT - 0.45 - r * 0.18;
      kit.box(w - 0.4, 0.16, 0.18, '#f1e2c4', { x, y: y - 0.16, z, k: 0.9 - r * 0.05 });
      for (let i = 0; i < 9 - r; i++) {
        const bx = x - (8 - r) * 0.1 + i * 0.2;
        kit.cyl(0.035, 0.04, 0.12, '#3a9a5a', { x: bx, y, z, k: 1.1 }, 8);
        kit.cyl(0.014, 0.025, 0.08, '#3a9a5a', { x: bx, y: y + 0.12, z, k: 1.2 }, 6);
        kit.cyl(0.016, 0.016, 0.02, '#e8e4f0', { x: bx, y: y + 0.2, z }, 6);
      }
    }
    // argolas penduradas
    for (let i = 0; i < 6; i++) kit.add(new THREE.TorusGeometry(0.06, 0.012, 5, 14), ['#ff5a7a', '#ffd34a', '#5ac0ff'][i % 3], { x: x + w / 2 - 0.2, y: 1.6 - i * 0.03, z: FRONT + 0.02, ry: i * 0.3 });
    prizeRow(x, w - 0.3, 1.58, FRONT - 1.0, ['#ff8ab0', '#c08aff', '#5ac0ff', '#ffd34a', '#8ae07a']);
    // ursão gigante no canto
    plush(x - w / 2 + 0.35, 0.95, FRONT - 0.9, '#c98e6e', 1.8);
    topSign(x, 'ARGOLA', { bg: '#3a0a10', fg: '#fff1c0', edge: '#ffd34a', color: '#ffd27a', sub: '3 ARGOLAS · R$ 5' });
    stallLight(x, '#ffc07a', { intensity: 4.6 });
    vendor(x + 0.7, FRONT - 0.95, PEOPLE[0]);
    inter('argola', x, 'Argola', 'Ninguém nunca acertou uma garrafa aqui. Eu acho que elas são coladas.', { malu: 'Elas são. Eu já perguntei.' });
  }

  // ============================================================
  // 6. BALÕES (x = 6.9): parede de balões e dardos (um estoura às vezes)
  // ============================================================
  const popBalloon = [];
  const balloonWall = { list: null, paused: false, z: FRONT - 1.0, x: 6.9 };
  {
    const x = 6.9, w = 2.1;
    stall(x, w, { cols: ['#7d4fb0', '#f1e2c4'], counter: '#4a2a7a', trim: '#ff8ac0', back: '#2a1a3a' });
    kit.at(0, 0, 0);
    kit.box(w - 0.3, 1.2, 0.05, '#1a1428', { x, y: 0.9, z: FRONT - 1.05 });
    const balloonGeo = new THREE.SphereGeometry(0.07, 8, 6);
    const cols = ['#ff5a7a', '#ffd34a', '#5ac0ff', '#8ae07a', '#c08aff', '#ff9a4a'];
    const list = [];
    for (let r = 0; r < 5; r++)
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(balloonGeo, new THREE.MeshLambertMaterial({ color: cols[(i + r * 2) % 6], emissive: cols[(i + r * 2) % 6], emissiveIntensity: 0.15 }));
        m.position.set(x - 0.8 + i * 0.2 + (r % 2) * 0.1, 1.05 + r * 0.2, FRONT - 1.0);
        m.scale.y = 1.15;
        m.userData.pop = 0;
        root.add(m);
        list.push(m);
      }
    balloonWall.list = list;
    // dardos no balcão
    for (let i = 0; i < 4; i++) kit.bar(new V3(x + 0.5 + i * 0.06, 1.01, FRONT - 0.1), new V3(x + 0.62 + i * 0.06, 1.01, FRONT - 0.3), 0.012, i % 2 ? '#ff5a7a' : '#5ac0ff');
    prizeRow(x, w - 0.3, 2.0, FRONT - 0.95, ['#5ac0ff', '#ff8ab0', '#ffd34a']);
    topSign(x, 'ESTOURE O BALÃO', { bg: '#1a0a2a', fg: '#ffe2f8', edge: '#c08aff', color: '#e0a8ff', sub: 'DARDO CERTEIRO GANHA' });
    stallLight(x, '#e8b8ff', { intensity: 4 });
    vendor(x - 0.6, FRONT - 0.85, PEOPLE[4]);
    // de vez em quando alguém acerta um balão: some com um "pop" e volta depois
    let next = 4;
    anim.push((t, dt) => {
      if (balloonWall.paused) return; // minigame: os balões são do jogador
      next -= dt;
      if (next <= 0) {
        next = 3 + Math.random() * 5;
        const m = list[Math.floor(Math.random() * list.length)];
        if (m.visible) {
          m.userData.pop = 0.001;
          popBalloon.push(m);
        }
      }
      for (const m of list) {
        if (m.userData.pop > 0) {
          m.userData.pop += dt;
          const k = m.userData.pop;
          if (k < 0.06) m.scale.setScalar(1 + k * 6);
          else if (k < 2.5) m.visible = false;
          else {
            m.visible = true;
            m.scale.set(1, 1.15, 1);
            m.userData.pop = 0;
          }
        } else m.scale.set(1, 1.15 + Math.sin(t * 2 + m.position.x * 9) * 0.02, 1);
      }
    });
    inter('baloes', x, 'Jogar: estoure o balão', 'A Malu acertou de primeira. Depois disse que mirou no do lado.');
  }

  const cans = { list: [], shelves: [], x: 10.2 }; // latas (minigame)
  // ============================================================
  // 7. LATAS (x = 10.2): pirâmide de latas e bolinhas
  // ============================================================
  {
    const x = 10.2, w = 2.1;
    stall(x, w, { cols: ['#3d6fc4', '#f1e2c4'], counter: '#22407a', trim: '#ffd34a', back: '#1a2440' });
    kit.at(0, 0, 0);
    // latas de verdade (soltas: o minigame derruba) em duas pirâmides
    const canGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12);
    const canTex = (col) => canvasTex(32, 16, (ctx, w, h) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(0, 6, w, 3);
      ctx.fillStyle = '#c9c3d8';
      ctx.fillRect(0, 0, w, 2);
      ctx.fillRect(0, h - 2, w, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(3, 2, 2, h - 4); // brilho do metal
    });
    const canMats = ['#e04050', '#e8e4f0', '#3a9ad0'].map((c) => new THREE.MeshLambertMaterial({ map: canTex(c) }));
    for (let p = 0; p < 2; p++) {
      const px = x - 0.45 + p * 0.9;
      kit.tbox(0.6, 0.06, 0.4, '#7a5a44', { x: px, y: 1.0, z: FRONT - 0.6, mat: woodMat, tile: 0.4 });
      kit.box(0.06, 0.95, 0.06, WOOD_D, { x: px, y: 0.05, z: FRONT - 0.6 });
      cans.shelves.push({ x: px, z: FRONT - 0.6, y: 1.06, hw: 0.3, hd: 0.2 });
      for (let r = 0; r < 4; r++)
        for (let i = 0; i < 4 - r; i++) {
          const cx = px - (3 - r) * 0.06 + i * 0.12;
          const y = 1.06 + r * 0.12 + 0.06;
          const m = new THREE.Mesh(canGeo, canMats[(i + r + p) % 3]);
          m.position.set(cx, y, FRONT - 0.6);
          m.rotation.y = srand() * 6;
          root.add(m);
          cans.list.push({ mesh: m, p, home: { pos: m.position.clone(), quat: m.quaternion.clone() } });
        }
    }
    // cesto de bolinhas no balcão
    kit.cyl(0.16, 0.13, 0.14, '#8a5a3a', { x: x + 0.75, y: 1.01, z: FRONT - 0.12 });
    for (let i = 0; i < 5; i++) kit.ball(0.05, '#f1e2c4', { x: x + 0.7 + (i % 3) * 0.05, y: 1.18 + Math.floor(i / 3) * 0.04, z: FRONT - 0.1 - (i % 2) * 0.04 });
    prizeRow(x, w - 0.3, 1.78, FRONT - 1.05, ['#8ae07a', '#ff9a4a', '#c08aff', '#5ac0ff']);
    topSign(x, 'DERRUBE AS LATAS', { bg: '#0a1430', fg: '#e8f0ff', edge: '#5ac0ff', color: '#a8d8ff', sub: 'TRÊS BOLAS · CINCO REAIS' });
    stallLight(x, '#ffd0a0', { intensity: 4.4 });
    vendor(x - 0.75, FRONT - 0.9, PEOPLE[1]);
    inter('latas', x, 'Jogar: derrube as latas', 'A pirâmide nunca cai inteira. Sempre sobra uma lata, de pé, rindo da gente.');
  }

  // ============================================================
  // 8. CHURROS & MAÇÃ DO AMOR (x = 13.4)
  // ============================================================
  {
    const x = 13.4, w = 2.2;
    stall(x, w, { cols: ['#e0823a', '#f1e2c4'], counter: '#8a3a1a', trim: '#ffd34a', back: '#3a2418' });
    kit.at(0, 0, 0);
    // maçãs do amor em fileiras (vermelho brilhante, palito)
    for (let r = 0; r < 2; r++)
      for (let i = 0; i < 6; i++) {
        const ax = x - 0.9 + i * 0.13, az = FRONT - 0.18 - r * 0.15;
        kit.ball(0.055, '#d81830', { x: ax, y: 1.07, z: az, k: 1.15 });
        kit.ball(0.02, '#ff8a9a', { x: ax - 0.02, y: 1.1, z: az + 0.04, glow: true, k: 0.9 }); // brilho da calda
        kit.cyl(0.006, 0.006, 0.14, '#f1e2c4', { x: ax, y: 1.1, z: az });
      }
    // vitrine de churros (estufa quente)
    kit.box(0.7, 0.4, 0.4, '#7a3a14', { x: x + 0.45, y: 1.0, z: FRONT - 0.3, glow: true, k: 0.55 });
    kit.box(0.66, 0.03, 0.36, '#ffc070', { x: x + 0.45, y: 1.02, z: FRONT - 0.3, glow: true, k: 0.9 }); // resistência acesa
    for (let i = 0; i < 7; i++) kit.add(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), '#e09a50', { x: x + 0.22 + i * 0.07, y: 1.12, z: FRONT - 0.1, rz: Math.PI / 2 - 0.15 + (i % 2) * 0.3, glow: true, k: 0.9 });
    kit.box(0.74, 0.03, 0.44, '#c9c3d8', { x: x + 0.45, y: 1.4, z: FRONT - 0.3 });
    // panela de óleo/doce de leite atrás
    kit.cyl(0.2, 0.18, 0.25, '#5a5468', { x: x - 0.2, y: 0.95, z: FRONT - 0.9 }, 12);
    // cardápio
    const menu = sign('CHURROS R$ 8', { w: 0.7, h: 0.22, bg: '#2a1408', fg: '#ffe9b8', edge: '#e0823a', size: 10, sub: 'MAÇÃ DO AMOR R$ 6', subSize: 8, lit: true, glow: 1.15 });
    addSign(menu, x - 0.2, 1.55, FRONT - 1.25);
    topSign(x, 'CHURROS', { w: 1.6, bg: '#2a1006', fg: '#fff1c0', edge: '#ff9a4a', color: '#ffc27a', sub: '& MAÇÃ DO AMOR' });
    stallLight(x, '#ffb36a', { intensity: 4.8 });
    vendor(x - 0.1, FRONT - 0.95, PEOPLE[0]);
    fx.addPoints(8, 2, () => new V3(x - 0.2 + rnd(-0.1, 0.1), 1.25, FRONT - 0.9));
    inter('churros', x, 'Comprar churros', 'Maçã do amor. Nome bonito pra uma coisa que gruda no dente o resto da noite.', { malu: 'Churros é melhor. Não discute.' });
  }

  // ============================================================
  // 9. BILHETERIA DA RODA-GIGANTE (x = 16.4)
  // ============================================================
  const ticket = (() => {
    const x = 16.4, z = FRONT - 0.2;
    const BLUE = '#26336a', GOLD = '#d9a84a';
    kit.at(0, 0, 0);
    const w = 1.5, d = 1.1, zc = z - 0.45, H = 2.1;
    // casinha oca: fundo aceso (o vendedor aparece na janela), laterais e frente com guichê
    kit.tbox(w, H, 0.06, BLUE, { x, y: 0.05, z: zc - d / 2, mat: boardMat, tile: 0.6 });
    kit.box(w - 0.2, 1.0, 0.02, '#ffd9a0', { x, y: 0.95, z: zc - d / 2 + 0.04, glow: true, k: 0.32 });
    for (const s of [-1, 1]) kit.tbox(0.06, H, d, BLUE, { x: x + s * (w / 2 - 0.03), y: 0.05, z: zc, mat: boardMat, tile: 0.6, k: 0.9 });
    // frente: parte de baixo pintada, colunas e verga em arco em volta da janela
    const fz = zc + d / 2;
    kit.tbox(w, 0.95, 0.06, BLUE, { x, y: 0.05, z: fz - 0.03, mat: boardMat, tile: 0.6 });
    kit.add(new THREE.PlaneGeometry(w - 0.12, 0.8), '#ffffff', { x, y: 0.52, z: fz + 0.002, jit: 0, mat: panelMat(w - 0.12, 0.8, BLUE, GOLD, '#c4283a') });
    for (const s of [-1, 1]) kit.tbox(0.3, 0.75, 0.06, BLUE, { x: x + s * (w / 2 - 0.15), y: 1.0, z: fz - 0.03, mat: boardMat, tile: 0.6 });
    kit.tbox(w, 0.4, 0.06, BLUE, { x, y: 1.75, z: fz - 0.03, mat: boardMat, tile: 0.6 });
    const arch = new THREE.Shape();
    arch.moveTo(-0.45, 0);
    arch.lineTo(0.45, 0);
    arch.lineTo(0.45, 0.16);
    arch.quadraticCurveTo(0, 0.02, -0.45, 0.16);
    arch.closePath();
    kit.add(mergeVertices(new THREE.ExtrudeGeometry(arch, { depth: 0.06, bevelEnabled: false })), BLUE, { x, y: 1.59, z: fz - 0.06 });
    // moldura dourada, balcãozinho e grade de ferro da janela
    kit.box(0.92, 0.035, 0.03, GOLD, { x, y: 1.0, z: fz + 0.01 });
    for (const s of [-1, 1]) kit.box(0.035, 0.72, 0.03, GOLD, { x: x + s * 0.455, y: 1.0, z: fz + 0.01 });
    kit.tbox(1.0, 0.04, 0.24, '#8a5a40', { x, y: 0.98, z: fz + 0.08, mat: woodMat, tile: 0.4 });
    for (let i = 0; i < 7; i++) kit.box(0.008, 0.62, 0.008, '#2a2630', { x: x - 0.36 + i * 0.12, y: 1.05, z: fz - 0.02 });
    kit.box(0.88, 0.012, 0.012, '#2a2630', { x, y: 1.05, z: fz - 0.02 });
    // placa "PAGUE AQUI" e plaquinha de preço
    const small = sign('INGRESSOS', { w: 0.6, h: 0.13, bg: '#f1e2c4', fg: '#7a1420', edge: GOLD, size: 9, glow: 1.0, lit: true });
    addSign(small, x, 1.82, fz + 0.012);
    // telhado: cúpula listrada com franja e pompons
    kit.tbox(w + 0.16, 0.08, d + 0.16, '#1a2040', { x, y: H + 0.05, z: zc, mat: woodMat });
    for (let i = 0; i < 12; i++) {
      kit.add(new THREE.ConeGeometry(1.08, 0.5, 12, 1, false, (i * Math.PI) / 6, Math.PI / 6), i % 2 ? CREAM : '#c4283a', { x, y: H + 0.38, z: zc, sz: 0.78 });
    }
    const nS = 14;
    for (let i = 0; i < nS; i++) {
      const a = (i / nS) * Math.PI * 2;
      const px = x + Math.cos(a) * 1.0, pz2 = zc + Math.sin(a) * 0.78;
      const col = i % 2 ? CREAM : '#c4283a';
      kit.box(0.42, 0.07, 0.016, col, { x: px, y: H + 0.08, z: pz2, ry: -a + Math.PI / 2 });
      const g = new THREE.CylinderGeometry(0.2, 0.2, 0.016, 10, 1, false, -Math.PI / 2, Math.PI);
      kit.add(g, col, { x: px, y: H + 0.085, z: pz2, rx: Math.PI / 2, ry: -a + Math.PI / 2, order: 'YXZ', k: 0.92 });
    }
    kit.cyl(0.012, 0.012, 0.3, GOLD, { x, y: H + 0.62, z: zc });
    kit.ball(0.06, GOLD, { x, y: H + 0.92, z: zc, k: 1.2 });
    // letreiro em arco por cima
    topSign(x, 'RODA-GIGANTE', { w: 1.5, h: 0.34, y: H + 0.95, z: zc + 0.55, bg: '#0a0a2a', fg: '#ffe9b8', edge: '#ffd34a', color: '#ffe08a', sub: 'BILHETERIA · R$ 15', size: 15, glow: 1.2, arch: 0.14 });
    // fila com cordão (postinhos dourados)
    for (let i = 0; i < 4; i++) {
      kit.cyl(0.05, 0.06, 0.04, GOLD, { x: x - 2.2 + i * 0.6, z: z + 0.6 });
      kit.cyl(0.025, 0.035, 0.85, GOLD, { x: x - 2.2 + i * 0.6, z: z + 0.6 });
      kit.ball(0.045, GOLD, { x: x - 2.2 + i * 0.6, y: 0.9, z: z + 0.6, k: 1.15 });
      if (i < 3) for (let k = 0; k < 7; k++) kit.ball(0.022, '#a8202e', { x: x - 2.2 + i * 0.6 + k * 0.085 + 0.045, y: 0.83 - Math.sin((k / 6) * Math.PI) * 0.12, z: z + 0.6 });
    }
    point(x, 1.4, z + 0.5, '#ffe0a0', 3.5, 6, { power: 3, core: 0.3, reach: 1.6 });
    point(x, 1.3, zc, '#ffd9a0', 1.6, 2.5); // luz de dentro (o vendedor aparece)
    pool(x, z + 0.8, 3, 2, '#ffe0a0', 0.22);
    blob(x, z - 0.3, 2.2, 1.6, 0.8);
    const seller = vendor(x + 0.05, zc - 0.05, PEOPLE[0]);
    seller.userData.ticket = true;
    return inter('roda', x, 'Bilheteria', 'A roda-gigante. Ela pagou o algodão-doce, então...', { anchor: new V3(x, 2.1, z + 0.2) });
  })();

  // ============================================================
  // Postes de luz vitorianos (base oitavada, fuste com anéis, braços em
  // voluta e lanternas de vidro) entre as barracas
  // ============================================================
  const lampPost = (x, z, { tall = 3.1 } = {}) => {
    const I = '#1e1c26', I2 = '#2c2836';
    kit.at(0, 0, 0);
    kit.cyl(0.17, 0.19, 0.1, I, { x, z }, 8);
    kit.cyl(0.13, 0.15, 0.16, I2, { x, y: 0.1, z }, 8);
    kit.cyl(0.085, 0.11, 0.42, I, { x, y: 0.26, z }, 8);
    kit.cyl(0.1, 0.1, 0.04, I2, { x, y: 0.68, z }, 8);
    kit.cyl(0.042, 0.058, tall - 0.7, I, { x, y: 0.7, z }, 8);
    for (const yy of [1.4, 2.2, tall - 0.35]) kit.cyl(0.065, 0.065, 0.045, I2, { x, y: yy, z }, 8);
    kit.ball(0.07, I2, { x, y: tall - 0.2, z }, 8);
    // braços em voluta (arco de barras) + gancho
    for (const s of [-1, 1]) {
      let prev = new V3(x, tall - 0.22, z);
      for (let i = 1; i <= 6; i++) {
        const u = i / 6;
        const p = new V3(x + s * u * 0.38, tall - 0.22 + Math.sin(u * Math.PI * 0.9) * 0.2, z);
        kit.bar(prev, p, 0.026, I);
        prev = p;
      }
      kit.add(new THREE.TorusGeometry(0.06, 0.009, 4, 12, Math.PI * 1.5), I, { x: x + s * 0.2, y: tall - 0.24, z, rz: s > 0 ? 0 : Math.PI });
      // lanterna: chapéu, vidro aceso, armação e base
      const lx = x + s * 0.38, ly = tall - 0.12;
      kit.add(new THREE.ConeGeometry(0.1, 0.09, 6), I, { x: lx, y: ly + 0.02, z });
      kit.ball(0.02, I2, { x: lx, y: ly + 0.08, z });
      kit.cyl(0.075, 0.055, 0.18, '#ffe2b0', { x: lx, y: ly - 0.2, z, glow: true, k: 1.5 }, 6);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        kit.bar(new V3(lx + Math.cos(a) * 0.055, ly - 0.2, z + Math.sin(a) * 0.055), new V3(lx + Math.cos(a) * 0.076, ly - 0.02, z + Math.sin(a) * 0.076), 0.008, I);
      }
      kit.cyl(0.03, 0.06, 0.04, I, { x: lx, y: ly - 0.24, z }, 6);
      fx.addPoints(4, 0, () => new V3(lx, ly - 0.1, z));
    }
    point(x, tall - 0.3, z + 0.1, '#ffd6a0', 3.2, 6.5, { power: 2.4, core: 0.3, reach: 1.2 });
    pool(x, z, 3.2, 2.6, '#ffd6a0', 0.18);
    blob(x, z, 0.7, 0.7, 0.7);
  };
  lampPost(-9.15, -1.35);
  lampPost(-2.1, -1.35);
  lampPost(1.85, -1.35);
  lampPost(8.55, -1.35);
  lampPost(15.0, -1.45);
  // um poste em primeiro plano (escuro, passa na frente da câmera: profundidade)
  lampPost(-5.9, 1.7, { tall: 3.4 });

  // ============================================================
  // Varais de lâmpadas e bandeirinhas
  // ============================================================
  const poles = [-12.3, -5.95, 1.95, 8.55, 15.0, 18.4];
  const flags = [];
  const flagGeo = new THREE.BufferGeometry();
  flagGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.09, 0, 0, 0.09, 0, 0, 0, -0.2, 0], 3));
  flagGeo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  const flagCols = ['#ff5a7a', '#ffd34a', '#5ac0ff', '#8ae07a', '#c08aff', '#ff9a4a', '#f1e2c4'];
  const flagMats = flagCols.map((c) => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.12 }));
  const catenary = (a, b, sag, n, fn) => {
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const p = new V3().lerpVectors(a, b, u);
      p.y -= Math.sin(u * Math.PI) * sag;
      fn(p, i, u);
    }
  };
  const wire = (a, b, sag) => {
    const pts = [];
    catenary(a, b, sag, 24, (p) => pts.push(p));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#0e0c12' }));
    root.add(line);
  };
  const BULB_COLS = ['#ffcf7a', '#ffcf7a', '#ff9ac0', '#ffcf7a', '#9ad8ff'];
  for (let i = 0; i < poles.length; i++) {
    const x = poles[i];
    kit.at(0, 0, 0);
    kit.box(0.1, 3.9, 0.1, '#2a2026', { x, z: -1.25 });
    kit.box(0.5, 0.06, 0.06, '#2a2026', { x, y: 3.75, z: -1.25 });
    if (i < poles.length - 1) {
      const a = new V3(x, 3.85, -1.2), b = new V3(poles[i + 1], 3.85, -1.2);
      wire(a, b, 0.6);
      catenary(a, b, 0.6, 22, (p, j) => j > 0 && j < 22 && bulbs.add(p.x, p.y - 0.06, p.z, BULB_COLS[j % BULB_COLS.length], { pattern: 'twinkle', phase: j + i * 30, k: 1.7 }));
      // bandeirinhas num segundo fio, mais baixo e mais à frente
      const fa = new V3(x, 3.55, -0.9), fb = new V3(poles[i + 1], 3.55, -0.9);
      wire(fa, fb, 0.45);
      catenary(fa, fb, 0.45, 18, (p, j) => {
        if (j === 0 || j === 18) return;
        const f = new THREE.Mesh(flagGeo, flagMats[(j + i) % flagMats.length]);
        f.position.copy(p);
        f.userData.ph = j * 0.7 + i * 3;
        root.add(f);
        flags.push(f);
      });
    }
  }
  anim.push((t) => flags.forEach((f) => {
    f.rotation.x = Math.sin(t * 2.1 + f.userData.ph) * 0.35 + 0.2;
    f.rotation.y = Math.sin(t * 1.3 + f.userData.ph * 0.5) * 0.2;
  }));
  // varais em zigue-zague no fundo (profundidade)
  for (let i = 0; i < 7; i++) {
    const x0 = -14 + i * 5.2;
    const a = new V3(x0, 4.6, -4.2), b = new V3(x0 + 5.2, 4.8, -7.2 + (i % 2) * 2);
    kit.box(0.08, a.y, 0.08, '#2a2026', { x: a.x, z: a.z });
    wire(a, b, 0.7);
    catenary(a, b, 0.7, 16, (p, j) => j > 0 && j < 16 && bulbs.add(p.x, p.y - 0.06, p.z, BULB_COLS[(j + i) % BULB_COLS.length], { pattern: 'twinkle', phase: j * 2 + i * 9, k: 2.4 }));
  }

  // ============================================================
  // FUNDO 1: quiosques da segunda fileira (z ≈ -5.5)
  // ============================================================
  const kiosk = (x, z, text, cols, color) => {
    kit.at(0, 0, 0);
    kit.box(1.6, 1.9, 1.0, '#2a2236', { x, z });
    kit.box(1.4, 0.9, 0.02, '#1a1420', { x, y: 0.95, z: z + 0.51 });
    kit.box(1.3, 0.22, 0.02, color, { x, y: 1.55, z: z + 0.52, glow: true, k: 0.5 }); // faixa de luz embaixo do toldo
    kit.box(1.5, 0.08, 0.3, '#3a2a30', { x, y: 0.9, z: z + 0.62 });
    awning(kit, x - 0.9, x + 0.9, 1.95, z + 0.75, 0.5, cols, { rise: 0.25, stripe: 0.3 });
    const s = sign(text, { w: 1.4, h: 0.3, bg: '#14101c', fg: '#ffffff', edge: color, size: 13, glow: 1.15 });
    addSign(s, x, 2.6, z + 0.5);
    bulbFrame(bulbs, x, 2.6, z + 0.52, 1.44, 0.34, color, { step: 0.14, pattern: 'blink' });
    fx.addGlow(new V3(x, 1.5, z + 0.9), color, { power: 2.4, core: 0.6, reach: 1.8 });
  };
  kiosk(-12.6, -5.6, 'CACHORRO-QUENTE', ['#e04050', '#ffd34a'], '#ffb070');
  kiosk(-1.4, -5.8, 'SORVETE', ['#9ad8ff', '#f6f2ea'], '#9ad8ff');
  kiosk(5.2, -6.2, 'CALDO DE CANA', ['#8ae07a', '#f6f2ea'], '#c8ff9a');
  kiosk(19.6, -5.4, 'PASTEL', ['#ffd34a', '#c4283a'], '#ffd08a');

  // ============================================================
  // FUNDO 2: carrossel girando (x = -6.5, z = -9)
  // ============================================================
  const carousel = (() => {
    const g = new THREE.Group();
    g.position.set(-6.6, 0, -9.2);
    root.add(g);
    const ck = new Kit();
    const R = 3.0;
    ck.cyl(R + 0.2, R + 0.3, 0.35, '#5a2a44', {}, 24);
    ck.cyl(0.35, 0.35, 3.1, '#d9a84a', { y: 0.3 }, 12);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ck.box(0.75, 0.25, 0.04, i % 2 ? '#f1e2c4' : '#c4283a', { x: Math.sin(a) * (R + 0.31), y: 0.05, z: Math.cos(a) * (R + 0.31), ry: a });
    }
    const base = ck.build('carrossel-base');
    g.add(base);
    // parte que gira
    const spin = new THREE.Group();
    g.add(spin);
    const sk = new Kit();
    sk.cyl(R, R, 0.08, '#e9d2b0', { y: 0.35 }, 24);
    // teto: cone listrado + barrado com lâmpadas
    for (let i = 0; i < 16; i++) {
      sk.add(new THREE.ConeGeometry(R + 0.35, 1.3, 16, 1, false, (i / 16) * Math.PI * 2, Math.PI / 8), i % 2 ? '#f1e2c4' : '#c4283a', { y: 3.95 });
    }
    sk.cyl(R + 0.35, R + 0.35, 0.35, '#7a1a2e', { y: 3.1 }, 24);
    sk.cyl(0.12, 0.05, 0.6, '#d9a84a', { y: 4.55 }, 8);
    const horses = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const hx = Math.sin(a) * (R - 0.6), hz = Math.cos(a) * (R - 0.6);
      sk.cyl(0.025, 0.025, 2.7, '#e8d080', { x: hx, y: 0.4, z: hz }, 6);
      const hg = new THREE.Group();
      const hk = new Kit();
      const col = ['#f6f2ea', '#3a2a24', '#c98e6e', '#f6f2ea', '#8a8090'][i % 5];
      hk.box(0.6, 0.24, 0.18, col, {});
      hk.box(0.14, 0.34, 0.14, col, { x: 0.28, y: 0.12, rz: -0.4 });
      hk.box(0.24, 0.12, 0.13, col, { x: 0.4, y: 0.42, rz: -0.2 });
      hk.box(0.05, 0.3, 0.05, col, { x: 0.22, y: -0.28, rz: 0.5 });
      hk.box(0.05, 0.3, 0.05, col, { x: -0.22, y: -0.28, rz: -0.5 });
      hk.box(0.2, 0.06, 0.2, ['#c4283a', '#3d6fc4', '#ffd34a', '#7d4fb0', '#3fa6a0'][i % 5], { y: 0.24 });
      hk.box(0.06, 0.2, 0.06, '#d9a84a', { x: 0.42, y: 0.26 });
      hg.add(hk.build());
      hg.position.set(hx, 1.2, hz);
      hg.rotation.y = a + Math.PI;
      hg.userData.ph = i * 1.3;
      spin.add(hg);
      horses.push(hg);
    }
    spin.add(sk.build('carrossel'));
    const cb = new Bulbs(120, 0.05);
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      cb.add(Math.sin(a) * (R + 0.37), 3.12, Math.cos(a) * (R + 0.37), ['#ffe08a', '#ff9ac0'][i % 2], { pattern: 'chase', phase: i, k: 2.8 });
    }
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      for (let j = 1; j < 6; j++) {
        const rr = (R + 0.3) * (1 - j / 6);
        cb.add(Math.sin(a) * rr, 3.35 + (1.25 * j) / 6, Math.cos(a) * rr, '#ffe08a', { pattern: 'wave', phase: j * 2 + r, k: 2.4 });
      }
    }
    spin.add(cb.mesh);
    fx.addGlow(new V3(-6.6, 2.4, -9.2), '#ffc890', { power: 4.5, core: 2.4, reach: 4.0 });
    point(-6.6, 2.6, -7.0, '#ffc08a', 5, 9);
    anim.push((t) => {
      spin.rotation.y = t * 0.35;
      horses.forEach((h) => (h.position.y = 1.2 + Math.sin(t * 2.2 + h.userData.ph) * 0.18));
      cb.update(t);
    });
    blob(-6.6, -9.2, 8, 8, 0.6);
    return { spin };
  })();

  // ============================================================
  // FUNDO 3: lona de circo (x = 3.5, z = -12.5)
  // ============================================================
  {
    const x = 3.4, z = -13, R = 4.2;
    kit.at(x, 0, z);
    for (let i = 0; i < 20; i++) {
      const a0 = (i / 20) * Math.PI * 2;
      kit.add(new THREE.CylinderGeometry(R, R, 2.6, 20, 1, true, a0, Math.PI / 10), i % 2 ? '#f1e2c4' : '#b8283a', { y: 1.3, k: 0.85 });
      kit.add(new THREE.ConeGeometry(R + 0.4, 3.6, 20, 1, true, a0, Math.PI / 10), i % 2 ? '#f1e2c4' : '#b8283a', { y: 4.4, k: 0.9 });
    }
    // entrada iluminada
    kit.box(1.4, 2.0, 0.05, '#ff9a50', { y: 0, z: R + 0.01, glow: true, k: 0.38 });
    // abas da lona abertas (vermelhas) dos dois lados da entrada
    kit.box(0.5, 2.3, 0.04, '#b8283a', { x: -0.85, y: 0, z: R + 0.08, ry: -0.5, k: 0.8 });
    kit.box(0.5, 2.3, 0.04, '#b8283a', { x: 0.85, y: 0, z: R + 0.08, ry: 0.5, k: 0.8 });
    kit.box(1.9, 0.3, 0.05, '#ffd34a', { y: 2.2, z: R + 0.06, k: 0.9 });
    kit.cyl(0.04, 0.04, 1.4, '#d9a84a', { y: 6.2 }, 6);
    kit.at(0, 0, 0);
    // bandeira no topo (balança)
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshLambertMaterial({ color: '#ffd34a', side: THREE.DoubleSide, emissive: '#ffd34a', emissiveIntensity: 0.2 }));
    flag.geometry.translate(0.35, 0, 0);
    flag.position.set(x, 7.4, z);
    root.add(flag);
    anim.push((t) => {
      flag.rotation.y = Math.sin(t * 1.7) * 0.4;
      flag.rotation.z = Math.sin(t * 2.9) * 0.05;
    });
    // fios de lâmpadas do topo até o chão
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const top = new V3(x, 6.3, z), bot = new V3(x + Math.sin(a) * (R + 2.2), 0.3, z + Math.cos(a) * (R + 2.2));
      catenary(top, bot, 0.5, 14, (p, j) => j > 1 && bulbs.add(p.x, p.y, p.z, BULB_COLS[(j + i) % BULB_COLS.length], { pattern: 'twinkle', phase: j + i * 7, k: 2.2 }));
    }
    fx.addGlow(new V3(x, 1.2, z + R + 0.5), '#ffcf8a', { power: 3, core: 0.8, reach: 2.5 });
  }

  // ============================================================
  // FUNDO 4: a roda-gigante (x = 13, z = -17)
  // ============================================================
  const wheel = (() => {
    const g = new THREE.Group();
    const HX = 12.6, HY = 8.6, HZ = -17.5, R = 7.2, N = 18;
    g.position.set(HX, 0, HZ);
    root.add(g);
    // estrutura fixa (pernas em A, base, escada)
    const wk = new Kit();
    for (const s of [-1, 1]) {
      wk.bar(new V3(-3.4, 0, s * 1.1), new V3(0, HY, s * 0.75), 0.22, '#d8d2e6');
      wk.bar(new V3(3.4, 0, s * 1.1), new V3(0, HY, s * 0.75), 0.22, '#d8d2e6');
      wk.bar(new V3(-1.9, HY * 0.45, s * 0.95), new V3(1.9, HY * 0.45, s * 0.95), 0.12, '#bab4ca');
    }
    wk.box(8.5, 0.5, 3.2, '#3a3448');
    wk.box(2.4, 0.9, 1.6, '#c4283a', { y: 0.5, z: 1.9 }); // plataforma de embarque
    wk.add(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 12), '#9a94aa', { y: HY, rx: Math.PI / 2 });
    g.add(wk.build('roda-base'));
    // parte que gira
    const rot = new THREE.Group();
    rot.position.y = HY;
    g.add(rot);
    const rk = new Kit();
    for (const s of [-0.7, 0.7]) {
      rk.add(new THREE.TorusGeometry(R, 0.09, 4, 72), '#e8e2f2', { z: s });
      rk.add(new THREE.TorusGeometry(R * 0.55, 0.06, 4, 48), '#d0cade', { z: s });
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        rk.bar(new V3(0, 0, s), new V3(Math.cos(a) * R, Math.sin(a) * R, s), 0.06, '#d8d2e6');
        // treliça em zigue-zague entre os aros
        const a2 = ((i + 0.5) / N) * Math.PI * 2;
        rk.bar(new V3(Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, s), new V3(Math.cos(a2) * R, Math.sin(a2) * R, s), 0.035, '#bab4ca');
      }
    }
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      rk.bar(new V3(Math.cos(a) * R, Math.sin(a) * R, -0.75), new V3(Math.cos(a) * R, Math.sin(a) * R, 0.75), 0.07, '#bab4ca');
    }
    rot.add(rk.build('roda'));
    // lâmpadas: aros (onda colorida) e raios (ondas saindo do centro)
    const wb = new Bulbs(600, 0.075);
    const WCOLS = ['#ff5a9a', '#ffd34a', '#5ad0ff', '#ffd34a'];
    for (let i = 0; i < 108; i++) {
      const a = (i / 108) * Math.PI * 2;
      wb.add(Math.cos(a) * (R + 0.12), Math.sin(a) * (R + 0.12), 0.78, WCOLS[Math.floor(i / 9) % 4], { pattern: 'wave', phase: i * 0.35, k: 3.2 });
    }
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      for (let j = 1; j <= 8; j++) {
        const r = (R * j) / 8.5;
        wb.add(Math.cos(a) * r, Math.sin(a) * r, 0.76, j % 2 ? '#fff0c0' : '#ff9ac0', { pattern: 'wave', phase: j * 3, k: 3.0 });
      }
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      wb.add(Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0.95, '#ffffff', { pattern: 'slow', phase: i, k: 4 });
    }
    rot.add(wb.mesh);
    // gôndolas (ficam sempre de pé, balançando)
    const gondolas = [];
    const GC = ['#c4283a', '#3fa6a0', '#ffd34a', '#7d4fb0', '#3d6fc4', '#e0823a'];
    for (let i = 0; i < N; i++) {
      const gk = new Kit();
      const col = GC[i % GC.length];
      gk.box(1.1, 0.75, 1.0, col, { y: -1.2 });
      gk.box(1.2, 0.1, 1.1, '#f1e2c4', { y: -0.48 });
      gk.add(new THREE.ConeGeometry(0.75, 0.35, 4), col, { y: -0.3, ry: Math.PI / 4, k: 1.1 });
      gk.box(0.04, 0.5, 0.04, '#d8d2e6', { x: -0.45, y: -0.45 });
      gk.box(0.04, 0.5, 0.04, '#d8d2e6', { x: 0.45, y: -0.45 });
      gk.box(0.9, 0.3, 0.02, '#ffe0a0', { y: -1.05, z: 0.51, glow: true, k: 0.45 }); // janelinha acesa
      const gm = gk.build('gondola');
      gm.userData.a = (i / N) * Math.PI * 2;
      gm.userData.ph = i * 0.9;
      g.add(gm);
      gondolas.push(gm);
    }
    fx.addGlow(new V3(HX, HY, HZ + 1), '#ff9ac8', { power: 9, core: R * 0.8, reach: 9 });
    fx.addGlow(new V3(HX, HY, HZ + 1), '#fff0d0', { power: 4, core: 1.2, reach: 3 });
    point(HX, 3, HZ + 3, '#ff9ac8', 10, 14);
    const W = { rot, speed: 0.06, angle: 0, sway: 1 };
    anim.push((t, dt) => {
      W.angle += dt * W.speed;
      rot.rotation.z = W.angle;
      gondolas.forEach((gm) => {
        const a = gm.userData.a + W.angle;
        gm.position.set(Math.cos(a) * R, HY + Math.sin(a) * R, 0);
        gm.rotation.z = Math.sin(t * 0.8 + gm.userData.ph) * 0.05 * W.sway + (gm.userData.kick || 0);
      });
      wb.update(t);
    });
    return { group: g, hub: new V3(HX, HY, HZ), R, W, gondolas, bulbs: wb };
  })();

  // ============================================================
  // Balões que escaparam (sobem devagar no céu)
  // ============================================================
  const escaped = [];
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshLambertMaterial({ color: ['#ff5a7a', '#ffd34a', '#5ac0ff', '#c08aff'][i], emissive: '#402030', emissiveIntensity: 0.4 }));
    b.scale.y = 1.2;
    b.userData = { x: rnd(-14, 18), z: rnd(-10, -22), v: rnd(0.25, 0.45), y: rnd(2, 20), ph: rnd(0, 6) };
    root.add(b);
    escaped.push(b);
  }
  anim.push((t, dt) => escaped.forEach((b) => {
    const u = b.userData;
    u.y += u.v * dt;
    if (u.y > 26) {
      u.y = 2;
      u.x = rnd(-14, 18);
    }
    b.position.set(u.x + Math.sin(t * 0.4 + u.ph) * 0.8, u.y, u.z);
  }));

  // ============================================================
  // Gente passando ao fundo (e algumas paradas conversando)
  // ============================================================
  const crowd = [];
  const crowdLayer = (z, n, speedMul = 1) => {
    for (let i = 0; i < n; i++) {
      const o = PEOPLE[Math.floor(srand() * PEOPLE.length)];
      const m = personMesh(o, o.kid ? 1.25 : rnd(1.6, 1.8));
      const walk = srand() < 0.75;
      m.userData = { walk, dir: srand() < 0.5 ? 1 : -1, speed: rnd(0.5, 0.9) * speedMul, ph: srand() * 9, min: -16, max: 22, tex: m.userData.tex };
      m.position.set(rnd(-15, 21), 0, z + rnd(-0.6, 0.6));
      // tons mais escuros e frios: estão longe das barracas
      m.material.color.set('#8a86b0');
      root.add(m);
      crowd.push(m);
    }
  };
  crowdLayer(-3.6, 9);
  crowdLayer(-7.0, 10, 0.9);
  crowdLayer(-11.5, 8, 0.8);
  anim.push((t, dt) => crowd.forEach((m) => {
    const u = m.userData;
    let f = 0;
    if (u.walk) {
      m.position.x += u.dir * u.speed * dt;
      if (m.position.x > u.max) u.dir = -1;
      if (m.position.x < u.min) u.dir = 1;
      f = 1 + (Math.floor(t * 4 * u.speed + u.ph) % 2);
      m.position.y = Math.abs(Math.sin(t * 8 * u.speed + u.ph)) * 0.02;
    }
    m.scale.x = u.dir;
    u.tex.offset.x = f / 3;
  }));

  // ============================================================
  // Detalhes do chão perto da rua: cabos, lixeiras, banco, cones
  // ============================================================
  kit.at(0, 0, 0);
  // cabos de energia atravessando (pretos, com uma curva)
  for (const cx of [-6.2, 5.3, 11.9]) {
    for (let i = 0; i < 12; i++) kit.box(0.2, 0.025, 0.035, '#121016', { x: cx + Math.sin(i * 0.6) * 0.18, z: -1.4 + i * 0.2, ry: Math.cos(i * 0.6) * 0.5 });
  }
  // lixeiras de ferro (gomos, aro, tampa em cúpula com boca) — transbordando
  for (const lx of [-2.9, 5.3, 12.0]) {
    const G = '#244c34', GD = '#16301f';
    kit.cyl(0.25, 0.27, 0.06, GD, { x: lx, z: -1.35 }, 14);
    kit.cyl(0.235, 0.205, 0.7, G, { x: lx, y: 0.05, z: -1.35 }, 14);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      kit.box(0.028, 0.68, 0.02, GD, { x: lx + Math.cos(a) * 0.226, y: 0.06, z: -1.35 + Math.sin(a) * 0.226, ry: -a, k: 1.1 });
    }
    for (const yy of [0.18, 0.62]) kit.add(new THREE.TorusGeometry(0.232, 0.014, 4, 18), GD, { x: lx, y: yy, z: -1.35, rx: Math.PI / 2 });
    kit.add(new THREE.TorusGeometry(0.24, 0.022, 5, 18), '#2e5e40', { x: lx, y: 0.76, z: -1.35, rx: Math.PI / 2 });
    kit.add(new THREE.SphereGeometry(0.24, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), G, { x: lx, y: 0.77, z: -1.35, sy: 0.55 });
    kit.box(0.2, 0.08, 0.04, '#0a0a0e', { x: lx, y: 0.83, z: -1.13, rx: -0.35 }); // boca
    kit.ball(0.03, '#3a6a4c', { x: lx, y: 0.9, z: -1.35 });
    // copo e saquinho de pipoca saindo
    kit.cyl(0.04, 0.03, 0.12, '#f1e2c4', { x: lx + 0.06, y: 0.84, z: -1.18, rz: 0.5 });
    kit.box(0.08, 0.1, 0.05, '#d02838', { x: lx - 0.07, y: 0.85, z: -1.17, rz: -0.6 });
    blob(lx, -1.3, 0.8, 0.6, 0.7);
  }
  // banco de praça: laterais de ferro fundido em curva, ripas de madeira, braços
  {
    const bx = -1.9, bz = -1.15, I = '#1c1a22';
    for (const s of [-0.58, 0.58]) {
      const X = bx + s;
      kit.bar(new V3(X, 0, bz + 0.17), new V3(X, 0.42, bz + 0.13), 0.04, I);
      kit.bar(new V3(X, 0, bz - 0.2), new V3(X, 0.42, bz - 0.15), 0.04, I);
      kit.bar(new V3(X, 0.42, bz - 0.15), new V3(X, 0.82, bz - 0.27), 0.04, I);
      kit.bar(new V3(X, 0.42, bz + 0.16), new V3(X, 0.42, bz - 0.18), 0.035, I);
      // braço com voluta
      kit.bar(new V3(X, 0.42, bz + 0.15), new V3(X, 0.62, bz + 0.12), 0.03, I);
      kit.bar(new V3(X, 0.62, bz + 0.12), new V3(X, 0.62, bz - 0.2), 0.035, I);
      kit.add(new THREE.TorusGeometry(0.05, 0.012, 4, 10), I, { x: X, y: 0.6, z: bz + 0.15, ry: Math.PI / 2 });
      kit.box(0.08, 0.025, 0.08, I, { x: X, z: bz + 0.17 });
      kit.box(0.08, 0.025, 0.08, I, { x: X, z: bz - 0.2 });
    }
    for (let i = 0; i < 4; i++) kit.tbox(1.36, 0.032, 0.075, '#8a5a3c', { x: bx, y: 0.42, z: bz + 0.12 - i * 0.088, mat: woodMat, tile: 0.4 });
    for (let i = 0; i < 3; i++) kit.tbox(1.36, 0.075, 0.026, '#8a5a3c', { x: bx, y: 0.52 + i * 0.1, z: bz - 0.18 - i * 0.03, rx: -0.25, mat: woodMat, tile: 0.4 });
    blob(bx, bz, 1.8, 0.8, 0.7);
  }
  // copinhos e ingressos caídos perto da rua (3D, para ter sombra)
  for (let i = 0; i < 30; i++) {
    const x = rnd(-11.5, 17), z = rnd(-1.4, 0.6);
    if (Math.abs(x) < 0.9 && z < -0.6) continue;
    if (i % 3 === 0) kit.box(0.09, 0.004, 0.04, '#f2c24a', { x, z, ry: srand() * 3, k: 0.9 });
    else if (i % 3 === 1) kit.box(0.03, 0.003, 0.03, ['#ff5a7a', '#5ac0ff', '#8ae07a'][i % 3], { x, z, ry: srand() * 3 });
    else kit.ball(0.018, '#fff1c0', { x, y: 0.012, z });
  }

  // poeira dourada no ar ao longo da rua
  fx.addPoints(220, 1, () => new V3(rnd(-12, 18), rnd(0.2, 3.6), rnd(-2.6, 1.2)));
  root.add(kit.build('parque'));
  const particles = fx.buildPoints();
  root.add(particles);

  return {
    root,
    lights,
    signs,
    bulbs,
    bigBulbs,
    booth,
    ticket,
    wheel,
    carousel,
    interactables,
    blobMat,
    popBalloon,
    sky: skyCtl,
    balloonWall,
    cans,
    pond,
    vendors,
    FRONT: -1.55,
    update(t, dt) {
      for (const f of anim) f(t, dt);
      bulbs.update(t);
      bigBulbs.update(t);
    },
  };
}

function lerpN(a, b, k) {
  return a + (b - a) * k;
}
