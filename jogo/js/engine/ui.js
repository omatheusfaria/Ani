// Camada de interface em HTML por cima do canvas: avisos, legendas com texto
// digitado, dicas de controle e menu de pausa.

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
  }

  // Balão "E · Objeto" preso a um ponto da tela (x, y em pixels da janela)
  // key: tecla mostrada no balão ('E', 'CLIQUE'...); null esconde a tecla
  interact(text, x, y, key = 'E') {
    const el = this.el.interact;
    if (!text) {
      el.classList.remove('show');
      return;
    }
    const sig = `${key}|${text}`;
    if (el.dataset.text !== sig) {
      el.dataset.text = sig;
      el.innerHTML = `${key ? `<b>${key}</b>` : ''}<span>${text}</span>`;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
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
    if (text) {
      el.textContent = text;
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
  }

  title(show) {
    this.el.title.classList.toggle('show', !!show);
  }

  hint(text) {
    const el = this.el.hint;
    if (text) {
      el.innerHTML = text;
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
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

  // Pensamento da protagonista, em balão, digitado com som.
  async say(text, { hold = 2.4, panic = false } = {}) {
    const tok = ++this.sayToken;
    const el = this.el.subtitle;
    const span = el.querySelector('span');
    el.classList.toggle('panic', panic);
    el.classList.remove('show');
    void el.offsetWidth;
    span.textContent = '';
    el.classList.add('show');
    this.speaking = true;
    const speed = panic ? 18 : 34;
    let i = 0;
    for (const ch of text) {
      if (tok !== this.sayToken) return;
      span.textContent += ch;
      if (ch !== ' ' && i++ % 2 === 0) this.sfx.type();
      await sleep(speed + (ch === ',' || ch === '.' ? 120 : 0));
    }
    await sleep(hold * 1000);
    if (tok === this.sayToken) {
      el.classList.remove('show');
      this.speaking = false;
    }
  }

  // Fala e espera terminar (para encadear falas)
  async sayWait(text, opts) {
    await this.say(text, opts);
    await sleep(250);
  }

  clearSay() {
    this.speaking = false;
    this.sayToken++;
    this.el.subtitle.classList.remove('show');
  }

  // Menu de pausa. options: [{ label, action }]
  pause(options) {
    const el = this.el.pause;
    if (!options) {
      el.classList.remove('show');
      el.innerHTML = '';
      this.pauseOpen = false;
      return;
    }
    this.pauseOpen = true;
    el.innerHTML = '<div class="pause-box"><div class="pause-title">PAUSA</div></div>';
    const box = el.querySelector('.pause-box');
    options.forEach((o) => {
      const b = document.createElement('button');
      b.textContent = o.label;
      b.addEventListener('mouseenter', () => this.sfx.hover());
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sfx.select();
        o.action();
      });
      box.appendChild(b);
    });
    el.classList.add('show');
  }
}
