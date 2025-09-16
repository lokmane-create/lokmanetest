"use client";

import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Bot, Users, ClipboardCheck, GraduationCap, DollarSign } from 'lucide-react'; // Added DollarSign
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

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const userEmail = user?.email;
  const userFirstName = user?.user_metadata?.first_name;

  // Placeholder data for charts and tables
  const attendanceLineData = {
    labels: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    series: [{ name: "حضور", data: [100, 105, 102, 104, 101] }],
  };

  const gradePieData = [
    { name: "A (85-100)", value: 20, fill: "hsl(var(--primary))" },
    { name: "B (70-84)", value: 50, fill: "hsl(var(--secondary))" },
    { name: "C (50-69)", value: 35, fill: "hsl(var(--accent))" },
    { name: "D/E", value: 15, fill: "hsl(var(--destructive))" },
  ];

  const studentsTableData = [
    { id: 1, name: "أحمد محمد", class: "الصف 1", email: "ahmed@student.local", attendance: 96, avgGrade: 88 },
    { id: 2, name: "سارة أحمد", class: "الصف 1", email: "sara@student.local", attendance: 92, avgGrade: 84 },
    { id: 3, name: "محمد علي", class: "الصف 2", email: "mohamed@student.local", attendance: 89, avgGrade: 76 },
    { id: 4, name: "فاطمة حسن", class: "الصف 2", email: "fatima@student.local", attendance: 94, avgGrade: 90 },
    { id: 5, name: "علي خالد", class: "الصف 3", email: "ali@student.local", attendance: 85, avgGrade: 70 },
    { id: 6, name: "ميساء عبد", class: "الصف 3", email: "maysa@student.local", attendance: 98, avgGrade: 92 },
    { id: 7, name: "هاجر سمير", class: "الصف 1", email: "hajar@student.local", attendance: 90, avgGrade: 79 },
    { id: 8, name: "يوسف جمال", class: "الصف 2", email: "yousef@student.local", attendance: 88, avgGrade: 73 },
    { id: 9, name: "لميس أيمن", class: "الصف 1", email: "lamees@student.local", attendance: 95, "avgGrade": 86 },
    { id: 10, name: "رامي نبيل", class: "الصف 3", email: "rami@student.local", attendance: 82, avgGrade: 68 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          لوحة القيادة
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
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">+4% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حضور اليوم</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">104</div>
            <p className="text-xs text-muted-foreground">-2% عن الأمس</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات هذا الشهر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50,000 ر.س</div>
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
                data={attendanceLineData.series[0].data.map((d, i) => ({
                  label: attendanceLineData.labels[i],
                  attendance: d,
                }))}
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
                  <TableHead>الرقم</TableHead>
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
                    <TableCell>{student.id}</TableCell>
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
            <li>آخر تسجيل: 5 دقائق مضت بواسطة مدير النظام</li>
            <li>تنبيه: غياب 3 طلاب هذا الأسبوع</li>
            <li>تذكير: إدخال درجات الفصل قبل 10 مايو</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;