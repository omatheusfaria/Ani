# Documentação da Elicitação de Requisitos

## 1. Objetivo

Este documento registra como os requisitos do projeto **Ani** foram levantados, refinados e organizados ao longo da fase de estruturação acadêmica. O objetivo não é apenas listar requisitos finais, mas explicitar o processo que levou à sua identificação.

## 2. Contexto do projeto

**Ani** é um side-scroller narrativo contemplativo, com foco em progressão por atos filosóficos, exploração de memórias, diário diegético e interações simbólicas com o mundo do jogo. Por ser um projeto autoral em desenvolvimento acadêmico, a elicitação de requisitos ocorreu de modo iterativo, combinando consulta exploratória ao público-alvo com introspecção estruturada do designer e consolidação documental.

## 3. Fontes utilizadas na elicitação

As principais fontes consideradas foram:

- [GDD](../gdd.md), como base conceitual e criativa;
- formulário exploratório aplicado ao público-alvo;
- diretrizes acadêmicas e estrutura de documentação adotadas na disciplina.

A partir dessas bases, os requisitos do projeto foram identificados, organizados e posteriormente detalhados nos demais artefatos de requisitos e modelagem.

## 4. Técnicas empregadas

### 4.1 Questionário exploratório

A primeira técnica utilizada foi um questionário aplicado de forma remota por formulário digital. As perguntas foram construídas para explorar expectativas em torno de jogos narrativos contemplativos, incluindo temas como atmosfera, exploração, progressão, diário de memórias e experiências sensoriais em jogos.

O formulário foi direcionado a participantes com perfil próximo ao público-alvo do projeto, especialmente pessoas interessadas em jogos narrativos, experiências artísticas interativas e temas introspectivos.

Embora a coleta tenha tido alcance menor do que o inicialmente desejado, ela ainda gerou insumos úteis. As respostas aproveitadas variaram de uma a três por pergunta, pois parte do material recebido era vaga demais para sustentar análise mais consistente. Nesses casos, apenas as contribuições com conteúdo aproveitável foram selecionadas e sintetizadas. Mesmo assim, o questionário ajudou a identificar percepções relevantes sobre:

- valorização da atmosfera acima da mecânica tradicional;
- aceitação de uma progressão mais lenta e contemplativa;
- importância de evitar punições sistêmicas pesadas;
- interesse por diário de memórias e exploração simbólica.

Neste projeto não foram realizadas visitas técnicas nem entrevistas formais presenciais. O levantamento concentrou-se no questionário e na introspecção estruturada, por serem as técnicas mais adequadas ao escopo autoral e ao contexto acadêmico do trabalho.

As perguntas do formulário e as respostas selecionadas e anonimizadas encontram-se no Apêndice A, disponível em [apendice-questionario.md](./apendice-questionario.md), funcionando como evidência complementar da elicitação.

### 4.2 Introspecção estruturada do designer

A segunda técnica central foi a introspecção estruturada do designer, entendida como um processo reflexivo em que o próprio autor do sistema, por deter conhecimento especializado sobre o domínio e sobre os objetivos do projeto, atua como fonte legítima de requisitos.

No caso de **Ani**, essa introspecção foi particularmente importante porque o projeto possui natureza autoral e depende fortemente de coerência entre proposta filosófica, atmosfera, mecânicas e experiência desejada. Nesse processo, o autor avaliou sistematicamente quais funcionalidades, comportamentos e restrições o sistema precisaria apresentar para tornar a proposta realizável.

O [GDD](../gdd.md) funcionou como principal base dessa etapa, pois consolidou a direção criativa, filosófica e mecânica do jogo. A partir dele, foi possível derivar requisitos relacionados a:

- progressão por cinco atos;
- diário de memórias como elemento central;
- ausência de combate e de moralidade binária;
- interação com objetos significativos;
- uso de restauração, contemplação e memória como eixos de experiência.

### 4.3 Refinamento por modelagem e documentação

Depois do levantamento inicial por questionário e introspecção, os requisitos foram amadurecidos por meio da produção dos artefatos de engenharia de software. Essa etapa não funcionou como fonte primária da elicitação, mas como mecanismo posterior de validação e refinamento:

