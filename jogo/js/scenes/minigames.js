import * as THREE from 'three';
import { damp, clamp, ease, lerp } from '../engine/tween.js';

// ===============================================================
// Minigames das barracas (Capítulo 1)
//
//   baloes   – Estoure o balão: mira que balança (mão nervosa), 5 dardos
//              para cada uma; a Malu joga depois. Quem estourar mais ganha.
//   latas    – Derrube as latas: mira + força (segura e solta no ponto
//              certo), física simples nas latas. 3 bolas cada.
//   pescaria – Pescaria: o anzol segue a mira por cima da piscina; aperta
//              para descer na hora em que a argolinha do patinho passa. 25 s.
//
// Entradas: mouse (mira + clique), teclado (setas mira, Espaço/Enter lança),
// controle (analógico mira, A lança: padMode 'aim').
// ===============================================================

const V3 = THREE.Vector3;
const G = 9.8;
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// ---------------------------------------------------------------
// HUD (HTML por cima): título, retratos com placar, munição, medidor
// de força, tempo, miras e faixas de aviso
// ---------------------------------------------------------------
class Hud {
  constructor() {
    const root = document.createElement('div');
    root.id = 'mg';
    root.innerHTML = `
      <div class="mg-title"><div class="t"></div><div class="s"></div></div>
      <div class="mg-rail">
        <div class="mg-p" data-who="ani"><div class="ring"><img src="assets/sprites/protagonista_retrato.png" alt=""></div><b class="score">0</b><span>ANI</span></div>
        <div class="mg-p" data-who="malu"><div class="ring"><img src="assets/sprites/malu_retrato.png" alt=""></div><b class="score">0</b><span>MALU</span></div>
      </div>
      <div class="mg-ammo"></div>
      <div class="mg-meter"><i class="sweet"></i><i class="fill"></i><em>FORÇA</em></div>
      <div class="mg-timer"><i></i><b></b></div>
      <div class="mg-cross ani"><i></i></div>
      <div class="mg-cross malu"><i></i></div>
      <div class="mg-banner"></div>`;
    document.getElementById('ui').appendChild(root);
    this.root = root;
    this.$ = (q) => root.querySelector(q);
  }
  show(o) {
    this.root.className = 'show ' + (o.kind || '');
    this.$('.mg-title .t').textContent = o.title;
    this.$('.mg-title .s').textContent = o.sub || '';
    this.$('.mg-rail').style.display = o.players === false ? 'none' : '';
    this.score('ani', 0, true);
    this.score('malu', 0, true);
    this.turn(null);
    this.meter(null);
    this.timer(null);
    this.cross('ani', null);
    this.cross('malu', null);
    this.$('.mg-title').classList.remove('out');
  }
  titleOut() {
    this.$('.mg-title').classList.add('out');
  }
  hide() {
    this.root.className = '';
    this.cross('ani', null);
    this.cross('malu', null);
  }
  score(who, n, silent = false) {
    const el = this.$(`.mg-p[data-who="${who}"] .score`);
    el.textContent = n;
    if (!silent) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
  }
  turn(who) {
    for (const el of this.root.querySelectorAll('.mg-p')) el.classList.toggle('on', el.dataset.who === who);
  }
  ammo(icon, total, left) {
    const el = this.$('.mg-ammo');
    if (total == null) {
      el.innerHTML = '';
      return;
    }
    if (el.childElementCount !== total || el.dataset.icon !== icon) {
      el.dataset.icon = icon;
      el.innerHTML = Array.from({ length: total }, () => `<i class="${icon}"></i>`).join('');
    }
    [...el.children].forEach((c, i) => c.classList.toggle('used', i >= left));
  }
  meter(v, sweet = null) {
    const el = this.$('.mg-meter');
    if (v == null) {
      el.classList.remove('on');
      return;
    }
    el.classList.add('on');
    this.$('.mg-meter .fill').style.height = `${Math.round(v * 100)}%`;
    if (sweet) {
      const s = this.$('.mg-meter .sweet');
      s.style.bottom = `${sweet[0] * 100}%`;
      s.style.height = `${(sweet[1] - sweet[0]) * 100}%`;
    }
    el.classList.toggle('good', !!sweet && v >= sweet[0] && v <= sweet[1]);
  }
  timer(k, label = '') {
    const el = this.$('.mg-timer');
    if (k == null) {
      el.classList.remove('on');
      return;
    }
    el.classList.add('on');
    el.classList.toggle('low', k < 0.25);
    this.$('.mg-timer i').style.width = `${clamp(k) * 100}%`;
    this.$('.mg-timer b').textContent = label;
  }
  cross(who, x, y, state = '') {
    const el = this.$(`.mg-cross.${who}`);
    if (x == null) {
      el.classList.remove('show');
      return;
    }
    el.classList.add('show');
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.dataset.state = state;
  }
  crossHit(who) {
    const el = this.$(`.mg-cross.${who} i`);
    el.classList.remove('hit');
    void el.offsetWidth;
    el.classList.add('hit');
  }
  banner(text, cls = '', hold = 1.4) {
    const el = this.$('.mg-banner');
    el.innerHTML = text;
    el.className = 'mg-banner ' + cls;
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.bt);
    if (hold > 0) this.bt = setTimeout(() => el.classList.remove('show'), hold * 1000);
  }
  bannerOut() {
    this.$('.mg-banner').classList.remove('show');
  }
  float(text, x, y, cls = '') {
    const el = document.createElement('div');
    el.className = 'mg-float ' + cls;
    el.innerHTML = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    this.root.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

// ---------------------------------------------------------------
// Base comum
// ---------------------------------------------------------------
class Base {
  constructor(mg) {
    this.mg = mg;
    this.ps = mg.ps;
    this.game = mg.game;
    this.park = mg.ps.park;
    this.hud = mg.hud;
    this.root = mg.ps.scene;
    this.keys = new Set();
    this.held = false;
    this.fx = []; // partículas
    this.t = 0;
  }
  wait(s) {
    return this.ps.tweens.wait(s);
  }
  get cam() {
    return this.ps.camera;
  }
  // ponto da tela (NDC) → pixels
  px(ndcX, ndcY) {
    return [((ndcX + 1) / 2) * window.innerWidth, ((1 - ndcY) / 2) * window.innerHeight];
  }
  toScreen(p) {
    const v = p.clone().project(this.cam);
    return this.px(v.x, v.y);
  }
  // raio da câmera pelo ponto da tela até um plano
  rayPlane(ndcX, ndcY, plane) {
    const rc = new THREE.Raycaster();
    rc.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.cam);
    return rc.ray.intersectPlane(plane, new V3());
  }
  // mira com setas/WASD também (o mouse e o controle já mexem em game.mouse)
  aimKeys(dt) {
    const k = this.keys, m = this.game.mouse;
    const dx = (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) - (k.has('ArrowLeft') || k.has('KeyA') ? 1 : 0);
    const dy = (k.has('ArrowUp') || k.has('KeyW') ? 1 : 0) - (k.has('ArrowDown') || k.has('KeyS') ? 1 : 0);
    const aspect = window.innerHeight / window.innerWidth;
    m.x = clamp(m.x + dx * dt * 1.6 * aspect, -0.98, 0.98);
    m.y = clamp(m.y + dy * dt * 1.6, -0.98, 0.98);
  }
  key(e, down) {
    if (down) this.keys.add(e.code);
    else this.keys.delete(e.code);
    if (['Space', 'Enter'].includes(e.code)) {
      if (down && !e.repeat) this.press();
      if (!down) this.release();
    }
  }
  pointer(e, kind) {
    if (e.button !== 0) return;
    if (kind === 'down') this.press();
    if (kind === 'up') this.release();
  }
  press() {
    this.held = true;
    this.onPress?.();
  }
  release() {
    if (!this.held) return;
    this.held = false;
    this.onRelease?.();
  }
  padMode() {
    return 'aim';
  }
  shake(px = 3) {
    const fx = this.game.renderer.fx;
    fx.shakeX = (Math.random() < 0.5 ? -1 : 1) * px;
    fx.shakeY = (Math.random() < 0.5 ? -1 : 1) * px * 0.6;
  }
  // pedacinhos (borracha, gotas, confete): caem com gravidade
  burst(p, colors, n = 10, { speed = 1.2, up = 0.6, size = 0.018, life = 0.8, flat = true } = {}) {
    for (let i = 0; i < n; i++) {
      const geo = flat ? new THREE.PlaneGeometry(size, size * 0.6) : new THREE.SphereGeometry(size * 0.5, 4, 3);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide, transparent: true }));
      m.position.copy(p);
      this.root.add(m);
      const a = Math.random() * Math.PI * 2;
      this.fx.push({ m, v: new V3(Math.cos(a) * speed * rnd(0.4, 1), Math.sin(a) * speed * rnd(0.4, 1) + up, rnd(0.1, 0.6)), life, max: life, spin: rnd(-14, 14) });
    }
  }
  updateFx(dt) {
    for (const f of [...this.fx]) {
      f.v.y -= G * 0.35 * dt;
      f.m.position.addScaledVector(f.v, dt);
      f.m.rotation.z += f.spin * dt;
      f.m.rotation.x += f.spin * 0.5 * dt;
      f.life -= dt;
      f.m.material.opacity = clamp(f.life / f.max * 1.5);
      if (f.life <= 0) {
        this.root.remove(f.m);
        f.m.geometry.dispose();
        f.m.material.dispose();
        this.fx.splice(this.fx.indexOf(f), 1);
      }
    }
    const fx = this.game.renderer.fx;
    fx.shakeX = damp(fx.shakeX, 0, 22, dt);
    fx.shakeY = damp(fx.shakeY, 0, 22, dt);
  }
  cleanupFx() {
    for (const f of this.fx) this.root.remove(f.m);
    this.fx = [];
    this.game.renderer.fx.shakeX = this.game.renderer.fx.shakeY = 0;
  }
}

