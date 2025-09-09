import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { useApp } from "@/contexts/AppContext";
import { Calendar as CalendarIcon, RefreshCw, ExternalLink, Plus } from "lucide-react";

export function GoogleCalendarReal() {
  const { isAuthenticated, userEmail, isLoading, signIn, signOut, createCalendarEvent } = useGoogleIntegration();
  const { aulas, alunos } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const proximasAulas = aulas
    .filter((a) => a.status === "agendada")
    .slice(0, 3);

  const syncAula = async (aula: any) => {
    const aluno = alunos.find((a) => a.id === aula.alunoId);
    if (!aluno) return;

    // Calcular horário fim se não existir
    const [h, m] = aula.horario.split(":").map((n: string) => parseInt(n, 10));
    const inicio = new Date(`${aula.data}T${aula.horario}:00`);
    const duracao = aluno.duracaoAula ?? aula.duracaoMinutos ?? 50;
    const fimDate = new Date(inicio);
    fimDate.setMinutes(fimDate.getMinutes() + duracao);
    const horarioFim = `${String(fimDate.getHours()).padStart(2, "0")}:${String(fimDate.getMinutes()).padStart(2, "0")}`;

    setSyncingId(aula.id);
    try {
      await createCalendarEvent(
        aula.aluno,
        aula.data,
        aula.horario,
        horarioFim,
        duracao
      );
    } finally {
      setSyncingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Integração Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-6">
            <CalendarIcon className="h-14 w-14 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-base font-semibold mb-2">Conectar ao Google Calendar</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Conecte sua conta do Google para sincronizar suas aulas automaticamente.
            </p>
            <Button onClick={signIn} disabled={isLoading} size="sm">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Conectar Google Calendar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" /> Google Calendar
          </span>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            ● Conectado — {userEmail}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> Abrir Google Calendar
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Desconectar
          </Button>
        </div>

        {proximasAulas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Sincronizar próximas aulas</h4>
            {proximasAulas.map((aula) => (
              <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{aula.aluno}</div>
                  <div className="text-xs text-muted-foreground">{new Date(aula.data).toLocaleDateString("pt-BR")} às {aula.horario}</div>
                </div>
                <Button size="sm" onClick={() => syncAula(aula)} disabled={syncingId === aula.id}>
                  {syncingId === aula.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Sincronizar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
