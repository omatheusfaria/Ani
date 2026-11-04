# Recursos Utilizados

Esta seção apresenta as principais ferramentas e métodos utilizados no projeto **Ani**, conforme a exigência do modelo de TG. As ferramentas foram selecionadas com base em adequação técnica, familiaridade de uso, qualidade da documentação oficial e compatibilidade com a proposta de um protótipo acadêmico de jogo digital narrativo.

## Ferramentas e Métodos

No projeto **Ani**, as ferramentas adotadas atendem tanto à construção do protótipo quanto à produção dos artefatos de Engenharia de Software. Em conjunto, elas viabilizam a implementação do jogo, a modelagem dos diagramas, a documentação textual e o versionamento do trabalho [1][2][3][4][5][6][7][8].

O Quadro 1 apresenta as principais ferramentas utilizadas no projeto, com suas versões de referência, tipo de licença e site oficial.

## Quadro 1 - Ferramentas utilizadas no projeto Ani

| Ferramenta | Versão de referência | Tipo de licença | Finalidade principal | Site oficial |
| --- | --- | --- | --- | --- |
| Unreal Engine | 5.4.4 | Unreal Engine EULA (Epic Games), com uso gratuito até o limite de receita do contrato | Desenvolvimento do protótipo jogável | <https://www.unrealengine.com/> |
| C++ | C++20 (padrão da Unreal Engine 5.4) | Norma ISO/IEC 14882; o compilador MSVC segue a licença do Visual Studio Build Tools | Implementação da lógica do jogo | <https://isocpp.org/> |

| Visual Studio Code | 1.145.0 | Licença de software da Microsoft (código-fonte Code - OSS sob MIT) | IDE para o código C++ e a documentação | <https://code.visualstudio.com/> |

| Visual Studio Build Tools (MSVC) | [preencher] | Termos de licença do Microsoft Visual Studio Build Tools | Compilador C++ e ferramentas de build da Unreal no Windows | <https://visualstudio.microsoft.com/visual-cpp-build-tools/> |
| draw.io / diagrams.net | 29.6.5 | Apache 2.0 | Modelagem de diagramas UML, DER e artefatos visuais | <https://www.diagrams.net/> |
| Markdown | Sintaxe padrão de Markdown | Formato aberto | Redação da documentação técnica do projeto | <https://daringfireball.net/projects/markdown/> |
| Git | 2.48.1.windows.1 | GPLv2 | Controle de versão local | <https://git-scm.com/> |
| GitHub | Não se aplica (plataforma web) | Proprietária, com uso gratuito e pago | Hospedagem do repositório e sincronização do projeto | <https://github.com/> |

O Quadro 2 apresenta a justificativa de uso de cada ferramenta no contexto do projeto.

## Quadro 2 - Justificativa das ferramentas do projeto Ani

| Ferramenta | Justificativa |
| --- | --- |
| Unreal Engine | Foi escolhida por oferecer um ecossistema consolidado para jogos com ambientes 3D estilizados, câmera lateral, iluminação, efeitos visuais e recursos suficientes para prototipação de interação, cenário, interface e persistência. |
| Visual Studio Code | Foi adotado como IDE por ser leve e integrar-se aos projetos da Unreal Engine pela geração de arquivos de projeto para VS Code. |
| Visual Studio Build Tools (MSVC) | Fornece o compilador MSVC que a Unreal Engine exige no Windows, sem a IDE completa do Visual Studio. |
| C++ | Foi adotada por ser a linguagem principal de programação da Unreal Engine e por permitir uma estruturação modular e orientada a objetos da lógica de gameplay, estados e sistemas do projeto. |
| draw.io / diagrams.net | Foi utilizada para produzir os diagramas de caso de uso, classes e entidade-relacionamento, facilitando a padronização visual dos artefatos exigidos no TG. |
| Markdown | Foi utilizado para redigir e organizar a documentação textual do projeto de forma leve, rastreável e compatível com o repositório. |
| Git | Foi adotado para registrar o histórico de alterações, apoiar o controle de versão e reduzir o risco de perda de trabalho durante a evolução do projeto. |
| GitHub | Foi utilizado para centralizar o repositório remoto, apoiar a publicação da documentação e manter sincronização entre as versões locais e publicadas. |

A execução do projeto seguiu uma abordagem compatível com a metodologia apresentada no TAP. Primeiro, foram definidos o problema, os objetivos e a base conceitual do jogo. Em seguida, foram conduzidas a elicitação de requisitos, a especificação dos requisitos funcionais, não funcionais e regras de negócio, e a modelagem dos principais artefatos de Engenharia de Software. Somente após essa consolidação documental foi estruturada a base técnica do protótipo na engine escolhida.

No desenvolvimento da interface e da experiência do jogo, o método adotado foi o de prototipação incremental orientada por artefatos. Isso significa que cada elemento implementado deve manter coerência com os requisitos, com os casos de uso, com o diagrama de classes e com a modelagem de persistência anteriormente definida. Essa organização favorece a rastreabilidade entre concepção, modelagem e implementação.

Os arquivos-fonte dos diagramas produzidos no projeto podem ser consultados nas respectivas pastas da documentação, com destaque para:

- [bpmn/ani.bpmn](../bpmn/ani.bpmn)
- [casos-de-uso/caso-de-uso.drawio.svg](../casos-de-uso/caso-de-uso.drawio.svg)
- [diagrama-de-classe/diagrama-de-classe.drawio](../diagrama-de-classe/diagrama-de-classe.drawio)
- [diagrama-entidade-relacionamento/diagrama-entidade-relacionamento.drawio](../diagrama-entidade-relacionamento/diagrama-entidade-relacionamento.drawio)

## Referências

[1] EPIC GAMES. *Unreal Engine*. Disponível em: <https://www.unrealengine.com/>. Acesso em: 26.mar.2026.

[2] ISO C++ FOUNDATION. *Standard C++*. Disponível em: <https://isocpp.org/>. Acesso em: 26.mar.2026.

[3] JGRAPH LTD. *draw.io / diagrams.net*. Disponível em: <https://www.diagrams.net/>. Acesso em: 26.mar.2026.

[4] GRUBER, John. *Markdown*. Disponível em: <https://daringfireball.net/projects/markdown/>. Acesso em: 26.mar.2026.

[5] SOFTWARE FREEDOM CONSERVANCY. *Git*. Disponível em: <https://git-scm.com/>. Acesso em: 26.mar.2026.

[6] GITHUB. *GitHub*. Disponível em: <https://github.com/>. Acesso em: 26.mar.2026.

[7] MICROSOFT. *Visual Studio Code*. Disponível em: <https://code.visualstudio.com/>. Acesso em: 04.nov.2026.

[8] MICROSOFT. *Microsoft C++ Build Tools*. Disponível em: <https://visualstudio.microsoft.com/visual-cpp-build-tools/>. Acesso em: 04.nov.2026.
