"""Gera o TG em .docx a partir do tg-ani.md, sobre uma cópia do modelo da Fatec.

Base: TG_Matheus_Ani_modelo.docx (raiz do repositório, não versionado).
A capa, a folha de rosto e o bloco título/autor são mantidos como estão;
todo o resto do corpo é substituído pelo conteúdo do tg-ani.md.

Regras de formatação (decididas com o autor):
- só estilos que já existem no modelo; sem cor, sem trocar fonte nem tamanho;
- capítulo: Normal sem recuo, negrito, nova página;
- seção x.x: Normal sem recuo; x.x.x e títulos sem número: itálico;
- quadros e figuras: título acima ("Quadro N – ..."), fonte abaixo, 10 pt,
  como nos quadros de exemplo do modelo.

Uso:
    python scripts/gerar_docx.py                # documento completo
    python scripts/gerar_docx.py --ate "## 2.5" # para antes desse título
"""
from __future__ import annotations

import argparse
import copy
import re
import sys
from pathlib import Path

import docx
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "TG_Matheus_Ani_modelo.docx"
FONTE_MD = RAIZ / "tg-ani.md"
SAIDA = RAIZ / "entrega" / "TG-Ani.docx"
FIGURAS = RAIZ / "entrega" / "figuras"

# Último parágrafo mantido do modelo (bloco título/autor antes do Resumo).
IDX_ULTIMO_MANTIDO = 31
# Parágrafos do modelo reaproveitados (cópia) para o Resumo/Abstract.
IDX_RESUMO_TIT, IDX_RESUMO_TXT, IDX_PALAVRAS = 33, 35, 41
IDX_ABSTRACT_TIT, IDX_ABSTRACT_TXT, IDX_KEYWORDS = 43, 45, 47

ESPACO_15 = 360  # uma linha de 1,5 em 12 pt (twips), separação ABNT de títulos
LARGURA_TEXTO = 9060  # twips (16 cm), largura dos quadros do modelo

PLACEHOLDER = "[preencher]"

# Títulos dos quadros que não têm título no tg-ani.md, na ordem em que
# aparecem. Quando o rascunho do autor já tinha um título, ele foi reaproveitado.
TITULOS_QUADROS = [
    "Ficha Técnica do Projeto",
    "Eixo Filosófico por Ato do Projeto",
    "Síntese do Termo de Abertura",
    "Ficha do Produto",
    "Stakeholders do Projeto",
    "Riscos Iniciais",
    "Progressão Visual por Ato do Projeto",
    "Clima Sonoro por Ato",
    "Requisitos Funcionais do sistema",
    "Requisitos Não Funcionais do sistema",
]

# Figuras exportadas do draw.io (ou PNG existente, no caso do BPMN).
IMAGENS_FIGURAS = {
    1: RAIZ / "docs" / "bpmn" / "ani-bpmn.png",
}

HEBRAICO = re.compile(r"([֐-׿יִ-ﭏ]+(?:\s+[֐-׿יִ-ﭏ]+)*)")
INLINE = re.compile(r"(\*\*.+?\*\*|`[^`]+`|(?<![\w*])\*[^*\s][^*]*?\*(?![\w*]))")


# ---------------------------------------------------------------- XML helpers
def _set(el, tag, **attrs):
    """Garante um filho `tag` em `el` com os atributos dados (w:...)."""
    child = el.find(qn(tag))
    if child is None:
        child = OxmlElement(tag)
        el.append(child)
    for k, v in attrs.items():
        child.set(qn(f"w:{k}"), str(v))
    return child


def _ppr(p):
    return p._p.get_or_add_pPr()


