# Folha de cena de costas com as duas juntas (assets/sprites/cena-final.png: Ani e Malu da cintura
# para cima, a Malu deita no ombro da Ani) → folha 6×4 de célula própria para o final da roda-gigante:
#   - acha cada quadro pelos vãos (na folha eles não batem com a grade de 256 px);
#   - binariza o alfa e apaga restos;
#   - alinha pela linha da cintura (o corte de baixo) e pela borda esquerda da Ani nessa linha;
#   - contorno de luz igual ao dos sprites de costas antigos: quente à direita (lâmpadas da roda),
#     frio à esquerda (lua), um tiquinho no topo.
# Imprime FW, FH e o tamanho da Ani (topo da cabeça até a cintura) para o JS achar a escala.
# Uso: python tools/recortar-cena-costas.py entrada.png saida.png [previa.png]
from PIL import Image
import numpy as np, sys

src = np.array(Image.open(sys.argv[1]).convert('RGBA'))
out_path = sys.argv[2]
op = src[..., 3] >= 128


def runs(v):
    occ = np.nonzero(v)[0]
    r, s, p = [], occ[0], occ[0]
    for x in occ[1:]:
        if x > p + 1:
            r.append((s, p))
            s = x
        p = x
    r.append((s, p))
    return r


rows = [rr for rr in runs(op.sum(1)) if rr[1] - rr[0] > 50]
assert len(rows) == 4, rows
frames, cut = [], []
for (y0, y1) in rows:
    cols = [cc for cc in runs(op[y0:y1 + 1].sum(0)) if cc[1] - cc[0] > 50]
    assert len(cols) == 6, cols
    for (x0, x1) in cols:
        cell = src[y0:y1 + 1, x0:x1 + 1].copy()
        m = op[y0:y1 + 1, x0:x1 + 1]
        cell[..., 3] = np.where(m, 255, 0)
        cell[~m] = 0
        frames.append(cell)
        cut.append(x1 == src.shape[1] - 1)

# âncora: linha de baixo (cintura) e a borda esquerda da Ani nessa linha
anchors = []
for f in frames:
    m = f[..., 3] > 0
    ys = np.nonzero(m.any(1))[0]
    bot = ys.max()
    row = np.nonzero(m[bot - 2])[0]
    anchors.append((row.min(), bot))
ax = max(a[0] for a in anchors)
pad = 6
W = max(f.shape[1] - a[0] for f, a in zip(frames, anchors)) + ax + pad
H = max(a[1] for a in anchors) + 1
FW, FH = W + (W % 2), H + 2
cells = []
for f, (lx, bot) in zip(frames, anchors):
    out = np.zeros((FH, FW, 4), np.uint8)
    dx, dy = ax - lx + pad // 2, (FH - 2) - 1 - bot
    h, w = f.shape[:2]
    ys, xs = np.nonzero(f[..., 3])
    ok = (ys + dy >= 0) & (ys + dy < FH) & (xs + dx >= 0) & (xs + dx < FW)
    out[ys[ok] + dy, xs[ok] + dx] = f[ys[ok], xs[ok]]
    cells.append(out)


def rim(c):
    a = c[..., 3] > 0
    d = c[..., :3].astype(int)
    o = c.copy()
    pa = np.pad(a, 2)
    R1 = ~pa[2:-2, 3:-1]  # vazio à direita
    R2 = ~pa[2:-2, 4:]
    L1 = ~pa[2:-2, 1:-3]
    U1 = ~pa[1:-3, 2:-2]
    warm = a & R1
    warm2 = a & ~R1 & R2
    cold = a & ~R1 & ~R2 & L1
    top = a & ~R1 & ~R2 & ~L1 & U1
    o[warm, :3] = (255, 186, 120)
    o[warm2, :3] = np.minimum(255, d[warm2] + (90, 50, 20))
    o[cold, :3] = (130, 142, 220)
    o[top, :3] = np.minimum(255, d[top] + (60, 50, 70))
    return o


cells = [rim(c) for c in cells]
sheet = np.concatenate([np.concatenate(cells[r * 6:(r + 1) * 6], axis=1) for r in range(4)], axis=0)
Image.fromarray(sheet).save(out_path, optimize=True)
# tamanho da Ani: do topo da cabeça (sem o fone) até a cintura, no quadro 0
m0 = cells[0][..., 3] > 0
ani_top = np.nonzero(m0[:, :FW // 2].any(1))[0].min()
print(f'{out_path}: FW: {FW}, FH: {FH}, Ani da cabeça à cintura: {FH - 2 - ani_top} px, '
      f'cortados na borda da folha: {[i for i, c in enumerate(cut) if c]}')

if len(sys.argv) > 3:
    pv = Image.new('RGB', (FW * 6, FH * 4), (40, 34, 44))
    sh = Image.fromarray(sheet)
    pv.paste(sh, (0, 0), sh)
    pv.save(sys.argv[3])
