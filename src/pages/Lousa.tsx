import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush } from "fabric";
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
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lousa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "text" | "eraser">("draw");
  const [brushSize, setBrushSize] = useState(2);
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}