def formatar_paragrafo(p, *, primeira=None, esquerda=None, deslocamento=None,
                       alinhamento=None, antes=None, depois=None, simples=False,
                       manter_com_proximo=False, quebra_antes=False):
    pf = p.paragraph_format
    if quebra_antes:
        pf.page_break_before = True
    if manter_com_proximo:
        pf.keep_with_next = True
    if any(v is not None for v in (primeira, esquerda, deslocamento)):
        ind = OxmlElement("w:ind")
        if esquerda is not None:
            ind.set(qn("w:left"), str(esquerda))
        if deslocamento is not None:
            ind.set(qn("w:hanging"), str(deslocamento))
        elif primeira is not None:
            ind.set(qn("w:firstLine"), str(primeira))
        ppr = _ppr(p)
        old = ppr.find(qn("w:ind"))
        if old is not None:
            ppr.remove(old)
        ppr.append(ind)
    if alinhamento is not None:
        p.alignment = alinhamento
    if antes is not None:
        pf.space_before = Pt(antes / 20)
    if depois is not None:
        pf.space_after = Pt(depois / 20)
    if simples:
        pf.line_spacing = 1.0


def adicionar_runs(p, texto, *, negrito=False, italico=False, tamanho=None):
    """Adiciona `texto` ao parágrafo interpretando **negrito**, *itálico* e `código`."""
    for parte in INLINE.split(texto):
        if not parte:
            continue
        b, i, t = negrito, italico, parte
        if parte.startswith("**") and parte.endswith("**") and len(parte) > 4:
            b, t = True, parte[2:-2]
        elif parte.startswith("`") and parte.endswith("`"):
            t = parte[1:-1]
        elif parte.startswith("*") and parte.endswith("*") and len(parte) > 2:
            i, t = True, parte[1:-1]
        for seg in HEBRAICO.split(t):
            if not seg:
                continue
            r = p.add_run()
            for k, pedaco in enumerate(seg.split("­")):
                if k:  # hífen opcional no formato do Word
                    r._r.append(OxmlElement("w:softHyphen"))
                if pedaco:
                    wt = OxmlElement("w:t")
                    wt.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
                    wt.text = pedaco
                    r._r.append(wt)
            if b:
                r.bold = True
            if i:
                r.italic = True
            if tamanho:
                r.font.size = Pt(tamanho)
            if HEBRAICO.fullmatch(seg):
                rpr = r._r.get_or_add_rPr()
                # Mesma família (Arial) para o script complexo e direção RTL.
                fonts = rpr.find(qn("w:rFonts"))
                if fonts is None:
                    fonts = OxmlElement("w:rFonts")
                    rpr.insert(0, fonts)
                fonts.set(qn("w:cs"), "Arial")
                _set(rpr, "w:rtl")


def limpar_marcas(el):
    """Remove realce, sombreamento e cor herdados das cópias de parágrafos do modelo."""
    for tag in ("w:highlight", "w:shd", "w:color"):
        for x in el.iter(qn(tag)):
            x.getparent().remove(x)


# ------------------------------------------------------------- markdown parse
def ler_blocos(md: str, ate: str | None):
    linhas = md.splitlines()
    blocos, i = [], 0
    while i < len(linhas):
        ln = linhas[i]
        if ate and ln.strip().startswith(ate):
            break
        s = ln.strip()
        if not s:
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            blocos.append(("titulo", len(m.group(1)), m.group(2).strip()))
            i += 1
            continue
        if s.startswith("|"):
            tab = []
            while i < len(linhas) and linhas[i].strip().startswith("|"):
                cel = [c.strip() for c in linhas[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c) for c in cel):
                    tab.append(cel)
                i += 1
            blocos.append(("tabela", tab))
            continue
        m = re.fullmatch(r"\[(Figura \d+) – (.+)\]", s)
        if m:
            blocos.append(("figura", int(m.group(1).split()[1]), m.group(2)))
            i += 1
            continue
        if re.match(r"^(-|\d+\.)\s+", s):
            ordenada = bool(re.match(r"^\d+\.", s))
            itens = []
            while i < len(linhas) and re.match(r"^\s*(-|\d+\.)\s+", linhas[i]):
                itens.append(re.sub(r"^\s*(-|\d+\.)\s+", "", linhas[i]).strip())
                i += 1
            blocos.append(("lista", ordenada, itens))
            continue
        par = [s]
        i += 1
        while i < len(linhas) and linhas[i].strip() and not re.match(
                r"^(#|\||-\s|\d+\.\s|\[Figura)", linhas[i].strip()):
            par.append(linhas[i].strip())
            i += 1
        blocos.append(("paragrafo", " ".join(par)))
    return blocos


