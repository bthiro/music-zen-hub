import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlunoForm } from "@/components/forms/AlunoForm";
import { useApp } from "@/contexts/AppContext";
import { Plus, Search, Edit, Trash2, Clock, UserCheck, UserX, UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StudentEvolution } from "@/components/StudentEvolution";
import { StatsCard } from "@/components/ui/stats-card";

export default function Alunos() {
  const { alunos, deleteAluno } = useApp();
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState(null);
  const [alunoEvolucao, setAlunoEvolucao] = useState<{id: string, nome: string} | null>(null);

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o aluno ${nome}? Esta ação não pode ser desfeita.`)) {
      deleteAluno(id);
      toast({
        title: "Aluno excluído",
        description: `${nome} foi removido com sucesso.`
      });
    }
  };

  const handleEdit = (aluno: any) => {
    setAlunoEditando(aluno);
    setMostrarFormulario(true);
  };

  const handleFormSuccess = () => {
    setMostrarFormulario(false);
    setAlunoEditando(null);
  };

  const handleFormCancel = () => {
    setMostrarFormulario(false);
    setAlunoEditando(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "inativo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (alunoEvolucao) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Evolução do Aluno</h2>
              <p className="text-muted-foreground">{alunoEvolucao.nome}</p>
            </div>
            <Button variant="outline" onClick={() => setAlunoEvolucao(null)}>
              Voltar
            </Button>
          </div>
          <StudentEvolution alunoId={alunoEvolucao.id} alunoNome={alunoEvolucao.nome} />
        </div>
      </Layout>
    );
  }

  if (mostrarFormulario) {
    return (
      <Layout>
        <AlunoForm 
          aluno={alunoEditando}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Estatísticas de Alunos */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Alunos Ativos"
            value={alunos.filter(a => a.status === "ativo").length}
            subtitle="Mensalidades em dia"
            icon={UserCheck}
            color="green"
            badge={{ text: "Ativos", variant: "success" }}
          />
          
          <StatsCard
            title="Novos este Mês"
            value={alunos.filter(a => {
              const cadastro = new Date(a.dataCadastro);
              const hoje = new Date();
              return cadastro.getMonth() === hoje.getMonth() && cadastro.getFullYear() === hoje.getFullYear();
            }).length}
            subtitle="Novos cadastros"
            icon={UserPlus}
            color="blue"
            trend={{ value: 25, direction: 'up', label: 'vs mês anterior' }}
          />
          
          <StatsCard
            title="Pendentes"
            value={alunos.filter(a => a.status === "pendente").length}
            subtitle="Aguardando pagamento"
            icon={Clock}
            color="yellow"
            badge={{ text: "Atenção", variant: "outline" }}
          />
          
          <StatsCard
            title="Inativos"
            value={alunos.filter(a => a.status === "inativo").length}
            subtitle="Não participam mais"
            icon={UserX}
            color="red"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight font-display">Alunos</h2>
            <p className="text-muted-foreground">
              Gerencie seus alunos e informações
            </p>
          </div>
          <Button onClick={() => setMostrarFormulario(true)} className="w-full sm:w-auto btn-mobile">
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Barra de busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos por nome ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de alunos */}
        <div className="grid gap-4">
          {alunosFiltrados.map((aluno) => (
            <Card key={aluno.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{aluno.nome}</h3>
                      <Badge className={getStatusColor(aluno.status)}>
                        {aluno.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Email:</p>
                        <p>{aluno.email}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Mensalidade:</p>
                        <p>R$ {aluno.mensalidade}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Telefone:</p>
                        <p>{aluno.telefone || "Não informado"}</p>
                      </div>
                    </div>
                    {aluno.observacoes && (
                      <div className="mt-3">
                        <p className="font-medium text-foreground text-sm">Observações:</p>
                        <p className="text-sm text-muted-foreground">{aluno.observacoes}</p>
                      </div>
                    )}
                  </div>
                  {/* Ações em layout vertical para mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(aluno)}
                      className="w-full sm:w-auto text-xs"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAlunoEvolucao({id: aluno.id, nome: aluno.nome})}
                      className="w-full sm:w-auto text-xs"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Evolução
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(aluno.id, aluno.nome)}
                      className="w-full sm:w-auto text-xs"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alunosFiltrados.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Nenhum aluno encontrado.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}