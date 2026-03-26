# Caso de Uso - Ani אני

| Caso de Uso | UC-S001 - Movimentar Personagem |
|-------------|--------------------------------|
| **ID** | UC-S001 |
| **Descrição** | O sistema deve permitir que Ani se mova pelo cenário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo iniciado com Ani carregado. |
| **Cenário Principal** | 1. Jogador pressiona teclas de movimento.<br>2. Sistema captura a entrada.<br>3. Sistema aplica movimento no personagem.<br>4. Sistema verifica colisões.<br>5. Ani é movido corretamente pelo cenário. |
| **Pós-condição** | Ani está em nova posição válida. |
| **Cenários Alternativos** | - Se ocorrer colisão, o movimento é bloqueado. |

---

| Caso de Uso | UC-S003 - Colidir com cenário |
|-------------|-------------------------------|
| **ID** | UC-S003 |
| **Descrição** | O sistema deve impedir Ani de atravessar objetos e barreiras sólidas. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani em movimento. |
| **Cenário Principal** | 1. Ani se move em direção a um obstáculo.<br>2. Sistema detecta a colisão.<br>3. O movimento é bloqueado na barreira. |
| **Pós-condição** | Ani permanece na borda do obstáculo. |
| **Cenários Alternativos** | - Se o objeto não tiver colisor definido, Ani o atravessa (falha do sistema). |

---

| Caso de Uso | UC-S004 - Interagir com Objeto |
|-------------|--------------------------------|
| **ID** | UC-S004 |
| **Descrição** | O sistema deve permitir que Ani interaja com objetos significativos para acessar memórias, fragmentos narrativos ou elementos contemplativos do cenário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um objeto interativo. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de interação.<br>2. Sistema identifica o tipo de objeto interativo.<br>3. Sistema ativa o conteúdo associado, como memória, fragmento textual, objeto restaurável ou evento contemplativo.<br>4. Quando aplicável, o conteúdo é registrado no diário de Ani. |
| **Pós-condição** | O conteúdo vinculado ao objeto é processado e, quando aplicável, registrado no diário. |
| **Cenários Alternativos** | - Se o objeto não for interativo, nada acontece. |

---

| Caso de Uso | UC-S005 - Interagir com NPCs |
|-------------|------------------------------|
| **ID** | UC-S005 |
| **Descrição** | O sistema deve permitir diálogos fragmentados com personagens de memória e arquétipos filosóficos. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um personagem interativo. |
| **Cenário Principal** | 1. Jogador aciona a interação.<br>2. Sistema identifica se a entidade é um personagem de memória ou um arquétipo filosófico.<br>3. Sistema exibe diálogo textual fragmentado.<br>4. Jogador avança o texto.<br>5. Quando aplicável, o conteúdo é registrado como memória narrativa ou reforço simbólico do ato atual. |
| **Pós-condição** | O diálogo é concluído e o conteúdo narrativo associado é processado pelo sistema. |
| **Cenários Alternativos** | - Se o jogador ignorar o NPC, o diálogo não é iniciado. |

---

| Caso de Uso | UC-S006 - Ler Documentos |
|-------------|--------------------------|
| **ID** | UC-S006 |
| **Descrição** | O sistema deve permitir que o jogador abra documentos coletados. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Pelo menos uma memória coletada. |
| **Cenário Principal** | 1. Jogador acessa o diário.<br>2. Sistema abre o documento selecionado.<br>3. Jogador lê o conteúdo. |
| **Pós-condição** | O documento é exibido na tela. |
| **Cenários Alternativos** | - Se o diário não contiver documentos, exibe páginas em branco. |

---

| Caso de Uso | UC-S007 - Abrir Inventário |
|-------------|----------------------------|
| **ID** | UC-S007 |
| **Descrição** | O sistema deve permitir que o jogador acesse o diário/inventário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de inventário.<br>2. Sistema abre uma interface estilizada em forma de diário.<br>3. Jogador navega pelas páginas. |
| **Pós-condição** | Diário exibido na tela. |
| **Cenários Alternativos** | - Se o inventário estiver vazio, mostra páginas sem conteúdo. |

---

| Caso de Uso | UC-S008 - Pausar Jogo |
|-------------|-----------------------|
| **ID** | UC-S008 |
| **Descrição** | O sistema deve permitir que o jogador pause o jogo. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de pausa.<br>2. Sistema suspende o gameplay.<br>3. Exibe o menu de pausa. |
| **Pós-condição** | Jogo pausado, aguardando ação. |
| **Cenários Alternativos** | - Se o jogador retomar, o jogo volta ao estado normal. |

---

