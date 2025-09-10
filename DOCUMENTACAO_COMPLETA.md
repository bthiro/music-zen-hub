# 📚 Documentação Completa - Sistema de Aulas Particulares

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Funcionalidades](#funcionalidades)
5. [Arquitetura do Projeto](#arquitetura-do-projeto)
6. [Instalação e Configuração](#instalação-e-configuração)
7. [Edge Functions](#edge-functions)
8. [Integrações](#integrações)
9. [Design System](#design-system)
10. [Segurança](#segurança)
11. [Desenvolvimento](#desenvolvimento)

---

## 🎯 Visão Geral

Sistema completo para gestão de aulas particulares, permitindo controle de alunos, agendamento de aulas, gestão de pagamentos e integração com Google Calendar e Mercado Pago.

### Características Principais:
- **Multi-tenant**: Suporte a múltiplos professores
- **Responsivo**: Interface adaptada para desktop, tablet e mobile
- **Tema Escuro**: Suporte completo a dark/light mode
- **Integração Completa**: Google Calendar, Mercado Pago, WhatsApp
- **Ferramentas Educacionais**: Lousa digital, metrônomo, IA musical

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Sistema de estilos
- **shadcn/ui** - Componentes UI

### Backend/Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança de dados
- **Edge Functions** - Processamento server-side

### Integrações
- **Google Calendar API** - Sincronização de calendário
- **Mercado Pago API** - Processamento de pagamentos
- **OpenAI API** - Inteligência artificial musical
- **WhatsApp Web API** - Notificações

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Fabric.js** - Canvas para lousa digital
- **React Hook Form** - Formulários
- **Date-fns** - Manipulação de datas
- **Zod** - Validação de schemas

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `professores`
```sql
- id (uuid, PK)
- user_id (uuid, FK auth.users)
- nome (text)
- email (text)
- telefone (text)
- avatar_url (text)
- bio (text)
- especialidades (text)
- plano (varchar) - 'basico', 'premium'
- status (text) - 'ativo', 'inativo'
- limite_alunos (integer)
- config_calendario (jsonb)
- created_at, updated_at
```

#### `alunos`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- nome (text)
- email (text)
- telefone (text)
- data_nascimento (date)
- endereco (text)
- instrumento (text)
- nivel (text)
- valor_mensalidade (numeric)
- dia_vencimento (integer)
- duracao_aula (integer)
- tipo_cobranca (text)
- responsavel_nome (varchar)
- responsavel_telefone (varchar)
- observacoes (text)
- ativo (boolean)
- created_at, updated_at
```

#### `aulas`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- aluno_id (uuid, FK)
- data_hora (timestamptz)
- duracao_minutos (integer)
- status (text) - 'agendada', 'realizada', 'cancelada'
- tema (text)
- materiais (jsonb)
- feedback (text)
- presenca (boolean)
- link_meet (text)
- meet_id (varchar)
- created_at, updated_at
```

#### `pagamentos`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- aluno_id (uuid, FK)
- aula_id (uuid, FK) - nullable
- valor (numeric)
- data_vencimento (date)
- data_pagamento (date) - nullable
- status (text) - 'pendente', 'pago', 'atrasado'
- tipo_pagamento (text) - 'mensal', 'avulso'
- forma_pagamento (text)
- descricao (text)
- referencia_externa (text)
- link_pagamento (text)
- mercado_pago_payment_id (text)
- mercado_pago_status (text)
- created_at, updated_at
```

#### `configuracoes`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- fuso_horario (text)
- chave_pix (text)
- link_pagamento (text)
- mensagem_cobranca (text)
- notificacoes_push (boolean)
- created_at, updated_at
```

#### `integration_configs`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- integration_name (text)
- config_data (jsonb)
- status (text) - 'connected', 'disconnected'
- last_test (timestamptz)
- created_at, updated_at
```

#### `mensagens_enviadas`
```sql
- id (uuid, PK)
- professor_id (uuid, FK)
- aluno_id (uuid, FK)
- tipo_mensagem (text)
- conteudo (text)
- status (text)
- referencia_externa (text)
- data_envio (timestamptz)
```

#### `user_roles`
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- role (app_role) - 'admin', 'professor'
- created_at
```

### Funções do Banco

#### `criar_pagamento_mensal()`
Cria automaticamente pagamentos mensais para alunos ativos baseado no valor da mensalidade e dia de vencimento.

#### `handle_new_user()`
Trigger que cria automaticamente um registro de professor quando um novo usuário se cadastra.

#### `has_role(user_id, role)`
Verifica se um usuário possui uma determinada role.

#### `prevent_direct_signup()`
Previne cadastro direto, permitindo apenas se for o primeiro admin ou se um admin estiver criando.

---

## ⚡ Funcionalidades

### 📊 Dashboard
- **Estatísticas em Tempo Real**: Total de alunos, receita do mês, aulas agendadas
- **Aulas do Dia**: Lista das aulas agendadas para hoje
- **Próximas Aulas**: Visualização das próximas 3 aulas
- **Pagamentos Pendentes**: Alertas de pagamentos em atraso
- **Integração Google Calendar**: Visualização e sincronização

### 👥 Gestão de Alunos
- **CRUD Completo**: Criar, editar, visualizar e excluir alunos
- **Dados Completos**: Informações pessoais, responsáveis, instrumento
- **Configurações de Pagamento**: Valor da mensalidade, dia de vencimento
- **Status de Atividade**: Controle de alunos ativos/inativos
- **Histórico**: Aulas realizadas e pagamentos

### 📅 Agendamento de Aulas
- **Calendário Interativo**: Interface visual para agendamento
- **Reagendamento em Lote**: Mover múltiplas aulas
- **Status de Aulas**: Agendada, realizada, cancelada
- **Google Meet**: Geração automática de links
- **Materiais e Feedback**: Registro de conteúdo das aulas

### 💰 Gestão Financeira
- **Pagamentos Automáticos**: Criação mensal automática
- **Múltiplas Formas**: PIX, cartão, dinheiro
- **Mercado Pago**: Integração completa para pagamentos online
- **Relatórios**: Dashboards financeiros e contábeis
- **Cobrança**: Mensagens automáticas via WhatsApp

### 🎵 Ferramentas Educacionais
- **Lousa Digital**: Canvas interativo com Fabric.js
- **Metrônomo**: Ferramenta de tempo musical
- **IA Musical**: Assistente para composição e teoria
- **Sessão ao Vivo**: Ambiente para aulas online

### 🔧 Configurações
- **Perfil do Professor**: Dados pessoais e profissionais
- **Métodos de Pagamento**: PIX e links de pagamento
- **Integrações**: Google Calendar, Mercado Pago
- **Notificações**: Configurações de alertas
- **Tema**: Alternância entre claro e escuro

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn)
│   ├── dialogs/         # Modais e diálogos
│   ├── forms/           # Formulários específicos
│   ├── reports/         # Componentes de relatórios
│   └── timezone/        # Conversão de fuso horário
├── contexts/            # Contextos React
│   ├── AppContext.tsx   # Estado global da aplicação
│   └── ThemeContext.tsx # Controle de tema
├── hooks/               # Custom hooks
│   ├── useAlunos.ts     # Gestão de alunos
│   ├── useAulas.ts      # Gestão de aulas
│   ├── usePagamentos.ts # Gestão de pagamentos
│   └── useGoogleCalendar.ts # Integração calendário
├── integrations/        # Integrações externas
│   └── supabase/        # Cliente e tipos Supabase
├── pages/               # Páginas da aplicação
├── lib/                 # Utilitários
└── data/               # Dados estáticos
```

### Padrões de Código

#### Context + Custom Hooks
```typescript
// AppContext.tsx - Estado global
export function AppProvider({ children }: { children: ReactNode }) {
  const alunosHook = useAlunos();
  const aulasHook = useAulas();
  const pagamentosHook = usePagamentos();
  
  return (
    <AppContext.Provider value={{
      // ... combined state
    }}>
      {children}
    </AppContext.Provider>
  );
}

// useAlunos.ts - Lógica específica
export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAlunos = async () => {
    // Supabase queries with RLS
  };
  
  return { alunos, addAluno, updateAluno, deleteAluno, loading };
}
```

#### Componentes com Variants
```typescript
// Usando class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
)
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase
- Contas para integrações (Google, Mercado Pago)

### Configuração Local

1. **Clone o repositório**
```bash
git clone <repo-url>
cd projeto-aulas-particulares
```

2. **Instale dependências**
```bash
npm install
```

3. **Configure variáveis de ambiente**
```bash
# .env
VITE_SUPABASE_URL=https://hnftxautmxviwrfuaosu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Execute o projeto**
```bash
npm run dev
```

### Scripts de Desenvolvimento

#### Windows
```batch
# scripts/dev-start.bat
@echo off
echo Iniciando servidor de desenvolvimento...
start "Browser" http://localhost:5173
npm run dev
```

#### Linux/Mac
```bash
# scripts/dev-start.sh
#!/bin/bash
echo "Iniciando servidor de desenvolvimento..."
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null || echo "Abra http://localhost:5173 no navegador"
npm run dev
```

---

## 🔌 Edge Functions

### Estrutura
```
supabase/functions/
├── google-calendar/     # Sincronização calendário
├── google-oauth/        # Autenticação Google
├── ia-musical/          # IA para música
└── mercado-pago/        # Processamento pagamentos
```

### google-calendar
```typescript
// Sincronização bidirecional com Google Calendar
serve(async (req) => {
  const { action, events } = await req.json();
  
  switch (action) {
    case 'sync':
      // Sincronizar eventos
    case 'create':
      // Criar evento no Google
    case 'update':
      // Atualizar evento
  }
});
```

### mercado-pago
```typescript
// Criação de pagamentos e webhooks
serve(async (req) => {
  const { amount, description, external_reference } = await req.json();
  
  const payment = await mercadopago.preferences.create({
    items: [{
      title: description,
      unit_price: amount,
      quantity: 1,
    }],
    external_reference,
    notification_url: webhook_url,
  });
  
  return new Response(JSON.stringify(payment));
});
```

### ia-musical
```typescript
// Assistente musical com OpenAI
serve(async (req) => {
  const { prompt, context = 'music_theory' } = await req.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Você é um assistente musical especializado..." },
      { role: "user", content: prompt }
    ],
  });
  
  return new Response(JSON.stringify(completion));
});
```

---

## 🔗 Integrações

### Google Calendar
- **OAuth 2.0**: Autenticação segura
- **Sync Bidirecional**: Eventos criados no app aparecem no Google
- **Webhook**: Atualizações em tempo real
- **Fuso Horário**: Conversão automática

### Mercado Pago
- **Preference API**: Criação de pagamentos
- **Webhook**: Notificações de status
- **PIX**: Pagamentos instantâneos
- **Cartão**: Processamento seguro

### WhatsApp (Planejado)
- **Web API**: Envio de mensagens
- **Templates**: Mensagens de cobrança
- **Status**: Confirmação de entrega

---

## 🎨 Design System

### Cores Principais
```css
:root {
  /* Brand */
  --primary: 247 73% 57%;        /* Purple-blue */
  --primary-hover: 247 73% 52%;
  --primary-light: 247 73% 90%;
  
  /* Status */
  --success: 142 76% 36%;        /* Green */
  --warning: 38 92% 50%;         /* Orange */
  --destructive: 0 72% 51%;      /* Red */
  
  /* Neutral */
  --background: 0 0% 98%;
  --foreground: 224 15% 8%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 8% 46%;
}
```

### Componentes Customizados
```css
/* Cartões modernos */
.card-modern {
  @apply bg-gradient-to-br from-card to-card/80 shadow-lg border-0 backdrop-blur-sm;
}

/* Botões com gradiente */
.btn-primary {
  @apply bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02];
}

/* Status indicators */
.status-active {
  @apply bg-success/10 text-success border border-success/20;
}
```

### Responsividade
- **Mobile First**: Design adaptado para mobile
- **Breakpoints**: xs(475px), sm(640px), md(768px), lg(1024px), xl(1280px)
- **Touch Friendly**: Botões com mínimo 44px em mobile

---

## 🔐 Segurança

### Row Level Security (RLS)
Todas as tabelas implementam RLS baseado em `professor_id`:

```sql
-- Exemplo: Política para alunos
CREATE POLICY "Professores podem ver seus próprios alunos" 
ON public.alunos 
FOR SELECT 
USING (professor_id IN (
  SELECT professores.id
  FROM professores
  WHERE professores.user_id = auth.uid()
));
```

### Autenticação
- **Supabase Auth**: Sistema robusto de autenticação
- **JWT Tokens**: Tokens seguros com refresh automático
- **Roles**: Sistema de permissões (admin, professor)

### Validação
- **Frontend**: Zod schemas para validação de formulários
- **Backend**: Validação nas Edge Functions
- **Database**: Constraints e triggers de validação

---

## 🛠️ Desenvolvimento

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev              # Inicia servidor local
npm run build           # Build para produção
npm run build:dev       # Build para desenvolvimento
npm run lint            # Linting do código
npm run preview         # Preview do build

# Supabase (se configurado localmente)
supabase start          # Inicia Supabase local
supabase db reset       # Reset do banco
supabase gen types      # Gera tipos TypeScript
```

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

### Debugging
- **Console Logs**: Disponíveis via Lovable
- **Network Requests**: Monitoramento em tempo real
- **Supabase Dashboard**: Logs das Edge Functions
- **Browser DevTools**: Debugging completo

### Padrões de Código
- **TypeScript**: Tipagem forte obrigatória
- **ESLint**: Regras de linting configuradas
- **Componentes**: Pequenos e reutilizáveis
- **Hooks**: Lógica isolada em custom hooks
- **Performance**: React.memo e useMemo quando necessário

---

## 📈 Estado Atual do Projeto

### ✅ Implementado
- [x] Sistema completo de autenticação
- [x] CRUD de alunos, aulas e pagamentos
- [x] Dashboard com estatísticas
- [x] Integração Google Calendar
- [x] Processamento Mercado Pago
- [x] Tema escuro/claro
- [x] Design responsivo
- [x] Lousa digital
- [x] Metrônomo e ferramentas
- [x] IA Musical
- [x] Sistema de relatórios
- [x] Persistência no Supabase

### 🚧 Em Desenvolvimento
- [ ] Notificações WhatsApp
- [ ] App mobile (PWA)
- [ ] Backup automático
- [ ] Analytics avançado

### 🔮 Roadmap
- [ ] Multi-idiomas
- [ ] Integração Zoom
- [ ] Sistema de avaliações
- [ ] Gamificação para alunos
- [ ] API pública

---

## 📞 Suporte

### Documentação Técnica
- **Supabase**: https://supabase.com/docs
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com

### Logs e Monitoramento
- **Supabase Dashboard**: Logs das funções e banco
- **Browser Console**: Debugging frontend
- **Network Tab**: Requisições HTTP

---

*Documentação gerada em: 10 de Janeiro de 2025*
*Versão do Sistema: v1.0.0*
*Última atualização: Implementação de persistência Supabase e tema escuro*