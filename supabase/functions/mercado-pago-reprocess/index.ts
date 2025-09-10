import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReprocessRequest {
  payment_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      return new Response(
        JSON.stringify({ error: 'MERCADO_PAGO_ACCESS_TOKEN not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { payment_id }: ReprocessRequest = await req.json();
    
    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'payment_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Reprocessing payment:', payment_id);

    // Fetch payment details from MercadoPago API
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Failed to fetch payment from MercadoPago:', mpResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch payment from MercadoPago', 
          status: mpResponse.status,
          details: errorText 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await mpResponse.json();
    console.log('Payment data from MP:', paymentData);

    // Map MercadoPago status to our system status
    let ourStatus = 'pendente';
    let dataPagamento = null;

    switch (paymentData.status) {
      case 'approved':
        ourStatus = 'pago';
        dataPagamento = paymentData.date_approved || new Date().toISOString().split('T')[0];
        break;
      case 'refunded':
        ourStatus = 'reembolsado';
        break;
      case 'cancelled':
        ourStatus = 'cancelado';
        break;
      case 'in_process':
      case 'pending':
        ourStatus = 'pendente';
        break;
      default:
        console.log('Unknown payment status:', paymentData.status);
    }

    // Update payment in our database
    const { data: updateResult, error: updateError } = await supabase
      .from('pagamentos')
      .update({
        status: ourStatus,
        data_pagamento: dataPagamento,
        mercado_pago_status: paymentData.status,
        forma_pagamento: 'mercado_pago',
        updated_at: new Date().toISOString()
      })
      .eq('mercado_pago_payment_id', payment_id)
      .select('*');

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Database update failed', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!updateResult || updateResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Payment not found in database', payment_id }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit event if payment was approved
    if (ourStatus === 'pago') {
      await supabase.rpc('log_audit', {
        p_action: 'pagamento_reprocessado_manual',
        p_entity: 'pagamentos',
        p_entity_id: updateResult[0].id,
        p_metadata: {
          mercado_pago_payment_id: payment_id,
          amount: paymentData.transaction_amount,
          payment_method: paymentData.payment_method_id,
          reprocessed_by: 'admin'
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id,
        old_status: updateResult[0].status,
        new_status: ourStatus,
        mercado_pago_status: paymentData.status,
        updated_payment: updateResult[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reprocessing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});