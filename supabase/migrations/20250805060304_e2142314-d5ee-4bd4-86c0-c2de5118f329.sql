-- Create table to store integration configurations
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected', -- connected, disconnected, error, testing
  config_data JSONB DEFAULT '{}',
  last_test TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professor_id, integration_name)
);

-- Enable RLS
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professores podem ver próprias configurações" 
ON public.integration_configs 
FOR SELECT 
USING (professor_id IN ( SELECT professores.id
   FROM professores
  WHERE (professores.user_id = auth.uid())));

CREATE POLICY "Professores podem criar configurações" 
ON public.integration_configs 
FOR INSERT 
WITH CHECK (professor_id IN ( SELECT professores.id
   FROM professores
  WHERE (professores.user_id = auth.uid())));

CREATE POLICY "Professores podem atualizar próprias configurações" 
ON public.integration_configs 
FOR UPDATE 
USING (professor_id IN ( SELECT professores.id
   FROM professores
  WHERE (professores.user_id = auth.uid())));

CREATE POLICY "Professores podem deletar próprias configurações" 
ON public.integration_configs 
FOR DELETE 
USING (professor_id IN ( SELECT professores.id
   FROM professores
  WHERE (professores.user_id = auth.uid())));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_integration_configs_updated_at
BEFORE UPDATE ON public.integration_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();