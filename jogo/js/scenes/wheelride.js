import * as THREE from 'three';
import { damp, clamp, ease, lerp } from '../engine/tween.js';
import { ANI_SPRITE } from '../chars/ani.js';

// ===============================================================
// Final do Capítulo 1: a volta na roda-gigante.
//
//   1. plano de baixo: a roda inteira acesa, a gôndola delas subindo
//   2. dentro da gôndola: as duas de perfil, frente a frente
//   3. closes alternados no rosto de quem fala (o convite do show de março)
//   4. a roda para lá no alto, a gôndola balança
//   5. plano afastado por trás: as costas delas e a cidade inteira acesa,
//      o céu estrelado; a Malu deita no ombro da Ani (folha cena-final), uma estrela cadente.
//      Silêncio. "CONTINUA".
// ===============================================================

const V3 = THREE.Vector3;
const T = ANI_SPRITE.TEXEL; // mesma escala de pixel das personagens
const FLOOR = -2.2; // chão da cabine (abaixo do pino da roda)
const OFFZ = 1.6; // a cabine pendura na frente da roda (o eixo sai para fora)

// ---------------------------------------------------------------
// Cabine detalhada (origem = pino onde pendura na roda)
// ---------------------------------------------------------------
function makeCabin() {
  const g = new THREE.Group();
  const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const RED = L('#b8202e'), RED_D = L('#7a1420'), GOLD = L('#d9a84a'), CREAM = L('#efe2c6'), IRON = L('#2a2632');
  const add = (geo, mat, x, y, z, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    if (o.s) m.scale.set(...o.s);
    g.add(m);
    return m;
  };
  const W = 1.9, D = 1.4, TOP = -0.42;
  // braço de pendurar: eixo que sai da roda (a cabine fica na frente dos aros)
  add(new THREE.CylinderGeometry(0.07, 0.07, OFFZ + 0.3, 10), IRON, 0, 0, -OFFZ / 2, { rx: Math.PI / 2 });
  add(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 12), GOLD, 0, 0, 0, { rx: Math.PI / 2 });
  for (const sx of [-0.28, 0.28]) add(new THREE.BoxGeometry(0.06, 0.42, 0.06), IRON, sx, -0.2, 0);
  add(new THREE.BoxGeometry(0.7, 0.06, 0.08), IRON, 0, -0.06, 0);
  // telhado: chapa, cúpula listrada, frisos dourados e pináculo
  add(new THREE.BoxGeometry(W + 0.16, 0.07, D + 0.16), RED_D, 0, TOP, 0);
  add(new THREE.BoxGeometry(W + 0.2, 0.04, D + 0.2), GOLD, 0, TOP - 0.05, 0);
  for (let i = 0; i < 12; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 6, (i * Math.PI) / 6, Math.PI / 6, 0, Math.PI / 2), i % 2 ? CREAM : RED);
    seg.scale.set(1.12, 0.32, 0.82);
    seg.position.y = TOP + 0.03;
    g.add(seg);
  }
  add(new THREE.SphereGeometry(0.06, 8, 6), GOLD, 0, TOP + 0.32, 0);
  // lampadinhas na beira do telhado
  const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(2.2) });
  const bulb = new THREE.SphereGeometry(0.022, 6, 4);
  for (let i = 0; i < 16; i++) {
    const u = i / 16;
    const p = u < 0.25 ? [-W / 2 + u * 4 * W, D / 2] : u < 0.5 ? [W / 2, D / 2 - (u - 0.25) * 4 * D] : u < 0.75 ? [W / 2 - (u - 0.5) * 4 * W, -D / 2] : [-W / 2, -D / 2 + (u - 0.75) * 4 * D];
    add(bulb, bulbMat, p[0] * 1.04, TOP - 0.09, p[1] * 1.04);
  }
  // colunas dos cantos
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.CylinderGeometry(0.035, 0.035, -FLOOR + TOP, 8), GOLD, sx * (W / 2 - 0.03), (FLOOR + TOP) / 2, sz * (D / 2 - 0.03));
  // paredes de baixo (até a cintura) com painéis
  const SILL = FLOOR + 0.95;
  for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(W, SILL - FLOOR, 0.05), RED, 0, (SILL + FLOOR) / 2, sz * (D / 2));
    for (const px of [-0.5, 0.5]) add(new THREE.BoxGeometry(0.62, 0.5, 0.012), RED_D, px, FLOOR + 0.45, sz * (D / 2 + 0.026));
    add(new THREE.BoxGeometry(W + 0.04, 0.05, 0.12), GOLD, 0, SILL, sz * (D / 2));
    if (sz < 0) for (const mx of [-0.62, 0.62]) add(new THREE.BoxGeometry(0.025, TOP - SILL, 0.025), IRON, mx, (TOP + SILL) / 2, sz * (D / 2));
  }
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.05, SILL - FLOOR, D), RED, sx * (W / 2), (SILL + FLOOR) / 2, 0);
    add(new THREE.BoxGeometry(0.12, 0.05, D + 0.04), GOLD, sx * (W / 2), SILL, 0);
  }
  // chão e vidros (reflexo bem leve)
  add(new THREE.BoxGeometry(W, 0.06, D), IRON, 0, FLOOR - 0.03, 0);
  const glassMat = new THREE.MeshBasicMaterial({ color: '#9ab0ff', transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (const sz of [-1, 1]) add(new THREE.PlaneGeometry(W - 0.08, TOP - SILL - 0.04), glassMat, 0, (TOP + SILL) / 2, sz * (D / 2));
  // luminária do teto (acesa) + luz quente de dentro
  add(new THREE.CylinderGeometry(0.1, 0.14, 0.06, 12), GOLD, 0, TOP - 0.06, 0);
  add(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b0').multiplyScalar(1.8) }), 0, TOP - 0.12, 0);
  const lamp = new THREE.PointLight('#ffcf9a', 2.4, 3.2, 1.6);
  lamp.position.set(0, TOP - 0.2, 0.1);
  g.add(lamp);
  g.userData.lamp = lamp;
  return g;
}

// ---------------------------------------------------------------
// As duas de costas, da cintura para cima: assets/sprites/cena-final.png recortada por
// tools/recortar-cena-costas.py (alinhada pela cintura, com contorno de luz quente à direita e
// frio à esquerda). Um sprite só, porque a Malu deita no ombro da Ani.
//   0–3 olhando a cidade · 4 a Malu vira a cabeça · 6 olha a Ani · 7–10 inclina · 12–16 se aninha
//   no ombro · 18–22 descansando. (5, 11, 17 e 23 vêm cortados na borda da folha: não usar.)
// ---------------------------------------------------------------
const BACK = { url: 'assets/sprites/cena-final-quadros.png', FW: 262, FH: 211, aniPx: 189, aniX: 71 };
// mesma altura da cabeça à cintura que os sprites de costas tinham (109 px da escala das personagens)
const BS = (109 * T) / BACK.aniPx;
const BACK_IDLE = [[0, 0.5], [1, 0.45], [2, 0.5], [1, 0.45]];
const BACK_LEAN = [[4, 0.2], [6, 0.6], [7, 0.3], [8, 0.25], [9, 0.25], [10, 0.3], [12, 0.35], [13, 0.35], [14, 0.35], [15, 0.45], [16, 0.35]];
const BACK_REST = [[18, 0.6], [20, 0.55], [21, 0.6], [22, 0.7], [21, 0.55], [20, 0.55]];

function backDuo() {
  const tex = new THREE.TextureLoader().load(BACK.url);
  tex.magFilter = tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(1 / 6, 1 / 4);
  const mat = new THREE.MeshLambertMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.25, alphaTest: 0.5 });
  const geo = new THREE.PlaneGeometry(BACK.FW * BS, BACK.FH * BS);
  // pivô na cintura da Ani (linha de baixo, 2 px acima da borda), x no meio dela
  geo.translate((BACK.FW / 2 - BACK.aniX) * BS, (BACK.FH * BS) / 2 - 2 * BS, 0);
  const m = new THREE.Mesh(geo, mat);
  m.visible = false;
  return m;
}

