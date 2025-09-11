-- Create professor plans table
CREATE TABLE public.planos_professor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  preco_mensal NUMERIC NOT NULL,
  limite_alunos INTEGER DEFAULT 20,
  recursos JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professor billing table  
CREATE TABLE public.cobrancas_professor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL,
  plano_nome TEXT,
  competencia TEXT NOT NULL, -- YYYY-MM format
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  descricao TEXT,
  link_pagamento TEXT,
  referencia_externa TEXT UNIQUE,
  mercado_pago_payment_id TEXT,
  mercado_pago_status TEXT,
  forma_pagamento TEXT,
  payment_precedence TEXT DEFAULT 'automatic',
  manual_payment_by UUID,
  manual_payment_at TIMESTAMP WITH TIME ZONE,
  manual_payment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_cobrancas_professor_id ON public.cobrancas_professor(professor_id);
CREATE INDEX idx_cobrancas_professor_competencia ON public.cobrancas_professor(professor_id, competencia);
CREATE INDEX idx_cobrancas_professor_status ON public.cobrancas_professor(status);

-- Add triggers for updated_at
CREATE TRIGGER update_planos_professor_updated_at
  BEFORE UPDATE ON public.planos_professor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cobrancas_professor_updated_at
  BEFORE UPDATE ON public.cobrancas_professor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.planos_professor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas_professor ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planos_professor
CREATE POLICY "Admins podem gerenciar planos" 
ON public.planos_professor 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Professores podem ver planos ativos" 
ON public.planos_professor 
FOR SELECT 
USING (ativo = true);

-- RLS Policies for cobrancas_professor
CREATE POLICY "Admins podem gerenciar todas cobrancas professor" 
ON public.cobrancas_professor 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Professores podem ver suas cobrancas" 
ON public.cobrancas_professor 
FOR SELECT 
USING (professor_id IN (
  SELECT professores.id 
  FROM professores 
  WHERE professores.user_id = auth.uid()
));

-- Insert default professor plans
INSERT INTO public.planos_professor (nome, preco_mensal, limite_alunos, recursos) VALUES 
  ('Básico', 49.90, 20, '{"dashboard": true, "agenda": true, "pagamentos": true}'),
  ('Premium', 99.90, 500, '{"dashboard": true, "agenda": true, "pagamentos": true, "ia": true, "lousa": true, "ferramentas": true, "materiais": true}');

-- Function to create monthly professor billing  
CREATE OR REPLACE FUNCTION public.criar_cobranca_professor_mensal()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;