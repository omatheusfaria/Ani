# Ajusta o rosto da Ani nas folhas da maçã do amor (já recortadas por recortar-comida.py),
# para ficar como na pipoca e no algodão-doce: sem o sorrisão de boca rosa aberta.
#   parada: quadros 2, 3 e 5 de cada linha ganham a cabeça do quadro 0 da mesma linha
#           (alinhada pelo contorno do cabelo; a maçã e o contorno dela ficam por cima);
#           no 3 e no 5 os olhos fecham num traço reto e aparece uma boquinha pequena.
#   andando: o quadro 3 (mordida, olhos ^^ e bochecha rosada) ganha a cabeça do quadro 2 com os
#           olhos fechados num traço; o quadro 5 (olhos ^^) ganha a cabeça do quadro 4.
# Uso: python tools/ajustar-rosto-maca.py   (roda dentro da pasta do projeto; grava por cima)
from PIL import Image
import numpy as np

SPR = 'assets/sprites/'


def masks(c):
    r, g, b, a = [c[..., i].astype(int) for i in range(4)]
    op = a > 0
    skin = op & (r > 195) & (g > 140) & (b > 110) & (r - b > 20) & (r - b < 115) & (r - g < 75)
    apple = op & (((r > 120) & (g < 100) & (b < 100) & (r - g > 60)) |  # maçã
                  ((r > 160) & (g > 100) & (b < 95) & (g - b > 35)) |  # calda / palito
                  ((r > 200) & (g > 165) & (b < 175) & (g - b > 38)))  # a parte mordida (amarelinha)
    return op, skin, apple


def dilate(m, n):
    for _ in range(n):
        p = np.pad(m, 1)
        m = m | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:] | p[:-2, :-2] | p[2:, 2:] | p[:-2, 2:] | p[2:, :-2]
    return m


def chin(c):
    """linha logo abaixo do queixo: fim do maior bloco de pele na metade de cima"""
    _, skin, _ = masks(c)
    rows = np.nonzero(skin[:120].sum(1) >= 6)[0]
    # o rosto é o primeiro trecho contínuo de linhas com pele
    end = rows[0]
    for y in rows[1:]:
        if y - end > 2:
            break
        end = y
    return int(end) + 2


