import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[admin-reset-professor-password] Request received at:', new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { professor_id, email, redirect_url } = await req.json();
    
    console.log('[admin-reset-professor-password] Resetting password for professor:', { professor_id, email });
    
    // Validate input
    if (!professor_id || !email) {
      throw new Error('ID do professor e email são obrigatórios');
    }

    const redirectTo = redirect_url || `${supabaseUrl.replace('supabase.co', 'lovable.app')}/auth/reset-password`;
    
    let resetResult;

    // Try resetPasswordForEmail first (requires SMTP configured)
    try {
      console.log('[admin-reset-professor-password] Attempting resetPasswordForEmail');
      
      // Use the public client for resetPasswordForEmail as it's designed for this
      const supabasePublic = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
      
      const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.log('[admin-reset-professor-password] resetPasswordForEmail failed:', error.message);
        // If SMTP is not configured, fallback to generateLink
        if (error.message.includes('SMTP') || error.message.includes('email')) {
          throw new Error('SMTP_NOT_CONFIGURED');
        }
        throw error;
      }

      resetResult = {
        success: true,
        method: 'email',
        message: 'Link de redefinição de senha enviado por email'
      };
      
    } catch (error) {
      if (error.message === 'SMTP_NOT_CONFIGURED' || error.message.includes('SMTP')) {
        console.log('[admin-reset-professor-password] SMTP not configured, generating magic link');
        
        // Fallback: generate recovery link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo
          }
        });

        if (linkError) {
          console.error('[admin-reset-professor-password] generateLink error:', linkError);
          throw new Error(`Erro ao gerar link de recuperação: ${linkError.message}`);
        }

        resetResult = {
          success: true,
          method: 'link',
          message: 'Link de redefinição gerado (SMTP não configurado)',
          link: linkData.properties?.action_link,
          data: linkData
        };
      } else {
        throw error;
      }
    }

    // Log the action with actor_user_id from request context if available
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: null, // This will be set by RLS if admin is authenticated
      action: 'professor_password_reset_requested',
      entity: 'professores', 
      entity_id: professor_id,
      metadata: { 
        email, 
        method: resetResult.method,
        redirect_url: redirectTo,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify(resetResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[admin-reset-professor-password] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao enviar link de redefinição'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});