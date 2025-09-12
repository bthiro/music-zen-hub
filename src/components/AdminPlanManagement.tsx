import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Settings, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface Professor {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: string;
  limite_alunos: number;
  student_count?: number;
  plan_changed_by?: string;
  plan_changed_at?: string;
  manual_plan_override?: boolean;
}

interface Plan {
  nome: string;
  preco_mensal: number;
  limite_alunos: number;
}

export function AdminPlanManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planStats, setPlanStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar professores com contagem de alunos
      const { data: professorsData, error: profError } = await supabase
        .from('professores')
        .select(`
          id, nome, email, plano, status, limite_alunos,
          plan_changed_by, plan_changed_at, manual_plan_override,
          alunos:alunos(count)
        `);

      if (profError) throw profError;

      const professorsWithCount = professorsData?.map(prof => ({
        ...prof,
        student_count: prof.alunos?.[0]?.count || 0
      })) || [];

      setProfessors(professorsWithCount);

      // Carregar planos disponíveis
      const { data: plansData, error: plansError } = await supabase
        .from('planos_professor')
        .select('nome, preco_mensal, limite_alunos')
        .eq('ativo', true)
        .order('preco_mensal');

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Calcular estatísticas por plano
      const stats: Record<string, number> = {};
      professorsWithCount.forEach(prof => {
        stats[prof.plano] = (stats[prof.plano] || 0) + 1;
      });
      setPlanStats(stats);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados dos professores.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (professorId: string, newPlan: string) => {
    try {
      const professor = professors.find(p => p.id === professorId);
      if (!professor) return;

      const plan = plans.find(p => p.nome === newPlan);
      if (!plan) return;

      // Verificar se professor tem mais alunos que o novo limite
      if (professor.student_count && professor.student_count > plan.limite_alunos) {
        const excessStudents = professor.student_count - plan.limite_alunos;
        if (!confirm(`Este professor tem ${professor.student_count} alunos, mas o plano ${newPlan} permite apenas ${plan.limite_alunos}. ${excessStudents} alunos serão suspensos temporariamente. Continuar?`)) {
          return;
        }

        // Suspender alunos excedentes
        await suspendExcessStudents(professorId, plan.limite_alunos);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Atualizar plano do professor
      const { error } = await supabase
        .from('professores')
        .update({
          plano: newPlan,
          limite_alunos: plan.limite_alunos,
          plan_changed_by: user?.id,
          plan_changed_at: new Date().toISOString(),
          manual_plan_override: true
        })
        .eq('id', professorId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: `Plano do professor alterado para ${newPlan}.`
      });

      await loadData();

    } catch (error: any) {
      console.error('Erro ao alterar plano:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao alterar plano do professor.',
        variant: 'destructive'
      });
    }
  };

  const suspendExcessStudents = async (professorId: string, newLimit: number) => {
    try {
      // Buscar alunos ativos ordenados por data de criação (mais antigos primeiro)
      const { data: students, error } = await supabase
        .from('alunos')
        .select('id')
        .eq('professor_id', professorId)
        .eq('ativo', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (students && students.length > newLimit) {
        const studentsToSuspend = students.slice(newLimit);
        const studentIds = studentsToSuspend.map(s => s.id);

        await supabase
          .from('alunos')
          .update({
            ativo: false,
            suspended_reason: 'plan_downgrade',
            suspended_at: new Date().toISOString()
          })
          .in('id', studentIds);
      }
    } catch (error) {
      console.error('Erro ao suspender alunos excedentes:', error);
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'Gratuito': return 'secondary';
      case 'Mensal': return 'default';
      case 'Anual': return 'default';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas dos Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.nome}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{plan.nome}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats[plan.nome] || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatPrice(plan.preco_mensal)}/mês • {plan.limite_alunos} alunos
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gestão de Planos dos Professores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestão de Planos dos Professores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Alterar manualmente o plano de um professor irá sobrescrever upgrades automáticos. 
              Professores com alterações manuais não receberão upgrades automáticos até que a configuração seja resetada.
            </AlertDescription>
          </Alert>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano Atual</TableHead>
                  <TableHead>Alunos/Limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alterar Plano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professors.map(professor => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.nome}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPlanBadgeVariant(professor.plano)}>
                          {professor.plano}
                        </Badge>
                        {professor.manual_plan_override && (
                          <Badge variant="outline" className="text-xs">Manual</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={professor.student_count && professor.student_count > professor.limite_alunos ? 'text-red-600 font-medium' : ''}>
                        {professor.student_count || 0}/{professor.limite_alunos}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={professor.status === 'ativo' ? 'default' : 'secondary'}>
                        {professor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={professor.plano}
                        onValueChange={(value) => handlePlanChange(professor.id, value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan.nome} value={plan.nome}>
                              {plan.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}