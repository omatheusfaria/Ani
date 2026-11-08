import * as THREE from 'three';

// ===============================================================
// Ani no mundo 3D: sprite em 3/4 feito no Sprite Fusion
// (assets/sprites/ani-direita.png, 6×4 quadros). A folha original foi
// recortada, alinhada pelo pescoço/rosto e pelos pés, com a altura
// igualada entre os quadros, e reduzida para a escala do jogo em
// assets/sprites/ani-andando.png (mesma resolução do original):
//   quadros 0–9  caminhada (dois passos: contato, apoio, impulso, passagem, pouso)
//   quadro 10    parada (braços soltos)
//   quadro 11    piscando, olhos meio fechados
//   quadro 12    piscando, olhos fechados
// A folha fica na resolução original do Sprite Fusion (234 px de altura):
// na tela ela aparece com ~160–200 px, então a placa de vídeo sempre
// reduz (com mipmaps) em vez de esticar e duplicar pixels.
// Também aqui: a Ani vista de cima (zenital), desenhada por código.
// ===============================================================

// Configuração de uma folha de caminhada (mesmo formato para Ani e Malu):
//   url, célula FW×FH, folga embaixo da sola, nº de quadros, quadros da
//   caminhada, parada, piscando (meio/fechado), metros por pixel, passada
export const ANI_SPRITE = {
  url: new URL('../../assets/sprites/ani-andando.png', import.meta.url).href,
  FW: 168, FH: 246, FOOT_PAD: 6, COUNT: 13,
  WALK: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], IDLE: 10, HALF: 11, BLINK: 12,
  TEXEL: 1.62 / 234, // a Ani tem 234 px de altura na folha → 1,62 m
  PX: 234,
  LEG_OFF: -4, // pernas 4 px à esquerda do centro da célula
  STRIDE: 1.2, // metros por ciclo de caminhada (dois passos)
};
// Animações extras da Ani (folhas separadas, mesma célula 168×246, alinhadas pelos pés).
// Geradas com tools/recortar-folha.py a partir das folhas do Sprite Fusion (6×4).
//   interruptor: assets/sprites/ani-interruptor.png → ani-interruptor-quadros.png (24 quadros)
//     0–3 parada · 4–5 o braço sobe · 6–8 estica até a parede · 9–10 aperta (corpo vai junto)
//     11 solta · 12–13 braço ainda esticado · 14–17 o braço desce · 18–23 parada
export const ANI_CLIPS = {
  interruptor: {
    url: new URL('../../assets/sprites/ani-interruptor-quadros.png', import.meta.url).href,
    COUNT: 24,
    // [quadro, segundos]; 'press' = o dedo encosta no botão (o jogo troca a luz aqui)
    seq: [[4, 0.07], [5, 0.07], [6, 0.06], [7, 0.06], [8, 0.07], [10, 0.12, 'press'], [11, 0.09], [12, 0.12], [13, 0.1], [14, 0.07], [15, 0.07], [16, 0.07], [17, 0.08], [18, 0.1]],
  },
  //   celular: assets/sprites/ani-celular.png → ani-celular-quadros.png + ani-celular-brilho.png
  //     (tools/separar-brilho.py tira o cone de luz da tela do corpo; no jogo ele é uma camada aditiva)
  //     0 parada · 1–4 a mão vai ao bolso · 5–6 tira o celular · 7–8 levanta (a tela acende)
  //     9–11 leva ao rosto · 12–23 olhando e rolando a tela
  celular: {
    url: new URL('../../assets/sprites/ani-celular-quadros.png', import.meta.url).href,
    glowUrl: new URL('../../assets/sprites/ani-celular-brilho.png', import.meta.url).href,
    glowFrom: 7, // quadros com a tela acesa (a luz da tela no rosto acompanha)
    COUNT: 24,
    seq: [[1, 0.07], [2, 0.06], [3, 0.06], [4, 0.08], [5, 0.08], [6, 0.08], [7, 0.07, 'tela'], [8, 0.07], [9, 0.08], [10, 0.09], [11, 0.1]],
    // repete até release(): vai e volta (sem salto), segurando mais em alguns quadros, como quem lê
    loop: [[12, 0.18], [13, 0.14], [14, 0.14], [15, 0.2], [16, 0.14], [17, 0.14], [18, 0.22], [19, 0.14], [20, 0.14], [21, 0.18], [22, 0.14], [23, 0.26],
      [22, 0.14], [21, 0.14], [20, 0.16], [19, 0.14], [18, 0.14], [17, 0.2], [16, 0.14], [15, 0.14], [14, 0.14], [13, 0.18]],
    // guardando: o mesmo caminho de volta, mais rápido
    out: [[11, 0.05], [10, 0.05], [9, 0.05], [8, 0.05], [7, 0.05], [6, 0.06], [5, 0.06], [4, 0.06], [3, 0.05], [2, 0.05], [1, 0.06]],
  },
};
// Malu: assets/sprites/malu-direita.png → malu-andando.png (mesmo processo)
export const MALU_SPRITE = {
  url: new URL('../../assets/sprites/malu-andando.png', import.meta.url).href,
  FW: 172, FH: 252, FOOT_PAD: 6, COUNT: 13,
  WALK: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], IDLE: 10, HALF: 11, BLINK: 12,
  TEXEL: 1.66 / 240, // um pouquinho mais alta que a Ani
  PX: 240,
  LEG_OFF: -2,
  STRIDE: 1.25,
};

