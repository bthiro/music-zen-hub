import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Send, 
  Copy, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Music, 
  Settings,
  Sparkles,
  MessageCircle,
  Clock,
  Save,
  User,
  Bot,
  BookOpen,
  Target,
  TrendingUp
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  nivel?: 'iniciante' | 'elementar' | 'intermediario' | 'avancado';
}

export default function IaMusical() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🎵 **BEM-VINDO À IA MUSICAL LOVART** 🎵

📝 **RESUMO RÁPIDO**
Sou sua assistente especializada em educação musical, integrada à plataforma Lovart. Ofereço suporte pedagógico completo em teoria musical, prática instrumental e metodologia de ensino.

🎯 **MINHAS COMPETÊNCIAS PRINCIPAIS**
• **Teoria Musical Adaptativa:** Do iniciante ao avançado
• **Especialização Instrumental:** Técnicas específicas para cada instrumento  
• **Metodologias Reconhecidas:** Kodály, Suzuki, Orff-Schulwerk
• **Análise Musical:** Harmonia funcional, análise formal, contraponto
• **Pedagogia Musical:** Sequências didáticas e progressão estruturada

🎹 **CONFIGURE SUA EXPERIÊNCIA**
Para personalizar minhas respostas, informe:
• **Seu instrumento principal**
• **Seu nível musical atual**
• **Estilo musical preferido**

💡 **COMO COMEÇAR**
Digite perguntas como:
• "Explique escalas para iniciante no piano"
• "Como funciona harmonia funcional?"
• "Exercícios de ritmo para violão"
• "Análise da harmonia em bossa nova"

**🎼 Vamos começar sua jornada musical! Em que posso ajudá-lo hoje?**`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [instrument, setInstrument] = useState('');
  const [nivel, setNivel] = useState<'iniciante' | 'elementar' | 'intermediario' | 'avancado'>('elementar');
  const [musicStyle, setMusicStyle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Diagnóstico automático do nível baseado na pergunta
  const diagnosticarNivel = (message: string): 'iniciante' | 'elementar' | 'intermediario' | 'avancado' => {
    const lowerMessage = message.toLowerCase();
    
    // Palavras que indicam nível iniciante
    if (lowerMessage.includes('não entendo') || 
        lowerMessage.includes('sou iniciante') || 
        lowerMessage.includes('primeira vez') ||
        lowerMessage.includes('o que é') ||
        lowerMessage.includes('como começar')) {
      return 'iniciante';
    }
    
    // Palavras que indicam nível avançado
    if (lowerMessage.includes('modulação') || 
        lowerMessage.includes('análise schenkeriana') || 
        lowerMessage.includes('contraponto') ||
        lowerMessage.includes('rearmonização') ||
        lowerMessage.includes('dominante estendida') ||
        lowerMessage.includes('análise funcional')) {
      return 'avancado';
    }
    
    // Palavras que indicam nível intermediário
    if (lowerMessage.includes('harmonia funcional') || 
        lowerMessage.includes('progressões') || 
        lowerMessage.includes('voicings') ||
        lowerMessage.includes('campo harmônico') ||
        lowerMessage.includes('dominante secundária')) {
      return 'intermediario';
    }
    
    return nivel; // Retorna o nível configurado pelo usuário
  };

  const simulateAIResponse = async (message: string): Promise<string> => {
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lowerMessage = message.toLowerCase();
    const nivelDetectado = diagnosticarNivel(message);
    const instrumentoUser = instrument || 'piano';
    const estiloUser = musicStyle || 'música popular';
    
    // ============= ESCALAS =============
    if (lowerMessage.includes('escala') || lowerMessage.includes('escalas')) {
      if (nivelDetectado === 'iniciante') {
        return `🎵 **ESCALAS MUSICAIS - INICIANTE**

📝 **RESUMO RÁPIDO**
Uma escala é como uma "escada musical" - uma sequência ordenada de notas que sobem ou descem.

🎯 **EXPLICAÇÃO DETALHADA**
**O que é uma escala?**
• Imagine que cada nota musical é um degrau de uma escada
• Uma escala é subir ou descer essa escada musical seguindo uma ordem específica
• **Exemplo familiar:** "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó" 🎶