// ---------------------------------------------------------------
// 1. Estoure o balão
// ---------------------------------------------------------------
function makeDart(color) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), new THREE.MeshLambertMaterial({ color: '#e8e4f0' }));
  shaft.rotation.x = Math.PI / 2;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.03, 6), new THREE.MeshLambertMaterial({ color: '#9a96a8' }));
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -0.058;
  g.add(shaft, tip);
  const finMat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.25 });
  for (let i = 0; i < 2; i++) {
    const fin = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.035), finMat);
    fin.position.z = 0.045;
    fin.rotation.set(0, Math.PI / 2, i * (Math.PI / 2));
    fin.rotateY(0);
    g.add(fin);
  }
  return g;
}

class Balloons extends Base {
  async run() {
    const W = this.park.balloonWall;
    this.W = W;
    W.paused = true;
    for (const b of W.list) {
      b.visible = true;
      b.scale.set(1, 1.15, 1);
      b.userData.pop = 0;
    }
    this.darts = [];
    this.score = { ani: 0, malu: 0 };
    this.ps.setRig(new V3(W.x, 1.42, -0.32), new V3(W.x, 1.4, W.z), 34, 2.6);
    this.game.mouse.set(0, 0);
    this.hud.show({ kind: 'baloes', title: 'ESTOURE O BALÃO', sub: '5 DARDOS CADA · QUEM ESTOURAR MAIS GANHA' });
    this.hud.ammo('dart', 5, 5);
    await this.wait(1.6);
    this.hud.titleOut();
    // vez da Ani (jogador)
    this.turn = 'ani';
    this.left = 5;
    this.hud.turn('ani');
    this.hud.banner('SUA VEZ', 'ani');
    await new Promise((r) => (this.turnDone = r));
    await this.wait(0.9);
    // vez da Malu
    this.turn = 'malu';
    this.left = 5;
    this.hud.ammo('dart', 5, 5);
    this.hud.turn('malu');
    this.hud.banner('VEZ DA MALU', 'malu');
    await this.wait(1.0);
    await this.maluTurn();
    await this.wait(0.8);
    const { ani, malu } = this.score;
    const res = ani > malu ? 'win' : ani < malu ? 'lose' : 'tie';
    this.game.sfx[res === 'win' ? 'win' : 'shimmer']?.();
    this.hud.turn(null);
    this.hud.banner(`<small>${res === 'win' ? 'VOCÊ GANHOU' : res === 'lose' ? 'A MALU GANHOU' : 'EMPATE'}</small>ANI ${ani} × ${malu} MALU`, 'result ' + res, 2.6);
    await this.wait(2.8);
    return { res, ani, malu };
  }

