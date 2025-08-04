import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { 
  Settings, 
  Clock, 
  MessageCircle, 
  Mail, 
  CreditCard, 
  Key,
  Chrome,
  CheckCircle,
  XCircle,
  TestTube
} from "lucide-react";

export default function Configuracoes() {
  const { toast } = useToast();
  const { 
    isAuthenticated, 
    userEmail, 
    isLoading, 
    signIn, 
    signOut, 
    testIntegration 
  } = useGoogleIntegration();
  const [config, setConfig] = useState({
    horarioPadrao: "14:00",
    chavePix: "professor@email.com",
    linkPagamento: "https://mercadopago.com.br/checkout/v1/redirect?pref_id=123456789",
    mensagemCobranca: `Olá {ALUNO}! 😊

📋 *Lembrete de Pagamento*
• Período: {PERIODO}
• Valor: R$ {VALOR}
• Vencimento: {VENCIMENTO}

💳 *Formas de Pagamento:*
🔸 *PIX:* {PIX}
🔸 *Cartão:* {LINK_PAGAMENTO}

Qualquer dúvida, estou à disposição!
Obrigado(a) pela confiança! 🎵`,
    emailGoogle: "",
    notificacoesPush: true
  });

  const salvarConfiguracoes = () => {
    // Aqui você salvaria no localStorage ou context
    localStorage.setItem('configuracoes', JSON.stringify(config));
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso."
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie suas preferências e integrações
          </p>
        </div>

        <div className="grid gap-6">
          {/* Preferências Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferências Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="horarioPadrao">Horário Padrão de Aula</Label>
                <Input
                  id="horarioPadrao"
                  type="time"
                  value={config.horarioPadrao}
                  onChange={(e) => setConfig(prev => ({...prev, horarioPadrao: e.target.value}))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notificacoes"
                  checked={config.notificacoesPush}
                  onCheckedChange={(checked) => setConfig(prev => ({...prev, notificacoesPush: checked}))}
                />
                <Label htmlFor="notificacoes">Receber notificações automáticas</Label>
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX Padrão</Label>
                <Input
                  id="chavePix"
                  value={config.chavePix}
                  onChange={(e) => setConfig(prev => ({...prev, chavePix: e.target.value}))}
                  placeholder="Sua chave PIX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkPagamento">Link de Pagamento (Cartão)</Label>
                <Input
                  id="linkPagamento"
                  value={config.linkPagamento}
                  onChange={(e) => setConfig(prev => ({...prev, linkPagamento: e.target.value}))}
                  placeholder="Link do Mercado Pago, PagSeguro, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Mensagens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Texto Padrão de Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mensagemCobranca">Mensagem Padrão</Label>
                <Textarea
                  id="mensagemCobranca"
                  value={config.mensagemCobranca}
                  onChange={(e) => setConfig(prev => ({...prev, mensagemCobranca: e.target.value}))}
                  rows={10}
                  placeholder="Use {ALUNO}, {PERIODO}, {VALOR}, {VENCIMENTO}, {PIX}, {LINK_PAGAMENTO}"
                />
                <p className="text-xs text-muted-foreground">
                  Use as variáveis {`{ALUNO}, {PERIODO}, {VALOR}, {VENCIMENTO}, {PIX}, {LINK_PAGAMENTO}`} para personalização automática
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Integrações Google */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5 text-primary" />
                Integrações Google
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">Google Agenda & Meet</Label>
                      {isAuthenticated ? (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          Desconectado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sincronização automática de aulas e criação de links do Meet
                    </p>
                    {isAuthenticated && userEmail && (
                      <p className="text-xs text-primary font-medium">
                        Conectado como: {userEmail}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isAuthenticated ? (
                      <Button variant="outline" onClick={signOut} size="sm">
                        Desconectar
                      </Button>
                    ) : (
                      <Button 
                        onClick={signIn} 
                        disabled={isLoading}
                        size="sm"
                        className="btn-primary"
                      >
                        {isLoading ? "Conectando..." : "Conectar"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {isAuthenticated && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">Configurações da Integração</h4>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cor Personalizada</Label>
                        <p className="text-xs text-muted-foreground">
                          Eventos da plataforma em verde claro
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-green-400 rounded border"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações Automáticas</Label>
                        <p className="text-xs text-muted-foreground">
                          Lembretes pelo Google Agenda
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={testIntegration}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <TestTube className="h-4 w-4" />
                      Testar Integração
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={salvarConfiguracoes}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}