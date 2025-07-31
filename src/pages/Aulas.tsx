import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { useApp } from "@/contexts/AppContext";
import { Calendar, Clock, Video, Plus, Search, ExternalLink } from "lucide-react";

export default function Aulas() {
  const { aulas, updateAula } = useApp();
  const [busca, setBusca] = useState("");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todas");

  const aulasFiltradas = aulas.filter(aula => {
    const matchBusca = aula.aluno.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todas" || aula.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-800";
      case "realizada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const marcarComoRealizada = (aulaId: string) => {
    updateAula(aulaId, { status: "realizada" });
  };

  const cancelarAula = (aulaId: string) => {
    updateAula(aulaId, { status: "cancelada" });
  };

  const proximasAulas = aulasFiltradas
    .filter(aula => new Date(aula.data) >= new Date() && aula.status === "agendada")
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);

  const estatisticas = {
    agendadas: aulas.filter(a => a.status === "agendada").length,
    realizadas: aulas.filter(a => a.status === "realizada").length,
    canceladas: aulas.filter(a => a.status === "cancelada").length,
    total: aulas.length
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Aulas</h2>
            <p className="text-muted-foreground">
              Gerencie e acompanhe suas aulas
            </p>
          </div>
          <Button onClick={() => setAulaDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Aulas
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estatisticas.agendadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estatisticas.realizadas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estatisticas.canceladas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas Aulas */}
        {proximasAulas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximasAulas.map((aula) => (
                  <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{aula.aluno}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatarData(aula.data)} às {aula.horario}
                        </p>
                      </div>
                    </div>
                    {aula.linkMeet && (
                      <Button size="sm" asChild>
                        <a href={aula.linkMeet} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Meet
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filtroStatus === "todas" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("todas")}
                >
                  Todas
                </Button>
                <Button
                  variant={filtroStatus === "agendada" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("agendada")}
                >
                  Agendadas
                </Button>
                <Button
                  variant={filtroStatus === "realizada" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("realizada")}
                >
                  Realizadas
                </Button>
                <Button
                  variant={filtroStatus === "cancelada" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus("cancelada")}
                >
                  Canceladas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de aulas */}
        <div className="grid gap-4">
          {aulasFiltradas.map((aula) => (
            <Card key={aula.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{aula.aluno}</h3>
                      <Badge className={getStatusColor(aula.status)}>
                        {aula.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Data:</p>
                        <p>{formatarData(aula.data)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Horário:</p>
                        <p>{aula.horario}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Link:</p>
                        {aula.linkMeet ? (
                          <a 
                            href={aula.linkMeet} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Google Meet <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p>Não disponível</p>
                        )}
                      </div>
                    </div>
                    {aula.observacoes && (
                      <div className="mt-3">
                        <p className="font-medium text-foreground text-sm">Observações:</p>
                        <p className="text-sm text-muted-foreground">{aula.observacoes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {aula.status === "agendada" && (
                      <>
                        <Button size="sm" onClick={() => marcarComoRealizada(aula.id)}>
                          Concluir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => cancelarAula(aula.id)}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {aulasFiltradas.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma aula encontrada.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AulaDialog 
        open={aulaDialogOpen} 
        onOpenChange={setAulaDialogOpen}
      />
    </Layout>
  );
}