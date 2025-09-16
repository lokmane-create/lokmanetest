"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const denyMessage = "عذراً، ليس لديك صلاحية للوصول إلى هذه المعلومات.";

  const roleAwareness = {
    Admin: {
      permissions: [
        "view_all_students", "view_all_teachers", "view_statistics",
        "generate_reports", "access_internal_data", "strategic_recommendations"
      ],
      examples: [
        { query: "توليد تقرير شامل عن الحضور الشهري.", response: "بالتأكيد، جاري توليد تقرير الحضور الشهري الشامل. سأقوم بتسليمه لك قريباً." },
        { query: "أعطني مقارنة بين نتائج الصف الأول والصف الثاني.", response: "جاري تحليل ومقارنة نتائج الصف الأول والثاني. سأعرض لك أبرز الفروقات والتشابهات." },
        { query: "اعرض لي قائمة الطلاب ذوي الأداء المنخفض.", response: "جاري استعراض بيانات الطلاب لتحديد ذوي الأداء المنخفض. سأقدم لك القائمة مع تفاصيل إضافية." },
      ]
    },
    Principal: {
      permissions: [
        "view_all_students", "view_teachers", "generate_reports", "view_statistics"
      ],
      examples: [
        { query: "أعطني إحصائيات الأداء العام لكل الصفوف.", response: "جاري تجميع إحصائيات الأداء العام لجميع الصفوف. سأقدم لك ملخصاً شاملاً." },
        { query: "من هم أفضل المعلمين في نسبة الحضور؟", response: "جاري تحليل بيانات حضور المعلمين لتحديد الأفضل. سأعرض لك النتائج قريباً." },
      ]
    },
    Teacher: {
      permissions: [
        "view_class_students", "record_attendance", "analyze_class_performance"
      ],
      examples: [
        { query: "أعطني تقرير درجات طلاب الصف الذي أدرّسه.", response: "جاري إعداد تقرير درجات طلاب صفك. سأقدم لك التفاصيل قريباً." },
        { query: "من الطلاب الذين تغيبوا أكثر من 3 مرات؟", response: "جاري مراجعة سجلات الحضور لتحديد الطلاب الذين تغيبوا أكثر من 3 مرات في صفك." },
      ]
    },
    Student: {
      permissions: [
        "view_own_grades", "view_own_attendance", "view_schedule"
      ],
      examples: [
        { query: "أرني درجاتي في آخر اختبار.", response: "جاري استعراض درجاتك في آخر اختبار. سأعرضها لك حالما تتوفر." },
        { query: "كم نسبة حضوري حتى الآن؟", response: "جاري حساب نسبة حضورك حتى الآن. سأقدم لك الرقم قريباً." },
        { query: "ما هو جدولي للأسبوع القادم؟", response: "جاري جلب جدولك للأسبوع القادم. سأعرضه لك بالتفصيل." },
      ]
    }
  };

  const simulateAIResponse = (userMessage: string): string => {
    if (!userRole || !roleAwareness[userRole as keyof typeof roleAwareness]) {
      return denyMessage;
    }

    const roleConfig = roleAwareness[userRole as keyof typeof roleAwareness];

    // Check for specific examples
    for (const example of roleConfig.examples) {
      if (userMessage.includes(example.query.toLowerCase().replace('.', ''))) {
        return example.response;
      }
    }

    // Generic responses based on capabilities
    if (userMessage.includes("تقرير") && roleConfig.permissions.includes("generate_reports")) {
      return "بالتأكيد، ما نوع التقرير الذي تود توليده؟";
    }
    if (userMessage.includes("درجات") && (roleConfig.permissions.includes("view_own_grades") || roleConfig.permissions.includes("analyze_class_performance"))) {
      return "هل تود معرفة درجاتك الخاصة أم درجات صف معين؟";
    }
    if (userMessage.includes("حضور") && (roleConfig.permissions.includes("view_own_attendance") || roleConfig.permissions.includes("record_attendance") || roleConfig.permissions.includes("view_statistics"))) {
      return "ماذا تود أن تعرف عن الحضور؟";
    }
    if (userMessage.includes("مساعدة") || userMessage.includes("كيف أستخدمك")) {
      return `أهلاً بك! أنا مساعدك الذكي في نظام إدارة المدرسة. بصفتك ${userRole}، يمكنك أن تسألني عن: ${roleConfig.examples.map(e => `"${e.query}"`).join(', ')}.`;
    }

    // Deny if unauthorized for a specific query
    if (userMessage.includes("بيانات داخلية") && !roleConfig.permissions.includes("access_internal_data")) {
      return denyMessage;
    }

    return "عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته أو طلب شيء آخر؟";
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString() + '-user',
        text: input.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponseText = simulateAIResponse(newUserMessage.text.toLowerCase());
        const newAiMessage: Message = {
          id: Date.now().toString() + '-ai',
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newAiMessage]);
      }, 1000); // Simulate a delay for AI response
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
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader className="border-b p-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <Bot className="h-6 w-6" /> مساعد الذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>مرحباً بك! كيف يمكنني مساعدتك اليوم؟</p>
                {userRole && roleAwareness[userRole as keyof typeof roleAwareness] && (
                  <p className="mt-2 text-sm">
                    بصفتك {userRole}، يمكنك أن تسألني عن:
                    <ul className="list-disc list-inside mt-1 text-left mx-auto max-w-xs">
                      {roleAwareness[userRole as keyof typeof roleAwareness].examples.map((ex, i) => (
                        <li key={i}>{ex.query}</li>
                      ))}
                    </ul>
                  </p>
                )}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && <Bot className="h-6 w-6 text-primary shrink-0" />}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    message.sender === 'user'
                      ? 'bg-user-chat-bubble text-user-chat-foreground rounded-br-none'
                      : 'bg-assistant-chat-bubble text-assistant-chat-foreground rounded-bl-none'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="block text-xs text-right mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.sender === 'user' && <UserIcon className="h-6 w-6 text-muted-foreground shrink-0" />}
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
  );
};

export default AIAssistant;