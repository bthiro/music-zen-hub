-- Fase 2: Criar função helper is_admin e ajustar RLS policies para admin

-- 1. Criar função helper para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$$;

-- 2. Atualizar RLS policies para dar acesso global ao admin

-- Policies para tabela alunos
DROP POLICY IF EXISTS "Admins podem gerenciar todos alunos" ON public.alunos;
CREATE POLICY "Admins podem gerenciar todos alunos"
ON public.alunos
FOR ALL
TO authenticated
USING (public.is_admin());

-- Policies para tabela aulas  
DROP POLICY IF EXISTS "Admins podem gerenciar todas aulas" ON public.aulas;
CREATE POLICY "Admins podem gerenciar todas aulas"
ON public.aulas
FOR ALL
TO authenticated
USING (public.is_admin());

-- Policies para tabela pagamentos
DROP POLICY IF EXISTS "Admins podem gerenciar todos pagamentos" ON public.pagamentos;
CREATE POLICY "Admins podem gerenciar todos pagamentos"
ON public.pagamentos
FOR ALL
TO authenticated
USING (public.is_admin());

-- Policies para tabela configuracoes
DROP POLICY IF EXISTS "Admins podem gerenciar todas configurações" ON public.configuracoes;
CREATE POLICY "Admins podem gerenciar todas configurações"
ON public.configuracoes
FOR ALL
TO authenticated
USING (public.is_admin());

-- Policies para tabela integration_configs
DROP POLICY IF EXISTS "Admins podem gerenciar todas integrações" ON public.integration_configs;
CREATE POLICY "Admins podem gerenciar todas integrações"
ON public.integration_configs
FOR ALL
TO authenticated
USING (public.is_admin());

-- Policies para tabela mensagens_enviadas
DROP POLICY IF EXISTS "Admins podem gerenciar todas mensagens" ON public.mensagens_enviadas;
CREATE POLICY "Admins podem gerenciar todas mensagens"
ON public.mensagens_enviadas
FOR ALL
TO authenticated
USING (public.is_admin());