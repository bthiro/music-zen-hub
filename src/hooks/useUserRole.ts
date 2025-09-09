import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'teacher' | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching user role:', error);
          setUserRole('teacher'); // fallback to teacher for users without explicit role
        } else {
          setUserRole((data?.role as UserRole) ?? 'teacher');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        checkUserRole();
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userRole, loading, isAdmin: userRole === 'admin', isTeacher: userRole === 'teacher' };
}