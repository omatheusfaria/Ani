// Fotos dos posts desenhadas em pixel art (44x44), com dithering estilo retrô.
// Cada post tem legenda, local, tempo e, às vezes, um pensamento da protagonista.

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dith = (x, y) => (BAYER[(x & 3) + (y & 3) * 4] + 0.5) / 16;

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

class Pix {
  constructor(size) {
    this.S = size;
    this.c = document.createElement('canvas');
    this.c.width = this.c.height = size;
    this.ctx = this.c.getContext('2d');
    this.img = this.ctx.createImageData(size, size);
  }
  set(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.S || y >= this.S) return;
    const [r, g, b] = typeof color === 'string' ? hex(color) : color;
    const i = (y * this.S + x) * 4;
    this.img.data[i] = r;
    this.img.data[i + 1] = g;
    this.img.data[i + 2] = b;
    this.img.data[i + 3] = 255;
  }
  // Degradê vertical com dithering entre as faixas
  grad(y0, y1, colors, x0 = 0, x1 = this.S) {
    const n = colors.length - 1;
    for (let y = y0; y < y1; y++) {
      const k = ((y - y0) / Math.max(1, y1 - y0 - 1)) * n;
      const i = Math.min(n - 1, Math.floor(k));
      const f = k - i;
      for (let x = x0; x < x1; x++) this.set(x, y, colors[f > dith(x, y) ? i + 1 : i]);
    }
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  circle(cx, cy, r, c, ditherAlpha = 1) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++)
      for (let x = Math.floor(cx - r); x <= cx + r; x++)
        if ((x - cx + 0.5) ** 2 + (y - cy + 0.5) ** 2 <= r * r && dith(x, y) < ditherAlpha) this.set(x, y, c);
  }
  done() {
    this.ctx.putImageData(this.img, 0, 0);
    return this.c;
  }
}

function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------
// Geradores de cenas
// ---------------------------------------------------------------