# ------------------------------------------------------------------ geração
class Gerador:
    def __init__(self, doc):
        self.doc = doc
        self.n_quadro = 0
        self.n_figura = 0
        self.titulos_quadros = iter(TITULOS_QUADROS)

    # ---- elementos de texto
    def titulo(self, nivel, texto):
        d = self.doc
        p = d.add_paragraph(style="Normal")
        if nivel == 1:
            formatar_paragrafo(p, primeira=0, quebra_antes=True, antes=0,
                               depois=ESPACO_15, manter_com_proximo=True)
            adicionar_runs(p, texto, negrito=True)
        else:
            numerado = bool(re.match(r"^\d+(\.\d+)+\s", texto))
            formatar_paragrafo(p, primeira=0, antes=ESPACO_15, depois=ESPACO_15,
                               manter_com_proximo=True)
            italico = not (nivel == 2 and numerado)
            adicionar_runs(p, texto, italico=italico)

    def paragrafo(self, texto):
        texto = self._numerar_citacao(texto)
        p = self.doc.add_paragraph(style="0-Normal")
        adicionar_runs(p, texto)

    def lista(self, ordenada, itens):
        for k, item in enumerate(itens):
            marca = f"{k + 1}." if ordenada else f"{chr(ord('a') + k)})"
            p = self.doc.add_paragraph(style="0-Normal")
            formatar_paragrafo(p, esquerda=1134, deslocamento=425)
            p.add_run(marca + "\t")
            adicionar_runs(p, item)

    def _numerar_citacao(self, texto):
        if "Quadro X" in texto:
            texto = texto.replace("Quadro X", f"Quadro {self.n_quadro + 1}")
        return texto

    # ---- legendas (padrão dos quadros de exemplo do modelo)
    def legenda(self, rotulo, titulo):
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, alinhamento=1, antes=240,
                           simples=True, manter_com_proximo=True)
        r = p.add_run(f"{rotulo} – ")
        r.bold = True
        r.font.size = Pt(10)
        adicionar_runs(p, titulo, tamanho=10)

    def fonte(self):
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, simples=True, depois=ESPACO_15)
        r = p.add_run("Fonte: Autor")
        r.font.size = Pt(10)

    # ---- tabelas
    def _tabela(self, n_cols, larguras):
        t = self.doc.add_table(rows=0, cols=n_cols)
        t.style = self.doc.styles["Table Grid"]
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        tblpr = t._tbl.tblPr
        _set(tblpr, "w:tblW", w=sum(larguras), type="dxa")
        _set(tblpr, "w:tblLayout", type="fixed")
        grid = t._tbl.tblGrid
        for gc, w in zip(grid.findall(qn("w:gridCol")), larguras):
            gc.set(qn("w:w"), str(w))
        return t

    @staticmethod
    def _celula(cell, largura, linhas, span=1):
        tcpr = cell._tc.get_or_add_tcPr()
        _set(tcpr, "w:tcW", w=largura, type="dxa")
        if span > 1:
            _set(tcpr, "w:gridSpan", val=span)
        primeiro = True
        for partes in linhas:
            p = cell.paragraphs[0] if primeiro else cell.add_paragraph()
            primeiro = False
            p.style = "Normal"
            formatar_paragrafo(p, primeira=0, alinhamento=0, simples=True,
                               antes=0, depois=0)
            for texto, negrito in partes:
                adicionar_runs(p, texto, negrito=negrito, tamanho=10)

    def _linha(self, t, celulas, manter_com_proxima=False):
        """celulas: lista de (largura, linhas, span); cada linha é [(texto, negrito)].

        A linha nunca se divide entre páginas; com `manter_com_proxima`, ela
        também fica na mesma página da linha seguinte.
        """
        tr = OxmlElement("w:tr")
        t._tbl.append(tr)
        _set(_trpr(tr), "w:cantSplit")
        for largura, linhas, span in celulas:
            tc = OxmlElement("w:tc")
            tc.append(OxmlElement("w:p"))
            tr.append(tc)
            cell = docx.table._Cell(tc, t)
            self._celula(cell, largura, linhas, span)
            if manter_com_proxima:
                for p in cell.paragraphs:
                    p.paragraph_format.keep_with_next = True
        return tr

    def tabela_generica(self, linhas_md, titulo):
        n = len(linhas_md[0])
        pesos = []
        for c in range(n):
            maior = max(len(re.sub(r"[*`]", "", l[c])) if c < len(l) else 0 for l in linhas_md)
            pesos.append(min(max(maior, 6), 60))
        larguras = [int(LARGURA_TEXTO * w / sum(pesos)) for w in pesos]
        larguras[-1] += LARGURA_TEXTO - sum(larguras)
        self.legenda(f"Quadro {self.n_quadro}", titulo)
        t = self._tabela(n, larguras)
        for k, l in enumerate(linhas_md):
            l = (l + [""] * n)[:n]
            celulas = []
            for largura, txt in zip(larguras, l):
                linhas = [[(seg, k == 0)] for seg in txt.split("<br>")]
                celulas.append((largura, linhas, 1))
            tr = self._linha(t, celulas)
            if k == 0:  # repete o cabeçalho se o quadro quebrar de página
                _set(_trpr(tr), "w:tblHeader")
        self.fonte()

    def tabela_rf(self, linhas_md, titulo):
        cab = [c.lower() for c in linhas_md[0]]
        ic, it, ica, ip, idesc = (cab.index(x) for x in
                                  ("código", "título", "categoria", "prioridade", "descrição"))
        w = LARGURA_TEXTO // 3
        larguras = [w, w, LARGURA_TEXTO - 2 * w]
        self.legenda(f"Quadro {self.n_quadro}", titulo)
        t = self._tabela(3, larguras)
        for l in linhas_md[1:]:
            cat, pri = l[ica].strip().lower(), l[ip].strip().lower()
            marca = lambda ok: "(X)" if ok else "(  )"
            self._linha(t, [
                (larguras[0], [[(l[ic], True), ("-" + l[it], False)]], 1),
                (larguras[1], [[("Categoria:", False)],
                               [(f"{marca(cat == 'oculto')} Oculto", False)],
                               [(f"{marca(cat == 'evidente')} Evidente", False)]], 1),
                (larguras[2], [[("Prioridade:", False)]] +
                 [[(f"{marca(pri == nome.lower())} {nome}", False)]
                  for nome in ("Altíssima", "Alta", "Média", "Baixa")], 1),
            ], manter_com_proxima=True)
            self._linha(t, [(LARGURA_TEXTO, [[("Descrição", True), (": " + l[idesc], False)]], 3)])
        self.fonte()

    def tabela_rnf(self, linhas_md, titulo):
        cab = [c.lower() for c in linhas_md[0]]
        ic, inome, ireq, itipo, icl = (cab.index(x) for x in
                                       ("código", "nome", "requisito", "tipo", "classificação"))
        marca = lambda ok: "(X)" if ok else "(  )"
        # Mesmas 5 colunas do quadro de exemplo; larguras medidas para que
        # nenhuma palavra quebre no meio, com a sobra indo para a descrição.
        # Palavras acima do limite recebem hífen opcional (hifenizar).
        corpo = linhas_md[1:]
        palavras_nome = [w for l in corpo for w in l[inome].split()]
        palavras_tipo = [w for l in corpo for w in l[itipo].split()]
        larguras = [
            min(largura_minima(palavras_nome, negrito=True), 1750),
            0,
            min(largura_minima(palavras_tipo), 1600),
            largura_minima([f"{marca(False)} Obrigatório"]),
            largura_minima([f"{marca(False)} Permanente", f"{marca(False)} Transitório"]),
        ]
        larguras[1] = LARGURA_TEXTO - sum(larguras)
        corpo = [list(l) for l in corpo]
        for l in corpo:
            l[inome] = hifenizar(l[inome], larguras[0], negrito=False)
            l[itipo] = hifenizar(l[itipo], larguras[2])
        linhas_md = [linhas_md[0]] + corpo
        self.legenda(f"Quadro {self.n_quadro}", titulo)
        t = self._tabela(5, larguras)
        for l in linhas_md[1:]:
            cl = l[icl].lower()
            self._linha(t, [
                (larguras[0], [[(l[ic], True), ("-" + l[inome], False)]], 1),
                (larguras[1], [[(l[ireq], False)]], 1),
                (larguras[2], [[(l[itipo], False)]], 1),
                (larguras[3], [[(f"{marca('desejável' in cl)} Desejável", False)],
                               [(f"{marca('obrigatório' in cl)} Obrigatório", False)]], 1),
                (larguras[4], [[(f"{marca('permanente' in cl)} Permanente", False)],
                               [(f"{marca('transitório' in cl)} Transitório", False)]], 1),
            ])
        self.fonte()

    def tabela(self, linhas_md):
        self.n_quadro += 1
        titulo = next(self.titulos_quadros, PLACEHOLDER)
        cab = [c.lower() for c in linhas_md[0]]
        if cab[:2] == ["código", "título"] and "prioridade" in cab:
            self.tabela_rf(linhas_md, titulo)
        elif cab[:2] == ["código", "nome"] and "classificação" in cab:
            self.tabela_rnf(linhas_md, titulo)
        else:
            self.tabela_generica(linhas_md, titulo)

    # ---- figuras
    def figura(self, numero, titulo):
        self.n_figura += 1
        if numero != self.n_figura:
            print(f"AVISO: Figura {numero} fora de sequência (esperado {self.n_figura})",
                  file=sys.stderr)
        self.legenda(f"Figura {self.n_figura}", titulo)
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, alinhamento=1, simples=True,
                           manter_com_proximo=True)
        img = IMAGENS_FIGURAS.get(numero)
        if img and img.exists():
            from PIL import Image
            with Image.open(img) as im:
                lw, lh = im.size
            larg, alt_max = 16.0, 21.0
            if lh / lw * larg > alt_max:
                p.add_run().add_picture(str(img), height=Cm(alt_max))
            else:
                p.add_run().add_picture(str(img), width=Cm(larg))
        else:
            p.add_run(f"[inserir imagem: {titulo}]")
        self.fonte()


