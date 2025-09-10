# ✅ Checklist de QA - ClassPro (Release Final)

## 🎯 Objetivo
Validar que todas as funcionalidades estão operacionais antes do release em produção.

---

## 🔐 **1. AUTENTICAÇÃO E SEGURANÇA**

### Login/Logout
- [ ] **Login admin** funciona (primeiro usuário vira admin automaticamente)
- [ ] **Login professor** funciona e redireciona para `/app`
- [ ] **Logout** limpa sessão e redireciona para `/auth`
- [ ] **VITE_AUTH_MODE=locked** em produção bloqueia acesso não autenticado
- [ ] **VITE_AUTH_MODE=open** em desenvolvimento permite acesso livre

### Row Level Security (RLS)
- [ ] **Professor A** não consegue ver dados do **Professor B**
- [ ] **Deep links** de outro professor são bloqueados (ex: `/app/alunos/ID_DE_OUTRO_PROFESSOR`)
- [ ] **Admin** consegue ver dados de todos os professores
- [ ] **Storage/Materiais**: professor só acessa próprios arquivos

**🧪 Teste prático:**
```bash
# Login como professor1@test.com
# Tente acessar URL: /app/alunos?professor_id=OUTRO_PROFESSOR_ID
# Resultado esperado: Lista vazia ou erro 403
```

---

## 👥 **2. GESTÃO DE ALUNOS**

### CRUD Básico
- [ ] **Criar aluno**: formulário salva no banco com `professor_id` correto
- [ ] **Editar aluno**: alterações persistem
- [ ] **Listar alunos**: apenas do professor logado
- [ ] **Buscar/Filtrar**: funciona por nome, instrumento, nível
- [ ] **Status ativo/inativo**: aluno inativo não aparece em pagamentos/aulas

### Validações
- [ ] **Campos obrigatórios**: nome, email, telefone validados
- [ ] **Email único**: não permite duplicatas
- [ ] **Valores numéricos**: mensalidade, dia vencimento aceitos corretamente

---

## 💰 **3. SISTEMA DE PAGAMENTOS**

### Fluxo Automático (CRÍTICO)
- [ ] **Criar pagamento** no Mercado Pago (sandbox) → checkout abre
- [ ] **Pagar no sandbox** → webhook recebido automaticamente
- [ ] **Status atualizado**: `pendente` → `pago` no banco
- [ ] **Flag habilitada**: `eligible_to_schedule = true`
- [ ] **UI atualizada**: botão "Agendar Aulas" aparece automaticamente (SEM ação manual)

### Idempotência e Webhook
- [ ] **Webhook assinatura**: x-signature validada corretamente
- [ ] **Eventos duplicados**: mesmo webhook enviado 2x não duplica processamento
- [ ] **Status mapeado**: approved → pago, refunded → reembolsado, etc.
- [ ] **Audit log**: eventos `pagamento_confirmado` registrados

### Reprocessamento Manual
- [ ] **Admin pode reprocessar** payment_id específico via botão
- [ ] **Status corrigido**: consulta API do MP e atualiza banco
- [ ] **Professor pode reprocessar** próprios pagamentos pendentes

**🧪 Teste prático:**
```bash
# 1. Crie pagamento no MP sandbox
# 2. Pague com cartão: 4509 9535 6623 3704, CVV: 123, Nome: APRO
# 3. Aguarde 30s → status deve mudar para "pago" automaticamente
# 4. Botão "Agendar Aulas" deve aparecer
```

---

## 📅 **4. AGENDAMENTO DE AULAS**

### Liberação Pós-Pagamento
- [ ] **Pagamento "pago"** → botão "Agendar Aulas" visível
- [ ] **Pagamento pendente/atrasado** → botão NÃO visível
- [ ] **Assistente de agendamento**: data, horário, duração (baseada no aluno)
- [ ] **Validação de conflitos**: mesmo horário rejeitado

### CRUD de Aulas
- [ ] **Criar aula**: dados salvos no banco
- [ ] **Editar aula**: alterações aplicadas
- [ ] **Cancelar aula**: status alterado
- [ ] **Listar aulas**: filtros por período, aluno, status funcionam

