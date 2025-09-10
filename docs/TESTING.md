# 🧪 Roteiros de Teste - ClassPro

## 📋 Preparação para Testes

### **Dados de Teste Necessários:**
- **Professor**: Conta de teste criada
- **Aluno**: Cadastro fictício (Nome: "João Teste", Email: teste@example.com)
- **Mercado Pago**: Conta sandbox ativa
- **Google**: Conta Gmail para OAuth

---

## 🔐 1. Teste de Autenticação

### **Cenário: Login/Logout**
```bash
# 1. Acesse a aplicação
Navegador → http://localhost:5173

# 2. Teste modo desenvolvimento (VITE_AUTH_MODE=open)
Resultado esperado: Acesso direto às funcionalidades

# 3. Teste modo produção (VITE_AUTH_MODE=locked)
Resultado esperado: Redirecionamento para /auth

# 4. Teste login admin (primeiro usuário)
Email: admin@teste.com
Senha: 123456
Resultado esperado: Redirecionamento para /admin

# 5. Teste login professor
Email: professor@teste.com  
Senha: 123456
Resultado esperado: Redirecionamento para /app
```

**✅ Validação no Banco:**
```sql
-- Verificar criação de usuário
SELECT * FROM auth.users WHERE email = 'professor@teste.com';

-- Verificar role do usuário  
SELECT * FROM user_roles WHERE user_id = '...';

-- Verificar perfil do professor
SELECT * FROM professores WHERE email = 'professor@teste.com';
```

---

## 👥 2. Teste de Cadastro de Alunos

### **Cenário: CRUD Completo**

**2.1. Criar Aluno**
```bash
# Navegue para /app/alunos
# Clique "Novo Aluno"
# Preencha:
Nome: João da Silva Teste
Email: joao.teste@example.com
Telefone: (11) 99999-9999
Data Nascimento: 01/01/2000
Instrumento: Violão
Nível: Iniciante
Valor Mensalidade: R$ 200,00
Dia Vencimento: 5
Duração Aula: 50 min

# Clique "Salvar"
```

**✅ Validação no Banco:**
```sql
SELECT * FROM alunos WHERE nome = 'João da Silva Teste';
-- Campos esperados:
-- - professor_id: vinculado ao professor logado
-- - ativo: true
-- - created_at: timestamp atual
```

**2.2. Editar Aluno**
- Altere o telefone para: (11) 88888-8888
- Confirme que a alteração persiste

**2.3. Filtrar/Buscar**
- Teste busca por nome: "João"
- Teste filtro por instrumento: "Violão"

---

## 💰 3. Teste de Pagamentos (Manual e Automático)

### **3.1. Criar Pagamento Manual**
```bash
# Navegue para /app/pagamentos
# Localize o aluno "João da Silva Teste"
# Status inicial: "pendente"

# Teste Mercado Pago:
# Clique "Mercado Pago"
# Preencha valor: R$ 200,00
# Confirme → deve abrir checkout do MP
```

### **3.2. Simular Pagamento Aprovado (Sandbox)**

**Via Interface do MP:**
- Complete o pagamento com cartão de teste: `4509 9535 6623 3704`
- CVV: 123, Vencimento: 11/25
- Nome: APRO (aprovação automática)

**Resultado Esperado:**
- Webhook deve ser chamado automaticamente
- Status no banco: `pendente` → `pago`
- Flag `eligible_to_schedule`: `true`
- Botão "Agendar Aulas" deve aparecer

### **3.3. Teste de Reprocessamento Manual**

**Via cURL (Admin):**
```bash
# Obtenha o payment_id do Mercado Pago
PAYMENT_ID="123456789"

# Teste reprocessamento
curl -X POST "https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-reprocess" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d "{\"payment_id\": \"$PAYMENT_ID\"}"

# Resultado esperado: {"success": true, "status": "pago"}
```

**✅ Validação no Banco:**
```sql
-- Verificar status do pagamento
SELECT id, status, data_pagamento, eligible_to_schedule, mercado_pago_payment_id 
FROM pagamentos 
WHERE mercado_pago_payment_id = '123456789';

-- Verificar log de auditoria
SELECT * FROM audit_log 
WHERE action = 'pagamento_confirmado' 
ORDER BY created_at DESC LIMIT 5;

-- Verificar idempotência do webhook
SELECT * FROM webhook_events 
WHERE id_evento LIKE '%123456789%';
```

---

## 📅 4. Teste de Agendamento de Aulas

### **4.1. Agendar Primeira Aula (Pós-Pagamento)**
```bash
# Com pagamento "pago", clique "Agendar Aulas"
# Preencha:
Data: Próxima segunda-feira
Horário: 10:00
Duração: 50 min (automático, baseado no aluno)
Observações: Primeira aula - revisão básica

# Clique "Salvar"
```

**Resultado Esperado:**
- Aula criada no banco
- Se Google conectado: evento criado + link do Meet
- Se Google falhou: aula local + botão "Tentar novamente"