  cleanup() {
    for (const d of this.darts) this.root.remove(d.mesh);
    this.darts = [];
    this.W.paused = false;
    for (const b of this.W.list) {
      b.visible = true;
      b.scale.set(1, 1.15, 1);
      b.userData.pop = 0;
    }
    this.cleanupFx();
  }

  // mão nervosa: a mira passeia sozinha um pouquinho (respiração + tremor)
  sway(t, k = 1) {
    return [(Math.sin(t * 1.7) * 0.022 + Math.sin(t * 4.3) * 0.006) * k, (Math.cos(t * 1.3) * 0.018 + Math.sin(t * 3.7) * 0.006) * k];
  }

  onPress() {
    if (this.turn !== 'ani' || this.left <= 0 || this.flying) return;
    const [sx, sy] = this.sway(this.t);
    const m = this.game.mouse;
    this.throwDart('ani', m.x + sx, m.y + sy);
  }

  throwDart(who, nx, ny) {
    const W = this.W;
    const target = this.rayPlane(nx, ny, new THREE.Plane(new V3(0, 0, 1), -(W.z + 0.075)));
    if (!target) return;
    this.left--;
    this.hud.ammo('dart', 5, this.left);
    this.game.sfx.dart?.();
    const cam = this.cam;
    const start = cam.localToWorld(new V3(who === 'ani' ? 0.16 : -0.16, -0.2, -0.32));
    const mesh = makeDart(who === 'ani' ? '#5ac0ff' : '#ff6aa8');
    mesh.position.copy(start);
    this.root.add(mesh);
    this.flying = { who, mesh, start, target, t: 0, dur: 0.26 };
  }

  land(f) {
    const W = this.W;
    // acertou algum balão?
    let best = null, bd = 0.085;
    for (const b of W.list) {
      if (!b.visible) continue;
      const d = Math.hypot((b.position.x - f.target.x) * 1, (b.position.y - f.target.y) / 1.15);
      if (d < bd) {
        bd = d;
        best = b;
      }
    }
    f.mesh.position.set(f.target.x, f.target.y, W.z + 0.04); // crava no painel
    this.darts.push({ mesh: f.mesh });
    const [px, py] = this.toScreen(f.target);
    if (best) {
      best.userData.pop = 0.001;
      const col = best.material.color.clone();
      this.burst(best.position.clone().add(new V3(0, 0, 0.04)), [col, col.clone().multiplyScalar(1.3), '#ffffff'], 12, { speed: 1.4, up: 0.3 });
      this.game.sfx.balloonPop?.(1);
      this.shake(4);
      this.score[f.who]++;
      this.hud.score(f.who, this.score[f.who]);
      this.hud.float('+1', px, py, f.who);
      this.hud.crossHit(f.who);
    } else {
      this.game.sfx.thunk?.();
      this.shake(1.5);
      this.hud.float('ERROU', px, py, 'miss');
    }
  }

