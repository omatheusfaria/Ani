# Objeto solto desenhado grande (ex.: assets/sprites/travesseiro.png) → sprite pequeno na mesma
# densidade de pixels das folhas das personagens:
#   - corta o que é vazio em volta;
#   - reduz para a largura pedida (em px da folha; ex.: o travesseiro deitado mede 91 px na folha
#     ani-travesseiro, quadro 5): cor pela média (sem serrilhado) e alfa binarizado;
#   - contorno escuro de 1 px em volta (como os sprites).
# Uso: python tools/recortar-objeto.py entrada.png saida.png largura
from PIL import Image
import numpy as np, sys

src, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGBA')
a = np.array(im)
ys, xs = np.nonzero(a[..., 3] >= 128)
im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
h = round(im.height * width / im.width)
# cor pré-multiplicada pelo alfa antes de reduzir (a borda não puxa a cor do fundo)
p = np.array(im).astype(float)
p[..., :3] *= p[..., 3:4] / 255
small = np.array(Image.fromarray(p.clip(0, 255).astype(np.uint8)).resize((width, h), Image.BOX)).astype(float)
alpha = small[..., 3]
m = alpha >= 128
rgb = np.where(m[..., None], small[..., :3] * 255 / np.maximum(alpha[..., None], 1), 0).clip(0, 255)
res = np.zeros((h + 2, width + 2, 4), np.uint8)
res[1:-1, 1:-1, :3] = rgb
res[1:-1, 1:-1, 3] = np.where(m, 255, 0)
# contorno de 1 px
mm = res[..., 3] > 0
pad = np.pad(mm, 1)
ring = ~mm & (pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:])
res[ring] = (20, 16, 24, 255)
Image.fromarray(res).save(out, optimize=True)
print(f'{out}: {width + 2}×{h + 2} px')
