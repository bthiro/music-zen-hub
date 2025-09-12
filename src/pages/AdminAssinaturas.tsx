import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminProfessorBilling from "./AdminProfessorBilling";
import { GlobalPaymentsView } from "@/components/GlobalPaymentsView";
import { AdminMercadoPagoConfig } from "@/components/AdminMercadoPagoConfig";
import { AdminPlanManagement } from "@/components/AdminPlanManagement";
import { Users, CreditCard, Settings, TrendingUp } from "lucide-react";

export default function AdminAssinaturas() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assinaturas & Pagamentos</h2>
          <p className="text-muted-foreground">
            Gerencie as assinaturas dos professores e pagamentos dos alunos
          </p>
        </div>

        <Tabs defaultValue="professores" className="space-y-4">
          <TabsList>
            <TabsTrigger value="professores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Professores
            </TabsTrigger>
            <TabsTrigger value="alunos" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="configuracao" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="planos" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gestão de Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professores" className="space-y-4">
            <AdminProfessorBilling embedded={true} />
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            <GlobalPaymentsView />
          </TabsContent>

          <TabsContent value="configuracao" className="space-y-4">
            <AdminMercadoPagoConfig />
          </TabsContent>

          <TabsContent value="planos" className="space-y-4">
            <AdminPlanManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}