import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  action: 'create_payment';
  aluno_id: string;
  valor: number;
  tipo_pagamento: 'mensal' | 'unico';
  descricao: string;
  external_reference?: string;
}

interface WebhookRequest {
  action: 'webhook';
  payment_id: string;
  status: string;
}

interface CheckPaymentRequest {
  action: 'check_payment';
  preference_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token de autorização necessário' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader);
    if (userError || !user) {
      console.error("Erro de autenticação:", userError);
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get professor ID and verify ownership
    const { data: professor, error: profError } = await supabaseClient
      .from('professores')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (profError || !professor) {
      console.error("Professor não encontrado:", profError);
      return new Response(JSON.stringify({ error: 'Professor não encontrado' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get professor's Mercado Pago config
    const { data: mpConfig, error: mpConfigError } = await supabaseClient
      .from('integration_configs')
      .select('config_data')
      .eq('professor_id', professor.id)
      .eq('integration_name', 'mercado_pago')
      .eq('status', 'connected')
      .single();

    if (mpConfigError || !mpConfig?.config_data?.access_token) {
      console.error("Mercado Pago não configurado:", mpConfigError);
      return new Response(JSON.stringify({ error: 'Mercado Pago não configurado para este professor' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const accessToken = mpConfig.config_data.access_token;
    const requestData = await req.json();
    console.log("Dados recebidos:", requestData);

    if (requestData.action === 'create_payment') {
      const { aluno_id, valor, tipo_pagamento, descricao, external_reference } = requestData as CreatePaymentRequest;

      // CRITICAL: Verify aluno belongs to this professor
      const { data: aluno, error: alunoError } = await supabaseClient
        .from('alunos')
        .select('nome, email, professor_id')
        .eq('id', aluno_id)
        .eq('professor_id', professor.id) // SECURITY: Owner validation
        .single();

      if (alunoError || !aluno) {
        console.error("Aluno não encontrado ou não pertence ao professor:", alunoError);
        return new Response(JSON.stringify({ error: 'Aluno não encontrado ou acesso negado' }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Create preference no Mercado Pago
      const preferenceData = {
        items: [
          {
            title: descricao || `Aula - ${aluno.nome}`,
            quantity: 1,
            unit_price: valor,
            currency_id: "BRL"
          }
        ],
        payer: {
          name: aluno.nome,
          email: aluno.email || "aluno@exemplo.com"
        },
        external_reference: external_reference || `${tipo_pagamento}_${Date.now()}`,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercado-pago-webhook`,
        back_urls: {
          success: `${req.headers.get("origin")}/app/pagamentos?status=success`,
          failure: `${req.headers.get("origin")}/app/pagamentos?status=failure`,
          pending: `${req.headers.get("origin")}/app/pagamentos?status=pending`
        },
        auto_return: "approved"
      };

      console.log("Criando preference no Mercado Pago:", preferenceData);

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferenceData)
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error("Erro do Mercado Pago:", errorText);
        throw new Error(`Erro ao criar pagamento: ${errorText}`);
      }

      const mpData = await mpResponse.json();
      console.log("Preference criada:", mpData);

      return new Response(JSON.stringify({
        success: true,
        payment_link: mpData.init_point,
        preference_id: mpData.id,
        professor_id: professor.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (requestData.action === 'check_payment') {
      // Verificar status de um pagamento específico
      const { preference_id } = requestData;
      
      console.log("Verificando pagamento:", preference_id);

      // Buscar pagamentos por external_reference
      const searchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${preference_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!searchResponse.ok) {
        throw new Error("Erro ao verificar pagamento");
      }

      const searchData = await searchResponse.json();
      console.log("Resultado da busca:", searchData);

      if (searchData.results && searchData.results.length > 0) {
        const payment = searchData.results[0];
        return new Response(JSON.stringify({
          success: true,
          payment_found: true,
          status: payment.status,
          payment_method: payment.payment_method_id,
          amount: payment.transaction_amount,
          date_approved: payment.date_approved,
          external_reference: payment.external_reference,
          professor_id: professor.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          payment_found: false,
          status: 'pending',
          professor_id: professor.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

    } else {
      throw new Error("Ação não suportada");
    }

  } catch (error) {
    console.error("Erro na função Mercado Pago:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});