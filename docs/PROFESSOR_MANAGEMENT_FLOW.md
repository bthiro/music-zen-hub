# Fluxo Completo de Gestão de Professores

Este documento descreve o fluxo completo de gestão de professores, desde a criação até o login e gestão de senhas.

## Funcionalidades Implementadas

### 1. Criação de Professor (Admin)
- **Endpoint**: `admin-create-professor` Edge Function
- **Método**: Usa Supabase Auth Admin API para criar usuário
- **Persistência**: Registra em `auth.users`, `user_roles` e `professores`
- **Auditoria**: Log em `audit_log` com ação `professor_created`

### 2. Sistema de Convites
- **Endpoint**: `admin-invite-professor` Edge Function
- **Método Preferencial**: `inviteUserByEmail()` (requer SMTP configurado)
- **Fallback**: `generateLink(type='signup')` quando SMTP não disponível
- **Resultado**: 
  - Com SMTP: Email automático enviado
  - Sem SMTP: Link copiado para área de transferência do admin

### 3. Recuperação/Reset de Senha
- **Endpoint**: `admin-reset-professor-password` Edge Function
- **Método Preferencial**: `resetPasswordForEmail()` (requer SMTP)
- **Fallback**: `generateLink(type='recovery')` quando SMTP não disponível
- **Tela**: `/auth/reset-password` para definir nova senha

### 4. Ações Administrativas Disponíveis

#### No Dashboard Admin (/admin):
- **Criar Professor**: Formulário completo com nome, email, plano, limites
- **Reenviar Convite**: Botão para reenviar convite inicial
- **Resetar Senha**: Botão para enviar link de redefinição
- **Gerenciar Status**: Ativo/Suspenso/Inativo
- **Gerenciar Módulos**: Habilitar/desabilitar funcionalidades por professor
- **Impersonar**: (Planejado) Visualização read-only da conta do professor

### 5. Fluxo do Professor

#### Primeiro Acesso:
1. Admin cria professor → Convite enviado/link gerado
2. Professor acessa link → Redireciona para `/auth/reset-password`
3. Professor define senha → Redirecionado para `/app`

#### Login Posterior:
1. Professor acessa `/auth`
2. Faz login com email/senha
3. Redirecionado para `/app`

#### Reset de Senha:
1. Admin clica "Resetar Senha"
2. Link enviado/gerado para professor
3. Professor acessa `/auth/reset-password`
4. Define nova senha → Redirecionado para `/app`

## Configuração SMTP

### Com SMTP Configurado:
- Convites e resets são enviados automaticamente por email
- Professor recebe links diretamente na caixa de entrada

### Sem SMTP (Fallback):
- Links são gerados e copiados para área de transferência do admin
- Admin deve enviar manualmente ao professor (WhatsApp, etc.)

## Auditoria e Logs

Todas as ações são registradas na tabela `audit_log`:
- `professor_created`: Criação de novo professor
- `professor_invited`: Envio de convite inicial
- `professor_password_reset_requested`: Solicitação de reset de senha
- `professor_status_updated`: Mudança de status
- `professor_modules_updated`: Alteração de módulos habilitados

## Validações e Segurança

### Validações de Criação:
- Nome e email obrigatórios
- Email único no sistema
- Validação de formato de email

### Segurança:
- Todas as operações administrativas requerem role 'admin'
- Edge functions usam Service Role Key para operações privilegiadas
- Tokens de recuperação têm expiração automática
- RLS (Row Level Security) aplicado em todas as tabelas

### Tratamento de Erros:
- Cleanup automático em caso de falha na criação
- Logs detalhados para debugging
- Mensagens de erro amigáveis para o usuário

## URLs e Redirects

- **Convite/Reset**: `{SITE_URL}/auth/reset-password`
- **Pós-Login Admin**: `/admin`
- **Pós-Login Professor**: `/app`
- **Fallback**: `/auth` para usuários não autenticados

## Status dos Professores

- **Ativo**: Pode acessar todas as funcionalidades habilitadas
- **Suspenso**: Login bloqueado temporariamente
- **Inativo**: Conta desabilitada permanentemente

## Módulos Disponíveis

- **Dashboard**: Visão geral e estatísticas
- **IA**: Funcionalidades de inteligência artificial (Premium)
- **Ferramentas**: Metrônomo, afinador, etc.
- **Agenda**: Gestão de aulas e horários
- **Pagamentos**: Cobrança e controle financeiro
- **Materiais**: Biblioteca de recursos didáticos
- **Lousa**: Ferramenta de ensino interativo

## Próximos Passos Planejados

1. **Impersonação Read-Only**: Visualizar conta do professor sem editar
2. **Notificações Push**: Alertas para professores sobre atualizações
3. **Template de Emails**: Personalização de mensagens de convite
4. **Bulk Operations**: Ações em lote para múltiplos professores
5. **Analytics**: Métricas de uso e engajamento por professor