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
| 5 | resolvida | Formatos dos quadros conferidos no `.docx` do modelo. O gerador passou a usar as caixas de seleção do modelo (`(X) Evidente`, `(X) Altíssima`, `(X) Obrigatório`, `(X) Permanente`), RNF sem linha de cabeçalho e um quadro por caso de uso ("Quadro N – Use Case Nome", linha "Caso de Uso – Nome"). | `scripts/gerar_consolidados.py` | — |
| 6 | decisão | Referências usam "Acesso em: 22 mar. 2026" (NBR 6023:2018); o modelo exige NBR 6023:2002 ("Acesso em: 05.out.2015") e, no texto, citação da internet como "chave, data ou sd, online". | Todos os documentos com referências | Confirmar com o orientador qual norma vale e padronizar. |
| 6a | decisão | O modelo identifica casos de uso como `UC 001`; o projeto usa `UC-S001`. | Notas de UC, diagramas, TG | Manter `UC-S001` (canon da skill) ou adotar o padrão do modelo. |
| 6b | aberta | Os Anexos/Apêndices do modelo pedem missão, visão e valores (Anexo 1) e as perguntas e respostas da elicitação (Anexo 2). | Rascunhos do TG | Conferir se os dois constam no TG. |
| 23 | aberta | Os rascunhos tratam o Levantamento de Requisitos como capítulo 2; no modelo ele é o capítulo 3. | `tg-ani.md` (linha 146), `tg-ani-v2-sem-gdd.md` (linha 212) | Renumerar os capítulos conforme o modelo. |
| 24 | aberta | Faltam nos dois rascunhos: Resumo/Abstract, Viabilidade, Diagramas de Atividades, de Estados e de Sequência, Resultados e Discussão, Considerações Finais e Apêndices. | `tg-ani.md`, `tg-ani-v2-sem-gdd.md` | Criar as seções. Confirmar com o orientador se a Viabilidade é obrigatória. Os Apêndices se ligam ao item 6b. |
| 25 | aberta | No capítulo de ferramentas, todas estão com versão e site oficial "não especificado", e o C# também sem licença. Os sites já constam em `docs/recursos-utilizados/README.md`. | `tg-ani-v2-sem-gdd.md` (linhas 794–841) | Informar a versão usada, a licença e o site oficial de cada ferramenta. |
| 26 | aberta | A referência da BPMN diverge entre os rascunhos (OMG 2014, v2.0.2 × OMG 2011, v2.0), e a do v2 tem "Acesso em: 2024", sem dia e mês. | `tg-ani.md` (linha 242), `tg-ani-v2-sem-gdd.md` (linha 1102) | Escolher uma edição e completar a data de acesso no formato decidido no item 6. |

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
| 27 | resolvida | RF001 diz "usando teclado", o que conflita com o suporte a gamepad do RF011. | RF001, RF011 | Trocado por "por teclado ou gamepad" na nota, no README e nos rascunhos; consolidado regerado. |
| 28 | decisão | RF015 (restauração no Ato III) está como Evidente, e os demais RFs de mecânica por ato (RF013, RF014, RF016, RF017) estão como Ocultos. | RF015 | Uniformizar a categoria ou justificar a diferença. Se o RF015 continuar Evidente, ele precisa de caso de uso (ver item 10). |

## Casos de uso

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 15 | aberta | O fluxo do UC-S002 exige "pressionar tecla de interação", mas o RF016 (contemplação ativa) é disparado por permanência, e o UC-S002 diz cobrir o RF016. | UC-S002, RF016 | Adicionar fluxo alternativo de interação por permanência ou criar UC próprio. |
| 16 | aberta | UC-S005 usa "tecla de inventário" e "inventário", contrariando o canon ("diário de memórias") e a própria observação do UC. | UC-S005 | Trocar por "diário de memórias". |
| 17 | aberta | Exemplo do UC-S002 no README é cópia manual e pode divergir da nota. | `docs/casos-de-uso/README.md` (Quadro 2) | Referenciar a nota ou o consolidado gerado em vez de copiar. |

