import * as THREE from 'three';

// ===============================================================
// Ani, vista de lado, em pixel art desenhada por código.
// Cabelo chanel preto com franja, moletom preto, saia xadrez vinho,
// meia-calça listrada e coturno. Cada parte do corpo é uma forma
// com contorno próprio; braços e pernas giram para animar a caminhada.
// (Pode ser trocada por um sprite do Sprite Fusion no futuro.)
// ===============================================================

export const FW = 44; // largura de um quadro (pixels)
export const FH = 86; // altura de um quadro
export const TEXEL = 0.0189; // metros por pixel → ~1,62 m de altura

const C = {
  outline: '#0b0910',
  skin: '#ecd9d7',
  skinShade: '#c7a6ad',
  hair: '#16131c',
  hairHi: '#3a3448',
  hoodie: '#2c2b35',
  hoodieShade: '#1d1c25',
  hoodieHi: '#41404d',
  string: '#d9d4e2',
  skirt: '#7a1f33',
  skirtDark: '#2a0e16',
  skirtLine: '#b0364f',
  stockA: '#1a1420',
  stockB: '#5e2c66',
  stockBackA: '#100c15',
  stockBackB: '#3d1d45',
  boot: '#121016',
  bootHi: '#34313d',
  sole: '#4a4552',
  eye: '#0b0910',
  lip: '#a86b79',
  choker: '#0b0910',
};

