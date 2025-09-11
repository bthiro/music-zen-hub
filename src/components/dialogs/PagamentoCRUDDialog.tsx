import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays, DollarSign, Plus } from 'lucide-react';

interface PagamentoCRUDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pagamento?: any;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function PagamentoCRUDDialog({ 
  open, 
  onOpenChange, 
  pagamento, 
  mode,
  onSuccess 
}: PagamentoCRUDDialogProps) {
  const { toast } = useToast();
  const { alunos } = useApp();
  
  const [formData, setFormData] = useState({
    alunoId: '',
    tipo_pagamento: 'mensal',
    valor: '',
    data_vencimento: '',
    descricao: '',
    modo_pagamento: 'automatico',
    // Quick create aluno
    quickCreateAluno: false,
    novoAlunoNome: '',
    novoAlunoEmail: '',
    novoAlunoTelefone: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pagamento && mode === 'edit') {
      setFormData({
        alunoId: pagamento.aluno_id || '',
        tipo_pagamento: pagamento.tipo_pagamento || 'mensal',
        valor: pagamento.valor?.toString() || '',
        data_vencimento: pagamento.data_vencimento || '',
        descricao: pagamento.descricao || '',
        modo_pagamento: 'automatico',
        quickCreateAluno: false,
        novoAlunoNome: '',
        novoAlunoEmail: '',
        novoAlunoTelefone: ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
      
      setFormData({
        alunoId: '',
        tipo_pagamento: 'mensal',
        valor: '',
        data_vencimento: proximoMes.toISOString().split('T')[0],
        descricao: '',
        modo_pagamento: 'automatico',
        quickCreateAluno: false,
        novoAlunoNome: '',
        novoAlunoEmail: '',
        novoAlunoTelefone: ''
      });
    }
  }, [pagamento, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) throw new Error('Professor não encontrado');

      let alunoId = formData.alunoId;

      // Quick create aluno se necessário
      if (formData.quickCreateAluno && formData.novoAlunoNome) {
        const { data: novoAluno, error: alunoError } = await supabase
          .from('alunos')
          .insert({
            professor_id: professor.id,
            nome: formData.novoAlunoNome,
            email: formData.novoAlunoEmail || null,
            telefone: formData.novoAlunoTelefone || null,
            ativo: true
          })
          .select('id')
          .single();

        if (alunoError) throw alunoError;
        alunoId = novoAluno.id;
      }

      if (!alunoId) {
        throw new Error('Selecione um aluno ou crie um novo');
      }

      const pagamentoData = {
        professor_id: professor.id,
        aluno_id: alunoId,
        tipo_pagamento: formData.tipo_pagamento,
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        descricao: formData.descricao || null,
        status: 'pendente',
        payment_precedence: formData.modo_pagamento
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('pagamentos')
          .insert(pagamentoData);

        if (error) throw error;

        toast({
          title: 'Sucesso!',
          description: 'Pagamento criado com sucesso.'
        });
      } else {
        const { error } = await supabase
          .from('pagamentos')
          .update(pagamentoData)
          .eq('id', pagamento.id);

        if (error) throw error;

        toast({
          title: 'Sucesso!',
          description: 'Pagamento atualizado com sucesso.'
        });
      }

      onSuccess?.();
      onOpenChange(false);

    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar pagamento.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getValorSugerido = (tipo: string) => {
    switch (tipo) {
      case 'mensal': return '200.00';
      case 'pacote_4': return '320.00';
      case 'avulsa': return '80.00';
      case 'quinzenal': return '160.00';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {mode === 'create' ? 'Novo Pagamento' : 'Editar Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção/Criação de Aluno */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.quickCreateAluno}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, quickCreateAluno: checked }))
                }
              />
              <Label className="text-sm">Criar aluno rápido</Label>
            </div>

            {formData.quickCreateAluno ? (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                <Label>Novo Aluno</Label>
                <Input
                  placeholder="Nome completo *"
                  value={formData.novoAlunoNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, novoAlunoNome: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.novoAlunoEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, novoAlunoEmail: e.target.value }))}
                  />
                  <Input
                    placeholder="Telefone"
                    value={formData.novoAlunoTelefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, novoAlunoTelefone: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="alunoId">Aluno</Label>
                <Select
                  value={formData.alunoId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, alunoId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos.filter(a => a.ativo).map(aluno => (
                      <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Pagamento</Label>
            <Select
              value={formData.tipo_pagamento}
              onValueChange={(value) => {
                setFormData(prev => ({ 
                  ...prev, 
                  tipo_pagamento: value,
                  valor: getValorSugerido(value) 
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensalidade</SelectItem>
                <SelectItem value="pacote_4">Pacote 4 Aulas</SelectItem>
                <SelectItem value="avulsa">Aula Avulsa</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor e Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input
                id="vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Informações adicionais sobre este pagamento..."
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            />
          </div>

          {/* Modo de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="modo">Modo de Pagamento</Label>
            <Select
              value={formData.modo_pagamento}
              onValueChange={(value) => setFormData(prev => ({ ...prev, modo_pagamento: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatico">Automático (Mercado Pago)</SelectItem>
                <SelectItem value="manual">Manual (Marcar manualmente)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Pagamento' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}