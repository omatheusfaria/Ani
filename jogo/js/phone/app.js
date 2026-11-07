import * as THREE from 'three';
import { drawText, measure, wrap, drawBitmap } from '../engine/pixeltext.js';
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

// --- Ícones (1 caractere = 1 pixel) ---
const I = {
  heart: ['.xx...xx.', 'xxxx.xxxx', 'xxxxxxxxx', 'xxxxxxxxx', '.xxxxxxx.', '..xxxxx..', '...xxx...', '....x....'],
  heartO: ['.xx...xx.', 'x..x.x..x', 'x...x...x', 'x.......x', '.x.....x.', '..x...x..', '...x.x...', '....x....'],
  comment: ['.xxxxxxx.', 'x.......x', 'x.......x', 'x.......x', 'x.......x', '.xxxx.xx.', '.....xx..', '....x....'],
  share: ['........x', '......xx.', '....xx.x.', '..xx...x.', 'xx.....x.', '..xx..x..', '....x.x..', '.....xx..', '......x..'],
  bookmark: ['xxxxxxx', 'x.....x', 'x.....x', 'x.....x', 'x.....x', 'x..x..x', 'x.x.x.x', 'xx...xx', 'x.....x'],
  back: ['....x', '...x.', '..x..', '.x...', 'x....', '.x...', '..x..', '...x.', '....x'],
  dots: ['x...x...x'],
  home: ['....x....', '...x.x...', '..x...x..', '.x.....x.', 'xxx...xxx', '.x.....x.', '.x.xxx.x.', '.x.x.x.x.', '.xxx.xxx.'],
  search: ['..xxx....', '.x...x...', 'x.....x..', 'x.....x..', 'x.....x..', '.x...x...', '..xxxxx..', '......xx.', '.......xx'],
  plus: ['xxxxxxxxx', 'x.......x', 'x...x...x', 'x...x...x', 'x.xxxxx.x', 'x...x...x', 'x...x...x', 'x.......x', 'xxxxxxxxx'],
  reels: ['xxxxxxxxx', 'x.......x', 'x..x....x', 'x..xx...x', 'x..xxx..x', 'x..xx...x', 'x..x....x', 'x.......x', 'xxxxxxxxx'],
  grid: ['xx.xx.xx', 'xx.xx.xx', '........', 'xx.xx.xx', 'xx.xx.xx', '........', 'xx.xx.xx', 'xx.xx.xx'],
  tag: ['xxxxxxxxx', 'x.......x', 'x...x...x', 'x..xxx..x', 'x...x...x', 'x..xxx..x', 'x.x...x.x', 'x.......x', 'xxxxxxxxx'],
  cam: ['.xx....', 'xxxxxxx', 'x.....x', 'x.xxx.x', 'x.x.x.x', 'x.xxx.x', 'xxxxxxx'],
  torch: ['xxxxx', 'xxxxx', '.xxx.', '.x.x.', '.xxx.', '.xxx.', '.xxx.'],
};

function icon(ctx, name, x, y, color = C.text, scale = 1) {
  drawBitmap(ctx, I[name], x, y, { x: color }, scale);
}

// --- Formas em pixel art ---
function rrect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  for (let j = 0; j < h; j++) {
    let ins = 0;
    if (j < r) ins = r - Math.round(Math.sqrt(r * r - (r - j - 0.5) ** 2));
    else if (j >= h - r) ins = r - Math.round(Math.sqrt(r * r - (j - (h - r) + 0.5) ** 2));
    ctx.fillRect(Math.round(x + ins), Math.round(y + j), Math.round(w - 2 * ins), 1);
  }
}

function circle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let j = -r; j < r; j++) {
    const w = Math.round(Math.sqrt(r * r - (j + 0.5) ** 2));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1);
  }
}

