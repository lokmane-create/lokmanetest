"use client";

import React, { useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Bot, Users, ClipboardCheck, GraduationCap, DollarSign, Bell, CalendarDays } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis } from "recharts";
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { demoData } from '@/lib/fakeData';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const userFirstName = user?.user_metadata?.first_name;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Using generated demo data
  const totalStudents = demoData.students.length;
  const totalTeachers = demoData.teachers.length;
  const totalStaff = demoData.hrStaff.length; // Including teachers and other staff
  const feesCollectedMonth = demoData.financeTransactions
    .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع" && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
  const todayAttendanceCount = demoData.attendanceRecords.filter(rec => format(parseISO(rec.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && rec.status === 'Present').length;
  const upcomingExams = demoData.grades.filter(grade => isFuture(parseISO(grade.created_at))).slice(0, 3); // Simplified: using created_at as a proxy for exam date
  const recentNotifications = demoData.notifications.slice(0, 5).sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());

  // Attendance Line Chart Data (simulated for last 5 days)
  const attendanceLineData = [
    { label: "الإثنين", attendance: Math.floor(Math.random() * 10) + 90 },
    { label: "الثلاثاء", attendance: Math.floor(Math.random() * 10) + 90 },
    { label: "الأربعاء", attendance: Math.floor(Math.random() * 10) + 90 },
    { label: "الخميس", attendance: Math.floor(Math.random() * 10) + 90 },
    { label: "الجمعة", attendance: Math.floor(Math.random() * 10) + 90 },
  ];

  // Grade Pie Chart Data
  const gradeDistribution = demoData.grades.reduce((acc, grade) => {
    if (grade.score >= 85) acc.A++;
    else if (grade.score >= 70) acc.B++;
    else if (grade.score >= 50) acc.C++;
    else acc.D_E++;
    return acc;
  }, { A: 0, B: 0, C: 0, D_E: 0 });

  const gradePieData = [
    { name: `A (85-100) - ${gradeDistribution.A}`, value: gradeDistribution.A, fill: "hsl(var(--primary))" },
    { name: `B (70-84) - ${gradeDistribution.B}`, value: gradeDistribution.B, fill: "hsl(var(--secondary))" },
    { name: `C (50-69) - ${gradeDistribution.C}`, value: gradeDistribution.C, fill: "hsl(var(--accent))" },
    { name: `D/E - ${gradeDistribution.D_E}`, value: gradeDistribution.D_E, fill: "hsl(var(--destructive))" },
  ];

  // Filtered Student List for Dashboard
  const filteredStudents = demoData.students.filter(student => {
    const matchesSearch = searchTerm === '' || student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGradeFilter === 'all' || student.grade_level.toString() === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  }).slice(0, 10); // Still show first 10 of the filtered list

  const studentsTableData = filteredStudents.map(student => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
    class: `الصف ${student.grade_level}`,
    email: student.email,
    attendance: student.attendance,
    avgGrade: student.avgGrade,
  }));

  // Generate grade level options dynamically
  const gradeLevels = Array.from(new Set(demoData.students.map(s => s.grade_level))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          لوحة قيادة الإبانة
        </h3>
        <p className="text-sm text-muted-foreground">
          مخصص لإدارة المدرسة
        </p>
        <Button variant="outline" className="mt-4 flex items-center gap-2" onClick={() => showSuccess("تم فتح مساعد الذكاء الاصطناعي (محاكاة).")}>
          <Bot className="h-4 w-4" />
          تحدث مع مساعد الذكاء الاصطناعي
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">+4% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعلمين</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">+1 معلم جديد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسوم المحصلة (الشهر)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feesCollectedMonth.toLocaleString('en-US')} د.ج</div>
            <p className="text-xs text-muted-foreground">+10% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حضور اليوم</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">-2% عن الأمس</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاختبارات القادمة</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExams.length}</div>
            <p className="text-xs text-muted-foreground">في الأسبوعين القادمين</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>حضور الأسبوع (محاكاة)</CardTitle>
            <CardDescription>نسبة الحضور على مدار الأسبوع</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              attendance: {
                label: "Attendance",
                color: "hsl(var(--primary))",
              },
            }} className="aspect-video h-[250px]">
              <LineChart
                accessibilityLayer
                data={attendanceLineData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="attendance"
                  type="natural"
                  stroke="var(--color-attendance)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع الدرجات</CardTitle>
            <CardDescription>توزيع الدرجات في آخر اختبار</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            <ChartContainer config={{}} className="aspect-square h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Pie
                    data={gradePieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student List (Interactive table) */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب (تفاعلية)</CardTitle>
          <CardDescription>ابحث عن اسم الطالب أو الفصل...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="ابحث عن اسم الطالب أو الفصل..."
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={setSelectedGradeFilter} value={selectedGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                {gradeLevels.map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>
                    الصف {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => showSuccess("تم تصدير قائمة الطلاب كـ CSV (محاكاة).")}>تصدير CSV</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الصف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="text-center">الحضور %</TableHead>
                  <TableHead className="text-center">متوسط الدرجة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsTableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">لا يوجد طلاب مطابقون.</TableCell>
                  </TableRow>
                ) : (
                  studentsTableData.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-center">{student.attendance}%</TableCell>
                      <TableCell className="text-center">{student.avgGrade}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="mr-2" onClick={() => showSuccess(`عرض تفاصيل الطالب ${student.name}`)}>عرض</Button>
                        <Button variant="ghost" size="sm" onClick={() => showSuccess(`تحرير الطالب ${student.name}`)}>تحرير</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الإشعارات الأخيرة</CardTitle>
          <Button variant="outline" size="sm" onClick={() => showSuccess("تم عرض جميع الإشعارات (محاكاة).")}>
            <Bell className="mr-2 h-4 w-4" /> عرض الكل
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {recentNotifications.length === 0 ? (
              <li>لا توجد إشعارات حالياً.</li>
            ) : (
              recentNotifications.map((notification) => (
                <li key={notification.id}>
                  <strong>{notification.title}:</strong> {notification.content} (بتاريخ {format(parseISO(notification.date), 'PPP')})
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;