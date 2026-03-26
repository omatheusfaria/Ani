# Requisitos

Os requisitos do projeto definem o que o sistema deve fazer, sob quais restrições deve operar e quais regras devem orientar seu comportamento. Nesta seção, são apresentados os requisitos funcionais, os requisitos não funcionais e as regras de negócio do projeto **Ani**, com base no modelo de documentação adotado nas aulas de Engenharia de Software.

## Requisitos Funcionais

Requisitos funcionais descrevem as funcionalidades, os serviços e os comportamentos que o sistema deve oferecer para atender às necessidades dos usuários e aos objetivos do projeto. Em outras palavras, eles definem o que o software deve fazer em termos de ações, respostas e operações esperadas [1].

No projeto **Ani**, os requisitos funcionais contemplam elementos centrais da experiência, como movimentação, interação com objetos, sistema de memórias, progressão por atos e mecânicas específicas da proposta narrativa.

O Quadro 1 apresenta alguns dos requisitos funcionais do projeto.

## Quadro 1 - Requisitos Funcionais do projeto Ani

| Código | Título | Categoria | Prioridade | Descrição |
| --- | --- | --- | --- | --- |
| RF001 | Movimentar personagem | Evidente | Altíssima | O sistema deve permitir que o jogador mova Ani lateralmente usando teclado. |
| RF003 | Interagir com objetos | Evidente | Altíssima | O sistema deve permitir interação com objetos significativos para acessar memórias, fragmentos narrativos e elementos contemplativos do cenário. |
| RF005 | Diário de memórias | Evidente | Altíssima | O sistema deve registrar os fragmentos coletados em um diário estilizado acessível ao jogador. |
| RF009 | Sistema de save/load | Evidente | Altíssima | O sistema deve salvar e carregar o progresso do jogador, incluindo ato atual, memórias registradas e estado do diário. |
| RF012 | Progressão por atos filosóficos | Oculto | Altíssima | O jogo deve ser estruturado em cinco atos sequenciais, com mudança de atmosfera, paleta, comportamento das manifestações e mecânicas conforme a progressão. |

A documentação completa dos requisitos funcionais pode ser consultada em [requisitos-funcionais.md](./requisitos-funcionais.md).

## Requisitos Não Funcionais

Requisitos não funcionais descrevem critérios de qualidade e restrições que determinam como o sistema deve operar, considerando aspectos como desempenho, usabilidade, acessibilidade, confiabilidade e experiência de uso. Em vez de descrever funções específicas, eles definem as condições em que essas funções devem ser executadas [1].

No projeto **Ani**, os requisitos não funcionais orientam aspectos fundamentais da qualidade da experiência, como desempenho mínimo, integridade dos saves, acessibilidade, linguagem, direção visual e comunicação sensorial da interface.

O Quadro 2 apresenta alguns dos requisitos não funcionais do projeto.

## Quadro 2 - Requisitos Não Funcionais do projeto Ani

| Código | Requisito | Classificação |
| --- | --- | --- |
| RNF001 | O jogo deve rodar a 60 FPS na configuração mínima estimada. | Obrigatório, permanente |
| RNF002 | Saves locais devem carregar em menos de 5 segundos e preservar a integridade dos dados. | Obrigatório, permanente |
| RNF004 | A jogabilidade deve ser compreensível sem depender de tutorial extenso. | Obrigatório, permanente |
| RNF005 | O jogo deve exibir aviso de conteúdo sensível e permitir pular cenas de alta carga emocional. | Obrigatório, permanente |
| RNF009 | O jogo deve oferecer recursos de acessibilidade, como controle de distorção visual, legendas e controle de volume por camada de áudio. | Obrigatório e desejável, permanente |

A documentação completa dos requisitos não funcionais pode ser consultada em [requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md).

## Regras de Negócio

Regras de negócio são declarações que definem ou restringem algum aspecto do funcionamento do negócio ou do domínio da aplicação, orientando comportamentos, decisões e validações que o sistema deve respeitar [2][3].

A importância das regras de negócio está em garantir consistência entre a proposta do projeto e o comportamento efetivo do sistema. Quando bem documentadas, elas ajudam a evitar ambiguidades, orientam a implementação das funcionalidades e preservam as restrições conceituais da aplicação ao longo do desenvolvimento [2][3].

No projeto **Ani**, as regras de negócio são especialmente importantes porque a experiência depende de coerência estrutural entre narrativa, progressão por atos, registro de memórias e lógica de avanço do jogador.

O Quadro 3 apresenta algumas das regras de negócio do projeto.

## Quadro 3 - Regras de Negócio do projeto Ani

| Código | Nome | Descrição |
| --- | --- | --- |
| RN001 | Registro único de memória | Cada fragmento encontrado deve ser registrado apenas uma vez no diário. |
| RN003 | Progressão fixa entre atos | A sequência dos atos deve seguir a ordem definida no GDD, sem ramificação estrutural entre eles. |
| RN005 | Avanço parcial no Ato I | No Ato I, o avanço para o ato seguinte não deve exigir a visualização de todas as memórias disponíveis. |
| RN008 | Convergência dos ecos de decisão | Nos ecos de decisão do Ato II, tentativas diferentes do jogador devem convergir para o mesmo impasse narrativo. |
| RN009 | Presença textual dos personagens | NPCs e arquétipos devem se comunicar principalmente por texto, preservando o caráter fragmentado e contemplativo da narrativa. |

O documento completo de regras de negócio pode ser consultado em [regras-de-negocio.md](./regras-de-negocio.md).

## Referências

[1] IBM. *What is requirements management?* Disponível em: <https://www.ibm.com/think/topics/what-is-requirements-management>. Acesso em: 22 mar. 2026.

[2] IBM. *What are business rules?* Disponível em: <https://www.ibm.com/topics/business-rules>. Acesso em: 22 mar. 2026.

[3] BUSINESS RULES GROUP. *Defining Business Rules ~ What Are They Really?* Disponível em: <https://www.businessrulesgroup.org/first_paper.htm>. Acesso em: 22 mar. 2026.
