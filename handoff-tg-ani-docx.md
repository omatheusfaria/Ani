# Handoff: TG "Ani אֲנִי" para o documento .docx

Data do handoff: 05/11/2026.
Autor do TG: Matheus (GitHub `omatheusfaria`).

## 1. O projeto

Trabalho de Graduação de Análise e Desenvolvimento de Sistemas da Fatec Franca "Dr. Thomaz Novelino". O objeto é **Ani אֲנִי**, um jogo narrativo contemplativo side-scroller para PC, em **Unreal Engine 5.4.4 com C++**. A documentação segue o modelo **Cascata**.

- **Repositório:** `omatheusfaria/Ani`, branch `main`, já sincronizado com o GitHub (último commit `b7b2249`, working tree limpo).
- **Pasta local:** `C:\Users\lampe\Ani`. O trabalho é feito no Claude Code dentro do VS Code.
- **OmniRoute:** o Claude Code passa por esse roteador local, então ele precisa estar aberto antes de iniciar a sessão. Sem ele, aparece o erro "Connection refused" ou "Subprocess initialization did not complete".
- **Skill:** `tg-ani-documentacao`, na conta do usuário. Ela reúne todas as regras e decisões do projeto e deve ser carregada antes de qualquer trabalho.

## 2. Estado atual

A fase de requisitos e design está **completa e versionada**.

**Texto do TG:** `tg-ani.md`, na raiz, é o rascunho único. A versão antiga está em `docs/arquivo/` e não deve ser usada.

**Estrutura atual do `tg-ani.md`:**
- Resumo e Abstract: **ainda não existem**.
- **1 Introdução**, com **1.1 TAP** (subseções 1.1.1 em diante).
- **Viabilidade:** não entra, por decisão confirmada com o orientador. Por isso a numeração começa em 2.
- **2 Levantamento de Requisitos:** elicitação, BPMN, RF, RNF, regras de negócio, casos de uso, 2.7 classes, 2.8 atividades, 2.9 estados, 2.10 sequência, 2.11 DER. A matriz de rastreabilidade foi omitida por decisão do autor.
- **3 Ferramentas e Métodos.**
- **4 Desenvolvimento:** hoje tem arquitetura e mecânicas. Código e capturas de tela virão com a implementação.
- **Resultados e Discussão** e **Considerações Finais:** **ainda não existem**, porque dependem do jogo pronto. Há uma nota de trabalho em `docs/notas-de-trabalho/consideracoes-finais.md`.
- **Referências:** ABNT NBR 6023:2002, como pede o modelo.
- **Apêndices:**
  - A: perguntas do questionário e resumos das respostas;
  - B: missão, visão e valores;
  - C: GDD resumido.

**Quadros de requisitos:** saem gerados das notas em `docs/requisitos/`, `docs/regras-de-negocio/` e `docs/casos-de-uso/`. Para regenerar, rode `python scripts/gerar_consolidados.py`.

**Diagramas** (todos em draw.io, cada um com `.drawio` como fonte e `.drawio.svg` exportado):

| Diagrama | Arquivo |
|---|---|
| Classes | `docs/diagrama-de-classe/` |
| Casos de uso | `docs/casos-de-uso/` |
| DER | `docs/der/` (ou a pasta onde estiver `der.md`) |
| Atividades, estados e sequência (5 arquivos) | `docs/diagramas/` |
| BPMN | `docs/bpmn/ani-bpmn.png`. **Não alterar, por decisão do autor.** |

No texto do TG, as figuras ainda são marcadores (por exemplo, "[Figura 6 – ...]") numerados de forma contínua.

**Pendências conhecidas:** não bloqueiam o .docx, mas devem aparecer nele exatamente como estão.
- `[preencher]`: versões de MSVC/Build Tools, Aseprite, Illustrator, Audacity e FMOD (capítulo 3).
- `[definir]`: tipos de puzzle (seção 4.2.13 e UC-S015).
- **Para o orientador:**
  - os Apêndices A e B entram como Apêndice ou como Anexo;
  - vale a NBR 6023:2002 ou a de 2018;
  - o GDD fica como apêndice;
  - nome do orientador, que é desconhecido e deve ficar como placeholder.

## 3. O modelo da Fatec

- **Arquivo:** `tg-modelo-prjSoftware-ads-v2023ago.docx`, na pasta local do repositório. Pode estar com o nome `tg-modelo-prjSoftware-ads-v2023ago(3).docx`.
- **Não é versionado,** porque `*.docx` está no `.gitignore`. Por isso **o .docx gerado também não vai para o Git**, o que é esperado.

**Estrutura do modelo:**
- capa ("CENTRO PAULA SOUZA / FACULDADE DE TECNOLOGIA DE FRANCA 'Dr. THOMAZ NOVELINO' / TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS");
- folha de rosto, com a natureza do trabalho, orientador, FRANCA/SP e ano;
- título, com os autores em nota de rodapé;
- Resumo (100 a 250 palavras, parágrafo único, 3 a 6 palavras-chave em ordem alfabética);
- Abstract em itálico;
- capítulos e Referências;
- Apêndices ou Anexos.

**Formatos de quadro do modelo:**
- **RF:** linha "RFxxx-Nome | Categoria: ( ) Oculto (X) Evidente | Prioridade: (X) Altíssima ( ) Alta ( ) Média ( ) Baixa", com a linha "Descrição: O sistema deve…" logo abaixo.
- **RNF:** "RNFxxx-Nome | descrição | Tipo | ( ) Desejável (X) Obrigatório | (X) Permanente ( ) Transitório".
- **RN:** "RNxxx - Nome", com "Descrição:" abaixo.
- **Caso de uso:** um quadro por caso, intitulado "Quadro N – Use Case Nome", com as linhas ID, Descrição, Ator Primário, Pré-condição, Cenário Principal, Pós-condição e Cenário Alternativo.
- **Regra geral:** todo quadro e toda figura são citados no texto antes de aparecer.

