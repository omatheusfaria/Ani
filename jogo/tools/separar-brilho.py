# Separa o brilho da tela do celular (o cone claro pintado na folha) do corpo da Ani.
# O corpo vai para o sprite normal; o brilho vira uma camada aditiva no jogo
# (assim ele ilumina em vez de ser uma mancha branca chapada).
# Uso: python tools/separar-brilho.py quadros.png corpo.png brilho.png
from PIL import Image
import numpy as np, sys

def dilate(m, n):
    for _ in range(n):
        d = m.copy()
        d[1:] |= m[:-1]; d[:-1] |= m[1:]; d[:, 1:] |= m[:, :-1]; d[:, :-1] |= m[:, 1:]
        m = d
    return m

im = np.array(Image.open(sys.argv[1]).convert('RGBA')).astype(int)
H, W = im.shape[:2]
r, g, b, al = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
mx = np.maximum(np.maximum(r, g), b)
mn = np.minimum(np.minimum(r, g), b)
yy = np.arange(H)[:, None] * np.ones((1, W))
# núcleo: claro, quase sem cor, puxado para o lilás/azul, da cintura para cima
core = (al > 0) & (mx > 120) & (b >= r - 6) & (b >= g) & ((mx - mn) < 60) & (yy < 150)
# borda do cone: pixels médios acinzentados encostados no núcleo
edge = dilate(core, 2) & (al > 0) & (mx > 55) & (b >= r - 10) & ((mx - mn) < 70) & ~core
m = core | edge
body = im.copy(); body[m] = 0
glow = np.zeros_like(im); glow[m] = im[m]
Image.fromarray(body.astype(np.uint8)).save(sys.argv[2], optimize=True)
Image.fromarray(glow.astype(np.uint8)).save(sys.argv[3], optimize=True)
print('brilho:', int(m.sum()), 'px')
