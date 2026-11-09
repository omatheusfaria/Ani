// Texto em pixel art para desenhar dentro de canvas (íris, tela do celular, pôsteres).
// O texto é desenhado com a fonte Pixelify Sans e depois "binarizado" (sem antialias),
// para os pixels ficarem nítidos como em pixel art de verdade.

export const FONT = '"Pixelify Sans", monospace';
// 'ui' = Pixelify Sans (títulos, menus). 'tiny' = Tiny5 (texto miúdo, nítido em 8px).
export const FONTS = { ui: FONT, tiny: '"Tiny5", monospace' };
const cache = new Map();

export async function loadFonts() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`400 10px ${FONT}`),
        document.fonts.load(`700 10px ${FONT}`),
        document.fonts.load(`400 8px ${FONTS.tiny}`),
        document.fonts.load(`400 20px "Patrick Hand"`),
      ]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {
    /* segue com a fonte reserva */
  }
  cache.clear();
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function textCanvas(text, size = 8, color = '#ffffff', weight = 400, family = 'ui') {
  const key = `${text}|${size}|${color}|${weight}|${family}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  let ctx = c.getContext('2d');
  // A Tiny5 só tem um peso (e só fica nítida em 8px): destaque é feito pela cor.
  const fakeBold = 0;
  const font = `${family === 'tiny' ? 400 : weight} ${size}px ${FONTS[family] || FONT}`;
  ctx.font = font;
  const PAD = 2;
  const w = Math.max(1, Math.ceil(ctx.measureText(text).width) + PAD * 2 + fakeBold);
  const h = Math.ceil(size * 1.35) + 2;
  c.width = w;
  c.height = h;
  ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, PAD, 1);
  if (fakeBold) ctx.fillText(text, PAD + 1, 1);

  const img = ctx.getImageData(0, 0, w, h);
  const [r, g, b] = hexToRgb(color);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] >= 110) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
    } else {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(img, 0, 0);

  c.pad = PAD;
  if (cache.size > 800) cache.clear();
  cache.set(key, c);
  return c;
}

// Desenha texto nítido. align: 'left' | 'center' | 'right'. Retorna a largura.
export function drawText(ctx, text, x, y, { size = 8, color = '#ffffff', align = 'left', weight = 400, alpha = 1, font = 'ui' } = {}) {
  const c = textCanvas(String(text), size, color, weight, font);
  const inner = c.width - c.pad * 2;
  let dx = x - c.pad;
  if (align === 'center') dx -= Math.floor(inner / 2);
  else if (align === 'right') dx -= inner;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * alpha;
  ctx.drawImage(c, Math.round(dx), Math.round(y));
  ctx.globalAlpha = prev;
  return inner;
}

export function measure(text, size = 8, weight = 400, font = 'ui') {
  const c = textCanvas(String(text), size, '#ffffff', weight, font);
  return c.width - c.pad * 2;
}

// Quebra um texto em linhas que caibam em maxW pixels.
export function wrap(text, maxW, size = 8, weight = 400, font = 'ui') {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (measure(test, size, weight, font) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Remove o antialias de um canvas desenhado com formas (alpha vira 0 ou 255).
export function crisp(canvas, threshold = 110) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= threshold ? 255 : 0;
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// Desenha um bitmap definido por linhas de texto ('.' = vazio).
export function drawBitmap(ctx, rows, x, y, colors, scale = 1) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const col = colors[row[i]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x + i * scale), Math.round(y + j * scale), scale, scale);
    }
  });
}
