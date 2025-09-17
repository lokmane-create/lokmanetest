"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bot, Send } from 'lucide-react';

interface WhiteboardControlsProps {
  isTeacher: boolean;
  collaborationEnabled: boolean;
  onToggleCollaboration: (enabled: boolean) => void;
  onAIRequest: (prompt: string) => void;
  aiResponse: string;
  aiLoading: boolean;
}

const WhiteboardControls: React.FC<WhiteboardControlsProps> = ({
  isTeacher,
  collaborationEnabled,
  onToggleCollaboration,
  onAIRequest,
  aiResponse,
  aiLoading,
}) => {
  const [aiPrompt, setAiPrompt] = React.useState('');

  const handleAIRequest = () => {
    if (aiPrompt.trim()) {
      onAIRequest(aiPrompt);
      setAiPrompt('');
    }
  };

  return (
    <div className="p-4 border-t bg-background space-y-4">
      {isTeacher && (
        <div className="flex items-center justify-between">
          <Label htmlFor="collaboration-mode" className="text-sm font-medium">
            تمكين تعاون الطلاب
          </Label>
          <Switch
            id="collaboration-mode"
            checked={collaborationEnabled}
            onCheckedChange={onToggleCollaboration}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ai-prompt" className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" /> مساعد الذكاء الاصطناعي
        </Label>
        <div className="flex gap-2">
          <Input
            id="ai-prompt"
            placeholder="اطلب من الذكاء الاصطناعي رسم مخطط أو شرح..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAIRequest();
              }
            }}
            disabled={aiLoading}
          />
          <Button onClick={handleAIRequest} disabled={!aiPrompt.trim() || aiLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">إرسال طلب الذكاء الاصطناعي</span>
          </Button>
        </div>
        {aiLoading && <p className="text-sm text-muted-foreground">جاري إنشاء استجابة الذكاء الاصطناعي...</p>}
        {aiResponse && (
          <div className="mt-2 p-2 bg-muted rounded-md text-sm text-foreground">
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteboardControls;