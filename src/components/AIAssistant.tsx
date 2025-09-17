"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';
import { demoData } from '@/lib/fakeData'; // Added missing import

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

  const defaultDenyMessage = "عذراً، ليس لديك صلاحية للوصول إلى هذه المعلومات. يمكنني إرسال طلب إذن إلى مدير النظام إذا رغبت.";
  const genericUnrecognizedMessage = "عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته أو طلب شيء آخر؟";

  const rolePolicies = {
    Admin: {
      allowedData: ["all_students", "all_teachers", "financials", "hr_records", "system_logs", "all_grades", "all_attendance", "all_classes", "all_subjects", "all_schedules"],
      allowedActions: ["generate_reports", "export_all", "configure_system", "issue_notifications", "create_accounts", "manage_users"],
      examples: [
        { input: "انشئ تقرير حضور شهري مفصل وارفقه كـ PDF", assistant: "سأنشئ تقرير حضور شهري مفصل لجميع الصفوف وإرفاقه كـ PDF. هل تريد تضمين تفاصيل الطلاب (الأسماء، أرقام الهوية) أم ملخصًا تجميعيًا فقط؟" },
        { input: "كم عدد الطلاب في المدرسة؟", assistant: `يوجد حالياً ${demoData.students.length} طالب في المدرسة.` }
      ],
      tone: "formal, strategic and data-driven"
    },
    Principal: {
      allowedData: ["all_students", "all_teachers", "aggregate_financials", "all_grades", "all_attendance", "all_classes", "all_subjects", "all_schedules"],
      allowedActions: ["generate_reports", "view_dashboards", "issue_school_notifications"],
      examples: [
        { input: "أعطني إحصائيات الأداء العام لكل الصفوف.", assistant: "جاري تجميع إحصائيات الأداء العام لجميع الصفوف. سأقدم لك ملخصاً شاملاً." },
        { input: "من هم أفضل المعلمين في نسبة الحضور؟", assistant: "جاري تحليل بيانات حضور المعلمين لتحديد الأفضل. سأعرض لك النتائج قريباً." },
        { input: "كم عدد المعلمين لدينا؟", assistant: `لدينا ${demoData.teachers.length} معلم في المدرسة.` }
      ],
      tone: "formal, high-level and advisory"
    },
    Teacher: {
      allowedData: ["class_students", "class_attendance", "class_grades", "own_schedule"],
      allowedActions: ["enter_grades", "record_attendance", "message_students", "request_reports_for_class"],
      examples: [
        { input: "من تغيب اليوم من صفي؟", assistant: "اليوم غاب عن صفك 3 طلاب: رامي نبيل، مريم سالم، وسلمان حسين. هل تريد إرسال تذكير عبر الرسائل لهم أو لولي أمرهم؟" },
        { input: "اعطني تقرير درجات صف 1", assistant: "متوسط صف 1 في آخر اختبار هو 78.6. عدد الطلاب تحت 60: 4. هل تريد تفصيل لكل طالب أو تلخيص نقاط الضعف حسب المادة؟" },
        { input: "ما هو جدولي لهذا الأسبوع؟", assistant: "جدولك لهذا الأسبوع يتضمن حصص الرياضيات للصفوف 7 و 8 يومي الإثنين والأربعاء، وحصة العلوم للصف 9 يوم الثلاثاء." }
      ],
      tone: "helpful, concise and operational"
    },
    Student: {
      allowedData: ["own_grades", "own_attendance", "own_schedule"],
      allowedActions: ["view_grades", "view_schedule", "message_teachers"],
      examples: [
        { input: "ما درجتي في آخر اختبار؟", assistant: "درجتك في آخر اختبار: 84. متوسط الصف: 78.6. إذا رغبت، أستطيع إظهار تمارين مراجعة لتحسين المهارات الضعيفة." },
        { input: "كم نسبة حضوري هذا الفصل؟", assistant: "نسبة حضورك هذا الفصل هي 92%. مبروك — أنت ضمن الفئة الأعلى حضوراً." },
        { input: "أرني جدولي الدراسي.", assistant: "جدولك الدراسي ليوم الإثنين هو: حصة الرياضيات الساعة 9:00 صباحاً، وحصة اللغة العربية الساعة 11:00 صباحاً." }
      ],
      tone: "simple, encouraging and supportive"
    },
    Accountant: {
      allowedData: ["financials", "invoices"],
      allowedActions: ["create_invoices", "export_financial_reports", "view_payroll"],
      examples: [
        { input: "أرني الفواتير المستحقة.", assistant: "جاري استعراض الفواتير المستحقة. سأعرض لك قائمة بها مع تواريخ الاستحقاق." },
        { input: "توليد تقرير مصروفات الشهر الماضي.", assistant: "بالتأكيد، جاري توليد تقرير المصروفات للشهر الماضي. هل تريد تصديره كـ Excel؟" },
        { input: "كم إجمالي الرواتب الشهرية؟", assistant: `إجمالي الرواتب الشهرية هو ${demoData.hrStaff.reduce((sum, member) => sum + parseFloat(member.salary.replace(' د.ج', '')), 0).toLocaleString('en-US')} د.ج.` }
      ],
      tone: "precise and accounting-focused"
    },
    HR: {
      allowedData: ["staff_records", "payroll"],
      allowedActions: ["manage_staff", "view_payroll", "onboard_new_staff"],
      examples: [
        { input: "كم عدد الموظفين الحاليين؟", assistant: `عدد الموظفين الحاليين هو ${demoData.hrStaff.length} موظفاً. هل تريد تفصيلاً حسب القسم؟` },
        { input: "عرض رواتب المعلمين.", assistant: "جاري عرض بيانات رواتب المعلمين. هل تريد تصفية حسب التخصص؟" },
        { input: "أرني قائمة الموظفين الجدد.", assistant: "جاري استعراض قائمة الموظفين الجدد الذين تم تعيينهم في آخر 3 أشهر." }
      ],
      tone: "professional and process-focused"
    },
    Parent: {
      allowedData: ["child_grades", "child_attendance", "child_schedule"],
      allowedActions: ["view_child_progress", "message_teachers"],
      examples: [
        { input: "ما درجات ابني/ابنتي؟", assistant: "يرجى تحديد اسم طفلك. بعد ذلك، سأعرض لك درجاته في آخر الاختبارات." },
        { input: "كم نسبة حضور ابني/ابنتي؟", assistant: "يرجى تحديد اسم طفلك. سأقوم بالتحقق من سجلات حضوره." }
      ],
      tone: "supportive and informative"
    }
  };

  const simulateAIResponse = (userMessage: string): string => {
    const normalizedUserRole = userRole?.toLowerCase();
    const roleConfig = rolePolicies[userRole as keyof typeof rolePolicies];

    if (!roleConfig) {
      return defaultDenyMessage;
    }

    const lowerCaseMessage = userMessage.toLowerCase();

    // Check for specific examples
    for (const example of roleConfig.examples) {
      if (lowerCaseMessage.includes(example.input.toLowerCase().replace('.', ''))) {
        return example.assistant;
      }
    }

    // Generic responses based on allowed actions and data
    if (lowerCaseMessage.includes("تقرير") && roleConfig.allowedActions.includes("generate_reports")) {
      return "بالتأكيد، ما نوع التقرير الذي تود توليده؟";
    }
    if (lowerCaseMessage.includes("درجات") && (roleConfig.allowedData.includes("own_grades") || roleConfig.allowedData.includes("class_grades") || roleConfig.allowedData.includes("all_grades") || roleConfig.allowedData.includes("child_grades"))) {
      return "هل تود معرفة درجاتك الخاصة، درجات صف معين، أم درجات طفلك؟";
    }
    if (lowerCaseMessage.includes("حضور") && (roleConfig.allowedData.includes("own_attendance") || roleConfig.allowedData.includes("class_attendance") || roleConfig.allowedData.includes("all_attendance") || roleConfig.allowedData.includes("child_attendance"))) {
      return "ماذا تود أن تعرف عن الحضور؟";
    }
    if (lowerCaseMessage.includes("مالي") && roleConfig.allowedData.includes("financials")) {
      return "ما المعلومات المالية التي تبحث عنها؟";
    }
    if (lowerCaseMessage.includes("موظفين") && roleConfig.allowedData.includes("staff_records")) {
      return "ماذا تود أن تعرف عن الموظفين؟";
    }
    if (lowerCaseMessage.includes("جدولي") && (roleConfig.allowedData.includes("own_schedule") || roleConfig.allowedData.includes("all_schedules") || roleConfig.allowedData.includes("child_schedule"))) {
      return "هل تود معرفة جدولك الدراسي، جدول صف معين، أم جدول طفلك؟";
    }
    if (lowerCaseMessage.includes("مساعدة") || lowerCaseMessage.includes("كيف أستخدمك")) {
      return `أهلاً بك! أنا مساعدك الذكي في نظام إدارة المدرسة. بصفتك ${userRole}، يمكنك أن تسألني عن: ${roleConfig.examples.map(e => `"${e.input}"`).join(', ')}.`;
    }

    // Default denial if no specific match and unauthorized data/action is implied
    const sensitiveKeywords = ["مالي", "رواتب", "عقود", "موظفين", "بيانات داخلية"];
    const isSensitiveQuery = sensitiveKeywords.some(keyword => lowerCaseMessage.includes(keyword));

    if (isSensitiveQuery && !roleConfig.allowedData.includes("financials") && !roleConfig.allowedData.includes("hr_records")) {
      return defaultDenyMessage;
    }

    return genericUnrecognizedMessage;
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
                {userRole && rolePolicies[userRole as keyof typeof rolePolicies] && (
                  <p className="mt-2 text-sm">
                    بصفتك {userRole}، يمكنك أن تسألني عن أمثلة مثل:
                    <ul className="list-disc list-inside mt-1 text-left mx-auto max-w-xs">
                      {rolePolicies[userRole as keyof typeof rolePolicies].examples.map((ex, i) => (
                        <li key={i}>{ex.input}</li>
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