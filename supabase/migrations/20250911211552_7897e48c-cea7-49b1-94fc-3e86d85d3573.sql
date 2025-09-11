-- Create admin_profiles table for admin personal data
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  telefone TEXT,
  bio TEXT,
  avatar_url TEXT,
  data_nascimento DATE,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_profiles
CREATE POLICY "Admins can manage their own profile" 
ON public.admin_profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create admin_settings table for global system configurations
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "Admins can manage system settings" 
ON public.admin_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description, category) VALUES
('maintenance_mode', '{"enabled": false, "message": "Sistema em manutenção. Tente novamente em alguns minutos."}', 'Modo manutenção do sistema', 'system'),
('default_plan_limits', '{"basico": {"alunos": 20, "modules": ["dashboard", "agenda", "pagamentos"]}, "premium": {"alunos": 500, "modules": ["dashboard", "agenda", "pagamentos", "ia", "lousa", "ferramentas", "materiais"]}}', 'Limites padrão dos planos', 'plans'),
('email_settings', '{"smtp_enabled": true, "from_email": "noreply@musiczenhub.com", "welcome_template": "default"}', 'Configurações de email do sistema', 'email'),
('security_settings', '{"password_min_length": 8, "require_2fa": false, "session_timeout": 86400}', 'Configurações de segurança', 'security');

-- Create trigger for updated_at on both tables
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();