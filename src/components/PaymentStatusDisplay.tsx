import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { MercadoPagoButton } from "@/components/MercadoPagoButton";
import type { Pagamento } from "@/hooks/usePagamentos";

interface PaymentStatusDisplayProps {
  pagamento: Pagamento;
  onScheduleClass?: (alunoId: string, alunoName: string) => void;
  onReprocessPayment?: (paymentId: string) => void;
}

export function PaymentStatusDisplay({ 
  pagamento, 
  onScheduleClass,
  onReprocessPayment 
}: PaymentStatusDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-600';
      case 'pendente': return 'bg-yellow-600';
      case 'atrasado': return 'bg-red-600';
      case 'cancelado': return 'bg-gray-600';
      case 'reembolsado': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="h-4 w-4" />;
      case 'pendente': return <AlertCircle className="h-4 w-4" />;
      case 'atrasado': return <AlertCircle className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      case 'reembolsado': return <RefreshCw className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex items-center gap-3">
      <Badge className={`${getStatusColor(pagamento.status)} text-white flex items-center gap-1`}>
        {getStatusIcon(pagamento.status)}
        {pagamento.status}
      </Badge>
      
      <span className="font-medium">{formatCurrency(pagamento.valor)}</span>
      
      {/* Show MercadoPago button for pending/overdue payments */}
      {(['pendente', 'atrasado'].includes(pagamento.status)) && (
        <div className="flex gap-2">
          <MercadoPagoButton 
            alunoId={pagamento.alunoId}
            alunoNome={pagamento.aluno}
            valorSugerido={pagamento.valor}
          />
          
          {/* Show reprocess button for MercadoPago payments */}
          {pagamento.mercado_pago_payment_id && onReprocessPayment && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReprocessPayment(pagamento.mercado_pago_payment_id!)}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Verificar
            </Button>
          )}
        </div>
      )}
      
      {/* Show schedule button for paid payments */}
      {pagamento.status === 'pago' && onScheduleClass && (
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onScheduleClass(pagamento.alunoId, pagamento.aluno)}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Agendar Aulas
        </Button>
      )}
      
      {/* Show status for final states */}
      {(['cancelado', 'reembolsado'].includes(pagamento.status)) && (
        <Button 
          size="sm" 
          variant="outline"
          className="text-gray-600 border-gray-600"
          disabled
        >
          {pagamento.status === 'cancelado' ? 'Cancelado' : 'Reembolsado'}
        </Button>
      )}
    </div>
  );
}