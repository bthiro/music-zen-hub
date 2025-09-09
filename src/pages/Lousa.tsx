import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush, FabricText, Line, Group } from "fabric";
import { 
  Eraser, 
  Download, 
  Share, 
  Trash2, 
  Undo2, 
  Type, 
  Circle as CircleIcon,
  Square,
  Music,
  Stamp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MusicStamps } from "@/components/MusicStamps";
import { ColorPicker } from "@/components/ColorPicker";

export default function Lousa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text" | "eraser" | "stamps">("draw");
  const [brushSize, setBrushSize] = useState(2);
  const [showStamps, setShowStamps] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Configure drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);
    toast({
      title: "Lousa digital pronta!",
      description: "Comece a desenhar!"
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw" || activeTool === "eraser";
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === "eraser" ? "#ffffff" : activeColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === "eraser" ? brushSize * 3 : brushSize;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: brushSize,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: brushSize,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "text") {
      const text = new FabricText("Digite aqui", {
        left: 100,
        top: 100,
        fontFamily: "Arial",
        fontSize: 20,
        fill: activeColor,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    } else if (tool === "stamps") {
      setShowStamps(!showStamps);
    }
  };

  // Função para criar pauta musical
  const createStaff = (staffData: any) => {
    const lines: Line[] = [];
    const spacing = 15;
    const startY = 100;
    const width = staffData.width || 400;

    // Criar 5 linhas da pauta
    for (let i = 0; i < 5; i++) {
      const line = new Line([50, startY + (i * spacing), 50 + width, startY + (i * spacing)], {
        stroke: activeColor,
        strokeWidth: 1,
      });
      lines.push(line);
    }

    // Linhas de compasso (divisórias)
    const measureWidth = width / staffData.measures;
    for (let i = 0; i <= staffData.measures; i++) {
      const x = 50 + (i * measureWidth);
      const line = new Line([x, startY, x, startY + (4 * spacing)], {
        stroke: activeColor,
        strokeWidth: i === 0 || i === staffData.measures ? 3 : 1,
      });
      lines.push(line);
    }

    const staff = new Group(lines, {
      selectable: true,
      left: 50,
      top: startY,
    });

    fabricCanvas?.add(staff);
  };

  // Função para criar claves
  const createClef = (clefData: any) => {
    const clefSymbols = {
      treble: "𝄞",
      bass: "𝄢", 
      alto: "𝄡"
    };

    const clef = new FabricText(clefSymbols[clefData.type as keyof typeof clefSymbols] || "𝄞", {
      left: 60,
      top: 85,
      fontSize: 60,
      fill: activeColor,
      fontFamily: "Times New Roman"
    });

    fabricCanvas?.add(clef);
  };

  // Função para criar figuras musicais
  const createNote = (noteData: any) => {
    const noteSymbols = {
      whole: "𝅝",
      half: "𝅗𝅥",
      quarter: "♩",
      eighth: "♪",
      sixteenth: "𝅘𝅥𝅯"
    };

    const note = new FabricText(noteSymbols[noteData.type as keyof typeof noteSymbols] || "♩", {
      left: 150,
      top: 100,
      fontSize: 30,
      fill: activeColor,
      fontFamily: "Times New Roman"
    });

    fabricCanvas?.add(note);
  };

  // Função para criar braços de instrumentos
  const createFretboard = (fretboardData: any) => {
    const lines: Line[] = [];
    const fretSpacing = 40;
    const stringSpacing = 15;
    const startX = 100;
    const startY = 200;
    const { strings, frets } = fretboardData;

    // Cordas (linhas horizontais)
    for (let i = 0; i < strings; i++) {
      const line = new Line([startX, startY + (i * stringSpacing), startX + (frets * fretSpacing), startY + (i * stringSpacing)], {
        stroke: activeColor,
        strokeWidth: 2,
      });
      lines.push(line);
    }

    // Trastes (linhas verticais)
    for (let i = 0; i <= frets; i++) {
      const line = new Line([startX + (i * fretSpacing), startY, startX + (i * fretSpacing), startY + ((strings - 1) * stringSpacing)], {
        stroke: activeColor,
        strokeWidth: i === 0 ? 4 : 1,
      });
      lines.push(line);
    }

    const fretboard = new Group(lines, {
      selectable: true,
      left: startX,
      top: startY,
    });

    fabricCanvas?.add(fretboard);
  };

  // Função para criar números de digitação
  const createFingerNumber = (numberData: any) => {
    const number = new FabricText(numberData.number.toString(), {
      left: 200,
      top: 300,
      fontSize: 18,
      fill: activeColor,
      fontFamily: "Arial",
      fontWeight: "bold",
      backgroundColor: "white",
      padding: 4
    });

    fabricCanvas?.add(number);
  };

  // Função para criar letras da mão direita
  const createRightHandLetter = (letterData: any) => {
    const letter = new FabricText(letterData.letter, {
      left: 250,
      top: 300,
      fontSize: 18,
      fill: activeColor,
      fontFamily: "Arial",
      fontStyle: "italic",
      fontWeight: "bold"
    });

    fabricCanvas?.add(letter);
  };

  const handleStampSelect = (stampType: string, stampData: any) => {
    if (!fabricCanvas) return;

    switch (stampType) {
      case 'staff':
        createStaff(stampData);
        break;
      case 'clef':
        createClef(stampData);
        break;
      case 'note':
        createNote(stampData);
        break;
      case 'fretboard':
        createFretboard(stampData);
        break;
      case 'fingerNumber':
        createFingerNumber(stampData);
        break;
      case 'rightHand':
        createRightHandLetter(stampData);
        break;
    }

    setShowStamps(false);
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast({
      title: "Lousa limpa!",
      description: "Conteúdo removido com sucesso"
    });
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    const link = document.createElement('a');
    link.download = `lousa_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    link.click();
    
    toast({
      title: "Lousa salva!",
      description: "Arquivo PNG baixado com sucesso"
    });
  };

  const handleShare = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL();
    
    if (navigator.share) {
      navigator.share({
        title: 'Lousa Digital',
        text: 'Confira minha criação na lousa digital!',
        url: dataURL
      });
    } else {
      navigator.clipboard.writeText(dataURL).then(() => {
        toast({
          title: "Link copiado!",
          description: "Link da lousa copiado para a área de transferência"
        });
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lousa Digital Musical</h2>
          <p className="text-muted-foreground">
            Ferramenta interativa para aulas de música com carimbos musicais
          </p>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              
              {/* Tools */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeTool === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("select")}
                >
                  Selecionar
                </Button>
                <Button
                  variant={activeTool === "draw" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("draw")}
                >
                  Desenhar
                </Button>
                <Button
                  variant={activeTool === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("text")}
                >
                  <Type className="h-4 w-4 mr-1" />
                  Texto
                </Button>
                <Button
                  variant={activeTool === "eraser" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("eraser")}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("rectangle")}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeTool === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("circle")}
                >
                  <CircleIcon className="h-4 w-4" />
                </Button>
                
                {/* Carimbos Musicais */}
                <Popover open={showStamps} onOpenChange={setShowStamps}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={showStamps ? "default" : "outline"}
                      size="sm"
                    >
                      <Music className="h-4 w-4 mr-1" />
                      Carimbos
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <MusicStamps onStampSelect={handleStampSelect} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Color Picker */}
              <ColorPicker 
                activeColor={activeColor} 
                onColorChange={setActiveColor} 
              />

              {/* Brush Size */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Espessura:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm w-8">{brushSize}px</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleUndo}>
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card>
          <CardContent className="pt-6">
            <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white">
              <canvas 
                ref={canvasRef} 
                className="max-w-full cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar a Lousa Digital Musical</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tools">Ferramentas</TabsTrigger>
                <TabsTrigger value="music">Carimbos Musicais</TabsTrigger>
                <TabsTrigger value="tips">Dicas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tools" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Ferramentas Básicas:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Selecionar:</strong> Mova e edite objetos</li>
                      <li>• <strong>Desenhar:</strong> Desenhe à mão livre</li>
                      <li>• <strong>Texto:</strong> Adicione textos editáveis</li>
                      <li>• <strong>Borracha:</strong> Apague partes do desenho</li>
                      <li>• <strong>Formas:</strong> Adicione retângulos e círculos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Ações:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Desfazer:</strong> Remove o último elemento</li>
                      <li>• <strong>Limpar:</strong> Apaga toda a lousa</li>
                      <li>• <strong>Salvar:</strong> Download em PNG</li>
                      <li>• <strong>Compartilhar:</strong> Envie para outros apps</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="music" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Elementos Musicais:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Pauta:</strong> 5 linhas com 4 compassos</li>
                      <li>• <strong>Claves:</strong> Sol, Fá e Dó</li>
                      <li>• <strong>Figuras:</strong> Semibreve, mínima, semínima, etc.</li>
                      <li>• <strong>Braços:</strong> Violão, viola, cavaquinho, bandolim</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Digitação:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <strong>Números 1-4:</strong> Digitação mão esquerda</li>
                      <li>• <strong>Letras p,i,m,a:</strong> Digitação mão direita</li>
                      <li>• <strong>Posicionamento:</strong> Arraste para posicionar</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tips" className="space-y-4">
                <div className="text-sm space-y-2">
                  <h4 className="font-semibold">💡 Dicas de Uso:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use o seletor de cores organizado para escolher a cor ideal</li>
                    <li>• Ajuste a espessura do pincel conforme necessário</li>
                    <li>• Combine carimbos musicais com desenho livre para explicações completas</li>
                    <li>• Use a ferramenta de texto para adicionar explicações e títulos</li>
                    <li>• Salve seus trabalhos regularmente em PNG</li>
                    <li>• Elementos podem ser movidos e redimensionados após serem criados</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}