**A Escala Mais Importante - Dó Maior:**
• É a escala "alegre" da música
• Tem 7 notas diferentes que se repetem
• **Sons:** Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó
• **Característica:** Soa completa e luminosa ✨

🎹 **EXEMPLO NO ${instrumentoUser.toUpperCase()}**
${instrumentoUser.toLowerCase() === 'piano' ? 
`**No Piano - Escala de Dó Maior:**
• Use apenas as teclas brancas
• **Posição:** Polegar no Dó, suba uma tecla por vez
• **Digitação:** 1-2-3-1-2-3-4-5 (polegar=1, indicador=2...)
• **Dica:** O polegar "passa por baixo" do 3º dedo` :
instrumentoUser.toLowerCase() === 'violão' ?
`**No Violão - Escala de Dó Maior:**
• **3ª casa, 5ª corda:** Dó (dedo 3)
• **5ª casa, 5ª corda:** Ré (dedo 1)  
• **2ª casa, 4ª corda:** Mi (dedo 1)
• Continue subindo casa por casa
• **Dica:** Use dedos alternados (i-m-i-m)` :
`**No ${instrumentoUser}:**
• Pratique a escala de Dó maior lentamente
• Foque na afinação e clareza de cada nota
• Suba e desça sempre no mesmo tempo`}

💡 **EXERCÍCIO APLICADO**
☑ **Passo 1:** Cante "Dó-Ré-Mi-Fá-Sol-Lá-Si-Dó" subindo devagar
☑ **Passo 2:** Cante descendo "Dó-Si-Lá-Sol-Fá-Mi-Ré-Dó"  
☑ **Passo 3:** Toque no seu instrumento, uma nota por vez
☑ **Passo 4:** Observe como soa "alegre" e "completo"

📈 **PRÓXIMOS PASSOS**
• Aprenda a escala de Sol maior (1 sustenido)
• Descubra a escala menor (som mais "triste")
• **Tempo de prática:** 10-15 minutos por dia
• **Meta:** Tocar de memória em 2 semanas`;
      }
      
      return `🎵 **ESCALAS MUSICAIS - TEORIA COMPLETA**

📝 **RESUMO RÁPIDO**
Escalas são sucessões ordenadas de sons que estabelecem centros tonais e fornecem material melódico-harmônico para a composição musical.

🎯 **FUNDAMENTOS TEÓRICOS**
**Escala Diatônica Maior:**
• **Fórmula Intervalar:** T-T-st-T-T-T-st *(Tom-Tom-semitom-Tom-Tom-Tom-semitom)*
• **Graus Funcionais:** 
  - I (Tônica) - II (Supertônica) - III (Mediante) 
  - IV (Subdominante) - V (Dominante) - VI (Superdominante) - VII (Sensível)
• **Características:** Estabelece hierarquia tonal, caráter resolutivo

**Sistema Menor Natural (Eólico):**
• **Origem:** VI grau da escala maior relativa
• **Característica:** Terça menor (3 semitons) define o caráter melancólico
• **Exemplo:** Lá menor = A-B-C-D-E-F-G (relativa de Dó maior)

**Escalas Menores Artificiais:**
• **Harmônica:** VII grau elevado → cria função dominante em tonalidade menor
• **Melódica:** VI e VII elevados (ascendente) / natural (descendente)
• **Uso:** Resolução harmônica em contexto menor

🎹 **APLICAÇÃO NO ${instrumentoUser.toUpperCase()}**
${instrumentoUser.toLowerCase() === 'piano' ?
`**Técnica de Escalas no Piano:**
• **Digitação padrão Dó Maior:** MD: 1-2-3-1-2-3-4-5 / ME: 5-4-3-2-1-3-2-1
• **Movimento do polegar:** Passa sob o 3º dedo (nunca sob 4º ou 5º)
• **Articulação:** Legato perfeito, sem interrupção do som
• **Dinâmica:** Crescendo ascendente, diminuendo descendente

**Escalas com Sustenidos:**
• **Sol Maior:** Fá# - digitação especial no polegar
• **Ré Maior:** Fá# Dó# - adaptação na passagem do polegar
• **Método:** Hanon - exercícios 39-43 (escalas maiores)` :

instrumentoUser.toLowerCase() === 'violão' ?
`**Padrões de Escalas no Violão (CAGED System):**
• **Padrão C:** Escala começando na forma de acorde C
• **Padrão A:** Escala começando na forma de acorde A  
• **Digitação:** Alternate picking (i-m-i-m) ou rest stroke para acentos
• **Extensão:** 3 notas por corda para cobrir 2 oitavas

**Escalas Modais Aplicadas:**
• **Dórico:** Escala menor com 6ª maior (muito usado em rock/jazz)
• **Mixolídio:** Escala maior com 7ª menor (blues, música brasileira)
• **Posições:** 5 posições conectadas cobrindo todo o braço` :

`**Aplicação Instrumental Específica:**
• **Respiração:** Planeje pontos de respiração em escalas longas
• **Articulação:** Varie entre legato (expressivo) e staccato (técnico)
• **Velocidade:** Comece sempre lento (60 BPM), aumente gradualmente
• **Precisão:** Afinação perfeita mais importante que velocidade`}

