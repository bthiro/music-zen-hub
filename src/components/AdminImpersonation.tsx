import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/ui/stats-card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Eye, 
  Search,
  X,
  ArrowLeft
} from "lucide-react";

interface AdminImpersonationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professorId?: string;
  professorNome?: string;
}

export function AdminImpersonation({ 
  open, 
  onOpenChange, 
  professorId, 
  professorNome 
}: AdminImpersonationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [professorData, setProfessorData] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open && professorId) {
      loadProfessorData();
    }
  }, [open, professorId]);

  const loadProfessorData = async () => {
    setLoading(true);
    try {
      // Log audit action
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_log').insert({
        actor_user_id: user?.id,
        action: 'impersonar_readonly_iniciado',
        entity: 'professores',
        entity_id: professorId,
        metadata: { professor_nome: professorNome }
      });

      // Load professor profile
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('*')
        .eq('id', professorId)
        .single();

      if (profError) throw profError;
      setProfessorData(professor);

      // Load alunos
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .eq('professor_id', professorId)
        .order('nome');

      if (alunosError) throw alunosError;
      setAlunos(alunosData || []);

      // Load pagamentos
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .eq('professor_id', professorId)
        .order('created_at', { ascending: false });

      if (pagamentosError) throw pagamentosError;
      setPagamentos(pagamentosData || []);

      // Load aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .eq('professor_id', professorId)
        .order('data_hora', { ascending: false })
        .limit(20);

      if (aulasError) throw aulasError;
      setAulas(aulasData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do professor:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do professor.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      // Log audit action
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_log').insert({
        actor_user_id: user?.id,
        action: 'impersonar_readonly_encerrado',
        entity: 'professores',
        entity_id: professorId,
        metadata: { professor_nome: professorNome }
      });
    } catch (error) {
      console.error('Erro ao logar fim da impersonação:', error);
    }
    
    onOpenChange(false);
  };

  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalAlunos: alunos.filter(a => a.ativo).length,
    totalPagamentos: pagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0),
    pagamentosPendentes: pagamentos.filter(p => p.status === 'pendente').length,
    aulasRealizadas: aulas.filter(a => a.status === 'realizada').length
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visualização Read-Only: {professorNome}
            </DialogTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Modo Somente Leitura
            </Badge>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <StatsCard
                title="Alunos Ativos"
                value={stats.totalAlunos}
                subtitle="Total cadastrado"
                icon={Users}
                color="blue"
              />
              
              <StatsCard
                title="Receita Total"
                value={`R$ ${stats.totalPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Pagamentos recebidos"
                icon={DollarSign}
                color="green"
              />
              
              <StatsCard
                title="Pendentes"
                value={stats.pagamentosPendentes}
                subtitle="Pagamentos em aberto"
                icon={DollarSign}
                color="yellow"
              />
              
              <StatsCard
                title="Aulas Realizadas"
                value={stats.aulasRealizadas}
                subtitle="No total"
                icon={Calendar}
                color="purple"
              />
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos por nome ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Alunos List */}
            <Card>
              <CardHeader>
                <CardTitle>Alunos ({filteredAlunos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {filteredAlunos.map((aluno) => {
                    const alunoAulas = aulas.filter(a => a.aluno_id === aluno.id);
                    const alunoPagamentos = pagamentos.filter(p => p.aluno_id === aluno.id);
                    const pendente = alunoPagamentos.find(p => p.status === 'pendente');
                    
                    return (
                      <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{aluno.nome}</p>
                            <Badge variant={aluno.ativo ? "default" : "secondary"}>
                              {aluno.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {aluno.email || 'Sem email'} • {aluno.telefone || 'Sem telefone'}
                          </p>
                        </div>
                        
                        <div className="text-right text-sm">
                          <p className="font-medium">{alunoAulas.length} aulas</p>
                          {pendente && (
                            <p className="text-destructive">
                              R$ {pendente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredAlunos.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchTerm ? 'Nenhum aluno encontrado.' : 'Professor não possui alunos cadastrados.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pagamentos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pagamentos.slice(0, 10).map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{pagamento.alunos?.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Venc: {new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge 
                          variant={pagamento.status === 'pago' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {pagamento.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {pagamentos.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento encontrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Fechar Visualização
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}