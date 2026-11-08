# Recorta a folha do Sprite Fusion (6×4 de 256 px), binariza o alfa (tira o halo do fundo)
# e alinha cada quadro pelos pés no mesmo formato do ani-andando (168×246, sola em y=239,
# pernas em x=80). Uso: python tools/recortar-folha.py entrada.png saida.png [preview.png]
from PIL import Image, ImageDraw
import numpy as np, sys
FW, FH, SOLE, LEGX = 168, 246, 239, 80
src = np.array(Image.open(sys.argv[1]).convert('RGBA'))
H, W = src.shape[:2]
cw, ch = W // 6, H // 4
frames = []
for r in range(4):
    for c in range(6):
        cell = src[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw].copy()
        a = cell[..., 3]
        m = a >= 128
        cell[..., 3] = np.where(m, 255, 0)
        cell[~m] = 0
        ys, xs = np.nonzero(m)
        top, bot = ys.min(), ys.max()
        h = bot - top + 1
        legs = m[top + int(h * 0.7):top + int(h * 0.9)]
        lx = float(np.median(np.nonzero(legs)[1]))
        dx = int(round(LEGX - lx)); dy = int(SOLE - bot)
        out = np.zeros((FH, FW, 4), np.uint8)
        for y in range(ch):
            ty = y + dy
            if ty < 0 or ty >= FH: continue
            x0 = max(0, -dx); x1 = min(cw, FW - dx)
            if x1 <= x0: continue
            row = cell[y, x0:x1]
            keep = row[..., 3] > 0
            seg = out[ty, x0 + dx:x1 + dx]
            seg[keep] = row[keep]
        clipped = (m[:, :max(0, -dx)].any() if dx < 0 else False) or (m[:, FW - dx:].any() if FW - dx < cw else False)
        if clipped: print('aviso: quadro', len(frames), 'cortado na borda')
        frames.append(out)
strip = np.concatenate(frames, axis=1)
Image.fromarray(strip).save(sys.argv[2], optimize=True)
print('ok', strip.shape, len(frames))
if len(sys.argv) > 3:
    # prévia: fundo escuro, números
    pv = Image.new('RGB', (FW * 12, FH * 2 + 20), (40, 34, 44))
    for i, f in enumerate(frames):
        im = Image.fromarray(f)
        x, y = (i % 12) * FW, (i // 12) * (FH + 10)
        pv.paste(im, (x, y), im)
        d = ImageDraw.Draw(pv)
        d.text((x + 4, y + 2), str(i), fill=(255, 220, 120))
        d.line([(x, y + SOLE), (x + FW, y + SOLE)], fill=(90, 70, 90))
    pv.save(sys.argv[3])
