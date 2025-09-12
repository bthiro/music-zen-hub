-- Fix security issue: Restrict planos_professor visibility
-- Only admins should see all plan details to prevent competitive information leakage

-- Drop the current public policy
DROP POLICY IF EXISTS "Professores podem ver planos ativos" ON public.planos_professor;

-- Create more restrictive policy - only admins can see all plans
CREATE POLICY "Apenas admins podem ver planos" 
ON public.planos_professor 
FOR SELECT 
USING (is_admin());

-- Professores can only see their own current plan details
CREATE POLICY "Professores podem ver detalhes do próprio plano" 
ON public.planos_professor 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.professores 
    WHERE professores.user_id = auth.uid() 
    AND professores.plano = planos_professor.nome
  )
);

-- Fix search_path for security functions
-- Update functions to use explicit search_path

-- Update log_audit function
CREATE OR REPLACE FUNCTION public.log_audit(p_action text, p_entity text, p_entity_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.audit_log (actor_user_id, action, entity, entity_id, metadata)
    VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_metadata);
END;
$function$;

-- Update is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;