"use client";

import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Bot, Users, ClipboardCheck, GraduationCap, DollarSign } from 'lucide-react';
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
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const userEmail = user?.email;
  const userFirstName = user?.user_metadata?.first_name;

  // Using generated demo data
  const totalStudents = demoData.students.length;
  const totalTeachers = demoData.teachers.length;
  const totalStaff = demoData.hrStaff.length;
  const todayAttendanceCount = demoData.attendanceRecords.filter(rec => format(new Date(rec.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && rec.status === 'Present').length;
  const averageGrade = (demoData.grades.reduce((sum, grade) => sum + grade.score, 0) / demoData.grades.length).toFixed(1);
  const totalRevenueMonth = demoData.financeTransactions
    .filter(t => t.type === "رسوم دراسية" && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);

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

  // Student List for Dashboard (first 10 students)
  const studentsTableData = demoData.students.slice(0, 10).map(student => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
    class: `الصف ${student.grade_level}`,
    email: student.email,
    attendance: student.attendance,
    avgGrade: student.avgGrade,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          لوحة قيادة الإبانة
        </h3>
        <p className="text-sm text-muted-foreground">
          مخصص لإدارة المدرسة
        </p>
        <Button variant="outline" className="mt-4 flex items-center gap-2" onClick={() => { /* Logic to open AI Assistant sheet */ }}>
          <Bot className="h-4 w-4" />
          تحدث مع مساعد الذكاء الاصطناعي
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-sm font-medium">إيرادات هذا الشهر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenueMonth.toLocaleString('en-US')} د.ج</div>
            <p className="text-xs text-muted-foreground">+10% عن الشهر الماضي</p>
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

      {/* Student List (Placeholder for interactive table) */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب (تفاعلية)</CardTitle>
          <CardDescription>ابحث عن اسم الطالب أو الفصل...</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for search, filter, export */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input placeholder="ابحث عن اسم الطالب أو الفصل..." className="flex-1" />
            <select className="p-2 border rounded-md">
              <option>الجميع</option>
              <option>الصف 1</option>
              <option>الصف 2</option>
              <option>الصف 3</option>
            </select>
            <Button variant="outline">تصدير CSV</Button>
          </div>
          {/* Placeholder for table */}
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
                {studentsTableData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell className="text-center">{student.attendance}%</TableCell>
                    <TableCell className="text-center">{student.avgGrade}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="mr-2">عرض</Button>
                      <Button variant="ghost" size="sm">تحرير</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Activities and Summary */}
      <Card>
        <CardHeader>
          <CardTitle>نشاطات سريعة وملخص</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>آخر تسجيل: {format(new Date(), 'HH:mm')} مضت بواسطة مدير النظام</li>
            <li>تنبيه: غياب 3 طلاب هذا الأسبوع</li>
            <li>تذكير: إدخال درجات الفصل قبل 10 مايو</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;