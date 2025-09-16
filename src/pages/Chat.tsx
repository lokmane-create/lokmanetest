"use client";

import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Chat = () => {
  // Placeholder for chat messages
  const messages = [
    { id: 1, sender: 'Admin', text: 'مرحباً بالجميع، تذكير باجتماع الغد الساعة 10 صباحاً.', timestamp: '10:00 AM' },
    { id: 2, sender: 'Teacher', text: 'تم استلام التذكير، شكراً.', timestamp: '10:05 AM' },
    { id: 3, sender: 'Student', text: 'هل يمكنني إرسال الواجب متأخراً؟', timestamp: '11:30 AM' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          المحادثات والرسائل
        </h3>
        <p className="text-sm text-muted-foreground">
          تواصل مع الطلاب والمعلمين والإدارة.
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b p-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            <MessageSquare className="h-6 w-6" /> محادثة عامة
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <div className="bg-muted p-3 rounded-lg max-w-[70%]">
                      <p className="text-sm">{message.text}</p>
                      <span className="block text-xs text-right mt-1 opacity-70">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <div className="flex w-full items-center space-x-2">
            <Input placeholder="اكتب رسالتك هنا..." className="flex-1" />
            <Button>
              <Send className="h-4 w-4" />
              <span className="sr-only">إرسال</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;