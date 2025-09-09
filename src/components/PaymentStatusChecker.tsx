import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, Clock, XCircle, CreditCard } from "lucide-react";

interface PaymentStatusCheckerProps {
  preferenceId: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: string, paymentDetails?: any) => void;
}

export function PaymentStatusChecker({ 
  preferenceId, 
  currentStatus, 
  onStatusUpdate 
}: PaymentStatusCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const translateStatus = (status: string) => {
    const statusMap = {
      'approved': 'Aprovado',
      'pending': 'Pendente', 
      'rejected': 'Rejeitado',
      'cancelled': 'Cancelado',
      'in_process': 'Em Processamento'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': 
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default' as const;
      case 'pending': return 'secondary' as const;
      case 'rejected':
      case 'cancelled': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const checkPaymentStatus = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago', {
        body: {
          action: 'check_payment',
          preference_id: preferenceId
        }
      });

      if (error) {
        console.error("Erro ao verificar pagamento:", error);
        toast.error("Erro ao verificar status do pagamento");
        return;
      }

      if (data.success) {
        if (data.payment_found) {
          setPaymentDetails(data);
          onStatusUpdate?.(data.status, data);
          
          if (data.status === 'approved') {
            toast.success("Pagamento confirmado! ✅");
          } else if (data.status === 'rejected') {
            toast.error("Pagamento rejeitado");
          } else {
            toast.info(`Status: ${translateStatus(data.status)}`);
          }
        } else {
          toast.info("Pagamento ainda não processado");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao verificar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (methodId: string) => {
    const methods = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito', 
      'bolbradesco': 'Boleto Bancário',
      'account_money': 'Saldo em Conta'
    };
    return methods[methodId] || methodId;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(paymentDetails?.status || currentStatus)}
          <Badge variant={getStatusVariant(paymentDetails?.status || currentStatus)}>
            {translateStatus(paymentDetails?.status || currentStatus)}
          </Badge>
        </div>
        
        <Button
          onClick={checkPaymentStatus}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Verificar Status
        </Button>
      </div>

      {paymentDetails && paymentDetails.payment_found && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Valor:</span>
            <span>R$ {paymentDetails.amount?.toFixed(2)}</span>
          </div>
          
          {paymentDetails.payment_method && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Método:</span>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span>{getPaymentMethodName(paymentDetails.payment_method)}</span>
              </div>
            </div>
          )}
          
          {paymentDetails.date_approved && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Data de Aprovação:</span>
              <span>{new Date(paymentDetails.date_approved).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}