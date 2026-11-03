# Documentação da Elicitação de Requisitos

## 1. Objetivo

Este documento registra como os requisitos do projeto **Ani** foram levantados, refinados e organizados ao longo da fase de estruturação acadêmica. O objetivo não é apenas listar requisitos finais, mas explicitar o processo que levou à sua identificação.

## 2. Contexto do projeto

**Ani** é um side-scroller narrativo contemplativo, com foco em progressão por atos filosóficos, exploração de memórias, diário diegético e interações simbólicas com o mundo do jogo. Por ser um projeto autoral em desenvolvimento acadêmico, a elicitação de requisitos ocorreu de modo iterativo, apoiando-se principalmente na análise documental do GDD e na introspecção estruturada do designer; um questionário exploratório aplicado ao público-alvo teve baixo aproveitamento.

## 3. Fontes utilizadas na elicitação

As principais fontes consideradas foram:

- [GDD](../gdd.md), como base conceitual e criativa e principal fonte de requisitos;
- formulário exploratório aplicado ao público-alvo, de baixo aproveitamento;
- diretrizes acadêmicas e estrutura de documentação adotadas na disciplina.

A partir dessas bases, os requisitos do projeto foram identificados, organizados e posteriormente detalhados nos demais artefatos de requisitos e modelagem.

## 4. Técnicas empregadas

### 4.1 Questionário exploratório

Foi aplicado, de forma remota, um questionário por formulário digital a 8 participantes com perfil próximo ao público-alvo do projeto. O formulário tinha cinco perguntas: o que atrai o participante em um jogo narrativo, e o que ele espera quanto à fluidez e à programação, às mecânicas, à arte e ao design, e à história e ao significado.

As respostas foram, em geral, vagas e não geraram mecânicas nem decisões de design. As que tinham algum conteúdo aproveitável (de uma a três por pergunta) foram resumidas e anonimizadas. Por esse baixo aproveitamento, nenhum requisito do projeto tem o questionário como fonte, e a especificação se apoiou principalmente na análise documental do GDD e na introspecção estruturada (seção 4.2).

Neste projeto não foram realizadas visitas técnicas nem entrevistas formais presenciais.

As perguntas do formulário e os resumos das respostas selecionadas encontram-se no Apêndice A, disponível em [apendice-questionario.md](./apendice-questionario.md). Os resumos não são transcrições: as respostas originais não foram preservadas.

### 4.2 Introspecção estruturada do designer

A técnica central, junto com a análise documental do GDD, foi a introspecção estruturada do designer, entendida como um processo reflexivo em que o próprio autor do sistema, por deter conhecimento especializado sobre o domínio e sobre os objetivos do projeto, atua como fonte legítima de requisitos.

No caso de **Ani**, essa introspecção foi particularmente importante porque o projeto possui natureza autoral e depende fortemente de coerência entre proposta filosófica, atmosfera, mecânicas e experiência desejada. Nesse processo, o autor avaliou sistematicamente quais funcionalidades, comportamentos e restrições o sistema precisaria apresentar para tornar a proposta realizável.

O [GDD](../gdd.md) funcionou como principal base dessa etapa, pois consolidou a direção criativa, filosófica e mecânica do jogo. A partir dele, foi possível derivar requisitos relacionados a:

- progressão por cinco atos;
- diário de memórias como elemento central;
- ausência de combate e de moralidade binária;
- interação com objetos significativos;
- uso de restauração, contemplação e memória como eixos de experiência.

### 4.3 Refinamento por modelagem e documentação

Depois do levantamento inicial por análise documental e introspecção, os requisitos foram amadurecidos por meio da produção dos artefatos de engenharia de software. Essa etapa não funcionou como fonte primária da elicitação, mas como mecanismo posterior de validação e refinamento:

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

Responderam ao questionário exploratório. Suas respostas, em geral vagas, foram registradas em resumo no Apêndice A e não geraram mecânicas nem decisões de design.

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

Como forma de apresentar textualmente parte das especificações obtidas no levantamento, o Quadro 1 apresenta histórias de usuário derivadas da análise documental do GDD e da introspecção estruturada.

## Quadro 1 - Histórias de usuário derivadas da elicitação

| Código | História de usuário | Origem principal |
| --- | --- | --- |
| US01 | Como jogador, quero explorar cenários com movimentação fluida e controles responsivos para que a imersão não seja quebrada por problemas técnicos. | Introspecção e GDD |
| US02 | Como jogador, quero que a arte e a trilha sonora acompanhem a atmosfera emocional da jornada para que o jogo comunique sentimentos sem depender apenas de texto. | GDD |
| US03 | Como jogador, quero uma experiência contemplativa e interpretativa para que o jogo gere reflexão e impacto emocional duradouro. | GDD |
| US04 | Como jogador, quero perceber transformações no mundo ao longo dos atos para que a progressão narrativa e sensorial seja significativa. | Introspecção e GDD |
| US05 | Como jogador, quero interagir com elementos simbólicos do cenário para que a jornada de Ani seja compreendida pela exploração e não apenas por exposição direta. | Introspecção e GDD |

Essas histórias de usuário não substituem os requisitos funcionais e não funcionais formalizados nas seções posteriores do trabalho, mas ajudam a demonstrar de forma textual como as expectativas levantadas na elicitação foram traduzidas em necessidades do sistema.

## 9. Considerações finais

No contexto de **Ani**, a elicitação de requisitos foi mais do que uma coleta inicial de ideias. Ela funcionou como um processo de descoberta e refinamento progressivo, necessário para transformar uma proposta criativa em uma estrutura de software documentada e coerente.

A combinação entre análise documental do GDD, introspecção estruturada do designer e modelagem incremental permitiu estabelecer um conjunto consistente de necessidades, restrições e direções de desenvolvimento. O questionário exploratório, por ter tido baixo aproveitamento, não serviu de fonte para os requisitos do sistema.
