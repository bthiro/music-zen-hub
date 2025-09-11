import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professorId?: string;
  professorNome?: string;
}

export function AdminPasswordDialog({ 
  open, 
  onOpenChange, 
  professorId, 
  professorNome 
}: AdminPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSetPassword = async (data: PasswordFormData) => {
    if (!professorId) return;

    setIsLoading(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-set-professor-password', {
        body: { 
          professor_id: professorId, 
          password: data.password 
        }
      });

      if (error) throw error;

      if (result.success) {
        toast({
          title: "Sucesso",
          description: `Senha definida para ${professorNome}. Professor deve alterar no primeiro acesso.`,
        });

        form.reset();
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error('[AdminPasswordDialog] Error setting password:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível definir a senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Definir Senha</DialogTitle>
          <DialogDescription>
            Defina uma senha inicial para <strong>{professorNome}</strong>. 
            O professor será instruído a alterá-la no primeiro acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSetPassword)} className="space-y-4">
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
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                {...form.register('confirmPassword')}
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Definir Senha
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}