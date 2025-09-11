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
      id: 'metronome',
      title: 'Metrônomo e Afinador',
      description: 'Ferramentas essenciais para prática musical',
      icon: Music,
      component: <MetronomeAfinador />,
      available: true
    },
    {
      id: 'lousa',
      title: 'Lousa Digital',
      description: 'Quadro interativo para aulas ao vivo',
      icon: Palette,
      route: '/app/lousa',
      available: true
    },
    {
      id: 'ia',
      title: 'IA Musical',
      description: 'Assistente inteligente para composição e teoria',
      icon: Brain,
      route: '/app/ia',
      available: true
    },
    {
      id: 'recorder',
      title: 'Gravador de Aula',
      description: 'Gravação e reprodução de áudio durante as aulas',
      icon: Mic,
      available: false
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

        {/* Seção de Ferramentas Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Ferramentas Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <Volume2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium mb-1">Biblioteca de Áudio</h4>
                <p className="text-xs text-muted-foreground">Samples e backing tracks</p>
              </div>
              <div className="text-center p-4">
                <Music className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium mb-1">Partitura Digital</h4>
                <p className="text-xs text-muted-foreground">Editor e visualizador</p>
              </div>
              <div className="text-center p-4">
                <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium mb-1">Exercícios Inteligentes</h4>
                <p className="text-xs text-muted-foreground">Gerados por IA</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                🚀 Essas ferramentas estão sendo desenvolvidas e estarão disponíveis em breve!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}