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
    console.log('🔧 Iniciando IA Musical');
    
    if (!groqApiKey) {
      console.log('❌ GROQ_API_KEY não configurada');
      return new Response(JSON.stringify({
        response: `❌ **GROQ_API_KEY não configurada**\n\n**Para resolver:**\n1. Acesse: https://console.groq.com/keys\n2. Gere uma nova API key\n3. Configure no Supabase\n\n🎵 **Modo Offline - Campo Harmônico Maior:**\nI - ii - iii - IV - V - vi - vii°\n\nEm **Dó Maior**: C - Dm - Em - F - G - Am - Bº\n\n**Funções:**\n- **Tônica** (I, iii, vi): estabilidade\n- **Subdominante** (ii, IV): preparação\n- **Dominante** (V, vii°): tensão → resolução`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, instrument, musicStyle } = await req.json();
    console.log('📝 Pergunta recebida:', message?.substring(0, 100));

    const systemPrompt = `Você é um assistente especializado em teoria musical e educação musical. Suas respostas devem ser:

1. **PRECISAS** e baseadas em teoria musical estabelecida
2. **DIDÁTICAS** e adaptadas ao nível do estudante  
3. **PRÁTICAS** com exemplos musicais concretos
4. **REFERENCIADAS** quando apropriado (Bohumil Med, Osvaldo Lacerda, etc.)

**Contexto do usuário:**
- Instrumento: ${instrument || 'não especificado'}
- Estilo musical: ${musicStyle || 'não especificado'}

**Temas que você domina:**
- Escalas, modos e intervalos
- Harmonia funcional e análise harmônica
- Ritmo, métrica e subdivisões
- Formas musicais e análise estrutural
- Técnica instrumental e interpretação
- História da música e estilo
- Composição e arranjo

**Responda sempre em português**, seja claro e use exemplos práticos quando possível. Use formatação markdown para melhor legibilidade.`;

    console.log('🚀 Chamando Groq API...');
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
      console.error('❌ Erro Groq:', response.status, errorText);
      
      // 401 - Chave inválida
      if (response.status === 401) {
        return new Response(JSON.stringify({
          response: `❌ **Erro de Autenticação Groq (401)**\n\nSua GROQ_API_KEY está inválida ou ausente.\n\n**Para resolver:**\n1. Acesse: https://console.groq.com/keys\n2. Gere uma nova chave (formato: gsk_...)\n3. Atualize o segredo no Supabase\n\n🎵 **Modo Offline - Campo Harmônico Maior:**\nI - ii - iii - IV - V - vi - vii°\n\nEm **Dó Maior**: C - Dm - Em - F - G - Am - Bº`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 429 - Limite atingido
      if (response.status === 429) {
        return new Response(JSON.stringify({
          response: `⏳ **Limite de uso da Groq atingido (429)**\n\nAguarde alguns minutos e tente novamente.\n\n🎵 **Modo Offline - Campo Harmônico Maior:**\nI - ii - iii - IV - V - vi - vii°\n\nEm **Dó Maior**: C - Dm - Em - F - G - Am - Bº\n\n**Progressões populares:** I-V-vi-IV / ii-V-I`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        response: `❌ **Erro da API Groq (${response.status})**\n\n${errorText}\n\n🎵 **Modo Offline disponível** - faça perguntas básicas sobre teoria musical!`
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
    console.error('💥 Erro na IA Musical:', error.message);
    
    return new Response(JSON.stringify({ 
      response: `💥 **Erro interno**: ${error.message}\n\n🎵 **Modo Offline disponível** - Pergunte sobre escalas, acordes, ritmo, etc.` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});