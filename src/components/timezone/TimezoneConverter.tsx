import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Globe } from "lucide-react";
import { getTimezoneInfo } from "@/data/locations";

interface TimezoneConverterProps {
  baseTime: string; // Horário de Brasília
  baseDate: string;
  aluno?: {
    cidade?: string;
    estado?: string;
    pais?: string;
  };
}

export function TimezoneConverter({ baseTime, baseDate, aluno }: TimezoneConverterProps) {
  const [convertedTime, setConvertedTime] = useState<string>("");
  const [timezoneInfo, setTimezoneInfo] = useState<any>(null);

  useEffect(() => {
    if (aluno?.cidade && aluno?.estado && aluno?.pais) {
      const timezone = getTimezoneInfo(aluno.pais, aluno.estado, aluno.cidade);
      setTimezoneInfo(timezone);
      
      // Converter horário de Brasília para o fuso do aluno
      const [hours, minutes] = baseTime.split(':');
      const brasiliaDate = new Date(`${baseDate}T${hours}:${minutes}:00-03:00`);
      
      // Calcular diferença de fuso simples (baseado no offset UTC)
      const offsetHours = parseInt(timezone.utcOffset.replace('UTC', '').replace('+', '').replace('-', ''));
      const offsetDiff = (offsetHours + 3) * 60; // +3 = conversão de Brasília UTC-3
      const localDate = new Date(brasiliaDate.getTime() + (offsetDiff * 60000));
      
      const localTime = localDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setConvertedTime(localTime);
    }
  }, [baseTime, baseDate, aluno]);

  if (!aluno?.cidade || !timezoneInfo) {
    return (
      <div className="text-sm text-muted-foreground">
        Localização do aluno não informada
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Conversão de Horário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Professor (Brasília)</div>
            <div className="font-mono text-lg font-bold text-green-700">{baseTime}</div>
            <Badge variant="outline" className="text-xs">UTC-3</Badge>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Aluno ({aluno.cidade})</div>
            <div className="font-mono text-lg font-bold text-blue-700">{convertedTime}</div>
            <Badge variant="outline" className="text-xs">{timezoneInfo.utcOffset}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{aluno.cidade}, {aluno.estado} - {timezoneInfo.displayName}</span>
        </div>
        
        {convertedTime !== baseTime && (
          <div className="text-xs text-center text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Horários diferentes - confirme com o aluno
          </div>
        )}
      </CardContent>
    </Card>
  );
}