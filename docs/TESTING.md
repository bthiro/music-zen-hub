# TESTING GUIDE

## Sistema de Calendário e Agenda

### 1. Calendário no Dashboard
**Objetivo**: Verificar se o calendário aparece no dashboard e sincroniza com Google

**Passos**:
1. Acessar `/app` (dashboard)
2. **Sem Google conectado**:
   - ✅ Verificar se aparece banner "Conectar Google Calendar" 
   - ✅ Clicar no botão "Conectar Google" e autenticar
   - ✅ Após conectar, banner deve desaparecer e eventos do Google devem aparecer
3. **Com Google conectado**:
   - ✅ Verificar se eventos do Google Calendar aparecem no calendário
   - ✅ Verificar se aulas locais aparecem no calendário
   - ✅ Testar views: mês, semana, dia (botões no canto direito)
   - ✅ Testar navegação: anterior, próximo, hoje

### 2. Criação e Edição de Eventos
**Objetivo**: Testar criação, edição e cancelamento de eventos

**Passos**:
1. **Criar evento**: Clicar em data vazia → modal abrir → preencher → salvar
2. **Editar evento**: Clicar em evento existente → modal abrir → alterar → salvar  
3. **Arrastar evento**: Drag & drop de um evento → confirmar atualização
4. **Cancelar evento**: Abrir evento → deletar → verificar status "cancelada"
5. **Meet Links**: Verificar se eventos criados geram links válidos do Google Meet

### 3. Agenda Completa (/app/agenda)
**Objetivo**: Testar a página completa de agenda

**Passos**:
1. Navegar para `/app/agenda`
2. Repetir todos os testes do calendário do dashboard
3. Verificar integração Google Calendar funciona igual

## Sistema de Pagamentos

### 4. Criar Pagamento
**Objetivo**: Testar criação de pagamentos com aluno existente e quick-create

**Passos**:
1. Ir para `/app/pagamentos`
2. Clicar "Novo Pagamento"
3. **Aluno existente**:
   - ✅ Selecionar aluno da lista
   - ✅ Escolher tipo (mensal/pacote/avulsa/quinzenal)  
   - ✅ Definir valor e vencimento
   - ✅ Salvar → verificar se aparece na lista
4. **Quick-create aluno**:
   - ✅ Ativar switch "Criar aluno rápido"
   - ✅ Preencher nome, email, telefone
   - ✅ Salvar → verificar se aluno foi criado E vinculado ao pagamento

### 5. Renovar Pagamento
**Objetivo**: Testar renovação automática de mensalidades/pacotes

**Passos**:
1. Na lista de pagamentos, encontrar um pagamento 'pago'
2. Clicar no menu (⋮) → "Renovar"
3. ✅ Verificar se novo pagamento foi criado para período seguinte
4. ✅ Confirmar que não há erro de constraint (payment_precedence)

### 6. Marcar Pagamento Manual
**Objetivo**: Testar marcação manual de pagamentos

**Passos**:
1. Encontrar pagamento com status 'pendente'
2. Clicar menu (⋮) → "Marcar como Pago"
3. ✅ Inserir motivo quando solicitado
4. ✅ Verificar se status mudou para 'pago'
5. ✅ Verificar se apareceu CTA "Agendar Aulas"

### 7. Excluir Pagamento
**Objetivo**: Testar exclusão de pagamentos pendentes

**Passos**:
1. Encontrar pagamento 'pendente' SEM aulas vinculadas
2. Clicar menu (⋮) → "Excluir" → confirmar
3. ✅ Pagamento deve ser removido (soft delete)
4. **Teste negativo**: Tentar excluir pagamento 'pago' → deve ser bloqueado

## Sistema de Perfil/Configurações

### 8. Perfil do Professor
**Objetivo**: Testar edição de dados pessoais e configurações

**Passos**:
1. Ir para `/app/perfil`
2. **Aba Perfil**:
   - ✅ Editar nome, telefone, especialidades, bio
   - ✅ Upload de avatar (testar arquivo válido e inválido)
   - ✅ Salvar → dados devem persistir após F5
3. **Aba Integrações**:
   - ✅ Verificar status Google Calendar e Mercado Pago
   - ✅ Botões conectar/desconectar funcionais

### 9. Alterar Senha
**Objetivo**: Testar alteração de senha self-service

**Passos**:
1. No perfil, localizar seção de senha
2. ✅ Preencher nova senha e confirmação
3. ✅ Salvar → fazer logout → login com nova senha

## Sistema de Admin e Impersonação

### 10. Admin Impersonar Read-Only
**Objetivo**: Testar visualização admin de dados do professor

**Passos** (como admin):
1. Ir para `/admin` 
2. Encontrar professor na lista → "Impersonar (Read-Only)"
3. ✅ Modal deve abrir mostrando:
   - Contagem de alunos do professor
   - Lista de alunos do professor
   - Lista de pagamentos do professor
4. ✅ Verificar que só aparecem dados do professor selecionado
5. ✅ Fechar modal → audit log deve registrar início/fim da visualização

## Integração Mercado Pago

### 11. Multi-tenant Mercado Pago
**Objetivo**: Verificar isolamento por professor

**Passos**:
1. **Professor A**: conectar Mercado Pago com token próprio
2. **Professor A**: criar pagamento automático → preference usa token do A
3. **Professor B**: conectar Mercado Pago com token próprio  
4. **Professor B**: criar pagamento → preference usa token do B
5. ✅ Webhook deve rotear pagamentos corretos para cada professor
6. **Admin**: não deve conseguir criar pagamentos usando tokens dos professores

## Testes de UI/UX

### 12. Navegação e Layout Limpo
**Objetivo**: Verificar que UI duplicada foi removida

**Passos**:
1. ✅ Dashboard (`/app`) não deve ter abas duplicadas embaixo do nome
2. ✅ Cards de Ferramentas devem abrir rotas corretas:
   - Lousa → `/app/ferramentas/lousa`
   - IA → `/app/ia`  
   - Metrônomo → `/app/ferramentas/metronomo`
3. ✅ Nenhum card deve abrir página 404
4. ✅ Menu lateral deve ter todas as opções funcionais

## RCA: Erro de Payment Precedence

### Problema Original
**Erro**: `check constraint 'pagamentos_payment_precedence_check'`

### Causa Raiz
A constraint original permitia valores `['automatic', 'manual', 'refunded', 'cancelled', 'chargeback']` mas o código estava enviando `'automatico'` (português) ao invés de `'automatic'` (inglês).

### Solução Implementada
1. **Migration**: Atualizou constraint para aceitar `['automatic', 'manual']`
2. **Código**: Corrigiu todas as referências para usar `'automatic'` em vez de `'automatico'`
3. **Validação**: Formulários agora usam valores corretos em inglês

### Resultado Esperado
Renovações de pagamento devem funcionar sem erro de constraint.

## Checklist Final de QA

Antes de considerar a feature completa, todos os itens devem passar:

- [ ] Calendário visível no dashboard
- [ ] CTA Google aparece quando desconectado
- [ ] Eventos editáveis com drag/resize
- [ ] Criar/renovar/excluir pagamentos funciona
- [ ] Quick-create de aluno funciona
- [ ] Pagamento manual libera "Agendar Aulas"
- [ ] Perfil editável com upload de avatar
- [ ] Admin impersonar mostra dados corretos
- [ ] Mercado Pago por professor isolado
- [ ] UI limpa sem duplicações
- [ ] Todas as rotas navegáveis sem 404
- [ ] Renovação não quebra com erro de precedence