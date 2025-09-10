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

## 🗄️ 4. Banco de Dados (Supabase)

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

---

## 🚀 5. Iniciar o Projeto

```bash
# Desenvolvimento
npm run dev

# O projeto estará em: http://localhost:5173
```

### Verificar se está funcionando:

1. **Página inicial**: http://localhost:5173 → deve carregar
2. **Login**: `/auth` → deve mostrar formulário
3. **Admin** (se `VITE_AUTH_MODE=open`): `/admin` → deve mostrar dashboard
4. **Professor**: `/app` → deve mostrar painel do professor

---

## ✅ 6. Checklist Pós-Instalação

### Funcionalidades básicas:
- [ ] ✅ Interface carregando sem erros
- [ ] ✅ Login/logout funcionando
- [ ] ✅ Navegação entre páginas
- [ ] ✅ Cadastro de alunos
- [ ] ✅ Criação de aulas

### Integrações:
- [ ] 🔗 Google Calendar: teste conectar/desconectar
- [ ] 💳 Mercado Pago: criar pagamento teste
- [ ] 📧 Webhook: simular evento de pagamento

### Dados:
- [ ] 📊 Dashboard mostrando métricas
- [ ] 👥 Lista de alunos aparecendo
- [ ] 💰 Pagamentos sendo listados
- [ ] 📅 Aulas no calendário

---

## 🐛 Solução de Problemas Comuns

### **Erro: "Cannot connect to Supabase"**
- Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Confirme que o projeto Supabase está ativo

### **Erro: "Google OAuth não funciona"**
- Verifique as URLs de redirect no Google Console
- Confirme `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no Supabase

### **Erro: "Webhook Mercado Pago falha"**
- Teste a URL: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
- Verifique `MERCADOPAGO_ACCESS_TOKEN` no Supabase

### **Erro: "Cannot create user"**
- Se `VITE_AUTH_MODE=locked`, o primeiro usuário vira admin automaticamente
- Para desenvolvimento, use `VITE_AUTH_MODE=open`

---

## 📞 Suporte

- **Logs do Supabase**: [Dashboard → Edge Functions → Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
- **Documentação**: Veja outros arquivos em `/docs/`
- **Console do Browser**: F12 → Console (para erros frontend)

---

🎉 **Pronto!** O ClassPro deve estar funcionando localmente.