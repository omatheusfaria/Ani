# Índice de casos de uso

```dataview
TABLE WITHOUT ID file.link AS "ID", titulo AS "Nome", ator_primario AS "Ator primário", map(requisitos_funcionais, (x) => link(x)) AS "Requisitos funcionais"
FROM "docs/casos-de-uso"
WHERE tipo = "caso-de-uso"
SORT id ASC
```

- [UC-S001](casos-de-uso/UC-S001.md) — Movimentar Personagem
- [UC-S002](casos-de-uso/UC-S002.md) — Interagir com Objetos
- [UC-S003](casos-de-uso/UC-S003.md) — Dialogar com Personagens
- [UC-S004](casos-de-uso/UC-S004.md) — Consultar Documentos Coletados
- [UC-S005](casos-de-uso/UC-S005.md) — Acessar Diário de Memórias
- [UC-S006](casos-de-uso/UC-S006.md) — Pausar Jogo
- [UC-S007](casos-de-uso/UC-S007.md) — Configurar Jogo
- [UC-S008](casos-de-uso/UC-S008.md) — Ajustar Configurações de Vídeo
- [UC-S009](casos-de-uso/UC-S009.md) — Ajustar Configurações de Áudio
- [UC-S010](casos-de-uso/UC-S010.md) — Configurar Controles
- [UC-S011](casos-de-uso/UC-S011.md) — Sair do Jogo
- [UC-S012](casos-de-uso/UC-S012.md) — Salvar Jogo
- [UC-S013](casos-de-uso/UC-S013.md) — Continuar Jogo
- [UC-S014](casos-de-uso/UC-S014.md) — Iniciar Novo Jogo
- [UC-S015](casos-de-uso/UC-S015.md) — Resolver Puzzle
