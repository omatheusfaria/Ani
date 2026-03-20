# Caso de Uso - Ani: A Jornada da Virtude

| Caso de Uso | UC-S001 – Movimentar Personagem |
|-------------|---------------------------------|
| **ID** | UC-S001 |
| **Descrição** | O sistema deve permitir que Ani se mova pelo cenário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo iniciado com Ani carregado. |
| **Cenário Principal** | 1. Jogador pressiona teclas de movimento.<br>2. Sistema captura entrada.<br>3. Sistema aplica movimento no personagem.<br>4. Sistema verifica colisões.<br>5. Ani é movido corretamente pelo cenário. |
| **Pós-condição** | Ani está em nova posição válida. |
| **Cenários Alternativos** | - Se colisão ocorrer, movimento é bloqueado. |

---

| Caso de Uso | UC-S002 – Andar |
|-------------|-----------------|
| **ID** | UC-S002 |
| **Descrição** | O sistema deve processar entradas de movimento lateral para Ani. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar em pé sobre uma superfície. |
| **Cenário Principal** | 1. Jogador pressiona teclas direcionais.<br>2. Sistema atualiza posição horizontal de Ani.<br>3. Sistema executa animação de caminhada. |
| **Pós-condição** | Ani caminha lateralmente no cenário. |
| **Cenários Alternativos** | - Se jogador soltar as teclas, Ani para de andar. |

---

| Caso de Uso | UC-S003 – Pular |
|-------------|-----------------|
| **ID** | UC-S003 |
| **Descrição** | O sistema deve permitir que Ani pule sobre obstáculos. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar em contato com o chão. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de pulo.<br>2. Sistema aplica força vertical.<br>3. Sistema executa animação de salto. |
| **Pós-condição** | Ani aterrissa em uma superfície válida. |
| **Cenários Alternativos** | - Se Ani já estiver no ar, comando de pulo é ignorado. |

---

| Caso de Uso | UC-S004 – Colidir com cenário |
|-------------|-------------------------------|
| **ID** | UC-S004 |
| **Descrição** | O sistema deve impedir Ani de atravessar objetos e barreiras sólidas. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani em movimento. |
| **Cenário Principal** | 1. Ani se move em direção a um obstáculo.<br>2. Sistema detecta colisão.<br>3. Movimento é bloqueado na barreira. |
| **Pós-condição** | Ani permanece na borda do obstáculo. |
| **Cenários Alternativos** | - Se objeto não tiver colisor definido, Ani o atravessa (falha do sistema). |

---

| Caso de Uso | UC-S005 – Interagir com Objeto |
|-------------|--------------------------------|
| **ID** | UC-S005 |
| **Descrição** | O sistema deve permitir que Ani interaja com objetos para acessar memórias. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um objeto interativo. |
| **Cenário Principal** | 1. Jogador pressiona tecla de interação.<br>2. Sistema identifica objeto interativo.<br>3. Sistema abre memória ou documento associado. |
| **Pós-condição** | Memória é registrada no diário de Ani. |
| **Cenários Alternativos** | - Se objeto não for interativo, nada acontece. |

---

| Caso de Uso | UC-S006 – Tomar Decisão Moral |
|-------------|-------------------------------|
| **ID** | UC-S006 |
| **Descrição** | O sistema deve permitir que o jogador escolha Virtude, Vício Menor ou Vício Maior em dilemas. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Memória deve conter um dilema moral. |
| **Cenário Principal** | 1. Sistema apresenta opções de decisão.<br>2. Jogador escolhe uma opção.<br>3. Sistema registra escolha.<br>4. Sistema aplica efeitos visuais/sonoros. |
| **Pós-condição** | O mundo é atualizado de acordo com a escolha. |
| **Cenários Alternativos** | - Se jogador não escolher, o sistema aplica opção padrão. |

---

| Caso de Uso | UC-S007 – Interagir com NPCs |
|-------------|------------------------------|
| **ID** | UC-S007 |
| **Descrição** | O sistema deve permitir diálogos fragmentados com NPCs. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um NPC. |
| **Cenário Principal** | 1. Jogador aciona interação.<br>2. Sistema exibe diálogo textual.<br>3. Jogador avança o texto.<br>4. Sistema registra diálogo como memória narrativa. |
| **Pós-condição** | Diálogo é concluído. |
| **Cenários Alternativos** | - Se jogador ignorar NPC, diálogo não é iniciado. |

---

| Caso de Uso | UC-S008 – Ler Documentos |
|-------------|---------------------------|
| **ID** | UC-S008 |
| **Descrição** | O sistema deve permitir que o jogador abra documentos coletados. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Pelo menos uma memória coletada. |
| **Cenário Principal** | 1. Jogador acessa o diário.<br>2. Sistema abre documento selecionado.<br>3. Jogador lê conteúdo. |
| **Pós-condição** | Documento é exibido na tela. |
| **Cenários Alternativos** | - Se diário não contiver documentos, exibe páginas em branco. |

---

| Caso de Uso | UC-S009 – Abrir Inventário |
|-------------|----------------------------|
| **ID** | UC-S009 |
| **Descrição** | O sistema deve permitir que o jogador acesse o diário/inventário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador pressiona tecla de inventário.<br>2. Sistema abre interface estilizada em forma de diário.<br>3. Jogador navega pelas páginas. |
| **Pós-condição** | Diário exibido na tela. |
| **Cenários Alternativos** | - Se inventário estiver vazio, mostra páginas sem conteúdo. |

---

