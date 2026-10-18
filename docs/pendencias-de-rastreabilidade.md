# Pendências de rastreabilidade

Itens cujas notas estão marcadas com `rastreabilidade_pendente: true` no frontmatter, ou seja, que ainda têm relacionamentos não deduzidos ou não confirmados. A matriz de rastreabilidade do modelo da Fatec (seção 3.11) não é usada neste projeto.

```dataview
TABLE WITHOUT ID file.link AS "Item", tipo AS "Tipo", titulo AS "Título"
FROM "docs"
WHERE rastreabilidade_pendente = true
SORT id ASC
```
