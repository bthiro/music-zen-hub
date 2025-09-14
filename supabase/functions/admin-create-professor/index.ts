import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[admin-create-professor] Request received at:', new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { nome, email, telefone, plano = 'basico', limite_alunos = 50, modules } = await req.json();
    
    console.log('[admin-create-professor] Creating professor:', { nome, email, plano });
    
    // Validate input
    if (!nome || !email) {
      throw new Error('Nome e email são obrigatórios');
    }
    
    // Step 1: Create auth user with admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        nome
      }
    });

    if (authError) {
      console.error('[admin-create-professor] Auth error:', authError);
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    console.log('[admin-create-professor] Auth user created:', authUser.user.id);

    // Step 2: Insert user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: authUser.user.id, role: 'professor' },
        { onConflict: 'user_id,role' }
      );

    if (roleError) {
      console.error('[admin-create-professor] Role error:', roleError);
      // Cleanup: delete auth user if role creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Erro ao definir role: ${roleError.message}`);
    }

    console.log('[admin-create-professor] Role upserted');

    // Step 3: Create or update professor profile idempotently
    const defaultModules = {
      dashboard: true,
      ia: plano === 'premium',
      ferramentas: true,
      agenda: true,
      pagamentos: true,
      materiais: true,
      lousa: true
    };

    const professorPayload = {
      user_id: authUser.user.id,
      nome,
      email,
      telefone: telefone || null,
      plano,
      limite_alunos,
      status: 'ativo',
      modules: modules || defaultModules
    };

    const { data: professor, error: professorError } = await supabaseAdmin
      .from('professores')
      .upsert(professorPayload, { onConflict: 'user_id' })
      .select()
      .single();


    if (professorError) {
      console.error('[admin-create-professor] Professor upsert error:', professorError);
      throw new Error(`Erro ao criar/atualizar perfil: ${professorError.message}`);
    }


    console.log('[admin-create-professor] Professor created:', professor.id);

    // Step 4: Log the action
    await supabaseAdmin.from('audit_log').insert({
      actor_user_id: null, // Will be set by the calling admin
      action: 'professor_created',
      entity: 'professores',
      entity_id: professor.id,
      metadata: { nome, email, plano }
    });

    return new Response(
      JSON.stringify({
        success: true,
        professor,
        auth_user_id: authUser.user.id,
        message: 'Professor criado com sucesso'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[admin-create-professor] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao criar professor'
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