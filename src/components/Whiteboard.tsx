"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { showSuccess, showError } from '@/utils/toast';
import WhiteboardToolbar from './WhiteboardToolbar';
import WhiteboardControls from './WhiteboardControls';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

// Extend FabricObject to include a custom 'id' property
declare module 'fabric' {
  interface FabricObject {
    id?: string;
  }
}

interface WhiteboardProps {
  classId: string;
  sessionId: string; // Unique ID for this whiteboard session
  isTeacher: boolean;
  onSaveToLibrary: (imageUrl: string, title: string) => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ classId, sessionId, isTeacher, onSaveToLibrary }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { user } = useAuth();

  const channel = useRef(supabase.channel(`whiteboard:${sessionId}`));

  const initializeCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: '#f8f8f8',
        selection: isTeacher, // Only teacher can select/move objects
      });
      fabricCanvasRef.current = canvas;

      canvas.setHeight(600); // Fixed height for now
      canvas.setWidth(canvasRef.current.parentElement?.offsetWidth || 800); // Responsive width

      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;

      canvas.on('object:added', (e) => {
        if (e.target) {
          if (!e.target.id) {
            e.target.set('id', uuidv4()); // Assign a unique ID if not present
          }
          channel.current.send({
            type: 'broadcast',
            event: 'object_added',
            payload: e.target.toJSON(),
          });
        }
      });

      canvas.on('object:modified', (e) => {
        if (e.target) {
          channel.current.send({
            type: 'broadcast',
            event: 'object_modified',
            payload: e.target.toJSON(),
          });
        }
      });

      canvas.on('object:removed', (e) => {
        if (e.target?.id) { // Ensure object has an ID before sending
          channel.current.send({
            type: 'broadcast',
            event: 'object_removed',
            payload: { id: e.target.id },
          });
        }
      });

      canvas.on('path:created', (e) => {
        if (e.path) {
          if (!e.path.id) {
            e.path.set('id', uuidv4()); // Assign a unique ID if not present
          }
          channel.current.send({
            type: 'broadcast',
            event: 'path_created',
            payload: e.path.toJSON(),
          });
        }
      });

      // Load initial state from DB
      supabase
        .from('whiteboard_sessions')
        .select('content, collaboration_enabled')
        .eq('id', sessionId)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Error loading whiteboard session:', error);
            showError('فشل تحميل السبورة البيضاء.');
          } else if (data?.content) {
            canvas.loadFromJSON(data.content, () => {
              canvas.renderAll();
            });
            setCollaborationEnabled(data.collaboration_enabled || false);
          }
        });
    }
  }, [sessionId, strokeColor, strokeWidth, isTeacher]);

  useEffect(() => {
    initializeCanvas();

    const currentChannel = channel.current;

    currentChannel
      .on('broadcast', { event: 'object_added' }, (payload) => {
        fabric.util.enlivenObjects([payload.payload], (objects: fabric.Object[]) => { // Removed empty options object and type assertion
          objects.forEach(obj => {
            if (fabricCanvasRef.current && !fabricCanvasRef.current.getObjects().some(o => o.id === obj.id)) {
              fabricCanvasRef.current.add(obj);
            }
          });
          fabricCanvasRef.current?.renderAll();
        });
      })
      .on('broadcast', { event: 'object_modified' }, (payload) => {
        const obj = fabricCanvasRef.current?.getObjects().find(o => o.id === payload.payload.id);
        if (obj) {
          obj.set(payload.payload);
          fabricCanvasRef.current?.renderAll();
        }
      })
      .on('broadcast', { event: 'object_removed' }, (payload) => {
        const obj = fabricCanvasRef.current?.getObjects().find(o => o.id === payload.payload.id);
        if (obj) {
          fabricCanvasRef.current?.remove(obj);
          fabricCanvasRef.current?.renderAll();
        }
      })
      .on('broadcast', { event: 'path_created' }, (payload) => {
        fabric.util.enlivenObjects([payload.payload], (objects: fabric.Object[]) => { // Removed empty options object and type assertion
          objects.forEach(obj => {
            if (fabricCanvasRef.current && !fabricCanvasRef.current.getObjects().some(o => o.id === obj.id)) {
              fabricCanvasRef.current.add(obj);
            }
          });
          fabricCanvasRef.current?.renderAll();
        });
      })
      .on('broadcast', { event: 'canvas_cleared' }, () => {
        fabricCanvasRef.current?.clear();
        fabricCanvasRef.current?.renderAll();
      })
      .on('broadcast', { event: 'collaboration_toggled' }, (payload) => {
        setCollaborationEnabled(payload.payload.enabled);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.isDrawingMode = payload.payload.enabled || isTeacher;
          fabricCanvasRef.current.selection = isTeacher; // Only teacher can select/move
        }
        showSuccess(`تم ${payload.payload.enabled ? 'تمكين' : 'تعطيل'} تعاون الطلاب.`);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to whiteboard session: ${sessionId}`);
        }
      });

    return () => {
      currentChannel.unsubscribe();
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [sessionId, initializeCanvas, isTeacher]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser';
      fabricCanvasRef.current.freeDrawingBrush.color = activeTool === 'eraser' ? '#f8f8f8' : strokeColor;
      fabricCanvasRef.current.freeDrawingBrush.width = activeTool === 'eraser' ? strokeWidth * 2 : strokeWidth;
      fabricCanvasRef.current.selection = isTeacher; // Only teacher can select/move
    }
  }, [activeTool, strokeColor, strokeWidth, isTeacher]);

  const handleToolChange = (tool: string) => {
    setActiveTool(tool);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = ['pen', 'highlighter', 'eraser'].includes(tool);
      fabricCanvasRef.current.selection = isTeacher; // Only teacher can select/move
      fabricCanvasRef.current.forEachObject(obj => obj.set({ selectable: isTeacher, evented: isTeacher }));

      if (tool === 'text') {
        const text = new fabric.IText('اكتب هنا', {
          left: 50,
          top: 50,
          fill: strokeColor,
          fontSize: strokeWidth * 2,
          selectable: isTeacher,
          evented: isTeacher,
          id: uuidv4(), // Assign unique ID
        });
        fabricCanvasRef.current.add(text);
        fabricCanvasRef.current.setActiveObject(text);
        channel.current.send({
          type: 'broadcast',
          event: 'object_added',
          payload: text.toJSON(),
        });
      } else if (['rectangle', 'circle', 'arrow'].includes(tool)) {
        let shape;
        if (tool === 'rectangle') {
          shape = new fabric.Rect({
            left: 100, top: 100, width: 100, height: 50, fill: '', stroke: strokeColor, strokeWidth: strokeWidth,
            selectable: isTeacher, evented: isTeacher, id: uuidv4(), // Assign unique ID
          });
        } else if (tool === 'circle') {
          shape = new fabric.Circle({
            left: 100, top: 100, radius: 50, fill: '', stroke: strokeColor, strokeWidth: strokeWidth,
            selectable: isTeacher, evented: isTeacher, id: uuidv4(), // Assign unique ID
          });
        } else if (tool === 'arrow') {
          shape = new fabric.Line([50, 50, 150, 50], {
            stroke: strokeColor, strokeWidth: strokeWidth,
            selectable: isTeacher, evented: isTeacher, id: uuidv4(), // Assign unique ID
          });
        }
        if (shape) {
          fabricCanvasRef.current.add(shape);
          fabricCanvasRef.current.setActiveObject(shape);
          channel.current.send({
            type: 'broadcast',
            event: 'object_added',
            payload: shape.toJSON(),
          });
        }
      }
    }
  };

  const handleColorChange = (color: string) => {
    setStrokeColor(color);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.color = color;
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.width = width;
    }
  };

  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && fabricCanvasRef.current) {
        fabric.Image.fromURL(e.target.result as string, {}, (img) => { // Removed type assertion
          img.set({
            left: 50,
            top: 50,
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: isTeacher,
            evented: isTeacher,
            id: uuidv4(), // Assign unique ID
          });
          fabricCanvasRef.current?.add(img);
          fabricCanvasRef.current?.setActiveObject(img);
          channel.current.send({
            type: 'broadcast',
            event: 'object_added',
            payload: img.toJSON(),
          });
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWhiteboard = async () => {
    if (!fabricCanvasRef.current || !user?.id) {
      showError('فشل حفظ السبورة البيضاء: المستخدم غير مصادق أو السبورة فارغة.');
      return;
    }

    const canvasJson = fabricCanvasRef.current.toJSON();
    const { error: dbError } = await supabase
      .from('whiteboard_sessions')
      .upsert(
        {
          id: sessionId,
          class_id: classId,
          teacher_id: user.id,
          title: `جلسة سبورة بيضاء - ${new Date().toLocaleString()}`,
          content: canvasJson,
          collaboration_enabled: collaborationEnabled,
        },
        { onConflict: 'id' }
      );

    if (dbError) {
      showError(`فشل حفظ السبورة البيضاء في قاعدة البيانات: ${dbError.message}`);
      console.error('Error saving whiteboard to DB:', dbError);
      return;
    }

    // Simulate saving as image/PDF and to library
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: 1, // Required property
    });

    showSuccess('تم حفظ السبورة البيضاء بنجاح!');
    onSaveToLibrary(dataURL, `تسجيل سبورة بيضاء - ${new Date().toLocaleString()}`);
  };

  const handleToggleCollaboration = async (enabled: boolean) => {
    if (!isTeacher || !user?.id) return;

    setCollaborationEnabled(enabled);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = enabled || isTeacher;
      fabricCanvasRef.current.selection = isTeacher; // Only teacher can select/move
    }

    const { error } = await supabase
      .from('whiteboard_sessions')
      .update({ collaboration_enabled: enabled })
      .eq('id', sessionId);

    if (error) {
      showError(`فشل تحديث حالة التعاون: ${error.message}`);
      console.error('Error updating collaboration status:', error);
    } else {
      channel.current.send({
        type: 'broadcast',
        event: 'collaboration_toggled',
        payload: { enabled },
      });
    }
  };

  const handleAIRequest = (prompt: string) => {
    setAiLoading(true);
    setAiResponse('');
    // Simulate AI response for drawing
    setTimeout(() => {
      if (prompt.includes('مخطط لجهاز التنفس')) {
        setAiResponse('جاري إنشاء مخطط مبسط لجهاز التنفس على السبورة البيضاء...');
        // Simulate adding a simple diagram (e.g., an image)
        if (fabricCanvasRef.current) {
          fabric.Image.fromURL('/placeholder.svg', {}, (img) => { // Removed type assertion
            img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5, selectable: isTeacher, evented: isTeacher, id: uuidv4() }); // Assign unique ID
            fabricCanvasRef.current?.add(img);
            fabricCanvasRef.current?.setActiveObject(img);
            channel.current.send({
              type: 'broadcast',
              event: 'object_added',
              payload: img.toJSON(),
            });
          });
        }
      } else if (prompt.includes('اشرح لي هذا')) {
        setAiResponse('يرجى تحديد العنصر الذي تود شرحه على السبورة البيضاء.');
      } else {
        setAiResponse('عذراً، لا يمكنني إنشاء هذا الرسم حالياً. يمكنني شرح المفاهيم أو الإجابة على الأسئلة.');
      }
      setAiLoading(false);
    }, 2000);
  };

  return (
    <Card className="flex flex-col h-full">
      <WhiteboardToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        strokeColor={strokeColor}
        onColorChange={handleColorChange}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
        onUploadImage={handleUploadImage}
        onSave={handleSaveWhiteboard}
      />
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <canvas ref={canvasRef} className="border" />
        </ScrollArea>
      </CardContent>
      <WhiteboardControls
        isTeacher={isTeacher}
        collaborationEnabled={collaborationEnabled}
        onToggleCollaboration={handleToggleCollaboration}
        onAIRequest={handleAIRequest}
        aiResponse={aiResponse}
        aiLoading={aiLoading}
      />
    </Card>
  );
};

export default Whiteboard;