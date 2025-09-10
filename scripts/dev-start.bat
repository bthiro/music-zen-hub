@echo off
title ClassPro Development Server

echo ==========================================
echo    Iniciando ClassPro Development Server
echo ==========================================
echo.

:: Abrir o navegador automaticamente
echo Abrindo o navegador...
start "" http://localhost:5173

echo.
echo Iniciando servidor de desenvolvimento...
echo.

:: Executar npm run dev
npm run dev

echo.
echo ==========================================
echo    Pressione qualquer tecla para sair
echo ==========================================
pause > nul