import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface AlunoFormProps {
  aluno?: any;
  onClose: () => void;
}

export function SupabaseAlunosForm({ aluno, onClose }: AlunoFormProps) {
  const { adicionarAluno, atualizarAluno } = useSupabaseData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isEditing = !!aluno;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dadosAluno = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      telefone: formData.get('telefone') as string,
      instrumento: formData.get('instrumento') as string,
      nivel: formData.get('nivel') as string,
      observacoes: formData.get('observacoes') as string,
    };

    try {
      // Validação básica
      if (!dadosAluno.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!dadosAluno.instrumento) {
        throw new Error('Instrumento é obrigatório');
      }

      const { error } = isEditing 
        ? await atualizarAluno(aluno.id, dadosAluno)
        : await adicionarAluno(dadosAluno);

      if (error) {
        console.error('Erro do Supabase:', error);
        const errorMessage = typeof error === 'string' ? error : error.message || 'Erro ao salvar no banco de dados';
        throw new Error(errorMessage);
      }

      toast({
        title: isEditing ? 'Aluno atualizado!' : 'Aluno adicionado!',
        description: `${dadosAluno.nome} foi ${isEditing ? 'atualizado' : 'adicionado'} com sucesso.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Erro completo ao salvar aluno:', error);
      toast({
        title: 'Erro ao salvar aluno',
        description: error.message || 'Verifique se todos os campos obrigatórios estão preenchidos corretamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Atualize as informações do aluno' : 'Adicione um novo aluno ao seu estúdio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={aluno?.nome || ''}
                placeholder="Nome do aluno"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={aluno?.email || ''}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                defaultValue={aluno?.telefone || ''}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrumento">Instrumento *</Label>
              <Select name="instrumento" defaultValue={aluno?.instrumento || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o instrumento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violao">Violão</SelectItem>
                  <SelectItem value="guitarra">Guitarra</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="bateria">Bateria</SelectItem>
                  <SelectItem value="piano">Piano</SelectItem>
                  <SelectItem value="teclado">Teclado</SelectItem>
                  <SelectItem value="canto">Canto</SelectItem>
                  <SelectItem value="flauta">Flauta</SelectItem>
                  <SelectItem value="saxofone">Saxofone</SelectItem>
                  <SelectItem value="violino">Violino</SelectItem>
                  <SelectItem value="viola">Viola</SelectItem>
                  <SelectItem value="viola-caipira">Viola Caipira</SelectItem>
                  <SelectItem value="violoncelo">Violoncelo</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nível</Label>
              <Select name="nivel" defaultValue={aluno?.nivel || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              defaultValue={aluno?.observacoes || ''}
              placeholder="Anotações sobre o aluno, objetivos, horários preferidos, etc."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}