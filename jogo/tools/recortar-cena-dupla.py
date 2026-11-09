# Separa uma folha de CENA com as duas personagens na mesma célula (Sprite Fusion, 6×4 de 256 px,
# Ani à esquerda e Malu à direita, ex.: assets/sprites/cena-cabine.png) em duas folhas, uma para
# cada uma, no formato de célula própria que o jogo usa (igual a tools/recortar-comida.py):
#   - binariza o alfa, tira o halo claro, apaga pixels soltos e restos da célula vizinha;
#   - corta as duas por uma "costura" vertical que atravessa o mínimo de pixels opacos
#     (programação dinâmica, entre as pernas de uma e da outra); fios do cabelo laranja da Malu
#     que caem do lado da Ani voltam para a Malu;
#   - alinha cada quadro pela sola e pelas pernas, célula larga o bastante para o braço esticado;
#   - grava em grade 6×4. Imprime FW, FH e H (altura da personagem) de cada folha para o JS.
# Uso: python tools/recortar-cena-dupla.py entrada.png saida-ani.png saida-malu.png [previa.png]
from PIL import Image, ImageDraw
from collections import deque
import numpy as np, sys

src_path, out_ani, out_malu = sys.argv[1], sys.argv[2], sys.argv[3]
LEG_OFF = {'ani': -4, 'malu': -2}
PAD = 6
EXT = 24  # px da célula vizinha que podem pertencer a esta

src = np.array(Image.open(src_path).convert('RGBA'))
Hs, Ws = src.shape[:2]
cw, ch = Ws // 6, Hs // 4


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
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        out.append(np.array(pts))
    return out


def clean(m, keep_big=True):
    """apaga pontinhos e restos da célula vizinha encostados na borda"""
    h, w = m.shape
    for pts in components(m):
        ys, xs = pts[:, 0], pts[:, 1]
        border = ys.min() == 0 or ys.max() == h - 1 or xs.min() == 0 or xs.max() == w - 1
        if len(pts) < 8 or (border and len(pts) < 400):
            m[ys, xs] = False
    return m


def defringe(cell, m):
    rgb = cell[..., :3].astype(int)
    light = (rgb.min(-1) > 165) & (rgb.max(-1) - rgb.min(-1) < 45)
    dark = rgb.max(-1) < 70
    for _ in range(2):
        pad = np.pad(m, 1)
        empty = ~pad[:-2, 1:-1] | ~pad[2:, 1:-1] | ~pad[1:-1, :-2] | ~pad[1:-1, 2:]
        dk = np.pad(dark & m, 1)
        near_dark = dk[:-2, 1:-1] | dk[2:, 1:-1] | dk[1:-1, :-2] | dk[1:-1, 2:]
        m &= ~(m & light & empty & near_dark)
    return m


def seam(m, xa, xb):
    """caminho de cima a baixo, entre as colunas xa e xb, que cruza o mínimo de pixels opacos"""
    h, w = m.shape
    xs = np.arange(xa, xb + 1)
    mid = (xa + xb) / 2
    cost = m[:, xa:xb + 1].astype(float) * 10 + np.abs(xs - mid)[None, :] * 0.002
    acc = cost.copy()
    back = np.zeros(cost.shape, int)
    n = len(xs)
    for y in range(1, h):
        prev = acc[y - 1]
        opts = np.stack([np.r_[np.inf, prev[:-1]] + 0.01, prev, np.r_[prev[1:], np.inf] + 0.01])
        k = opts.argmin(0)
        acc[y] += opts[k, np.arange(n)]
        back[y] = np.arange(n) + (k - 1)
    path = np.zeros(h, int)
    path[-1] = int(acc[-1].argmin())
    for y in range(h - 1, 0, -1):
        path[y - 1] = back[y, path[y]]
    return path + xa


def leg_runs(m):
    ys, _ = np.nonzero(m)
    top, bot = ys.min(), ys.max()
    h = bot - top
    legs = m[top + int(h * 0.78):top + int(h * 0.9)]
    occ = np.nonzero(legs.sum(0))[0]
    runs, s, p = [], occ[0], occ[0]
    for x in occ[1:]:
        if x > p + 1:
            runs.append((s, p))
            s = x
        p = x
    runs.append((s, p))
    return runs


