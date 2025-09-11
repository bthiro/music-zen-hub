import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  Lock, 
  Save,
  Crown,
  Shield,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

export default function PerfilAdmin() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useAdminProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local form state
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        telefone: profile.telefone || '',
        data_nascimento: profile.data_nascimento || '',
        endereco: profile.endereco || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O avatar deve ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Selecione apenas arquivos de imagem.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    await uploadAvatar(file);
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(formData);
    setIsEditing(false);
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Senha muito fraca',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.'
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar sua senha.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Perfil do Administrador</h2>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Perfil do Administrador</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-2xl">
                        {profile?.nome?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <h3 className="text-2xl font-bold">{profile?.nome || user?.email}</h3>
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Administrador
                        </Badge>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <Shield className="h-3 w-3 mr-1" />
                          Acesso Total
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">{profile?.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editable Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informações Pessoais</span>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                       <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data to original values
                          if (profile) {
                            setFormData({
                              nome: profile.nome || '',
                              telefone: profile.telefone || '',
                              data_nascimento: profile.data_nascimento || '',
                              endereco: profile.endereco || '',
                              bio: profile.bio || ''
                            });
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        disabled={saving}
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={isEditing ? formData.nome : (profile?.nome || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled // Admin email should not be editable via profile
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Para alterar o email, entre em contato com o suporte técnico.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={isEditing ? formData.telefone : (profile?.telefone || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={isEditing ? formData.data_nascimento : (profile?.data_nascimento || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={isEditing ? formData.endereco : (profile?.endereco || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Rua, número, bairro, cidade, estado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Biografia/Função
                    </Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? formData.bio : (profile?.bio || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Descreva sua função e responsabilidades..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite a nova senha (min. 8 caracteres)"
                    />
                    <Button
                      type="button"
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
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Nível de Acesso</p>
                    <p className="text-sm text-muted-foreground">Administrador com acesso total ao sistema</p>
                  </div>
                  <Badge variant="default" className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Máximo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Autenticação 2FA</p>
                    <p className="text-sm text-muted-foreground">Recursos de segurança adicionais</p>
                  </div>
                  <Badge variant="outline">
                    Em breve
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Login com Google</p>
                    <p className="text-sm text-muted-foreground">Método de autenticação alternativo</p>
                  </div>
                  <Badge variant="secondary">
                    Disponível
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}