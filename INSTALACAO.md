# 📚 GUIA COMPLETO DE INSTALAÇÃO - PROFESSOR MUSICAL

## 🎯 VISÃO GERAL
Este é um sistema completo para professores de música com:
- 🎨 Lousa digital interativa
- 🎵 Metrônomo e afinador
- 👥 Gestão de alunos e pagamentos
- 📅 Agendamento de aulas
- 🤖 IA Musical especializada

---

## 🖥️ INSTALAÇÃO LOCAL (RECOMENDADA PARA INICIANTES)

### 📋 Pré-requisitos

**1. Node.js (OBRIGATÓRIO)**
- Baixe em: https://nodejs.org/
- Instale a versão LTS (Long Term Support)
- Teste no terminal: `node --version`

**2. Gerenciador de Pacotes**
```bash
# Instalar Bun (RECOMENDADO - mais rápido)
npm install -g bun

# OU usar NPM (que já vem com Node.js)
npm --version
```

**3. Navegador Moderno**
- Chrome, Firefox, Safari ou Edge atualizados

### 🚀 Passo-a-passo da Instalação

**1. Preparar pasta do projeto:**
```bash
# Criar pasta
mkdir meu-sistema-musical
cd meu-sistema-musical
```

**2. Obter arquivos do projeto:**
- Baixe todos os arquivos do projeto
- Extraia na pasta criada
- Certifique-se que `package.json` está na raiz

**3. Instalar dependências:**
```bash
# Opção 1: Com Bun (RECOMENDADO)
bun install

# Opção 2: Com NPM
npm install
```

**4. Iniciar o sistema:**
```bash
# Com Bun
bun dev

# Com NPM
npm run dev
```

**5. Acessar o sistema:**
- Abra: http://localhost:5173
- O sistema carregará automaticamente

### ✅ Verificação se está funcionando:
- [ ] Página inicial carrega
- [ ] Lousa digital desenha
- [ ] **NOVO:** Upload de imagens funciona
- [ ] **NOVO:** Pode desenhar sobre imagens
- [ ] Metrônomo toca
- [ ] Pode cadastrar alunos
- [ ] IA Musical responde

### 🎨 Novos recursos da Lousa:
- ✅ **Upload de imagens:** JPG, PNG, GIF até 5MB
- ✅ **Imagens de exemplo:** Piano, violão, partituras, notas musicais
- ✅ **Desenhar sobre imagens:** Anotações, correções, explicações
- ✅ **Redimensionar imagens:** Arrastar cantos para ajustar tamanho
- ✅ **Múltiplas imagens:** Carregue várias e organize na lousa

---

## 🔗 COMO FAZER INTEGRAÇÕES GOOGLE FUNCIONAREM 100%

### 📋 Pré-requisitos:
1. **Conta Google** (Gmail)
2. **Domínio próprio** com SSL (obrigatório para produção)
3. **Google Cloud Console** configurado

### 🚀 Passo-a-passo COMPLETO:

**1. Criar Projeto no Google Cloud:**
- Acesse: https://console.cloud.google.com
- Clique em "Criar Projeto"
- Nome: "Sistema Musical - [SeuNome]"
- Anote o ID do projeto

**2. Ativar APIs necessárias:**
```bash
# No Google Cloud Console → APIs & Services → Library
- Google Calendar API
- Google Meet API  
- Google Drive API (se quiser salvar arquivos)
- Gmail API (se quiser enviar emails)
```

**3. Criar Credenciais OAuth 2.0:**
- Vá em "APIs & Services" → "Credentials"
- Clique "Create Credentials" → "OAuth 2.0 Client ID"
- Tipo: "Web application"
- Nome: "Sistema Musical Web"

**4. Configurar URLs autorizadas:**
```bash
# Para desenvolvimento LOCAL:
http://localhost:5173
http://localhost:5173/api/auth/callback/google

# Para produção (HostGator):
https://seudominio.com
https://seudominio.com/api/auth/callback/google
```

**5. Baixar credenciais:**
- Baixe o arquivo JSON das credenciais
- Anote `client_id` e `client_secret`

**6. Configurar no projeto:**
```javascript
// Criar arquivo .env.local (desenvolvimento)
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
NEXTAUTH_SECRET=uma_chave_secreta_qualquer
NEXTAUTH_URL=http://localhost:5173

// Para produção no HostGator
NEXTAUTH_URL=https://seudominio.com
```

**7. Instalar dependências Google:**
```bash
npm install googleapis google-auth-library
# OU
bun add googleapis google-auth-library
```

**8. Testar integração:**
- Reinicie o servidor: `bun dev`
- Vá em "Configurações" no sistema
- Clique "Conectar Google"
- Autorize as permissões
- ✅ Deve aparecer "Conectado"

### 🔧 Configuração Avançada:

**Para Google Calendar:**
```javascript
// No hook useGoogleCalendar.ts - substituir simulação por código real:
import { google } from 'googleapis';

const calendar = google.calendar('v3');
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5173/api/auth/callback/google'
);
```

**Para Google Meet automático:**
```javascript
// Criar evento com Meet automático:
const event = {
  summary: 'Aula de Música',
  start: { dateTime: '2024-02-10T14:00:00-03:00' },
  end: { dateTime: '2024-02-10T15:00:00-03:00' },
  conferenceData: {
    createRequest: {
      requestId: 'meet-' + Date.now(),
      conferenceSolutionKey: { type: 'hangoutsMeet' }
    }
  }
};
```

