"""Gera o TG em .docx a partir do tg-ani.md, sobre uma cópia do modelo da Fatec.

Base: TG_Matheus_Ani_modelo.docx (raiz do repositório, não versionado).
A capa, a folha de rosto e o bloco título/autor são mantidos como estão
(só o orientador recebe a titulação e o corpo passa a começar em nova
página); todo o resto do corpo é substituído pelo conteúdo do tg-ani.md.

Regras de formatação (decididas com o autor):
- só estilos que já existem no modelo; sem cor, sem trocar fonte nem tamanho;
- capítulo: Normal sem recuo, negrito, nova página;
- seção x.x: Normal sem recuo; x.x.x e títulos sem número: itálico;
- Referências e Apêndices: centralizados, negrito, nova página (ABNT);
- quadros e figuras: título acima ("Quadro N – ..."), fonte abaixo, 10 pt,
  como nos quadros de exemplo do modelo;
- figuras listadas em PAISAGEM ficam sozinhas numa seção em paisagem.

Figuras: PNG exportados dos .drawio para entrega/figuras/ com o CLI do
draw.io desktop, por exemplo:
    "C:\\Program Files\\draw.io\\draw.io.exe" -x -f png -s 3 -b 20 \\
        -o entrega/figuras/fig03-classes.png docs/diagrama-de-classe/diagrama-de-classe.drawio
O diagrama de classes usa -s 2: em -s 3 (mais de 8000 px) o draw.io corta a
imagem. A Figura 1 usa docs/bpmn/ani-bpmn.png.

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
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "TG_Matheus_Ani_modelo.docx"
FONTE_MD = RAIZ / "tg-ani.md"
SAIDA = RAIZ / "entrega" / "TG-Ani.docx"
FIGURAS = RAIZ / "entrega" / "figuras"
CAPTURAS = RAIZ / "docs" / "capturas"  # capturas de tela do protótipo (versionadas)

# Último parágrafo mantido do modelo (bloco título/autor antes do Resumo).
IDX_ULTIMO_MANTIDO = 31
# Parágrafos do modelo reaproveitados (cópia) para o Resumo/Abstract.
IDX_RESUMO_TIT, IDX_RESUMO_TXT, IDX_PALAVRAS = 33, 35, 41
IDX_ABSTRACT_TIT, IDX_ABSTRACT_TXT, IDX_KEYWORDS = 43, 45, 47

ORIENTADOR_DE, ORIENTADOR_PARA = "Prof. Dr./Me. ", "Prof. Me. "
IDX_VAZIO_CAPA = 25  # parágrafo vazio logo antes de "FRANCA/SP"
QUADRO_PEQUENO = 15  # quadros genéricos com até N linhas não se dividem entre páginas

ESPACO_15 = 360  # uma linha de 1,5 em 12 pt (twips), separação ABNT de títulos
LARGURA_TEXTO = 9060  # twips (16 cm), largura dos quadros do modelo

PLACEHOLDER = "[preencher]"

# Títulos dos quadros, na ordem em que aparecem (os quadros de caso de uso
# levam o título do próprio caso e não entram nesta lista).
TITULOS_QUADROS = [
    "Eixo Filosófico por Ato do Projeto",          # 1  Introdução
    "Síntese do Termo de Abertura",                # 2  1.1.1
    "Ficha do Produto",                            # 3  1.1.1
    "Stakeholders do Projeto",                     # 4  1.1.9
    "Riscos Iniciais",                             # 5  1.1.13
    "Progressão Visual por Ato do Projeto",        # 6  2.1
    "Clima Sonoro por Ato",                        # 7  2.1
    "Requisitos Funcionais do sistema",            # 8  2.3
    "Requisitos Não Funcionais do sistema",        # 9  2.4
    "Regras de Negócio do sistema",                # 10 2.5
    "Índice de Casos de Uso",                      # 11 2.6
    "Enumerações do Diagrama de Classes",          # 27 2.7
    "Relacionamentos entre Classes",               # 28 2.7
    "Artefatos e Ferramentas de Produção",         # 29 3
    "Correspondência entre o Modelo de Classes e o Protótipo",  # 30 4.1
    "Mapeamento de Controles",                     # 31 4.2.16
    "Atendimento dos Requisitos no Protótipo",     # 32 4.4
    "Recursos do Navegador Usados pelo Protótipo",  # 33 5.1
    "Testes de Portabilidade do Protótipo",        # 34 5.1
    "Peso dos Atores",                             # 35 5.2
    "Classificação dos Casos de Uso",              # 36 5.2
    "Fatores Técnicos",                            # 37 5.2
    "Fatores Ambientais",                          # 38 5.2
    "Cálculo dos Pontos de Caso de Uso",           # 39 5.2
    "Investimento Previsto",                       # 40 5.3
    "Cronograma de Produção",                      # 41 5.3
    "Ficha Técnica do Jogo",                       # 34 Apêndice C
    "Atos do Jogo",                                # 35 Apêndice C
]

# Figuras com imagem (as demais entram como placeholder).
IMAGENS_FIGURAS = {
    1: RAIZ / "docs" / "bpmn" / "ani-bpmn.png",
    2: FIGURAS / "fig02-casos-de-uso.png",
    3: FIGURAS / "fig03-classes.png",
    4: FIGURAS / "fig04-atividades-puzzle.png",
    5: FIGURAS / "fig05-atividades-ato-i.png",
    6: FIGURAS / "fig06-estados-jogo.png",
    7: FIGURAS / "fig07-sequencia-memoria.png",
    8: FIGURAS / "fig08-sequencia-save.png",
    9: FIGURAS / "fig09-der.png",
    # capturas de tela do protótipo (capítulo 4)
    **{n: CAPTURAS / nome for n, nome in {
        10: "fig10-quarto-luz.png",
        11: "fig11-celular-perfil.png",
        12: "fig12-panico.png",
        13: "fig13-quarto-escuro-luminaria.png",
        14: "fig14-interacao-escuro.png",
        15: "fig15-inspecao-estante.png",
        16: "fig16-papeis-zenital.png",
        17: "fig17-gaveta-tirinha.png",
        18: "fig18-capitulo-1.png",
        19: "fig19-conversa-baloes.png",
        20: "fig20-parque-acompanhante.png",
        21: "fig21-comida.png",
        22: "fig22-minigame.png",
        23: "fig23-menu.png",
        24: "fig24-aviso.png",
        25: "fig25-pausa-parque.png",
    }.items()},
}
PAISAGEM = {1, 3, 9}  # BPMN, classes e DER: largos demais para retrato

# Capítulos que ainda não existem no tg-ani.md; entram antes das Referências.
CAPITULOS_PENDENTES = ["6 Considerações Finais"]

HEBRAICO = re.compile(r"([\u0590-\u05FF\uFB1D-\uFB4F]+(?:\s+[\u0590-\u05FF\uFB1D-\uFB4F]+)*)")
INLINE = re.compile(r"(\*\*.+?\*\*|`[^`]+`|(?<![\w*])\*[^*\s][^*]*?\*(?![\w*]))")
FIGURA_LINHA = re.compile(r"\[(Figura (\d+)) – ([^\]]+)\]")
CODIGO_LINHA = re.compile(r"\[(Código (\d+)) – (.+)\]")


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


def _trpr(tr):
    trpr = tr.find(qn("w:trPr"))
    if trpr is None:
        trpr = OxmlElement("w:trPr")
        tr.insert(0, trpr)
    return trpr


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
        ppr = p._p.get_or_add_pPr()
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


def _run(p, texto, *, negrito=False, italico=False, tamanho=None):
    """Run com texto literal; U+00AD vira hífen opcional do Word."""
    r = p.add_run()
    for k, pedaco in enumerate(texto.split("\u00ad")):
        if k:
            r._r.append(OxmlElement("w:softHyphen"))
        if pedaco:
            wt = OxmlElement("w:t")
            wt.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
            wt.text = pedaco
            r._r.append(wt)
    if negrito:
        r.bold = True
    if italico:
        r.italic = True
    if tamanho:
        r.font.size = Pt(tamanho)
    return r


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
            r = _run(p, seg, negrito=b, italico=i, tamanho=tamanho)
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
        for x in list(el.iter(qn(tag))):
            x.getparent().remove(x)


# ------------------------------------------------------------ medidas/hífen
_FONTES_MEDIDA = {}
VOGAIS = set("aeiouáéíóúâêôãõàAEIOUÁÉÍÓÚÂÊÔÃÕ")


def largura_minima(palavras, negrito=False, tamanho_pt=10):
    """Largura (twips) da maior palavra em Arial `tamanho_pt`, mais as margens da célula."""
    from PIL import ImageFont
    arq = r"C:\Windows\Fonts\arialbd.ttf" if negrito else r"C:\Windows\Fonts\arial.ttf"
    fonte = _FONTES_MEDIDA.setdefault(arq, ImageFont.truetype(arq, 200))
    maior = max(fonte.getlength(p) for p in palavras)  # px a 200 px/em
    return int(maior / 200 * tamanho_pt * 20) + 2 * 108 + 60  # + margens + folga


def hifenizar(texto, largura, negrito=False):
    """Insere hífen opcional (U+00AD) nas palavras que não cabem na coluna.

    Marca todos os pontos vogal | consoante + vogal (divisão silábica simples
    do português); o Word escolhe onde quebrar, e o hífen só aparece se a
    palavra for de fato quebrada.
    """
    saida = []
    for w in texto.split(" "):
        if w and largura_minima([w], negrito) > largura:
            pontos = [i for i in range(2, len(w) - 2)
                      if w[i - 1] in VOGAIS and w[i] not in VOGAIS and w[i + 1] in VOGAIS]
            for i in reversed(pontos):
                w = w[:i] + "\u00ad" + w[i:]
        saida.append(w)
    return " ".join(saida)


# ------------------------------------------------------------- markdown parse
def ler_blocos(md: str, ate: str | None):
    linhas = md.splitlines()
    blocos, i = [], 0
    inicio_bloco = re.compile(r"^(#|\||-\s|\d+\.\s|\[Figura|\[Código|```)")
    while i < len(linhas):
        ln = linhas[i]
        if ate and ln.strip().startswith(ate):
            break
        s = ln.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            i += 1
            codigo = []
            while i < len(linhas) and not linhas[i].strip().startswith("```"):
                codigo.append(linhas[i].rstrip())
                i += 1
            blocos.append(("codigo", codigo))
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
        m = CODIGO_LINHA.fullmatch(s)
        if m:
            blocos.append(("legenda_codigo", int(m.group(2)), m.group(3)))
            i += 1
            continue
        m = FIGURA_LINHA.fullmatch(s)
        if m:
            i += 1
            descricao = None
            if i < len(linhas) and linhas[i].strip().startswith("Descrição:"):
                descricao = linhas[i].strip()
                i += 1
            blocos.append(("figura", int(m.group(2)), m.group(3), descricao))
            continue
        if re.match(r"^(-|\d+\.)\s+", s):
            ordenada = bool(re.match(r"^\d+\.", s))
            itens = []
            while i < len(linhas) and re.match(r"^\s*(-|\d+\.)\s+", linhas[i]):
                itens.append(re.sub(r"^\s*(-|\d+\.)\s+", "", linhas[i]).strip())
                i += 1
            blocos.append(("lista", ordenada, itens))
            continue
        # Parágrafo: linhas seguidas se juntam, exceto quando a anterior tem
        # quebra forçada (dois espaços no fim) ou a nova começa com rótulo **X:**.
        par = [s]
        quebra = ln.endswith("  ")
        i += 1
        while i < len(linhas) and linhas[i].strip() and not inicio_bloco.match(linhas[i].strip()):
            nova = linhas[i].strip()
            if quebra or nova.startswith("**"):
                blocos.append(("paragrafo", " ".join(par)))
                par = [nova]
            else:
                par.append(nova)
            quebra = linhas[i].endswith("  ")
            i += 1
        blocos.append(("paragrafo", " ".join(par)))
    return blocos


# ------------------------------------------------------------------ geração
class Gerador:
    def __init__(self, doc):
        self.doc = doc
        self.n_quadro = 0
        self.n_figura = 0
        self.n_codigo = 0
        self.fonte_codigo_pendente = False  # trecho de código legendado: "Fonte: Autor" depois dele
        self.titulos_quadros = iter(TITULOS_QUADROS)
        self.titulos_usados = 0
        self.caso_de_uso = None  # nome do caso de uso cujo quadro vem a seguir

    # ---- títulos
    def titulo(self, nivel, texto):
        m = re.match(r"^Caso de Uso:\s*(UC-S\d+)\s*-\s*(.+)$", texto)
        if m:  # o título do caso de uso vira o título do quadro seguinte
            self.caso_de_uso = m.group(2).strip()
            return
        p = self.doc.add_paragraph(style="Normal")
        if nivel == 1:
            ap = re.match(r"^Apêndice\s+([A-Z])\s*-\s*(.+)$", texto)
            if texto == "Referências" or ap:
                formatar_paragrafo(p, primeira=0, alinhamento=1, quebra_antes=True,
                                   antes=0, depois=ESPACO_15, manter_com_proximo=True)
                if ap:
                    texto = f"APÊNDICE {ap.group(1)} – {ap.group(2)}"
            else:
                formatar_paragrafo(p, primeira=0, quebra_antes=True, antes=0,
                                   depois=ESPACO_15, manter_com_proximo=True)
            adicionar_runs(p, texto, negrito=True)
        else:
            numerado = bool(re.match(r"^\d+(\.\d+)+\s", texto))
            formatar_paragrafo(p, primeira=0, antes=ESPACO_15, depois=ESPACO_15,
                               manter_com_proximo=True)
            adicionar_runs(p, texto, italico=not (nivel == 2 and numerado))

    def capitulo_pendente(self, titulo):
        self.titulo(1, titulo)
        self.paragrafo(PLACEHOLDER)

    # ---- texto
    def paragrafo(self, texto):
        texto = texto.replace("Quadro X", f"Quadro {self.n_quadro + 1}")
        p = self.doc.add_paragraph(style="0-Normal")
        if texto.startswith("**"):  # linha de rótulo ("**Atributos:** ...")
            formatar_paragrafo(p, primeira=0)
        adicionar_runs(p, texto)

    def referencia(self, texto):
        p = self.doc.add_paragraph(style="Bibliography")
        p.alignment = 0  # ABNT NBR 6023: alinhada à esquerda
        adicionar_runs(p, texto)

    def lista(self, ordenada, itens):
        so_codigo = all(re.fullmatch(r"`[^`]+`", it) for it in itens)
        for k, item in enumerate(itens):
            p = self.doc.add_paragraph(style="0-Normal")
            if so_codigo:  # atributos e métodos UML: uma linha por item, sem alínea
                formatar_paragrafo(p, primeira=0, esquerda=709)
                adicionar_runs(p, item)
                continue
            marca = f"{k + 1}." if ordenada else f"{chr(ord('a') + k)})"
            formatar_paragrafo(p, esquerda=1134, deslocamento=425)
            p.add_run(marca + "\t")
            adicionar_runs(p, item)
        # Capturas de tela citadas nos itens entram logo depois da lista.
        for item in itens:
            for m in FIGURA_LINHA.finditer(item):
                self.figura(int(m.group(2)), m.group(3), None)

    def legenda_codigo(self, numero, titulo):
        self.n_codigo += 1
        if numero != self.n_codigo:
            print(f"AVISO: Código {numero} fora de sequência (esperado {self.n_codigo})",
                  file=sys.stderr)
        self.legenda(f"Código {self.n_codigo}", titulo)
        self.fonte_codigo_pendente = True

    def codigo(self, linhas):
        for k, ln in enumerate(linhas):
            p = self.doc.add_paragraph(style="Normal")
            formatar_paragrafo(p, primeira=0, esquerda=709, alinhamento=0, simples=True,
                               antes=240 if k == 0 else 0,
                               depois=240 if k == len(linhas) - 1 else 0,
                               manter_com_proximo=k < len(linhas) - 1)
            _run(p, ln, tamanho=10)
        if self.fonte_codigo_pendente:
            self.fonte_codigo_pendente = False
            self.fonte()

    # ---- legendas (padrão dos quadros de exemplo do modelo)
    def legenda(self, rotulo, titulo):
        # O parágrafo que cita o quadro/figura fica na mesma página dele.
        ultimo = self.doc.element.body[-2]
        if ultimo.tag == qn("w:p"):
            anterior = docx.text.paragraph.Paragraph(ultimo, self.doc)
            if re.search(rf"\b{rotulo.split()[0]}s? [\d e a]*\b{rotulo.split()[1]}\b", anterior.text):
                anterior.paragraph_format.keep_with_next = True
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, alinhamento=1, antes=240,
                           simples=True, manter_com_proximo=True)
        _run(p, f"{rotulo} – ", negrito=True, tamanho=10)
        adicionar_runs(p, titulo, tamanho=10)

    def fonte(self):
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, simples=True, depois=ESPACO_15)
        _run(p, "Fonte: Autor", tamanho=10)

    # ---- tabelas
    def _tabela(self, larguras):
        t = self.doc.add_table(rows=0, cols=len(larguras))
        t.style = self.doc.styles["Table Grid"]
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        tblpr = t._tbl.tblPr
        _set(tblpr, "w:tblW", w=sum(larguras), type="dxa")
        _set(tblpr, "w:tblLayout", type="fixed")
        for gc, w in zip(t._tbl.tblGrid.findall(qn("w:gridCol")), larguras):
            gc.set(qn("w:w"), str(w))
        return t

    @staticmethod
    def _celula(cell, largura, linhas, span=1):
        tcpr = cell._tc.get_or_add_tcPr()
        _set(tcpr, "w:tcW", w=largura, type="dxa")
        if span > 1:
            _set(tcpr, "w:gridSpan", val=span)
        for k, partes in enumerate(linhas):
            p = cell.paragraphs[0] if k == 0 else cell.add_paragraph()
            p.style = "Normal"
            formatar_paragrafo(p, primeira=0, alinhamento=0, simples=True, antes=0, depois=0)
            for texto, negrito in partes:
                adicionar_runs(p, texto, negrito=negrito, tamanho=10)

    def _linha(self, t, celulas, manter_com_proxima=False, cabecalho=False):
        """celulas: lista de (largura, linhas, span); cada linha é [(texto, negrito)].

        A linha nunca se divide entre páginas; com `manter_com_proxima`, ela
        também fica na mesma página da linha seguinte.
        """
        tr = OxmlElement("w:tr")
        t._tbl.append(tr)
        _set(_trpr(tr), "w:cantSplit")
        if cabecalho:  # repete se o quadro quebrar de página
            _set(_trpr(tr), "w:tblHeader")
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

    @staticmethod
    def _linhas_br(texto, negrito=False):
        return [[(seg.strip(), negrito)] for seg in texto.split("<br>")]

    def tabela_generica(self, linhas_md):
        n = len(linhas_md[0])
        limpo = lambda s: re.sub(r"[*`]|<br>", " ", s)
        # Cada coluna recebe ao menos a largura da sua maior palavra (o
        # cabeçalho em negrito); a sobra é dividida pelo tamanho do conteúdo.
        minimas, pesos = [], []
        for c in range(n):
            col = [limpo(l[c]) if c < len(l) else "" for l in linhas_md]
            minimas.append(max(largura_minima(col[0].split() or ["x"], negrito=True),
                               largura_minima([w for s in col[1:] for w in s.split()] or ["x"])))
            pesos.append(min(max(max(len(s) for s in col), 6), 60))
        sobra = max(LARGURA_TEXTO - sum(minimas), 0)
        larguras = [m + int(sobra * w / sum(pesos)) for m, w in zip(minimas, pesos)]
        larguras[-1] += LARGURA_TEXTO - sum(larguras)
        t = self._tabela(larguras)
        inteiro = len(linhas_md) <= QUADRO_PEQUENO
        for k, l in enumerate(linhas_md):
            l = (l + [""] * n)[:n]
            ultima = k == len(linhas_md) - 1
            self._linha(t, [(w, self._linhas_br(txt, k == 0), 1) for w, txt in zip(larguras, l)],
                        manter_com_proxima=k == 0 or (inteiro and not ultima), cabecalho=k == 0)

    def tabela_rf(self, linhas_md):
        cab = [c.lower() for c in linhas_md[0]]
        ic, it, ica, ip, idesc = (cab.index(x) for x in
                                  ("código", "título", "categoria", "prioridade", "descrição"))
        w = LARGURA_TEXTO // 3
        larguras = [w, w, LARGURA_TEXTO - 2 * w]
        t = self._tabela(larguras)
        marca = lambda ok: "(X)" if ok else "(  )"
        for l in linhas_md[1:]:
            cat, pri = l[ica].strip().lower(), l[ip].strip().lower()
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

    def tabela_rnf(self, linhas_md):
        cab = [c.lower() for c in linhas_md[0]]
        ic, inome, ireq, itipo, icl = (cab.index(x) for x in
                                       ("código", "nome", "requisito", "tipo", "classificação"))
        marca = lambda ok: "(X)" if ok else "(  )"
        # Mesmas 5 colunas do quadro de exemplo; palavras longas recebem hífen opcional.
        corpo = [list(l) for l in linhas_md[1:]]
        larguras = [
            min(largura_minima([w for l in corpo for w in l[inome].split()], negrito=True), 1750),
            0,
            min(largura_minima([w for l in corpo for w in l[itipo].split()]), 1600),
            largura_minima([f"{marca(False)} Obrigatório"]),
            largura_minima([f"{marca(False)} Permanente", f"{marca(False)} Transitório"]),
        ]
        larguras[1] = LARGURA_TEXTO - sum(larguras)
        t = self._tabela(larguras)
        for l in corpo:
            cl = l[icl].lower()
            self._linha(t, [
                (larguras[0], [[(l[ic], True), ("-" + hifenizar(l[inome], larguras[0]), False)]], 1),
                (larguras[1], [[(l[ireq], False)]], 1),
                (larguras[2], [[(hifenizar(l[itipo], larguras[2]), False)]], 1),
                (larguras[3], [[(f"{marca('desejável' in cl)} Desejável", False)],
                               [(f"{marca('obrigatório' in cl)} Obrigatório", False)]], 1),
                (larguras[4], [[(f"{marca('permanente' in cl)} Permanente", False)],
                               [(f"{marca('transitório' in cl)} Transitório", False)]], 1),
            ])

    def tabela_rn(self, linhas_md):
        cab = [c.lower() for c in linhas_md[0]]
        ic, inome, idesc = (cab.index(x) for x in ("código", "nome", "descrição"))
        t = self._tabela([LARGURA_TEXTO])
        for l in linhas_md[1:]:
            self._linha(t, [(LARGURA_TEXTO, [[(f"{l[ic]} - {l[inome]}", True)]], 1)],
                        manter_com_proxima=True)
            self._linha(t, [(LARGURA_TEXTO, [[("Descrição", True), (": " + l[idesc], False)]], 1)])

    def tabela_uc(self, linhas_md, nome):
        larguras = [1998, LARGURA_TEXTO - 1998]
        t = self._tabela(larguras)
        self._linha(t, [(LARGURA_TEXTO, [[(f"Caso de Uso – {nome}", True)]], 2)],
                    manter_com_proxima=True)
        corpo = linhas_md[1:] if [c.lower() for c in linhas_md[0]] == ["campo", "conteúdo"] else linhas_md
        for k, (campo, conteudo) in enumerate(corpo):
            self._linha(t, [(larguras[0], [[(campo, True)]], 1),
                            (larguras[1], self._linhas_br(conteudo), 1)],
                        manter_com_proxima=k < len(corpo) - 1)

    def tabela(self, linhas_md):
        self.n_quadro += 1
        cab = [c.lower() for c in linhas_md[0]]
        if self.caso_de_uso:
            nome, self.caso_de_uso = self.caso_de_uso, None
            self.legenda(f"Quadro {self.n_quadro}", f"Use Case {nome}")
            self.tabela_uc(linhas_md, nome)
        else:
            titulo = next(self.titulos_quadros, PLACEHOLDER)
            self.titulos_usados += 1
            self.legenda(f"Quadro {self.n_quadro}", titulo)
            if cab[:2] == ["código", "título"] and "prioridade" in cab:
                self.tabela_rf(linhas_md)
            elif cab[:2] == ["código", "nome"] and "classificação" in cab:
                self.tabela_rnf(linhas_md)
            elif cab == ["código", "nome", "descrição"]:
                self.tabela_rn(linhas_md)
            else:
                self.tabela_generica(linhas_md)
        self.fonte()

    # ---- figuras
    def _secao(self, paisagem):
        """Abre uma nova seção (nova página) em retrato ou paisagem."""
        s = self.doc.add_section(WD_SECTION.NEW_PAGE)
        s.different_first_page_header_footer = False  # número de página visível
        larg, alt = sorted((s.page_width, s.page_height))
        s.orientation = WD_ORIENT.LANDSCAPE if paisagem else WD_ORIENT.PORTRAIT
        s.page_width, s.page_height = (alt, larg) if paisagem else (larg, alt)
        return s

    def figura(self, numero, titulo, descricao):
        self.n_figura += 1
        if numero != self.n_figura:
            print(f"AVISO: Figura {numero} fora de sequência (esperado {self.n_figura})",
                  file=sys.stderr)
        paisagem = numero in PAISAGEM
        if paisagem:
            self._secao(True)
        self.legenda(f"Figura {self.n_figura}", titulo)
        p = self.doc.add_paragraph(style="Normal")
        formatar_paragrafo(p, primeira=0, alinhamento=1, simples=True,
                           manter_com_proximo=True)
        img = IMAGENS_FIGURAS.get(numero)
        if img and img.exists():
            from PIL import Image
            with Image.open(img) as im:
                lw, lh = im.size
            larg, alt_max = (24.5, 13.5) if paisagem else (16.0, 20.0)
            if lh / lw * larg > alt_max:
                p.add_run().add_picture(str(img), height=Cm(alt_max))
            else:
                p.add_run().add_picture(str(img), width=Cm(larg))
        else:
            texto = "[inserir captura de tela"
            texto += f" – {descricao}]" if descricao else "]"
            _run(p, texto)
        self.fonte()
        if paisagem:
            self._secao(False)


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


def ajustar_folha_de_rosto(doc):
    """Titulação do orientador e início do corpo em nova página (capa sozinha)."""
    trocado = False
    for p in doc.paragraphs[:IDX_ULTIMO_MANTIDO]:
        for r in p.runs:
            if ORIENTADOR_DE in r.text:
                r.text = r.text.replace(ORIENTADOR_DE, ORIENTADOR_PARA)
                trocado = True
    if not trocado:
        print("AVISO: titulação do orientador não encontrada", file=sys.stderr)
    # O ano ultrapassava a página 1 por ~2 pt: remove um parágrafo vazio entre
    # o orientador e FRANCA/SP (sem mudar texto nem formatação da capa).
    vazio = doc.paragraphs[IDX_VAZIO_CAPA]
    if vazio.text.strip() or doc.paragraphs[IDX_VAZIO_CAPA + 1].text != "FRANCA/SP":
        sys.exit("ERRO: parágrafo vazio da capa não está onde se espera")
    vazio._p.getparent().remove(vazio._p)
    doc.sections[-1].start_type = WD_SECTION.NEW_PAGE


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

    ajustar_folha_de_rosto(doc)
    montar_resumo(body, copias)

    g = Gerador(doc)
    secao = None
    for b in ler_blocos(FONTE_MD.read_text(encoding="utf-8"), args.ate):
        tipo = b[0]
        if tipo == "titulo":
            if b[1] == 1:
                secao = b[2]
                if secao == "Referências":
                    for cap in CAPITULOS_PENDENTES:
                        g.capitulo_pendente(cap)
            g.titulo(b[1], b[2])
        elif tipo == "paragrafo":
            if secao == "Referências":
                g.referencia(b[1])
            else:
                g.paragrafo(b[1])
        elif tipo == "lista":
            g.lista(b[1], b[2])
        elif tipo == "tabela":
            g.tabela(b[1])
        elif tipo == "figura":
            g.figura(b[1], b[2], b[3])
        elif tipo == "legenda_codigo":
            g.legenda_codigo(b[1], b[2])
        elif tipo == "codigo":
            g.codigo(b[1])

    if not args.ate and g.titulos_usados != len(TITULOS_QUADROS):
        sys.exit(f"ERRO: {g.titulos_usados} quadros sem título próprio, "
                 f"mas {len(TITULOS_QUADROS)} títulos em TITULOS_QUADROS")
    remover_imagens_orfas(doc)
    args.saida.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(args.saida))
    print(f"Gerado: {args.saida} ({g.n_quadro} quadros, {g.n_figura} figuras)")


if __name__ == "__main__":
    main()
