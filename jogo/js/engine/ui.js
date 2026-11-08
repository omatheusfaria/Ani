// Camada de interface em HTML por cima do canvas: avisos, legendas com texto
// digitado, dicas de controle e menu de pausa.
//
// Diálogos no estilo Until Then:
//   ui.say(texto)              caixa embaixo: interação com cenário e objetos, pensamentos
//   ui.bubble(texto, {anchor}) balão em cima da cabeça: conversa entre personagens
//                              anchor = () => [x, y] em pixels (a ponta do balão)

import { padHint, padKey, padPrompt, padIcon } from './glyphs.js';

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
      if (chars[i] !== ' ' && i % 2 === 0) this.sfx.type();
      await this.nap(speed + (',.!?'.includes(chars[i]) ? 120 : 0), ctl);
    }
    return tokOk();
  }

  // espera que um clique pode encurtar
  nap(ms, ctl) {
    if (!ctl) return sleep(ms);
    return new Promise((r) => {
      const t = setTimeout(done, ms);
      function done() {
        clearTimeout(t);
        ctl.wake = null;
        r();
      }
      ctl.wake = done;
    });
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
  async bubble(text, { anchor, id = 'fala', hold = 2.4, panic = false } = {}) {
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
    const ctl = { stage: 'typing', fast: false, skip: false, wake: null, el };
    this.dlg.add(ctl);
    try {
      const ok = await this.typeInto(el.querySelector('.typed'), el.querySelector('.rest'), text, () => tok === b.tok, panic ? 18 : 32, ctl);
      if (!ok) return;
      el.classList.add('done');
      ctl.stage = 'hold';
      if (!ctl.skip) await this.nap(hold * 1000, ctl);
      if (tok === b.tok) {
        el.classList.remove('show', 'done');
        cancelAnimationFrame(b.raf);
      }
    } finally {
      this.dlg.delete(ctl);
    }
  }

  async bubbleWait(text, opts) {
    await this.bubble(text, opts);
    await sleep(250);
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
    await sleep(250);
  }

  clearSay() {
    this.dropDlg(this.el.subtitle);
    this.speaking = false;
    this.sayToken++;
    this.el.subtitle.classList.remove('show', 'done');
  }

  // Menu de pausa. options: [{ label, action }]
  // Mouse (passar e clicar), setas + Enter, ou direcional + A.
  pause(options) {
    const el = this.el.pause;
    if (!options) {
      el.classList.remove('show');
      el.innerHTML = '';
      this.pauseOpen = false;
      this.pauseBtns = null;
      return;
    }
    this.pauseOpen = true;
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

  pauseSelect(i, silent = false) {
    if (!this.pauseBtns || i === this.pauseSel) return;
    this.pauseSel = i;
    this.pauseBtns.forEach((b, j) => b.classList.toggle('sel', j === i));
    if (!silent) this.sfx.hover();
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
