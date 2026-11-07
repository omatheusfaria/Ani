#!/usr/bin/env bash
# Ani - servidor local para Linux/macOS. Feche o terminal (ou Ctrl+C) para parar.
cd "$(dirname "$0")" || exit 1
PORTA=5500
echo
echo "  Deixe este terminal aberto enquanto testa o jogo."
echo

PY=$(command -v python3 || command -v python)
if [ -z "$PY" ]; then
  echo "  Não encontrei o Python. No Ubuntu: sudo apt install python3"
  exit 1
fi

# abre o navegador um instante depois do servidor subir
( sleep 1; (xdg-open "http://localhost:$PORTA" || open "http://localhost:$PORTA") >/dev/null 2>&1 ) &
exec "$PY" servidor.py "$PORTA"
