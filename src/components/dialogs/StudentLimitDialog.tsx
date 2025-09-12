import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Zap, Calendar, CreditCard, CheckCircle } from "lucide-react";
import { useConversionMetrics } from '@/hooks/useConversionMetrics';

interface StudentLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStudentCount: number;
  limit: number;
}

export function StudentLimitDialog({ 
  open, 
  onOpenChange,
  currentStudentCount,
  limit 
}: StudentLimitDialogProps) {
  const { trackEvent } = useConversionMetrics();

  const handleUpgradeClick = () => {
    trackEvent('upgrade_click', { 
      feature: 'student_limit', 
      current_count: currentStudentCount,
      limit: limit
    });
    // TODO: Abrir modal de checkout ou redirecionar
    console.log('Upgrade clicked from student limit dialog');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Limite de Alunos Atingido
          </DialogTitle>
          <DialogDescription>
            Você atingiu o limite de <strong>{limit} alunos</strong> do plano gratuito.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-amber-500">{currentStudentCount}/{limit}</div>
            <div className="text-sm text-muted-foreground">alunos cadastrados</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Benefícios do Plano PRO:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Alunos ilimitados</strong> - Sem restrições</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>IA Musical</strong> - Recursos inteligentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Mercado Pago</strong> - Pagamentos automáticos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Google Calendar</strong> - Integração completa</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Plano PRO</span>
              <div className="text-right">
                <div className="text-lg font-bold">R$ 49,90</div>
                <div className="text-xs text-muted-foreground">por mês</div>
              </div>
            </div>
            
            <Button onClick={handleUpgradeClick} className="w-full" size="lg">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade Agora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}