💡 **EXERCÍCIO AVANÇADO**
☑ **Análise Modal:** Toque Dó maior começando em cada grau (7 modos)
☑ **Harmonização:** Construa tríades sobre cada grau da escala
☑ **Transposição:** Execute a mesma escala em 12 tonalidades
☑ **Aplicação Musical:** Improvise melodias usando apenas notas da escala

📈 **PROGRESSÃO ACADÊMICA**
• **Literatura:** Czerny Op.299 (aplicação musical), Chopin (estudos)
• **Análise:** Bach - Invenções (uso melódico), Debussy (escalas exóticas)
• **Próximos conceitos:** Modos de menor harmônica, escalas sintéticas

═══════════════════════════════════════
🎼 **REFERÊNCIA METODOLÓGICA** 🎼
*Baseado em: Bohumil Med, Osvaldo Lacerda*
*Pedagogia: Kodály Method, Suzuki Approach*
═══════════════════════════════════════`;
    }

    // ============= HARMONIA =============
    if (lowerMessage.includes('acorde') || lowerMessage.includes('acordes') || lowerMessage.includes('harmonia')) {
      if (nivelDetectado === 'iniciante') {
        return `🎵 **ACORDES - SEUS PRIMEIROS PASSOS**

📝 **RESUMO RÁPIDO**
Um acorde é quando tocamos 3 ou mais notas ao mesmo tempo, criando um "som cheio" que sustenta melodias.

🎯 **EXPLICAÇÃO SIMPLES**
**O que é um acorde?**
• É como fazer um "sanduíche musical" - você empilha notas uma sobre a outra
• Em vez de tocar uma nota por vez (melodia), toca várias juntas (harmonia)
• **Resultado:** Som rico e completo que "preenche" a música

**Os 2 tipos essenciais:**
• **Acorde Maior:** Som "alegre", "brilhante", "luminoso" 😊
• **Acorde Menor:** Som "triste", "melancólico", "nostálgico" 😢

🎹 **SEU PRIMEIRO ACORDE - ${instrumentoUser.toUpperCase()}**
${instrumentoUser.toLowerCase() === 'piano' ?
`**Acorde de Dó Maior (C):**
• **Mão direita:** 
  - Polegar (1) no Dó
  - Dedo médio (3) no Mi (pule uma tecla)
  - Mindinho (5) no Sol (pule outra tecla)
• **Posição:** Dó-Mi-Sol (teclas brancas)
• **Som:** Alegre, completo, estável ✨

**Como tocar:**
1. Posicione os dedos nas teclas
2. Pressione as 3 teclas ao mesmo tempo
3. Mantenha os dedos curvos
4. Escute o som "feliz" que faz` :

instrumentoUser.toLowerCase() === 'violão' ?
`**Acorde de Dó Maior (C) - Versão Fácil:**
• **3ª corda, 2ª casa:** Sol (dedo 1)
• **2ª corda:** Solta = Dó
• **1ª corda:** Solta = Mi  
• **Outras cordas:** Não toque ainda
• **Posição:** Só 3 cordas agudas

**Como tocar:**
1. Pressione só a 3ª corda na 2ª casa
2. Dedilhe as 3 cordas agudas juntas
3. Escute o som "alegre" que faz
4. Mantenha o dedo bem apertado` :

`**Primeiro acorde no ${instrumentoUser}:**
• Escolha 3 notas que soem bem juntas
• Comece sempre muito devagar
• Foque na qualidade do som, não na velocidade
• Use as notas Dó-Mi-Sol como referência`}

