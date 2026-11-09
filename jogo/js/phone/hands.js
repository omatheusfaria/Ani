import * as THREE from 'three';

// ===============================================================
// Mão direita segurando o celular, em pixel art.
//
// Cada parte (dedos, palma, polegar) é uma silhueta suave desenhada
// em canvas. O volume vem de um "mapa de altura" (a silhueta borrada),
// que vira 4 tons de pele + contorno, como um sprite feito à mão.
//
// Coordenadas em metros, no espaço do celular:
// o aparelho mede 0,31 x 0,64 (bordas em x = ±0,155 e y = ±0,32).
// ===============================================================

// 1 pixel da mão = 2 pixels na tela (a tela do celular é 1:1 = 463 px por metro)
const TEXEL = 2 / (276 / 0.596);

const PAL = {
  outline: [42, 28, 42],
  dark: [141, 104, 118],
  mid: [187, 147, 160],
  base: [223, 192, 195],
  light: [243, 223, 221],
  nail: [36, 24, 44],
  nailHi: [128, 112, 150],
  ring: [201, 210, 224],
  ringDark: [110, 118, 138],
  crease: [160, 120, 135],
  leaf: [95, 191, 122],
  leafDark: [47, 122, 74],
  crack: [42, 28, 42],
};
const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

// Região do celular → pixels do canvas
function region(x0, y0, x1, y1) {
  const w = Math.ceil((x1 - x0) / TEXEL);
  const h = Math.ceil((y1 - y0) / TEXEL);
  const P = ([x, y]) => [(x - x0) / TEXEL, (y1 - y) / TEXEL];
  return { w, h, P, x0, y0, x1, y1 };
}

// Contorno suave passando perto dos pontos (curvas quadráticas pelos pontos médios)
function smoothPath(ctx, pts) {
  const n = pts.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.beginPath();
  const m0 = mid(pts[n - 1], pts[0]);
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % n]);
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  ctx.closePath();
}

// Desenha a silhueta, calcula o volume e devolve um canvas sombreado
function shade(reg, drawShape, { light = [-0.55, -0.65], soft = 3, outline = true } = {}) {
  const { w, h } = reg;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  drawShape(ctx);
  const src = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = src[i * 4 + 3] >= 128 ? 1 : 0;

  // Mapa de altura: silhueta borrada algumas vezes
  let hm = Float32Array.from(mask);
  const tmp = new Float32Array(w * h);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -soft; k <= soft; k++) {
          const xx = x + k;
          if (xx >= 0 && xx < w) { s += hm[y * w + xx]; n++; }
        }
        tmp[y * w + x] = s / n;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -soft; k <= soft; k++) {
          const yy = y + k;
          if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; }
        }
        hm[y * w + x] = s / n;
      }
  }

  const L = [light[0], light[1], 0.62];
  const ll = Math.hypot(...L);
  const out = ctx.createImageData(w, h);
  const d = out.data;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : mask[y * w + x]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      let col;
      const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
      if (edge && outline) {
        col = PAL.outline;
      } else {
        const gx = (hm[y * w + Math.min(w - 1, x + 1)] - hm[y * w + Math.max(0, x - 1)]) * 3.2;
        const gy = (hm[Math.min(h - 1, y + 1) * w + x] - hm[Math.max(0, y - 1) * w + x]) * 3.2;
        const nl = Math.hypot(gx, gy, 1);
        const dot = (-gx * L[0] - gy * L[1] + L[2]) / (nl * ll);
        const v = dot + (hm[i] - 0.8) * 0.35;
        col = v > 0.92 ? PAL.light : v > 0.7 ? PAL.base : v > 0.45 ? PAL.mid : PAL.dark;
      }
      d[i * 4] = col[0];
      d[i * 4 + 1] = col[1];
      d[i * 4 + 2] = col[2];
      d[i * 4 + 3] = 255;
    }
  }
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(out, 0, 0);
  return c;
}

// Desenho nítido (sem antialias) de formas de detalhe por cima
function crispFill(ctx, w, h, color, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  draw(g);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const on = img.data[i + 3] >= 128;
    img.data[i] = color[0];
    img.data[i + 1] = color[1];
    img.data[i + 2] = color[2];
    img.data[i + 3] = on ? 255 : 0;
  }
  g.putImageData(img, 0, 0);
  ctx.drawImage(c, 0, 0);
}

