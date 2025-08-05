import { Music } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger className="flex-shrink-0" />
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary truncate">
              ClassPro
            </h1>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground truncate">
            Sistema de Gestão de Aulas Particulares
          </div>
        </div>
      </div>
    </header>
  );
}