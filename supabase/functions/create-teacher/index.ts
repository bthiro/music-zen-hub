import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Acesso negado. Apenas administradores podem criar professores.");
    }

    const { nome, email, senha, plano, limite_alunos, data_expiracao } = await req.json();

    console.log('Creating teacher:', { nome, email, plano });

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    console.log('Auth user created:', authData.user?.id);

    // Create professor record
    const { error: professorError } = await supabaseAdmin
      .from('professores')
      .insert({
        user_id: authData.user.id,
        nome,
        email,
        plano,
        limite_alunos,
        data_expiracao: data_expiracao || null,
        criado_por: user.id,
        senha_temporaria: true,
        status: 'ativo'
      });

    if (professorError) {
      console.error('Professor error:', professorError);
      // Cleanup auth user if professor creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao criar professor: ${professorError.message}`);
    }

    // Add teacher role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'teacher'
      });

    if (roleInsertError) {
      console.error('Role error:', roleInsertError);
      // Cleanup on error
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('professores').delete().eq('user_id', authData.user.id);
      throw new Error(`Erro ao atribuir role: ${roleInsertError.message}`);
    }

    console.log('Teacher created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Professor criado com sucesso',
        professor_id: authData.user.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-teacher function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});