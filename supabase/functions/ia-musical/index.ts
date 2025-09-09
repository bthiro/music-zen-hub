import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Iniciando função ia-musical');
    console.log('🔑 GROQ_API_KEY presente:', !!groqApiKey);
    console.log('🔑 Chave começa com gsk_:', groqApiKey?.startsWith('gsk_'));
    
    if (!groqApiKey) {
      console.log('❌ GROQ_API_KEY não encontrada');
      return new Response(JSON.stringify({
        response: `❌ GROQ_API_KEY não configurada no Supabase. Configure sua chave em: console.groq.com/keys`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, instrument, musicStyle } = await req.json();
    console.log('📝 Mensagem recebida:', message?.substring(0, 50) + '...');

    // Teste simples primeiro
    console.log('🚀 Fazendo chamada para Groq...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: 'Responda apenas: Olá! Estou funcionando!' }
        ],
        max_tokens: 50,
        temperature: 0.1
      }),
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da Groq:', response.status, errorText);
      
      return new Response(JSON.stringify({
        response: `❌ Erro Groq ${response.status}: ${errorText}\n\n🔧 Verifique se sua chave GROQ_API_KEY está correta em console.groq.com/keys`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ Resposta recebida com sucesso');
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
    console.error('💥 Stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      response: `💥 Erro interno: ${error.message}` 
    }), {
      status: 200, // Mudando para 200 para ver a mensagem
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});