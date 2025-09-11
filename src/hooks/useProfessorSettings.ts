import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

interface ProfessorSettings {
  id?: string;
  professor_id: string;
  pix_key?: string;
  payment_link?: string;
  billing_message?: string;
  timezone: string;
  push_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useProfessorSettings() {
  const [settings, setSettings] = useState<ProfessorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  // Carregar configurações do professor
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Obter ID do professor
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professor) throw new Error('Professor não encontrado');

      // Carregar configurações
      const { data, error } = await supabase
        .from('configuracoes_professor')
        .select('*')
        .eq('professor_id', professor.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Criar configurações padrão se não existirem
        const defaultSettings: Partial<ProfessorSettings> = {
          professor_id: professor.id,
          timezone: 'America/Sao_Paulo',
          push_notifications: true
        };

        const { data: newSettings, error: createError } = await supabase
          .from('configuracoes_professor')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar suas preferências.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar configurações
  const updateSettings = async (updateData: Partial<ProfessorSettings>) => {
    try {
      if (!settings) throw new Error('Configurações não carregadas');

      const { data, error } = await supabase
        .from('configuracoes_professor')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      
      await logAction('configuracoes_atualizadas', 'configuracoes_professor', data.id, {
        campos_alterados: Object.keys(updateData),
        ...updateData
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  // Salvar configurações (upsert)
  const saveSettings = async (settingsData: Partial<ProfessorSettings>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Obter ID do professor
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professor) throw new Error('Professor não encontrado');

      const { data, error } = await supabase
        .from('configuracoes_professor')
        .upsert({
          professor_id: professor.id,
          ...settingsData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'professor_id'
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      
      await logAction('configuracoes_salvas', 'configuracoes_professor', data.id, {
        ...settingsData
      });

      toast({
        title: 'Configurações salvas!',
        description: 'Suas preferências foram atualizadas com sucesso.'
      });

      return data;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas configurações.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    saveSettings,
    refetch: loadSettings
  };
}