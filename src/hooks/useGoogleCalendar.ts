import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
}

interface CalendarSettings {
  isConnected: boolean;
  userEmail: string | null;
  calendarId: string | null;
}

export function useGoogleCalendar() {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [settings, setSettings] = useState<CalendarSettings>({
    isConnected: false,
    userEmail: null,
    calendarId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulação de conexão com Google Calendar
  const connectToGoogle = async () => {
    setIsLoading(true);
    try {
      // Simular processo de autenticação OAuth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSettings({
        isConnected: true,
        userEmail: 'professor@example.com',
        calendarId: 'primary'
      });
      
      toast({
        title: "Google Calendar conectado!",
        description: "Sincronização ativada com sucesso"
      });
      
      // Carregar eventos após conexão
      await loadEvents();
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async (startDate?: Date, endDate?: Date) => {
    if (!settings.isConnected) return;
    
    setIsLoading(true);
    try {
      // Simular carregamento de eventos do Google Calendar
      const mockEvents: GoogleCalendarEvent[] = [
        {
          id: '1',
          summary: 'Aula de Piano - Ana Silva',
          start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
          end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString() },
          description: 'Aula de piano nível intermediário',
          location: 'Online - Google Meet'
        },
        {
          id: '2',
          summary: 'Aula de Violão - Pedro Costa',
          start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
          end: { dateTime: new Date(Date.now() + 172800000 + 3000000).toISOString() },
          description: 'Revisão de acordes básicos'
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível sincronizar com o Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    attendeeEmail?: string;
  }) => {
    if (!settings.isConnected) {
      toast({
        title: "Google Calendar não conectado",
        description: "Conecte-se ao Google Calendar primeiro",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Simular criação de evento
      const newEvent: GoogleCalendarEvent = {
        id: Date.now().toString(),
        summary: eventData.title,
        start: { dateTime: eventData.start.toISOString() },
        end: { dateTime: eventData.end.toISOString() },
        description: eventData.description,
        attendees: eventData.attendeeEmail ? [
          { email: eventData.attendeeEmail, responseStatus: 'needsAction' }
        ] : undefined
      };

      setEvents(prev => [...prev, newEvent]);
      
      toast({
        title: "Evento criado!",
        description: `"${eventData.title}" foi adicionado ao Google Calendar`
      });
      
      return newEvent;
    } catch (error) {
      toast({
        title: "Erro ao criar evento",
        description: "Não foi possível adicionar o evento ao Google Calendar",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!settings.isConnected) return false;

    setIsLoading(true);
    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: "Evento removido",
        description: "Evento foi removido do Google Calendar"
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao remover evento",
        description: "Não foi possível remover o evento",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar eventos na inicialização se já estiver conectado
  useEffect(() => {
    if (settings.isConnected) {
      loadEvents();
    }
  }, [settings.isConnected]);

  return {
    events,
    settings,
    isLoading,
    connectToGoogle,
    loadEvents,
    createEvent,
    deleteEvent,
    refreshEvents: loadEvents
  };
}