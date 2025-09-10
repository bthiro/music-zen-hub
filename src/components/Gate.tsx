import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface GateProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  allowedRoles?: Array<'admin' | 'professor'>;
  requireActiveStatus?: boolean;
  redirectTo?: string;
}

export function Gate({ 
  children, 
  requireAuth = true, 
  requiredRole,
  allowedRoles = [],
  requireActiveStatus = false,
  redirectTo = '/auth' 
}: GateProps) {
  const { user, loading, initialized } = useAuth();
  
  // Get auth mode from environment
  const authMode = import.meta.env.VITE_AUTH_MODE || 'locked';

  // If auth is open mode, allow everything
  if (authMode === 'open') {
    return <>{children}</>;
  }

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirement (single role)
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'professor') {
      return <Navigate to="/app" replace />;
    } else {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check role requirement (multiple allowed roles)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as any)) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'professor') {
      return <Navigate to="/app" replace />;
    } else {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check active status for professors (placeholder for now)
  if (requireActiveStatus && user?.role === 'professor') {
    // TODO: Implement professor status check from database
    // For now, we allow access but this should verify professor.status = 'ativo'
  }

  return <>{children}</>;
}