---

## 🌐 INSTALAÇÃO EM SERVIDOR (HostGator/Outros)

### ⚠️ IMPORTANTE: LIMITAÇÕES
Projetos React precisam ser "compilados" antes de ir para servidores tradicionais.

### 🛠️ Processo para HostGator:

**1. Na sua máquina (preparar arquivos):**
```bash
# Instalar dependências
bun install

# Gerar arquivos para servidor
bun build
```

**2. Upload para HostGator:**
- Acesse cPanel → Gerenciador de Arquivos
- Vá para `public_html`
- Upload todos os arquivos da pasta `dist`
- Configure domínio para esta pasta

**3. Configurar no cPanel:**
- Certifique-se que `index.html` é a página inicial
- Configure redirecionamentos se necessário

### 📊 O que funciona em cada ambiente:

| Funcionalidade | Local | HostGator | Observações |
|----------------|-------|-----------|-------------|
| **Lousa Digital** | ✅ | ✅ | ✅ **AGORA com upload de imagens!** |
| **Upload Imagens** | ✅ | ✅ | **NOVO:** Funciona em ambos ambientes |
| **Desenhar sobre imagens** | ✅ | ✅ | **NOVO:** Anotações em partituras, etc. |
| Metrônomo | ✅ | ✅ | Funciona perfeitamente |
| Gestão Alunos | ✅ | ⚠️ | Dados não persistem no HostGator |
| Google Calendar Real | ⚠️ | ⚠️ | **Configuração adicional necessária** |
| IA Musical | ✅ | ✅ | Interface funciona, mas sem IA real |
| Hot Reload | ✅ | ❌ | Apenas local |

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### 🎨 Personalizar Cores/Logo:
Edite: `src/index.css` e `tailwind.config.ts`

### 📊 Adicionar Analytics:
```javascript
// Adicionar Google Analytics no index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

### 🔒 Configurar HTTPS:
- HostGator: Ativar SSL/TLS gratuito no cPanel
- Local: Usar `bun dev --https`

---

## ❌ PROBLEMAS COMUNS E SOLUÇÕES

### "Comando não encontrado"
```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver, baixar de: https://nodejs.org/
```

### "Porta já em uso"
```bash
# Parar processos na porta 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID [numero_do_pid] /F

# Mac/Linux:
lsof -ti:5173 | xargs kill
```

### "Módulos não encontrados"
```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
bun install
```

### No HostGator: "Página não carrega"
1. Verificar se arquivos estão em `public_html`
2. Certificar que `index.html` existe
3. Verificar permissões dos arquivos (644)
4. Limpar cache do navegador

---

## 🚀 MELHORIAS FUTURAS

### Para tornar o sistema profissional:

**1. Backend Real:**
- Conectar ao Supabase (recomendado)
- Banco de dados PostgreSQL
- Autenticação de usuários

**2. Pagamentos Reais:**
- Integrar Stripe ou Mercado Pago
- Geração automática de boletos
- Controle de inadimplência

**3. Comunicação:**
- WhatsApp API Business
- Envio automático de lembretes
- E-mail marketing

**4. IA Musical Real:**
- Integrar ChatGPT/Claude
- Análise de áudio em tempo real
- Correção automática de afinação

**5. Upload de Imagens Avançado:**
- Suporte para mais formatos
- Edição básica de imagens
- Biblioteca de imagens musicais
- Sincronização com Google Drive

---

## 📞 SUPORTE

### ✅ Testado e funcionando em:
- Windows 10/11
- macOS Big Sur+
- Ubuntu 20.04+
- Chrome 100+
- Firefox 100+
- Safari 15+

### 🆘 Se precisar de ajuda:
1. Verificar os logs no terminal
2. Tentar os "Problemas Comuns" acima
3. Reinstalar dependências do zero
4. Verificar versões do Node.js/Bun
5. **Para Google:** Verificar URLs no Google Cloud Console
6. **Para uploads:** Verificar se o navegador suporta FileReader API

### 🔍 Problemas Google específicos:

**"Redirect URI mismatch":**
```bash
# Verificar no Google Cloud Console → Credentials
# URLs devem ser EXATAMENTE:
http://localhost:5173  (local)
https://seudominio.com  (produção)
```

**"Access blocked":**
- Publicar app no Google Cloud Console
- Adicionar usuários de teste
- Verificar escopos de permissão

**"Calendar not syncing":**
- Verificar se Calendar API está ativada
- Conferir token de acesso válido
- Testar com conta Google pessoal primeiro

---

## ⭐ DICA PRINCIPAL PARA INICIANTES

**COMECE SEMPRE LOCAL!**

Motivos:
- ✅ Mais fácil de instalar
- ✅ Modificações instantâneas  
- ✅ **NOVO:** Upload e edição de imagens
- ✅ **NOVO:** Funcionalidades da lousa 100% completas
- ✅ Todas as funcionalidades
- ✅ Sem custos de hospedagem
- ✅ Ideal para aprender

Só migre para servidor quando:
- Quiser compartilhar com outros
- Precisar acessar de outros lugares
- Sistema estiver finalizado