// ---------------------------------------------------------------
export class WheelRide {
  constructor(ps) {
    this.ps = ps;
    this.game = ps.game;
    this.W = ps.park.wheel;
    this.active = false;
  }

  build() {
    if (this.cabin) return;
    const gm = this.W.gondolas[0];
    this.gm = gm;
    this.oldKids = [...gm.children];
    this.cabin = makeCabin();
    this.cabin.position.z = OFFZ;
    this.back = backDuo();
    this.cabin.add(this.back);
    // estrela cadente (um risco que atravessa o céu)
    const sg = new THREE.PlaneGeometry(3.2, 0.05);
    sg.translate(-1.6, 0, 0);
    this.star = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.ps.scene.add(this.star);
  }

  attach() {
    this.build();
    for (const k of this.oldKids) k.visible = false;
    this.gm.add(this.cabin);
    this.cabin.visible = true;
    this.active = true;
    this.W.W.speed = 0;
    this.shot = 'side';
    this.backPlay(BACK_IDLE, true);
  }

  // quadros das costas: toca a sequência; loop repete, senão segue para o descanso
  backPlay(seq, loop = false) {
    this.backAnim = { seq, loop, i: 0, t: 0 };
    this.backFrame(seq[0][0]);
  }

  backFrame(f) {
    this.back.material.map.offset.set((f % 6) / 6, 1 - (Math.floor(f / 6) + 1) / 4);
  }

