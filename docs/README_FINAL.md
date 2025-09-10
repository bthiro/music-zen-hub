# 🎯 ClassPro - Guia Final de Instalação e Deploy

**Sistema de Gestão de Aulas de Música com Automação de Pagamentos**

> **🚀 Este é o guia completo** para instalar, configurar, testar e colocar o ClassPro em produção. Siga esta documentação na ordem apresentada para ter o sistema funcionando 100%.

---

## 📋 Sobre o ClassPro

**ClassPro** é um sistema completo para professores de música que automatiza:
- ✅ **Pagamentos**: Mercado Pago com webhook automático
- ✅ **Agendamento**: Liberação automática pós-pagamento
- ✅ **Google Calendar**: Criação de eventos e Google Meet
- ✅ **Gestão**: Alunos, aulas, relatórios financeiros
- ✅ **Segurança**: RLS Supabase, isolamento por professor

---

## 🗺️ Roteiro de Implementação

### **FASE 1: Instalação Local** ⏱️ ~30 minutos
📖 **[Siga: docs/INSTALL.md](./INSTALL.md)**

1. **Pré-requisitos**: Node.js 18+, contas Supabase/Google/Mercado Pago
2. **Clone e configure** o projeto localmente
3. **Configure integrações** básicas (Google OAuth, MP Sandbox)
4. **Teste o sistema** em desenvolvimento

**✅ Resultado esperado**: Sistema rodando em `http://localhost:5173`

---

### **FASE 2: Configuração de Variáveis** ⏱️ ~15 minutos
📖 **[Siga: docs/ENV.md](./ENV.md)**

1. **Configure .env.local** com todas as chaves
2. **Configure Supabase Secrets** para Edge Functions
3. **Configure Google Cloud** OAuth credentials
4. **Configure Mercado Pago** notification URLs

**✅ Resultado esperado**: Todas as integrações funcionando localmente

---

### **FASE 3: Testes Completos** ⏱️ ~45 minutos
📖 **[Siga: docs/TESTING.md](./TESTING.md)**

1. **Teste fluxo E2E**: Login → Aluno → Pagamento → Webhook → Aula
2. **Teste integrações**: Google Calendar, Mercado Pago
3. **Teste segurança**: RLS, isolamento entre professores
4. **Teste responsividade**: Mobile, desktop

**✅ Resultado esperado**: Todos os cenários de teste passando

---

### **FASE 4: Deploy Produção** ⏱️ ~60 minutos
📖 **[Siga: docs/DEPLOY_PROD.md](./DEPLOY_PROD.md)**

1. **Build e deploy** da aplicação
2. **Configure URLs de produção** (Google, MP)
3. **Configure variáveis** de ambiente de produção
4. **Valide funcionamento** em produção

**✅ Resultado esperado**: Sistema em produção funcionando 100%

---

### **FASE 5: Validação Final** ⏱️ ~30 minutos
📖 **[Siga: docs/QA_CHECKLIST.md](./QA_CHECKLIST.md)**

1. **Execute checklist completo** de funcionalidades
2. **Teste fluxo crítico** em produção
3. **Valide métricas** e logs
4. **Confirme backup** e monitoramento

**✅ Resultado esperado**: Sistema aprovado para uso real

---

## 🚨 Problemas Comuns e Soluções

### **❌ Erro: "Cannot connect to Supabase"**
**Causa**: Variáveis VITE_SUPABASE_* incorretas
```bash
# Solução:
# 1. Verifique .env.local:
VITE_SUPABASE_URL="https://hnftxautmxviwrfuaosu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUz..." # Chave completa

# 2. Reinicie o servidor
npm run dev
```

### **❌ Erro: "Google OAuth redirect mismatch"**
**Causa**: URLs não configuradas no Google Console
```bash
# Solução:
# 1. Google Cloud Console → Credentials → OAuth 2.0
# 2. Authorized redirect URIs:
#    - DEV: http://localhost:5173/auth/google/callback
#    - PROD: https://seudominio.com/auth/google/callback
```

### **❌ Erro: "Webhook Mercado Pago não chega"**
**Causa**: Notification URL não configurada no MP
```bash
# Solução:
# 1. Painel Mercado Pago → Webhooks
# 2. URL: https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-webhook
# 3. Eventos: payment, merchant_order
```

### **❌ Erro: "requested path is invalid" (Auth)**
**Causa**: Site URL não configurada no Supabase
```bash
# Solução:
# 1. Supabase Dashboard → Authentication → URL Configuration
# 2. Site URL: https://seudominio.com (ou http://localhost:5173)
# 3. Redirect URLs: https://seudominio.com/**
```

### **❌ Erro: "Professor não vê próprios dados"**
**Causa**: RLS policies não aplicadas
```sql
-- Solução: Execute no Supabase SQL Editor
SELECT * FROM professores WHERE user_id = auth.uid();
-- Se vazio, rode a migração novamente
```

