import { useState, useEffect, useCallback } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { EventModal } from "@/components/EventModal";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { supabase } from '@/integrations/supabase/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink, 
  Plus,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const { aulas, alunos, updateAula, addAula } = useApp();
  const { 
    isAuthenticated, 
    userEmail, 
    isLoading, 
    events, 
    signIn, 
    signOut, 
    createCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent, 
    listCalendarEvents 
  } = useGoogleIntegration();
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Carregar e sincronizar eventos
  const loadAllEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      // Combinar aulas locais com eventos do Google
      const localEvents = aulas.map(aula => {
        const aluno = alunos.find(a => a.id === aula.alunoId);
        return {
          id: `local-${aula.id}`,
          title: `${aula.observacoes || 'Aula'} - ${aluno?.nome || 'Aluno'}`,
          start: `${aula.data}T${aula.horario}:00`,
          end: new Date(new Date(`${aula.data}T${aula.horario}:00`).getTime() + (aula.duracaoMinutos || 50) * 60000).toISOString(),
          backgroundColor: aula.status === 'realizada' ? '#10b981' : 
                          aula.status === 'cancelada' ? '#ef4444' : '#3b82f6',
          borderColor: 'transparent',
          extendedProps: {
            type: 'local',
            aulaId: aula.id,
            alunoId: aula.alunoId,
            status: aula.status,
            meetLink: aula.linkMeet,
            googleEventId: null, // Will be fetched from raw data
            feedback: aula.observacoesAula,
            tema: aula.observacoes
          }
        };
      });

      let googleEvents = [];
      if (isAuthenticated) {
        const googleEventsList = await listCalendarEvents();
        googleEvents = googleEventsList.map((event: any) => ({
          id: `google-${event.id}`,
          title: event.summary || 'Evento sem título',
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          backgroundColor: '#059669',
          borderColor: 'transparent',
          extendedProps: {
            type: 'google',
            googleId: event.id,
            description: event.description,
            location: event.location,
            meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri
          }
        }));
      }

      setCalendarEvents([...localEvents, ...googleEvents]);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: 'Erro ao carregar agenda',
        description: 'Não foi possível sincronizar todos os eventos.',
        variant: 'destructive'
      });
    } finally {
      setLoadingEvents(false);
    }
  }, [aulas, alunos, isAuthenticated, listCalendarEvents, toast]);

  // Carregar eventos na inicialização e quando mudar autenticação
  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  // Manipular clique em data vazia (criar evento)
  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(new Date(selectInfo.start));
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  // Manipular clique em evento existente
  const handleEventClick = (clickInfo: any) => {
    const { extendedProps } = clickInfo.event;
    
    if (extendedProps.type === 'local') {
      // Evento local - abrir modal de edição de aula
      const aula = aulas.find(a => a.id === extendedProps.aulaId);
      const aluno = alunos.find(a => a.id === extendedProps.alunoId);
      
      if (aula && aluno) {
        setSelectedEvent({
          id: aula.id,
          type: 'local',
          title: `${aula.observacoes || 'Aula'} - ${aluno.nome}`,
          start: { dateTime: `${aula.data}T${aula.horario}` },
          end: { dateTime: new Date(new Date(`${aula.data}T${aula.horario}`).getTime() + (aula.duracaoMinutos || 50) * 60000).toISOString() },
          description: aula.observacoesAula,
          location: 'Online',
          meetLink: aula.linkMeet,
          extendedProps: {
            aulaId: aula.id,
            alunoId: aula.alunoId,
            alunoNome: aluno.nome,
            tema: aula.observacoes,
            feedback: aula.observacoesAula,
            status: aula.status,
            googleEventId: null // This would need to be fetched from raw database
          }
        });
      }
    } else {
      // Evento do Google - abrir modal de edição
      setSelectedEvent({
        id: extendedProps.googleId,
        type: 'google',
        title: clickInfo.event.title,
        start: { dateTime: clickInfo.event.startStr },
        end: { dateTime: clickInfo.event.endStr },
        description: extendedProps.description,
        location: extendedProps.location,
        meetLink: extendedProps.meetLink
      });
    }
    
    setSelectedDate(null);
    setEventModalOpen(true);
  };

  // Manipular drag & drop de eventos
  const handleEventDrop = async (dropInfo: any) => {
    const { event, delta } = dropInfo;
    const { extendedProps } = event;

    if (extendedProps.type === 'local') {
      // Atualizar aula local
      try {
        const newDate = new Date(event.startStr);
        await updateAula(extendedProps.aulaId, {
          data: newDate.toISOString().split('T')[0],
          horario: newDate.toTimeString().slice(0, 5)
        });

        // Se tem evento no Google, atualizar também
        if (extendedProps.googleEventId && isAuthenticated) {
          const endDate = new Date(new Date(event.startStr).getTime() + 50 * 60000);
          await updateCalendarEvent(
            extendedProps.googleEventId,
            event.title,
            newDate.toISOString().split('T')[0],
            newDate.toTimeString().slice(0, 5),
            endDate.toTimeString().slice(0, 5)
          );
        }

        await logAction('aula_reagendada', 'aulas', extendedProps.aulaId, {
          nova_data: event.startStr,
          google_sync: !!extendedProps.googleEventId
        });

        toast({
          title: 'Aula reagendada!',
          description: 'Horário atualizado com sucesso.'
        });

        await loadAllEvents();
      } catch (error) {
        console.error('Erro ao reagendar aula:', error);
        dropInfo.revert();
        toast({
          title: 'Erro ao reagendar',
          description: 'Não foi possível atualizar o horário.',
          variant: 'destructive'
        });
      }
    }
  };

  // Salvar evento (criar/editar)
  const handleSaveEvent = async (eventData: any) => {
    try {
      if (selectedEvent?.type === 'local') {
        // Atualizar aula local existente
        const startDate = new Date(eventData.start.dateTime);
        const endDate = new Date(eventData.end.dateTime);
        const duracaoMinutos = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

        await updateAula(selectedEvent.extendedProps.aulaId, {
          data: startDate.toISOString().split('T')[0],
          horario: startDate.toTimeString().slice(0, 5),
          duracaoMinutos: duracaoMinutos,
          observacoes: eventData.title.split(' - ')[0] || eventData.title,
          observacoesAula: eventData.description || ''
        });

        // Sincronizar com Google se conectado e tem evento vinculado
        if (selectedEvent.extendedProps.googleEventId && isAuthenticated) {
          await updateCalendarEvent(
            selectedEvent.extendedProps.googleEventId,
            eventData.title,
            startDate.toISOString().split('T')[0],
            startDate.toTimeString().slice(0, 5),
            endDate.toTimeString().slice(0, 5)
          );
        }

        await logAction('aula_atualizada', 'aulas', selectedEvent.extendedProps.aulaId);
        
      } else if (selectedEvent?.type === 'google') {
        // Atualizar evento do Google
        if (isAuthenticated) {
          const startDate = new Date(eventData.start.dateTime);
          const endDate = new Date(eventData.end.dateTime);
          
          await updateCalendarEvent(
            selectedEvent.id,
            eventData.title,
            startDate.toISOString().split('T')[0],
            startDate.toTimeString().slice(0, 5),
            endDate.toTimeString().slice(0, 5)
          );
        }
        
      } else {
        // Criar novo evento/aula
        const startDate = new Date(eventData.start.dateTime);
        const endDate = new Date(eventData.end.dateTime);
        const duracaoMinutos = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

        // Se especificou um aluno, criar como aula local
        if (eventData.extendedProps?.alunoId) {
          await addAula({
            alunoId: eventData.extendedProps.alunoId,
            data: startDate.toISOString().split('T')[0],
            horario: startDate.toTimeString().slice(0, 5),
            duracaoMinutos: duracaoMinutos,
            observacoes: eventData.title,
            observacoesAula: eventData.description || '',
            status: 'agendada',
            aluno: ''
          });

          // Sincronizar com Google se conectado
          if (isAuthenticated) {
            try {
              await createCalendarEvent(
                eventData.extendedProps.alunoNome || 'Aluno',
                startDate.toISOString().split('T')[0],
                startDate.toTimeString().slice(0, 5),
                endDate.toTimeString().slice(0, 5),
                duracaoMinutos
              );
            } catch (error) {
              console.error('Erro ao criar evento no Google:', error);
            }
          }

          await logAction('aula_criada', 'aulas', eventData.extendedProps.alunoId);
          
        } else if (isAuthenticated) {
          // Criar apenas no Google Calendar
          await createCalendarEvent(
            eventData.title,
            startDate.toISOString().split('T')[0],
            startDate.toTimeString().slice(0, 5),
            endDate.toTimeString().slice(0, 5),
            duracaoMinutos
          );
        }
      }

      toast({
        title: 'Evento salvo!',
        description: 'Agenda atualizada com sucesso.'
      });

      await loadAllEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o evento.',
        variant: 'destructive'
      });
    }
  };

  // Deletar evento
  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (selectedEvent?.type === 'local') {
        // Cancelar aula local
        await updateAula(selectedEvent.extendedProps.aulaId, { status: 'cancelada' });

        // Deletar do Google se conectado
        if (selectedEvent.extendedProps.googleEventId && isAuthenticated) {
          await deleteCalendarEvent(selectedEvent.extendedProps.googleEventId);
        }

        await logAction('aula_cancelada', 'aulas', selectedEvent.extendedProps.aulaId);
        
      } else if (selectedEvent?.type === 'google' && isAuthenticated) {
        // Deletar apenas do Google
        await deleteCalendarEvent(selectedEvent.id);
      }

      toast({
        title: 'Evento removido!',
        description: 'Evento deletado da agenda.'
      });

      await loadAllEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível remover o evento.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">Agenda</h2>
            <p className="text-muted-foreground">
              Gerencie suas aulas e compromissos
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Google conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                Google desconectado
              </Badge>
            )}
            
            <Button variant="outline" size="sm" onClick={loadAllEvents} disabled={loadingEvents}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingEvents ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Google Calendar Connection */}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Conectar Google Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Sincronização com Google Calendar</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conecte para sincronizar automaticamente suas aulas e gerar links do Meet.
                  </p>
                </div>
                <Button onClick={signIn} disabled={isLoading} size="sm">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Conectar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendário
              </span>
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Google Calendar
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <Settings className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale="pt-br"
                events={calendarEvents}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={3}
                weekends={true}
                editable={true}
                droppable={true}
                eventResizableFromStart={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                height="auto"
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
                allDaySlot={false}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6], // Segunda a sábado
                  startTime: '08:00',
                  endTime: '20:00'
                }}
                eventDisplay="block"
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        alunos={alunos}
      />

      <style>{`
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid hsl(var(--border));
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid hsl(var(--border));
        }
        .fc-theme-standard .fc-scrollgrid-sync-table {
          border: none;
        }
        .fc-button-primary {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }
        .fc-button-primary:hover {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
          opacity: 0.9;
        }
        .fc-daygrid-event {
          border-radius: 4px;
          border: none;
          padding: 2px 4px;
          font-size: 0.75rem;
        }
        .fc-event-time {
          font-weight: 600;
        }
        .fc-event-title {
          font-weight: 500;
        }
        .fc-day-today {
          background-color: hsl(var(--accent)) !important;
        }
        .fc-col-header-cell {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
}