# Mão segurando o celular (primeira pessoa, quarto): tira o celular DESENHADO da folha para o jogo
# pôr o celular de verdade (o modelo 3D com a tela do app) no lugar, por trás da mão.
#   - folha do Sprite Fusion 6×4 de 256 px (assets/sprites/mao-celular.png);
#   - acha a tela preta de cada quadro e alinha todos por ela (no desenho o aparelho mexe ±2 px;
#     no jogo ele fica parado e só o polegar se mexe);
#   - apaga a tela (preto puro) e a moldura cinza; o que é pele, unha, anel e manga fica;
#   - o polegar em cima da tela ganha de volta o contorno escuro (o preto dele some junto com a tela).
# Imprime o retângulo da tela (em px da célula) que o JS usa para encaixar a mão no modelo.
# Uso: python tools/recortar-mao-celular.py entrada.png saida.png [previa.png]
from PIL import Image
import numpy as np, sys
from collections import deque

src_path, out_path = sys.argv[1], sys.argv[2]
src = np.array(Image.open(src_path).convert('RGBA')).astype(int)
CW = CH = 256
OUTLINE = (34, 22, 28)


def components(m):
    h, w = m.shape
    seen = np.zeros_like(m)
    out = []
    for y0, x0 in zip(*np.nonzero(m)):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        out.append(np.array(pts))
    return out