### Google Calendar (Opcional)
- [ ] **Google conectado**: eventos criados com Google Meet
- [ ] **Google desconectado**: aula criada localmente, aviso exibido
- [ ] **Falha do Google**: aula salva + botão "Tentar novamente"
- [ ] **Editar/cancelar**: sincroniza com Google

**🧪 Teste prático:**
```bash
# 1. Com pagamento "pago", clique "Agendar Aulas"
# 2. Escolha data/horário
# 3. Salve → aula deve aparecer na lista
# 4. Se Google conectado → verifique evento no Google Calendar
```

---

## 🔗 **5. INTEGRAÇÃO GOOGLE CALENDAR**

### OAuth e Conexão
- [ ] **Conectar Google**: popup OAuth abre e funciona
- [ ] **Status exibido**: "Conectado" + email do usuário
- [ ] **Desconectar**: limpa tokens, status atualizado

### Criação de Eventos
- [ ] **Aula criada** → evento no Google Calendar
- [ ] **Google Meet**: link gerado e salvo na aula
- [ ] **Título correto**: "Aula de Música - [Nome do Aluno]"
- [ ] **Horário/timezone**: America/Sao_Paulo aplicado

### Sincronização
- [ ] **Editar aula** → evento atualizado no Google
- [ ] **Cancelar aula** → evento removido do Google
- [ ] **Falha de API**: erro tratado graciosamente

---

## 🛠️ **6. PAINEL ADMINISTRATIVO**

### Dashboard
- [ ] **Métricas corretas**: total professores, alunos, receita
- [ ] **Gráficos funcionais**: professores por status, resumo financeiro
- [ ] **Dados globais**: admin vê informações de todos os professores

### Gestão de Professores
- [ ] **Criar professor**: formulário funciona, envia email de ativação
- [ ] **Alterar status**: ativo/suspenso/inativo aplicado imediatamente
- [ ] **Toggles de módulos**: dashboard, ia, agenda, etc. funcionam
- [ ] **Impersonar (read-only)**: permite visualizar como professor

### Pagamentos Globais
- [ ] **Lista todos pagamentos**: de todos os professores
- [ ] **Filtros funcionam**: por professor, status, período
- [ ] **Exportar CSV**: download com dados corretos
- [ ] **Reprocessar**: botão funciona para qualquer pagamento
- [ ] **Audit trail**: histórico de alterações visível

---

## 📊 **7. RELATÓRIOS E AUDITORIA**

### Audit Log
- [ ] **Eventos registrados**: login, pagamento_confirmado, aula_criada, etc.
- [ ] **Metadados corretos**: user_id, entity_id, timestamps
- [ ] **Admin acessa tudo**: todos os logs visíveis
- [ ] **Professor acessa próprios**: apenas seus logs

### Relatórios Financeiros
- [ ] **Dashboard professor**: receita mensal, pagamentos pendentes
- [ ] **Admin global**: receita total, por professor
- [ ] **Exportação**: CSV com dados corretos e completos
- [ ] **Filtros por período**: últimos 30 dias, mês atual, etc.

---

## 🚨 **8. TRATAMENTO DE ERROS**

### Estados de Loading
- [ ] **Skeletons**: exibidos durante carregamento
- [ ] **Spinners**: em botões durante processamento
- [ ] **Estados vazios**: mensagens apropriadas quando sem dados

### Mensagens de Erro
- [ ] **Toasts informativos**: sucesso/erro claramente comunicados
- [ ] **Validação de formulário**: erros específicos por campo
- [ ] **Conexão**: falhas de rede tratadas graciosamente
- [ ] **Permissões**: acesso negado com mensagem clara

### Fallbacks
- [ ] **Google Calendar falha**: aula salva localmente
- [ ] **Mercado Pago indisponível**: fallback para pagamento manual
- [ ] **Webhook perdido**: reprocessamento manual disponível

---

## 📱 **9. RESPONSIVIDADE E UX**

### Design Responsivo
- [ ] **Desktop**: layout funcional em 1920x1080
- [ ] **Tablet**: adaptação correta em 768px
- [ ] **Mobile**: usável em 375px (iPhone SE)
- [ ] **Navegação**: menu mobile funcional

