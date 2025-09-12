import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface PlanInfo {
  nome: string;
  limite_alunos: number;
  recursos: Record<string, boolean>;
  preco_mensal: number;
}

export function useProfessorPlan() {
  const { user } = useAuthContext();
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [currentStudentCount, setCurrentStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.profile?.id) {
      setLoading(false);
      return;
    }

    loadPlanInfo();
    loadStudentCount();
  }, [user?.profile?.id]);

  const loadPlanInfo = async () => {
    if (!user?.profile?.plano) return;

    try {
      const { data, error } = await supabase
        .from('planos_professor')
        .select('*')
        .eq('nome', user.profile.plano)
        .eq('ativo', true)
        .single();

      if (error) throw error;
      setPlanInfo(data);
    } catch (error) {
      console.error('Error loading plan info:', error);
    }
  };

  const loadStudentCount = async () => {
    if (!user?.profile?.id) return;

    try {
      const { count, error } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('professor_id', user.profile.id)
        .eq('ativo', true);

      if (error) throw error;
      setCurrentStudentCount(count || 0);
    } catch (error) {
      console.error('Error loading student count:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAddStudent = () => {
    if (!planInfo) return false;
    return currentStudentCount < planInfo.limite_alunos;
  };

  const hasFeature = (feature: string) => {
    if (!planInfo) return false;
    return planInfo.recursos[feature] === true;
  };

  const isFreePlan = () => {
    return user?.profile?.plano === 'Gratuito';
  };

  return {
    planInfo,
    currentStudentCount,
    loading,
    canAddStudent,
    hasFeature,
    isFreePlan,
    refreshStudentCount: loadStudentCount
  };
}