import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UpgradeProfessorOptions {
  professorId: string;
  newPlan: string;
  paymentId?: string;
  automatic?: boolean;
}

export function useAdminPlanManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const upgradeProfessorPlan = async (options: UpgradeProfessorOptions) => {
    setLoading(true);
    try {
      const { professorId, newPlan, paymentId, automatic = false } = options;

      // Buscar dados do professor e novo plano
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id, plano, nome, email, limite_alunos, manual_plan_override')
        .eq('id', professorId)
        .single();

      if (profError) throw profError;

      // Se foi alteração manual, não fazer upgrade automático
      if (automatic && professor.manual_plan_override) {
        console.log(`Professor ${professor.nome} tem override manual. Pulando upgrade automático.`);
        return { success: false, reason: 'manual_override' };
      }

      const { data: planData, error: planError } = await supabase
        .from('planos_professor')
        .select('*')
        .eq('nome', newPlan)
        .eq('ativo', true)
        .single();

      if (planError) throw planError;

      // Contar alunos ativos do professor
      const { count: studentCount, error: countError } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('professor_id', professorId)
        .eq('ativo', true);

      if (countError) throw countError;

      const currentStudentCount = studentCount || 0;

      // Se o novo plano tem limite menor, suspender alunos excedentes
      if (currentStudentCount > planData.limite_alunos) {
        await suspendExcessStudents(professorId, planData.limite_alunos);
      }

      // Atualizar plano do professor
      const updateData: any = {
        plano: newPlan,
        limite_alunos: planData.limite_alunos,
        plan_changed_at: new Date().toISOString()
      };

      if (!automatic) {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.plan_changed_by = user?.id;
        updateData.manual_plan_override = true;
      } else {
        updateData.manual_plan_override = false;
      }

      const { error: updateError } = await supabase
        .from('professores')
        .update(updateData)
        .eq('id', professorId);

      if (updateError) throw updateError;

      // Registrar no log de auditoria
      await supabase.rpc('log_audit', {
        p_action: automatic ? 'upgrade_automatico' : 'upgrade_manual',
        p_entity: 'professores',
        p_entity_id: professorId,
        p_metadata: {
          old_plan: professor.plano,
          new_plan: newPlan,
          payment_id: paymentId,
          student_count: currentStudentCount,
          plan_limit: planData.limite_alunos
        }
      });

      // Enviar email de notificação ao professor (implementar depois)
      
      toast({
        title: 'Upgrade realizado!',
        description: `Professor ${professor.nome} foi promovido para o plano ${newPlan}.`
      });

      return { success: true, data: { professor, newPlan: planData } };

    } catch (error: any) {
      console.error('Erro ao fazer upgrade do professor:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao realizar upgrade do plano.',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const suspendExcessStudents = async (professorId: string, newLimit: number) => {
    try {
      // Buscar alunos ativos ordenados por data de criação (mais antigos primeiro)
      const { data: students, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('professor_id', professorId)
        .eq('ativo', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (students && students.length > newLimit) {
        const studentsToSuspend = students.slice(newLimit);
        const studentIds = studentsToSuspend.map(s => s.id);

        const { error: suspendError } = await supabase
          .from('alunos')
          .update({
            ativo: false,
            suspended_reason: 'plan_downgrade',
            suspended_at: new Date().toISOString()
          })
          .in('id', studentIds);

        if (suspendError) throw suspendError;

        console.log(`Suspensos ${studentsToSuspend.length} alunos devido ao downgrade de plano.`);
      }
    } catch (error) {
      console.error('Erro ao suspender alunos excedentes:', error);
      throw error;
    }
  };

  const reactivateSuspendedStudents = async (professorId: string) => {
    try {
      // Buscar professor e seu limite atual
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('limite_alunos')
        .eq('id', professorId)
        .single();

      if (profError) throw profError;

      // Contar alunos ativos
      const { count: activeCount, error: countError } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('professor_id', professorId)
        .eq('ativo', true);

      if (countError) throw countError;

      const availableSlots = professor.limite_alunos - (activeCount || 0);

      if (availableSlots > 0) {
        // Buscar alunos suspensos por downgrade
        const { data: suspendedStudents, error: suspendedError } = await supabase
          .from('alunos')
          .select('id')
          .eq('professor_id', professorId)
          .eq('ativo', false)
          .eq('suspended_reason', 'plan_downgrade')
          .order('suspended_at', { ascending: true })
          .limit(availableSlots);

        if (suspendedError) throw suspendedError;

        if (suspendedStudents && suspendedStudents.length > 0) {
          const studentIds = suspendedStudents.map(s => s.id);

          const { error: reactivateError } = await supabase
            .from('alunos')
            .update({
              ativo: true,
              suspended_reason: null,
              suspended_at: null
            })
            .in('id', studentIds);

          if (reactivateError) throw reactivateError;

          return suspendedStudents.length;
        }
      }

      return 0;
    } catch (error) {
      console.error('Erro ao reativar alunos suspensos:', error);
      throw error;
    }
  };

  const applyGracePeriod = async (professorId: string, days: number = 3) => {
    try {
      const gracePeriodUntil = new Date();
      gracePeriodUntil.setDate(gracePeriodUntil.getDate() + days);

      const { error } = await supabase
        .from('professores')
        .update({
          grace_period_until: gracePeriodUntil.toISOString()
        })
        .eq('id', professorId);

      if (error) throw error;

      return gracePeriodUntil;
    } catch (error) {
      console.error('Erro ao aplicar período de carência:', error);
      throw error;
    }
  };

  const processGracePeriodExpired = async () => {
    try {
      // Buscar professores com período de carência expirado
      const { data: expiredProfessors, error } = await supabase
        .from('professores')
        .select('id, nome, plano')
        .lt('grace_period_until', new Date().toISOString())
        .not('grace_period_until', 'is', null);

      if (error) throw error;

      for (const professor of expiredProfessors || []) {
        // Fazer downgrade para plano gratuito
        await upgradeProfessorPlan({
          professorId: professor.id,
          newPlan: 'Gratuito',
          automatic: true
        });

        // Limpar período de carência
        await supabase
          .from('professores')
          .update({ grace_period_until: null })
          .eq('id', professor.id);
      }

      return expiredProfessors?.length || 0;
    } catch (error) {
      console.error('Erro ao processar períodos de carência expirados:', error);
      throw error;
    }
  };

  return {
    loading,
    upgradeProfessorPlan,
    reactivateSuspendedStudents,
    applyGracePeriod,
    processGracePeriodExpired
  };
}