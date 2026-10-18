# Matriz de rastreabilidade

Consultas Dataview montadas a partir do frontmatter das notas de requisitos funcionais (campos `casos_de_uso`, `regras` e `requisitos_nao_funcionais`). Os relacionamentos ainda precisam ser validados.

## RF × UC × RN

```dataview
TABLE WITHOUT ID file.link AS "RF", titulo AS "Título", map(casos_de_uso, (x) => link(x)) AS "Casos de uso", map(regras, (x) => link(x)) AS "Regras de negócio", map(requisitos_nao_funcionais, (x) => link(x)) AS "RNF"
FROM "docs/requisitos/funcionais"
SORT id ASC
```

## UC → RF → RN

```dataview
TABLE WITHOUT ID link(uc) AS "Caso de uso", rows.file.link AS "Requisitos funcionais", map(unique(flat(rows.regras)), (x) => link(x)) AS "Regras de negócio"
FROM "docs/requisitos/funcionais"
FLATTEN casos_de_uso AS uc
GROUP BY uc
SORT uc ASC
```

## RN → RF → UC

```dataview
TABLE WITHOUT ID link(rn) AS "Regra", rows.file.link AS "Requisitos funcionais", map(unique(flat(rows.casos_de_uso)), (x) => link(x)) AS "Casos de uso"
FROM "docs/requisitos/funcionais"
FLATTEN regras AS rn
GROUP BY rn
SORT rn ASC
```

## Casos de uso sem requisito funcional

```dataview
TABLE WITHOUT ID file.link AS "Caso de uso", titulo AS "Nome"
FROM "docs/casos-de-uso"
WHERE length(requisitos_funcionais) = 0
SORT id ASC
```

## Itens com rastreabilidade pendente

```dataview
TABLE WITHOUT ID file.link AS "Item", tipo AS "Tipo"
FROM "docs"
WHERE rastreabilidade_pendente = true
SORT id ASC
```
