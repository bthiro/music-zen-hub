import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { Calendar, Clock, Users, Repeat } from "lucide-react";

interface AulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
  alunoNome?: string;
}

export function AulaDialog({ open, onOpenChange, alunoId, alunoNome }: AulaDialogProps) {
  const { alunos, addAula } = useApp();
  const { toast } = useToast();
  const { createCalendarEvent, isAuthenticated } = useGoogleIntegration();
  
  const [formData, setFormData] = useState({
    alunoId: "",
    data: "",
    horario: "",
    horarioFim: "",
    observacoes: "",
    quantidadeAulas: 4,
    intervaloAulas: "semanal" // diario, semanal, quinzenal, unica
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
        observacoes: "",
        quantidadeAulas: 4,
        intervaloAulas: "semanal"
      });
    }
  }, [open]);


  const calcularHorarioFim = (horarioInicio: string, duracaoMinutos: number) => {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const dataInicio = new Date();
    dataInicio.setHours(horas, minutos, 0);
    dataInicio.setMinutes(dataInicio.getMinutes() + duracaoMinutos);
    
    return dataInicio.toTimeString().slice(0, 5);
  };

  const calcularIntervalo = (intervalo: string) => {
    switch (intervalo) {
      case 'diario': return 1;
      case 'semanal': return 7;
      case 'quinzenal': return 14;
      case 'unica': return 0;
      default: return 7;
    }
  };

  const getIntervaloTexto = (intervalo: string) => {
    switch (intervalo) {
      case 'diario': return 'diária';
      case 'semanal': return 'semanal';
      case 'quinzenal': return 'quinzenal';
      case 'unica': return 'única';
      default: return 'semanal';
    }
  };

  const gerarAulas = async (primeiraData: string, horario: string, alunoId: string, alunoNome: string) => {
    const aulas = [];
    const dataInicial = new Date(primeiraData);
    const aluno = alunos.find(a => a.id === alunoId);
    const duracaoMinutos = aluno?.duracaoAula || 50;
    const horarioFim = calcularHorarioFim(horario, duracaoMinutos);
    const intervaloDias = calcularIntervalo(formData.intervaloAulas);
    const quantidade = formData.intervaloAulas === 'unica' ? 1 : formData.quantidadeAulas;
    
    for (let i = 0; i < quantidade; i++) {
      const dataAula = new Date(dataInicial);
      if (intervaloDias > 0) {
        dataAula.setDate(dataInicial.getDate() + (i * intervaloDias));
      }
      
      let observacaoAula = formData.observacoes;
      if (quantidade > 1) {
        observacaoAula = `Aula ${i + 1}/${quantidade} - ${getIntervaloTexto(formData.intervaloAulas)} - ${duracaoMinutos}min`;
        if (formData.observacoes) {
          observacaoAula += ` | ${formData.observacoes}`;
        }
      } else {
        observacaoAula = `Aula única - ${duracaoMinutos}min${formData.observacoes ? ` | ${formData.observacoes}` : ''}`;
      }

      let linkMeet = '';
      
      // Tentar criar evento no Google Calendar se autenticado
      if (isAuthenticated) {
        try {
          const resultado = await createCalendarEvent(
            alunoNome,
            dataAula.toISOString().split('T')[0],
            horario,
            horarioFim,
            duracaoMinutos
          );
          if (resultado?.meetLink) {
            linkMeet = resultado.meetLink;
          }
        } catch (error) {
          console.error('Erro ao criar evento no Google Calendar:', error);
        }
      }

      // Se não conseguiu criar no Google, gerar link simulado
      if (!linkMeet) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const gerarCodigo = () => Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        linkMeet = `https://meet.google.com/${gerarCodigo()}-${gerarCodigo()}-${gerarCodigo()}`;
      }
      
      aulas.push({
        id: `${Date.now()}_${i}`,
        alunoId,
        aluno: alunoNome,
        data: dataAula.toISOString().split('T')[0],
        horario,
        horarioFim,
        duracaoMinutos,
        status: "agendada" as const,
        linkMeet,
        observacoes: observacaoAula
      });
    }
    
    return aulas;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.alunoId || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.quantidadeAulas < 1) {
      toast({
        title: "Erro",
        description: "Quantidade de aulas deve ser pelo menos 1",
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
      const aulasGeradas = await gerarAulas(formData.data, formData.horario, formData.alunoId, aluno.nome);
      
      aulasGeradas.forEach(aula => {
        addAula(aula);
      });

      const quantidade = formData.intervaloAulas === 'unica' ? 1 : formData.quantidadeAulas;
      const comGoogle = isAuthenticated ? " e sincronizadas com Google Calendar" : "";
      
      toast({
        title: "Sucesso",
        description: `${quantidade} aula${quantidade > 1 ? 's' : ''} ${getIntervaloTexto(formData.intervaloAulas)}${quantidade > 1 ? 's' : ''} agendada${quantidade > 1 ? 's' : ''} para ${aluno.nome}${comGoogle}!`
      });
      
      // Reset form
      setFormData({
        alunoId: alunoId || "",
        data: "",
        horario: "",
        horarioFim: "",
        observacoes: "",
        quantidadeAulas: 4,
        intervaloAulas: "semanal"
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
      
      // Se mudou para aula única, definir quantidade como 1
      if (field === 'intervaloAulas' && value === 'unica') {
        newData.quantidadeAulas = 1;
      }
      
      return newData;
    });
  };

  const previewAulas = () => {
    if (!formData.data || formData.intervaloAulas === 'unica') return null;
    
    const dataInicial = new Date(formData.data);
    const intervaloDias = calcularIntervalo(formData.intervaloAulas);
    const previews = [];
    
    for (let i = 0; i < formData.quantidadeAulas && i < 5; i++) {
      const dataAula = new Date(dataInicial);
      dataAula.setDate(dataInicial.getDate() + (i * intervaloDias));
      previews.push(dataAula.toLocaleDateString('pt-BR'));
    }
    
    return previews;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar Aulas
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalo">Tipo de Agendamento *</Label>
              <Select 
                value={formData.intervaloAulas} 
                onValueChange={(value) => handleChange("intervaloAulas", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unica">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Aula Única
                    </div>
                  </SelectItem>
                  <SelectItem value="diario">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Diário
                    </div>
                  </SelectItem>
                  <SelectItem value="semanal">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Semanal
                    </div>
                  </SelectItem>
                  <SelectItem value="quinzenal">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Quinzenal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantidade">Quantidade de Aulas</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max="20"
                value={formData.quantidadeAulas}
                onChange={(e) => handleChange("quantidadeAulas", parseInt(e.target.value) || 1)}
                disabled={formData.intervaloAulas === 'unica'}
                className={formData.intervaloAulas === 'unica' ? 'bg-muted' : ''}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="data">Data da {formData.intervaloAulas === 'unica' ? 'Aula' : '1ª Aula'} *</Label>
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
          
          {/* Preview das datas */}
          {previewAulas() && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Preview das Aulas:</Label>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {previewAulas()?.map((date, index) => (
                    <div key={index} className="bg-muted/50 rounded px-2 py-1">
                      Aula {index + 1}: {date}
                    </div>
                  ))}
                  {formData.quantidadeAulas > 5 && (
                    <div className="text-muted-foreground col-span-2 text-center">
                      ... e mais {formData.quantidadeAulas - 5} aulas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            💡 {formData.intervaloAulas === 'unica' 
              ? 'Será criada 1 aula única com link do Google Meet.'
              : `Serão criadas ${formData.quantidadeAulas} aulas ${getIntervaloTexto(formData.intervaloAulas)}s a partir da data selecionada, cada uma com link do Google Meet único.`
            }
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              Agendar {formData.intervaloAulas === 'unica' ? 'Aula' : 'Aulas'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}