const G = {
  praia(p, v, r) {
    const skies = [['#5fb0ff', '#8fcfff', '#d2f0ff'], ['#7aa7ff', '#b4c8ff', '#ffe0c2'], ['#4ea0e8', '#7cc4f2', '#bfe8ff']];
    p.grad(0, 21, skies[v % 3]);
    p.circle(33, 7, 4, '#fff2b0');
    p.grad(21, 30, ['#1f6fb2', '#2f8fd6']);
    for (let x = 0; x < 44; x++) if (r() < 0.45) p.set(x, 21 + Math.floor(r() * 2), '#e8f6ff');
    p.grad(30, 44, ['#ead08f', '#d8b574']);
    for (let x = 0; x < 44; x++) if (r() < 0.6) p.set(x, 30, '#f6fbff');
    // guarda-sol
    const ux = 8 + v * 9;
    for (let x = -7; x <= 7; x++) for (let y = 0; y < 4 - Math.abs(x) / 3; y++) p.set(ux + x, 27 + y - 4, (Math.floor((x + 7) / 3) % 2) ? '#ff5d73' : '#fff4e8');
    p.rect(ux, 27, 1, 9, '#6b5243');
  },

  pordosol(p, v) {
    const skies = [
      ['#2b1d5c', '#7b2f7a', '#e2576b', '#ffa45c', '#ffd27a'],
      ['#1b1f4f', '#4c2f7c', '#c24f8a', '#ff8c6b', '#ffcf8f'],
    ];
    p.grad(0, 27, skies[v % 2]);
    p.circle(22, 27, 7, '#fff0b0');
    p.grad(27, 44, ['#3a2558', '#1a1232']);
    for (let y = 29; y < 44; y += 2) {
      const w = Math.max(1, 9 - (y - 29) / 2);
      p.rect(22 - w, y, w * 2, 1, '#ff9a5c');
    }
    // coqueiro
    const s = '#0b0814';
    for (let y = 12; y < 44; y++) p.set(5 + Math.round(Math.sin(y / 9) * 2), y, s), p.set(6 + Math.round(Math.sin(y / 9) * 2), y, s);
    for (let i = 0; i < 9; i++) {
      p.set(6 + i, 12 + Math.floor(i * i / 14), s);
      p.set(6 - i, 12 + Math.floor(i * i / 12), s);
      p.set(6 + i / 2, 11 - Math.floor(i / 3), s);
    }
  },

  show(p, v, r) {
    p.rect(0, 0, 44, 44, '#07060d');
    const cols = [['#ff3fa4', '#3fd5ff', '#ffe14f'], ['#7cff6b', '#b86bff', '#ff6b6b'], ['#ffffff', '#ff4fd8', '#4fffe0']][v % 3];
    cols.forEach((c, i) => {
      const sx = 6 + i * 16;
      for (let y = 0; y < 32; y++) {
        const w = 1 + y * 0.35;
        for (let x = -w; x <= w; x++) if (dith(sx + x, y) < 0.45) p.set(sx + x + (i - 1) * y * 0.25, y, c);
      }
    });
    p.rect(0, 31, 44, 3, '#1a1428');
    for (let i = 0; i < 12; i++) {
      const x = 2 + i * 3.6 + r() * 2;
      p.circle(x, 39 + r() * 2, 2.6, '#000000');
      if (r() < 0.35) p.rect(x + 1, 30 + r() * 4, 1, 6, '#000000');
    }
    for (let i = 0; i < 10; i++) p.set(r() * 44, r() * 28, '#ffffff');
  },

  cafe(p, v, r) {
    const woods = [['#6b4630', '#5b3b28'], ['#3d3a45', '#33303b'], ['#8a5a3b', '#7a4e33']][v % 3];
    for (let y = 0; y < 44; y++) p.rect(0, y, 44, 1, woods[Math.floor(y / 7) % 2]);
    for (let i = 0; i < 30; i++) p.set(r() * 44, r() * 44, '#2e1e14');
    p.circle(22, 23, 15, '#d9d2c7');
    p.circle(22, 22, 13, '#f3efe9');
    p.circle(22, 22, 10, '#c9bfb2');
    p.circle(22, 22, 9, '#6b3f25');
    // arte no café (coração)
    const heart = ['.ww.ww.', 'wwwwwww', 'wwwwwww', '.wwwww.', '..www..', '...w...'];
    heart.forEach((row, j) => [...row].forEach((ch, i) => ch === 'w' && p.set(19 + i, 19 + j, '#ead6b8')));
    p.rect(36, 18, 5, 2, '#f3efe9');
    p.rect(39, 20, 2, 5, '#f3efe9');
  },

  cidade(p, v, r) {
    p.grad(0, 44, [['#0a0f2a', '#1c1b48', '#3a2a5e'], ['#0b1a2a', '#183650', '#2a4d63'], ['#160b22', '#2f1640', '#53225c']][v % 3]);
    for (let i = 0; i < 18; i++) p.set(r() * 44, r() * 20, '#ffffff');
    p.circle(35, 8, 3, '#f3f1d8');
    let x = 0;
    while (x < 44) {
      const w = 5 + Math.floor(r() * 7);
      const h = 10 + Math.floor(r() * 22);
      p.rect(x, 44 - h, w, h, '#0c0d1e');
      for (let wy = 44 - h + 2; wy < 43; wy += 3)
        for (let wx = x + 1; wx < x + w - 1; wx += 2) if (r() < 0.35) p.set(wx, wy, r() < 0.7 ? '#ffcf6e' : '#7fe3ff');
      x += w + 1;
    }
  },

  selfie(p, v, r, assets) {
    p.grad(0, 44, [['#ffd38a', '#ff9a6b'], ['#a6e3ff', '#6fa8ff'], ['#ffb3d1', '#b48cff']][v % 3]);
    p.done();
    if (assets.crush) {
      const ctx = p.ctx;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(assets.crush, 2, 4, 40, 40);
      p.img = ctx.getImageData(0, 0, 44, 44);
    }
  },

  dupla(p, v) {
    G.pordosol(p, v === 1 ? 1 : 0);
    const s = '#05040a';
    // pessoa A (Malu): cabelo longo e ondulado
    p.circle(17, 23, 3.2, s);
    p.rect(14, 22, 7, 9, s);
    p.set(13, 26, s); p.set(13, 28, s); p.set(21, 25, s); p.set(21, 29, s);
    p.rect(15, 27, 5, 11, s);
    p.rect(15, 38, 2, 6, s);
    p.rect(18, 38, 2, 6, s);
    // pessoa B
    p.circle(26, 24, 3, s);
    if (v === 1) {
      // cabelo curtinho com franja (ela, a protagonista)
      p.rect(23, 21, 7, 4, s);
      p.rect(23, 25, 1, 2, s); p.rect(29, 25, 1, 2, s);
    } else {
      // rabo de cavalo (Bia)
      p.rect(23, 21, 6, 3, s);
      p.rect(29, 22, 2, 2, s);
      p.rect(30, 24, 2, 4, s);
    }
    p.rect(24, 27, 5, 11, s);
    p.rect(24, 38, 2, 6, s);
    p.rect(27, 38, 2, 6, s);
    // mãos dadas
    p.rect(20, 31, 4, 2, s);
  },

  violao(p, v, r) {
    p.grad(0, 44, [['#d8d3e6', '#bfb7d4'], ['#2f2a3a', '#211d2b'], ['#e6d9cf', '#cdbbae']][v % 3]);
    for (let i = 0; i < 6; i++) p.rect(0, 6 + i * 7 + Math.floor(r() * 2), 44, 1, v === 1 ? '#3a3448' : '#b3abc8');
    const body = ['#c07a3a', '#2b2b33', '#a4532e'][v % 3];
    p.circle(15, 29, 9, body);
    p.circle(23, 22, 7, body);
    p.circle(18, 26, 3, '#120c08');
    for (let i = 0; i < 16; i++) p.rect(26 + i, 18 - i * 0.55, 3, 2, '#5a3a22');
    for (let i = 0; i < 22; i++) p.set(12 + i * 1.3, 31 - i * 0.75, '#efe4c8');
  },

  surf(p, v, r) {
    p.grad(0, 14, [['#8fd3ff', '#d9f3ff'], ['#ffd0a8', '#ffeeda'], ['#a8b8ff', '#e2e6ff']][v % 3]);
    p.grad(14, 44, ['#0e4f8a', '#1d74b8', '#2f95d8']);
    for (let x = 0; x < 44; x++) {
      const crest = 16 + Math.round(Math.sin(x / 7) * 3 + x / 6);
      for (let y = crest; y < crest + 3; y++) p.set(x, y, dith(x, y) < 0.7 ? '#eaf8ff' : '#9fd8ff');
    }
    // surfista
    p.rect(24, 25, 9, 1, '#ffde59');
    p.rect(27, 20, 2, 5, '#0b0814');
    p.circle(28, 18, 1.5, '#0b0814');
    p.rect(25, 21, 6, 1, '#0b0814');
  },
};

