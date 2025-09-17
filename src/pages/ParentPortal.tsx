"use client";

import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { demoData } from '@/lib/fakeData';
import { format, parseISO, isPast } from 'date-fns'; // Added isPast
import { BarChart, ClipboardCheck, BookOpen, GraduationCap, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Added Button

const ParentPortal = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const userFirstName = user?.user_metadata?.first_name || user?.email?.split('@')[0];

  // For demo purposes, let's assume a parent is linked to a specific student by email or a dummy ID
  // In a real app, this would involve a proper database relationship.
  const dummyChild = demoData.students.find(s => s.parent_name.includes(userFirstName || '')) || demoData.students[0]; // Fallback to first student

  if (!dummyChild) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            بوابة أولياء الأمور
          </h3>
          <p className="text-sm text-muted-foreground">
            مرحباً، {userFirstName}! لا يوجد بيانات طفل مرتبطة بحسابك حالياً.
          </p>
        </div>
      </div>
    );
  }

  const childAttendanceRecords = demoData.attendanceRecords.filter(rec => rec.student_id === dummyChild.id);
  const childGrades = demoData.grades.filter(grade => grade.student_id === dummyChild.id);
  const childClasses = demoData.classes.filter(cls => cls.grade_level === dummyChild.grade_level);
  const childSchedule = demoData.schedules.filter(schedule =>
    childClasses.some(cls => cls.id === schedule.class_id)
  );
  const childOnlineClasses = demoData.onlineClasses.filter(onlineCls =>
    childClasses.some(cls => cls.id === onlineCls.class_id)
  );

  const recentAttendance = childAttendanceRecords.slice(0, 5).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  const recentGrades = childGrades.slice(0, 5).sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime());
  const upcomingOnlineClasses = childOnlineClasses?.filter(cls => !isPast(parseISO(cls.start_time))).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()).slice(0, 3);


  const daysOfWeekMap: { [key: number]: string } = {
    0: "الأحد",
    1: "الإثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          بوابة أولياء الأمور
        </h3>
        <p className="text-sm text-muted-foreground">
          مرحباً، {userFirstName}! عرض حضور ودرجات وجدول طفلك: {dummyChild.first_name} {dummyChild.last_name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط درجات {dummyChild.first_name}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyChild.avgGrade}</div>
            <p className="text-xs text-muted-foreground">من أصل 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة حضور {dummyChild.first_name}</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyChild.attendance}%</div>
            <p className="text-xs text-muted-foreground">هذا الفصل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الصف الدراسي</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyChild.grade_level}</div>
            <p className="text-xs text-muted-foreground">المستوى الحالي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر سجلات الحضور لـ {dummyChild.first_name}</CardTitle>
          <CardDescription>عرض آخر 5 سجلات حضور لطفلك.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحصة</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center">لا يوجد سجلات حضور.</TableCell></TableRow>
                ) : (
                  recentAttendance.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(parseISO(record.date), 'PPP')}</TableCell>
                      <TableCell>{demoData.classes.find(c => c.id === record.class_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{record.status}</TableCell>
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
          <CardTitle>آخر درجات {dummyChild.first_name}</CardTitle>
          <CardDescription>عرض آخر 5 درجات لطفلك.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الواجب/الاختبار</TableHead>
                  <TableHead>الحصة</TableHead>
                  <TableHead>الدرجة</TableHead>
                  <TableHead>الدرجة القصوى</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGrades.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">لا يوجد درجات.</TableCell></TableRow>
                ) : (
                  recentGrades.map(grade => (
                    <TableRow key={grade.id}>
                      <TableCell>{grade.assignment_name}</TableCell>
                      <TableCell>{demoData.classes.find(c => c.id === grade.class_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{grade.score}</TableCell>
                      <TableCell>{grade.max_score}</TableCell>
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
          <CardTitle>جدول {dummyChild.first_name} الدراسي</CardTitle>
          <CardDescription>عرض الجدول الدراسي لطفلك.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اليوم</TableHead>
                  <TableHead>الحصة</TableHead>
                  <TableHead>وقت البدء</TableHead>
                  <TableHead>وقت الانتهاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {childSchedule.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">لا يوجد جدول دراسي.</TableCell></TableRow>
                ) : (
                  childSchedule.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell>{daysOfWeekMap[schedule.day_of_week]}</TableCell>
                      <TableCell>{demoData.classes.find(c => c.id === schedule.class_id)?.name || 'N/A'}</TableCell>
                      <TableCell>{schedule.start_time}</TableCell>
                      <TableCell>{schedule.end_time}</TableCell>
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
          <CardTitle>الفصول المباشرة القادمة لـ {dummyChild.first_name}</CardTitle>
          <CardDescription>انضم إلى الفصول المباشرة المجدولة لطفلك.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>المعلم</TableHead>
                  <TableHead>وقت البدء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingOnlineClasses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">لا توجد فصول مباشرة قادمة لطفلك.</TableCell>
                  </TableRow>
                ) : (
                  upcomingOnlineClasses?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.title}</TableCell>
                      <TableCell>{cls.teachers ? `${cls.teachers.first_name} ${cls.teachers.last_name}` : 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(cls.start_time), 'PPP p')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="default" size="sm" onClick={() => window.open(cls.meeting_link, '_blank')}>
                          <MonitorPlay className="mr-2 h-4 w-4" /> انضم
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
    </div>
  );
};

export default ParentPortal;