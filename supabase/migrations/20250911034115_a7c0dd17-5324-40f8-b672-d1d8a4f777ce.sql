-- First check what constraints exist on pagamentos table
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'pagamentos'::regclass AND contype = 'c';

-- Fix the payment_precedence constraint that's causing issues
-- Remove the problematic constraint and replace with proper validation
ALTER TABLE pagamentos DROP CONSTRAINT IF EXISTS pagamentos_payment_precedence_check;

-- Add proper constraint for payment_precedence
ALTER TABLE pagamentos ADD CONSTRAINT pagamentos_payment_precedence_check 
CHECK (payment_precedence IN ('automatic', 'manual'));

-- Add missing columns to professores table if they don't exist
DO $$ 
BEGIN 
    -- Check and add avatar_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professores' AND column_name='avatar_url') THEN
        ALTER TABLE professores ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Check and add pix_key column  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professores' AND column_name='pix_key') THEN
        ALTER TABLE professores ADD COLUMN pix_key TEXT;
    END IF;
    
    -- Check and add billing_text column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professores' AND column_name='billing_text') THEN
        ALTER TABLE professores ADD COLUMN billing_text TEXT DEFAULT 'Olá {ALUNO}! 😊

📋 *Lembrete de Pagamento*
• Período: {PERIODO}
• Valor: R$ {VALOR}
• Vencimento: {VENCIMENTO}

💳 *Formas de Pagamento:*
🔸 *PIX:* {PIX}
🔸 *Cartão:* {LINK_PAGAMENTO}

Qualquer dúvida, estou à disposição!
Obrigado(a) pela confiança! 🎵';
    END IF;
    
    -- Check and add payment_preference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professores' AND column_name='payment_preference') THEN
        ALTER TABLE professores ADD COLUMN payment_preference JSONB DEFAULT '{"pix_enabled": true, "manual_marking": true, "auto_mercado_pago": true}'::jsonb;
    END IF;
END $$;