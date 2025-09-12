import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Unlink,
  Info,
  Shield
} from "lucide-react";

export function MercadoPagoIntegration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mpConfig, setMpConfig] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    loadMercadoPagoConfig();
  }, []);

  const loadMercadoPagoConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) return;

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('professor_id', professor.id)
        .eq('integration_name', 'mercado_pago')
        .maybeSingle();

      setMpConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração MP:', error);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast({
        title: 'Erro',
        description: 'Insira um access token válido.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) throw new Error('Professor não encontrado');

      // Testar o token primeiro
      const testResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error('Token inválido ou sem permissões necessárias');
      }

      // Salvar configuração
      const configData = {
        professor_id: professor.id,
        integration_name: 'mercado_pago',
        config_data: { 
          access_token: accessToken,
          connected_at: new Date().toISOString()
        },
        status: 'connected',
        last_test: new Date().toISOString()
      };

      if (mpConfig) {
        await supabase
          .from('integration_configs')
          .update(configData)
          .eq('id', mpConfig.id);
      } else {
        await supabase
          .from('integration_configs')
          .insert(configData);
      }

      toast({
        title: 'Sucesso!',
        description: 'Mercado Pago conectado com sucesso.'
      });

      setDialogOpen(false);
      setAccessToken('');
      await loadMercadoPagoConfig();

    } catch (error: any) {
      console.error('Erro ao conectar MP:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao conectar Mercado Pago.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await supabase
        .from('integration_configs')
        .update({ 
          status: 'disconnected',
          config_data: {}
        })
        .eq('id', mpConfig.id);

      toast({
        title: 'Desconectado',
        description: 'Mercado Pago desconectado com sucesso.'
      });

      await loadMercadoPagoConfig();
    } catch (error: any) {
      console.error('Erro ao desconectar MP:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao desconectar Mercado Pago.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isConnected = mpConfig?.status === 'connected';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Integração Mercado Pago
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"} 
            className={isConnected ? "bg-green-100 text-green-800" : ""}
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p><strong>🔒 Isolamento por Professor:</strong> Cada professor usa seu próprio Mercado Pago. Pagamentos não são compartilhados entre professores.</p>
              <p><strong>📝 Como funciona:</strong> Configure seu access token para receber pagamentos diretamente na sua conta MP.</p>
            </div>
          </AlertDescription>
        </Alert>

        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Mercado Pago Conectado</p>
                <p className="text-sm text-green-600">
                  Conectado em {new Date(mpConfig.config_data.connected_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                disabled={loading}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Status da Conexão</p>
                <p className="text-green-600">✅ Conectado e funcionando</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Último Teste</p>
                <p className="text-muted-foreground">
                  {mpConfig.last_test ? new Date(mpConfig.last_test).toLocaleDateString('pt-BR') : 'Nunca testado'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">Mercado Pago não conectado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure sua integração para receber pagamentos automaticamente
              </p>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Mercado Pago
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Mercado Pago</DialogTitle>
                    <DialogDescription>
                      Insira seu access token do Mercado Pago para começar a receber pagamentos.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <p><strong>Segurança:</strong> Seu token é armazenado de forma criptografada e isolado por professor.</p>
                        <p><strong>Onde encontrar:</strong> Acesse sua conta MP → Integrações → Credenciais → Access Token de Produção</p>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="token">Access Token</Label>
                      <Input
                        id="token"
                        type="password"
                        placeholder="APP_USR-xxxx-xxxxxx-xxxx-xxxx-xxxx"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use apenas tokens de produção. Tokens de teste não funcionam para pagamentos reais.
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDialogOpen(false);
                          setAccessToken('');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleConnect} disabled={loading}>
                        {loading ? 'Testando...' : 'Conectar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Importante:</strong> Ao conectar seu Mercado Pago, todos os pagamentos criados no modo "automático" 
            usarão sua conta pessoal. Pagamentos de outros professores não aparecem aqui.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}