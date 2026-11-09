# Recursos Utilizados

Esta seção apresenta as principais ferramentas e métodos utilizados no projeto **Ani**, conforme a exigência do modelo de TG. As ferramentas foram selecionadas com base em adequação técnica, familiaridade de uso, qualidade da documentação oficial e compatibilidade com a proposta de um protótipo acadêmico de jogo digital narrativo.

## Ferramentas e Métodos

No projeto **Ani**, as ferramentas adotadas atendem tanto à construção do protótipo quanto à produção dos artefatos de Engenharia de Software. Em conjunto, elas viabilizam a implementação do jogo, a modelagem dos diagramas, a documentação textual e o versionamento do trabalho [1][2][3][4][5][6][7][8][9][10][11].

O Quadro 1 apresenta as principais ferramentas utilizadas no projeto, com suas versões de referência, tipo de licença e site oficial.

## Quadro 1 - Ferramentas utilizadas no projeto Ani

| Ferramenta | Versão de referência | Tipo de licença | Finalidade principal | Site oficial |
| --- | --- | --- | --- | --- |
| Three.js | 0.170.0 | MIT | Renderização 3D dos cenários sobre WebGL e pós-processamento de pixel art | <https://threejs.org/> |
| JavaScript, HTML e CSS | ECMAScript 2022 (módulos ES); HTML e CSS nos padrões atuais dos navegadores | Padrões abertos (Ecma International, WHATWG e W3C) | Lógica do jogo e interface sobreposta | <https://tc39.es/ecma262/> |
| Visual Studio Code | 1.145.0 | Licença de software da Microsoft (código-fonte Code - OSS sob MIT) | Editor do código JavaScript, dos scripts Python e da documentação | <https://code.visualstudio.com/> |
| Sprite Fusion | Não se aplica (serviço web) | Proprietária, por assinatura | Geração das folhas de sprites em pixel art | <https://www.spritefusion.com/> |
| Python, NumPy e Pillow | [preencher] | PSF License, BSD e MIT-CMU | Scripts de recorte e ajuste das folhas de sprites (`jogo/tools/`) | <https://www.python.org/> |
| Aseprite | [preencher] | Proprietária, paga (EULA da Igara Studio) | Edição e ajuste de sprites em pixel art | <https://www.aseprite.org/> |
| draw.io / diagrams.net | 29.6.5 | Apache 2.0 | Modelagem de diagramas UML, DER e artefatos visuais | <https://www.diagrams.net/> |
| Markdown | Sintaxe padrão de Markdown | Formato aberto | Redação da documentação técnica do projeto | <https://daringfireball.net/projects/markdown/> |
| Git | 2.48.1.windows.1 | GPLv2 | Controle de versão local | <https://git-scm.com/> |
| GitHub (com GitHub Actions e GitHub Pages) | Não se aplica (plataforma web) | Proprietária, com uso gratuito e pago | Hospedagem do repositório, verificação automática e publicação do protótipo | <https://github.com/> |

O Quadro 2 apresenta a justificativa de uso de cada ferramenta no contexto do projeto.

## Quadro 2 - Justificativa das ferramentas do projeto Ani

| Ferramenta | Justificativa |
| --- | --- |
| Three.js | Foi escolhida por rodar diretamente no navegador, sem instalação nem etapa de build, e por oferecer controle fino sobre iluminação, câmera e pós-processamento, o que permitiu combinar cenários 3D estilizados com personagens em pixel art. |
| JavaScript, HTML e CSS | Executam nativamente em qualquer navegador moderno e dão acesso direto às APIs usadas pelo protótipo: WebGL para a imagem, Web Audio para os sons sintetizados, Gamepad para o controle e armazenamento local para o salvamento. |
| Visual Studio Code | Foi adotado por ser leve, ter suporte nativo a JavaScript e reunir edição de código, terminal e controle de versão em um só ambiente. |
| Sprite Fusion | É um gerador voltado especificamente a pixel art, com grade de pixels e paleta consistentes, o que permitiu produzir folhas de animação das personagens no mesmo estilo visual. |
| Python, NumPy e Pillow | Automatizam o tratamento das folhas de sprites (recorte, alinhamento dos quadros e separação de camadas) com precisão de pixel. |
| Aseprite | É um editor dedicado a pixel art, adequado para corrigir quadros e detalhes das folhas de sprites sem perder a grade de pixels. |
| draw.io / diagrams.net | Foi utilizada para produzir os diagramas de caso de uso, classes e entidade-relacionamento, facilitando a padronização visual dos artefatos exigidos no TG. |
| Markdown | Foi utilizado para redigir e organizar a documentação textual do projeto de forma leve, rastreável e compatível com o repositório. |
| Git | Foi adotado para registrar o histórico de alterações, apoiar o controle de versão e reduzir o risco de perda de trabalho durante a evolução do projeto. |
| GitHub | Foi utilizado para centralizar o repositório remoto; o GitHub Actions confere a sintaxe do código a cada envio e o GitHub Pages publica o protótipo jogável na web. |