halves = {'ani': [], 'malu': []}
for r in range(4):
    for c in range(6):
        # a célula + uma faixa da vizinha da direita: pé ou mão que passou da borda volta
        cell = src[r * ch:(r + 1) * ch, c * cw:min(Ws, (c + 1) * cw + EXT)].copy()
        m = defringe(cell, cell[..., 3] >= 128)
        for pts in components(m):
            ys, xs = pts[:, 0], pts[:, 1]
            # fica: o que tem pixel dentro da célula, sem ser resto da vizinha da esquerda
            if xs.min() >= cw or len(pts) < 8 or (xs.min() == 0 and len(pts) < 400):
                m[ys, xs] = False
        runs = sorted(leg_runs(m), key=lambda t: t[1] - t[0], reverse=True)[:2]
        runs.sort()
        if len(runs) == 1:
            # os pés das duas se encostam: divide no ponto mais vazio do meio da faixa das pernas
            s, e = runs[0]
            ys, _ = np.nonzero(m)
            top, bot = ys.min(), ys.max()
            prof = m[top + int((bot - top) * 0.78):top + int((bot - top) * 0.9), s:e + 1].sum(0)
            lo, hi = int(len(prof) * 0.3), int(len(prof) * 0.7)
            cut = s + lo + int(prof[lo:hi].argmin())
            runs = [(s, cut - 1), (cut + 1, e)]
        (a0, a1), (b0, b1) = runs
        # a costura passa entre o meio das pernas da Ani e o meio das da Malu
        path = seam(m, (a0 + a1) // 2 + 8, (b0 + b1) // 2 - 8)
        X = np.arange(m.shape[1])[None, :]
        left = X <= path[:, None]
        ma, mm = m & left, m & ~left
        # cabelo laranja da Malu que ficou do lado da Ani volta para ela (a Ani não tem laranja)
        rgb = cell[..., :3].astype(int)
        R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        # laranja do cabelo, também na sombra (ferrugem): azul bem abaixo do verde, o que a
        # calça vinho (azul ≈ verde), a pele e o pingente dourado da Ani não têm
        orange = (R > 90) & (G > 35) & (B < G * 0.8) & (R > G * 1.5) & (R - B > 60)
        move = ma & orange
        # e o contorno escuro desses fios (pixel escuro encostado no laranja movido, sem encostar na Ani)
        for _ in range(2):
            pm = np.pad(move, 1)
            nb = pm[:-2, 1:-1] | pm[2:, 1:-1] | pm[1:-1, :-2] | pm[1:-1, 2:]
            dark = rgb.max(-1) < 80
            rest = ma & ~move
            pr = np.pad(rest & ~dark, 1)
            touch_ani = pr[:-2, 1:-1] | pr[2:, 1:-1] | pr[1:-1, :-2] | pr[1:-1, 2:]
            move |= ma & dark & nb & ~touch_ani
        # só muda de lado o que fica ligado ao corpo da Malu (as fotinhas da tirinha na mão
        # da Ani também têm o cabelo laranja dela desenhado: essas ficam com a Ani)
        comps = components(mm | move)
        body = max(comps, key=len)
        keep = np.zeros_like(move)
        keep[body[:, 0], body[:, 1]] = True
        move &= keep
        ma &= ~move
        mm |= move
        # pedacinhos que sobraram soltos de cada lado
        for mk in (ma, mm):
            comps = components(mk)
            big = max(len(p) for p in comps)
            for pts in comps:
                if len(pts) < 40 and len(pts) < big:
                    mk[pts[:, 0], pts[:, 1]] = False
        for who, mk in (('ani', ma), ('malu', mm)):
            cc = cell.copy()
            cc[..., 3] = np.where(mk, 255, 0)
            cc[~mk] = 0
            ys, xs = np.nonzero(mk)
            top, bot = ys.min(), ys.max()
            h = bot - top + 1
            lr = sorted(leg_runs(mk), key=lambda t: t[1] - t[0], reverse=True)[0]
            legs = mk[top + int(h * 0.7):top + int(h * 0.9)]
            lxs = np.nonzero(legs)[1]
            lxs = lxs[(lxs >= lr[0] - 30) & (lxs <= lr[1] + 30)]
            lx = float(np.median(lxs))
            halves[who].append((cc, mk, top, bot, h, lx, xs.min(), xs.max()))


def pack(who, cells, out_path):
    off = LEG_OFF[who]
    ext = max(max(lx - x0, x1 - lx) for _, _, _, _, _, lx, x0, x1 in cells)
    FW = int(np.ceil((2 * (ext + abs(off)) + 8) / 2) * 2)
    FH = int(max(c[4] for c in cells) + PAD + 1 + 3)
    SOLE = FH - 1 - PAD
    LEGX = FW // 2 + off
    Hmed = int(np.median([c[4] for c in cells]))
    frames = []
    for cell, m, top, bot, h, lx, x0, x1 in cells:
        dx, dy = int(round(LEGX - lx)), int(SOLE - bot)
        out = np.zeros((FH, FW, 4), np.uint8)
        ys, xs = np.nonzero(m)
        out[ys + dy, xs + dx] = cell[ys, xs]
        frames.append(out)
    rows = [np.concatenate(frames[r * 6:(r + 1) * 6], axis=1) for r in range(4)]
    Image.fromarray(np.concatenate(rows, axis=0)).save(out_path, optimize=True)
    print(f'{out_path}: FW: {FW}, FH: {FH}, H: {Hmed}')
    return frames, FW, FH, SOLE, LEGX


fa = pack('ani', halves['ani'], out_ani)
fm = pack('malu', halves['malu'], out_malu)

if len(sys.argv) > 4:
    # prévia: as duas lado a lado em cada quadro, com a linha da sola
    (A, AW, AH, AS, AL), (M, MW, MH, MS, ML) = fa, fm
    cwp, chp = AW + MW, max(AH, MH)
    pv = Image.new('RGB', (cwp * 6, chp * 4), (40, 34, 44))
    d = ImageDraw.Draw(pv)
    for i in range(24):
        x, y = (i % 6) * cwp, (i // 6) * chp
        ia, im = Image.fromarray(A[i]), Image.fromarray(M[i])
        pv.paste(ia, (x, y + chp - AH), ia)
        pv.paste(im, (x + AW, y + chp - MH), im)
        d.text((x + 4, y + 2), str(i), fill=(255, 220, 120))
        d.line([(x, y + chp - 1 - PAD), (x + cwp, y + chp - 1 - PAD)], fill=(90, 70, 90))
        d.line([(x + AW, y), (x + AW, y + chp)], fill=(60, 50, 64))
    pv.save(sys.argv[4])