// ---------------------------------------------------------------
// Comida na mão (parque). Folhas do Sprite Fusion recortadas com tools/recortar-comida.py:
// grade 6×4, célula própria de cada folha (FW×FH, larga o bastante para o braço esticado),
// H = altura da personagem na folha (o jogo iguala a escala com a folha de caminhada).
//   pegando: 10–11 parada olhando o balcão · 12–14 estica o braço · 15 recebe · 16–17 traz
//            para perto · 18–23 contente, segurando
//   parada / andando: 4 linhas = 4 estágios da comida acabando (cheia → só o palito/copo);
//            em cada linha ela dá uma mordida (parada) ou belisca durante o passo (andando).
//            O estágio é o mesmo nas duas folhas: parar ou andar continua de onde estava.
// ---------------------------------------------------------------
const SPR = (f) => new URL(`../../assets/sprites/${f}`, import.meta.url).href;
export const GRAB_SEQ = [[10, 0.08], [11, 0.22], [12, 0.08], [13, 0.08], [14, 0.16], [15, 0.12, 'pega'], [16, 0.09], [17, 0.12], [18, 0.12], [19, 0.11], [20, 0.14], [21, 0.1], [22, 0.1], [23, 0.16]];
const food = (who, item, grab, idle, walk) => ({
  grab: { url: SPR(`${who}-pegando-${item}-quadros.png`), ...grab },
  idle: { url: SPR(`${who}-parada-${item}-quadros.png`), ...idle },
  walk: { url: SPR(`${who}-andando-${item}-quadros.png`), ...walk },
});
export const ANI_FOOD = {
  pipoca: food('ani', 'pipoca', { FW: 178, FH: 252, H: 236 }, { FW: 176, FH: 251, H: 240 }, { FW: 192, FH: 253, H: 240 }),
  algodao: food('ani', 'algodao', { FW: 192, FH: 253, H: 236 }, { FW: 150, FH: 250, H: 238 }, { FW: 164, FH: 249, H: 235 }),
  maca: food('ani', 'maca', { FW: 192, FH: 255, H: 240 }, { FW: 146, FH: 263, H: 247 }, { FW: 160, FH: 255, H: 239 }),
};
export const MALU_FOOD = {
  algodao2: food('malu', 'algodao', { FW: 196, FH: 254, H: 243 }, { FW: 170, FH: 258, H: 247 }, { FW: 190, FH: 257, H: 246 }),
  churros: food('malu', 'churros', { FW: 194, FH: 256, H: 244 }, { FW: 158, FH: 257, H: 247 }, { FW: 176, FH: 256, H: 244 }),
};
const EAT_LEVELS = 4;
// mordida parada: segundos por quadro da linha (o 4º é a mordida em si)
const EAT_SEQ = [0.11, 0.12, 0.14, 0.24, 0.16, 0.22];
const eatLen = () => 3.4 + Math.random() * 1.4; // tempo em cada estágio (parada ou andando)
export const FW = ANI_SPRITE.FW;
export const FH = ANI_SPRITE.FH;
export const TEXEL = ANI_SPRITE.TEXEL;

