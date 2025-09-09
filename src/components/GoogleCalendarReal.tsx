import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { useApp } from "@/contexts/AppContext";
import { EventModal } from "@/components/EventModal";
import { Calendar as CalendarIcon, RefreshCw, ExternalLink, Plus, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export function GoogleCalendarReal() {
  const { isAuthenticated, userEmail, isLoading, events, signIn, signOut, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, listCalendarEvents } = useGoogleIntegration();
  const { aulas, alunos, updateAula } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const proximasAulas = aulas
    .filter((a) => a.status === "agendada")
    .slice(0, 3);

  // Carregar eventos quando autenticar
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    await listCalendarEvents(start.toISOString(), end.toISOString());
    setLoadingEvents(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  // Recarregar eventos quando mudar mês
  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (event.start?.dateTime) {
        return isSameDay(new Date(event.start.dateTime), date);
      }
      if (event.start?.date) {
        return isSameDay(new Date(event.start.date), date);
      }
      return false;
    });
  };

  const openCreateEventModal = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  const openEditEventModal = (event: any) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (selectedEvent) {
        // Atualizando evento existente
        const startDate = new Date(eventData.start.dateTime);
        const endDate = new Date(eventData.end.dateTime);
        await updateCalendarEvent(
          selectedEvent.id, 
          eventData.summary, 
          startDate.toISOString().split('T')[0], 
          startDate.toTimeString().slice(0, 5), 
          endDate.toTimeString().slice(0, 5)
        );
      } else {
        // Criando novo evento
        const startDate = new Date(eventData.start.dateTime);
        const endDate = new Date(eventData.end.dateTime);
        
        await createCalendarEvent(
          eventData.summary,
          startDate.toISOString().split('T')[0],
          startDate.toTimeString().slice(0, 5),
          endDate.toTimeString().slice(0, 5),
          Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
        );
      }
      
      // Recarregar eventos
      await loadEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    }
  };

  const syncAula = async (aula: any) => {
    const aluno = alunos.find((a) => a.id === aula.alunoId);
    if (!aluno) return;

    // Calcular horário fim se não existir
    const [h, m] = aula.horario.split(":").map((n: string) => parseInt(n, 10));
    const inicio = new Date(`${aula.data}T${aula.horario}:00`);
    const duracao = aluno.duracaoAula ?? aula.duracaoMinutos ?? 50;
    const fimDate = new Date(inicio);
    fimDate.setMinutes(fimDate.getMinutes() + duracao);
    const horarioFim = `${String(fimDate.getHours()).padStart(2, "0")}:${String(fimDate.getMinutes()).padStart(2, "0")}`;

    setSyncingId(aula.id);
    try {
      const resultado = await createCalendarEvent(
        aula.aluno,
        aula.data,
        aula.horario,
        horarioFim,
        duracao
      );

      // Atualizar a aula com o link real do Meet
      if (resultado?.meetLink) {
        updateAula(aula.id, { linkMeet: resultado.meetLink });
      }

      // Recarregar eventos
      await loadEvents();
    } finally {
      setSyncingId(null);
    }
  };

  const renderCalendarView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-48 text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openCreateEventModal(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
            <Button variant="outline" size="sm" onClick={loadEvents} disabled={loadingEvents}>
              <RefreshCw className={`h-4 w-4 ${loadingEvents ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dos dias da semana */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Dias do mês */}
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-20 p-1 border border-border ${
                  isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                } cursor-pointer group`}
                onClick={() => openCreateEventModal(day)}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''} flex items-center justify-between`}>
                  {format(day, 'd')}
                  {dayEvents.length === 0 && (
                    <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-green-100 text-green-800 rounded truncate hover:bg-green-200 cursor-pointer flex items-center justify-between group"
                      title={event.summary}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEventModal(event);
                      }}
                    >
                      <div>
                        {event.summary}
                        {event.start?.dateTime && (
                          <div className="text-xs text-green-600">
                            {format(new Date(event.start.dateTime), 'HH:mm')}
                          </div>
                        )}
                      </div>
                      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Integração Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="py-6">
              <CalendarIcon className="h-14 w-14 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="text-base font-semibold mb-2">Conectar ao Google Calendar</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Conecte sua conta do Google para sincronizar suas aulas automaticamente.
              </p>
              <Button onClick={signIn} disabled={isLoading} size="sm">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Conectar Google Calendar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" /> Google Calendar
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ● Conectado — {userEmail}
                  </Badge>
                  <Button asChild variant="outline" size="sm">
                    <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> Abrir
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    Desconectar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCalendarView()}
            </CardContent>
          </Card>

          {proximasAulas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sincronizar próximas aulas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {proximasAulas.map((aula) => (
                  <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{aula.aluno}</div>
                      <div className="text-xs text-muted-foreground">{new Date(aula.data).toLocaleDateString("pt-BR")} às {aula.horario}</div>
                    </div>
                    <Button size="sm" onClick={() => syncAula(aula)} disabled={syncingId === aula.id}>
                      {syncingId === aula.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Sincronizar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}