"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Pen, Eraser, Highlighter, Type, Square, Circle, ArrowRight, Palette, Upload, Save
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WhiteboardToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  strokeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUploadImage: (file: File) => void;
  onSave: () => void;
}

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  onToolChange,
  strokeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUploadImage,
  onSave,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUploadImage(event.target.files[0]);
      event.target.value = ''; // Clear the input
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-background">
      <Button
        variant={activeTool === 'pen' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('pen')}
        title="قلم"
      >
        <Pen className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'highlighter' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('highlighter')}
        title="قلم تمييز"
      >
        <Highlighter className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'eraser' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('eraser')}
        title="ممحاة"
      >
        <Eraser className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'text' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('text')}
        title="نص"
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'rectangle' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('rectangle')}
        title="مستطيل"
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'circle' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('circle')}
        title="دائرة"
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={activeTool === 'arrow' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('arrow')}
        title="سهم"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="اللون">
            <Palette className="h-4 w-4" style={{ color: strokeColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded-full cursor-pointer border"
              style={{ backgroundColor: color, borderColor: color === strokeColor ? 'hsl(var(--primary))' : 'transparent', borderWidth: color === strokeColor ? '2px' : '1px' }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">السماكة:</span>
        <Slider
          value={[strokeWidth]}
          onValueChange={(val) => onStrokeWidthChange(val[0])}
          max={20}
          step={1}
          className="w-[100px]"
        />
      </div>

      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="تحميل صورة">
        <Upload className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={onSave} title="حفظ السبورة">
        <Save className="h-4 w-4 mr-2" /> حفظ
      </Button>
    </div>
  );
};

export default WhiteboardToolbar;