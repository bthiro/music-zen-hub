import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp, Aluno } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface AlunoFormProps {
  aluno?: Aluno;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AlunoForm({ aluno, onSuccess, onCancel }: AlunoFormProps) {
  const { addAluno, updateAluno } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: aluno?.nome || "",
    email: aluno?.email || "",
    telefone: aluno?.telefone || "",
    cidade: aluno?.cidade || "",
    estado: aluno?.estado || "",
    pais: aluno?.pais || "Brasil",
    mensalidade: aluno?.mensalidade || 0,
    duracaoAula: aluno?.duracaoAula || 50,
    status: aluno?.status || "ativo",
    observacoes: aluno?.observacoes || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.mensalidade || !formData.duracaoAula || !formData.cidade || !formData.estado) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (aluno) {
        updateAluno(aluno.id, formData);
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso!"
        });
      } else {
        addAluno(formData);
        toast({
          title: "Sucesso", 
          description: "Aluno cadastrado com sucesso!"
        });
      }
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar aluno",
        variant: "destructive"
      });
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
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                placeholder="SP"
              />
            </div>

            <div>
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => handleChange("pais", e.target.value)}
                placeholder="Brasil"
              />
            </div>
            
            <div>
              <Label htmlFor="mensalidade">Mensalidade *</Label>
              <Input
                id="mensalidade"
                type="number"
                value={formData.mensalidade}
                onChange={(e) => handleChange("mensalidade", Number(e.target.value))}
                placeholder="200"
              />
            </div>
            
            <div>
              <Label htmlFor="duracaoAula">Duração da Aula *</Label>
              <Select value={formData.duracaoAula.toString()} onValueChange={(value) => handleChange("duracaoAula", Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="50">50 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais sobre o aluno..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {aluno ? "Atualizar" : "Cadastrar"}
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