# Termo de Abertura do Projeto

## 1. Identificação do Projeto

| Item | Descrição |
| --- | --- |
| Nome do projeto | Ani אֲנִי |
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

O projeto é conduzido segundo a metodologia Cascata (Waterfall), com fases sequenciais e dependentes: levantamento de requisitos, modelagem, design de sistemas e implementação.

A modelagem utiliza BPMN para representação dos fluxos de gameplay e UML para casos de uso e estrutura do sistema, garantindo rastreabilidade entre as decisões conceituais do GDD e as decisões técnicas do protótipo.

As tecnologias e ferramentas utilizadas no protótipo são:

- HTML, CSS e JavaScript (módulos ES, sem etapa de build) para a estrutura, a interface e a lógica do jogo;
- Three.js para a renderização 3D dos cenários sobre WebGL, com pós-processamento próprio para a estética de pixel art;
- Web Audio API para os sons, sintetizados em tempo de execução;
- Sprite Fusion e GPT-6 para a geração das folhas de sprites e scripts em Python (NumPy e Pillow) para o recorte e o ajuste dessas folhas;
- Claude Opus 5.5 para a modelagem 3D dos cenários em Three.js;
- GitHub Actions e GitHub Pages para a verificação e a publicação do protótipo.

O jogo completo será desenvolvido na Unreal Engine 5.4.4, com C++, como software para PC. Para o protótipo, em vez da Unreal Engine, adotou-se essa base web, executada no navegador, que também torna a apresentação mais simples. O principal motivo foi o tempo disponível para o desenvolvimento: após análise, concluiu-se que, no prazo do projeto, o Three.js era a tecnologia mais adequada para o protótipo. A produção do protótipo contou com apoio de IA generativa: o GPT-6, ao lado do Sprite Fusion, na geração dos sprites, e o Claude Opus 5.5 na modelagem 3D dos cenários.

## 7. Escopo

### Escopo Incluído

- concepção de um jogo narrativo contemplativo estruturado em cinco atos filosóficos;
- exploração lateral do quarto de Ani e de ambientes de memória, simbólicos e fragmentados;
- interação com objetos de memória, fragmentos narrativos e elementos contemplativos;
- diário de memórias como sistema central de registro e leitura;
- mecânicas principais por ato, como peso literal, ecos de decisão, restauração por aceitação e contemplação ativa;
- construção de atmosfera visual e sonora coerente com a jornada filosófica de Ani;
- desenvolvimento de um protótipo funcional para PC, executado no navegador, com o início do Ato I (cerca de dez minutos de jogo).

### Conteúdo do Protótipo

O protótipo demonstra parte do design e das mecânicas do jogo por meio do início do Ato I:

- o celular de Ani em primeira pessoa, com um aplicativo de rede social em que ela acompanha o perfil de Malu;
- a exploração do quarto em visão lateral, com luz e escuro, interruptor, luminária de plasma, inspeção de objetos em primeira pessoa e a gaveta onde está a tirinha de fotos;
- a memória do parque de diversões, um ano antes, ao lado de Malu, com conversas, barracas e a volta na roda-gigante;
- minigames nas barracas do parque (estoure o balão, derrube as latas e pescaria), únicos momentos do jogo com placar e interface própria;
- comidas compradas nas barracas (algodão-doce, pipoca, churros e maçã do amor), que acabam aos poucos, mordida a mordida.

### Escopo Não Incluído

- lançamento comercial do jogo;
- versão final completa com todo o conteúdo planejado, refinado e polido;
- no protótipo, o diário de memórias, as mecânicas por ato e os Atos II a V, que permanecem na concepção do jogo;
- portabilidade efetiva para consoles e dispositivos móveis;
- produção final de todos os assets artísticos e sonoros definitivos.

## 8. Principais Entregas