function circleAvatar(img, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (img) ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size);
  const r = size / 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const inside = (x + 0.5 - r) ** 2 + (y + 0.5 - r) ** 2 <= r * r;
      const i = (y * size + x) * 4 + 3;
      d.data[i] = inside ? 255 : 0;
    }
  ctx.putImageData(d, 0, 0);
  return c;
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
  circle(ctx, 98, 150, 11, '#efe9d0');
  circle(ctx, 102, 147, 9, '#251548');
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
    this.canvas = makeCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.bufA = makeCanvas();
    this.bufB = makeCanvas();
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.onEvent = onEvent || (() => {});
    this.posts = buildPosts({ crush });
    this.wall = wallpaper();
    this.av = {
      crush40: circleAvatar(crush, 40),
      crush16: circleAvatar(crush, 16),
      crush14: circleAvatar(crush, 14),
      self12: circleAvatar(self, 12),
      self40: circleAvatar(self, 40),
    };
    this.reset();
  }

  reset() {
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
    if (!p) return;
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
    if (this.dead) return;
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
    if (this.dead) {
      this.drawDead(ctx);
      this.texture.needsUpdate = true;
      return;
    }
    ctx.imageSmoothingEnabled = false;
    if (this.trans) {
      const { from, to, kind } = this.trans;
      const e = ease.outCubic(clamp(this.trans.k));
      this.hits = [];
      this.drawScreen(from, this.bufA.getContext('2d'));
      this.drawScreen(to, this.bufB.getContext('2d'));
      this.hits = [];
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      if (kind === 'push') {
        ctx.drawImage(this.bufA, Math.round(-W * 0.3 * e), 0);
        ctx.fillStyle = `rgba(0,0,0,${0.5 * e})`;
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(this.bufB, Math.round(W * (1 - e)), 0);
      } else if (kind === 'pop') {
        ctx.drawImage(this.bufB, Math.round(-W * 0.3 * (1 - e)), 0);
        ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - e)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(this.bufA, Math.round(W * e), 0);
      } else if (kind === 'unlock') {
        ctx.globalAlpha = e;
        ctx.drawImage(this.bufB, 0, Math.round((1 - e) * 18));
        ctx.globalAlpha = 1 - e;
        ctx.drawImage(this.bufA, 0, Math.round(-H * 0.6 * e));
        ctx.globalAlpha = 1;
      } else if (kind === 'lock') {
        ctx.globalAlpha = 1 - e;
        ctx.drawImage(this.bufA, 0, Math.round(e * 18));
        ctx.globalAlpha = e;
        ctx.drawImage(this.bufB, 0, Math.round(-H * 0.6 * (1 - e)));
        ctx.globalAlpha = 1;
      }
    } else {
      this.hits = [];
      this.drawScreen(this.screen, ctx);
    }
    this.drawStatus(ctx, this.trans ? this.trans.to : this.screen);
    if (this.modal) this.drawLowBattery(ctx);
    this.texture.needsUpdate = true;
  }

  drawScreen(name, ctx) {
    ctx.imageSmoothingEnabled = false;
    if (name === 'lock') this.drawLock(ctx);
    else if (name === 'profile') this.drawProfile(ctx);
    else if (name === 'post') this.drawPost(ctx);
    else if (name === 'me') this.drawMe(ctx);
  }

  drawStatus(ctx, screen) {
    if (screen !== 'lock') {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, STATUS);
    }
    drawText(ctx, '23:47', 7, 1, { font: 'tiny', size: 8, weight: 700, color: C.text });
    circle(ctx, 66, 6, 3, '#000000');
    ctx.fillStyle = C.text;
    for (let i = 0; i < 4; i++) ctx.fillRect(95 + i * 3, 9 - (i + 2), 2, i + 2);
    // bateria (12%)
    ctx.fillRect(110, 3, 14, 1);
    ctx.fillRect(110, 8, 14, 1);
    ctx.fillRect(110, 3, 1, 6);
    ctx.fillRect(123, 3, 1, 6);
    ctx.fillRect(124, 5, 1, 2);
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(112, 5, this.battery > 5 ? 2 : 1, 2);
  }

  // --- Aviso de bateria fraca ---
  drawLowBattery(ctx) {
    const k = ease.outBack(clamp(this.modal.t / 0.3));
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    const y = Math.round(lerp(140, 104, k));
    rrect(ctx, 12, y, 108, 68, 6, '#24222e');
    // ícone de bateria vazia
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(56, y + 9, 18, 1);
    ctx.fillRect(56, y + 16, 18, 1);
    ctx.fillRect(56, y + 9, 1, 8);
    ctx.fillRect(73, y + 9, 1, 8);
    ctx.fillRect(74, y + 11, 2, 4);
    if (Math.floor(this.time * 3) % 2 === 0) ctx.fillRect(58, y + 11, 2, 4);
    drawText(ctx, 'BATERIA FRACA', W / 2, y + 24, { font: 'tiny', size: 8, color: C.text, align: 'center' });
    drawText(ctx, '1% de carga restante.', W / 2, y + 38, { font: 'tiny', size: 8, color: C.sub, align: 'center' });
    ctx.fillStyle = C.line;
    ctx.fillRect(12, y + 50, 108, 1);
    drawText(ctx, 'OK', W / 2, y + 54, { font: 'tiny', size: 8, color: C.blue, align: 'center' });
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
      const x = 44, y = 124;
      ctx.fillStyle = '#d9d6e2';
      ctx.fillRect(x, y, 40, 2);
      ctx.fillRect(x, y + 20, 40, 2);
      ctx.fillRect(x, y, 2, 22);
      ctx.fillRect(x + 38, y, 2, 22);
      ctx.fillRect(x + 40, y + 6, 4, 10);
      ctx.fillStyle = '#ff3b3b';
      ctx.fillRect(x + 4, y + 4, 3, 14);
    }
  }

  // --- Tela de bloqueio ---
  drawLock(ctx) {
    ctx.drawImage(this.wall, 0, 0);
    drawText(ctx, '23:47', W / 2, 24, { size: 32, weight: 700, align: 'center', color: '#f4f2ff' });
    drawText(ctx, 'sexta-feira, 6 de novembro', W / 2, 66, { font: 'tiny', size: 8, align: 'center', color: '#c9c3e6' });

    const e = ease.outBack(clamp(this.notifK));
    if (this.notifK > 0.01) {
      const y = Math.round(lerp(78, 94, e));
      ctx.globalAlpha = clamp(this.notifK * 1.4);
      const hover = this.hoverHit === 'notif';
      rrect(ctx, 6, y, 120, 38, 5, hover ? '#2f2a4a' : '#221e36');
      rrect(ctx, 12, y + 5, 8, 8, 2, '#ff5f8f');
      ctx.fillStyle = '#ffb35f';
      ctx.fillRect(16, y + 5, 4, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, y + 8, 4, 3);
      drawText(ctx, 'PIXGRAM', 23, y + 4, { font: 'tiny', size: 8, color: '#b9b4d6' });
      drawText(ctx, 'agora', 120, y + 4, { font: 'tiny', size: 8, color: '#b9b4d6', align: 'right' });
      drawText(ctx, PROFILE.user, 12, y + 15, { font: 'tiny', size: 8, weight: 700, color: C.text });
      drawText(ctx, 'postou uma nova foto.', 12, y + 25, { font: 'tiny', size: 8, color: '#dcd8f0' });
      ctx.drawImage(this.av.crush14, 106, y + 17);
      ctx.globalAlpha = 1;
      this.hits.push({ id: 'notif', x: 6, y, w: 120, h: 38, action: () => this.unlock() });

      const a = 0.45 + 0.45 * Math.sin(this.time * 3);
      drawText(ctx, 'toque na notificação', W / 2, 232, { font: 'tiny', size: 8, align: 'center', color: '#d9d4f2', alpha: a });
    }

    circle(ctx, 20, 252, 9, '#2a2440');
    circle(ctx, 112, 252, 9, '#2a2440');
    icon(ctx, 'torch', 18, 249, '#e8e6f5');
    icon(ctx, 'cam', 109, 249, '#e8e6f5');
    ctx.fillStyle = '#e8e6f5';
    ctx.fillRect(46, 270, 40, 2);
  }

  // --- Perfil ---
  drawProfile(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const s = Math.round(this.scroll.profile);
    const oy = CONTENT_Y - s;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, CONTENT_Y, W, VIEW_H);
    ctx.clip();

    // Avatar com anel de story (que gira)
    const ring = ['#ff7a59', '#ff4f8b', '#c64fff'];
    for (let a = 0; a < 48; a++) {
      const ang = (a / 48) * Math.PI * 2 + this.time * 0.6;
      const col = ring[Math.floor(((a / 48) * 3 + this.time) % 3)];
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(26 + Math.cos(ang) * 22.5) - 1, Math.round(oy + 26 + Math.sin(ang) * 22.5) - 1, 2, 2);
    }
    circle(ctx, 26, oy + 26, 21, C.bg);
    ctx.drawImage(this.av.crush40, 6, oy + 6);
    this.hits.push({ x: 4, y: oy + 4, w: 44, h: 44, action: () => this.onEvent('story') });

    drawText(ctx, PROFILE.name, 54, oy + 6, { size: 12, color: C.text });
    drawText(ctx, PROFILE.bio[0], 54, oy + 22, { font: 'tiny', size: 8, color: '#c9c9d9' });
    drawText(ctx, PROFILE.bio[1], 54, oy + 31, { font: 'tiny', size: 8, color: C.sub });

    const stats = [[PROFILE.posts, 'posts'], [PROFILE.followers, 'seguidores'], [PROFILE.following, 'seguindo']];
    stats.forEach(([n, l], i) => {
      const cx = 22 + i * 44;
      drawText(ctx, n, cx, oy + 48, { size: 12, color: C.text, align: 'center' });
      drawText(ctx, l, cx, oy + 64, { font: 'tiny', size: 8, color: C.sub, align: 'center' });
    });

    rrect(ctx, 6, oy + 78, 58, 15, 3, C.blue);
    drawText(ctx, 'Seguir', 35, oy + 81, { font: 'tiny', size: 8, weight: 700, color: '#ffffff', align: 'center' });
    rrect(ctx, 68, oy + 78, 58, 15, 3, C.btn);
    drawText(ctx, 'Mensagem', 97, oy + 81, { font: 'tiny', size: 8, weight: 700, color: C.text, align: 'center' });
    this.hits.push({ x: 6, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('follow') });
    this.hits.push({ x: 68, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('message') });

    PROFILE.highlights.forEach((label, i) => {
      const cx = 18 + i * 32;
      circle(ctx, cx, oy + 110, 11, '#3a3a4a');
      circle(ctx, cx, oy + 110, 10, C.bg);
      const img = this.posts[[7, 1, 14, 22][i]].small;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, oy + 110, 9, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 10, 10, 24, 24, cx - 9, oy + 101, 18, 18);
      ctx.restore();
      drawText(ctx, label, cx, oy + 123, { font: 'tiny', size: 8, color: C.text, align: 'center' });
      this.hits.push({ x: cx - 12, y: oy + 98, w: 24, h: 34, action: () => this.onEvent('highlight', i) });
    });

    icon(ctx, 'grid', 40, oy + 138, C.text);
    icon(ctx, 'tag', 88, oy + 137, C.sub);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, oy + 149, W, 1);
    ctx.fillStyle = C.text;
    ctx.fillRect(0, oy + 149, 66, 1);

    const gy = oy + 151;
    this.posts.forEach((p, i) => {
      const x = (i % 3) * 44;
      const y = gy + Math.floor(i / 3) * 44;
      if (y > H || y + 43 < CONTENT_Y) return;
      ctx.drawImage(p.small, 0, 0, 43, 43, x, y, 43, 43);
      if (this.liked.has(i)) {
        icon(ctx, 'heart', x + 33, y + 2, C.red);
      }
      this.hits.push({ x, y, w: 43, h: 43, action: () => this.openPost(i) });
    });
    this.profileH = 151 + Math.ceil(this.posts.length / 3) * 44 + 8;
    ctx.restore();

    // Barra do topo
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 6, STATUS + 3, C.text);
    drawText(ctx, PROFILE.user, 18, STATUS + 1, { size: 12, color: C.text });
    icon(ctx, 'dots', 116, STATUS + 7, C.text);
    this.hits.push({ x: 0, y: STATUS, w: 18, h: TOP, action: () => this.lock() });

    // Indicador de rolagem
    const max = this.maxScroll('profile');
    if (max > 0 && Math.abs(this.vel) > 20) {
      const bh = Math.max(12, (VIEW_H * VIEW_H) / this.profileH);
      const by = CONTENT_Y + (clamp(this.scroll.profile / max) * (VIEW_H - bh));
      ctx.fillStyle = '#5a5a70';
      ctx.fillRect(W - 2, Math.round(by), 1, Math.round(bh));
    }

    this.drawNav(ctx);
  }

  drawNav(ctx) {
    const y = H - NAV;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, y, W, NAV);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, y, W, 1);
    ['home', 'search', 'plus', 'reels'].forEach((n, i) => {
      icon(ctx, n, 8 + i * 26, y + 5, C.text);
      this.hits.push({ x: 4 + i * 26, y, w: 22, h: NAV, action: () => this.onEvent('nav') });
    });
    // Foto dela: abre o próprio perfil
    const onMe = this.screen === 'me' || this.trans?.to === 'me';
    if (onMe) circle(ctx, 118, y + 10, 8, C.text);
    if (onMe) circle(ctx, 118, y + 10, 7, C.bg);
    ctx.drawImage(this.av.self12, 112, y + 4);
    this.hits.push({ id: 'me', x: 106, y, w: 26, h: NAV, action: () => this.openMe() });
  }

  // --- Perfil dela: nada publicado ---
  drawMe(ctx) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const oy = CONTENT_Y;

    circle(ctx, 26, oy + 26, 21, '#3a3a4a');
    circle(ctx, 26, oy + 26, 20, C.bg);
    ctx.drawImage(this.av.self40, 6, oy + 6);
    this.hits.push({ x: 4, y: oy + 4, w: 44, h: 44, action: () => this.onEvent('self-avatar') });

    drawText(ctx, SELF.name, 54, oy + 6, { size: 12, color: C.text });
    drawText(ctx, SELF.bio[0], 54, oy + 22, { font: 'tiny', size: 8, color: C.sub });

    const stats = [[SELF.posts, 'posts'], [SELF.followers, 'seguidores'], [SELF.following, 'seguindo']];
    stats.forEach(([n, l], i) => {
      const cx = 22 + i * 44;
      drawText(ctx, n, cx, oy + 48, { size: 12, color: C.text, align: 'center' });
      drawText(ctx, l, cx, oy + 64, { font: 'tiny', size: 8, color: C.sub, align: 'center' });
    });

    rrect(ctx, 6, oy + 78, 58, 15, 3, C.btn);
    drawText(ctx, 'Editar perfil', 35, oy + 81, { font: 'tiny', size: 8, color: C.text, align: 'center' });
    rrect(ctx, 68, oy + 78, 58, 15, 3, C.btn);
    drawText(ctx, 'Compartilhar', 97, oy + 81, { font: 'tiny', size: 8, color: C.text, align: 'center' });
    this.hits.push({ x: 6, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('edit') });
    this.hits.push({ x: 68, y: oy + 78, w: 58, h: 15, action: () => this.onEvent('edit') });

    // Destaque vazio "Novo"
    circle(ctx, 18, oy + 110, 11, '#3a3a4a');
    circle(ctx, 18, oy + 110, 10, C.bg);
    ctx.fillStyle = C.text;
    ctx.fillRect(14, oy + 110, 9, 1);
    ctx.fillRect(18, oy + 106, 1, 9);
    drawText(ctx, 'Novo', 18, oy + 123, { font: 'tiny', size: 8, color: C.text, align: 'center' });

    icon(ctx, 'grid', 40, oy + 138, C.text);
    icon(ctx, 'tag', 88, oy + 137, C.sub);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, oy + 149, W, 1);
    ctx.fillStyle = C.text;
    ctx.fillRect(0, oy + 149, 66, 1);

    // Estado vazio
    const cy = oy + 178;
    circle(ctx, W / 2, cy, 15, C.text);
    circle(ctx, W / 2, cy, 14, C.bg);
    drawBitmap(ctx, I.cam, W / 2 - 7, cy - 6, { x: C.text }, 2);
    drawText(ctx, 'Ainda não há publicações', W / 2, cy + 22, { font: 'tiny', size: 8, color: C.text, align: 'center' });
    drawText(ctx, 'Compartilhe sua primeira foto', W / 2, cy + 34, { font: 'tiny', size: 8, color: C.blue, align: 'center' });
    this.hits.push({ x: 10, y: cy + 32, w: W - 20, h: 12, action: () => this.onEvent('first-post') });

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 6, STATUS + 3, C.text);
    drawText(ctx, SELF.user, 18, STATUS + 1, { size: 12, color: C.text });
    icon(ctx, 'dots', 116, STATUS + 7, C.text);
    this.hits.push({ x: 0, y: STATUS, w: 24, h: TOP, action: () => this.back() });

    this.drawNav(ctx);
  }

  // --- Post aberto ---
  drawPost(ctx) {
    const p = this.post;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    if (!p) return;
    const s = Math.round(this.scroll.post);
    const oy = CONTENT_Y - s;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, CONTENT_Y, W, H - CONTENT_Y);
    ctx.clip();

    ctx.drawImage(this.av.crush16, 6, oy + 4);
    drawText(ctx, PROFILE.user, 26, oy + 3, { font: 'tiny', size: 8, weight: 700, color: C.text });
    if (p.loc) drawText(ctx, p.loc, 26, oy + 12, { font: 'tiny', size: 8, color: C.sub });
    icon(ctx, 'dots', 116, oy + 10, C.text);

    const iy = oy + 24;
    ctx.drawImage(p.big, 0, iy);
    this.hits.push({ x: 0, y: iy, w: W, h: 132, action: () => {}, double: () => this.doubleTapLike() });

    // Coração grande ao curtir com toque duplo
    if (this.heart) {
      const t = this.heart.t;
      const sc = t < 0.22 ? ease.outBack(t / 0.22) * 5 : t < 0.32 ? lerp(5, 4, (t - 0.22) / 0.1) : 4;
      const a = t > 0.65 ? clamp(1 - (t - 0.65) / 0.3) : 1;
      const k = Math.max(1, Math.round(sc));
      ctx.globalAlpha = a;
      drawBitmap(ctx, I.heart, 66 - (9 * k) / 2 + 1, iy + 66 - (8 * k) / 2 + 1, { x: '#000000' }, k);
      drawBitmap(ctx, I.heart, 66 - (9 * k) / 2, iy + 66 - (8 * k) / 2, { x: '#ffffff' }, k);
      ctx.globalAlpha = 1;
    }

    const ay = iy + 137;
    const liked = this.liked.has(p.index);
    const bump = this.heartBump > 0 ? 1 : 0;
    if (liked) {
      if (bump) drawBitmap(ctx, I.heart, 5, ay - 1, { x: C.red }, 1), drawBitmap(ctx, I.heart, 6, ay, { x: C.red }, 1);
      else icon(ctx, 'heart', 6, ay, C.red);
    } else {
      icon(ctx, 'heartO', 6, ay, C.text);
    }
    icon(ctx, 'comment', 22, ay, C.text);
    icon(ctx, 'share', 38, ay - 1, C.text);
    icon(ctx, 'bookmark', 119, ay - 1, C.text);
    this.hits.push({ x: 2, y: ay - 3, w: 16, h: 14, action: () => this.toggleLike(false) });
    this.hits.push({ x: 18, y: ay - 3, w: 16, h: 14, action: () => this.onEvent('comments') });

    let y = ay + 13;
    const likes = p.likes + (liked ? 1 : 0);
    const likeText = liked ? `curtido por você e outras ${p.likes.toLocaleString('pt-BR')}` : `${likes.toLocaleString('pt-BR')} curtidas`;
    wrap(likeText, 120, 8, 700, 'tiny').forEach((line) => {
      drawText(ctx, line, 6, y, { font: 'tiny', size: 8, weight: 700, color: liked ? '#ffd0da' : C.text });
      y += 10;
    });
    if (p.cap) {
      const capLines = wrap(`${PROFILE.user} ${p.cap}`, 120, 8, 400, 'tiny');
      capLines.forEach((line, i) => {
        if (i === 0) {
          const w = drawText(ctx, PROFILE.user, 6, y, { font: 'tiny', size: 8, color: '#ffffff' });
          drawText(ctx, line.slice(PROFILE.user.length + 1), 6 + w + 4, y, { font: 'tiny', size: 8, color: '#c9c9d9' });
        } else {
          drawText(ctx, line, 6, y, { font: 'tiny', size: 8, color: '#c9c9d9' });
        }
        y += 10;
      });
    }
    drawText(ctx, `ver todos os ${p.comments} comentários`, 6, y + 1, { font: 'tiny', size: 8, color: C.sub });
    y += 11;
    drawText(ctx, p.when, 6, y + 1, { font: 'tiny', size: 8, color: '#6d6d82' });
    y += 14;
    this.postH = y - oy;
    ctx.restore();

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, STATUS, W, TOP);
    icon(ctx, 'back', 6, STATUS + 3, C.text);
    drawText(ctx, 'Publicações', 18, STATUS + 1, { size: 12, color: C.text });
    this.hits.push({ x: 0, y: STATUS, w: 24, h: TOP, action: () => this.back() });
  }

  doubleTapLike() {
    this.heart = { t: 0 };
    this.onEvent('double-tap');
    this.toggleLike(true);
  }
}
