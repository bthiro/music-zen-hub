import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MercadoPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
  alunoNome?: string;
  valorSugerido?: number;
}

export function MercadoPagoDialog({ 
  open, 
  onOpenChange, 
  alunoId, 
  alunoNome,
  valorSugerido 
}: MercadoPagoDialogProps) {
  const [valor, setValor] = useState(valorSugerido?.toString() || "");
  const [tipoPagamento, setTipoPagamento] = useState<"mensal" | "unico">("mensal");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alunoId || !valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago', {
        body: {
          action: 'create_payment',
          aluno_id: alunoId,
          valor: parseFloat(valor),
          tipo_pagamento: tipoPagamento,
          descricao: descricao || `${tipoPagamento === 'mensal' ? 'Mensalidade' : 'Aula'} - ${alunoNome}`,
          external_reference: `${tipoPagamento}_${alunoId}_${Date.now()}`
        }
      });

      if (error) {
        console.error("Erro ao criar pagamento:", error);
        toast.error("Erro ao criar pagamento");
        return;
      }

      if (data.success && data.payment_link) {
        toast.success("Link de pagamento criado! Redirecionando...");
        
        // Abrir link do Mercado Pago em nova aba
        window.open(data.payment_link, '_blank');
        
        // Fechar dialog
        onOpenChange(false);
        
        // Resetar form
        setValor("");
        setDescricao("");
        setTipoPagamento("mensal");
      } else {
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Pagamento - Mercado Pago</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aluno">Aluno</Label>
            <Input
              id="aluno"
              value={alunoNome || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Pagamento</Label>
            <Select 
              value={tipoPagamento} 
              onValueChange={(value: "mensal" | "unico") => setTipoPagamento(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensalidade</SelectItem>
                <SelectItem value="unico">Aula Única</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={`${tipoPagamento === 'mensal' ? 'Mensalidade' : 'Aula'} - ${alunoNome}`}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#009EE3] hover:bg-[#0080B8] text-white"
            >
              {loading ? "Gerando..." : "Gerar Link de Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}