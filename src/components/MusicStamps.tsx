import { Button } from "@/components/ui/button";
import { Music, Hash, Type } from "lucide-react";

interface MusicStampsProps {
  onStampSelect: (stampType: string, stampData: any) => void;
}

export function MusicStamps({ onStampSelect }: MusicStampsProps) {
  
  // Pauta musical com 5 linhas e 4 compassos
  const createStaff = () => {
    const staff = {
      type: 'staff',
      lines: 5,
      measures: 4,
      width: 400,
      height: 120
    };
    onStampSelect('staff', staff);
  };

  // Claves musicais
  const createClef = (clefType: 'treble' | 'bass' | 'alto') => {
    onStampSelect('clef', { type: clefType });
  };

  // Figuras musicais
  const createNote = (noteType: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth') => {
    onStampSelect('note', { type: noteType });
  };

  // Braços de instrumentos
  const createFretboard = (instrument: 'guitar' | 'viola' | 'cavaquinho' | 'mandolin') => {
    const fretboards = {
      guitar: { strings: 6, frets: 6, name: 'Violão' },
      viola: { strings: 5, frets: 6, name: 'Viola' },
      cavaquinho: { strings: 4, frets: 6, name: 'Cavaquinho' },
      mandolin: { strings: 4, frets: 6, name: 'Bandolim' }
    };
    onStampSelect('fretboard', fretboards[instrument]);
  };

  // Números para digitação
  const createFingerNumber = (number: 1 | 2 | 3 | 4) => {
    onStampSelect('fingerNumber', { number });
  };

  // Letras para mão direita
  const createRightHandLetter = (letter: 'p' | 'i' | 'm' | 'a') => {
    onStampSelect('rightHand', { letter });
  };

  return (
    <div className="space-y-4">
      {/* Pauta Musical */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          Pauta Musical
        </h4>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={createStaff}
            className="text-xs"
          >
            Pauta (5 linhas)
          </Button>
        </div>
      </div>

      {/* Claves */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Claves</h4>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => createClef('treble')}
            className="text-xs"
          >
            Sol
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createClef('bass')}
            className="text-xs"
          >
            Fá
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createClef('alto')}
            className="text-xs"
          >
            Dó
          </Button>
        </div>
      </div>

      {/* Figuras Musicais */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Figuras Musicais</h4>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNote('whole')}
            className="text-xs"
          >
            Semibreve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNote('half')}
            className="text-xs"
          >
            Mínima
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNote('quarter')}
            className="text-xs"
          >
            Semínima
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNote('eighth')}
            className="text-xs"
          >
            Colcheia
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNote('sixteenth')}
            className="text-xs"
          >
            Semicolcheia
          </Button>
        </div>
      </div>

      {/* Braços de Instrumentos */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Braços de Instrumentos</h4>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => createFretboard('guitar')}
            className="text-xs"
          >
            Violão (6 cordas)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createFretboard('viola')}
            className="text-xs"
          >
            Viola (5 cordas)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createFretboard('cavaquinho')}
            className="text-xs"
          >
            Cavaquinho (4 cordas)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createFretboard('mandolin')}
            className="text-xs"
          >
            Bandolim (4 cordas)
          </Button>
        </div>
      </div>

      {/* Digitação Mão Esquerda */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Digitação Mão Esquerda
        </h4>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <Button
              key={num}
              size="sm"
              variant="outline"
              onClick={() => createFingerNumber(num as 1 | 2 | 3 | 4)}
              className="text-xs w-8 h-8"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* Digitação Mão Direita */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Type className="h-4 w-4" />
          Digitação Mão Direita
        </h4>
        <div className="flex gap-2">
          {['p', 'i', 'm', 'a'].map((letter) => (
            <Button
              key={letter}
              size="sm"
              variant="outline"
              onClick={() => createRightHandLetter(letter as 'p' | 'i' | 'm' | 'a')}
              className="text-xs w-8 h-8"
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}