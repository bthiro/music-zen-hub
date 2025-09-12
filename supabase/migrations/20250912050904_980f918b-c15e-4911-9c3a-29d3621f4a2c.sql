-- Atualizar preços dos planos conforme especificado
UPDATE planos_professor SET preco_mensal = 0.00 WHERE nome = 'Gratuito';
UPDATE planos_professor SET preco_mensal = 97.00 WHERE nome = 'Mensal' OR nome = 'Básico' OR nome = 'Pro';
UPDATE planos_professor SET preco_mensal = 997.00 WHERE nome = 'Anual';

-- Inserir planos caso não existam
INSERT INTO planos_professor (nome, preco_mensal, limite_alunos, recursos, ativo) 
VALUES 
  ('Gratuito', 0.00, 3, '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": false, "ferramentas": true}', true),
  ('Mensal', 97.00, 50, '{"ia": true, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}', true),
  ('Anual', 997.00, 100, '{"ia": true, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}', true)
ON CONFLICT (nome) DO UPDATE SET 
  preco_mensal = EXCLUDED.preco_mensal,
  limite_alunos = EXCLUDED.limite_alunos,
  recursos = EXCLUDED.recursos;

-- Adicionar campos necessários para sistema de carência e gestão de planos
ALTER TABLE professores ADD COLUMN IF NOT EXISTS grace_period_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS plan_changed_by UUID REFERENCES auth.users(id);
ALTER TABLE professores ADD COLUMN IF NOT EXISTS plan_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE professores ADD COLUMN IF NOT EXISTS manual_plan_override BOOLEAN DEFAULT false;

-- Adicionar campo para rastrear alunos suspensos
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela para configuração administrativa do Mercado Pago
CREATE TABLE IF NOT EXISTS admin_mercado_pago_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS na tabela admin_mercado_pago_config
ALTER TABLE admin_mercado_pago_config ENABLE ROW LEVEL SECURITY;

-- Política para admin_mercado_pago_config
CREATE POLICY "Admins podem gerenciar configuração MP"
ON admin_mercado_pago_config
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());