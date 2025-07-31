import { Music } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Sistema de Aulas Particulares</h1>
        </div>
      </div>
    </header>
  );
}