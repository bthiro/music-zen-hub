import { cn } from '@/lib/utils';

export type ConfigSection = 'perfil' | 'preferencias' | 'mensagens' | 'integracoes';

interface ConfigurationNavigationProps {
  activeSection: ConfigSection;
  onSectionChange: (section: ConfigSection) => void;
}

export function ConfigurationNavigation({ activeSection, onSectionChange }: ConfigurationNavigationProps) {
  const sections: Array<{ id: ConfigSection; label: string; icon: string; description: string }> = [
    { 
      id: 'perfil', 
      label: 'Perfil do Professor', 
      icon: '👤',
      description: 'Informações pessoais e foto'
    },
    { 
      id: 'preferencias', 
      label: 'Preferências', 
      icon: '⚙️',
      description: 'Tema, idioma e notificações'
    },
    { 
      id: 'mensagens', 
      label: 'Mensagens', 
      icon: '💬',
      description: 'Templates e assinaturas'
    },
    { 
      id: 'integracoes', 
      label: 'Integrações', 
      icon: '🔗',
      description: 'Google, WhatsApp e pagamentos'
    },
  ];

  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={cn(
            "w-full flex items-start space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
            activeSection === section.id 
              ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">{section.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{section.label}</div>
            <div className="text-xs opacity-75 mt-0.5">{section.description}</div>
          </div>
        </button>
      ))}
    </nav>
  );
}