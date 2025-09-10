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
  Video,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
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

// Admin menu items
const adminMenuItems = [
  { icon: Home, label: "Dashboard", href: "/admin/" },
  { icon: UserCog, label: "Professores", href: "/admin/professores" },
  { icon: CreditCard, label: "Pagamentos", href: "/admin/pagamentos" },
  { icon: Users, label: "Alunos", href: "/admin/alunos" },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
];

// Professor menu items
const professorMenuItems = [
  { icon: Home, label: "Dashboard", href: "/app/", moduleKey: "dashboard" },
  { icon: Calendar, label: "Aulas", href: "/app/aulas", moduleKey: "agenda" },
  { icon: Video, label: "Sessão ao Vivo", href: "/app/sessao-ao-vivo", moduleKey: "agenda" },
  { icon: Users, label: "Alunos", href: "/app/alunos", moduleKey: null }, // Always available
  { icon: CreditCard, label: "Pagamentos", href: "/app/pagamentos", moduleKey: "pagamentos" },
  { icon: BarChart3, label: "Relatórios", href: "/app/relatorios", moduleKey: "dashboard" },
  { icon: Paintbrush, label: "Lousa Digital", href: "/app/lousa", moduleKey: "lousa" },
  { icon: Wrench, label: "Ferramentas", href: "/app/ferramentas", moduleKey: "ferramentas" },
  { icon: Brain, label: "IA Musical", href: "/app/ia-musical", moduleKey: "ia" },
  { icon: Settings, label: "Configurações", href: "/app/configuracoes", moduleKey: null }, // Always available
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { user } = useAuthContext();
  
  // Determine which menu to show based on user role
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : professorMenuItems;
  const modules = user?.profile?.modules || {};
  
  console.log('[AppSidebar] User role:', user?.role, 'Location:', location.pathname);

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium px-2 flex items-center gap-2">
            {isAdmin && <ShieldCheck className="h-4 w-4" />}
            {isAdmin ? "Admin" : "Professor"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => {
                  // For admin, show all items
                  if (isAdmin) return true;
                  
                  // For professor, check module permissions
                  if ('moduleKey' in item && item.moduleKey && !modules[item.moduleKey]) {
                    return false;
                  }
                  
                  return true;
                })
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href === '/admin/' && location.pathname === '/admin') ||
                    (item.href === '/app/' && location.pathname === '/app');
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={state === "collapsed" ? item.label : undefined}
                        className={cn(
                          "w-full justify-start transition-all duration-200",
                          isActive && "bg-primary/10 text-primary border-r-2 border-primary"
                        )}
                      >
                        <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-l-md">
                          <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                          <span className={cn(
                            "font-medium transition-all duration-200",
                            state === "collapsed" ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"
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