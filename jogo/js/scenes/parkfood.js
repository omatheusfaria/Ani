import * as THREE from 'three';
import { damp, clamp, ease, lerp } from '../engine/tween.js';

// ===============================================================
// Comidas do parque: algodão-doce, pipoca, churros e maçã do amor.
// Quem tem a comida desenhada no sprite (sprite.foods: folhas parada/andando
// comendo) segura e come pelo sprite; o modelinho 3D só voa do balcão.
// Sem folha própria, o modelinho 3D fica na mão e vai acabando a cada
// mordida (sobe até a boca, a pessoa amassa de leve, farelos caem).
// ===============================================================

const V3 = THREE.Vector3;
const lam = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });

// listras para o saquinho/caixa de pipoca
function stripeTex(a, b, n = 6) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? a : b;
    g.fillRect((i * 32) / n, 0, 32 / n + 1, 32);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------
// Modelos (origem = onde a mão segura)
// ---------------------------------------------------------------
export function makeFood(kind) {
  const g = new THREE.Group();
  const parts = []; // pedaços que somem/encolhem a cada mordida
  if (kind === 'algodao' || kind === 'algodao2') {
    // palito de papel + nuvem fofinha (duas cores para a Malu: "os dois")
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), lam('#f6f2ea'));
    stick.position.y = 0.05;
    g.add(stick);
    const cloud = new THREE.Group();
    cloud.position.y = 0.2;
    const cols = kind === 'algodao2' ? ['#ffb3d6', '#9ad8ff'] : ['#ffb3d6', '#ffc6e2'];
    for (let i = 0; i < 11; i++) {
      const col = cols[i % cols.length];
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.045 + Math.random() * 0.03, 8, 6), lam(col, { emissive: col, emissiveIntensity: 0.28 }));
      const a = Math.random() * Math.PI * 2, r = Math.random() * 0.06;
      b.position.set(Math.cos(a) * r, (Math.random() - 0.3) * 0.09, Math.sin(a) * r * 0.6);
      cloud.add(b);
    }
    cloud.scale.set(1, 1.15, 1);
    g.add(cloud);
    parts.push(cloud);
    g.userData.stages = 5;
    g.userData.bite = (k) => {
      cloud.scale.setScalar(Math.max(0.0001, 1 - k * 0.92));
      cloud.scale.y *= 1.15;
    };
  } else if (kind === 'pipoca') {
    const box = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.12, 8, 1, true), new THREE.MeshLambertMaterial({ map: stripeTex('#d02838', '#f6efe0', 8), side: THREE.DoubleSide }));
    box.position.y = 0.06;
    g.add(box);
    const top = new THREE.Group();
    top.position.y = 0.12;
    for (let i = 0; i < 16; i++) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.015 + Math.random() * 0.008, 6, 4), lam(i % 5 ? '#fff1c0' : '#f2c24a', { emissive: '#ffd890', emissiveIntensity: 0.18 }));
      const a = Math.random() * Math.PI * 2, r = Math.random() * 0.045;
      k.position.set(Math.cos(a) * r, Math.random() * 0.04, Math.sin(a) * r);
      top.add(k);
    }
    g.add(top);
    parts.push(top);
    g.userData.stages = 6;
    g.userData.bite = (k) => {
      const n = Math.round(top.children.length * (1 - k));
      top.children.forEach((c, i) => (c.visible = i < n));
      top.position.y = 0.12 - k * 0.035;
    };
  } else if (kind === 'churros') {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.07, 8), lam('#f6efe0'));
    sleeve.position.y = 0.035;
    g.add(sleeve);
    // churro estrelado: cilindro de 8 lados com açúcar (vertex color nas arestas)
    const geo = new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8, 6);
    const col = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const c = new THREE.Color(i % 2 ? '#c8783a' : '#e8a860');
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.translate(0, 0.13, 0);
    const churro = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    churro.position.y = 0.04;
    g.add(churro);
    parts.push(churro);
    g.userData.stages = 5;
    g.userData.bite = (k) => (churro.scale.y = Math.max(0.0001, 1 - k * 0.95));
  } else if (kind === 'maca') {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6), lam('#f1e2c4'));
    stick.position.y = 0.06;
    g.add(stick);
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshPhongMaterial({ color: '#c8102a', emissive: '#3a0008', shininess: 90, specular: '#ffd0d8' }));
    apple.position.y = 0.17;
    apple.scale.y = 0.92;
    g.add(apple);
    parts.push(apple);
    g.userData.stages = 5;
    g.userData.bite = (k) => apple.scale.set(1 - k * 0.6, (1 - k * 0.6) * 0.92, 1 - k * 0.75);
  }
  g.userData.kind = kind;
  g.scale.setScalar(1.35); // um pouco maior que o real: lê melhor no pixel art
  return g;
}

