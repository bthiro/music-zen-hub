import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useConversionMetrics } from '@/hooks/useConversionMetrics';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useConversionMetrics();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando autenticação...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('[AuthCallback] Starting callback processing, URL:', window.location.href);
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      
      if (error) {
        console.error('[AuthCallback] Exchange error:', error);
        throw new Error(`Erro na autenticação: ${error.message}`);
      }
      
      if (!data.user) {
        console.error('[AuthCallback] No user data returned');
        throw new Error('Dados do usuário não encontrados');
      }

      console.log('[AuthCallback] Successfully exchanged code for session');

      setMessage('Verificando perfil...');

      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        throw new Error('Sessão não encontrada');
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (roleError || !roleData) {
        // First time user - create professor role and profile
        const { error: roleCreateError } = await supabase
          .from('user_roles')
          .insert({
            user_id: sessionData.session.user.id,
            role: 'professor'
          });

        if (roleCreateError) {
          throw roleCreateError;
        }

        // Track signup event
        setTimeout(() => {
          trackEvent('signup', { method: 'google' });
        }, 1000);
      }

      // Check if professor exists
      const { data: professorData, error: professorError } = await supabase
        .from('professores')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();

      if (professorError) {
        throw professorError;
      }

      if (!professorData) {
        // Create professor profile
        const { error: createProfError } = await supabase
          .from('professores')
          .insert({
            user_id: sessionData.session.user.id,
            nome: sessionData.session.user.user_metadata?.nome || 
                  sessionData.session.user.user_metadata?.full_name || 
                  sessionData.session.user.email?.split('@')[0] || 'Professor',
            email: sessionData.session.user.email!,
            plano: 'Gratuito',
            status: 'ativo',
            modules: {
              ia: false,
              lousa: true,
              agenda: true,
              dashboard: true,
              materiais: true,
              pagamentos: true,
              ferramentas: true
            }
          });

        if (createProfError) {
          throw createProfError;
        }

        // Track signup for new users
        setTimeout(() => {
          trackEvent('signup', { method: 'google', new_profile: true });
        }, 1000);
      }

      setStatus('success');
      setMessage('Autenticação realizada com sucesso!');

      // Redirect based on role
      setTimeout(() => {
        const role = roleData?.role || 'professor';
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/app', { replace: true });
        }
      }, 1500);

    } catch (error: any) {
      console.error('[AuthCallback] Error:', error);
      setStatus('error');
      
      // More specific error messages
      let errorMessage = 'Erro na autenticação';
      if (error.message?.includes('invalid request')) {
        errorMessage = 'Configuração OAuth inválida. Verifique as configurações do Google Console.';
      } else if (error.message?.includes('code') && error.message?.includes('verifier')) {
        errorMessage = 'Erro no fluxo OAuth. Tente fazer login novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      
      toast({
        title: 'Erro na Autenticação',
        description: errorMessage,
        variant: 'destructive'
      });

      // Redirect to auth page after a delay
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 4000);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'loading':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Music Zen Hub</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${getColor()}`}>
              {status === 'loading' && 'Processando...'}
              {status === 'success' && 'Sucesso!'}
              {status === 'error' && 'Erro'}
            </h3>
            <p className="text-muted-foreground mt-2">{message}</p>
          </div>
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecionando em alguns segundos...
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-muted-foreground">
              Redirecionando para a página de login...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}