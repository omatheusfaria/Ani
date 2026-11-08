import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Tweens, ease, damp, lerp, clamp } from '../engine/tween.js';
import { buildRoom } from './room.js';
import { makePhotoStrip, frameRect, STRIP_W, STRIP_H, FRAME_W, FRAME_H, METERS_PER_PX } from './photostrip.js';
import { PhoneApp, W as SW, H as SH } from '../phone/app.js';
import { POST_THOUGHTS } from '../phone/posts.js';
import { makeHands } from '../phone/hands.js';
import { AniSprite, AniTop } from '../chars/ani.js';
import { setGlow, squash } from './furniture.js';
import { createCinema } from './cinema.js';
import { PixelRenderer } from '../engine/renderer.js';

// ===============================================================
// CENA 1: o quarto, 23:47.
//
//  1. phone    – no celular, stalkeando a Malu (primeira pessoa)
//  2. dying    – a bateria acaba
//  3. standup  – ela levanta da cama no escuro (primeira pessoa)
//  4. side     – visão lateral, estilo Until Then: acender a luz e
//                procurar o carregador pelo quarto
//  5. drawer   – a gaveta da escrivaninha (primeira pessoa) e a
//                tirinha de fotos; zoom até a foto ocupar a tela
//  6. photo    – começa o Capítulo 1
// ===============================================================

const SCREEN_W = 0.285;
const SCREEN_H = 0.596;
const FP_FOV = 50;
const WALK_SPEED = 1.7;
const DEPTH_SPEED = 0.75; // andar para frente/trás é um pouco mais lento (a câmera vê de lado)
const Z_MIN = -1.6; // o mais fundo que ela vai (perto dos móveis do fundo)
const Z_MAX = 0.0; // o mais perto da câmera (sem sair de baixo da caixa de diálogo)
const RIM_GAIN = 0.16;
const FILL_DARK = new THREE.Color('#5a6aa8');
const FILL_LIT = new THREE.Color('#f0d9cf');
const HAZE = new THREE.Color();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const HINT_PHONE = '<b>CLIQUE</b> TOCAR &nbsp; <b>RODA / ARRASTAR</b> ROLAR &nbsp; <b>2× CLIQUE</b> CURTIR &nbsp; <b>ESC</b> VOLTAR';
const HINT_SIDE = '<b>W A S D</b> / <b>SETAS</b> ANDAR &nbsp; <b>E</b> INTERAGIR &nbsp; <b>ESC</b> PAUSA';
const HINT_INSPECT = '<b>MOUSE</b> OLHAR &nbsp; <b>CLIQUE</b> EXAMINAR &nbsp; <b>E</b> / <b>ESC</b> VOLTAR';
const HINT_ZEN = '<b>CLIQUE</b> PEGAR UM PAPEL &nbsp; <b>E</b> / <b>ESC</b> LEVANTAR';
const HINT_PAPER = '<b>MOUSE</b> INCLINAR &nbsp; <b>CLIQUE</b> / <b>ESC</b> DEVOLVER';

// Vistas de perto (primeira pessoa). pan = quanto o mouse gira a cabeça (rad)
const INSPECT = {
  estante: { title: 'ESTANTE', pos: [-1.86, 1.06, -0.35], look: [-2.75, 0.94, -0.35], fov: 50, pan: [0.3, 0.32] },
  criado: { title: 'CRIADO-MUDO', pos: [0.1, 1.0, -1.6], look: [0.1, 0.6, -2.22], fov: 46, pan: [0.14, 0.1] },
  mochila: { title: 'MOCHILA', pos: [-0.52, 0.86, -0.6], look: [-0.62, 0.26, -1.02], fov: 44, pan: [0.12, 0.09] },
};

// Coisas do criado-mudo
const NIGHTSTAND = {
  clock: { label: 'Despertador', line: 'Quase meia-noite. Amanhã eu durmo cedo. ...Mentira.' },
  glass: { label: 'Copo d\'água', line: 'Água de não sei quantos dias.' },
  frame: { label: 'Porta-retrato', line: 'Fica virado pra baixo. É melhor assim.' },
  dish: { label: 'Potinho', line: 'Bijuteria que eu nunca uso.' },
};

// O que ela pensa ao mexer em cada coisa (com a luz acesa)
const LINES = {
  estante: 'Livros que eu nunca terminei. Nada de carregador.',
  cama: 'Nem embaixo do travesseiro.',
  mochila: 'Caderno, fone quebrado... e só.',
  criado: 'Só a luminária e o despertador.',
  ingressos: 'Dois ingressos de março. Nunca usados.',
  roupas: 'Isso é muita roupa preta.',
  armario: 'Não tá no guarda-roupa.',
};

const titleCase = (t) => t.charAt(0) + t.slice(1).toLowerCase();
const isAncestor = (a, o) => {
  for (; o; o = o.parent) if (o === a) return true;
  return false;
};

// Gira suavemente um ângulo em direção a outro
const dampAngle = (a, b, l, dt) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * (1 - Math.exp(-l * dt));

// Controle: próximo item na direção (dx, dy) entre pontos de tela {x, y} (pixels, y para baixo).
// Prefere o que está mais alinhado com a direção; -1 se não há nada para lá.
function spatialPick(list, cur, dx, dy) {
  const p = list[cur];
  let best = -1, bs = Infinity;
  list.forEach((q, i) => {
    if (i === cur) return;
    const vx = q.x - p.x, vy = q.y - p.y;
    const along = vx * dx + vy * dy;
    if (along <= 4) return;
    const perp = Math.abs(vx * dy - vy * dx);
    const s = along + perp * 2.2;
    if (s < bs) {
      bs = s;
      best = i;
    }
  });
  return best;
}