  updateBack(dt) {
    const a = this.backAnim;
    if (!a) return;
    a.t += dt;
    while (a.t >= a.seq[a.i][1]) {
      a.t -= a.seq[a.i][1];
      a.i++;
      if (a.i >= a.seq.length) {
        if (a.loop) a.i = 0;
        else return this.backPlay(BACK_REST, true); // deitada no ombro, respirando
      }
      this.backFrame(a.seq[a.i][0]);
    }
  }

  cleanup() {
    if (!this.cabin) return;
    for (const k of this.oldKids) k.visible = true;
    this.gm.remove(this.cabin);
    this.gm.userData.kick = 0;
    this.W.W.speed = 0.06;
    this.W.W.sway = 1;
    this.active = false;
    this.climb = null;
    this.kick = null;
    this.shoot = null;
    this.cam = null;
    this.star.material.opacity = 0;
    const { ani, malu } = this.ps;
    ani.mesh.visible = malu.mesh.visible = true;
    ani.shadow.visible = malu.shadow.visible = true;
    this.back.visible = false;
    const fxu = this.ps.fx.uniforms;
    if (this.saved) {
      fxu.uFogDen.value = this.saved.fog;
      fxu.uDof.value = this.saved.dof;
      fxu.uFocus.value.copy(this.saved.focus);
      this.saved = null;
    }
    if (this.ps.park.sky) this.ps.park.sky.stars = 0;
  }

  // ponto da cabine no mundo
  at(x, y, z) {
    this.cabin.updateMatrixWorld(true);
    return this.cabin.localToWorld(new V3(x, y, z));
  }

  // ângulo da roda que põe a gôndola 0 na posição a (rad, -PI/2 = embaixo)
  setAngle(a) {
    this.W.W.angle = a - this.gm.userData.a;
  }
  get angle() {
    return this.W.W.angle + this.gm.userData.a;
  }

  // câmera presa na cabine (segue macio enquanto ela sobe)
  frame(pos, look, fov, lambda = 6) {
    this.cam = { pos, look, fov, lambda };
  }

