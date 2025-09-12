// @ts-ignore: Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno imports  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // @ts-ignore: Deno environment variables
    const supabase = createClient(
      // @ts-ignore: Deno environment variables
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno environment variables
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { cobranca_id } = await req.json();
    console.log('[Mercado Pago Admin] Processing cobranca:', cobranca_id);

    if (!cobranca_id) {
      throw new Error('cobranca_id é obrigatório');
    }

    // Buscar a cobrança com dados do professor
    const { data: cobranca, error: cobrancaError } = await supabase
      .from('cobrancas_professor')
      .select(`
        *,
        professores!inner(
          id,
          nome,
          email
        )
      `)
      .eq('id', cobranca_id)
      .single();

    if (cobrancaError || !cobranca) {
      console.error('[Mercado Pago Admin] Cobrança não encontrada:', cobrancaError);
      throw new Error('Cobrança não encontrada');
    }

    // Buscar configuração do Mercado Pago do professor
    const { data: config, error: configError } = await supabase
      .from('integration_configs')
      .select('config_data')
      .eq('professor_id', cobranca.professor_id)
      .eq('integration_name', 'mercado_pago')
      .eq('status', 'connected')
      .single();

    if (configError || !config?.config_data?.access_token) {
      console.error('[Mercado Pago Admin] Configuração MP não encontrada:', configError);
      throw new Error('Professor não possui Mercado Pago configurado');
    }

    const accessToken = config.config_data.access_token;

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: `${cobranca.descricao || 'Assinatura'} - ${cobranca.competencia}`,
          quantity: 1,
          unit_price: Number(cobranca.valor),
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: cobranca.professores.email,
        name: cobranca.professores.nome
      },
      back_urls: {
        // @ts-ignore: Deno environment variables
        success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
        // @ts-ignore: Deno environment variables
        failure: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
        // @ts-ignore: Deno environment variables
        pending: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`
      },
      auto_return: 'approved',
      external_reference: `cobranca_professor_${cobranca.id}`,
      // @ts-ignore: Deno environment variables
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
    };

    console.log('[Mercado Pago Admin] Criando preferência:', preferenceData);

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('[Mercado Pago Admin] Erro na API do MP:', errorText);
      throw new Error(`Erro do Mercado Pago: ${mpResponse.status}`);
    }

    const preferenceResult = await mpResponse.json();
    console.log('[Mercado Pago Admin] Preferência criada:', preferenceResult.id);

    // Atualizar cobrança com link de pagamento
    const { error: updateError } = await supabase
      .from('cobrancas_professor')
      .update({
        link_pagamento: preferenceResult.init_point,
        referencia_externa: preferenceResult.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', cobranca_id);

    if (updateError) {
      console.error('[Mercado Pago Admin] Erro ao atualizar cobrança:', updateError);
      throw new Error('Erro ao salvar link de pagamento');
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_link: preferenceResult.init_point,
        preference_id: preferenceResult.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[Mercado Pago Admin] Erro:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
})