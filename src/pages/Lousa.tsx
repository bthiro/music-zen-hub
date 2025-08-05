import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush, FabricImage, Line, Group, Text } from "fabric";
import { 
  Palette, 
  Eraser, 
  Download, 
  Share, 
  Trash2, 
  Undo2, 
  Type, 
  Circle as CircleIcon,
  Square,
  Minus,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lousa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text" | "eraser">("draw");
  const [brushSize, setBrushSize] = useState(2);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
    "#800080", "#008000", "#800000", "#808080"
  ];

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
    }
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(dataURL).then(() => {
        toast({
          title: "Link copiado!",
          description: "Link da lousa copiado para a área de transferência"
        });
      });
    }
  };

  // Função para upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro!",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande!",
        description: "Por favor, selecione uma imagem menor que 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Criar objeto FabricImage
        const fabricImg = new FabricImage(img, {
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          cornerStyle: 'circle',
          cornerColor: '#3b82f6',
          cornerSize: 8,
          transparentCorners: false,
          borderColor: '#3b82f6',
          borderScaleFactor: 2
        });

        // Ajustar tamanho se a imagem for muito grande
        const maxWidth = 400;
        const maxHeight = 300;
        if (img.width > maxWidth || img.height > maxHeight) {
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          fabricImg.scale(scale);
        }

        fabricCanvas.add(fabricImg);
        fabricCanvas.setActiveObject(fabricImg);
        fabricCanvas.renderAll();

        // Adicionar à lista de imagens carregadas
        setUploadedImages(prev => [...prev, file.name]);

        toast({
          title: "Imagem carregada!",
          description: `${file.name} foi adicionada à lousa. Você pode desenhar sobre ela!`
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Limpar o input para permitir upload da mesma imagem novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  // Função para criar pauta musical
  const createMusicalStaff = () => {
    const lines = [];
    const staffWidth = 300;
    const lineSpacing = 12;
    
    for (let i = 0; i < 5; i++) {
      const line = new Line([0, i * lineSpacing, staffWidth, i * lineSpacing], {
        stroke: '#000000',
        strokeWidth: 1,
        selectable: false,
        evented: false
      });
      lines.push(line);
    }
    
    const staff = new Group(lines, {
      left: 100,
      top: 100,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      borderColor: '#3b82f6'
    });
    
    return staff;
  };

  // Função para criar clave de sol
  const createTrebleClef = () => {
    const clef = new Text('𝄞', {
      left: 100,
      top: 80,
      fontSize: 60,
      fontFamily: 'serif',
      fill: '#000000',
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      borderColor: '#3b82f6'
    });
    
    return clef;
  };

  // Função para criar braço de instrumento
  const createInstrumentNeck = (type: string) => {
    const elements = [];
    const neckWidth = 200;
    const neckHeight = type === 'violao' ? 120 : type === 'viola' ? 100 : 80; // cavaquinho
    const strings = type === 'violao' ? 6 : type === 'viola' ? 5 : 4;
    const frets = 5;
    
    // Cordas horizontais
    for (let i = 0; i < strings; i++) {
      const stringY = (i * (neckHeight / (strings - 1)));
      const string = new Line([0, stringY, neckWidth, stringY], {
        stroke: '#666666',
        strokeWidth: type === 'viola' ? 2 : 1,
        selectable: false,
        evented: false
      });
      elements.push(string);
    }
    
    // Trastes verticais
    for (let i = 1; i <= frets; i++) {
      const fretX = (i * (neckWidth / frets));
      const fret = new Line([fretX, 0, fretX, neckHeight], {
        stroke: '#333333',
        strokeWidth: 2,
        selectable: false,
        evented: false
      });
      elements.push(fret);
    }
    
    const neck = new Group(elements, {
      left: 100,
      top: 200,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      borderColor: '#3b82f6'
    });
    
    return neck;
  };

  // Função para lidar com elementos musicais
  const handleMusicElementClick = (elementType: string) => {
    if (!fabricCanvas) return;
    
    let element;
    
    switch (elementType) {
      case 'pauta':
        element = createMusicalStaff();
        break;
      case 'clave-sol':
        element = createTrebleClef();
        break;
      case 'violao':
      case 'viola':
      case 'cavaquinho':
        element = createInstrumentNeck(elementType);
        break;
      default:
        return;
    }
    
    fabricCanvas.add(element);
    fabricCanvas.setActiveObject(element);
    fabricCanvas.renderAll();
    
    toast({
      title: "Elemento adicionado!",
      description: `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} adicionado à lousa`
    });
  };

  // Função para adicionar números de dedos
  const handleFingerNumber = (number: number) => {
    if (!fabricCanvas) return;
    
    const fingerNumber = new Circle({
      left: 150,
      top: 150,
      radius: 12,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      borderColor: '#3b82f6'
    });
    
    const text = new Text(number.toString(), {
      left: 150,
      top: 150,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#000000',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    });
    
    const group = new Group([fingerNumber, text], {
      left: 150,
      top: 150,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      borderColor: '#3b82f6'
    });
    
    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
    
    toast({
      title: "Número do dedo adicionado!",
      description: `Dedo ${number} adicionado à lousa`
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lousa Digital</h2>
          <p className="text-muted-foreground">
            Ferramenta interativa para aulas e anotações
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
                
                {/* Upload de Imagem */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Elementos Musicais */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Elementos:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMusicElementClick('pauta')}
                  className="text-xs"
                >
                  🎼 Pauta
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMusicElementClick('clave-sol')}
                  className="text-xs"
                >
                  𝄞 Clave de Sol
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMusicElementClick('violao')}
                  className="text-xs"
                >
                  🎸 Violão
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMusicElementClick('viola')}
                  className="text-xs"
                >
                  🎻 Viola
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMusicElementClick('cavaquinho')}
                  className="text-xs"
                >
                  🪕 Cavaquinho
                </Button>
              </div>

              {/* Números dos Dedos */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Dedos:</span>
                {[1, 2, 3, 4].map((num) => (
                  <Button
                    key={num}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFingerNumber(num)}
                    className="text-xs w-8 h-8 p-0 rounded-full"
                  >
                    {num}
                  </Button>
                ))}
              </div>

              {/* Color Palette */}
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      activeColor === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                  />
                ))}
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => setActiveColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
              </div>

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
            {uploadedImages.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-blue-800">Imagens carregadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((imageName, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      📎 {imageName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar a Lousa Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Ferramentas Básicas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Selecionar:</strong> Mova e edite objetos</li>
                  <li>• <strong>Desenhar:</strong> Desenhe à mão livre</li>
                  <li>• <strong>Borracha:</strong> Apague partes do desenho</li>
                  <li>• <strong>Formas:</strong> Adicione retângulos e círculos</li>
                  <li>• <strong>Upload:</strong> Carregue suas próprias imagens</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Elementos Musicais:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Pauta:</strong> Linhas musicais para escrever notas</li>
                  <li>• <strong>Clave de Sol:</strong> Símbolo musical posicionável</li>
                  <li>• <strong>Violão:</strong> Braço com 6 cordas e 5 casas</li>
                  <li>• <strong>Viola:</strong> Braço com 5 pares e 5 casas</li>
                  <li>• <strong>Cavaquinho:</strong> Braço com 4 cordas e 5 casas</li>
                  <li>• <strong>Dedos 1-4:</strong> Números para digitação</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ações:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Desfazer:</strong> Remove o último elemento</li>
                  <li>• <strong>Limpar:</strong> Apaga toda a lousa</li>
                  <li>• <strong>Salvar:</strong> Download em PNG</li>
                  <li>• <strong>Compartilhar:</strong> Envie para outros apps</li>
                  <li>• <strong>Mover elementos:</strong> Arraste qualquer elemento</li>
                  <li>• <strong>Redimensionar:</strong> Arraste os cantos</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎵 Guia de Uso Musical:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                <div>
                  <p><strong>Leitura Musical:</strong></p>
                  <ul className="space-y-1 ml-2">
                    <li>1. Adicione uma pauta</li>
                    <li>2. Posicione a clave de sol</li>
                    <li>3. Desenhe notas com o lápis</li>
                    <li>4. Faça anotações explicativas</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Digitação de Instrumentos:</strong></p>
                  <ul className="space-y-1 ml-2">
                    <li>1. Adicione o braço do instrumento</li>
                    <li>2. Clique nos números de dedos (1-4)</li>
                    <li>3. Posicione nas casas corretas</li>
                    <li>4. Desenhe conexões e setas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💡 Dicas para Professores:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Preparação rápida:</strong> Monte exemplos em menos de 30 segundos</li>
                <li>• <strong>Elementos interativos:</strong> Todos os elementos podem ser movidos e redimensionados</li>
                <li>• <strong>Desenho livre:</strong> Funciona sobre todos os elementos para anotações</li>
                <li>• <strong>Aulas ao vivo:</strong> Interface otimizada para uso em tempo real</li>
                <li>• <strong>Múltiplos instrumentos:</strong> Combine diferentes braços na mesma lousa</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}