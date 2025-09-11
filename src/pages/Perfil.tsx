import { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProfessorProfile } from "@/hooks/useProfessorProfile";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { supabase } from "@/integrations/supabase/client";
import { MercadoPagoIntegration } from "@/components/MercadoPagoIntegration";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Key,
  Lock,
  Upload,
  Camera,
  CheckCircle,
  XCircle,
  Settings,
  Calendar,
  DollarSign,
  Save,
  Eye,
  EyeOff,
  Crown,
  FileText
} from "lucide-react";

export default function Perfil() {
  const { toast } = useToast();
  const { isAuthenticated: googleConnected, userEmail: googleEmail, signIn: googleSignIn, signOut: googleSignOut } = useGoogleIntegration();
  const { 
    profile, 
    loading, 
    updateProfile, 
    uploadAvatar, 
    getAvatarUrl 
  } = useProfessorProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    especialidades: '',
    pix_key: '',
    billing_text: '',
    avatar_url: ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setProfileData({
        nome: profile.nome || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        bio: profile.bio || '',
        especialidades: profile.especialidades || '',
        pix_key: profile.pix_key || '',
        billing_text: profile.billing_text || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const loadProfile = () => {
    // Reload profile data
    if (profile) {
      setProfileData({
        nome: profile.nome || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        bio: profile.bio || '',
        especialidades: profile.especialidades || '',
        pix_key: profile.pix_key || '',
        billing_text: profile.billing_text || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  };

  // Upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho do arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const avatarUrl = await uploadAvatar(file);
      toast({
        title: 'Avatar atualizado!',
        description: 'Sua foto de perfil foi alterada com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível atualizar sua foto.',
        variant: 'destructive'
      });
    }
  };

  // Salvar alterações no perfil
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Alterar senha
  const handlePasswordChange = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Nova senha e confirmação são obrigatórias.',
        variant: 'destructive'
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e confirmação devem ser iguais.',
        variant: 'destructive'
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Senha muito fraca',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });

      if (error) throw error;

      setShowPasswordForm(false);
      setPasswords({ current: '', new: '', confirm: '' });
      
      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e integrações
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Settings className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar_url || ''} />
                      <AvatarFallback className="text-2xl">
                        {profileData.nome?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{profileData.nome}</h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Professor
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={profileData.nome || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={profileData.email || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        className="pl-10"
                        placeholder="(11) 99999-9999"
                        value={profileData.telefone || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="especialidades">Especialidades</Label>
                    <Input
                      id="especialidades"
                      placeholder="Piano, Violão, Teoria Musical..."
                      value={profileData.especialidades || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, especialidades: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="bio"
                      className="pl-10 min-h-20"
                      placeholder="Conte um pouco sobre sua experiência, formação e método de ensino..."
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => loadProfile()}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="grid gap-6">
              <MercadoPagoIntegration />
              
              {/* Google Calendar Integration Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Google Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="font-medium mb-1">Configuração via Dashboard</p>
                    <p className="text-sm text-muted-foreground">
                      Configure a integração Google Calendar através do dashboard principal ou página de agenda.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}