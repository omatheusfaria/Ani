// Camada de interface em HTML por cima do canvas: avisos, legendas com texto
// digitado, dicas de controle e menu de pausa.
//
// Diálogos no estilo Until Then:
//   ui.say(texto)              caixa embaixo: interação com cenário e objetos, pensamentos
//   ui.bubble(texto, {anchor}) balão em cima da cabeça: conversa entre personagens
//                              anchor = () => [x, y] em pixels (a ponta do balão)

import { padHint, padKey, padPrompt, padIcon, glyph } from './glyphs.js';

// Ícones do menu no celular (24×24, preenchidos)
const PH_ICONS = {
  play: '<path d="M8.5 5.8v12.4c0 .6.7 1 1.2.6l9.4-6.2c.5-.3.5-1 0-1.3L9.7 5.2c-.5-.4-1.2 0-1.2.6z"/>',
  sound: '<path d="M4 9.3h3.3L11.6 5.6c.5-.4 1.2 0 1.2.6v11.6c0 .6-.7 1-1.2.6l-4.3-3.7H4z"/><path d="M15.6 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  grid: '<path d="M5 5h5.6v5.6H5zM13.4 5H19v5.6h-5.6zM5 13.4h5.6V19H5zM13.4 13.4H19V19h-5.6z"/>',
  expand: '<path d="M4.5 9.5v-5h5M19.5 9.5v-5h-5M4.5 14.5v5h5M19.5 14.5v5h-5" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
  home: '<path d="M3.8 11.2 12 4.3l8.2 6.9c.3.3.1.8-.3.8H18.6v7.2c0 .4-.3.8-.8.8h-3.6v-5h-4.4v5H6.2c-.4 0-.8-.3-.8-.8V12H4.1c-.4 0-.6-.5-.3-.8z"/>',
  right: '<path d="M9.3 5.6 15.7 12l-6.4 6.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  left: '<path d="M14.7 5.6 8.3 12l6.4 6.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  pin: '<path d="M12 2.8a6.6 6.6 0 0 0-6.6 6.6c0 4.6 5.6 10.8 6.1 11.4.3.3.7.3 1 0 .5-.6 6.1-6.8 6.1-11.4A6.6 6.6 0 0 0 12 2.8zm0 9.1a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/>',
  signal: '<path d="M2 17h3v3H2zM7 13.5h3V20H7zM12 10h3v10h-3zM17 6h3v14h-3z"/>',
  wifi: '<path d="M12 19.6 9.4 17a3.7 3.7 0 0 1 5.2 0zM6.6 14.2a7.6 7.6 0 0 1 10.8 0l-1.9 1.9a5 5 0 0 0-7 0zM3.4 11a12.2 12.2 0 0 1 17.2 0l-1.9 1.9a9.5 9.5 0 0 0-13.4 0z"/>',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class UI {
  constructor(sfx) {
    this.sfx = sfx;
    this.root = document.getElementById('ui');
    this.el = {};
    for (const id of ['prompt', 'title', 'hint', 'caption', 'subtitle', 'pause', 'interact', 'chapter']) {
      this.el[id] = this.root.querySelector(`#${id}`);
    }
    this.sayToken = 0;
    this.captionToken = 0;
    this.speaking = false;
    this.bubbles = new Map();
    // falas em andamento (para acelerar/pular com clique): { stage, fast, skip, wake, el }
    this.dlg = new Set();
    this.inputMode = 'kb'; // 'pad' troca as teclas das dicas pelos botões do controle
    this.raw = { hint: null, prompt: null };
    // Dicas de controle = tutorial: só nas cenas que pedem (o quarto), cada dica
    // aparece uma vez (por teclado/controle) e some sozinha. Fora disso, nunca.
    this.hintScope = null;
    this.hintSeen = new Set();

    // aviso de controle conectado (canto de cima)
    this.el.toast = document.createElement('div');
    this.el.toast.id = 'toast';
    this.root.appendChild(this.el.toast);
  }

  // Teclado ↔ controle: redesenha as dicas com os ícones certos
  setInputMode(mode) {
    if (mode === this.inputMode) return;
    this.inputMode = mode;
    const h = this.el.hint;
    if (this.raw.hint && h.classList.contains('show')) {
      // troca com uma piscadinha (sai, troca, volta)
      h.classList.remove('swap');
      void h.offsetWidth;
      h.classList.add('swap');
      setTimeout(() => this.raw.hint && (h.innerHTML = this.fmtHint(this.raw.hint)), 110);
    } else if (this.raw.hint) {
      // a dica desta parte ainda não foi vista no controle: mostra o tutorial de novo
      this.showHint(this.raw.hint);
    }
    if (this.raw.prompt) this.el.prompt.innerHTML = this.fmtPrompt(this.raw.prompt);
    delete this.el.interact.dataset.text; // o balão de interação refaz no próximo quadro
  }

  // Onde as dicas de botões podem aparecer ('quarto') ou null para nunca
  setHintScope(scope) {
    this.hintScope = scope;
    if (!scope) {
      clearTimeout(this.hintT);
      this.el.hint.classList.remove('show');
    }
  }

  fmtHint(text) {
    return this.inputMode === 'pad' ? padHint(text) : text;
  }

  fmtPrompt(text) {
    return this.inputMode === 'pad' ? padPrompt(text) : text;
  }

  // Aviso curto no canto ("CONTROLE CONECTADO")
  toast(text, warn = false) {
    const el = this.el.toast;
    el.innerHTML = `${padIcon()}<span>${text}</span>`;
    el.classList.toggle('warn', warn);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => el.classList.remove('show'), 2600);
  }


  // Digita o texto sem a linha "pular": o resto já ocupa o espaço, só que invisível.
  // ctl (opcional): ctl.fast = completa na hora (clique durante a digitação)
  async typeInto(typed, rest, text, tokOk, speed, ctl = null) {
    typed.textContent = '';
    rest.textContent = text;
    const chars = [...text];
    for (let i = 0; i < chars.length; i++) {
      if (!tokOk()) return false;
      if (ctl?.fast) {
        typed.textContent = text;
        rest.textContent = '';
        break;
      }
      typed.textContent += chars[i];
      rest.textContent = chars.slice(i + 1).join('');
      ctl?.onChar?.(chars[i]); // a boca de quem fala acompanha as letras
      if (chars[i] !== ' ' && i % 2 === 0) this.sfx.type();
      await this.nap(speed + (',.!?'.includes(chars[i]) ? 120 : 0), ctl);
    }
    return tokOk();
  }

  // espera que um clique pode encurtar. Com o jogo pausado, a fala espera a pausa fechar
  // (não digita nem passa para a próxima por trás do menu)
  nap(ms, ctl) {
    return new Promise((r) => {
      const fin = () => this.afterPause(r);
      if (!ctl) return void setTimeout(fin, ms);
      const t = setTimeout(done, ms);
      function done() {
        clearTimeout(t);
        ctl.wake = null;
        fin();
      }
      ctl.wake = done;
    });
  }
  afterPause(fn) {
    if (this.pauseOpen) (this.pauseWaiters ??= []).push(fn);
    else fn();
  }

  // Clique (ou A/Enter em cena): 1º completa o texto que está sendo digitado,
  // 2º pula para a próxima fala. Devolve true se tinha fala para acelerar.
  advance() {
    const list = [...this.dlg];
    if (!list.length) return false;
    const typing = list.filter((c) => c.stage === 'typing');
    if (typing.length) {
      for (const c of typing) {
        c.fast = true;
        c.wake?.();
        // micro-pulo da caixa ao completar
        c.el?.classList.remove('snap');
        void c.el?.offsetWidth;
        c.el?.classList.add('snap');
      }
      this.sfx.type();
    } else {
      for (const c of list) {
        c.skip = true;
        c.wake?.();
      }
      this.sfx.tap?.();
    }
    return true;
  }

  get talking() {
    return this.dlg.size > 0;
  }

  // solta as falas antigas de uma caixa/balão (trocou de fala ou limpou)
  dropDlg(el) {
    for (const c of [...this.dlg]) {
      if (el && c.el !== el) continue;
      c.skip = true;
      c.wake?.();
      this.dlg.delete(c);
    }
  }

  // Balão "E · Objeto" preso a um ponto da tela (x, y em pixels da janela)
  // key: tecla mostrada no balão ('E', 'CLIQUE'...); null esconde a tecla
  interact(text, x, y, key = 'E') {
    const el = this.el.interact;
    if (!text) {
      el.classList.remove('show');
      return;
    }
    const sig = `${this.inputMode}|${key}|${text}`;
    if (el.dataset.text !== sig) {
      el.dataset.text = sig;
      const k = key ? (this.inputMode === 'pad' ? padKey(key) : `<b>${key}</b>`) : '';
      el.innerHTML = `${k}<span>${text}</span>`;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    // não deixa o balão sair da tela (ex.: objeto perto da borda de cima)
    const m = 10;
    const hw = el.offsetWidth / 2;
    el.style.left = `${Math.round(Math.min(Math.max(x, hw + m), window.innerWidth - hw - m))}px`;
    el.style.top = `${Math.round(Math.max(y, el.offsetHeight + m))}px`;
    el.classList.add('show');
  }

  // Cartão de capítulo no centro da tela
  chapter(title, sub) {
    const el = this.el.chapter;
    if (!title) {
      el.classList.remove('show');
      return;
    }
    el.innerHTML = `<div class="ch-title">${title}</div>${sub ? `<div class="ch-sub">${sub}</div>` : ''}`;
    el.classList.add('show');
  }

  // 'phone' posiciona os balões ao lado do celular
  layout(mode) {
    this.root.classList.toggle('phone', mode === 'phone');
  }

  prompt(text) {
    const el = this.el.prompt;
    this.raw.prompt = text || null;
    if (text) {
      el.innerHTML = this.fmtPrompt(text);
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
  }

  title(show) {
    this.el.title.classList.toggle('show', !!show);
  }

  // Dica de controle (tutorial). A cena chama sempre que entra numa parte;
  // a dica só aparece se a cena permite e se ainda não foi vista assim.
  hint(text) {
    this.raw.hint = text || null;
    if (text) this.showHint(text);
    else {
      clearTimeout(this.hintT);
      this.el.hint.classList.remove('show');
    }
  }

  showHint(text) {
    const el = this.el.hint;
    const key = `${this.inputMode}|${text}`;
    if (!this.hintScope || this.hintSeen.has(key)) return;
    this.hintSeen.add(key);
    el.innerHTML = this.fmtHint(text);
    el.classList.add('show');
    clearTimeout(this.hintT);
    // tempo para ler com calma e sai de cena
    const hold = 5000 + text.replace(/<[^>]+>|&nbsp;/g, '').length * 40;
    this.hintT = setTimeout(() => el.classList.remove('show'), hold);
  }

  // Texto pequeno no canto (ex.: data e hora), digitado letra por letra.
  async caption(text, hold = 3.5) {
    const tok = ++this.captionToken;
    const el = this.el.caption;
    el.textContent = '';
    el.classList.add('show');
    for (const ch of text) {
      if (tok !== this.captionToken) return;
      el.textContent += ch;
      if (ch !== ' ') this.sfx.type();
      await sleep(45);
    }
    await sleep(hold * 1000);
    if (tok === this.captionToken) el.classList.remove('show');
  }

  // Caixa de texto embaixo (interação com cenário/objeto e pensamentos), digitada com som.
  async say(text, { hold = 2.4, panic = false } = {}) {
    const tok = ++this.sayToken;
    const el = this.el.subtitle;
    el.classList.toggle('panic', panic);
    el.classList.remove('done');
    if (!el.classList.contains('show')) {
      el.classList.remove('show');
      void el.offsetWidth;
    }
    el.classList.add('show');
    this.speaking = true;
    this.dropDlg(el);
    const ctl = { stage: 'typing', fast: false, skip: false, wake: null, el };
    this.dlg.add(ctl);
    try {
      const ok = await this.typeInto(el.querySelector('.typed'), el.querySelector('.rest'), text, () => tok === this.sayToken, panic ? 18 : 34, ctl);
      if (!ok) return;
      el.classList.add('done'); // mostra o ▶
      ctl.stage = 'hold';
      if (!ctl.skip) await this.nap(hold * 1000, ctl);
      if (tok === this.sayToken) {
        el.classList.remove('show', 'done');
        this.speaking = false;
      }
    } finally {
      this.dlg.delete(ctl);
    }
  }

  // Balão de fala em cima da cabeça de um personagem (conversa).
  // id separa um balão por personagem; anchor é chamado a cada quadro.
  // onChar(letra) a cada letra digitada e onTyped() quando o texto termina (boca falando).
  async bubble(text, { anchor, id = 'fala', hold = 2.4, panic = false, onChar = null, onTyped = null } = {}) {
    let b = this.bubbles.get(id);
    if (!b) {
      const el = document.createElement('div');
      el.className = 'bubble';
      el.innerHTML = '<p><span class="typed"></span><span class="rest"></span></p><i class="tail"></i><i class="next"></i>';
      this.root.appendChild(el);
      b = { el, tok: 0, anchor: null, raf: 0 };
      this.bubbles.set(id, b);
    }
    const tok = ++b.tok;
    const el = b.el;
    b.anchor = anchor;
    el.classList.toggle('panic', panic);
    // segue o personagem enquanto estiver na tela
    const place = () => {
      if (b.anchor) {
        const [x, y] = b.anchor();
        const w = el.offsetWidth, m = 12;
        const cx = Math.min(Math.max(x, w / 2 + m), window.innerWidth - w / 2 - m);
        el.style.left = `${Math.round(cx)}px`;
        el.style.top = `${Math.round(Math.max(y, el.offsetHeight + m + 14))}px`;
        el.style.setProperty('--tail', `${Math.round(x - cx)}px`);
      }
      if (el.classList.contains('show')) b.raf = requestAnimationFrame(place);
    };
    cancelAnimationFrame(b.raf);
    if (!el.classList.contains('show')) {
      el.querySelector('.typed').textContent = '';
      el.querySelector('.rest').textContent = text;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('show', 'pop');
    }
    place();
    el.classList.remove('done');
    this.dropDlg(el);
    const ctl = { stage: 'typing', fast: false, skip: false, wake: null, el, onChar };
    this.dlg.add(ctl);
    let typedDone = false;
    const typed = () => {
      if (typedDone) return;
      typedDone = true;
      onTyped?.();
    };
    try {
      const ok = await this.typeInto(el.querySelector('.typed'), el.querySelector('.rest'), text, () => tok === b.tok, panic ? 18 : 32, ctl);
      typed();
      if (!ok) return;
      el.classList.add('done');
      ctl.stage = 'hold';
      if (!ctl.skip) await this.nap(hold * 1000, ctl);
      if (tok === b.tok) {
        el.classList.remove('show', 'done');
        cancelAnimationFrame(b.raf);
      }
    } finally {
      typed();
      this.dlg.delete(ctl);
    }
  }

  async bubbleWait(text, opts) {
    await this.bubble(text, opts);
    await this.nap(250);
  }

  clearBubbles() {
    for (const b of this.bubbles.values()) {
      this.dropDlg(b.el);
      b.tok++;
      b.el.classList.remove('show');
      cancelAnimationFrame(b.raf);
    }
  }

  // Fala e espera terminar (para encadear falas)
  async sayWait(text, opts) {
    await this.say(text, opts);
    await this.nap(250);
  }

  clearSay() {
    this.dropDlg(this.el.subtitle);
    this.speaking = false;
    this.sayToken++;
    this.el.subtitle.classList.remove('show', 'done');
  }

  // Menu de pausa. options: [{ label, action }]
  // Mouse (passar e clicar), setas + Enter, ou direcional + A.
  // opts.phone: o menu aparece na tela do celular da Ani, à esquerda, como o app de
  //   Ajustes: { clock, owner, avatar, chapter, place }. Cada opção pode ter:
  //   group (abre um grupo; '' = grupo sem título), note (rodapé do grupo), icon, color, tone: 'danger' e
  //   kind: 'link' (padrão: confirma e roda action), 'toggle' (get() → bool, action
  //   alterna), 'slider' (get() → 0..1, set(v)) ou 'choice' (get() → texto, step(±1)).
  pause(options, opts = {}) {
    const el = this.el.pause;
    clearTimeout(this.pauseT);
    if (!options) {
      this.pauseOpen = false;
      this.pauseBtns = null;
      this.pauseRefresh = null;
      this.pauseOpts = null;
      this.pauseCursor = null;
      if (el.classList.contains('phone') && el.classList.contains('show')) {
        // sai deslizando; o conteúdo some depois da animação
        el.classList.remove('show');
        el.classList.add('closing');
        this.pauseT = setTimeout(() => {
          el.classList.remove('phone', 'closing');
          el.innerHTML = '';
        }, 320);
      } else {
        el.classList.remove('show', 'phone', 'closing');
        el.innerHTML = '';
      }
      const w = this.pauseWaiters || [];
      this.pauseWaiters = [];
      for (const fn of w) fn();
      return;
    }
    this.pauseOpen = true;
    this.pauseSent = false;
    el.classList.remove('closing');
    if (opts.phone) return this.phonePause(options, opts.phone);
    el.classList.remove('phone');
    el.innerHTML = '<div class="pause-box"><div class="pause-title">PAUSA</div></div>';
    const box = el.querySelector('.pause-box');
    this.pauseBtns = options.map((o, i) => {
      const b = document.createElement('button');
      b.textContent = o.label;
      b.addEventListener('mouseenter', () => this.pauseSelect(i));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sfx.select();
        o.action();
      });
      box.appendChild(b);
      return b;
    });
    this.pauseSel = -1;
    this.pauseSelect(0, true);
    el.classList.add('show');
  }

  phonePause(options, ph) {
    const el = this.el.pause;
    const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const svg = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;
    const chev = (dir) => svg(dir < 0 ? PH_ICONS.left : PH_ICONS.right, 'ph-chev');

    // linhas agrupadas em cartões, como no app de Ajustes
    let list = '';
    let note = '';
    const close = () => {
      list += '</div>' + (note ? `<div class="ph-note" style="--i:${options.length}">${esc(note)}</div>` : '');
      note = '';
    };
    options.forEach((o, i) => {
      if (i === 0 || o.group !== undefined) {
        if (i) close();
        note = o.note || '';
        list += o.group ? `<div class="ph-gl" style="--i:${i}">${esc(o.group)}</div>` : '';
        list += `<div class="ph-group" style="--i:${i}">`;
      }
      const kind = o.kind || 'link';
      let val = '';
      if (kind === 'link') val = chev(1);
      else if (kind === 'toggle') val = '<span class="ph-sw"><i></i></span>';
      else if (kind === 'slider')
        val = '<span class="ph-sl"><span class="ph-tr"><i class="ph-fill"></i><b class="ph-knob"></b></span><em class="ph-pc"></em></span>';
      else if (kind === 'choice')
        val = `<span class="ph-ch"><span class="ph-step" data-d="-1">${chev(-1)}</span><em></em><span class="ph-step" data-d="1">${chev(1)}</span></span>`;
      list += `<button class="ph-row k-${kind}${o.tone ? ' ' + o.tone : ''}" style="--i:${i}">
          <span class="ph-ic" style="--c:${o.color || '#8e8e93'}">${svg(PH_ICONS[o.icon] || '')}</span>
          <span class="ph-lb">${esc(o.label)}</span><span class="ph-val">${val}</span></button>`;
    });
    close();

    const kb = (k) => `<kbd>${k}</kbd>`;
    el.innerHTML = `
      <div class="ph-shade"></div>
      <div class="ph-dev"><div class="ph-float"><div class="ph-body">
        <div class="ph-screen">
          <div class="ph-bar">
            <span class="ph-clock">${esc(ph.clock)}</span><span class="ph-island"></span>
            <span class="ph-sys">${svg(PH_ICONS.signal)}${svg(PH_ICONS.wifi)}<span class="ph-batt"><i></i></span></span>
          </div>
          <div class="ph-scroll">
            <h2 class="ph-title">Ajustes</h2>
            <div class="ph-me">
              <div class="ph-av" style="background-image:url('${ph.avatar}')"></div>
              <div class="ph-who"><b>${esc(ph.owner)}</b><span>${esc(ph.chapter)}</span><span class="ph-place">${svg(PH_ICONS.pin)}${esc(ph.place)}</span></div>
            </div>
            <div class="ph-list"><div class="ph-cursor"></div>${list}</div>
          </div>
          <div class="ph-help">
            <span class="ph-kb">${kb('↑')}${kb('↓')} escolher</span><span class="ph-kb">${kb('←')}${kb('→')} ajustar</span><span class="ph-kb">${kb('Enter')} ok</span><span class="ph-kb">${kb('Esc')} voltar</span>
            <span class="ph-pad">${glyph('dpad')} escolher</span><span class="ph-pad">${glyph('a')} ok</span><span class="ph-pad">${glyph('b')} voltar</span>
          </div>
          <div class="ph-home"></div>
          <div class="ph-glass"></div>
        </div>
      </div></div></div>`;

    const listEl = el.querySelector('.ph-list');
    const cursor = el.querySelector('.ph-cursor');
    this.pauseOpts = options;
    this.pauseBtns = [...el.querySelectorAll('.ph-row')];
    this.pauseRefresh = () => {
      this.pauseBtns?.forEach((b, i) => {
        const o = options[i];
        if (o.kind === 'toggle') b.classList.toggle('on', !!o.get());
        else if (o.kind === 'slider') {
          const v = Math.max(0, Math.min(1, o.get()));
          b.style.setProperty('--v', v);
          b.querySelector('.ph-pc').textContent = `${Math.round(v * 100)}%`;
          b.classList.toggle('mute', v === 0);
        } else if (o.kind === 'choice') b.querySelector('.ph-ch em').textContent = o.get();
      });
    };
    // o destaque desliza até a linha escolhida (com uma molinha no fim)
    this.pauseCursor = (i, snap) => {
      const b = this.pauseBtns?.[i];
      if (!b) return;
      cursor.classList.toggle('snap', !!snap);
      // soma os deslocamentos até a lista (o grupo animado também vira referência)
      let y = 0;
      for (let n = b; n && n !== listEl; n = n.offsetParent) y += n.offsetTop;
      cursor.style.transform = `translateY(${y}px)`;
      cursor.style.height = `${b.offsetHeight}px`;
      cursor.classList.toggle('danger', b.classList.contains('danger'));
    };
    this.pauseBtns.forEach((b, i) => {
      const o = options[i];
      b.addEventListener('mouseenter', () => this.pauseSelect(i));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.pauseSelect(i, true);
        this.phoneActivate(i);
      });
      if (o.kind === 'choice')
        b.querySelectorAll('.ph-step').forEach((s) =>
          s.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pauseSelect(i, true);
            this.pauseAdjust(+s.dataset.d);
          })
        );
      if (o.kind === 'slider') {
        // arrastar na barra
        const tr = b.querySelector('.ph-tr');
        const at = (e) => {
          const r = tr.getBoundingClientRect();
          const v = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 20) / 20;
          if (v !== o.get()) {
            o.set(v);
            this.sfx.hover();
            this.pauseRefresh();
          }
        };
        tr.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.pauseSelect(i, true);
          tr.setPointerCapture?.(e.pointerId);
          b.classList.add('drag');
          at(e);
          const move = (ev) => at(ev);
          const up = () => {
            b.classList.remove('drag');
            tr.removeEventListener('pointermove', move);
            tr.removeEventListener('pointerup', up);
            tr.removeEventListener('pointercancel', up);
          };
          tr.addEventListener('pointermove', move);
          tr.addEventListener('pointerup', up);
          tr.addEventListener('pointercancel', up);
        });
        tr.addEventListener('click', (e) => e.stopPropagation());
      }
    });
    if (!this.fsHooked) {
      this.fsHooked = true;
      document.addEventListener('fullscreenchange', () => this.pauseRefresh?.());
    }
    this.pauseRefresh();
    el.classList.add('phone');
    this.pauseSel = -1;
    this.pauseSelect(0, true);
    this.pauseCursor(0, true);
    void el.offsetWidth; // reinicia as animações de entrada
    el.classList.add('show');
  }

  // Enter / clique numa linha do celular
  phoneActivate(i) {
    if (this.pauseSent) return;
    const o = this.pauseOpts?.[i];
    const b = this.pauseBtns?.[i];
    if (!o || !b) return;
    b.classList.remove('press');
    void b.offsetWidth;
    b.classList.add('press');
    const kind = o.kind || 'link';
    if (kind === 'toggle') {
      this.sfx.toggle();
      b.classList.toggle('on', !o.get()); // já mostra o novo estado; o real confirma depois
      o.action();
      setTimeout(() => this.pauseRefresh?.(), 500);
    } else if (kind === 'choice') {
      this.pauseAdjust(1);
    } else if (kind === 'slider') {
      this.sfx.hover();
    } else {
      // confirma: a linha "afunda", e só então a ação acontece
      this.pauseSent = true;
      this.sfx.select();
      this.pauseT = setTimeout(() => o.action(), 170);
    }
  }

  // ← → no celular: barra de volume, escolhas e chaves
  pauseAdjust(d) {
    const o = this.pauseOpts?.[this.pauseSel];
    if (!o || this.pauseSent) return;
    const b = this.pauseBtns[this.pauseSel];
    if (o.kind === 'slider') {
      const v = Math.max(0, Math.min(1, Math.round((o.get() + d * 0.1) * 10) / 10));
      if (v === o.get()) return;
      o.set(v);
      this.sfx.hover();
    } else if (o.kind === 'choice') {
      o.step(d);
      this.sfx.toggle();
      const em = b.querySelector('.ph-ch em');
      em.style.setProperty('--d', d);
      em.classList.remove('flip');
      void em.offsetWidth;
      em.classList.add('flip');
    } else if (o.kind === 'toggle') {
      if (d > 0 !== !!o.get()) this.phoneActivate(this.pauseSel);
      return;
    } else return;
    this.pauseRefresh?.();
  }

  pauseSelect(i, silent = false) {
    if (!this.pauseBtns || i === this.pauseSel || this.pauseSent) return;
    this.pauseSel = i;
    this.pauseBtns.forEach((b, j) => b.classList.toggle('sel', j === i));
    if (!silent) this.sfx.hover();
    this.pauseCursor?.(i);
  }

  pauseMove(d) {
    if (!this.pauseBtns) return;
    const n = this.pauseBtns.length;
    this.pauseSelect((this.pauseSel + d + n) % n);
  }

  pauseActivate() {
    this.pauseBtns?.[this.pauseSel]?.click();
  }
}
