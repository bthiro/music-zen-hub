import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');
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
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY não configurada');
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da Groq:', response.status, errorText);

      // 401 - Key ausente/ inválida
      if (response.status === 401) {
        return new Response(JSON.stringify({
          response: `⚠️ Autenticação Groq falhou (401)\n\nSua GROQ_API_KEY está ausente ou inválida. Para resolver:\n1) Gere/visualize sua chave em https://console.groq.com/keys\n2) Atualize o segredo \'GROQ_API_KEY\' nas Funções do Supabase\n3) Tente novamente\n\n🎵 Modo offline – Campo Harmônico Maior:\nI - ii - iii - IV - V - vi - vii°\nEm Dó Maior: C - Dm - Em - F - G - Am - Bº\nFunções: Tônica (I, iii, vi), Subdominante (ii, IV), Dominante (V, vii°).\nProgressões: I–V–vi–IV, ii–V–I, I–vi–IV–V.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 429 - Quota/limite
      if (response.status === 429) {
        return new Response(JSON.stringify({
          response: `⚠️ Limite de uso da Groq atingido (429). Aguarde um pouco e tente novamente.\n\n🎵 Modo offline – Campo Harmônico Maior:\nI - ii - iii - IV - V - vi - vii°\nEm Dó Maior: C - Dm - Em - F - G - Am - Bº\nFunções: Tônica (I, iii, vi), Subdominante (ii, IV), Dominante (V, vii°).\nProgressões: I–V–vi–IV, ii–V–I, I–vi–IV–V.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da Groq recebida');
    
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