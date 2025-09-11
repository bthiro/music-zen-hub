import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Plus, 
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  UserMinus,
  Activity,
  Mail,
  KeyRound,
  Copy
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/ui/stats-card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobalPaymentsView } from "@/components/GlobalPaymentsView";

const professorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  plano: z.enum(['basico', 'premium']),
  limite_alunos: z.number().min(1).max(500),
});

type ProfessorFormData = z.infer<typeof professorSchema>;

export default function AdminDashboard() {
  const { 
    stats, 
    professores, 
    loading, 
    updateProfessorStatus, 
    updateProfessorModules,
    createProfessor,
    inviteProfessor,
    resetProfessorPassword
  } = useAdmin();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      plano: 'basico',
      limite_alunos: 50,
    },
  });

  const handleCreateProfessor = async (data: ProfessorFormData) => {
    const { error } = await createProfessor({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      plano: data.plano,
      limite_alunos: data.limite_alunos
    });
    if (!error) {
      setCreateDialogOpen(false);
      form.reset();
    }
  };

  const handleStatusChange = async (professorId: string, newStatus: string) => {
    await updateProfessorStatus(professorId, newStatus);
  };

  const handleModuleToggle = async (professorId: string, modules: Record<string, boolean>) => {
    await updateProfessorModules(professorId, modules);
    
    // Trigger a real-time notification to the professor by updating updated_at
    try {
      await supabase.from('professores').update({ 
        updated_at: new Date().toISOString() 
      }).eq('id', professorId);
    } catch (error) {
      console.warn('[AdminDashboard] Failed to trigger real-time update:', error);
    }
  };

  const handleInviteProfessor = async (professorId: string, email: string) => {
    await inviteProfessor(professorId, email);
  };

  const handleResetPassword = async (professorId: string, email: string) => {
    await resetProfessorPassword(professorId, email);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500';
      case 'suspenso': return 'bg-yellow-500';
      case 'inativo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'suspenso': return 'Suspenso';
      case 'inativo': return 'Inativo';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
            <p className="text-muted-foreground">
              Gerencie professores, pagamentos e configurações do sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="professores">Professores</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Total Professores"
                value={stats?.totalProfessores || 0}
                subtitle="Cadastrados"
                icon={Users}
                color="blue"
              />
              <StatsCard 
                title="Professores Ativos"
                value={stats?.professoresAtivos || 0}
                subtitle="Em funcionamento"
                icon={UserCheck}
                color="green"
              />
              <StatsCard 
                title="Total Alunos"
                value={stats?.totalAlunos || 0}
                subtitle="No sistema"
                icon={Users}
                color="purple"
              />
              <StatsCard 
                title="Receita Total"
                value={`R$ ${(stats?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Pagamentos recebidos"
                icon={DollarSign}
                color="green"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Professores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Ativos</span>
                      </div>
                      <span className="font-medium">{stats?.professoresAtivos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Suspensos</span>
                      </div>
                      <span className="font-medium">{stats?.professoresSuspensos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Inativos</span>
                      </div>
                      <span className="font-medium">{stats?.professoresInativos}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Pagamentos Recebidos</span>
                      <span className="font-medium text-green-600">{stats?.pagamentosPagos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pagamentos Pendentes</span>
                      <span className="font-medium text-yellow-600">{stats?.pagamentosPendentes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Aulas no Mês</span>
                      <span className="font-medium">{stats?.aulasNoMes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professores" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Professores Cadastrados</h3>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Professor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Professor</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo professor
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(handleCreateProfessor)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input {...form.register('nome')} />
                      {form.formState.errors.nome && (
                        <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" {...form.register('email')} />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone (opcional)</Label>
                      <Input {...form.register('telefone')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plano">Plano</Label>
                        <select {...form.register('plano')} className="w-full p-2 border rounded-md">
                          <option value="basico">Básico</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="limite_alunos">Limite de Alunos</Label>
                        <Input 
                          type="number" 
                          {...form.register('limite_alunos', { valueAsNumber: true })} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Professor</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {professores.map((professor) => (
                <Card key={professor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <h4 className="font-medium">{professor.nome}</h4>
                          <p className="text-sm text-muted-foreground">{professor.email}</p>
                        </div>
                        <Badge className={`${getStatusColor(professor.status)} text-white`}>
                          {getStatusLabel(professor.status)}
                        </Badge>
                        <Badge variant="outline">
                          {professor.plano}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Status: {getStatusLabel(professor.status)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(professor.id, 'ativo')}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(professor.id, 'suspenso')}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(professor.id, 'inativo')}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => handleInviteProfessor(professor.id, professor.email)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(professor.id, professor.email)}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />
                              Resetar Senha
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Impersonar (Read-only)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Módulos Habilitados</h5>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(professor.modules).map(([module, enabled]) => (
                          <div key={module} className="flex items-center space-x-2">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => {
                                const newModules = { ...professor.modules, [module]: checked };
                                handleModuleToggle(professor.id, newModules);
                              }}
                            />
                            <Label className="text-sm capitalize">{module}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pagamentos">
            <GlobalPaymentsView />
          </TabsContent>

          <TabsContent value="integracoes">
            <Card>
              <CardHeader>
                <CardTitle>Integrações & IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações de integrações em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações globais em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}