💡 **EXERCÍCIO APLICADO**
☑ **Passo 1:** Toque as notas separadas: Dó... Mi... Sol...
☑ **Passo 2:** Agora toque as 3 juntas: Dó+Mi+Sol (acorde maior)
☑ **Passo 3:** Compare com Dó+Mi♭+Sol (acorde menor - soa mais triste)
☑ **Passo 4:** Cante "lá-lá-lá" por cima do acorde

📈 **PRÓXIMOS PASSOS**
• Aprenda o acorde de Fá maior (F)
• Descubra o acorde de Sol maior (G)  
• Pratique mudanças lentas entre C-F-G
• **Objetivo:** 3 acordes em 2 semanas
• **Tempo:** 10 minutos por dia, só acordes

> **💡 DICA ESPECIAL**
> Com apenas 3 acordes (C-F-G) você já pode tocar centenas de músicas populares!`;
      }

      return `🎵 **HARMONIA FUNCIONAL - SISTEMA COMPLETO**

📝 **RESUMO RÁPIDO**
A harmonia funcional organiza acordes em categorias funcionais (Tônica, Subdominante, Dominante), criando lógica tensão-resolução que estrutura a música tonal.

🎯 **TEORIA FUNCIONAL FUNDAMENTAL**
**Campo Harmônico Diatônico Maior (Dó):**
• **I - C Maj** (Tônica) - *centro tonal, estabilidade, repouso*
• **ii - Dm** (Subdominante) - *afastamento suave da tônica*  
• **iii - Em** (Tônica relativa) - *função ambígua, mediante*
• **IV - F Maj** (Subdominante) - *afastamento forte, preparação*
• **V - G Maj** (Dominante) - *tensão máxima, movimento obrigatório*
• **vi - Am** (Tônica relativa) - *substituto menor da tônica*
• **vii° - B°** (Dominante) - *função dominante diminuta*

**Círculos Funcionais (Hugo Riemann):**
• **Grupo Tônica:** I - iii - vi (estabelecem tonalidade)
• **Grupo Subdominante:** IV - ii (preparação harmônica)
• **Grupo Dominante:** V - vii° (tensão → resolução obrigatória)

🎹 **VOICINGS APLICADOS - ${instrumentoUser.toUpperCase()}**
${instrumentoUser.toLowerCase() === 'piano' ?
`**Shell Voicings (Jazz):**
• **C Maj7:** Dó-Mi-Si (fund-3ª-7ª) - essência do acorde maior
• **Dm7:** Ré-Fá-Dó (fund-3ª-7ª) - função subdominante clara
• **G7:** Sol-Si-Fá (fund-3ª-7ª) - trítono Si-Fá = tensão dominante

**Condução de Vozes (4 partes):**
• **Soprano:** Melodia principal, movimento mais livre
• **Alto/Tenor:** Movimento por graus conjuntos preferencialmente
• **Baixo:** Fundamental do acorde, saltos permitidos
• **Regra:** Evitar 5ªs e 8ªs paralelas consecutivas` :

instrumentoUser.toLowerCase() === 'violão' ?
`**Drop-2 Voicings:**
• **C Maj7:** X-3-2-0-0-0 (shape móvel)
• **Dm7:** X-5-3-5-6-X (forma na 5ª corda)
• **G7:** 3-2-0-0-0-1 (baixo na 6ª corda)

**Inversões Funcionais:**
• **C/E:** Primeira inversão - condução melódica do baixo
• **F/A:** Baixo em Lá suaviza função subdominante
• **G/B:** Baixo na sensível intensifica função dominante` :

`**Aplicação Harmônica:**
• Compreenda função antes de decorar formas
• Use inversões para condução melódica
• Aplique tensions que reforcem a função harmônica`}

💡 **ANÁLISE FUNCIONAL AVANÇADA**
☑ **Progressão ii-V-I:** Dm7-G7-C (preparação-tensão-resolução)
☑ **Substituição Tritonal:** Db7 substitui G7 (movimento cromático descendente)
☑ **Empréstimo Modal:** Am-F-C-G (vi♭ emprestado do modo menor)
☑ **Dominantes Secundárias:** C-A7-Dm-G7-C (V7/ii estabelece centro momentâneo)

