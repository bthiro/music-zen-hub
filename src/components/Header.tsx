import { Music, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { professor } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.'
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger className="flex-shrink-0" />
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary truncate">
              EduMusic Pro
            </h1>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground truncate">
            Sistema de Gestão para Professores de Música
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {professor && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{professor.nome}</span>
            </div>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}