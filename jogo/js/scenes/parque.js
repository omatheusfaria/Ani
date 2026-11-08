import * as THREE from 'three';
import { Tweens, ease, damp, lerp, clamp } from '../engine/tween.js';
import { WalkSprite, ANI_SPRITE, MALU_SPRITE } from '../chars/ani.js';
import { makePhotoStrip } from './photostrip.js';
import { buildPark, LANE } from './park.js';
import { createParkFx } from './parkfx.js';
import { Snacks, makeFood } from './parkfood.js';
import { Minigames } from './minigames.js';
import { WheelRide } from './wheelride.js';

// Comprar nas barracas de comida: quem paga, o que cada uma ganha e as falas
const FOOD = {
  algodao: {
    payer: 'malu', ani: 'algodao', malu: 'algodao2', ax: -0.3, mx: 0.55,
    before: [['malu', 'Dois, moço! Um rosa e um... dos dois.']],
    after: [['ani', '"Dos dois" não é uma cor.'], ['malu', 'É a melhor cor.']],
    again: [['malu', 'De novo? Eu pago de novo. Mas a roda continua sua.']],
  },
  pipoca: {
    payer: 'ani', ani: 'pipoca', malu: null, ax: 0.35, mx: 1.3,
    before: [['ani', 'Uma pipoca doce, por favor.']],
    after: [['malu', 'Doce? Quem come pipoca doce?'], ['ani', 'Gente feliz.'], ['malu', '...Me dá uma.']],
    again: [['ani', 'Mais uma. Doce.']],
  },
  churros: {
    payer: 'ani', ani: 'maca', malu: 'churros', ax: -0.25, mx: 0.75,
    before: [['malu', 'Um churros. E ela quer a maçã do amor, que gruda no dente.']],
    after: [['ani', 'A maçã é bonita.'], ['malu', 'Bonita não enche barriga.']],
    again: [['malu', 'Viu? Voltou pro churros.'], ['ani', 'Voltei pra maçã.']],
  },
};

// Minigames: falas antes e depois (por resultado)
const GAMES = {
  baloes: {
    pre: [['malu', 'Aposto que eu estouro mais que você.'], ['ani', 'Aposta o quê?'], ['malu', 'Nada. Eu só gosto de ganhar.']],
    win: [['malu', 'Tá. Essa foi boa.'], ['ani', 'Pode falar que eu mirei bem.'], ['malu', 'Você mirou bem. ...No do lado.']],
    lose: [['malu', 'Eu mirei no do lado, tá? Pra ficar justo.'], ['ani', 'Claro que mirou.']],
    tie: [['malu', 'Empate. Revanche outro dia.'], ['ani', 'Combinado.']],
  },
  latas: {
    pre: [['ani', 'Três bolas, uma pirâmide. Como pode ser difícil?'], ['malu', 'Famosas últimas palavras.']],
    win: [['malu', 'Você derrubou mais que eu?!'], ['ani', 'Treinei a vida inteira pra esse momento.']],
    lose: [['ani', 'Sobrou uma lata. De pé. Rindo da gente.'], ['malu', 'Rindo de você. Eu derrubei mais.']],
    tie: [['malu', 'Empatou. A lata ganhou.'], ['ani', 'A lata sempre ganha.']],
  },
  pescaria: {
    pre: [['malu', 'Todo patinho ganha. Impossível perder.'], ['ani', 'Não me subestima.']],
    win: [['malu', 'Olha isso! Escolhe o prêmio.'], ['ani', '...Só tem chaveiro.'], ['malu', 'Então escolhe o mais feio. Pra mim.']],
    tie: [['ani', 'Ganhei um chaveiro.'], ['malu', 'Me dá. É o mais feio, eu adoro.']],
    lose: [['malu', 'Você conseguiu perder na barraca onde todo patinho ganha.'], ['ani', 'Talento.']],
  },
};

// ===============================================================
// CAPÍTULO 1: o parque de diversões — um ano antes.
//
//  1. flash    – o flash da cabine (o mesmo da foto na gaveta) estoura
//                a tela de branco e a noite do parque aparece
//  2. intro    – cartão do capítulo, a câmera sobe e revela o parque,
//                a tirinha sai da máquina, a cortina abre
//  3. conversa – a Malu e a Ani saem da cabine: balões pretos em cima
//                da cabeça; termina com "Eu guardei." (narração)
//  4. livre    – a Ani anda pela rua das barracas; a Malu vai junto.
//                Cada barraca tem uma fala; algumas a Malu responde.
//  5. roda     – na bilheteria da roda-gigante: a câmera sobe até a
//                roda e o capítulo "continua".
// ===============================================================

