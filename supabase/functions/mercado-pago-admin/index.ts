import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateInvoiceRequest {
  cobranca_id: string;
}

interface CheckInvoiceRequest {
  reference_id?: string;
  preference_id?: string;
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Get admin's Mercado Pago configuration
    const { data: adminProfile } = await supabaseAdmin
      .from('professores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminProfile) {
      return new Response(JSON.stringify({ error: 'Perfil de admin não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { data: mpConfig } = await supabaseAdmin
      .from('integration_configs')
      .select('config_data')
      .eq('professor_id', adminProfile.id)
      .eq('integration_name', 'mercadopago')
      .eq('status', 'connected')
      .maybeSingle();

    if (!mpConfig?.config_data?.access_token) {
      return new Response(JSON.stringify({ 
        error: 'Integração Mercado Pago não configurada para o admin' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const accessToken = mpConfig.config_data.access_token;

    if (action === 'create_invoice') {
      const { cobranca_id }: CreateInvoiceRequest = await req.json();
      
      // Get billing data
      const { data: cobranca } = await supabaseAdmin
        .from('cobrancas_professor')
        .select(`
          id, professor_id, valor, descricao, data_vencimento,
          professores:professor_id (nome, email)
        `)
        .eq('id', cobranca_id)
        .maybeSingle();

      if (!cobranca) {
        return new Response(JSON.stringify({ error: 'Cobrança não encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const professor = (cobranca as any).professores;
      const externalReference = `prof_invoice_${cobranca_id}`;

      // Create Mercado Pago preference
      const preferenceData = {
        items: [{
          title: cobranca.descricao || `Assinatura Professor - ${professor.nome}`,
          quantity: 1,
          unit_price: parseFloat(cobranca.valor.toString())
        }],
        payer: {
          name: professor.nome,
          email: professor.email
        },
        external_reference: externalReference,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(cobranca.data_vencimento + 'T23:59:59Z').toISOString()
      };

      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('[MercadoPagoAdmin] MP API Error:', errorText);
        return new Response(JSON.stringify({ 
          error: 'Erro na API do Mercado Pago',
          details: errorText
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const preference = await mpResponse.json();

      // Update billing record with payment link
      await supabaseAdmin
        .from('cobrancas_professor')
        .update({
          link_pagamento: preference.init_point,
          referencia_externa: externalReference,
          updated_at: new Date().toISOString()
        })
        .eq('id', cobranca_id);

      return new Response(JSON.stringify({
        success: true,
        payment_link: preference.init_point,
        preference_id: preference.id,
        external_reference: externalReference
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'check_invoice') {
      const { reference_id, preference_id }: CheckInvoiceRequest = await req.json();

      let searchUrl = 'https://api.mercadopago.com/v1/payments/search?';
      if (reference_id) {
        searchUrl += `external_reference=${reference_id}`;
      } else if (preference_id) {
        searchUrl += `preference_id=${preference_id}`;
      } else {
        return new Response(JSON.stringify({ 
          error: 'reference_id ou preference_id obrigatório' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const mpResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!mpResponse.ok) {
        return new Response(JSON.stringify({ 
          error: 'Erro ao consultar pagamento' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const searchResult = await mpResponse.json();

      return new Response(JSON.stringify({
        success: true,
        payments: searchResult.results || []
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('[MercadoPagoAdmin] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);