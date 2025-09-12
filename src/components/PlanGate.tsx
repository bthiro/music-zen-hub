import { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useConversionMetrics } from '@/hooks/useConversionMetrics';

interface PlanGateProps {
  children: ReactNode;
  feature: string;
  requiresPaidPlan?: boolean;
  className?: string;
}

export function PlanGate({ children, feature, requiresPaidPlan = true, className = '' }: PlanGateProps) {
  const { user } = useAuthContext();
  const { trackEvent } = useConversionMetrics();
  
  // Se não é professor, não aplica gate
  if (user?.role !== 'professor') {
    return <>{children}</>;
  }

  const profile = user.profile;
  const isPaidPlan = profile?.plano !== 'Gratuito';
  
  // Se não requer plano pago ou já tem plano pago, mostra o conteúdo
  if (!requiresPaidPlan || isPaidPlan) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    trackEvent('upgrade_click', { feature, from_gate: true });
    // TODO: Abrir modal de upgrade ou redirecionar para checkout
    console.log('Upgrade clicked for feature:', feature);
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Recurso Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            O recurso <strong>{feature}</strong> está disponível apenas no plano pago.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Benefícios do plano pago:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Alunos ilimitados</li>
              <li>• Recursos de IA para música</li>
              <li>• Integração com Mercado Pago</li>
              <li>• Google Calendar integrado</li>
            </ul>
          </div>
          <Button onClick={handleUpgradeClick} className="w-full">
            <Crown className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}