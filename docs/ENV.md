# 📝 Variáveis de Ambiente - ClassPro

## 🔧 Configuração de Ambiente

### **Desenvolvimento (DEV)**

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# SUPABASE
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"

# AUTENTICAÇÃO (Desenvolvimento: 'open' permite acesso sem login)
VITE_AUTH_MODE="open"

# MERCADO PAGO (Sandbox)
VITE_MERCADO_PAGO_PUBLIC_KEY="SEU_PUBLIC_KEY_SANDBOX"

# GOOGLE CALENDAR (URLs de desenvolvimento)
VITE_GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"

# TIMEZONE PADRÃO
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

### **Produção (PROD)**

```bash
# SUPABASE
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"

# AUTENTICAÇÃO (Produção: SEMPRE 'locked')
VITE_AUTH_MODE="locked"

# MERCADO PAGO (Produção)
VITE_MERCADO_PAGO_PUBLIC_KEY="SEU_PUBLIC_KEY_PRODUCAO"

# GOOGLE CALENDAR (URLs de produção)
VITE_GOOGLE_REDIRECT_URI="https://seudominio.com/auth/google/callback"

# TIMEZONE PADRÃO
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

---

## 🔐 Secrets do Supabase (Edge Functions)

Estas chaves são configuradas no painel do Supabase em **Settings → Edge Functions**:

### Obrigatórias para funcionamento completo:

```bash
# Supabase Interno
SUPABASE_SERVICE_ROLE_KEY="chave_do_painel_supabase"
SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
SUPABASE_ANON_KEY="sua_anon_key"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP-123456789012345-010101-abcdef123456789-PROD-ou-TEST"
MERCADO_PAGO_WEBHOOK_SECRET="sua_webhook_secret_key"

# Google Calendar/OAuth
GOOGLE_CLIENT_ID="123456789012-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"

# IA (Opcional)
OPENAI_API_KEY="sk-abcdefghijklmnopqrstuvwxyz"
GROQ_API_KEY="gsk_abcdefghijklmnopqrstuvwxyz"
```

---

## 📋 Detalhes das Variáveis

### **Frontend (VITE_*)**

| Variável | Descrição | Exemplo DEV | Exemplo PROD |
|----------|-----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL base do Supabase | https://projeto.supabase.co | https://projeto.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase | eyJhbGciOiJIUz... | eyJhbGciOiJIUz... |
| `VITE_AUTH_MODE` | Modo de autenticação | `open` (dev) | `locked` (prod) |
| `VITE_DEFAULT_TIMEZONE` | Fuso horário padrão | America/Sao_Paulo | America/Sao_Paulo |

### **Backend (Supabase Secrets)**

| Secret | Descrição | Onde obter |
|--------|-----------|------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso MP | Painel do Mercado Pago → Integrações |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Chave para validar webhook | Você define (min 32 chars) |
| `GOOGLE_CLIENT_ID` | ID do OAuth Google | Google Cloud Console → Credenciais |
| `GOOGLE_CLIENT_SECRET` | Secret do OAuth Google | Google Cloud Console → Credenciais |

---

### ⚠️ Observações Importantes

### **URLs de Redirecionamento**

#### Desenvolvimento:
- Google OAuth: `http://localhost:5173/auth/google/callback`
- Mercado Pago Webhook: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`

#### Produção:
- Google OAuth: `https://seudominio.com/auth/google/callback`
- Mercado Pago Webhook: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`

### **Notification URL (Mercado Pago)**

Configure no painel do Mercado Pago:
- **Sandbox**: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
- **Produção**: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`

### **Supabase Auth URLs (CRÍTICO)**

⚠️ **Para evitar erro "requested path is invalid"**, configure no Supabase:
1. **Acesse**: [Authentication → URL Configuration](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration)
2. **Site URL**: 
   - DEV: `http://localhost:5173`
   - PROD: `https://seudominio.com`
3. **Redirect URLs**: 
   - DEV: `http://localhost:5173/**`
   - PROD: `https://seudominio.com/**`

### **Segurança**

- ✅ **VITE_AUTH_MODE**: `open` apenas em desenvolvimento
- ✅ **Secrets**: Nunca versione no código
- ✅ **Webhook Secret**: Gere uma chave forte (32+ caracteres)
- ✅ **URLs de Produção**: Sempre HTTPS

---

## 📁 Arquivos de Exemplo

Confira o arquivo `.env.example` na raiz do projeto para um template completo.