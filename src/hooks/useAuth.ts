import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentHref } from '@/utils/navigation';
import type { AuthUser, AuthState, UserRole, UserProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

import { useNavigate } from 'react-router-dom';
import { SafeNavigation } from '@/utils/navigation';

export function useAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        console.log('[Auth] onAuthStateChange event:', event, 'session?', !!session);

        if (session?.user) {
          // Set basic session immediately and show loading while we resolve role/profile
          setAuthState(prev => ({
            ...prev,
            session,
            loading: true,
          }));

          // Defer DB calls to avoid deadlocks in callback
          setTimeout(async () => {
            try {
              console.log('[Auth] Fetching role/profile for user', session.user.id);
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (!roleData?.role) {
                console.warn('[Auth] No role found. Signing out.');
                await supabase.auth.signOut();
                setAuthState({
                  user: null,
                  session: null,
                  loading: false,
                  initialized: true,
                });
                return;
              }

              let profile: UserProfile | undefined;
              if (roleData.role === 'professor') {
                console.log('[Auth] Ensuring professor profile exists for user:', session.user.id);
                
                // Upsert professor profile with default modules
                const { data: profileData, error: profileError } = await supabase
                  .from('professores')
                  .upsert({
                    user_id: session.user.id,
                    nome: session.user.user_metadata?.nome || session.user.email || 'Professor',
                    email: session.user.email || '',
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
                  }, {
                    onConflict: 'user_id'
                  })
                  .select()
                  .single();

                if (profileError) {
                  console.error('[Auth] Error upserting professor profile:', profileError);
                  // Continue anyway - don't block login
                }

                if (profileData) {
                  profile = profileData;
                  console.log('[Auth] Professor profile ensured:', profileData);
                  
                  if (profileData.status !== 'ativo') {
                    console.warn('[Auth] Professor inactive. Signing out.');
                    await supabase.auth.signOut();
                    toast({
                      title: "Acesso Bloqueado",
                      description: "Conta indisponível. Contate o administrador.",
                      variant: "destructive",
                    });
                    setAuthState({
                      user: null,
                      session: null,
                      loading: false,
                      initialized: true,
                    });
                    return;
                  }
                }
              }

              const authUser: AuthUser = {
                id: session.user.id,
                email: session.user.email!,
                role: roleData.role as UserRole,
                profile,
              };

              setAuthState({
                user: authUser,
                session,
                loading: false,
                initialized: true,
              });
            } catch (error) {
              console.error('[Auth] Error completing auth:', error, 'location:', getCurrentHref());
              setAuthState({
                user: null,
                session: null,
                loading: false,
                initialized: true,
              });
            }
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // The onAuthStateChange will handle this
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no Login",
        description: error.message === 'Invalid login credentials' 
          ? "Email ou senha incorretos"
          : error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, nome?: string) => {
    const redirectUrl = `${SafeNavigation.getOrigin()}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: nome ? { nome } : undefined,
      }
    });

    if (error) {
      const desc = error.message?.includes('Cadastro direto não permitido')
        ? 'Cadastro direto está desativado. Peça a um administrador para criar sua conta.'
        : error.message === 'User already registered'
          ? 'Este email já está cadastrado'
          : error.message?.includes('duplicate key value')
            ? 'Conta já existe. Tente fazer login com sua senha ou Google.'
            : error.message;
      console.error('[Auth] SignUp error:', error);
      toast({
        title: 'Erro no Cadastro',
        description: desc,
        variant: 'destructive',
      });
      return { error };
    }

    // Show success message for email verification
    toast({
      title: 'Conta criada!',
      description: 'Verifique seu email para confirmar sua conta antes de fazer login.',
    });

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao Sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${SafeNavigation.getOrigin()}/auth/callback`;
      const inIframe = window.top !== window;
      console.log('[Auth] Google sign-in start', { redirectTo, href: SafeNavigation.getCurrentHref(), inIframe });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { 
            prompt: 'select_account',
            access_type: 'offline' 
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('[Auth] Google sign-in error:', error, { redirectTo, href: SafeNavigation.getCurrentHref() });
        const friendly = error.message?.includes('redirect_uri_mismatch')
          ? 'Redirect URI não corresponde. Verifique as configurações do Google Console.'
          : error.message?.includes('popup_closed_by_user')
            ? 'Login cancelado pelo usuário.'
            : error.message || 'Falha ao iniciar login com Google.';
        toast({ title: 'Erro no Login com Google', description: friendly, variant: 'destructive' });
        return;
      }

      // Supabase will handle the redirect automatically
      console.log('[Auth] OAuth initiated successfully');
    } catch (err: any) {
      console.error('[Auth] Unexpected error in signInWithGoogle:', err);
      toast({ 
        title: 'Erro Inesperado', 
        description: 'Não foi possível iniciar o login com Google. Tente novamente.', 
        variant: 'destructive' 
      });
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}