🎼 **PROGRESSÕES CARACTERÍSTICAS POR ESTILO**
**Jazz Standards:**
• **ii-V-I:** Base de 90% dos standards
• **vi-ii-V-I:** Turnaround clássico
• **I-vi-ii-V:** "Rhythm Changes" (Gershwin)

**${estiloUser} - Características:**
${estiloUser.toLowerCase().includes('bossa') ?
`• **ii-V com alterações:** Dm7(b5)-G7(alt)-C Maj7(#11)
• **Acordes de passagem:** Movimento cromático frequente
• **Tensions características:** 9ª, 11ª aumentada, 13ª` :
estiloUser.toLowerCase().includes('rock') ?
`• **Progressões simples:** I-vi-IV-V, vi-IV-I-V
• **Power chords:** 5ªs justas sem terça (ambiguidade maior/menor)
• **Modal:** Uso frequente de modos dórico e mixolídio` :
`• **Análise específica:** Cada estilo tem características harmônicas únicas
• **Progressões típicas:** Identifique padrões recorrentes
• **Aplicação funcional:** Mesmo em estilos populares, funções se mantêm`}

📈 **DESENVOLVIMENTO PROGRESSIVO**
• **Próximo nível:** Modulação, acordes alterados, harmonia cromática
• **Literatura:** Bach - Corais (harmonia clássica), Bill Evans (voicings impressionistas)
• **Análise sugerida:** "Giant Steps" (Coltrane), "The Girl from Ipanema" (Jobim)

┌─────────────────────────────────────┐
│  💡 PRINCÍPIO PEDAGÓGICO            │
│  Harmonia = FUNÇÃO + COR            │
│  Primeiro entenda o que faz,        │
│  depois como soa bonito             │
└─────────────────────────────────────┘`;
    }

    // ============= RITMO E COMPASSO =============
    if (lowerMessage.includes('ritmo') || lowerMessage.includes('metrônomo') || lowerMessage.includes('compasso')) {
      return `🎵 **TEORIA RÍTMICA COMPLETA**

📝 **RESUMO RÁPIDO**  
O ritmo organiza a música no tempo através de pulsos regulares (batidas) agrupados em compassos, criando a base temporal de toda expressão musical.

🎯 **SISTEMA DE COMPASSOS FUNDAMENTAIS**
**Compassos Simples (subdivisão binária):**
• **2/4:** 2 semínimas por compasso - *marcha militar, dobrado*
• **3/4:** 3 semínimas por compasso - *valsa, minueto, país*
• **4/4:** 4 semínimas por compasso - *rock, pop, samba - mais comum*

**Compassos Compostos (subdivisão ternária):**
• **6/8:** 2 grupos de 3 colcheias - *balada, country*
• **9/8:** 3 grupos de 3 colcheias - *folk irlandês*  
• **12/8:** 4 grupos de 3 colcheias - *blues lento, power ballad*

🥁 **HIERARQUIA DE ACENTUAÇÃO MÉTRICA**
**Acentos Naturais por Compasso:**
• **2/4:** **FORTE**-fraco (binário simples)
• **3/4:** **FORTE**-fraco-fraco (ternário simples)
• **4/4:** **FORTE**-fraco-**meio-forte**-fraco (quaternário simples)
• **6/8:** **FORTE**-fraco-fraco-**meio-forte**-fraco-fraco (binário composto)

**Subdivisões Rítmicas:**
• **Semínima:** 1 tempo (pulso básico)
• **Colcheia:** 1/2 tempo (subdivisão binária)
• **Semicolcheia:** 1/4 tempo (subdivisão quaternária)
• **Tercina:** divisão ternária de valores binários

