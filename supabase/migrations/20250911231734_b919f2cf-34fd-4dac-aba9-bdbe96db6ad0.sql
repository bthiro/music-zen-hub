-- Fix RLS policies for avatars bucket and professor profile issues

-- Create storage policies for avatars bucket for admin profiles
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('avatars', '.emptyFolderPlaceholder', null, '{}') ON CONFLICT DO NOTHING;

-- Storage policies for admin avatar uploads
CREATE POLICY "Admin users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Admin users can view their own avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Admin users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
) WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

CREATE POLICY "Admin users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
);

-- Professor avatar policies (existing users should also be able to upload)
CREATE POLICY "Professor users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM professores WHERE user_id = auth.uid())
);

CREATE POLICY "Professor users can view their own avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM professores WHERE user_id = auth.uid())
);

CREATE POLICY "Professor users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM professores WHERE user_id = auth.uid())
) WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM professores WHERE user_id = auth.uid())
);

CREATE POLICY "Professor users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM professores WHERE user_id = auth.uid())
);

-- Update professor profiles to ensure all professors have default modules
UPDATE professores SET modules = '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'
WHERE modules IS NULL OR modules = '{}' OR 
  NOT (modules ? 'dashboard') OR 
  (modules->>'dashboard')::boolean = false;

-- Ensure professor records are created with proper defaults when users login
CREATE OR REPLACE FUNCTION public.ensure_professor_profile_on_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if this is a professor role
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.id AND role = 'professor'::app_role
  ) THEN
    -- Insert or update professor profile with default modules
    INSERT INTO professores (
      user_id, 
      nome, 
      email, 
      status,
      modules
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email,
      'ativo',
      '{"ia": false, "lousa": true, "agenda": true, "dashboard": true, "materiais": true, "pagamentos": true, "ferramentas": true}'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      modules = CASE 
        WHEN professores.modules IS NULL OR professores.modules = '{}' THEN EXCLUDED.modules
        ELSE professores.modules
      END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to ensure professor profiles have proper modules on login
DROP TRIGGER IF EXISTS on_auth_user_updated_professor_profile ON auth.users;
CREATE TRIGGER on_auth_user_updated_professor_profile
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (NEW.last_sign_in_at IS NOT NULL AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION ensure_professor_profile_on_login();