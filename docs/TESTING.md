# Guia de Testes - Music Zen Hub

## Rotas e Navegação

### **Admin Routes** (`/admin/*`)
✅ Deve estar logado como admin

- `/admin/` - Dashboard administrativo
- `/admin/professores` - Gerenciar professores (criar, editar, suspender)
- `/admin/professores/novo` - Formulário criação de professor
- `/admin/pagamentos` - Visão global de pagamentos
- `/admin/alunos` - Visão global de alunos por professor
- `/admin/configuracoes` - Configurações do sistema

### **Professor Routes** (`/app/*`)
✅ Deve estar logado como professor ativo

- `/app/` - Dashboard do professor
- `/app/alunos` - Gerenciar próprios alunos
- `/app/pagamentos` - Pagamentos dos próprios alunos (requer módulo)
- `/app/aulas` - Agenda e aulas (requer módulo)
- `/app/agenda` - Mesma funcionalidade que aulas
- `/app/relatorios` - Relatórios (requer módulo dashboard)
- `/app/configuracoes` - Configurações pessoais
- `/app/ferramentas` - Ferramentas (requer módulo)
- `/app/ferramentas/lousa` - Lousa digital (requer módulo lousa)
- `/app/lousa` - Mesma funcionalidade que ferramentas/lousa
- `/app/ia-musical` - IA Musical (requer módulo ia)
- `/app/ia` - Mesma funcionalidade que ia-musical
- `/app/sessao-ao-vivo` - Sessão ao vivo (requer módulo agenda)
- `/app/materiais` - Materiais didáticos (requer módulo)

### **Públicas**
- `/auth` - Login e cadastro
- `/auth/google/callback` - Callback OAuth Google

## Teste de Criação de Professor (Admin)

### Pré-requisitos
1. Estar logado como admin
2. Configurar URLs no Supabase e Google Console

### Roteiro de Teste
1. **Navegar para Admin → Professores**
2. **Clicar "Novo Professor"**
3. **Preencher formulário:**
   - Nome: "Professor Teste"
   - Email: "teste@exemplo.com"
   - Telefone: "11999999999" (opcional)
   - Plano: "basico" ou "premium"
   - Limite de alunos: 50

4. **Clicar "Criar Professor"**
5. **Verificar toast de sucesso**
6. **Verificar professor na lista**

### Validações Esperadas
- ✅ Toast: "Professor criado com sucesso!"
- ✅ Email enviado ao professor (se configurado)
- ✅ Professor aparece na lista
- ✅ Status "ativo"
- ✅ Módulos corretos baseados no plano

## Teste de Navegação por Módulos

### Como Professor
1. **Login como professor**
2. **Verificar sidebar:**
   - Itens habilitados devem aparecer
   - Itens desabilitados não devem aparecer
3. **Clicar em cada item disponível:**
   - Deve navegar sem erro 404
   - Deve carregar a página correta
4. **Tentar acessar rota desabilitada manualmente:**
   - Deve mostrar "Acesso Restrito"

### Como Admin
1. **Login como admin**
2. **Verificar sidebar com ícone admin**
3. **Clicar em cada item:**
   - Todos devem funcionar
   - Não deve haver erro 404

## Teste de Configuração OAuth

### Supabase Auth URLs
- Site URL: `https://preview--music-zen-hub.lovable.app`
- Redirect URLs: `https://preview--music-zen-hub.lovable.app/auth/google/callback`

### Google Console URLs
- Authorized JavaScript origins: `https://preview--music-zen-hub.lovable.app`
- Authorized redirect URIs: `https://preview--music-zen-hub.lovable.app/auth/google/callback`

### Teste de Login Google
1. **Ir para `/auth`**
2. **Clicar "Continuar com Google"**
3. **Completar fluxo OAuth**
4. **Verificar redirecionamento:**
   - Admin → `/admin`
   - Professor → `/app`

## RCA (Root Cause Analysis)

### Problemas Identificados e Corrigidos

#### 1. **Rotas 404**
**Causa:** AppSidebar usava rotas como `/alunos`, `/pagamentos` mas App.tsx só tinha `/admin/*` e `/app/*`
**Correção:** Criado AdminRouter e ProfessorRouter com estrutura de subrotas

#### 2. **Criar Professor Falhava**
**Causa:** Tentativa de inserir direto na tabela sem criar usuário no auth.users
**Correção:** Edge function `admin-create-professor` com Supabase Admin API

#### 3. **Admin sem Acesso Global**
**Causa:** RLS policies só permitiam acesso baseado em professor_id
**Correção:** Função `is_admin()` e policies globais para admin

#### 4. **Links Inconsistentes**
**Causa:** Sidebar não diferenciava contexto admin vs professor
**Correção:** Sidebar contextual baseado no role do usuário

## Checklist de Validação Final

- [ ] Login Google funciona na URL da Lovable
- [ ] Admin consegue criar professor via edge function
- [ ] Admin acessa visão global (alunos/pagamentos)
- [ ] Professor acessa apenas próprios dados
- [ ] Navegação sem erros 404
- [ ] Módulos respeitam permissões
- [ ] Redirecionamentos corretos por role
- [ ] RLS policies funcionando (admin vs professor)

## Scripts de Teste Automatizado

```bash
# Validar rotas existem (sem autenticação)
curl -I https://preview--music-zen-hub.lovable.app/admin
curl -I https://preview--music-zen-hub.lovable.app/app
curl -I https://preview--music-zen-hub.lovable.app/auth

# Teste edge function (requer auth token)
# Ver logs em: https://supabase.com/dashboard/project/hnftxautmxviwrfuaosu/functions/admin-create-professor/logs
```

## Próximos Passos
1. Configurar URLs no Supabase e Google Console
2. Testar login Google end-to-end
3. Testar criação de professor
4. Validar navegação completa
5. Documentar qualquer issue encontrado