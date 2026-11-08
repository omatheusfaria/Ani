// Ícones dos botões do controle (estilo Xbox) para as dicas da interface.
//
// As cenas continuam escrevendo as dicas do jeito do teclado
// ('<b>E</b> INTERAGIR &nbsp; <b>ESC</b> PAUSA'). Quando o jogador está no
// controle, a UI passa o texto por padHint() e troca cada tecla pelo botão
// equivalente. Assim nenhuma cena precisa saber que o controle existe.

// Desenhos pequenos em SVG, com bordas retas (combina com o pixel art)
const SVG = {
  // direcional: uma cruz
  dpad:
    '<svg viewBox="0 0 12 12" shape-rendering="crispEdges"><path d="M4 0h4v4h4v4H8v4H4V8H0V4h4z" fill="currentColor"/><path d="M5 5h2v2H5z" fill="rgba(0,0,0,.35)"/></svg>',
  // botão Menu (≡)
  menu:
    '<svg viewBox="0 0 12 12" shape-rendering="crispEdges"><path d="M2 3h8v1.5H2zM2 5.25h8v1.5H2zM2 7.5h8V9H2z" fill="currentColor"/></svg>',
  // botão Exibir (dois quadradinhos)
  view:
    '<svg viewBox="0 0 12 12" shape-rendering="crispEdges"><path d="M1.5 2.5h6v5h-6z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M4.5 4.5h6v5h-6z" fill="currentColor"/></svg>',
  // controle inteiro (aviso de conectado)
  pad:
    '<svg viewBox="0 0 24 14" shape-rendering="crispEdges"><path d="M5 1h14v1h2v1h1v2h1v5h-1v2h-1v1h-3v-1h-1v-1h-1v-1H8v1H7v1H6v1H3v-1H2v-2H1V5h1V3h1V2h2z" fill="currentColor"/><path d="M5 5h1V4h1v1h1v1H7v1H6V6H5z" fill="#05060c"/><path d="M16 4h1v1h-1zM18 6h1v1h-1zM14 6h1v1h-1zM16 8h1v1h-1z" fill="#05060c"/></svg>',
};

// Um ícone de botão. name: a b x y ls rs dpad menu view
export function glyph(name) {
  switch (name) {
    case 'a':
    case 'b':
    case 'x':
    case 'y':
      return `<b class="pad pad-${name}">${name.toUpperCase()}</b>`;
    case 'ls':
    case 'rs':
      return `<b class="pad pad-stick">${name === 'ls' ? 'L' : 'R'}</b>`;
    case 'a2':
      return `<i class="pad-times">2×</i>${glyph('a')}`;
    case 'dpad':
    case 'menu':
    case 'view':
      return `<b class="pad pad-sys">${SVG[name]}</b>`;
    default:
      return `<b>${name}</b>`;
  }
}

export const padIcon = () => `<span class="pad-icon">${SVG.pad}</span>`;

// Tecla do teclado → botão. label ajuda a decidir o ESC (pausa ou voltar).
function mapToken(tok, label) {
  const t = tok.trim().toUpperCase();
  if (t === 'MOUSE') return /OLHAR/.test(label) ? 'rs' : 'ls'; // olhar = direito; inclinar = esquerdo
  if (/^(A D|W A S D|SETAS)$/.test(t)) return 'ls';
  if (t === 'W S') return null; // o analógico já cobre frente/fundo
  if (t === '↑ ↓' || t === '← →') return 'dpad';
  // nas vistas de perto o E é "voltar" (E / ESC VOLTAR): no controle isso é o B
  if (t === 'E' && /VOLTAR|LEVANTAR/.test(label)) return 'b';
  if (t === 'E' || t === 'ENTER' || t === 'ESPAÇO' || t === 'CLIQUE') return 'a';
  if (t === '2× CLIQUE') return 'a2';
  if (t.includes('RODA')) return 'rs';
  if (t === 'ESC') return /PAUSA|MENU/.test(label) ? 'menu' : 'b';
  return tok; // desconhecida: fica como está
}

// Converte uma dica inteira. Grupos separados por &nbsp;
export function padHint(html) {
  if (!html) return html;
  const groups = html.split(/&nbsp;/).map((g) => g.trim()).filter(Boolean);
  const out = [];
  let hasStick = false;
  let usesClick = false;
  for (const g of groups) {
    const toks = [...g.matchAll(/<b>(.*?)<\/b>/g)].map((m) => m[1]);
    if (!toks.length) {
      out.push(g);
      continue;
    }
    const label = g.replace(/<b>.*?<\/b>/g, '').replace(/\s\/\s/g, ' ').replace(/^\s*\/\s*|\s*\/\s*$/g, '').trim();
    const names = [];
    for (const tk of toks) {
      if (/CLIQUE/i.test(tk)) usesClick = true;
      const n = mapToken(tk, label);
      if (n && !names.includes(n)) names.push(n);
    }
    if (!names.length) continue;
    if (names.includes('ls')) hasStick = true;
    out.push(`<span class="hint-g">${names.map(glyph).join('')}<span>${label}</span></span>`);
  }
  // telas de apontar e clicar: no controle não tem cursor, o direcional/analógico escolhe o item
  if (usesClick && !hasStick) out.unshift(`<span class="hint-g">${glyph('dpad')}${glyph('ls')}<span>ESCOLHER</span></span>`);
  return out.join('');
}

// Tecla do balão de interação ('E', 'CLIQUE'...)
export function padKey(key) {
  if (!key) return key;
  const n = mapToken(key, '');
  return n ? glyph(n) : `<b>${key}</b>`;
}

// Avisos grandes ("PRESSIONE QUALQUER TECLA")
export function padPrompt(text) {
  if (!text) return text;
  return text
    .replace('QUALQUER TECLA', 'QUALQUER BOTÃO')
    .replace('CLIQUE PARA', `APERTE ${glyph('a')} PARA`);
}
