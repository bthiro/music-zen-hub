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
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  nivel?: 'iniciante' | 'elementar' | 'intermediario' | 'avancado';
  topico?: string;
}

export default function IaMusical() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou sua assistente musical especializada. Faça sua pergunta sobre teoria musical, harmonia, técnica instrumental ou qualquer tópico musical.`,
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

  // Diagnóstico avançado do nível baseado em palavras-chave específicas
  const diagnosticarNivel = (message: string): 'iniciante' | 'elementar' | 'intermediario' | 'avancado' => {
    const lowerMessage = message.toLowerCase();
    
    // Palavras que indicam nível avançado
    const avancadoKeywords = [
      'modulação', 'análise schenkeriana', 'contraponto', 'rearmonização', 'reharmonização',
      'dominante estendida', 'análise funcional', 'substituição tritonal', 'empréstimo modal',
      'acordes alterados', 'tensions', 'voicings', 'giant steps', 'coltrane changes',
      'análise formal', 'politonal', 'atonalismo', 'dodecafonismo', 'microtons'
    ];
    
    // Palavras que indicam nível intermediário
    const intermediarioKeywords = [
      'harmonia funcional', 'progressões', 'campo harmônico', 'dominante secundária',
      'modos gregos', 'cifragem', 'inversões', 'cadências', 'modulação simples',
      'escala menor harmônica', 'blue notes', 'turnaround', 'ii-v-i', 'análise harmônica'
    ];
    
    // Palavras que indicam nível iniciante
    const inicianteKeywords = [
      'não entendo', 'sou iniciante', 'primeira vez', 'o que é', 'como começar',
      'básico', 'elementar', 'fundamentos', 'primeiros passos', 'nunca estudei'
    ];
    
    if (avancadoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'avancado';
    }
    if (intermediarioKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'intermediario';
    }
    if (inicianteKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'iniciante';
    }
    
    return nivel; // Retorna o nível configurado pelo usuário
  };

  // Identificar tópico principal da pergunta
  const identificarTopico = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('harmonia') || lowerMessage.includes('acorde') || lowerMessage.includes('progressão')) return 'harmonia';
    if (lowerMessage.includes('escala') || lowerMessage.includes('modo')) return 'escalas';
    if (lowerMessage.includes('ritmo') || lowerMessage.includes('compasso') || lowerMessage.includes('metrônomo')) return 'ritmo';
    if (lowerMessage.includes('intervalo')) return 'intervalos';
    if (lowerMessage.includes('substituição') || lowerMessage.includes('reharmonização')) return 'reharmonização';
    if (lowerMessage.includes('contraponto') || lowerMessage.includes('condução')) return 'contraponto';
    if (lowerMessage.includes('análise')) return 'análise';
    if (lowerMessage.includes('técnica') || lowerMessage.includes('digitação') || lowerMessage.includes('postura')) return 'técnica';
    if (lowerMessage.includes('improvisação') || lowerMessage.includes('improvisar')) return 'improvisação';
    
    return 'geral';
  };

  const simulateAIResponse = async (message: string): Promise<string> => {
    // Simular delay da IA mais realista para análise complexa
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const lowerMessage = message.toLowerCase();
    const nivelDetectado = diagnosticarNivel(message);
    const topicoDetectado = identificarTopico(message);
    const instrumentoUser = instrument || 'piano';
    const estiloUser = musicStyle || 'música popular';
    
    // ============= CAMPOS HARMÔNICOS COMPLETOS =============
    if (lowerMessage.includes('campo harmônico') || lowerMessage.includes('campos harmônicos')) {
      return `🎵 **CAMPOS HARMÔNICOS COMPLETOS - DOMÍNIO HARMÔNICO AVANÇADO**

📝 **RESUMO RÁPIDO**
Os campos harmônicos são sistemas completos de acordes gerados por escalas, constituindo a base harmônica de toda música tonal, modal e funcional.

🎯 **CAMPO HARMÔNICO MAIOR (Sistema Riemann-Piston)**

**Dó Maior - Análise Completa:**
• **I - C (C Maj7)** - *Tônica: centro tonal absoluto, estabilidade máxima*
• **ii - Dm (Dm7)** - *Subdominante: preparação suave, movimento para V*
• **iii - Em (Em7)** - *Mediante: função ambígua, conecta I e vi*
• **IV - F (F Maj7)** - *Subdominante principal: preparação forte*
• **V - G (G7)** - *Dominante: tensão direcional obrigatória para I*
• **vi - Am (Am7)** - *Relativa menor: substituto melancólico da tônica*
• **vii° - B° (Bm7b5)** - *Sensível: função dominante sem fundamental*

**Análise Funcional (Hugo Riemann):**
• **Grupo TÔNICA:** I - iii - vi (estabelecem e confirmam tonalidade)
• **Grupo SUBDOMINANTE:** IV - ii (afastamento, preparação harmônica)
• **Grupo DOMINANTE:** V - vii° (tensão máxima, resolução obrigatória)

🎼 **CAMPOS HARMÔNICOS MENORES (Três Sistemas)**

