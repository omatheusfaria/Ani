# TAP

O Termo de Abertura do Projeto (TAP), equivalente ao *project charter*, é o documento que formaliza a existência do projeto e registra, em nível gerencial, sua finalidade, objetivos, escopo inicial, principais partes interessadas, premissas, restrições e critérios de sucesso. Em termos de gestão, ele funciona como a base que autoriza o início do trabalho e orienta as decisões das etapas seguintes [1][2].

A importância do TAP está em alinhar expectativas entre os envolvidos desde o começo do projeto. Ao consolidar propósito, limites, entregas e responsabilidades em um único artefato, o documento reduz ambiguidades, facilita a comunicação entre stakeholders e serve como referência para acompanhamento do projeto ao longo de sua execução [1][2].

O Quadro 1 apresenta o Termo de Abertura do Projeto **Ani**. A versão editável desse artefato também está disponível em [tap.md](./tap.md).

## Quadro 1 - Termo de Abertura do Projeto Ani

## 1. Identificação do Projeto

| Item | Descrição |
| --- | --- |
| Nome do projeto | Ani |
| Tipo | Jogo digital narrativo contemplativo |
| Área | Desenvolvimento de software e jogos digitais |
| Plataforma inicial | PC (Windows), como software instalado; o protótipo é executado no navegador |
| Motor de jogo | Jogo completo: Unreal Engine 5.4.4; protótipo: Three.js (biblioteca 3D sobre WebGL) |
| Linguagem principal | Jogo completo: C++; protótipo: JavaScript, com HTML e CSS |
| Natureza do projeto | Projeto autoral com finalidade acadêmica e prototipação, com apoio de ferramentas de IA generativa na produção dos sprites e na modelagem 3D do protótipo |

## 2. Problema de Pesquisa

De que forma o design de um jogo narrativo pode representar eficazmente uma jornada filosófica de transformação interior e a construção da identidade de um personagem?

## 3. Objetivo Geral

Conceber um jogo narrativo contemplativo que represente, por meio de sistemas, mecânicas e linguagem visual, uma jornada filosófica de transformação interior estruturada em cinco atos, do pessimismo existencial à contemplação, e desenvolver um protótipo funcional do início do Ato I, com cerca de dez minutos de jogo, que demonstre parte do design e das mecânicas propostos, aplicando práticas de engenharia de software no planejamento e na construção do projeto.

## 4. Objetivos Específicos

- consolidar a direção conceitual e filosófica do jogo por meio do Game Design Document (GDD);
- levantar, classificar e documentar os requisitos funcionais, não funcionais e regras de negócio do sistema;
- modelar os fluxos principais do jogo utilizando BPMN e casos de uso;
- projetar sistemas e mecânicas que traduzam, em interação, cada etapa da jornada filosófica de Ani;
- implementar um protótipo funcional do início do Ato I, com cerca de dez minutos de jogo, coerente com a documentação produzida.

## 5. Justificativa

Jogos digitais constituem um meio singular para explorar experiências internas e subjetivas: a interatividade permite que o jogador não apenas observe uma jornada, mas a habite ativamente, vivenciando estados emocionais, percepções e transformações de dentro para fora. Essa capacidade imersiva distingue o jogo de outras mídias narrativas e o torna especialmente adequado para representar processos internos complexos, como identidade, sofrimento e transformação filosófica.

**Ani** parte dessa premissa para investigar como a filosofia pode funcionar como linguagem acessível dentro de um jogo narrativo. Correntes como o pessimismo existencial de Zapffe e Mainländer e filosofias contemplativas japonesas, como Wabi-Sabi, Mono no Aware e Yugen, carregam ideias densas que, quando traduzidas em espaço, mecânica e atmosfera, tornam-se experienciáveis sem depender de mediação teórica.

O jogo se torna, assim, não um veículo de ensino da filosofia, mas um modo de sentir o que ela descreve.

## 6. Metodologia / Tecnologias

O projeto é conduzido segundo a metodologia Cascata (*Waterfall*), com fases sequenciais e dependentes: levantamento de requisitos, modelagem, design de sistemas e implementação.

A modelagem utiliza BPMN para representação dos fluxos de *gameplay* e UML para casos de uso e estrutura do sistema, garantindo rastreabilidade entre as decisões conceituais do GDD e as decisões técnicas do protótipo.

As tecnologias e ferramentas utilizadas no protótipo são:

- HTML, CSS e JavaScript (módulos ES, sem etapa de build) para a estrutura, a interface e a lógica do jogo;
- Three.js para a renderização 3D dos cenários sobre WebGL, com pós-processamento próprio para a estética de pixel art;
- Web Audio API para os sons, sintetizados em tempo de execução;
- Sprite Fusion e GPT-6 para a geração das folhas de sprites e scripts em Python (NumPy e Pillow) para o recorte e o ajuste dessas folhas;
- Claude Opus 5.5 para a modelagem 3D dos cenários em Three.js;
- GitHub Actions e GitHub Pages para a verificação e a publicação do protótipo.

O jogo completo será desenvolvido na Unreal Engine 5.4.4, com C++, como software para PC. Para o protótipo, em vez da Unreal Engine, adotou-se essa base web, executada no navegador, que também torna a apresentação mais simples. O principal motivo foi o tempo disponível para o desenvolvimento: após análise, concluiu-se que, no prazo do projeto, o Three.js era a tecnologia mais adequada para o protótipo. A produção do protótipo contou com apoio de IA generativa: o GPT-6, ao lado do Sprite Fusion, na geração dos sprites, e o Claude Opus 5.5 na modelagem 3D dos cenários.

O documento completo do TAP está disponível em [tap.md](./tap.md).

## Referências

[1] PROJECT MANAGEMENT INSTITUTE. *The charter - selling your project*. Disponível em: <https://www.pmi.org/learning/library/charter-selling-project-7473>. Acesso em: 22.mar.2026.

[2] ATLASSIAN. *Project charter vs. project poster: key differences*. Disponível em: <https://www.atlassian.com/work-management/project-management/project-planning/project-charter>. Acesso em: 22.mar.2026.
