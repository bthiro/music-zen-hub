# Roteiro de QA - Fluxo de Professores

## Pré-requisitos
- Acesso de administrador ao sistema
- Email de teste disponível (gmail, etc.)
- Acesso às tabelas do Supabase para validação

## Cenário 1: Criação e Convite de Professor (SMTP Ativo)

### 1.1 Criar Professor
1. **Login como Admin**: Acesse `/admin` com conta administrativa
2. **Navegue para Professores**: Clique na aba "Professores"
3. **Criar Novo Professor**: 
   - Clique em "Novo Professor"
   - Preencha:
     - Nome: "Professor Teste QA"
     - Email: [seu-email-teste]
     - Telefone: (opcional)
     - Plano: "Básico"
     - Limite de Alunos: 50
   - Clique "Criar Professor"
4. **Validar Sucesso**: 
   - Toast de sucesso deve aparecer
   - Professor deve aparecer na lista

### 1.2 Validar Persistência no Banco
1. **Verificar auth.users**: 
   ```sql
   SELECT * FROM auth.users WHERE email = '[seu-email-teste]';
   ```
2. **Verificar user_roles**:
   ```sql
   SELECT * FROM user_roles WHERE user_id = '[user_id_do_step_1]';
   ```
3. **Verificar professores**:
   ```sql
   SELECT * FROM professores WHERE email = '[seu-email-teste]';
   ```
4. **Verificar audit_log**:
   ```sql
   SELECT * FROM audit_log WHERE action = 'professor_created' ORDER BY created_at DESC LIMIT 1;
   ```

### 1.3 Enviar Convite Inicial
1. **Na lista de professores**: Clique no menu "..." do professor criado
2. **Reenviar Convite**: Clique na opção "Reenviar Convite"
3. **Validar Resultado**:
   - Se SMTP ativo: Toast "Convite enviado por email"
   - Se SMTP inativo: Toast "Link gerado" + link copiado

### 1.4 Professor - Primeiro Acesso
1. **Acesse o link** recebido por email ou copiado
2. **Deve redirecionar** para `/auth/reset-password`
3. **Definir senha**:
   - Nova senha: mínimo 8 caracteres
   - Confirmar senha: deve coincidir
   - Clicar "Redefinir Senha"
4. **Validar Redirecionamento**: Deve ir para `/app` após sucesso

## Cenário 2: Reset de Senha pelo Admin

### 2.1 Admin Reset Password
1. **Na lista de professores**: Clique no menu "..." do professor
2. **Resetar Senha**: Clique na opção "Resetar Senha"
3. **Validar Resultado**:
   - Se SMTP ativo: Toast "Link enviado por email"
   - Se SMTP inativo: Toast "Link gerado" + link copiado

### 2.2 Professor - Reset de Senha
1. **Acesse o link** de reset recebido
2. **Deve carregar** `/auth/reset-password` com tokens na URL
3. **Definir nova senha**: Repetir processo do primeiro acesso
4. **Validar Login**: Professor deve conseguir logar com nova senha

## Cenário 3: Gestão de Status e Módulos

### 3.1 Alterar Status
1. **No dropdown de status**: Teste as mudanças:
   - Ativo → Suspenso
   - Suspenso → Inativo  
   - Inativo → Ativo
2. **Validar cada mudança**:
   - Toast de confirmação
   - Atualização visual na lista
   - Log em audit_log

### 3.2 Gerenciar Módulos
1. **Na seção "Módulos Habilitados"**: 
   - Desabilite "IA" para plano básico
   - Habilite "Dashboard", "Ferramentas", etc.
2. **Validar**:
   - Switches devem refletir mudanças
   - Toast de confirmação
   - Professor vê mudanças no `/app`

## Cenário 4: Login e Acesso do Professor

### 4.1 Login Normal
1. **Acesse `/auth`**
2. **Faça login** com email/senha do professor
3. **Validar redirecionamento** para `/app`

### 4.2 Validar Acesso Baseado em Status
1. **Professor Suspenso**: Login deve falhar
2. **Professor Inativo**: Login deve falhar  
3. **Professor Ativo**: Login deve suceder

### 4.3 Validar Módulos
1. **No painel do professor**: Verificar se apenas módulos habilitados aparecem
2. **Tentar acessar módulo desabilitado**: Deve ser bloqueado

## Cenário 5: Fallback (SMTP Desabilitado)

### 5.1 Simular SMTP Inativo
1. **Desabilitar SMTP** no Supabase (ou usar projeto sem SMTP)
2. **Repetir Cenário 1.3**: Convite deve gerar link
3. **Repetir Cenário 2.1**: Reset deve gerar link
4. **Validar**: Admin deve copiar links manualmente

## Checklist de Validação

### ✅ Funcionalidades Core
- [ ] Criação de professor funciona
- [ ] Persistência em todas as tabelas
- [ ] Convite por email (se SMTP ativo)
- [ ] Geração de link (se SMTP inativo)
- [ ] Reset de senha funciona
- [ ] Primeiro acesso do professor
- [ ] Login posterior do professor

### ✅ Gestão Administrativa
- [ ] Alteração de status funciona
- [ ] Gestão de módulos funciona
- [ ] Auditoria registrada corretamente
- [ ] Mensagens de erro apropriadas
- [ ] Interface responsiva

### ✅ Segurança e Validações
- [ ] Apenas admins podem criar professores
- [ ] Professor suspenso não consegue logar
- [ ] Professor inativo não consegue logar
- [ ] Tokens de reset expiram adequadamente
- [ ] RLS funciona corretamente

### ✅ Experiência do Usuário
- [ ] Toasts informativos aparecem
- [ ] Redirecionamentos funcionam
- [ ] Formulários têm validação
- [ ] Loading states aparecem
- [ ] Erros são tratados graciosamente

## Casos de Erro para Testar

### Email Duplicado
1. **Tentar criar professor** com email já existente
2. **Esperado**: Erro claro e específico

### Dados Inválidos
1. **Email inválido**: Deve ser rejeitado
2. **Nome vazio**: Deve ser rejeitado
3. **Limite de alunos negativo**: Deve ser rejeitado

### Tokens Expirados
1. **Link de reset antigo**: Deve mostrar erro
2. **Link de convite antigo**: Deve mostrar erro

### Permissões
1. **Usuário não-admin**: Não deve acessar funções administrativas
2. **Professor**: Não deve ver outros professores

## Limpeza Pós-Teste

1. **Remover dados de teste**:
   ```sql
   DELETE FROM professores WHERE email = '[seu-email-teste]';
   DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email = '[seu-email-teste]');
   ```
2. **Remover usuário de auth**:
   - Via Dashboard do Supabase > Authentication > Users
   - Deletar usuário de teste

## Observações

- **Performance**: Testar com múltiplos professores
- **Concorrência**: Testar ações simultâneas 
- **Mobile**: Validar responsividade
- **Browsers**: Testar Chrome, Firefox, Safari
- **Links Externos**: Garantir que funcionam em ambientes diferentes