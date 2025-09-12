-- Add foreign key constraint between cobrancas_professor and professores tables
ALTER TABLE public.cobrancas_professor 
ADD CONSTRAINT fk_cobrancas_professor_professores 
FOREIGN KEY (professor_id) 
REFERENCES public.professores(id) 
ON DELETE CASCADE;