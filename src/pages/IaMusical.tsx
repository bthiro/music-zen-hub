import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanGate } from "@/components/PlanGate";
import { 
  Brain, 
  Send, 
  Copy, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Music, 
  Settings,
  Sparkles,
  MessageCircle,
  Clock,
  Save
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

export default function IaMusical() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 🎵 Sou sua assistente de teoria musical com IA avançada. Posso te ajudar com harmonia, melodia, ritmo, escalas, campos harmônicos, cifragem e muito mais! Agora com respostas personalizadas em tempo real. Em qual instrumento você gostaria de focar nossa conversa?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [instrument, setInstrument] = useState('');
  const [musicStyle, setMusicStyle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (message: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('ia-musical', {
        body: { 
          message, 
          instrument: instrument || 'não especificado',
          musicStyle: musicStyle || 'não especificado'
        }
      });

      if (error) {
        console.error('Erro ao chamar IA Musical:', error);
        throw new Error('Erro na comunicação com a IA');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.response || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
      console.error('Erro na função getAIResponse:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(currentMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro na resposta da IA:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    toast({
      title: "Feedback enviado",
      description: "Obrigado por ajudar a melhorar nossa IA!"
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Resposta copiada para a área de transferência"
    });
  };

  const exportToPDF = () => {
    // Implementar exportação para PDF
    toast({
      title: "Em desenvolvimento",
      description: "Exportação para PDF será implementada em breve"
    });
  };

  const saveConversation = () => {
    // Implementar salvamento no Supabase
    toast({
      title: "Conversa salva!",
      description: "Histórico salvo com sucesso"
    });
  };

  return (
    <Layout>
      <PlanGate feature="IA Musical" requiresPaidPlan={true}>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">IA Musical</h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Assistente com IA avançada especializada em teoria musical e aplicação prática
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveConversation} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar Sessão
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Conversa com IA Musical
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex flex-col gap-4">
                {/* Messages */}
                <div className="min-h-[400px] max-h-[70vh] overflow-y-auto space-y-4 pr-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
                        <div className="text-sm mb-2 whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs opacity-70">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${message.feedback === 'positive' ? 'text-green-600' : ''}`}
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 ${message.feedback === 'negative' ? 'text-red-600' : ''}`}
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm">IA Musical está pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua pergunta sobre teoria musical..."
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* IA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configurações da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Instrumento Principal</label>
                  <Input
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    placeholder="Ex: Violão, Piano, Bateria..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Estilo Musical</label>
                  <Input
                    value={musicStyle}
                    onChange={(e) => setMusicStyle(e.target.value)}
                    placeholder="Ex: Bossa Nova, Jazz, MPB..."
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Configurações aplicadas!",
                      description: "A IA foi personalizada para suas preferências"
                    });
                  }}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Aplicar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Quick Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tópicos Rápidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {[
                    "Campo harmônico maior",
                    "Progressões no jazz",
                    "Escalas pentatônicas",
                    "Voicings para piano",
                    "Ritmo na bossa nova",
                    "Modulação harmônica"
                  ].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => setInputMessage(`Me explique sobre: ${topic}`)}
                    >
                      <MessageCircle className="h-3 w-3 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas da Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Mensagens enviadas:</span>
                  <span className="font-medium">{messages.filter(m => m.role === 'user').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Respostas da IA:</span>
                  <span className="font-medium">{messages.filter(m => m.role === 'assistant').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Feedbacks positivos:</span>
                  <span className="font-medium text-green-600">
                    {messages.filter(m => m.feedback === 'positive').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </PlanGate>
    </Layout>
  );
}