- requisitos originaram casos de uso;
- casos de uso influenciaram o diagrama de classes;
- o diagrama de classes ajudou a refinar o DER;
- inconsistências encontradas entre artefatos geraram ajustes nos requisitos.

## 5. Stakeholders considerados

### 5.1 Autor do projeto

Atua como stakeholder primário, sendo responsável pela concepção do jogo, pela definição de sua identidade e pela derivação principal dos requisitos.

### 5.2 Orientador acadêmico

Atua como referência metodológica para a organização da documentação e para a consistência acadêmica do trabalho.

### 5.3 Público-alvo / participantes do questionário

Contribuem como fonte exploratória de percepção e como referência de experiência de uso, oferecendo indicações sobre atmosfera, ritmo, interação, acessibilidade e coerência da jornada proposta pelo sistema.

## 6. Principais temas levantados

Durante a elicitação, os seguintes temas apareceram como centrais:

- movimentação e exploração lateral;
- interação com objetos significativos;
- registro de memórias em diário;
- progressão por cinco atos;
- ausência de combate como eixo principal;
- persistência de progresso por save local;
- uso de objetos restauráveis, objetos de memória e elementos contemplativos;
- necessidade de coerência entre narrativa, classes e estrutura de dados.

Também surgiram, a partir das respostas úteis do questionário, indicações de que a experiência deveria privilegiar:

- atmosfera acima da recompensa mecânica tradicional;
- ritmo mais reflexivo;
- baixa presença de punição sistêmica;
- coerência sensorial entre narrativa e exploração.

## 7. Resultado do processo de elicitação

Como resultado, o projeto passou a ter base suficiente para consolidar:

- requisitos funcionais;
- requisitos não funcionais;
- regras de negócio;
- casos de uso;
- diagrama de classes;
- diagrama entidade-relacionamento.

Isso mostra que a elicitação não ficou restrita a uma etapa isolada, mas serviu como fundamento para todos os artefatos posteriores do projeto.

## 8. Especificações textuais derivadas da elicitação

Como forma de apresentar textualmente parte das especificações obtidas no levantamento, o Quadro 1 apresenta histórias de usuário derivadas do questionário exploratório e da introspecção estruturada.

## Quadro 1 - Histórias de usuário derivadas da elicitação

| Código | História de usuário | Origem principal |
| --- | --- | --- |
| US01 | Como jogador, quero explorar cenários com movimentação fluida e controles responsivos para que a imersão não seja quebrada por problemas técnicos. | Questionário e introspecção |
| US02 | Como jogador, quero que a arte e a trilha sonora acompanhem a atmosfera emocional da jornada para que o jogo comunique sentimentos sem depender apenas de texto. | Questionário |
| US03 | Como jogador, quero uma experiência contemplativa e interpretativa para que o jogo gere reflexão e impacto emocional duradouro. | Questionário |
| US04 | Como jogador, quero perceber transformações no mundo ao longo dos atos para que a progressão narrativa e sensorial seja significativa. | Introspecção e GDD |
| US05 | Como jogador, quero interagir com elementos simbólicos do cenário para que a jornada de Ani seja compreendida pela exploração e não apenas por exposição direta. | Introspecção e GDD |

Essas histórias de usuário não substituem os requisitos funcionais e não funcionais formalizados nas seções posteriores do trabalho, mas ajudam a demonstrar de forma textual como as expectativas levantadas na elicitação foram traduzidas em necessidades do sistema.

## 9. Considerações finais

No contexto de **Ani**, a elicitação de requisitos foi mais do que uma coleta inicial de ideias. Ela funcionou como um processo de descoberta e refinamento progressivo, necessário para transformar uma proposta criativa em uma estrutura de software documentada e coerente.

A combinação entre questionário exploratório, introspecção estruturada do designer e modelagem incremental permitiu estabelecer um conjunto consistente de necessidades, restrições e direções de desenvolvimento. Mesmo com um número reduzido de respostas efetivamente aproveitadas no formulário, a técnica contribuiu como apoio exploratório, enquanto a introspecção e o GDD sustentaram a derivação principal dos requisitos do sistema.