def rounded_rect(x0, y0, x1, y1, r):
    yy, xx = np.mgrid[0:CH, 0:CW]
    m = (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
    for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
        corner = ((xx < x0 + r) if cx == x0 + r else (xx > x1 - r)) & ((yy < y0 + r) if cy == y0 + r else (yy > y1 - r))
        m &= ~(corner & ((xx - cx) ** 2 + (yy - cy) ** 2 > r * r))
    return m


cells, rects = [], []
for i in range(24):
    r, c = divmod(i, 6)
    cell = src[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW].copy()
    al = cell[..., 3] >= 128
    # restos da célula vizinha encostados na borda esquerda/de cima
    for pts in components(al):
        ys, xs = pts[:, 0], pts[:, 1]
        if len(pts) < 600 and (xs.min() == 0 or ys.min() == 0):
            al[ys, xs] = False
    black = al & (cell[..., :3].max(-1) < 8)
    scr = max(components(black), key=len)
    ys, xs = scr[:, 0], scr[:, 1]
    rects.append((xs.min(), ys.min(), xs.max(), ys.max()))
    # falhas de 1 px no alfa (vêm da folha): pixel vazio entre dois cheios ganha a cor deles
    for _ in range(2):
        ap = np.pad(al, 1)
        cp = np.pad(cell, ((1, 1), (1, 1), (0, 0)), mode='edge')
        vert = ~al & ap[:-2, 1:-1] & ap[2:, 1:-1]
        horz = ~al & ap[1:-1, :-2] & ap[1:-1, 2:] & ~vert
        cell[vert] = (cp[:-2, 1:-1][vert] + cp[2:, 1:-1][vert]) // 2
        cell[horz] = (cp[1:-1, :-2][horz] + cp[1:-1, 2:][horz]) // 2
        al = al | vert | horz
    cell[..., 3] = np.where(al, 255, 0)
    cells.append(cell)

# alinha pelo canto de cima-esquerdo da tela (o polegar nunca cobre esse lado)
X0 = int(round(np.median([rc[0] for rc in rects])))
Y0 = int(round(np.median([rc[1] for rc in rects])))
SW = int(round(np.median([rc[2] - rc[0] for rc in rects]))) + 1
SH = int(round(np.median([rc[3] - rc[1] for rc in rects]))) + 1
X1, Y1 = X0 + SW - 1, Y0 + SH - 1
# moldura: 6 px dos lados, 9 em cima e embaixo (medido na folha), cantos redondos
phone = rounded_rect(X0 - 7, Y0 - 10, X1 + 7, Y1 + 10, 16)
inner = rounded_rect(X0 - 1, Y0 - 1, X1 + 1, Y1 + 1, 10)
core = rounded_rect(X0 + 3, Y0 + 3, X1 - 3, Y1 - 3, 8)  # longe da borda da tela (a beira escura sai)

frames = []
for cell, (x0, y0, x1, y1) in zip(cells, rects):
    dx, dy = X0 - x0, Y0 - y0
    cell = np.roll(np.roll(cell, dy, axis=0), dx, axis=1)
    if dy > 0: cell[:dy] = 0
    if dx > 0: cell[:, :dx] = 0
    al = cell[..., 3] > 0
    rgb = cell[..., :3]
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    gray = (np.abs(R - G) < 22) & (np.abs(G - B) < 22) & (rgb.max(-1) < 150)
    dark = rgb.max(-1) < 14
    # dentro da tela: só o preto da tela sai; na moldura: cinza e preto saem (pele/unha ficam)
    edgy = rgb.max(-1) < 60
    cut = al & ((core & dark) | (inner & ~core & (gray | edgy)) | (phone & ~inner & (gray | dark)))
    hand = al & ~cut
    # pedacinhos soltos da moldura que sobraram
    for pts in components(hand):
        if len(pts) < 12:
            hand[pts[:, 0], pts[:, 1]] = False
    # contorno de volta onde a mão encosta na tela apagada
    hp = np.pad(hand, 1)
    nb = hp[:-2, 1:-1] | hp[2:, 1:-1] | hp[1:-1, :-2] | hp[1:-1, 2:]
    ring = cut & nb & ~hand & phone
    out = np.zeros((CH, CW, 4), np.uint8)
    out[hand, :3] = rgb[hand]
    out[hand, 3] = 255
    out[ring, :3] = OUTLINE
    out[ring, 3] = 255
    frames.append(out)


# A manga é cortada pela borda da célula (direita e embaixo). Continua o braço para fora: cada
# pixel novo puxa a cor de trás, ao longo do eixo do antebraço (as nervuras do tricô e o contorno
# seguem retos). A célula cresce EXT px para a direita e para baixo.
EXT = 112
AX = np.array([0.42, 0.91])  # eixo do antebraço (x, y), apontando para fora da tela


def extend(f):
    big = np.zeros((CH + EXT, CW + EXT, 4), np.uint8)
    big[:CH, :CW] = f
    rgb = f[..., :3].astype(int)
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    brown = (f[..., 3] > 0) & (R > 45) & (R < 150) & (R > G * 1.25) & (G < 90) & (B < 80)
    bp = np.pad(brown, 2)
    near = np.zeros_like(brown)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            near |= bp[2 + dy:2 + dy + CH, 2 + dx:2 + dx + CW]
    sleeve = (f[..., 3] > 0) & (brown | (near & (rgb.max(-1) < 60)))
    ys, xs = np.mgrid[0:CH + EXT, 0:CW + EXT]
    # a última coluna/linha da célula vem com falha na folha: refaz junto com a extensão
    out = (xs >= CW - 2) | (ys >= CH - 2)
    # recua pelo eixo até entrar na célula (longe da borda cortada)
    tx = np.where(xs >= CW - 2, (xs - (CW - 4)) / AX[0], 0)
    ty = np.where(ys >= CH - 2, (ys - (CH - 4)) / AX[1], 0)
    t = np.maximum(tx, ty)
    sx = np.clip(np.round(xs - t * AX[0]).astype(int), 0, CW - 1)
    sy = np.clip(np.round(ys - t * AX[1]).astype(int), 0, CH - 1)
    take = out & sleeve[sy, sx]
    big[take] = f[sy[take], sx[take]]
    return big


frames = [extend(f) for f in frames]
CW, CH = CW + EXT, CH + EXT
rows = [np.concatenate(frames[r * 6:(r + 1) * 6], axis=1) for r in range(4)]
Image.fromarray(np.concatenate(rows, axis=0)).save(out_path, optimize=True)
print(f'{out_path}: célula {CW}×{CH}, tela x={X0}..{X1} y={Y0}..{Y1} ({SW}×{SH} px), moldura x={X0 - 7}..{X1 + 7} y={Y0 - 10}..{Y1 + 10}')

if len(sys.argv) > 3:
    pv = Image.new('RGB', (CW * 6, CH * 4), (70, 60, 90))
    sheet = Image.open(out_path)
    # prévia com uma tela clara no lugar, para ver o encaixe
    bgc = np.zeros((CH, CW, 4), np.uint8)
    bgc[:CH - EXT, :CW - EXT][phone] = (22, 20, 29, 255)
    bgc[:CH - EXT, :CW - EXT][inner] = (150, 160, 220, 255)
    bg = Image.fromarray(bgc)
    for i in range(24):
        x, y = (i % 6) * CW, (i // 6) * CH
        pv.paste(bg, (x, y), bg)
        f = sheet.crop((x, y, x + CW, y + CH))
        pv.paste(f, (x, y), f)
    pv.save(sys.argv[3])
