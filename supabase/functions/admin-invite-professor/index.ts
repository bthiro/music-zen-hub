import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[admin-invite-professor] Request received at:', new Date().toISOString());
  
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
    
    console.log('[admin-invite-professor] Inviting professor:', { professor_id, email });
    
    // Validate input
    if (!professor_id || !email) {
      throw new Error('ID do professor e email são obrigatórios');
    }

    const redirectTo = redirect_url || `${supabaseUrl.replace('supabase.co', 'lovable.app')}/auth/reset-password`;
    
    let inviteResult;
    let linkGenerated = false;

    // Try inviteUserByEmail first (requires SMTP configured)
    try {
      console.log('[admin-invite-professor] Attempting inviteUserByEmail');
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo
      });

      if (error) {
        console.log('[admin-invite-professor] inviteUserByEmail failed:', error.message);
        // If SMTP is not configured, fallback to generateLink
        if (error.message.includes('SMTP') || error.message.includes('email')) {
          throw new Error('SMTP_NOT_CONFIGURED');
        }
        throw error;
      }

      inviteResult = {
        success: true,
        method: 'email',
        message: 'Convite enviado por email',
        data
      };
      
    } catch (error) {
      if (error.message === 'SMTP_NOT_CONFIGURED' || error.message.includes('SMTP')) {
        console.log('[admin-invite-professor] SMTP not configured, generating magic link');
        
        // Fallback: generate magic link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email,
          options: {
            redirectTo
          }
        });

        if (linkError) {
          console.error('[admin-invite-professor] generateLink error:', linkError);
          throw new Error(`Erro ao gerar link: ${linkError.message}`);
        }

        linkGenerated = true;
        inviteResult = {
          success: true,
          method: 'link',
          message: 'Link de acesso gerado (SMTP não configurado)',
          link: linkData.properties?.action_link,
          data: linkData
        };
      } else {
        throw error;
      }
    }

    // Log the action
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: null, // Will be set by the calling admin
      action: 'professor_invited',
      entity: 'professores',
      entity_id: professor_id,
      metadata: { 
        email, 
        method: inviteResult.method,
        link_generated: linkGenerated,
        redirect_url: redirectTo
      }
    });

    return new Response(
      JSON.stringify(inviteResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[admin-invite-professor] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao enviar convite'
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