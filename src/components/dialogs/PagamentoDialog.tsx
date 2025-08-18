import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface PagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pagamentoId: string;
  alunoNome: string;
  valor: number;
}

export function PagamentoDialog({ open, onOpenChange, pagamentoId, alunoNome, valor }: PagamentoDialogProps) {
  const { marcarPagamento } = useApp();
  const { toast } = useToast();
  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [metodoPagamento, setMetodoPagamento] = useState("");

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
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formaPagamento === "cartao" && (
            <div className="space-y-2">
              <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
              <Input
                id="metodoPagamento"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                placeholder="Ex: Mercado Pago, PagSeguro, etc."
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}