# Tutorial: Deploy em Produção - HostGator

Este tutorial te guiará através do processo completo para colocar o ClassPro em produção no HostGator com todas as integrações funcionais.

## 📋 Pré-requisitos

- Testes locais concluídos com sucesso
- Conta HostGator com cPanel
- Domínio configurado
- Chaves de teste funcionando localmente

## 🔑 Chaves de Produção

### 1. Mercado Pago - Chaves de Produção

#### Obtenha as chaves de produção:
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá na sua aplicação existente
3. Clique em **"Credenciais"**
4. Vá na aba **"Credenciais de produção"**
5. Se não estiver disponível, você precisa:
   - Completar informações da conta
   - Validar identidade
   - Aguardar aprovação do Mercado Pago

#### Para habilitar produção no Mercado Pago:
1. Complete seu perfil empresarial
2. Adicione informações bancárias
3. Valide sua identidade
4. Aguarde aprovação (pode levar alguns dias)

⚠️ **IMPORTANTE**: Sem aprovação, use as chaves de TESTE em produção (transações não serão reais)

### 2. Google Cloud - Produção

#### Configure o domínio de produção:
1. Acesse: https://console.cloud.google.com/
2. Vá em **"APIs e Serviços"** → **"Credenciais"**
3. Edite seu OAuth Client ID
4. Adicione seu domínio de produção:
   - **Origens JavaScript autorizadas**: `https://seudominio.com`
   - **URIs de redirecionamento autorizados**: 
     - `https://seudominio.com/auth/callback`
     - `https://hnftxautmxviwrfuaosu.supabase.co/auth/v1/callback`

## 🌐 Configuração do Ambiente de Produção

### 3. Arquivo .env de Produção

Crie um arquivo `.env` (sem .local) com as configurações de produção:

```env
# Supabase (mesmo de teste)
VITE_SUPABASE_PROJECT_ID="hnftxautmxviwrfuaosu"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks"
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"

# Configurações de produção
VITE_AUTH_MODE="locked"
VITE_DEFAULT_TIMEZONE="America/Sao_Paulo"
```

### 4. Atualize os Secrets no Supabase

1. Acesse: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/settings/functions

2. Atualize os secrets com valores de produção:

```
MERCADO_PAGO_ACCESS_TOKEN = APP_USR-... (sua chave de produção)
MERCADO_PAGO_WEBHOOK_SECRET = seu-webhook-secret-super-seguro-123

GOOGLE_CLIENT_ID = seu-client-id-producao.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-seu-client-secret-producao
```

### 5. Configure URLs no Supabase

1. **Auth URLs**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/auth/url-configuration

```
Site URL: https://seudominio.com
Redirect URLs: 
- https://seudominio.com/**
- https://seudominio.com/auth/callback
```

### 6. Configure Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá na sua aplicação
3. Em **"Webhooks"**, configure:
   - **URL**: `https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook`
   - **Eventos**: 
     - `payment`
     - `plan`
     - `subscription`
     - `invoice`

## 🚀 Build e Deploy

### 7. Preparar o Build

No seu computador local:

```bash
# 1. Certifique-se que está na branch correta
git pull origin main

# 2. Instale dependências
npm install

# 3. Faça o build de produção
npm run build
```

### 8. Upload para HostGator

#### Via cPanel File Manager:
1. Acesse o cPanel do HostGator
2. Vá em **"File Manager"**
3. Navegue até a pasta `public_html` (ou a pasta do seu domínio)
4. **DELETE** todos os arquivos existentes na pasta
5. Vá na pasta `dist` do seu projeto local
6. **Selecione TODOS** os arquivos dentro de `dist`
7. **Comprima** os arquivos em um ZIP
8. **Upload** o arquivo ZIP para `public_html`
9. **Extraia** o ZIP no cPanel
10. **Delete** o arquivo ZIP após extrair

#### Via FTP (alternativa):
Se preferir usar FTP:
1. Use FileZilla ou outro cliente FTP
2. Conecte com as credenciais do HostGator
3. Navegue até `public_html`
4. Upload todos os arquivos da pasta `dist`

### 9. Configurar .htaccess

Crie um arquivo `.htaccess` na pasta `public_html` com este conteúdo:

```apache
# Habilitar compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache para arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Redirect para index.html (SPA)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle Angular and React Router paths
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Segurança adicional
<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>

# Forçar HTTPS (se SSL configurado)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

## ✅ Checklist de Produção

### 📋 Pré-Deploy
- [ ] Build local executado sem erros
- [ ] Arquivo .env com VITE_AUTH_MODE="locked"
- [ ] Secrets do Supabase atualizados para produção
- [ ] URLs no Supabase configuradas para domínio de produção
- [ ] Google OAuth configurado para domínio de produção
- [ ] Webhook do Mercado Pago configurado

### 📋 Pós-Deploy
- [ ] Site carrega sem erros 404
- [ ] Login com email/senha funciona
- [ ] Login com Google funciona
- [ ] Dashboard carrega dados
- [ ] Criação de pagamentos funciona
- [ ] Google Calendar conecta
- [ ] Área admin acessível
- [ ] Console sem erros críticos

## 🧪 Testes de Produção

### 1. Teste Básico de Funcionamento

Acesse seu domínio e verifique:
- [ ] Página carrega sem erros
- [ ] Login funciona
- [ ] Dashboard aparece com dados
- [ ] Menu de navegação funciona

### 2. Teste de Pagamentos

⚠️ **ATENÇÃO**: Se estiver usando chaves de TESTE em produção:
- Os pagamentos aparecerão como "processados" mas não serão cobrados
- Use dados de cartão de teste do Mercado Pago
- Informe aos usuários que é um ambiente de teste

### 3. Teste de Integrações

- [ ] Google Calendar conecta e sincroniza
- [ ] Criação de eventos funciona
- [ ] Links do Meet são gerados
- [ ] Webhooks do Mercado Pago chegam (verificar logs)

### 4. Verificar Logs

- **Supabase Functions**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions
- **Console do navegador**: F12 → Console
- **HostGator Error Logs**: cPanel → Error Logs

## 🔧 Troubleshooting de Produção

### Erro 404 ao navegar
- **Solução**: Verificar se .htaccess está configurado corretamente

### HTTPS não funciona
- **Solução**: Configurar SSL no HostGator (Let's Encrypt é gratuito)

### Login com Google falha
- **Solução**: Verificar se o domínio está nas origens autorizadas

### Pagamentos não processam
- **Solução**: Verificar se webhook está configurado e chaves estão corretas

### CORS errors
- **Solução**: Verificar configuração do domínio no Supabase

## 🔄 Processo de Atualização

### Para futuras atualizações:

1. **Local**:
   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. **HostGator**:
   - Backup da versão atual
   - Upload da nova build
   - Teste rápido de funcionamento

### Rollback de Emergência:
- **HostGator**: Restaurar backup via cPanel
- **Supabase**: Reverter secrets se necessário

## 📊 Monitoramento Pós-Produção

### 1. Métricas Importantes
- [ ] Taxa de erro de login
- [ ] Tempo de carregamento das páginas
- [ ] Sucesso de pagamentos
- [ ] Conexões do Google Calendar

### 2. Logs a Monitorar
- **Diários**: Console errors e Network failures
- **Semanais**: Supabase function logs
- **Mensais**: Performance e usage analytics

### 3. Backups
- **Supabase**: Backup automático (configurado)
- **HostGator**: Backup semanal do site
- **Código**: Git repository atualizado

## 🎯 Checklist Final de Produção

### Funcionalidades Críticas
- [ ] Sistema de autenticação completo
- [ ] CRUD de alunos e aulas
- [ ] Sistema de pagamentos
- [ ] Integração Google Calendar
- [ ] Área administrativa
- [ ] Navegação fluida

### Segurança
- [ ] HTTPS ativo
- [ ] Secrets protegidos
- [ ] RLS ativo no Supabase
- [ ] .htaccess configurado

### Performance
- [ ] Build otimizado
- [ ] Compressão ativa
- [ ] Cache configurado
- [ ] Assets minificados

### Integrações
- [ ] Mercado Pago webhook ativo
- [ ] Google APIs funcionais
- [ ] Supabase Edge Functions operacionais
- [ ] URLs de produção configuradas

## 🎊 Parabéns!

Se chegou até aqui com todos os itens marcados, seu ClassPro está oficialmente em produção! 🚀

### Próximos Passos Recomendados:

1. **Monitoramento**: Configure alertas para erros críticos
2. **Backup**: Estabeleça rotina de backup regular
3. **Documentação**: Mantenha este tutorial atualizado
4. **Usuários**: Comece a onboarding dos primeiros professores
5. **Feedback**: Colete feedback para melhorias

### Links Úteis para Administração:
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu
- **Google Console**: https://console.cloud.google.com/
- **Mercado Pago**: https://www.mercadopago.com.br/developers/panel
- **HostGator cPanel**: [seu-dominio.com/cpanel]

---

**🔥 Seu ClassPro está LIVE! Bom trabalho!** 🔥