// cor dos farelos de cada comida
const CRUMBS = {
  algodao: ['#ffb3d6', '#ffd6ea'],
  algodao2: ['#ffb3d6', '#9ad8ff'],
  pipoca: ['#fff1c0', '#f2c24a'],
  churros: ['#e8a860', '#fff6e0'],
  maca: ['#ff3a50', '#ffd0d8'],
};

// ---------------------------------------------------------------
// Quem está comendo o quê
// ---------------------------------------------------------------
export class Snacks {
  constructor(scene, sfx) {
    this.scene = scene;
    this.sfx = sfx;
    this.held = new Map(); // actor → { mesh, stage, timer, bite }
    this.crumbs = [];
    const geo = new THREE.BoxGeometry(0.012, 0.012, 0.012);
    this.crumbGeo = geo;
    this.onFinish = null; // (actor, kind) quando acaba
  }

  // começa a segurar (o item já pode ter vindo voando do balcão)
  give(actor, kind, mesh = null) {
    this.drop(actor);
    // comida desenhada no sprite: o modelinho some e o sprite segura e come
    const ok = actor.sprite.carry?.(kind, {
      onChomp: () => {
        this.sfx.munch?.();
        this.crumbsAt(this.mouth(actor), kind, kind === 'pipoca' ? 8 : 5);
      },
      onFinish: () => {
        this.crumbsAt(actor.hand(new V3()), kind, 10);
        this.sfx.pop?.();
        this.held.delete(actor);
        this.onFinish?.(actor, kind);
      },
    });
    if (ok) {
      if (mesh?.parent) mesh.parent.remove(mesh);
      this.held.set(actor, { mesh: null, kind, sprite: true });
      return null;
    }
    const m = mesh || makeFood(kind);
    if (!m.parent) this.scene.add(m);
    this.held.set(actor, { mesh: m, kind, stage: 0, timer: 2.5 + Math.random() * 1.5, bite: null, pos: m.position.clone(), lag: new V3() });
    return m;
  }

  // a Malu rouba um pedaço do algodão-doce da Ani ("e sempre come o meu")
  stealBite(from, by) {
    const h = this.held.get(from);
    if (!h) return false;
    if (h.sprite) {
      // na folha: a comida dela pula um estágio
      const at = this.mouth(from);
      from.sprite.skipBite();
      by.sprite.squash = 0.9;
      this.sfx.munch?.();
      this.crumbsAt(at, h.kind, 6);
      return true;
    }
    h.stage = Math.min(h.stage + 1, h.mesh.userData.stages - 1);
    h.mesh.userData.bite?.(h.stage / h.mesh.userData.stages);
    by.sprite.squash = 0.9;
    this.sfx.munch?.();
    this.crumbsAt(h.mesh.position.clone().add(new V3(0, 0.2, 0)), h.kind, 6);
    return true;
  }

  setVisible(on) {
    for (const h of this.held.values()) if (h.mesh) h.mesh.visible = on;
  }

  holding(actor) {
    return this.held.get(actor)?.kind || null;
  }

  drop(actor) {
    const h = this.held.get(actor);
    if (!h) return;
    if (h.sprite) actor.sprite.carry(null);
    else this.scene.remove(h.mesh);
    this.held.delete(actor);
  }

  clear() {
    for (const a of [...this.held.keys()]) this.drop(a);
    for (const c of this.crumbs) this.scene.remove(c.mesh);
    this.crumbs = [];
  }

  // voa do balcão para a mão (arco), devolve uma promessa
  fly(mesh, from, toFn, dur = 0.55) {
    this.scene.add(mesh);
    mesh.position.copy(from);
    return new Promise((resolve) => {
      this.flying = this.flying || [];
      this.flying.push({ mesh, from: from.clone(), toFn, t: 0, dur, resolve });
    });
  }

  mouth(actor) {
    const s = actor.sprite;
    const tall = s.cfg.TEXEL * 234;
    return new V3(actor.x + s.shown * 0.1, tall * 0.84, actor.z + 0.07);
  }

