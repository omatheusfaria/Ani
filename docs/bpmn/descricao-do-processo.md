# Descrição do Processo BPMN

Este documento descreve textualmente o fluxo representado no diagrama BPMN de **Ani**.

## Objetivo do Processo

O processo modela o ciclo principal de progressão do jogador durante a exploração do jogo, desde a abertura da aplicação até o encerramento da exploração e o fim da sessão.

## Participantes

O BPMN está organizado em três raias:

- **Usuário**: representa as ações executadas diretamente pelo jogador.
- **App usuário**: representa as respostas da aplicação, como carregamento de tela, cenário, memória e retorno à exploração.
- **Sistema**: representa validações, armazenamento de itens e verificações de progresso.

## Fluxo Principal

1. O jogador abre o jogo.
2. A aplicação carrega o menu inicial.
3. O jogador seleciona um novo jogo.
4. A aplicação carrega o cenário principal.
5. O jogador inicia a exploração do mapa.
6. Durante a exploração, o jogador interage com um objeto.
7. O sistema verifica o tipo do objeto interagido.
8. Se o objeto for um objeto de memória, a aplicação carrega a memória correspondente.
9. O jogador explora o cenário da memória.
10. O jogador finaliza a memória.
11. Se o objeto for um objeto comum, a aplicação carrega o objeto diretamente.
12. Em ambos os casos, o sistema armazena o objeto no inventário.
13. O sistema verifica se toda a exploração já foi concluída.
14. Se ainda houver objetos, a aplicação retorna o jogador à exploração.
15. Se a exploração estiver completa, o sistema finaliza a exploração.
16. O processo termina com o fim do jogo.

## Pontos de Decisão

### Verificação do Tipo de Objeto

Após a interação com um objeto, o sistema segue um gateway exclusivo com dois caminhos:

- **Objeto de memória**: leva ao carregamento de memória, à exploração do cenário da memória e à finalização da memória.
- **Objeto comum**: leva ao carregamento direto do objeto.

### Verificação de Progresso

Depois do armazenamento do objeto no inventário, o sistema verifica se o jogador já explorou tudo.

- **Ainda há objetos**: o fluxo retorna à exploração do mapa.
- **Exploração completa**: o fluxo segue para a finalização da exploração e o encerramento da sessão.

## Interpretação do Processo

O diagrama representa um loop central de gameplay:

- explorar;
- interagir;
- classificar o objeto;
- processar memória ou item comum;
- registrar progresso;
- decidir entre continuar explorando ou encerrar.

Esse fluxo ajuda a visualizar a lógica macro da progressão do jogo e reforça a relação entre exploração, memórias e avanço estrutural da experiência.

## Observações

- O BPMN atual representa bem a estrutura geral do ciclo de exploração.
- Como o projeto passou por reformulação conceitual, este processo pode precisar de revisão futura para refletir com mais precisão a nova direção filosófica do GDD.
- A remoção da etapa de escolha explícita dentro da memória deixa o BPMN mais alinhado com a direção atual do projeto, que prioriza exploração, contemplação e progressão narrativa.
