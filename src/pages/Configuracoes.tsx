import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoIntegrationPanel } from '@/components/AutoIntegrationPanel';
import { ConfigurationNavigation, ConfigSection } from '@/components/ConfigurationNavigation';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Configuracoes() {
  const { professor, fetchProfessor } = useAuth();
  const [activeSection, setActiveSection] = useState<ConfigSection>('perfil');
  
  // Estados para perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Estados para preferências
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [reminderTime, setReminderTime] = useState('60');
  
  // Estados para mensagens
  const [pixKey, setPixKey] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('Olá {aluno}, sua aula está agendada para {data} às {horario}. Nos vemos em breve!');
  const [emailSignature, setEmailSignature] = useState('');

  // Carregar dados do professor quando disponível
  useEffect(() => {
    if (professor) {
      setNome(professor.nome || '');
      setEmail(professor.email || '');
      setTelefone(professor.telefone || '');
      setBio(professor.bio || '');
      setEspecialidades(professor.especialidades || '');
      setAvatarUrl(professor.avatar_url || '');
    }
  }, [professor]);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('configuracoes');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setTimezone(config.timezone || 'America/Sao_Paulo');
        setPixKey(config.pixKey || '');
        setPaymentLink(config.paymentLink || '');
        setMessageTemplate(config.messageTemplate || 'Olá {aluno}, sua aula está agendada para {data} às {horario}. Nos vemos em breve!');
        setEmailSignature(config.emailSignature || '');
        setNotificationsEnabled(config.notificationsEnabled !== false);
        setAutoSync(config.autoSync || false);
        setReminderTime(config.reminderTime || '60');
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const salvarPerfil = async () => {
    if (!professor?.id) {
      toast.error('Erro: Professor não encontrado');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('professores')
        .update({
          nome,
          telefone,
          bio,
          especialidades,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', professor.id);

      if (error) throw error;
      
      await fetchProfessor();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    }
  };

  const salvarConfiguracoes = () => {
    const config = {
      timezone,
      pixKey,
      paymentLink,
      messageTemplate,
      emailSignature,
      notificationsEnabled,
      autoSync,
      reminderTime
    };
    
    localStorage.setItem('configuracoes', JSON.stringify(config));
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <Layout>
      <div className="flex gap-6 h-full">
        {/* Sidebar de navegação */}
        <div className="w-64 flex-shrink-0">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigurationNavigation 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 space-y-6">
          {activeSection === 'perfil' && (
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Professor</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações pessoais e foto de perfil
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <ProfilePhotoUpload
                    currentPhoto={avatarUrl}
                    onUpload={setAvatarUrl}
                    professorName={nome || professor?.nome}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especialidades">Especialidades Musicais</Label>
                  <Input
                    id="especialidades"
                    value={especialidades}
                    onChange={(e) => setEspecialidades(e.target.value)}
                    placeholder="Ex: Violão, Piano, Teoria Musical, Canto..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/Apresentação</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre sua experiência musical, formação e metodologia de ensino..."
                    rows={4}
                  />
                </div>

                <Button onClick={salvarPerfil} className="w-full">
                  Salvar Perfil
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'preferencias' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure suas preferências de uso e notificações
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                        <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                        <SelectItem value="America/Cuiaba">Cuiabá (GMT-4)</SelectItem>
                        <SelectItem value="America/Campo_Grande">Campo Grande (GMT-4)</SelectItem>
                        <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
                        <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
                        <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder">Lembrete das Aulas</Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos antes</SelectItem>
                        <SelectItem value="30">30 minutos antes</SelectItem>
                        <SelectItem value="60">1 hora antes</SelectItem>
                        <SelectItem value="120">2 horas antes</SelectItem>
                        <SelectItem value="240">4 horas antes</SelectItem>
                        <SelectItem value="1440">1 dia antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">Receba lembretes por email</p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sincronização Automática</Label>
                      <p className="text-sm text-muted-foreground">Sincronizar automaticamente com Google Calendar</p>
                    </div>
                    <Switch
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                    />
                  </div>
                </div>

                <Button onClick={salvarConfiguracoes} className="w-full">
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'mensagens' && (
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagens</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure templates para mensagens automáticas e dados de pagamento
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix">Chave PIX</Label>
                    <Input
                      id="pix"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="sua.chave@pix.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentLink">Link de Pagamento</Label>
                    <Input
                      id="paymentLink"
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      placeholder="https://seu-link-de-pagamento.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messageTemplate">Template de Agendamento</Label>
                    <Textarea
                      id="messageTemplate"
                      value={messageTemplate}
                      onChange={(e) => setMessageTemplate(e.target.value)}
                      placeholder="Olá {aluno}, sua aula está agendada para {data} às {horario}."
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use {'{aluno}'}, {'{data}'}, {'{horario}'} para personalizar a mensagem
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailSignature">Assinatura de Email</Label>
                    <Textarea
                      id="emailSignature"
                      value={emailSignature}
                      onChange={(e) => setEmailSignature(e.target.value)}
                      placeholder="Seu nome, Qualificações, Contato"
                      rows={3}
                    />
                  </div>
                </div>

                <Button onClick={salvarConfiguracoes} className="w-full">
                  Salvar Templates
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'integracoes' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure suas integrações com serviços externos
                </p>
              </CardHeader>
              <CardContent>
                <AutoIntegrationPanel />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}