  async maluTurn() {
    const m = { x: 0, y: -0.2 };
    this.malu = m;
    for (let i = 0; i < 5; i++) {
      const alive = this.W.list.filter((b) => b.visible);
      const tgt = alive[Math.floor(Math.random() * alive.length)];
      const v = tgt.position.clone().project(this.cam);
      const from = { x: m.x, y: m.y };
      const dur = rnd(0.7, 1.1);
      await this.ps.tweens.to({
        duration: dur, ease: ease.inOutCubic,
        onUpdate: (k) => {
          const o = Math.sin(k * Math.PI) * 0.04; // passa um pouco e volta (mão de gente)
          m.x = lerp(from.x, v.x, k) + o;
          m.y = lerp(from.y, v.y, k) + o * 0.5;
        },
      });
      await this.wait(rnd(0.15, 0.4));
      // a Malu é boa, mas não é perfeita
      const err = Math.random() < 0.68 ? 0.012 : 0.07;
      const [sx, sy] = this.sway(this.t + 9, 0.7);
      this.throwDart('malu', m.x + sx + gauss() * err, m.y + sy + gauss() * err);
      await new Promise((r) => (this.landed = r));
      await this.wait(0.35);
    }
    this.malu = null;
  }

  update(dt, t) {
    this.t = t;
    this.aimKeys(dt);
    const W = this.W;
    // balões estourando
    for (const b of W.list) {
      if (b.userData.pop > 0) {
        b.userData.pop += dt;
        const k = b.userData.pop;
        if (k < 0.05) b.scale.setScalar(1 + k * 7);
        else b.visible = false;
      } else if (b.visible) b.scale.set(1, 1.15 + Math.sin(t * 2 + b.position.x * 9) * 0.02, 1);
    }
    // dardo voando
    const f = this.flying;
    if (f) {
      f.t += dt / f.dur;
      const k = clamp(f.t);
      const p = new V3().lerpVectors(f.start, f.target, ease.outQuad(k));
      p.y += Math.sin(k * Math.PI) * 0.05;
      const ahead = new V3().lerpVectors(f.start, f.target, ease.outQuad(Math.min(1, k + 0.05)));
      ahead.y += Math.sin(Math.min(1, k + 0.05) * Math.PI) * 0.05;
      f.mesh.position.copy(p);
      // a ponta (-z) aponta para onde o dardo vai
      f.mesh.lookAt(p.clone().sub(ahead.sub(p)));
      if (f.t >= 1) {
        this.flying = null;
        this.land(f);
        if (f.who === 'ani' && this.left <= 0) this.turnDone?.();
        if (f.who === 'malu') this.landed?.();
      }
    }
    // miras
    if (this.turn === 'ani' && this.left > 0) {
      const [sx, sy] = this.sway(t);
      const m = this.game.mouse;
      this.hud.cross('ani', ...this.px(m.x + sx, m.y + sy), this.flying ? 'wait' : '');
    } else this.hud.cross('ani', null);
    if (this.malu) {
      const [sx, sy] = this.sway(t + 9, 0.7);
      this.hud.cross('malu', ...this.px(this.malu.x + sx, this.malu.y + sy));
    } else this.hud.cross('malu', null);
    this.updateFx(dt);
  }
}

// ---------------------------------------------------------------
// 2. Derrube as latas
// ---------------------------------------------------------------
const CAN_R = 0.062; // raio de colisão da lata (esfera no centro, um pouco generosa)
const BALL_R = 0.035;
const SWEET = [0.46, 0.62];

class Cans extends Base {
  async run() {
    const C = this.park.cans;
    this.C = C;
    this.reset();
    this.score = { ani: 0, malu: 0 };
    this.balls = [];
    this.ps.setRig(new V3(C.x, 1.42, -0.8), new V3(C.x, 1.2, -2.15), 40, 2.6);
    this.game.mouse.set(-0.35, -0.1);
    this.hud.show({ kind: 'latas', title: 'DERRUBE AS LATAS', sub: '3 BOLAS CADA · SEGURE PARA DAR FORÇA, SOLTE NA FAIXA VERDE' });
    this.hud.ammo('ball', 3, 3);
    await this.wait(1.8);
    this.hud.titleOut();
    for (const who of ['ani', 'malu']) {
      this.turn = who;
      this.left = 3;
      this.hud.ammo('ball', 3, 3);
      this.hud.turn(who);
      this.hud.banner(who === 'ani' ? 'SUA VEZ · PIRÂMIDE DA ESQUERDA' : 'VEZ DA MALU', who, 1.5);
      if (who === 'ani') await new Promise((r) => (this.turnDone = r));
      else {
        await this.wait(1.2);
        await this.maluTurn();
      }
      await this.wait(0.8);
    }
    const { ani, malu } = this.score;
    const res = ani > malu ? 'win' : ani < malu ? 'lose' : 'tie';
    this.game.sfx[res === 'win' ? 'win' : 'shimmer']?.();
    this.hud.turn(null);
    this.hud.banner(`<small>${res === 'win' ? 'VOCÊ GANHOU' : res === 'lose' ? 'A MALU GANHOU' : 'EMPATE'}</small>ANI ${ani} × ${malu} MALU`, 'result ' + res, 2.6);
    await this.wait(2.8);
    return { res, ani, malu, standing: this.standing(0) };
  }

