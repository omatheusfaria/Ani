@echo off
title Ani - servidor local (feche esta janela para parar)
cd /d "%~dp0"
set PORTA=5500
echo.
echo  Deixe esta janela aberta enquanto testa o jogo.
echo.
start "" http://localhost:%PORTA%
where python >nul 2>nul && (python servidor.py %PORTA% & goto :fim)
where py >nul 2>nul && (py servidor.py %PORTA% & goto :fim)
where npx >nul 2>nul && (npx --yes serve -l %PORTA% . & goto :fim)
echo  Nao encontrei Python nem Node.js instalados.
echo  Instale o Python em https://www.python.org/downloads/ e rode de novo.
pause
:fim