def swap_head(sheet, FW, FH, dst, src, close=False):
    r0, c0 = divmod(dst, 6)
    r1, c1 = divmod(src, 6)
    D = sheet[r0 * FH:(r0 + 1) * FH, c0 * FW:(c0 + 1) * FW]
    S = sheet[r1 * FH:(r1 + 1) * FH, c1 * FW:(c1 + 1) * FW].copy()
    opD, skinD, appleD = masks(D)
    opS, skinS, appleS = masks(S)
    # a maçã fica, com o contorno escuro dela; a boca rosa encostada nela sai
    rgbD = D[..., :3].astype(int)
    pink = opD & (rgbD[..., 0] > 195) & (rgbD[..., 1] < 185) & (rgbD[..., 0] - rgbD[..., 1] > 45) & ~appleD
    keep = (dilate(appleD, 1) & ~pink) | (dilate(appleD, 2) & (rgbD.max(-1) < 90))
    cy = chin(S)
    # alinha pelo contorno da cabeça (parte de cima, longe da maçã)
    top = slice(0, cy - 12)
    best = None
    for dy in range(-8, 9):
        for dx in range(-8, 9):
            sh = np.roll(np.roll(opS, dy, 0), dx, 1)
            diff = (sh[top] ^ opD[top]) & ~keep[top]
            sc = diff.sum()
            if best is None or sc < best[0]:
                best = (sc, dx, dy)
    _, dx, dy = best
    Ssh = np.roll(np.roll(S, dy, 0), dx, 1)
    appleSh = dilate(np.roll(np.roll(appleS, dy, 0), dx, 1), 1)  # a maçã do quadro de origem não vem junto
    # só o rosto (caixa da pele dos dois, até o queixo mais baixo): o cabelo de cada quadro fica
    yb = max(cy + dy, chin(D)) + 1
    _, skinA0, _ = masks(Ssh)
    both = (skinD | skinA0)
    both[yb:] = False
    ys, _ = np.nonzero(both)
    # largura: a do rosto de origem (o miolo claro da maçã parece pele e não pode entrar)
    src_face = skinA0.copy()
    src_face[yb:] = False
    _, xs = np.nonzero(src_face)
    region = np.zeros(D.shape[:2], bool)
    region[max(0, ys.min() - 1):yb, max(0, xs.min() - 1):xs.max() + 2] = True
    # olhos fechados e boquinha (posição tirada do rosto de origem já alinhado)
    if close:
        _, skinA, _ = masks(Ssh)
        face = skinA[: cy + dy]
        ys, xs = np.nonzero(face)
        fy0, fy1, fx0, fx1 = ys.min(), ys.max(), xs.min(), xs.max()
        rgb = Ssh[..., :3].astype(int)
        dark = (Ssh[..., 3] > 0) & (rgb.max(-1) < 95)
        eye = np.zeros_like(dark)
        h = fy1 - fy0
        for y in range(fy0 + int(h * 0.15), fy0 + int(h * 0.6)):
            for x in range(fx0, fx1 + 1):
                if dark[y, x] and skinA[min(y + 3, cy), x] and skinA[y, min(x + 4, D.shape[1] - 1)]:
                    eye[y, x] = True
        if eye.any():
            ey, ex = np.nonzero(eye)
            # só o olho em si: a parte da frente do bloco escuro (o resto é sombra da franja)
            front = ex >= ex.max() - 6
            ey, ex = ey[front], ex[front]
            tone = np.median(rgb[skinA & (np.arange(D.shape[0])[:, None] > ey.max()) & (np.arange(D.shape[0])[:, None] < ey.max() + 8)], axis=0)
            ly = int(ey.max()) - 1
            x0, x1 = int(ex.min()), int(ex.max())
            # apaga o olho aberto inteiro (bloco escuro e o brilho, acima do traço até a franja),
            # com a pele da mesma linha (o rosto escurece perto do cabelo: sem retalho claro)
            for y in range(ly - 6, ly + 2):
                row = [Ssh[y, x, :3].astype(int) for x in range(x1 + 1, min(x1 + 6, D.shape[1])) if skinA[y, x]]
                t = (np.median(row, axis=0) if row else tone) * 0.97  # um tiquinho mais escuro: perto da franja
                for x in range(x0 - 2, x1 + 1):
                    if not skinA[y, x] or dark[y, x]:
                        # só dentro do rosto: pele dos dois lados na linha
                        if skinA[y, max(0, x - 8):x].any() or skinA[y, x + 1:x + 9].any():
                            Ssh[y, x, :3] = t
            Ssh[ly:ly + 2, x0:x1 + 2, :3] = (38, 27, 30)
            Ssh[ly:ly + 2, x0:x1 + 2, 3] = 255
            Ssh[ly - 1, x0 - 1, :3] = (38, 27, 30)  # cílio para trás
            # boquinha: um tracinho rosado abaixo e à frente do olho
            my = ly + int(h * 0.38)
            mx = int(round((x1 + fx1) / 2)) - 2
            if skinA[my, mx - 1:mx + 4].all():
                Ssh[my, mx:mx + 4, :3] = (214, 120, 118)
                Ssh[my - 1, mx - 1, :3] = (226, 150, 140)
                Ssh[my - 1, mx + 4, :3] = (226, 150, 140)
    put = region & ~keep & ~appleSh
    D[put] = Ssh[put]
    return dx, dy


def fix(name, FW, FH, jobs):
    p = SPR + name
    sheet = np.array(Image.open(p).convert('RGBA'))
    for dst, src, close in jobs:
        dx, dy = swap_head(sheet, FW, FH, dst, src, close)
        print(f'{name}: quadro {dst} ← cabeça do {src} (desloc. {dx},{dy}){" olhos fechados" if close else ""}')
    Image.fromarray(sheet).save(p, optimize=True)


if __name__ == '__main__':
    fix('ani-parada-maca-quadros.png', 146, 263,
        [(r * 6 + c, r * 6, c in (3, 5)) for r in range(4) for c in (2, 3, 5)])
    fix('ani-andando-maca-quadros.png', 160, 255,
        [(r * 6 + 3, r * 6 + 2, True) for r in range(4)] + [(r * 6 + 5, r * 6 + 4, False) for r in range(4)])
