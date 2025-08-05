import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  TestTube,
  Loader2
} from "lucide-react";
import { ReactNode } from "react";

interface IntegrationCardProps {
  name: string;
  icon: ReactNode;
  status: "connected" | "disconnected" | "error" | "testing";
  description: string;
  onConnect: () => void;
  onTest?: () => void;
  onDisconnect?: () => void;
  isLoading?: boolean;
  keepConnected?: boolean;
  onKeepConnectedChange?: (checked: boolean) => void;
  lastTest?: Date;
  userInfo?: string;
  showAlternatives?: boolean;
  alternatives?: Array<{ name: string; onClick: () => void }>;
}

export function IntegrationCard({
  name,
  icon,
  status,
  description,
  onConnect,
  onTest,
  onDisconnect,
  isLoading = false,
  keepConnected,
  onKeepConnectedChange,
  lastTest,
  userInfo,
  showAlternatives,
  alternatives
}: IntegrationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case "testing":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Testando...
          </Badge>
        );
      case "error":
        return (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Erro de Conexão
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-muted/50">
            <XCircle className="h-3 w-3 mr-1" />
            Não configurado
          </Badge>
        );
    }
  };

  const getConnectButton = () => {
    if (status === "connected") {
      return (
        <div className="flex gap-2">
          {onTest && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTest}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <TestTube className="h-4 w-4" />
              Testar
            </Button>
          )}
          {onDisconnect && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDisconnect}
              disabled={isLoading}
            >
              Desconectar
            </Button>
          )}
        </div>
      );
    }

    return (
      <Button
        onClick={onConnect}
        disabled={isLoading}
        size="sm"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4" />
            Conectar Automaticamente
          </>
        )}
      </Button>
    );
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-lg">{name}</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {status === "connected" && userInfo && (
          <div className="text-xs text-primary font-medium bg-primary/5 p-2 rounded-md">
            {userInfo}
          </div>
        )}

        {lastTest && (
          <div className="text-xs text-muted-foreground">
            Último teste: {lastTest.toLocaleString('pt-BR')}
          </div>
        )}

        <div className="flex items-center justify-between">
          {getConnectButton()}
          
          {keepConnected !== undefined && onKeepConnectedChange && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`keep-connected-${name}`}
                checked={keepConnected}
                onCheckedChange={onKeepConnectedChange}
                disabled={status !== "connected"}
              />
              <Label htmlFor={`keep-connected-${name}`} className="text-sm">
                Manter conectado
              </Label>
            </div>
          )}
        </div>

        {showAlternatives && alternatives && alternatives.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Alternativas:</p>
            <div className="flex flex-wrap gap-1">
              {alternatives.map((alt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={alt.onClick}
                  className="text-xs h-8 px-2"
                >
                  {alt.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}