function loadSheet(url) {
  const tex = new THREE.TextureLoader().load(url);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// cores (usadas na vista de cima)
const C = {
  outline: '#140e11',
  hair: '#151017', hairMid: '#231b25', hairHi: '#382d3b', hairShine: '#4f4354',
  skin: '#f4dccb', skinShade: '#e2bba6', skinDeep: '#c99582', blush: '#efa9a0',
  eyeDark: '#1d1416', iris: '#4a3128', irisHi: '#7d5646', shine: '#fbf4ec', sclera: '#efe4dd', lash: '#120c0f', mouth: '#ad645d',
  hood: '#3b3130', hoodShade: '#2b2325', hoodDeep: '#1e181a', hoodHi: '#4e4241', hoodRib: '#2e2628',
  string: '#dcc8ab', stringTip: '#a58d70',
  choker: '#151013', charm: '#d8b66c',
  pants: '#6f2b2b', pantsShade: '#55201f', pantsDeep: '#3c1718', pantsHi: '#8b3c37',
  shoe: '#1d191c', shoeHi: '#36303a', cream: '#ece2d2', creamShade: '#c4b39c', lace: '#f6f0e6',
};
// nomes usados pela vista de cima
C.hoodie = C.hood;
C.hoodieShade = C.hoodShade;
C.hoodieHi = C.hoodHi;

// --- Rasterização nítida de uma "parte" com contorno de 1 pixel ---
function part(target, draw, fill, { outline = true, line = C.outline } = {}) {
  const w = target.width, h = target.height;
  const m = document.createElement('canvas');
  m.width = w;
  m.height = h;
  const g = m.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  draw(g);
  const src = g.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = src[i * 4 + 3] >= 120 ? 1 : 0;
  const tctx = target.getContext('2d');
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : mask[y * w + x]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) {
        const c = typeof fill === 'function' ? fill(x, y) : fill;
        if (!c) continue;
        tctx.fillStyle = c;
        tctx.fillRect(x, y, 1, 1);
      } else if (outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) {
        tctx.fillStyle = line;
        tctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

// ---------------------------------------------------------------
// Personagem no mundo 3D (vista lateral)
// Iluminada pelas mesmas luzes do quarto (material Lambert, como os
// móveis), com luz "envolvente" para um sprite chapado não ficar preto
// quando a luz vem de trás, contorno de luz do lado da lâmpada mais
// forte, sombra de contato nos pés e saturação ajustada ao cenário.
// ---------------------------------------------------------------
export class WalkSprite {
  constructor(cfg = ANI_SPRITE) {
    this.cfg = cfg;
    const { url, FW, FH, FOOT_PAD, COUNT, TEXEL } = cfg;
    this.tex = new THREE.TextureLoader().load(url);
    this.tex.magFilter = THREE.NearestFilter;
    this.tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.tex.generateMipmaps = true;
    this.tex.anisotropy = 4;
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.repeat.set(1 / COUNT, 1);

    const geo = new THREE.PlaneGeometry(FW * TEXEL, FH * TEXEL);
    geo.translate(0, (FH * TEXEL) / 2 - FOOT_PAD * TEXEL, 0); // pivô na sola
    this.uniforms = {
      uRimColor: { value: new THREE.Color(0, 0, 0) },
      uRimDir: { value: 1 },
      uTexel: { value: new THREE.Vector2(1 / (FW * COUNT), 1 / FH) },
      uSat: { value: 0.88 },
    };
    // emissive com a própria textura = luz de preenchimento (a protagonista sempre legível),
    // controlada pelo jogo conforme a luz do quarto (setFill)
    this.material = new THREE.MeshLambertMaterial({ map: this.tex, emissiveMap: this.tex, emissive: '#ffffff', emissiveIntensity: 0.4, alphaTest: 0.5 });
    this.material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.uniforms);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vSpriteY;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvSpriteY = uv.y;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vSpriteY;\nuniform vec3 uRimColor;\nuniform float uRimDir;\nuniform vec2 uTexel;\nuniform float uSat;')
        // luz envolvente: a placa é chapada, mas o corpo dela não
        .replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );', 'float dotNL = 0.55 + 0.45 * dot( geometryNormal, directLight.direction );')
        .replace(
          '#include <opaque_fragment>',
          `{
            // sombra de contato: escurece perto do chão
            outgoingLight *= mix(0.6, 1.0, smoothstep(0.03, 0.3, vSpriteY));
            // contorno de luz: pixel opaco cujo vizinho do lado da luz é transparente
            float edge = 0.0;
            edge += 1.0 - step(0.5, texture2D(map, vMapUv + vec2(uRimDir * 1.5 * uTexel.x, 0.0)).a);
            edge += (1.0 - step(0.5, texture2D(map, vMapUv + vec2(uRimDir * 3.0 * uTexel.x, 0.0)).a)) * 0.5;
            outgoingLight += uRimColor * clamp(edge, 0.0, 1.0) * (0.35 + 0.65 * diffuseColor.rgb) * (0.5 + 0.5 * vSpriteY);
            // menos saturada, para assentar na paleta do quarto
            float lum = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
            outgoingLight = mix(vec3(lum), outgoingLight, uSat);
          }
          #include <opaque_fragment>`
        );
    };
    this.mesh = new THREE.Mesh(geo, this.material);
    this.baseGeo = geo;
    this.sheet = null; // folha extra em uso (null = a de caminhada)
    // medidas usadas pela luz (a silhueta dela faz sombra)
    this.cellW = FW * TEXEL;
    this.cellH = FH * TEXEL;
    this.footFrac = FOOT_PAD / FH;

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 18),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35, depthWrite: false })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.y = 0.4;
    this.shadow.position.y = 0.006;

    this.facing = 1; // para onde ela quer olhar (o jogo pode mudar direto)
    this.shown = 1; // para onde o desenho está virado agora
    this.walkT = 0;
    this.time = 0;
    this.moving = false;
    this.reaching = 0;
    this.reachDur = 0;
    this.held = null;
    this.blinkT = 2 + Math.random() * 2;
    this.blinkK = -1; // tempo dentro da piscada (−1 = sem piscar)
    this.lean = 0;
    this.leanV = 0;
    this.squash = 0; // amassada de peso (passo, parada)
    this.bend = 0; // agachar / esticar (poses sem quadro próprio)
    this.clips = {};
    this.anim = null; // animação extra tocando agora
    this.glowK = 0; // luz da tela do celular (0–1, suavizada; a cena usa para acender uma luz)
    this.glowMesh = null;
    this.foods = null; // comidas que ela sabe segurar (addFoods)
    this.food = null; // comendo agora: { kind, level, ... }
    this.eatBusy = false; // em cena: segura a comida sem morder
    this.setFrame(cfg.IDLE);
  }

  setFrame(i) {
    this.frame = i;
    this.tex.offset.set(i / this.cfg.COUNT, 0);
  }

  // Carrega uma animação extra (folha separada no mesmo formato de célula)
  addClip(name, clip) {
    const tex = loadSheet(clip.url);
    tex.repeat.set(1 / clip.COUNT, 1);
    this.clips[name] = { ...clip, tex, glowTex: clip.glowUrl ? loadSheet(clip.glowUrl) : null };
    if (this.clips[name].glowTex) this.clips[name].glowTex.repeat.set(1 / clip.COUNT, 1);
  }

  // Folha com célula própria (grade 6×4): a placa ganha o tamanho da célula, na mesma
  // escala da folha de caminhada (H = altura da personagem nela) e com a sola no mesmo lugar
  sheetClip(def) {
    const tex = loadSheet(def.url);
    tex.repeat.set(1 / 6, 1 / 4);
    const T = (this.cfg.TEXEL * this.cfg.PX) / def.H;
    const geo = new THREE.PlaneGeometry(def.FW * T, def.FH * T);
    geo.translate(this.cfg.LEG_OFF * (this.cfg.TEXEL - T), (def.FH * T) / 2 - this.cfg.FOOT_PAD * T, 0);
    return { ...def, tex, geo, COLS: 6, ROWS: 4, COUNT: 24, texel: [1 / (def.FW * 6), 1 / (def.FH * 4)] };
  }

  // Comidas do parque: animação de pegar no balcão + folhas parada/andando comendo
  addFoods(foods) {
    this.foods = this.foods || {};
    for (const [kind, f] of Object.entries(foods)) {
      this.clips[`pegar-${kind}`] = { ...this.sheetClip(f.grab), seq: GRAB_SEQ };
      this.foods[kind] = { grab: `pegar-${kind}`, idle: this.sheetClip(f.idle), walk: this.sheetClip(f.walk) };
    }
  }

  // troca a folha desenhada (textura, tamanho da placa e passo de 1 pixel do contorno)
  useSheet(clip) {
    const want = clip || null;
    if (this.sheet === want) return;
    this.sheet = want;
    const tex = want ? want.tex : this.tex;
    this.material.map = tex;
    this.material.emissiveMap = tex;
    const geo = want?.geo || this.baseGeo;
    this.mesh.geometry = geo;
    if (this.glowMesh) this.glowMesh.geometry = geo;
    if (want?.texel) this.uniforms.uTexel.value.set(...want.texel);
    else this.uniforms.uTexel.value.set(1 / (this.cfg.FW * (want ? want.COUNT : this.cfg.COUNT)), 1 / this.cfg.FH);
  }

  // mostra o quadro f de uma folha extra (tira horizontal ou grade)
  sheetFrame(clip, f, tex = clip.tex) {
    if (clip.COLS) tex.offset.set((f % clip.COLS) / clip.COLS, 1 - (Math.floor(f / clip.COLS) + 1) / clip.ROWS);
    else tex.offset.set(f / clip.COUNT, 0);
  }

  // Começa a segurar uma comida (kind de foods) ou larga (null). Devolve false se ela
  // não tem folhas dessa comida. onChomp: a cada mordida; onFinish: quando acaba.
  carry(kind, { onChomp, onFinish } = {}) {
    const set = kind && this.foods?.[kind];
    if (!set) {
      this.food = null;
      return false;
    }
    this.food = { ...set, kind, level: 0, bit: false, biting: false, chomped: false, bt: 0, col: 0, t: 0, len: eatLen(), wait: 0.6, pending: false, onChomp, onFinish };
    return true;
  }

  // a comida pula um estágio sem ela morder (a Malu roubou um pedaço)
  skipBite() {
    if (!this.food) return false;
    this.nextLevel();
    return true;
  }

  nextLevel() {
    const F = this.food;
    F.level++;
    F.bit = F.biting = F.chomped = F.pending = false;
    F.t = 0;
    F.len = eatLen();
    F.wait = 0.5;
    if (F.level >= EAT_LEVELS) {
      this.food = null;
      this.squash = Math.max(this.squash, 0.4);
      F.onFinish?.();
    }
  }

  chomp() {
    this.food.chomped = true;
    this.squash = Math.max(this.squash, 0.35);
    this.food.onChomp?.();
  }

  // um quadro comendo: parada (mordida e pausa) ou andando (belisca no passo).
  // O estágio (linha) é o mesmo nas duas folhas; o tempo de cada estágio é comum às duas.
  updateFood(dt, moving, speed) {
    const F = this.food;
    let step = false;
    if (!this.eatBusy) {
      F.t += dt;
      F.wait -= dt;
    }
    if (F.t >= F.len && F.bit) F.pending = true;
    let sheet, col;
    if (moving) {
      F.biting = false;
      const before = this.walkT;
      this.walkT += (dt * Math.abs(speed)) / this.cfg.STRIDE;
      if (Math.floor(this.walkT * 2) !== Math.floor(before * 2)) step = true;
      col = Math.floor((this.walkT % 1) * 6) % 6;
      // troca de estágio só na virada do ciclo do passo (a folha segue em ordem)
      if (F.pending && col < F.col) {
        this.nextLevel();
        if (!this.food) return { step, done: true };
      }
      if (col >= 3 && F.col < 3 && !F.bit) {
        F.bit = true;
        this.chomp();
      }
      sheet = F.walk;
    } else {
      if (F.pending && !F.biting) {
        this.nextLevel();
        if (!this.food) return { step, done: true };
      }
      if (!F.biting && !F.bit && !this.eatBusy && F.wait <= 0) {
        F.biting = true;
        F.bt = 0;
        F.chomped = false;
      }
      col = F.bit ? 5 : 0;
      if (F.biting) {
        F.bt += dt;
        let acc = 0, i = 0;
        while (i < EAT_SEQ.length && F.bt >= acc + EAT_SEQ[i]) acc += EAT_SEQ[i++];
        if (i >= EAT_SEQ.length) {
          F.biting = false;
          F.bit = true;
          col = 5;
        } else {
          col = i;
          if (i >= 3 && !F.chomped) this.chomp();
        }
      }
      sheet = F.idle;
    }
    F.col = col;
    this.useSheet(sheet);
    this.sheetFrame(sheet, F.level * 6 + col);
    return { step, done: false };
  }

  // camada aditiva por cima do corpo (o brilho da tela): mesma placa, mesmo quadro
  ensureGlow(tex) {
    if (!this.glowMesh) {
      this.glowMesh = new THREE.Mesh(
        this.mesh.geometry,
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, color: '#9eaeff' })
      );
      this.glowMesh.position.z = 0.004;
      this.glowMesh.renderOrder = 2;
      this.mesh.add(this.glowMesh);
    }
    this.glowMesh.material.map = tex;
    this.glowMesh.material.needsUpdate = true;
  }

  // Toca uma animação extra. onEvent(nome) nos quadros marcados ('press', 'tela')
  // e 'loop' quando entra na parte que repete. Com loop, fica repetindo até release().
  // Devolve uma promessa que resolve quando termina (o sprite volta à folha normal).
  play(name, { onEvent } = {}) {
    const clip = this.clips[name];
    if (!clip) return Promise.resolve();
    this.anim?.resolve?.();
    return new Promise((resolve) => {
      this.anim = { clip, list: clip.seq, phase: 'seq', t: 0, i: -1, onEvent, resolve };
      this.useSheet(clip);
      if (clip.glowTex) this.ensureGlow(clip.glowTex);
    });
  }

  // sai da repetição: toca o "out" a partir do quadro em que está (ou para, se não tiver)
  release() {
    const a = this.anim;
    if (!a || a.phase === 'out') return;
    const out = a.clip.out;
    if (!out) return this.stopClip();
    const cur = a.list[Math.max(0, a.i)]?.[0];
    const from = Math.max(0, out.findIndex((e) => e[0] === cur));
    a.phase = 'out';
    a.list = out.slice(from);
    a.t = 0;
    a.i = -1;
  }

  get clipPhase() {
    return this.anim?.phase ?? null;
  }

  stopClip() {
    const a = this.anim;
    if (!a) return;
    this.anim = null;
    this.useSheet(null);
    this.setFrame(this.cfg.IDLE);
    this.glowK = 0;
    if (this.glowMesh) this.glowMesh.material.opacity = 0;
    a.resolve();
  }

  // avança a animação extra; true enquanto ela estiver tocando
  updateClip(dt) {
    const a = this.anim;
    if (!a) return false;
    a.t += dt;
    let list = a.list;
    let acc = 0, i = 0;
    while (i < list.length && a.t >= acc + list[i][1]) acc += list[i++][1];
    if (i >= list.length) {
      if (a.phase === 'seq' && a.clip.loop) {
        // entra na repetição
        a.phase = 'loop';
        a.list = list = a.clip.loop;
        a.t -= acc;
        a.i = -1;
        i = 0;
        a.onEvent?.('loop');
      } else if (a.phase === 'loop') {
        a.t -= acc;
        a.i = -1;
        i = 0;
      } else {
        this.stopClip();
        return false;
      }
    }
    if (i !== a.i) {
      // entrou num quadro novo (dispara os eventos dos quadros pulados também)
      for (let k = a.i + 1; k <= i; k++) if (list[k][2]) a.onEvent?.(list[k][2]);
      a.i = i;
      const f = list[i][0];
      this.sheetFrame(a.clip, f);
      if (a.clip.glowTex) this.sheetFrame(a.clip, f, a.clip.glowTex);
      if (list[i][2] === 'press') this.squash = Math.max(this.squash, 0.35); // peso do aperto
    }
    // luz da tela: acende rápido, apaga um pouco mais devagar
    if (a.clip.glowTex) {
      const on = list[i][0] >= a.clip.glowFrom ? 1 : 0;
      this.glowK += (on - this.glowK) * Math.min(1, dt * (on ? 14 : 9));
      // pisca bem de leve (tela rolando)
      const flick = 1 + Math.sin(this.time * 7.3) * 0.04 + Math.sin(this.time * 17.1) * 0.025;
      this.glowMesh.material.opacity = this.glowK * 0.2 * flick;
    }
    return true;
  }

  // Luz de preenchimento: cor e força (o jogo passa conforme a luz do quarto)
  setFill(color, intensity) {
    this.material.emissive.copy(color);
    this.material.emissiveIntensity = intensity;
  }

  // Luz de contorno vinda da cena: cor (já com a força) e x da luz no mundo
  setRim(color, lightX) {
    this.uniforms.uRimColor.value.copy(color);
    this.rimX = lightX;
  }

  // speed em m/s (com sinal no eixo x; 0 no x mas andando em z → passe o módulo
  // com o sinal do lado para onde ela está virada). Retorna true quando um pé
  // toca o chão (para o som de passo).
  update(dt, speed) {
    let step = false;
    this.time += dt;
    const moving = Math.abs(speed) > 0.05;
    if (moving) this.facing = Math.sign(speed);

    // virada seca: espelha na hora e começa o passo do início
    if (this.facing !== this.shown) {
      this.shown = this.facing;
      if (moving) this.walkT = 0;
      this.leanV = 0;
      this.lean *= -0.3;
    }

    // piscar: meio fechado → fechado → meio fechado (às vezes duas vezes)
    this.blinkT -= dt;
    if (this.blinkT <= 0 && this.blinkK < 0) {
      this.blinkK = 0;
      this.blinkT = Math.random() < 0.2 ? 0.32 : 2.6 + Math.random() * 3.5;
    }
    const { IDLE, HALF, BLINK, WALK, STRIDE } = this.cfg;
    let eye = IDLE;
    if (this.blinkK >= 0) {
      this.blinkK += dt;
      const k = this.blinkK;
      eye = k < 0.04 ? HALF : k < 0.11 ? BLINK : k < 0.16 ? HALF : IDLE;
      if (k >= 0.16) this.blinkK = -1;
    }

    if (moving && !this.moving) this.walkT = 0; // começa do primeiro quadro do passo
    if (!moving && this.moving) this.squash = 0.8; // assenta o peso ao parar
    this.moving = moving;

    let frame = eye;
    const clipOn = this.updateClip(dt);
    let foodOn = false;
    if (clipOn) frame = this.frame; // a animação extra cuida do quadro
    else if (this.food) {
      // comendo: a folha da comida cuida do quadro (parada ou andando)
      const r = this.updateFood(dt, moving, speed);
      step = r.step;
      foodOn = !r.done;
    }
    if (!clipOn && !foodOn && moving && this.held == null && this.reaching <= 0) {
      const before = this.walkT;
      this.walkT += (dt * Math.abs(speed)) / STRIDE;
      if (Math.floor(this.walkT * 2) !== Math.floor(before * 2)) step = true; // contato: quadros 0 e 5
      frame = WALK[Math.floor((this.walkT % 1) * WALK.length) % WALK.length];
    }
    if (!clipOn && !foodOn) {
      this.useSheet(null);
      this.setFrame(frame);
    }

    // poses sem quadro próprio: o corpo dobra/estica a partir dos pés
    let bendTarget = 0, leanExtra = 0;
    if (this.held === 13) {
      bendTarget = -0.1; // agachada pegando algo
      leanExtra = 0.12;
    } else if (this.held === 14) {
      bendTarget = 0.02; // segurando algo na frente
      leanExtra = -0.03;
    }
    if (this.reaching > 0) {
      this.reaching -= dt;
      const k = Math.sin(Math.min(1, (this.reachDur - this.reaching) / this.reachDur) * Math.PI);
      leanExtra += 0.07 * k;
      bendTarget += 0.015 * k;
    }
    this.bend += (bendTarget - this.bend) * Math.min(1, dt * 14);

    // game feel: peso no passo, inclinação com mola, respiração parada
    if (step) this.squash = Math.max(this.squash, 0.5);
    this.squash = Math.max(0, this.squash - dt * 6);
    const target = (moving ? Math.min(Math.abs(speed), 2) * 0.012 : 0) + leanExtra;
    this.leanV += ((target - this.lean) * 170 - this.leanV * 13) * dt;
    this.lean += this.leanV * dt;
    const breath = moving ? 0 : Math.sin((this.time / 3.4) * Math.PI * 2) * 0.006;
    const sq = this.squash * 0.03;
    this.mesh.scale.set(this.shown * (1 + sq * 0.5), 1 - sq + breath + this.bend, 1);
    this.mesh.rotation.z = -this.lean * this.shown;

    // contorno de luz do lado da luz (em coordenadas da textura, que espelha junto)
    if (this.rimX != null) this.uniforms.uRimDir.value = Math.sign(this.rimX - this.mesh.position.x || 1) * this.shown;

    this.shadow.position.x = this.mesh.position.x;
    this.shadow.position.z = this.mesh.position.z + 0.02;
    this.shadow.scale.set(1 + sq * 2, 0.4, 1);
    return step;
  }

  reach(seconds = 0.6) {
    this.reaching = seconds;
    this.reachDur = seconds;
  }

  // Trava uma pose (13 = abaixada pegando algo, 14 = segurando algo na frente) até chamar pose(null)
  pose(frame) {
    this.held = frame;
  }
}

