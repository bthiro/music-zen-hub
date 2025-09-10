import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthUser, AuthState, UserRole, UserProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
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
      async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          try {
            // Get user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (!roleData?.role) {
              // If no role found, sign out
              await supabase.auth.signOut();
              setAuthState({
                user: null,
                session: null,
                loading: false,
                initialized: true,
              });
              return;
            }

            // Get profile data if professor
            let profile: UserProfile | undefined;
            if (roleData.role === 'professor') {
              const { data: profileData } = await supabase
                .from('professores')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              if (profileData) {
                profile = profileData;
                
                // Check if professor is active
                if (profileData.status !== 'ativo') {
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
            console.error('Auth error:', error);
            setAuthState({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
          }
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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: nome ? { nome } : undefined,
      }
    });

    if (error) {
      toast({
        title: "Erro no Cadastro",
        description: error.message === 'User already registered'
          ? "Este email já está cadastrado"
          : error.message,
        variant: "destructive",
      });
      return { error };
    }

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Erro no Login",
        description: error.message,
        variant: "destructive",
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