"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { demoData } from '@/lib/fakeData'; // Import demo data

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  senderRole?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(demoData.chatMessages);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "أنا (المستخدم الحالي)", // Placeholder for current user
        text: input.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderRole: "User", // Placeholder role
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput('');
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

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
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2",
                    message.senderRole === 'User' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.senderRole !== 'User' && <UserIcon className="h-6 w-6 text-muted-foreground shrink-0" />}
                  <div className="flex flex-col">
                    <span className={cn("font-semibold text-sm", message.senderRole === 'User' ? 'text-right' : 'text-left')}>{message.sender}</span>
                    <div
                      className={cn(
                        "p-3 rounded-lg max-w-[70%]",
                        message.senderRole === 'User'
                          ? 'bg-user-chat-bubble text-user-chat-foreground rounded-br-none'
                          : 'bg-assistant-chat-bubble text-assistant-chat-foreground rounded-bl-none'
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="block text-xs text-right mt-1 opacity-70">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                  {message.senderRole === 'User' && <UserIcon className="h-6 w-6 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="اكتب رسالتك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">إرسال</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;