// ---------------------------------------------------------------
// Lista de posts (mais novo primeiro)
// ---------------------------------------------------------------

export const PROFILE = {
  user: 'malu.ferraz',
  name: 'Malu Ferraz',
  bio: ['fotografia e mar ~', 'rio de janeiro'],
  posts: '143',
  followers: '2.481',
  following: '612',
  highlights: ['praia', 'shows', '2025', 'nós?'],
};

export const POSTS = [
  { g: 'dupla', v: 0, cap: 'melhor dia com @bia.lima', loc: 'praia do arpoador', when: 'AGORA', weeks: 0, id: 'bia' },
  { g: 'show', v: 0, cap: 'noite absurda', loc: 'circo voador', when: 'HÁ 2 SEMANAS', weeks: 2 },
  { g: 'surf', v: 0, cap: 'mar tava perfeito hoje', loc: 'prainha', when: 'HÁ 4 SEMANAS', weeks: 4 },
  { g: 'cafe', v: 0, cap: 'café > tudo', loc: 'botafogo', when: 'HÁ 6 SEMANAS', weeks: 6 },
  { g: 'selfie', v: 0, cap: 'domingo', loc: '', when: 'HÁ 9 SEMANAS', weeks: 9 },
  { g: 'cidade', v: 0, cap: 'rio à noite', loc: 'mirante dona marta', when: 'HÁ 12 SEMANAS', weeks: 12 },
  { g: 'violao', v: 0, cap: 'aprendendo uma nova', loc: '', when: 'HÁ 15 SEMANAS', weeks: 15 },
  { g: 'praia', v: 0, cap: 'verão!!', loc: 'ipanema', when: 'HÁ 19 SEMANAS', weeks: 19 },
  { g: 'pordosol', v: 0, cap: '', loc: 'arpoador', when: 'HÁ 23 SEMANAS', weeks: 23 },
  { g: 'show', v: 1, cap: 'de novo nesse show', loc: 'circo voador', when: 'HÁ 27 SEMANAS', weeks: 27 },
  { g: 'cafe', v: 1, cap: 'segunda-feira', loc: '', when: 'HÁ 31 SEMANAS', weeks: 31 },
  { g: 'surf', v: 1, cap: '', loc: 'prainha', when: 'HÁ 36 SEMANAS', weeks: 36 },
  { g: 'cidade', v: 1, cap: 'voltando pra casa', loc: '', when: 'HÁ 41 SEMANAS', weeks: 41 },
  { g: 'selfie', v: 1, cap: 'cortei o cabelo, opiniões?', loc: '', when: 'HÁ 46 SEMANAS', weeks: 46 },
  { g: 'praia', v: 1, cap: '', loc: 'grumari', when: 'HÁ 52 SEMANAS', weeks: 52 },
  { g: 'violao', v: 1, cap: 'tocando aquela que você gosta', loc: '', when: 'HÁ 58 SEMANAS', weeks: 58, id: 'musica' },
  { g: 'pordosol', v: 1, cap: 'fim de tarde', loc: 'urca', when: 'HÁ 63 SEMANAS', weeks: 63 },
  { g: 'show', v: 2, cap: 'primeiro show do ano', loc: 'fundição progresso', when: 'HÁ 68 SEMANAS', weeks: 68 },
  { g: 'cafe', v: 2, cap: 'nosso lugar', loc: 'santa teresa', when: 'HÁ 72 SEMANAS', weeks: 72, id: 'lugar' },
  { g: 'cidade', v: 2, cap: '', loc: '', when: 'HÁ 76 SEMANAS', weeks: 76 },
  { g: 'surf', v: 2, cap: '', loc: 'macumba', when: 'HÁ 80 SEMANAS', weeks: 80 },
  { g: 'praia', v: 2, cap: 'lembra disso?', loc: 'paquetá', when: 'HÁ 84 SEMANAS', weeks: 84, id: 'lembra' },
  { g: 'dupla', v: 1, cap: '<3', loc: 'arpoador', when: 'HÁ 87 SEMANAS', weeks: 87, id: 'nos' },
  { g: 'selfie', v: 2, cap: 'primeiro post aqui', loc: '', when: 'HÁ 90 SEMANAS', weeks: 90 },
];

// Perfil da própria protagonista: nada publicado
export const SELF = {
  user: 'ani.zero',
  name: 'Ani',
  bio: ['...'],
  posts: '0',
  followers: '38',
  following: '52',
};

// Pensamentos ao abrir certos posts
export const POST_THOUGHTS = {
  bia: '...quem é Bia?',
  musica: 'Era a minha música.',
  lugar: 'Nosso lugar. Era nosso.',
  lembra: 'Lembro. Lembro de tudo.',
  nos: 'Ela ainda não apagou essa.',
};

export function buildPosts(assets) {
  return POSTS.map((post, i) => {
    const r = rng(1000 + i * 77);
    const p = new Pix(44);
    G[post.g](p, post.v, r, assets);
    const small = p.done();
    const big = document.createElement('canvas');
    big.width = big.height = 132;
    const bctx = big.getContext('2d');
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(small, 0, 0, 132, 132);
    return {
      ...post,
      index: i,
      small,
      big,
      likes: 180 + Math.floor(r() * 1300),
      comments: 4 + Math.floor(r() * 70),
    };
  });
}
