-- Criar plano gratuito na tabela planos_professor
INSERT INTO public.planos_professor (
  nome,
  preco_mensal,
  limite_alunos,
  ativo,
  recursos
) VALUES (
  'Gratuito',
  0.00,
  3,
  true,
  '{
    "agenda": true,
    "dashboard": true,
    "pagamentos_manuais": true,
    "materiais_basicos": true,
    "ia": false,
    "mercado_pago_automatico": false,
    "google_calendar": false
  }'::jsonb
) ON CONFLICT (nome) DO UPDATE SET
  preco_mensal = EXCLUDED.preco_mensal,
  limite_alunos = EXCLUDED.limite_alunos,
  recursos = EXCLUDED.recursos;

-- Atualizar professores existentes sem plano para usar o plano gratuito
UPDATE public.professores 
SET plano = 'Gratuito',
    limite_alunos = 3
WHERE plano IS NULL OR plano = '' OR plano = 'basico';

-- Criar função para verificar limite de alunos
CREATE OR REPLACE FUNCTION public.check_student_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_student_count INTEGER;
    professor_limit INTEGER;
BEGIN
    -- Contar alunos ativos do professor
    SELECT COUNT(*) INTO current_student_count
    FROM public.alunos 
    WHERE professor_id = NEW.professor_id AND ativo = true;
    
    -- Buscar limite do professor
    SELECT limite_alunos INTO professor_limit
    FROM public.professores 
    WHERE id = NEW.professor_id;
    
    -- Verificar se excede o limite
    IF current_student_count >= COALESCE(professor_limit, 3) THEN
        RAISE EXCEPTION 'Limite de alunos atingido para este plano. Faça upgrade para adicionar mais alunos.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar limite ao inserir aluno
DROP TRIGGER IF EXISTS student_limit_check ON public.alunos;
CREATE TRIGGER student_limit_check
    BEFORE INSERT ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.check_student_limit();

-- Criar tabela para métricas de conversão
CREATE TABLE IF NOT EXISTS public.conversion_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID REFERENCES public.professores(id),
    event_type TEXT NOT NULL, -- 'signup', 'first_login', 'first_student', 'limit_reached', 'upgrade_click'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de métricas
ALTER TABLE public.conversion_metrics ENABLE ROW LEVEL SECURITY;

-- Política para admin ver todas as métricas
CREATE POLICY "Admins podem ver todas métricas" 
ON public.conversion_metrics 
FOR ALL 
USING (is_admin());

-- Política para professores verem apenas suas métricas
CREATE POLICY "Professores podem ver suas métricas" 
ON public.conversion_metrics 
FOR SELECT 
USING (professor_id IN (
    SELECT id FROM public.professores 
    WHERE user_id = auth.uid()
));