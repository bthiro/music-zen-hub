-- Fase 1: Corrigir funções do banco de dados para evitar duplicatas

-- 1. Recriar função handle_new_user com proteção contra duplicatas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir no professores apenas se não existir
  INSERT INTO public.professores (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- 2. Recriar função create_first_admin com proteção contra duplicatas
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_count INTEGER;
BEGIN
    -- Conta quantos usuários existem
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    -- Se for o primeiro usuário, torna-o admin
    IF user_count = 1 THEN
        -- Inserir role apenas se não existir
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Inserir no professores apenas se não existir
        INSERT INTO public.professores (user_id, nome, email, status)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
            NEW.email,
            'ativo'
        )
        ON CONFLICT (user_id) DO UPDATE SET
          nome = EXCLUDED.nome,
          email = EXCLUDED.email,
          status = 'ativo';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 3. Dropar policies existentes de user_roles que causam recursão
DROP POLICY IF EXISTS "Admins podem gerenciar todas as roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias roles" ON public.user_roles;

-- 4. Recriar policies usando função has_role para evitar recursão
CREATE POLICY "Usuarios podem ver suas proprias roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todas as roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Garantir que a função has_role funciona corretamente
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;