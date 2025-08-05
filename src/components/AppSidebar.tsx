import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  CreditCard, 
  Calendar, 
  BarChart3,
  Settings,
  Brain,
  Paintbrush,
  Wrench,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Calendar, label: "Aulas", href: "/aulas" },
  { icon: Video, label: "Sessão ao Vivo", href: "/sessao-ao-vivo" },
  { icon: Users, label: "Alunos", href: "/alunos" },
  { icon: CreditCard, label: "Pagamentos", href: "/pagamentos" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Paintbrush, label: "Lousa Digital", href: "/lousa" },
  { icon: Wrench, label: "Ferramentas", href: "/ferramentas" },
  { icon: Brain, label: "IA Musical", href: "/ia-musical" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "w-full justify-start transition-all duration-200",
                        isActive && "bg-primary/10 text-primary border-r-2 border-primary"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-l-md">
                        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                        <span className={cn(
                          "font-medium transition-opacity",
                          state === "collapsed" && "opacity-0 w-0 overflow-hidden"
                        )}>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}