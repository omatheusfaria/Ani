# Caso de Uso - Ani אני

| Caso de Uso | UC-S001 - Movimentar Personagem |
|-------------|--------------------------------|
| **ID** | UC-S001 |
| **Nome revisado** | Movimentar Personagem |
| **Descrição** | Este caso de uso tem por objetivo permitir a movimentação de Ani pelo cenário durante a exploração lateral. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo iniciado com Ani carregado. |
| **Cenário Principal** | 1. Jogador pressiona teclas de movimento.<br>2. Sistema captura a entrada.<br>3. Sistema aplica movimento no personagem.<br>4. Sistema verifica colisões.<br>5. Ani é movido corretamente pelo cenário. |
| **Pós-condição** | A posição de Ani é atualizada para uma coordenada válida no cenário, respeitando os limites e obstáculos existentes. |
| **Cenários Alternativos** | - Se ocorrer colisão, o movimento é bloqueado. |
| **Observações arquiteturais** | A verificação de colisão é tratada como parte do comportamento de movimentação, mantendo coerência com RF001 e RF002. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S002 - Interagir com Objetos |
|-------------|---------------------------------|
| **ID** | UC-S002 |
| **Nome revisado** | Interagir com Objetos |
| **Descrição** | Este caso de uso permite que o jogador interaja com objetos significativos para acessar memórias, fragmentos narrativos ou elementos contemplativos do cenário. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um objeto interativo. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de interação.<br>2. Sistema identifica o tipo de objeto interativo.<br>3. Sistema ativa o conteúdo associado, como memória, fragmento textual, objeto restaurável ou evento contemplativo.<br>4. Quando aplicável, o conteúdo é registrado no diário de Ani. |
| **Pós-condição** | O conteúdo associado ao objeto é disponibilizado ao jogador e, quando aplicável, registrado no diário de memórias. |
| **Cenários Alternativos** | - Se o objeto não for interativo, nada acontece. |
| **Observações arquiteturais** | Mantém relação direta com RF003, RF004, RF015 e RF016. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S003 - Dialogar com Personagens |
|-------------|-----------------------------------|
| **ID** | UC-S003 |
| **Nome revisado** | Dialogar com Personagens |
| **Descrição** | Este caso de uso tem por objetivo permitir a interação narrativa com personagens de memória e arquétipos filosóficos. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Ani deve estar próximo de um personagem interativo. |
| **Cenário Principal** | 1. Jogador aciona a interação.<br>2. Sistema identifica se a entidade é um personagem de memória ou um arquétipo filosófico.<br>3. Sistema exibe diálogo textual fragmentado.<br>4. Jogador avança o texto.<br>5. Quando aplicável, o conteúdo é registrado como memória narrativa ou reforço simbólico do ato atual. |
| **Pós-condição** | O diálogo é concluído e o estado narrativo associado à interação é atualizado pelo sistema. |
| **Cenários Alternativos** | - Se o jogador ignorar o personagem, o diálogo não é iniciado. |
| **Observações arquiteturais** | O gerenciamento técnico do fluxo de diálogo permanece incorporado a este caso de uso. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S004 - Consultar Documentos Coletados |
|-------------|-----------------------------------------|
| **ID** | UC-S004 |
| **Nome revisado** | Consultar Documentos Coletados |
| **Descrição** | Este caso de uso permite que o jogador consulte documentos e fragmentos já registrados no diário de memórias. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Pelo menos uma memória coletada. |
| **Cenário Principal** | 1. Jogador acessa o diário.<br>2. Sistema abre o documento selecionado.<br>3. Jogador lê o conteúdo. |
| **Pós-condição** | O documento selecionado é disponibilizado para leitura dentro do diário de memórias. |
| **Cenários Alternativos** | - Se o diário não contiver documentos, exibe páginas em branco. |
| **Observações arquiteturais** | Pode ser tratado como extensão de UC-S005, pois depende do acesso ao diário. |
| **Indicação** | Permanecer, preferencialmente associado a UC-S005. |

---