const HINT_FREE = '<b>A D</b> / <b>SETAS</b> ANDAR &nbsp; <b>W S</b> FRENTE / FUNDO &nbsp; <b>E</b> INTERAGIR &nbsp; <b>ESC</b> PAUSA';
const WALK_SPEED = 1.7;
const DEPTH_SPEED = 0.75;
const FILL = new THREE.Color('#c0a6dc');
const RIM = new THREE.Color();
const V3 = THREE.Vector3;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// personagem andando sozinho (roteiro) ou pelo jogador
class Actor {
  constructor(sprite, x, z) {
    this.sprite = sprite;
    this.x = x;
    this.z = z;
    this.v = 0; // velocidade atual (suavizada: começa e para com peso)
    this.target = null;
    this.vx = 0;
    this.vz = 0;
  }
  walkTo(x, z, speed = 1.4) {
    if (this.target) this.target.resolve();
    return new Promise((resolve) => (this.target = { x, z, speed, resolve }));
  }
  face(dir) {
    this.sprite.facing = dir;
  }
  // retorna true quando um pé toca o chão
  update(dt) {
    let anim = 0;
    if (this.target) {
      const T = this.target;
      const dx = T.x - this.x, dz = T.z - this.z;
      const d = Math.hypot(dx, dz);
      // chega desacelerando (arrive) e sai acelerando
      const want = Math.min(T.speed, d * 3.2 + 0.15);
      this.v = damp(this.v, want, 9, dt);
      const step = this.v * dt;
      if (d <= Math.max(step, 0.004)) {
        this.x = T.x;
        this.z = T.z;
        this.v = 0;
        this.target = null;
        T.resolve();
      } else {
        this.x += (dx / d) * step;
        this.z += (dz / d) * step;
        anim = this.v * (Math.abs(dx) > 0.03 ? Math.sign(dx) : this.sprite.facing);
      }
    } else if (this.vx || this.vz) {
      const sp = Math.hypot(this.vx, this.vz);
      anim = sp > 0.05 ? sp * (Math.abs(this.vx) > 0.05 ? Math.sign(this.vx) : this.sprite.facing) : 0;
    }
    this.sprite.mesh.position.set(this.x, 0, this.z);
    return this.sprite.update(dt, anim);
  }
  hand(out = new V3()) {
    const m = this.sprite.mesh;
    return out.set(m.position.x + this.sprite.shown * 0.17, 0.93, m.position.z + 0.06);
  }
}