### **4.2. Teste de Conflito de Horário**
```bash
# Tente agendar outra aula no mesmo horário
# Resultado esperado: Erro "Conflito de horário detectado"
```

### **4.3. Editar Aula**
- Altere horário para 11:00
- Confirme atualização no Google Calendar (se conectado)

### **4.4. Cancelar Aula**
- Status: "agendada" → "cancelada"
- Confirme remoção/atualização no Google Calendar

**✅ Validação no Banco:**
```sql
-- Verificar aula criada
SELECT * FROM aulas WHERE aluno_id = 'ID_DO_ALUNO' ORDER BY created_at DESC LIMIT 1;

-- Campos esperados:
-- - google_event_id: se Google conectado
-- - link_meet: se Google conectado
-- - status: 'agendada'
-- - duracao_minutos: 50 (do aluno)

-- Verificar audit log
SELECT * FROM audit_log WHERE action = 'aula_criada' ORDER BY created_at DESC LIMIT 1;
```

---

## 🔗 5. Teste de Google Calendar

### **5.1. Conectar Google**
```bash
# Navegue para /app/configuracoes
# Clique "Conectar Google Calendar"
# Complete o OAuth (use conta Gmail real)
# Resultado esperado: Status "Conectado" + email exibido
```

### **5.2. Criar Evento + Meet**
```bash
# Crie uma aula (processo anterior)
# Verifique no Google Calendar:
# - Evento criado com nome: "Aula de Música - João da Silva Teste"
# - Horário correto
# - Link do Meet anexado
```

### **5.3. Teste de Falha do Google**
```bash
# Desative temporariamente a integração (mude status no banco)
UPDATE integration_configs SET status = 'disconnected' WHERE integration_name = 'google_calendar';

# Crie uma aula
# Resultado esperado: 
# - Aula criada localmente
# - Mensagem: "Aula criada. Falha ao sincronizar com Google Calendar"
# - Botão "Tentar novamente" disponível
```

**✅ Validação:**
```sql
-- Verificar status da integração
SELECT * FROM integration_configs WHERE integration_name = 'google_calendar';

-- Verificar logs da edge function
-- No Supabase Dashboard → Edge Functions → google-calendar → Logs
```

---

## 🔧 6. Teste de Webhook do Mercado Pago

### **6.1. Simular Webhook Completo**

**Estrutura do evento real:**
```bash
# Headers obrigatórios:
x-signature: ts=1609459200,v1=abc123...
Content-Type: application/json

# Body do webhook:
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2021-01-01T00:00:00Z",
  "id": 12345,
  "live_mode": false,
  "type": "payment",
  "user_id": "USER_ID"
}
```

### **6.2. Teste Manual do Webhook**

**Gerar assinatura válida (Node.js):**
```javascript
const crypto = require('crypto');

const secret = 'sua_webhook_secret_key';
const dataId = '123456789';
const requestBody = JSON.stringify({
  action: 'payment.updated',
  data: { id: dataId }
});

const ts = Math.floor(Date.now() / 1000);
const manifest = `id:123;request-url:https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook;ts:${ts};`;
const hmac = crypto.createHmac('sha256', secret);
hmac.update(manifest + requestBody);
const signature = hmac.digest('hex');

console.log(`x-signature: ts=${ts},v1=${signature}`);
```

**Enviar webhook:**
```bash
curl -X POST "https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1609459200,v1=calculated_signature" \
  -d '{
    "action": "payment.updated",
    "data": { "id": "123456789" }
  }'

# Resposta esperada: {"success": true}
```

### **6.3. Teste de Idempotência**
```bash
# Envie o mesmo webhook 2x
# Resultado esperado:
# - 1ª vez: processamento completo
# - 2ª vez: {"success": true, "message": "Event already processed"}
```

**✅ Validação:**
```sql
-- Verificar evento processado
SELECT * FROM webhook_events WHERE id_evento = '123456789' OR payload ->> 'data' ->> 'id' = '123456789';

-- Verificar pagamento atualizado
SELECT * FROM pagamentos WHERE mercado_pago_payment_id = '123456789';
```

---

## 📊 7. Teste do Painel Admin

### **7.1. Dashboard Global**
```bash
# Login como admin
# Navegue para /admin
# Verifique métricas:
# - Total Professores: > 0
# - Total Alunos: > 0  
# - Receita Total: valor correto
```

### **7.2. Gestão de Professores**
```bash
# Tab "Professores"
# Teste alterar status: Ativo → Suspenso
# Teste toggles de módulos (dashboard, ia, agenda, etc.)
# Resultado esperado: alterações refletidas imediatamente
```

### **7.3. Pagamentos Globais**
```bash
# Tab "Pagamentos"
# Verifique filtros:
# - Por professor
# - Por status  
# - Busca por nome
# Teste "Reprocessar" em pagamento específico
# Teste "Exportar CSV"
```

**✅ Validação:**
```sql
-- Verificar alteração de professor
SELECT status, modules FROM professores WHERE id = 'PROFESSOR_ID';

-- Verificar logs de admin
SELECT * FROM audit_log WHERE actor_user_id = 'ADMIN_USER_ID' ORDER BY created_at DESC LIMIT 10;
```

