import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Shield, 
  Mail, 
  Users,
  AlertTriangle,
  Save
} from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminConfiguracoes() {
  const { settings, loading, updateSetting, getSetting } = useAdminSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const handleSaveMaintenanceMode = async () => {
    setSaving('maintenance');
    const maintenanceSettings = getSetting('maintenance_mode') || {};
    await updateSetting('maintenance_mode', maintenanceSettings);
    setSaving(null);
  };

  const handleSaveEmailSettings = async () => {
    setSaving('email');
    const emailSettings = getSetting('email_settings') || {};
    await updateSetting('email_settings', emailSettings);
    setSaving(null);
  };

  const handleSaveSecuritySettings = async () => {
    setSaving('security');
    const securitySettings = getSetting('security_settings') || {};
    await updateSetting('security_settings', securitySettings);
    setSaving(null);
  };

  const handleSavePlanLimits = async () => {
    setSaving('plans');
    const planLimits = getSetting('default_plan_limits') || {};
    await updateSetting('default_plan_limits', planLimits);
    setSaving(null);
  };

  const updateMaintenanceMode = (field: string, value: any) => {
    const current = getSetting('maintenance_mode') || {};
    const updated = { ...current, [field]: value };
    updateSetting('maintenance_mode', updated);
  };

  const updateEmailSettings = (field: string, value: any) => {
    const current = getSetting('email_settings') || {};
    const updated = { ...current, [field]: value };
    updateSetting('email_settings', updated);
  };

  const updateSecuritySettings = (field: string, value: any) => {
    const current = getSetting('security_settings') || {};
    const updated = { ...current, [field]: value };
    updateSetting('security_settings', updated);
  };

  const updatePlanLimits = (plano: string, field: string, value: any) => {
    const current = getSetting('default_plan_limits') || {};
    const updated = {
      ...current,
      [plano]: {
        ...current[plano],
        [field]: value
      }
    };
    updateSetting('default_plan_limits', updated);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Configurações Administrativas</h2>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const maintenanceMode = getSetting('maintenance_mode') || {};
  const emailSettings = getSetting('email_settings') || {};
  const securitySettings = getSetting('security_settings') || {};
  const planLimits = getSetting('default_plan_limits') || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurações Administrativas</h2>
            <p className="text-muted-foreground">
              Gerencie configurações globais do sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="system" className="space-y-4">
          <TabsList>
            <TabsTrigger value="system">
              <Settings className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="plans">
              <Users className="h-4 w-4 mr-2" />
              Planos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Modo Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={maintenanceMode.enabled || false}
                    onCheckedChange={(checked) => updateMaintenanceMode('enabled', checked)}
                  />
                  <Label>Ativar modo manutenção</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Mensagem para usuários</Label>
                  <Textarea
                    id="maintenance-message"
                    value={maintenanceMode.message || ''}
                    onChange={(e) => updateMaintenanceMode('message', e.target.value)}
                    placeholder="Sistema em manutenção. Tente novamente em alguns minutos."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleSaveMaintenanceMode}
                  disabled={saving === 'maintenance'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'maintenance' ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-min">Tamanho mínimo da senha</Label>
                  <Input
                    id="password-min"
                    type="number"
                    value={securitySettings.password_min_length || 8}
                    onChange={(e) => updateSecuritySettings('password_min_length', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securitySettings.require_2fa || false}
                    onCheckedChange={(checked) => updateSecuritySettings('require_2fa', checked)}
                  />
                  <Label>Exigir autenticação de dois fatores (2FA)</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout da sessão (segundos)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={securitySettings.session_timeout || 86400}
                    onChange={(e) => updateSecuritySettings('session_timeout', parseInt(e.target.value))}
                    min="300"
                  />
                </div>

                <Button 
                  onClick={handleSaveSecuritySettings}
                  disabled={saving === 'security'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'security' ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={emailSettings.smtp_enabled || false}
                    onCheckedChange={(checked) => updateEmailSettings('smtp_enabled', checked)}
                  />
                  <Label>SMTP habilitado</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">Email remetente</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.from_email || ''}
                    onChange={(e) => updateEmailSettings('from_email', e.target.value)}
                    placeholder="noreply@musiczenhub.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-template">Template de boas-vindas</Label>
                  <Input
                    id="welcome-template"
                    value={emailSettings.welcome_template || 'default'}
                    onChange={(e) => updateEmailSettings('welcome_template', e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleSaveEmailSettings}
                  disabled={saving === 'email'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'email' ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Plano Básico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limite de alunos</Label>
                    <Input
                      type="number"
                      value={planLimits.basico?.alunos || 20}
                      onChange={(e) => updatePlanLimits('basico', 'alunos', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Módulos inclusos</Label>
                    <div className="text-sm text-muted-foreground">
                      Dashboard, Agenda, Pagamentos
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plano Premium</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Limite de alunos</Label>
                    <Input
                      type="number"
                      value={planLimits.premium?.alunos || 500}
                      onChange={(e) => updatePlanLimits('premium', 'alunos', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Módulos inclusos</Label>
                    <div className="text-sm text-muted-foreground">
                      Todos os módulos (Dashboard, Agenda, Pagamentos, IA, Lousa, Ferramentas, Materiais)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleSavePlanLimits}
              disabled={saving === 'plans'}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving === 'plans' ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}