| Caso de Uso | UC-S010 – Pausar Jogo |
|-------------|------------------------|
| **ID** | UC-S010 |
| **Descrição** | O sistema deve permitir que o jogador pause o jogo. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador pressiona tecla de pausa.<br>2. Sistema suspende gameplay.<br>3. Exibe menu de pausa. |
| **Pós-condição** | Jogo pausado aguardando ação. |
| **Cenários Alternativos** | - Se jogador retomar, jogo volta ao estado normal. |

---

| Caso de Uso | UC-S011 – Configurar Jogo |
|-------------|----------------------------|
| **ID** | UC-S011 |
| **Descrição** | O sistema deve permitir que o jogador configure opções gerais. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de pausa ou inicial aberto. |
| **Cenário Principal** | 1. Jogador acessa menu de configurações.<br>2. Sistema exibe opções de vídeo, áudio e controles.<br>3. Jogador altera valores. |
| **Pós-condição** | Configurações aplicadas. |
| **Cenários Alternativos** | - Se jogador cancelar, alterações não são salvas. |

---

| Caso de Uso | UC-S012 – Configurar Vídeo |
|-------------|-----------------------------|
| **ID** | UC-S012 |
| **Descrição** | O sistema deve permitir ajustes gráficos (resolução, qualidade). |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona opções de vídeo.<br>2. Sistema aplica alterações.<br>3. Exibe resultado em tempo real. |
| **Pós-condição** | Vídeo configurado conforme jogador. |
| **Cenários Alternativos** | - Se hardware não suportar, sistema retorna configuração padrão. |

---

| Caso de Uso | UC-S013 – Configurar Áudio |
|-------------|-----------------------------|
| **ID** | UC-S013 |
| **Descrição** | O sistema deve permitir ajustes de volume e efeitos sonoros. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador altera volume da música e efeitos.<br>2. Sistema aplica alteração.<br>3. Testa configuração em tempo real. |
| **Pós-condição** | Áudio ajustado conforme preferência. |
| **Cenários Alternativos** | - Se alteração for inválida, sistema restaura valores padrão. |

---

| Caso de Uso | UC-S014 – Configurar Controles |
|-------------|--------------------------------|
| **ID** | UC-S014 |
| **Descrição** | O sistema deve permitir customização de teclas e gamepad. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona opção de controles.<br>2. Sistema permite redefinir teclas.<br>3. Jogador confirma alterações. |
| **Pós-condição** | Controles salvos para futuras sessões. |
| **Cenários Alternativos** | - Se jogador cancelar, sistema mantém configuração anterior. |

---

| Caso de Uso | UC-S015 – Sair do Jogo |
|-------------|-------------------------|
| **ID** | UC-S015 |
| **Descrição** | O sistema deve permitir que o jogador encerre a sessão. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador seleciona sair.<br>2. Sistema exibe mensagem de confirmação.<br>3. Se confirmado, encerra aplicação. |
| **Pós-condição** | Sessão de jogo finalizada. |
| **Cenários Alternativos** | - Se jogador cancelar, sessão continua. |

---

| Caso de Uso | UC-S016 – Carregar Cenário |
|-------------|-----------------------------|
| **ID** | UC-S016 |
| **Descrição** | O sistema deve carregar o cenário atual ou novo conforme a progressão. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Jogo iniciado ou transição de memória/cômodo. |
| **Cenário Principal** | 1. Sistema carrega recursos gráficos e de áudio.<br>2. Posiciona Ani no ponto inicial.<br>3. Atualiza HUD e inventário. |
| **Pós-condição** | Novo cenário é exibido corretamente. |
| **Cenários Alternativos** | - Se recursos não carregarem, exibe mensagem de erro. |

---

| Caso de Uso | UC-S017 – Aplicar Escolha Moral |
|-------------|---------------------------------|
| **ID** | UC-S017 |
| **Descrição** | O sistema deve aplicar os efeitos da decisão moral tomada pelo jogador. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Decisão moral já escolhida pelo jogador. |
| **Cenário Principal** | 1. Sistema registra a escolha.<br>2. Aplica efeitos visuais (cores, shaders).<br>3. Aplica efeitos sonoros.<br>4. Atualiza estado do mundo e diário. |
| **Pós-condição** | Estado do mundo alterado conforme decisão. |
| **Cenários Alternativos** | - Se falha técnica, estado permanece inalterado. |

---

| Caso de Uso | UC-S018 – Gerenciar Diálogos |
|-------------|-------------------------------|
| **ID** | UC-S018 |
| **Descrição** | O sistema deve controlar exibição e fluxo dos diálogos com NPCs. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Interação com NPC iniciada. |
| **Cenário Principal** | 1. Sistema apresenta balões de texto.<br>2. Gerencia avanço do diálogo.<br>3. Aplica sons ou efeitos visuais conforme fala. |
| **Pós-condição** | Diálogo finalizado e registrado. |
| **Cenários Alternativos** | - Se diálogo for interrompido, progresso é perdido. |

---

| Caso de Uso | UC-S019 – Salvar Jogo |
|-------------|------------------------|
| **ID** | UC-S019 |
| **Descrição** | O sistema deve salvar progresso do jogador em arquivo local. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador solicita salvar.<br>2. Sistema coleta estado atual (memórias, decisões, inventário).<br>3. Grava arquivo de save. |
| **Pós-condição** | Progresso registrado para continuidade futura. |
| **Cenários Alternativos** | - Se erro ocorrer, sistema notifica jogador. |
