import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  professor: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchProfessor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [professor, setProfessor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfessor = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar professor:', error);
        setProfessor(null);
      } else if (!data) {
        // Se professor não existe, criar um novo
        const { data: novoProfessor, error: errorCriar } = await supabase
          .from('professores')
          .insert({
            user_id: session.user.id,
            nome: session.user.user_metadata?.nome || session.user.email || 'Professor',
            email: session.user.email || '',
          })
          .select()
          .single();

        if (errorCriar) {
          console.error('Erro ao criar professor:', errorCriar);
          setProfessor(null);
        } else {
          setProfessor(novoProfessor);
        }
      } else {
        setProfessor(data);
      }
    } catch (error) {
      console.error('Erro ao buscar professor:', error);
      setProfessor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT' || !session) {
          setProfessor(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Aguardar um pouco mais para garantir que a sessão está estável
            setTimeout(() => {
              fetchProfessor();
            }, 200);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setProfessor(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar dados do professor apenas se tiver sessão válida
          setTimeout(() => {
            fetchProfessor();
          }, 100);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setSession(null);
        setUser(null);
        setProfessor(null);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nome }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    professor,
    loading,
    signIn,
    signUp,
    signOut,
    fetchProfessor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}