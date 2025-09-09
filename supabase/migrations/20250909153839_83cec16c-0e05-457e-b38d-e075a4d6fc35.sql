-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add new fields to professores table
ALTER TABLE public.professores 
ADD COLUMN status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
ADD COLUMN data_expiracao DATE,
ADD COLUMN criado_por UUID REFERENCES auth.users(id),
ADD COLUMN ultimo_acesso TIMESTAMPTZ,
ADD COLUMN senha_temporaria BOOLEAN DEFAULT false;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update professores policies to include admin access
CREATE POLICY "Admins podem gerenciar todos professores" ON public.professores
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to prevent signup without admin approval
CREATE OR REPLACE FUNCTION public.prevent_direct_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is an admin creating a teacher
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    -- Allow only if there are no users in the system (first admin)
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
      RAISE EXCEPTION 'Cadastro direto não permitido. Entre em contato com o administrador.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Insert first admin user (replace with your email)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'btakashy@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;