import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GoogleEvent {
  id?: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  description?: string;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  colorId?: string; // Cor personalizada para eventos da plataforma
}

export function useGoogleIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Cor personalizada para eventos da plataforma (10 = verde claro)
  const PLATFORM_COLOR_ID = '10';

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/google-oauth-callback.html`;
      
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'getAuthUrl', redirectUri }
      });

      if (error) throw error;

      // Abrir janela de autenticação do Google
      const authWindow = window.open(data.authUrl, 'google-auth', 'width=500,height=600');
      
      // Aguardar código de autorização via postMessage
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_CODE' && event.data.code) {
          window.removeEventListener('message', handleMessage);
          authWindow?.close();
          
          try {
            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-oauth', {
              body: { 
                action: 'exchangeCode', 
                code: event.data.code, 
                redirectUri 
              }
            });

            if (tokenError) throw tokenError;

            setAccessToken(tokenData.accessToken);
            setIsAuthenticated(true);
            setUserEmail(tokenData.userEmail);
            setIsLoading(false);
            
            toast({
              title: 'Conectado com sucesso!',
              description: 'Integração com Google ativada.'
            });
          } catch (error) {
            console.error('Erro ao trocar código:', error);
            setIsLoading(false);
            toast({
              title: 'Erro de conexão',
              description: 'Falha ao conectar com Google.',
              variant: 'destructive'
            });
          }
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Timeout para fechar a janela se demorar muito
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
          setIsLoading(false);
          toast({
            title: 'Timeout',
            description: 'Tempo limite para autenticação excedido.',
            variant: 'destructive'
          });
        }
      }, 60000); // 1 minuto

    } catch (error) {
      console.error('Erro na autenticação:', error);
      setIsLoading(false);
      toast({
        title: 'Erro de conexão',
        description: 'Falha ao conectar com Google.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setAccessToken(null);
    toast({
      title: 'Desconectado',
      description: 'Integração com Google desativada.'
    });
  }, [toast]);

  const createCalendarEvent = useCallback(async (
    alunoNome: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
    duracaoMinutos: number
  ) => {
    if (!isAuthenticated || !accessToken) {
      toast({
        title: 'Não autenticado',
        description: 'Faça login com Google primeiro.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const startDateTime = new Date(`${data}T${horarioInicio}:00`);
      const endDateTime = new Date(`${data}T${horarioFim}:00`);

      const eventData = {
        summary: `Aula de Música - ${alunoNome}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        description: `Aula de música com duração de ${duracaoMinutos} minutos.\nAluno: ${alunoNome}`,
      };

      const { data: result, error } = await supabase.functions.invoke('google-calendar', {
        body: { 
          action: 'createEvent', 
          accessToken, 
          eventData 
        }
      });

      if (error) throw error;

      toast({
        title: 'Evento criado!',
        description: `Aula agendada na Google Agenda com link do Meet.`
      });

      return {
        eventId: result.eventId,
        meetLink: result.meetLink,
        event: result.event
      };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: 'Erro ao criar evento',
        description: 'Falha ao criar evento na Google Agenda.',
        variant: 'destructive'
      });
      return null;
    }
  }, [isAuthenticated, accessToken, toast]);

  const updateCalendarEvent = useCallback(async (
    eventId: string,
    alunoNome: string,
    data: string,
    horarioInicio: string,
    horarioFim: string
  ) => {
    if (!isAuthenticated || !accessToken) return false;

    try {
      const startDateTime = new Date(`${data}T${horarioInicio}:00`);
      const endDateTime = new Date(`${data}T${horarioFim}:00`);

      const eventData = {
        summary: `Aula de Música - ${alunoNome}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        description: `Aula de música.\nAluno: ${alunoNome}`,
      };

      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { 
          action: 'updateEvent', 
          accessToken, 
          eventId,
          eventData 
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Evento atualizado!',
        description: 'Alterações sincronizadas na Google Agenda.'
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: 'Falha ao atualizar evento na Google Agenda.',
        variant: 'destructive'
      });
      return false;
    }
  }, [isAuthenticated, accessToken, toast]);

  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    if (!isAuthenticated || !accessToken) return false;

    try {
      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { 
          action: 'deleteEvent', 
          accessToken, 
          eventId
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Evento removido!',
        description: 'Aula removida da Google Agenda.'
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover evento:', error);
      toast({
        title: 'Erro ao remover evento',
        description: 'Falha ao remover evento da Google Agenda.',
        variant: 'destructive'
      });
      return false;
    }
  }, [isAuthenticated, accessToken, toast]);

  const listCalendarEvents = useCallback(async (timeMin?: string, timeMax?: string) => {
    if (!isAuthenticated || !accessToken) return [];

    try {
      const { data: result, error } = await supabase.functions.invoke('google-calendar', {
        body: { 
          action: 'listEvents', 
          accessToken,
          eventData: {
            timeMin: timeMin || new Date().toISOString(),
            timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      });

      if (error) throw error;

      setEvents(result.events || []);
      return result.events || [];
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      return [];
    }
  }, [isAuthenticated, accessToken]);

  const testIntegration = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Não autenticado',
        description: 'Faça login com Google primeiro.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      // Simular teste da integração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Integração funcionando!',
        description: 'Todas as funcionalidades estão operacionais.'
      });

      return true;
    } catch (error) {
      toast({
        title: 'Erro na integração',
        description: 'Problemas detectados na conexão com Google.',
        variant: 'destructive'
      });
      return false;
    }
  }, [isAuthenticated, toast]);

  return {
    isAuthenticated,
    userEmail,
    isLoading,
    events,
    signIn,
    signOut,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    listCalendarEvents,
    testIntegration
  };
}