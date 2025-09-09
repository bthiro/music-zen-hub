import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Music, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipos de compasso disponíveis
const timeSignatures = [
  { label: "2/4", beats: 2, subdivision: 4, pattern: [1, 0] },
  { label: "3/4", beats: 3, subdivision: 4, pattern: [1, 0, 0] },
  { label: "4/4", beats: 4, subdivision: 4, pattern: [1, 0, 1, 0] },
  { label: "6/8", beats: 6, subdivision: 8, pattern: [1, 0, 0, 1, 0, 0] },
  { label: "12/8", beats: 12, subdivision: 8, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0] }
];

export function MetronomeAfinador() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [timeSignature, setTimeSignature] = useState(timeSignatures[2]); // 4/4 por padrão
  const [currentBeat, setCurrentBeat] = useState(0);
  
  // Estados do afinador
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string>("");
  const [detectedFrequency, setDetectedFrequency] = useState<number>(0);
  const [cents, setCents] = useState<number>(0);
  const [isInTune, setIsInTune] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Inicializar contexto de áudio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Função para detectar a frequência fundamental usando autocorrelação
  const detectPitch = (buffer: Float32Array): number => {
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const minFreq = 80; // Frequência mínima (E2)
    const maxFreq = 2000; // Frequência máxima
    
    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.floor(sampleRate / minFreq);
    
    let bestCorrelation = 0;
    let bestPeriod = 0;
    
    // Autocorrelação
    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - period; i++) {
        correlation += buffer[i] * buffer[i + period];
      }
      
      correlation = correlation / (buffer.length - period);
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    if (bestCorrelation > 0.01 && bestPeriod > 0) {
      return sampleRate / bestPeriod;
    }
    
    return 0;
  };

  // Função para converter frequência em nome de nota e cents
  const frequencyToNote = (frequency: number): { note: string; cents: number } => {
    if (frequency <= 0) return { note: "", cents: 0 };
    
    const A4 = 440;
    const semitonesFromA = 12 * Math.log2(frequency / A4);
    const noteNumber = Math.round(semitonesFromA);
    const cents = Math.round((semitonesFromA - noteNumber) * 100);
    
    const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    const noteName = noteNames[((noteNumber % 12) + 12) % 12];
    const octave = Math.floor((noteNumber + 57) / 12);
    
    return {
      note: `${noteName}${octave}`,
      cents
    };
  };

  // Função para analisar o áudio do microfone
  const analyzeAudio = () => {
    if (!analyserRef.current || !isListening) return;
    
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    // Calcular RMS para detectar se há som suficiente
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    
    if (rms > 0.01) { // Limiar de volume mínimo
      const frequency = detectPitch(buffer);
      
      if (frequency > 0) {
        const { note, cents } = frequencyToNote(frequency);
        
        setDetectedFrequency(frequency);
        setDetectedNote(note);
        setCents(cents);
        setIsInTune(Math.abs(cents) < 10); // Considerado afinado se estiver dentro de ±10 cents
      }
    } else {
      setDetectedNote("");
      setDetectedFrequency(0);
      setCents(0);
      setIsInTune(false);
    }
    
    animationRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Iniciar/parar detecção de microfone
  const toggleMicrophone = async () => {
    if (isListening) {
      // Parar
      setIsListening(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setDetectedNote("");
      setDetectedFrequency(0);
      setCents(0);
      setIsInTune(false);
      
      toast({
        title: "Microfone desligado",
        description: "Detecção de afinação parada"
      });
    } else {
      // Iniciar
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        
        streamRef.current = stream;
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.3;
        
        source.connect(analyser);
        analyserRef.current = analyser;
        
        setIsListening(true);
        analyzeAudio();
        
        toast({
          title: "Microfone ativo",
          description: "Toque uma nota para verificar a afinação"
        });
      } catch (error) {
        console.error('Erro ao acessar microfone:', error);
        toast({
          title: "Erro no microfone",
          description: "Verifique as permissões do navegador",
          variant: "destructive"
        });
      }
    }
  };

  const playClick = (isAccent = false) => {
    if (!audioContextRef.current || isMuted) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Tom mais agudo para tempo forte (acento)
    oscillator.frequency.setValueAtTime(isAccent ? 1000 : 800, context.currentTime);
    gainNode.gain.setValueAtTime((volume / 100) * (isAccent ? 1.2 : 1), context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      const interval = 60000 / bpm; // Converter BPM para millisegundos
      let beat = 0;
      
      // Tocar primeiro beat
      const isAccent = timeSignature.pattern[beat] === 1;
      playClick(isAccent);
      setCurrentBeat(beat);
      
      intervalRef.current = setInterval(() => {
        beat = (beat + 1) % timeSignature.beats;
        const isAccent = timeSignature.pattern[beat] === 1;
        playClick(isAccent);
        setCurrentBeat(beat);
      }, interval);
      
      setIsPlaying(true);
      
      toast({
        title: "Metrônomo iniciado",
        description: `Tocando em ${bpm} BPM - ${timeSignature.label}`
      });
    }
  };

  // Atualizar intervalo quando BPM ou compasso muda
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const interval = 60000 / bpm;
      let beat = currentBeat;
      
      intervalRef.current = setInterval(() => {
        beat = (beat + 1) % timeSignature.beats;
        const isAccent = timeSignature.pattern[beat] === 1;
        playClick(isAccent);
        setCurrentBeat(beat);
      }, interval);
    }
  }, [bpm, timeSignature, isPlaying]);

  // Afinador básico com frequências das notas
  const notes = [
    { name: "C", frequency: 261.63 },
    { name: "C#", frequency: 277.18 },
    { name: "D", frequency: 293.66 },
    { name: "D#", frequency: 311.13 },
    { name: "E", frequency: 329.63 },
    { name: "F", frequency: 349.23 },
    { name: "F#", frequency: 369.99 },
    { name: "G", frequency: 392.00 },
    { name: "G#", frequency: 415.30 },
    { name: "A", frequency: 440.00 },
    { name: "A#", frequency: 466.16 },
    { name: "B", frequency: 493.88 }
  ];

  const playNote = (frequency: number, noteName: string) => {
    if (!audioContextRef.current || isMuted) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(volume / 100, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 1);

    toast({
      title: `Nota ${noteName}`,
      description: `${frequency.toFixed(2)} Hz`
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Metrônomo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎵 Metrônomo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{bpm}</div>
            <div className="text-sm text-muted-foreground">BPM</div>
            <div className="text-lg font-semibold text-primary mt-2">{timeSignature.label}</div>
          </div>

          {/* Indicador visual de compasso */}
          <div className="flex justify-center gap-2 mb-4">
            {timeSignature.pattern.map((accent, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  index === currentBeat
                    ? accent === 1 
                      ? 'bg-red-500 border-red-500 scale-125' 
                      : 'bg-blue-500 border-blue-500 scale-125'
                    : accent === 1
                      ? 'border-red-300 bg-red-100'
                      : 'border-gray-300 bg-gray-100'
                }`}
                title={accent === 1 ? 'Tempo forte' : 'Tempo fraco'}
              />
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fórmula de Compasso</label>
            <select
              value={timeSignature.label}
              onChange={(e) => {
                const newSignature = timeSignatures.find(ts => ts.label === e.target.value);
                if (newSignature) {
                  setTimeSignature(newSignature);
                  setCurrentBeat(0);
                }
              }}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              {timeSignatures.map((ts) => (
                <option key={ts.label} value={ts.label}>
                  {ts.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Andamento</label>
            <Slider
              value={[bpm]}
              onValueChange={(value) => setBpm(value[0])}
              min={40}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>40</span>
              <span>200</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              Volume
            </label>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              min={0}
              max={100}
              step={5}
              disabled={isMuted}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={toggleMetronome}
              className="flex-1"
              variant={isPlaying ? "destructive" : "default"}
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? "Parar" : "Iniciar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>Largo: 40-60</div>
            <div>Moderato: 80-108</div>
            <div>Allegro: 120-168</div>
            <div>Adagio: 66-76</div>
            <div>Andante: 76-108</div>
            <div>Presto: 168-200</div>
          </div>
        </CardContent>
      </Card>

      {/* Afinador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎼 Afinador Cromático
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Detecção em tempo real */}
          <div className="text-center">
            <Button
              onClick={toggleMicrophone}
              className={`mb-4 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              size="lg"
            >
              {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isListening ? "Parar Detecção" : "Iniciar Detecção"}
            </Button>
            
            {isListening && (
              <div className="bg-muted/50 rounded-lg p-6 mb-4">
                <div className="text-center">
                  {detectedNote ? (
                    <>
                      <div className={`text-6xl font-bold mb-2 ${isInTune ? 'text-green-500' : 'text-orange-500'}`}>
                        {detectedNote}
                      </div>
                      <div className="text-lg text-muted-foreground mb-2">
                        {detectedFrequency.toFixed(1)} Hz
                      </div>
                      <div className={`text-sm font-semibold ${isInTune ? 'text-green-500' : 'text-orange-500'}`}>
                        {cents > 0 ? `+${cents}` : cents} cents
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-center items-center gap-2">
                          <span className="text-xs">♭</span>
                          <div className="w-48 h-3 bg-gray-200 rounded-full relative">
                            <div 
                              className={`absolute top-0 h-full w-1 rounded-full transform -translate-x-1/2 transition-all duration-200 ${
                                isInTune ? 'bg-green-500' : Math.abs(cents) > 30 ? 'bg-red-500' : 'bg-orange-500'
                              }`}
                              style={{ 
                                left: `${Math.max(0, Math.min(100, 50 + (cents / 50) * 50))}%` 
                              }}
                            />
                            <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gray-400 transform -translate-x-1/2" />
                          </div>
                          <span className="text-xs">♯</span>
                        </div>
                        <div className={`text-xs mt-1 font-medium ${
                          isInTune ? 'text-green-500' : 'text-muted-foreground'
                        }`}>
                          {isInTune ? '✓ Afinado!' : cents < 0 ? 'Muito baixo' : 'Muito alto'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl text-muted-foreground">
                      🎵 Toque uma nota...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Referência de notas */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Notas de Referência:</h4>
            <div className="grid grid-cols-3 gap-2">
              {notes.map((note) => (
                <Button
                  key={note.name}
                  variant="outline"
                  size="sm"
                  onClick={() => playNote(note.frequency, note.name)}
                  disabled={isMuted}
                  className="aspect-square"
                >
                  {note.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>A4:</strong> 440 Hz (Padrão internacional)</div>
              <div><strong>Dica:</strong> Use fones para evitar feedback</div>
              <div><strong>Precisão:</strong> ±10 cents = afinado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}