import * as THREE from 'three';
import { ease, damp, clamp, lerp } from '../engine/tween.js';
import { PROFILE, SELF, buildPosts } from './posts.js';

// ===============================================================
// "Pixgram": a rede social fictícia dentro do celular.
// Tudo é desenhado num canvas de 132x276 pixels, usado como textura
// da tela do celular em 3D.
// ===============================================================

export const W = 132;
export const H = 276;
const STATUS = 12;
const TOP = 16;
const NAV = 20;
const CONTENT_Y = STATUS + TOP;
const VIEW_H = H - CONTENT_Y - NAV;

const C = {
  bg: '#0b0b10',
  text: '#f1f1f6',
  sub: '#8d8da3',
  line: '#1e1e2a',
  blue: '#4b8bff',
  red: '#ff3b5c',
  card: '#1a1a24',
  btn: '#262633',
};

// --- Desenho da interface: vetorial e nítido (padrão de app de verdade) ---
// A tela é desenhada em SC× (528x1104), mas as coordenadas continuam em
// "pontos" de 132x276. Só as FOTOS (posts, avatares, papel de parede, reflexo)
// são desenhadas sem suavização, pixeladas de propósito.

const SC = 4;
const UIF = '-apple-system, "SF Pro Text", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif';

// texto: mesmos parâmetros do drawText antigo (font 'tiny' = texto pequeno do app)
function txt(ctx, text, x, y, { size = 8, weight = 400, color = C.text, align = 'left', alpha = 1, font = 'ui' } = {}) {
  const sz = font === 'tiny' ? 6.3 : size === 12 ? 9.4 : size >= 30 ? size * 1.08 : size * 0.8;
  ctx.font = `${weight} ${sz}px ${UIF}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * alpha;
  ctx.fillText(String(text), x, y + sz * 0.08);
  ctx.globalAlpha = a;
  return ctx.measureText(String(text)).width;
}

function txtW(ctx, text, { size = 8, weight = 400, font = 'ui' } = {}) {
  const sz = font === 'tiny' ? 6.3 : size === 12 ? 9.4 : size * 0.8;
  ctx.font = `${weight} ${sz}px ${UIF}`;
  return ctx.measureText(String(text)).width;
}

function txtWrap(ctx, text, maxW, opts) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (txtW(ctx, test, opts) > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function circle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// foto redonda (avatar): círculo nítido, foto pixelada por dentro
function avatar(ctx, img, cx, cy, r) {
  if (!img) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

// foto retangular pixelada
function photo(ctx, img, x, y, w, h, r = 0) {
  ctx.save();
  if (r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

// Ícones de linha, estilo app (caixa de ~9x9 pontos começando em x, y)
function icon(ctx, name, x, y, color = C.text, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 0.95;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const P = new Path2D();
  switch (name) {
    case 'heart':
    case 'heartO': {
      P.moveTo(4.5, 8.2);
      P.bezierCurveTo(1.2, 5.8, -0.2, 4.2, 0.4, 2.4);
      P.bezierCurveTo(1, 0.4, 3.6, 0.2, 4.5, 2.2);
      P.bezierCurveTo(5.4, 0.2, 8, 0.4, 8.6, 2.4);
      P.bezierCurveTo(9.2, 4.2, 7.8, 5.8, 4.5, 8.2);
      P.closePath();
      if (name === 'heart') ctx.fill(P);
      else ctx.stroke(P);
      break;
    }
    case 'comment':
      P.arc(4.5, 4.2, 3.8, Math.PI * 0.72, Math.PI * 0.6 + Math.PI * 2);
      P.lineTo(0.6, 8.3);
      P.closePath();
      ctx.stroke(P);
      break;
    case 'share':
      P.moveTo(0.6, 1);
      P.lineTo(8.6, 1);
      P.lineTo(4.4, 8.4);
      P.lineTo(3.6, 4.2);
      P.closePath();
      P.moveTo(3.6, 4.2);
      P.lineTo(8.6, 1);
      ctx.stroke(P);
      break;
    case 'bookmark':
      P.moveTo(1.4, 0.8);
      P.lineTo(6.6, 0.8);
      P.lineTo(6.6, 8.6);
      P.lineTo(4, 6.4);
      P.lineTo(1.4, 8.6);
      P.closePath();
      ctx.stroke(P);
      break;
    case 'back':
      ctx.lineWidth = 1.2;
      P.moveTo(4.2, 0.6);
      P.lineTo(0.6, 4.5);
      P.lineTo(4.2, 8.4);
      ctx.stroke(P);
      break;
    case 'dots':
      for (let i = 0; i < 3; i++) P.arc(0.8 + i * 3.6, 0.5, 0.75, 0, Math.PI * 2), P.closePath();
      ctx.fill(P);
      break;
    case 'home':
      P.moveTo(0.8, 4);
      P.lineTo(4.5, 0.8);
      P.lineTo(8.2, 4);
      P.lineTo(8.2, 8.4);
      P.lineTo(5.6, 8.4);
      P.lineTo(5.6, 5.6);
      P.lineTo(3.4, 5.6);
      P.lineTo(3.4, 8.4);
      P.lineTo(0.8, 8.4);
      P.closePath();
      ctx.stroke(P);
      break;
    case 'search':
      P.arc(3.8, 3.8, 3.1, 0, Math.PI * 2);
      P.moveTo(6.1, 6.1);
      P.lineTo(8.5, 8.5);
      ctx.stroke(P);
      break;
    case 'plus':
      P.roundRect(0.7, 0.7, 7.6, 7.6, 2.2);
      P.moveTo(4.5, 2.8);
      P.lineTo(4.5, 6.2);
      P.moveTo(2.8, 4.5);
      P.lineTo(6.2, 4.5);
      ctx.stroke(P);
      break;
    case 'reels': {
      P.roundRect(0.7, 0.7, 7.6, 7.6, 2.2);
      P.moveTo(0.7, 2.9);
      P.lineTo(8.3, 2.9);
      P.moveTo(2.8, 0.8);
      P.lineTo(3.8, 2.9);
      P.moveTo(5.4, 0.8);
      P.lineTo(6.4, 2.9);
      ctx.stroke(P);
      const T = new Path2D();
      T.moveTo(3.7, 4.2);
      T.lineTo(6, 5.6);
      T.lineTo(3.7, 7);
      T.closePath();
      ctx.fill(T);
      break;
    }
    case 'grid':
      ctx.lineWidth = 0.8;
      P.rect(0.4, 0.4, 7.2, 7.2);
      P.moveTo(2.8, 0.4);
      P.lineTo(2.8, 7.6);
      P.moveTo(5.2, 0.4);
      P.lineTo(5.2, 7.6);
      P.moveTo(0.4, 2.8);
      P.lineTo(7.6, 2.8);
      P.moveTo(0.4, 5.2);
      P.lineTo(7.6, 5.2);
      ctx.stroke(P);
      break;
    case 'tag':
      ctx.lineWidth = 0.8;
      P.roundRect(0.5, 0.5, 8, 8, 1.6);
      P.moveTo(6.6, 8.4);
      P.arc(4.5, 8.4, 2.1, 0, Math.PI, true);
      P.moveTo(5.9, 4);
      P.arc(4.5, 4, 1.4, 0, Math.PI * 2);
      ctx.stroke(P);
      break;
    case 'cam':
      P.roundRect(0.5, 1.6, 6, 5, 1.2);
      P.moveTo(4.9, 4.1);
      P.arc(3.5, 4.1, 1.4, 0, Math.PI * 2);
      ctx.stroke(P);
      break;
    case 'torch':
      P.moveTo(1, 0.8);
      P.lineTo(5, 0.8);
      P.lineTo(4, 3);
      P.lineTo(4, 7);
      P.lineTo(2, 7);
      P.lineTo(2, 3);
      P.closePath();
      ctx.stroke(P);
      break;
    default:
      break;
  }
  ctx.restore();
}

// --- Formas em pixel art ---
// Reflexo do rosto dela na tela apagada: o retrato espelhado, sem cor
// (luar frio), escuro e com um pouco de "fantasma" do vidro.
function makeReflection(img) {
  const S = 2; // 64 px → 128 px (cabe na largura da tela)
  const c = document.createElement('canvas');
  c.width = img.width * S;
  c.height = img.height * S;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.translate(c.width, 0);
  g.scale(-1, 1); // espelho
  g.drawImage(img, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const y = (i / 4 / c.width) | 0;
    const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255;
    // tons frios do luar; some embaixo (o queixo some no preto do vidro)
    const fade = Math.min(1, Math.max(0, (c.height * 0.95 - y) / (c.height * 0.35)));
    const k = Math.pow(l, 1.15) * fade;
    p[i] = 150 * k;
    p[i + 1] = 172 * k;
    p[i + 2] = 230 * k;
    p[i + 3] = p[i + 3] > 100 ? 255 * fade : 0;
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.putImageData(d, 0, 0);
  return c;
}

// círculo em pixel art (para o papel de parede, que é uma "foto")
function pcircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let j = -r; j < r; j++) {
    const w = Math.round(Math.sqrt(r * r - (j + 0.5) ** 2));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1);
  }
}

// tela em alta resolução (a interface fica nítida)
function makeHD() {
  return makeCanvas(W * SC, H * SC);
}

function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Papel de parede da tela de bloqueio (noite com lua)
function wallpaper() {
  const c = makeCanvas();
  const ctx = c.getContext('2d');
  const cols = ['#0b0a1e', '#160f33', '#251548', '#3a1d5a', '#55286a'];
  const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < H; y++) {
    const k = (y / H) * (cols.length - 1);
    const i = Math.min(cols.length - 2, Math.floor(k));
    const f = k - i;
    for (let x = 0; x < W; x++) {
      ctx.fillStyle = cols[f > (B[(x & 3) + (y & 3) * 4] + 0.5) / 16 ? i + 1 : i];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 46; i++) ctx.fillRect(Math.floor(r() * W), Math.floor(r() * H * 0.6), 1, 1);
  pcircle(ctx, 98, 150, 11, '#efe9d0');
  pcircle(ctx, 102, 147, 9, '#251548');
  // morros
  ctx.fillStyle = '#0a0716';
  for (let x = 0; x < W; x++) {
    const h = 26 + Math.sin(x / 13) * 6 + Math.sin(x / 5) * 2;
    ctx.fillRect(x, H - h, 1, h);
  }
  return c;
}

// ===============================================================

export class PhoneApp {
  constructor({ crush, self, onEvent }) {
    this.canvas = makeHD();
    this.ctx = this.canvas.getContext('2d');
    this.bufA = makeHD();
    this.bufB = makeHD();
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.anisotropy = 4;
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.onEvent = onEvent || (() => {});
    this.posts = buildPosts({ crush });
    this.wall = wallpaper();
    this.crushImg = crush; // fotos de perfil (pixeladas, desenhadas no círculo)
    this.selfImg = self;
    this.reflection = makeReflection(self);
    this.reset();
  }

  reset() {
    this.locked = false;
    this.screen = 'lock';
    this.post = null;
    this.scroll = { profile: 0, post: 0 };
    this.vel = 0;
    this.trans = null;
    this.notifK = 0;
    this.notifOn = false;
    this.heart = null;
    this.heartBump = 0;
    this.liked = new Set();
    this.time = 0;
    this.ptr = { down: false, moved: false, x0: 0, y0: 0, lastY: 0, lastT: 0 };
    this.lastTap = { t: -10, x: 0, y: 0 };
    this.hits = [];
    this.deepFired = false;
    this.lastRow = 0;
    this.pressFx = 0;
    this.battery = 12;
    this.modal = null; // aviso de bateria fraca
    this.dead = false;
    this.deadT = 0;
    this.padOn = false; // jogando no controle: mostra a moldura de foco
    this.padSel = null; // item escolhido pelo controle
    this.padMem = {}; // o último item de cada tela (voltar do post cai na mesma foto)
    this.focusR = null; // moldura (anima até o item)
  }

  // -------------------------------------------------------------
  // Navegação
  // -------------------------------------------------------------

  showNotification() {
    this.notifOn = true;
  }

  go(to, kind, dur = 0.38) {
    if (this.trans) return;
    this.trans = { from: this.screen, to, kind, k: 0, dur };
    this.vel = 0;
  }

  unlock() {
    this.onEvent('unlock');
    this.go('profile', 'unlock', 0.5);
  }

  lock() {
    this.onEvent('lock');
    this.go('lock', 'lock', 0.4);
  }

  openPost(i) {
    this.post = this.posts[i];
    this.scroll.post = 0;
    delete this.padMem.post; // post novo: o controle começa na foto
    this.onEvent('open-post', this.post);
    this.go('post', 'push');
  }

  openMe() {
    if (this.trans || this.screen === 'me') return;
    this.prevScreen = this.screen;
    this.onEvent('open-me');
    this.go('me', 'push');
  }

  back() {
    if (this.trans) return false;
    if (this.screen === 'me') {
      this.onEvent('back');
      this.go(this.prevScreen || 'profile', 'pop');
      return true;
    }
    if (this.screen === 'post') {
      this.onEvent('back');
      this.go('profile', 'pop');
      return true;
    }
    return false;
  }

  toggleLike(fromDouble = false) {
    const p = this.post;
    if (!p || this.locked || this.dead) return; // travado: a curtida fica
    if (this.liked.has(p.index)) {
      if (fromDouble) return;
      this.liked.delete(p.index);
      this.onEvent('unlike', p);
    } else {
      this.liked.add(p.index);
      this.heartBump = 1;
      this.onEvent('like', p);
    }
  }

  // -------------------------------------------------------------
  // Entrada (coordenadas em pixels da tela do celular)
  // -------------------------------------------------------------

  scrollKey() {
    if (this.trans) return null;
    return this.screen === 'profile' || this.screen === 'post' ? this.screen : null;
  }

  maxScroll(key) {
    if (key === 'profile') return Math.max(0, this.profileH - VIEW_H);
    if (key === 'post') return Math.max(0, (this.postH || 0) - VIEW_H);
    return 0;
  }

  hitAt(x, y) {
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h = this.hits[i];
      if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return h;
    }
    return null;
  }

  isClickable(x, y) {
    return !!this.hitAt(x, y);
  }

  // --- Bateria ---
  lowBattery() {
    this.battery = 1;
    this.modal = { t: 0 };
    this.onEvent('low-battery');
  }

  die() {
    this.modal = null;
    this.dead = true;
    this.deadT = 0;
    this.ptr.down = false;
    this.vel = 0;
  }

  pointerDown(x, y) {
    if (this.trans || this.dead) return;
    Object.assign(this.ptr, { down: true, moved: false, x0: x, y0: y, lastY: y, lastT: this.time });
    this.vel = 0;
    this.pressFx = 1;
  }

  pointerMove(x, y) {
    const p = this.ptr;
    if (!p.down) return;
    const key = this.scrollKey();
    const dy = y - p.lastY;
    if (!p.moved && Math.abs(y - p.y0) > 3) p.moved = true;
    if (p.moved && key) {
      const s = this.scroll[key];
      const over = s < 0 || s > this.maxScroll(key);
      this.scroll[key] = s - dy * (over ? 0.4 : 1);
      const dt = this.time - p.lastT;
      if (dt > 0) this.vel = lerp(this.vel, -dy / dt, 0.5);
    }
    p.lastY = y;
    p.lastT = this.time;
  }

  pointerUp(x, y) {
    const p = this.ptr;
    if (!p.down) return;
    p.down = false;
    if (!p.moved) this.tap(x, y);
    else if (this.time - p.lastT > 0.08) this.vel = 0;
  }

  cancelPointer() {
    this.ptr.down = false;
  }

  wheel(dy) {
    if (this.dead || this.modal) return;
    if (!this.scrollKey()) return;
    this.vel = clamp(this.vel + dy * 3.2, -1400, 1400);
  }

  tap(x, y) {
    if (this.dead || this.locked) return;
    if (this.modal) {
      // botão OK do aviso
      if (x > 20 && x < 112 && y > 150 && y < 168) {
        this.modal = null;
        this.onEvent('tap');
      }
      return;
    }
    const now = this.time;
    const isDouble = now - this.lastTap.t < 0.33 && Math.hypot(x - this.lastTap.x, y - this.lastTap.y) < 12;
    this.lastTap = isDouble ? { t: -10, x, y } : { t: now, x, y };
    const h = this.hitAt(x, y);
    if (isDouble && h?.double) {
      h.double(x, y);
      return;
    }
    if (h?.action) {
      this.onEvent('tap');
      h.action(x, y);
    } else {
      this.onEvent('tap-empty');
    }
  }

  // -------------------------------------------------------------
  // Atualização
  // -------------------------------------------------------------

  update(dt) {
    this.time += dt;
    this.dt = dt;
    if (this.dead) this.deadT += dt;
    if (this.modal) this.modal.t += dt;

    if (this.trans) {
      this.trans.k += dt / this.trans.dur;
      if (this.trans.k >= 1) {
        const to = this.trans.to;
        this.screen = to;
        this.trans = null;
        this.onEvent('arrive', to);
      }
    }

    const key = this.scrollKey();
    if (key && !this.ptr.down) {
      const max = this.maxScroll(key);
      let s = this.scroll[key] + this.vel * dt;
      this.vel *= Math.exp(-4.2 * dt);
      if (s < 0) {
        s = damp(s, 0, 14, dt);
        this.vel *= Math.exp(-14 * dt);
      } else if (s > max) {
        s = damp(s, max, 14, dt);
        this.vel *= Math.exp(-14 * dt);
      }
      if (Math.abs(this.vel) < 2) this.vel = 0;
      this.scroll[key] = s;
      // controle: rola macio até o item escolhido aparecer inteiro
      if (this.padOn && Math.abs(this.vel) < 40) {
        const h = this.padCurrent();
        if (h && !this.padFixed(h)) {
          const top = CONTENT_Y + 3, bottom = H - NAV - 3;
          const k = 1 - Math.exp(-12 * dt);
          if (h.y < top) this.scroll[key] -= (top - h.y) * k;
          else if (h.y + h.h > bottom && h.h < bottom - top) this.scroll[key] += (h.y + h.h - bottom) * k;
        }
      }
    }

    if (this.screen === 'profile' && !this.trans) {
      const row = Math.floor(this.scroll.profile / 44);
      if (row !== this.lastRow) {
        this.lastRow = row;
        this.onEvent('scroll-tick');
      }
      if (!this.deepFired && this.scroll.profile > this.maxScroll('profile') * 0.82 && this.maxScroll('profile') > 0) {
        this.deepFired = true;
        this.onEvent('deep');
      }
    }

    this.notifK = damp(this.notifK, this.notifOn ? 1 : 0, 7, dt);
    this.heartBump = Math.max(0, this.heartBump - dt * 3);
    this.pressFx = Math.max(0, this.pressFx - dt * 6);
    if (this.heart) {
      this.heart.t += dt;
      if (this.heart.t > 1) this.heart = null;
    }

    this.draw();
  }

  // -------------------------------------------------------------
  // Desenho
  // -------------------------------------------------------------

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (this.dead) {
      this.drawDead(ctx);
      this.texture.needsUpdate = true;
      return;
    }
    if (this.trans) {
      const { from, to, kind } = this.trans;
      const e = ease.outCubic(clamp(this.trans.k));
      const a = this.bufA.getContext('2d');
      const b = this.bufB.getContext('2d');
      a.setTransform(SC, 0, 0, SC, 0, 0);
      b.setTransform(SC, 0, 0, SC, 0, 0);
      this.hits = [];
      this.drawScreen(from, a);
      this.drawScreen(to, b);
      this.hits = [];
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const img = (buf, x, y) => ctx.drawImage(buf, x, y, W, H);
      if (kind === 'push') {
        img(this.bufA, -W * 0.3 * e, 0);
        ctx.fillStyle = `rgba(0,0,0,${0.5 * e})`;
        ctx.fillRect(0, 0, W, H);
        // a tela nova entra com uma sombra na borda (como no iOS)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 24;
        img(this.bufB, W * (1 - e), 0);
        ctx.restore();
      } else if (kind === 'pop') {
        img(this.bufB, -W * 0.3 * (1 - e), 0);
        ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - e)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 24;
        img(this.bufA, W * e, 0);
        ctx.restore();
      } else if (kind === 'unlock') {
        ctx.globalAlpha = e;
        img(this.bufB, 0, (1 - e) * 18);
        ctx.globalAlpha = 1 - e;
        img(this.bufA, 0, -H * 0.6 * e);
        ctx.globalAlpha = 1;
      } else if (kind === 'lock') {
        ctx.globalAlpha = 1 - e;
        img(this.bufA, 0, e * 18);
        ctx.globalAlpha = e;
        img(this.bufB, 0, -H * 0.6 * (1 - e));
        ctx.globalAlpha = 1;
      }
    } else {
      this.hits = [];
      this.drawScreen(this.screen, ctx);
    }
    this.drawStatus(ctx, this.trans ? this.trans.to : this.screen);
    if (this.modal) this.drawLowBattery(ctx);
    if (this.padOn && !this.trans && !this.locked) this.drawFocus(ctx);
    else this.focusR = null;
    this.texture.needsUpdate = true;
  }

  // -------------------------------------------------------------
  // Controle: escolher item com o direcional/analógico (sem cursor)
  // -------------------------------------------------------------

  // barra do topo e barra de baixo não rolam
  padFixed(h) {
    return !this.scrollKey() || h.y + h.h <= CONTENT_Y + 1 || h.y >= H - NAV - 1;
  }

  // item à vista (pelo menos 40%)
  padVisible(h) {
    if (this.padFixed(h)) return true;
    const vis = Math.min(h.y + h.h, H - NAV) - Math.max(h.y, CONTENT_Y);
    return vis >= Math.min(h.h * 0.4, 16);
  }

  padHits() {
    return this.hits.filter((h) => this.padVisible(h));
  }

  padRemember(h) {
    const key = this.scrollKey();
    const fixed = this.padFixed(h);
    const cx = h.x + h.w / 2, cy = h.y + h.h / 2;
    this.padSel = { screen: this.screen, fixed, x: cx, y: fixed ? cy : cy + (this.scroll[key] || 0) };
    this.padMem[this.screen] = this.padSel;
  }

  // item escolhido agora (acha de novo depois de rolar ou trocar de tela)
  padCurrent() {
    if (this.trans) return null;
    const list = this.padHits();
    if (!list.length) return null;
    const sel = this.padMem[this.screen];
    let h = null;
    let px = 0, py = 0;
    if (sel && sel.screen === this.screen) {
      px = sel.x;
      py = sel.fixed ? sel.y : sel.y - (this.scroll[this.scrollKey()] || 0);
      // pode estar fora da tela (acabou de ser escolhido): a rolagem automática traz
      h = this.hits.find((o) => px >= o.x && px < o.x + o.w && py >= o.y && py < o.y + o.h) || null;
      // rolou com o analógico direito: a seleção vem junto para o que está à vista
      if (h && this.padLoose && !this.padVisible(h)) h = null;
      if (!h) {
        // saiu da tela rolando: o mais perto de onde estava
        let bd = Infinity;
        for (const o of list) {
          const d = Math.hypot(o.x + o.w / 2 - px, (o.y + o.h / 2 - py) * 1.5);
          if (d < bd) { bd = d; h = o; }
        }
      }
    } else {
      // tela nova: começa no primeiro item do conteúdo (a notificação, o avatar, a foto...)
      const content = list.filter((o) => !this.padFixed(o) || !this.scrollKey());
      const pool = content.length ? content : list;
      h = pool.reduce((a, o) => (o.y + o.x * 0.3 < a.y + a.x * 0.3 ? o : a), pool[0]);
    }
    if (h) this.padRemember(h);
    return h;
  }

  // dx, dy: -1, 0 ou 1 (dy = 1 para baixo)
  padNav(dx, dy) {
    if (this.dead || this.locked || this.trans) return;
    this.padLoose = false;
    const cur = this.padCurrent();
    if (!cur) return;
    const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2;
    // indo para cima/baixo numa tela que rola: o conteúdo vem antes das barras fixas
    // (assim dá para descer o feed inteiro só com o direcional; a barra de baixo fica para o fim)
    const key = this.scrollKey();
    const scrollable = dy !== 0 && key;
    const pool = this.hits.filter((o) => this.padVisible(o) || (scrollable && !this.padFixed(o)));
    const pick = (onlyContent) => {
      let best = null, bs = Infinity;
      for (const o of pool) {
        if (o === cur || (onlyContent && this.padFixed(o))) continue;
        // distância até a borda mais perto do item (itens grandes e pequenos lado a lado)
        const ox = clamp(cx, o.x, o.x + o.w), oy = clamp(cy, o.y, o.y + o.h);
        const vx = (o.x + o.w / 2) - cx, vy = (o.y + o.h / 2) - cy;
        const along = vx * dx + vy * dy;
        if (along <= 2) continue;
        const ex = ox - cx, ey = oy - cy;
        const near = Math.max(1, ex * dx + ey * dy);
        const perp = Math.abs(dx ? ey : ex);
        const score = near + perp * 2.2;
        if (score < bs) {
          bs = score;
          best = o;
        }
      }
      return best;
    };
    const best = (scrollable && pick(true)) || pick(false);
    if (best) {
      this.padRemember(best);
      this.onEvent('focus');
    } else if (dy && this.scrollKey()) {
      this.wheel(dy * 60); // nada nessa direção: rola um pouco
    } else {
      this.onEvent('focus-edge');
    }
  }

  // A: toca no item escolhido (dois A rápidos = toque duplo, curte)
  padPress() {
    if (this.dead || this.locked) return;
    if (this.modal) return this.tap(66, 159); // botão OK do aviso de bateria
    const h = this.padCurrent();
    if (!h) return;
    const x = h.x + h.w / 2;
    const y = clamp(h.y + h.h / 2, CONTENT_Y + 2, H - 2);
    this.pointerDown(x, y);
    this.pointerUp(x, y);
  }

  // Anel de foco: contorno arredondado com brilho, desliza de um item para o outro
  drawFocus(ctx) {
    if (this.modal || this.dead) return;
    const h = this.padCurrent();
    this.hoverHit = h?.id || null;
    if (!h) return;
    const dt = this.dt || 1 / 60;
    if (!this.focusR) this.focusR = { x: h.x, y: h.y, w: h.w, h: h.h };
    const r = this.focusR;
    const k = 1 - Math.exp(-22 * dt);
    r.x += (h.x - r.x) * k;
    r.y += (h.y - r.y) * k;
    r.w += (h.w - r.w) * k;
    r.h += (h.h - r.h) * k;
    const p = (Math.sin(this.time * 5) + 1) / 2; // respira
    const g = 1.1 + p * 0.5;
    const x = r.x - g, y = r.y - g, w = r.w + g * 2, hh = r.h + g * 2;
    const rad = Math.min(6, w / 4, hh / 4);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, hh, rad);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.shadowColor = 'rgba(160, 200, 255, 0.95)';
    ctx.shadowBlur = 10 + p * 6;
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  }

  drawScreen(name, ctx) {
    ctx.imageSmoothingEnabled = true;
    if (name === 'lock') this.drawLock(ctx);
    else if (name === 'profile') this.drawProfile(ctx);
    else if (name === 'post') this.drawPost(ctx);
    else if (name === 'me') this.drawMe(ctx);
  }

  // Barra de status (hora, ilha, sinal, bateria 12%)
  drawStatus(ctx, screen) {
    if (screen !== 'lock') {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, STATUS);
    }
    txt(ctx, '23:47', 10, 2.4, { size: 8.4, weight: 600, color: C.text });
    rrect(ctx, 50, 1.6, 32, 8, 4, '#000000'); // ilha
    for (let i = 0; i < 4; i++) rrect(ctx, 96 + i * 2.5, 8.6 - (i + 1) * 1.45, 1.7, (i + 1) * 1.45, 0.5, C.text);
    ctx.save();
    ctx.strokeStyle = 'rgba(241, 241, 246, 0.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.roundRect(108.6, 3.3, 12.6, 6, 1.9);
    ctx.stroke();
    ctx.restore();
    rrect(ctx, 121.8, 5.2, 0.9, 2.2, 0.45, 'rgba(241, 241, 246, 0.5)');
    const lvl = clamp(this.battery / 100);
    rrect(ctx, 109.7, 4.4, Math.max(1.4, 10.4 * lvl), 3.8, 1.1, this.battery <= 20 ? '#ff453a' : C.text);
  }

  // --- Aviso de bateria fraca (alerta de sistema) ---
  drawLowBattery(ctx) {
    const t = this.modal.t;
    const k = ease.outBack(clamp(t / 0.3));
    ctx.fillStyle = `rgba(0,0,0,${0.5 * clamp(t / 0.2)})`;
    ctx.fillRect(0, 0, W, H);
    const y = lerp(140, 104, k);
    ctx.save();
    ctx.globalAlpha = clamp(t / 0.15);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 30;
    rrect(ctx, 18, y, 96, 66, 9, 'rgba(46, 44, 56, 0.97)');
    ctx.shadowBlur = 0;
    // pilha vazia
    ctx.strokeStyle = '#ff453a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(57.5, y + 8, 15, 7.2, 2);
    ctx.stroke();
    rrect(ctx, 73.2, y + 10.3, 1, 2.6, 0.5, '#ff453a');
    if (Math.floor(this.time * 3) % 2 === 0) rrect(ctx, 59, y + 9.5, 1.6, 4.2, 0.6, '#ff453a');
    txt(ctx, 'Bateria Fraca', W / 2, y + 20, { size: 9.2, weight: 700, color: C.text, align: 'center' });
    txt(ctx, '1% de carga restante.', W / 2, y + 31.5, { font: 'tiny', color: '#c8c6d4', align: 'center' });
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(18, y + 46, 96, 0.4);
    txt(ctx, 'OK', W / 2, y + 51, { size: 10, weight: 600, color: '#0a84ff', align: 'center' });
    ctx.restore();
  }

  // --- Celular desligado ---
  drawDead(ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    const t = this.deadT;
    // a tela "pisca" e apaga, depois aparece a bateria vazia duas vezes
    if (t < 0.25 && Math.floor(t * 40) % 2 === 0) {
      ctx.fillStyle = '#2a2836';
      ctx.fillRect(0, 0, W, H);
    }
    if (t > 0.5 && t < 2.3 && Math.floor((t - 0.5) * 2.2) % 2 === 0) {
      ctx.save();
      ctx.strokeStyle = '#d9d6e2';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(45, 125, 38, 20, 4);
      ctx.stroke();
      rrect(ctx, 84.2, 131, 2.4, 8, 1.2, '#d9d6e2');
      rrect(ctx, 48.4, 128.4, 3.4, 13.2, 1.2, '#ff3b30');
      ctx.restore();
    }
    // depois que apaga de vez: o rosto dela aparece no reflexo do vidro preto
    const k = clamp((t - 2.5) / 1.8);
    if (k > 0) {
      const r = this.reflection;
      const breathe = Math.sin(t * 1.3) * 0.8; // a mão dela respira, o reflexo mexe junto
      const dx = (W - r.width) / 2 + Math.sin(t * 0.7) * 1.2;
      const dy = 34 + breathe;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = ease.inOutSine(k) * 0.6;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(r, dx, dy);
      // segundo reflexo, deslocado (a camada do vidro): bem fraquinho
      ctx.globalAlpha = ease.inOutSine(k) * 0.07;
      ctx.drawImage(r, dx + 2, dy + 1);
      ctx.restore();
    }
    // brilho do vidro: uma faixa diagonal que passa devagar
    if (t > 0.3) {
      const a = clamp((t - 0.3) / 1.2) * 0.07;
      const sx = ((t * 9) % (W + H)) - H * 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const band = (x0, w, al) => {
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 + w, 0);
        ctx.lineTo(x0 + w + H * 0.45, H);
        ctx.lineTo(x0 + H * 0.45, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(170, 190, 255, ${al})`;
        ctx.fill();
      };
      band(sx, 18, a);
      band(sx + 24, 5, a * 0.5);
      ctx.restore();
    }
  }

  // --- Tela de bloqueio ---
  drawLock(ctx) {
    photo(ctx, this.wall, 0, 0, W, H); // papel de parede (foto)
    txt(ctx, 'sexta-feira, 6 de novembro', W / 2, 21, { size: 8.6, weight: 600, align: 'center', color: 'rgba(240, 236, 255, 0.82)' });
    txt(ctx, '23:47', W / 2, 28, { size: 32, weight: 700, align: 'center', color: '#f6f3ff' });

    const e = ease.outBack(clamp(this.notifK));
    if (this.notifK > 0.01) {
      const y = lerp(78, 94, e);
      ctx.save();
      ctx.globalAlpha = clamp(this.notifK * 1.4);
      const hover = this.hoverHit === 'notif';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 16;
      rrect(ctx, 6, y, 120, 38, 9, hover ? 'rgba(74, 66, 110, 0.94)' : 'rgba(48, 42, 78, 0.86)');
      ctx.shadowBlur = 0;
      // ícone do app
      const g = ctx.createLinearGradient(11, y + 14, 20, y + 5);
      g.addColorStop(0, '#feda75');
      g.addColorStop(0.35, '#fa7e1e');
      g.addColorStop(0.65, '#d62976');
      g.addColorStop(1, '#962fbf');
      rrect(ctx, 11, y + 5, 9, 9, 2.6, g);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.roundRect(12.9, y + 6.9, 5.2, 5.2, 1.5);
      ctx.moveTo(16.7, y + 9.5);
      ctx.arc(15.5, y + 9.5, 1.2, 0, Math.PI * 2);
      ctx.stroke();
      txt(ctx, 'PIXGRAM', 23.5, y + 6.3, { font: 'tiny', weight: 600, color: 'rgba(235, 232, 250, 0.72)' });
      txt(ctx, 'agora', 120, y + 6.3, { font: 'tiny', color: 'rgba(235, 232, 250, 0.6)', align: 'right' });
      txt(ctx, PROFILE.user, 12, y + 17, { font: 'tiny', weight: 700, color: C.text });
      txt(ctx, 'postou uma nova foto.', 12, y + 26, { font: 'tiny', color: '#e6e2f5' });
      avatar(ctx, this.crushImg, 113, y + 24.5, 7);
      ctx.restore();
      this.hits.push({ id: 'notif', x: 6, y, w: 120, h: 38, action: () => this.unlock() });

      const a = 0.45 + 0.45 * Math.sin(this.time * 3);
      txt(ctx, 'toque na notificação', W / 2, 232, { font: 'tiny', align: 'center', color: '#d9d4f2', alpha: a });
    }

    circle(ctx, 20, 252, 9.5, 'rgba(28, 24, 48, 0.62)');
    circle(ctx, 112, 252, 9.5, 'rgba(28, 24, 48, 0.62)');
    icon(ctx, 'torch', 17, 248, '#eceaf6');
    icon(ctx, 'cam', 108.5, 248, '#eceaf6');
    rrect(ctx, 44, 269.2, 44, 2.2, 1.1, '#eceaf6');
  }

  // --- Perfil ---
  drawProfile(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const s = this.scroll.profile;
    const oy = CONTENT_Y - s;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, CONTENT_Y, W, VIEW_H);
    ctx.clip();

    // Avatar com anel de story (gradiente que gira)
    const g = ctx.createConicGradient(this.time * 0.6, 26, oy + 26);
    g.addColorStop(0, '#feda75');
    g.addColorStop(0.3, '#fa7e1e');
    g.addColorStop(0.55, '#d62976');
    g.addColorStop(0.8, '#962fbf');
    g.addColorStop(1, '#feda75');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(26, oy + 26, 22.2, 0, Math.PI * 2);
    ctx.stroke();
    avatar(ctx, this.crushImg, 26, oy + 26, 19.8);
    this.hits.push({ x: 4, y: oy + 4, w: 44, h: 44, action: () => this.onEvent('story') });

    txt(ctx, PROFILE.name, 54, oy + 7, { size: 12, weight: 700, color: C.text });
    txt(ctx, PROFILE.bio[0], 54, oy + 22, { font: 'tiny', color: '#d4d4e2' });
    txt(ctx, PROFILE.bio[1], 54, oy + 31, { font: 'tiny', color: C.sub });

    const stats = [[PROFILE.posts, 'posts'], [PROFILE.followers, 'seguidores'], [PROFILE.following, 'seguindo']];
    stats.forEach(([n, l], i) => {
      const cx = 22 + i * 44;
      txt(ctx, n, cx, oy + 49, { size: 12, weight: 700, color: C.text, align: 'center' });
      txt(ctx, l, cx, oy + 62, { font: 'tiny', color: C.sub, align: 'center' });
    });

    rrect(ctx, 6, oy + 78, 58, 15, 4.5, C.blue);
    txt(ctx, 'Seguir', 35, oy + 81.6, { font: 'tiny', weight: 600, color: '#ffffff', align: 'center' });
    rrect(ctx, 68, oy + 78, 58, 15, 4.5, C.btn);
    txt(ctx, 'Mensagem', 97, oy + 81.6, { font: 'tiny', weight: 600, color: C.text, align: 'center' });
    this.hits.push({ x: 6, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('follow') });
    this.hits.push({ x: 68, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('message') });

    PROFILE.highlights.forEach((label, i) => {
      const cx = 18 + i * 32;
      ctx.strokeStyle = '#3e3e50';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, oy + 110, 11.2, 0, Math.PI * 2);
      ctx.stroke();
      const img = this.posts[[7, 1, 14, 22][i]].small;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, oy + 110, 9.6, 0, Math.PI * 2);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 10, 10, 24, 24, cx - 9.6, oy + 100.4, 19.2, 19.2);
      ctx.restore();
      txt(ctx, label, cx, oy + 124, { font: 'tiny', color: C.text, align: 'center' });
      this.hits.push({ x: cx - 12, y: oy + 98, w: 24, h: 34, action: () => this.onEvent('highlight', i) });
    });

    icon(ctx, 'grid', 29, oy + 139, C.text);
    icon(ctx, 'tag', 98, oy + 138.5, C.sub);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, oy + 149, W, 0.4);
    ctx.fillStyle = C.text;
    ctx.fillRect(0, oy + 148.6, 66, 0.8);

    const gy = oy + 151;
    this.posts.forEach((p, i) => {
      const x = (i % 3) * 44;
      const y = gy + Math.floor(i / 3) * 44;
      if (y > H || y + 43 < CONTENT_Y) return;
      photo(ctx, p.small, x, y, 43.4, 43.4);
      if (this.liked.has(i)) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        icon(ctx, 'heart', x + 33, y + 2.4, '#ff3040', 0.85);
        ctx.restore();
      }
      this.hits.push({ x, y, w: 43, h: 43, action: () => this.openPost(i) });
    });
    this.profileH = 151 + Math.ceil(this.posts.length / 3) * 44 + 8;
    ctx.restore();

    // Barra do topo
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 5, STATUS + 3.5, C.text);
    txt(ctx, PROFILE.user, 17, STATUS + 2.6, { size: 12, weight: 700, color: C.text });
    icon(ctx, 'dots', 115, STATUS + 7.6, C.text);
    this.hits.push({ x: 0, y: STATUS, w: 18, h: TOP, action: () => this.lock() });

    // Indicador de rolagem
    const max = this.maxScroll('profile');
    if (max > 0 && Math.abs(this.vel) > 20) {
      const bh = Math.max(12, (VIEW_H * VIEW_H) / this.profileH);
      const by = CONTENT_Y + clamp(this.scroll.profile / max) * (VIEW_H - bh);
      rrect(ctx, W - 2.4, by, 1.5, bh, 0.75, 'rgba(170, 170, 190, 0.55)');
    }

    this.drawNav(ctx);
  }

  drawNav(ctx) {
    const y = H - NAV;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, y, W, NAV);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, y, W, 0.4);
    ['home', 'search', 'plus', 'reels'].forEach((n, i) => {
      icon(ctx, n, 8.5 + i * 26, y + 5.5, C.text);
      this.hits.push({ x: 4 + i * 26, y, w: 22, h: NAV, action: () => this.onEvent('nav') });
    });
    // Foto dela: abre o próprio perfil
    const onMe = this.screen === 'me' || this.trans?.to === 'me';
    if (onMe) {
      ctx.strokeStyle = C.text;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(118, y + 10, 7.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    avatar(ctx, this.selfImg, 118, y + 10, 5.8);
    this.hits.push({ id: 'me', x: 106, y, w: 26, h: NAV, action: () => this.openMe() });
  }

  // --- Perfil dela: nada publicado ---
  drawMe(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const oy = CONTENT_Y;

    ctx.strokeStyle = '#3e3e50';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(26, oy + 26, 21.5, 0, Math.PI * 2);
    ctx.stroke();
    avatar(ctx, this.selfImg, 26, oy + 26, 19.8);
    this.hits.push({ x: 4, y: oy + 4, w: 44, h: 44, action: () => this.onEvent('self-avatar') });

    txt(ctx, SELF.name, 54, oy + 7, { size: 12, weight: 700, color: C.text });
    txt(ctx, SELF.bio[0], 54, oy + 22, { font: 'tiny', color: C.sub });

    const stats = [[SELF.posts, 'posts'], [SELF.followers, 'seguidores'], [SELF.following, 'seguindo']];
    stats.forEach(([n, l], i) => {
      const cx = 22 + i * 44;
      txt(ctx, n, cx, oy + 49, { size: 12, weight: 700, color: C.text, align: 'center' });
      txt(ctx, l, cx, oy + 62, { font: 'tiny', color: C.sub, align: 'center' });
    });

    rrect(ctx, 6, oy + 78, 58, 15, 4.5, C.btn);
    txt(ctx, 'Editar perfil', 35, oy + 81.6, { font: 'tiny', weight: 600, color: C.text, align: 'center' });
    rrect(ctx, 68, oy + 78, 58, 15, 4.5, C.btn);
    txt(ctx, 'Compartilhar', 97, oy + 81.6, { font: 'tiny', weight: 600, color: C.text, align: 'center' });
    this.hits.push({ x: 6, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('edit') });
    this.hits.push({ x: 68, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('edit') });

    // Destaque vazio "Novo"
    ctx.strokeStyle = '#3e3e50';
    ctx.beginPath();
    ctx.arc(18, oy + 110, 11.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = C.text;
    ctx.lineWidth = 0.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(14, oy + 110);
    ctx.lineTo(22, oy + 110);
    ctx.moveTo(18, oy + 106);
    ctx.lineTo(18, oy + 114);
    ctx.stroke();
    txt(ctx, 'Novo', 18, oy + 124, { font: 'tiny', color: C.text, align: 'center' });

    icon(ctx, 'grid', 29, oy + 139, C.text);
    icon(ctx, 'tag', 98, oy + 138.5, C.sub);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, oy + 149, W, 0.4);
    ctx.fillStyle = C.text;
    ctx.fillRect(0, oy + 148.6, 66, 0.8);

    // Estado vazio
    const cy = oy + 178;
    ctx.strokeStyle = C.text;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(W / 2, cy, 15, 0, Math.PI * 2);
    ctx.stroke();
    icon(ctx, 'cam', W / 2 - 7, cy - 8, C.text, 2);
    txt(ctx, 'Ainda não há publicações', W / 2, cy + 22, { size: 9, weight: 700, color: C.text, align: 'center' });
    txt(ctx, 'Compartilhe sua primeira foto', W / 2, cy + 34, { font: 'tiny', weight: 600, color: C.blue, align: 'center' });
    this.hits.push({ x: 10, y: cy + 32, w: W - 20, h: 12, action: () => this.onEvent('first-post') });

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 5, STATUS + 3.5, C.text);
    txt(ctx, SELF.user, 17, STATUS + 2.6, { size: 12, weight: 700, color: C.text });
    icon(ctx, 'dots', 115, STATUS + 7.6, C.text);
    this.hits.push({ x: 0, y: STATUS, w: 24, h: TOP, action: () => this.back() });

    this.drawNav(ctx);
  }

  // --- Post aberto ---
  drawPost(ctx) {
    const p = this.post;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    if (!p) return;
    const s = this.scroll.post;
    const oy = CONTENT_Y - s;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, CONTENT_Y, W, H - CONTENT_Y);
    ctx.clip();

    avatar(ctx, this.crushImg, 14, oy + 12, 8);
    txt(ctx, PROFILE.user, 26, oy + 4, { font: 'tiny', weight: 700, color: C.text });
    if (p.loc) txt(ctx, p.loc, 26, oy + 12.5, { font: 'tiny', color: C.sub });
    icon(ctx, 'dots', 115, oy + 11, C.text);

    const iy = oy + 24;
    photo(ctx, p.small, 0, iy, W, 132);
    this.hits.push({ x: 0, y: iy, w: W, h: 132, action: () => {}, double: () => this.doubleTapLike() });

    // Coração grande ao curtir com toque duplo
    if (this.heart) {
      const t = this.heart.t;
      const sc = t < 0.22 ? ease.outBack(t / 0.22) * 5 : t < 0.32 ? lerp(5, 4.2, (t - 0.22) / 0.1) : 4.2;
      const a = t > 0.65 ? clamp(1 - (t - 0.65) / 0.3) : 1;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18;
      icon(ctx, 'heart', 66 - 4.5 * sc, iy + 66 - 4.3 * sc, '#ffffff', sc);
      ctx.restore();
    }

    const ay = iy + 137;
    const liked = this.liked.has(p.index);
    if (liked) {
      const b = 1 + Math.sin(clamp(this.heartBump) * Math.PI) * 0.3;
      icon(ctx, 'heart', 6 + 4.5 * (1 - b), ay + 4.3 * (1 - b), '#ff3040', b);
    } else {
      icon(ctx, 'heartO', 6, ay, C.text);
    }
    icon(ctx, 'comment', 22, ay, C.text);
    icon(ctx, 'share', 38, ay, C.text);
    icon(ctx, 'bookmark', 120, ay, C.text);
    this.hits.push({ x: 2, y: ay - 3, w: 16, h: 14, action: () => this.toggleLike(false) });
    this.hits.push({ x: 18, y: ay - 3, w: 16, h: 14, action: () => this.onEvent('comments') });

    let y = ay + 13;
    const likes = p.likes + (liked ? 1 : 0);
    const likeText = liked ? `curtido por você e outras ${p.likes.toLocaleString('pt-BR')}` : `${likes.toLocaleString('pt-BR')} curtidas`;
    txtWrap(ctx, likeText, 120, { font: 'tiny', weight: 700 }).forEach((line) => {
      txt(ctx, line, 6, y, { font: 'tiny', weight: 700, color: liked ? '#ffd0da' : C.text });
      y += 9;
    });
    if (p.cap) {
      const capLines = txtWrap(ctx, `${PROFILE.user} ${p.cap}`, 120, { font: 'tiny' });
      capLines.forEach((line, i) => {
        if (i === 0) {
          const w = txt(ctx, PROFILE.user, 6, y, { font: 'tiny', weight: 700, color: '#ffffff' });
          txt(ctx, line.slice(PROFILE.user.length + 1), 6 + w + 2, y, { font: 'tiny', color: '#d4d4e2' });
        } else {
          txt(ctx, line, 6, y, { font: 'tiny', color: '#d4d4e2' });
        }
        y += 9;
      });
    }
    txt(ctx, `Ver todos os ${p.comments} comentários`, 6, y + 1, { font: 'tiny', color: C.sub });
    y += 10;
    txt(ctx, p.when, 6, y + 1, { font: 'tiny', color: '#6d6d82', size: 7 });
    y += 14;
    this.postH = y - oy;
    ctx.restore();

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 5, STATUS + 3.5, C.text);
    txt(ctx, 'Publicações', 17, STATUS + 2.6, { size: 12, weight: 700, color: C.text });
    this.hits.push({ x: 0, y: STATUS, w: 24, h: TOP, action: () => this.back() });
  }

  doubleTapLike() {
    this.heart = { t: 0 };
    this.onEvent('double-tap');
    this.toggleLike(true);
  }
}
