import { Music, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-6 gap-4">
        <SidebarTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
        
        <div className="flex items-center gap-2 flex-1">
          <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            <span className="hidden sm:inline">Sistema de Aulas Particulares</span>
            <span className="sm:hidden">Aulas Particulares</span>
          </h1>
        </div>
      </div>
    </header>
  );
}