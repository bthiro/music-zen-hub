import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Plus, 
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  UserMinus,
  Mail,
  KeyRound,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminImpersonation } from "@/components/AdminImpersonation";

const professorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  plano: z.enum(['basico', 'premium']),
  limite_alunos: z.number().min(1).max(500),
});

type ProfessorFormData = z.infer<typeof professorSchema>;

// Form persistence key
const FORM_STORAGE_KEY = 'admin_professor_form_draft';

export default function AdminProfessores() {
  const { 
    professores, 
    loading, 
    updateProfessorStatus, 
    updateProfessorModules,
    createProfessor,
    inviteProfessor,
    resetProfessorPassword
  } = useAdmin();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [impersonationOpen, setImpersonationOpen] = useState(false);
  const [impersonationData, setImpersonationData] = useState<{id: string, nome: string} | null>(null);

  const form = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      plano: 'basico',
      limite_alunos: 20,
    },
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.warn('Failed to parse saved form data:', error);
      }
    }
  }, [form]);

  // Save form data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((formData) => {
      if (formData.nome || formData.email) { // Only save if there's meaningful data
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleCreateProfessor = async (data: ProfessorFormData) => {
    // Apply plan-specific defaults based on system settings
    const planLimits = {
      basico: { alunos: 20, modules: ["dashboard", "agenda", "pagamentos"] },
      premium: { alunos: 500, modules: ["dashboard", "agenda", "pagamentos", "ia", "lousa", "ferramentas", "materiais"] }
    };
    
    const planSettings = planLimits[data.plano];
    const modules = planSettings.modules.reduce((acc, module) => {
      acc[module] = true;
      return acc;
    }, {} as Record<string, boolean>);

    const { error } = await createProfessor({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      plano: data.plano,
      limite_alunos: data.limite_alunos,
      modules
    });
    
    if (!error) {
      setCreateDialogOpen(false);
      form.reset();
      // Clear saved form data
      localStorage.removeItem(FORM_STORAGE_KEY);
    }
  };

  const handleStatusChange = async (professorId: string, newStatus: string) => {
    await updateProfessorStatus(professorId, newStatus);
  };

  const handleModuleToggle = async (professorId: string, modules: Record<string, boolean>) => {
    await updateProfessorModules(professorId, modules);
    
    // Trigger a real-time notification to the professor
    try {
      await supabase.from('professores').update({ 
        updated_at: new Date().toISOString() 
      }).eq('id', professorId);
    } catch (error) {
      console.warn('[AdminProfessores] Failed to trigger real-time update:', error);
    }
  };

  const handleInviteProfessor = async (professorId: string, email: string) => {
    await inviteProfessor(professorId, email);
  };

  const handleImpersonation = async (professorId: string, professorNome: string) => {
    setImpersonationData({ id: professorId, nome: professorNome });
    setImpersonationOpen(true);
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

  const getPlanDescription = (plano: string) => {
    switch (plano) {
      case 'basico': return 'Dashboard, Agenda e Pagamentos (até 20 alunos)';
      case 'premium': return 'Todos os módulos incluindo IA e Lousa (até 500 alunos)';
      default: return plano;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Professores</h2>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
            <h2 className="text-3xl font-bold tracking-tight">Gerenciar Professores</h2>
            <p className="text-muted-foreground">
              Cadastre novos professores e gerencie permissões
            </p>
          </div>
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
                  Preencha os dados do novo professor. Os dados são salvos automaticamente.
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
                      <option value="basico">Básico - {getPlanDescription('basico')}</option>
                      <option value="premium">Premium - {getPlanDescription('premium')}</option>
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
                  <Button type="button" variant="outline" onClick={() => {
                    setCreateDialogOpen(false);
                    // Don't clear the form data when canceling - it stays saved
                  }}>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {getPlanDescription(professor.plano)}
                      </p>
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
                        <DropdownMenuItem 
                          onClick={() => handleImpersonation(professor.id, professor.nome)}
                        >
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
      </div>

      <AdminImpersonation
        open={impersonationOpen}
        onOpenChange={(open) => {
          setImpersonationOpen(open);
          if (!open) setImpersonationData(null);
        }}
        professorId={impersonationData?.id}
        professorNome={impersonationData?.nome}
      />
    </Layout>
  );
}