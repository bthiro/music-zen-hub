import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useApp } from "@/contexts/AppContext";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  RefreshCw, 
  Users, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Settings,
  ExternalLink
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

type ViewMode = 'month' | 'week' | 'day';

export function GoogleCalendarIntegration() {
  const { events, settings, isLoading, connectToGoogle, createEvent, refreshEvents } = useGoogleCalendar();
  const { aulas, alunos } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const syncAulaToGoogle = async (aula: any) => {
    const aluno = alunos.find(a => a.id === aula.alunoId);
    if (!aluno) return;

    const [hours, minutes] = aula.horario.split(':');
    const startDate = new Date(aula.data);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + aluno.duracao_aula);

    await createEvent({
      title: `Aula de Música - ${aula.aluno}`,
      start: startDate,
      end: endDate,
      description: `Aula particular de música\nAluno: ${aula.aluno}\nEmail: ${aluno.email}\nTelefone: ${aluno.telefone || 'Não informado'}`,
      attendeeEmail: aluno.email
    });
  };

  const getDateRange = () => {
    switch (viewMode) {
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: ptBR }),
          end: endOfWeek(currentDate, { locale: ptBR })
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate
        };
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      switch (viewMode) {
        case 'day':
          setCurrentDate(prev => new Date(prev.getTime() + 86400000));
          break;
        case 'week':
          setCurrentDate(prev => addWeeks(prev, 1));
          break;
        case 'month':
          setCurrentDate(prev => addMonths(prev, 1));
          break;
      }
    } else {
      switch (viewMode) {
        case 'day':
          setCurrentDate(prev => new Date(prev.getTime() - 86400000));
          break;
        case 'week':
          setCurrentDate(prev => subWeeks(prev, 1));
          break;
        case 'month':
          setCurrentDate(prev => subMonths(prev, 1));
          break;
      }
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (event.start.dateTime) {
        return isSameDay(new Date(event.start.dateTime), date);
      }
      if (event.start.date) {
        return isSameDay(new Date(event.start.date), date);
      }
      return false;
    });
  };

  const renderMonthView = () => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });
    
    return (
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
              className={`min-h-24 p-1 border border-border ${
                isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
              }`}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                    title={event.summary}
                  >
                    {event.summary}
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
    );
  };

  const renderWeekView = () => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={`text-center p-2 rounded ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                <div className="text-sm font-medium">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              <div className="space-y-1 min-h-32">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-2 bg-blue-100 text-blue-800 rounded"
                  >
                    <div className="font-medium truncate">{event.summary}</div>
                    {event.start.dateTime && (
                      <div className="text-xs text-blue-600">
                        {format(new Date(event.start.dateTime), 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-3">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE, dd MMMM yyyy', { locale: ptBR })}
          </h3>
        </div>
        
        <div className="space-y-2">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.summary}</h4>
                      {event.start.dateTime && event.end.dateTime && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.start.dateTime), 'HH:mm')} - {format(new Date(event.end.dateTime), 'HH:mm')}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">Agendado</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento agendado para hoje</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!settings.isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Integração Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Conectar ao Google Calendar</h3>
            <p className="text-muted-foreground mb-6">
              Sincronize suas aulas automaticamente com o Google Calendar e mantenha tudo organizado.
            </p>
            <Button onClick={connectToGoogle} disabled={isLoading} size="lg">
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-1">Sincronização Automática</h4>
              <p className="text-xs text-muted-foreground">Aulas criadas automaticamente na agenda</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1">Convites Automáticos</h4>
              <p className="text-xs text-muted-foreground">Alunos recebem convites por e-mail</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-1">Meet Integrado</h4>
              <p className="text-xs text-muted-foreground">Links do Google Meet automáticos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho do calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold min-w-48 text-center">
                  {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  {viewMode === 'week' && `${format(startOfWeek(currentDate), 'dd MMM', { locale: ptBR })} - ${format(endOfWeek(currentDate), 'dd MMM yyyy', { locale: ptBR })}`}
                  {viewMode === 'day' && format(currentDate, 'dd MMMM yyyy', { locale: ptBR })}
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Dia
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Mês
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                ● Conectado - {settings.userEmail}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => refreshEvents()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visualização do calendário */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Sincronização de aulas */}
      {aulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Sincronizar Aulas Agendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aulas.filter(a => a.status === 'agendada').slice(0, 3).map(aula => (
                <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{aula.aluno}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(aula.data), 'dd/MM/yyyy')} às {aula.horario}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => syncAulaToGoogle(aula)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Sincronizar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}