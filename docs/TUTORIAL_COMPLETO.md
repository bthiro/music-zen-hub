# 🚀 Tutorial Completo - ClassPro Local + Produção

## 📋 Índice
1. [🎯 Objetivo](#objetivo)
2. [⚙️ Configuração Local Completa](#configuração-local-completa)
3. [🔑 Obtenção de Credenciais](#obtenção-de-credenciais)
4. [🧪 Testes Locais Completos](#testes-locais-completos)
5. [🌐 Migração para Produção](#migração-para-produção)
6. [🆘 Problemas Comuns](#problemas-comuns)

---

## 🎯 Objetivo

Este tutorial ensina como configurar o ClassPro para rodar localmente em seu PC usando o servidor remoto do Supabase, e depois colocar em produção. Você manterá todas as integrações funcionando 100%.

### O que você terá no final:
- ✅ Sistema rodando localmente com todas as integrações
- ✅ Google Calendar funcionando
- ✅ Mercado Pago (pagamentos) funcionando
- ✅ Sistema pronto para produção

---

## ⚙️ Configuração Local Completa

### Passo 1: Instalar o Projeto

```bash
# 1. Clonar o projeto
git clone [SEU_REPOSITORIO]
cd classpro

# 2. Instalar dependências
npm install

# 3. Criar arquivo de configuração local
touch .env.local
```

### Passo 2: Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto com este conteúdo:

```bash
# ========================================
# 🔧 CONFIGURAÇÃO LOCAL - ClassPro
# ========================================

# SUPABASE (Banco de dados e autenticação)
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"

# MODO DE AUTENTICAÇÃO
# "open" = permite acesso sem login (para desenvolvimento)
# "locked" = exige login sempre (para produção)
VITE_AUTH_MODE="open"

# MERCADO PAGO (Pagamentos)
VITE_MERCADO_PAGO_PUBLIC_KEY="SEU_PUBLIC_KEY_SANDBOX_AQUI"

# GOOGLE CALENDAR (URLs de desenvolvimento)
VITE_GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"

# TIMEZONE PADRÃO
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

⚠️ **IMPORTANTE**: Você precisa obter as credenciais do Mercado Pago (próximo passo).

---

## 🔑 Obtenção de Credenciais

### 🛒 Mercado Pago (Pagamentos)

#### Passo 1: Criar Conta de Desenvolvedor
1. Acesse: https://developers.mercadopago.com.br/
2. Faça login com sua conta Mercado Pago (ou crie uma)
3. Vá em **"Suas aplicações"** → **"Criar aplicação"**
4. Preencha:
   - **Nome**: ClassPro Local
   - **Modelo de integração**: Checkout Pro
   - **Categoria**: Education

#### Passo 2: Obter Chaves de Teste
1. Na sua aplicação, vá em **"Credenciais"**
2. Copie o **"Public Key TEST"** (começa com TEST-)
3. Copie o **"Access Token TEST"** (começa com TEST-)
4. Cole o **Public Key** no seu `.env.local`

#### Passo 3: Configurar Notification URL
1. Na aplicação do Mercado Pago, vá em **"Webhooks"**
2. Adicione esta URL:
   ```
   https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook
   ```

### 📅 Google Calendar (Integração)

#### Passo 1: Criar Projeto no Google Cloud
1. Acesse: https://console.cloud.google.com/
2. Clique em **"Novo Projeto"** (canto superior)
3. Nome: **"ClassPro Local"**
4. Clique em **"Criar"**

#### Passo 2: Ativar APIs Necessárias
1. No menu lateral, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure e ative estas APIs:
   - **Google Calendar API**
   - **Google Meet API** (opcional, mas recomendado)

#### Passo 3: Configurar Tela de Consentimento
1. Vá em **"APIs e Serviços"** → **"Tela de consentimento OAuth"**
2. Escolha **"Externo"**
3. Preencha:
   - **Nome do app**: ClassPro
   - **Email de suporte**: seu.email@gmail.com
   - **Domínios autorizados**: adicione `supabase.co`
4. **Escopos**: adicione:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. **Usuários de teste**: adicione seu email

#### Passo 4: Criar Credenciais OAuth
1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"+ Criar Credenciais"** → **"ID do cliente OAuth 2.0"**
3. **Tipo de aplicação**: Aplicativo da Web
4. **Nome**: ClassPro Local
5. **Origens JavaScript autorizadas**:
   ```
   http://localhost:5173
   ```
6. **URIs de redirecionamento autorizados**:
   ```
   http://localhost:5173/auth/google/callback
   https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/google-oauth
   ```
7. Copie o **ID do cliente** e **Chave secreta do cliente**

### 🔐 Configurar Secrets no Supabase

#### Passo 1: Acessar Painel do Supabase
1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu
2. Vá em **"Settings"** → **"Edge Functions"**

#### Passo 2: Adicionar Secrets
Configure estes secrets (se não existirem):

| Nome do Secret | Valor | Onde obter |
|----------------|--------|------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Seu Access Token TEST do MP | Mercado Pago → Credenciais |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth | Google Cloud Console → Credenciais |
| `GOOGLE_CLIENT_SECRET` | Chave secreta do cliente | Google Cloud Console → Credenciais |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Uma senha forte (32+ chars) | Você cria |

#### Exemplo de senha para webhook:
```
minha_senha_super_secreta_webhook_2024_!@#
```

---

## 🧪 Testes Locais Completos

### Passo 1: Iniciar o Sistema
```bash
npm run dev
```
Abra: http://localhost:5173

### Passo 2: Checklist de Funcionalidades

#### ✅ Autenticação e Usuários
1. **Cadastro/Login**:
   - [ ] Criar conta com email/senha
   - [ ] Fazer login
   - [ ] Fazer logout
   - [ ] Reset de senha (verificar email)

2. **Google Login**:
   - [ ] Clicar em "Login com Google"
   - [ ] Autorizar na tela do Google
   - [ ] Verificar se volta logado

#### ✅ Sistema Principal
3. **Admin**:
   - [ ] Acessar `/admin` (dashboard)
   - [ ] Criar novo professor em `/admin/professores`
   - [ ] Editar perfil do admin em `/admin/perfil`

4. **Professor**:
   - [ ] Logar como professor
   - [ ] Acessar dashboard do professor
   - [ ] Criar aluno novo
   - [ ] Agendar aula

#### ✅ Integrações
5. **Google Calendar**:
   - [ ] Conectar Google Calendar (em Configurações)
   - [ ] Criar evento de aula
   - [ ] Verificar se aparece no Google Calendar

6. **Mercado Pago**:
   - [ ] Criar cobrança para aluno
   - [ ] Usar cartão de teste: `4509 9535 6623 3704`
   - [ ] CVV: `123`, Validade: `11/25`
   - [ ] Nome: `APRO` (aprovado) ou `CONT` (reprovado)
   - [ ] Verificar se status atualiza

### Passo 3: Verificar Logs

#### No Navegador (F12):
```javascript
// No Console, verificar se não há erros vermelhos
// Logs normais aparecem em azul/preto
```

#### No Supabase:
1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions
2. Clique em cada função para ver logs:
   - `google-oauth`
   - `mercado-pago-webhook`
   - `mercado-pago`

---

## 🌐 Migração para Produção

### Passo 1: Obter Credenciais de Produção

#### Mercado Pago - Produção
1. No painel do Mercado Pago, mude para **"Credenciais de Produção"**
2. Copie o **Public Key PROD** (sem TEST-)
3. Copie o **Access Token PROD** (sem TEST-)

#### Google - Produção
1. No Google Cloud Console, edite suas credenciais OAuth
2. Adicione seu domínio de produção:
   - **Origens autorizadas**: `https://seudominio.com`
   - **URIs de redirecionamento**: `https://seudominio.com/auth/google/callback`

### Passo 2: Configurar Variáveis de Produção

No seu servidor/hosting, configure:

```bash
# PRODUÇÃO - ClassPro
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"

# 🚨 CRÍTICO: Auth sempre locked em produção
VITE_AUTH_MODE="locked"

# Credenciais de PRODUÇÃO (sem TEST-)
VITE_MERCADO_PAGO_PUBLIC_KEY="APP-1234567890123456"

# URL do seu site
VITE_GOOGLE_REDIRECT_URI="https://seudominio.com/auth/google/callback"

VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

### Passo 3: Atualizar Secrets do Supabase

No painel do Supabase, atualize:
- `MERCADOPAGO_ACCESS_TOKEN` → Token de produção (sem TEST-)

### Passo 4: Configurar Supabase Auth URLs

⚠️ **CRÍTICO** - Para evitar erro "requested path is invalid":

1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration
2. Configure:
   - **Site URL**: `https://seudominio.com`
   - **Redirect URLs**: `https://seudominio.com/**`

### Passo 5: Deploy

#### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
npm run build
vercel --prod
```

#### Netlify
```bash
# Build local
npm run build

# Drag & drop da pasta dist/ no Netlify
```

#### Servidor Próprio (VPS)
```bash
# Build
npm run build

# Copiar pasta dist/ para seu servidor
# Configurar nginx/apache para servir arquivos
```

---

## 🆘 Problemas Comuns

### 🔴 Erro: "requested path is invalid"
**Causa**: URLs não configuradas no Supabase Auth
**Solução**:
1. Vá em: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration
2. Configure Site URL e Redirect URLs corretos

### 🔴 Google OAuth não funciona
**Possíveis causas**:
1. **Origens não autorizadas**: Adicione `http://localhost:5173` no Google Console
2. **App não publicado**: Publique o app ou adicione seu email nos usuários de teste
3. **Secrets errados**: Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no Supabase

### 🔴 Mercado Pago não processa
**Verificações**:
1. **Public Key correto**: Deve começar com TEST- (dev) ou APP- (prod)
2. **Webhook configurado**: URL deve estar no painel do Mercado Pago
3. **Access Token**: Verifique secret no Supabase

### 🔴 Erro de CORS
**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### 🔴 Build falha
**Verificações**:
1. **TypeScript**: Corrigir erros de tipo
2. **Imports**: Verificar caminhos relativos
3. **Dependencies**: Executar `npm audit --fix`

---

## 🔗 Links Úteis

### Painéis de Controle
- [Supabase Dashboard](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Mercado Pago Developers](https://developers.mercadopago.com.br/)

### Logs e Debug
- [Supabase Functions Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
- [Browser Console](javascript:void(0)) (F12 no navegador)

### Documentação
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt/docs)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)

---

## ✅ Checklist Final

### Desenvolvimento Local
- [ ] `.env.local` criado e configurado
- [ ] Credenciais do Mercado Pago (TEST)
- [ ] Google OAuth configurado
- [ ] Secrets do Supabase atualizados
- [ ] Sistema rodando em `http://localhost:5173`
- [ ] Todas as integrações testadas

### Produção
- [ ] Credenciais de produção obtidas
- [ ] Variáveis de ambiente configuradas
- [ ] `VITE_AUTH_MODE="locked"`
- [ ] Supabase Auth URLs configuradas
- [ ] Deploy realizado
- [ ] Testes em produção executados

---

**🎉 Pronto! Seu ClassPro está rodando local e pronto para produção!**

*Dúvidas? Consulte a seção de problemas comuns ou verifique os logs nos painéis de controle.*