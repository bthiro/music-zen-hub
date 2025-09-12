# Tutorial: Testes Locais ClassPro

Este tutorial te guiará através de todos os passos para configurar e testar o ClassPro localmente antes de colocar em produção.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git
- Conta no Supabase (já configurada)
- Conta no Google Cloud Platform
- Conta no Mercado Pago

## 🚀 Configuração do Ambiente Local

### 1. Clone e Instale o Projeto

```bash
git clone [seu-repositorio]
cd classpro
npm install
```

### 2. Crie o Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com estas configurações:

```env
# Supabase (já configurado)
VITE_SUPABASE_PROJECT_ID="hnftxautmxviwrfuaosu"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"

# Configurações de teste
VITE_AUTH_MODE="open"
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

## 🔑 Configuração das Integrações

### 3. Mercado Pago - Chaves de Teste

#### Obtenha suas chaves de teste:
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas aplicações"** → **"Criar aplicação"**
3. Preencha os dados da aplicação
4. Após criar, vá em **"Credenciais"**
5. Na aba **"Credenciais de teste"**, copie:
   - **Public Key** (começa com `TEST-`)
   - **Access Token** (começa com `TEST-`)

#### Configure no Supabase:
1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/settings/functions
2. Adicione/atualize os secrets:
   - `MERCADO_PAGO_ACCESS_TOKEN` = seu Access Token de teste
   - `MERCADO_PAGO_WEBHOOK_SECRET` = qualquer string (ex: "test-webhook-secret-123")

### 4. Google Calendar - Configuração OAuth

#### Crie um projeto no Google Cloud:
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **"APIs e Serviços"** → **"Biblioteca"**
4. Ative as APIs:
   - Google Calendar API
   - Google Meet API

#### Configure OAuth:
1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique **"Criar credenciais"** → **"ID do cliente OAuth 2.0"**
3. Escolha **"Aplicação da Web"**
4. Configure:
   - **Origens JavaScript autorizadas**: `http://localhost:5173`
   - **URIs de redirecionamento autorizados**: 
     - `http://localhost:5173/auth/callback`
     - `https://hnftxautmxviwrfuaosu.supabase.co/auth/v1/callback`

#### Configure no Supabase:
1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/settings/functions
2. Adicione os secrets:
   - `GOOGLE_CLIENT_ID` = seu Client ID
   - `GOOGLE_CLIENT_SECRET` = seu Client Secret

### 5. URLs de Autenticação no Supabase

1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration
2. Configure:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: 
     - `http://localhost:5173/**`
     - `http://localhost:5173/auth/callback`

## 🧪 Iniciando os Testes

### 6. Inicie o Servidor Local

```bash
npm run dev
```

O sistema estará disponível em: http://localhost:5173

## ✅ Checklist de Testes - Q&A

### 📱 Inicialização do Sistema

**Q: O sistema carregou sem erros?**
- [ ] Sim - Página de login apareceu
- [ ] Não - Verificar console do navegador (F12)

**Q: Não há erros no console?**
- [ ] Sim - Console limpo
- [ ] Não - Anotar os erros para correção

### 🔐 Autenticação

**Q: Consegue fazer login com email/senha?**
- [ ] Sim - Login funcionou
- [ ] Não - Verificar credenciais no banco

**Q: Botão "Entrar com Google" aparece?**
- [ ] Sim - Botão visível
- [ ] Não - Verificar configuração OAuth

**Q: Login com Google funciona?**
- [ ] Sim - Redirecionamento OK
- [ ] Não - Verificar URLs no Google Console

### 🗄️ Banco de Dados

**Q: Dashboard carrega dados dos professores?**
- [ ] Sim - Dados aparecem
- [ ] Não - Verificar RLS policies

**Q: Consegue criar novo aluno?**
- [ ] Sim - Aluno criado com sucesso
- [ ] Não - Verificar permissões

**Q: Consegue criar nova aula?**
- [ ] Sim - Aula criada
- [ ] Não - Verificar relacionamentos

### 💰 Pagamentos

**Q: Consegue criar um pagamento?**
- [ ] Sim - Pagamento criado
- [ ] Não - Verificar chaves do Mercado Pago

**Q: Botão do Mercado Pago aparece?**
- [ ] Sim - Botão renderizado
- [ ] Não - Verificar Public Key

**Q: Ao clicar no botão, abre a tela do Mercado Pago?**
- [ ] Sim - Integração OK
- [ ] Não - Verificar Access Token

### 📅 Google Calendar

**Q: Consegue conectar o Google Calendar?**
- [ ] Sim - Autorização funcionou
- [ ] Não - Verificar OAuth config

**Q: Eventos do Google aparecem no calendário?**
- [ ] Sim - Sincronização OK
- [ ] Não - Verificar permissões da API

**Q: Consegue criar evento com Meet?**
- [ ] Sim - Link do Meet gerado
- [ ] Não - Verificar Google Meet API

### 👨‍💼 Área Administrativa

**Q: Consegue acessar /admin?**
- [ ] Sim - Área admin carregou
- [ ] Não - Verificar permissões de admin

**Q: Lista de professores aparece?**
- [ ] Sim - Dados carregados
- [ ] Não - Verificar query admin

**Q: Consegue criar novo professor?**
- [ ] Sim - Professor criado
- [ ] Não - Verificar edge function

### 🛠️ Funcionalidades Gerais

**Q: Menu lateral funciona?**
- [ ] Sim - Navegação OK
- [ ] Não - Verificar rotas

**Q: Troca de tema (claro/escuro) funciona?**
- [ ] Sim - Tema alterna
- [ ] Não - Verificar ThemeContext

**Q: Todas as páginas carregam sem erro?**
- [ ] Sim - Navegação completa OK
- [ ] Não - Anotar páginas com problema

## 🔧 Troubleshooting Comum

### Erro: "requested path is invalid"
- **Solução**: Verificar Site URL e Redirect URLs no Supabase Auth

### Erro: "CORS policy" 
- **Solução**: Adicionar localhost nas origens autorizadas do Google

### Pagamento não abre
- **Solução**: Verificar se as chaves do Mercado Pago estão corretas e são de TESTE

### Google Calendar não conecta
- **Solução**: Verificar se as APIs estão habilitadas no Google Cloud

### Erro 500 nas Edge Functions
- **Solução**: Verificar logs em: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions

## 📊 Logs e Monitoramento

### Verificar logs do Supabase:
- **Auth**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/users
- **Functions**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions
- **Database**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/editor

### Verificar console do navegador:
1. Pressione F12
2. Vá na aba "Console"
3. Procure por erros em vermelho
4. Anote qualquer erro para correção

## ✅ Checklist Final

Antes de prosseguir para produção, certifique-se que:

- [ ] Login com email/senha funciona
- [ ] Login com Google funciona
- [ ] Criação de alunos funciona
- [ ] Criação de aulas funciona
- [ ] Criação de pagamentos funciona
- [ ] Botão Mercado Pago abre corretamente
- [ ] Google Calendar conecta e sincroniza
- [ ] Área administrativa acessível
- [ ] Todas as páginas carregam sem erro
- [ ] Console do navegador sem erros críticos
- [ ] Edge Functions funcionando (verificar logs)

## 🎯 Próximos Passos

Se todos os testes passaram, você está pronto para seguir para o **Tutorial de Produção HostGator**.

Se algum teste falhou, corrija os problemas usando o troubleshooting acima ou consulte os logs para mais detalhes.

---

**⚠️ Importante**: Este ambiente de teste usa chaves de TESTE do Mercado Pago. Nenhuma transação real será processada.