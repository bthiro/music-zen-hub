# 🚀 Instalação e Configuração - ClassPro

## 📋 Pré-requisitos

- **Node.js** 18+ e npm/yarn
- **Conta Supabase** (projeto já configurado: `hnftxautmxviwrfuaosu`)
- **Conta Google Cloud** (para Google Calendar/Meet)
- **Conta Mercado Pago** (para pagamentos automáticos)
- **Git** instalado

---

## 🔧 1. Configuração Local

### Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd classpro
```

### Instale as dependências
```bash
npm install
# ou
yarn install
```

### Configure as variáveis de ambiente
Crie o arquivo `.env.local` na raiz:

```bash
# Copie do template
cp .env.example .env.local

# Edite com suas configurações
nano .env.local
```

Configuração mínima para desenvolvimento:
```bash
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_AUTH_MODE="open"
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

---

## 🔐 2. Configuração do Google Cloud (OAuth)

### Criar projeto e credenciais:

1. **Acesse**: [Google Cloud Console](https://console.cloud.google.com)

2. **Crie um projeto** ou selecione existente

3. **Ative as APIs**:
   - Google Calendar API
   - Google Meet API (se disponível)

4. **Configure a Tela de Consentimento**:
   - Vá em **APIs & Services → OAuth consent screen**
   - Escolha **External** (para teste)
   - Preencha:
     - Nome da aplicação: "ClassPro"
     - Email de suporte: seu email
     - Domínios autorizados: `localhost` (para dev)

5. **Crie credenciais OAuth 2.0**:
   - Vá em **APIs & Services → Credentials**
   - Clique **Create Credentials → OAuth 2.0 Client ID**
   - Tipo: **Web application**
   - Nome: "ClassPro Web"
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desenvolvimento)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback`

6. **Copie as credenciais**:
   - Client ID
   - Client Secret

### Configure no Supabase:
Vá em **Supabase → Settings → Edge Functions** e adicione:
```bash
GOOGLE_CLIENT_ID="123456-abcdef.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"
```

---

## 💳 3. Configuração do Mercado Pago

### Obter credenciais:

1. **Acesse**: [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

2. **Crie uma aplicação**:
   - Nome: "ClassPro"
   - Categoria: Educação

3. **Copie as credenciais de TEST (sandbox)**:
   - Public Key
   - Access Token

### Configure no Supabase:
```bash
MERCADOPAGO_ACCESS_TOKEN="TEST-123456789012345-010101-abcdef"
MERCADO_PAGO_WEBHOOK_SECRET="uma_chave_secreta_forte_32_chars_min"
```

### Configure a Notification URL:
No painel do Mercado Pago:
- **Webhooks → Nova URL**
- URL: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
- Eventos: `payment` e `merchant_order`

---

## 🗄️4. Banco de Dados (Supabase)

### O banco já está configurado! Mas se precisar das migrações:

```bash
# Instale o Supabase CLI (opcional)
npm install -g supabase

# Configure o projeto local (opcional)
supabase init
supabase link --project-ref hnftxautmxviwrfuaosu
```

### Tabelas principais já criadas:
- ✅ `professores` - Dados dos professores
- ✅ `alunos` - Cadastro de alunos
- ✅ `aulas` - Agendamento de aulas
- ✅ `pagamentos` - Controle financeiro
- ✅ `user_roles` - Sistema de permissões
- ✅ `audit_log` - Log de auditoria
- ✅ `webhook_events` - Controle de idempotência

### Configure URLs do Supabase Auth:
⚠️ **IMPORTANTE**: Configure URLs corretas no Supabase para evitar erro "requested path is invalid"

1. **Acesse**: [Supabase Authentication → URL Configuration](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration)

2. **Configure**:
   - **Site URL**: `http://localhost:5173` (desenvolvimento)
   - **Redirect URLs**: `http://localhost:5173/**`

---

## 🚀 5. Iniciar o Projeto

```bash
# Desenvolvimento
npm run dev

# O projeto estará em: http://localhost:5173
```

### Verificar se está funcionando:

1. **Página inicial**: http://localhost:5173 → deve carregar sem erros
2. **Modo desenvolvimento**: Se `VITE_AUTH_MODE=open`, acesso direto às funcionalidades
3. **Login** (se necessário): `/auth` → deve mostrar formulário
4. **Admin**: `/admin` → deve mostrar dashboard de administração
5. **Professor**: `/app` → deve mostrar painel do professor

---

## ✅ 6. Checklist Pós-Instalação

### Funcionalidades básicas:
- [ ] ✅ Interface carregando sem erros no console (F12)
- [ ] ✅ Login/logout funcionando (se auth=locked)
- [ ] ✅ Navegação entre páginas sem quebras
- [ ] ✅ Cadastro de alunos salvando no banco
- [ ] ✅ Criação de aulas aparecendo na lista

### Integrações (teste básico):
- [ ] 🔗 **Google Calendar**: 
  - Navegue para `/app/configuracoes`
  - Teste conectar Google (deve abrir popup OAuth)
- [ ] 💳 **Mercado Pago**: 
  - Crie um pagamento de teste
  - Deve abrir checkout sandbox
- [ ] 📧 **Webhook**: 
  - Teste: `curl https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
  - Deve retornar resposta HTTP (não erro de DNS)

### Dados básicos:
- [ ] 📊 Dashboard mostrando métricas sem erros
- [ ] 👥 Lista de alunos carregando corretamente
- [ ] 💰 Seção pagamentos acessível
- [ ] 📅 Calendário de aulas visível

---

## 🐛 Solução de Problemas Comuns

### **❌ Erro: "Cannot connect to Supabase"**
```bash
# Verifique as variáveis:
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Devem mostrar valores válidos, não "undefined"
# Se estão vazias, verifique .env.local e reinicie npm run dev
```

### **❌ Erro: "requested path is invalid" (Google Auth)**
**Causa**: URLs não configuradas no Supabase Auth
```bash
# Solução:
# 1. Supabase Dashboard → Authentication → URL Configuration
# 2. Site URL: http://localhost:5173
# 3. Redirect URLs: http://localhost:5173/**
```

### **❌ Erro: "Google OAuth não funciona"**
```bash
# Verifique no Google Console:
# - JavaScript origins: http://localhost:5173
# - Redirect URIs: http://localhost:5173/auth/google/callback
# - Credenciais configuradas no Supabase Edge Functions
```

### **❌ Erro: "Webhook Mercado Pago falha"**
```bash
# Teste a URL:
curl -I https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook
# Deve retornar 200 ou 405 (Method Not Allowed), não 404

# Verifique MERCADOPAGO_ACCESS_TOKEN no Supabase Secrets
```

### **❌ Erro: "Cannot create user" ou "Access denied"**
```bash
# Se VITE_AUTH_MODE=locked:
# - O primeiro usuário criado vira admin automaticamente
# - Usuários subsequentes precisam ser criados pelo admin

# Para desenvolvimento, use:
VITE_AUTH_MODE="open"
```

### **❌ Erro: Build falha ou componentes não carregam**
```bash
# Limpe cache e reinstale:
rm -rf node_modules package-lock.json
npm install

# Verifique versões:
node --version  # Deve ser 18+
npm --version   # Deve ser 8+
```

---

## 📞 Próximos Passos

1. **✅ Instalação concluída** → Continue para [docs/ENV.md](./ENV.md) para configurar todas as variáveis
2. **🧪 Depois configure** → [docs/TESTING.md](./TESTING.md) para testar todas as funcionalidades
3. **🚀 Para produção** → [docs/DEPLOY_PROD.md](./DEPLOY_PROD.md) quando estiver pronto

### **Suporte**
- **Logs do Supabase**: [Dashboard → Edge Functions → Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
- **Documentação completa**: Pasta `/docs/`
- **Console do Browser**: F12 → Console (para erros frontend)

---

🎉 **ClassPro instalado com sucesso!** 

Próximo passo: **[Configure todas as variáveis de ambiente](./ENV.md)**