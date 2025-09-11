-- Migração para perfis completos e segurança aprimorada
-- Adicionar colunas faltantes na tabela professores
ALTER TABLE public.professores 
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Criar view sanitizada para admins (emails mascarados)
CREATE OR REPLACE VIEW public.admin_pagamentos_view AS
SELECT 
  p.id,
  p.professor_id,
  p.aluno_id,
  a.nome as aluno_nome,
  -- Mascarar email do aluno (apenas primeiras 3 letras + ***@domain.com)
  CASE 
    WHEN a.email IS NOT NULL THEN 
      SUBSTRING(a.email FROM 1 FOR 3) || '***@' || SPLIT_PART(a.email, '@', 2)
    ELSE NULL 
  END as aluno_email_mascarado,
  prof.nome as professor_nome,
  -- Mascarar email do professor
  SUBSTRING(prof.email FROM 1 FOR 3) || '***@' || SPLIT_PART(prof.email, '@', 2) as professor_email_mascarado,
  p.valor,
  p.data_vencimento,
  p.data_pagamento,
  p.status,
  p.tipo_pagamento,
  p.descricao,
  p.forma_pagamento,
  -- Não expor dados sensíveis para admin
  NULL as mercado_pago_payment_id,
  NULL as link_pagamento,
  NULL as referencia_externa,
  p.created_at,
  p.updated_at
FROM public.pagamentos p
JOIN public.alunos a ON p.aluno_id = a.id
JOIN public.professores prof ON p.professor_id = prof.id;

-- RLS para a view (apenas admins)
ALTER VIEW public.admin_pagamentos_view SET (security_barrier = true);

-- Policy para view de admin
CREATE POLICY "Admins podem ver pagamentos sanitizados" 
ON public.admin_pagamentos_view
FOR SELECT 
USING (is_admin());

-- Fortalecer RLS em integration_configs por professor
DROP POLICY IF EXISTS "Professores podem gerenciar suas integrações" ON public.integration_configs;

CREATE POLICY "Professores podem gerenciar suas integrações isoladas" 
ON public.integration_configs
FOR ALL 
USING (
  professor_id IN (
    SELECT id FROM public.professores 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  professor_id IN (
    SELECT id FROM public.professores 
    WHERE user_id = auth.uid()
  )
);

-- Fortalecer isolamento em pagamentos
DROP POLICY IF EXISTS "Professores podem gerenciar seus pagamentos" ON public.pagamentos;

CREATE POLICY "Professores podem gerenciar apenas seus pagamentos" 
ON public.pagamentos
FOR ALL 
USING (
  professor_id IN (
    SELECT id FROM public.professores 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  professor_id IN (
    SELECT id FROM public.professores 
    WHERE user_id = auth.uid()
  )
);

-- Audit log para mudanças de integração
CREATE OR REPLACE FUNCTION public.log_integration_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('integracao_conectada', 'integration_configs', NEW.id, 
      json_build_object(
        'integration_name', NEW.integration_name,
        'professor_id', NEW.professor_id,
        'status', NEW.status
      ));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit('integracao_alterada', 'integration_configs', NEW.id,
      json_build_object(
        'integration_name', NEW.integration_name,
        'professor_id', NEW.professor_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      ));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para audit de integrações
DROP TRIGGER IF EXISTS integration_audit_trigger ON public.integration_configs;
CREATE TRIGGER integration_audit_trigger
  AFTER INSERT OR UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.log_integration_change();