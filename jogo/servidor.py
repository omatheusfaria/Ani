# Servidor local do Ani: igual ao "python -m http.server", mas manda o
# navegador nunca guardar cache. Assim um F5 comum sempre mostra a versão nova.
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class SemCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.woff2': 'font/woff2',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *args):
        pass


print(f'  Ani rodando em http://localhost:{PORT}  (feche esta janela para parar)')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), SemCache).serve_forever()
