import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface EditarAulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula: any;
}

export function EditarAulaDialog({ open, onOpenChange, aula }: EditarAulaDialogProps) {
  const { updateAula } = useApp();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    data: "",
    horario: "",
    status: "",
    motivo: "",
    observacoes: ""
  });

  useEffect(() => {
    if (aula) {
      setFormData({
        data: aula.data || "",
        horario: aula.horario || "",
        status: aula.status || "",
        motivo: aula.motivo || "",
        observacoes: aula.observacoes || ""
      });
    }
  }, [aula]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Data e horário são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const updateData: any = {
      data: formData.data,
      horario: formData.horario,
      status: formData.status,
      observacoes: formData.observacoes
    };

    if (formData.status === "cancelada" && formData.motivo) {
      updateData.motivoCancelamento = formData.motivo;
    }

    updateAula(aula.id, updateData);
    
    toast({
      title: "Sucesso!",
      description: "Aula atualizada com sucesso."
    });

    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Aula - {aula?.aluno}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange("data", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) => handleChange("horario", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "cancelada" && (
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do Cancelamento</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => handleChange("motivo", e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}