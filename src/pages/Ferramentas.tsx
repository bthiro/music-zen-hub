import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetronomeAfinador } from "@/components/MetronomeAfinador";
import { Music, Headphones, Volume2, Palette, Brain, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Ferramentas() {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'metronome-tuner',
      title: 'Metrônomo e Afinador',
      description: 'Ferramentas essenciais para prática musical com metrônomo e afinador integrados.',
      icon: Music,
      component: <MetronomeAfinador />,
      available: true
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.route) {
      navigate(tool.route);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Ferramentas</h2>
          <p className="text-muted-foreground">
            Recursos digitais para enriquecer suas aulas e práticas musicais
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Card key={tool.id} className={!tool.available ? 'opacity-60' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tool.icon className="h-5 w-5" />
                  {tool.title}
                  {!tool.available && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Em Desenvolvimento
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tool.component ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {tool.description}
                    </p>
                    {tool.component}
                  </div>
                ) : tool.available ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                    <Button onClick={() => handleToolClick(tool)}>
                      Abrir {tool.title}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <tool.icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium mb-2">Em Desenvolvimento</p>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Ferramentas Avançadas - Simplificada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Mais Ferramentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="p-3 bg-primary/10 rounded-lg mx-auto w-fit mb-4">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">
                Novas ferramentas em breve!
              </h4>
              <p className="text-sm text-muted-foreground">
                Estamos trabalhando em mais ferramentas para enriquecer sua experiência de ensino.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}