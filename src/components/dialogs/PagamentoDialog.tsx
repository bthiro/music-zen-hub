import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { usePagamentoActions } from "@/hooks/usePagamentoActions";
import { MercadoPagoDialog } from "./MercadoPagoDialog";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pagamentoId: string;
  alunoId: string;
  alunoNome: string;
  valor: number;
}

export function PagamentoDialog({ open, onOpenChange, pagamentoId, alunoId, alunoNome, valor }: PagamentoDialogProps) {
  const { marcarPagamento } = useApp();
  const { toast } = useToast();
  const { excluirPagamento } = usePagamentoActions();
  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [showMercadoPago, setShowMercadoPago] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formaPagamento) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento",
        variant: "destructive"
      });
      return;
    }

    if (formaPagamento === "mercado_pago") {
      setShowMercadoPago(true);
      return;
    }

    try {
      const hoje = new Date().toISOString().split('T')[0];
      await marcarPagamento(pagamentoId, hoje, formaPagamento, metodoPagamento);
      
      toast({
        title: "Pagamento confirmado!",
        description: `Pagamento de ${alunoNome} marcado como pago via ${formaPagamento.toUpperCase()}.`
      });

      onOpenChange(false);
      setFormaPagamento("");
      setMetodoPagamento("");
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await excluirPagamento(pagamentoId);
      setShowDeleteDialog(false);
      onOpenChange(false);
      setFormaPagamento("");
      setMetodoPagamento("");
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <Input value={alunoNome} disabled />
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <Input value={`R$ ${valor}`} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formaPagamento === "cartao" && (
            <div className="space-y-2">
              <Label htmlFor="metodoPagamento">Detalhes do Pagamento</Label>
              <Input
                id="metodoPagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                placeholder="Ex: Mercado Pago, PagSeguro, etc."
              />
            </div>
          )}

          <div className="flex justify-between gap-3">
            <Button 
              type="button" 
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
      
      <MercadoPagoDialog
        open={showMercadoPago}
        onOpenChange={setShowMercadoPago}
        alunoId={alunoId}
        alunoNome={alunoNome}
        valorSugerido={valor}
      />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento de {alunoNome}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}