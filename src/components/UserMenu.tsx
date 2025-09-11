import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfessorProfile } from '@/hooks/useProfessorProfile';
import { 
  User, 
  LogOut, 
  Crown, 
  Shield,
  ChevronDown
} from 'lucide-react';

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  const { profile, getAvatarUrl } = useProfessorProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const avatarUrl = profile?.avatar_url ? getAvatarUrl(profile.avatar_url) : '';

  const profilePath = isAdmin ? '/admin/perfil' : '/app/perfil';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || ''} alt={userName} />
              <AvatarFallback className="text-sm">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden md:flex flex-col items-start text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userName}</span>
                <Badge 
                  variant={isAdmin ? "default" : "secondary"} 
                  className={`text-xs ${
                    isAdmin 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Professor
                    </>
                  )}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-32">
                {userEmail}
              </span>
            </div>
            
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex items-center justify-start gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || ''} alt={userName} />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link 
            to={profilePath}
            className="flex items-center w-full cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}