## BPMN e diagramas

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 29 | aberta | O BPMN só termina depois que "toda a exploração" é concluída, o que contraria o limiar mínimo do Ato I (RN004). Ele também usa "inventário" em vez de "diário de memórias", fala em "fim do jogo" e não representa os atos (RF012, RN002, RN003). | `docs/bpmn/ani.bpmn`, `ani-bpmn.png`, `descricao-do-processo.md` (passos 12, 13 e 16; linha 47), seção BPMN dos rascunhos | Remodelar com um laço por ato e o critério de conclusão de cada ato (RN003/RN004), trocando "inventário" por "diário de memórias". |
| 30 | aberta | No `.drawio`, Jogo→Ato e Jogo→Cenario usam losango vazio (agregação), mas os dois rascunhos chamam essas relações de composição. Decidido: composição. | `docs/diagrama-de-classe/diagrama-de-classe.drawio` | Trocar para losango cheio no `.drawio` e reexportar o `.drawio.svg`. |
| 31 | aberta | A associação Ato–Cenario existe no diagrama e no `tg-ani.md` (linha 662), mas falta na tabela de relacionamentos do v2. | `tg-ani-v2-sem-gdd.md` (linhas 691–701) | Incluir a linha na tabela do v2. |
| 32 | aberta | Não há classes para ecos de decisão (RF014/RN006), crise de ansiedade (RF018; existe só o valor `EstadoEmocional.Ansioso`) e save (RF009; o DER tem a entidade Save). Manifestações e arquétipos aparecem só como valores do enum `TipoNPC` (`Aparicao`, `Arquetipo`). | `docs/diagrama-de-classe/` | Avaliar quais mecânicas pedem classe própria e incluí-las no diagrama. |
| 33 | aberta | O texto da arquitetura cita `InputManager` e `GameManager`, que não estão no diagrama de classes. | `tg-ani-v2-sem-gdd.md` (seção 4.1, linhas 865–866) | Incluir as classes no diagrama ou reescrever o fluxo usando as classes existentes. |
| 37 | resolvida | Os rascunhos e o README do diagrama de classes chamam de `Player` a classe que no diagrama é `Ani`; o DER do v2 tem a entidade `PLAYER` e a chave `idPlayer`. | `tg-ani.md`, `tg-ani-v2-sem-gdd.md`, `docs/diagrama-de-classe/README.md` | Padronizado para `Ani` (`ANI`, `idAni`/`id_ani` no DER). |
| 34 | aberta | Os atributos de Jogo no DER divergem entre os rascunhos (`id_jogo`, `ato_atual`, `cenario_atual` × `id`, `atoAtual`, `cenarioAtual`), e nenhum dos dois bate com o `.drawio` do DER, que não tem a entidade Jogo e tem Save. | `tg-ani.md` (linha 680), `tg-ani-v2-sem-gdd.md` (linha 714), `docs/diagrama-entidade-relacionamento/` | Tomar o `.drawio`/`der.md` como fonte e reescrever a seção DER dos dois rascunhos a partir dele. |

## Canon, grafia e textos derivados

| # | Status | Item | Onde | Correção sugerida |
| --- | --- | --- | --- | --- |
| 18 | resolvida | "Ani אני" sem niqqud. | Título do consolidado de casos de uso (vem de `scripts/modelos/casos-de-uso.md`) | Trocado por "Ani אֲנִי" no modelo do script e consolidado regerado. |
| 19 | resolvida | "Mainlander" sem trema. | `tg-ani-v2-sem-gdd.md` (linhas 19, 99 e 923), `docs/tap/tap.md` (linha 35), `docs/tap/README.md` (linha 43) | Trocado por "Mainländer". |
| 20 | aberta | `docs/requisitos/README.md` mostra só parte dos itens (omite RN003, RNF003, RNF006 e vários RF) e copia o texto à mão; as cópias já divergem (RF009 sem "estado visual da casa"; RF012 na redação antiga). | `docs/requisitos/README.md` | Atualizar os quadros de exemplo a partir das notas ou só apontar para os consolidados. |
| 21 | aberta | Rascunhos do TG trazem tabelas de RF/RN/UC copiadas à mão, em redação anterior à reescrita de RF012–RF019. | `tg-ani.md`, `tg-ani-v2-sem-gdd.md` | Atualizar a partir dos consolidados gerados. |
| 35 | decisão | A elicitação diverge: o `tg-ani.md` cita um questionário com 8 participantes e um apêndice de respostas, e o v2 diz que ela foi feita por análise documental e refinamento iterativo. Os documentos de `docs/elicitacao-de-requisitos/` confirmam o questionário e trazem o Apêndice A (`apendice-questionario.md`), mas não informam o número de participantes. | `tg-ani.md` (linhas 152–156), `tg-ani-v2-sem-gdd.md` (linhas 218–220) | Decidir qual versão vale. Se for o questionário, alinhar o v2, registrar o número de participantes no apêndice e levar o Apêndice A ao TG (o modelo exige as perguntas e respostas; ver item 6b). |
| 36 | resolvida | "אני" sem niqqud fora do título dos casos de uso (o título está no item 18). | `docs/gdd.md` (linha 24), `docs/tap/tap.md` (linha 7), `tg-ani.md` (linha 814), `tg-ani-v2-sem-gdd.md` (linha 57) | Trocado por "אֲנִי". |
| 22 | resolvida | Pastas `docs/caso-de-uso/` e `docs/casos-de-uso/` coexistiam. | `docs/` | Pasta antiga removida; README e diagramas movidos para `docs/casos-de-uso/`. |
