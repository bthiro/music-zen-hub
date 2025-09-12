import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');

  useEffect(() => {
    const run = async () => {
      try {
        console.log('[OAuth] Callback start', { href: window.location.href });
        
        // Check if there's already a valid session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (!existingSession) {
          // No existing session, try to exchange code
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('[OAuth] exchangeCodeForSession error:', error, { href: window.location.href });
            
            // Check again for session in case exchange partially worked
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (!retrySession) {
              setStatus('error');
              toast({
                title: 'Erro no OAuth',
                description: error.message?.includes('redirect_uri_mismatch')
                  ? 'Redirect URI incorreta. Atualize Google Console e Supabase com a URL atual.'
                  : error.message,
                variant: 'destructive',
              });
              setTimeout(() => navigate('/auth', { replace: true }), 1500);
              return;
            }
          }
        }

        // Sessão criada, obter role e redirecionar
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.warn('[OAuth] No session after exchange');
          setStatus('error');
          toast({ title: 'Sessão não encontrada', description: 'Tente novamente.', variant: 'destructive' });
          setTimeout(() => navigate('/auth', { replace: true }), 1500);
          return;
        }

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const role = roleData?.role;
        console.log('[OAuth] Role resolved:', role);

        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'professor') {
          // Optionally ensure profile is active
          const { data: profile } = await supabase
            .from('professores')
            .select('status')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profile?.status !== 'ativo') {
            toast({
              title: 'Acesso Bloqueado',
              description: 'Conta indisponível. Contate o administrador.',
              variant: 'destructive',
            });
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });
            return;
          }
          navigate('/app', { replace: true });
        } else {
          // Fallback
          navigate('/auth', { replace: true });
        }
        } catch (err: any) {
        console.error('[OAuth] Unexpected error in callback:', err, { href: window.location.href });
        setStatus('error');
        toast({ title: 'Erro inesperado', description: err?.message || 'Tente novamente.', variant: 'destructive' });
        setTimeout(() => navigate('/auth', { replace: true }), 1500);
      }
    };

    run();
  }, [navigate, toast]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <section className="text-center space-y-2">
        {status === 'processing' ? (
          <>
            <h1 className="text-xl font-semibold">Concluindo login com Google…</h1>
            <p className="text-muted-foreground">Aguarde enquanto validamos sua sessão.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Falha no login</h1>
            <p className="text-muted-foreground">Redirecionando para a página de autenticação…</p>
          </>
        )}
      </section>
    </main>
  );
}
