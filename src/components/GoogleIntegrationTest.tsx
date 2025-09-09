import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration';
import { Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function GoogleIntegrationTest() {
  const { 
    isAuthenticated, 
    userEmail, 
    isLoading, 
    signIn, 
    signOut, 
    testIntegration 
  } = useGoogleIntegration();
  
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    setTestResult('testing');
    const success = await testIntegration();
    setTestResult(success ? 'success' : 'error');
    
    setTimeout(() => setTestResult('idle'), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Teste de Integração Google
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da autenticação */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Status da Conexão</p>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? `Conectado como: ${userEmail}` : 'Não conectado'}
            </p>
          </div>
          <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
            {isAuthenticated ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          {!isAuthenticated ? (
            <Button 
              onClick={signIn} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar ao Google'
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleTest}
                disabled={testResult === 'testing'}
                variant="outline"
              >
                {testResult === 'testing' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : testResult === 'success' ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                ) : testResult === 'error' ? (
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                ) : null}
                Testar Integração
              </Button>
              <Button onClick={signOut} variant="destructive">
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Status do teste */}
        {testResult !== 'idle' && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult === 'success' ? 'bg-green-50 text-green-700' :
            testResult === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {testResult === 'testing' && 'Testando conexão com Google Calendar...'}
            {testResult === 'success' && '✅ Integração funcionando corretamente!'}
            {testResult === 'error' && '❌ Erro na integração. Verifique a configuração.'}
          </div>
        )}

        {/* Informações sobre a integração */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Como funciona:</strong>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Conecte sua conta Google para criar eventos automaticamente</li>
            <li>Cada aula agendada gera um link único do Google Meet</li>
            <li>Os eventos são sincronizados com sua Google Agenda</li>
            <li>Links Meet ficam disponíveis na Sessão ao Vivo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}