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
import { useToast } from "@/hooks/use-toast";
import { useProfessorProfile } from "@/hooks/useProfessorProfile";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { supabase } from "@/integrations/supabase/client";
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
  EyeOff
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
  const [isSaving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    especialidades: '',
    pix_key: '',
    billing_text: ''
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
      setFormData({
        nome: profile.nome || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        bio: profile.bio || '',
        especialidades: profile.especialidades || '',
        pix_key: profile.pix_key || '',
        billing_text: profile.billing_text || ''
      });
    }
  }, [profile]);

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
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">Meu Perfil</h2>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  // Resetar formulário
                  if (profile) {
                    setFormData({
                      nome: profile.nome || '',
                      email: profile.email || '',
                      telefone: profile.telefone || '',
                      bio: profile.bio || '',
                      especialidades: profile.especialidades || '',
                      pix_key: profile.pix_key || '',
                      billing_text: profile.billing_text || ''
                    });
                  }
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="especialidades">Especialidades</Label>
                    <Input
                      id="especialidades"
                      value={formData.especialidades}
                      onChange={(e) => setFormData(prev => ({ ...prev, especialidades: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Piano, Violão, Canto..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Conte um pouco sobre sua experiência e método de ensino..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configurações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    value={formData.pix_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="sua-chave@email.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave PIX para recebimento de pagamentos
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing_text">Mensagem de Cobrança Personalizada</Label>
                  <Textarea
                    id="billing_text"
                    rows={6}
                    value={formData.billing_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_text: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Use {ALUNO}, {PERIODO}, {VALOR}, {VENCIMENTO}, {PIX} para personalização"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis disponíveis: {`{ALUNO}, {PERIODO}, {VALOR}, {VENCIMENTO}, {PIX}, {LINK_PAGAMENTO}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar e Info Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={getAvatarUrl(profile?.avatar_url)} 
                        alt={profile?.nome || 'Professor'} 
                      />
                      <AvatarFallback className="text-lg">
                        {profile?.nome?.split(' ').map(n => n[0]).join('') || 'PR'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                        <Camera className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold">{profile?.nome || 'Professor'}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    {profile?.especialidades && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {profile.especialidades}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showPasswordForm ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Alterar Senha
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                          placeholder="Digite sua nova senha"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          placeholder="Confirme sua nova senha"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setShowPasswordForm(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                      }}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handlePasswordChange}>
                        Alterar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integrações */}
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Google Calendar</p>
                      <p className="text-xs text-muted-foreground">
                        {googleConnected ? googleEmail : 'Não conectado'}
                      </p>
                    </div>
                  </div>
                  
                  {googleConnected ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={googleSignOut}>
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        <XCircle className="h-3 w-3 mr-1" />
                        Desconectado
                      </Badge>
                      <Button variant="outline" size="sm" onClick={googleSignIn}>
                        Conectar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Mercado Pago</p>
                      <p className="text-xs text-muted-foreground">
                        Pagamentos automáticos
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}