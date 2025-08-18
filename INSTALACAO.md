# 📋 Tutorial de Instalação - ClassPro (Sistema de Gestão de Aulas)

## 📋 Funcionalidades Principais

- ✅ **Gestão de Alunos**: Cadastro completo com informações pessoais, localização e contratos
- ✅ **Agendamento Inteligente**: Sistema com duração automática baseada no plano do aluno (30 ou 50 min)
- ✅ **Controle de Fuso Horário**: Detecção automática e ajuste manual para diferentes regiões
- ✅ **Controle Financeiro**: Pagamentos, mensalidades e relatórios detalhados com exportação CSV
- ✅ **Relatórios Avançados**: Dashboard moderno com gráficos interativos e métricas visuais
- ✅ **Integração Google**: Agenda e Meet automáticos com sincronização completa
- ✅ **Design Responsivo**: Interface moderna e otimizada para todos os dispositivos
- ✅ **Módulo Contábil**: Preparado para geração de relatórios para IR

## 🚀 Requisitos do Servidor

### Hostgator ou similar:
- **PHP**: 8.0 ou superior
- **Node.js**: 18.0 ou superior 
- **Banco de dados**: MySQL 8.0 ou PostgreSQL
- **SSL**: Certificado válido (obrigatório para Google Meet)

## 📦 1. Preparação dos Arquivos

1. Baixe todos os arquivos do projeto
2. Compacte em um arquivo ZIP
3. Acesse o cPanel do Hostgator
4. Vá em "Gerenciador de Arquivos"
5. Navegue até `public_html`
6. Faça upload do ZIP e extraia

## 🔧 2. Configuração do Banco de Dados

### No cPanel:
1. Acesse "Bancos de Dados MySQL"
2. Crie um novo banco: `sistema_aulas`
3. Crie um usuário com senha forte
4. Associe o usuário ao banco com todas as permissões

### Configure as variáveis:
```bash
# Crie arquivo .env na raiz
DATABASE_URL="mysql://usuario:senha@localhost:3306/sistema_aulas"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="https://seudominio.com"
```

## 🔑 3. Configuração Google (API)

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative APIs: "Calendar API" e "Meet API"
4. Crie credenciais OAuth 2.0
5. Configure domínios autorizados
6. Baixe o arquivo de credenciais

```bash
# Adicione no .env
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

## 🌐 4. Deploy e Configuração

### Via cPanel Terminal:
```bash
# Instalar dependências
npm install

# Gerar build de produção
npm run build

# Configurar permissões
chmod 755 -R public_html/
chmod 644 .env
```

### Configurar SSL:
1. No cPanel → "SSL/TLS"
2. Ative "Forçar HTTPS"
3. Verifique certificado válido

## 🔧 5. Configurações Finais

### No sistema:
1. Acesse: `https://seudominio.com`
2. Vá em **Configurações**
3. Conecte com Google
4. Configure PIX e links de pagamento
5. Teste a integração

### Verificar funcionamento:
- ✅ Login Google funcionando
- ✅ Criação de eventos na agenda
- ✅ Links do Meet sendo gerados
- ✅ Cores personalizadas aparecendo

## 🆘 Solução de Problemas

### Erro de autenticação Google:
```bash
# Verificar URLs no Google Console
- https://seudominio.com
- https://seudominio.com/api/auth/callback/google
```

### Banco não conecta:
```bash
# Verificar .env
# Testar conexão no cPanel → phpMyAdmin
```

### Build falha:
```bash
# Limpar cache
npm run clean
npm install --production
npm run build
```

## 📞 Suporte

- **Logs de erro**: `/logs/error.log`
- **Teste Google**: Configurações → Testar Integração
- **Backup**: Configure backup automático no cPanel

---

⚡ **Sistema pronto para produção!** 

Acesse seu domínio e comece a usar o sistema de gestão de aulas.