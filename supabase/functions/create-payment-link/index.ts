import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentLinkRequest {
  pagamento_id: string;
  gateway: 'mercadopago' | 'infinitepay';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pagamento_id, gateway }: CreatePaymentLinkRequest = await req.json();

    // Criar cliente Supabase com service role para buscar dados
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Buscar dados do pagamento
    const { data: pagamento, error: pagamentoError } = await supabaseService
      .from('pagamentos')
      .select(`
        *,
        aluno:alunos(nome, email, telefone),
        professor:professores(nome, email)
      `)
      .eq('id', pagamento_id)
      .single();

    if (pagamentoError || !pagamento) {
      throw new Error('Pagamento não encontrado');
    }

    let linkPagamento = '';
    let referenciaExterna = '';

    if (gateway === 'mercadopago') {
      // Integração com Mercado Pago
      const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      if (!mercadoPagoToken) {
        throw new Error('Token do Mercado Pago não configurado');
      }

      const preference = {
        items: [{
          title: `Aula de Música - ${pagamento.professor.nome}`,
          description: `Pagamento para ${pagamento.aluno.nome}`,
          unit_price: Number(pagamento.valor),
          quantity: 1,
        }],
        payer: {
          name: pagamento.aluno.nome,
          email: pagamento.aluno.email,
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        notification_url: `${req.headers.get("origin")}/api/webhook/mercadopago`,
        external_reference: pagamento_id,
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      const mpResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`Erro no Mercado Pago: ${mpResponse.message}`);
      }

      linkPagamento = mpResponse.init_point;
      referenciaExterna = mpResponse.id;

    } else if (gateway === 'infinitepay') {
      // Integração com InfinitePay
      const infinitePayToken = Deno.env.get("INFINITEPAY_API_KEY");
      if (!infinitePayToken) {
        throw new Error('Token do InfinitePay não configurado');
      }

      const cobranca = {
        amount: Math.round(Number(pagamento.valor) * 100), // Valor em centavos
        currency: 'BRL',
        customer: {
          name: pagamento.aluno.nome,
          email: pagamento.aluno.email,
          phone: pagamento.aluno.telefone,
        },
        description: `Aula de Música - ${pagamento.professor.nome}`,
        external_id: pagamento_id,
        payment_methods: ['pix', 'credit_card', 'bank_slip'],
      };

      const response = await fetch('https://api.infinitepay.io/v2/charges', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${infinitePayToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cobranca),
      });

      const ipResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`Erro no InfinitePay: ${ipResponse.message}`);
      }

      linkPagamento = ipResponse.checkout_url;
      referenciaExterna = ipResponse.id;
    }

    // Atualizar pagamento com link gerado
    const { error: updateError } = await supabaseService
      .from('pagamentos')
      .update({
        link_pagamento: linkPagamento,
        referencia_externa: referenciaExterna,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pagamento_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      link_pagamento: linkPagamento,
      referencia_externa: referenciaExterna,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Erro ao criar link de pagamento:", error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);