🎹 **APLICAÇÃO PRÁTICA NO ${instrumentoUser.toUpperCase()}**
${instrumentoUser.toLowerCase() === 'piano' ?
`**Exercícios de Coordenação Rítmica:**
• **Mão Direita:** Melodia com síncopes
• **Mão Esquerda:** Baixo nos tempos fortes (1 e 3 em 4/4)
• **Independência:** Hanon adaptado com acentuações métricas específicas

**Padrões Estilísticos Brasileiros:**
• **Samba:** Síncope na mão direita, baixo antecipado na esquerda
• **Bossa Nova:** Baixo sincopado no polegar, acordes em contratempo
• **Choro:** Semicolcheias na mão direita, baixo alternado na esquerda` :

instrumentoUser.toLowerCase() === 'violão' ?
`**Levadas Fundamentais:**
• **Rock Básico:** ↓-↓-↑-↑-↓-↑ (padrão 4/4 com palhetada alternada)
• **Bossa Nova:** Baixo no polegar + acordes sincopados nos dedos
• **Country:** Alternate bass (baixo alternado) + acordes nos contratempos

**Técnica de Mão Direita:**
• **Rest Stroke (apoiando):** Para acentos fortes e melodias
• **Free Stroke (sem apoiar):** Para subdivisões e acompanhamentos
• **Fingerstyle:** p(polegar)-i(indicador)-m(médio)-a(anular)` :

`**Desenvolvimento Rítmico Instrumental:**
• **Metrônomo:** Ferramenta essencial - comece sempre lento
• **Contagem:** Conte em voz alta durante prática inicial
• **Subdivisão:** Sinta internamente subdivisions antes de tocar
• **Precisão:** Timing perfeito mais importante que velocidade`}

💡 **SÍNCOPE BRASILEIRA** *(Identidade Musical Nacional)*
**Definição Técnica:** Som que inicia no tempo fraco ou parte fraca de tempo e se prolonga ao tempo forte ou parte forte seguinte.

**Características:**
• **Efeito:** Cria "balanço", "ginga", "swing" típico brasileiro
• **Notação:** Use ligaduras para mostrar prolongamento temporal
• **Exemplos musicais:** 
  - "Garota de Ipanema" - "Olha que coisa mais **lin**-da"
  - "Aquarela do Brasil" - "Brasil, meu **Bra**-sil brasileiro"

⏱️ **METODOLOGIA DE ESTUDO COM METRÔNOMO**
☑ **Início:** 60 BPM (frequência cardíaca em repouso)
☑ **Progressão:** 60→80→100→120→138→160 BPM (gradual)
☑ **Método:** Primeiro só contagem, depois instrumento
☑ **Subdivisão:** "1-e-e-a, 2-e-e-a" para semicolcheias em 4/4
☑ **Acentuação:** Use click nos tempos fortes, mentalize fracos

📈 **EVOLUÇÃO RÍTMICA AVANÇADA**
• **Próximos conceitos:** Polirritmia (3 contra 2), métricas irregulares (5/4, 7/8)
• **Literatura:** Dave Brubeck - "Take Five" (5/4), Pink Floyd - "Money" (7/4)
• **Aplicação:** Rudimentos de bateria adaptados ao instrumento
• **Análise cultural:** Ritmos afro-brasileiros, métricas indianas

> **⚠️ ATENÇÃO PEDAGÓGICA**
> O ritmo brasileiro é patrimônio cultural único. Estudar samba, bossa nova e choro desenvolve sensibilidade rítmica diferenciada mundialmente!

═══════════════════════════════════════
🎵 **REFERÊNCIA CULTURAL** 🎵  
*Ritmo brasileiro: fusão africana-europeia-indígena*
*Estude: Pixinguinha, João Gilberto, Hermeto Pascoal*
═══════════════════════════════════════`;
    }

    // ============= RESPOSTA GENÉRICA ESPECIALIZADA =============
    return `🎵 **IA MUSICAL LOVART - ASSISTENTE PEDAGÓGICA ESPECIALIZADA**

📝 **DIAGNÓSTICO PERSONALIZADO**
**Nível detectado:** ${nivelDetectado.toUpperCase()}
**Instrumento:** ${instrumentoUser}
**Estilo musical:** ${estiloUser}

🎯 **COMPETÊNCIAS DISPONÍVEIS**
**🎼 Teoria Musical Adaptativa (${nivelDetectado}):**
• Escalas (diatônicas, modais, cromáticas, exóticas)
• Intervalos (classificação, inversão, aplicação harmônica)  
• Acordes (tríades, tétrades, tensions, substituições)
• Harmonia funcional (progressões, modulação, análise)
• Contraponto e condução de vozes

