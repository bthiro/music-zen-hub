import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const { message, instrument, musicStyle } = await req.json();
    console.log('Recebida mensagem:', { message, instrument, musicStyle });

    const systemPrompt = `Você é um assistente especializado em teoria musical e educação musical. Suas respostas devem ser:

1. PRECISAS e baseadas em teoria musical estabelecida
2. DIDÁTICAS e adaptadas ao nível do estudante
3. PRÁTICAS com exemplos musicais concretos
4. REFERENCIADAS quando apropriado (Bohumil Med, Osvaldo Lacerda, etc.)

Contexto do usuário:
- Instrumento: ${instrument || 'não especificado'}
- Estilo musical: ${musicStyle || 'não especificado'}

Temas que você domina:
- Escalas, modos e intervalos
- Harmonia funcional e análise harmônica
- Ritmo, métrica e subdivisões
- Formas musicais e análise estrutural
- Técnica instrumental e interpretação
- História da música e estilo
- Composição e arranjo

Responda sempre em português, seja claro e use exemplos práticos quando possível.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da OpenAI recebida');
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função ia-musical:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});