  update(dt, t) {
    if (!this.active) return;
    const { ani, malu, rig } = this.ps;
    const gm = this.gm;
    if (this.climb) {
      const c = this.climb;
      c.t += dt;
      this.setAngle(lerp(c.from, c.to, ease.inOutSine(clamp(c.t / c.dur))));
    }
    // balanço da gôndola quando a roda para (amortecido)
    if (this.kick) {
      this.kick.t += dt;
      gm.userData.kick = Math.sin(this.kick.t * 3.4) * 0.07 * Math.exp(-this.kick.t * 0.9);
    }
    // personagens dentro da cabine
    if (this.shot === 'side') {
      ani.mesh.visible = malu.mesh.visible = true;
      this.back.visible = false;
      const pa = this.at(-0.42, FLOOR, 0.12), pm = this.at(0.42, FLOOR, 0.08);
      ani.mesh.position.copy(pa);
      malu.mesh.position.copy(pm);
      ani.facing = 1;
      malu.facing = -1;
    } else {
      ani.mesh.visible = malu.mesh.visible = false;
      // de costas para a câmera, olhando a cidade; a Malu deita no ombro da Ani (folha cena-final)
      this.back.visible = true;
      this.back.position.set(-0.24, FLOOR + 0.82, -0.17);
      this.updateBack(dt);
    }
    ani.shadow.visible = malu.shadow.visible = false;
    // câmera
    if (this.cam) {
      const c = this.cam;
      const P = typeof c.pos === 'function' ? c.pos() : c.pos;
      const Lk = typeof c.look === 'function' ? c.look() : c.look;
      rig.follow = null;
      rig.pos.copy(P);
      rig.look.copy(Lk);
      rig.fov = c.fov;
      rig.lambda = c.lambda;
    }
    // rebatedor quente na frente de quem está em quadro
    this.ps.key.position.copy(this.at(0, FLOOR + 1.7, 1.2));
    // estrela cadente
    if (this.shoot) {
      const s = this.shoot;
      s.t += dt;
      const k = s.t / 1.1;
      this.star.position.copy(s.from).lerp(s.to, ease.outQuad(clamp(k)));
      this.star.lookAt(this.ps.camera.position);
      this.star.rotation.z = s.ang;
      this.star.material.opacity = Math.sin(clamp(k) * Math.PI) * 0.9;
      if (k >= 1) this.shoot = null;
    }
  }

