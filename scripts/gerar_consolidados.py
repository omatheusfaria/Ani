"""Gera os arquivos consolidados de requisitos, regras e casos de uso a partir
das notas individuais do cofre (a fonte de verdade).

Uso: python scripts/gerar_consolidados.py [--verificar]

Com --verificar, não grava nada: só informa se os consolidados estão
desatualizados em relação às notas (código de saída 1 nesse caso).
"""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(RAIZ, "docs")
MODELOS = os.path.join(RAIZ, "scripts", "modelos")
AVISO = "<!-- Gerado por scripts/gerar_consolidados.py a partir das notas individuais. Não edite à mão. -->"

TIPOS = {
    "RF": ("requisitos/funcionais", r"RF\d{3}", "requisitos/requisitos-funcionais.md"),
    "RNF": ("requisitos/nao-funcionais", r"RNF\d{3}", "requisitos/requisitos-nao-funcionais.md"),
    "RN": ("regras-de-negocio", r"RN\d{3}", "requisitos/regras-de-negocio.md"),
    "UC": ("casos-de-uso", r"UC-S\d{3}", "casos-de-uso/casos-de-uso.md"),
}


def valor_yaml(v):
    v = v.strip()
    if v in ("null", "~", ""):
        return None
    if v in ("true", "false"):
        return v == "true"
    if v.startswith("[") and v.endswith("]"):
        return [x.strip() for x in v[1:-1].split(",") if x.strip()]
    if v.startswith('"') and v.endswith('"'):
        return v[1:-1].replace('\\"', '"')
    return v


def celulas(linha):
    linha = linha.strip()
    if linha.startswith("|"):
        linha = linha[1:]
    if linha.endswith("|"):
        linha = linha[:-1]
    return [c.strip() for c in linha.split("|")]


def ler_nota(caminho):
    with open(caminho, encoding="utf-8") as f:
        texto = f.read().replace("\r\n", "\n")
    m = re.match(r"---\n(.*?)\n---\n(.*)", texto, re.S)
    if not m:
        raise SystemExit(f"{caminho}: frontmatter ausente")
    fm = {}
    for linha in m.group(1).split("\n"):
        if ":" in linha:
            chave, _, valor = linha.partition(":")
            fm[chave.strip()] = valor_yaml(valor)
    corpo = m.group(2).split("\n## Relacionamentos")[0]
    tabela = [l for l in corpo.split("\n") if l.startswith("|")]
    if len(tabela) < 3:
        raise SystemExit(f"{caminho}: tabela do item não encontrada")
    return fm, tabela


def notas(tipo):
    pasta, padrao, _ = TIPOS[tipo]
    base = os.path.join(DOCS, pasta)
    for nome in sorted(os.listdir(base)):
        if re.fullmatch(padrao + r"\.md", nome):
            fm, tabela = ler_nota(os.path.join(base, nome))
            if fm.get("id") != nome[:-3]:
                raise SystemExit(f"{nome}: id do frontmatter ({fm.get('id')}) difere do nome do arquivo")
            yield fm, tabela


def linha_do_item(fm, tabela):
    """Tabela de uma linha (RF, RNF, RN): devolve {coluna: valor}."""
    cab = celulas(tabela[0])
    linha = next(l for l in tabela[2:] if celulas(l)[0] == fm["id"])
    return dict(zip(cab, celulas(linha)))


def conferir(fm, campo, valor):
    if fm.get(campo) is not None and fm[campo] != valor:
        raise SystemExit(f"{fm['id']}: '{campo}' no frontmatter ({fm[campo]}) difere da tabela da nota ({valor})")


def marcar(item, opcoes, valor):
    """Opções no estilo de caixa de seleção do modelo: (X) Escolhida (  ) Outra."""
    if valor is None:
        return " ".join(f"(  ) {o}" for o in opcoes)
    if valor.lower() not in (o.lower() for o in opcoes):
        raise SystemExit(f"{item}: valor '{valor}' fora das opções do modelo {opcoes}")
    return " ".join(f"({'X' if o.lower() == valor.lower() else '  '}) {o}" for o in opcoes)


def quadro_rf():
    blocos = []
    for fm, tabela in notas("RF"):
        c = linha_do_item(fm, tabela)
        conferir(fm, "titulo", c["Título"])
        conferir(fm, "prioridade", c["Prioridade"])
        conferir(fm, "visibilidade", c["Categoria"])
        categoria = marcar(fm["id"], ["Oculto", "Evidente"], c["Categoria"])
        prioridade = marcar(fm["id"], ["Altíssima", "Alta", "Média", "Baixa"], c["Prioridade"])
        blocos.append("\n".join([
            f"| {fm['id']}-{c['Título']} | Categoria: {categoria} | Prioridade: {prioridade} |",
            "| --- | --- | --- |",
            f"| **Descrição**: {c['Descrição']} | | |",
        ]))
    return "**Quadro 1 – Requisitos Funcionais do sistema**\n\n" + "\n\n".join(blocos)


