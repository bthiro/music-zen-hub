import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { SupabaseAlunosForm } from '@/components/SupabaseAlunosForm';
import { Plus, Search, Edit, Trash2, Phone, Mail, Music, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SupabaseAlunos() {
  const { alunos, loading, removerAluno } = useSupabaseData();
  const { toast } = useToast();
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [alunoEdicao, setAlunoEdicao] = useState<any>(null);

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.instrumento?.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleEditarAluno = (aluno: any) => {
    setAlunoEdicao(aluno);
    setMostrarForm(true);
  };

  const handleNovoAluno = () => {
    setAlunoEdicao(null);
    setMostrarForm(true);
  };

  const handleFecharForm = () => {
    setMostrarForm(false);
    setAlunoEdicao(null);
  };

  const handleRemoverAluno = async (aluno: any) => {
    try {
      const { error } = await removerAluno(aluno.id);
      if (error) throw error;

      toast({
        title: 'Aluno removido',
        description: `${aluno.nome} foi removido com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover aluno.',
        variant: 'destructive',
      });
    }
  };

  const getInstrumentIcon = (instrumento: string) => {
    return <Music className="h-4 w-4" />;
  };

  const getNivelColor = (nivel: string) => {
    const cores = {
      iniciante: 'bg-green-100 text-green-800',
      basico: 'bg-blue-100 text-blue-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-orange-100 text-orange-800',
      profissional: 'bg-purple-100 text-purple-800',
    };
    return cores[nivel as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  if (mostrarForm) {
    return (
      <Layout>
        <SupabaseAlunosForm aluno={alunoEdicao} onClose={handleFecharForm} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
            <p className="text-muted-foreground">
              Gerencie seus alunos e suas informações
            </p>
          </div>
          <Button onClick={handleNovoAluno}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alunos.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alunos.filter(a => a.ativo).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instrumentos</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(alunos.map(a => a.instrumento).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos por nome, instrumento ou email..."
            className="pl-8"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Lista de Alunos */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alunosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {busca ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {busca 
                  ? 'Tente ajustar sua busca ou adicione um novo aluno.'
                  : 'Comece adicionando seu primeiro aluno.'}
              </p>
              {!busca && (
                <Button onClick={handleNovoAluno}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Aluno
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alunosFiltrados.map((aluno) => (
              <Card key={aluno.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getInstrumentIcon(aluno.instrumento)}
                        <span className="text-sm text-muted-foreground">
                          {aluno.instrumento || 'Não informado'}
                        </span>
                      </div>
                    </div>
                    {!aluno.ativo && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {aluno.nivel && (
                    <Badge className={getNivelColor(aluno.nivel)} variant="secondary">
                      {aluno.nivel}
                    </Badge>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {aluno.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{aluno.email}</span>
                      </div>
                    )}
                    
                    {aluno.telefone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{aluno.telefone}</span>
                      </div>
                    )}
                  </div>

                  {aluno.observacoes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {aluno.observacoes}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarAluno(aluno)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{aluno.nome}</strong>? 
                            Esta ação não pode ser desfeita e todas as aulas e pagamentos 
                            relacionados também serão removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoverAluno(aluno)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}