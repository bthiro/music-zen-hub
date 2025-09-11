import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetPasswordRequest {
  professor_id: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user info from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Autorização necessária' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify admin user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas admins' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { professor_id, password }: SetPasswordRequest = await req.json();

    if (!professor_id || !password) {
      return new Response(JSON.stringify({ error: 'professor_id e password são obrigatórios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get professor's user_id
    const { data: professor } = await supabaseAdmin
      .from('professores')
      .select('user_id, nome, email')
      .eq('id', professor_id)
      .maybeSingle();

    if (!professor) {
      return new Response(JSON.stringify({ error: 'Professor não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Update password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      professor.user_id,
      { password }
    );

    if (updateError) {
      console.error('[SetPassword] Error updating password:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Erro ao definir senha: ' + updateError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Mark as temporary password for professor to change later
    await supabaseAdmin
      .from('professores')
      .update({ 
        senha_temporaria: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', professor_id);

    // Log audit action
    await supabaseAdmin.rpc('log_audit', {
      p_action: 'password_set_by_admin',
      p_entity: 'professores',
      p_entity_id: professor_id,
      p_metadata: {
        admin_user_id: user.id,
        professor_email: professor.email,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Senha definida com sucesso',
      temporary: true
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('[SetPassword] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);