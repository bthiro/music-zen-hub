#!/bin/bash

echo "=========================================="
echo "   Iniciando ClassPro Development Server"
echo "=========================================="
echo

# Função para abrir o navegador dependendo do SO
open_browser() {
    if command -v xdg-open > /dev/null; then
        # Linux
        xdg-open http://localhost:5173
    elif command -v open > /dev/null; then
        # macOS
        open http://localhost:5173
    elif command -v start > /dev/null; then
        # Windows (WSL)
        start http://localhost:5173
    else
        echo "Não foi possível abrir o navegador automaticamente."
        echo "Acesse manualmente: http://localhost:5173"
    fi
}

echo "Abrindo o navegador..."
open_browser

echo
echo "Iniciando servidor de desenvolvimento..."
echo

# Executar npm run dev
npm run dev