| Caso de Uso | UC-S009 - Configurar Jogo |
|-------------|---------------------------|
| **ID** | UC-S009 |
| **Descrição** | O sistema deve permitir que o jogador configure opções gerais. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de pausa ou inicial aberto. |
| **Cenário Principal** | 1. Jogador acessa o menu de configurações.<br>2. Sistema exibe opções de vídeo, áudio e controles.<br>3. Jogador altera os valores. |
| **Pós-condição** | Configurações aplicadas. |
| **Cenários Alternativos** | - Se o jogador cancelar, as alterações não são salvas. |

---

| Caso de Uso | UC-S010 - Configurar Vídeo |
|-------------|----------------------------|
| **ID** | UC-S010 |
| **Descrição** | O sistema deve permitir ajustes gráficos (resolução, qualidade). |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona as opções de vídeo.<br>2. Sistema aplica as alterações.<br>3. Exibe o resultado em tempo real. |
| **Pós-condição** | Vídeo configurado conforme o jogador. |
| **Cenários Alternativos** | - Se o hardware não suportar, o sistema retorna à configuração padrão. |

---

| Caso de Uso | UC-S011 - Configurar Áudio |
|-------------|----------------------------|
| **ID** | UC-S011 |
| **Descrição** | O sistema deve permitir ajustes de volume e efeitos sonoros. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador altera o volume da música e dos efeitos.<br>2. Sistema aplica a alteração.<br>3. Testa a configuração em tempo real. |
| **Pós-condição** | Áudio ajustado conforme a preferência. |
| **Cenários Alternativos** | - Se a alteração for inválida, o sistema restaura os valores padrão. |

---

| Caso de Uso | UC-S012 - Configurar Controles |
|-------------|--------------------------------|
| **ID** | UC-S012 |
| **Descrição** | O sistema deve permitir customização de teclas e gamepad. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona a opção de controles.<br>2. Sistema permite redefinir teclas.<br>3. Jogador confirma as alterações. |
| **Pós-condição** | Controles salvos para futuras sessões. |
| **Cenários Alternativos** | - Se o jogador cancelar, o sistema mantém a configuração anterior. |

---

| Caso de Uso | UC-S013 - Sair do Jogo |
|-------------|------------------------|
| **ID** | UC-S013 |
| **Descrição** | O sistema deve permitir que o jogador encerre a sessão. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador seleciona sair.<br>2. Sistema exibe uma mensagem de confirmação.<br>3. Se confirmado, encerra a aplicação. |
| **Pós-condição** | Sessão de jogo finalizada. |
| **Cenários Alternativos** | - Se o jogador cancelar, a sessão continua. |

---

| Caso de Uso | UC-S014 - Carregar Cenário |
|-------------|----------------------------|
| **ID** | UC-S014 |
| **Descrição** | O sistema deve carregar o cenário atual ou um novo cenário conforme a progressão. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Jogo iniciado ou transição de memória/cômodo. |
| **Cenário Principal** | 1. Sistema carrega recursos visuais, sonoros e interativos do cenário correspondente ao ato ou à memória atual.<br>2. Sistema posiciona Ani no ponto inicial adequado.<br>3. Sistema atualiza o estado do diário, da atmosfera e dos elementos ativos do cenário. |
| **Pós-condição** | Novo cenário exibido corretamente. |
| **Cenários Alternativos** | - Se os recursos não carregarem, exibe mensagem de erro. |

---

| Caso de Uso | UC-S015 - Gerenciar Diálogos |
|-------------|------------------------------|
| **ID** | UC-S015 |
| **Descrição** | O sistema deve controlar a exibição e o fluxo dos diálogos com NPCs. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Interação com NPC iniciada. |
| **Cenário Principal** | 1. Sistema apresenta balões de texto.<br>2. Gerencia o avanço do diálogo.<br>3. Aplica sons ou efeitos visuais conforme a fala. |
| **Pós-condição** | Diálogo finalizado e registrado. |
| **Cenários Alternativos** | - Se o diálogo for interrompido, o progresso é perdido. |

---

| Caso de Uso | UC-S016 - Salvar Jogo |
|-------------|-----------------------|
| **ID** | UC-S016 |
| **Descrição** | O sistema deve salvar o progresso do jogador em arquivo local. |
| **Ator Primário** | Sistema |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador solicita salvar.<br>2. Sistema coleta o estado atual do jogo, incluindo o ato em curso, as memórias registradas, o estado do diário e o estado visual da casa.<br>3. Sistema grava o arquivo de save. |
| **Pós-condição** | Progresso registrado para continuidade futura. |
| **Cenários Alternativos** | - Se ocorrer erro, o sistema notifica o jogador. |
