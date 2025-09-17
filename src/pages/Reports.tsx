"use client";

import React from 'react';
import { BarChart as BarChartIcon, FileText, Download, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'; // Aliased BarChart, LineChart, PieChart
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { demoData } from '@/lib/fakeData'; // Import demo data
import { format, subWeeks, subMonths, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { showSuccess } from '@/utils/toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, Line, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, BarChart } from 'recharts'; // Added LineChart and BarChart

const Reports = () => {
  // Using generated demo data
  const availableReports = demoData.reports;

  // Simulate weekly attendance summary
  const weeklyAttendanceSummary = Array.from({ length: 4 }).map((_, i) => {
    const weekDate = subWeeks(new Date(), 3 - i);
    const weekRecords = demoData.attendanceRecords.filter(rec => isSameWeek(parseISO(rec.date), weekDate));
    const presentCount = weekRecords.filter(rec => rec.status === 'Present').length;
    const totalCount = weekRecords.length;
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
    return {
      week: `الأسبوع ${format(weekDate, 'w')}`,
      attendance: parseFloat(percentage.toFixed(1)),
    };
  });

  // Simulate monthly finance summary
  const monthlyFinanceSummary = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = subMonths(new Date(), 5 - i);
    const monthName = format(monthDate, 'MMM');
    const monthRevenue = demoData.financeTransactions
      .filter(t => t.type === "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), monthDate))
      .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
    const monthExpenses = demoData.financeTransactions
      .filter(t => t.type !== "رسوم دراسية" && t.status === "مدفوع" && isSameMonth(parseISO(t.date), monthDate))
      .reduce((sum, t) => sum + parseFloat(t.amount.replace(' د.ج', '')), 0);
    return {
      month: monthName,
      revenue: monthRevenue,
      expenses: monthExpenses,
    };
  });

  // Simulate top/bottom students (using GPA from GradesExams logic)
  const studentGPAs: { [key: string]: { totalScore: number, totalMaxScore: number, count: number, name: string } } = {};
  demoData.grades.forEach(grade => {
    if (!studentGPAs[grade.student_id]) {
      const student = demoData.students.find(s => s.id === grade.student_id);
      studentGPAs[grade.student_id] = { totalScore: 0, totalMaxScore: 0, count: 0, name: student ? `${student.first_name} ${student.last_name}` : 'N/A' };
    }
    studentGPAs[grade.student_id].totalScore += grade.score;
    studentGPAs[grade.student_id].totalMaxScore += grade.max_score;
    studentGPAs[grade.student_id].count++;
  });

  const studentsWithGPA = Object.entries(studentGPAs).map(([studentId, data]) => ({
    id: studentId,
    name: data.name,
    gpa: data.totalMaxScore > 0 ? ((data.totalScore / data.totalMaxScore) * 100).toFixed(2) : '0.00',
  }));

  const topStudents = [...studentsWithGPA].sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa)).slice(0, 3);
  const bottomStudents = [...studentsWithGPA].sort((a, b) => parseFloat(a.gpa) - parseFloat(b.gpa)).slice(0, 3);


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          التقارير والإحصاءات
        </h3>
        <p className="text-sm text-muted-foreground">
          توليد وعرض التقارير التحليلية لأداء المدرسة.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التقارير المتاحة</CardTitle>
          <CardDescription>اختر تقريراً لتوليده أو عرضه.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم التقرير</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">لا توجد تقارير متاحة.</TableCell>
                  </TableRow>
                ) : (
                  availableReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        {report.generated_at && !isNaN(new Date(report.generated_at).getTime())
                          ? format(new Date(report.generated_at), 'PPpp')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => showSuccess(`عرض تقرير: ${report.name} (محاكاة)`)}>
                          <FileText className="h-4 w-4 mr-2" /> عرض
                        </Button>
                        <Button variant="default" size="sm" onClick={() => showSuccess(`تصدير تقرير: ${report.name} (PDF/Excel) (محاكاة)`)}>
                          <Download className="h-4 w-4 mr-2" /> تصدير (PDF/Excel)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ملخص الحضور الأسبوعي</CardTitle>
          <CardDescription>متوسط نسبة الحضور على مدار الأسابيع الأربعة الماضية.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            attendance: {
              label: "Attendance",
              color: "hsl(var(--primary))",
            },
          }} className="aspect-video h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendanceSummary}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} className="text-xs" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => `${value}%`} />} />
                <Line type="monotone" dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ملخص مالي شهري</CardTitle>
          <CardDescription>الإيرادات والمصروفات على مدار الأشهر الستة الماضية.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            revenue: { label: "الإيرادات", color: "hsl(var(--primary))" },
            expenses: { label: "المصروفات", color: "hsl(var(--destructive))" },
          }} className="aspect-video h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinanceSummary}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toLocaleString('en-US')} د.ج`} className="text-xs" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => `${value.toLocaleString('en-US')} د.ج`} />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تحليل أداء الطلاب</CardTitle>
          <CardDescription>أفضل وأقل الطلاب أداءً بناءً على متوسط الدرجات.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">أفضل 3 طلاب</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {topStudents.length === 0 ? <li>لا يوجد بيانات</li> : topStudents.map((student, index) => (
                <li key={index}>{student.name} ({student.gpa})</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">أقل 3 طلاب أداءً</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {bottomStudents.length === 0 ? <li>لا يوجد بيانات</li> : bottomStudents.map((student, index) => (
                <li key={index}>{student.name} ({student.gpa})</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تقارير مخصصة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك طلب تقارير مخصصة من مساعد الذكاء الاصطناعي.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => showSuccess("تم إرسال طلب تقرير مخصص إلى مساعد الذكاء الاصطناعي (محاكاة).")}>
            <BarChartIcon className="h-4 w-4 mr-2" /> طلب تقرير من الذكاء الاصطناعي
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;