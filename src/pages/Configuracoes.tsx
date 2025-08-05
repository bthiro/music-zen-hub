import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutoIntegrationPanel } from "@/components/AutoIntegrationPanel";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  MessageCircle, 
  CreditCard, 
  Rocket
} from "lucide-react";

export default function Configuracoes() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie suas preferências e integrações
          </p>
        </div>

        <Tabs defaultValue="integracoes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integracoes" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Mensagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integracoes" className="space-y-6 mt-6">
            <AutoIntegrationPanel />
          </TabsContent>

          <TabsContent value="preferencias" className="space-y-6 mt-6">
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
                    <Label htmlFor="fusoHorario">Fuso Horário</Label>
                    <select 
                      id="fusoHorario"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={config.fusoHorario}
                      onChange={(e) => setConfig(prev => ({...prev, fusoHorario: e.target.value}))}
                    >
                      <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                      <option value="America/Rio_Branco">Acre (UTC-5)</option>
                      <option value="America/Manaus">Manaus (UTC-4)</option>
                      <option value="America/Cuiaba">Cuiabá (UTC-4)</option>
                      <option value="America/Campo_Grande">Campo Grande (UTC-4)</option>
                      <option value="America/Belem">Belém (UTC-3)</option>
                      <option value="America/Fortaleza">Fortaleza (UTC-3)</option>
                      <option value="America/Recife">Recife (UTC-3)</option>
                      <option value="America/Bahia">Salvador (UTC-3)</option>
                      <option value="Europe/London">Londres (UTC+0)</option>
                      <option value="Europe/Madrid">Madrid (UTC+1)</option>
                      <option value="America/New_York">Nova York (UTC-5)</option>
                      <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Detectado automaticamente: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notificacoes"
                      checked={config.notificacoesPush}
                      onCheckedChange={(checked) => setConfig(prev => ({...prev, notificacoesPush: checked}))}
                    />
                    <Label htmlFor="notificacoes">Receber atualizações automáticas</Label>
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
            </div>
          </TabsContent>

          <TabsContent value="mensagens" className="space-y-6 mt-6">
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
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button onClick={salvarConfiguracoes}>
              Salvar Configurações
            </Button>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}