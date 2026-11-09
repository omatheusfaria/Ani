#!/usr/bin/env bash
# Ani - servidor local para Linux (Ubuntu). Equivalente ao iniciar-servidor.bat.
# Uso: ./iniciar-servidor.sh          (porta 5500)
#      ./iniciar-servidor.sh 8080     (outra porta)

cd "$(dirname "$(readlink -f "$0")")" || exit 1
PORTA="${1:-5500}"
URL="http://localhost:$PORTA"

echo
echo "  Deixe este terminal aberto enquanto testa o jogo."
echo "  Para parar o servidor, aperte Ctrl+C."
echo

# Abre o navegador um instante depois, quando o servidor já estiver no ar.
abrir_navegador() {
  ( sleep 1; xdg-open "$URL" >/dev/null 2>&1 ) &
}

if command -v python3 >/dev/null 2>&1; then
  abrir_navegador
  exec python3 servidor.py "$PORTA"
elif command -v python >/dev/null 2>&1; then
  abrir_navegador
  exec python servidor.py "$PORTA"
elif command -v npx >/dev/null 2>&1; then
  abrir_navegador
  exec npx --yes serve -l "$PORTA" .
fi

echo "  Nao encontrei Python nem Node.js instalados."
echo "  Instale o Python com:  sudo apt install python3"
read -rp "  Aperte Enter para sair..."
exit 1
