import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Professor {
  id: string;
  nome: string;
  email: string;
  status: string;
  plano: string;
  data_expiracao: string | null;
  ultimo_acesso: string | null;
  created_at: string;
  limite_alunos: number;
  senha_temporaria: boolean;
}

interface Stats {
  totalProfessores: number;
  professoresAtivos: number;
  totalAlunos: number;
  totalAulas: number;
}

export default function Admin() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProfessores: 0,
    professoresAtivos: 0,
    totalAlunos: 0,
    totalAulas: 0
  });
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newProfessor, setNewProfessor] = useState({
    nome: '',
    email: '',
    senha: '',
    plano: 'basico',
    limite_alunos: 20,
    data_expiracao: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load professores
      const { data: professoresData, error: professoresError } = await supabase
        .from('professores')
        .select('*')
        .order('created_at', { ascending: false });

      if (professoresError) throw professoresError;

      setProfessores(professoresData || []);

      // Load stats
      const { data: alunosData } = await supabase
        .from('alunos')
        .select('id', { count: 'exact' });

      const { data: aulasData } = await supabase
        .from('aulas')
        .select('id', { count: 'exact' });

      setStats({
        totalProfessores: professoresData?.length || 0,
        professoresAtivos: professoresData?.filter(p => p.status === 'ativo').length || 0,
        totalAlunos: alunosData?.length || 0,
        totalAulas: aulasData?.length || 0
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: newProfessor
      });

      if (error) throw error;

      toast({
        title: 'Professor criado com sucesso!',
        description: `Credenciais enviadas para ${newProfessor.email}`
      });

      setNewProfessor({
        nome: '',
        email: '',
        senha: '',
        plano: 'basico',
        limite_alunos: 20,
        data_expiracao: ''
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar professor',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (professorId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('professores')
        .update({ status: newStatus })
        .eq('id', professorId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Professor ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Usar a URL específica do projeto ao invés da genérica do Lovable
      const projectUrl = window.location.origin;
      const redirectTo = `${projectUrl}/`;
      
      console.log('Project URL:', projectUrl);
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('OAuth URL gerada:', data.url);
        
        // Sempre abrir em nova aba no preview do Lovable
        const popup = window.open(data.url, 'google-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');
        
        if (!popup) {
          toast({
            title: 'Popup bloqueado',
            description: 'Por favor, permita popups para fazer login com Google.',
            variant: 'destructive'
          });
          return;
        }

        // Monitorar quando a janela for fechada
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Verificar se o login foi bem-sucedido
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                  toast({
                    title: 'Login realizado com sucesso!',
                    description: 'Bem-vindo de volta!'
                  });
                  navigate('/');
                } else {
                  toast({
                    title: 'Login cancelado',
                    description: 'Tente novamente se necessário.',
                    variant: 'destructive'
                  });
                }
              });
            }, 1000);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: 'Erro no login com Google',
        description: error.message ?? 'Erro de configuração. Verifique as URLs no Supabase.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ativo': 'default',
      'inativo': 'secondary',
      'suspenso': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plano: string) => {
    const variants = {
      'basico': 'outline',
      'premium': 'default',
      'pro': 'secondary'
    } as const;

    return (
      <Badge variant={variants[plano as keyof typeof variants] || 'outline'}>
        {plano}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie professores e monitore a plataforma</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Professor
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Professor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProfessor} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={newProfessor.nome}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newProfessor.email}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="senha">Senha Temporária</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={newProfessor.senha}
                      onChange={(e) => setNewProfessor(prev => ({ ...prev, senha: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="plano">Plano</Label>
                  <Select value={newProfessor.plano} onValueChange={(value) => setNewProfessor(prev => ({ ...prev, plano: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="limite_alunos">Limite de Alunos</Label>
                  <Input
                    id="limite_alunos"
                    type="number"
                    value={newProfessor.limite_alunos}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, limite_alunos: parseInt(e.target.value) }))}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_expiracao">Data de Expiração (opcional)</Label>
                  <Input
                    id="data_expiracao"
                    type="date"
                    value={newProfessor.data_expiracao}
                    onChange={(e) => setNewProfessor(prev => ({ ...prev, data_expiracao: e.target.value }))}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={createLoading}>
                  {createLoading ? 'Criando...' : 'Criar Professor'}
                </Button>
              </form>
            </DialogContent>
           </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Professores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfessores}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professores Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.professoresAtivos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alunos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aulas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAulas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Professores Table */}
        <Card>
          <CardHeader>
            <CardTitle>Professores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professores.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.nome}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>{getStatusBadge(professor.status)}</TableCell>
                    <TableCell>{getPlanBadge(professor.plano)}</TableCell>
                    <TableCell>
                      {professor.ultimo_acesso 
                        ? format(new Date(professor.ultimo_acesso), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={professor.status === 'ativo' ? 'outline' : 'default'}
                          onClick={() => handleUpdateStatus(professor.id, professor.status === 'ativo' ? 'inativo' : 'ativo')}
                        >
                          {professor.status === 'ativo' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}