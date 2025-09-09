import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Monitor, Smartphone } from "lucide-react";
import { PaymentStatusChecker } from "@/components/PaymentStatusChecker";

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
  const [paymentData, setPaymentData] = useState<{
    link: string;
    preference_id: string;
    valor: number;
    descricao: string;
    alunoNome: string;
    tipoPagamento: string;
  } | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setPaymentData(null);
    setValor("");
    setDescricao("");
    setTipoPagamento("mensal");
  };

  const generateWhatsAppMessage = () => {
    if (!paymentData) return "";
    
    const tipoTexto = paymentData.tipoPagamento === 'mensal' ? 'mensalidade' : 'aula';
    return `Olá ${paymentData.alunoNome}! 👋

Aqui está o link para pagamento da sua ${tipoTexto}:

💰 Valor: R$ ${paymentData.valor.toFixed(2)}
📝 Descrição: ${paymentData.descricao}

🔗 Link do Mercado Pago:
${paymentData.link}

Qualquer dúvida, estou à disposição! 😊`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    toast.success("Mensagem copiada para área de transferência!");
  };

  const openWhatsApp = (platform: 'web' | 'mobile') => {
    const message = encodeURIComponent(generateWhatsAppMessage());
    const url = platform === 'web' 
      ? `https://web.whatsapp.com/send?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alunoId || !valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Chamando função mercado-pago...", {
        aluno_id: alunoId,
        valor: parseFloat(valor),
        tipo_pagamento: tipoPagamento
      });
      
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

      console.log("Resposta da função:", { data, error });

      if (error) {
        console.error("Erro ao criar pagamento:", error);
        toast.error(`Erro ao criar pagamento: ${error.message}`);
        return;
      }

      if (data.success && data.payment_link) {
        toast.success("Link de pagamento criado!");
        
        // Ao invés de abrir o link, vamos mostrar opções de envio
        setPaymentData({
          link: data.payment_link,
          preference_id: data.preference_id,
          valor: parseFloat(valor),
          descricao: descricao || `${tipoPagamento === 'mensal' ? 'Mensalidade' : 'Aula'} - ${alunoNome}`,
          alunoNome: alunoNome || "Aluno",
          tipoPagamento
        });
        
        // Não fechar o dialog, mostrar opções de envio
      } else {
        console.error("Resposta inválida:", data);
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch (error) {
      console.error("Erro no handleSubmit:", error);
      toast.error(`Erro interno: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {paymentData ? "Enviar Cobrança via WhatsApp" : "Criar Pagamento - Mercado Pago"}
          </DialogTitle>
        </DialogHeader>
        
        {/* Formulário inicial */}
        {!paymentData && (
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
                onClick={handleClose}
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
        )}

        {/* Tela de envio via WhatsApp */}
        {paymentData && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Link de Pagamento Gerado! ✅
              </h3>
              <p className="text-sm text-muted-foreground">
                Agora você pode enviar para {paymentData.alunoNome} via WhatsApp
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <Label>Mensagem para WhatsApp:</Label>
                <Textarea
                  value={generateWhatsAppMessage()}
                  readOnly
                  rows={8}
                  className="mt-2 text-sm"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Mensagem
              </Button>
              
              <Button
                onClick={() => openWhatsApp('web')}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Monitor className="h-4 w-4 mr-2" />
                WhatsApp Web
              </Button>
              
              <Button
                onClick={() => openWhatsApp('mobile')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                WhatsApp Mobile
              </Button>
            </div>

            {/* Status do Pagamento */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">Status do Pagamento</h4>
                <PaymentStatusChecker
                  preferenceId={paymentData.preference_id}
                  currentStatus="pending"
                  onStatusUpdate={(status, details) => {
                    console.log("Status atualizado:", status, details);
                    if (status === 'approved') {
                      toast.success("🎉 Pagamento confirmado! O aluno já pode acessar as aulas.");
                    }
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Fechar
              </Button>
              <Button 
                onClick={() => setPaymentData(null)}
                className="bg-[#009EE3] hover:bg-[#0080B8] text-white"
              >
                Gerar Novo Link
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}