---

## 🚨 8. Teste de Segurança (RLS)

### **8.1. Teste de Isolamento entre Professores**

**Setup:**
- Crie 2 professores: professor1@test.com, professor2@test.com
- Cada um com 1 aluno próprio

**Teste:**
```bash
# Login como professor1
# Tente acessar via URL direta dados do professor2:
GET /api/alunos?professor_id=PROFESSOR2_ID

# Resultado esperado: Lista vazia (RLS bloqueou)
```

### **8.2. Teste de Storage (Materiais)**
```bash
# Upload arquivo como professor1
# Login como professor2  
# Tente acessar arquivo do professor1 via URL direta
# Resultado esperado: 403 Forbidden
```

### **8.3. Deep Link Protection**
```bash
# Como professor1, obtenha ID de aula do professor2
# Tente acessar: /app/aulas/AULA_DO_PROFESSOR2
# Resultado esperado: Página vazia ou erro 403
```

---

## 📋 9. Checklist de Resultados Esperados

### **✅ Funcionalidades Principais:**
- [ ] Login/logout funcionando
- [ ] Cadastro de alunos (CRUD completo)
- [ ] Pagamento manual → automático funcionando
- [ ] Webhook MP processando corretamente
- [ ] Agendamento liberado após pagamento "pago"
- [ ] Google Calendar sincronizando (se conectado)
- [ ] Admin vendo dados globais
- [ ] RLS isolando dados entre professores

### **✅ Integrações:**
- [ ] Mercado Pago: sandbox funcionando
- [ ] Google OAuth: conectar/desconectar
- [ ] Webhook: assinatura validada
- [ ] Idempotência: eventos não duplicados

### **✅ Banco de Dados:**
- [ ] Pagamentos: status atualizando automaticamente
- [ ] Audit Log: eventos críticos registrados
- [ ] RLS: políticas funcionando
- [ ] Triggers: eligible_to_schedule atualizando

### **✅ UX/UI:**
- [ ] Estados de loading visíveis
- [ ] Toasts informativos
- [ ] Botões habilitados/desabilitados conforme contexto
- [ ] Responsividade em mobile

---

## 🔍 10. Scripts de Teste Automatizado

### **Script completo de validação:**
```bash
#!/bin/bash
# Validador automático - execute antes dos testes manuais
chmod +x scripts/validate-install.sh
./scripts/validate-install.sh

# Teste E2E automático
chmod +x scripts/tests/test-complete-flow.sh  
./scripts/tests/test-complete-flow.sh
```

**Execute os scripts acima antes dos testes manuais para garantir que o ambiente está correto.**

---

🎯 **Resultado Final Esperado:**
Após todos os testes, o sistema deve processar automaticamente:
`Pagamento Criado → Webhook MP → Status "Pago" → Botão "Agendar" → Aula Criada → Google Calendar Sincronizado`

## 🔍 Scripts de Teste Automatizado

### **Validação de Instalação:**
```bash
# Execute para validar instalação antes dos testes
chmod +x scripts/validate-install.sh
./scripts/validate-install.sh
```

### **Teste E2E Automático:**
```bash
# Execute para testar conectividade básica
chmod +x scripts/tests/test-complete-flow.sh  
./scripts/tests/test-complete-flow.sh
```

### **Checklist Final:**
- [ ] ✅ Todos os testes passaram
- [ ] ✅ Fluxo E2E funcionando
- [ ] ✅ Integrações conectadas
- [ ] ✅ RLS funcionando
- [ ] ✅ UI responsiva

📞 **Em caso de falha**: Consulte logs no Supabase Dashboard e console do browser.

---

## 🔐 11. Teste OAuth (Google) com domínio dinâmico (ngrok)

### Passo a passo
1. Atualize URLs com a PUBLIC_URL atual (ex.: https://<id>.ngrok-free.app):
   - Google Console → OAuth consent + Credentials:
     - Authorized JavaScript origins = PUBLIC_URL
     - Authorized redirect URIs = PUBLIC_URL/auth/google/callback
   - Supabase → Authentication → URL Configuration:
     - Site URL = PUBLIC_URL
     - Redirect URLs = PUBLIC_URL/*
2. Limpe sessões anteriores no navegador (cookies/localStorage) e no Supabase (se necessário).
3. Acesse PUBLIC_URL/auth → clique em “Entrar com Google”.
4. Após o retorno, verifique que a URL é PUBLIC_URL/auth/google/callback.
5. Confirme no console:
   - Logs iniciando sign-in e callback
   - Resultado de exchangeCodeForSession sem erros
6. Redirecionamento esperado:
   - admin → /admin
   - professor (status=ativo) → /app

### Validações
- A tela /auth NÃO deve disparar consultas de aulas (sem toasts de erro).
- Em /app, as aulas só carregam após user + role + status prontos.
- Erro “redirect_uri_mismatch” deve mostrar mensagem amigável e logar window.location.href.
