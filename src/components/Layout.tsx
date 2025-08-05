import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, professor } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex h-16 shrink-0 items-center gap-4 px-6 border-b bg-card/50">
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <h2 className="text-base font-semibold text-foreground">
                      Bem-vindo, {professor?.nome || 'Professor'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}