  // ---------------------------------------------------------------
  // A cena
  // ---------------------------------------------------------------
  async play(ok) {
    const ps = this.ps;
    const { ui, sfx, renderer } = this.game;
    const fx = renderer.fx;
    const tw = ps.tweens;
    const H = this.W.hub, R = this.W.R;
    const fxu = ps.fx.uniforms;
    this.saved = { fog: fxu.uFogDen.value, dof: fxu.uDof.value, focus: fxu.uFocus.value.clone() };

    // corte para preto e prepara a gôndola
    fx.fadeColor.set(0, 0, 0);
    await tw.to({ duration: 0.7, ease: ease.inQuad, onUpdate: (k) => (fx.fade = k) });
    if (!ok()) return;
    ps.snacks.clear();
    this.attach();
    this.setAngle(-Math.PI / 2 + 0.62);
    ps.ani.pose(null);
    ps.malu.pose(null);

    // 1. a roda inteira, de baixo; a gôndola delas sobe
    const wide = () => this.frame(new V3(H.x + 3.8, 0.9, H.z + 12.8), new V3(H.x + 2.6, H.y - 1.8, H.z), 50, 2);
    wide();
    ps.snapCamera();
    this.update(0, 0);
    ps.rig.lambda = 50;
    ps.updateCamera(0.016, 0);
    tw.to({ duration: 1.4, ease: ease.outCubic, onUpdate: (k) => (fx.fade = 1 - k) });
    sfx.creak?.();
    const a0 = this.angle;
    await tw.to({ duration: 6, ease: ease.inOutSine, onUpdate: (k) => this.setAngle(a0 + 0.55 * k) });
    if (!ok()) return;

    // 2. dentro da gôndola: as duas frente a frente (a roda continua subindo devagar)
    const top = Math.PI / 2;
    this.climb = { from: this.angle, to: top - 0.16, t: 0, dur: 40 }; // sobe devagar durante a conversa
    const two = () => this.frame(() => this.at(0.05, FLOOR + 1.28, 2.45), () => this.at(0, FLOOR + 1.22, 0), 38, 7);
    const closeOn = (who, push = 0) => {
      const x = who === 'ani' ? -0.42 : 0.42;
      const side = who === 'ani' ? 0.18 : -0.18;
      this.frame(() => this.at(x + side, FLOOR + 1.36, 1.25 - push), () => this.at(x + side * 0.4, FLOOR + 1.36, 0), 24, 8);
    };
    two();
    ps.camPos.copy(this.at(0.05, FLOOR + 1.28, 2.45));
    ps.camLook.copy(this.at(0, FLOOR + 1.22, 0));
    await tw.wait(2.2);
    if (!ok()) return;
    const S = (who, text, o) => ps.say(who, text, o);
    await S('malu', 'Sabia que daqui de cima dá pra ver o mar?');
    if (!ok()) return;
    await S('ani', 'Daqui dá pra ver o estacionamento.');
    if (!ok()) return;
    closeOn('malu');
    await tw.wait(0.5);
    await S('malu', 'Olha direito. Depois dos prédios. Aquele escuro todo é o mar.');
    if (!ok()) return;
    closeOn('ani');
    await tw.wait(0.9);
    await S('ani', '...Tá. É o mar.');
    if (!ok()) return;
    closeOn('malu');
    await tw.wait(0.6);
    await S('malu', 'Em março tem show daquela banda que você ouve no repeat.');
    if (!ok()) return;
    closeOn('ani');
    await tw.wait(0.4);
    await S('ani', 'Moth?');
    if (!ok()) return;
    closeOn('malu', 0.15);
    await tw.wait(0.3);
    await S('malu', 'Vamos? Eu compro os ingressos. Você não tem desculpa.');
    if (!ok()) return;
    closeOn('ani', 0.32); // aproxima devagar enquanto ela pensa
    ps.rig.lambda = 1.2;
    await tw.wait(1.4);
    await S('ani', '...Vamos.');
    if (!ok()) return;
    two();
    await tw.wait(0.5);
    await S('malu', 'Promete?');
    if (!ok()) return;
    await tw.wait(0.4);
    await S('ani', 'Prometo.');
    if (!ok()) return;
    ui.clearBubbles();

    // 4. a roda chega lá em cima e para; a gôndola balança
    this.climb = null;
    const aNow = this.angle;
    await tw.to({ duration: 3.2, ease: ease.outCubic, onUpdate: (k) => this.setAngle(lerp(aNow, top, k)) });
    if (!ok()) return;
    sfx.creak?.();
    this.kick = { t: 0 };
    this.W.W.sway = 0.4;
    await tw.wait(1.2);
    if (!ok()) return;

    // 5. plano afastado, por trás: as costas delas e a cidade inteira
    fx.fade = 1;
    this.shot = 'back';
    fxu.uFogDen.value = 0.005; // ar limpo lá em cima: a cidade aparece inteira
    fxu.uDof.value = 0.7;
    fxu.uFocus.value.set(40, 140);
    // começa nos ombros delas e afasta devagar até a cabine inteira, pendurada no céu
    const back0 = this.at(0.14, FLOOR + 1.48, 2.25), back1 = this.at(0.7, FLOOR + 1.85, 6.4);
    const look0 = this.at(-0.04, FLOOR + 1.05, -30), look1 = this.at(-0.25, FLOOR + 0.2, -40);
    ps.park.sky.stars = 1; // céu mais estrelado lá em cima
    const cam = { p: back0.clone(), l: look0.clone() };
    this.frame(() => cam.p, () => cam.l, 44, 50);
    ps.camPos.copy(back0);
    ps.camLook.copy(look0);
    fx.exposure = 1.05;
    tw.to({ duration: 1.6, ease: ease.outCubic, onUpdate: (k) => (fx.fade = 1 - k) });
    sfx.shimmer?.();
    // grua lenta (sobe e afasta), contemplativa
    tw.to({ duration: 16, ease: ease.inOutSine, onUpdate: (k) => { cam.p.lerpVectors(back0, back1, k); cam.l.lerpVectors(look0, look1, k); } });
    await tw.wait(3.5);
    if (!ok()) return;
    this.backPlay(BACK_LEAN); // a Malu vira para a Ani e deita no ombro dela (depois fica respirando)
    await tw.wait(2.4);
    if (!ok()) return;
    // estrela cadente
    const sFrom = this.at(-14, FLOOR + 22, -60), sTo = this.at(-4, FLOOR + 17, -60);
    this.shoot = { t: 0, from: sFrom, to: sTo, ang: -0.45 };
    sfx.shimmer?.();
    await tw.wait(2.6);
    if (!ok()) return;
    await ui.sayWait('Eu nunca fui naquele show.', { hold: 3 });
    if (!ok()) return;
    await tw.wait(1.6);
    if (!ok()) return;
    ui.chapter('CONTINUA', '');
    sfx.shimmer?.();
    await tw.wait(4);
  }
}
