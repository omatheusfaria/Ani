# Índice de requisitos

## Requisitos funcionais

```dataview
TABLE WITHOUT ID file.link AS "ID", titulo AS "Título", prioridade AS "Prioridade", visibilidade AS "Visibilidade"
FROM "docs/requisitos/funcionais"
WHERE tipo = "requisito-funcional"
SORT id ASC
```

- [RF001](requisitos/funcionais/RF001.md) — Movimentar personagem
- [RF002](requisitos/funcionais/RF002.md) — Colisão com cenário e objetos
- [RF003](requisitos/funcionais/RF003.md) — Interagir com objetos
- [RF004](requisitos/funcionais/RF004.md) — Sistema de memórias
- [RF005](requisitos/funcionais/RF005.md) — Diário de memórias
- [RF006](requisitos/funcionais/RF006.md) — Desbloqueio progressivo do cenário
- [RF007](requisitos/funcionais/RF007.md) — Sistema de puzzles
- [RF008](requisitos/funcionais/RF008.md) — Diálogos com personagens de memória
- [RF009](requisitos/funcionais/RF009.md) — Sistema de save/load
- [RF010](requisitos/funcionais/RF010.md) — Feedback sonoro e musical por ato
- [RF011](requisitos/funcionais/RF011.md) — Suporte a gamepad
- [RF012](requisitos/funcionais/RF012.md) — Progressão por atos filosóficos
- [RF013](requisitos/funcionais/RF013.md) — Mecânica de peso literal no Ato I
- [RF014](requisitos/funcionais/RF014.md) — Mecânica de ecos de decisão no Ato II
- [RF015](requisitos/funcionais/RF015.md) — Mecânica de restauração por aceitação no Ato III
- [RF016](requisitos/funcionais/RF016.md) — Mecânica de contemplação ativa no Ato IV
- [RF017](requisitos/funcionais/RF017.md) — Dissolução de mecânicas no Ato V
- [RF018](requisitos/funcionais/RF018.md) — Crises de ansiedade como elemento sensorial
- [RF019](requisitos/funcionais/RF019.md) — Conclusão da sequência de memórias no Ato I
- [RF020](requisitos/funcionais/RF020.md) — Aviso de conteúdo sensível
- [RF021](requisitos/funcionais/RF021.md) — Pausar jogo
- [RF022](requisitos/funcionais/RF022.md) — Configurar vídeo e áudio
- [RF023](requisitos/funcionais/RF023.md) — Sair do jogo
- [RF024](requisitos/funcionais/RF024.md) — Celular em primeira pessoa
- [RF025](requisitos/funcionais/RF025.md) — Iluminação do ambiente
- [RF026](requisitos/funcionais/RF026.md) — Inspeção de objetos em primeira pessoa
- [RF027](requisitos/funcionais/RF027.md) — Acesso a memórias por objeto-portal
- [RF028](requisitos/funcionais/RF028.md) — Compra e consumo de comidas
- [RF029](requisitos/funcionais/RF029.md) — Minigames
- [RF030](requisitos/funcionais/RF030.md) — Personagem acompanhante
- [RF031](requisitos/funcionais/RF031.md) — Salvamento automático

## Requisitos não funcionais

```dataview
TABLE WITHOUT ID file.link AS "ID", classificacao AS "Classificação", vigencia AS "Vigência", titulo AS "Requisito"
FROM "docs/requisitos/nao-funcionais"
WHERE tipo = "requisito-nao-funcional"
SORT id ASC
```

- [RNF001](requisitos/nao-funcionais/RNF001.md) — O sistema deve manter taxa mínima de 60 FPS em hardware equivalente a Intel HD Graphics e 4 GB de RAM.
- [RNF002](requisitos/nao-funcionais/RNF002.md) — O sistema deve carregar saves locais em menos de 5 segundos e preservar a integridade dos dados de progresso por ato.
- [RNF003](requisitos/nao-funcionais/RNF003.md) — O sistema deve ser estruturado de forma a permitir adaptação para outras plataformas com alterações mínimas no código e nos assets.
- [RNF004](requisitos/nao-funcionais/RNF004.md) — O sistema deve permitir que novos jogadores compreendam as mecânicas básicas sem necessidade de tutorial extenso ou instruções constantes em tela.
- [RNF005](requisitos/nao-funcionais/RNF005.md) — O sistema deve suportar internacionalização por meio de arquivos externos de texto, permitindo tradução para outros idiomas.
- [RNF006](requisitos/nao-funcionais/RNF006.md) — O sistema deve oferecer recursos de acessibilidade, incluindo controle de intensidade visual, legendas para efeitos sonoros e controle independente de volume por camada de áudio.
