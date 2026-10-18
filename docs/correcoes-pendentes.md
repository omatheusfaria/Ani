# Correções pendentes

Lista de inconsistências encontradas na documentação do **Ani אֲנִי** e ainda não corrigidas. As correções de requisitos, regras e casos de uso são feitas nas notas individuais; depois, rode `python scripts/gerar_consolidados.py`.

Status: `aberta`, `decisão` (depende de escolha do autor) ou `resolvida`.

## Estrutura e formato do modelo da Fatec

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 1 | resolvida | O consolidado de RF não seguia o quadro do modelo (`RFxxx-Nome` / Categoria / Prioridade / Descrição). | `docs/requisitos/requisitos-funcionais.md` | Gerado agora pelo script no formato do modelo. As notas mantêm a tabela original como fonte. |
| 2 | aberta | RNF sem nome (`RNFxxx-Nome`) e sem coluna Tipo; classificação gravada como texto único ("Obrigatório, permanente"). | Notas `docs/requisitos/nao-funcionais/` | Adicionar `nome` e `tipo_rnf` no frontmatter de cada RNF (o script já os usa; hoje sai "—"). Padronizar "Permanente"/"Transitório" com inicial maiúscula. |
| 3 | aberta | Casos de uso têm campos fora do modelo ("Nome revisado", "Observações arquiteturais", "Indicação"), omitidos no consolidado. | Notas `docs/casos-de-uso/` | Decidir se esses campos continuam só nas notas (como anotação de trabalho) ou se são removidos. |
| 4 | aberta | Cenários alternativos não estão numerados no padrão do modelo (4a, 4a.1). | Todas as notas de UC | Renumerar referenciando o passo do cenário principal. |
| 5 | aberta | Os formatos acima vêm da skill, não foram conferidos no `.docx` do modelo (o arquivo não está na pasta do repositório). | `tg-modelo-prjSoftware-ads-v2023ago.docx` | Colocar o modelo na pasta e conferir colunas de RF e classificação de RNF. |
| 6 | decisão | Referências usam "Acesso em: 22 mar. 2026" (NBR 6023:2018); o modelo cita NBR 6023:2002 ("Acesso em: 05.out.2015"). | Todos os documentos com referências | Confirmar com o orientador qual norma vale e padronizar. |

## Requisitos e regras

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 7 | aberta | RF006, RF019 e RN004 descrevem a mesma regra do limiar mínimo do Ato I. | RF006, RF019, RN004 | Deixar a regra só na RN004; RF006 trata do desbloqueio de cenário e RF019 do mecanismo de liberação, ambos citando a RN004. |
| 8 | aberta | RF009 inclui "carregar", mas não existe caso de uso de carregar/continuar jogo. | RF009, casos de uso | Criar UC "Carregar Jogo" (ou "Continuar Jogo") ligado ao RF009. |
| 9 | aberta | Não há RF para pausar, configurar e sair do jogo (UC-S006 a UC-S011 sem RF). | UC-S006, UC-S007, UC-S008, UC-S009, UC-S010*, UC-S011 | Criar RFs (ex.: Pausar jogo, Configurar vídeo/áudio/controles, Sair do jogo) e ligar aos UCs. *UC-S010 já se liga ao RF011 (gamepad), mas a remapeação de teclas não tem RF. |
| 10 | decisão | RFs ocultos das mecânicas dos atos (RF012 a RF014, RF017 a RF019) e RF010 não se ligam a nenhum caso de uso. | RF010, RF012–RF014, RF017–RF019 | Decidir: (a) ligá-los a UC-S001/UC-S002 como comportamento do sistema durante essas interações; (b) criar UCs específicos; ou (c) declarar que requisitos ocultos não exigem UC e registrar isso no TG. |
| 11 | aberta | RF007 (puzzles) sem caso de uso e sem regra de negócio. | RF007 | Definir o UC que cobre a resolução de puzzles e, se houver, a regra. |
| 12 | aberta | RNF001, RNF003, RNF005 e RNF006 sem vínculo com RF ou UC. | Notas de RNF | Avaliar se o vínculo é necessário; RNF005 (pular cenas) pode exigir um RF/UC próprio. |
| 13 | aberta | Relacionamentos que vêm só dos rascunhos do TG (RF005–UC-S004, RF005–RNF004, RF009–RN001, RF012–RN003, RF017–RN002) e um deduzido só pelo conteúdo (UC-S009–RNF007). | Frontmatter das notas | Confirmar ou remover cada um. |
| 14 | aberta | RF003–RF005 ligados a RN001/RN005 em bloco (GDD e TG agrupam por sistema), não par a par. | RF003, RF004, RF005 | Confirmar cada par. |

## Casos de uso

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 15 | aberta | O fluxo do UC-S002 exige "pressionar tecla de interação", mas o RF016 (contemplação ativa) é disparado por permanência, e o UC-S002 diz cobrir o RF016. | UC-S002, RF016 | Adicionar fluxo alternativo de interação por permanência ou criar UC próprio. |
| 16 | aberta | UC-S005 usa "tecla de inventário" e "inventário", contrariando o canon ("diário de memórias") e a própria observação do UC. | UC-S005 | Trocar por "diário de memórias". |
| 17 | aberta | Exemplo do UC-S002 no README é cópia manual e pode divergir da nota. | `docs/casos-de-uso/README.md` (Quadro 2) | Referenciar a nota ou o consolidado gerado em vez de copiar. |

## Canon, grafia e textos derivados

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 18 | aberta | "Ani אני" sem niqqud. | Título do consolidado de casos de uso (vem de `scripts/modelos/casos-de-uso.md`) | Trocar por "Ani אֲנִי" no modelo do script. |
| 19 | aberta | "Mainlander" sem trema. | `tg-ani-v2-sem-gdd.md` (linhas 19, 99 e 923) | Trocar por "Mainländer". |
| 20 | aberta | `docs/requisitos/README.md` mostra só parte dos itens (omite RN003, RNF003, RNF006 e vários RF) e copia o texto à mão; as cópias já divergem (RF009 sem "estado visual da casa"; RF012 na redação antiga). | `docs/requisitos/README.md` | Atualizar os quadros de exemplo a partir das notas ou só apontar para os consolidados. |
| 21 | aberta | Rascunhos do TG trazem tabelas de RF/RN/UC copiadas à mão, em redação anterior à reescrita de RF012–RF019. | `tg-ani.md`, `tg-ani-v2-sem-gdd.md` | Atualizar a partir dos consolidados gerados. |
| 22 | resolvida | Pastas `docs/caso-de-uso/` e `docs/casos-de-uso/` coexistiam. | `docs/` | Pasta antiga removida; README e diagramas movidos para `docs/casos-de-uso/`. |
