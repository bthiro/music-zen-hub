-- Adicionar campos para Mercado Pago na tabela pagamentos
ALTER TABLE public.pagamentos 
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercado_pago_status TEXT,
ADD COLUMN IF NOT EXISTS tipo_pagamento TEXT DEFAULT 'mensal' CHECK (tipo_pagamento IN ('mensal', 'unico')),
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_mercado_pago_id ON public.pagamentos(mercado_pago_payment_id);

-- Adicionar campo de configuração do Mercado Pago para alunos
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS tipo_cobranca TEXT DEFAULT 'mensal' CHECK (tipo_cobranca IN ('mensal', 'aula_unica'));