A execução do projeto seguiu uma abordagem compatível com a metodologia apresentada no TAP. Primeiro, foram definidos o problema, os objetivos e a base conceitual do jogo. Em seguida, foram conduzidas a elicitação de requisitos, a especificação dos requisitos funcionais, não funcionais e regras de negócio, e a modelagem dos principais artefatos de Engenharia de Software. Somente após essa consolidação documental foi estruturada a base técnica do protótipo. Na implementação, a tecnologia prevista inicialmente (Unreal Engine com C++) foi substituída por uma base web, com JavaScript e Three.js executados no navegador.

No desenvolvimento da interface e da experiência do jogo, o método adotado foi o de prototipação incremental orientada por artefatos. Isso significa que cada elemento implementado deve manter coerência com os requisitos, com os casos de uso, com o diagrama de classes e com a modelagem de persistência anteriormente definida. Essa organização favorece a rastreabilidade entre concepção, modelagem e implementação.

Os arquivos-fonte dos diagramas produzidos no projeto podem ser consultados nas respectivas pastas da documentação, com destaque para:

- [bpmn/ani.bpmn](../bpmn/ani.bpmn)
- [casos-de-uso/caso-de-uso.drawio.svg](../casos-de-uso/caso-de-uso.drawio.svg)
- [diagrama-de-classe/diagrama-de-classe.drawio](../diagrama-de-classe/diagrama-de-classe.drawio)
- [diagrama-entidade-relacionamento/diagrama-entidade-relacionamento.drawio](../diagrama-entidade-relacionamento/diagrama-entidade-relacionamento.drawio)

## Referências

[1] THREE.JS AUTHORS. *three.js*. Disponível em: <https://threejs.org/>. Acesso em: 09.nov.2026.

[2] ECMA INTERNATIONAL. *ECMAScript Language Specification*. Disponível em: <https://tc39.es/ecma262/>. Acesso em: 09.nov.2026.

[3] JGRAPH LTD. *draw.io / diagrams.net*. Disponível em: <https://www.diagrams.net/>. Acesso em: 26.mar.2026.

[4] GRUBER, John. *Markdown*. Disponível em: <https://daringfireball.net/projects/markdown/>. Acesso em: 26.mar.2026.

[5] SOFTWARE FREEDOM CONSERVANCY. *Git*. Disponível em: <https://git-scm.com/>. Acesso em: 26.mar.2026.

[6] GITHUB. *GitHub*. Disponível em: <https://github.com/>. Acesso em: 26.mar.2026.

[7] MICROSOFT. *Visual Studio Code*. Disponível em: <https://code.visualstudio.com/>. Acesso em: 04.nov.2026.

[8] SPRITE FUSION. *Sprite Fusion*. Disponível em: <https://www.spritefusion.com/>. Acesso em: 09.nov.2026.

[9] PYTHON SOFTWARE FOUNDATION. *Python*. Disponível em: <https://www.python.org/>. Acesso em: 09.nov.2026.

[10] IGARA STUDIO. *Aseprite*. Disponível em: <https://www.aseprite.org/>. Acesso em: 09.nov.2026.

[11] WHATWG. *HTML Living Standard*. Disponível em: <https://html.spec.whatwg.org/>. Acesso em: 09.nov.2026.
