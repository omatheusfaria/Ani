# Boca aberta para quadros de cena (ex.: ani-cabine-quadros.png) em que a personagem fala segurando
# alguma coisa e não dá para usar a folha de conversa. Para cada quadro pedido:
#   - acha a linha da boca perto do ponto dado (pixels mais escuros e avermelhados dentro da pele);
#   - desenha por cima uma boca aberta pequena (contorno escuro, vermelho dentro) do mesmo largo;
#   - grava as versões abertas numa linha a mais no fim da folha (a folha passa a ter ROWS = 5).
# Imprime o mapa quadro → quadro de boca aberta para o JS (mouth: { 6: 24, 19: 25, ... }).
# Uso: python tools/boca-aberta.py folha.png FW FH saida.png quadro:x,y [quadro:x,y ...] [previa.png]
from PIL import Image
import numpy as np, sys
from collections import deque

src, FW, FH, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
specs, preview = [], None
for a in sys.argv[5:]:
    if ':' in a:
        f, xy = a.split(':')
        x, y = xy.split(',')
        specs.append((int(f), int(x), int(y)))
    else:
        preview = a
sheet = np.array(Image.open(src).convert('RGBA'))
rows0 = sheet.shape[0] // FH
assert len(specs) <= 6


def cell(i):
    r, c = divmod(i, 6)
    return sheet[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW].copy()


def find_mouth(c, x, y, R=7):
    rgb = c[..., :3].astype(int)
    lum = rgb.mean(-1)
    y0, y1, x0, x1 = y - R, y + R + 1, x - R, x + R + 1
    win = rgb[y0:y1, x0:x1]
    a = c[y0:y1, x0:x1, 3] > 0
    skin = a & (win[..., 0] > 200) & (win[..., 1] > 140)
    ref = np.median(lum[y0:y1, x0:x1][skin])
    L = lum[y0:y1, x0:x1]
    red = (win[..., 0] - win[..., 2] > 45) & (L > 70) & (L < ref - 30) & a
    # o pedaço mais perto do ponto
    best, bd = None, 1e9
    seen = np.zeros_like(red)
    for sy, sx in zip(*np.nonzero(red)):
        if seen[sy, sx]:
            continue
        q, pts = deque([(sy, sx)]), []
        seen[sy, sx] = True
        while q:
            py, px = q.popleft()
            pts.append((py, px))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = py + dy, px + dx
                    if 0 <= ny < red.shape[0] and 0 <= nx < red.shape[1] and red[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        pts = np.array(pts)
        d = np.hypot(pts[:, 0].mean() - R, pts[:, 1].mean() - R)
        if d < bd:
            best, bd = pts, d
    if best is None:
        return None
    ys, xs = best[:, 0] + y0, best[:, 1] + x0
    return xs.min(), xs.max(), ys.min(), ys.max()


opened, mapping = [], {}
for k, (f, x, y) in enumerate(specs):
    c = cell(f)
    m = find_mouth(c, x, y)
    if m is None:
        print(f'quadro {f}: boca não achada perto de ({x},{y}) — usando o ponto')
        m = (x - 1, x + 1, y, y)
    mx0, mx1, my0, my1 = m
    w = max(3, min(5, mx1 - mx0 + 1))
    cx = (mx0 + mx1) / 2
    bx0 = int(round(cx - w / 2 + 0.01))
    by0 = my0
    dark = np.array([84, 34, 36])
    inner = np.array([176, 70, 72])
    tongue = np.array([214, 112, 108])
    o = c.copy()
    if w == 3:
        # boca pequena (rosto miúdo): 3×2, linha escura em cima e vermelho embaixo, cantos suaves
        for xx in range(bx0, bx0 + 3):
            o[by0, xx, :3] = dark
            o[by0, xx, 3] = 255
        for xx, col in ((bx0, None), (bx0 + 1, inner), (bx0 + 2, None)):
            if col is None:
                col = (c[by0 + 1, xx, :3].astype(int) + dark) // 2
            o[by0 + 1, xx, :3] = col
            o[by0 + 1, xx, 3] = 255
        opened.append(o)
        mapping[f] = rows0 * 6 + k
        print(f'quadro {f}: boca em x={mx0}..{mx1} y={my0}..{my1} → aberta 3×2 px no quadro {mapping[f]}')
        continue
    # 3 px de altura: contorno escuro em volta, vermelho dentro e um tiquinho de língua embaixo
    for yy in range(by0, by0 + 3):
        for xx in range(bx0, bx0 + w):
            edge = yy in (by0, by0 + 2) or xx in (bx0, bx0 + w - 1)
            col = dark if edge else inner
            if yy == by0 + 2 and bx0 < xx < bx0 + w - 1:
                col = (dark + tongue) // 2
            o[yy, xx, :3] = col
            o[yy, xx, 3] = 255
    # cantos arredondados: os 4 cantos voltam para a pele
    for yy, xx in ((by0, bx0), (by0, bx0 + w - 1), (by0 + 2, bx0), (by0 + 2, bx0 + w - 1)):
        o[yy, xx] = c[yy, xx] if c[yy, xx, 3] else o[yy, xx]
        if w > 3:
            o[yy, xx, :3] = (o[yy, xx, :3].astype(int) * 2 + dark) // 3
    opened.append(o)
    mapping[f] = rows0 * 6 + k
    print(f'quadro {f}: boca em x={mx0}..{mx1} y={my0}..{my1} → aberta {w}×3 px no quadro {mapping[f]}')

row = np.zeros((FH, FW * 6, 4), np.uint8)
for k, o in enumerate(opened):
    row[:, k * FW:(k + 1) * FW] = o
res = np.concatenate([sheet, row], axis=0)
Image.fromarray(res).save(out, optimize=True)
print(f'{out}: ROWS: {rows0 + 1}, mouth: {{ ' + ', '.join(f'{a}: {b}' for a, b in mapping.items()) + ' }')

if preview:
    tiles = []
    for (f, x, y), o in zip(specs, opened):
        for img in (cell(f), o):
            t = Image.fromarray(img[max(0, y - 22):y + 14, max(0, x - 26):x + 26])
            bg = Image.new('RGBA', t.size, (50, 44, 60, 255))
            bg.alpha_composite(t)
            tiles.append(bg.resize((t.width * 6, t.height * 6), Image.NEAREST))
    W = sum(t.width for t in tiles[:2]) * 3
    pv = Image.new('RGB', (max(t.width for t in tiles) * len(tiles), max(t.height for t in tiles)), (30, 30, 30))
    x = 0
    for t in tiles:
        pv.paste(t, (x, 0))
        x += t.width
    pv.save(preview)