### **❌ Erro: "Pagamento não libera agendamento"**
**Causa**: Trigger eligible_to_schedule não funcionando
```sql
-- Solução: Force update manual
UPDATE pagamentos 
SET eligible_to_schedule = true 
WHERE status = 'pago' AND eligible_to_schedule = false;
```

### **❌ Erro: "Build/Deploy falha"**
**Causa**: Dependências ou variáveis ausentes
```bash
# Solução:
# 1. Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install

# 2. Verifique todas as VITE_* no ambiente de deploy
# 3. Build local para testar
npm run build
npm run preview
```

---

## 📊 Arquivos Principais do Sistema

### **📁 Documentação** (pasta `/docs/`)
- `README_FINAL.md` ← **Você está aqui**
- `INSTALL.md` - Instalação passo-a-passo
- `DEPLOY_PROD.md` - Deploy em produção  
- `TESTING.md` - Roteiros de teste
- `QA_CHECKLIST.md` - Checklist final
- `ENV.md` - Variáveis de ambiente

### **⚙️ Configuração**
- `.env.example` - Template de configuração
- `CHANGELOG.md` - Histórico de mudanças
- `package.json` - Dependências

### **🗄️ Banco de Dados** (Supabase)
- **9 tabelas**: professores, alunos, aulas, pagamentos, etc.
- **4 Edge Functions**: webhook, reprocess, google-oauth, google-calendar
- **25+ RLS Policies**: segurança por professor

### **🧩 Código Principal** (pasta `/src/`)
- `App.tsx` - Aplicação principal com AuthProvider
- `pages/` - Páginas (Dashboard, Alunos, Pagamentos, etc.)
- `components/` - Componentes reutilizáveis
- `hooks/` - Custom hooks (pagamentos, Google, etc.)

---

## 🎯 Fluxo Principal do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   1. LOGIN      │ ─→ │  2. CADASTRAR   │ ─→ │ 3. PAGAMENTO    │
│   Professor     │    │     ALUNO       │    │  Mercado Pago   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐           ↓
│ 6. GOOGLE CAL   │ ←─ │  5. AGENDAR     │ ←─ ┌─────────────────┐
│ + Google Meet   │    │     AULA        │    │  4. WEBHOOK     │
└─────────────────┘    └─────────────────┘    │   Automático    │
                                              └─────────────────┘
```

### **🔄 Automação Chave**
**Sem intervenção manual**: Pagamento aprovado → Webhook → Status "pago" → Botão "Agendar Aulas" aparece

---

## 📞 Suporte e Recursos

### **🔍 Logs e Debug**
- **Frontend**: F12 → Console
- **Backend**: [Supabase Functions Logs](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions)
- **Banco**: [Supabase SQL Editor](https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/sql)

### **🧪 Testes Rápidos**
```bash
# Teste webhook (substitua por payment_id real)
curl -X POST "https://hnftxautmxviwrfuaosu.supabase.co/functions/v1/mercado-pago-reprocess" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "123456789"}'

# Teste conectividade Supabase
curl -I https://hnftxautmxviwrfuaosu.supabase.co/rest/v1/
```

### **📚 Links Úteis**
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu
- **Google Cloud Console**: https://console.cloud.google.com
- **Mercado Pago Developers**: https://www.mercadopago.com.br/developers

---

## 🏆 Critérios de Sucesso

### **✅ Sistema APROVADO se:**
- [ ] Login/logout funciona
- [ ] Pagamento MP → webhook → status "pago" → botão agendar (automático)
- [ ] Google Calendar sincroniza eventos
- [ ] RLS isola dados entre professores
- [ ] Admin vê dados globais
- [ ] Responsivo mobile/desktop

### **❌ Sistema REPROVADO se:**
- [ ] Requer marcação manual de pagamento
- [ ] Professor vê dados de outro
- [ ] Webhook não valida assinatura
- [ ] Erros JavaScript não tratados

---

## 🚀 Próximos Passos

1. **📖 Comece pela instalação**: [docs/INSTALL.md](./INSTALL.md)
2. **💬 Dúvidas?** Veja os troubleshooting neste arquivo
3. **🎯 Validação final**: [docs/QA_CHECKLIST.md](./QA_CHECKLIST.md)

---

## 📈 Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Frontend** | React + TypeScript | 18+ |
| **Build** | Vite | 5+ |
| **UI** | Tailwind CSS + shadcn/ui | Latest |
| **Backend** | Supabase (Postgres + Auth + Storage) | Latest |
| **Pagamentos** | Mercado Pago API | v1 |
| **Calendar** | Google Calendar API | v3 |
| **Deploy** | Vercel / Netlify / VPS | - |

---

🎉 **ClassPro está pronto para transformar a gestão de aulas de música!**

**Tempo total estimado**: 3-4 horas (instalação + configuração + testes + deploy)

---

*Última atualização: Janeiro 2025*