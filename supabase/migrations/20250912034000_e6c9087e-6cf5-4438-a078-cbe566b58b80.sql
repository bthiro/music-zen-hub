-- Fix remaining security warnings: Set search_path for all remaining database functions
-- This completes the security hardening by preventing search_path manipulation

-- Fix trigger functions
CREATE OR REPLACE FUNCTION public.prevent_direct_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if this is an admin creating a teacher
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    -- Allow only if there are no users in the system (first admin)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      RAISE EXCEPTION 'Cadastro direto não permitido. Entre em contato com o administrador.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_first_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.ensure_professor_profile_on_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only process if this is a professor role
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.id AND role = 'professor'::app_role
  ) THEN
    -- Insert or update professor profile with default modules
    INSERT INTO professores (
      user_id, 
      nome, 
      email, 
      status,
      modules
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      'ativo',
      '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      modules = CASE 
        WHEN professores.modules IS NULL OR professores.modules = '{}' THEN EXCLUDED.modules
        ELSE professores.modules
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_schedule_eligibility()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    -- When payment status changes to 'pago', enable scheduling
    IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
        NEW.eligible_to_schedule = true;
    END IF;
    
    -- When payment status changes away from 'pago', disable scheduling
    IF NEW.status != 'pago' AND OLD.status = 'pago' THEN
        NEW.eligible_to_schedule = false;
    END IF;
    
    RETURN NEW;
END;
$function$;