// Mantém os detalhes só dentro da silhueta
function clipTo(base, layer) {
  const ctx = layer.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(base, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  return layer;
}

function layerLike(reg) {
  const c = document.createElement('canvas');
  c.width = reg.w;
  c.height = reg.h;
  return c;
}

// ---------------------------------------------------------------
// Dedos (atrás do celular, aparecendo na borda esquerda)
// ---------------------------------------------------------------

function makeFingers() {
  const R = region(-0.23, -0.225, -0.06, 0.05);
  const out = layerLike(R);
  const octx = out.getContext('2d');
  // de baixo para cima: o de cima sobrepõe o de baixo e o contorno separa os dedos
  const fingers = [
    { y: -0.176, tip: -0.196, hgt: 0.054 }, // mindinho
    { y: -0.12, tip: -0.208, hgt: 0.064 }, // anelar
    { y: -0.059, tip: -0.215, hgt: 0.068 }, // médio
    { y: 0.002, tip: -0.208, hgt: 0.066 }, // indicador
  ];
  for (const f of fingers) {
    const [tx, ty] = R.P([f.tip, f.y]);
    const [bx] = R.P([-0.07, f.y]);
    const hh = f.hgt / TEXEL;
    const finger = shade(R, (ctx) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-0.07); // pontas levemente para baixo
      ctx.beginPath();
      ctx.roundRect(0, -hh / 2, bx - tx, hh, [hh / 2, 0, 0, hh / 2]);
      ctx.fill();
      ctx.restore();
    }, { soft: 2 });
    // unha preta aparecendo na ponta
    const nail = layerLike(R);
    crispFill(nail.getContext('2d'), R.w, R.h, PAL.nail, (g) => {
      g.save();
      g.translate(tx, ty);
      g.rotate(-0.07);
      g.beginPath();
      g.ellipse(1.4, -hh * 0.1, 2.2, hh * 0.32, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
    clipTo(finger, nail);
    const fctx = finger.getContext('2d');
    fctx.drawImage(nail, 0, 0);
    octx.drawImage(finger, 0, 0);
  }
  return { canvas: out, reg: R };
}

// ---------------------------------------------------------------
// Palma + polegar (na frente, do lado direito)
// ---------------------------------------------------------------

function makeThumbHand() {
  const R = region(0.1, -0.62, 0.37, 0.0);
  const P = R.P;

  // Eixo do polegar: da base (dentro da palma) até a ponta
  const B = [0.248, -0.35];
  const T = [0.158, -0.088];
  const dx = T[0] - B[0], dy = T[1] - B[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len; // direção do polegar
  const nx = -uy, ny = ux; // perpendicular (aponta para a esquerda/cima)
  // leve curvatura: a ponta do polegar dobra um pouco para fora
  const bend = (t) => 0.012 * Math.sin(Math.PI * t * 0.9) - 0.006 * t;
  const along = (t, off) => {
    const o = off + bend(t);
    return [B[0] + dx * t + nx * o, B[1] + dy * t + ny * o];
  };

  // Largura do polegar ao longo do eixo (mais grosso na base, junta marcada)
  const width = (t) => 0.047 - 0.011 * t + 0.004 * Math.exp(-((t - 0.55) ** 2) / 0.01);
  const thumbPts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    thumbPts.push(along(t, width(t)));
  }
  // ponta arredondada
  const tipR = width(1);
  for (let i = 1; i < 8; i++) {
    const a = (i / 8) * Math.PI;
    const c = Math.cos(a), s = Math.sin(a);
    const tip = along(1, 0);
    thumbPts.push([tip[0] + nx * tipR * c + ux * tipR * s, tip[1] + ny * tipR * c + uy * tipR * s]);
  }
  for (let i = 10; i >= 0; i--) {
    const t = i / 10;
    thumbPts.push(along(t, -width(t)));
  }

  // Palma (eminência do polegar + lateral da mão), colada na borda do celular
  const palmPts = [
    [0.157, -0.62], [0.154, -0.42], [0.158, -0.34], [0.178, -0.29],
    [0.215, -0.27], [0.262, -0.28], [0.302, -0.335], [0.327, -0.45],
    [0.342, -0.62],
  ];

  // Silhueta única (palma + polegar) para o volume ficar contínuo
  const hand = shade(R, (ctx) => {
    smoothPath(ctx, palmPts.map(P));
    ctx.fill();
    smoothPath(ctx, thumbPts.map(P));
    ctx.fill();
  }, { soft: 4 });
  const hctx = hand.getContext('2d');

  // Detalhes
  const det = layerLike(R);
  const dctx = det.getContext('2d');
  const toPx = (p) => P(p);

  // Dobra entre o polegar e a palma
  crispFill(dctx, R.w, R.h, PAL.crease, (g) => {
    g.lineWidth = 1.2;
    g.beginPath();
    const a = toPx(along(0.42, -width(0.42) + 0.004));
    const b = toPx(along(0.1, -width(0.1) - 0.006));
    const c = toPx([0.24, -0.33]);
    g.moveTo(a[0], a[1]);
    g.quadraticCurveTo(b[0], b[1], c[0], c[1]);
    g.stroke();
  });

  // Dobrinha da junta do polegar
  crispFill(dctx, R.w, R.h, PAL.crease, (g) => {
    g.lineWidth = 1.1;
    const a = toPx(along(0.56, width(0.56) * 0.55));
    const b = toPx(along(0.58, -width(0.58) * 0.35));
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
  });

  // Anel de prata no polegar
  const ringA = 0.3, ringB = 0.36;
  crispFill(dctx, R.w, R.h, PAL.ring, (g) => {
    g.beginPath();
    [along(ringA, width(ringA) + 0.004), along(ringB, width(ringB) + 0.004), along(ringB, -width(ringB) - 0.004), along(ringA, -width(ringA) - 0.004)]
      .map(toPx).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.fill();
  });
  crispFill(dctx, R.w, R.h, PAL.ringDark, (g) => {
    g.lineWidth = 1.1;
    const a = toPx(along(ringA, width(ringA) + 0.004));
    const b = toPx(along(ringA, -width(ringA) - 0.004));
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
  });

  // Trevo de duas folhas no anel: uma folha foi arrancada e ficou
  // só o toquinho, com uma rachadura no metal.
  const [rcx, rcy] = toPx(along((ringA + ringB) / 2, 0));
  const thumbAng = Math.atan2(-uy, ux);
  const inRing = (g) => { g.translate(rcx, rcy); g.rotate(thumbAng); g.translate(0, 1.6); g.scale(1.3, 1.3); };
  const leafPath = (g, grow = 0) => {
    g.beginPath();
    g.arc(-1.5, -4.4, 2.1 + grow, 0, Math.PI * 2);
    g.arc(1.5, -4.4, 2.1 + grow, 0, Math.PI * 2);
    g.moveTo(-3.4 - grow, -3.6);
    g.lineTo(0, -0.6 + grow);
    g.lineTo(3.4 + grow, -3.6);
    g.fill();
  };
  crispFill(dctx, R.w, R.h, PAL.outline, (g) => { inRing(g); leafPath(g, 1); });
  crispFill(dctx, R.w, R.h, PAL.leaf, (g) => { inRing(g); leafPath(g); });
  crispFill(dctx, R.w, R.h, PAL.leafDark, (g) => {
    inRing(g);
    g.fillRect(-0.5, -4.6, 1.1, 3.4); // nervura
    g.fillRect(1.6, -3.4, 1.4, 1.2);
  });
  // toquinho de metal onde ficava a outra folha
  crispFill(dctx, R.w, R.h, PAL.ring, (g) => { inRing(g); g.fillRect(-0.9, 0.6, 1.9, 2.2); });
  // rachadura em zigue-zague no anel
  crispFill(dctx, R.w, R.h, PAL.crack, (g) => {
    inRing(g);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(-0.4, 0.4);
    g.lineTo(0.8, 1.8);
    g.lineTo(-0.6, 3.1);
    g.lineTo(0.7, 4.6);
    g.stroke();
  });

  // Unha (preta) perto da ponta, alinhada ao polegar
  const nailC = along(0.93, 0.002);
  const [ncx, ncy] = toPx(nailC);
  const nailAng = Math.atan2(-uy, ux); // ângulo no canvas (y para baixo)
  const nw = (width(0.93) * 1.2) / TEXEL;
  const nl = 0.056 / TEXEL;
  crispFill(dctx, R.w, R.h, PAL.outline, (g) => {
    g.translate(ncx, ncy);
    g.rotate(nailAng);
    g.beginPath();
    g.roundRect(-nl / 2 - 1, -nw / 2 - 1, nl + 2, nw + 2, [2, nw / 2 + 1, nw / 2 + 1, 2]);
    g.fill();
  });
  crispFill(dctx, R.w, R.h, PAL.nail, (g) => {
    g.translate(ncx, ncy);
    g.rotate(nailAng);
    g.beginPath();
    g.roundRect(-nl / 2, -nw / 2, nl, nw, [1, nw / 2, nw / 2, 1]);
    g.fill();
  });
  crispFill(dctx, R.w, R.h, PAL.nailHi, (g) => {
    g.translate(ncx, ncy);
    g.rotate(nailAng);
    g.fillRect(-nl * 0.1, -nw * 0.28, nl * 0.4, 1.2);
    g.fillRect(nl * 0.32, -nw * 0.2, 1.2, 1.2);
  });

  clipTo(hand, det);
  hctx.drawImage(det, 0, 0);
  return { canvas: hand, reg: R };
}

// ---------------------------------------------------------------

function meshFor({ canvas, reg }, z) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(reg.w * TEXEL, reg.h * TEXEL),
    // Cor fria e um pouco escura: a luz vem só da tela, no quarto escuro
    new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, color: '#cfc4dc' })
  );
  mesh.position.set(reg.x0 + (reg.w * TEXEL) / 2, reg.y1 - (reg.h * TEXEL) / 2, z);
  return mesh;
}

export function makeHands() {
  const fingers = makeFingers();
  const thumb = makeThumbHand();
  return {
    back: meshFor(fingers, -0.024),
    thumb: meshFor(thumb, 0.026),
    canvases: { fingers: fingers.canvas, thumb: thumb.canvas },
  };
}
