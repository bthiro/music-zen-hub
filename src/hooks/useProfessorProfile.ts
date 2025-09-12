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
  email?: string;
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

      // Sanitizar e validar dados
      const sanitizedData = {
        ...updateData,
        // Remover espaços extras e validar campos
        nome: updateData.nome?.trim(),
        telefone: updateData.telefone?.replace(/\D/g, ''),
        email: updateData.email?.toLowerCase().trim(),
        pix_key: updateData.pix_key?.trim(),
        bio: updateData.bio?.trim(),
        especialidades: updateData.especialidades?.trim(),
        endereco: updateData.endereco?.trim(),
        updated_at: new Date().toISOString()
      };

      // Validações básicas
      if (sanitizedData.nome && sanitizedData.nome.length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
      }
      
      if (sanitizedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedData.email)) {
        throw new Error('E-mail inválido');
      }
      
      if (sanitizedData.telefone && sanitizedData.telefone.length < 10) {
        throw new Error('Telefone deve ter pelo menos 10 dígitos');
      }

      const { data, error } = await supabase
        .from('professores')
        .update(sanitizedData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Erro ao salvar no banco de dados: ' + error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após atualização');
      }

      setProfile(data);
      
      await logAction('perfil_atualizado', 'professores', data.id, {
        campos_alterados: Object.keys(updateData),
        ...updateData
      });

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Não foi possível atualizar suas informações.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Upload de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Validações do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }
      
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 2MB');
      }

      // Remover avatar anterior se existir
      if (profile?.avatar_url) {
        try {
          await supabase.storage
            .from('avatars')
            .remove([profile.avatar_url]);
        } catch (removeError) {
          console.warn('Erro ao remover avatar anterior:', removeError);
        }
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo com upsert para substituir se existir
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Erro no upload: ' + uploadError.message);
      }

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

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Erro ao salvar avatar no perfil: ' + updateError.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após atualização do avatar');
      }

      setProfile(data);

      await logAction('avatar_atualizado', 'professores', data.id, {
        novo_avatar: filePath
      });

      toast({
        title: 'Avatar atualizado!',
        description: 'Sua foto de perfil foi alterada com sucesso.',
      });

      return filePath;
    } catch (error) {
      console.error('Erro no upload do avatar:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível atualizar sua foto.',
        variant: 'destructive'
      });
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