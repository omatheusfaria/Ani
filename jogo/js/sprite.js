import * as THREE from 'three';

// Paleta Sweetie 16, usada nos sprites provisórios.
export const PAL = {
  ink: '#1a1c2c', plum: '#5d275d', red: '#b13e53', orange: '#ef7d57',
  yellow: '#ffcd75', lime: '#a7f070', green: '#38b764', teal: '#257179',
  navy: '#29366f', blue: '#3b5dc9', sky: '#41a6f6', cyan: '#73eff7',
  white: '#f4f4f4', silver: '#94b0c2', slate: '#566c86', dark: '#333c57',
};

// Desenha um sprite a partir de linhas de texto (1 caractere = 1 pixel).
export function canvasFromRows(rows, colors) {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const ctx = c.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const col = colors[ch];
      if (!col) return;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    });
  });
  return c;
}

// Junta vários quadros lado a lado (spritesheet horizontal).
export function sheetFromFrames(frames) {
  const w = frames[0].width;
  const h = frames[0].height;
  const c = document.createElement('canvas');
  c.width = w * frames.length;
  c.height = h;
  const ctx = c.getContext('2d');
  frames.forEach((f, i) => ctx.drawImage(f, i * w, 0));
  return c;
}

// Configura a textura para pixel art: sem suavização, sem mipmaps.
export function pixelTexture(source) {
  const tex = source.isTexture ? source : new THREE.CanvasTexture(source);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function loadPixelTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (t) => resolve(pixelTexture(t)), undefined, reject);
  });
}

// Sprite 2D em pé no mundo 3D: gira só no eixo Y para ficar de frente
// para a câmera (billboard cilíndrico, estilo HD-2D).
export class PixelSprite {
  constructor(texture, { frameW, frameH, frames = 1, fps = 8, height = 1.6 } = {}) {
    this.texture = texture.clone();
    this.texture.needsUpdate = true;
    this.texture.repeat.set(1 / frames, 1);

    const h = height;
    const w = h * (frameW / frameH);
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h / 2, 0); // origem nos pés

    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.frames = frames;
    this.fps = fps;
    this.time = 0;
    this.playing = false;
    this.setFrame(0);
  }

  setFrame(i) {
    this.frame = i % this.frames;
    this.texture.offset.x = this.frame / this.frames;
  }

  play() {
    this.playing = true;
  }

  stop(frame = 0) {
    this.playing = false;
    this.time = 0;
    this.setFrame(frame);
  }

  // facing: 1 = olhando para a direita, -1 = esquerda
  update(dt, cameraYaw, facing = 1) {
    if (this.playing) {
      this.time += dt;
      this.setFrame(Math.floor(this.time * this.fps));
    }
    this.mesh.rotation.y = cameraYaw;
    this.mesh.scale.x = facing;
  }
}

// ---------------------------------------------------------------
// Sprites provisórios: serão trocados pelos gerados no Sprite Fusion
// ---------------------------------------------------------------

const HERO_TOP = [
  '................',
  '......kkkk......',
  '.....khhhhk.....',
  '....khhhhhhk....',
  '....khsssshk....',
  '....ksessesk....',
  '....kssssssk....',
  '.....kssssk.....',
  '....kbbbbbbk....',
  '...kbbbbbbbbk...',
  '...ksbbbbbbsk...',
  '....kbbbbbbk....',
  '....kppppppk....',
];

const HERO_LEGS = [
  ['....kpk..kpk....', '....kpk..kpk....', '....kkk..kkk....'], // parado
  ['...kpk...kpk....', '..kpk.....kpk...', '..kkk.....kkk...'], // passo
  ['....kpk..kpk....', '....kpk..kpk....', '....kkk..kkk....'], // parado
  ['....kpk...kpk...', '...kpk.....kpk..', '...kkk.....kkk..'], // passo
];

const HERO_COLORS = {
  k: PAL.ink, h: PAL.red, s: '#f2b48a', e: PAL.ink, b: PAL.blue, p: PAL.dark,
};

export function makePlaceholderHero() {
  const frames = HERO_LEGS.map((legs) => canvasFromRows([...HERO_TOP, ...legs], HERO_COLORS));
  return { canvas: sheetFromFrames(frames), frameW: 16, frameH: 16, frames: frames.length };
}

export function makeFlower(petal) {
  return canvasFromRows(
    [
      '........',
      '..p..p..',
      '.pcp.pcp',
      '..p..p..',
      '..g..g..',
      '...gg.g.',
      '..g.gg..',
      '...gg...',
    ],
    { p: petal, c: PAL.yellow, g: PAL.green }
  );
}
