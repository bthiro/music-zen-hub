-- Add new columns to professores table for enhanced profile management
ALTER TABLE public.professores 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS pix_key TEXT,
ADD COLUMN IF NOT EXISTS billing_text TEXT DEFAULT 'Olá {ALUNO}! 😊

📋 *Lembrete de Pagamento*
• Período: {PERIODO}
• Valor: R$ {VALOR}
• Vencimento: {VENCIMENTO}

💳 *Formas de Pagamento:*
🔸 *PIX:* {PIX}
🔸 *Cartão:* {LINK_PAGAMENTO}

Qualquer dúvida, estou à disposição!
Obrigado(a) pela confiança! 🎵',
ADD COLUMN IF NOT EXISTS payment_preference JSONB DEFAULT '{"auto_mercado_pago": true, "manual_marking": true, "pix_enabled": true}'::jsonb;

-- Add google_event_id and meet_link to aulas table if not exists
ALTER TABLE public.aulas 
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS meet_link TEXT;

-- Create index for better performance on google_event_id lookups
CREATE INDEX IF NOT EXISTS idx_aulas_google_event_id ON public.aulas (google_event_id);

-- Add manual payment tracking fields to pagamentos
ALTER TABLE public.pagamentos 
ADD COLUMN IF NOT EXISTS manual_payment_reason TEXT,
ADD COLUMN IF NOT EXISTS manual_payment_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS manual_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_precedence TEXT DEFAULT 'automatic' CHECK (payment_precedence IN ('automatic', 'manual', 'refunded', 'cancelled', 'chargeback'));

-- Update RLS policies for professores to allow self-updates
CREATE POLICY IF NOT EXISTS "Professores podem atualizar avatar e configurações"
ON public.professores
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure configuracoes table exists with proper structure
CREATE TABLE IF NOT EXISTS public.configuracoes_professor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
    pix_key TEXT,
    payment_link TEXT,
    billing_message TEXT,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(professor_id)
);

-- Enable RLS on configuracoes_professor
ALTER TABLE public.configuracoes_professor ENABLE ROW LEVEL SECURITY;

-- RLS policies for configuracoes_professor
CREATE POLICY "Professores podem gerenciar suas configurações próprias"
ON public.configuracoes_professor
FOR ALL
USING (professor_id IN (
    SELECT id FROM public.professores WHERE user_id = auth.uid()
));

CREATE POLICY "Admins podem ver todas configurações"
ON public.configuracoes_professor
FOR SELECT
USING (is_admin());

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_configuracoes_professor_updated_at
    BEFORE UPDATE ON public.configuracoes_professor
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update audit log for manual payments
INSERT INTO public.audit_log (actor_user_id, action, entity, metadata) 
VALUES (auth.uid(), 'migration_executed', 'professor_enhancement', '{"version": "2024_professor_profile_and_payments", "features": ["avatar", "pix_key", "billing_text", "payment_preferences", "manual_payments", "configuracoes_professor"]}')
ON CONFLICT DO NOTHING;