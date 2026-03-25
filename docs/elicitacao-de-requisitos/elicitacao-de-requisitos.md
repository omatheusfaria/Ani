# Documentacao da Elicitacao de Requisitos

## 1. Objetivo

Este documento registra como os requisitos do projeto **Ani** foram levantados, refinados e organizados ao longo da fase de estruturacao academica. O objetivo nao e apenas listar requisitos finais, mas explicitar o processo que levou a sua identificacao.

## 2. Contexto do projeto

**Ani** e um side-scroller narrativo contemplativo, com foco em progressao por atos filosoficos, exploracao de memorias, diario diegetico e interacoes simbolicas com o mundo do jogo. Por ser um projeto autoral em desenvolvimento academico, a elicitacao de requisitos ocorreu de modo iterativo, combinando consulta exploratoria ao publico-alvo com introspeccao estruturada do designer e consolidacao documental.

## 3. Fontes utilizadas na elicitacao

As principais fontes consideradas foram:

- [GDD](../gdd.md), como base conceitual e criativa;
- formulario exploratorio aplicado ao publico-alvo;
- diretrizes academicas e estrutura de documentacao adotadas na disciplina.

A partir dessas bases, os requisitos do projeto foram identificados, organizados e posteriormente detalhados nos demais artefatos de modelagem.

## 4. Tecnicas empregadas

### 4.1 Questionario exploratorio

A primeira tecnica utilizada foi um questionario aplicado de forma remota por formulario digital. As perguntas foram construidas para explorar expectativas em torno de jogos narrativos contemplativos, incluindo temas como atmosfera, exploracao, progressao, diario de memorias e experiencias sensoriais em jogos.

O formulario foi direcionado a participantes com perfil proximo ao publico-alvo do projeto, especialmente pessoas interessadas em jogos narrativos, experiencias artisticas interativas e temas introspectivos.

Embora a coleta tenha tido alcance menor do que o inicialmente desejado, ela ainda gerou insumos uteis. As respostas aproveitadas variaram de uma a tres por pergunta, pois parte do material recebido era vaga demais para sustentar analise mais consistente. Mesmo assim, o questionario ajudou a identificar percepcoes relevantes sobre:

- valorizacao da atmosfera acima da mecanica tradicional;
- aceitacao de uma progressao mais lenta e contemplativa;
- importancia de evitar punicoes sistemicas pesadas;
- interesse por diario de memorias e exploracao simbolica.

O formulario completo e as respostas coletadas devem permanecer registrados no apendice do trabalho, funcionando como evidencia complementar da elicitacao.

### 4.2 Introspeccao estruturada do designer

A segunda tecnica central foi a introspeccao estruturada do designer, entendida como um processo reflexivo em que o proprio autor do sistema, por deter conhecimento especializado sobre o dominio e sobre os objetivos do projeto, atua como fonte legitima de requisitos.

No caso de **Ani**, essa introspeccao foi particularmente importante porque o projeto possui natureza autoral e depende fortemente de coerencia entre proposta filosofica, atmosfera, mecanicas e experiencia desejada. Nesse processo, o autor avaliou sistematicamente quais funcionalidades, comportamentos e restricoes o sistema precisaria apresentar para tornar a proposta realizavel.

O [GDD](../gdd.md) funcionou como principal base dessa etapa, pois consolidou a direcao criativa, filosofica e mecanica do jogo. A partir dele, foi possivel derivar requisitos relacionados a:

- progressao por cinco atos;
- diario de memorias como elemento central;
- ausencia de combate e de moralidade binaria;
- interacao com objetos significativos;
- uso de restauracao, contemplacao e memoria como eixos de experiencia.

### 4.3 Modelagem incremental e analise documental

Depois do levantamento inicial por questionario e introspeccao, os requisitos foram amadurecidos por meio da producao dos artefatos de engenharia de software. Essa etapa funcionou como mecanismo de validacao e refinamento:

- requisitos originaram casos de uso;
- casos de uso influenciaram o diagrama de classes;
- o diagrama de classes ajudou a refinar o DER;
- inconsistencias encontradas entre artefatos geraram ajustes nos requisitos.

## 5. Stakeholders considerados

### 5.1 Autor do projeto

Atua como stakeholder primario, sendo responsavel pela concepcao do jogo, pela definicao de sua identidade e pela derivacao principal dos requisitos.

### 5.2 Orientador academico

Atua como referencia metodologica para a organizacao da documentacao e para a consistencia academica do trabalho.

### 5.3 Publico-alvo / participantes do questionario

Contribuem como fonte exploratoria de percepcao e como referencia de experiencia de uso, oferecendo indicacoes sobre atmosfera, ritmo, interacao, acessibilidade e coerencia da jornada proposta pelo sistema.

## 6. Principais temas levantados

Durante a elicitacao, os seguintes temas apareceram como centrais:

- movimentacao e exploracao lateral;
- interacao com objetos significativos;
- registro de memorias em diario;
- progressao por cinco atos;
- ausencia de combate como eixo principal;
- persistencia de progresso por save local;
- uso de objetos restauraveis, objetos de memoria e elementos contemplativos;
- necessidade de coerencia entre narrativa, classes e estrutura de dados.

Tambem surgiram, a partir das respostas uteis do questionario, indicacoes de que a experiencia deveria privilegiar:

- atmosfera acima da recompensa mecanica tradicional;
- ritmo mais reflexivo;
- baixa presenca de punicao sistemica;
- coerencia sensorial entre narrativa e exploracao.

## 7. Resultado do processo de elicitacao

Como resultado, o projeto passou a ter base suficiente para consolidar:

- requisitos funcionais;
- requisitos nao funcionais;
- regras de negocio;
- casos de uso;
- diagrama de classes;
- diagrama entidade-relacionamento.

Isso mostra que a elicitacao nao ficou restrita a uma etapa isolada, mas serviu como fundamento para todos os artefatos posteriores do projeto.

## 8. Consideracoes finais

No contexto de **Ani**, a elicitacao de requisitos foi mais do que uma coleta inicial de ideias. Ela funcionou como um processo de descoberta e refinamento progressivo, necessario para transformar uma proposta criativa em uma estrutura de software documentada e coerente.

A combinacao entre questionario exploratorio, introspeccao estruturada do designer e modelagem incremental permitiu estabelecer um conjunto consistente de necessidades, restricoes e direcoes de desenvolvimento. Mesmo com um numero reduzido de respostas efetivamente aproveitadas no formulario, a tecnica contribuiu como apoio exploratorio, enquanto a introspeccao e o GDD sustentaram a derivacao principal dos requisitos do sistema.