- conceito consolidado de **Ani** como jogo narrativo contemplativo;
- documentação funcional e estrutural de apoio ao desenvolvimento;
- modelagem dos principais fluxos e interações do sistema;
- protótipo jogável do início do Ato I (cerca de dez minutos de jogo), executado no navegador e publicado no GitHub Pages;
- base técnica e conceitual para evolução futura do projeto.

## 9. Stakeholders

| Stakeholder | Papel |
| --- | --- |
| Autor do projeto | Responsável pela concepção, direção criativa e desenvolvimento |
| Orientador acadêmico | Responsável pelo acompanhamento metodológico e orientação do projeto |
| Banca avaliadora | Responsável pela análise crítica e avaliação da proposta |
| Jogador final | Público que vivencia a experiência interativa proposta |

## 10. Público-Alvo do Produto

O projeto é direcionado principalmente a pessoas entre 16 e 28 anos interessadas em:

- jogos narrativos e contemplativos;
- experiências artísticas interativas;
- temas ligados à filosofia, subjetividade e simbolismo;
- obras com atmosfera melancólica, reflexiva e interpretativa.

## 11. Premissas

- o projeto será desenvolvido inicialmente como experiência para PC;
- a direção conceitual atual do GDD será a principal referência para as próximas etapas;
- o protótipo priorizará a experiência central do jogo em vez de uma versão extensa de conteúdo;
- a proposta visual, sonora e mecânica poderá ser refinada conforme os testes e a maturação do projeto;
- a implementação buscará traduzir a jornada filosófica em interação jogável e atmosfera sensível.

## 12. Restrições

- tempo limitado para desenvolvimento e refinamento do protótipo, que levou à adoção de uma base web (Three.js) para o protótipo, mais rápida de produzir e de apresentar;
- escopo sujeito a ajustes conforme viabilidade técnica e maturação da proposta;
- recursos artísticos e sonoros ainda em fase de definição e produção;
- necessidade de concentrar esforços na experiência central do jogo antes da expansão de conteúdo.

## 13. Riscos Iniciais

| Risco | Impacto |
| --- | --- |
| Mudanças conceituais frequentes na direção do jogo | Retrabalho em design, sistemas e implementação |
| Escopo excessivamente amplo para o tempo disponível | Comprometimento da qualidade do protótipo |
| Dependência de assets visuais e sonoros ainda não finalizados | Atraso na consolidação da atmosfera desejada |
| Dificuldade em transformar filosofia em mecânicas claras | Distanciamento entre proposta conceitual e experiência jogável |
| Excesso de abstração narrativa | Redução da compreensão e do engajamento do jogador |
| Necessidade de trocar de tecnologia por falta de tempo | Retrabalho na base técnica do protótipo e na documentação |
| Dependência de IA generativa na produção dos sprites | Inconsistências entre quadros e personagens, que exigem correção por scripts próprios |
| Desempenho do protótipo no navegador em placas de vídeo modestas | Queda de quadros por segundo e perda da atmosfera pretendida |
| Limitações impostas pelo navegador (tela cheia só após um clique, suporte variável a controles) | Experiência menos imersiva ou controles indisponíveis em alguns navegadores |
| Progresso salvo no armazenamento do navegador | Perda do progresso se o jogador limpar os dados do navegador |

## 14. Cronograma Macro

1. Consolidação da direção conceitual, filosófica e estética do jogo.
2. Definição dos sistemas centrais, requisitos e fluxos de interação.
3. Modelagem estrutural e organização da base técnica do projeto.
4. Implementação das mecânicas principais e da navegação da experiência.
5. Integração de atmosfera visual, sonora e narrativa.
6. Refinamento do protótipo jogável.

## 15. Critério de Sucesso

O projeto será considerado bem-sucedido se conseguir entregar um protótipo funcional capaz de expressar com clareza a proposta central de **Ani**: uma jornada contemplativa, simbólica e interativa de transformação interior, coerente em suas mecânicas, atmosfera e identidade visual.
