import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  activeColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ activeColor, onColorChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"],
    ["#FF0000", "#FF6600", "#FFFF00", "#00FF00", "#0066FF", "#9900FF"],
    ["#FF3399", "#FF9999", "#FFCC99", "#99FF99", "#99CCFF", "#CC99FF"],
    ["#800000", "#FF8000", "#808000", "#008000", "#000080", "#800080"],
    ["#FFA500", "#FFD700", "#ADFF2F", "#00CED1", "#4169E1", "#DA70D6"]
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          <div 
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: activeColor }}
          />
          Cores
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="space-y-2">
          <div className="text-sm font-medium mb-2">Selecione uma cor:</div>
          
          {/* Paleta de cores organizadas */}
          <div className="grid gap-1">
            {colors.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                      activeColor === color ? "border-gray-800 shadow-md" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onColorChange(color);
                      setIsOpen(false);
                    }}
                    title={color}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Seletor personalizado */}
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">Cor personalizada:</div>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-8 rounded border cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}