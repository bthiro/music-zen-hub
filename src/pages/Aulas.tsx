import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Video, Plus, Search, ExternalLink, FileText, MessageCircle, Mail, Upload, Edit, Save, X } from "lucide-react";

export default function Aulas() {
  const { aulas, updateAula, getAlunoById } = useApp();
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [editandoAula, setEditandoAula] = useState<string | null>(null);
  const [formEdicao, setFormEdicao] = useState({
    observacoesAula: "",
    materiaisPdf: [] as string[]
  });

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

  const iniciarEdicao = (aula: any) => {
    setEditandoAula(aula.id);
    setFormEdicao({
      observacoesAula: aula.observacoesAula || "",
      materiaisPdf: aula.materiaisPdf || []
    });
  };

  const cancelarEdicao = () => {
    setEditandoAula(null);
    setFormEdicao({ observacoesAula: "", materiaisPdf: [] });
  };

  const salvarEdicao = (aulaId: string) => {
    updateAula(aulaId, {
      observacoesAula: formEdicao.observacoesAula,
      materiaisPdf: formEdicao.materiaisPdf
    });
    setEditandoAula(null);
    toast({
      title: "Sucesso",
      description: "Informações da aula atualizadas!"
    });
  };

  const adicionarPdf = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files);
      const fileNames = files.map((file: any) => file.name);
      setFormEdicao(prev => ({
        ...prev,
        materiaisPdf: [...prev.materiaisPdf, ...fileNames]
      }));
    };
    input.click();
  };

  const removerPdf = (index: number) => {
    setFormEdicao(prev => ({
      ...prev,
      materiaisPdf: prev.materiaisPdf.filter((_, i) => i !== index)
    }));
  };

  const enviarViaWhatsApp = (aula: any) => {
    const aluno = getAlunoById(aula.alunoId);
    if (!aluno || !aluno.telefone) {
      toast({
        title: "Erro",
        description: "Telefone do aluno não encontrado",
        variant: "destructive"
      });
      return;
    }

    const mensagem = `Olá ${aula.aluno}! 

Aqui estão as informações da sua aula de ${formatarData(aula.data)}:

${aula.observacoesAula ? `📝 Observações: ${aula.observacoesAula}` : ''}

${aula.materiaisPdf && aula.materiaisPdf.length > 0 ? 
  `📚 Materiais: ${aula.materiaisPdf.join(', ')}` : ''}

Qualquer dúvida, estou à disposição!`;

    const telefone = aluno.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const enviarViaEmail = (aula: any) => {
    const aluno = getAlunoById(aula.alunoId);
    if (!aluno) {
      toast({
        title: "Erro",
        description: "Dados do aluno não encontrados",
        variant: "destructive"
      });
      return;
    }

    const assunto = `Informações da Aula - ${formatarData(aula.data)}`;
    const corpo = `Olá ${aula.aluno}!

Aqui estão as informações da sua aula de ${formatarData(aula.data)}:

${aula.observacoesAula ? `Observações da aula:
${aula.observacoesAula}

` : ''}${aula.materiaisPdf && aula.materiaisPdf.length > 0 ? 
  `Materiais compartilhados:
${aula.materiaisPdf.map((pdf: string) => `- ${pdf}`).join('\n')}

` : ''}Qualquer dúvida, estou à disposição!

Atenciosamente,
Professor`;

    const url = `mailto:${aluno.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = url;
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold">{aula.aluno}</h3>
                      <Badge className={getStatusColor(aula.status)}>
                        {aula.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
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

                    {/* Observações originais da aula */}
                    {aula.observacoes && (
                      <div className="mb-4">
                        <p className="font-medium text-foreground text-sm">Observações do agendamento:</p>
                        <p className="text-sm text-muted-foreground">{aula.observacoes}</p>
                      </div>
                    )}

                    {/* Seção de observações da aula e materiais */}
                    <div className="border-t pt-4 space-y-4">
                      {editandoAula === aula.id ? (
                        // Modo de edição
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">
                              Observações da Aula:
                            </label>
                            <Textarea
                              value={formEdicao.observacoesAula}
                              onChange={(e) => setFormEdicao(prev => ({
                                ...prev,
                                observacoesAula: e.target.value
                              }))}
                              placeholder="Como foi a aula? O que foi ensinado? Pontos de atenção..."
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">
                              Materiais em PDF:
                            </label>
                            <div className="space-y-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={adicionarPdf}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Adicionar PDFs
                              </Button>
                              {formEdicao.materiaisPdf.length > 0 && (
                                <div className="space-y-1">
                                  {formEdicao.materiaisPdf.map((pdf, index) => (
                                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                                      <span className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        {pdf}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removerPdf(index)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => salvarEdicao(aula.id)}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelarEdicao}>
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização
                        <div className="space-y-3">
                          {(aula.observacoesAula || aula.materiaisPdf?.length > 0) ? (
                            <>
                              {aula.observacoesAula && (
                                <div>
                                  <p className="font-medium text-foreground text-sm">Observações da Aula:</p>
                                  <p className="text-sm text-muted-foreground">{aula.observacoesAula}</p>
                                </div>
                              )}
                              
                              {aula.materiaisPdf && aula.materiaisPdf.length > 0 && (
                                <div>
                                  <p className="font-medium text-foreground text-sm">Materiais:</p>
                                  <div className="space-y-1">
                                    {aula.materiaisPdf.map((pdf: string, index: number) => (
                                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        {pdf}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    const aluno = getAlunoById(aula.alunoId);
                                    if (!aluno || !aluno.telefone) {
                                      toast({
                                        title: "Erro",
                                        description: "Telefone do aluno não encontrado",
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    
                                    const mensagem = `Olá ${aula.aluno}!

Aqui está o link da sua aula de ${formatarData(aula.data)} às ${aula.horario}:

🎥 Link da aula: ${aula.linkMeet}

Te espero lá!`;
                                    
                                    const telefone = aluno.telefone.replace(/\D/g, '');
                                    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Enviar Link
                                </Button>
                                
                                {(aula.observacoesAula || (aula.materiaisPdf && aula.materiaisPdf.length > 0)) && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => enviarViaWhatsApp(aula)}>
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      WhatsApp
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => enviarViaEmail(aula)}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      E-mail
                                    </Button>
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Nenhuma observação ou material adicionado ainda.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
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
                    
                    {(aula.status === "realizada" || aula.status === "agendada") && editandoAula !== aula.id && (
                      <Button size="sm" variant="outline" onClick={() => iniciarEdicao(aula)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
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
