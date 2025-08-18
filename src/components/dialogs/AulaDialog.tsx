import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface AulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
  alunoNome?: string;
}

export function AulaDialog({ open, onOpenChange, alunoId, alunoNome }: AulaDialogProps) {
  const { alunos, addAula } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    alunoId: "",
    data: "",
    horario: "",
    horarioFim: "",
    observacoes: ""
  });

  // Atualiza o aluno quando props mudam
  useEffect(() => {
    if (alunoId) {
      setFormData(prev => ({ ...prev, alunoId }));
    }
  }, [alunoId]);

  // Reset form quando dialog fecha
  useEffect(() => {
    if (!open) {
      setFormData({
        alunoId: "",
        data: "",
        horario: "",
        horarioFim: "",
        observacoes: ""
      });
    }
  }, [open]);

  const gerarLinkMeet = () => {
    // Simula geração de link do Google Meet
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const gerarCodigo = () => Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `https://meet.google.com/${gerarCodigo()}-${gerarCodigo()}-${gerarCodigo()}`;
  };

  const calcularHorarioFim = (horarioInicio: string, duracaoMinutos: number) => {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const dataInicio = new Date();
    dataInicio.setHours(horas, minutos, 0);
    dataInicio.setMinutes(dataInicio.getMinutes() + duracaoMinutos);
    
    return dataInicio.toTimeString().slice(0, 5);
  };

  const gerarAulasMensais = (primeiraData: string, horario: string, alunoId: string, alunoNome: string) => {
    const aulas = [];
    const dataInicial = new Date(primeiraData);
    const aluno = alunos.find(a => a.id === alunoId);
    const duracaoMinutos = aluno?.duracaoAula || 50;
    const horarioFim = calcularHorarioFim(horario, duracaoMinutos);
    
    for (let i = 0; i < 4; i++) {
      const dataAula = new Date(dataInicial);
      dataAula.setDate(dataInicial.getDate() + (i * 7)); // Adiciona 7 dias para cada aula
      
      aulas.push({
        alunoId,
        aluno: alunoNome,
        data: dataAula.toISOString().split('T')[0],
        horario,
        horarioFim,
        duracaoMinutos,
        status: "agendada" as const,
        linkMeet: gerarLinkMeet(),
        observacoes: formData.observacoes || `Aula ${i + 1}/4 do mês - ${duracaoMinutos}min`
      });
    }
    
    return aulas;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.alunoId || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const aluno = alunos.find(a => a.id === formData.alunoId);
    if (!aluno) {
      toast({
        title: "Erro",
        description: "Aluno não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Gerar 4 aulas do mês
      const aulasGeradas = gerarAulasMensais(formData.data, formData.horario, formData.alunoId, aluno.nome);
      
      aulasGeradas.forEach(aula => {
        addAula(aula);
      });

      toast({
        title: "Sucesso",
        description: `4 aulas agendadas para ${aluno.nome}!`
      });
      
      // Reset form
      setFormData({
        alunoId: alunoId || "",
        data: "",
        horario: "",
        horarioFim: "",
        observacoes: ""
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao agendar aulas",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calcular horário de fim quando aluno ou horário mudam
      if (field === 'alunoId' || field === 'horario') {
        if (newData.alunoId && newData.horario) {
          const aluno = alunos.find(a => a.id === newData.alunoId);
          if (aluno) {
            newData.horarioFim = calcularHorarioFim(newData.horario, aluno.duracaoAula);
          }
        }
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar Aulas do Mês
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aluno">Aluno *</Label>
            <Select 
              value={formData.alunoId} 
              onValueChange={(value) => handleChange("alunoId", value)}
              disabled={!!alunoId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.filter(a => a.status === "ativo").map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="data">Data da 1ª Aula *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleChange("data", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario">Horário de Início *</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) => handleChange("horario", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="horarioFim">Horário de Término</Label>
              <Input
                id="horarioFim"
                type="time"
                value={formData.horarioFim}
                readOnly
                className="bg-muted"
                placeholder="Auto-calculado"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Informações adicionais..."
              rows={2}
            />
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            💡 Serão criadas 4 aulas semanais a partir da data selecionada, cada uma com link do Google Meet único.
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">Agendar Aulas</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}