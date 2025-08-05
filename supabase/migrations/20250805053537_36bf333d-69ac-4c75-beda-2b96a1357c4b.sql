-- Criar tabela de professores
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  instrumento TEXT,
  nivel TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de aulas
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  tema TEXT,
  feedback TEXT,
  presenca BOOLEAN,
  status TEXT DEFAULT 'agendada', -- agendada, realizada, cancelada
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pagamentos
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  aula_id UUID REFERENCES public.aulas(id) ON DELETE SET NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, atrasado, cancelado
  forma_pagamento TEXT,
  referencia_externa TEXT, -- ID do gateway de pagamento
  link_pagamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de mensagens enviadas
CREATE TABLE public.mensagens_enviadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  tipo_mensagem TEXT NOT NULL, -- lembrete_aula, confirmacao_agendamento, agradecimento, lembrete_pagamento
  conteudo TEXT NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enviada', -- enviada, entregue, lida, erro
  referencia_externa TEXT -- ID da API do WhatsApp
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professores
CREATE POLICY "Professores podem ver próprio perfil" ON public.professores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Professores podem atualizar próprio perfil" ON public.professores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Criar perfil de professor" ON public.professores
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas RLS para alunos
CREATE POLICY "Professores podem ver próprios alunos" ON public.alunos
  FOR SELECT USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar alunos" ON public.alunos
  FOR INSERT WITH CHECK (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar próprios alunos" ON public.alunos
  FOR UPDATE USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem deletar próprios alunos" ON public.alunos
  FOR DELETE USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para aulas
CREATE POLICY "Professores podem ver próprias aulas" ON public.aulas
  FOR SELECT USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar aulas" ON public.aulas
  FOR INSERT WITH CHECK (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar próprias aulas" ON public.aulas
  FOR UPDATE USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem deletar próprias aulas" ON public.aulas
  FOR DELETE USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para pagamentos
CREATE POLICY "Professores podem ver próprios pagamentos" ON public.pagamentos
  FOR SELECT USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar pagamentos" ON public.pagamentos
  FOR INSERT WITH CHECK (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar próprios pagamentos" ON public.pagamentos
  FOR UPDATE USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para mensagens
CREATE POLICY "Professores podem ver próprias mensagens" ON public.mensagens_enviadas
  FOR SELECT USING (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar mensagens" ON public.mensagens_enviadas
  FOR INSERT WITH CHECK (
    professor_id IN (
      SELECT id FROM public.professores WHERE user_id = auth.uid()
    )
  );

-- Funções para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_professores_updated_at
  BEFORE UPDATE ON public.professores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil de professor automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.professores (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente no signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();