  crumbsAt(p, kind, n = 7) {
    const cols = CRUMBS[kind] || ['#fff'];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(this.crumbGeo, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true }));
      m.position.copy(p);
      this.scene.add(m);
      this.crumbs.push({ mesh: m, v: new V3((Math.random() - 0.5) * 0.7, Math.random() * 0.6 + 0.1, (Math.random() - 0.3) * 0.4), life: 1.2 + Math.random() * 0.5 });
    }
  }

  // dt; busy = em cena (não morde no meio de uma fala importante)
  update(dt, t, { busy = false } = {}) {
    // voando do balcão
    if (this.flying?.length) {
      for (const f of [...this.flying]) {
        f.t += dt / f.dur;
        const k = ease.inOutCubic(clamp(f.t));
        const to = f.toFn();
        f.mesh.position.lerpVectors(f.from, to, k);
        f.mesh.position.y += Math.sin(k * Math.PI) * 0.28;
        f.mesh.rotation.z = Math.sin(k * Math.PI) * 0.6;
        if (f.t >= 1) {
          f.mesh.rotation.z = 0;
          this.flying.splice(this.flying.indexOf(f), 1);
          f.resolve();
        }
      }
    }
    for (const [actor, h] of this.held) {
      const s = actor.sprite;
      if (h.sprite) {
        s.eatBusy = busy; // em cena ela segura sem morder
        continue;
      }
      // mão: na frente do corpo, um pouco para o lado em que ela olha, balança ao andar
      const hand = actor.hand(new V3());
      const walk = Math.abs(actor.v || Math.hypot(actor.vx || 0, actor.vz || 0));
      hand.y += Math.sin(t * 9) * 0.012 * Math.min(1, walk);
      hand.x += s.shown * 0.02;
      hand.z += 0.03;
      let target = hand;
      let tilt = s.shown * -0.12;
      if (h.bite) {
        // mordida: sobe até a boca, segura, volta
        const b = h.bite;
        b.t += dt;
        const up = 0.32, hold = 0.38, down = 0.4;
        let k;
        if (b.t < up) k = ease.outCubic(b.t / up);
        else if (b.t < up + hold) {
          k = 1;
          if (!b.chomp) {
            b.chomp = true;
            h.stage++;
            h.mesh.userData.bite?.(h.stage / h.mesh.userData.stages);
            s.squash = 0.9;
            this.sfx.munch?.();
            this.crumbsAt(this.mouth(actor), h.kind, h.kind === 'pipoca' ? 9 : 6);
          }
        } else k = 1 - ease.inOutSine(clamp((b.t - up - hold) / down));
        target = hand.clone().lerp(this.mouth(actor), k);
        tilt = lerp(tilt, s.shown * -0.6, k);
        if (b.t > up + hold + down) {
          h.bite = null;
          h.timer = 3 + Math.random() * 2.5;
          if (h.stage >= h.mesh.userData.stages) {
            this.crumbsAt(hand, h.kind, 10);
            this.sfx.pop?.();
            this.drop(actor);
            this.onFinish?.(actor, h.kind);
            continue;
          }
        }
      } else if (!busy) {
        h.timer -= dt;
        if (h.timer <= 0) h.bite = { t: 0 };
      }
      // segue a mão com uma molinha (o item tem peso)
      const m = h.mesh;
      m.position.x = damp(m.position.x, target.x, 18, dt);
      m.position.y = damp(m.position.y, target.y, 18, dt);
      m.position.z = damp(m.position.z, target.z, 18, dt);
      m.rotation.z = damp(m.rotation.z, tilt, 10, dt);
    }
    // farelos: caem e somem no chão
    for (const c of [...this.crumbs]) {
      c.v.y -= 2.6 * dt;
      c.mesh.position.addScaledVector(c.v, dt);
      if (c.mesh.position.y < 0.01) {
        c.mesh.position.y = 0.01;
        c.v.multiplyScalar(0.3);
      }
      c.life -= dt;
      c.mesh.material.opacity = clamp(c.life * 2);
      c.mesh.rotation.x += dt * 8;
      if (c.life <= 0) {
        this.scene.remove(c.mesh);
        c.mesh.material.dispose();
        this.crumbs.splice(this.crumbs.indexOf(c), 1);
      }
    }
  }
}