export class AniSprite extends WalkSprite {
  constructor() {
    super(ANI_SPRITE);
    for (const [name, clip] of Object.entries(ANI_CLIPS)) this.addClip(name, clip);
  }
}

// ===============================================================
// Ani vista de cima (plano zenital): cabeça, ombros e braços.
// Desenhada virada para +x; o plano deita no chão e gira em y.
// ===============================================================
export const TOP_PX = 56;
export const TOP_TEXEL = 0.0098;

function drawTop(ctx, reach) {
  const W = ctx.canvas;
  const cx = 26, cy = 28;
  // capuz caído nas costas
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx - 9, cy, 5, 8, 0, 0, Math.PI * 2);
    g.fill();
  }, C.hoodieShade);
  // braços (de trás = lado de cima do desenho)
  const arm = (sy, hx, hy, back) => {
    part(W, (g) => {
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - 1, sy);
      g.quadraticCurveTo(cx + 6, sy + (hy - sy) * 0.2, hx, hy);
      g.stroke();
    }, back ? C.hoodieShade : (x, y) => (y > sy + 2 ? C.hoodieShade : C.hoodie));
    part(W, (g) => {
      g.beginPath();
      g.arc(hx + 2, hy, 2.4, 0, Math.PI * 2);
      g.fill();
    }, back ? C.skinShade : C.skin);
  };
  // pontas dos tênis aparecendo na frente (ela está agachada): biqueira creme
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 17, cy - 6, 4.2, 2.8, 0.1, 0, Math.PI * 2);
    g.ellipse(cx + 17, cy + 6, 4.2, 2.8, -0.1, 0, Math.PI * 2);
    g.fill();
  }, (x) => (x > cx + 18 ? C.cream : C.shoe));
  // joelhos (calça larga vinho) logo atrás dos tênis
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 11, cy - 5, 4.6, 3.6, 0, 0, Math.PI * 2);
    g.ellipse(cx + 11, cy + 5, 4.6, 3.6, 0, 0, Math.PI * 2);
    g.fill();
  }, (x, y) => ((x + y) % 4 === 0 ? C.pantsShade : y < cy ? C.pantsHi : C.pants));
  arm(cy - 13, cx + 12, cy - 9, true);
  // ombros / moletom
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx - 1, cy, 8, 16, 0, 0, Math.PI * 2);
    g.fill();
  }, (x, y) => (y > cy + 9 ? C.hoodieShade : x > cx + 3 ? C.hoodieHi : C.hoodie));
  if (reach) arm(cy + 13, cx + 25, cy + 9, false);
  else arm(cy + 13, cx + 12, cy + 9, false);
  // cabeça: chanel preto visto de cima, com o brilho em anel, a risca e uns fios soltos
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 2, cy, 10.5, 10, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(cx - 7, cy - 6);
    g.lineTo(cx - 10, cy - 9);
    g.moveTo(cx - 6, cy + 8);
    g.lineTo(cx - 9, cy + 10);
    g.stroke();
  }, (x, y) => {
    const d = Math.hypot(x - (cx + 1), y - (cy - 1));
    if (d > 5.5 && d < 7.5 && x < cx + 6 && y < cy + 3) return C.hairHi;
    if (y === cy - 2 && x > cx - 5 && x < cx + 7) return '#2a2534'; // risca
    return C.hair;
  });
  // ponta do nariz aparecendo além da franja
  const g2 = W.getContext('2d');
  g2.fillStyle = C.skin;
  g2.fillRect(cx + 13, cy, 1, 2);
}

export class AniTop {
  constructor() {
    const c = document.createElement('canvas');
    c.width = TOP_PX * 2;
    c.height = TOP_PX;
    for (let i = 0; i < 2; i++) {
      const f = document.createElement('canvas');
      f.width = f.height = TOP_PX;
      drawTop(f.getContext('2d'), i === 1);
      c.getContext('2d').drawImage(f, i * TOP_PX, 0);
    }
    this.tex = new THREE.CanvasTexture(c);
    this.tex.magFilter = this.tex.minFilter = THREE.NearestFilter;
    this.tex.generateMipmaps = false;
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.repeat.set(0.5, 1);
    this.material = new THREE.MeshBasicMaterial({ map: this.tex, alphaTest: 0.5 });
    const geo = new THREE.PlaneGeometry(TOP_PX * TOP_TEXEL, TOP_PX * TOP_TEXEL);
    geo.rotateX(-Math.PI / 2);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.baseGeo = geo;
    this.sheet = null; // folha extra em uso (null = a de caminhada)
    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 20),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.4, depthWrite: false })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.mesh.visible = this.shadow.visible = false;
  }
  setReach(on) {
    this.tex.offset.x = on ? 0.5 : 0;
  }
}
