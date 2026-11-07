// Efeitos sonoros sintetizados com Web Audio (não precisa de arquivos de som).
// O navegador só libera áudio depois de um clique ou tecla: chame unlock() nesse momento.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.volume = 1;
    this.ambientNodes = null;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  _env(node, t0, attack, peak, decay) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    node.connect(g);
    return g;
  }

  tone(freq, { type = 'square', dur = 0.06, vol = 0.06, slide = 0, delay = 0, attack = 0.004 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    this._env(o, t, attack, vol, dur).connect(this.master);
    o.start(t);
    o.stop(t + attack + dur + 0.05);
  }

  noise({ dur = 0.3, vol = 0.08, from = 400, to = 4000, q = 1, delay = 0, attack = 0.01, type = 'bandpass' } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    src.connect(f);
    this._env(f, t, attack, vol, dur).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + attack + dur + 0.05);
  }

  // --- Interface ---
  hover() { this.tone(1480, { dur: 0.025, vol: 0.025 }); }
  select() {
    this.tone(660, { dur: 0.05, vol: 0.05 });
    this.tone(990, { dur: 0.09, vol: 0.05, delay: 0.05 });
  }
  back() {
    this.tone(740, { dur: 0.05, vol: 0.04 });
    this.tone(494, { dur: 0.08, vol: 0.04, delay: 0.05 });
  }
  deny() {
    this.tone(150, { type: 'sawtooth', dur: 0.1, vol: 0.05 });
    this.tone(118, { type: 'sawtooth', dur: 0.14, vol: 0.05, delay: 0.09 });
  }
  toggle() { this.tone(1100, { dur: 0.03, vol: 0.04 }); this.tone(1650, { dur: 0.04, vol: 0.03, delay: 0.03 }); }

  // --- Olho / cinema ---
  whoosh() { this.noise({ dur: 1.8, vol: 0.1, from: 180, to: 2600, q: 0.7, attack: 0.4 }); }
  blink() { this.noise({ dur: 0.1, vol: 0.025, from: 2400, to: 700, q: 2 }); }
  riser() {
    this.noise({ dur: 0.9, vol: 0.08, from: 300, to: 6000, q: 1.2, attack: 0.6 });
    this.tone(220, { type: 'sine', dur: 0.9, vol: 0.05, slide: 660, attack: 0.5 });
  }
  impact() {
    this.tone(90, { type: 'sine', dur: 0.5, vol: 0.35, slide: -50 });
    this.noise({ dur: 0.4, vol: 0.1, from: 3000, to: 200, q: 0.5 });
  }

  // --- Celular ---
  tap() { this.tone(2400, { type: 'sine', dur: 0.018, vol: 0.05 }); }
  scrollTick() { this.tone(3200, { type: 'sine', dur: 0.008, vol: 0.012 }); }
  unlockPhone() {
    this.tone(880, { type: 'sine', dur: 0.05, vol: 0.06 });
    this.tone(1320, { type: 'sine', dur: 0.08, vol: 0.05, delay: 0.06 });
  }
  notify() {
    this.tone(1046, { type: 'sine', dur: 0.08, vol: 0.06 });
    this.tone(1568, { type: 'sine', dur: 0.14, vol: 0.05, delay: 0.09 });
  }
  like() {
    this.tone(523, { type: 'triangle', dur: 0.06, vol: 0.08 });
    this.tone(1046, { type: 'triangle', dur: 0.12, vol: 0.07, delay: 0.05 });
  }
  heartbeat(intensity = 1) {
    this.tone(62, { type: 'sine', dur: 0.14, vol: 0.45 * intensity, slide: -25 });
    this.tone(55, { type: 'sine', dur: 0.18, vol: 0.32 * intensity, slide: -20, delay: 0.17 });
  }
  type() { this.tone(820 + Math.random() * 360, { dur: 0.012, vol: 0.012 }); }

  // --- Quarto ---
  step() {
    this.noise({ dur: 0.07, vol: 0.05, from: 900, to: 300, q: 0.8, type: 'lowpass' });
    this.tone(80 + Math.random() * 20, { type: 'sine', dur: 0.06, vol: 0.06 });
  }
  powerDown() {
    this.tone(660, { type: 'sine', dur: 0.5, vol: 0.06, slide: -600 });
    this.noise({ dur: 0.25, vol: 0.03, from: 4000, to: 300, q: 1 });
  }
  warn() {
    this.tone(880, { type: 'square', dur: 0.08, vol: 0.04 });
    this.tone(660, { type: 'square', dur: 0.12, vol: 0.04, delay: 0.12 });
  }
  rustle() { this.noise({ dur: 0.7, vol: 0.06, from: 1500, to: 600, q: 0.5, attack: 0.15 }); }
  creak() { this.tone(140, { type: 'sawtooth', dur: 0.35, vol: 0.025, slide: 60, attack: 0.08 }); }
  click() {
    this.tone(2600, { type: 'square', dur: 0.012, vol: 0.06 });
    this.noise({ dur: 0.04, vol: 0.05, from: 3000, to: 1500, q: 2 });
  }
  hum() { this.tone(100, { type: 'sawtooth', dur: 0.5, vol: 0.012, attack: 0.05 }); }
  drawer() {
    this.noise({ dur: 0.45, vol: 0.07, from: 300, to: 700, q: 1.5, attack: 0.05 });
    this.tone(70, { type: 'sine', dur: 0.15, vol: 0.12, delay: 0.42 });
  }
  // tecido arrastando + argolas da cortina no varão
  cloth() { this.noise({ dur: 0.9, vol: 0.07, from: 900, to: 300, q: 0.6, attack: 0.12 }); }
  rings() {
    for (let i = 0; i < 6; i++) this.tone(2600 + Math.random() * 900, { type: 'triangle', dur: 0.03, vol: 0.012, delay: i * 0.07 + Math.random() * 0.03 });
  }
  page() { this.noise({ dur: 0.22, vol: 0.06, from: 5000, to: 1800, q: 0.8, attack: 0.01 }); }
  zipper() {
    for (let i = 0; i < 14; i++) this.noise({ dur: 0.025, vol: 0.05, from: 3500, to: 2500, q: 3, delay: i * 0.035 });
  }
  pop() { this.tone(660, { type: 'sine', dur: 0.06, vol: 0.05, slide: 420 }); }
  whooshSoft() { this.noise({ dur: 0.5, vol: 0.05, from: 300, to: 1800, q: 0.7, attack: 0.12 }); }
  zap() {
    this.noise({ dur: 0.08, vol: 0.03, from: 6000, to: 3000, q: 4 });
    this.tone(180 + Math.random() * 80, { type: 'sawtooth', dur: 0.06, vol: 0.01 });
  }
  thump() { this.tone(60, { type: 'sine', dur: 0.2, vol: 0.2, slide: -20 }); }
  shimmer() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, { type: 'sine', dur: 1.4, vol: 0.025, delay: i * 0.18, attack: 0.3 }));
  }

  // --- Ambiente em loop ---
  ambient(kind) {
    if (!this.ctx) return;
    this.stopAmbient(0.8);
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2.5);
    out.connect(this.master);
    const nodes = [];

    const osc = (freq, type, vol) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = vol;
      o.connect(g).connect(out);
      o.start();
      nodes.push(o);
      return o;
    };
    const noise = (freq, q, vol, type = 'lowpass') => {
      const s = ctx.createBufferSource();
      s.buffer = this.noiseBuf;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = vol;
      s.connect(f).connect(g).connect(out);
      s.start();
      nodes.push(s);
      return g;
    };

    if (kind === 'menu') {
      osc(55, 'sine', 0.07);
      osc(82.6, 'sine', 0.04);
      osc(110.3, 'triangle', 0.012);
      const air = noise(900, 0.4, 0.012, 'bandpass');
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lg = ctx.createGain();
      lg.gain.value = 0.008;
      lfo.connect(lg).connect(air.gain);
      lfo.start();
      nodes.push(lfo);
    } else if (kind === 'quarto') {
      noise(420, 0.3, 0.05); // ar-condicionado / cidade distante
      noise(2600, 0.6, 0.006, 'bandpass'); // chiado leve
      osc(50, 'sine', 0.012); // zumbido elétrico
      osc(73.4, 'sine', 0.02);
    }
    this.ambientNodes = { out, nodes };
  }

  stopAmbient(fade = 1) {
    if (!this.ctx || !this.ambientNodes) return;
    const { out, nodes } = this.ambientNodes;
    const t = this.ctx.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + fade);
    nodes.forEach((n) => n.stop(t + fade + 0.1));
    this.ambientNodes = null;
  }
}
