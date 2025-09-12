import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

type MetricEvent = 'signup' | 'first_login' | 'first_student' | 'limit_reached' | 'upgrade_click';

export function useConversionMetrics() {
  const { user } = useAuthContext();

  const trackEvent = async (eventType: MetricEvent, eventData: Record<string, any> = {}) => {
    if (!user?.profile?.id) return;

    try {
      await supabase
        .from('conversion_metrics')
        .insert({
          professor_id: user.profile.id,
          event_type: eventType,
          event_data: eventData
        });
    } catch (error) {
      console.error('Error tracking conversion metric:', error);
    }
  };

  return { trackEvent };
}