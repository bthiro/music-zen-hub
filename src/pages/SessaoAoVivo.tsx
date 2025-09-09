import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { GoogleIntegrationTest } from "@/components/GoogleIntegrationTest";
import { 
  Video, 
  Users, 
  Clock, 
  Monitor, 
  MessageSquare, 
  FileText, 
  Settings,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Phone,
  Share,
  Circle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SessaoAoVivo() {
  const { aulas, alunos } = useApp();
  const { toast } = useToast();
  const [aulaAtiva, setAulaAtiva] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Encontrar aula em andamento ou próxima
  useEffect(() => {
    const hoje = new Date();
    const aulaHoje = aulas.find(aula => {
      const dataAula = new Date(aula.data);
      return dataAula.toDateString() === hoje.toDateString() && 
             aula.status === "agendada" &&
             aula.linkMeet;
    });
    
    if (aulaHoje) {
      setAulaAtiva(aulaHoje);
    }
  }, [aulas]);

  const iniciarAula = (aula: any) => {
    setAulaAtiva(aula);
    setParticipantes([aula.aluno]);
    toast({
      title: "Aula iniciada!",
      description: `Sessão ao vivo com ${aula.aluno}`
    });
  };

  const encerrarAula = () => {
    if (aulaAtiva) {
      toast({
        title: "Aula encerrada",
        description: `Sessão com ${aulaAtiva.aluno} finalizada`
      });
      setAulaAtiva(null);
      setParticipantes([]);
      setChatMessages([]);
    }
  };

  const enviarMensagem = () => {
    if (newMessage.trim()) {
      const mensagem = {
        id: Date.now(),
        autor: "Professor",
        texto: newMessage,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, mensagem]);
      setNewMessage("");
    }
  };

  const aulasDisponiveis = aulas.filter(aula => 
    aula.status === "agendada" && aula.linkMeet
  ).slice(0, 5);

  if (!aulaAtiva) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Sessão ao Vivo</h2>
            <p className="text-muted-foreground">
              Gerencie suas aulas online diretamente na plataforma
            </p>
          </div>

          {/* Aulas Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Aulas Agendadas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aulasDisponiveis.length > 0 ? (
                <div className="space-y-3">
                  {aulasDisponiveis.map((aula) => (
                    <div key={aula.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {aula.aluno.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{aula.aluno}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(aula.data).toLocaleDateString('pt-BR')} às {aula.horario}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-center">
                          Pronta para iniciar
                        </Badge>
                        <Button 
                          onClick={() => iniciarAula(aula)}
                          className="w-full sm:w-auto"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Iniciar Aula
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma aula agendada para hoje</p>
                  <p className="text-sm">As aulas aparecerão aqui quando estiverem próximas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <GoogleIntegrationTest />
          
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-green-700">Google Meet</p>
                    <p className="text-xs text-green-600">Conectado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-blue-700">Plataforma</p>
                    <p className="text-xs text-blue-600">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-purple-700">Recursos</p>
                    <p className="text-xs text-purple-600">Disponíveis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header da Aula Ativa */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {aulaAtiva.aluno.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">Aula ao Vivo - {aulaAtiva.aluno}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {aulaAtiva.horario}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {participantes.length + 1} participantes
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      ● Ao vivo
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="destructive" onClick={encerrarAula}>
                <Phone className="h-4 w-4 mr-2" />
                Encerrar Aula
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Área principal do Meet */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              <div className="relative">
                <div className={`w-full rounded-lg bg-muted flex flex-col items-center justify-center ${isFullscreen ? 'h-screen' : 'h-96'} p-6 text-center`}>
                  <p className="text-sm text-muted-foreground mb-4">
                    O Google Meet bloqueia a incorporação via iframe em sites externos. Abra a chamada em uma nova aba.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <a href={aulaAtiva.linkMeet} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Abrir no Google Meet
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(aulaAtiva.linkMeet);
                        toast({ title: 'Link copiado', description: 'O link do Meet foi copiado para a área de transferência.' });
                      }}
                    >
                      Copiar link
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Painel lateral */}
          <div className="space-y-4">
            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat da Aula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-48 overflow-y-auto space-y-2 border rounded p-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-xs">
                      <span className="font-medium text-blue-600">{msg.autor}</span>
                      <span className="text-muted-foreground ml-2">{msg.hora}</span>
                      <p className="mt-1">{msg.texto}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 text-xs p-2 border rounded"
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  />
                  <Button size="sm" onClick={enviarMensagem}>
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ferramentas da Aula */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Ferramentas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar Tela
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Circle className="h-4 w-4 mr-2" />
                  Gravar Aula
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Anotações
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}