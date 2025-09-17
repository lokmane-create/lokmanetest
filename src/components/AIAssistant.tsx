"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';
import { demoData } from '@/lib/fakeData';
import { format, startOfWeek, endOfWeek, subWeeks, parseISO } from 'date-fns'; // Added parseISO

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

  const generateWeeklyReport = (role: string) => {
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 0 }); // Sunday
    const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 0 });

    let report = `تقرير الأسبوع الماضي (${format(lastWeekStart, 'PPP')} - ${format(lastWeekEnd, 'PPP')}):\n\n`;

    if (role === 'Admin' || role === 'Principal') {
      // Attendance Summary
      const weekAttendance = demoData.attendanceRecords.filter(rec =>
        parseISO(rec.date) >= lastWeekStart && parseISO(rec.date) <= lastWeekEnd
      );
      const presentCount = weekAttendance.filter(rec => rec.status === 'Present').length;
      const totalCount = weekAttendance.length;
      const attendancePercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 'N/A';
      report += `ملخص الحضور: ${attendancePercentage}% حضور.\n`;

      // Finance Summary
      const weekRevenue = demoData.financeTransactions
        .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع" && parseISO(t.date) >= lastWeekStart && parseISO(t.date) <= lastWeekEnd)
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
      const weekExpenses = demoData.financeTransactions
        .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع" && parseISO(t.date) >= lastWeekStart && parseISO(t.date) <= lastWeekEnd)
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
      report += `ملخص مالي: إيرادات ${weekRevenue.toLocaleString('en-US')} د.ج، مصروفات ${weekExpenses.toLocaleString('en-US')} د.ج.\n`;

      // Top/Bottom Students (simplified for weekly)
      const studentGPAs = demoData.grades.reduce((acc: any, grade) => {
        if (!acc[grade.student_id]) acc[grade.student_id] = { totalScore: 0, totalMaxScore: 0, name: '' };
        acc[grade.student_id].totalScore += grade.score;
        acc[grade.student_id].totalMaxScore += grade.max_score;
        acc[grade.student_id].name = demoData.students.find(s => s.id === grade.student_id)?.first_name + ' ' + demoData.students.find(s => s.id === grade.student_id)?.last_name;
        return acc;
      }, {});
      const studentsWithGPA = Object.values(studentGPAs).map((s: any) => ({
        name: s.name,
        gpa: s.totalMaxScore > 0 ? ((s.totalScore / s.totalMaxScore) * 100).toFixed(2) : '0.00',
      }));
      const topStudent = [...studentsWithGPA].sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa))[0];
      const bottomStudent = [...studentsWithGPA].sort((a, b) => parseFloat(a.gpa) - parseFloat(b.gpa))[0];
      if (topStudent) report += `أفضل طالب: ${topStudent.name} (${topStudent.gpa}%).\n`;
      if (bottomStudent) report += `أقل طالب أداءً: ${bottomStudent.name} (${bottomStudent.gpa}%).\n`;

    } else if (role === 'Teacher') {
      // Teacher-specific report (e.g., their classes' attendance)
      const teacherClasses = demoData.classes.filter(cls => cls.teachers?.first_name === user?.user_metadata?.first_name && cls.teachers?.last_name === user?.user_metadata?.last_name);
      if (teacherClasses.length > 0) {
        report += `ملخص حضور فصولك:\n`;
        teacherClasses.forEach(cls => {
          const classAttendance = demoData.attendanceRecords.filter(rec =>
            rec.class_id === cls.id && parseISO(rec.date) >= lastWeekStart && parseISO(rec.date) <= lastWeekEnd
          );
          const presentCount = classAttendance.filter(rec => rec.status === 'Present').length;
          const totalCount = classAttendance.length;
          const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 'N/A';
          report += `- ${cls.name}: ${percentage}% حضور.\n`;
        });
      } else {
        report += `لا توجد بيانات حضور لفصولك الأسبوع الماضي.\n`;
      }
    } else if (role === 'Student' || role === 'Parent') {
      // Student/Parent specific report (e.g., child's attendance/grades)
      const targetStudent = role === 'Student' ? demoData.students.find(s => s.email === user?.email) : demoData.students.find(s => s.parent_name.includes(user?.user_metadata?.first_name || ''));
      if (targetStudent) {
        const studentAttendance = demoData.attendanceRecords.filter(rec =>
          rec.student_id === targetStudent.id && parseISO(rec.date) >= lastWeekStart && parseISO(rec.date) <= lastWeekEnd
        );
        const presentCount = studentAttendance.filter(rec => rec.status === 'Present').length;
        const totalCount = studentAttendance.length;
        const attendancePercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 'N/A';
        report += `حضور ${targetStudent.first_name} ${targetStudent.last_name}: ${attendancePercentage}% حضور.\n`;

        const studentGrades = demoData.grades.filter(grade => grade.student_id === targetStudent.id);
        const totalScore = studentGrades.reduce((sum, g) => sum + g.score, 0);
        const totalMaxScore = studentGrades.reduce((sum, g) => sum + g.max_score, 0);
        const avgGrade = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 'N/A';
        report += `متوسط درجات ${targetStudent.first_name}: ${avgGrade}%.\n`;
      } else {
        report += `لا توجد بيانات متاحة للطالب.\n`;
      }
    }
    return report;
  };

  const rolePolicies = {
    Admin: {
      allowedData: ["all_students", "all_teachers", "financials", "hr_records", "system_logs", "all_grades", "all_attendance", "all_classes", "all_subjects", "all_schedules", "online_classes", "library_items", "gamification"],
      allowedActions: ["generate_reports", "export_all", "configure_system", "issue_notifications", "create_accounts", "manage_users", "schedule_online_classes", "upload_library_items"],
      examples: [
        { input: "انشئ تقرير حضور شهري مفصل وارفقه كـ PDF", assistant: "سأنشئ تقرير حضور شهري مفصل لجميع الصفوف وإرفاقه كـ PDF. هل تريد تضمين تفاصيل الطلاب (الأسماء، أرقام الهوية) أم ملخصًا تجميعيًا فقط؟" },
        { input: "أعطني ملخص مالي لهذا الشهر", assistant: "إليك ملخص الإيرادات مقابل المصروفات للشهر الجاري: 45,000 د.ج - المصروفات: 27,200 د.ج. صافي: 17,800 د.ج. هل ترغب في تفصيل الفواتير؟" },
        { input: "كم عدد الطلاب في المدرسة؟", assistant: `يوجد حالياً ${demoData.students.length} طالب في المدرسة.` },
        { input: "جدول حصة مباشرة", assistant: "بالتأكيد، ما هي تفاصيل الحصة المباشرة التي تود جدولتها؟ (المادة، المعلم، الوقت، المنصة)" },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Admin') },
      ],
      tone: "formal, strategic and data-driven"
    },
    Principal: {
      allowedData: ["all_students", "all_teachers", "aggregate_financials", "all_grades", "all_attendance", "all_classes", "all_subjects", "all_schedules", "online_classes", "library_items", "gamification"],
      allowedActions: ["generate_reports", "view_dashboards", "issue_school_notifications", "schedule_online_classes"],
      examples: [
        { input: "أعطني إحصائيات الأداء العام لكل الصفوف.", assistant: "جاري تجميع إحصائيات الأداء العام لجميع الصفوف. سأقدم لك ملخصاً شاملاً." },
        { input: "من هم أفضل المعلمين في نسبة الحضور؟", assistant: "جاري تحليل بيانات حضور المعلمين لتحديد الأفضل. سأعرض لك النتائج قريباً." },
        { input: "كم عدد المعلمين لدينا؟", assistant: `لدينا ${demoData.teachers.length} معلم في المدرسة.` },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Principal') },
      ],
      tone: "formal, high-level and advisory"
    },
    Teacher: {
      allowedData: ["class_students", "class_attendance", "class_grades", "own_schedule", "online_classes_for_my_classes", "library_items_for_my_subjects"],
      allowedActions: ["enter_grades", "record_attendance", "message_students", "request_reports_for_class", "schedule_online_classes", "upload_library_items"],
      examples: [
        { input: "من تغيب اليوم من صفي؟", assistant: "اليوم غاب عن صفك 3 طلاب: رامي نبيل، مريم سالم، وسلمان حسين. هل تريد إرسال تذكير عبر الرسائل لهم أو لولي أمرهم؟" },
        { input: "اعطني تقرير درجات صف 1", assistant: "متوسط صف 1 في آخر اختبار هو 78.6. عدد الطلاب تحت 60: 4. هل تريد تفصيل لكل طالب أو تلخيص نقاط الضعف حسب المادة؟" },
        { input: "ما هو جدولي لهذا الأسبوع؟", assistant: "جدولك لهذا الأسبوع يتضمن حصص الرياضيات للصفوف 7 و 8 يومي الإثنين والأربعاء، وحصة العلوم للصف 9 يوم الثلاثاء." },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Teacher') },
      ],
      tone: "helpful, concise and operational"
    },
    Student: {
      allowedData: ["own_grades", "own_attendance", "own_schedule", "online_classes_for_my_classes", "library_items_for_my_grades", "my_gamification_score"],
      allowedActions: ["view_grades", "view_schedule", "message_teachers", "join_online_classes", "access_library_resources", "view_leaderboard"],
      examples: [
        { input: "ما درجتي في آخر اختبار؟", assistant: "درجتك في آخر اختبار: 84. متوسط الصف: 78.6. إذا رغبت، أستطيع إظهار تمارين مراجعة لتحسين المهارات الضعيفة." },
        { input: "كم نسبة حضوري هذا الفصل؟", assistant: "نسبة حضورك هذا الفصل هي 92%. مبروك — أنت ضمن الفئة الأعلى حضوراً." },
        { input: "أرني جدولي الدراسي.", assistant: "جدولك الدراسي ليوم الإثنين هو: حصة الرياضيات الساعة 9:00 صباحاً، وحصة اللغة العربية الساعة 11:00 صباحاً." },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Student') },
      ],
      tone: "simple, encouraging and supportive"
    },
    Accountant: {
      allowedData: ["financials", "invoices", "payroll"],
      allowedActions: ["create_invoices", "export_financial_reports", "view_payroll", "generate_payroll"],
      examples: [
        { input: "أرني الفواتير المستحقة.", assistant: "جاري استعراض الفواتير المستحقة. سأعرض لك قائمة بها مع تواريخ الاستحقاق." },
        { input: "توليد تقرير مصروفات الشهر الماضي.", assistant: "بالتأكيد، جاري توليد تقرير المصروفات للشهر الماضي. هل تريد تصديره كـ Excel؟" },
        { input: "كم إجمالي الرواتب الشهرية؟", assistant: `إجمالي الرواتب الشهرية هو ${demoData.hrStaff.reduce((sum, member) => sum + parseFloat(member.salary.replace(' د.ج', '')), 0).toLocaleString('en-US')} د.ج.` },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Accountant') },
      ],
      tone: "precise and accounting-focused"
    },
    HR: {
      allowedData: ["staff_records", "payroll"],
      allowedActions: ["manage_staff", "view_payroll", "onboard_new_staff", "generate_payroll"],
      examples: [
        { input: "كم عدد الموظفين الحاليين؟", assistant: `عدد الموظفين الحاليين هو ${demoData.hrStaff.length} موظفاً. هل تريد تفصيلاً حسب القسم؟` },
        { input: "عرض رواتب المعلمين.", assistant: "جاري عرض بيانات رواتب المعلمين. هل تريد تصفية حسب التخصص؟" },
        { input: "أرني قائمة الموظفين الجدد.", assistant: "جاري استعراض قائمة الموظفين الجدد الذين تم تعيينهم في آخر 3 أشهر." },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('HR') },
      ],
      tone: "professional and process-focused"
    },
    Parent: {
      allowedData: ["child_grades", "child_attendance", "child_schedule", "online_classes_for_child", "library_items_for_child_grades", "child_gamification_score"],
      allowedActions: ["view_child_progress", "message_teachers", "join_child_online_classes", "access_library_resources_for_child"],
      examples: [
        { input: "ما درجات ابني/ابنتي؟", assistant: "يرجى تحديد اسم طفلك. بعد ذلك، سأعرض لك درجاته في آخر الاختبارات." },
        { input: "كم نسبة حضور ابني/ابنتي؟", assistant: "يرجى تحديد اسم طفلك. سأقوم بالتحقق من سجلات حضوره." },
        { input: "أرني تقريري الأسبوعي", assistant: generateWeeklyReport('Parent') },
      ],
      tone: "supportive and informative"
    }
  };

  const simulateAIResponse = (userMessage: string): string => {
    const normalizedUserRole = userRole; // userRole is already capitalized
    const roleConfig = rolePolicies[normalizedUserRole as keyof typeof rolePolicies];

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

    // Check for weekly report request
    if (lowerCaseMessage.includes("تقريري الأسبوعي") || lowerCaseMessage.includes("تقرير أسبوعي")) {
      return generateWeeklyReport(normalizedUserRole);
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
    if (lowerCaseMessage.includes("حصة مباشرة") || lowerCaseMessage.includes("اجتماع عبر الإنترنت") && roleConfig.allowedData.includes("online_classes")) {
      return "هل تود جدولة حصة جديدة، أو الانضمام إلى حصة قادمة، أو مراجعة التسجيلات؟";
    }
    if (lowerCaseMessage.includes("مكتبة") || lowerCaseMessage.includes("موارد") && roleConfig.allowedData.includes("library_items")) {
      return "ما نوع الموارد التي تبحث عنها في المكتبة؟";
    }
    if (lowerCaseMessage.includes("ألعاب") || lowerCaseMessage.includes("مكافآت") || lowerCaseMessage.includes("لوحة المتصدرين") && roleConfig.allowedData.includes("gamification")) {
      return "هل تود عرض لوحة المتصدرين، أو شارات الإنجاز، أو نقاطك؟";
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