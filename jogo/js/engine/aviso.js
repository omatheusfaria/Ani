// Aviso de classificação indicativa e de conteúdo sensível (RF020).
//
// Aparece depois de Iniciar ou Continuar, antes de o jogo começar, uma vez a cada
// acesso, e só some quando o jogador
// confirma (botão, Enter/Espaço/E ou A no controle), como pede o Guia Prático de
// Classificação Indicativa (MJSP, 5ª ed., 2025) para jogos e aplicações na web.
//
// Autoclassificação do protótipo pelos critérios do guia:
//   - tendência "Angústia" (personagem em estado de depressão ou tristeza profunda)
//     → não recomendado para menores de 10 anos;
//   - descritor oficial correspondente: "Temas sensíveis".
// Se o conteúdo mudar (novas fases, crises de ansiedade mais intensas), refaça a
// autoclassificação: obra com conteúdo acrescentado exige nova classificação.
//
// Símbolo: obras autoclassificadas usam o símbolo PROVISÓRIO do Ministério da Justiça,
// sem alterar cor, proporção ou ângulo. Baixe o de 10 anos no site da Classificação
// Indicativa e salve em assets/classificacao/autoclassificacao-10.png. Sem o arquivo,
// a tela mostra só o texto da faixa etária.

export const CLASSIFICACAO = {
  idade: 10,
  texto: 'NÃO RECOMENDADO PARA MENORES DE 10 ANOS',
  descritores: ['Temas sensíveis'],
  simbolo: 'assets/classificacao/autoclassificacao-10.png',
};

const TEMPO_MINIMO = 1.2; // segundos antes de aceitar a confirmação (evita pular sem ler)

export function showContentNotice(game) {
  const el = document.getElementById('aviso');
  if (!el) return Promise.resolve();
  const c = CLASSIFICACAO;

  el.innerHTML = `
    <div class="av-card" role="dialog" aria-modal="true" aria-labelledby="av-titulo">
      <p class="av-kicker" id="av-titulo">CLASSIFICAÇÃO INDICATIVA</p>
      <div class="av-classif">
        <img class="av-simbolo" alt="Símbolo de classificação indicativa: não recomendado para menores de ${c.idade} anos" hidden>
        <div>
          <p class="av-faixa">${c.texto}</p>
          <p class="av-desc">APRESENTA: ${c.descritores.join(', ').toUpperCase()}</p>
          <p class="av-auto">Autoclassificação</p>
        </div>
      </div>
      <hr>
      <p class="av-kicker">AVISO DE CONTEÚDO</p>
      <p class="av-texto">Ani aborda ansiedade, solidão e sofrimento psíquico, incluindo um momento de crise de ansiedade, com tremor e distorção na tela.</p>
      <p class="av-texto">Se você estiver passando por um momento difícil, converse com alguém de confiança ou procure o <b>CVV – Centro de Valorização da Vida</b>: ligação gratuita pelo <b>188</b> ou chat em <b>cvv.org.br</b>, 24 horas por dia.</p>
      <button class="av-ok" type="button">ENTENDI <span>ENTER / A</span></button>
    </div>`;

  // símbolo oficial, se o arquivo existir
  const img = el.querySelector('.av-simbolo');
  img.onload = () => (img.hidden = false);
  img.src = c.simbolo;

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
