import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfessorPlan } from '@/hooks/useProfessorPlan';
import { UserCheck, UserX, AlertTriangle, RefreshCw } from 'lucide-react';

interface SuspendedStudent {
  id: string;
  nome: string;
  suspended_at: string;
  suspended_reason: string;
}

export function SuspendedStudentsManager() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { planInfo, currentStudentCount, canAddStudent } = useProfessorPlan();
  const [loading, setLoading] = useState(false);
  const [suspendedStudents, setSuspendedStudents] = useState<SuspendedStudent[]>([]);

  useEffect(() => {
    if (user?.profile?.id) {
      loadSuspendedStudents();
    }
  }, [user?.profile?.id]);

  const loadSuspendedStudents = async () => {
    if (!user?.profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, suspended_at, suspended_reason')
        .eq('professor_id', user.profile.id)
        .eq('ativo', false)
        .eq('suspended_reason', 'plan_downgrade')
        .order('suspended_at', { ascending: false });

      if (error) throw error;
      setSuspendedStudents(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos suspensos:', error);
    }
  };

  const reactivateStudent = async (studentId: string) => {
    if (!canAddStudent()) {
      toast({
        title: 'Limite atingido',
        description: 'Você já atingiu o limite de alunos do seu plano. Faça upgrade para reativar mais alunos.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          ativo: true,
          suspended_reason: null,
          suspended_at: null
        })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: 'Aluno reativado!',
        description: 'O aluno foi reativado com sucesso.'
      });

      await loadSuspendedStudents();
    } catch (error: any) {
      console.error('Erro ao reativar aluno:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao reativar aluno.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const reactivateMultipleStudents = async () => {
    if (!planInfo) return;

    const availableSlots = planInfo.limite_alunos - currentStudentCount;
    if (availableSlots <= 0) {
      toast({
        title: 'Sem vagas disponíveis',
        description: 'Você já atingiu o limite de alunos do seu plano.',
        variant: 'destructive'
      });
      return;
    }

    const studentsToReactivate = suspendedStudents.slice(0, availableSlots);
    
    setLoading(true);
    try {
      const studentIds = studentsToReactivate.map(s => s.id);
      
      const { error } = await supabase
        .from('alunos')
        .update({
          ativo: true,
          suspended_reason: null,
          suspended_at: null
        })
        .in('id', studentIds);

      if (error) throw error;

      toast({
        title: 'Alunos reativados!',
        description: `${studentsToReactivate.length} aluno(s) foram reativados com sucesso.`
      });

      await loadSuspendedStudents();
    } catch (error: any) {
      console.error('Erro ao reativar alunos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao reativar alunos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (suspendedStudents.length === 0) {
    return null;
  }

  const availableSlots = planInfo ? planInfo.limite_alunos - currentStudentCount : 0;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <UserX className="h-5 w-5" />
          Alunos Suspensos Temporariamente
          <Badge variant="secondary">{suspendedStudents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Por que foram suspensos?</strong> Estes alunos foram suspensos temporariamente 
                devido a uma mudança no seu plano que reduziu o limite de alunos.
              </p>
              <p>
                <strong>Como reativar?</strong> Você pode reativar alunos suspensos se tiver vagas 
                disponíveis no seu plano atual ou fazer upgrade para um plano maior.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div>
            <p className="font-medium">Vagas disponíveis</p>
            <p className="text-sm text-muted-foreground">
              {availableSlots} de {planInfo?.limite_alunos} vagas
            </p>
          </div>
          {availableSlots > 0 && (
            <Button 
              onClick={reactivateMultipleStudents}
              disabled={loading}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reativar {Math.min(availableSlots, suspendedStudents.length)} aluno(s)
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Alunos suspensos:</h4>
          {suspendedStudents.map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div>
                <p className="font-medium">{student.nome}</p>
                <p className="text-xs text-muted-foreground">
                  Suspenso em {new Date(student.suspended_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reactivateStudent(student.id)}
                disabled={loading || !canAddStudent()}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Reativar
              </Button>
            </div>
          ))}
        </div>

        {availableSlots === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sem vagas disponíveis.</strong> Faça upgrade do seu plano para ter mais vagas e reativar estes alunos.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}