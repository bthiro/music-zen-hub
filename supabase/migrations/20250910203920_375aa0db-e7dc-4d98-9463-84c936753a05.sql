-- Criar enum para roles se não existir
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'professor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar tabela user_roles para usar o enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role USING role::public.app_role;

-- Adicionar colunas faltantes na tabela professores
ALTER TABLE public.professores 
ADD COLUMN IF NOT EXISTS modules jsonb NOT NULL DEFAULT '{"dashboard":true,"ia":false,"ferramentas":true,"agenda":true,"pagamentos":true,"materiais":true,"lousa":true}'::jsonb;

-- Atualizar constraint de status na tabela professores
ALTER TABLE public.professores 
DROP CONSTRAINT IF EXISTS professores_status_check;

ALTER TABLE public.professores 
ADD CONSTRAINT professores_status_check 
CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- Criar tabela audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Criar índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Habilitar RLS nas tabelas
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_log
CREATE POLICY "Admins podem ver todos os logs" ON public.audit_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Professores podem ver seus próprios logs" ON public.audit_log
FOR SELECT USING (actor_user_id = auth.uid());

-- Atualizar políticas RLS existentes para usar a função has_role
-- Professores - Admin vê tudo, professor vê apenas seu registro
DROP POLICY IF EXISTS "Admins podem gerenciar todos professores" ON public.professores;
CREATE POLICY "Admins podem gerenciar todos professores" ON public.professores
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- User roles - Admin vê tudo, usuário vê apenas suas roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins podem gerenciar todas as roles" ON public.user_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

CREATE POLICY "Usuários podem ver suas próprias roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Função para criar primeiro admin (se não existir nenhum usuário)
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Conta quantos usuários existem
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- Se for o primeiro usuário, torna-o admin
    IF user_count = 1 THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
        
        INSERT INTO public.professores (user_id, nome, email, status)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
            NEW.email,
            'ativo'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para criar primeiro admin
DROP TRIGGER IF EXISTS on_first_user_created ON auth.users;
CREATE TRIGGER on_first_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_first_admin();

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit(
    p_action text,
    p_entity text,
    p_entity_id uuid DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_log (actor_user_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_metadata);
END;
$$;