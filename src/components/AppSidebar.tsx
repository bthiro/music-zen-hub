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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
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
                    >
                      <Link to={item.href}>
                        <Icon className={cn("h-4 w-4", isActive && "text-primary-foreground")} />
                        <span className={cn(
                          "transition-opacity",
                          state === "collapsed" && "opacity-0"
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