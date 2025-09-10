export type UserRole = 'admin' | 'professor';

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  bio?: string;
  especialidades?: string;
  plano: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  limite_alunos: number;
  modules: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
}

export interface AuthState {
  user: AuthUser | null;
  session: any;
  loading: boolean;
  initialized: boolean;
}