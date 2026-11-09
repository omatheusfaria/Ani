// Animações (tweens), curvas de easing e utilitários de suavização.

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// Aproxima "a" de "b" de forma suave e independente do FPS.
export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
export const rand = (a, b) => a + Math.random() * (b - a);

// Grupo de animações de uma cena. clear() cancela tudo (usado ao pular cutscenes).
export class Tweens {
  constructor() {
    this.list = new Set();
  }

  // Anima de 0 a 1 durante "duration" segundos, chamando onUpdate(valorComEasing, progresso).
  to({ duration = 1, ease: e = ease.outCubic, delay = 0, onUpdate }) {
    return new Promise((resolve) => {
      this.list.add({ t: -delay, duration: Math.max(0.0001, duration), e, onUpdate, resolve });
    });
  }

  // Anima uma propriedade: tweens.prop(obj, 'x', 10, 0.5)
  prop(obj, key, to, duration = 0.5, e = ease.outCubic, delay = 0) {
    let from = null;
    return this.to({
      duration, ease: e, delay,
      onUpdate: (k) => {
        if (from === null) from = obj[key];
        obj[key] = lerp(from, to, k);
      },
    });
  }

  wait(seconds) {
    return this.to({ duration: seconds });
  }

  update(dt) {
    for (const tw of this.list) {
      tw.t += dt;
      if (tw.t < 0) continue;
      const k = Math.min(1, tw.t / tw.duration);
      tw.onUpdate?.(tw.e(k), k);
      if (k >= 1) {
        this.list.delete(tw);
        tw.resolve();
      }
    }
  }

  clear() {
    this.list.clear();
  }
}