**As instruções do modelo não vão para o documento final.** O modelo traz orientações em negrito, como "Comentar o que é…", "(este item é obrigatório)" e "Ver mais aqui". Elas servem para quem escreve e precisam ser removidas.

**Capa e folha de rosto:** já estão prontas no documento do modelo. Mantenha exatamente como estão, sem mudar layout, ordem nem formatação. Só complete os campos que ainda estiverem como placeholder genérico (por exemplo, "NOME DO(s) ALUNO(s)" ou "Título DO tg") e, antes disso, confirme com o usuário.

## 3.1 Ferramentas da máquina do usuário

- **Editor de texto:** o usuário abre e revisa documentos no **WordCraft** (grupo ArtCraft), um editor que lê .docx como o Microsoft Word. O WordCraft serve **só para abrir e revisar**; ele não gera o documento.
- **Geração do .docx:** use a **skill de .docx** (por exemplo, `anthropic-skills:docx`). Se ela não estiver disponível no Claude Code, instale uma skill ou biblioteca de manipulação de .docx; o usuário autorizou. A geração é feita via código sobre a cópia do modelo.
- **Compatibilidade com o WordCraft:** use recursos padrão do .docx (estilos, tabelas, imagens inline, quebras de página e de seção). Evite recursos avançados que um editor alternativo pode não renderizar, como caixas de texto flutuantes, SmartArt e campos complexos. Se precisar de um sumário automático (campo TOC), avise o usuário que ele talvez precise atualizá-lo no WordCraft. Se o WordCraft não atualizar campos, gere o sumário como texto.
- **draw.io desktop:** está instalado. Use o CLI para exportar os diagramas em PNG de alta resolução, por exemplo:
  `"C:\Program Files\draw.io\draw.io.exe" -x -f png -s 3 -o <saida.png> <arquivo.drawio>`
  - Confirme o caminho do executável na máquina.
  - Exporte a partir do `.drawio`, que é a fonte, e não do `.drawio.svg`.
  - Salve os PNGs fora do Git (por exemplo, em `entrega/figuras/`) ou pergunte ao usuário onde salvar.

## 4. A tarefa da nova sessão

Gerar o TG em .docx a partir do `tg-ani.md` e dos diagramas, **usando o próprio modelo da Fatec como base** e preservando 100% da formatação dele.

**Restrições do usuário (inegociáveis):**
- não trocar fontes nem tamanhos de letra;
- não colocar cor em títulos, seções ou qualquer texto;
- não inventar estilos;
- documento com aparência padrão de TG/TCC.

Quando o modelo não definir algo, seguir a ABNT: NBR 14724 para trabalhos acadêmicos, NBR 10520 para citações e NBR 6023 para referências. Quadros e figuras levam o título acima e a fonte abaixo.

**Abordagem recomendada:**
1. **Inventário do modelo:** abrir o modelo, listar os estilos nomeados (Título 1, Título 2, Normal, legendas, estilo de tabela), a configuração de página (margens, tamanho) e cabeçalho e rodapé. Mostrar esse inventário ao usuário antes de gerar qualquer coisa.
2. **Base do documento:** gerar com a skill de .docx, partindo de uma **cópia do modelo**, nunca de um documento novo. Manter a capa e a folha de rosto como estão, junto com a configuração de seções, e substituir só o conteúdo depois delas. Aplicar exclusivamente os estilos que existem no modelo.
3. **Quadros:** gerar a partir das notas ou dos consolidados, reproduzindo o layout dos quadros de exemplo do modelo.
4. **Figuras:** usar PNG em alta resolução exportado pelo CLI do draw.io desktop (seção 3.1). Não converter os `.drawio.svg` com cairosvg ou ferramentas parecidas, porque elas perdem o texto, que nesses arquivos fica em foreignObject.
5. **Placeholders:** `[preencher]`, `[definir]` e o nome do orientador vão como texto simples, sem destaque de cor. Listar todos ao final para o usuário.
6. **Seções que ainda não existem:** Resumo, Abstract, Resultados e Discussão e Considerações Finais entram só como títulos com um placeholder. **Não escrever conteúdo inventado.** O Resumo só pode ser escrito com o jogo pronto.
7. **Verificação:**
   - converter para PDF (LibreOffice, se disponível) e conferir página por página: capa, sumário se houver, quadros, figuras e quebras de página;
   - conferir que nenhuma fonte, tamanho ou cor difere do modelo, inspecionando os runs com formatação direta;
   - entregar com uma lista do que conferir no Word: atualizar campos e sumário com F9, e quebras de página.

**Saída:** `entrega/TG-Ani.docx`, ou outro caminho que o usuário escolher. Não commitar o .docx. Se for criado algum script de geração, ele pode ser versionado, por exemplo em `scripts/gerar_docx.py`, para regenerar o documento quando o TG mudar.

## 5. Regras de trabalho

- Antes de editar qualquer coisa, rodar `git status`. Se houver alteração do usuário sem commit, perguntar antes.
- Nunca usar push forçado.
- Fazer um commit por assunto.
- Não alterar o conteúdo do TG nem das notas para "caber" no .docx. Se encontrar um erro de conteúdo, relatar em vez de corrigir.
- Não alterar o BPMN.
