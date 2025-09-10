-- Criar tabela de configurações do professor
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL,
  fuso_horario TEXT DEFAULT 'America/Sao_Paulo',
  chave_pix TEXT,
  link_pagamento TEXT,
  mensagem_cobranca TEXT DEFAULT 'Olá {ALUNO}! 😊

📋 *Lembrete de Pagamento*
• Período: {PERIODO}
• Valor: R$ {VALOR}
• Vencimento: {VENCIMENTO}

💳 *Formas de Pagamento:*
🔸 *PIX:* {PIX}
🔸 *Cartão:* {LINK_PAGAMENTO}

Qualquer dúvida, estou à disposição!
Obrigado(a) pela confiança! 🎵',
  notificacoes_push BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professor_id)
);

-- Enable RLS
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professores podem gerenciar suas configurações" 
ON public.configuracoes 
FOR ALL
USING (professor_id IN ( SELECT professores.id
   FROM professores
  WHERE (professores.user_id = auth.uid())));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_configuracoes_updated_at
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();