// --- Rasterização nítida de uma "parte" com contorno de 1 pixel ---
function part(target, draw, fill, { outline = true } = {}) {
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
        tctx.fillStyle = typeof fill === 'function' ? fill(x, y) : fill;
        tctx.fillRect(x, y, 1, 1);
      } else if (outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) {
        tctx.fillStyle = C.outline;
        tctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

const rot = (a, len) => [Math.sin(a) * len, Math.cos(a) * len]; // a = 0 → para baixo; a > 0 → para frente

// --- Pose: ângulos dos membros e deslocamentos ---
function drawFrame(ctx, pose) {
  const { bob = 0, legF = 0, legB = 0, kneeF = 0, kneeB = 0, armF = 0, armB = 0, elbowF = 0.2, elbowB = 0.2, breath = 0 } = pose;
  const W = ctx.canvas;

  const hip = [21, 50 + bob];
  const shoulder = [22, 32 + bob + breath];
  const THIGH = 13, SHIN = 14;

  const leg = (a, k, back) => {
    const knee = [hip[0] + rot(a, THIGH)[0], hip[1] + rot(a, THIGH)[1]];
    const ankle = [knee[0] + rot(a - k, SHIN)[0], knee[1] + rot(a - k, SHIN)[1]];
    const A = back ? C.stockBackA : C.stockA;
    const B = back ? C.stockBackB : C.stockB;
    part(W, (g) => {
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(hip[0], hip[1]);
      g.lineTo(knee[0], knee[1]);
      g.lineTo(ankle[0], ankle[1]);
      g.stroke();
    }, (x, y) => (Math.floor(y / 2) % 2 ? A : B));
    // coturno
    const sa = (a - k) * 0.35;
    part(W, (g) => {
      g.translate(ankle[0], ankle[1]);
      g.rotate(-sa);
      g.beginPath();
      g.roundRect(-3.5, -3, 11, 6.5, [2, 3, 1, 1]);
      g.fill();
    }, (x, y) => {
      const local = y - ankle[1];
      return local > 2 ? C.sole : back ? '#0b0a0e' : (x > ankle[0] + 3 && local < -1 ? C.bootHi : C.boot);
    });
  };

  const arm = (a, e, back) => {
    const elbow = [shoulder[0] + rot(a, 11)[0], shoulder[1] + rot(a, 11)[1]];
    const wrist = [elbow[0] + rot(a + e, 10)[0], elbow[1] + rot(a + e, 10)[1]];
    part(W, (g) => {
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(shoulder[0], shoulder[1]);
      g.lineTo(elbow[0], elbow[1]);
      g.lineTo(wrist[0], wrist[1]);
      g.stroke();
    }, back ? C.hoodieShade : (x, y) => (x < shoulder[0] - 1 ? C.hoodieShade : C.hoodie));
    const hand = [wrist[0] + rot(a + e, 3)[0], wrist[1] + rot(a + e, 3)[1]];
    part(W, (g) => {
      g.beginPath();
      g.arc(hand[0], hand[1], 2.2, 0, Math.PI * 2);
      g.fill();
    }, back ? C.skinShade : C.skin);
  };

  // Atrás do corpo: braço e perna de trás
  arm(armB, elbowB, true);
  leg(legB, kneeB, true);

  // Capuz caído nas costas
  part(W, (g) => {
    g.beginPath();
    g.ellipse(14, 31 + bob, 5, 4, -0.3, 0, Math.PI * 2);
    g.fill();
  }, C.hoodieShade);

  // Saia xadrez
  part(W, (g) => {
    g.beginPath();
    g.moveTo(14, 44 + bob);
    g.lineTo(29, 44 + bob);
    g.lineTo(32, 56 + bob);
    g.lineTo(11, 56 + bob);
    g.closePath();
    g.fill();
  }, (x, y) => {
    if (y === 55 + bob) return C.skirtDark;
    if (x % 4 === 0) return C.skirtDark;
    if ((y - bob) % 4 === 1) return C.skirtLine;
    return C.skirt;
  });

  // Perna da frente
  leg(legF, kneeF, false);

  // Moletom (tronco)
  part(W, (g) => {
    g.beginPath();
    g.roundRect(13, 29 + bob + breath, 17, 19 - breath, [5, 5, 2, 2]);
    g.fill();
  }, (x, y) => {
    if (x >= 27) return C.hoodieHi;
    if (x <= 15) return C.hoodieShade;
    if (y === 40 + bob && x > 17 && x < 28) return C.hoodieShade; // bolso
    return C.hoodie;
  });
  // cordão do capuz
  const ctx2 = W.getContext('2d');
  ctx2.fillStyle = C.string;
  ctx2.fillRect(27, 32 + bob + breath, 1, 4);

  // Pescoço + gargantilha
  part(W, (g) => g.fillRect(21, 26 + bob, 5, 5), C.skinShade, { outline: false });
  ctx2.fillStyle = C.choker;
  ctx2.fillRect(21, 29 + bob, 5, 1);

  // Cabeça
  const hy = bob;
  // rosto
  part(W, (g) => {
    g.beginPath();
    g.moveTo(22, 13 + hy);
    g.lineTo(32.2, 13 + hy);
    g.lineTo(32.5, 17 + hy);
    g.lineTo(34.5, 20.5 + hy); // nariz
    g.lineTo(32.5, 21.5 + hy);
    g.quadraticCurveTo(33, 25 + hy, 31, 26.5 + hy);
    g.quadraticCurveTo(27, 28.5 + hy, 23, 26 + hy);
    g.closePath();
    g.fill();
  }, (x, y) => (x < 26 ? C.skinShade : C.skin));
  // olho com delineado e boca
  ctx2.fillStyle = C.eye;
  ctx2.fillRect(29, 17 + hy, 2, 2);
  ctx2.fillRect(31, 16 + hy, 1, 1);
  ctx2.fillRect(28, 16 + hy, 3, 1);
  ctx2.fillStyle = C.lip;
  ctx2.fillRect(31, 24 + hy, 1, 1);

  // Cabelo chanel com franja reta
  part(W, (g) => {
    g.beginPath();
    g.moveTo(11, 25 + hy);
    g.quadraticCurveTo(9, 10 + hy, 17, 5 + hy);
    g.quadraticCurveTo(27, 1 + hy, 32, 7 + hy);
    g.quadraticCurveTo(34, 10 + hy, 33.5, 15 + hy); // franja reta
    g.lineTo(25.5, 15 + hy);
    g.lineTo(25, 24 + hy);
    g.quadraticCurveTo(25, 27 + hy, 26.5, 28 + hy); // mecha na frente da orelha
    g.lineTo(13, 28 + hy);
    g.closePath();
    g.fill();
  }, (x, y) => {
    const ly = y - hy;
    if (ly < 7 && x > 17 && x < 27 && (x + ly) % 5 === 0) return C.hairHi; // brilho
    if (ly === 6 && x > 18 && x < 28) return C.hairHi;
    return C.hair;
  });

  // Braço da frente (por cima de tudo)
  arm(armF, elbowF, false);
}

// --- Folha de sprites ---
// Quadros: 0-3 parada (respirando), 4-11 andando, 12 alcançando algo,
// 13 pegando algo à frente, 14 segurando algo no alto
export function buildAniSheet() {
  const frames = [];
  for (let i = 0; i < 4; i++) frames.push({ breath: i === 2 ? 1 : 0, armF: 0.04, armB: -0.04, elbowF: 0.15, elbowB: 0.15 });
  for (let i = 0; i < 8; i++) {
    const p = (i / 8) * Math.PI * 2;
    const s = Math.sin(p);
    frames.push({
      bob: Math.abs(Math.cos(p)) > 0.7 ? 0 : -1,
      legF: s * 0.48,
      legB: -s * 0.48,
      kneeF: Math.max(0, -Math.cos(p)) * 0.75,
      kneeB: Math.max(0, Math.cos(p)) * 0.75,
      armF: -s * 0.42,
      armB: s * 0.42,
      elbowF: 0.25 + Math.max(0, -s) * 0.3,
      elbowB: 0.25 + Math.max(0, s) * 0.3,
    });
  }
  frames.push({ armF: 1.25, elbowF: 0.1, armB: -0.1, legF: 0.1, legB: -0.08 });
  // 13: se abaixando para pegar algo na frente (braços estendidos, um pouco curvada)
  frames.push({ bob: 1, armF: 1.45, elbowF: 0.05, armB: 1.3, elbowB: 0.05, legF: 0.22, kneeF: 0.3, legB: -0.05, kneeB: 0.2 });
  // 14: segurando algo no alto, na frente do corpo
  frames.push({ armF: 2.25, elbowF: -0.35, armB: 2.1, elbowB: -0.3, legF: 0.05, legB: -0.05 });

  const sheet = document.createElement('canvas');
  sheet.width = FW * frames.length;
  sheet.height = FH;
  const sctx = sheet.getContext('2d');
  frames.forEach((pose, i) => {
    const c = document.createElement('canvas');
    c.width = FW;
    c.height = FH;
    drawFrame(c.getContext('2d'), pose);
    sctx.drawImage(c, i * FW, 0);
  });
  return { sheet, count: frames.length };
}

// --- Personagem no mundo 3D ---
export class AniSprite {
  constructor() {
    const { sheet, count } = buildAniSheet();
    this.sheet = sheet;
    this.count = count;
    this.tex = new THREE.CanvasTexture(sheet);
    this.tex.magFilter = THREE.NearestFilter;
    this.tex.minFilter = THREE.NearestFilter;
    this.tex.generateMipmaps = false;
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.repeat.set(1 / count, 1);

    const geo = new THREE.PlaneGeometry(FW * TEXEL, FH * TEXEL);
    geo.translate(0, (FH * TEXEL) / 2 - 1 * TEXEL, 0); // pés no chão
    this.material = new THREE.MeshBasicMaterial({ map: this.tex, alphaTest: 0.5, transparent: false });
    this.mesh = new THREE.Mesh(geo, this.material);

    // sombra no chão
    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 18),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35, depthWrite: false })
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.scale.y = 0.4;
    this.shadow.position.y = 0.006;

    this.facing = 1;
    this.flip = 1;
    this.walkT = 0;
    this.idleT = 0;
    this.reaching = 0;
    this.lastStep = 0;
  }

  setFrame(i) {
    this.tex.offset.x = i / this.count;
  }

  // speed em m/s (com sinal). Retorna true quando um pé toca o chão (para o som de passo).
  update(dt, speed) {
    let step = false;
    if (Math.abs(speed) > 0.05) this.facing = Math.sign(speed);
    // virar com uma "espremida" rápida
    this.flip += (this.facing - this.flip) * Math.min(1, dt * 22);
    this.mesh.scale.x = Math.sign(this.flip || 1) * Math.max(0.6, Math.abs(this.flip));

    if (this.held != null) {
      this.setFrame(this.held);
    } else if (this.reaching > 0) {
      this.reaching -= dt;
      this.setFrame(12);
    } else if (Math.abs(speed) > 0.05) {
      const before = Math.floor(this.walkT * 2);
      this.walkT += dt * Math.abs(speed) * 1.25;
      if (Math.floor(this.walkT * 2) !== before) step = true;
      this.setFrame(4 + (Math.floor(this.walkT * 8) % 8));
      this.idleT = 0;
    } else {
      this.idleT += dt;
      this.setFrame(Math.floor(this.idleT * 2.2) % 4);
    }
    this.shadow.position.x = this.mesh.position.x;
    this.shadow.position.z = this.mesh.position.z + 0.02;
    return step;
  }

  reach(seconds = 0.6) {
    this.reaching = seconds;
  }

  // Trava um quadro (13, 14...) até chamar pose(null)
  pose(frame) {
    this.held = frame;
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
  // pontas dos coturnos aparecendo na frente (ela está agachada)
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 17, cy - 6, 4, 2.6, 0.1, 0, Math.PI * 2);
    g.ellipse(cx + 17, cy + 6, 4, 2.6, -0.1, 0, Math.PI * 2);
    g.fill();
  }, C.boot);
  // joelhos (meia listrada) logo atrás das botas
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 11, cy - 5, 4, 3.2, 0, 0, Math.PI * 2);
    g.ellipse(cx + 11, cy + 5, 4, 3.2, 0, 0, Math.PI * 2);
    g.fill();
  }, (x) => (x % 2 ? C.stockA : C.stockB));
  arm(cy - 13, cx + 12, cy - 9, true);
  // ombros / moletom
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx - 1, cy, 8, 16, 0, 0, Math.PI * 2);
    g.fill();
  }, (x, y) => (y > cy + 9 ? C.hoodieShade : x > cx + 3 ? C.hoodieHi : C.hoodie));
  if (reach) arm(cy + 13, cx + 25, cy + 9, false);
  else arm(cy + 13, cx + 12, cy + 9, false);
  // cabeça: chanel preto visto de cima, com o brilho em anel e a risca
  part(W, (g) => {
    g.beginPath();
    g.ellipse(cx + 2, cy, 10.5, 10, 0, 0, Math.PI * 2);
    g.fill();
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
