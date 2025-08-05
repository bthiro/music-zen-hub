import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendWhatsAppRequest {
  aluno_id: string;
  tipo_mensagem: 'lembrete_aula' | 'confirmacao_agendamento' | 'agradecimento' | 'lembrete_pagamento';
  dados_extra?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aluno_id, tipo_mensagem, dados_extra }: SendWhatsAppRequest = await req.json();

    // Verificar token de autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização necessário");
    }

    // Criar cliente Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Buscar dados do aluno e professor
    const { data: aluno, error: alunoError } = await supabaseService
      .from('alunos')
      .select(`
        *,
        professor:professores(nome, telefone)
      `)
      .eq('id', aluno_id)
      .single();

    if (alunoError || !aluno) {
      throw new Error('Aluno não encontrado');
    }

    if (!aluno.telefone) {
      throw new Error('Aluno não possui telefone cadastrado');
    }

    // Gerar mensagem baseada no tipo
    let mensagem = '';
    switch (tipo_mensagem) {
      case 'lembrete_aula':
        mensagem = `Olá ${aluno.nome}! 👋\n\nLembrete da sua aula de música com ${aluno.professor.nome}.\n\n📅 Data: ${dados_extra?.data}\n⏰ Horário: ${dados_extra?.horario}\n\nNos vemos em breve! 🎵`;
        break;
      
      case 'confirmacao_agendamento':
        mensagem = `Olá ${aluno.nome}! ✅\n\nSua aula foi agendada com sucesso!\n\n📅 Data: ${dados_extra?.data}\n⏰ Horário: ${dados_extra?.horario}\n👨‍🏫 Professor: ${aluno.professor.nome}\n\nEstamos ansiosos para vê-lo! 🎵`;
        break;
      
      case 'agradecimento':
        mensagem = `Olá ${aluno.nome}! 🎉\n\nObrigado pela aula de hoje! Foi ótimo trabalhar com você.\n\n${dados_extra?.feedback ? `📝 Feedback: ${dados_extra.feedback}\n\n` : ''}Continue praticando e até a próxima! 🎵\n\n- ${aluno.professor.nome}`;
        break;
      
      case 'lembrete_pagamento':
        mensagem = `Olá ${aluno.nome}! 💰\n\nLembrando que você tem um pagamento pendente:\n\n💸 Valor: R$ ${dados_extra?.valor}\n📅 Vencimento: ${dados_extra?.vencimento}\n\n${dados_extra?.link_pagamento ? `🔗 Link para pagamento: ${dados_extra.link_pagamento}\n\n` : ''}Qualquer dúvida, estou à disposição!\n\n- ${aluno.professor.nome}`;
        break;
      
      default:
        throw new Error('Tipo de mensagem inválido');
    }

    // Enviar via WhatsApp API (Z-API exemplo)
    const whatsappToken = Deno.env.get("ZAPI_TOKEN");
    const whatsappInstance = Deno.env.get("ZAPI_INSTANCE");
    
    if (!whatsappToken || !whatsappInstance) {
      throw new Error('Credenciais do WhatsApp não configuradas');
    }

    const phoneNumber = aluno.telefone.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    const whatsappPayload = {
      phone: `55${phoneNumber}`, // Código do Brasil + número
      message: mensagem,
    };

    const whatsappResponse = await fetch(`https://api.z-api.io/instances/${whatsappInstance}/token/${whatsappToken}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload),
    });

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      throw new Error(`Erro ao enviar WhatsApp: ${whatsappResult.message}`);
    }

    // Registrar mensagem enviada no banco
    const { error: mensagemError } = await supabaseService
      .from('mensagens_enviadas')
      .insert({
        aluno_id: aluno_id,
        professor_id: aluno.professor_id,
        tipo_mensagem: tipo_mensagem,
        conteudo: mensagem,
        status: 'enviada',
        referencia_externa: whatsappResult.messageId,
      });

    if (mensagemError) {
      console.error('Erro ao registrar mensagem:', mensagemError);
    }

    return new Response(JSON.stringify({
      success: true,
      message_id: whatsappResult.messageId,
      mensagem: mensagem,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Erro ao enviar WhatsApp:", error);
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