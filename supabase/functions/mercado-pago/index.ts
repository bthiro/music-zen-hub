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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const requestData = await req.json();
    console.log("Dados recebidos:", requestData);
    
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não encontrado");
      throw new Error("Token do Mercado Pago não configurado");
    }

    console.log("Token encontrado, processando...");

    if (requestData.action === 'create_payment') {
      const { aluno_id, valor, tipo_pagamento, descricao, external_reference } = requestData as CreatePaymentRequest;

      // Buscar dados do professor e aluno (usando dados mockados por enquanto)
      const professor = { id: "prof1", nome: "Professor Teste", email: "prof@teste.com" };
      const aluno = { nome: "Aluno Teste", email: "aluno@teste.com" };

      // Criar preference no Mercado Pago
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
        notification_url: `${req.headers.get("origin")}/api/mercado-pago/webhook`,
        back_urls: {
          success: `${req.headers.get("origin")}/pagamentos?status=success`,
          failure: `${req.headers.get("origin")}/pagamentos?status=failure`,
          pending: `${req.headers.get("origin")}/pagamentos?status=pending`
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

      // Para sistemas mockados, não salvamos no banco por enquanto
      /*
      // Salvar pagamento no banco de dados
      const { data: pagamento, error: pagamentoError } = await supabaseClient
        .from('pagamentos')
        .insert({
          professor_id: professor.id,
          aluno_id: aluno_id,
          valor: valor,
          tipo_pagamento: tipo_pagamento,
          descricao: descricao,
          referencia_externa: mpData.id,
          link_pagamento: mpData.init_point,
          status: 'pendente',
          data_vencimento: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (pagamentoError) {
        console.error("Erro ao salvar pagamento:", pagamentoError);
        throw new Error("Erro ao salvar pagamento no banco de dados");
      }
      */

      return new Response(JSON.stringify({
        success: true,
        payment_link: mpData.init_point,
        preference_id: mpData.id,
        pagamento_id: `mock_${Date.now()}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (requestData.action === 'webhook') {
      // Webhook do Mercado Pago
      const { payment_id, status } = requestData as WebhookRequest;

      console.log("Webhook recebido:", { payment_id, status });

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!paymentResponse.ok) {
        throw new Error("Erro ao buscar pagamento no Mercado Pago");
      }

      const paymentData = await paymentResponse.json();
      console.log("Dados do pagamento recebido via webhook:", paymentData);

      // Por enquanto só logamos, quando integrar com banco real vamos salvar
      console.log("Pagamento atualizado:", {
        id: payment_id,
        status: paymentData.status,
        payment_method: paymentData.payment_method_id,
        transaction_amount: paymentData.transaction_amount
      });

      return new Response(JSON.stringify({ success: true }), {
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
          external_reference: payment.external_reference
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({
          success: true,
          payment_found: false,
          status: 'pending'
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