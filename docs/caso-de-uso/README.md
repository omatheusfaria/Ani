# Caso de Uso

Caso de uso é uma técnica de modelagem utilizada para descrever, sob a perspectiva de atores externos, as interações realizadas com um sistema para atingir determinados objetivos. Em diagramas de caso de uso, essas interações ajudam a representar o comportamento esperado do sistema e suas fronteiras de atuação, sem detalhar sua implementação interna [1][2].

A importância do caso de uso está em apoiar a identificação e a organização dos requisitos funcionais, além de tornar mais clara a relação entre os atores e as principais funcionalidades do sistema. Essa modelagem também contribui para delimitar o escopo do projeto e facilitar a comunicação entre desenvolvimento, orientação e demais envolvidos [1][2].

No projeto **Ani**, os casos de uso são importantes para representar as principais interações entre o jogador e o sistema, como movimentação, interação com objetos, leitura de documentos, gerenciamento de diálogos, salvamento de progresso e configuração da experiência.

A Figura 1 apresenta o diagrama de casos de uso do projeto **Ani**, elaborado conforme o modelo estudado nas aulas de Engenharia de Software.

## Figura 1 - Diagrama de Casos de Uso do projeto Ani

![Figura 1 - Diagrama de Casos de Uso do projeto Ani](./caso-de-uso.drawio.svg)

O diagrama evidencia os principais atores envolvidos e as funcionalidades centrais do sistema, contribuindo para a visualização do escopo funcional do projeto e para a organização da documentação de requisitos.

O Quadro 1 apresenta o índice dos casos de uso atualmente documentados no projeto.

## Quadro 1 - Índice de Casos de Uso do projeto Ani

| ID | Caso de Uso | Ator Primário |
| --- | --- | --- |
| UC-S001 | Movimentar Personagem | Jogador |
| UC-S003 | Colidir com cenário | Jogador |
| UC-S004 | Interagir com Objeto | Jogador |
| UC-S005 | Interagir com NPCs | Jogador |
| UC-S006 | Ler Documentos | Jogador |
| UC-S007 | Abrir Inventário | Jogador |
| UC-S008 | Pausar Jogo | Jogador |
| UC-S009 | Configurar Jogo | Jogador |
| UC-S010 | Configurar Vídeo | Jogador |
| UC-S011 | Configurar Áudio | Jogador |
| UC-S012 | Configurar Controles | Jogador |
| UC-S013 | Sair do Jogo | Jogador |
| UC-S014 | Carregar Cenário | Sistema |
| UC-S015 | Gerenciar Diálogos | Sistema |
| UC-S016 | Salvar Jogo | Sistema |

O Quadro 2 apresenta, como exemplo, a especificação de um dos casos de uso do projeto.

## Quadro 2 - Especificação de Caso de Uso: Interagir com Objeto

| Campo | Descrição |
| --- | --- |
| Caso de Uso | UC-S004 - Interagir com Objeto |
| ID | UC-S004 |
| Descrição | O sistema deve permitir que Ani interaja com objetos significativos para acessar memórias, fragmentos narrativos ou elementos contemplativos do cenário. |
| Ator Primário | Jogador |
| Pré-condição | Ani deve estar próximo de um objeto interativo. |
| Cenário Principal | 1. Jogador pressiona a tecla de interação.<br>2. Sistema identifica o tipo de objeto interativo.<br>3. Sistema ativa o conteúdo associado, como memória, fragmento textual, objeto restaurável ou evento contemplativo.<br>4. Quando aplicável, o conteúdo é registrado no diário de Ani. |
| Pós-condição | O conteúdo vinculado ao objeto é processado e, quando aplicável, registrado no diário. |
| Cenários Alternativos | Se o objeto não for interativo, nada acontece. |

A documentação completa de casos de uso, incluindo o índice de casos de uso, o diagrama e a especificação de cada caso, pode ser consultada em [caso-de-uso.md](./caso-de-uso.md).

## Referências

[1] IBM. *Creating use-case diagrams*. Disponível em: <https://www.ibm.com/docs/en/dma?topic=diagrams-creating-use-case>. Acesso em: 22 mar. 2026.

[2] IBM. *Use case view*. Disponível em: <https://www.ibm.com/docs/en/systems-engineering/1.5.0?topic=views-use-case-view>. Acesso em: 22 mar. 2026.
