import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationCard } from "./IntegrationCard";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  CreditCard, 
  MessageCircle, 
  Chrome, 
  TestTube, 
  Rocket,
  DollarSign,
  Phone
} from "lucide-react";

interface IntegrationStatus {
  mercadoPago: "connected" | "disconnected" | "error" | "testing";
  infinitePay: "connected" | "disconnected" | "error" | "testing";
  whatsappZapi: "connected" | "disconnected" | "error" | "testing";
  google: "connected" | "disconnected" | "error" | "testing";
}

export function AutoIntegrationPanel() {
  const { toast } = useToast();
  const googleIntegration = useGoogleIntegration();
  
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    mercadoPago: "disconnected",
    infinitePay: "disconnected", 
    whatsappZapi: "disconnected",
    google: googleIntegration.isAuthenticated ? "connected" : "disconnected"
  });

  const [isTestingAll, setIsTestingAll] = useState(false);
  const [keepConnected, setKeepConnected] = useState({
    google: true,
    mercadoPago: false,
    infinitePay: false,
    whatsappZapi: false
  });

  const handleMercadoPagoConnect = () => {
    // For real implementation, this would trigger OAuth flow
    toast({
      title: "Configuração do Mercado Pago",
      description: "Para conectar automaticamente, configure as credenciais OAuth nas configurações do projeto.",
      duration: 5000
    });
  };

  const handleInfinitePayConnect = () => {
    // Show secret form for InfinitePay
    toast({
      title: "Configure sua API Key",
      description: "Use o formulário abaixo para configurar sua chave da InfinitePay.",
      duration: 5000
    });
  };

  const handleWhatsAppConnect = () => {
    // Show secret form for Z-API
    toast({
      title: "Configure suas credenciais Z-API",
      description: "Use o formulário abaixo para configurar seu token e instance ID.",
      duration: 5000
    });
  };

  const handleGoogleConnect = () => {
    setIntegrationStatus(prev => ({ ...prev, google: "testing" }));
    googleIntegration.signIn().finally(() => {
      setIntegrationStatus(prev => ({ 
        ...prev, 
        google: googleIntegration.isAuthenticated ? "connected" : "disconnected" 
      }));
    });
  };

  const handleGoogleDisconnect = () => {
    googleIntegration.signOut();
    setIntegrationStatus(prev => ({ ...prev, google: "disconnected" }));
  };

  const handleTestIntegration = async (integration: keyof IntegrationStatus) => {
    setIntegrationStatus(prev => ({ ...prev, [integration]: "testing" }));
    
    // Simulate test delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For Google, use real test
    if (integration === "google" && googleIntegration.isAuthenticated) {
      try {
        await googleIntegration.testIntegration();
        setIntegrationStatus(prev => ({ ...prev, [integration]: "connected" }));
        toast({
          title: "Teste realizado com sucesso",
          description: "Integração do Google está funcionando corretamente."
        });
      } catch (error) {
        setIntegrationStatus(prev => ({ ...prev, [integration]: "error" }));
      }
    } else {
      // For other integrations, simulate
      setIntegrationStatus(prev => ({ 
        ...prev, 
        [integration]: prev[integration] === "connected" ? "connected" : "disconnected" 
      }));
    }
  };

  const handleTestAllIntegrations = async () => {
    setIsTestingAll(true);
    
    const integrations: (keyof IntegrationStatus)[] = ["google", "mercadoPago", "infinitePay", "whatsappZapi"];
    
    for (const integration of integrations) {
      if (integrationStatus[integration] === "connected") {
        await handleTestIntegration(integration);
      }
    }
    
    setIsTestingAll(false);
    
    toast({
      title: "Testes concluídos",
      description: "Todas as integrações ativas foram testadas."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Rocket className="h-6 w-6 text-primary" />
            Integrações do Sistema
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure automaticamente suas integrações através de botões inteligentes
          </p>
        </CardHeader>
      </Card>

      {/* Payment Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Pagamentos
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <IntegrationCard
            name="Mercado Pago"
            icon={<DollarSign className="h-5 w-5 text-blue-600" />}
            status={integrationStatus.mercadoPago}
            description="Geração automática de links de pagamento e checkout"
            onConnect={handleMercadoPagoConnect}
            onTest={() => handleTestIntegration("mercadoPago")}
            keepConnected={keepConnected.mercadoPago}
            onKeepConnectedChange={(checked) => 
              setKeepConnected(prev => ({ ...prev, mercadoPago: checked }))
            }
          />
          
          <IntegrationCard
            name="InfinitePay"
            icon={<CreditCard className="h-5 w-5 text-purple-600" />}
            status={integrationStatus.infinitePay}
            description="Processamento de pagamentos e geração de links"
            onConnect={handleInfinitePayConnect}
            onTest={() => handleTestIntegration("infinitePay")}
            keepConnected={keepConnected.infinitePay}
            onKeepConnectedChange={(checked) => 
              setKeepConnected(prev => ({ ...prev, infinitePay: checked }))
            }
          />
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          WhatsApp Business
        </h3>
        
        <IntegrationCard
          name="Z-API WhatsApp"
          icon={<Phone className="h-5 w-5 text-green-600" />}
          status={integrationStatus.whatsappZapi}
          description="Envio automático de lembretes e notificações via WhatsApp"
          onConnect={handleWhatsAppConnect}
          onTest={() => handleTestIntegration("whatsappZapi")}
          keepConnected={keepConnected.whatsappZapi}
          onKeepConnectedChange={(checked) => 
            setKeepConnected(prev => ({ ...prev, whatsappZapi: checked }))
          }
          showAlternatives={true}
          alternatives={[
            { name: "360Dialog", onClick: () => toast({ title: "360Dialog", description: "Em breve..." }) },
            { name: "Twilio", onClick: () => toast({ title: "Twilio", description: "Em breve..." }) },
            { name: "Meta Business", onClick: () => toast({ title: "Meta Business", description: "Em breve..." }) }
          ]}
        />
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Chrome className="h-5 w-5 text-primary" />
          Autenticação
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <IntegrationCard
            name="Google OAuth"
            icon={<Chrome className="h-5 w-5 text-blue-500" />}
            status={integrationStatus.google}
            description="Acesso ao Google Calendar e criação automática de eventos"
            onConnect={handleGoogleConnect}
            onDisconnect={handleGoogleDisconnect}
            onTest={() => handleTestIntegration("google")}
            isLoading={googleIntegration.isLoading}
            keepConnected={keepConnected.google}
            onKeepConnectedChange={(checked) => 
              setKeepConnected(prev => ({ ...prev, google: checked }))
            }
            userInfo={googleIntegration.userEmail ? `Conectado como: ${googleIntegration.userEmail}` : undefined}
          />
          
          <Card className="flex items-center justify-center p-6 bg-success/5 border-success/20">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Chrome className="h-5 w-5 text-success" />
                <span className="font-medium text-success">Email/Senha (Supabase)</span>
              </div>
              <p className="text-sm text-muted-foreground">Status: ✅ Ativo</p>
              <p className="text-xs text-muted-foreground">Autenticação nativa já configurada</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Test All Button */}
      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h4 className="font-medium">Testar Todas as Integrações</h4>
            <p className="text-sm text-muted-foreground">
              Verifica o funcionamento de todas as integrações conectadas
            </p>
          </div>
          
          <Button 
            onClick={handleTestAllIntegrations}
            disabled={isTestingAll}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTestingAll ? "Testando..." : "Testar Todas"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}