# Guia de Ações Administrativas

## Visão Geral
Este guia detalha todas as ações disponíveis para administradores na gestão de professores no Music Zen Hub.

## Acesso Administrativo
- **URL**: `/admin`
- **Requisito**: Usuário com role `admin`
- **Menu**: Aba "Professores" no dashboard

## Ações Disponíveis

### 1. Criar Novo Professor

**Localização**: Botão "Novo Professor" na aba Professores

**Campos Obrigatórios**:
- Nome Completo
- Email (único no sistema)

**Campos Opcionais**:
- Telefone
- Plano (Básico/Premium) - padrão: Básico
- Limite de Alunos - padrão: 50

**Módulos Habilitados por Padrão**:
- Dashboard: ✓
- Ferramentas: ✓
- Agenda: ✓
- Pagamentos: ✓
- Materiais: ✓
- Lousa: ✓
- IA: ✓ (apenas Premium)

**Resultado**:
- Cria usuário no Supabase Auth
- Registra role 'professor'
- Cria perfil na tabela professores
- Status inicial: 'ativo'

### 2. Reenviar Convite

**Localização**: Menu "..." → "Reenviar Convite"

**Funcionamento**:
- **Com SMTP**: Email automático para o professor
- **Sem SMTP**: Link copiado para área de transferência

**Uso Recomendado**:
- Professor não recebeu email inicial
- Primeiro acesso ao sistema
- Conta recém-criada

### 3. Resetar Senha

**Localização**: Menu "..." → "Resetar Senha"

**Funcionamento**:
- **Com SMTP**: Link de recuperação por email
- **Sem SMTP**: Link gerado e copiado

**Uso Recomendado**:
- Professor esqueceu a senha
- Problemas de acesso
- Mudança de senha solicitada

### 4. Gerenciar Status

**Localização**: Dropdown "Status: [atual]"

**Opções Disponíveis**:

#### Ativo ✅
- Professor pode fazer login
- Acesso a todos os módulos habilitados
- Pode gerenciar alunos e aulas

#### Suspenso ⚠️ 
- Login temporariamente bloqueado
- Dados preservados
- Pode ser reativado

#### Inativo ❌
- Conta desabilitada
- Login bloqueado
- Para desativação permanente

### 5. Gerenciar Módulos

**Localização**: Seção "Módulos Habilitados" em cada professor

**Módulos Disponíveis**:

- **Dashboard**: Visão geral e estatísticas
- **IA**: Funcionalidades de IA musical (requer plano Premium)
- **Ferramentas**: Metrônomo, afinador, etc.
- **Agenda**: Gestão de aulas e horários
- **Pagamentos**: Cobrança e controle financeiro
- **Materiais**: Biblioteca de recursos
- **Lousa**: Ferramenta de ensino interativo

**Controle**: Switches individuais por módulo

### 6. Impersonar (Planejado)

**Localização**: Menu "..." → "Impersonar (Read-only)"

**Funcionalidade**: 
- Visualizar interface do professor
- Modo somente leitura
- Para suporte e debugging

## Configuração SMTP

### Verificar Status do SMTP
1. Acesse Supabase Dashboard
2. Settings → API
3. Verify SMTP settings

### Com SMTP Configurado ✅
- Emails automáticos para convites
- Links de recuperação por email
- Experiência fluid para professores

### Sem SMTP ⚠️
- Links gerados automaticamente
- Admin deve enviar manualmente
- Funcionalidade preservada

## Auditoria e Logs

### Ações Registradas
Todas as ações administrativas são logadas em `audit_log`:

- `professor_created`: Criação
- `professor_invited`: Convite enviado  
- `professor_password_reset_requested`: Reset solicitado
- `professor_status_updated`: Mudança de status
- `professor_modules_updated`: Alteração de módulos

### Visualizar Logs
```sql
SELECT * FROM audit_log 
WHERE entity = 'professores' 
ORDER BY created_at DESC;
```

## Melhores Práticas

### Criação de Professores
1. **Use emails reais** para facilitar comunicação
2. **Configure plano adequado** desde o início
3. **Limite de alunos** baseado na capacidade do professor
4. **Envie convite imediatamente** após criação

### Gestão de Status
1. **Suspenso** para problemas temporários
2. **Inativo** apenas para remoção permanente
3. **Documentar motivos** das mudanças de status

### Gestão de Módulos
1. **IA apenas para Premium** por limitações de custo
2. **Desabilitar módulos não utilizados** para simplificar interface
3. **Habilitar gradualmente** para novos professores

### Troubleshooting

#### Professor não recebeu convite
1. Verificar email na lista de professores
2. Verificar spam/lixo eletrônico
3. Usar "Reenviar Convite"
4. Se SMTP inativo, copiar link manualmente

#### Professor não consegue fazer login
1. Verificar status (deve estar "Ativo")
2. Tentar "Resetar Senha"
3. Verificar logs em audit_log

#### Módulos não aparecem
1. Verificar switches habilitados
2. Refresh do browser do professor
3. Verificar plano (IA requer Premium)

## Notificações

### Toasts de Sucesso
- Confirmam ações realizadas
- Aparecem no canto superior direito
- Desaparecem automaticamente

### Toasts de Erro
- Indicam problemas na operação
- Mensagens específicas
- Cor vermelha para destaque

## Integração com WhatsApp/Email

### Para SMTP Inativo
1. Link é copiado automaticamente
2. Abrir WhatsApp Web
3. Colar link na conversa com professor
4. Adicionar contexto: "Seu link de acesso ao sistema"

### Template Sugerido
```
Olá [Nome do Professor]! 👋

Sua conta no Music Zen Hub foi criada com sucesso!

🔗 Link de acesso: [COLAR_LINK_AQUI]

Por favor, clique no link para definir sua senha e começar a usar a plataforma.

Qualquer dúvida, estou à disposição!
```

## Próximas Funcionalidades

1. **Bulk Actions**: Ações em lote para múltiplos professores
2. **Email Templates**: Personalização de mensagens
3. **Analytics**: Métricas de uso por professor
4. **Notificações Push**: Alertas automáticos
5. **Backup/Restore**: Recuperação de contas