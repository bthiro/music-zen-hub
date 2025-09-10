#!/bin/bash
# Test Mercado Pago Webhook

echo "🧪 Testing Mercado Pago Webhook..."

# Test webhook endpoint
curl -X POST "https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1609459200,v1=test_signature" \
  -d '{
    "action": "payment.updated",
    "data": { "id": "123456789" }
  }'

echo "✅ Webhook test completed"