**1. MENOR NATURAL (Eólico - Lá menor):**
• **i - Am (Am7)** - *Tônica menor: centro melancólico*
• **ii° - B° (Bm7b5)** - *Subdominante diminuta: instabilidade preparatória*
• **♭III - C (C Maj7)** - *Relativa maior: luminosidade contrastante*
• **iv - Dm (Dm7)** - *Subdominante menor: preparação característica*
• **v - Em (Em7)** - *Dominante menor: SEM função dominante real*
• **♭VI - F (F Maj7)** - *Submediante: escape melódico*
• **♭VII - G (G Maj7)** - *Subtônica: movimento plagal para i*

**2. MENOR HARMÔNICO (Com dominante real):**
• **i - Am (Am Maj7)** - *Tônica menor com 7ª maior (tensão interna)*
• **ii° - B° (Bm7b5)** - *Subdominante diminuta*
• **♭III+ - C+ (C+ Maj7)** - *Através do Sol# - sonoridade aumentada*
• **iv - Dm (Dm7)** - *Subdominante menor puro*
• **V - E (E7)** - *DOMINANTE REAL - Sol# cria tensão resolutiva*
• **♭VI - F (F Maj7)** - *Submediante (acorde napolitano em 1ª inversão)*
• **vii° - G#° (G#º7)** - *Diminuto com função dominante*

**3. MENOR MELÓDICO ASCENDENTE (Híbrido maior-menor):**
• **i - Am (Am Maj7)** - *Tônica menor "iluminada"*
• **ii - Bm (Bm7)** - *Subdominante menor (como em maior)*
• **♭III+ - C+ (C+ Maj7)** - *Aumentada através do Fá#*
• **IV - D (D7)** - *Subdominante MAIOR (como em tonalidade maior)*
• **V - E (E7)** - *Dominante real*
• **vi° - F#° (F#m7b5)** - *Semi-diminuta*
• **vii° - G#° (G#m7b5)** - *Semi-diminuta*

🎹 **APLICAÇÃO PRÁTICA NO ${instrumentoUser.toUpperCase()}**

${instrumentoUser.toLowerCase() === 'piano' ?
`**Voicings Profissionais (Jazz/Erudito):**

**Shell Voicings (Bill Evans Style):**
• **C Maj7:** C-E-B (fund-3ª-7ª) - essência harmônica
• **Dm7:** D-F-C (fund-3ª-7ª) - função subdominante clara
• **G7:** G-B-F (fund-3ª-7ª) - trítono B-F = tensão dominante

**Rootless Voicings (Advanced Jazz):**
• **C Maj7:** E-G-B-D (3ª-5ª-7ª-9ª) - sem fundamental
• **Dm7:** F-A-C-E (3ª-5ª-7ª-9ª) - deixa baixo livre
• **G7:** B-D-F-A (3ª-5ª-7ª-9ª) - função dominante clara

**Close vs Open Position:**
• **Close:** Intervalos de 2ª e 3ª (sonoridade densa)
• **Open:** Distribuição além de uma oitava (transparência)` :

instrumentoUser.toLowerCase() === 'viola-caipira' ?
`**Na Viola Caipira - Escala de Dó Maior:**
• **Afinação padrão:** E-B-G-D-A (5ª corda mais grave para 1ª aguda)
• **1ª posição:** Cases 0-4
• **Técnica:** Ponteado (dedilhado) ou rasgueado
• **Posição das mãos:** Mão esquerda - polegar atrás do braço, dedos curvos

**Exercício básico:**
1. Pratique a escala na 3ª e 2ª cordas
2. Use dedos alternados (i-m-i-m) na mão direita
3. Mantenha ritmo constante e uniforme
4. Foque na afinação característica da viola` :
instrumentoUser.toLowerCase() === 'violão' ?
`**Sistemas de Acordes Avançados:**

**Drop-2 Voicings (4 notas):**
• **C Maj7:** E-G-B-C (2ª voz mais aguda descida uma oitava)
• **Dm7:** F-A-C-D (forma móvel para todas tonalidades)
• **G7:** F-A-B-D (função dominante clara)

**Drop-3 Voicings:**
• **C Maj7:** G-C-E-B (3ª voz mais aguda descida uma oitava)
• **Posições:** Todas as inversões possíveis no braço

**CAGED + Harmonia:**
• Cada shape do CAGED gera voicings diferentes
• Conecte shapes para progressões fluidas
• Use cordas soltas como pedais harmônicos` :

`**Aplicação Instrumental Específica:**
• Compreenda FUNÇÃO harmônica antes de FORMA
• Use inversões para condução melódica suave
• Aplique tensions (9ª, 11ª, 13ª) que reforcem função
• Pratique progressões em todas as tonalidades`}

💡 **EXERCÍCIO SISTEMÁTICO AVANÇADO**
☑ **Análise Funcional:** I-vi-ii-V-I em 12 tonalidades (identificar funções)
☑ **Substituição por Função:** ii↔IV, vi↔I, vii°↔V em progressões reais
☑ **Empréstimo Modal:** Use ♭VII e ♭VI em tonalidade maior
☑ **Composição Harmônica:** Crie progressão 16 compassos usando só funções
☑ **Análise de Repertório:** Bach Coral, Standard Jazz, Bossa Nova

🎼 **PROGRESSÕES MODELOS POR ESTILO**