**🎹 Especialização Instrumental (${instrumentoUser}):**
• Técnica específica e ergonomia
• Exercícios progressivos por nível
• Repertório adequado e desafiador
• Interpretação e expressividade
• Resolução de dificuldades técnicas

**🎨 Análise Estilística (${estiloUser}):**
• Características harmônicas do estilo
• Padrões rítmicos e métricas típicas
• Progressões idiomáticas e clichês
• Técnicas interpretativas específicas
• Contexto histórico e cultural

**📚 Metodologias Pedagógicas:**
• **Kodály Method:** Desenvolvimento auditivo
• **Suzuki Approach:** Aprendizagem natural
• **Orff-Schulwerk:** Integração corporal
• **Traditional Academic:** Teoria estruturada

💡 **PERGUNTAS OTIMIZADAS PARA SEU NÍVEL (${nivelDetectado}):**

${nivelDetectado === 'iniciante' ? 
`☑ "Como formar meus primeiros acordes no ${instrumentoUser}?"
☑ "Qual a diferença entre som maior e menor?"
☑ "Como usar o metrônomo corretamente?"
☑ "Quais são as 7 notas musicais básicas?"
☑ "Como ler cifras musicais simples?"` :

nivelDetectado === 'elementar' ?
`☑ "Como funciona o campo harmônico maior?"
☑ "Que escalas devo estudar primeiro no ${instrumentoUser}?"
☑ "Como identificar a tonalidade de uma música?"
☑ "Quais são os acordes mais usados em ${estiloUser}?"
☑ "Como praticar escalas de forma eficiente?"` :

nivelDetectado === 'intermediario' ?
`☑ "Como analisar progressões harmônicas em ${estiloUser}?"
☑ "Que são dominantes secundárias e como usar?"
☑ "Como improvisar usando modos gregos?"
☑ "Como fazer rearmonização simples?"
☑ "Qual a teoria por trás da bossa nova?"` :

`☑ "Como aplicar análise schenkeriana em música popular?"
☑ "Que são acordes de empréstimo modal e como usar?"
☑ "Como funciona modulação cromática e enarmônica?"
☑ "Quais técnicas avançadas de contraponto aplicar?"
☑ "Como analisar harmonia impressionista?"`}

🎼 **FORMATAÇÃO PEDAGÓGICA ESPECIALIZADA**
Minhas respostas seguem estrutura acadêmica:
• **📝 Resumo Rápido:** Conceito em 2-3 linhas
• **🎯 Explicação Detalhada:** Desenvolvimento completo
• **🎹 Exemplo no Seu Instrumento:** Aplicação específica
• **💡 Exercício Aplicado:** Atividade prática
• **📈 Próximos Passos:** Progressão natural

**📚 BASE ACADÊMICA RECONHECIDA:**
• **Bohumil Med** - Teoria da Música Brasileira
• **Osvaldo Lacerda** - Harmonia Funcional
• **Walter Piston** - Harmony & Counterpoint
• **Heinrich Schenker** - Análise Estrutural
• **Allen Forte** - Set Theory & Atonal Music

🎯 **COMO OBTER RESPOSTAS OTIMIZADAS:**
**Para Teoria:** "Explique [conceito] para [nível] no [instrumento]"
**Para Prática:** "Exercícios de [técnica] para [instrumento] [nível]"
**Para Análise:** "Como funciona [progressão] em [música/estilo]"
**Para Composição:** "Como compor em estilo [gênero] usando [técnica]"

═══════════════════════════════════════════════════
🎼 **LOVART - IA MUSICAL ESPECIALIZADA** 🎼
*Educação musical de excelência baseada em metodologia*
*acadêmica reconhecida internacionalmente*

*Inspirada em: Juilliard, Berklee, Curtis Institute*
*Metodologia brasileira: Villa-Lobos, Guerra-Peixe*
═══════════════════════════════════════════════════

