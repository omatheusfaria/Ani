import * as THREE from 'three';
import { Tweens, ease, damp, lerp, clamp, rand } from '../engine/tween.js';
import { drawText, measure } from '../engine/pixeltext.js';

// ===============================================================
// MENU PRINCIPAL: um olho em 3D que abre, recebe a luz de uma tela
// e mostra as opções do jogo refletidas na íris.
// ===============================================================

const EYE_R = 1;
const IRIS_R = 0.44;
const LID_R = 1.075;

// Ângulos das pálpebras (radianos). Fechado ↔ aberto.
const UPPER_CLOSED = 0.07;
const UPPER_OPEN = -0.35;
const LOWER_CLOSED = -0.03;
const LOWER_OPEN = 0.3;

// Canvas da reflexão do menu (pixels)
const MW = 176;
const MH = 120;
const LINE_H = 17;
const FONT_SIZE = 12;

export const PIXEL_OPTIONS = [
  { rows: 270, label: 'GRANDES' },
  { rows: 360, label: 'MÉDIOS' },
  { rows: 480, label: 'PEQUENOS' },
];
const VOLUME_OPTIONS = [1, 0.5, 0];

// ---------------------------------------------------------------
// Texturas procedurais
// ---------------------------------------------------------------

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function pixelTex(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

function irisTexture() {
  const S = 128;
  const c = makeCanvas(S, S);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(S, S);
  const d = img.data;
  const streak = Array.from({ length: 256 }, () => Math.random());
  const dark = [6, 16, 44];
  const mid = [44, 98, 196];
  const light = [176, 214, 255];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x + 0.5 - S / 2) / (S / 2);
      const dy = (y + 0.5 - S / 2) / (S / 2);
      const r = Math.hypot(dx, dy);
      const i = (y * S + x) * 4;
      const ang = Math.atan2(dy, dx);
      const ai = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 256) % 256;
      const s = streak[ai] * 0.65 + streak[(ai + 1) % 256] * 0.35;
      const fiber = 0.55 + 0.45 * Math.sin(ang * 64 + s * 9 + r * 7);
      let b = 0.28 + 0.55 * s * fiber;
      b += 0.32 * Math.exp(-(((r - 0.52) / 0.07) ** 2)); // anel claro (colarete)
      b *= 0.55 + 0.45 * clamp((r - 0.3) / 0.14); // escurece perto da pupila
      b *= clamp((1.0 - r) / 0.16); // anel escuro na borda
      b += (Math.random() - 0.5) * 0.1;
      b = clamp(b);
      const col = b < 0.5 ? mix3(dark, mid, b * 2) : mix3(mid, light, (b - 0.5) * 2);
      d[i] = col[0];
      d[i + 1] = col[1];
      d[i + 2] = col[2];
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return pixelTex(c);
}

function scleraTexture() {
  const w = 128, h = 64;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const k = y / h;
    const col = mix3([150, 168, 204], [34, 42, 64], Math.pow(k, 0.7));
    ctx.fillStyle = `rgb(${col.map(Math.round).join(',')})`;
    ctx.fillRect(0, y, w, 1);
  }
  // Veias finas
  ctx.fillStyle = 'rgba(150, 60, 90, 0.55)';
  for (let v = 0; v < 26; v++) {
    let x = Math.random() * w;
    let y = h - 1;
    const len = 18 + Math.random() * 26;
    for (let s = 0; s < len; s++) {
      ctx.fillRect(Math.floor(x) % w, Math.floor(y), 1, 1);
      y -= 1;
      x += (Math.random() - 0.5) * 2;
      if (y < h * 0.22) break;
    }
  }
  return pixelTex(c);
}

// Máscara do rosto: opaco em volta e um "furo" amendoado onde fica o olho.
function faceAlpha(widthU, heightU) {
  const w = 280, h = 200;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const W = 1.0, HT = 0.6, HB = 0.43;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const x = ((px + 0.5) / w) * widthU - widthU / 2;
      const y = heightU / 2 - ((py + 0.5) / h) * heightU;
      let inside = false;
      if (Math.abs(x) < W) {
        const t = 1 - (x / W) ** 2;
        const top = HT * Math.pow(t, 0.75) + 0.06 * x;
        const bot = -HB * Math.pow(t, 0.95) + 0.03 * x;
        inside = y < top && y > bot;
      }
      const v = inside ? 0 : 255;
      const i = (py * w + px) * 4;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}

