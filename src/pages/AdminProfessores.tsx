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
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Plus, 
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  UserMinus,
  Mail,
  KeyRound,
  Lock,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminImpersonation } from "@/components/AdminImpersonation";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";

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
    updateProfessor,
    deleteProfessor,
    exportProfessores,
    inviteProfessor,
    resetProfessorPassword
  } = useAdmin();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [impersonationOpen, setImpersonationOpen] = useState(false);
  const [impersonationData, setImpersonationData] = useState<{id: string, nome: string} | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<{id: string, nome: string} | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [professoresToTransfer, setProfessoresToTransfer] = useState<any[]>([]);
  const [transferToId, setTransferToId] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [suspendStudents, setSuspendStudents] = useState<boolean>(false);

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

  const editForm = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      plano: 'basico',
      limite_alunos: 20
    }
  });

  const handleEditProfessor = (professor: any) => {
    setSelectedProfessor(professor);
    editForm.reset({
      nome: professor.nome || '',
      email: professor.email || '',
      telefone: professor.telefone || '',
      plano: professor.plano || 'basico',
      limite_alunos: professor.limite_alunos || 20
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProfessor = async (data: ProfessorFormData) => {
    if (!selectedProfessor) return;
    
    const result = await updateProfessor(selectedProfessor.id, {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      plano: data.plano,
      limite_alunos: data.limite_alunos
    });

    if (result?.success) {
      setEditDialogOpen(false);
      setSelectedProfessor(null);
      editForm.reset();
    }
  };

  const handleDeleteProfessor = async (professor: any) => {
    setSelectedProfessor(professor);
    
    // Get active students count for this professor
    const { data: studentsData } = await supabase
      .from('alunos')
      .select('id')
      .eq('professor_id', professor.id)
      .eq('ativo', true);
    
    const activeStudentCount = studentsData?.length || 0;
    setStudentCount(activeStudentCount);
    
    // Get active professors for transfer options (excluding current)
    const activeProfessors = professores.filter(p => 
      p.status === 'ativo' && p.id !== professor.id
    );
    setProfessoresToTransfer(activeProfessors);
    setTransferToId('');
    setSuspendStudents(false);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProfessor = async () => {
    if (!selectedProfessor) return;
    
    const result = await deleteProfessor(
      selectedProfessor.id, 
      transferToId || undefined, 
      suspendStudents
    );
    
    if (result?.success) {
      setDeleteDialogOpen(false);
      setSelectedProfessor(null);
      setTransferToId('');
      setSuspendStudents(false);
      setStudentCount(0);
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

  const handleSetPassword = async (professorId: string, professorNome: string) => {
    setPasswordData({ id: professorId, nome: professorNome });
    setPasswordDialogOpen(true);
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportProfessores}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
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
        </div>

        <div className="space-y-4">
          {professores
            .filter((professor: any) => professor.status !== 'excluido')
            .map((professor) => (
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
                        <DropdownMenuItem onClick={() => handleEditProfessor(professor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                          onClick={() => handleSetPassword(professor.id, professor.nome)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Definir Senha
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleImpersonation(professor.id, professor.nome)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Impersonar (Read-only)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProfessor(professor)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
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

        {/* Edit Professor Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Professor</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateProfessor)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do professor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="plano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basico">Básico</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="limite_alunos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Alunos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 20)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Professor Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Excluir Professor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir o professor <strong>{selectedProfessor?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              
              {studentCount > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Este professor tem {studentCount} alunos ativos
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Escolha como tratar os alunos ativos antes de excluir.
                  </p>
                </div>
              )}

              {studentCount > 0 && (
                <div className="space-y-4">
                  {professoresToTransfer.length > 0 && (
                    <div className="space-y-2">
                      <Label>Transferir alunos para:</Label>
                      <Select 
                        value={transferToId} 
                        onValueChange={(value) => {
                          setTransferToId(value);
                          if (value) setSuspendStudents(false);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um professor" />
                        </SelectTrigger>
                        <SelectContent>
                          {professoresToTransfer.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.nome} ({prof.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={suspendStudents}
                      onCheckedChange={(checked) => {
                        setSuspendStudents(checked);
                        if (checked) setTransferToId('');
                      }}
                    />
                    <Label className="text-sm">
                      Suspender alunos ativos (não transferir)
                    </Label>
                  </div>
                  
                  {suspendStudents && (
                    <p className="text-xs text-muted-foreground">
                      Os alunos serão suspensos e poderão ser reativados posteriormente.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteProfessor} 
                  disabled={loading || (studentCount > 0 && !transferToId && !suspendStudents)}
                >
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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

      <AdminPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) setPasswordData(null);
        }}
        professorId={passwordData?.id}
        professorNome={passwordData?.nome}
      />
    </Layout>
  );
}