  reset() {
    for (const c of this.C.list) {
      c.mesh.position.copy(c.home.pos);
      c.mesh.quaternion.copy(c.home.quat);
      c.v = new V3();
      c.w = new V3();
      c.awake = false;
      c.off = false;
    }
  }

  cleanup() {
    for (const b of this.balls) this.root.remove(b.mesh);
    this.balls = [];
    this.reset();
    this.cleanupFx();
    this.hud.meter(null);
  }

  shelfOf(c) {
    return this.C.shelves[c.p];
  }

  // latas da pirâmide p que caíram da prateleira
  knocked(p) {
    return this.C.list.filter((c) => c.p === p && c.off).length;
  }
  standing(p) {
    return this.C.list.filter((c) => c.p === p && !c.off).length;
  }

  onPress() {
    if (this.turn !== 'ani' || this.left <= 0 || this.busy) return;
    this.charging = { t: 0 };
  }
  onRelease() {
    if (!this.charging) return;
    const pw = this.power;
    this.charging = null;
    this.hud.meter(null);
    const m = this.game.mouse;
    this.throwBall('ani', m.x, m.y, pw);
  }

  throwBall(who, nx, ny, power) {
    const shelf = this.C.shelves[who === 'ani' ? 0 : 1];
    const P = this.rayPlane(nx, ny, new THREE.Plane(new V3(0, 0, 1), -shelf.z));
    if (!P) return;
    this.left--;
    this.busy = true;
    this.hud.ammo('ball', 3, this.left);
    this.game.sfx.throwBall?.();
    const p0 = this.cam.localToWorld(new V3(who === 'ani' ? 0.14 : -0.14, -0.24, -0.3));
    // velocidade ideal para chegar no ponto mirado; a força escala tudo
    const dist = p0.distanceTo(P);
    const T = dist / 6;
    const v = new V3().subVectors(P, p0).divideScalar(T);
    v.y += 0.5 * G * T;
    v.multiplyScalar(lerp(0.66, 1.3, power));
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 10, 8), new THREE.MeshLambertMaterial({ color: '#f1e2c4' }));
    mesh.position.copy(p0);
    this.root.add(mesh);
    const b = { mesh, v, who, life: 0 };
    this.balls.push(b);
    this.cur = b;
    this.before = this.knocked(who === 'ani' ? 0 : 1);
  }

  async maluTurn() {
    for (let i = 0; i < 3; i++) {
      const shelf = this.C.shelves[1];
      const tgt = new V3(shelf.x + gauss() * 0.06, shelf.y + 0.12 + gauss() * 0.05, shelf.z).project(this.cam);
      const m = { x: 0.3, y: -0.4 };
      this.malu = m;
      const from = { ...m };
      await this.ps.tweens.to({ duration: 0.8, ease: ease.inOutCubic, onUpdate: (k) => { m.x = lerp(from.x, tgt.x, k); m.y = lerp(from.y, tgt.y, k); } });
      // carrega a força e solta perto do ponto bom
      const want = Math.random() < 0.7 ? rnd(SWEET[0] + 0.02, SWEET[1] - 0.02) : rnd(0.3, 0.85);
      this.mPower = 0;
      await this.ps.tweens.to({ duration: want * 0.75 + 0.1, onUpdate: (k) => { this.mPower = k * want; this.hud.meter(this.mPower, SWEET); } });
      this.hud.meter(null);
      this.malu = null;
      this.throwBall('malu', tgt.x, tgt.y, want);
      await new Promise((r) => (this.ballDone = r));
    }
  }

  // ---- física (passos pequenos) ----
  step(dt) {
    const list = this.C.list;
    for (const b of this.balls) {
      if (b.dead) continue;
      b.v.y -= G * dt;
      b.mesh.position.addScaledVector(b.v, dt);
      b.life += dt;
      // bola × latas
      for (const c of list) {
        const d = new V3().subVectors(c.mesh.position, b.mesh.position);
        const len = d.length();
        if (len < CAN_R + BALL_R && len > 1e-5) {
          const n = d.divideScalar(len);
          const rel = new V3().subVectors(b.v, c.v).dot(n);
          if (rel > 0) {
            const j = (1.4 * rel) / (1 / 1.5 + 1);
            b.v.addScaledVector(n, -j / 1.5);
            c.v.addScaledVector(n, j);
            c.v.y += j * 0.15;
            c.w.add(new V3().crossVectors(new V3(0, 1, 0), n).multiplyScalar(j * 9 + 4));
            c.awake = true;
            this.game.sfx.can?.(clamp(rel / 4));
            if (rel > 2) this.shake(2.5);
          }
          b.mesh.position.addScaledVector(n, -(CAN_R + BALL_R - len));
        }
      }
      // fundo da barraca
      if (b.mesh.position.z < -2.78) {
        b.mesh.position.z = -2.78;
        b.v.z *= -0.35;
        b.v.x *= 0.6;
        this.game.sfx.thunk?.();
      }
      if (b.mesh.position.y < 0.12) {
        b.mesh.position.y = 0.12;
        b.v.y *= -0.3;
        b.v.x *= 0.7;
        b.v.z *= 0.7;
      }
    }
    // latas acordadas: gravidade, prateleira/chão, giro
    for (const c of list) {
      if (!c.awake) continue;
      c.v.y -= G * dt;
      c.mesh.position.addScaledVector(c.v, dt);
      const w = c.w.length();
      if (w > 1e-4) c.mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(c.w.clone().divideScalar(w), w * dt));
      const s = this.shelfOf(c);
      const onShelf = Math.abs(c.mesh.position.x - s.x) < s.hw && Math.abs(c.mesh.position.z - s.z) < s.hd;
      const floor = onShelf ? s.y + 0.05 : 0.13;
      if (c.mesh.position.y < floor && (onShelf ? c.mesh.position.y > s.y - 0.06 : true)) {
        c.mesh.position.y = floor;
        if (Math.abs(c.v.y) > 0.6) this.game.sfx.can?.(clamp(Math.abs(c.v.y) / 5) * 0.6);
        c.v.y *= -0.25;
        c.v.x *= 0.82;
        c.v.z *= 0.82;
        c.w.multiplyScalar(0.8);
      }
      if (c.mesh.position.z < -2.8) {
        c.mesh.position.z = -2.8;
        c.v.z *= -0.3;
      }
      if (!c.off && (c.mesh.position.y < s.y - 0.02 || !onShelf)) c.off = true;
    }
    // lata × lata (empurra e passa o tranco adiante)
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (!a.awake && !b.awake) continue;
        const d = new V3().subVectors(b.mesh.position, a.mesh.position);
        const len = d.length();
        const min = CAN_R * 1.75;
        if (len < min && len > 1e-5) {
          const n = d.divideScalar(len);
          const rel = new V3().subVectors(a.v, b.v).dot(n);
          if (rel > 0) {
            const jj = (1.3 * rel) / 2;
            a.v.addScaledVector(n, -jj);
            b.v.addScaledVector(n, jj);
            if (jj > 0.15) {
              a.awake = b.awake = true;
              b.w.add(new V3().crossVectors(new V3(0, 1, 0), n).multiplyScalar(jj * 6));
            }
          }
          const push = (min - len) / 2;
          if (a.awake) a.mesh.position.addScaledVector(n, -push);
          if (b.awake) b.mesh.position.addScaledVector(n, push);
        }
      }
    // lata sem apoio embaixo cai
    for (const c of list) {
      if (c.awake) continue;
      const s = this.shelfOf(c);
      if (c.mesh.position.y < s.y + 0.1) continue;
      const support = list.some((o) => o !== c && !o.off && Math.abs(o.mesh.position.y - (c.mesh.position.y - 0.12)) < 0.05 && Math.hypot(o.mesh.position.x - c.mesh.position.x, o.mesh.position.z - c.mesh.position.z) < 0.09);
      if (!support) {
        c.awake = true;
        c.w.set(rnd(-2, 2), 0, rnd(-2, 2));
      }
    }
  }

  update(dt, t) {
    this.t = t;
    this.aimKeys(dt);
    const n = 4;
    for (let i = 0; i < n; i++) this.step(dt / n);
    // força: sobe e desce enquanto segura (ping-pong)
    if (this.charging) {
      this.charging.t += dt;
      const ph = (this.charging.t * 1.25) % 2;
      this.power = ph < 1 ? ph : 2 - ph;
      this.hud.meter(this.power, SWEET);
    }
    // a bola desta jogada terminou?
    const b = this.cur;
    if (b && !b.dead && (b.life > 2.2 || (b.mesh.position.y <= 0.13 && b.v.length() < 0.3))) {
      b.dead = true;
      this.cur = null;
      const p = b.who === 'ani' ? 0 : 1;
      this.ps.tweens.wait(0.6).then(() => {
        const k = this.knocked(p);
        const got = k - this.before;
        this.score[b.who] = k;
        this.hud.score(b.who, k, got <= 0);
        const [x, y] = this.toScreen(new V3(this.C.shelves[p].x, this.C.shelves[p].y + 0.35, this.C.shelves[p].z));
        if (got > 0) this.hud.float(`+${got}`, x, y, b.who);
        else this.hud.float('NADA', x, y, 'miss');
        if (this.standing(p) === 0) this.hud.banner('TODAS!', b.who, 1.2);
        this.busy = false;
        if (b.who === 'ani' && this.left <= 0) this.turnDone?.();
        if (b.who === 'malu') this.ballDone?.();
      });
    }
    // miras
    if (this.turn === 'ani' && this.left > 0 && !this.busy) {
      const m = this.game.mouse;
      this.hud.cross('ani', ...this.px(m.x, m.y), this.charging ? 'charge' : '');
    } else this.hud.cross('ani', null);
    if (this.malu) this.hud.cross('malu', ...this.px(this.malu.x, this.malu.y));
    else this.hud.cross('malu', null);
    this.updateFx(dt);
  }
}

