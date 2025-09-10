-- Corrigir search_path para as funções criadas
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

-- Corrigir search_path para log_audit
CREATE OR REPLACE FUNCTION public.log_audit(
    p_action text,
    p_entity text,
    p_entity_id uuid DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_log (actor_user_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_metadata);
END;
$$;

-- Corrigir search_path para has_role (função existente)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;