_FONTES_MEDIDA = {}


def largura_minima(palavras, negrito=False, tamanho_pt=10):
    """Largura (twips) da maior palavra em Arial `tamanho_pt`, mais as margens da célula."""
    from PIL import ImageFont
    arq = r"C:\Windows\Fonts\arialbd.ttf" if negrito else r"C:\Windows\Fonts\arial.ttf"
    fonte = _FONTES_MEDIDA.setdefault(arq, ImageFont.truetype(arq, 200))
    maior = max(fonte.getlength(p) for p in palavras)  # px a 200 px/em
    return int(maior / 200 * tamanho_pt * 20) + 2 * 108 + 60  # + margens + folga


VOGAIS = set("aeiouáéíóúâêôãõàAEIOUÁÉÍÓÚÂÊÔÃÕ")


def hifenizar(texto, largura, negrito=False):
    """Insere hífen opcional (U+00AD) nas palavras que não cabem na coluna.

    Marca todos os pontos vogal | consoante + vogal (divisão silábica simples
    do português, sem separar a última sílaba de 1 letra); o Word escolhe
    onde quebrar, e o hífen só aparece se a palavra for de fato quebrada.
    """
    saida = []
    for w in texto.split(" "):
        if w and largura_minima([w], negrito) > largura:
            pontos = [i for i in range(2, len(w) - 2)
                      if w[i - 1] in VOGAIS and w[i] not in VOGAIS and w[i + 1] in VOGAIS]
            for i in reversed(pontos):
                w = w[:i] + "­" + w[i:]
        saida.append(w)
    return " ".join(saida)