// item mais perto do centro da tela (para começar a seleção)
function centerPick(list) {
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let best = 0, bd = Infinity;
  list.forEach((q, i) => {
    const d = Math.hypot(q.x - cx, q.y - cy);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

export class QuartoScene {
  constructor(game) {
    this.game = game;
    this.tweens = new Tweens();
    this.raycaster = new THREE.Raycaster();
    this.token = 0;
    this.keys = new Set();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#05040a');
    this.scene.fog = new THREE.Fog('#05040a', 6, 12);

    this.fpCam = new THREE.PerspectiveCamera(FP_FOV, 16 / 9, 0.02, 30);
    this.scene.add(this.fpCam);
    this.sideCam = new THREE.PerspectiveCamera(44, 16 / 9, 0.05, 30);
    this.drawerCam = new THREE.PerspectiveCamera(45, 16 / 9, 0.004, 20);
    // câmera das vistas de perto e do plano zenital
    this.closeCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.01, 30);
    this.scene.add(this.closeCam);
    // véu escuro atrás do papel quando ele vem para perto
    this.dim = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ color: '#05040a', transparent: true, opacity: 0, depthWrite: false })
    );
    this.dim.position.z = -0.9;
    this.dim.renderOrder = 5;
    this.dim.visible = false;
    this.closeCam.add(this.dim);
    // luz suave "dos olhos" nas vistas de perto (deixa ler as lombadas)
    this.eyeLight = new THREE.PointLight('#ffe2c4', 0, 2.2, 2);
    this.eyeLight.position.set(0.15, 0.25, 0);
    this.closeCam.add(this.eyeLight);
    this.camera = this.fpCam;
    this.look = new THREE.Vector3();

    this.ready = this.load();
  }

  async load() {
    const [retrato, malu] = await Promise.all([
      loadImage('assets/sprites/protagonista_retrato.png'),
      loadImage('assets/sprites/malu_retrato.png'),
    ]);
    this.app = new PhoneApp({ crush: malu, self: retrato, onEvent: (n, d) => this.onAppEvent(n, d) });
    const strip = makePhotoStrip({ ani: retrato, malu });
    this.room = buildRoom({ posts: this.app.posts, strip });
    this.scene.add(this.room.group);
    this.buildPhone();

    this.ani = new AniSprite();
    this.scene.add(this.ani.mesh, this.ani.shadow);
    // iluminação cinematográfica: feixes de luar, recorte da janela, poeira
    this.cinema = createCinema(this.room, this.ani);
    this.scene.userData.lightPass = this.cinema.pass;
    this.scene.add(this.cinema.motes);
    this.room.cine.patch.visible = false;
    this.eyeAdapt = 1; // o olho dela se acostumando com a luz (exposição)
    this.aniTop = new AniTop();
    this.scene.add(this.aniTop.mesh, this.aniTop.shadow);
  }

  buildPhone() {
    const phone = (this.phone = new THREE.Group());
    this.phoneRig = new THREE.Group(); // recebe balanço, tremor e susto
    this.phoneRig.add(phone);
    this.fpCam.add(this.phoneRig);

    const body = new THREE.Mesh(
      new RoundedBoxGeometry(0.31, 0.64, 0.036, 3, 0.03),
      new THREE.MeshStandardMaterial({ color: '#16141d', roughness: 0.35, metalness: 0.35 })
    );
    phone.add(body);

    this.screen = new THREE.Mesh(
      new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
      new THREE.MeshBasicMaterial({ map: this.app.texture, toneMapped: false })
    );
    this.screen.position.z = 0.0185;
    phone.add(this.screen);
    // A interface do app é nítida (padrão de app de verdade): a tela é desenhada de novo
    // num passe em resolução cheia (camada 1). A tela pixelada só marca onde ele entra
    // (e continua valendo para o brilho e a luz no quarto).
    PixelRenderer.markHD(this.screen.material);
    this.screenHD = new THREE.Mesh(this.screen.geometry, new THREE.MeshBasicMaterial({ map: this.app.texture, toneMapped: false }));
    this.screenHD.position.copy(this.screen.position);
    this.screenHD.layers.set(1);
    phone.add(this.screenHD);

    const hands = makeHands();
    phone.add(hands.back, hands.thumb);
    this.thumb = hands.thumb;
    this.thumbBase = hands.thumb.position.clone();

    this.screenLight = new THREE.PointLight('#a9c4ff', 0.35, 0, 2);
    this.screenLight.position.set(0, 0, 0.22);
    phone.add(this.screenLight);

    this.phoneRig.visible = false;
  }

  // -------------------------------------------------------------
  // Ciclo de vida
  // -------------------------------------------------------------

  async enter(opts = {}) {
    await this.ready;
    const { renderer, settings, ui } = this.game;
    if (settings.rows < 360) renderer.setRows(360); // a tela do celular precisa de resolução
    this.tweens.clear();
    this.token++;
    this.panic = 0;
    this.press = 0;
    this.buzz = 0;
    this.raise = 0;
    this.nextBeat = 0;
    this.seenProfile = false;
    this.thoughtsShown = new Set();
    this.mouseSmooth = new THREE.Vector2();
    this.engage = { profile: false, posts: 0, deep: false, me: false };
    this.batteryClock = 0;
    this.idleClock = 0;
    this.batteryStage = 0;
    this.likedByAccident = null;
    this.searches = 0;
    this.busy = false;
    this.keys.clear();
    this.app.reset();
    this.room.setLight(0);
    this.room.drawer.setOpen(0);
    this.resetRoomState();
    this.ani.mesh.visible = false;
    this.ani.shadow.visible = false;
    ui.hint(null);
    ui.pause(null);
    ui.chapter(null);
    ui.interact(null);
    ui.setHintScope('quarto'); // as dicas de botões só aparecem aqui, como tutorial

    Object.assign(renderer.fx, { fade: 1, glitch: 0, vignette: 0.6, grain: 0.07, bloom: 1.0, aberration: 0.0018 });
    renderer.fx.tint.set(1, 1, 1);
    renderer.fx.fadeColor.set(0, 0, 0);
    this.game.sfx.ambient('quarto');

    this.timeScale = 1;
    if (opts.jump) this.jumpTo(opts.jump);
    else this.enterPhone();
  }

  // Atalhos do /admin: começa direto em uma parte da cena
  jumpTo(id) {
    const { renderer } = this.game;
    const side = () => {
      this.tweens.clear();
      this.token++;
      this.phoneRig.visible = false;
      renderer.fx.fade = 1;
      this.enterSide();
      this.tweens.to({ duration: 0.6, onUpdate: (k) => (renderer.fx.fade = 1 - k) });
    };
    switch (id) {
      case 'perfil':
      case 'bateria':
        this.enterPhone();
        this.app.showNotification();
        this.app.screen = 'profile';
        this.seenProfile = true;
        this.engage.profile = true;
        if (id === 'bateria') {
          this.engage.posts = 1;
          this.batteryClock = 2.4;
        }
        break;
      case 'levantar':
        this.enterPhone();
        this.tweens.clear();
        this.token++;
        renderer.fx.fade = 0;
        this.raise = 1;
        this.app.die();
        this.app.deadT = 5;
        this.screenLight.intensity = 0;
        this.standUp();
        break;
      case 'escuro':
        side();
        break;
      case 'luz':
        side();
        this.room.setLight(1);
        break;
      case 'estante':
      case 'criado':
      case 'mochila':
      case 'papeis':
      case 'travesseiro':
      case 'cortina': {
        side();
        this.room.setLight(1);
        const map = { papeis: 'ingressos', travesseiro: 'cama' };
        const it = this.room.interactables.find((o) => o.id === (map[id] || id));
        this.x = it.x;
        this.camX = clamp(it.x + 0.45, -1.15, 1.15);
        const tok = this.token;
        this.tweens.wait(0.8).then(() => tok === this.token && this.interact(it));
        break;
      }
      case 'gaveta':
      case 'capitulo':
        side();
        this.room.setLight(1);
        this.x = 1.35;
        this.camX = 1.15;
        if (id === 'capitulo') this.timeScale = 25; // passa a cena da gaveta bem rápido
        this.openDrawer();
        break;
      default:
        this.enterPhone();
    }
  }

  exit() {
    const { renderer, ui, sfx } = this.game;
    this.tweens.clear();
    this.token++;
    renderer.setRows(this.game.settings.rows);
    renderer.fx.tint.set(1, 1, 1);
    renderer.fx.shakeX = renderer.fx.shakeY = 0;
    ui.hint(null);
    ui.setHintScope(null);
    ui.clearSay();
    ui.pause(null);
    ui.layout(null);
    ui.interact(null);
    ui.chapter(null);
    sfx.stopAmbient(0.6);
    this.game.canvas.style.cursor = 'default';
  }

  // Dissolve para preto, troca o que precisar e volta
  async cut(swap, outT = 0.4, inT = 0.6) {
    const { renderer } = this.game;
    renderer.fx.fadeColor.set(0, 0, 0);
    const from = renderer.fx.fade;
    await this.tweens.to({ duration: outT, ease: ease.inQuad, onUpdate: (k) => (renderer.fx.fade = lerp(from, 1, k)) });
    swap();
    await this.tweens.to({ duration: inT, ease: ease.outCubic, onUpdate: (k) => (renderer.fx.fade = 1 - k) });
  }

  // -------------------------------------------------------------
  // 1. Celular (primeira pessoa)
  // -------------------------------------------------------------

  enterPhone() {
    const { renderer, ui, sfx, save } = this.game;
    this.tweens.clear();
    const tok = ++this.token;
    const tw = this.tweens;
    this.mode = 'phone';
    this.camera = this.fpCam;
    this.phoneRig.visible = true;
    this.app.reset();
    ui.layout('phone');
    renderer.fx.bloom = 0.55;
    save.set({ cena: 'quarto' });

    // Câmera nos olhos dela, olhando para baixo, para o celular
    this.fpCam.position.set(-0.9, 1.36, -1.72);
    this.fpCam.lookAt(0.8, 0.6, -1.45);
    this.baseQuat = this.fpCam.quaternion.clone();

    // Corte seco do olho para a tela: só um ajuste leve do celular na mão
    renderer.fx.fadeColor.set(0, 0, 0);
    renderer.fx.fade = 1;
    tw.to({ duration: 0.55, ease: ease.outCubic, onUpdate: (k) => (renderer.fx.fade = 1 - k) });
    this.raise = 0.93;
    tw.to({ duration: 0.6, ease: ease.outBack, onUpdate: (k) => (this.raise = lerp(0.93, 1, k)) });
    ui.hint(HINT_PHONE);
    tw.wait(0.4).then(() => tok === this.token && ui.caption('SEXTA-FEIRA  ·  23:47', 3));

    tw.wait(1.1).then(() => {
      if (tok !== this.token) return;
      this.app.showNotification();
      sfx.notify();
      this.buzz = 0.6;
    });
    tw.wait(2.0).then(() => tok === this.token && ui.say('Ela postou de novo.', { hold: 2 }));
  }

  thoughtLater(key, text, delay = 0.6) {
    const tok = this.token;
    this.tweens.wait(delay).then(() => tok === this.token && this.thought(key, text));
  }

  thought(key, text, opts) {
    if (this.thoughtsShown.has(key)) return;
    this.thoughtsShown.add(key);
    this.game.ui.say(text, opts);
  }

  // Fala em balão em cima da cabeça (conversa entre personagens).
  // who = mesh do personagem (padrão: a Ani). Ex.: await this.speak('Oi!', { who: malu.mesh, id: 'malu' })
  speak(text, { who = this.ani.mesh, id = 'ani', ...opts } = {}) {
    return this.game.ui.bubbleWait(text, { id, ...opts, anchor: () => this.headScreen(who) });
  }

  // topo da cabeça de um personagem, em pixels da janela
  headScreen(obj, lift = 0.04) {
    const box = new THREE.Box3().setFromObject(obj);
    const p = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y + lift, (box.min.z + box.max.z) / 2);
    return this.toScreen(p, this.camera);
  }

  onAppEvent(name, data) {
    const { sfx } = this.game;
    switch (name) {
      case 'tap':
        sfx.tap();
        this.press = 1;
        break;
      case 'unlock':
        sfx.unlockPhone();
        break;
      case 'lock':
        sfx.back();
        break;
      case 'arrive':
        if (data === 'profile' && !this.seenProfile) {
          this.seenProfile = true;
          this.engage.profile = true;
          this.thought('perfil', 'Só vou dar uma olhada. Ninguém fica sabendo.');
        }
        break;
      case 'open-post': {
        this.engage.posts++;
        const text = POST_THOUGHTS[data.id];
        if (text) this.thoughtLater(`post-${data.id}`, text, 0.7);
        break;
      }
      case 'back':
        sfx.back();
        break;
      case 'scroll-tick':
        sfx.scrollTick();
        break;
      case 'focus': // controle trocou o item escolhido
        sfx.hover();
        break;
      case 'focus-edge':
        sfx.scrollTick();
        break;
      case 'deep':
        this.engage.deep = true;
        this.thought('deep', 'Tô rolando isso há quanto tempo?');
        break;
      case 'story':
        sfx.deny();
        this.thought('story', 'Não. Se eu abrir o story, ela vê que eu vi.');
        break;
      case 'follow':
        sfx.deny();
        this.thought('follow', 'Nem pensar.');
        break;
      case 'message':
        sfx.deny();
        this.thought('message', 'E dizer o quê? "Oi, sumida"?');
        break;
      case 'highlight':
        if (data === 3) this.thought('nos', '"nós?" ...com interrogação.');
        break;
      case 'open-me':
        this.engage.me = true;
        this.thoughtLater('me', 'Nada. Nunca tem nada pra postar.');
        break;
      case 'first-post':
        sfx.deny();
        this.thought('first-post', 'Postar o quê? O teto do meu quarto?');
        break;
      case 'edit':
      case 'nav':
        sfx.deny();
        break;
      case 'comments':
        this.thought('comments', 'Não vou ler os comentários. ...Não vou.');
        break;
      case 'like':
        this.onLike(data);
        break;
      case 'unlike':
        this.onUnlike();
        break;
      default:
        break;
    }
  }

  // Curtiu sem querer: a bateria (que já estava no fim) acaba ali mesmo.
  // O celular trava na hora, então não dá tempo de descurtir.
  onLike(post) {
    if (this.mode !== 'phone') return;
    const { sfx, ui, renderer } = this.game;
    sfx.like();
    sfx.impact();
    this.panic = 1;
    this.buzz = 0.5;
    renderer.fx.glitch = 0.9;
    // trava a tela (todas as entradas do celular só funcionam no modo 'phone')
    this.mode = 'dying';
    this.batteryStage = 2;
    this.app.locked = true;
    this.app.cancelPointer();
    this.app.hoverHit = null;
    this.game.canvas.style.cursor = 'default';
    ui.hint(null);
    let msg = 'NÃO! Eu curti?! Descurte, descur—';
    if (post.weeks >= 40) msg = `NÃO. Uma foto de ${post.weeks} semanas atrás. Descur—`;
    else if (post.weeks === 0) msg = 'NÃO! Ela postou AGORA. Ela vai v—';
    ui.say(msg, { panic: true, hold: 3 });
    const tok = this.token;
    const tw = this.tweens;
    // a tela engasga, o dedo vai até o coração... e apaga um instante antes
    tw.wait(0.45).then(() => {
      if (tok !== this.token) return;
      this.app.battery = 1;
      renderer.fx.glitch = 1;
      sfx.warn();
    });
    tw.wait(0.75).then(() => {
      if (tok !== this.token) return;
      this.press = 1;
      sfx.tap();
    });
    tw.wait(0.82).then(() => tok === this.token && this.phoneDies(post));
  }

  onUnlike() {
    if (this.mode !== 'phone') return;
    const { sfx, ui } = this.game;
    sfx.back();
    this.panic = Math.min(this.panic, 0.4);
    ui.say('...será que deu tempo? Ela não viu. Ela não viu.', { hold: 3 });
    ui.hint(HINT_PHONE);
  }

  // -------------------------------------------------------------
  // 2. A bateria acaba
  // -------------------------------------------------------------

  updateBattery(dt) {
    const { ui } = this.game;
    const e = this.engage;
    if (e.profile) this.idleClock += dt;
    const engaged = e.profile && (e.posts >= 1 || e.deep || e.me || this.idleClock > 35);
    const calm = !ui.speaking && this.panic < 0.15 && !this.app.trans;
    if (!engaged || !calm) return;
    this.batteryClock += dt;
    if (this.batteryStage === 0 && this.batteryClock > 2.5) {
      this.batteryStage = 1;
      this.app.lowBattery();
      this.game.sfx.warn();
      this.buzz = 0.5;
      ui.say('1%? Não, não, não...', { hold: 1.8 });
    } else if (this.batteryStage === 1 && this.batteryClock > 7.5) {
      this.batteryStage = 2;
      this.phoneDies();
    }
  }

  // likedPost: o post que ela curtiu sem querer (o celular morreu com a curtida lá)
  async phoneDies(likedPost = null) {
    const { ui, sfx } = this.game;
    const tok = ++this.token;
    this.mode = 'dying';
    this.app.die();
    sfx.powerDown();
    ui.hint(null);
    this.tweens.to({ duration: 0.4, onUpdate: (k) => (this.screenLight.intensity = 0.35 * (1 - k)) });
    if (likedPost) {
      this.likedByAccident = likedPost;
      await this.tweens.wait(1.6);
      if (tok !== this.token) return;
      this.panic = Math.max(this.panic, 0.7);
      await ui.sayWait('Não... não, não, não.', { hold: 1.1, panic: true });
      if (tok !== this.token) return;
      await ui.sayWait('Ficou curtido.', { hold: 1.4 });
      if (tok !== this.token) return;
      const line = likedPost.weeks >= 40 ? 'Ela vai saber que eu tava fuçando o perfil dela.' : likedPost.weeks === 0 ? 'Ela vai ver agora. Agora.' : 'Ela vai ver. Ela vai saber que fui eu.';
      await ui.sayWait(line, { hold: 1.8 });
      if (tok !== this.token) return;
      await ui.sayWait('Preciso carregar isso. AGORA.', { hold: 1.4 });
      if (tok !== this.token) return;
      this.standUp();
      return;
    }
    await this.tweens.wait(2.4);
    if (tok !== this.token) return;
    await ui.sayWait('Não. Agora não.', { hold: 1.2 });
    if (tok !== this.token) return;
    await ui.sayWait('Cadê a porcaria do carregador?', { hold: 1.4 });
    if (tok !== this.token) return;
    this.standUp();
  }

  // -------------------------------------------------------------
  // 3. Levantando da cama (primeira pessoa)
  // -------------------------------------------------------------

  async standUp() {
    const { ui, sfx } = this.game;
    const tok = this.token;
    const tw = this.tweens;
    this.mode = 'standup';
    ui.layout(null);
    this.roll = 0;
    const pos = this.fpCam.position.clone();
    const look = new THREE.Vector3(0.8, 0.6, -1.45);
    this.camPos = pos;
    this.camLook = look;

    // abaixa o celular apagado
    sfx.rustle();
    await tw.to({ duration: 0.8, ease: ease.inCubic, onUpdate: (k) => (this.raise = 1 - k) });
    this.phoneRig.visible = false;
    if (tok !== this.token) return;

    // olha em volta, no escuro
    const L1 = new THREE.Vector3(0.4, 1.0, 0.7);
    const L0 = look.clone();
    await tw.to({ duration: 1.4, ease: ease.inOutSine, onUpdate: (k) => look.lerpVectors(L0, L1, k) });
    if (tok !== this.token) return;

    // tira as pernas da cama, inclinando para frente
    sfx.creak();
    sfx.rustle();
    const P0 = pos.clone(), P1 = new THREE.Vector3(-0.88, 1.16, -1.3);
    const L2 = new THREE.Vector3(-0.55, 0.0, 0.9);
    await tw.to({
      duration: 1.0, ease: ease.inOutCubic,
      onUpdate: (k) => {
        pos.lerpVectors(P0, P1, k);
        look.lerpVectors(L1, L2, k);
        this.roll = Math.sin(k * Math.PI) * 0.05;
      },
    });
    if (tok !== this.token) return;

    // levanta
    sfx.thump();
    const P2 = new THREE.Vector3(-0.85, 1.6, -0.82);
    const L3 = new THREE.Vector3(1.8, 1.3, 0.4);
    await tw.to({
      duration: 1.35, ease: ease.outCubic,
      onUpdate: (k) => {
        pos.lerpVectors(P1, P2, k);
        pos.y += Math.sin(k * Math.PI) * 0.04;
        look.lerpVectors(L2, L3, ease.inOutSine(k));
        this.roll = -Math.sin(k * Math.PI) * 0.04;
      },
    });
    if (tok !== this.token) return;
    sfx.step();
    await ui.sayWait('Tá um breu. Cadê o interruptor...', { hold: 1.2 });
    if (tok !== this.token) return;
    await this.cut(() => this.enterSide(), 0.45, 0.8);
  }

  // -------------------------------------------------------------
  // 4. Visão lateral: andar, acender a luz, procurar
  // -------------------------------------------------------------

  enterSide() {
    const { ui } = this.game;
    this.mode = 'side';
    this.camera = this.sideCam;
    this.game.renderer.fx.bloom = 0.9;
    const { lane } = this.room;
    this.x = -0.85;
    this.vel = 0;
    this.velZ = 0;
    this.camX = this.x + 0.4;
    this.camZ = 0;
    this.obstacles ??= this.findObstacles();
    this.ani.mesh.visible = true;
    this.ani.shadow.visible = true;
    this.ani.facing = 1;
    this.ani.pose(null);
    this.z = lane.z;
    this.script = null;
    this.ani.mesh.position.set(this.x, 0, lane.z);
    ui.hint(HINT_SIDE);
    this.near = null;
  }

  // Volta tudo do quarto para o lugar (ao entrar na cena ou pular partes)
  resetRoomState() {
    const r = this.room;
    r.setCurtain(0);
    const home = r.pillow.userData.home;
    r.pillow.position.copy(home.pos);
    r.pillow.quaternion.copy(home.quat);
    r.pillow.scale.set(1, 1, 1);
    r.backpack.closed.visible = true;
    r.backpack.open.visible = false;
    for (const p of r.papers) {
      p.mesh.position.copy(p.mesh.userData.home.pos);
      p.mesh.quaternion.copy(p.mesh.userData.home.quat);
      p.mesh.material.emissive.setScalar(0);
      p.hov = 0;
    }
    for (const it of r.interactables) setGlow(it.obj, 0);
    for (const o of r.lampParts) o.visible = true;
    r.setPlasmaTouch(null);
    this.glowObj = null;
    this.inspect = null;
    this.zen = null;
    this.script = null;
    this.ani?.pose(null);
    if (this.aniTop) this.aniTop.mesh.visible = this.aniTop.shadow.visible = false;
    this.dim.visible = false;
    this.dim.material.opacity = 0;
    this.eyeLight.intensity = 0;
    this.camera = this.fpCam;
  }

  // Móveis no chão viram retângulos (vistos de cima) que ela contorna.
  // Coisas chatas (tapete, papéis) e paredes ficam de fora.
  findObstacles() {
    const out = [];
    const v = new THREE.Vector3();
    this.room.group.updateMatrixWorld(true);
    for (const c of this.room.group.children) {
      const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = min.clone().negate();
      c.traverse((o) => {
        if (!o.isMesh) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const bb = o.geometry.boundingBox;
        for (let i = 0; i < 8; i++) {
          v.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(o.matrixWorld);
          min.min(v);
          max.max(v);
        }
      });
      if (!isFinite(min.x)) continue;
      const tall = max.y - min.y, w = max.x - min.x, d = max.z - min.z;
      if (min.y > 0.1 || tall < 0.12 || w > 2.9 || d > 2.9) continue;
      // folga: meia largura dela de lado, quase nada na profundidade (é uma placa)
      out.push({ x0: min.x - 0.2, x1: max.x + 0.2, z0: min.z - 0.07, z1: max.z + 0.07 });
    }
    return out;
  }

  blocked(x, z) {
    return this.obstacles.some((o) => x > o.x0 && x < o.x1 && z > o.z0 && z < o.z1);
  }

  // Luz de contorno: soma as lâmpadas acesas, pesando as que estão do lado e atrás dela
  updateRim() {
    const P = new THREE.Vector3(this.x, 1.0, this.z);
    const col = new THREE.Color(0, 0, 0), c = new THREE.Color();
    let wSum = 0, xSum = 0;
    const L = new THREE.Vector3();
    this.room.group.traverse((o) => {
      if (!o.isLight || !o.visible || o.intensity <= 0 || o.isHemisphereLight || o.isAmbientLight) return;
      let w, lx;
      if (o.isDirectionalLight) {
        L.copy(o.position).sub(o.target.position).normalize();
        w = o.intensity * 0.6 * (0.3 + Math.max(0, -L.z) * 0.5 + Math.abs(L.x) * 0.6);
        lx = P.x + L.x * 3;
      } else {
        o.getWorldPosition(L);
        const d2 = Math.max(0.3, L.distanceToSquared(P));
        L.sub(P).normalize();
        w = (o.intensity / d2) * (0.25 + Math.max(0, -L.z) * 0.6 + Math.abs(L.x) * 0.5);
        lx = P.x + L.x;
      }
      col.add(c.copy(o.color).multiplyScalar(w));
      xSum += lx * w;
      wSum += w;
    });
    col.multiplyScalar(RIM_GAIN);
    const m = Math.max(col.r, col.g, col.b);
    if (m > 0.6) col.multiplyScalar(0.6 / m);
    this.ani.setRim(col, wSum > 0 ? xSum / wSum : this.x + 1);
    // preenchimento: quente com a luz acesa, azul da lua no escuro
    const k = this.room.light;
    this.ani.setFill(FILL_DARK.clone().lerp(FILL_LIT, k), lerp(0.62, 0.5, k));
  }

  nearestInteractable() {
    let best = null;
    let bestD = 1;
    const laneZ = this.room.lane.z;
    for (const it of this.room.interactables) {
      // na frente da faixa dos móveis conta mais (ela tem que chegar perto);
      // ir para o fundo, em direção ao móvel, não atrapalha
      const dz = Math.max(0, this.z - (it.z ?? laneZ)) / 0.55 + Math.max(0, (it.z ?? laneZ) - 0.35 - this.z) / 0.55;
      const d = Math.hypot((it.x - this.x) / 0.34, dz);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    return best;
  }

  async interact(it) {
    if (this.busy || !it) return;
    const { ui, sfx } = this.game;
    const dark = this.room.light < 0.5;
    this.busy = true;
    this.ani.reach(0.45);
    this.ani.facing = Math.sign(it.x - this.x) || this.ani.facing;

    if (it.id === 'interruptor') {
      if (dark) await this.lightsOn();
      else {
        sfx.click();
        ui.say('Melhor deixar acesa.', { hold: 1.2 });
      }
    } else if (dark) {
      sfx.deny();
      this.thought('escuro', 'Tá escuro demais pra achar qualquer coisa.', { hold: 1.6 });
    } else if (it.id === 'gaveta') {
      this.busy = false;
      this.openDrawer();
      return;
    } else if (it.id === 'estante' || it.id === 'criado' || it.id === 'mochila') {
      this.enterInspect(it.id);
      return;
    } else if (it.id === 'ingressos') {
      this.enterZenital();
      return;
    } else if (it.id === 'cortina') {
      await this.toggleCurtain();
    } else if (it.id === 'cama') {
      await this.liftPillow();
      return;
    } else {
      sfx.tap();
      ui.say(LINES[it.id], { hold: 1.8 });
      this.countSearch(it.id);
    }
    await this.tweens.wait(0.5);
    this.busy = false;
  }

  // Cada lugar revistado conta uma vez; depois de dois, ela lembra da gaveta
  countSearch(id) {
    if (this.thoughtsShown.has(`busca-${id}`)) return;
    this.thoughtsShown.add(`busca-${id}`);
    this.searches++;
    if (this.searches === 2) this.thoughtLater('dica', 'Talvez... na gaveta da escrivaninha.', 3.2);
  }

  async lightsOn() {
    const { sfx, ui } = this.game;
    sfx.click();
    // a lâmpada pisca antes de firmar
    for (const [f, s] of [[0.5, 0.06], [0, 0.1], [0.9, 0.05], [0.15, 0.12], [1, 0]]) {
      this.room.setLight(1, f);
      if (f > 0.4) sfx.hum();
      if (s) await this.tweens.wait(s);
    }
    this.game.renderer.fx.aberration = 0.006;
    await this.tweens.wait(0.7);
    ui.say('Pronto. Agora... o carregador.', { hold: 1.6 });
  }

  // -------------------------------------------------------------
  // 4a. Cortina (abre e fecha com o tecido balançando)
  // -------------------------------------------------------------

  async toggleCurtain() {
    const { sfx } = this.game;
    const room = this.room;
    const closing = room.curtain < 0.5;
    const a = closing ? 0 : 1, b = 1 - a;
    this.ani.reach(0.7);
    sfx.cloth();
    sfx.rings();
    room.shakeCurtains(1);
    // a da esquerda puxa primeiro, a da direita vem logo depois
    await this.tweens.to({
      duration: 1.3, ease: ease.linear,
      onUpdate: (_, p) => {
        const kL = ease.inOutCubic(clamp(p / 0.78));
        const kR = ease.inOutCubic(clamp((p - 0.22) / 0.78));
        room.setCurtain(lerp(a, b, kL), lerp(a, b, kR));
      },
    });
    room.shakeCurtains(0.7);
    sfx.thump();
    if (closing) this.thought('cortina', 'Melhor. Parece que a cidade inteira tava olhando.', { hold: 2 });
    else this.thought('cortina-abre', 'A lua tá bonita hoje.', { hold: 1.6 });
  }

  // -------------------------------------------------------------
  // 4b. Travesseiro: ela vai até a cama, levanta e devolve
  // -------------------------------------------------------------

  async liftPillow() {
    const { sfx, ui } = this.game;
    const tok = this.token;
    const tw = this.tweens;
    const room = this.room;
    const P = room.pillow;
    const home = P.userData.home;
    const laneZ = room.lane.z;
    ui.interact(null);
    // anda até a beira da cama
    const from = { x: this.x, z: this.z };
    const spot = { x: -1.92, z: -1.1 };
    this.script = { x: this.x, z: this.z };
    await tw.to({
      duration: 0.6, ease: ease.inOutSine,
      onUpdate: (k) => {
        this.script.x = lerp(from.x, spot.x, k);
        this.script.z = lerp(from.z, spot.z, k);
      },
    });
    if (tok !== this.token) return;
    this.ani.facing = -1;
    // se abaixa e pega
    this.ani.pose(13);
    sfx.rustle();
    await tw.wait(0.16);
    if (tok !== this.token) return;
    const hold = new THREE.Vector3(spot.x - 0.2, 0.9, spot.z + 0.05); // abraçado contra o peito
    const qHold = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0.25, 0.3));
    this.pillowQ = qHold;
    const p0 = home.pos.clone();
    const mid = p0.clone().lerp(hold, 0.5).add(new THREE.Vector3(0, 0.32, 0));
    const bez = (a, m, c, k) => a.clone().multiplyScalar((1 - k) ** 2).addScaledVector(m, 2 * (1 - k) * k).addScaledVector(c, k * k);
    let swapped = false;
    await tw.to({
      duration: 0.5, ease: ease.outCubic,
      onUpdate: (k) => {
        P.position.copy(bez(p0, mid, hold, k));
        P.quaternion.slerpQuaternions(home.quat, qHold, k);
        const st = Math.sin(k * Math.PI);
        P.scale.set(1 - st * 0.08, 1 - st * 0.12, 1 + st * 0.16); // estica no ar
        if (k > 0.45 && !swapped) {
          swapped = true;
          this.ani.pose(14);
        }
      },
    });
    if (tok !== this.token) return;
    // segura no alto, dá uma sacudida e olha embaixo
    sfx.cloth();
    this.pillowHold = { pos: hold.clone(), t: 0 };
    ui.say('Nem embaixo do travesseiro.', { hold: 1.2 });
    await tw.wait(1.9);
    if (tok !== this.token) return;
    this.pillowHold = null;
    // devolve: cai na cama e afunda um pouco
    this.ani.pose(13);
    const h0 = P.position.clone();
    const q0 = P.quaternion.clone();
    const mid2 = h0.clone().lerp(home.pos, 0.5).add(new THREE.Vector3(0, 0.18, 0));
    await tw.to({
      duration: 0.38, ease: ease.inQuad,
      onUpdate: (k) => {
        P.position.copy(bez(h0, mid2, home.pos, k));
        P.quaternion.slerpQuaternions(q0, home.quat, k);
      },
    });
    if (tok !== this.token) return;
    sfx.thump();
    sfx.rustle();
    this.tweens.to({
      duration: 0.6, ease: ease.outElastic,
      onUpdate: (k) => {
        const sq = 1 - k;
        P.scale.set(1 + sq * 0.14, 1 - sq * 0.4, 1 + sq * 0.14);
      },
    });
    await tw.wait(0.25);
    this.ani.pose(null);
    // volta para o meio do quarto
    const back = { x: spot.x + 0.2, z: laneZ };
    const s0 = { x: this.x, z: this.z };
    await tw.to({
      duration: 0.5, ease: ease.inOutSine,
      onUpdate: (k) => {
        this.script.x = lerp(s0.x, back.x, k);
        this.script.z = lerp(s0.z, back.z, k);
      },
    });
    this.script = null;
    this.countSearch('cama');
    this.busy = false;
  }

  // -------------------------------------------------------------
  // 4c. Vistas de perto (primeira pessoa): estante, criado-mudo, mochila
  // -------------------------------------------------------------

  sideCamPose() {
    const target = clamp(this.x + this.ani.facing * 0.45, -1.15, 1.15);
    const probe = new THREE.PerspectiveCamera();
    probe.position.set(this.camX ?? target, 1.5, 3.35);
    probe.lookAt(this.camX ?? target, 0.98, -1.2);
    return { pos: probe.position.clone(), quat: probe.quaternion.clone(), fov: this.sideCam.fov };
  }

  // Leva a closeCam de onde está até uma pose, com um arco e um "puxão" de lente
  async flyCam({ pos, quat, fov, up = new THREE.Vector3(0, 1, 0) }, duration, onProgress) {
    const cam = this.closeCam;
    const fx = this.game.renderer.fx;
    const p0 = cam.position.clone(), q0 = cam.quaternion.clone(), f0 = cam.fov;
    const ab0 = fx.aberration;
    await this.tweens.to({
      duration, ease: ease.inOutCubic,
      onUpdate: (k, raw) => {
        cam.position.lerpVectors(p0, pos, k);
        cam.position.y += Math.sin(k * Math.PI) * 0.12;
        cam.quaternion.slerpQuaternions(q0, quat, k);
        cam.fov = lerp(f0, fov, k) + Math.sin(k * Math.PI) * 6;
        cam.updateProjectionMatrix();
        fx.aberration = ab0 + Math.sin(raw * Math.PI) * 0.007;
        onProgress?.(k);
      },
    });
    cam.up.copy(up);
  }

  inspectTargets(id) {
    const r = this.room;
    if (id === 'estante') {
      return r.books.filter((b) => b.userData.info).map((b) => ({
        obj: b, kind: 'book', label: titleCase(b.userData.info.t), line: b.userData.info.line,
        base: b.position.clone(), h: 0, pick: 0, picked: false, jump: 0,
      }));
    }
    if (id === 'criado') {
      return Object.entries(r.nightstand.items).map(([key, obj]) => ({
        obj, kind: 'item', ...NIGHTSTAND[key], base: obj.position.clone(), rot: obj.rotation.clone(), h: 0, jump: 0,
      }));
    }
    return r.backpack.items.map((obj) => ({
      obj, kind: 'bag', label: obj.userData.label, line: obj.userData.line,
      base: obj.userData.base.clone(), rot: obj.rotation.clone(), h: 0, jump: 0,
    }));
  }

  async enterInspect(id) {
    const { ui, sfx } = this.game;
    const tok = ++this.token;
    const cfg = INSPECT[id];
    this.mode = 'inspect-in';
    this.busy = true;
    ui.interact(null);
    ui.hint(null);
    this.ani.reach(0.5);
    if (this.glowObj) setGlow(this.glowObj, 0);
    this.glowObj = null;

    const cam = this.closeCam;
    cam.up.set(0, 1, 0);
    cam.position.copy(this.sideCam.position);
    cam.quaternion.copy(this.sideCam.quaternion);
    cam.fov = this.sideCam.fov;
    cam.updateProjectionMatrix();
    this.camera = cam;

    const probe = new THREE.PerspectiveCamera();
    probe.position.set(...cfg.pos);
    probe.lookAt(...cfg.look);
    sfx.whooshSoft();
    if (id === 'mochila') {
      sfx.zipper();
      this.room.backpack.nudgeClosed();
    }
    let swapped = false;
    await this.flyCam({ pos: probe.position, quat: probe.quaternion, fov: cfg.fov }, 1.0, (k) => {
      const show = k < 0.42;
      this.ani.mesh.visible = this.ani.shadow.visible = show;
      if (id === 'mochila' && k > 0.3 && !swapped) {
        swapped = true;
        this.room.backpack.closed.visible = false;
        this.room.backpack.open.visible = true;
        this.room.backpack.pop();
        sfx.thump();
      }
    });
    if (tok !== this.token) return;
    this.tweens.to({ duration: 0.6, onUpdate: (k) => (this.eyeLight.intensity = 0.9 * k) });
    this.mode = 'inspect';
    this.inspect = {
      id, cfg,
      baseQuat: probe.quaternion.clone(),
      look: new THREE.Vector2(),
      targets: this.inspectTargets(id),
      hover: null,
      hoverHold: 0,
      plasma: false,
      settle: 1,
      sel: 0, // item escolhido pelo controle
      plasmaPad: null, // controle guiando os raios do plasma
    };
    {
      // pontos de tela de cada item, com a câmera parada (não "foge" quando a câmera vira)
      const ins = this.inspect;
      const probeCam = cam.clone();
      probeCam.position.set(...cfg.pos);
      probeCam.quaternion.copy(ins.baseQuat);
      probeCam.updateMatrixWorld(true);
      const c = new THREE.Vector3();
      ins.opts = ins.targets.map((tg) => {
        new THREE.Box3().setFromObject(tg.obj).getCenter(c);
        const [x, y] = this.toScreen(c, probeCam);
        return { tg, x, y };
      });
      if (id === 'criado') {
        const [x, y] = this.toScreen(this.room.plasma.sprite.position, probeCam);
        ins.opts.push({ plasma: true, x, y });
      }
      for (const o of ins.opts) {
        o.nx = (o.x / window.innerWidth) * 2 - 1;
        o.ny = 1 - (o.y / window.innerHeight) * 2;
      }
      ins.sel = centerPick(ins.opts);
    }
    ui.hint(HINT_INSPECT);
    ui.caption(cfg.title, 2.2);
    sfx.pop();
  }

  async exitInspect() {
    const { ui, sfx } = this.game;
    const ins = this.inspect;
    if (!ins || this.mode !== 'inspect') return;
    const tok = ++this.token;
    this.mode = 'inspect-out';
    ui.interact(null);
    ui.hint(null);
    this.game.canvas.style.cursor = 'default';
    this.room.setPlasmaTouch(null);
    // tudo volta para o lugar
    for (const tg of ins.targets) {
      setGlow(tg.obj, 0);
      tg.obj.position.copy(tg.base);
      if (tg.rot) tg.obj.rotation.copy(tg.rot);
      tg.obj.scale.set(1, 1, 1);
      tg.obj.userData.reset?.();
    }
    sfx.whooshSoft();
    if (ins.id === 'mochila') sfx.zipper();
    let swapped = false;
    const pose = this.sideCamPose();
    this.tweens.to({ duration: 0.4, onUpdate: (k) => (this.eyeLight.intensity = 0.9 * (1 - k)) });
    await this.flyCam(pose, 0.85, (k) => {
      const show = k > 0.55;
      this.ani.mesh.visible = this.ani.shadow.visible = show;
      if (ins.id === 'mochila' && k > 0.6 && !swapped) {
        swapped = true;
        this.room.backpack.closed.visible = true;
        this.room.backpack.open.visible = false;
        this.room.backpack.nudgeClosed();
      }
    });
    if (tok !== this.token) return;
    this.inspect = null;
    this.camera = this.sideCam;
    this.mode = 'side';
    this.busy = false;
    ui.hint(HINT_SIDE);
    ui.say(LINES[ins.id], { hold: 1.8 });
    this.countSearch(ins.id);
  }

  updateInspect(dt, t) {
    const ins = this.inspect;
    const { mouse, ui } = this.game;
    const cam = this.closeCam;
    const pad = this.game.inputMode === 'pad';
    const opt = ins.opts[ins.sel];
    // olhar com o mouse (com folga, como mexer a cabeça).
    // No controle: a cabeça vira de leve para o item escolhido, mais o analógico direito.
    let lx = mouse.x, ly = mouse.y;
    if (pad) {
      const free = ins.plasmaPad ? 0 : 0.6;
      lx = clamp(opt.nx * 0.55 + mouse.x * free, -1, 1);
      ly = clamp(opt.ny * 0.55 + mouse.y * free, -1, 1);
    }
    ins.look.x = damp(ins.look.x, lx, pad ? 3.5 : 5, dt);
    ins.look.y = damp(ins.look.y, ly, pad ? 3.5 : 5, dt);
    const off = new THREE.Quaternion().setFromEuler(new THREE.Euler(ins.look.y * ins.cfg.pan[1], -ins.look.x * ins.cfg.pan[0], 0, 'YXZ'));
    cam.quaternion.copy(ins.baseQuat).multiply(off);
    cam.position.set(...ins.cfg.pos);
    cam.position.y += Math.sin(t * 1.2) * 0.003; // respiração
    cam.updateMatrixWorld(true);

    let hover = null;
    let hits = [];
    let plasmaHit = null;
    if (pad) {
      // controle: o item escolhido é o destacado
      hover = opt.tg || null;
    } else {
      // o que está embaixo do mouse
      this.raycaster.setFromCamera(mouse, cam);
      // Testa o mouse com cada item na pose de repouso (antes de subir/girar/amassar).
      // Assim o item não "foge" de baixo do mouse ao reagir — era isso que fazia tremer.
      hits = this.pickAtRest(ins.targets);
      if (hits.length) hover = ins.targets.find((tg) => isAncestor(tg.obj, hits[0].object)) || null;
      // pequena tolerância ao sair (evita piscar na borda)
      if (!hover && ins.hover && ins.hoverHold > 0) {
        ins.hoverHold -= dt;
        hover = ins.hover;
      } else if (hover) ins.hoverHold = 0.08;
    }

    // luminária de plasma: os raios seguem o mouse (no controle: A e o analógico)
    if (ins.id === 'criado' && pad) {
      const pp = ins.plasmaPad;
      if (pp) {
        // o dedo segue o analógico dentro da esfera; solto, descansa na última direção
        const m = Math.hypot(mouse.x, mouse.y);
        let tx, ty;
        if (m > 0.15) {
          const k = Math.min(1, m) / m;
          tx = mouse.x * k * 0.92;
          ty = mouse.y * k * 0.92;
          pp.lx = mouse.x / m;
          pp.ly = mouse.y / m;
        } else {
          tx = pp.lx * 0.5;
          ty = pp.ly * 0.5;
        }
        pp.x = damp(pp.x, tx, 14, dt);
        pp.y = damp(pp.y, ty, 14, dt);
        const S = this.room.plasma.sprite;
        const uv = new THREE.Vector2(0.5 + pp.x * 0.4, 0.5 + pp.y * 0.4);
        const R = S.scale.x * 0.4;
        const world = S.position.clone()
          .addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), pp.x * R)
          .addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion), pp.y * R);
        this.room.setPlasmaTouch(uv, world);
        plasmaHit = { pad: true };
      } else this.room.setPlasmaTouch(null);
      const touching = this.room.plasma.touching;
      if (touching && !ins.plasma) {
        this.game.sfx.zap();
        this.thought('plasma', 'Os raios vêm atrás do dedo. Sempre achei isso bonito.', { hold: 2.2 });
      }
      if (touching && Math.random() < dt * 6) this.game.sfx.zap();
      ins.plasma = touching;
    } else if (ins.id === 'criado') {
      const ph = this.raycaster.intersectObject(this.room.plasma.sprite);
      if (ph.length && (!hits.length || ph[0].distance < hits[0].distance)) {
        plasmaHit = ph[0];
        hover = null;
      }
      this.room.setPlasmaTouch(plasmaHit ? plasmaHit.uv : null, plasmaHit?.point);
      const touching = this.room.plasma.touching;
      if (touching && !ins.plasma) {
        this.game.sfx.zap();
        this.thought('plasma', 'Os raios vêm atrás do dedo. Sempre achei isso bonito.', { hold: 2.2 });
      }
      if (touching && Math.random() < dt * 6) this.game.sfx.zap();
      ins.plasma = touching;
    }

    if (hover !== ins.hover) {
      if (hover) this.game.sfx.hover();
      ins.hover = hover;
    }
    for (const tg of ins.targets) {
      tg.h = damp(tg.h, tg === hover ? 1 : 0, 14, dt);
      tg.jump = Math.max(0, tg.jump - dt * 2.6);
      const j = Math.sin(tg.jump * Math.PI) * tg.jump;
      if (tg.kind === 'book') {
        tg.pick = damp(tg.pick, tg.picked ? 1 : 0, 10, dt);
        tg.obj.position.x = tg.base.x + tg.h * 0.045 + tg.pick * 0.09;
        tg.obj.position.y = tg.base.y + tg.pick * 0.02 + j * 0.03;
        tg.obj.rotation.z = tg.pick * 0.12;
      } else if (!tg.obj.userData.custom) {
        const lift = tg.kind === 'bag' ? 0.035 : 0.012;
        tg.obj.position.y = tg.base.y + tg.h * lift + j * 0.05;
        tg.obj.rotation.y = tg.rot.y + tg.h * Math.sin(t * 3) * 0.08 + j * 0.6;
        if (tg.kind === 'bag') {
          // inclina de leve na direção do mouse e amassa/estica ao clicar
          tg.obj.rotation.z = tg.rot.z + tg.h * ins.look.x * -0.12;
          squash(tg.obj, tg.jump);
        }
      }
      tg.obj.userData.tick?.(dt, t, tg.h);
      setGlow(tg.obj, tg.h * (0.32 + Math.sin(t * 5) * 0.06));
    }

    if (pad && ins.plasmaPad) {
      ui.interact('Soltar', ...this.toScreen(this.room.plasma.sprite.position, cam, 0.16), 'ESC');
    } else if (pad && opt.plasma) {
      ui.interact('Luminária de plasma', ...this.toScreen(this.room.plasma.sprite.position, cam, 0.16), 'CLIQUE');
    } else if (plasmaHit) {
      ui.interact('Luminária de plasma', ...this.toScreen(this.room.plasma.sprite.position, cam, 0.16), null);
      this.game.canvas.style.cursor = 'crosshair';
    } else if (hover) {
      const p = new THREE.Vector3();
      new THREE.Box3().setFromObject(hover.obj).getCenter(p);
      ui.interact(hover.label, ...this.toScreen(p, cam, 0.05), 'CLIQUE');
      this.game.canvas.style.cursor = 'pointer';
    } else {
      ui.interact(null);
      this.game.canvas.style.cursor = 'default';
    }
  }

  pickAtRest(targets) {
    const saved = targets.map(({ obj }) => [obj.position.clone(), obj.rotation.clone(), obj.scale.clone()]);
    for (const tg of targets) {
      tg.obj.position.copy(tg.base);
      if (tg.rot) tg.obj.rotation.copy(tg.rot);
      else if (tg.kind === 'book') tg.obj.rotation.z = 0;
      tg.obj.scale.set(1, 1, 1);
      tg.obj.updateMatrixWorld(true);
    }
    const hits = this.raycaster.intersectObjects(targets.map((tg) => tg.obj), true);
    targets.forEach((tg, i) => {
      tg.obj.position.copy(saved[i][0]);
      tg.obj.rotation.copy(saved[i][1]);
      tg.obj.scale.copy(saved[i][2]);
      tg.obj.updateMatrixWorld(true);
    });
    return hits;
  }

  inspectClick() {
    const ins = this.inspect;
    if (!ins?.hover) return;
    const tg = ins.hover;
    const { sfx, ui } = this.game;
    tg.jump = 1;
    if (tg.kind === 'book') {
      for (const o of ins.targets) if (o !== tg) o.picked = false;
      tg.picked = !tg.picked;
      sfx.page();
      if (tg.picked) ui.say(tg.line, { hold: 2.2 });
    } else {
      const snd = tg.obj.userData.sound;
      if (snd && sfx[snd]) sfx[snd]();
      else if (tg.kind === 'bag') sfx.rustle();
      else sfx.tap();
      tg.obj.userData.poke?.();
      sfx.pop();
      ui.say(tg.line, { hold: 2.2 });
    }
  }

  // ponto 3D → pixels da janela (com um empurrão para cima, em metros)
  toScreen(p, cam, lift = 0) {
    const v = p.clone();
    v.y += lift;
    v.project(cam);
    return [((v.x + 1) / 2) * window.innerWidth, ((1 - v.y) / 2) * window.innerHeight];
  }

  // -------------------------------------------------------------
  // 4d. Papéis no chão: plano zenital (a câmera vê a cabeça dela de cima)
  // -------------------------------------------------------------

  async enterZenital() {
    const { ui, sfx, renderer } = this.game;
    const tok = ++this.token;
    this.mode = 'zen-in';
    this.busy = true;
    ui.interact(null);
    ui.hint(null);
    if (this.glowObj) setGlow(this.glowObj, 0);
    this.glowObj = null;
    const papers = this.room.papers;
    const c = new THREE.Vector3();
    for (const p of papers) c.add(p.mesh.position);
    c.divideScalar(papers.length);
    const cam = this.closeCam;
    const top = this.aniTop;
    const end = new THREE.Vector3(c.x - 0.08, 4.2, c.z + 0.02);

    await this.cut(() => {
      this.camera = cam;
      cam.fov = 28;
      cam.updateProjectionMatrix();
      cam.up.set(0, 0, -1);
      cam.position.set(end.x + 0.35, 3.3, end.z + 0.5);
      cam.lookAt(c.x, 0, c.z);
      this.ani.mesh.visible = this.ani.shadow.visible = false;
      for (const o of this.room.lampParts) o.visible = false;
      // ela agachada do lado dos papéis
      top.mesh.visible = top.shadow.visible = true;
      top.mesh.position.set(c.x - 0.5, 1.05, c.z - 0.18);
      top.mesh.rotation.y = 0;
      top.shadow.position.set(c.x - 0.47, 0.007, c.z - 0.16);
      top.setReach(false);
    }, 0.3, 0.001);
    if (tok !== this.token) return;
    renderer.fx.fade = 1;
    sfx.whooshSoft();
    // a câmera sobe até o teto girando um pouco, e assenta
    const p0 = cam.position.clone();
    await this.tweens.to({
      duration: 1.1, ease: ease.outCubic,
      onUpdate: (k) => {
        renderer.fx.fade = 1 - clamp(k * 2.2);
        cam.position.lerpVectors(p0, end, k);
        cam.up.set(0, 0, -1);
        cam.lookAt(lerp(c.x + 0.2, end.x, k), 0, lerp(c.z + 0.2, end.z, k));
        cam.rotateZ((1 - k) * 0.35);
      },
    });
    if (tok !== this.token) return;
    this.mode = 'zen';
    this.zen = {
      center: c, base: cam.quaternion.clone(), pos: end.clone(), look: new THREE.Vector2(),
      hover: null, held: null, busy: false, read: new Set(), yaw: 0,
    };
    // controle: pontos de tela de cada papel (a câmera fica parada no teto)
    cam.updateMatrixWorld(true);
    this.zen.opts = this.room.papers.map((p) => {
      const [x, y] = this.toScreen(p.mesh.position, cam);
      return { p, x, y };
    });
    this.zen.sel = centerPick(this.zen.opts);
    ui.hint(HINT_ZEN);
    this.thought('zen', 'As coisas do show... Tá tudo jogado aqui.', { hold: 1.8 });
  }

  async exitZenital() {
    const z = this.zen;
    if (!z || this.mode !== 'zen' || z.held || z.busy) return;
    const { ui, sfx } = this.game;
    const tok = ++this.token;
    this.mode = 'zen-out';
    ui.interact(null);
    ui.hint(null);
    this.game.canvas.style.cursor = 'default';
    for (const p of this.room.papers) setGlow(p.mesh, 0);
    sfx.whooshSoft();
    await this.cut(() => {
      this.zen = null;
      this.aniTop.mesh.visible = this.aniTop.shadow.visible = false;
      for (const o of this.room.lampParts) o.visible = true;
      this.closeCam.up.set(0, 1, 0);
      this.camera = this.sideCam;
      this.ani.mesh.visible = this.ani.shadow.visible = true;
    }, 0.3, 0.5);
    if (tok !== this.token) return;
    this.mode = 'side';
    this.busy = false;
    ui.hint(HINT_SIDE);
    this.countSearch('ingressos');
  }

  // Pose do papel "no colo da câmera", ocupando boa parte da tela
  paperModalPose(p) {
    const cam = this.closeCam;
    const { renderer } = this.game;
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspect = renderer.w / renderer.h;
    const dist = Math.max(p.h / (2 * tanV * 0.62), p.w / (2 * tanV * aspect * 0.6));
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.zen.base);
    const pos = this.zen.pos.clone().addScaledVector(dir, dist);
    const quat = this.zen.base.clone(); // de frente para a câmera, "em pé" na tela
    return { pos, quat };
  }

  async pickPaper(p) {
    const z = this.zen;
    const { sfx, ui } = this.game;
    z.busy = true;
    z.held = p;
    ui.interact(null);
    sfx.page();
    this.aniTop.setReach(true);
    const m = p.mesh;
    const p0 = m.position.clone(), q0 = m.quaternion.clone();
    const { pos, quat } = this.paperModalPose(p);
    p.modal = { pos, quat };
    this.dim.visible = true;
    const spin = (Math.random() < 0.5 ? -1 : 1) * 0.9;
    await this.tweens.to({
      duration: 0.62, ease: ease.outCubic,
      onUpdate: (k, raw) => {
        m.position.lerpVectors(p0, pos, k);
        m.quaternion.slerpQuaternions(q0, quat, ease.outBack(raw));
        m.rotateZ(Math.sin(raw * Math.PI) * spin * 0.5);
        m.rotateX(Math.sin(raw * Math.PI) * 0.4);
        m.material.emissive.setScalar(0.85 * k);
        this.dim.material.opacity = 0.62 * k;
      },
    });
    this.aniTop.setReach(false);
    z.busy = false;
    z.read.add(p.id);
    ui.hint(HINT_PAPER);
    ui.say(p.line, { hold: 2.4 });
  }

  async dropPaper() {
    const z = this.zen;
    const p = z?.held;
    if (!p || z.busy) return;
    const { sfx, ui } = this.game;
    z.busy = true;
    sfx.page();
    const m = p.mesh;
    const home = m.userData.home;
    const p0 = m.position.clone(), q0 = m.quaternion.clone();
    await this.tweens.to({
      duration: 0.5, ease: ease.inOutCubic,
      onUpdate: (k, raw) => {
        m.position.lerpVectors(p0, home.pos, k);
        m.position.y += Math.sin(raw * Math.PI) * 0.12;
        m.quaternion.slerpQuaternions(q0, home.quat, k);
        m.rotateZ(Math.sin(raw * Math.PI) * 0.35); // plana um pouco antes de cair
        m.material.emissive.setScalar(0.85 * (1 - k));
        this.dim.material.opacity = 0.62 * (1 - k);
      },
    });
    this.dim.visible = false;
    z.held = null;
    z.busy = false;
    ui.hint(HINT_ZEN);
    if (z.read.size === this.room.papers.length) this.thoughtLater('papeis-fim', 'Foco, Ani. O carregador.', 0.3);
  }

  updateZen(dt, t) {
    const z = this.zen;
    const { mouse, ui } = this.game;
    const cam = this.closeCam;
    z.look.x = damp(z.look.x, mouse.x, 4, dt);
    z.look.y = damp(z.look.y, mouse.y, 4, dt);
    // a câmera flutua de leve no teto
    cam.position.copy(z.pos);
    cam.position.x += z.look.x * 0.04 + Math.sin(t * 0.5) * 0.006;
    cam.position.z -= z.look.y * 0.03;
    cam.quaternion.copy(z.base);
    cam.updateMatrixWorld(true);

    const top = this.aniTop;
    top.mesh.scale.setScalar(1 + Math.sin(t * 2.4) * 0.012); // respirando

    if (z.held) {
      // papel na frente da câmera, inclinando com o mouse
      const m = z.held.mesh;
      if (!z.busy) {
        const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-mouse.y * 0.32, mouse.x * 0.38, mouse.x * 0.04));
        const q = z.held.modal.quat.clone().multiply(tilt);
        m.quaternion.slerp(q, 1 - Math.exp(-8 * dt));
        m.position.copy(z.held.modal.pos);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(z.base);
        m.position.addScaledVector(up, Math.sin(t * 1.6) * 0.002);
      }
      ui.interact(null);
      this.game.canvas.style.cursor = 'pointer';
      return;
    }

    const papers = this.room.papers;
    let hover = null;
    if (this.game.inputMode === 'pad') {
      // controle: o papel escolhido é o destacado
      hover = z.busy ? null : z.opts[z.sel].p;
    } else {
      this.raycaster.setFromCamera(mouse, cam);
      const hits = z.busy ? [] : this.raycaster.intersectObjects(papers.map((p) => p.mesh), false);
      hover = hits.length ? papers.find((p) => p.mesh === hits[0].object) : null;
    }
    if (hover !== z.hover) {
      if (hover) this.game.sfx.hover();
      z.hover = hover;
    }
    for (const p of papers) {
      p.hov = damp(p.hov || 0, p === hover ? 1 : 0, 14, dt);
      const home = p.mesh.userData.home;
      p.mesh.position.y = home.pos.y + p.hov * 0.025;
      setGlow(p.mesh, p.hov * 0.5);
    }
    // ela olha para o papel embaixo do mouse
    const target = hover ? hover.mesh.position : z.center;
    const dx = target.x - top.mesh.position.x, dz = target.z - top.mesh.position.z;
    z.yaw = dampAngle(z.yaw, Math.atan2(-dz, dx), 6, dt);
    top.mesh.rotation.y = z.yaw;
    top.setReach(!!hover);

    if (hover) {
      ui.interact(hover.label, ...this.toScreen(hover.mesh.position, cam, 0), 'CLIQUE');
      this.game.canvas.style.cursor = 'pointer';
    } else {
      ui.interact(null);
      this.game.canvas.style.cursor = 'default';
    }
  }

  // -------------------------------------------------------------
  // 5. A gaveta e a tirinha de fotos
  // -------------------------------------------------------------

  async openDrawer() {
    const { ui, sfx, renderer } = this.game;
    const tok = ++this.token;
    const tw = this.tweens;
    this.mode = 'drawer';
    this.ani.reach(1.2);
    ui.interact(null);
    ui.hint(null);
    // tira o brilho roxo de "dá para interagir": a gaveta abre com a madeira de verdade
    if (this.glowObj) setGlow(this.glowObj, 0);
    this.glowObj = null;
    const cam = this.drawerCam;
    const pos = new THREE.Vector3(1.35, 1.52, -1.02);
    const look = new THREE.Vector3(1.35, 0.62, -1.72);

    await this.cut(() => {
      this.camera = cam;
      this.ani.mesh.visible = false;
      this.ani.shadow.visible = false;
      cam.up.set(0, 1, 0);
      cam.position.copy(pos);
      cam.lookAt(look);
    }, 0.35, 0.5);
    if (tok !== this.token) return;

    // abre a gaveta e se inclina para olhar
    sfx.drawer();
    const P0 = pos.clone(), P1 = new THREE.Vector3(1.35, 1.2, -1.22);
    const L0 = look.clone(), L1 = new THREE.Vector3(1.33, 0.6, -1.8);
    await tw.to({
      duration: 0.9, ease: ease.outCubic,
      onUpdate: (k) => {
        this.room.drawer.setOpen(k);
        cam.position.lerpVectors(P0, P1, k);
        cam.lookAt(look.lerpVectors(L0, L1, k));
      },
    });
    if (tok !== this.token) return;
    await tw.wait(0.5);
    await ui.sayWait('Achei.', { hold: 0.9 });
    if (tok !== this.token) return;
    if (this.likedByAccident) {
      await ui.sayWait('Tomara que ela ainda não tenha visto.', { hold: 1.4 });
      if (tok !== this.token) return;
    }

    // o olhar desce para a tirinha de fotos
    const strip = this.room.drawer.stripMesh;
    strip.updateMatrixWorld(true);
    const stripPos = new THREE.Vector3().setFromMatrixPosition(strip.matrixWorld);
    const P2 = stripPos.clone().add(new THREE.Vector3(0, 0.3, 0.16));
    const L2 = stripPos.clone();
    sfx.shimmer();
    await tw.to({
      duration: 2.2, ease: ease.inOutSine,
      onUpdate: (k) => {
        cam.position.lerpVectors(P1, P2, k);
        cam.lookAt(look.lerpVectors(L1, L2, k));
      },
    });
    if (tok !== this.token) return;
    await tw.wait(1.3);
    if (tok !== this.token) return;

    // Zoom contínuo até a última foto ocupar a tela inteira
    const r = frameRect(3);
    const sw = STRIP_W * METERS_PER_PX, sh = STRIP_H * METERS_PER_PX;
    const local = new THREE.Vector3(
      ((r.x + r.w / 2) / STRIP_W - 0.5) * sw,
      (0.5 - (r.y + r.h / 2) / STRIP_H) * sh,
      0
    );
    const center = strip.localToWorld(local.clone());
    const normal = new THREE.Vector3(0, 0, 1).transformDirection(strip.matrixWorld);
    const up = new THREE.Vector3(0, 1, 0).transformDirection(strip.matrixWorld);
    const aspect = renderer.w / renderer.h;
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const fillW = ((FRAME_W * METERS_PER_PX) / 2) / (tanH * aspect);
    const fillH = ((FRAME_H * METERS_PER_PX) / 2) / tanH;
    const dEnd = Math.min(fillW, fillH) * 0.97;
    const endPos = center.clone().addScaledVector(normal, dEnd);
    const probe = new THREE.PerspectiveCamera();
    probe.position.copy(endPos);
    probe.up.copy(up);
    probe.lookAt(center);
    const q0 = cam.quaternion.clone();
    const q1 = probe.quaternion.clone();
    const start = cam.position.clone();
    const fx = renderer.fx;
    const v0 = fx.vignette, g0 = fx.grain;
    await tw.to({
      duration: 4.2, ease: ease.inOutCubic,
      onUpdate: (k) => {
        cam.position.lerpVectors(start, endPos, k);
        cam.quaternion.slerpQuaternions(q0, q1, ease.inOutSine(k));
        fx.vignette = lerp(v0, 0.85, k);
        fx.grain = lerp(g0, 0.14, k);
        fx.bloom = lerp(0.9, 0.4, k);
      },
    });
    if (tok !== this.token) return;

    // 6. O flash: a foto "acontece" de novo e o jogo vai para aquela noite
    this.mode = 'photo';
    this.timeScale = 1;
    await tw.wait(1.1);
    if (tok !== this.token) return;
    sfx.flashCharge();
    // a foto respira um pouco mais clara enquanto o flash carrega
    await tw.to({ duration: 0.55, ease: ease.inQuad, onUpdate: (k) => (fx.flash = k * 0.16) });
    if (tok !== this.token) return;
    sfx.flash();
    fx.flash = 1;
    fx.bars = 1;
    this.game.goTo('parque', { flash: true });
  }

  // -------------------------------------------------------------
  // Entrada
  // -------------------------------------------------------------

  screenCoords() {
    if (!this.screen) return null;
    this.fpCam.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.game.mouse, this.fpCam);
    const n = new THREE.Vector3(0, 0, 1).transformDirection(this.screen.matrixWorld);
    const p = new THREE.Vector3().setFromMatrixPosition(this.screen.matrixWorld);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, p);
    const hit = this.raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (!hit) return null;
    const local = this.screen.worldToLocal(hit);
    const x = (local.x / SCREEN_W + 0.5) * SW;
    const y = (0.5 - local.y / SCREEN_H) * SH;
    return { x, y, on: x >= 0 && x < SW && y >= 0 && y < SH };
  }

  onPointerDown(e) {
    if (this.mode === 'inspect') {
      if (e.button === 2) return this.exitInspect();
      if (e.button === 0) this.inspectClick();
      return;
    }
    if (this.mode === 'zen' && this.zen) {
      if (this.zen.held) return this.dropPaper();
      if (e.button === 2) return this.exitZenital();
      if (e.button === 0 && this.zen.hover && !this.zen.busy) this.pickPaper(this.zen.hover);
      return;
    }
    if (e.button !== 0) return;
    if (this.mode !== 'phone' || this.raise < 0.8) return;
    const c = this.screenCoords();
    if (c?.on) this.app.pointerDown(c.x, c.y);
  }

  onPointerMove() {
    if (this.mode !== 'phone') return;
    const c = this.screenCoords();
    if (!c) return;
    this.app.pointerMove(c.x, c.y);
    const hit = c.on ? this.app.hitAt(c.x, c.y) : null;
    this.app.hoverHit = hit?.id || null;
    this.game.canvas.style.cursor = hit ? 'pointer' : c.on ? 'grab' : 'default';
  }

  onPointerUp() {
    if (this.mode !== 'phone') return;
    const c = this.screenCoords();
    if (c) this.app.pointerUp(c.x, c.y);
    else this.app.cancelPointer();
  }

  onWheel(e) {
    if (this.mode !== 'phone') return;
    if (e.pad) this.app.padLoose = true; // rolou com o analógico: a seleção acompanha
    this.app.wheel(e.deltaY);
  }

  onKey(e) {
    const { ui } = this.game;
    const back = e.code === 'Escape' || e.code === 'KeyE';
    if (back && !e.repeat && !ui.pauseOpen) {
      if (this.mode === 'inspect') return this.exitInspect();
      if (this.mode === 'zen' && this.zen) return this.zen.held ? this.dropPaper() : this.exitZenital();
      if (['inspect-in', 'inspect-out', 'zen-in', 'zen-out'].includes(this.mode)) return;
    }
    if (e.code === 'Escape') {
      if (ui.pauseOpen) return ui.pause(null);
      if (this.mode === 'phone' && this.app.back()) return;
      if (this.mode === 'photo') return this.toMenu();
      this.openPause();
      return;
    }
    if (ui.pauseOpen) return;
    if (e.pad && this.padKey(e)) return;
    if (this.mode === 'phone') {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') this.app.wheel(70);
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.app.wheel(-70);
    } else if (this.mode === 'side') {
      this.keys.add(e.code);
      if (['KeyE', 'Enter', 'Space'].includes(e.code) && !e.repeat) this.interact(this.nearestInteractable());
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.code);
  }

  // Falas: clique em qualquer lugar acelera/pula, menos onde o clique já tem uso
  dialogClick() {
    return !['phone', 'inspect', 'zen'].includes(this.mode);
  }

  // Enter/Espaço/A aceleram falas em cena ou durante uma interação (andando livre, E interage)
  dialogKey() {
    if (['phone', 'inspect', 'zen'].includes(this.mode)) return false;
    return this.mode !== 'side' || this.busy;
  }

  // Controle (ver engine/gamepad.js): como o analógico funciona em cada parte da cena.
  // Nas telas de escolher não tem cursor: o direcional/analógico troca o item, como no menu.
  padMode() {
    switch (this.mode) {
      case 'side':
        return 'walk';
      case 'phone':
        return this.raise >= 0.8 && !this.app.locked ? 'select' : 'look';
      case 'inspect':
        return this.inspect?.plasmaPad ? 'look' : 'look-rs';
      case 'zen':
        return this.zen?.held ? 'look' : 'look-rs';
      case 'dying':
      case 'standup':
        return 'look';
      default:
        return null;
    }
  }

  // setas e Enter vindos do controle (e.pad): trocar e usar o item escolhido
  padKey(e) {
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    const ok = e.code === 'Enter' && !e.repeat;
    if (this.mode === 'phone') {
      if (dir) this.app.padNav(dir[0], dir[1]);
      else if (ok) this.app.padPress();
      return !!dir || ok;
    }
    if (this.mode === 'inspect' && this.inspect) {
      const ins = this.inspect;
      if (ins.plasmaPad) return !!dir; // guiando os raios: as setas não trocam de item
      if (dir) {
        const i = spatialPick(ins.opts, ins.sel, dir[0], dir[1]);
        if (i >= 0) {
          ins.sel = i;
          if (ins.opts[i].plasma) this.game.sfx.hover(); // os outros já tocam ao destacar
        } else this.game.sfx.scrollTick(); // não tem nada para lá
        return true;
      }
      if (ok) {
        if (ins.opts[ins.sel].plasma) this.plasmaGrab(true);
        else this.inspectClick();
        return true;
      }
    }
    if (this.mode === 'zen' && this.zen && !this.zen.held) {
      const z = this.zen;
      if (dir) {
        const i = spatialPick(z.opts, z.sel, dir[0], dir[1]);
        if (i >= 0) z.sel = i;
        else this.game.sfx.scrollTick();
        return true;
      }
      if (ok && !z.busy) {
        this.pickPaper(z.opts[z.sel].p);
        return true;
      }
    }
    return false;
  }

  // plasma no controle: A pega (os raios seguem o analógico), B ou A solta
  plasmaGrab(on) {
    const ins = this.inspect;
    if (!ins) return;
    const { sfx } = this.game;
    if (on) {
      ins.plasmaPad = { x: 0.35, y: 0.25, lx: 0.8, ly: 0.6 };
      this.game.mouse.set(0, 0);
      sfx.pop();
      sfx.zap();
    } else {
      ins.plasmaPad = null;
      this.room.setPlasmaTouch(null);
      sfx.back();
    }
  }

  onPad(btn) {
    if (this.game.ui.pauseOpen) return false;
    // guiando o plasma: A ou B soltam
    if ((btn === 'A' || btn === 'B') && this.mode === 'inspect' && this.inspect?.plasmaPad) {
      this.plasmaGrab(false);
      return true;
    }
    if (btn === 'B') {
      // B volta: no app, nas vistas de perto e nos papéis
      if (this.mode === 'phone') {
        this.app.back();
        return true;
      }
      if (this.mode === 'inspect' || this.mode === 'zen') {
        this.onKey({ code: 'KeyE', repeat: false });
        return true;
      }
    }
    // A com o papel na mão devolve (o analógico está inclinando o papel)
    if (btn === 'A' && this.mode === 'zen' && this.zen?.held) {
      this.dropPaper();
      return true;
    }
    return false;
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
    renderer.fx.fadeColor.set(0, 0, 0);
    await this.tweens.to({ duration: 0.6, onUpdate: (k) => (renderer.fx.fade = k) });
    this.game.goTo('menu', { awake: true });
  }

  // -------------------------------------------------------------
  // Atualização por quadro
  // Luz de cinema: gradação de cor por estado e o olho se adaptando.
  // Escuro: só luar, sombras índigo, prata-azulado nas luzes, feixes fortes.
  // Aceso: âmbar nas luzes, sombras violeta quentes, névoa dourada.
  updateCinema(dt, t) {
    const fx = this.game.renderer.fx;
    const k = this.room.light * (this.room.flicker ?? 1);
    this.cinema.update(dt, t, { rows: this.game.renderer.h });
    // olho: ao acender estoura e assenta; ao apagar escurece tudo e vai abrindo
    const L = 0.14 + 0.86 * k;
    this.eyeAdapt += (L - this.eyeAdapt) * Math.min(1, dt * (L > this.eyeAdapt ? 1.5 : 0.55));
    fx.exposure = clamp(Math.pow(L / this.eyeAdapt, 0.65), 0.42, 2.3) * lerp(1.0, 1.15, k);
    // sombras: índigo no escuro, verde-azulado quente com a luz (como filme)
    fx.lift.setRGB(lerp(0.003, 0.006, k), lerp(0.005, 0.011, k), lerp(0.016, 0.014, k));
    // luzes: prata-azulado no escuro, âmbar com a luz
    fx.gain.setRGB(lerp(0.92, 1.12, k), lerp(0.98, 1.02, k), lerp(1.1, 0.8, k));
    fx.saturation = lerp(0.85, 0.98, k);
    fx.contrast = lerp(1.06, 1.1, k);
    fx.glow = lerp(0.6, 0.4, k);
    fx.glowThreshold = lerp(0.5, 1.3, k);
    HAZE.setRGB(lerp(0.0012, 0.0062, k), lerp(0.0018, 0.0042, k), lerp(0.0045, 0.0022, k));
    this.cinema.haze = HAZE;
    // em primeira pessoa o feixe passa colado na câmera: bem mais sutil
    this.fpVolK = damp(this.fpVolK ?? 1, this.camera === this.fpCam ? 0.3 : 1, 3, dt);
    this.cinema.uniforms.uVol.value = lerp(0.78, 0.16, k) * this.fpVolK;
    this.cinema.uniforms.uCookie.value = lerp(1.0, 0.18, k);
    this.cinema.uniforms.uLampVol.value = 0.32; // cone quente embaixo do lustre (no ar)
  }

  // -------------------------------------------------------------

  update(dt, t) {
    if (!this.room) return;
    this.tweens.update(dt * (this.timeScale || 1));
    this.room.update(t, dt);
    const { renderer, mouse, sfx, ui } = this.game;
    const fx = renderer.fx;
    const phoneModes = this.mode === 'phone' || this.mode === 'dying' || this.mode === 'standup';
    this.updateCinema(dt, t);

    // passe nítido da tela do celular só em primeira pessoa com o celular na mão
    this.scene.userData.hd = this.hdState || (this.hdState = { layer: 1, active: false });
    this.hdState.active = phoneModes && this.camera === this.fpCam && this.phoneRig.visible;
    if (phoneModes) {
      this.app.padOn = this.mode === 'phone' && this.game.inputMode === 'pad';
      this.app.update(dt);
      if (this.mode === 'phone') this.updateBattery(dt);

      if (this.mode === 'standup') {
        this.fpCam.position.copy(this.camPos);
        this.fpCam.up.set(0, 1, 0);
        this.fpCam.lookAt(this.camLook);
        this.fpCam.rotateZ(this.roll + Math.sin(t * 1.3) * 0.006);
      } else {
        // Olhar levemente para onde o mouse aponta
        this.mouseSmooth.x = damp(this.mouseSmooth.x, mouse.x, 4, dt);
        this.mouseSmooth.y = damp(this.mouseSmooth.y, mouse.y, 4, dt);
        const off = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.mouseSmooth.y * 0.04, -this.mouseSmooth.x * 0.06, 0, 'YXZ'));
        this.fpCam.quaternion.copy(this.baseQuat).multiply(off);
      }

      // Distância para a tela ficar 1 pixel = 1 pixel
      const d = (SCREEN_H * renderer.h) / (SH * 2 * Math.tan(THREE.MathUtils.degToRad(FP_FOV / 2)));

      // Balanço da mão, toque, vibração e susto
      this.press = Math.max(0, this.press - dt * 7);
      this.buzz = Math.max(0, this.buzz - dt);
      this.panic = Math.max(0, this.panic - dt * 0.12);
      const shake = this.buzz * 0.006 + this.panic * 0.01;
      const rig = this.phoneRig;
      rig.position.set(
        Math.sin(t * 1.1) * 0.003 + (Math.random() - 0.5) * shake,
        -0.012 + Math.sin(t * 1.7) * 0.004 + (Math.random() - 0.5) * shake - (1 - this.raise) * 0.5,
        -d - this.press * 0.012
      );
      rig.rotation.set(
        -0.06 + this.mouseSmooth.y * 0.05 + (1 - this.raise) * 0.6,
        -this.mouseSmooth.x * 0.07,
        Math.sin(t * 0.7) * 0.012 + (Math.random() - 0.5) * this.panic * 0.03
      );
      this.thumb.position.set(this.thumbBase.x - this.press * 0.01, this.thumbBase.y + this.press * 0.012, this.thumbBase.z);

      if (!this.app.dead) {
        const lockScreen = this.app.screen === 'lock';
        this.screenLight.color.set(lockScreen ? '#8a74ff' : '#c4ccff');
        this.screenLight.intensity = 0.35 + (lockScreen ? 0 : 0.1);
      }

      // Pânico: coração disparado, glitch e tela avermelhada
      if (this.panic > 0.12 && t > this.nextBeat) {
        sfx.heartbeat(clamp(this.panic + 0.3));
        this.nextBeat = t + lerp(1.1, 0.45, this.panic);
      }
      fx.glitch = damp(fx.glitch, this.panic * 0.25, 5, dt);
      fx.aberration = 0.0018 + this.panic * 0.008;
      fx.tint.setRGB(1 + this.panic * 0.25, 1 - this.panic * 0.22, 1 - this.panic * 0.2);
      fx.shakeX = (Math.random() - 0.5) * this.panic * 4;
      fx.shakeY = (Math.random() - 0.5) * this.panic * 3;
      fx.vignette = 0.6 + this.panic * 0.35;
      return;
    }

    fx.aberration = damp(fx.aberration, 0.0018, 3, dt);
    fx.glitch = damp(fx.glitch, 0, 6, dt);
    fx.tint.setRGB(1, 1, 1);
    fx.shakeX = fx.shakeY = 0;

    if (this.mode === 'side') {
      const { lane } = this.room;
      const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
      const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
      const fwd = this.keys.has('KeyW') || this.keys.has('ArrowUp');
      const back = this.keys.has('KeyS') || this.keys.has('ArrowDown');
      let dir = (right ? 1 : 0) - (left ? 1 : 0);
      let dirZ = (back ? 1 : 0) - (fwd ? 1 : 0); // W = para o fundo, S = para a câmera
      if (!dir && !dirZ) {
        // analógico do controle: inclinar pouco = passo lento
        const st = this.game.pad?.move();
        if (st) {
          dir = st.x;
          dirZ = st.y;
        }
      }
      let animSpeed;
      if (this.script) {
        // andando sozinha (cutscene curtinha, ex.: ir até a cama)
        animSpeed = dt > 0 ? (this.script.x - this.x) / dt : 0;
        if (Math.abs(animSpeed) < 0.05 && Math.abs(this.script.z - this.z) > 0.0005) animSpeed = 0.6 * this.ani.facing;
        this.x = this.script.x;
        this.z = this.script.z;
        this.vel = 0;
      } else {
        // na diagonal não anda mais rápido
        const n = Math.hypot(dir, dirZ * DEPTH_SPEED) > 1 ? 1 / Math.hypot(dir, dirZ * DEPTH_SPEED) : 1;
        this.vel = damp(this.vel, this.busy ? 0 : dir * WALK_SPEED * n, 10, dt);
        this.velZ = damp(this.velZ, this.busy ? 0 : dirZ * WALK_SPEED * DEPTH_SPEED * n, 10, dt);
        if (Math.abs(this.vel) < 0.02 && !dir) this.vel = 0;
        if (Math.abs(this.velZ) < 0.02 && !dirZ) this.velZ = 0;
        // anda em x e em z separado: encostando num móvel ela desliza pela lateral
        // (se uma cena a deixou dentro de um móvel, ela pode sair andando)
        const stuck = this.blocked(this.x, this.z);
        const nx = clamp(this.x + this.vel * dt, lane.minX, lane.maxX);
        if (nx === this.x + this.vel * dt && (stuck || !this.blocked(nx, this.z))) this.x = nx;
        else this.vel = 0;
        const nz = clamp(this.z + this.velZ * dt, Z_MIN, Z_MAX);
        if (nz === this.z + this.velZ * dt && (stuck || !this.blocked(this.x, nz))) this.z = nz;
        else this.velZ = 0;
        const sp = Math.hypot(this.vel, this.velZ);
        animSpeed = sp > 0.05 ? sp * (Math.abs(this.vel) > 0.05 ? Math.sign(this.vel) : this.ani.facing) : 0;
      }
      this.ani.mesh.position.set(this.x, 0, this.z);
      if (this.ani.update(dt, this.ani.held != null ? 0 : animSpeed)) sfx.step();
      // travesseiro na mão: segue a respiração dela e dá umas sacudidas
      if (this.pillowHold) {
        const ph = this.pillowHold;
        ph.t += dt;
        const P = this.room.pillow;
        P.position.copy(ph.pos);
        P.position.y += Math.sin(ph.t * 2.2) * 0.012 + (ph.t > 0.5 && ph.t < 0.9 ? Math.sin(ph.t * 40) * 0.01 : 0);
        const wob = ph.t > 0.5 && ph.t < 0.9 ? Math.sin(ph.t * 34) * 0.06 : 0;
        P.quaternion.copy(this.pillowQ).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, wob)));
      }
      // iluminada pelas luzes do quarto (no escuro vira quase silhueta sozinha)
      this.updateRim();
      fx.vignette = lerp(0.85, 0.55, this.room.light);

      // câmera lateral acompanha com um pouco de folga à frente
      // (a câmera fica do lado de fora da parede da frente, como num diorama)
      const target = clamp(this.x + this.ani.facing * 0.45, -1.15, 1.15);
      this.camX = damp(this.camX, target, 3, dt);
      // recua um pouco quando ela vem para a frente (o tamanho dela muda menos e os pés não somem)
      this.camZ = damp(this.camZ, (this.z - lane.z) * 0.45, 2.5, dt);
      this.sideCam.position.set(this.camX, 1.5 + Math.sin(t * 0.6) * 0.008, 3.35 + this.camZ);
      this.sideCam.lookAt(this.camX, 0.98 - this.camZ * 0.15, -1.2 + this.camZ);

      // balão de interação + brilho pulsando no objeto mais perto
      const it = this.busy ? null : this.nearestInteractable();
      const dark = this.room.light < 0.5;
      const glowObj = it && !dark ? it.obj || null : null;
      if (glowObj !== this.glowObj) {
        if (this.glowObj) setGlow(this.glowObj, 0);
        this.glowObj = glowObj;
        if (glowObj) this.game.sfx.hover();
      }
      if (glowObj) setGlow(glowObj, 0.16 + Math.sin(t * 4) * 0.07);
      if (it) {
        if (it.id === 'cortina') it.label = this.room.curtain > 0.5 ? 'Abrir cortina' : 'Fechar cortina';
        const label = dark && it.id !== 'interruptor' ? '???' : it.label;
        const p = it.anchor.clone().project(this.sideCam);
        ui.interact(label, ((p.x + 1) / 2) * window.innerWidth, ((1 - p.y) / 2) * window.innerHeight);
      } else {
        ui.interact(null);
      }
    } else if (this.mode === 'inspect' && this.inspect) {
      this.updateInspect(dt, t);
    } else if (this.mode === 'zen' && this.zen) {
      this.updateZen(dt, t);
    }
  }
}