### Performance
- [ ] **Carregamento inicial**: < 3 segundos
- [ ] **Navegação**: transições suaves
- [ ] **Dados grandes**: paginação ou lazy loading
- [ ] **Console limpo**: sem erros JavaScript no fluxo feliz

---

## 🔧 **10. CONFIGURAÇÃO E DEPLOYMENT**

### Variáveis de Ambiente
- [ ] **Desenvolvimento**: `.env.local` configurado corretamente
- [ ] **Produção**: `VITE_AUTH_MODE=locked` obrigatório
- [ ] **Supabase Secrets**: todas as chaves configuradas
- [ ] **URLs corretas**: redirect URIs do Google, notification URL do MP

### Edge Functions
- [ ] **Mercado Pago Webhook**: responde corretamente
- [ ] **Google OAuth**: fluxo completo funciona
- [ ] **Reprocessamento**: endpoint acessível
- [ ] **Logs disponíveis**: Supabase Dashboard → Functions → Logs

### Banco de Dados
- [ ] **Migrações aplicadas**: todas as tabelas criadas
- [ ] **RLS ativa**: políticas funcionando
- [ ] **Triggers funcionais**: eligible_to_schedule atualizando
- [ ] **Backup configurado**: Supabase auto-backup ativo

---

## 🎯 **TESTE FINAL COMPLETO (E2E)**

### Cenário: Fluxo Completo do Negócio
**Tempo estimado: 10 minutos**

1. **Login professor** → `/app`
2. **Criar aluno** → "João Teste", mensalidade R$ 200
3. **Ir para Pagamentos** → status "pendente"
4. **Mercado Pago** → pagar no sandbox
5. **Aguardar webhook** → status "pago" automaticamente
6. **Botão "Agendar Aulas"** → deve aparecer
7. **Criar aula** → próxima segunda, 10h, 50min
8. **Google Calendar** → evento criado (se conectado)
9. **Admin** → ver pagamento na lista global
10. **Audit Log** → eventos registrados

**✅ Resultado Esperado:**
- Fluxo completo sem intervenção manual
- Dados consistentes em todas as telas
- Integrações funcionando
- Log de auditoria completo

---

## 📋 **CHECKLIST FINAL DE RELEASE**

### Pré-Produção
- [ ] ✅ Todos os itens acima testados e aprovados
- [ ] ✅ Documentação completa presente (`/docs/`)
- [ ] ✅ `.env.example` atualizado
- [ ] ✅ CHANGELOG.md com todas as features

### Produção
- [ ] ✅ `VITE_AUTH_MODE=locked` configurado
- [ ] ✅ URLs de produção no Google OAuth
- [ ] ✅ Credenciais de PRODUÇÃO no Mercado Pago
- [ ] ✅ Notification URL configurada no MP
- [ ] ✅ SSL/HTTPS ativo no domínio

### Pós-Deploy
- [ ] ✅ Teste completo E2E realizado em produção
- [ ] ✅ Logs sem erros críticos
- [ ] ✅ Backup do banco de dados realizado
- [ ] ✅ Monitoramento ativo

---

## 🏆 **CRITÉRIOS DE APROVAÇÃO**

**✅ APROVADO** se:
- [ ] Webhook automático funciona (pagamento → status pago → botão agendar)
- [ ] RLS bloqueia acesso cruzado entre professores
- [ ] Google Calendar sincroniza (se conectado)
- [ ] Admin consegue gerenciar tudo globalmente
- [ ] Sistema funciona em mobile/desktop
- [ ] Console sem erros críticos

**❌ REPROVADO** se:
- [ ] Pagamento requer marcação manual
- [ ] Professor consegue ver dados de outro
- [ ] Webhook não valida assinatura
- [ ] Erros JavaScript não tratados
- [ ] Sistema quebra em mobile

---

## 📞 **CONTATOS DE SUPORTE**

**Em caso de problemas:**
1. **Logs Supabase**: [Dashboard → Edge Functions → Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
2. **Console Browser**: F12 → Console
3. **Banco de dados**: Queries SQL para debug
4. **Documentação**: `/docs/TESTING.md` para testes específicos

---

🎉 **SISTEMA APROVADO PARA PRODUÇÃO!**