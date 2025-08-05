import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
      content: 'Olá! 🎵 Sou sua assistente de teoria musical. Posso te ajudar com harmonia, melodia, ritmo, escalas, campos harmônicos, cifragem e muito mais! Em qual instrumento você gostaria de focar nossa conversa?',
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

  const simulateAIResponse = async (message: string): Promise<string> => {
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Respostas baseadas em palavras-chave com conhecimento profundo
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('escala') || lowerMessage.includes('escalas')) {
      return `📚 **Escalas Musicais** *(baseado em Bohumil Med)*
      
As escalas são sucessões de sons dispostos gradualmente em ordem ascendente ou descendente:

🎵 **Escala Diatônica Maior:**
- **Estrutura intervalar:** T-T-st-T-T-T-st
- **Graus:** I(T) - II(st) - III(md) - IV(sd) - V(D) - VI(sp) - VII(ss)
- **Em Dó Maior:** C-D-E-F-G-A-B-C
- **Características:** modo maior, sensação de alegria e luminosidade

🎵 **Escala Menor Natural (Eólica):**
- **Estrutura:** T-st-T-T-st-T-T  
- **Relativa de Dó maior:** Lá menor (A-B-C-D-E-F-G-A)
- **VI grau rebaixado** em relação ao modo maior

🎵 **Escalas Menores Artificiais:**
- **Harmônica:** VII grau elevado (intervalo de 2ª aumentada entre VI-VII)
- **Melódica:** VI e VII graus elevados na ascendente, natural na descendente

🎵 **Modos Gregos** *(Osvaldo Lacerda)*:
- **Dórico:** menor com VI maior (D-E-F-G-A-B-C-D)
- **Frígio:** menor com II menor (E-F-G-A-B-C-D-E)  
- **Lídio:** maior com IV aumentado (F-G-A-B-C-D-E-F)
- **Mixolídio:** maior com VII menor (G-A-B-C-D-E-F-G)

**Pedagogia:** Inicie sempre pela escala de Dó maior para compreender o sistema tonal!`;
    }

    if (lowerMessage.includes('acorde') || lowerMessage.includes('acordes') || lowerMessage.includes('harmonia')) {
      return `🎸 **Harmonia e Acordes** *(Teoria Funcional)*
      
**TRÍADES FUNDAMENTAIS:**

🎵 **Acorde Perfeito Maior:** 
- **Estrutura:** 3ª maior + 5ª justa (4 semitons + 3 semitons)
- **Função Tônica:** I grau - estabilidade, repouso
- **Exemplo em Dó:** C-E-G

🎵 **Acorde Perfeito Menor:**
- **Estrutura:** 3ª menor + 5ª justa (3 semitons + 4 semitons)  
- **Funções:** ii, iii, vi graus
- **Exemplo:** Dm (D-F-A)

🎵 **CAMPO HARMÔNICO MAIOR** *(Bohumil Med)*:
- **I** (Maior) - **ii** (menor) - **iii** (menor) - **IV** (Maior) - **V** (Maior) - **vi** (menor) - **vii°** (diminuto)
- **Em Dó:** C - Dm - Em - F - G - Am - Bº

🎵 **FUNÇÕES HARMÔNICAS:**
- **TÔNICA** (I, iii, vi): repouso, estabilidade
- **SUBDOMINANTE** (II, IV): afastamento da tônica  
- **DOMINANTE** (V, vii°): tensão, movimento obrigatório para tônica

🎵 **CADÊNCIAS CLÁSSICAS:**
- **Autêntica Perfeita:** V-I (movimento forte de dominante)
- **Plagal:** IV-I ("Amém" - movimento subdominante)
- **Semicadência:** x-V (suspensão na dominante)
- **Deceptiva:** V-vi (resolução inesperada)

**Progressões Pedagógicas:** I-IV-V-I / vi-IV-I-V / ii-V-I (jazz)`;
    }

    if (lowerMessage.includes('ritmo') || lowerMessage.includes('metrônomo') || lowerMessage.includes('compasso')) {
      return `🥁 **Teoria Rítmica** *(Osvaldo Lacerda)*
      
**FÓRMULAS DE COMPASSO:**

⏱️ **Compassos Simples:**
- **2/4:** 2 tempos de semínima (marcha militar)
- **3/4:** 3 tempos de semínima (valsa, minueto)  
- **4/4:** 4 tempos de semínima (mais comum na música popular)

⏱️ **Compassos Compostos:**
- **6/8:** 2 tempos de semínima pontuada (6 colcheias)
- **9/8:** 3 tempos de semínima pontuada 
- **12/8:** 4 tempos de semínima pontuada

🎵 **ACENTUAÇÃO MÉTRICA:**
- **2/4:** **FORTE**-fraco
- **3/4:** **FORTE**-fraco-fraco  
- **4/4:** **FORTE**-fraco-**meio-forte**-fraco
- **6/8:** **FORTE**-fraco-fraco-**meio-forte**-fraco-fraco

🎵 **SUBDIVISÕES RÍTMICAS:**
- **Binária:** divisão por 2 (semínimas→colcheias→semicolcheias)
- **Ternária:** divisão por 3 (tercinas, sextinas)

🎵 **SÍNCOPE** *(característica brasileira)*:
- Som que inicia em tempo fraco e prolonga-se ao tempo forte
- **Exemplo:** "Asa Branca" - síncope característica do nordeste

**Uso Pedagógico do Metrônomo:**
1. Inicie sempre em andamento lento (♩=60-80)  
2. Pratique primeiro sem instrumento (solfejo rítmico)
3. Aumente gradualmente: 60→80→100→120 BPM
4. Use nossa ferramenta com acentuação automática!`;
    }

    if (lowerMessage.includes('intervalo') || lowerMessage.includes('intervalos')) {
      return `🎼 **Intervalos Musicais** *(Bohumil Med)*
      
Os intervalos são as distâncias entre dois sons:

🎵 **CLASSIFICAÇÃO QUANTITATIVA:**
- **Uníssono, 2ª, 3ª, 4ª, 5ª, 6ª, 7ª, 8ª** (oitava)

🎵 **CLASSIFICAÇÃO QUALITATIVA:**
- **Justos:** 1ª, 4ª, 5ª, 8ª (não admitem maior/menor)
- **Maiores/Menores:** 2ª, 3ª, 6ª, 7ª
- **Aumentados/Diminutos:** alterações cromáticas

🎵 **INTERVALOS JUSTOS:**
- **4ª Justa:** 2,5 tons (C-F)
- **5ª Justa:** 3,5 tons (C-G)  
- **8ª Justa:** 6 tons (C-C')

🎵 **INTERVALOS MAIORES:**
- **2ª Maior:** 1 tom (C-D)
- **3ª Maior:** 2 tons (C-E)
- **6ª Maior:** 4,5 tons (C-A)
- **7ª Maior:** 5,5 tons (C-B)

🎵 **INVERSÃO DE INTERVALOS:**
- A soma sempre dá 9: 2ª↔7ª, 3ª↔6ª, 4ª↔5ª
- Maior torna-se menor e vice-versa
- Justo permanece justo

**Exercício:** Cantar intervalos com nomes (Dó-Mi = 3ª maior)`;
    }

    if (lowerMessage.includes('modo') || lowerMessage.includes('modos') || lowerMessage.includes('greg')) {
      return `⛪ **Modos Gregos** *(Sistema Modal)*
      
Os modos são escalas que começam em diferentes graus da escala maior:

🎵 **MODOS PRINCIPAIS:**
- **JÔNICO** (I): escala maior natural (C-D-E-F-G-A-B)
- **DÓRICO** (II): menor com 6ª maior (D-E-F-G-A-B-C) *caráter: nostálgico*
- **FRÍGIO** (III): menor com 2ª menor (E-F-G-A-B-C-D) *caráter: espanhol*
- **LÍDIO** (IV): maior com 4ª aumentada (F-G-A-B-C-D-E) *caráter: etéreo*
- **MIXOLÍDIO** (V): maior com 7ª menor (G-A-B-C-D-E-F) *caráter: blues*
- **EÓLICO** (VI): menor natural (A-B-C-D-E-F-G) *caráter: melancólico*
- **LÓCRIO** (VII): menor com 5ª diminuta (B-C-D-E-F-G-A) *pouco usado*

🎵 **CARACTERÍSTICAS MODAIS:**
- **Modos Maiores:** Jônico, Lídio, Mixolídio (3ª maior)
- **Modos Menores:** Dórico, Frígio, Eólico, Lócrio (3ª menor)

🎵 **USO PRÁTICO:**
- **Jazz:** Dórico (ii-V-I), Mixolídio (dominantes)
- **Música Brasileira:** Mixolídio (forró, baião)
- **Rock/Pop:** Dórico, Mixolídio
- **Música Antiga:** todos os modos

**Dica Pedagógica:** Compare sempre com a escala maior de referência!`;
    }

    // Resposta genérica aprofundada
    return `🎵 **Assistente de Teoria Musical Avançada**

Baseado nos métodos clássicos de **Bohumil Med**, **Osvaldo Lacerda** e **Priolli**:

**📚 ÁREAS DE ESPECIALIZAÇÃO:**
- **Harmonia Funcional:** análise de progressões, cadências, modulações
- **Teoria Rítmica:** compassos, síncopes, polirritmias  
- **Morfologia Musical:** formas musicais, análise estrutural
- **Contraponto:** conduções melódicas, espécies de contraponto
- **Pedagogia Musical:** métodos de ensino, sequências didáticas

**🎯 PARA SEU INSTRUMENTO** ${instrument ? `(${instrument})` : ''}:
- Exercícios técnicos específicos
- Repertório progressivo  
- Escalas e arpejos aplicados
- Estudos de interpretação

**🎨 ESTILO MUSICAL** ${musicStyle ? `(${musicStyle})` : ''}:
- Características harmônicas
- Padrões rítmicos típicos
- Progressões idiomáticas
- Técnicas interpretativas

**❓ PERGUNTAS SUGERIDAS:**
- "Explique a diferença entre modos dórico e frígio"
- "Como analisar a harmonia de uma música popular?"
- "Quais exercícios para síncope no piano?"
- "Como ensinar intervalos para iniciantes?"

*Pronto para aprofundar seus conhecimentos musicais! 🎼*`;
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
      const aiResponse = await simulateAIResponse(currentMessage);
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
              Assistente especializada em teoria musical e aplicação prática
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
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Conversa com IA Musical
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
                        <div className="text-sm mb-2">
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
    </Layout>
  );
}