| Caso de Uso | UC-S005 - Acessar Diário de Memórias |
|-------------|--------------------------------------|
| **ID** | UC-S005 |
| **Nome revisado** | Acessar Diário de Memórias |
| **Descrição** | Este caso de uso tem por objetivo permitir que o jogador acesse e navegue pelo diário de memórias de Ani. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de inventário.<br>2. Sistema abre uma interface estilizada em forma de diário.<br>3. Jogador navega pelas páginas. |
| **Pós-condição** | O diário de memórias é disponibilizado para navegação pelo jogador. |
| **Cenários Alternativos** | - Se o inventário estiver vazio, mostra páginas sem conteúdo. |
| **Observações arquiteturais** | O termo "diário de memórias" é mais aderente ao projeto do que "inventário", pois reflete o foco narrativo e contemplativo. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S006 - Pausar Jogo |
|-------------|-----------------------|
| **ID** | UC-S006 |
| **Nome revisado** | Pausar Jogo |
| **Descrição** | Este caso de uso permite que o jogador suspenda temporariamente a sessão em andamento. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador pressiona a tecla de pausa.<br>2. Sistema suspende o gameplay.<br>3. Exibe o menu de pausa. |
| **Pós-condição** | O estado da sessão é atualizado para pausado, mantendo o jogo suspenso até nova ação do jogador. |
| **Cenários Alternativos** | - Se o jogador retomar, o jogo volta ao estado normal. |
| **Observações arquiteturais** | Sem observações adicionais. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S007 - Configurar Jogo |
|-------------|---------------------------|
| **ID** | UC-S007 |
| **Nome revisado** | Configurar Jogo |
| **Descrição** | Este caso de uso tem por objetivo permitir que o jogador ajuste opções gerais da experiência de jogo. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de pausa ou inicial aberto. |
| **Cenário Principal** | 1. Jogador acessa o menu de configurações.<br>2. Sistema exibe opções de vídeo, áudio e controles.<br>3. Jogador altera os valores. |
| **Pós-condição** | As configurações selecionadas são aplicadas conforme as opções alteradas pelo jogador. |
| **Cenários Alternativos** | - Se o jogador cancelar, as alterações não são salvas. |
| **Observações arquiteturais** | Pode atuar como caso de uso geral que agrupa UC-S008, UC-S009 e UC-S010. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S008 - Ajustar Configurações de Vídeo |
|-------------|------------------------------------------|
| **ID** | UC-S008 |
| **Nome revisado** | Ajustar Configurações de Vídeo |
| **Descrição** | Este caso de uso permite que o jogador ajuste parâmetros visuais, como resolução e qualidade gráfica. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona as opções de vídeo.<br>2. Sistema aplica as alterações.<br>3. Exibe o resultado em tempo real. |
| **Pós-condição** | O estado de configuração de vídeo da sessão é atualizado conforme os parâmetros selecionados. |
| **Cenários Alternativos** | - Se o hardware não suportar, o sistema retorna à configuração padrão. |
| **Observações arquiteturais** | Pode ser modelado como especialização ou extensão de UC-S007. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S009 - Ajustar Configurações de Áudio |
|-------------|------------------------------------------|
| **ID** | UC-S009 |
| **Nome revisado** | Ajustar Configurações de Áudio |
| **Descrição** | Este caso de uso permite que o jogador ajuste volumes de música e efeitos sonoros. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador altera o volume da música e dos efeitos.<br>2. Sistema aplica a alteração.<br>3. Testa a configuração em tempo real. |
| **Pós-condição** | O estado de configuração de áudio é atualizado conforme as preferências definidas pelo jogador. |
| **Cenários Alternativos** | - Se a alteração for inválida, o sistema restaura os valores padrão. |
| **Observações arquiteturais** | Pode ser modelado como especialização ou extensão de UC-S007. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S010 - Configurar Controles |
|-------------|--------------------------------|
| **ID** | UC-S010 |
| **Nome revisado** | Configurar Controles |
| **Descrição** | Este caso de uso tem por objetivo permitir que o jogador personalize teclas e entradas de gamepad. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Menu de configurações aberto. |
| **Cenário Principal** | 1. Jogador seleciona a opção de controles.<br>2. Sistema permite redefinir teclas.<br>3. Jogador confirma as alterações. |
| **Pós-condição** | As configurações de controle são atualizadas e salvas para uso em sessões futuras. |
| **Cenários Alternativos** | - Se o jogador cancelar, o sistema mantém a configuração anterior. |
| **Observações arquiteturais** | Mantém coerência com RF011 e com requisitos de acessibilidade relacionados à experiência de controle. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S011 - Sair do Jogo |
|-------------|------------------------|
| **ID** | UC-S011 |
| **Nome revisado** | Sair do Jogo |
| **Descrição** | Este caso de uso permite que o jogador encerre a sessão de jogo. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Jogo em execução. |
| **Cenário Principal** | 1. Jogador seleciona sair.<br>2. Sistema exibe uma mensagem de confirmação.<br>3. Se confirmado, encerra a aplicação. |
| **Pós-condição** | A sessão de jogo é finalizada e o estado de execução da aplicação é encerrado. |
| **Cenários Alternativos** | - Se o jogador cancelar, a sessão continua. |
| **Observações arquiteturais** | Caso haja salvamento antes do encerramento, recomenda-se relacionar este caso ao UC-S012 sem duplicar a lógica de persistência. |
| **Indicação** | Permanecer. |

---

| Caso de Uso | UC-S012 - Salvar Jogo |
|-------------|-----------------------|
| **ID** | UC-S012 |
| **Nome revisado** | Salvar Jogo |
| **Descrição** | Este caso de uso tem por objetivo registrar o progresso do jogador em arquivo local para continuidade futura. |
| **Ator Primário** | Jogador |
| **Pré-condição** | Sessão em andamento. |
| **Cenário Principal** | 1. Jogador solicita salvar.<br>2. Sistema coleta o estado atual do jogo, incluindo o ato em curso, as memórias registradas, o estado do diário e o estado visual da casa.<br>3. Sistema grava o arquivo de save. |
| **Pós-condição** | O progresso do jogador é persistido em arquivo local, permitindo a continuidade da sessão em momento posterior. |
| **Cenários Alternativos** | - Se ocorrer erro, o sistema notifica o jogador. |
| **Observações arquiteturais** | Como o fluxo é iniciado pelo jogador, o ator primário deve ser Jogador. Se houver salvamento automático, ele deve ser tratado como serviço interno vinculado ao RF009. |
| **Indicação** | Permanecer. |
