import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

interface ProfessorProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  bio?: string;
  especialidades?: string;
  avatar_url?: string;
  pix_key?: string;
  billing_text?: string;
  payment_preference?: any;
  status: string;
  created_at: string;
  updated_at: string;
  data_nascimento?: string;
  endereco?: string;
}

interface ProfileUpdateData {
  nome?: string;
  telefone?: string;
  bio?: string;
  especialidades?: string;
  pix_key?: string;
  billing_text?: string;
  data_nascimento?: string;
  endereco?: string;
}

export function useProfessorProfile() {
  const [profile, setProfile] = useState<ProfessorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  // Carregar perfil do professor
  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar suas informações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updateData: ProfileUpdateData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('professores')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      await logAction('perfil_atualizado', 'professores', data.id, {
        campos_alterados: Object.keys(updateData),
        ...updateData
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Upload de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Atualizar URL do avatar no perfil
      const { data, error: updateError } = await supabase
        .from('professores')
        .update({ 
          avatar_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);

      await logAction('avatar_atualizado', 'professores', data.id, {
        novo_avatar: filePath
      });

      return filePath;
    } catch (error) {
      console.error('Erro no upload do avatar:', error);
      throw error;
    }
  };

  // Obter URL pública do avatar
  const getAvatarUrl = (avatarPath?: string): string | null => {
    if (!avatarPath) return null;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);
    
    return data.publicUrl;
  };

  // Remover avatar
  const removeAvatar = async (): Promise<void> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      if (profile?.avatar_url) {
        // Remover arquivo do storage
        await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url]);
      }

      // Atualizar perfil
      const { data, error } = await supabase
        .from('professores')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);

      await logAction('avatar_removido', 'professores', data.id);
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      throw error;
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    getAvatarUrl,
    removeAvatar,
    refetch: loadProfile
  };
}