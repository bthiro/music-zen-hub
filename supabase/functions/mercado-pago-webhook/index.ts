import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

interface WebhookPayload {
  action?: string;
  api_version?: string;
  data: {
    id: string;
  };
  date_created?: string;
  id: number;
  live_mode?: boolean;
  type: string;
  user_id?: string;
}

interface PaymentResponse {
  id: string;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  date_approved?: string;
  date_created?: string;
  external_reference?: string;
  description?: string;
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
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    // Validate webhook signature (basic implementation)
    const signature = req.headers.get('x-signature');
    const body = await req.text();
    
    console.log('Webhook received:', { signature, bodyLength: body.length });
    
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
    }

    console.log('Parsed payload:', payload);

    // Check for idempotency - prevent duplicate processing
    const eventId = `${payload.type}_${payload.id}_${payload.data?.id}`;
    
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('id_evento', eventId)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', eventId);
      return new Response('Event already processed', { status: 200, headers: corsHeaders });
    }

    // Record webhook event for idempotency
    await supabase.from('webhook_events').insert({
      id_evento: eventId,
      tipo: payload.type,
      payload: payload,
      received_at: new Date().toISOString()
    });

    // Only process payment events
    if (payload.type === 'payment' && payload.data?.id) {
      const paymentId = payload.data.id;
      console.log('Processing payment event for ID:', paymentId);

      // Fetch payment details from MercadoPago API
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!mpResponse.ok) {
        console.error('Failed to fetch payment from MercadoPago:', mpResponse.status);
        return new Response('Failed to fetch payment details', { status: 200, headers: corsHeaders });
      }

      const paymentData: PaymentResponse = await mpResponse.json();
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

      console.log('Mapped status:', { original: paymentData.status, mapped: ourStatus });

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
        .eq('mercado_pago_payment_id', paymentId)
        .select('*');

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return new Response('Database update failed', { status: 200, headers: corsHeaders });
      }

      if (!updateResult || updateResult.length === 0) {
        console.log('No payment found with mercado_pago_payment_id:', paymentId);
        return new Response('Payment not found in database', { status: 200, headers: corsHeaders });
      }

      console.log('Payment updated successfully:', updateResult[0]);

      // Log audit event if payment was approved
      if (ourStatus === 'pago') {
        await supabase.rpc('log_audit', {
          p_action: 'pagamento_aprovado_webhook',
          p_entity: 'pagamentos',
          p_entity_id: updateResult[0].id,
          p_metadata: {
            mercado_pago_payment_id: paymentId,
            amount: paymentData.transaction_amount,
            payment_method: paymentData.payment_method_id,
            webhook_event_id: eventId
          }
        });
      }
    }

    return new Response('Webhook processed successfully', { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { 
      status: 200, // Return 200 to prevent MercadoPago retries
      headers: corsHeaders 
    });
  }
});