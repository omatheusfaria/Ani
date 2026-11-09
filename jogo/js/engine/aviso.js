// Aviso de conteúdo sensível (RF020).
//
// Aparece depois de Iniciar ou Continuar, antes de o jogo começar, uma vez a cada
// acesso, e só some quando o jogador confirma (botão, Enter/Espaço/E ou A no controle).
//
// Classificação indicativa: por enquanto não é exibida, porque o protótipo não é
// comercializado. Se o jogo for distribuído, faça a autoclassificação pelo Guia Prático
// de Classificação Indicativa (MJSP) e exiba o símbolo oficial e os descritores aqui.
// Pela análise de 09.nov.2026, o protótipo ficaria em "não recomendado para menores de
// 10 anos", com o descritor "Temas sensíveis" (tendência "Angústia").

const TEMPO_MINIMO = 1.2; // segundos antes de aceitar a confirmação (evita pular sem ler)

export function showContentNotice(game) {
  const el = document.getElementById('aviso');
  if (!el) return Promise.resolve();

  el.innerHTML = `
    <div class="av-card" role="dialog" aria-modal="true" aria-labelledby="av-titulo">
      <p class="av-kicker" id="av-titulo">AVISO DE CONTEÚDO</p>
      <p class="av-texto">Ani aborda ansiedade, solidão e sofrimento psíquico, incluindo um momento de crise de ansiedade, com tremor e distorção na tela.</p>
      <p class="av-texto">Se você estiver passando por um momento difícil, converse com alguém de confiança ou procure o <b>CVV – Centro de Valorização da Vida</b>: ligação gratuita pelo <b>188</b> ou chat em <b>cvv.org.br</b>, 24 horas por dia.</p>
      <button class="av-ok" type="button">ENTENDI <span>ENTER / A</span></button>
    </div>`;

  return new Promise((resolve) => {
    const t0 = performance.now();
    const pronto = () => (performance.now() - t0) / 1000 >= TEMPO_MINIMO;
    let fechado = false;

    const fechar = () => {
      if (fechado || !pronto()) return;
      fechado = true;
      game.sfx.unlock();
      game.sfx.select?.();
      window.removeEventListener('keydown', onKey, true);
      game.onAnyPress = null;
      el.classList.remove('show');
      setTimeout(() => {
        el.innerHTML = '';
        resolve();
      }, 450);
    };
    let ultimaTecla = 0; // hora da última tecla do teclado (para distinguir do controle)
    const onKey = (e) => {
      if (e.isTrusted) ultimaTecla = performance.now();
      if (['Enter', 'NumpadEnter', 'Space', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        fechar();
      }
    };

    el.querySelector('.av-ok').addEventListener('click', fechar);
    window.addEventListener('keydown', onKey, true);
    // enquanto o aviso está na tela, as outras entradas não chegam ao jogo.
    // Teclado: só Enter, Espaço ou E confirmam (tratados acima). Controle: o botão
    // apertado chega aqui sem tecla real recente, e confirma.
    game.onAnyPress = () => {
      if (performance.now() - ultimaTecla > 100) fechar();
      return true;
    };
    requestAnimationFrame(() => el.classList.add('show'));
  });
}