def _trpr(tr):
    trpr = tr.find(qn("w:trPr"))
    if trpr is None:
        trpr = OxmlElement("w:trPr")
        tr.insert(0, trpr)
    return trpr


def substituir_texto(p_el, textos):
    """Mantém o parágrafo copiado; troca o texto dos runs, na ordem, e remove os demais."""
    runs = p_el.findall(qn("w:r"))
    for k, r in enumerate(runs):
        if k < len(textos):
            for t in r.findall(qn("w:t")):
                r.remove(t)
            t = OxmlElement("w:t")
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
            t.text = textos[k]
            r.append(t)
        else:
            p_el.remove(r)


def montar_resumo(body, copias):
    vazio = copy.deepcopy(copias["vazio"])
    for chave, textos in (("resumo_tit", None), ("vazio", None),
                          ("resumo_txt", [PLACEHOLDER]), ("vazio", None),
                          ("palavras", ["Palavras-chave:", f" {PLACEHOLDER}."]),
                          ("vazio", None), ("abstract_tit", None), ("vazio", None),
                          ("abstract_txt", [PLACEHOLDER]), ("vazio", None),
                          ("keywords", ["Keywords:", f" {PLACEHOLDER}."])):
        el = copy.deepcopy(copias[chave])
        if textos:
            substituir_texto(el, textos)
        limpar_marcas(el)
        body.insert(len(body) - 1, el)


