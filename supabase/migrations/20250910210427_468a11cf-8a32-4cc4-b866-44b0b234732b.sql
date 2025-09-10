-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_evento TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Admins podem gerenciar webhook events"
ON public.webhook_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_id_evento ON public.webhook_events(id_evento);
CREATE INDEX IF NOT EXISTS idx_webhook_events_tipo ON public.webhook_events(tipo);

-- Add missing columns to pagamentos table if they don't exist
ALTER TABLE public.pagamentos 
ADD COLUMN IF NOT EXISTS eligible_to_schedule BOOLEAN DEFAULT false;

-- Update eligible_to_schedule for existing paid payments
UPDATE public.pagamentos 
SET eligible_to_schedule = true 
WHERE status = 'pago';

-- Create function to automatically set eligible_to_schedule when payment becomes paid
CREATE OR REPLACE FUNCTION public.update_schedule_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    -- When payment status changes to 'pago', enable scheduling
    IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
        NEW.eligible_to_schedule = true;
    END IF;
    
    -- When payment status changes away from 'pago', disable scheduling
    IF NEW.status != 'pago' AND OLD.status = 'pago' THEN
        NEW.eligible_to_schedule = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic schedule eligibility
DROP TRIGGER IF EXISTS trigger_update_schedule_eligibility ON public.pagamentos;
CREATE TRIGGER trigger_update_schedule_eligibility
    BEFORE UPDATE ON public.pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_schedule_eligibility();