// ---------------------------------------------------------------
// 3. Pescaria
// ---------------------------------------------------------------
const TIME = 25;

class Fishing extends Base {
  async run() {
    const P = this.park.pond;
    this.P = P;
    P.speed = 1.7;
    for (const d of P.ducks.children) d.userData.caught = false;
    this.caught = 0;
    this.time = TIME;
    const c = P.center;
    // de cima, atrás das luzinhas do toldo (nada aceso colado na câmera)
    this.ps.setRig(new V3(c.x, 1.8, c.z + 0.85), new V3(c.x, 0.64, c.z - 0.06), 48, 2.4);
    this.game.mouse.set(0, -0.1);
    this.hud.show({ kind: 'pescaria', title: 'PESCARIA', sub: 'DESÇA O ANZOL QUANDO A ARGOLINHA PASSAR · 25 SEGUNDOS', players: false });
    this.hud.ammo('duck', 0, 0);
    this.buildRod();
    await this.wait(1.8);
    this.hud.titleOut();
    this.hud.banner('VALENDO!', 'ani', 1.0);
    this.playing = true;
    await new Promise((r) => (this.done = r));
    this.playing = false;
    this.hud.timer(null);
    await this.wait(0.8);
    const n = this.caught;
    this.game.sfx[n >= 3 ? 'win' : 'shimmer']?.();
    this.hud.banner(`<small>FIM DE JOGO</small>${n} ${n === 1 ? 'PATINHO' : 'PATINHOS'}`, 'result ' + (n >= 3 ? 'win' : 'tie'), 2.6);
    await this.wait(2.8);
    return { res: n >= 3 ? 'win' : n > 0 ? 'tie' : 'lose', n, nums: this.nums || [] };
  }

