import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

interface ReagendarLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId: string;
  alunoNome: string;
}

export function ReagendarLoteDialog({ open, onOpenChange, alunoId, alunoNome }: ReagendarLoteDialogProps) {
  const { aulas, updateAula } = useApp();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    dataInicio: "",
    novoHorario: "",
    diaSemana: ""
  });

  // Resetar formulário quando o dialog abrir
  useEffect(() => {
    if (open) {
      setFormData({
        dataInicio: "",
        novoHorario: "",
        diaSemana: ""
      });
    }
  }, [open]);

  // Filtrar aulas futuras do aluno
  const aulasFuturas = aulas.filter(aula => {
    const dataAula = new Date(aula.data);
    const hoje = new Date();
    return aula.alunoId === alunoId && 
           dataAula >= hoje && 
           aula.status === "agendada";
  }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataInicio || !formData.novoHorario) {
      toast({
        title: "Erro",
        description: "Data de início e horário são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const dataInicio = new Date(formData.dataInicio);
    
    // Filtrar aulas a partir da data especificada
    const aulasParaReagendar = aulasFuturas.filter(aula => {
      const dataAula = new Date(aula.data);
      return dataAula >= dataInicio;
    });

    if (aulasParaReagendar.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhuma aula encontrada a partir da data especificada",
        variant: "destructive"
      });
      return;
    }

    // Reagendar cada aula
    let contadorSemanas = 0;
    aulasParaReagendar.forEach((aula, index) => {
      const novaData = new Date(dataInicio);
      
      // Se especificou dia da semana, calcular baseado nisso
      if (formData.diaSemana) {
        const diaSemanaNum = parseInt(formData.diaSemana);
        const diaAtual = novaData.getDay();
        const diasAte = (diaSemanaNum - diaAtual + 7) % 7;
        novaData.setDate(novaData.getDate() + diasAte + (contadorSemanas * 7));
        contadorSemanas++;
      } else {
        // Caso contrário, manter intervalo semanal baseado na primeira data
        novaData.setDate(dataInicio.getDate() + (index * 7));
      }

      updateAula(aula.id, {
        data: novaData.toISOString().split('T')[0],
        horario: formData.novoHorario
      });
    });
    
    toast({
      title: "Sucesso!",
      description: `${aulasParaReagendar.length} aulas foram reagendadas para ${alunoNome}.`
    });

    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const diasSemana = [
    { value: "1", label: "Segunda-feira" },
    { value: "2", label: "Terça-feira" },
    { value: "3", label: "Quarta-feira" },
    { value: "4", label: "Quinta-feira" },
    { value: "5", label: "Sexta-feira" },
    { value: "6", label: "Sábado" },
    { value: "0", label: "Domingo" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reagendar Aulas em Lote - {alunoNome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Aulas Futuras Encontradas:</p>
            <p className="text-sm text-muted-foreground">
              {aulasFuturas.length} aulas agendadas
            </p>
            {aulasFuturas.slice(0, 3).map((aula) => (
              <p key={aula.id} className="text-xs text-muted-foreground">
                {new Date(aula.data).toLocaleDateString('pt-BR')} às {aula.horario}
              </p>
            ))}
            {aulasFuturas.length > 3 && (
              <p className="text-xs text-muted-foreground">
                ...e mais {aulasFuturas.length - 3} aulas
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início (a partir de quando reagendar) *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleChange("dataInicio", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="novoHorario">Novo Horário *</Label>
              <Input
                id="novoHorario"
                type="time"
                value={formData.novoHorario}
                onChange={(e) => handleChange("novoHorario", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diaSemana">Dia da Semana (opcional)</Label>
              <Select value={formData.diaSemana} onValueChange={(value) => handleChange("diaSemana", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Manter intervalos semanais ou escolher dia fixo" />
                </SelectTrigger>
                <SelectContent>
                  {diasSemana.map((dia) => (
                    <SelectItem key={dia.value} value={dia.value}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se não especificar, as aulas serão reagendadas mantendo intervalos semanais
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Calendar className="h-4 w-4 mr-2" />
                Reagendar {aulasFuturas.length} Aulas
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}