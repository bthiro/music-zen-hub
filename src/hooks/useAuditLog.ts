import { supabase } from '@/integrations/supabase/client';

export function useAuditLog() {
  const logAction = async (
    action: string,
    entity: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await supabase.rpc('log_audit', {
        p_action: action,
        p_entity: entity,
        p_entity_id: entityId || null,
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  return { logAction };
}