import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Music, CheckCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { user, loading: authLoading } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check if we have session/tokens from URL parameters (recovery link)
    let access_token = searchParams.get('access_token');
    let refresh_token = searchParams.get('refresh_token');
    let type = searchParams.get('type');

    // If not found in query params, check hash (alternative format)
    if (!access_token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      access_token = hashParams.get('access_token');
      refresh_token = hashParams.get('refresh_token');
      type = hashParams.get('type');
    }

    if (access_token && refresh_token && type === 'recovery') {
      console.log('[ResetPassword] Recovery tokens found, setting session');
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(({ error }) => {
        if (error) {
          console.error('[ResetPassword] Error setting session:', error);
          toast({
            title: "Erro",
            description: "Link de recuperação inválido ou expirado",
            variant: "destructive",
          });
        }
      });
    }
  }, [searchParams, toast]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.error('[ResetPassword] Error updating password:', error);
        
        // Handle specific error cases
        let errorMessage = 'Não foi possível redefinir a senha';
        if (error.message.includes('Invalid refresh token') || error.message.includes('refresh_token')) {
          errorMessage = 'Link de redefinição expirado ou já utilizado. Solicite um novo link.';
        } else if (error.message.includes('Auth session missing')) {
          errorMessage = 'Sessão inválida. Use o link enviado por email.';
        } else if (error.message.includes('same as the old password')) {
          errorMessage = 'A nova senha deve ser diferente da atual.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Senha deve ter pelo menos 8 caracteres.';
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Log the password reset action
      try {
        await supabase.rpc('log_audit', {
          p_action: 'password_reset_completed',
          p_entity: 'professores',
          p_entity_id: null,
          p_metadata: { 
            success: true,
            timestamp: new Date().toISOString()
          }
        });
      } catch (auditError) {
        console.warn('[ResetPassword] Audit log failed:', auditError);
      }

      setResetComplete(true);
      toast({
        title: "Sucesso",
        description: "Senha redefinida com sucesso!",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        if (user?.role === 'admin') {
          window.location.href = '/admin';
        } else if (user?.role === 'professor') {
          window.location.href = '/app';
        } else {
          window.location.href = '/auth';
        }
      }, 2000);

    } catch (error: any) {
      console.error('[ResetPassword] Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao redefinir senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already authenticated but not in recovery mode, redirect
  if (user && !searchParams.get('access_token') && !resetComplete) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'professor') {
      return <Navigate to="/app" replace />;
    }
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Você será redirecionado em breve.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Music Zen Hub</h1>
          </div>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...form.register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirme sua nova senha"
                  {...form.register('confirmPassword')}
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Redefinir Senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}