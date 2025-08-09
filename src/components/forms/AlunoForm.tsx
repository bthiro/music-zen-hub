import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";

interface AlunoFormProps {
  aluno?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AlunoForm({ aluno, onSuccess, onCancel }: AlunoFormProps) {
  const { adicionarAluno, atualizarAluno } = useSupabaseData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: aluno?.nome || "",
    email: aluno?.email || "",
    telefone: aluno?.telefone || "",
    instrumento: aluno?.instrumento || "",
    nivel: aluno?.nivel || "iniciante",
    observacoes: aluno?.observacoes || "",
    valor_mensalidade: aluno?.valor_mensalidade || 200,
    duracao_aula: aluno?.duracao_aula || 50,
    data_nascimento: aluno?.data_nascimento || "",
    endereco: aluno?.endereco || ""
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.nome || !formData.instrumento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = aluno 
        ? await atualizarAluno(aluno.id, formData)
        : await adicionarAluno(formData);

      if (error) {
        const errorMessage = typeof error === 'string' ? error : error.message || "Erro ao salvar aluno";
        throw new Error(errorMessage);
      }

      toast({
        title: "Sucesso",
        description: aluno ? "Aluno atualizado com sucesso!" : "Aluno cadastrado com sucesso!"
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar aluno",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{aluno ? "Editar Aluno" : "Novo Aluno"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Nome completo do aluno"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="instrumento">Instrumento *</Label>
              <Select value={formData.instrumento} onValueChange={(value) => handleChange("instrumento", value)}>
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
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nivel">Nível</Label>
              <Select value={formData.nivel} onValueChange={(value) => handleChange("nivel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valor_mensalidade">Valor Mensalidade (R$)</Label>
              <Input
                id="valor_mensalidade"
                type="number"
                value={formData.valor_mensalidade}
                onChange={(e) => handleChange("valor_mensalidade", Number(e.target.value))}
                placeholder="200"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label htmlFor="duracao_aula">Duração da Aula (min)</Label>
              <Select value={formData.duracao_aula.toString()} onValueChange={(value) => handleChange("duracao_aula", Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Duração da aula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="50">50 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange("data_nascimento", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Endereço completo (opcional)"
            />
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Anotações sobre o aluno, objetivos, horários preferidos, etc."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (aluno ? "Atualizar" : "Cadastrar")}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}