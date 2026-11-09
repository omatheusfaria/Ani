# Recorta as folhas de comida / pegar item (Sprite Fusion, 6×4 de 256 px) no formato que o
# jogo usa para animações com célula própria (ANI_FOOD / MALU_FOOD em js/chars/ani.js):
#   - binariza o alfa, tira o halo claro de fora do contorno e apaga pixels soltos;
#   - alinha cada quadro pela sola e pelas pernas;
#   - a célula é larga o bastante para o braço esticado (nada é cortado);
#   - grava em grade 6×4 (cabe no limite de textura de celular, 4096 px).
# Imprime a linha de configuração (FW, FH, H = altura da personagem em px) para o JS.
# Folhas fora do padrão de 256 px (ex.: ani-conversando.png, 1024×1536 com colunas desiguais):
# as células são achadas pelos vãos vazios entre os quadros.
# Uso: python tools/recortar-comida.py ani|malu entrada.png saida.png [preview.png] [opções]
# Opções (folha com objeto solto, ex.: ani-travesseiro.png):
#   --sem-branco         ignora pixels quase brancos ao achar as pernas (o travesseiro no chão)
#   --apagar-soltos=0,1  nesses quadros apaga o que não encosta no corpo (o travesseiro deitado)
#   --medir=9,16         imprime o centro do branco nesses quadros, em px a partir das pernas/sola
from PIL import Image, ImageDraw
from collections import deque
import numpy as np, sys

opts = {a.split('=')[0]: (a.split('=') + [''])[1] for a in sys.argv[1:] if a.startswith('--')}
sys.argv = [a for a in sys.argv if not a.startswith('--')]
NO_WHITE = '--sem-branco' in opts
LOOSE = {int(v) for v in opts.get('--apagar-soltos', '').split(',') if v}
MEASURE = [int(v) for v in opts.get('--medir', '').split(',') if v]
who, src_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
# deslocamento das pernas em relação ao centro da célula, igual à folha de caminhada
LEG_OFF = {'ani': -4, 'malu': -2}[who]
PAD = 6  # px abaixo da sola (FOOT_PAD)

src = np.array(Image.open(src_path).convert('RGBA'))
H, W = src.shape[:2]


