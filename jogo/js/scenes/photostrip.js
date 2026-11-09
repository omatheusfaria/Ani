// Tirinha de cabine fotográfica (4 fotos) da Ani com a Malu, em pixel art.
// Usa os retratos do Sprite Fusion, reduzidos e posados de jeitos diferentes.

// Resolução dobrada (2 pixels por milímetro) para a foto ficar bonita em tela cheia
export const STRIP_W = 112;
export const STRIP_H = 312;
export const FRAME_W = 96;
export const FRAME_H = 60;
export const METERS_PER_PX = 0.0005; // a tirinha real mede 5,6 x 15,6 cm
const BORDER = 8;
const GAP = 8;

export function frameRect(i) {
  return { x: BORDER, y: BORDER + i * (FRAME_H + GAP), w: FRAME_W, h: FRAME_H };
}

// Recorta o rosto do retrato (64x64) e reduz para "size" pixels
function face(img, size, { flipX = false } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  if (flipX) {
    g.translate(size, 0);
    g.scale(-1, 1);
  }
  g.drawImage(img, 6, 2, 52, 60, 0, 0, size, size);
  const d = g.getImageData(0, 0, size, size);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
  g.putImageData(d, 0, 0);
  return c;
}

function put(ctx, img, x, y, angle = 0) {
  ctx.save();
  ctx.translate(x + img.width / 2, y + img.height / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

// Mãozinha fazendo "V" (paz e amor)
function peace(ctx, x, y, s = 1) {
  const rows = ['.x.x.', '.x.x.', '.x.x.', 'xxxx.', 'xxxxx', '.xxx.'];
  rows.forEach((r, j) => [...r].forEach((ch, i) => {
    if (ch !== 'x') return;
    ctx.fillStyle = '#f1d3c7';
    ctx.fillRect(x + i * s, y + j * s, s, s);
  }));
  ctx.fillStyle = '#3a2430';
  ctx.fillRect(x + 1 * s, y - s, s, s);
  ctx.fillRect(x + 3 * s, y - s, s, s);
}

// Fundo da cabine: cortina listrada em tom quente
function booth(ctx, r, hue) {
  const cols = hue === 0 ? ['#e9c9a3', '#dcb58c'] : ['#e7b9b4', '#d9a29e'];
  for (let x = 0; x < r.w; x++) {
    ctx.fillStyle = cols[Math.floor(x / 6) % 2];
    ctx.fillRect(r.x + x, r.y, 1, r.h);
  }
}

// Leve sépia + flash + granulado para parecer foto de cabine
function develop(ctx, r, seed) {
  const img = ctx.getImageData(r.x, r.y, r.w, r.h);
  const d = img.data;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let y = 0; y < r.h; y++)
    for (let x = 0; x < r.w; x++) {
      const i = (y * r.w + x) * 4;
      const lum = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
      const k = 0.35; // dessaturação
      let R = d[i] * (1 - k) + lum * k + 14;
      let G = d[i + 1] * (1 - k) + lum * k + 4;
      let B = d[i + 2] * (1 - k) + lum * k - 10;
      // flash no centro, cantos mais escuros
      const dx = (x - r.w / 2) / (r.w / 2), dy = (y - r.h / 2) / (r.h / 2);
      const v = 1.08 - 0.28 * (dx * dx + dy * dy);
      const n = (rnd() - 0.5) * 14;
      d[i] = Math.max(0, Math.min(255, R * v + n));
      d[i + 1] = Math.max(0, Math.min(255, G * v + n));
      d[i + 2] = Math.max(0, Math.min(255, B * v + n));
    }
  ctx.putImageData(img, r.x, r.y);
}

export function makePhotoStrip({ ani, malu }) {
  const c = document.createElement('canvas');
  c.width = STRIP_W;
  c.height = STRIP_H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;

  // papel da tirinha
  ctx.fillStyle = '#f3efe6';
  ctx.fillRect(0, 0, STRIP_W, STRIP_H);

  const A = face(ani, 52);
  const M = face(malu, 52);
  const Msmall = face(malu, 48);
  const Asmall = face(ani, 48);

  const shots = [
    // 1: as duas olhando para a câmera
    (r) => {
      booth(ctx, r, 0);
      put(ctx, A, r.x + 2, r.y + 8);
      put(ctx, M, r.x + 42, r.y + 8);
    },
    // 2: cabeças inclinadas uma para a outra
    (r) => {
      booth(ctx, r, 1);
      put(ctx, A, r.x + 6, r.y + 10, 0.16);
      put(ctx, M, r.x + 38, r.y + 10, -0.16);
    },
    // 3: Malu faz "paz e amor", Ani meio escondida rindo
    (r) => {
      booth(ctx, r, 0);
      put(ctx, Asmall, r.x + 4, r.y + 14, -0.1);
      put(ctx, M, r.x + 40, r.y + 6, 0.05);
      peace(ctx, r.x + 82, r.y + 26, 2);
    },
    // 4: Malu encostada no ombro da Ani
    (r) => {
      booth(ctx, r, 1);
      put(ctx, Msmall, r.x + 38, r.y + 16, -0.32);
      put(ctx, A, r.x + 8, r.y + 6, 0.08);
    },
  ];
  shots.forEach((draw, i) => {
    const r = frameRect(i);
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    draw(r);
    ctx.restore();
    develop(ctx, r, 11 + i * 31);
  });

  // data escrita à mão no rodapé
  ctx.fillStyle = '#5a4e60';
  const y = STRIP_H - 22;
  const S = 2;
  const glyphs = {
    0: ['xxx', 'x.x', 'x.x', 'x.x', 'xxx'], 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xxx', '..x', 'xxx', 'x..', 'xxx'],
    5: ['xxx', 'x..', 'xxx', '..x', 'xxx'], '.': ['...', '...', '...', '...', '.x.'],
  };
  let x = 26;
  for (const ch of '12.10.25') {
    const gl = glyphs[ch];
    gl.forEach((row, j) => [...row].forEach((p, i) => p === 'x' && ctx.fillRect(x + i * S, y + j * S, S, S)));
    x += (ch === '.' ? 3 : 4) * S;
  }
  return c;
}
