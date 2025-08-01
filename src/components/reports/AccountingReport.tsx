import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Download, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountingReport() {
  const { pagamentos, alunos, aulas } = useApp();
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  // Dados contábeis padrão
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Filtrar dados por período se especificado
  const filtrarPorPeriodo = (lista: any[], campo: string) => {
    if (!periodoInicio || !periodoFim) return lista;
    
    return lista.filter(item => {
      const data = new Date(item[campo]);
      const inicio = new Date(periodoInicio);
      const fim = new Date(periodoFim);
      return data >= inicio && data <= fim;
    });
  };

  // Receitas (Pagamentos recebidos)
  const receitasRecebidas = filtrarPorPeriodo(
    pagamentos.filter(p => p.status === "pago" && p.pagamento), 
    "pagamento"
  );

  // Contas a Receber (Pagamentos pendentes)
  const contasReceber = pagamentos.filter(p => p.status !== "pago");

  // Relatório DRE (Demonstração do Resultado do Exercício)
  const receitas = {
    mensalidades: receitasRecebidas.reduce((sum, p) => sum + p.valor, 0),
    total: receitasRecebidas.reduce((sum, p) => sum + p.valor, 0)
  };

  // Custos operacionais (simulados - em um sistema real viriam de outro lugar)
  const custos = {
    plataforma: receitas.total * 0.05, // 5% para plataforma de reuniões
    impostos: receitas.total * 0.08, // 8% de impostos aproximados
    total: 0
  };
  custos.total = custos.plataforma + custos.impostos;

  const lucroLiquido = receitas.total - custos.total;

  // Balanço Patrimonial Simplificado
  const ativo = {
    disponivel: receitas.total, // Caixa (simulado)
    contasReceber: contasReceber.reduce((sum, p) => sum + p.valor, 0),
    total: 0
  };
  ativo.total = ativo.disponivel + ativo.contasReceber;

  const passivo = {
    contasPagar: custos.total * 0.3, // Contas a pagar (simulado)
    total: 0
  };
  passivo.total = passivo.contasPagar;

  const patrimonioLiquido = ativo.total - passivo.total;

  // Fluxo de Caixa
  const fluxoCaixa = {
    entradas: receitas.total,
    saidas: custos.total,
    saldo: receitas.total - custos.total
  };

  // Exportar relatório contábil
  const exportarRelatorioContabil = () => {
    const periodo = periodoInicio && periodoFim ? 
      `${new Date(periodoInicio).toLocaleDateString('pt-BR')} a ${new Date(periodoFim).toLocaleDateString('pt-BR')}` :
      `Mês de ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;

    const relatorio = `RELATÓRIO CONTÁBIL - ${periodo}
=====================================

DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)
==============================================
RECEITAS OPERACIONAIS
  Mensalidades Recebidas: R$ ${receitas.mensalidades.toFixed(2)}
  (-) Deduções: R$ 0,00
RECEITA LÍQUIDA: R$ ${receitas.total.toFixed(2)}

CUSTOS E DESPESAS OPERACIONAIS
  Plataforma de Reuniões: R$ ${custos.plataforma.toFixed(2)}
  Impostos e Taxas: R$ ${custos.impostos.toFixed(2)}
TOTAL CUSTOS: R$ ${custos.total.toFixed(2)}

LUCRO LÍQUIDO: R$ ${lucroLiquido.toFixed(2)}

BALANÇO PATRIMONIAL SIMPLIFICADO
=================================
ATIVO
  Ativo Circulante
    Disponível (Caixa): R$ ${ativo.disponivel.toFixed(2)}
    Contas a Receber: R$ ${ativo.contasReceber.toFixed(2)}
TOTAL ATIVO: R$ ${ativo.total.toFixed(2)}

PASSIVO
  Passivo Circulante
    Contas a Pagar: R$ ${passivo.contasPagar.toFixed(2)}
TOTAL PASSIVO: R$ ${passivo.total.toFixed(2)}

PATRIMÔNIO LÍQUIDO: R$ ${patrimonioLiquido.toFixed(2)}

FLUXO DE CAIXA
===============
  Entradas: R$ ${fluxoCaixa.entradas.toFixed(2)}
  Saídas: R$ ${fluxoCaixa.saidas.toFixed(2)}
  Saldo Líquido: R$ ${fluxoCaixa.saldo.toFixed(2)}

DETALHAMENTO DE RECEITAS
========================
${receitasRecebidas.map(p => 
  `${new Date(p.pagamento!).toLocaleDateString('pt-BR')} - ${p.aluno} - R$ ${p.valor.toFixed(2)}`
).join('\n')}

CONTAS A RECEBER
================
${contasReceber.map(p => 
  `Venc: ${new Date(p.vencimento).toLocaleDateString('pt-BR')} - ${p.aluno} - R$ ${p.valor.toFixed(2)} - Status: ${p.status}`
).join('\n')}
`;

    const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-contabil-${hoje.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">📊 Relatório Contábil</h3>
        <Button onClick={exportarRelatorioContabil}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inicio">Data Início</Label>
              <Input
                id="inicio"
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fim">Data Fim</Label>
              <Input
                id="fim"
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DRE - Demonstração do Resultado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            DRE - Demonstração do Resultado do Exercício
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="font-semibold text-green-600">RECEITAS OPERACIONAIS</h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>Mensalidades Recebidas</span>
                  <span>R$ {receitas.mensalidades.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>RECEITA LÍQUIDA</span>
                  <span>R$ {receitas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-2">
              <h4 className="font-semibold text-red-600">CUSTOS E DESPESAS</h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                  <span>Plataforma de Reuniões (5%)</span>
                  <span>R$ {custos.plataforma.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos e Taxas (8%)</span>
                  <span>R$ {custos.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>TOTAL CUSTOS</span>
                  <span>R$ {custos.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded font-bold text-lg ${lucroLiquido >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex justify-between">
                <span>LUCRO LÍQUIDO</span>
                <span>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balanço Patrimonial */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balanço Patrimonial - ATIVO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold">ATIVO CIRCULANTE</h4>
              <div className="pl-4 space-y-2">
                <div className="flex justify-between">
                  <span>Disponível (Caixa)</span>
                  <span>R$ {ativo.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contas a Receber</span>
                  <span>R$ {ativo.contasReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>TOTAL ATIVO</span>
                  <span>R$ {ativo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balanço Patrimonial - PASSIVO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold">PASSIVO CIRCULANTE</h4>
              <div className="pl-4 space-y-2">
                <div className="flex justify-between">
                  <span>Contas a Pagar</span>
                  <span>R$ {passivo.contasPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>TOTAL PASSIVO</span>
                  <span>R$ {passivo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 mt-2">
                  <span>PATRIMÔNIO LÍQUIDO</span>
                  <span>R$ {patrimonioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                R$ {fluxoCaixa.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-green-700">Entradas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                R$ {fluxoCaixa.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-red-700">Saídas</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${fluxoCaixa.saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <div className={`text-2xl font-bold ${fluxoCaixa.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                R$ {fluxoCaixa.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${fluxoCaixa.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                Saldo Líquido
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contasReceber.length > 0 ? (
              contasReceber.map(pagamento => (
                <div key={pagamento.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{pagamento.aluno}</span>
                    <div className="text-sm text-muted-foreground">
                      Vencimento: {new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      pagamento.status === 'atrasado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pagamento.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma conta a receber
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}