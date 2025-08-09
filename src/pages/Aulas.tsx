import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { EditarAulaDialog } from "@/components/dialogs/EditarAulaDialog";
import { ReagendarLoteDialog } from "@/components/dialogs/ReagendarLoteDialog";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Video, Plus, Search, ExternalLink, FileText, MessageCircle, Mail, Upload, Edit, Save, X, Filter, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";

export default function Aulas() {
  const { aulas, alunos, atualizarAula } = useSupabaseData();
  const { toast } = useToast();
  const [busca, setBusca] = useState("");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [editarAulaDialogOpen, setEditarAulaDialogOpen] = useState(false);
  const [reagendarLoteDialogOpen, setReagendarLoteDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("ativas"); // Padrão: não canceladas
  const [filtroDiaSemana, setFiltroDiaSemana] = useState("todos");
  const [editandoAula, setEditandoAula] = useState<string | null>(null);
  const [aulaParaEditar, setAulaParaEditar] = useState<any>(null);
  const [alunoParaReagendar, setAlunoParaReagendar] = useState<{id: string, nome: string} | null>(null);
  const [formEdicao, setFormEdicao] = useState({
    observacoesAula: "",
    materiaisPdf: [] as string[]
  });

  const getAlunoById = (id: string) => {
    return alunos.find(aluno => aluno.id === id);
  };

  const aulasFiltradas = aulas.filter(aula => {
    const aluno = alunos.find(a => a.id === aula.aluno_id);
    const alunoNome = aluno?.nome || '';
    const matchBusca = alunoNome.toLowerCase().includes(busca.toLowerCase());
    
    // Filtro de status
    let matchStatus = true;
    if (filtroStatus === "ativas") {
      matchStatus = aula.status !== "cancelada";
    } else if (filtroStatus !== "todas") {
      matchStatus = aula.status === filtroStatus;
    }
    
    // Filtro de dia da semana
    let matchDiaSemana = true;
    if (filtroDiaSemana !== "todos") {
      const dataAula = new Date(aula.data_hora);
      const diaAula = dataAula.getDay();
      matchDiaSemana = diaAula.toString() === filtroDiaSemana;
    }
    
    return matchBusca && matchStatus && matchDiaSemana;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "realizada":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border border-red-200";
      case "remarcada":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatarData = (dataHora: string) => {
    return new Date(dataHora).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarHorario = (dataHora: string) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const marcarComoRealizada = async (aulaId: string) => {
    const { error } = await atualizarAula(aulaId, { status: "realizada" });
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar aula",
        variant: "destructive"
      });
    }
  };

  const cancelarAula = async (aulaId: string) => {
    if (confirm("Tem certeza que deseja cancelar esta aula?")) {
      const { error } = await atualizarAula(aulaId, { status: "cancelada" });
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao cancelar aula",
          variant: "destructive"
        });
      }
    }
  };

  const iniciarEdicao = (aula: any) => {
    setEditandoAula(aula.id);
    setFormEdicao({
      observacoesAula: aula.feedback || "",
      materiaisPdf: aula.materiais || []
    });
  };

  const cancelarEdicao = () => {
    setEditandoAula(null);
    setFormEdicao({ observacoesAula: "", materiaisPdf: [] });
  };

  const salvarEdicao = async (aulaId: string) => {
    const { error } = await atualizarAula(aulaId, {
      feedback: formEdicao.observacoesAula,
      materiais: formEdicao.materiaisPdf
    });
    
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar informações da aula",
        variant: "destructive"
      });
    } else {
      setEditandoAula(null);
      toast({
        title: "Sucesso",
        description: "Informações da aula atualizadas!"
      });
    }
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

  const enviarArquivoWhatsApp = (aula: any, nomeArquivo: string) => {
    const aluno = getAlunoById(aula.alunoId);
    if (!aluno || !aluno.telefone) {
      toast({
        title: "Erro",
        description: "Telefone do aluno não encontrado",
        variant: "destructive"
      });
      return;
    }

    const mensagem = `📎 *Material da Aula* 📎

👨‍🎓 *Aluno:* ${aula.aluno}
📅 *Data da Aula:* ${formatarData(aula.data)}
📄 *Material:* ${nomeArquivo}

🎵 Continue praticando! 🎵`;

    const telefone = aluno.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    
    toast({
      title: "WhatsApp aberto!",
      description: `Material "${nomeArquivo}" preparado para envio.`
    });
  };

  const enviarTodosArquivosEmail = (aula: any) => {
    const aluno = getAlunoById(aula.alunoId);
    if (!aluno) {
      toast({
        title: "Erro",
        description: "Email do aluno não cadastrado",
        variant: "destructive"
      });
      return;
    }

    const assunto = encodeURIComponent(`Materiais da Aula - ${formatarData(aula.data)}`);
    let corpo = `Olá ${aula.aluno}!

Segue anexo os materiais da aula do dia ${formatarData(aula.data)}.

`;
    
    if (aula.observacoesAula) {
      corpo += `Observações da aula:
${aula.observacoesAula}

`;
    }
    
    if (aula.materiaisPdf && aula.materiaisPdf.length > 0) {
      corpo += `Materiais enviados:
`;
      aula.materiaisPdf.forEach((material: string, index: number) => {
        corpo += `${index + 1}. ${material}
`;
      });
      corpo += `
`;
    }
    
    corpo += `Continue praticando!

Abraços,
Professor`;
    
    const corpoUrl = encodeURIComponent(corpo);
    const url = `mailto:${aluno.email}?subject=${assunto}&body=${corpoUrl}`;
    
    window.open(url);
    
    toast({
      title: "Email aberto!",
      description: "Email preparado com todos os materiais da aula."
    });
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
    .filter(aula => new Date(aula.data_hora) >= new Date() && aula.status === "agendada")
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight font-display">Aulas</h2>
            <p className="text-muted-foreground">
              Gerencie e acompanhe suas aulas
            </p>
          </div>
          <Button onClick={() => setAulaDialogOpen(true)} className="w-full sm:w-auto btn-mobile">
            <Plus className="h-4 w-4 mr-2" />
            Agendar Aulas
          </Button>
        </div>

        {/* Estatísticas com design unificado */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Aulas Agendadas"
            value={estatisticas.agendadas}
            subtitle="Próximas aulas"
            icon={Calendar}
            color="blue"
            badge={{ text: "Ativas", variant: "default" }}
          />
          
          <StatsCard
            title="Aulas Realizadas"
            value={estatisticas.realizadas}
            subtitle="Finalizadas com sucesso"
            icon={Clock}
            color="green"
            trend={{ value: 12, direction: 'up', label: 'vs mês anterior' }}
          />
          
          <StatsCard
            title="Aulas Canceladas"
            value={estatisticas.canceladas}
            subtitle="Necessitam reagendamento"
            icon={Video}
            color="red"
            badge={{ text: "Atenção", variant: "destructive" }}
          />
          
          <StatsCard
            title="Total de Aulas"
            value={estatisticas.total}
            subtitle="Histórico completo"
            icon={Calendar}
            color="purple"
            trend={{ value: 8, direction: 'up', label: 'crescimento' }}
          />
        </div>

        {/* Próximas Aulas */}
        {proximasAulas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximasAulas.map((aula) => {
                  const aluno = getAlunoById(aula.aluno_id);
                  return (
                    <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{aluno?.nome || 'Aluno não encontrado'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatarData(aula.data_hora)} às {formatarHorario(aula.data_hora)}
                          </p>
                        </div>
                      </div>
                      {aula.link_meet && (
                        <Button size="sm" asChild>
                          <a href={aula.link_meet} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Meet
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros e busca - Layout Mobile First */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtros de Status */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filtroStatus === "ativas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus("ativas")}
                    className="text-xs"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Ativas
                  </Button>
                  <Button
                    variant={filtroStatus === "todas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus("todas")}
                    className="text-xs"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filtroStatus === "agendada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus("agendada")}
                    className="text-xs"
                  >
                    Agendadas
                  </Button>
                  <Button
                    variant={filtroStatus === "realizada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus("realizada")}
                    className="text-xs"
                  >
                    Realizadas
                  </Button>
                  <Button
                    variant={filtroStatus === "cancelada" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus("cancelada")}
                    className="text-xs"
                  >
                    Canceladas
                  </Button>
                </div>
                
                {/* Filtro Dia da Semana */}
                <div className="w-full">
                  <select 
                    value={filtroDiaSemana} 
                    onChange={(e) => setFiltroDiaSemana(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                  >
                    <option value="todos">📅 Todos os dias</option>
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de aulas */}
        <div className="grid gap-4">
          {aulasFiltradas.map((aula) => {
            const aluno = getAlunoById(aula.aluno_id);
            return (
              <Card key={aula.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold">{aluno?.nome || 'Aluno não encontrado'}</h3>
                        <Badge className={getStatusColor(aula.status)}>
                          {aula.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                        <div>
                          <p className="font-medium text-foreground">Data:</p>
                          <p>{formatarData(aula.data_hora)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Horário:</p>
                          <p>{formatarHorario(aula.data_hora)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Link:</p>
                          {aula.link_meet ? (
                            <a 
                              href={aula.link_meet} 
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
                      {aula.tema && (
                        <div className="mb-4">
                          <p className="font-medium text-foreground text-sm">Tema da aula:</p>
                          <p className="text-sm text-muted-foreground">{aula.tema}</p>
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
                                  <div className="space-y-2">
                                    {aula.materiaisPdf.map((pdf: string, index: number) => (
                                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          <span className="text-sm">{pdf}</span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => enviarArquivoWhatsApp(aula, pdf)}
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {aula.materiais.length > 1 && (
                                    <div className="mt-3">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => enviarTodosArquivosEmail(aula)}
                                        className="w-full"
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar Todos por E-mail
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    const aluno = getAlunoById(aula.aluno_id);
                                    if (!aluno || !aluno.telefone) {
                                      toast({
                                        title: "Erro",
                                        description: "Telefone do aluno não encontrado",
                                        variant: "destructive"
                                      });
                                      return;
                                    }
                                    
                                    const mensagem = `Olá ${aluno.nome}!

Aqui está o link da sua aula de ${formatarData(aula.data_hora)} às ${formatarHorario(aula.data_hora)}:

🎥 Link da aula: ${aula.link_meet}

Te espero lá!`;
                                    
                                    const telefone = aluno.telefone.replace(/\D/g, '');
                                    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Enviar Link
                                </Button>
                                
                                {(aula.feedback || (aula.materiais && aula.materiais.length > 0)) && (
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
                      <>
                        <Button size="sm" variant="outline" onClick={() => iniciarEdicao(aula)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setAulaParaEditar(aula);
                            setEditarAulaDialogOpen(true);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Reagendar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setAlunoParaReagendar({ id: aula.aluno_id, nome: aluno?.nome || 'Aluno' });
                            setReagendarLoteDialogOpen(true);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Lote
                        </Button>
                      </>
                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
      
      {aulaParaEditar && (
        <EditarAulaDialog
          open={editarAulaDialogOpen}
          onOpenChange={setEditarAulaDialogOpen}
          aula={aulaParaEditar}
        />
      )}

      {alunoParaReagendar && (
        <ReagendarLoteDialog
          open={reagendarLoteDialogOpen}
          onOpenChange={setReagendarLoteDialogOpen}
          alunoId={alunoParaReagendar.id}
          alunoNome={alunoParaReagendar.nome}
        />
      )}
    </Layout>
  );
}