def bounds(profile, n):
    """limites das n células: no meio dos vãos vazios entre os quadros (ou divisão igual)"""
    size = len(profile)
    if size % n == 0 and size // n == 256:
        return [i * 256 for i in range(n + 1)]
    occ = np.nonzero(profile)[0]
    runs, s0, p = [], occ[0], occ[0]
    for x in occ[1:]:
        if x > p + 1:
            runs.append((s0, p))
            s0 = x
        p = x
    runs.append((s0, p))
    if len(runs) != n:
        return [round(i * size / n) for i in range(n + 1)]
    return [0] + [(runs[i][1] + runs[i + 1][0]) // 2 for i in range(n - 1)] + [size]


opaque = src[..., 3] >= 128
BX = bounds(opaque.sum(0), 6)
BY = bounds(opaque.sum(1), 4)


def clean(m):
    """apaga pedacinhos soltos: pontos minúsculos e restos encostados na borda da célula"""
    h, w = m.shape
    seen = np.zeros_like(m)
    for y0, x0 in zip(*np.nonzero(m)):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        ys = [p[0] for p in pts]
        xs = [p[1] for p in pts]
        border = min(ys) == 0 or max(ys) == h - 1 or min(xs) == 0 or max(xs) == w - 1
        if len(pts) < 8 or (border and len(pts) < 60):
            for y, x in pts:
                m[y, x] = False
    return m


def defringe(cell, m):
    """halo claro do lado de fora do contorno: pixel quase branco que encosta no fundo
    e, do outro lado, no contorno escuro (some em algumas folhas ampliadas)"""
    rgb = cell[..., :3].astype(int)
    light = (rgb.min(-1) > 165) & (rgb.max(-1) - rgb.min(-1) < 45)
    dark = rgb.max(-1) < 70
    removed = 0
    for _ in range(2):
        pad = np.pad(m, 1)
        empty = ~pad[:-2, 1:-1] | ~pad[2:, 1:-1] | ~pad[1:-1, :-2] | ~pad[1:-1, 2:]
        dk = np.pad(dark & m, 1)
        near_dark = dk[:-2, 1:-1] | dk[2:, 1:-1] | dk[1:-1, :-2] | dk[1:-1, 2:]
        kill = m & light & empty & near_dark
        removed += int(kill.sum())
        m &= ~kill
    return m, removed


def keep_body(m):
    """fica só o corpo (maior pedaço) e o que encosta nele"""
    h, w = m.shape
    seen = np.zeros_like(m)
    comps = []
    for y0, x0 in zip(*np.nonzero(m)):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        comps.append(pts)
    body = max(comps, key=len)
    out = np.zeros_like(m)
    for y, x in body:
        out[y, x] = True
    return out


cells = []
fringe = 0
for r in range(4):
    for c in range(6):
        cell = src[BY[r]:BY[r + 1], BX[c]:BX[c + 1]].copy()
        m, k = defringe(cell, cell[..., 3] >= 128)
        fringe += k
        m = clean(m)
        if r * 6 + c in LOOSE:
            m = keep_body(m)
        cell[..., 3] = np.where(m, 255, 0)
        cell[~m] = 0
        ys, xs = np.nonzero(m)
        top, bot = ys.min(), ys.max()
        h = bot - top + 1
        lm = m
        if NO_WHITE:
            lm = m & ~(cell[..., :3].min(-1) > 170)
        legs = lm[top + int(h * 0.7):top + int(h * 0.9)]
        lx = float(np.median(np.nonzero(legs)[1]))
        cells.append((cell, m, top, bot, h, lx, xs.min(), xs.max()))

ext = max(max(lx - x0, x1 - lx) for _, _, _, _, _, lx, x0, x1 in cells)
FW = int(np.ceil((2 * (ext + abs(LEG_OFF)) + 8) / 2) * 2)
tallest = max(c[4] for c in cells)
FH = int(tallest + PAD + 1 + 3)
SOLE = FH - 1 - PAD
LEGX = FW // 2 + LEG_OFF
Hmed = int(np.median([c[4] for c in cells]))

frames = []
for cell, m, top, bot, h, lx, x0, x1 in cells:
    dx = int(round(LEGX - lx))
    dy = int(SOLE - bot)
    out = np.zeros((FH, FW, 4), np.uint8)
    ys, xs = np.nonzero(m)
    out[ys + dy, xs + dx] = cell[ys, xs]
    frames.append(out)

rows = [np.concatenate(frames[r * 6:(r + 1) * 6], axis=1) for r in range(4)]
sheet = np.concatenate(rows, axis=0)
Image.fromarray(sheet).save(out_path, optimize=True)
print(f'{out_path}: FW: {FW}, FH: {FH}, H: {Hmed}  (halo removido: {fringe} px)')
for i in MEASURE:
    f = frames[i]
    wm = (f[..., 3] > 0) & (f[..., :3].min(-1) > 170)
    wm = keep_body(wm)  # só o maior pedaço branco (o objeto, não os cordões e o tênis)
    ys, xs = np.nonzero(wm)
    print(f'  quadro {i}: branco no centro x={xs.mean() - LEGX:+.1f} px das pernas, {SOLE - ys.mean():.1f} px acima da sola, '
          f'{xs.max() - xs.min() + 1}×{ys.max() - ys.min() + 1} px')

if len(sys.argv) > 4:
    pv = Image.new('RGB', (FW * 6, FH * 4), (40, 34, 44))
    d = ImageDraw.Draw(pv)
    for i, f in enumerate(frames):
        im = Image.fromarray(f)
        x, y = (i % 6) * FW, (i // 6) * FH
        pv.paste(im, (x, y), im)
        d.text((x + 4, y + 2), str(i), fill=(255, 220, 120))
        d.line([(x, y + SOLE), (x + FW, y + SOLE)], fill=(90, 70, 90))
        d.line([(x + LEGX, y + FH - 20), (x + LEGX, y + FH)], fill=(90, 70, 90))
    pv.save(sys.argv[4])
