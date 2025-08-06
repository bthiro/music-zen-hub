import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Calendar, 
  Users, 
  DollarSign, 
  BookOpen, 
  Bell,
  Search,
  Palette
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Widget {
  id: string;
  title: string;
  type: 'stats' | 'list' | 'chart' | 'notifications';
  position: { x: number; y: number };
  size: { width: number; height: number };
  enabled: boolean;
  icon: any;
}

interface DashboardConfigProps {
  widgets: Widget[];
  onWidgetUpdate: (widgets: Widget[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'proximas-aulas',
    title: 'Próximas Aulas',
    type: 'list',
    position: { x: 0, y: 0 },
    size: { width: 1, height: 1 },
    enabled: true,
    icon: Calendar
  },
  {
    id: 'alunos-pendentes',
    title: 'Pagamentos Pendentes',
    type: 'list',
    position: { x: 1, y: 0 },
    size: { width: 1, height: 1 },
    enabled: true,
    icon: Users
  },
  {
    id: 'estatisticas-financeiras',
    title: 'Resumo Financeiro',
    type: 'stats',
    position: { x: 2, y: 0 },
    size: { width: 1, height: 1 },
    enabled: true,
    icon: DollarSign
  },
  {
    id: 'progresso-alunos',
    title: 'Progresso dos Alunos',
    type: 'chart',
    position: { x: 0, y: 1 },
    size: { width: 1, height: 1 },
    enabled: true,
    icon: BookOpen
  },
  {
    id: 'notificacoes',
    title: 'Notificações',
    type: 'notifications',
    position: { x: 1, y: 1 },
    size: { width: 1, height: 1 },
    enabled: true,
    icon: Bell
  }
];

export function DashboardConfig({ 
  widgets, 
  onWidgetUpdate, 
  searchTerm, 
  onSearchChange,
  theme,
  onThemeChange 
}: DashboardConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleWidgetToggle = (widgetId: string, enabled: boolean) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled } : widget
    );
    onWidgetUpdate(updatedWidgets);
  };

  const resetToDefault = () => {
    onWidgetUpdate(AVAILABLE_WIDGETS);
    localStorage.removeItem('dashboard-config');
  };

  const themes = [
    { value: 'default', label: 'Padrão' },
    { value: 'blue', label: 'Azul Profissional' },
    { value: 'green', label: 'Verde Natureza' },
    { value: 'purple', label: 'Roxo Criativo' },
    { value: 'orange', label: 'Laranja Energético' }
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Busca rápida global */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos, aulas, pagamentos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Configurações do dashboard */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Dashboard
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Seleção de tema */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Tema do Dashboard
              </Label>
              <Select value={theme} onValueChange={onThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((themeOption) => (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Widgets configuráveis */}
            <div className="space-y-3">
              <Label>Widgets Visíveis</Label>
              {AVAILABLE_WIDGETS.map((widget) => {
                const currentWidget = widgets.find(w => w.id === widget.id);
                const Icon = widget.icon;
                
                return (
                  <div key={widget.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={widget.id}>{widget.title}</Label>
                    </div>
                    <Switch
                      id={widget.id}
                      checked={currentWidget?.enabled ?? widget.enabled}
                      onCheckedChange={(enabled) => handleWidgetToggle(widget.id, enabled)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetToDefault}
                className="flex-1"
              >
                Restaurar Padrão
              </Button>
              <Button 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}