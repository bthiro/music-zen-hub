import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { MercadoPagoDialog } from "./dialogs/MercadoPagoDialog";

interface MercadoPagoButtonProps {
  alunoId: string;
  alunoNome: string;
  valorSugerido?: number;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function MercadoPagoButton({ 
  alunoId, 
  alunoNome, 
  valorSugerido,
  variant = "outline",
  size = "sm",
  className = ""
}: MercadoPagoButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={`bg-[#009EE3] hover:bg-[#0080B8] text-white border-0 ${className}`}
        onClick={() => setShowDialog(true)}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Mercado Pago
      </Button>
      
      <MercadoPagoDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        alunoId={alunoId}
        alunoNome={alunoNome}
        valorSugerido={valorSugerido}
      />
    </>
  );
}