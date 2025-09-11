import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';

export interface AdminProfile {
  id: string;
  user_id: string;
  nome: string | null;
  telefone: string | null;
  bio: string | null;
  avatar_url: string | null;
  data_nascimento: string | null;
  endereco: string | null;
}

export function useAdminProfile() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile = {
          user_id: user.id,
          nome: user.email?.split('@')[0] || '',
          bio: 'Administrador do sistema Music Zen Hub'
        };

        const { data: newProfile, error: createError } = await supabase
          .from('admin_profiles')
          .insert(initialProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      toast({
        title: 'Erro ao carregar perfil',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AdminProfile>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // Also update auth metadata for nome
      if (updates.nome) {
        await supabase.auth.updateUser({
          data: { nome: updates.nome }
        });
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.'
      });
    } catch (error: any) {
      console.error('Error updating admin profile:', error);
      toast({
        title: 'Erro ao salvar perfil',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `admin-avatar-${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile
  };
}