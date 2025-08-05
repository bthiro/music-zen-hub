import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, BookOpen, AlertTriangle, Trophy, Plus, FileText } from "lucide-react";

interface EvolutionEntry {
  id: string;
  data: string;
  conteudo: string;
  dificuldades: string;
  observacoes: string;
  nivel: "iniciante" | "intermediario" | "avancado";
}

interface StudentEvolutionProps {
  alunoId: string;
  alunoNome: string;
}

export function StudentEvolution({ alunoId, alunoNome }: StudentEvolutionProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<EvolutionEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    conteudo: "",
    dificuldades: "",
    observacoes: "",
    nivel: "iniciante" as const
  });

  const addEntry = () => {
    if (!formData.conteudo.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newEntry: EvolutionEntry = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      ...formData
    };

    setEntries(prev => [newEntry, ...prev]);
    setFormData({
      conteudo: "",
      dificuldades: "",
      observacoes: "",
      nivel: "iniciante"
    });
    setShowForm(false);

    toast({
      title: "Evolução registrada!",
      description: "Progresso do aluno atualizado"
    });
  };

  const exportToPDF = () => {
    const content = `
RELATÓRIO DE EVOLUÇÃO - ${alunoNome.toUpperCase()}
===============================================

${entries.map(entry => `
DATA: ${entry.data}
NÍVEL: ${entry.nivel.toUpperCase()}

CONTEÚDO ABORDADO:
${entry.conteudo}

DIFICULDADES IDENTIFICADAS:
${entry.dificuldades || 'Nenhuma dificuldade relatada'}

OBSERVAÇÕES:
${entry.observacoes || 'Sem observações adicionais'}

-------------------------------------------
`).join('')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
Total de registros: ${entries.length}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucao-${alunoNome.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "Arquivo baixado com sucesso"
    });
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "iniciante": return "bg-green-50 text-green-700 border-green-200";
      case "intermediario": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "avancado": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Evolução do Aluno
          </div>
          <div className="flex gap-2">
            {entries.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            )}
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrada
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Conteúdo Abordado *</label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Ex: Escala de Dó maior, Acorde de Sol, Técnica de dedilhado..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Dificuldades Identificadas</label>
                <Textarea
                  value={formData.dificuldades}
                  onChange={(e) => setFormData(prev => ({ ...prev, dificuldades: e.target.value }))}
                  placeholder="Pontos que precisam de mais atenção..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Observações Gerais</label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Evolução geral, motivação, próximos passos..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nível Atual</label>
                <Select value={formData.nivel} onValueChange={(value: any) => setFormData(prev => ({ ...prev, nivel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={addEntry}>Salvar</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum registro de evolução ainda</p>
            <p className="text-sm">Clique em "Nova Entrada" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={entry.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm font-medium">{entry.data}</span>
                      <Badge className={getNivelColor(entry.nivel)}>
                        {entry.nivel}
                      </Badge>
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Mais recente
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 font-medium text-foreground mb-1">
                        <BookOpen className="h-3 w-3" />
                        Conteúdo
                      </div>
                      <p className="text-muted-foreground">{entry.conteudo}</p>
                    </div>

                    {entry.dificuldades && (
                      <div>
                        <div className="flex items-center gap-1 font-medium text-foreground mb-1">
                          <AlertTriangle className="h-3 w-3" />
                          Dificuldades
                        </div>
                        <p className="text-muted-foreground">{entry.dificuldades}</p>
                      </div>
                    )}

                    {entry.observacoes && (
                      <div>
                        <div className="flex items-center gap-1 font-medium text-foreground mb-1">
                          <Trophy className="h-3 w-3" />
                          Observações
                        </div>
                        <p className="text-muted-foreground">{entry.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}