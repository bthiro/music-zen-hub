import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Save, Trash2 } from 'lucide-react';

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any;
  selectedDate?: Date;
  onSave: (eventData: any) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export function EventModal({ 
  open, 
  onOpenChange, 
  event, 
  selectedDate, 
  onSave, 
  onDelete 
}: EventModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  });

  // Preencher formulário quando abrir modal
  useEffect(() => {
    if (open) {
      if (event) {
        // Editando evento existente
        const startDate = event.start?.dateTime ? new Date(event.start.dateTime) : new Date();
        const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : new Date();
        
        setFormData({
          summary: event.summary || '',
          description: event.description || '',
          date: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5),
          location: event.location || ''
        });
      } else if (selectedDate) {
        // Criando novo evento
        const date = selectedDate.toISOString().split('T')[0];
        const startTime = '09:00';
        const endTime = '10:00';
        
        setFormData({
          summary: '',
          description: '',
          date,
          startTime,
          endTime,
          location: ''
        });
      }
    }
  }, [open, event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.summary.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

      const eventData = {
        summary: formData.summary,
        description: formData.description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        location: formData.location
      };

      await onSave(eventData);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        summary: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: ''
      });
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(event.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="summary">Título *</Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Título do evento"
            />
          </div>
          
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">Horário de Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Local do evento (opcional)"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do evento (opcional)"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            
            {event && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}