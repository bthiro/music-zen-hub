import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MetronomeAfinador() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = () => {
    if (!audioContextRef.current || isMuted) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(800, context.currentTime);
    gainNode.gain.setValueAtTime(volume / 100, context.currentTime);
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
    } else {
      const interval = 60000 / bpm; // Converter BPM para millisegundos
      playClick(); // Tocar imediatamente
      intervalRef.current = setInterval(playClick, interval);
      setIsPlaying(true);
      
      toast({
        title: "Metrônomo iniciado",
        description: `Tocando em ${bpm} BPM`
      });
    }
  };

  // Atualizar intervalo quando BPM muda
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const interval = 60000 / bpm;
      intervalRef.current = setInterval(playClick, interval);
    }
  }, [bpm, isPlaying]);

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

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Clique nas notas para ouvir a afinação de referência
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div><strong>A4:</strong> 440 Hz (Padrão internacional)</div>
            <div><strong>Dica:</strong> Use fones de ouvido para melhor precisão</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}