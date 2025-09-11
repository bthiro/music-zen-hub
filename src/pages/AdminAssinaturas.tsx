import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminProfessorBilling from "./AdminProfessorBilling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard } from "lucide-react";

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
          </TabsList>

          <TabsContent value="professores" className="space-y-4">
            <AdminProfessorBilling embedded={true} />
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em desenvolvimento - Visualização global dos pagamentos de alunos por professor
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}