def quadro_rnf():
    # O modelo não tem linha de cabeçalho: cada RNF é uma linha de cinco colunas.
    blocos = []
    for fm, tabela in notas("RNF"):
        c = linha_do_item(fm, tabela)
        classif, _, vig = c["Classificação"].partition(",")
        conferir(fm, "classificacao", classif.strip())
        conferir(fm, "vigencia", vig.strip() or None)
        nome = f"{fm['id']}-{fm['nome']}" if fm.get("nome") else fm["id"]
        tipo = fm.get("tipo_rnf") or "—"
        obrig = marcar(fm["id"], ["Desejável", "Obrigatório"], classif.strip())
        perm = marcar(fm["id"], ["Permanente", "Transitório"], vig.strip() or None)
        blocos.append("\n".join([
            f"| {nome} | {c['Requisito']} | {tipo} | {obrig} | {perm} |",
            "| --- | --- | --- | --- | --- |",
        ]))
    return "**Quadro 2 – Requisitos Não Funcionais do sistema**\n\n" + "\n\n".join(blocos)


def quadro_rn():
    blocos = []
    for fm, tabela in notas("RN"):
        c = linha_do_item(fm, tabela)
        conferir(fm, "titulo", c["Nome"])
        blocos.append("\n".join([
            f"| {fm['id']} - {c['Nome']} |",
            "| --- |",
            f"| **Descrição**: {c['Descrição']} |",
        ]))
    return "**Quadro 3 – Regras de Negócio do sistema**\n\n" + "\n\n".join(blocos)


# Campos do modelo da Fatec, na ordem exigida: (rótulo no quadro, rótulo na nota)
CAMPOS_UC = [
    ("ID", "ID"),
    ("Descrição", "Descrição"),
    ("Ator Primário", "Ator Primário"),
    ("Pré-condição", "Pré-condição"),
    ("Cenário Principal", "Cenário Principal"),
    ("Pós-condição", "Pós-condição"),
    ("Cenário Alternativo", "Cenários Alternativos"),
]


def campos_uc(tabela):
    return {celulas(l)[0].strip("*"): celulas(l)[1] for l in tabela[2:]}


def quadros_uc():
    indice = ["**Índice de Casos de Uso**", "", "| ID | Nome | Ator Primário |", "| --- | --- | --- |"]
    blocos = []
    # No TG, os quadros 1 a 3 são RF, RNF e RN; cada caso de uso tem o seu, a partir do 4.
    for n, (fm, tabela) in enumerate(notas("UC"), start=4):
        f = campos_uc(tabela)
        conferir(fm, "titulo", f["Nome revisado"])
        conferir(fm, "ator_primario", f["Ator Primário"])
        indice.append(f"| {fm['id']} | {f['Nome revisado']} | {f['Ator Primário']} |")
        bloco = [f"**Quadro {n} – Use Case {f['Nome revisado']}**", "",
                 f"| Caso de Uso – {f['Nome revisado']} | |", "| --- | --- |"]
        bloco += [f"| **{rotulo}** | {f[campo]} |" for rotulo, campo in CAMPOS_UC]
        blocos.append("\n".join(bloco))
    return "\n".join(indice), "\n\n---\n\n".join(blocos)


def montar(modelo, **trechos):
    with open(os.path.join(MODELOS, modelo), encoding="utf-8") as f:
        texto = f.read()
    for chave, valor in trechos.items():
        texto = texto.replace("{{%s}}" % chave, valor)
    return AVISO + "\n\n" + texto


def main():
    verificar = "--verificar" in sys.argv
    indice_uc, quadro_uc = quadros_uc()
    saidas = {
        TIPOS["RF"][2]: montar("requisitos-funcionais.md", QUADRO=quadro_rf()),
        TIPOS["RNF"][2]: montar("requisitos-nao-funcionais.md", QUADRO=quadro_rnf()),
        TIPOS["RN"][2]: montar("regras-de-negocio.md", QUADRO=quadro_rn()),
        TIPOS["UC"][2]: montar("casos-de-uso.md", INDICE=indice_uc, QUADRO=quadro_uc),
    }
    desatualizados = []
    for rel, conteudo in saidas.items():
        caminho = os.path.join(DOCS, rel)
        atual = None
        if os.path.exists(caminho):
            with open(caminho, encoding="utf-8") as f:
                atual = f.read().replace("\r\n", "\n")
        if atual == conteudo:
            continue
        desatualizados.append(rel)
        if not verificar:
            with open(caminho, "w", encoding="utf-8", newline="\n") as f:
                f.write(conteudo)
    for rel in desatualizados:
        print(("desatualizado: " if verificar else "gerado: ") + "docs/" + rel)
    if not desatualizados:
        print("consolidados em dia")
    sys.exit(1 if verificar and desatualizados else 0)


if __name__ == "__main__":
    main()