  buildRod() {
    const c = this.P.center;
    this.rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.007, 1, 6), new THREE.MeshLambertMaterial({ color: '#6a4426' }));
    this.handle = new V3(c.x + 0.42, 1.32, c.z + 0.72);
    this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]), new THREE.LineBasicMaterial({ color: '#f0f0f0' }));
    this.hook = new THREE.Group();
    const h1 = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.003, 4, 10, Math.PI * 1.3), new THREE.MeshLambertMaterial({ color: '#c9c3d8' }));
    h1.rotation.z = Math.PI * 0.85;
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshLambertMaterial({ color: '#ff4060', emissive: '#801020', emissiveIntensity: 0.4 }));
    bob.position.y = 0.06;
    this.hook.add(h1, bob);
    // círculo na água onde o anzol vai cair (fica verde quando dá para pegar)
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.045, 24), new THREE.MeshBasicMaterial({ color: '#fff4dc', transparent: true, opacity: 0.7, depthWrite: false }));
    this.marker.rotation.x = -Math.PI / 2;
    this.root.add(this.rod, this.line, this.hook, this.marker);
    this.hx = c.x;
    this.hz = c.z + 0.1;
    this.drop = 0; // 0 em cima, 1 na água
    this.carry = null;
  }

  cleanup() {
    this.root.remove(this.rod, this.line, this.hook, this.marker);
    this.P.speed = 1;
    for (const d of this.P.ducks.children) {
      d.userData.caught = false;
      d.visible = true;
      if (d.parent !== this.P.ducks) this.P.ducks.attach(d);
      d.scale.setScalar(1);
    }
    this.cleanupFx();
  }

  ringWorld(d) {
    return d.localToWorld(d.children[3].position.clone());
  }

  // patinho com a argolinha embaixo do anzol
  under() {
    let best = null, bd = 0.055;
    for (const d of this.P.ducks.children) {
      if (d.userData.caught) continue;
      const r = this.ringWorld(d);
      const dd = Math.hypot(r.x - this.hx, r.z - this.hz);
      if (dd < bd) {
        bd = dd;
        best = d;
      }
    }
    return best;
  }

  onPress() {
    if (!this.playing || this.dipping || this.carry) return;
    this.dipping = { t: 0, checked: false };
    this.game.sfx.reel?.();
  }

  update(dt, t) {
    this.t = t;
    this.aimKeys(dt);
    const c = this.P.center;
    // anzol segue a mira no plano da água (preso dentro da piscina)
    const m = this.game.mouse;
    const hit = this.rayPlane(m.x, m.y, new THREE.Plane(new V3(0, 1, 0), -0.72));
    if (hit && !this.dipping && !this.carry) {
      let dx = (hit.x - c.x) / 0.6, dz = (hit.z - c.z) / 0.3;
      const r = Math.hypot(dx, dz);
      if (r > 1) {
        dx /= r;
        dz /= r;
      }
      this.hx = damp(this.hx, c.x + dx * 0.6, 14, dt);
      this.hz = damp(this.hz, c.z + dz * 0.3, 14, dt);
    }
    // descer e subir o anzol
    if (this.dipping) {
      const D = this.dipping;
      D.t += dt;
      this.drop = D.t < 0.16 ? ease.inQuad(D.t / 0.16) : D.t < 0.3 ? 1 : 1 - ease.outCubic((D.t - 0.3) / 0.3);
      if (!D.checked && D.t >= 0.16) {
        D.checked = true;
        const d = this.under();
        if (d) this.catchDuck(d);
        else {
          this.burst(new V3(this.hx, 0.72, this.hz), ['#ffffff', '#9ad8ff'], 6, { speed: 0.4, up: 0.8, size: 0.012, flat: false, life: 0.5 });
          this.game.sfx.splash?.(0.4);
        }
      }
      if (D.t > 0.6) {
        this.dipping = null;
        this.drop = 0;
      }
    }
    const hy = lerp(0.98, 0.735, this.drop);
    if (this.carry) {
      const C = this.carry;
      C.t += dt;
      const k = ease.outCubic(clamp(C.t / 0.7));
      C.duck.position.set(this.hx, lerp(0.72, 1.25, k), this.hz);
      C.duck.rotation.z = Math.sin(C.t * 9) * 0.25 * (1 - k);
      if (C.t > 1.1) {
        C.duck.visible = false;
        this.carry = null;
      }
    }
    this.hook.position.set(this.hx, this.carry ? this.carry.duck.position.y + 0.1 : hy, this.hz);
    // vara: do cabo até a ponta, acima do anzol
    const tip = new V3(this.hx + 0.05, Math.max(1.32, this.hook.position.y + 0.32), this.hz + 0.05);
    const mid = new V3().addVectors(this.handle, tip).multiplyScalar(0.5);
    this.rod.position.copy(mid);
    this.rod.scale.y = this.handle.distanceTo(tip);
    this.rod.quaternion.setFromUnitVectors(new V3(0, 1, 0), new V3().subVectors(tip, this.handle).normalize());
    const lp = this.line.geometry.attributes.position;
    lp.setXYZ(0, tip.x, tip.y, tip.z);
    lp.setXYZ(1, this.hook.position.x, this.hook.position.y + 0.07, this.hook.position.z);
    lp.needsUpdate = true;
    // marcador na água
    const can = !!this.under();
    this.marker.position.set(this.hx, 0.722, this.hz);
    this.marker.material.color.set(can ? '#8ae07a' : '#fff4dc');
    this.marker.scale.setScalar(1 + Math.sin(t * 6) * 0.08 + (can ? 0.25 : 0));
    this.marker.visible = !this.carry;
    // tempo
    if (this.playing) {
      this.time -= dt;
      this.hud.timer(this.time / TIME, `${Math.ceil(Math.max(0, this.time))}s`);
      if (this.time <= 0) this.done?.();
    }
    this.updateFx(dt);
  }

  catchDuck(d) {
    d.userData.caught = true;
    this.root.attach(d);
    this.carry = { duck: d, t: 0 };
    this.caught++;
    (this.nums = this.nums || []).push(d.userData.n);
    this.hud.ammo('duck', this.caught, this.caught);
    this.burst(new V3(this.hx, 0.74, this.hz), ['#ffffff', '#9ad8ff', '#5ac0ff'], 14, { speed: 0.6, up: 1.1, size: 0.014, flat: false, life: 0.7 });
    this.game.sfx.splash?.(1);
    this.game.sfx.pop?.();
    this.shake(2);
    const [x, y] = this.toScreen(new V3(this.hx, 1.3, this.hz));
    this.hud.float(`Nº ${d.userData.n}`, x, y, 'ani big');
  }
}

