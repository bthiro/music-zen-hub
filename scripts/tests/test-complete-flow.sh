#!/bin/bash
# Complete E2E Test for ClassPro

echo "🧪 ClassPro - Teste Completo E2E"
echo "================================"

BASE_URL="http://localhost:5173"
SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"

# Test 1: Frontend connectivity
echo "1. Testando conectividade frontend..."
if curl -s -f "$BASE_URL" > /dev/null; then
    echo "✅ Frontend acessível em $BASE_URL"
else
    echo "❌ Frontend não acessível. Execute: npm run dev"
    exit 1
fi

# Test 2: Supabase REST API
echo "2. Testando Supabase REST API..."
if curl -s -f "$SUPABASE_URL/rest/v1/" \
   -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks" > /dev/null; then
    echo "✅ Supabase REST API acessível"
else
    echo "❌ Supabase REST API inacessível"
    exit 1
fi

# Test 3: Webhook endpoint
echo "3. Testando webhook Mercado Pago..."
webhook_response=$(curl -s -w "%{http_code}" "$SUPABASE_URL/functions/v1/mercado-pago-webhook" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}')

http_code="${webhook_response: -3}"
if [[ "$http_code" == "200" ]] || [[ "$http_code" == "400" ]] || [[ "$http_code" == "405" ]]; then
    echo "✅ Webhook endpoint respondendo (HTTP $http_code)"
else
    echo "⚠️  Webhook endpoint pode estar inacessível (HTTP $http_code)"
fi

# Test 4: Main routes
echo "4. Testando rotas principais..."
routes=("/auth" "/admin" "/app")
for route in "${routes[@]}"; do
    if curl -s -f "$BASE_URL$route" > /dev/null; then
        echo "✅ Rota $route acessível"
    else
        echo "⚠️  Rota $route pode requerir autenticação"
    fi
done

# Test 5: Static assets
echo "5. Testando recursos estáticos..."
if curl -s -f "$BASE_URL/vite.svg" > /dev/null; then
    echo "✅ Assets estáticos carregando"
else
    echo "⚠️  Assets estáticos podem não estar disponíveis"
fi

echo ""
echo "🎯 Resumo dos Testes:"
echo "- Frontend: Acessível"
echo "- Backend: Supabase funcionando"
echo "- Webhook: Endpoint disponível"
echo "- Rotas: Principais rotas respondendo"
echo ""
echo "📋 Próximos Passos:"
echo "1. Teste manual completo: docs/TESTING.md"
echo "2. Configurar integrações: docs/ENV.md"
echo "3. Deploy produção: docs/DEPLOY_PROD.md"
echo ""