export class ParkScene {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 400);
    this.tweens = new Tweens();
    this.keys = new Set();
    this.token = 0;
    this.mode = 'idle';
    this.busy = false;
    // câmera: posição/alvo "desejados" (o roteiro mexe) e os de verdade (seguem com mola)
    this.rig = { pos: new V3(0, 1.6, 5), look: new V3(0, 1.2, -1.5), fov: 40, lambda: 3, follow: null };
    this.camPos = this.rig.pos.clone();
    this.camLook = this.rig.look.clone();
    this.ready = this.load();
  }

  async load() {
    const [retrato, malu] = await Promise.all([
      loadImage('assets/sprites/protagonista_retrato.png'),
      loadImage('assets/sprites/malu_retrato.png'),
    ]);
    const stripCanvas = makePhotoStrip({ ani: retrato, malu });
    this.fx = createParkFx();
    this.park = buildPark(this.fx, { stripCanvas });
    this.scene.add(this.park.root);
    this.scene.userData.lightPass = this.fx.pass;

    // luz geral: céu azul da noite por cima, chão arroxeado por baixo,
    // e o luar frio vindo do fundo à esquerda (contorno nas coisas)
    this.hemi = new THREE.HemisphereLight('#5a68b8', '#2a1830', 0.75);
    this.moon = new THREE.DirectionalLight('#8f9cff', 0.55);
    this.moon.position.set(-14, 16, -12);
    this.scene.add(this.hemi, this.moon, this.moon.target);

    // as duas
    this.ani = new WalkSprite(ANI_SPRITE);
    this.malu = new WalkSprite(MALU_SPRITE);
    for (const s of [this.ani, this.malu]) {
      this.scene.add(s.mesh, s.shadow);
      s.shadow.material.opacity = 0.5;
    }
    // a roupa da Ani é preta: precisa de mais preenchimento para o rosto aparecer
    this.ani.setFill(FILL, 0.5);
    this.malu.setFill(FILL, 0.32);
    // luz de frente, quente e baixa, que acompanha as duas (o "rebatedor" do cinema)
    this.key = new THREE.PointLight('#ffcfb8', 1.4, 6, 1.4);
    this.scene.add(this.key);
    this.A = new Actor(this.ani, 0, LANE.z);
    this.M = new Actor(this.malu, -0.6, LANE.z);
    // comidas na mão e minigames das barracas
    this.snacks = new Snacks(this.scene, this.game.sfx);
    this.snacks.onFinish = (actor, kind) => this.onSnackDone(actor, kind);
    this.mg = new Minigames(this);
    this.ride = new WheelRide(this);
    this.bought = new Set();
  }

  // -------------------------------------------------------------
  // Entrada
  // -------------------------------------------------------------
  async enter(opts = {}) {
    await this.ready;
    const { renderer, settings, ui, sfx } = this.game;
    if (settings.rows < 360) renderer.setRows(360);
    this.tweens.clear();
    this.token++;
    this.keys.clear();
    this.busy = false;
    this.talked = new Set();
    this.mg?.stop();
    this.snacks?.clear();
    this.ride?.cleanup();
    this.bought = new Set();
    ui.hint(null);
    ui.pause(null);
    ui.chapter(null);
    ui.interact(null);
    ui.clearBubbles();
    ui.clearSay();
    // a legenda do quarto (data/hora) não atravessa para o parque
    ui.captionToken++;
    ui.el.caption.classList.remove('show');
    const fx = renderer.fx;
    Object.assign(fx, { fade: 0, glitch: 0, vignette: 0.5, grain: 0.06, bloom: 0.85, aberration: 0.0016, shakeX: 0, shakeY: 0 });
    fx.tint.set(1, 1, 1);
    fx.fadeColor.set(0, 0, 0);
    this.grade(1);
    sfx.ambient('parque');

    const strip = this.park.booth.strip;
    if (strip) {
      strip.visible = false;
      strip.scale.y = 0.001;
      this.stripHolder = null;
    }
    if (opts.jump === 'parque-livre') this.startFree(true);
    else if (opts.jump === 'parque-gondola') {
      // atalho do /admin: direto para a volta na roda-gigante
      this.startFree(true);
      this.A.x = 15.75;
      this.M.x = 14.6;
      this.snapCamera();
      this.mode = 'cut';
      this.busy = true;
      const tok = ++this.token;
      this.ride.play(() => tok === this.token).then(() => {
        if (tok !== this.token) return;
        this.mode = 'end';
        ui.hint('<b>ENTER</b> / <b>ESC</b> MENU PRINCIPAL');
      });
    } else if (opts.jump === 'parque-roda') {
      this.startFree(true);
      this.A.x = 15.75;
      this.M.x = 14.2;
      this.snapCamera();
    } else this.intro();
  }

  exit() {
    const { renderer, ui } = this.game;
    this.tweens.clear();
    this.token++;
    this.mg.stop();
    this.snacks.clear();
    this.ride.cleanup();
    renderer.setRows(this.game.settings.rows);
    renderer.fx.bars = 0;
    renderer.fx.flash = 0;
    ui.hint(null);
    ui.clearSay();
    ui.clearBubbles();
    ui.pause(null);
    ui.interact(null);
    ui.chapter(null);
  }

  // gradação de cor da noite do parque (k = 1 normal)
  grade() {
    const fx = this.game.renderer.fx;
    fx.exposure = 1.0;
    fx.lift.setRGB(0.006, 0.006, 0.02); // sombras azuladas, nunca pretas chapadas
    fx.gain.setRGB(1.08, 1.0, 0.9); // luzes quentes
    fx.saturation = 1.06;
    fx.contrast = 1.08;
    fx.glow = 0.62;
    fx.glowThreshold = 0.8;
  }

  // -------------------------------------------------------------
  // Câmera
  // -------------------------------------------------------------
  setRig(pos, look, fov = this.rig.fov, lambda = 3) {
    this.rig.pos.copy(pos);
    this.rig.look.copy(look);
    this.rig.fov = fov;
    this.rig.lambda = lambda;
    this.rig.follow = null;
  }
  snapCamera() {
    this.updateRigFollow(0);
    this.camPos.copy(this.rig.pos);
    this.camLook.copy(this.rig.look);
  }
  // modos que seguem alguém: 'ani' (jogo) e 'duas' (conversa: as duas em quadro)
  updateRigFollow(dt) {
    const f = this.rig.follow;
    if (!f) return;
    const a = this.A, m = this.M;
    if (f === 'ani') {
      const lead = this.ani.facing * 0.55;
      this.focusX = damp(this.focusX ?? a.x, a.x + lead, 2.6, dt || 1);
      const x = clamp(this.focusX, LANE.minX + 1.2, LANE.maxX - 0.8);
      const zf = (a.z - LANE.z) * 0.45;
      this.rig.pos.set(x, 1.62, 4.7 + zf);
      this.rig.look.set(x, 1.28 - zf * 0.15, -1.6 + zf);
      this.rig.fov = 40;
    } else if (f === 'duas') {
      const x = (a.x + m.x) / 2;
      const span = Math.abs(a.x - m.x);
      const back = clamp(span * 0.5, 0, 1.4);
      this.rig.pos.set(x, 1.5, 3.7 + back);
      this.rig.look.set(x, 1.22, -1.4);
      this.rig.fov = 38;
    } else if (f === 'close') {
      // aproxima na Ani (a narração)
      this.rig.pos.set(a.x + 0.3, 1.4, a.z + 3.3);
      this.rig.look.set(a.x + 0.12, 1.08, a.z - 0.5);
      this.rig.fov = 36;
    }
  }
  updateCamera(dt, t) {
    this.updateRigFollow(dt);
    const L = this.rig.lambda;
    this.camPos.x = damp(this.camPos.x, this.rig.pos.x, L, dt);
    this.camPos.y = damp(this.camPos.y, this.rig.pos.y, L, dt);
    this.camPos.z = damp(this.camPos.z, this.rig.pos.z, L, dt);
    this.camLook.x = damp(this.camLook.x, this.rig.look.x, L, dt);
    this.camLook.y = damp(this.camLook.y, this.rig.look.y, L, dt);
    this.camLook.z = damp(this.camLook.z, this.rig.look.z, L, dt);
    const cam = this.camera;
    cam.fov = damp(cam.fov, this.rig.fov, L, dt);
    cam.aspect = this.game.renderer.w / this.game.renderer.h;
    cam.updateProjectionMatrix();
    // câmera "na mão": respira bem pouquinho
    cam.position.set(this.camPos.x + Math.sin(t * 0.43) * 0.012, this.camPos.y + Math.sin(t * 0.61) * 0.01, this.camPos.z);
    cam.lookAt(this.camLook.x + Math.sin(t * 0.37) * 0.008, this.camLook.y + Math.sin(t * 0.53) * 0.006, this.camLook.z);
  }

  // -------------------------------------------------------------
  // Falas
  // -------------------------------------------------------------
  headScreen(obj, lift = 0.02) {
    const box = new THREE.Box3().setFromObject(obj);
    const p = new V3((box.min.x + box.max.x) / 2, box.max.y + lift, (box.min.z + box.max.z) / 2);
    p.project(this.camera);
    return [((p.x + 1) / 2) * window.innerWidth, ((1 - p.y) / 2) * window.innerHeight];
  }
  // fala em balão preto em cima da cabeça
  say(who, text, opts = {}) {
    const mesh = who === 'malu' ? this.malu.mesh : this.ani.mesh;
    const hold = opts.hold ?? 0.8 + text.length * 0.035;
    // quem fala dá uma "respiradinha" (game feel: o corpo acompanha a fala)
    (who === 'malu' ? this.malu : this.ani).squash = 0.6;
    return this.game.ui.bubbleWait(text, { id: who, hold, anchor: () => this.headScreen(mesh) });
  }

  // -------------------------------------------------------------
  // 1–3. Flash, capítulo, saída da cabine e conversa
  // -------------------------------------------------------------
  async intro() {
    const { renderer, ui, sfx } = this.game;
    const fx = renderer.fx;
    const tw = this.tweens;
    const tok = ++this.token;
    const ok = () => tok === this.token;
    const B = this.park.booth;
    this.mode = 'cut';
    this.busy = true;

    // as duas lá dentro (a cortina esconde)
    this.A.x = 0.05;
    this.A.z = B.zb + 0.55;
    this.M.x = -0.35;
    this.M.z = B.zb + 0.5;
    this.A.target = this.M.target = null;
    this.ani.facing = -1;
    this.malu.facing = 1;
    B.curtain.open = 0;

    // começa colado na cabine, estourado de branco
    if (fx.flash < 0.5) sfx.flash(); // (atalho do /admin: o flash não veio do quarto)
    fx.flash = 1;
    fx.bars = 1;
    fx.exposure = 2.2;
    B.flash.intensity = 90;
    B.flashGlow.power = 40;
    this.setRig(new V3(0.15, 1.5, 1.55), new V3(-0.1, 1.45, -1.6), 36, 50);
    this.camPos.copy(this.rig.pos);
    this.camLook.copy(this.rig.look);
    this.camera.fov = 36;

    // o branco assenta: o flash da foto vira a noite do parque
    tw.to({
      duration: 2.2, ease: ease.outCubic,
      onUpdate: (k) => {
        fx.flash = 1 - k;
        fx.exposure = lerp(2.2, 1.0, ease.outCubic(Math.min(1, k * 1.2)));
        B.flash.intensity = 90 * Math.pow(1 - k, 3);
        B.flashGlow.power = 40 * Math.pow(1 - k, 2.5);
      },
    });
    await tw.wait(0.9);
    if (!ok()) return;
    ui.caption('DOMINGO, 12 DE OUTUBRO · 19:42', 4.5);
    await tw.wait(0.7);
    if (!ok()) return;
    sfx.shimmer();
    ui.chapter('CAPÍTULO 1', 'UM ANO ANTES');

    // a câmera recua e sobe: o parque inteiro aparece (roda-gigante ao fundo)
    this.setRig(new V3(1.6, 2.05, 6.6), new V3(1.2, 2.2, -4), 42, 0.9);
    await tw.wait(3.2);
    if (!ok()) return;
    ui.chapter(null);

    // a máquina imprime a tirinha
    await tw.wait(0.6);
    if (!ok()) return;
    sfx.printer();
    const S = B.strip;
    if (S) {
      S.visible = true;
      await tw.to({
        duration: 2.4, ease: ease.inOutSine,
        onUpdate: (k) => {
          const kk = Math.floor(k * 14) / 14; // sai aos trancos, como a máquina de verdade
          S.scale.y = Math.max(0.001, kk);
          S.position.y = B.slot.y - 0.105 * kk;
        },
      });
      if (!ok()) return;
      sfx.pop();
    }

    // aproxima para a conversa e a cortina abre
    this.setRig(new V3(0.0, 1.55, 4.1), new V3(-0.05, 1.25, -1.3), 38, 1.6);
    await tw.wait(0.8);
    if (!ok()) return;
    sfx.rings();
    B.curtain.swayV = 4;
    await tw.wait(0.35);
    sfx.cloth();
    await tw.to({ duration: 0.75, ease: ease.outCubic, onUpdate: (k) => (B.curtain.open = k) });
    if (!ok()) return;
    B.curtain.swayV = -3;

    // a Malu sai primeiro, rindo
    const mOut = this.M.walkTo(-0.5, LANE.z - 0.05, 1.3);
    await tw.wait(0.5);
    const aOut = this.A.walkTo(-0.2, B.z0 + 0.35, 1.0);
    await mOut;
    if (!ok()) return;
    this.M.walkTo(-1.45, LANE.z, 1.0);
    this.rig.follow = 'duas';
    this.rig.lambda = 1.8;
    await this.say('malu', 'Você piscou em todas. Todas!');
    if (!ok()) return;
    await aOut;
    await this.A.walkTo(-0.45, LANE.z + 0.08, 0.9);
    this.A.face(-1);
    this.M.face(1);
    await this.say('ani', 'Mentira. Na última eu tava de olho aberto.');
    if (!ok()) return;
    B.curtain.swayV = 2;
    tw.to({ duration: 0.6, delay: 0.4, ease: ease.inOutSine, onUpdate: (k) => (B.curtain.open = 1 - k) });

    // a Malu vai buscar a tirinha na máquina
    await this.M.walkTo(0.62, LANE.minZ - 0.12, 1.5);
    if (!ok()) return;
    this.M.face(1);
    this.malu.reach(0.6);
    await tw.wait(0.25);
    sfx.page();
    this.stripHolder = this.M;
    await tw.wait(0.45);
    this.M.face(-1);
    this.A.face(1);
    await this.say('malu', 'Na última você tava olhando pra mim, isso sim.');
    if (!ok()) return;
    await tw.wait(0.3);
    await this.say('ani', '...Porque você falou que ia fazer careta e não fez.');
    if (!ok()) return;
    await this.say('malu', 'Fiz sim. Por dentro.');
    if (!ok()) return;

    // ela entrega a tirinha
    await this.M.walkTo(0.45, LANE.z - 0.04, 1.0);
    this.M.face(-1);
    this.A.face(1);
    await this.say('malu', 'Toma. Fica com você.', { hold: 0.9 });
    if (!ok()) return;
    this.malu.reach(0.5);
    this.ani.reach(0.5);
    await tw.wait(0.2);
    sfx.page();
    this.stripHolder = this.A;
    await tw.wait(0.4);
    await this.say('ani', 'A ideia foi sua. Fica você.');
    if (!ok()) return;
    await this.say('malu', 'Por isso mesmo. Eu lembro das coisas. Você precisa de prova.');
    if (!ok()) return;

    // ela sai andando na frente (para o lado do algodão-doce) e vira
    const mGo = this.M.walkTo(-1.9, LANE.z - 0.1, 1.5);
    await tw.wait(0.5);
    this.A.face(-1);
    await mGo;
    this.M.face(1);
    await this.say('malu', 'Algodão-doce! Eu pago. Você paga a roda-gigante.');
    if (!ok()) return;
    await this.say('ani', 'A roda-gigante é mais cara.');
    if (!ok()) return;
    await this.say('malu', 'Eu sei.', { hold: 1.1 });
    if (!ok()) return;
    this.M.walkTo(-3.2, LANE.z - 0.15, 1.2).then(() => this.M.face(1));

    // fecha na Ani olhando a tirinha. Narração (hoje): "Eu guardei."
    this.rig.follow = 'close';
    this.rig.lambda = 1.1;
    this.A.face(1);
    this.ani.pose(14);
    await tw.wait(1.6);
    if (!ok()) return;
    await ui.sayWait('Eu guardei.', { hold: 2.2 });
    if (!ok()) return;
    this.ani.pose(null);
    this.stripHolder = null;
    if (B.strip) B.strip.visible = false;
    sfx.rustle();
    await tw.wait(0.4);
    if (!ok()) return;
    this.startFree(false);
  }

  // -------------------------------------------------------------
  // 4. Livre
  // -------------------------------------------------------------
  startFree(snap) {
    const { renderer, ui } = this.game;
    const fx = renderer.fx;
    this.tweens.clear();
    this.token++;
    const B = this.park.booth;
    this.mode = 'free';
    this.busy = false;
    if (snap) {
      fx.flash = 0;
      fx.bars = 0;
      fx.exposure = 1;
      B.flash.intensity = 0;
      B.flashGlow.power = 0;
      B.curtain.open = 0;
      this.A.x = 0.3;
      this.A.z = LANE.z;
      this.M.x = -0.7;
      this.M.z = LANE.z - 0.1;
      this.A.target = this.M.target = null;
      this.ani.facing = 1;
      this.ani.pose(null);
    } else {
      this.tweens.to({ duration: 0.9, ease: ease.inOutSine, onUpdate: (k) => (fx.bars = Math.min(fx.bars, 1 - k)) });
    }
    this.rig.follow = 'ani';
    this.rig.lambda = snap ? 3 : 1.4;
    this.tweens.wait(snap ? 0 : 1.6).then(() => {
      if (this.rig.follow === 'ani') this.rig.lambda = 3;
    });
    if (snap) this.snapCamera();
    ui.hint(HINT_FREE);
  }

  nearestInteractable() {
    let best = null, bd = 1.05;
    for (const it of this.park.interactables) {
      const d = Math.abs(it.x - this.A.x);
      if (d < bd) {
        bd = d;
        best = it;
      }
    }
    return best;
  }

  async interact(it) {
    if (!it || this.busy) return;
    const { ui, sfx } = this.game;
    if (it.id === 'roda') return this.ending();
    if (FOOD[it.id]) return this.buy(it);
    if (GAMES[it.id]) return this.playGame(it);
    this.busy = true;
    this.keys.clear();
    sfx.select();
    ui.interact(null);
    const tok = this.token;
    this.ani.reach(0.5);
    // a Ani olha para a barraca; a Malu, se estiver perto, comenta
    await ui.sayWait(it.line, { hold: 1.8 });
    if (tok !== this.token) return;
    const near = Math.abs(this.M.x - this.A.x) < 2.6;
    if (it.malu && near && !this.talked.has(it.id)) {
      this.talked.add(it.id);
      this.M.face(Math.sign(it.x - this.M.x) || 1);
      await this.say('malu', it.malu);
    }
    this.busy = false;
  }

  // -------------------------------------------------------------
  // Comprar e comer
  // -------------------------------------------------------------
  async sayAll(lines) {
    const tok = this.token;
    for (const [who, text] of lines) {
      await this.say(who, text);
      if (tok !== this.token) return false;
    }
    return true;
  }

  async buy(it) {
    const { ui, sfx } = this.game;
    const tw = this.tweens;
    const tok = this.token;
    const ok = () => tok === this.token;
    const F = FOOD[it.id];
    if (this.snacks.holding(this.A) && this.snacks.holding(this.A) === F.ani) {
      ui.say('Ainda nem acabei esse.', { hold: 1.4 });
      return;
    }
    this.busy = true;
    this.keys.clear();
    ui.interact(null);
    const first = !this.bought.has(it.id);
    if (first) await ui.sayWait(it.line, { hold: 1.6 });
    if (!ok()) return;
    // as duas chegam no balcão
    const T = this.park.FRONT;
    await Promise.all([this.A.walkTo(it.x + F.ax, LANE.minZ, 1.3), this.M.walkTo(it.x + F.mx, LANE.minZ + 0.06, 1.5)]);
    if (!ok()) return;
    this.A.face(Math.sign(it.x - (it.x + F.ax)) || 1);
    this.M.face(Math.sign(it.x - (it.x + F.mx)) || -1);
    if (!(await this.sayAll(first ? F.before : F.again))) return;
    // quem paga estende a mão (moedinha no balcão)
    (F.payer === 'malu' ? this.malu : this.ani).reach(0.6);
    sfx.coin();
    await tw.wait(0.55);
    if (!ok()) return;
    // os pedidos saem do balcão e voam para a mão de cada uma
    const from = new V3(it.x, 1.1, T - 0.12);
    const go = (actor, sprite, kind, delay) => tw.wait(delay).then(async () => {
      if (!kind || !ok()) return;
      const m = makeFood(kind);
      sprite.reach(0.5);
      await this.snacks.fly(m, from.clone().add(new V3((Math.random() - 0.5) * 0.3, 0, 0)), () => actor.hand(new V3()).add(new V3(sprite.shown * 0.02, 0, 0.03)));
      if (!ok()) return;
      this.snacks.give(actor, kind, m);
      sfx.pop();
    });
    await Promise.all([go(this.A, this.ani, F.ani, 0), go(this.M, this.malu, F.malu, 0.25)]);
    if (!ok()) return;
    await tw.wait(0.3);
    if (first && !(await this.sayAll(F.after))) return;
    this.bought.add(it.id);
    this.busy = false;
  }

  // alguém terminou de comer
  onSnackDone(actor, kind) {
    if (this.mode !== 'free' || this.busy) return;
    // a Malu acabou o dela e a Ani ainda tem algodão: ela rouba um pedaço
    if (actor === this.M && kind.startsWith('algodao') && this.snacks.holding(this.A)?.startsWith('algodao') && !this.stole) {
      this.stole = true;
      const tok = this.token;
      this.say('malu', 'Me dá um pedaço?').then(() => {
        if (tok !== this.token) return;
        this.M.face(Math.sign(this.A.x - this.M.x) || 1);
        this.malu.reach(0.5);
        this.tweens.wait(0.3).then(() => {
          if (tok !== this.token) return;
          this.snacks.stealBite(this.A, this.M);
          this.game.ui.say('Sempre come o meu.', { hold: 1.6 });
        });
      });
    }
  }

  // -------------------------------------------------------------
  // Minigames das barracas
  // -------------------------------------------------------------
  async playGame(it) {
    const { ui, sfx } = this.game;
    const tw = this.tweens;
    const tok = this.token;
    const ok = () => tok === this.token;
    const L = GAMES[it.id];
    this.busy = true;
    this.keys.clear();
    ui.interact(null);
    await Promise.all([this.A.walkTo(it.x - 0.2, LANE.minZ, 1.4), this.M.walkTo(it.x - 1.1, LANE.minZ + 0.08, 1.5)]);
    if (!ok()) return;
    this.A.face(1);
    this.M.face(1);
    this.rig.follow = 'duas';
    this.rig.lambda = 2;
    if (!this.talked.has(it.id)) {
      this.talked.add(it.id);
      if (!(await this.sayAll(L.pre))) return;
    }
    this.ani.reach(0.6);
    sfx.coin();
    await tw.wait(0.5);
    if (!ok()) return;
    this.mode = 'game';
    const r = await this.mg.play(it.id);
    if (!ok()) return;
    // volta para as duas e comenta o resultado
    this.mode = 'cut';
    this.rig.follow = 'duas';
    this.rig.lambda = 2.2;
    this.game.mouse.set(0, 0);
    await tw.wait(0.9);
    if (!ok()) return;
    if (!(await this.sayAll(L[r.res] || L.tie))) return;
    this.mode = 'free';
    this.busy = false;
    this.rig.follow = 'ani';
    this.rig.lambda = 2;
    this.tweens.wait(1.2).then(() => this.rig.follow === 'ani' && (this.rig.lambda = 3));
  }

  // -------------------------------------------------------------
  // 5. Bilheteria: a câmera sobe até a roda-gigante
  // -------------------------------------------------------------
  async ending() {
    const { renderer, ui, sfx } = this.game;
    const fx = renderer.fx;
    const tw = this.tweens;
    const tok = ++this.token;
    const ok = () => tok === this.token;
    this.mode = 'cut';
    this.busy = true;
    this.keys.clear();
    ui.interact(null);
    ui.hint(null);
    this.A.vx = this.A.vz = 0;
    tw.to({ duration: 0.8, ease: ease.inOutSine, onUpdate: (k) => (fx.bars = k) });
    const T = this.park.ticket;
    await this.A.walkTo(T.x - 0.25, LANE.minZ + 0.05, 1.2);
    this.A.face(1);
    this.M.walkTo(T.x - 1.25, LANE.z, 1.4).then(() => this.M.face(1));
    this.rig.follow = 'duas';
    this.rig.lambda = 1.6;
    await tw.wait(0.6);
    if (!ok()) return;
    await this.say('malu', 'Agora é com você.');
    if (!ok()) return;
    await this.say('ani', 'Duas, por favor.');
    if (!ok()) return;
    this.ani.reach(0.6);
    sfx.coin();
    await tw.wait(0.5);
    if (!ok()) return;
    await this.say('malu', 'Viu? Nem doeu.');
    if (!ok()) return;
    // a volta na roda-gigante (gôndola, closes, o alto e a cidade)
    await this.ride.play(ok);
    if (!ok()) return;
    this.mode = 'end';
    ui.hint('<b>ENTER</b> / <b>ESC</b> MENU PRINCIPAL');
  }

  // -------------------------------------------------------------
  // Entrada (teclado)
  // -------------------------------------------------------------
  onKey(e) {
    const { ui } = this.game;
    if (this.mode === 'game' && e.code !== 'Escape') {
      if (!ui.pauseOpen) this.mg.key(e, true);
      return;
    }
    if (e.code === 'Escape') {
      if (ui.pauseOpen) return ui.pause(null);
      if (this.mode === 'end') return this.toMenu();
      this.openPause();
      return;
    }
    if (ui.pauseOpen) return;
    // fim do capítulo: Enter (ou A no controle) também volta ao menu
    if (this.mode === 'end' && e.code === 'Enter' && !e.repeat) return this.toMenu();
    if (this.mode === 'free') {
      this.keys.add(e.code);
      if (['KeyE', 'Enter', 'Space'].includes(e.code) && !e.repeat) this.interact(this.nearestInteractable());
    }
  }
  onKeyUp(e) {
    if (this.mode === 'game') this.mg.key(e, false);
    if (e.code === '*') this.keys.clear();
    else this.keys.delete(e.code);
  }
  onPointerDown(e) {
    if (this.mode === 'game' && !this.game.ui.pauseOpen) this.mg.pointer(e, 'down');
  }
  onPointerUp(e) {
    if (this.mode === 'game') this.mg.pointer(e, 'up');
  }
  // Falas: clique acelera/pula; Enter/A também, menos andando livre (aí é interagir)
  dialogClick() {
    return this.mode !== 'game';
  }
  dialogKey() {
    if (this.mode === 'game') return false;
    return this.mode !== 'free' || this.busy;
  }
  // Controle (ver engine/gamepad.js): no trecho livre o analógico anda
  padMode() {
    if (this.mode === 'game') return 'aim';
    return this.mode === 'free' ? 'walk' : null;
  }
  openPause() {
    const { ui, sfx } = this.game;
    sfx.back();
    this.keys.clear();
    ui.pause([
      { label: 'CONTINUAR', action: () => ui.pause(null) },
      { label: 'MENU PRINCIPAL', action: () => { ui.pause(null); this.toMenu(); } },
    ]);
  }
  async toMenu() {
    const { renderer, ui } = this.game;
    this.mode = 'leaving';
    ui.chapter(null);
    ui.hint(null);
    ui.clearBubbles();
    ui.clearSay();
    renderer.fx.fadeColor.set(0, 0, 0);
    await this.tweens.to({ duration: 0.6, onUpdate: (k) => (renderer.fx.fade = k) });
    this.game.goTo('menu', { awake: true });
  }

  // -------------------------------------------------------------
  // Atualização por quadro
  // -------------------------------------------------------------
  update(dt, t) {
    if (!this.park) return;
    const { sfx, ui, renderer } = this.game;
    const frozen = this.mode === 'game' && ui.pauseOpen; // pausa de verdade no minigame
    if (!frozen) this.tweens.update(dt);
    this.park.update(t, dt);
    if (!frozen) this.mg.update(dt, t);
    this.fx.update(dt, t, { rows: renderer.h });

    // jogador
    const A = this.A, M = this.M;
    if (this.mode === 'free' && !this.busy && !this.game.ui.pauseOpen) {
      const k = this.keys;
      let dir = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
      let dirZ = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
      if (!dir && !dirZ) {
        // analógico do controle: inclinar pouco = passo lento
        const st = this.game.pad?.move();
        if (st) {
          dir = st.x;
          dirZ = st.y;
        }
      }
      const n = Math.hypot(dir, dirZ * DEPTH_SPEED) > 1 ? 1 / Math.hypot(dir, dirZ * DEPTH_SPEED) : 1;
      A.vx = damp(A.vx, dir * WALK_SPEED * n, 10, dt);
      A.vz = damp(A.vz, dirZ * WALK_SPEED * DEPTH_SPEED * n, 10, dt);
      if (Math.abs(A.vx) < 0.02 && !dir) A.vx = 0;
      if (Math.abs(A.vz) < 0.02 && !dirZ) A.vz = 0;
      A.x = clamp(A.x + A.vx * dt, LANE.minX, LANE.maxX);
      A.z = clamp(A.z + A.vz * dt, LANE.minZ, LANE.maxZ);
    } else if (!A.target) {
      A.vx = damp(A.vx, 0, 12, dt);
      A.vz = damp(A.vz, 0, 12, dt);
      if (Math.abs(A.vx) < 0.02) A.vx = 0;
      if (Math.abs(A.vz) < 0.02) A.vz = 0;
    }

    // a Malu acompanha (um pouco atrás e mais para o fundo), sem grudar
    if (this.mode === 'free' && (!M.target || M.target.follow)) {
      const side = -this.ani.facing;
      const gx = clamp(A.x + side * 1.05, LANE.minX, LANE.maxX);
      const gz = clamp(A.z - 0.28, LANE.minZ, LANE.maxZ);
      const d = Math.hypot(gx - M.x, gz - M.z);
      const speed = Math.min(2.3, 1.15 + d * 0.6);
      if (M.target) {
        M.target.x = gx;
        M.target.z = gz;
        M.target.speed = speed;
      } else if (d > 0.9) {
        M.walkTo(gx, gz, speed);
        M.target.follow = true;
      } else if (Math.abs(A.x - M.x) > 0.2) M.face(Math.sign(A.x - M.x));
    }
    if (A.update(dt)) sfx.step();
    if (M.update(dt)) sfx.step();
    this.snacks.update(dt, t, { busy: this.mode !== 'free' });

    // tirinha na mão de quem está segurando
    const S = this.park.booth.strip;
    if (S && this.stripHolder) {
      this.stripHolder.hand(S.position);
      S.scale.y = 1;
      S.rotation.z = -this.stripHolder.sprite.shown * 0.25;
      S.position.z += 0.04;
    }

    // luz nelas: contorno da luz quente mais próxima + preenchimento lilás
    for (const s of [this.ani, this.malu]) {
      let best = null, bd = 1e9;
      for (const l of this.park.lights) {
        if (l.intensity <= 0) continue;
        const d = Math.abs(l.position.x - s.mesh.position.x) + Math.abs(l.position.z - s.mesh.position.z) * 0.5;
        if (d < bd) {
          bd = d;
          best = l;
        }
      }
      if (best) {
        const k = clamp(1.4 - bd * 0.45, 0, 1) * 0.22;
        RIM.copy(best.color).multiplyScalar(k + 0.04);
        s.setRim(RIM, best.position.x);
      }
    }

    // balão de interação
    if (this.mode === 'free' && !this.busy) {
      const it = this.nearestInteractable();
      if (it !== this.lastIt) {
        this.lastIt = it;
        if (it) sfx.hover();
      }
      if (it) {
        const p = it.anchor.clone().project(this.camera);
        ui.interact(it.label, ((p.x + 1) / 2) * window.innerWidth, ((1 - p.y) / 2) * window.innerHeight);
      } else ui.interact(null);
    }

    // balão estourando perto dela faz barulho
    for (const b of this.park.popBalloon.splice(0)) {
      const d = Math.abs(b.position.x - A.x);
      if (d < 6) sfx.balloonPop(clamp(1 - d / 6) * 0.9 + 0.1);
    }

    // rebatedor: na frente e acima de quem está em quadro
    const kx = this.rig.follow === 'ani' || !this.rig.follow ? A.x : (A.x + M.x) / 2;
    this.key.position.set(kx + 0.6, 2.2, Math.max(A.z, M.z) + 2.0);
    // na roda-gigante: personagens dentro da gôndola, câmera presa nela
    this.ride.update(dt, t);

    this.updateCamera(dt, t);
  }
}
