-- Create trigger to ensure professor profiles have default modules on login
CREATE OR REPLACE FUNCTION public.ensure_professor_modules_on_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if this is a professor role and modules are missing/empty
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.id AND role = 'professor'::app_role
  ) THEN
    -- Update professor profile with default modules if missing
    UPDATE professores 
    SET modules = COALESCE(modules, '{}') || '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'::jsonb
    WHERE user_id = NEW.id 
    AND (modules IS NULL OR modules = '{}' OR jsonb_typeof(modules) != 'object');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Remove old trigger if exists and create new one
DROP TRIGGER IF EXISTS ensure_professor_modules_on_auth_user_created ON auth.users;
CREATE TRIGGER ensure_professor_modules_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_professor_modules_on_login();

-- Also update existing professors who don't have modules set
UPDATE public.professores 
SET modules = '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'::jsonb
WHERE modules IS NULL OR modules = '{}' OR jsonb_typeof(modules) != 'object';