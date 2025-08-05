import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, Calendar, RotateCcw } from "lucide-react";

interface StatusIndicatorProps {
  status: "agendada" | "realizada" | "cancelada" | "remarcada";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function StatusIndicator({ status, size = "md", showIcon = true }: StatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "agendada":
        return {
          label: "Agendada",
          color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
          icon: Clock,
          dotColor: "bg-blue-500"
        };
      case "realizada":
        return {
          label: "Realizada",
          color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
          icon: CheckCircle,
          dotColor: "bg-green-500"
        };
      case "cancelada":
        return {
          label: "Cancelada",
          color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          icon: XCircle,
          dotColor: "bg-red-500"
        };
      case "remarcada":
        return {
          label: "Remarcada",
          color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
          icon: RotateCcw,
          dotColor: "bg-yellow-500"
        };
      default:
        return {
          label: "Indefinido",
          color: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
          icon: Calendar,
          dotColor: "bg-gray-500"
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 font-medium transition-colors",
        config.color,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="relative flex items-center gap-1.5">
        <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
        {config.label}
      </span>
    </Badge>
  );
}