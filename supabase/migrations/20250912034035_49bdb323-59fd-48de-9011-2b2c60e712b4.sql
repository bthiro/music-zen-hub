-- Fix final remaining security warnings: Complete search_path configuration for all functions
-- This resolves the last security warnings for database functions

CREATE OR REPLACE FUNCTION public.ensure_professor_modules_on_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.criar_pagamento_mensal()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    aluno_record RECORD;
BEGIN
    FOR aluno_record IN 
        SELECT * FROM public.alunos WHERE ativo = true
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM public.pagamentos 
            WHERE aluno_id = aluno_record.id 
            AND EXTRACT(MONTH FROM data_vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM data_vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) THEN
            INSERT INTO public.pagamentos (
                professor_id,
                aluno_id,
                valor,
                data_vencimento,
                status
            ) VALUES (
                aluno_record.professor_id,
                aluno_record.id,
                COALESCE(aluno_record.valor_mensalidade, 200.00),
                DATE_TRUNC('month', CURRENT_DATE) + 
                    (COALESCE(aluno_record.dia_vencimento, 5) - 1 || ' days')::INTERVAL,
                'pendente'
            );
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.criar_cobranca_professor_mensal()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    professor_record RECORD;
    plano_preco NUMERIC;
    competencia_atual TEXT;
BEGIN
    competencia_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    
    FOR professor_record IN 
        SELECT p.*, pp.preco_mensal
        FROM public.professores p 
        LEFT JOIN public.planos_professor pp ON pp.nome = p.plano
        WHERE p.status = 'ativo'
    LOOP
        -- Use plan price or fallback
        plano_preco := COALESCE(professor_record.preco_mensal, 49.90);
        
        -- Only create if doesn't exist for this month
        IF NOT EXISTS (
            SELECT 1 FROM public.cobrancas_professor 
            WHERE professor_id = professor_record.id 
            AND competencia = competencia_atual
        ) THEN
            INSERT INTO public.cobrancas_professor (
                professor_id,
                plano_nome, 
                competencia,
                valor,
                data_vencimento,
                status,
                descricao
            ) VALUES (
                professor_record.id,
                professor_record.plano,
                competencia_atual,
                plano_preco,
                DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days', -- 5th of next month
                'pendente',
                'Assinatura ' || professor_record.plano || ' - ' || competencia_atual
            );
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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