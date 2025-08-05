# 🚀 Tutorial Completo de Instalação - Professor Musical

## 📋 Pré-requisitos

### Softwares Necessários:
- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Conta Google** - Para integrações
- **Conta Supabase** - [Criar conta](https://supabase.com/)

### Contas de Serviços (Opcionais):
- **Mercado Pago** - Para pagamentos
- **Z-API ou WhatsApp Business** - Para mensagens
- **Google Cloud Console** - Para integrações Google

---

## 🎯 INSTALAÇÃO AUTOMÁTICA

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/professor-musical.git
cd professor-musical
```

### 2. Execute o Script de Instalação
```bash
# No Windows (PowerShell)
.\scripts\install.bat

# No Linux/Mac
chmod +x scripts/install.sh
./scripts/install.sh
```

### 3. Configure as Variáveis de Ambiente
```bash
# Execute o script de configuração
npm run setup:env
```

---

## ⚙️ CONFIGURAÇÃO MANUAL DETALHADA

### PASSO 1: Configuração do Supabase

#### 1.1 Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com/)
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Clique em "New Project"
5. Escolha um nome e senha para o banco
6. Anote as seguintes informações:
   - **Project URL**: `https://xxx.supabase.co`
   - **API Key (anon)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 1.2 Configurar Autenticação
1. No painel Supabase → **Authentication** → **Providers**
2. **Email**: Já vem habilitado
3. **Google OAuth**:
   - Toggle ON para habilitar
   - Deixe Client ID e Secret em branco por enquanto
   - Voltaremos aqui após configurar Google Cloud

#### 1.3 Configurar URLs de Redirecionamento
1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:8080` (desenvolvimento) ou seu domínio
3. **Redirect URLs**: 
   - `http://localhost:8080`
   - `http://localhost:8080/dashboard`
   - Seu domínio de produção (se tiver)

#### 1.4 Executar Migrações do Banco
1. No painel Supabase → **SQL Editor**
2. Execute o seguinte SQL:

```sql
-- Criar tabela professores
CREATE TABLE public.professores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  especialidades TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela alunos
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  instrumento TEXT,
  nivel TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela aulas
CREATE TABLE public.aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  tema TEXT,
  status TEXT DEFAULT 'agendada',
  presenca BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela pagamentos
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  aula_id UUID REFERENCES aulas(id),
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente',
  forma_pagamento TEXT,
  referencia_externa TEXT,
  link_pagamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professores
CREATE POLICY "Professores podem ver próprio perfil" ON professores
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Professores podem atualizar próprio perfil" ON professores
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Criar perfil de professor" ON professores
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas RLS para alunos
CREATE POLICY "Professores podem ver próprios alunos" ON alunos
  FOR SELECT USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem criar alunos" ON alunos
  FOR INSERT WITH CHECK (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem atualizar próprios alunos" ON alunos
  FOR UPDATE USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem deletar próprios alunos" ON alunos
  FOR DELETE USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));

-- Aplicar mesmas políticas para aulas e pagamentos
CREATE POLICY "Professores podem ver próprias aulas" ON aulas
  FOR SELECT USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem criar aulas" ON aulas
  FOR INSERT WITH CHECK (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem atualizar próprias aulas" ON aulas
  FOR UPDATE USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem deletar próprias aulas" ON aulas
  FOR DELETE USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professores podem ver próprios pagamentos" ON pagamentos
  FOR SELECT USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem criar pagamentos" ON pagamentos
  FOR INSERT WITH CHECK (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));
CREATE POLICY "Professores podem atualizar próprios pagamentos" ON pagamentos
  FOR UPDATE USING (professor_id IN (
    SELECT id FROM professores WHERE user_id = auth.uid()
  ));

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.professores (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_professores_updated_at
  BEFORE UPDATE ON professores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at
  BEFORE UPDATE ON aulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 1.5 Configurar Storage para Avatars
1. **Storage** → **Create Bucket**
2. Nome: `avatars`
3. Public: ✅ Sim
4. **Criar políticas RLS** no SQL Editor:

```sql
-- Políticas para storage de avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### PASSO 2: Configuração do Google Cloud Console

#### 2.1 Criar Projeto no Google Cloud
1. Acesse [console.cloud.google.com](https://console.cloud.google.com/)
2. Clique em "Select a project" → "New Project"
3. Nome: "Professor Musical" ou similar
4. Clique em "Create"

#### 2.2 Habilitar APIs Necessárias
1. **APIs & Services** → **Library**
2. Procure e habilite:
   - **Google+ API** (para login)
   - **Google Calendar API** (para agenda)
   - **Gmail API** (para emails)
   - **Google Drive API** (para arquivos)
   - **Google Meet API** (para videoconferência)

#### 2.3 Configurar OAuth Consent Screen
1. **APIs & Services** → **OAuth consent screen**
2. **User Type**: External
3. **App Information**:
   - App name: "Professor Musical"
   - User support email: seu-email@gmail.com
   - Developer contact: seu-email@gmail.com
4. **Scopes**: Adicionar os essenciais:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. **Test users**: Adicione seu email para testes

#### 2.4 Criar Credenciais OAuth
1. **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Name**: "Professor Musical Web"
5. **Authorized JavaScript origins**:
   - `http://localhost:8080`
   - `https://seu-dominio.com` (se tiver)
6. **Authorized redirect URIs**:
   - `https://hnftxautmxviwrfuaosu.supabase.co/auth/v1/callback`
7. **Create** e anote:
   - **Client ID**: `xxx.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxx`

#### 2.5 Voltar ao Supabase - Configurar Google OAuth
1. Supabase → **Authentication** → **Providers** → **Google**
2. **Enabled**: ✅ ON
3. **Client ID**: Cole o Client ID do Google
4. **Client Secret**: Cole o Client Secret do Google
5. **Save**

---

### PASSO 3: Configuração de Pagamentos (Opcional)

#### 3.1 Mercado Pago
1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com/)
2. **Your integrations** → **Create application**
3. **Application name**: Professor Musical
4. **Choose your business model**: Online payments
5. Anote o **Access Token** de produção e teste

#### 3.2 InfinitePay (Opcional)
1. Acesse [infinitepay.io](https://infinitepay.io/)
2. Crie uma conta de desenvolvedor
3. Anote a **API Key**

---

### PASSO 4: Configuração WhatsApp (Opcional)

#### 4.1 Z-API
1. Acesse [z-api.io](https://z-api.io/)
2. Crie uma conta
3. **Create Instance**
4. Anote:
   - **Instance ID**
   - **Token**

#### 4.2 Alternativas
- **360Dialog**: [360dialog.com](https://360dialog.com/)
- **Twilio**: [twilio.com](https://twilio.com/)

---

### PASSO 5: Configurar Secrets no Supabase

1. **Settings** → **Edge Functions**
2. Adicione os seguintes secrets:

```env
# Obrigatórios (já configurados)
SUPABASE_URL=https://hnftxautmxviwrfuaosu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google (se configurado)
GOOGLE_CLIENT_ID=xxx.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Pagamentos (opcionais)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxx
INFINITEPAY_API_KEY=sk_xxx

# WhatsApp (opcionais)
ZAPI_TOKEN=xxx
ZAPI_INSTANCE=xxx
```

---

## 🚀 EXECUTAR O PROJETO

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

### Produção
```bash
# Build para produção
npm run build

# Servir arquivos estáticos
npm run preview
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### Funcionalidades Básicas
- [ ] Login com email/senha funciona
- [ ] Login com Google funciona
- [ ] Cadastro de alunos funciona
- [ ] Agendamento de aulas funciona
- [ ] Upload de avatar funciona

### Integrações (Opcionais)
- [ ] Google Calendar conectado
- [ ] Mercado Pago configurado
- [ ] WhatsApp conectado
- [ ] Emails automáticos funcionam

### Produção
- [ ] Build funciona sem erros
- [ ] SSL configurado (HTTPS)
- [ ] Domínio próprio (se aplicável)
- [ ] Backups do banco configurados

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Provider not enabled"
**Solução**: Habilitar Google OAuth no Supabase

### Erro: "Redirect URI mismatch"
**Solução**: Verificar URLs no Google Cloud Console

### Erro: "Module not found"
**Solução**: Executar `npm install`

### Erro: "Port already in use"
**Solução**: Matar processo na porta 8080:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <número> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

---

## 📞 SUPORTE

### Documentação Oficial
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Google OAuth**: [developers.google.com/identity](https://developers.google.com/identity)
- **React**: [react.dev](https://react.dev)

### Comunidades
- **Discord Supabase**: [discord.supabase.com](https://discord.supabase.com)
- **Stack Overflow**: Pesquise por "supabase react"

---

## 🎉 PRÓXIMOS PASSOS

Após a instalação completa:

1. **Personalize** o sistema com suas cores e logo
2. **Teste** todas as funcionalidades
3. **Configure** domínio próprio (se necessário)
4. **Treine** sua equipe no uso do sistema
5. **Configure** backups regulares

**🎯 Sistema 100% funcional e pronto para usar!**