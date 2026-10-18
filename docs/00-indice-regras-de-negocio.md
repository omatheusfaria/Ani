# Índice de regras de negócio

```dataview
TABLE WITHOUT ID file.link AS "ID", titulo AS "Nome", map(requisitos_funcionais, (x) => link(x)) AS "Requisitos funcionais"
FROM "docs/regras-de-negocio"
WHERE tipo = "regra-de-negocio"
SORT id ASC
```

- [RN001](regras-de-negocio/RN001.md) — Registro único de memória
- [RN002](regras-de-negocio/RN002.md) — Progressão fixa entre atos
- [RN003](regras-de-negocio/RN003.md) — Critério de avanço por conclusão de ato
- [RN004](regras-de-negocio/RN004.md) — Avanço parcial no Ato I
- [RN005](regras-de-negocio/RN005.md) — Ressignificação de objetos e memórias
- [RN006](regras-de-negocio/RN006.md) — Convergência dos ecos de decisão
