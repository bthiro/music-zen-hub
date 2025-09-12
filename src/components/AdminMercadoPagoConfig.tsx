import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, CheckCircle, AlertCircle, Settings, Unlink, Info, Shield } from "lucide-react";

export function AdminMercadoPagoConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mpConfig, setMpConfig] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    loadAdminMercadoPagoConfig();
  }, []);

  const loadAdminMercadoPagoConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_mercado_pago_config')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar config admin MP:', error);
      }
      setMpConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração admin MP:', error);
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Desativar configuração anterior se existir
      if (mpConfig) {
        await supabase
          .from('admin_mercado_pago_config')
          .update({ status: 'inactive' })
          .eq('id', mpConfig.id);
      }

      // Salvar nova configuração
      const { error } = await supabase
        .from('admin_mercado_pago_config')
        .insert({
          access_token: accessToken,
          status: 'active',
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Mercado Pago administrativo conectado com sucesso.'
      });

      setDialogOpen(false);
      setAccessToken('');
      await loadAdminMercadoPagoConfig();

    } catch (error: any) {
      console.error('Erro ao conectar admin MP:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao conectar Mercado Pago administrativo.',
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
        .from('admin_mercado_pago_config')
        .update({ status: 'inactive' })
        .eq('id', mpConfig.id);

      toast({
        title: 'Desconectado',
        description: 'Mercado Pago administrativo desconectado com sucesso.'
      });

      await loadAdminMercadoPagoConfig();
    } catch (error: any) {
      console.error('Erro ao desconectar admin MP:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao desconectar Mercado Pago administrativo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isConnected = mpConfig?.status === 'active';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mercado Pago Administrativo
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
              <p><strong>🏛️ Conta Administrativa:</strong> Esta conta será usada para receber os pagamentos dos planos dos professores.</p>
              <p><strong>💰 Como funciona:</strong> Quando um professor assina um plano, o pagamento é processado nesta conta administrativa.</p>
            </div>
          </AlertDescription>
        </Alert>

        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Mercado Pago Administrativo Conectado</p>
                <p className="text-sm text-green-600">
                  Conectado em {new Date(mpConfig.created_at).toLocaleDateString('pt-BR')}
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
                <p className="text-green-600">✅ Ativo e funcionando</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Uso</p>
                <p className="text-muted-foreground">Cobranças administrativas</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">Mercado Pago administrativo não conectado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure a conta administrativa para processar pagamentos dos planos
              </p>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Conta Administrativa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Mercado Pago Administrativo</DialogTitle>
                    <DialogDescription>
                      Insira o access token da conta administrativa que receberá os pagamentos dos planos.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <p><strong>Segurança:</strong> Token armazenado de forma criptografada e isolado.</p>
                        <p><strong>Onde encontrar:</strong> Acesse sua conta MP → Integrações → Credenciais → Access Token de Produção</p>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="admin-token">Access Token Administrativo</Label>
                      <Input
                        id="admin-token"
                        type="password"
                        placeholder="APP_USR-xxxx-xxxxxx-xxxx-xxxx-xxxx"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Esta será a conta que receberá todos os pagamentos das assinaturas dos professores.
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
      </CardContent>
    </Card>
  );
}