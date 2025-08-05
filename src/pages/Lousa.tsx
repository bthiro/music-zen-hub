import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush, FabricImage } from "fabric";
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

  // Função para carregar imagens de exemplo
  const loadSampleImage = (imageType: string) => {
    if (!fabricCanvas) return;

    const sampleImages = {
      'music-notes': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop',
      'piano': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&h=400&fit=crop',
      'guitar': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=400&fit=crop',
      'sheet-music': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=400&fit=crop'
    };

    const imageUrl = sampleImages[imageType as keyof typeof sampleImages];
    
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      img.set({
        left: 50,
        top: 50,
        scaleX: 0.4,
        scaleY: 0.4,
        cornerStyle: 'circle',
        cornerColor: '#3b82f6',
        cornerSize: 8,
        transparentCorners: false,
        borderColor: '#3b82f6',
        borderScaleFactor: 2
      });

      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();

      toast({
        title: "Imagem de exemplo carregada!",
        description: `Imagem de ${imageType.replace('-', ' ')} adicionada à lousa`
      });
    }).catch(() => {
      toast({
        title: "Erro ao carregar imagem",
        description: "Não foi possível carregar a imagem de exemplo",
        variant: "destructive"
      });
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

              {/* Imagens de Exemplo */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Exemplos:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSampleImage('music-notes')}
                  className="text-xs"
                >
                  🎵 Notas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSampleImage('piano')}
                  className="text-xs"
                >
                  🎹 Piano
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSampleImage('guitar')}
                  className="text-xs"
                >
                  🎸 Violão
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSampleImage('sheet-music')}
                  className="text-xs"
                >
                  🎼 Partitura
                </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Ferramentas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Selecionar:</strong> Mova e edite objetos</li>
                  <li>• <strong>Desenhar:</strong> Desenhe à mão livre</li>
                  <li>• <strong>Borracha:</strong> Apague partes do desenho</li>
                  <li>• <strong>Formas:</strong> Adicione retângulos e círculos</li>
                  <li>• <strong>Upload:</strong> Carregue suas próprias imagens</li>
                  <li>• <strong>Exemplos:</strong> Use imagens pré-definidas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ações:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Desfazer:</strong> Remove o último elemento</li>
                  <li>• <strong>Limpar:</strong> Apaga toda a lousa</li>
                  <li>• <strong>Salvar:</strong> Download em PNG</li>
                  <li>• <strong>Compartilhar:</strong> Envie para outros apps</li>
                  <li>• <strong>Desenhar em imagens:</strong> Selecione a imagem e desenhe por cima</li>
                  <li>• <strong>Redimensionar:</strong> Arraste os cantos das imagens</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💡 Dicas para uso com imagens:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Carregue partituras e faça anotações</li>
                <li>• Use imagens de instrumentos para explicar técnicas</li>
                <li>• Desenhe sobre acordes para mostrar posições</li>
                <li>• Limite de 5MB por imagem (JPG, PNG, GIF)</li>
                <li>• Use a ferramenta "Selecionar" para mover e redimensionar imagens</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}