#!/bin/bash
# ClassPro Installation Validator

echo "🔍 ClassPro - Validador de Instalação"
echo "====================================="

# Check Node.js version
echo "1. Verificando Node.js..."
node_version=$(node --version 2>/dev/null | sed 's/v//')
if [[ -z "$node_version" ]]; then
    echo "❌ Node.js não instalado"
    exit 1
fi

major_version=$(echo $node_version | cut -d. -f1)
if [[ $major_version -lt 18 ]]; then
    echo "❌ Node.js $node_version detectado. Requer versão 18+"
    exit 1
fi
echo "✅ Node.js $node_version (OK)"

# Check if .env.local exists
echo "2. Verificando variáveis de ambiente..."
if [[ ! -f ".env.local" ]]; then
    echo "❌ Arquivo .env.local não encontrado"
    echo "   Execute: cp .env.example .env.local"
    exit 1
fi
echo "✅ Arquivo .env.local encontrado"

# Check for required variables
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_AUTH_MODE")
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        echo "❌ Variável $var não encontrada no .env.local"
        exit 1
    fi
done
echo "✅ Variáveis obrigatórias configuradas"

# Test Supabase connectivity
echo "3. Testando conectividade Supabase..."
supabase_url=$(grep "VITE_SUPABASE_URL=" .env.local | cut -d= -f2 | tr -d '"')
if curl -s -f "$supabase_url/rest/v1/" > /dev/null; then
    echo "✅ Supabase acessível"
else
    echo "❌ Falha ao acessar Supabase: $supabase_url"
    exit 1
fi

# Test webhook endpoint
echo "4. Testando webhook endpoint..."
webhook_url="https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook"
if curl -s -f "$webhook_url" -X POST -H "Content-Type: application/json" -d '{}' > /dev/null; then
    echo "✅ Webhook endpoint acessível"
else
    echo "⚠️  Webhook endpoint pode estar inacessível (normal se Edge Function não publicada)"
fi

# Check package.json and node_modules
echo "5. Verificando dependências..."
if [[ ! -f "package.json" ]]; then
    echo "❌ package.json não encontrado"
    exit 1
fi

if [[ ! -d "node_modules" ]]; then
    echo "❌ node_modules não encontrado. Execute: npm install"
    exit 1
fi
echo "✅ Dependências instaladas"

# All checks passed
echo ""
echo "🎉 Instalação validada com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. npm run dev (para iniciar o servidor)"
echo "2. Acesse http://localhost:5173"
echo "3. Siga docs/TESTING.md para testes completos"
echo ""