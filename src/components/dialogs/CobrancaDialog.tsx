import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail, Copy } from "lucide-react";

interface CobrancaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluno: {
    nome: string;
    telefone?: string;
    email: string;
  };
  pagamento: {
    valor: number;
    vencimento: string;
    mes: string;
  };
}

export function CobrancaDialog({ open, onOpenChange, aluno, pagamento }: CobrancaDialogProps) {
  const { toast } = useToast();
  const [canal, setCanal] = useState<"whatsapp" | "email">("whatsapp");
  const [chavePix, setChavePix] = useState("professor@email.com");
  const [linkPagamento, setLinkPagamento] = useState("https://mercadopago.com.br/checkout/v1/redirect?pref_id=123456789");
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState("");

  const mensagemPadrao = pagamento ? `Olá ${aluno?.nome || 'Aluno'}! 😊

Esperamos que você esteja bem! 

📋 *Lembrete de Pagamento*
• Período: ${pagamento.mes}
• Valor: R$ ${pagamento.valor}
• Vencimento: ${new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}

💳 *Formas de Pagamento:*
🔸 *PIX:* ${chavePix}
🔸 *Cartão:* ${linkPagamento}

Qualquer dúvida, estou à disposição! 
Obrigado(a) pela confiança! 🎵` : '';

  const mensagemFinal = mensagemPersonalizada || mensagemPadrao;

  if (!pagamento) {
    return null;
  }

  const enviarWhatsApp = () => {
    if (!aluno?.telefone) {
      toast({
        title: "Erro",
        description: "Telefone do aluno não cadastrado",
        variant: "destructive"
      });
      return;
    }

    const telefone = aluno.telefone.replace(/\D/g, '');
    const mensagemUrl = encodeURIComponent(mensagemFinal);
    const url = `https://wa.me/55${telefone}?text=${mensagemUrl}`;
    
    window.open(url, '_blank');
    
    toast({
      title: "WhatsApp aberto!",
      description: "Mensagem de cobrança preparada no WhatsApp Web."
    });
    
    onOpenChange(false);
  };

  const enviarEmail = () => {
    const assunto = encodeURIComponent(`Lembrete de Pagamento - ${pagamento?.mes || ''}`);
    const corpo = encodeURIComponent(mensagemFinal);
    const url = `mailto:${aluno?.email}?subject=${assunto}&body=${corpo}`;
    
    window.open(url);
    
    toast({
      title: "Email aberto!",
      description: "Mensagem de cobrança preparada no seu cliente de email."
    });
    
    onOpenChange(false);
  };

  const copiarMensagem = () => {
    navigator.clipboard.writeText(mensagemFinal);
    toast({
      title: "Mensagem copiada!",
      description: "Mensagem copiada para a área de transferência."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cobrar Aluno - {aluno.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chavePix">Chave PIX</Label>
              <Input
                id="chavePix"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="Sua chave PIX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkPagamento">Link de Pagamento (Cartão)</Label>
              <Input
                id="linkPagamento"
                value={linkPagamento}
                onChange={(e) => setLinkPagamento(e.target.value)}
                placeholder="Link do Mercado Pago, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canal">Canal de Envio</Label>
            <Select value={canal} onValueChange={(value: "whatsapp" | "email") => setCanal(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem (deixe vazio para usar o padrão)</Label>
            <Textarea
              id="mensagem"
              value={mensagemPersonalizada}
              onChange={(e) => setMensagemPersonalizada(e.target.value)}
              placeholder="Digite uma mensagem personalizada ou deixe vazio para usar a mensagem padrão"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Preview da Mensagem</Label>
            <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
              {mensagemFinal}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={copiarMensagem}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Mensagem
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              
              {canal === "whatsapp" ? (
                <Button onClick={enviarWhatsApp} className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar WhatsApp
                </Button>
              ) : (
                <Button onClick={enviarEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}