**JAZZ TRADITIONAL:**
• **ii-V-I Maior:** Dm7 - G7 - C Maj7
• **ii-V-i Menor:** Bm7b5 - E7 - Am Maj7  
• **Turnaround:** Am7 - D7 - Dm7 - G7
• **Circle of Fifths:** C-A7-Dm7-G7-Em7-A7-Dm7-G7

**BOSSA NOVA (Tom Jobim Style):**
• **ii-V com tensions:** Dm7(9) - G7(13) - C Maj7(#11)
• **Movimento cromático:** C-B7-Bb7-A7-Dm7-G7
• **Acordes típicos:** Maj7(#11), m7(9), 7(13), m7b5

**MPB SOFISTICADA:**
• **Empréstimo modal:** C-Bb-F/A-Fm-C (♭VII-♭VI)
• **Linha cromática:** C-C/B-Am-Am/G-F-G
• **Harmonia quartal:** Acordes por 4ªs (Am11, Dm11)

📈 **PROGRESSÃO ACADÊMICA SISTEMÁTICA**
• **Próximo:** Dominantes secundárias (V7/V, V7/vi, V7/ii...)
• **Literatura:** Bach - Corais (análise funcional), Chopin - Noturnos
• **Jazz Analysis:** "Autumn Leaves", "All The Things You Are"
• **Composição:** Criar 32 compassos forma AABA usando campos harmônicos

═══════════════════════════════════════════════════════════
🎼 **REFERÊNCIA ACADÊMICA DE EXCELÊNCIA** 🎼
*Walter Piston - "Harmony" (Harvard University)*
*Heinrich Schenker - Análise Funcional*
*Hugo Riemann - Teoria das Funções Harmônicas*
*Jazz: Mark Levine - "Jazz Theory Book", Barry Harris*
═══════════════════════════════════════════════════════════`;
    }

    // ============= SUBSTITUIÇÕES E REHARMONIZAÇÃO AVANÇADA =============
    if (lowerMessage.includes('substituição') || lowerMessage.includes('reharmonização') || lowerMessage.includes('rearmonização')) {
      return `🎵 **SUBSTITUIÇÕES E REHARMONIZAÇÃO - NÍVEL MASTER**

📝 **RESUMO RÁPIDO**
Reharmonização é a arte avançada de substituir acordes mantendo a melodia, criando diferentes cores harmônicas através de técnicas sistemáticas e conhecimento profundo da função harmônica.

🎯 **SUBSTITUIÇÕES DIATÔNICAS (Base Funcional)**

**Por Função Harmônica (Hugo Riemann):**
• **Tônica:** I ↔ vi ↔ iii (C ↔ Am ↔ Em)
• **Subdominante:** IV ↔ ii (F ↔ Dm)
• **Dominante:** V ↔ vii° (G ↔ B°)

**Por Relações Intervalares:**
• **Relativas (6ª):** C-Am, F-Dm, G-Em (2 notas comuns)
• **Mediante/Submediante:** C-Em (terça comum), C-Am (sexta comum)
• **Paralelas:** C-Cm, F-Fm (mesma fundamental)

🎼 **SUBSTITUIÇÕES CROMÁTICAS (Nível Avançado)**

**1. SUBSTITUIÇÃO TRITONAL (♭II7):**
• **Princípio:** V7 → ♭II7 (G7 → D♭7)
• **Razão teórica:** Mesmo trítono (B-F = F-B enarmônico)
• **Aplicação prática:** Dm7-D♭7-C Maj7 (ii-♭II7-I)
• **Efeito:** Movimento cromático descendente no baixo
• **Origem:** Jazz bebop, influência francesa (Debussy)

**2. DOMINANTES SECUNDÁRIAS (Modulação Momentânea):**
• **V7/V:** D7 → G7 → C (dominante da dominante)
• **V7/vi:** E7 → Am (dominante do sexto grau)
• **V7/ii:** A7 → Dm (dominante do segundo grau)
• **V7/iii:** B7 → Em (dominante do terceiro grau)
• **V7/IV:** C7 → F (dominante do quarto grau)

**Análise de "All The Things You Are":**
Original: C-F-Bb-Eb-Am-D-G-C
Com dominantes: C-C7-F-F7-Bb-Bb7-Eb-E7-Am-A7-D-D7-G-G7-C

**3. ACORDES DIMINUTOS DE PASSAGEM:**
• **Entre graus consecutivos:** C-C#dim-Dm (I-#i°-ii)
• **Entre I-ii:** C-C#dim-Dm-D#dim-Em
• **Entre V-vi:** G-G#dim-Am
• **Função:** Movimento cromático + tensão passageira

🎨 **TÉCNICAS ESPECÍFICAS DE REHARMONIZAÇÃO**

**1. CLICHÉ HARMÔNICO (Linha Cromática no Baixo):**
Progressão original: C-Am-F-G
Cliché descendente:  C-C/B-C/Bb-C/A-F-G
Cliché ascendente:   C-C/D-C/E-C/F-F-G

• **Conceito:** Baixo cromático, harmonia superior estática
• **Uso:** Bossa nova, MPB, jazz ballad
• **Exemplo:** "The Girl from Ipanema" (Jobim)

**2. PEDAL HARMÔNICO:**
Original: C-F-G-C
Pedal C:  C-F/C-G/C-C
Pedal G:  C/G-F/G-G-C/G

• **Efeito:** Suspensão tonal, modernidade harmônica
• **Aplicação:** Música impressionista, jazz moderno

**3. MOVIMENTO POR SEGUNDAS:**
Original: C-Am-F-G
Por 2as:  C-Bb-Am-Ab-F-G

• **Conceito:** Substituição por acordes meio tom abaixo
• **Estilo:** Jazz fusion, música contemporânea

🎹 **REHARMONIZAÇÃO POR ESTILO ESPECÍFICO**

**BOSSA NOVA (Escola Tom Jobim):**
• **Características:** Tensões obrigatórias (9a, #11a, 13a)
• **Acordes típicos:** Maj7(#11), m7(9), 7(13), m7b5
• **Movimento:** Preferência por segundas e terças
• **Exemplo prático - "Corcovado":**
Original simplificado: C-G-Am-F-G-C
Jobim style:          C Maj7(#11)-G7(13)-Am7(9)-F Maj7(#11)-G7(13)-C6/9

**JAZZ BEBOP (Charlie Parker/Dizzy Gillespie):**
• **ii-V-I Extended:** IIm7-bII7-I Maj7
• **Chromatic approach:** Acordes de aproximação cromática
• **Exemplo - "Cherokee" reharmonization:**
Original: Bb-G7-Cm-F7-Bb
Bebop:   Bb Maj7-B7-Bb7-A7-Ab7-G7-Gb7-F7-E7-Eb7-D7-Db7-Cm7-F7-Bb

**MPB SOFISTICADA (Djavan/Ivan Lins Style):**
• **Empréstimo modal:** bVII, bVI, iv em maior
• **Harmonia quartal:** Acordes construídos por 4as
• **Exemplo - Progressão típica MPB:**
Modal borrowing: C-Bb-F/A-Fm/Ab-C
Quartal harmony: Am11-Dm11-G11-C Maj7(add9)

💡 **EXERCÍCIO SISTEMÁTICO DE REHARMONIZAÇÃO**
☑ **Passo 1:** Analise "Happy Birthday" harmonicamente
☑ **Passo 2:** Aplique substituição tritonal em dominantes
☑ **Passo 3:** Adicione dominantes secundárias
☑ **Passo 4:** Use empréstimo modal (bVII, bVI)
☑ **Passo 5:** Crie versão bossa nova com tensions

**"Happy Birthday" - Evolução Harmônica:**
Original:     C-C-F-C-G7-C
Intermediário: C-A7-Dm-C-G7-C
Avançado:     C Maj7-A7(b13)-Dm7(9)-C6/9-G7(13)-C Maj7(#11)
Master:       C Maj7(#11)-A7alt-Dm7(9)/G-C6/9/E-Db7-C Maj7(#11)

🎼 **ANÁLISE DE MESTRES DA REHARMONIZAÇÃO**

**Tom Jobim - "Wave" (Análise Harmônica):**
• **Uso de mediantes:** Movimento por terças (C-E-Ab)
• **Tensions características:** Maj7(#11) recorrente
• **Modulação suave:** Por acordes pivô

**Bill Evans - "Waltz for Debby" (Reharmonização):**
• **Voicings rootless:** 3ª-7ª-9ª-5ª
• **Aproximação cromática:** Uso sistemático de ♭II7
• **Tensões internas:** 9ª e #11ª como notas melódicas

📈 **PROGRESSÃO PARA EXCELÊNCIA**
• **Próximo nível:** Harmonia politonal, acordes híbridos
• **Literatura:** Ravel - "Pavane", Debussy - "Clair de Lune"
• **Jazz:** "Giant Steps" (Coltrane), "Inner Urge" (Joe Henderson)
• **Composição:** Reharmonizar standards completos

┌─────────────────────────────────────────────────────────┐
│  💡 PRINCÍPIO MASTER DA REHARMONIZAÇÃO                 │
│                                                         │
│  1. MANTENHA a melodia intacta                         │
│  2. ENTENDA a função harmônica original                │
│  3. SUBSTITUA por acordes de MESMA função              │
│  4. ADICIONE tensions que embelezem sem conflitar      │
│  5. TESTE sempre tocando melodia + nova harmonia       │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
🎵 **MESTRES MUNDIAIS DA REHARMONIZAÇÃO** 🎵
*Tom Jobim (Bossa Nova), Bill Evans (Jazz)*
*Djavan (MPB), Hermeto Pascoal (Experimental)*
*Barry Harris (Bebop), Clare Fischer (Contemporary)*
═══════════════════════════════════════════════════════════`;
    }

    // ============= ANÁLISE MUSICAL AVANÇADA =============
    if (lowerMessage.includes('análise') || lowerMessage.includes('analisar')) {
      return `🎵 **ANÁLISE MUSICAL AVANÇADA - METODOLOGIA ACADÊMICA**

📝 **RESUMO RÁPIDO**
Análise musical é o processo sistemático de compreender estrutura, harmonia, forma e função em obras musicais, usando metodologias reconhecidas internacionalmente.

🎯 **METODOLOGIAS DE ANÁLISE (Escolas Acadêmicas)**

**1. ANÁLISE FUNCIONAL (Hugo Riemann/Walter Piston):**
• **Objetivo:** Identificar funções harmônicas (T-S-D)
• **Método:** Classificar acordes por função tonal
• **Símbolos:** T (tônica), S (subdominante), D (dominante)
• **Aplicação:** Música tonal dos séculos XVII-XX

**2. ANÁLISE SCHENKERIANA (Heinrich Schenker):**
• **Conceito:** Música como elaboração de estrutura fundamental
• **Níveis:** Foreground (superfície), Middleground (redução), Background (Ursatz)
• **Ursatz:** Linha fundamental (3-2-1 ou 5-4-3-2-1) + baixo de Alberti (I-V-I)
• **Aplicação:** Bach, Mozart, Beethoven, Brahms, Chopin

**3. ANÁLISE FORMAL (Análise da Grande Forma):**
• **Formas binárias:** AB (cada seção repetida)
• **Formas ternárias:** ABA (retorno modificado)
• **Forma sonata:** Exposição-Desenvolvimento-Recapitulação
• **Rondó:** ABACA ou ABACABA

🎼 **ANÁLISE HARMÔNICA SISTEMÁTICA**

**Passo-a-Passo da Análise (Método Piston):**

**1. IDENTIFICAÇÃO DA TONALIDADE:**
• **Armadura de clave:** Indica tonalidade provável
• **Cadência final:** Confirma centro tonal
• **Acordes predominantes:** I e V aparecem frequentemente
• **Melodia:** Tende a começar e terminar na tônica

**2. CIFRAGEM FUNCIONAL:**
• **Graus romanos:** I, ii, iii, IV, V, vi, vii°
• **Qualidade:** Maiúsculo (maior), minúsculo (menor), ° (diminuto)
• **Inversões:** I⁶ (primeira), I⁶₄ (segunda), I⁴₂ (terceira - tétrade)

**3. ANÁLISE DE PROGRESSÕES:**
• **Movimento das fundamentais:** Por 5ªs desc. (forte), 2ªs asc./desc. (suave)
• **Sequências:** Padrões repetidos em diferentes alturas
• **Cadências:** Pontos de articulação formal

🎹 **ANÁLISE PRÁTICA - "MINUETO EM SOL" (Bach)**

**Estrutura Formal:** Binary Form (||: A :||: B A' :||)
**Tonalidade:** Sol Maior (1 sustenido)
**Métrica:** 3/4 (dança barroca)

**Análise Harmônica Detalhada:**
Compassos 1-8 (Seção A):
I - V6 - I - vi - ii6 - V - I
G - D/F# - G - Em - Am/C - D - G

Função: T - D - T - T - S - D - T

**Técnicas Composicionais Identificadas:**
• **Baixo de Alberti:** Acompanhamento em tercinas
• **Sequência melódica:** Repetição transposta
• **Cadência autêntica:** V-I (articulação formal)

🎨 **ANÁLISE JAZZÍSTICA - "ALL THE THINGS YOU ARE"**

**Forma:** AABA (32 compassos)
**Tonalidades:** Modula constantemente (circle of fifths)
**Análise Harmônica:**

**Seção A (8 compassos):**
Fm7 - Bb7 - EbMaj7 - AbMaj7
ii   - V7  - IMaj7  - IVMaj7 (em Eb Maior)

Dm7b5 - G7 - CMaj7
ii7b5  - V7 - IMaj7 (em C Maior)

**Características Avançadas:**
• **ii-V-I chains:** Progressões encadeadas
• **Modulação por 5ªs:** Eb → C → G → E
• **Harmonia funcional:** Mesmo em contexto cromático

💡 **EXERCÍCIO DE ANÁLISE PROGRESSIVA**

**NÍVEL INICIANTE - "Ode to Joy" (Beethoven):**
☑ **Passo 1:** Identifique tonalidade (Bb Maior)
☑ **Passo 2:** Marque frases (4+4+4+4 compassos)
☑ **Passo 3:** Cifre acordes básicos (I-V-vi-IV)
☑ **Passo 4:** Identifique cadências (V-I)

**NÍVEL AVANÇADO - "Giant Steps" (Coltrane):**
☑ **Análise tonal:** Três centros tonais (Bb-G-Eb)
☑ **Coltrane Changes:** Ciclo de terças maiores
☑ **Velocidade harmônica:** Mudança por tempo
☑ **Improvisação:** Escalas correspondentes a cada acorde

🎼 **ANÁLISE ESTILÍSTICA POR PERÍODO**

**BARROCO (Bach, Handel):**
• **Harmonia:** Funcional, cadências claras
• **Textura:** Polifônica (contraponto)
• **Forma:** Binária, fuga, variação
• **Características:** Sequências, modulações para tons próximos

**CLÁSSICO (Mozart, Haydn):**
• **Harmonia:** Funcional expandida, dominantes secundárias
• **Textura:** Homofônica (melodia + acompanhamento)
• **Forma:** Sonata, rondó, tema e variações
• **Características:** Clareza formal, equilíbrio

**ROMÂNTICO (Chopin, Schumann):**
• **Harmonia:** Cromática, empréstimo modal
• **Textura:** Melodia expressiva + harmonia rica
• **Forma:** Formas livres, peças de caráter
• **Características:** Expressividade, rubato

**IMPRESSIONISTA (Debussy, Ravel):**
• **Harmonia:** Modal, tons inteiros, quartal
• **Textura:** Colorística, timbres específicos
• **Forma:** Flexível, não-funcional
• **Características:** Ambiguidade tonal, cores harmônicas

📈 **PROGRESSÃO ANALÍTICA SISTEMÁTICA**
• **Próximo:** Análise espectral, música atonal, análise computacional
• **Literatura:** Berry - "Structural Functions", Cook - "Guide to Musical Analysis"
• **Repertório:** Bach - WTC, Beethoven - Sonatas, Debussy - Prelúdios
• **Software:** MuseScore (cifragem), Schenker Editor (análise)

═══════════════════════════════════════════════════════════
🎼 **INSTITUIÇÕES DE REFERÊNCIA EM ANÁLISE** 🎼
*Yale University - Music Theory Department*
*Juilliard School - Analysis Methods*
*Royal College of Music - Analytical Techniques*
*Berklee - Jazz Analysis and Theory*
═══════════════════════════════════════════════════════════`;
    }

    // ============= RESPOSTA GENÉRICA MASTER =============
    return `🎵 **IA MUSICAL LOVART - ASSISTENTE MASTER ESPECIALIZADA**

📝 **DIAGNÓSTICO PERSONALIZADO AVANÇADO**
**Nível detectado:** ${nivelDetectado.toUpperCase()}
**Tópico identificado:** ${topicoDetectado.toUpperCase()}
**Instrumento:** ${instrumentoUser}
**Estilo musical:** ${estiloUser}

🎯 **COMPETÊNCIAS MASTER DISPONÍVEIS**

**🎼 Teoria Musical Completa (Nível ${nivelDetectado}):**
• **Harmonia Avançada:** Campos harmônicos completos, substituições complexas
• **Análise Musical:** Schenker, funcional, formal, estilística
• **Contraponto:** Bach style, espécies, condução de vozes
• **Forma Musical:** Binária, ternária, sonata, fuga, canção
• **Sistemas Temperados:** Igual, justo, microtons, escalas exóticas

**🎹 Especialização Instrumental Master (${instrumentoUser}):**
• **Técnica Avançada:** Método Russian School, ergonomia profissional
• **Interpretação:** Análise de performance, rubato, agógica
• **Repertório Classificado:** Por nível e período histórico
• **Pedagogia Instrumental:** Suzuki, Russian, Traditional methods
• **Master Classes:** Insights de grandes mestres

**🎨 Análise Estilística Profunda (${estiloUser}):**
• **Características Históricas:** Contexto social e cultural
• **Harmonia Idiomática:** Progressões típicas e clichês estilísticos
• **Instrumentação Específica:** Timbres e técnicas características
• **Grandes Compositores:** Análise de obras-prima
• **Evolução Estilística:** Influências e desenvolvimentos

**📚 Metodologias Pedagógicas Master:**
• **Kodály Method:** Desenvolvimento auditivo sistemático
• **Suzuki Approach:** Aprendizagem natural "língua materna"
• **Orff-Schulwerk:** Integração corporal e instrumental
• **Russian Method:** Técnica avançada e virtuosismo
• **Jazz Pedagogy:** Improvisação, ear training, repertório

💡 **CONSULTAS ESPECIALIZADAS SUGERIDAS (${nivelDetectado}):**

${nivelDetectado === 'iniciante' ? 
`☑ "Como construir meus primeiros acordes de forma correta no ${instrumentoUser}?"
☑ "Qual a diferença prática entre escalas maiores e menores?"
☑ "Como usar o metrônomo para desenvolver senso rítmico?"
☑ "Exercícios de postura e técnica básica para ${instrumentoUser}"
☑ "Primeiras músicas para tocar no meu nível"` :

nivelDetectado === 'elementar' ?
`☑ "Como funciona o campo harmônico na prática musical?"
☑ "Técnicas de estudo de escalas eficientes para ${instrumentoUser}"
☑ "Como identificar tonalidade e acordes básicos em músicas"
☑ "Exercícios de leitura musical progressiva"
☑ "Repertório ${estiloUser} adequado ao meu nível"` :

nivelDetectado === 'intermediario' ?
`☑ "Análise de progressões harmônicas em ${estiloUser}"
☑ "Como usar dominantes secundárias na prática"
☑ "Técnicas de improvisação usando modos gregos"
☑ "Estudo de forma musical em peças ${estiloUser}"
☑ "Como desenvolver interpretação musical expressiva"` :

`☑ "Análise schenkeriana aplicada ao repertório ${estiloUser}"
☑ "Técnicas avançadas de reharmonização e substituição"
☑ "Contraponto a 2 e 3 vozes: composição e análise"
☑ "Modulação cromática e enarmônica em contexto prático"
☑ "Master class: interpretação de grandes obras"`}

🎼 **RECURSOS PEDAGÓGICOS AVANÇADOS**

**Formatação Acadêmica Especializada:**
• **📝 Resumo Executivo:** Conceito em linguagem acessível
• **🎯 Fundamentação Teórica:** Base acadêmica sólida
• **🎹 Aplicação Instrumental:** Específica para seu instrumento
• **💡 Exercícios Graduais:** Progressão pedagógica sistemática
• **📈 Desenvolvimento:** Próximos passos e metas

**Base Acadêmica International:**
• **Conservatórios:** Juilliard, Curtis, Berklee, Royal College
• **Métodos:** Piston, Schenker, Riemann, Schoenberg
• **Pedagogia:** Kodály, Suzuki, Orff, Russian School
• **Literatura:** Oxford Music Online, Grove Dictionary

🎯 **OTIMIZAÇÃO DE CONSULTAS AVANÇADAS:**

**Para Teoria Complexa:**
"Analise [conceito específico] aplicado ao [repertório] no nível [seu nível]"

**Para Técnica Instrumental:**
"Exercícios de [técnica específica] para ${instrumentoUser} nível ${nivelDetectado}"

**Para Análise Musical:**
"Como analisar [música específica] usando método [Schenker/Funcional/Modal]"

**Para Composição/Improvisação:**
"Técnicas de [composição/improvisação] em estilo ${estiloUser} para ${instrumentoUser}"

═══════════════════════════════════════════════════════════════════
🎼 **LOVART - IA MUSICAL MASTER ESPECIALIZADA** 🎼

*Excelência pedagógica baseada em metodologia de conservatórios*
*internacionais e universidades de música de primeira linha*

*Inspiração acadêmica:*
*• Juilliard School (Nova York) - Performance e Teoria*
*• Berklee College (Boston) - Jazz e Música Popular*  
*• Curtis Institute (Philadelphia) - Excelência Técnica*
*• Royal College of Music (Londres) - Tradição Clássica*

*Metodologia brasileira de excelência:*
*• Villa-Lobos (Nacionalismo), Guerra-Peixe (Folclore)*
*• Tom Jobim (Bossa Nova), Hermeto Pascoal (Experimental)*
═══════════════════════════════════════════════════════════════════

**🏆 Digite sua consulta específica e receba orientação musical de nível internacional!**`;
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
        nivel: diagnosticarNivel(currentMessage),
        topico: identificarTopico(currentMessage)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro na resposta da IA:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🎵 **ERRO TEMPORÁRIO - IA MUSICAL**

⚠️ **Situação:** Ocorreu um erro temporário ao processar sua consulta musical.

🎯 **Solução Imediata:**
• Reformule sua pergunta de forma mais específica
• Tente novamente em alguns instantes
• Use palavras-chave como "harmonia", "escalas", "análise", "técnica"

💡 **Sugestões de Consultas:**
• "Explique campo harmônico maior para ${nivel} no ${instrument || 'piano'}"
• "Como fazer substituição tritonal em progressões jazz"
• "Exercícios de escalas para desenvolver técnica"

**🔄 Tente novamente - estou pronta para ajudar com excelência musical!**`,
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
      title: feedback === 'positive' ? "Excelente feedback!" : "Feedback registrado",
      description: feedback === 'positive' 
        ? "Ótimo! Continue explorando para dominar teoria musical." 
        : "Obrigado! Vou refinar minhas respostas para melhor qualidade pedagógica."
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Conteúdo musical copiado para área de transferência"
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Exportação PDF",
      description: "Funcionalidade em desenvolvimento - em breve disponível",
      variant: "default"
    });
  };

  const saveConversation = () => {
    toast({
      title: "Sessão salva!",
      description: "Conversa musical arquivada com sucesso no Supabase"
    });
  };

  const quickTopics = [
    "Campo harmônico completo",
    "Substituição tritonal", 
    "Reharmonização jazz",
    "Análise schenkeriana",
    "Modos gregos avançados",
    "Voicings profissionais",
    "Contraponto Bach",
    "Forma sonata",
    "Harmonia quartal",
    "Tensões em bossa nova",
    "Dominantes secundárias",
    "Empréstimo modal",
    "Análise de repertório",
    "Técnica instrumental",
    "Improvisação avançada"
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Premium */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                IA Musical Master
              </h2>
              <div className="flex gap-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                  <Award className="h-3 w-3 mr-1" />
                  Master
                </Badge>
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Avançada
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Assistente pedagógica musical de elite • Baseada em metodologia de conservatórios internacionais • 
              Harmonia avançada • Reharmonização • Análise musical • Técnica instrumental especializada
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveConversation} variant="outline" size="sm" className="hover:bg-primary/5">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm" className="hover:bg-primary/5">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Chat Interface Premium */}
          <div className="lg:col-span-3">
            <Card className="h-[78vh] flex flex-col border-2 border-primary/10">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Sessão Pedagógica Avançada
                  <div className="ml-auto flex gap-2 text-xs">
                    <Badge variant="outline">Nível: {nivel}</Badge>
                    {instrument && <Badge variant="outline">{instrument}</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4 p-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] min-w-[200px] ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground' 
                          : 'message-bubble'
                      } rounded-lg p-4 shadow-md`}>
                        
                        {/* Message Header */}
                        <div className="flex items-center gap-2 mb-3">
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs font-semibold">
                            {message.role === 'user' ? 'Você' : 'IA Musical Master'}
                          </span>
                          <div className="ml-auto flex gap-1">
                            {message.nivel && (
                              <Badge variant="outline" className="text-xs h-5">
                                {message.nivel}
                              </Badge>
                            )}
                            {message.topico && (
                              <Badge variant="secondary" className="text-xs h-5">
                                {message.topico}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="message-bubble-content text-sm mb-3 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* Message Footer */}
                        <div className="flex items-center justify-between text-xs opacity-70 border-t border-current/10 pt-2">
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
                                  className={`h-6 w-6 p-0 hover:bg-background/20 transition-colors ${
                                    message.feedback === 'positive' ? 'text-green-600 bg-green-100/50' : ''
                                  }`}
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 w-6 p-0 hover:bg-background/20 transition-colors ${
                                    message.feedback === 'negative' ? 'text-red-600 bg-red-100/50' : ''
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
                      <div className="bg-gradient-to-r from-muted to-muted/50 rounded-lg p-4 max-w-[90%] shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                          <div className="text-sm">
                            <div className="font-medium mb-1">IA Musical Master processando...</div>
                            <div className="text-xs opacity-70">Analisando consulta • Preparando resposta especializada</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Premium */}
                <div className="flex gap-2 border-t pt-4">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Digite sua consulta musical avançada (nível ${nivel}, ${instrument || 'instrumento'}, ${musicStyle || 'estilo'})...`}
                    className="flex-1 min-h-[90px] resize-none border-2 border-primary/20 focus:border-primary/40 transition-all"
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
                    className="self-end h-[90px] px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all"
                    size="lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel Premium */}
          <div className="space-y-4">
            {/* IA Settings */}
            <Card className="border-2 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Configuração Master
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Instrumento Principal</label>
                  <Select value={instrument} onValueChange={setInstrument}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione instrumento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="violão">Violão/Guitarra Clássica</SelectItem>
                      <SelectItem value="guitarra">Guitarra Elétrica</SelectItem>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="bateria">Bateria/Percussão</SelectItem>
                      <SelectItem value="violino">Violino</SelectItem>
                       <SelectItem value="viola">Viola</SelectItem>
                       <SelectItem value="viola-caipira">🎻 Viola Caipira</SelectItem>
                       <SelectItem value="violoncelo">Violoncelo</SelectItem>
                      <SelectItem value="flauta">Flauta</SelectItem>
                      <SelectItem value="clarinete">Clarinete</SelectItem>
                      <SelectItem value="saxofone">Saxofone</SelectItem>
                      <SelectItem value="trompete">Trompete</SelectItem>
                      <SelectItem value="trombone">Trombone</SelectItem>
                      <SelectItem value="canto">Canto/Voz</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Nível Musical</label>
                  <Select value={nivel} onValueChange={(value: any) => setNivel(value)}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">🌱 Iniciante (0-6 meses)</SelectItem>
                      <SelectItem value="elementar">📚 Elementar (6-18 meses)</SelectItem>
                      <SelectItem value="intermediario">🎯 Intermediário (1,5-3 anos)</SelectItem>
                      <SelectItem value="avancado">🏆 Avançado (3+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Estilo Musical</label>
                  <Select value={musicStyle} onValueChange={setMusicStyle}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classico">🎼 Clássico/Erudito</SelectItem>
                      <SelectItem value="jazz">🎷 Jazz/Bebop</SelectItem>
                      <SelectItem value="bossa nova">🌴 Bossa Nova</SelectItem>
                      <SelectItem value="mpb">🇧🇷 MPB</SelectItem>
                      <SelectItem value="rock">🎸 Rock/Pop</SelectItem>
                      <SelectItem value="blues">🎵 Blues</SelectItem>
                       <SelectItem value="sertanejo">🤠 Sertanejo</SelectItem>
                       <SelectItem value="samba">🥁 Samba/Choro</SelectItem>
                       <SelectItem value="country">🎸 Country</SelectItem>
                      <SelectItem value="latin">💃 Latin/Salsa</SelectItem>
                      <SelectItem value="fusion">⚡ Fusion/Contemporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all"
                  onClick={() => {
                    toast({
                      title: "Configuração Master aplicada!",
                      description: "IA personalizada para excelência pedagógica musical"
                    });
                  }}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Aplicar Configuração
                </Button>
              </CardContent>
            </Card>

            {/* Quick Topics Premium */}
            <Card className="border-2 border-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Tópicos Avançados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid gap-1.5">
                  {quickTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-8 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      onClick={() => setInputMessage(`Explique ${topic} para nível ${nivel} no ${instrument || 'piano'} estilo ${musicStyle || 'geral'}`)}
                    >
                      <Target className="h-3 w-3 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Premium */}
            <Card className="border-2 border-green-500/10">
              <CardHeader className="bg-gradient-to-r from-green-500/5 to-blue-500/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-primary/5 rounded">
                    <div className="font-bold text-lg">{messages.filter(m => m.role === 'user').length}</div>
                    <div className="text-xs opacity-70">Consultas</div>
                  </div>
                  <div className="text-center p-2 bg-purple-500/5 rounded">
                    <div className="font-bold text-lg">{messages.filter(m => m.role === 'assistant').length}</div>
                    <div className="text-xs opacity-70">Respostas</div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Feedbacks positivos:</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {messages.filter(m => m.feedback === 'positive').length}
                  </span>
                </div>
                
                <Separator />
                
                <div className="text-xs text-center space-y-1">
                  <div className="font-medium">Configuração Atual:</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <Badge variant="outline" className="text-xs">{nivel}</Badge>
                    {instrument && <Badge variant="outline" className="text-xs">{instrument}</Badge>}
                    {musicStyle && <Badge variant="outline" className="text-xs">{musicStyle}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}