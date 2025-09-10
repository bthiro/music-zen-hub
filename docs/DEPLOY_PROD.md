# 🌐 Deploy em Produção - ClassPro

## 📋 Preparação para Produção

### 1. **Build do Projeto**
```bash
# Instale dependências
npm install

# Gere o build de produção
npm run build

# Teste o build localmente (opcional)
npm run preview
```

### 2. **Configuração das Variáveis de Ambiente**

**CRÍTICO**: Configure no ambiente de produção:
```bash
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_AUTH_MODE="locked"  # SEMPRE locked em produção
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

---

## 🚀 Opções de Deploy

### **Opção 1: Vercel (Recomendado)**

```bash
# Instale a CLI do Vercel
npm install -g vercel

# Deploy
vercel

# Configure as variáveis no dashboard:
# https://vercel.com/dashboard/[seu-projeto]/settings/environment-variables
```

**Variáveis no Vercel**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AUTH_MODE` = `locked`
- `VITE_DEFAULT_TIMEZONE` = `America/Sao_Paulo`

### **Opção 2: Netlify**

```bash
# Build e deploy manual
npm run build

# Suba a pasta 'dist' para o Netlify
# Configurar variáveis em: Site settings → Environment variables
```

### **Opção 3: Render/Railway**

Similar ao Vercel, mas configure:
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Publish Directory**: `dist`

### **Opção 4: VPS/Servidor Próprio**

```bash
# No servidor (Ubuntu/CentOS)
# Instale Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone e configure o projeto
git clone <URL_REPO>
cd classpro
npm install
npm run build

# Serve com nginx ou PM2
# Exemplo com PM2:
npm install -g pm2
pm2 serve dist 3000 --name "classpro"
```

---

## 🔧 Configurações de Produção

### **1. Google Cloud (URLs de Produção)**

No [Google Cloud Console](https://console.cloud.google.com):

**OAuth 2.0 Credentials → Editar**:
- **Authorized JavaScript origins**:
  - `https://seudominio.com`
- **Authorized redirect URIs**:
  - `https://seudominio.com/auth/google/callback`

### **2. Mercado Pago (Produção)**

1. **Ative a aplicação** para produção no painel do MP
2. **Copie as credenciais de PRODUÇÃO**:
   - Public Key (para frontend)
   - Access Token (para backend)

3. **Configure no Supabase**:
```bash
MERCADOPAGO_ACCESS_TOKEN="APP-123456789012345-010101-abcdef123456789-PROD"
```

4. **Notification URL** (webhook):
   - URL: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
   - Eventos: `payment`, `merchant_order`

### **3. Supabase (Configuração de Produção)**

**Edge Functions** já estão prontas, mas verifique:

1. **URL permitidas** (Authentication → URL Configuration):
   - Site URL: `https://seudominio.com`
   - Redirect URLs: `https://seudominio.com/**`

2. **Secrets** (Settings → Edge Functions):
```bash
MERCADOPAGO_ACCESS_TOKEN="APP-...-PROD"  # Produção!
GOOGLE_CLIENT_ID="123456-prod.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-prod-secret"
MERCADO_PAGO_WEBHOOK_SECRET="sua_chave_forte_32_chars"
```

---

## 🔒 Checklist de Segurança

### **Antes do Go-Live:**
- [ ] ✅ `VITE_AUTH_MODE="locked"` (nunca `open`)
- [ ] ✅ HTTPS habilitado no domínio
- [ ] ✅ URLs de produção no Google OAuth
- [ ] ✅ Credenciais de PRODUÇÃO no Mercado Pago
- [ ] ✅ Webhook URL testada e funcionando
- [ ] ✅ RLS (Row Level Security) ativa no Supabase
- [ ] ✅ Secrets não expostos no código

### **Pós-Deploy:**
- [ ] ✅ Teste completo: login → pagamento → aula
- [ ] ✅ Webhook recebendo eventos do MP
- [ ] ✅ Google Calendar criando eventos
- [ ] ✅ Backup do banco configurado

---

## 📊 Validação Pós-Deploy

### **1. Teste de Funcionalidades**

```bash
# Teste as URLs principais
curl -I https://seudominio.com                    # → 200 OK
curl -I https://seudominio.com/auth               # → 200 OK
curl -I https://seudominio.com/admin              # → 200 OK (se autenticado)
curl -I https://seudominio.com/app                # → 200 OK (se autenticado)
```

### **2. Teste do Webhook**

```bash
# Simule um evento do Mercado Pago
curl -X POST https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=123456789,v1=hash_calculado" \
  -d '{"action":"payment.updated","data":{"id":"123456789"}}'
```

### **3. Logs e Monitoramento**

**Supabase Logs**:
- [Edge Functions Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
- [Auth Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/logs)
- [Database Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/logs/database)

**Console do Browser**:
- F12 → Console → Verificar erros JavaScript
- Network → Verificar chamadas de API

---

## 🔄 Processo de Atualização

### **Para atualizações futuras:**

```bash
# 1. Faça backup do banco (Supabase auto-backup ativo)
# 2. Teste as mudanças localmente
# 3. Deploy:

git pull origin main
npm install              # Se houver novas dependências
npm run build
# Redeploy na plataforma escolhida
```

### **Rollback de Emergência:**
- **Vercel**: Use o dashboard para reverter para deploy anterior
- **Netlify**: Deploy → Rollback para versão anterior
- **VPS**: Mantenha backup da pasta `dist` anterior

---

## 🚨 Troubleshooting Produção

### **Erro: "Supabase connection failed"**
- Verifique se `VITE_SUPABASE_URL` está correto
- Confirme que não há firewall bloqueando supabase.co

### **Erro: "Google OAuth redirect mismatch"**
- URLs de produção configuradas no Google Console?
- `https://seudominio.com/auth/google/callback` deve estar exata

### **Erro: "Mercado Pago webhook timeout"**
- Teste: `curl https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
- Verifique logs da Edge Function

### **Erro: "Cannot create admin user"**
- Se for o primeiro deploy, o primeiro usuário vira admin automaticamente
- Se não, um admin existente precisa criar novos usuários

---

## 📈 Otimizações de Performance

### **CDN e Cache:**
- Vercel/Netlify já incluem CDN global
- Configure cache headers para assets estáticos

### **Banco de Dados:**
- Índices já configurados nas tabelas principais
- Monitor de performance: [Supabase Dashboard → Database → Performance](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/database/performance)

---

🎉 **Deploy Completo!** Seu ClassPro está em produção.

📞 **Em caso de problemas**: Verifique os logs do Supabase e console do browser primeiro.