**🎵 Digite sua pergunta específica e vamos aprofundar seus conhecimentos musicais com precisão pedagógica!**`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(currentMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        nivel: diagnosticarNivel(currentMessage)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro na resposta da IA:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🎵 **ERRO TEMPORÁRIO**\n\nDesculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes.\n\n**Sugestão:** Reformule sua pergunta ou tente um tópico específico como "escalas", "acordes" ou "ritmo".',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    toast({
      title: feedback === 'positive' ? "Feedback positivo!" : "Feedback registrado",
      description: feedback === 'positive' 
        ? "Ótimo! Continue fazendo perguntas para aprender mais." 
        : "Obrigado pelo feedback. Vou melhorar minhas respostas."
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Resposta copiada para a área de transferência"
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Exportação para PDF será implementada em breve",
      variant: "default"
    });
  };

  const saveConversation = () => {
    toast({
      title: "Conversa salva!",
      description: "Histórico salvo com sucesso no Supabase"
    });
  };

  const quickTopics = [
    "Campo harmônico maior",
    "Escalas pentatônicas", 
    "Progressão ii-V-I",
    "Síncope brasileira",
    "Modos gregos",
    "Voicings para jazz",
    "Ritmo da bossa nova",
    "Análise harmônica",
    "Intervalos musicais",
    "Modulação tonal"
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                IA Musical Lovart
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Especializada
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Assistente pedagógica avançada em teoria musical, prática instrumental e metodologia de ensino
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveConversation} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar Sessão
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[75vh] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Conversa Pedagógica com IA Musical
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      } rounded-lg p-4`}>
                        
                        {/* Message Header */}
                        <div className="flex items-center gap-2 mb-2">
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? 'Você' : 'IA Musical'}
                          </span>
                          {message.nivel && (
                            <Badge variant="outline" className="text-xs">
                              {message.nivel}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Message Content */}
                        <div className="text-sm mb-3 whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Message Footer */}
                        <div className="flex items-center justify-between text-xs opacity-70">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-background/20"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 hover:bg-background/20 ${
                                    message.feedback === 'positive' ? 'text-green-600' : ''
                                  }`}
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 hover:bg-background/20 ${
                                    message.feedback === 'negative' ? 'text-red-600' : ''
                                  }`}
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm">IA Musical está analisando e preparando resposta especializada...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua pergunta sobre teoria musical, técnica instrumental ou análise harmônica..."
                    className="flex-1 min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="self-end"
                    size="lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-4">
            {/* IA Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configurações Pedagógicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Instrumento Principal</label>
                  <Select value={instrument} onValueChange={setInstrument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu instrumento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="violão">Violão</SelectItem>
                      <SelectItem value="guitarra">Guitarra</SelectItem>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="bateria">Bateria</SelectItem>
                      <SelectItem value="violino">Violino</SelectItem>
                      <SelectItem value="flauta">Flauta</SelectItem>
                      <SelectItem value="saxofone">Saxofone</SelectItem>
                      <SelectItem value="canto">Canto</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Nível Musical</label>
                  <Select value={nivel} onValueChange={(value: any) => setNivel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante (0-6 meses)</SelectItem>
                      <SelectItem value="elementar">Elementar (6-18 meses)</SelectItem>
                      <SelectItem value="intermediario">Intermediário (1,5-3 anos)</SelectItem>
                      <SelectItem value="avancado">Avançado (3+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Estilo Musical</label>
                  <Select value={musicStyle} onValueChange={setMusicStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classico">Clássico</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="bossa nova">Bossa Nova</SelectItem>
                      <SelectItem value="mpb">MPB</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="blues">Blues</SelectItem>
                      <SelectItem value="samba">Samba</SelectItem>
                      <SelectItem value="choro">Choro</SelectItem>
                      <SelectItem value="forró">Forró</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Configurações aplicadas!",
                      description: "IA personalizada para suas preferências pedagógicas"
                    });
                  }}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Aplicar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Quick Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Tópicos Pedagógicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {quickTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => setInputMessage(`Explique ${topic} para nível ${nivel} no ${instrument || 'piano'}`)}
                    >
                      <Target className="h-3 w-3 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Perguntas feitas:</span>
                  <span className="font-medium">{messages.filter(m => m.role === 'user').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Respostas da IA:</span>
                  <span className="font-medium">{messages.filter(m => m.role === 'assistant').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Feedbacks positivos:</span>
                  <span className="font-medium text-green-600">
                    {messages.filter(m => m.feedback === 'positive').length}
                  </span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground text-center">
                  Nível atual: <span className="font-medium capitalize">{nivel}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}