def remover_imagens_orfas(doc):
    xml = doc.element.xml
    for rid, rel in list(doc.part.rels.items()):
        if rel.reltype.endswith("/image") and f'"{rid}"' not in xml:
            del doc.part.rels[rid]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ate", help='para antes da linha que começa com este texto (ex.: "## 2.5")')
    ap.add_argument("--saida", type=Path, default=SAIDA)
    args = ap.parse_args()

    doc = docx.Document(str(BASE))
    body = doc.element.body
    filhos = list(body)
    copias = {
        "resumo_tit": filhos[IDX_RESUMO_TIT], "resumo_txt": filhos[IDX_RESUMO_TXT],
        "palavras": filhos[IDX_PALAVRAS], "abstract_tit": filhos[IDX_ABSTRACT_TIT],
        "abstract_txt": filhos[IDX_ABSTRACT_TXT], "keywords": filhos[IDX_KEYWORDS],
        "vazio": filhos[IDX_RESUMO_TIT - 1],
    }
    copias = {k: copy.deepcopy(v) for k, v in copias.items()}
    for el in filhos[IDX_ULTIMO_MANTIDO + 1:]:
        if el.tag != qn("w:sectPr"):
            body.remove(el)

    montar_resumo(body, copias)

    g = Gerador(doc)
    for b in ler_blocos(FONTE_MD.read_text(encoding="utf-8"), args.ate):
        tipo = b[0]
        if tipo == "titulo":
            g.titulo(b[1], b[2])
        elif tipo == "paragrafo":
            g.paragrafo(b[1])
        elif tipo == "lista":
            g.lista(b[1], b[2])
        elif tipo == "tabela":
            g.tabela(b[1])
        elif tipo == "figura":
            g.figura(b[1], b[2])

    remover_imagens_orfas(doc)
    args.saida.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(args.saida))
    print(f"Gerado: {args.saida} ({g.n_quadro} quadros, {g.n_figura} figuras)")


if __name__ == "__main__":
    main()
