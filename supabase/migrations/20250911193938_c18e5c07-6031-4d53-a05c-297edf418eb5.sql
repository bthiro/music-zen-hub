-- Migração para perfis completos e segurança aprimorada
-- Adicionar colunas faltantes na tabela professores
ALTER TABLE public.professores 
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Fortalecer RLS em integration_configs por professor (remover policy duplicada)
DROP POLICY IF EXISTS "Professores podem gerenciar suas integrações" ON public.integration_configs;
DROP POLICY IF EXISTS "Professores podem gerenciar suas integrações isoladas" ON public.integration_configs;

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

-- Fortalecer isolamento em pagamentos (remover policy duplicada)
DROP POLICY IF EXISTS "Professores podem gerenciar seus pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Professores podem gerenciar apenas seus pagamentos" ON public.pagamentos;

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