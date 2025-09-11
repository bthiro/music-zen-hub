import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Logout() {
  const { toast } = useToast();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Try Supabase signOut first
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) {
          console.warn('[Logout] Supabase signOut error:', error);
        }
      } catch (error) {
        console.warn('[Logout] Exception during signOut:', error);
      } finally {
        // Fallback: clear all Supabase auth tokens from localStorage
        Object.keys(localStorage)
          .filter(key => key.startsWith('sb-hnftxautmxviwrfuaosu-'))
          .forEach(key => localStorage.removeItem(key));

        // Also clear common auth keys
        ['supabase.auth.token', 'supabase.auth.refreshToken'].forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        toast({
          title: 'Logout realizado',
          description: 'Você foi desconectado com sucesso',
        });
      }
    };

    performLogout();
  }, [toast]);

  // Show loading briefly then redirect
  setTimeout(() => {
    window.location.href = '/auth';
  }, 1000);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Fazendo logout...</p>
      </div>
    </div>
  );
}