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

      console.log('Student payment update result:', updateResult);

      // Also try to update professor billing if external_reference matches pattern
      const external_reference = paymentData.external_reference;
      if (external_reference?.startsWith('prof_invoice_')) {
        const cobrancaId = external_reference.replace('prof_invoice_', '');
        
        try {
          const { data: profUpdateResult, error: profUpdateError } = await supabase
            .from('cobrancas_professor')
            .update({
              mercado_pago_payment_id: paymentId,
              mercado_pago_status: paymentData.status,
              status: ourStatus,
              data_pagamento: dataPagamento,
              forma_pagamento: 'mercado_pago',
              updated_at: new Date().toISOString()
            })
            .eq('id', cobrancaId)
            .select('*');
            
          if (profUpdateError) {
            console.error(`[Webhook] Error updating professor billing:`, profUpdateError);
          } else {
            console.log(`[Webhook] Updated professor billing:`, profUpdateResult);
            
            // NOVO: Processar upgrade automático se pagamento aprovado
            if (ourStatus === 'pago' && profUpdateResult && profUpdateResult.length > 0) {
              await handleTeacherUpgrade(supabase, profUpdateResult[0], paymentId);
            }
          }
        } catch (error) {
          console.error(`[Webhook] Error updating professor billing:`, error);
        }
      }

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

// NOVA FUNÇÃO: Processar upgrade automático de professor
async function handleTeacherUpgrade(supabase: any, billing: any, paymentId: string) {
  try {
    console.log(`[Upgrade] Processando upgrade automático para cobrança:`, billing.id);
    
    // Buscar dados do professor
    const { data: professor, error: profError } = await supabase
      .from('professores')
      .select('id, nome, email, plano, manual_plan_override')
      .eq('id', billing.professor_id)
      .single();

    if (profError) {
      console.error(`[Upgrade] Erro ao buscar professor:`, profError);
      return;
    }

    // Se professor tem override manual, não fazer upgrade automático
    if (professor.manual_plan_override) {
      console.log(`[Upgrade] Professor ${professor.nome} tem override manual. Upgrade automático pulado.`);
      return;
    }

    // Buscar dados do novo plano
    const { data: planData, error: planError } = await supabase
      .from('planos_professor')
      .select('*')
      .eq('nome', billing.plano_nome)
      .eq('ativo', true)
      .single();

    if (planError) {
      console.error(`[Upgrade] Erro ao buscar plano ${billing.plano_nome}:`, planError);
      return;
    }

    // Contar alunos ativos do professor
    const { count: studentCount, error: countError } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('professor_id', professor.id)
      .eq('ativo', true);

    if (countError) {
      console.error(`[Upgrade] Erro ao contar alunos:`, countError);
      return;
    }

    const currentStudentCount = studentCount || 0;

    // Se o novo plano tem limite menor, suspender alunos excedentes
    if (currentStudentCount > planData.limite_alunos) {
      console.log(`[Upgrade] Suspendendo ${currentStudentCount - planData.limite_alunos} alunos excedentes`);
      await suspendExcessStudents(supabase, professor.id, planData.limite_alunos);
    }

    // Atualizar plano do professor
    const { error: updateError } = await supabase
      .from('professores')
      .update({
        plano: billing.plano_nome,
        limite_alunos: planData.limite_alunos,
        plan_changed_at: new Date().toISOString(),
        manual_plan_override: false,
        grace_period_until: null // Limpar período de carência
      })
      .eq('id', professor.id);

    if (updateError) {
      console.error(`[Upgrade] Erro ao atualizar professor:`, updateError);
      return;
    }

    // Log de auditoria
    await supabase.rpc('log_audit', {
      p_action: 'upgrade_automatico_pagamento',
      p_entity: 'professores',
      p_entity_id: professor.id,
      p_metadata: {
        old_plan: professor.plano,
        new_plan: billing.plano_nome,
        payment_id: paymentId,
        billing_id: billing.id,
        amount: billing.valor,
        student_count: currentStudentCount,
        plan_limit: planData.limite_alunos
      }
    });

    console.log(`[Upgrade] Upgrade automático concluído: ${professor.nome} → ${billing.plano_nome}`);
    
  } catch (error) {
    console.error(`[Upgrade] Erro no upgrade automático:`, error);
  }
}

// NOVA FUNÇÃO: Suspender alunos excedentes
async function suspendExcessStudents(supabase: any, professorId: string, newLimit: number) {
  try {
    // Buscar alunos ativos ordenados por data de criação (mais antigos primeiro)
    const { data: students, error } = await supabase
      .from('alunos')
      .select('id, nome')
      .eq('professor_id', professorId)
      .eq('ativo', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (students && students.length > newLimit) {
      const studentsToSuspend = students.slice(newLimit);
      const studentIds = studentsToSuspend.map((s: any) => s.id);

      const { error: suspendError } = await supabase
        .from('alunos')
        .update({
          ativo: false,
          suspended_reason: 'plan_downgrade',
          suspended_at: new Date().toISOString()
        })
        .in('id', studentIds);

      if (suspendError) throw suspendError;

      console.log(`[Upgrade] Suspensos ${studentsToSuspend.length} alunos devido ao downgrade de plano`);
    }
  } catch (error) {
    console.error(`[Upgrade] Erro ao suspender alunos excedentes:`, error);
    throw error;
  }
}