const smax = (a, b, k = 14) => Math.log(Math.exp(k * a) + Math.exp(k * b)) / k;

function faceGeometry(widthU, heightU) {
  const geo = new THREE.PlaneGeometry(widthU, heightU, 140, 100);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y * 1.08);
    const shell = r < 1.12 ? Math.sqrt(1.12 * 1.12 - r * r) : 0;
    const base = 0.36 - 0.025 * (x * x + y * y);
    let z = smax(shell, base);
    z += 0.24 * Math.exp(-((y - 1.18) ** 2) / 0.07) * Math.exp(-(x * x) / 3); // sobrancelha
    z += 0.12 * Math.exp(-((y + 1.15) ** 2) / 0.12) * Math.exp(-(x * x) / 2); // maçã do rosto
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function lashes(count, upper) {
  const pts = [];
  const n = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const up = new THREE.Vector3(0, upper ? 1 : -1, 0);
  for (let i = 0; i < count; i++) {
    const f = i / (count - 1);
    const phi = lerp(-1.2, 1.28, f) + rand(-0.012, 0.012);
    n.set(Math.sin(phi), 0, Math.cos(phi));
    tan.set(Math.cos(phi), 0, -Math.sin(phi));
    const outer = clamp((phi + 0.2) / 1.4);
    const len = (upper ? 0.13 : 0.055) * (0.65 + 0.7 * outer) * rand(0.8, 1.15);
    const p0 = n.clone().multiplyScalar(LID_R + 0.01);
    const p1 = p0.clone().addScaledVector(n, len * 0.6).addScaledVector(up, len * 0.12);
    const p2 = p0.clone()
      .addScaledVector(n, len * 0.8)
      .addScaledVector(up, len * (upper ? 0.75 : 0.45))
      .addScaledVector(tan, len * 0.35 * (phi > 0 ? 1 : -0.4));
    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    const cp = curve.getPoints(5);
    for (let k = 0; k < 2; k++) {
      const off = tan.clone().multiplyScalar(k * 0.005);
      for (let j = 0; j < cp.length - 1; j++) {
        pts.push(cp[j].clone().add(off), cp[j + 1].clone().add(off));
      }
    }
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#030409' }));
}

// ---------------------------------------------------------------
// Cena
// ---------------------------------------------------------------

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.tweens = new Tweens();
    this.raycaster = new THREE.Raycaster();

    const scene = (this.scene = new THREE.Scene());
    scene.background = new THREE.Color('#010207');
    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 50);

    const root = new THREE.Group();
    scene.add(root);

    // Globo ocular (gira para seguir o mouse)
    this.eye = new THREE.Group();
    root.add(this.eye);

    const cut = Math.asin(IRIS_R);
    const scleraGeo = new THREE.SphereGeometry(EYE_R, 64, 40, 0, Math.PI * 2, cut, Math.PI - cut);
    scleraGeo.rotateX(Math.PI / 2);
    this.eye.add(new THREE.Mesh(scleraGeo, new THREE.MeshStandardMaterial({ map: scleraTexture(), roughness: 0.35 })));

    const irisTex = irisTexture();
    this.irisMat = new THREE.MeshStandardMaterial({
      map: irisTex, emissive: '#ffffff', emissiveMap: irisTex, emissiveIntensity: 0, roughness: 0.55,
    });
    const iris = new THREE.Mesh(new THREE.CircleGeometry(IRIS_R + 0.006, 64), this.irisMat);
    iris.position.z = 0.888;
    this.eye.add(iris);

    this.pupil = new THREE.Mesh(new THREE.CircleGeometry(0.17, 40), new THREE.MeshBasicMaterial({ color: '#010104' }));
    this.pupil.position.z = 0.892;
    this.eye.add(this.pupil);

    const corneaGeo = new THREE.SphereGeometry(1.012, 48, 20, 0, Math.PI * 2, 0, 0.62);
    corneaGeo.rotateX(Math.PI / 2);
    this.eye.add(new THREE.Mesh(corneaGeo, new THREE.MeshPhongMaterial({
      color: 0x000000, specular: 0x2a3550, shininess: 240,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    // Pálpebras: duas meias esferas que giram para abrir e fechar
    const lidMat = new THREE.MeshStandardMaterial({ color: '#252d42', roughness: 0.78, side: THREE.DoubleSide });
    const rimMat = new THREE.MeshStandardMaterial({ color: '#3b2f48', roughness: 0.5 });
    const rimGeo = new THREE.TorusGeometry(LID_R, 0.016, 6, 96);
    rimGeo.rotateX(Math.PI / 2);

    this.upper = new THREE.Mesh(new THREE.SphereGeometry(LID_R, 72, 24, 0, Math.PI * 2, 0, Math.PI / 2), lidMat);
    this.upper.add(new THREE.Mesh(rimGeo, rimMat));
    this.upper.add(lashes(84, true));
    root.add(this.upper);

    this.lower = new THREE.Mesh(new THREE.SphereGeometry(LID_R, 72, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lidMat);
    this.lower.add(new THREE.Mesh(rimGeo, rimMat));
    this.lower.add(lashes(46, false));
    root.add(this.lower);

    // Rosto em volta do olho
    const FW = 7, FH = 5;
    this.face = new THREE.Mesh(faceGeometry(FW, FH), new THREE.MeshStandardMaterial({
      color: '#141a28', roughness: 0.95, alphaMap: faceAlpha(FW, FH), alphaTest: 0.5,
    }));
    root.add(this.face);

    // Reflexo do menu sobre a córnea
    this.menuCanvas = makeCanvas(MW, MH);
    this.menuCtx = this.menuCanvas.getContext('2d');
    this.menuTex = pixelTex(this.menuCanvas);
    const refGeo = new THREE.PlaneGeometry(1.1, 0.75, 22, 15);
    const rp = refGeo.attributes.position;
    for (let i = 0; i < rp.count; i++) {
      const x = rp.getX(i), y = rp.getY(i);
      rp.setZ(i, Math.sqrt(Math.max(0, 1.04 * 1.04 - x * x - y * y)));
    }
    this.reflect = new THREE.Mesh(refGeo, new THREE.MeshBasicMaterial({
      map: this.menuTex, color: new THREE.Color(1.5, 1.65, 1.9),
      transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
      depthWrite: false, toneMapped: false,
    }));
    this.reflect.position.y = -0.02;
    root.add(this.reflect);

    // Brilhos de luz na córnea
    const glintMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.3), transparent: true, opacity: 0, toneMapped: false });
    this.glint = new THREE.Mesh(new THREE.PlaneGeometry(0.034, 0.034), glintMat);
    this.glint.position.set(0.13, 0.19, 1.035);
    root.add(this.glint);
    this.glint2 = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.018), glintMat);
    this.glint2.position.set(-0.19, -0.13, 1.03);
    root.add(this.glint2);

    // Luzes
    scene.add(new THREE.HemisphereLight('#2a3d7a', '#000000', 0.22));
    const key = new THREE.DirectionalLight('#9cc4ff', 0.5);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#4b6cff', 0.6);
    rim.position.set(-3, 1.5, -1);
    scene.add(rim);
    this.screenLight = new THREE.PointLight('#a8d4ff', 0, 0, 2);
    this.screenLight.position.set(0.2, 0.1, 3.2);
    scene.add(this.screenLight);

    window.addEventListener('fullscreenchange', () => {
      if (this.menu === 'config') this.refreshLabels();
    });
  }

  // -------------------------------------------------------------
  // Ciclo de vida
  // -------------------------------------------------------------

  enter(opts = {}) {
    const { renderer, ui } = this.game;
    this.tweens.clear();
    this.state = 'dormant';
    this.open = 0;
    this.blink = 0;
    this.light = 0;
    this.menuAlpha = 0;
    this.reveal = 0;
    this.pupilTarget = 1;
    this.pupilCur = 1;
    this.camPush = 0;
    this.flash = 0;
    this.shake = 0;
    this.nextBlink = 0;
    this.nextSaccade = 0;
    this.saccade = new THREE.Vector2();
    this.hovered = -1;
    this.menu = 'main';
    this.items = this.buildItems('main');
    this.sel = 0;
    this.barY = 0;
    this.barW = 0;
    this.switching = false;
    this.hurry = false;
    this.time = 0;

    Object.assign(renderer.fx, { fade: 1, glitch: 0, vignette: 0.55, grain: 0.06, bloom: 0.9, aberration: 0.0022 });
    renderer.fx.fadeColor.set(0, 0, 0);
    renderer.fx.tint.set(1, 1, 1);
    this.tweens.to({ duration: 1.6, ease: ease.inOutSine, onUpdate: (k) => (renderer.fx.fade = 1 - k) });

    ui.title(false);
    ui.hint(null);
    ui.clearSay();
    if (opts.awake) {
      this.wake(true);
    } else {
      setTimeout(() => this.state === 'dormant' && ui.prompt('PRESSIONE QUALQUER TECLA'), 1200);
    }
  }

  exit() {
    this.game.ui.prompt(null);
    this.game.ui.title(false);
    this.game.ui.hint(null);
  }

  // -------------------------------------------------------------
  // Menus
  // -------------------------------------------------------------

  buildItems(name) {
    const { settings } = this.game;
    if (name === 'main') {
      return [
        { id: 'iniciar', label: 'INICIAR' },
        { id: 'continuar', label: 'CONTINUAR', disabled: !this.game.save.get() },
        { id: 'config', label: 'CONFIGURAÇÕES' },
        { id: 'creditos', label: 'CRÉDITOS' },
      ].map((it) => ({ ...it, a: 1, x: 0, ind: 0 }));
    }
    if (name === 'config') {
      const px = PIXEL_OPTIONS.find((p) => p.rows === settings.rows) || PIXEL_OPTIONS[1];
      return [
        { id: 'volume', label: `SOM  ${Math.round(settings.volume * 100)}%` },
        { id: 'pixels', label: `PIXELS  ${px.label}` },
        { id: 'tela', label: `TELA CHEIA  ${document.fullscreenElement ? 'SIM' : 'NÃO'}` },
        { id: 'voltar', label: 'VOLTAR' },
      ].map((it) => ({ ...it, a: 1, x: 0, ind: 0 }));
    }
    return [
      { info: true, label: 'UM JOGO DE' },
      { info: true, label: 'MATHEUS FARIA' },
      { info: true, label: 'PIXEL ART · SPRITE FUSION' },
      { info: true, label: '3D · THREE.JS' },
      { id: 'voltar', label: 'VOLTAR' },
    ].map((it) => ({ ...it, a: 1, x: 0, ind: 0 }));
  }

  refreshLabels() {
    const fresh = this.buildItems(this.menu);
    fresh.forEach((f, i) => {
      if (this.items[i]) this.items[i].label = f.label;
    });
  }

  selectable(i) {
    return this.items[i] && !this.items[i].info;
  }

  async setMenu(name, dir = 1) {
    if (this.switching) return;
    this.switching = true;
    const old = this.items;
    old.forEach((it, i) =>
      this.tweens.to({
        duration: 0.16, delay: i * 0.03, ease: ease.inCubic,
        onUpdate: (k) => { it.a = 1 - k; it.x = -16 * k * dir; },
      })
    );
    await this.tweens.wait(0.16 + old.length * 0.03);
    this.menu = name;
    this.items = this.buildItems(name);
    this.items.forEach((it) => { it.a = 0; it.x = 16 * dir; });
    this.sel = this.items.findIndex((it) => !it.info);
    this.items.forEach((it, i) =>
      this.tweens.to({
        duration: 0.34, delay: i * 0.05, ease: ease.outCubic,
        onUpdate: (k) => { it.a = k; it.x = 16 * dir * (1 - k); },
      })
    );
    this.switching = false;
  }

  move(delta) {
    if (this.state !== 'menu' || this.switching) return;
    let i = this.sel;
    for (let n = 0; n < this.items.length; n++) {
      i = (i + delta + this.items.length) % this.items.length;
      if (this.selectable(i)) break;
    }
    if (i !== this.sel) {
      this.sel = i;
      this.onSelectChange();
    }
  }

  onSelectChange() {
    this.game.sfx.hover();
    this.pupilTarget = 1.1;
    this.tweens.to({ duration: 0.25, onUpdate: (k) => (this.pupilTarget = lerp(1.1, 1, k)) });
  }

  kick(amount = 1) {
    this.flash = 0.22 * amount;
    this.game.renderer.fx.aberration = 0.006 * amount;
    this.pupilTarget = 1 + 0.3 * amount;
    this.tweens.to({ duration: 0.4, onUpdate: (k) => (this.pupilTarget = lerp(1 + 0.3 * amount, 1, k)) });
  }

  activate() {
    if (this.state !== 'menu' || this.switching) return;
    const it = this.items[this.sel];
    if (!it) return;
    const { sfx, settings, renderer } = this.game;

    if (it.disabled) {
      sfx.deny();
      this.shake = 1;
      const original = it.label;
      it.label = 'NENHUM JOGO SALVO';
      setTimeout(() => (it.label = original), 1300);
      return;
    }

    switch (it.id) {
      case 'iniciar':
        this.startGame();
        break;
      case 'continuar':
        this.startGame();
        break;
      case 'config':
        sfx.select();
        this.kick();
        this.setMenu('config', 1);
        break;
      case 'creditos':
        sfx.select();
        this.kick();
        this.setMenu('creditos', 1);
        break;
      case 'voltar':
        sfx.back();
        this.kick(0.6);
        this.setMenu('main', -1);
        break;
      case 'volume': {
        const i = VOLUME_OPTIONS.indexOf(settings.volume);
        settings.volume = VOLUME_OPTIONS[(i + 1) % VOLUME_OPTIONS.length];
        sfx.setVolume(settings.volume);
        this.game.saveSettings();
        sfx.toggle();
        this.kick(0.5);
        this.refreshLabels();
        break;
      }
      case 'pixels': {
        const i = PIXEL_OPTIONS.findIndex((p) => p.rows === settings.rows);
        settings.rows = PIXEL_OPTIONS[(i + 1) % PIXEL_OPTIONS.length].rows;
        renderer.setRows(settings.rows);
        this.game.saveSettings();
        sfx.toggle();
        this.kick(0.5);
        this.refreshLabels();
        break;
      }
      case 'tela': {
        sfx.toggle();
        this.kick(0.5);
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
          break;
        }
        // O navegador só aceita tela cheia logo depois de um clique ou tecla.
        // Botão de controle quase nunca conta: aí avisamos e o próximo clique/tecla entra.
        const fail = () => {
          if (this.menu !== 'config') return;
          sfx.deny();
          this.shake = 1;
          it.label = 'USE F11 OU CLIQUE';
          this.game.wantFullscreen = true;
          clearTimeout(this.fsTimer);
          this.fsTimer = setTimeout(() => this.menu === 'config' && this.refreshLabels(), 2200);
        };
        const req = document.documentElement.requestFullscreen?.();
        if (req?.catch) req.catch(fail);
        else if (!req) fail();
        break;
      }
      default:
        break;
    }
  }

  back() {
    if (this.state === 'menu' && this.menu !== 'main' && !this.switching) {
      this.game.sfx.back();
      this.kick(0.6);
      this.setMenu('main', -1);
    }
  }

  // -------------------------------------------------------------
  // Sequências
  // -------------------------------------------------------------

  async wake(quick = false) {
    if (this.state !== 'dormant') return;
    const { sfx, ui, renderer } = this.game;
    const tw = this.tweens;
    this.state = 'waking';
    ui.prompt(null);
    sfx.ambient('menu');
    sfx.whoosh();

    // A "tela" acende piscando, como um monitor ligando.
    (async () => {
      await tw.wait(quick ? 0.1 : 0.55);
      for (const [v, s] of [[0.5, 0.05], [0.08, 0.07], [0.8, 0.05], [0.25, 0.09], [0.95, 0.04]]) {
        this.light = v;
        await tw.wait(s);
      }
      await tw.to({ duration: 0.8, onUpdate: (k) => (this.light = lerp(0.95, 1, k)) });
    })();

    if (!quick) {
      await tw.to({ duration: 0.9, ease: ease.outCubic, onUpdate: (k) => (this.open = 0.3 * k) });
      await tw.to({ duration: 0.3, ease: ease.inOutSine, onUpdate: (k) => (this.open = 0.3 - 0.16 * k) });
      await tw.wait(0.18);
    }
    await tw.to({ duration: quick ? 0.7 : 1.4, ease: ease.outCubic, onUpdate: (k) => (this.open = lerp(quick ? 0 : 0.14, 1, k)) });

    renderer.fx.aberration = 0.012;
    this.items.forEach((it) => { it.a = 0; it.x = 16; });
    this.items.forEach((it, i) =>
      tw.to({ duration: 0.5, delay: 0.25 + i * 0.07, ease: ease.outCubic, onUpdate: (k) => { it.a = k; it.x = 16 * (1 - k); } })
    );
    tw.to({ duration: 0.9, ease: ease.outCubic, onUpdate: (k) => { this.menuAlpha = k; this.reveal = k; } });
    ui.title(true);
    ui.hint('<b>↑ ↓</b> NAVEGAR &nbsp; <b>ENTER</b> ESCOLHER &nbsp; <b>ESC</b> VOLTAR');
    this.state = 'menu';
    this.nextBlink = this.time + rand(2.5, 5);
  }

  async doBlink() {
    const tw = this.tweens;
    this.game.sfx.blink();
    await tw.to({ duration: 0.08, ease: ease.inQuad, onUpdate: (k) => (this.blink = k) });
    await tw.to({ duration: 0.16, ease: ease.outQuad, onUpdate: (k) => (this.blink = 1 - k) });
  }

  // O olho pisca e, enquanto está fechado, a cena troca direto para o celular.
  async startGame() {
    const { sfx, ui, renderer } = this.game;
    const tw = this.tweens;
    this.state = 'leaving';
    sfx.select();
    this.flash = 0.4;
    ui.title(false);
    ui.hint(null);

    await tw.wait(0.35);
    tw.to({ duration: 0.12, onUpdate: (k) => (this.menuAlpha = 1 - k) });
    sfx.blink();
    await tw.to({ duration: 0.11, ease: ease.inQuad, onUpdate: (k) => (this.blink = k) });
    renderer.fx.fade = 1;
    sfx.stopAmbient(0.4);
    this.game.goTo('quarto');
  }

  // -------------------------------------------------------------
  // Entrada
  // -------------------------------------------------------------

  hitMenu() {
    this.raycaster.setFromCamera(this.game.mouse, this.camera);
    const hit = this.raycaster.intersectObject(this.reflect)[0];
    if (!hit || !hit.uv) return -1;
    const cx = hit.uv.x * MW;
    const cy = (1 - hit.uv.y) * MH;
    const { y0, x0, maxW } = this.layout();
    const row = Math.floor((cy - y0 + 2) / LINE_H);
    if (row < 0 || row >= this.items.length || !this.selectable(row)) return -1;
    if (cx < x0 - 12 || cx > x0 + maxW + 12) return -1;
    return row;
  }

  onPointerMove() {
    if (this.state !== 'menu' || this.switching) return;
    const row = this.hitMenu();
    this.hovered = row;
    this.game.canvas.style.cursor = row >= 0 ? 'pointer' : 'default';
    if (row >= 0 && row !== this.sel) {
      this.sel = row;
      this.onSelectChange();
    }
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    if (this.state === 'dormant') return this.wake();
    if (this.state === 'waking') return (this.hurry = true);
    if (this.state !== 'menu') return;
    const row = this.hitMenu();
    if (row >= 0) {
      this.sel = row;
      this.activate();
    }
  }

  onWheel(e) {
    if (this.state === 'menu') this.move(e.deltaY > 0 ? 1 : -1);
  }

  // Controle (ver engine/gamepad.js): o analógico direito mexe o olho,
  // o esquerdo e o direcional navegam como as setas
  padMode() {
    return 'look-rs';
  }

  onKey(e) {
    if (this.state === 'dormant') return this.wake();
    if (this.state === 'waking') return (this.hurry = true);
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.move(-1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.move(1);
        break;
      case 'Enter':
      case 'Space':
        this.activate();
        break;
      case 'Escape':
      case 'Backspace':
        this.back();
        break;
      default:
        break;
    }
  }

  // -------------------------------------------------------------
  // Desenho do menu na íris
  // -------------------------------------------------------------

  layout() {
    const n = this.items.length;
    const y0 = Math.round((MH - n * LINE_H) / 2) + 2;
    let maxW = 0;
    for (const it of this.items) maxW = Math.max(maxW, measure(it.label, it.info ? 8 : FONT_SIZE));
    const x0 = Math.round((MW - maxW) / 2) + 4;
    return { y0, x0, maxW };
  }

  drawMenu(t, dt) {
    const ctx = this.menuCtx;
    ctx.clearRect(0, 0, MW, MH);
    const { y0, x0 } = this.layout();
    const sel = this.items[this.sel];

    // Barra de seleção
    if (sel && !sel.info) {
      const targetY = y0 + this.sel * LINE_H;
      const targetW = measure(sel.label, FONT_SIZE) + 12;
      if (this.barW === 0) this.barY = targetY;
      this.barY = damp(this.barY, targetY, 20, dt);
      this.barW = damp(this.barW, targetW, 18, dt);
      const shakeX = Math.sin(t * 90) * this.shake * 4;
      const blinkOff = this.flash > 0 && Math.floor(t * 28) % 2 === 0;
      if (!blinkOff) {
        ctx.globalAlpha = sel.a;
        ctx.fillStyle = sel.disabled ? '#6d7fa3' : '#d6e9ff';
        ctx.fillRect(Math.round(x0 - 6 + shakeX), Math.round(this.barY) - 2, Math.round(this.barW), LINE_H - 2);
        // Cursor triangular piscando
        if (Math.floor(t * 2.5) % 2 === 0) {
          const cx = Math.round(x0 - 12 + shakeX);
          const cy = Math.round(this.barY) + 2;
          ctx.fillRect(cx, cy, 1, 7);
          ctx.fillRect(cx + 1, cy + 1, 1, 5);
          ctx.fillRect(cx + 2, cy + 2, 1, 3);
          ctx.fillRect(cx + 3, cy + 3, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    }

    // Itens
    this.items.forEach((it, i) => {
      const isSel = i === this.sel && !it.info;
      it.ind = damp(it.ind, isSel ? 3 : 0, 18, dt);
      const shakeX = isSel ? Math.sin(t * 90) * this.shake * 4 : 0;
      let color = '#cfe6ff';
      if (it.info) color = i === 1 ? '#eef6ff' : '#86a3cc';
      else if (isSel) color = '#071230';
      else if (it.disabled) color = '#4f6286';
      drawText(ctx, it.label, x0 + it.x + it.ind + shakeX, y0 + i * LINE_H + (it.info ? 2 : 0), {
        size: it.info ? 8 : FONT_SIZE, color, alpha: it.a, weight: it.info && i === 1 ? 700 : 400,
      });
    });

    // Brilho passando por cima do texto
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    const by = ((t * 26) % (MH + 40)) - 20;
    ctx.fillRect(0, Math.round(by), MW, 3);
    // Linhas de varredura
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    for (let y = 1; y < MH; y += 2) ctx.fillRect(0, y, MW, 1);
    ctx.globalCompositeOperation = 'source-over';

    // Revelação de cima para baixo
    if (this.reveal < 1) {
      const ry = Math.floor(MH * this.reveal);
      ctx.clearRect(0, ry, MW, MH - ry);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, ry, MW, 1);
    }

    this.menuTex.needsUpdate = true;
  }

  // -------------------------------------------------------------
  // Atualização por quadro
  // -------------------------------------------------------------

  update(dt, t) {
    this.time = t;
    // Apertar algo durante a abertura acelera a animação
    this.tweens.update(this.state === 'waking' && this.hurry ? dt * 5 : dt);
    const { renderer, mouse } = this.game;

    // Olhar: segue o mouse com pequenos movimentos involuntários (sacadas)
    if (t > this.nextSaccade) {
      this.saccade.set(rand(-0.045, 0.045), rand(-0.03, 0.03));
      this.nextSaccade = t + rand(0.5, 2.2);
    }
    let ty, tx;
    if (this.state === 'dormant') {
      ty = Math.sin(t * 1.3) * 0.18 + Math.sin(t * 3.7) * 0.05; // sonhando (REM)
      tx = Math.sin(t * 0.9) * 0.05;
    } else {
      ty = mouse.x * 0.3 + this.saccade.x;
      tx = -mouse.y * 0.2 + this.saccade.y;
    }
    this.eye.rotation.y = damp(this.eye.rotation.y, ty, 14, dt);
    this.eye.rotation.x = damp(this.eye.rotation.x, tx, 14, dt);

    // Piscadas automáticas
    if (this.state === 'menu' && t > this.nextBlink) {
      this.doBlink();
      this.nextBlink = t + rand(3, 7);
    }

    // Pálpebras
    const lookUp = -this.eye.rotation.x;
    const eff = this.open * (1 - this.blink);
    const tremble = this.state === 'dormant' ? Math.sin(t * 9) * 0.004 + Math.sin(t * 23) * 0.002 : 0;
    this.upper.rotation.x = lerp(UPPER_CLOSED, UPPER_OPEN - lookUp * 0.45, eff) + tremble;
    this.lower.rotation.x = lerp(LOWER_CLOSED, LOWER_OPEN + lookUp * 0.25, eff);

    // Pupila reage à luz e às escolhas
    const target = this.pupilTarget * (1 - this.light * 0.15);
    this.pupilCur = damp(this.pupilCur, target, 9, dt);
    this.pupil.scale.setScalar(this.pupilCur);

    // Luz da "tela"
    const flicker = 1 + (Math.random() - 0.5) * 0.05 * this.light + Math.sin(t * 47) * 0.01;
    this.screenLight.intensity = 9 * this.light * flicker;
    this.screenLight.position.x = 0.2 + Math.sin(t * 0.4) * 0.15;
    this.irisMat.emissiveIntensity = 0.22 * this.light;

    const openVis = clamp((eff - 0.35) / 0.3);
    this.glint.material.opacity = clamp(this.light * 1.3) * openVis;
    this.glint.position.x = 0.13 + Math.sin(t * 0.4) * 0.02;
    this.reflect.material.opacity = this.menuAlpha * (0.92 + 0.08 * Math.sin(t * 3.1)) * openVis;

    // Menu
    this.flash = Math.max(0, this.flash - dt);
    this.shake = Math.max(0, this.shake - dt * 3);
    this.drawMenu(t, dt);

    // Câmera: respiração lenta
    const aspect = renderer.w / renderer.h;
    const camX = aspect > 1.25 ? -0.32 : 0;
    this.camera.position.set(
      camX + Math.sin(t * 0.27) * 0.035,
      -0.03 + Math.sin(t * 0.33) * 0.025,
      4.1 - this.camPush
    );
    this.camera.lookAt(camX * 0.9, -0.03, 0);

    // Efeitos de tela voltam ao normal aos poucos
    renderer.fx.aberration = damp(renderer.fx.aberration, 0.0022, 4, dt);
    if (this.state !== 'leaving') renderer.fx.glitch = damp(renderer.fx.glitch, 0, 6, dt);
  }
}