// ---------------------------------------------------------------
export class Minigames {
  constructor(ps) {
    this.ps = ps;
    this.game = ps.game;
    this.hud = new Hud();
    this.cur = null;
  }
  get active() {
    return !!this.cur;
  }
  // durante o jogo: sem desfoque de perto (o alvo fica nítido) e sem o vendedor na frente
  focusMode(on, x = 0) {
    const fxu = this.ps.fx?.uniforms;
    if (fxu?.uDof) {
      if (on) this.dof = this.dof ?? fxu.uDof.value;
      fxu.uDof.value = on ? 0 : this.dof ?? fxu.uDof.value;
    }
    for (const v of this.ps.park.vendors || []) {
      if (on && Math.abs(v.position.x - x) < 1.2 && v.position.z > -2.6) {
        v.visible = false;
        this.hidden = (this.hidden || []).concat(v);
      }
    }
    // as duas saem de quadro (a câmera fica no lugar delas: é o olhar da Ani)
    for (const sp of [this.ps.ani, this.ps.malu]) {
      sp.mesh.visible = !on;
      sp.shadow.visible = !on;
    }
    this.ps.snacks?.setVisible?.(!on);
    if (!on) {
      for (const v of this.hidden || []) v.visible = true;
      this.hidden = [];
    }
  }
  async play(id) {
    const Game = { baloes: Balloons, latas: Cans, pescaria: Fishing }[id];
    const x = { baloes: 6.9, latas: 10.2, pescaria: -4.3 }[id];
    this.focusMode(true, x);
    this.cur = new Game(this);
    let r;
    try {
      r = await this.cur.run();
    } finally {
      this.cur?.cleanup();
      this.hud.hide();
      this.cur = null;
      this.focusMode(false);
    }
    return r;
  }
  stop() {
    if (!this.cur) return;
    this.cur.cleanup();
    this.hud.hide();
    this.cur = null;
    this.focusMode(false);
  }
  update(dt, t) {
    this.cur?.update(dt, t);
  }
  key(e, down) {
    this.cur?.key(e, down);
  }
  pointer(e, kind) {
    this.cur?.pointer(e, kind);
  }
  padMode() {
    return this.cur ? this.cur.padMode() : null;
  }
}
