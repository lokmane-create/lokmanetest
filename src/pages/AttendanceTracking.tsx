"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AttendanceForm from '@/components/AttendanceForm';
import { format, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { demoData } from '@/lib/fakeData'; // Import demo data
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: string;
  recorded_by: string;
  created_at: string;
  students: { first_name: string; last_name: string; student_id: string } | null;
  classes: { name: string } | null;
  profiles: { first_name: string; last_name: string } | null;
}

interface Class {
  id: string;
  name: string;
}

// Mock fetch function using demoData
const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.attendanceRecords as AttendanceRecord[];
};

const fetchClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.classes.map(c => ({ id: c.id, name: c.name }));
};

const AttendanceTracking = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | undefined>(new Date());

  const { data: attendanceRecords, isLoading, error, refetch } = useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendanceRecords'],
    queryFn: fetchAttendanceRecords,
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery<Class[], Error>({
    queryKey: ['allClasses'],
    queryFn: fetchClasses,
  });

  const handleAttendanceRecorded = () => {
    setIsFormOpen(false);
    showSuccess("تم تسجيل الحضور بنجاح (محاكاة).");
    refetch(); // Refetch to update the list and summaries
  };

  const filteredRecords = attendanceRecords?.filter(record => {
    const recordDate = parseISO(record.date);
    const matchesClass = selectedClassFilter === 'all' || record.class_id === selectedClassFilter;
    const matchesDate = !selectedDateFilter || isSameDay(recordDate, selectedDateFilter);
    return matchesClass && matchesDate;
  });

  // Calculate summaries
  const todayRecords = attendanceRecords?.filter(rec => isSameDay(parseISO(rec.date), new Date()));
  const presentToday = todayRecords?.filter(rec => rec.status === 'Present').length || 0;
  const absentToday = todayRecords?.filter(rec => rec.status === 'Absent').length || 0;
  const totalStudentsToday = todayRecords?.length || 0;
  const attendancePercentageToday = totalStudentsToday > 0 ? ((presentToday / totalStudentsToday) * 100).toFixed(1) : 'N/A';

  const currentWeekRecords = attendanceRecords?.filter(rec => isSameWeek(parseISO(rec.date), new Date()));
  const presentWeek = currentWeekRecords?.filter(rec => rec.status === 'Present').length || 0;
  const totalRecordsWeek = currentWeekRecords?.length || 0;
  const attendancePercentageWeek = totalRecordsWeek > 0 ? ((presentWeek / totalRecordsWeek) * 100).toFixed(1) : 'N/A';

  const currentMonthRecords = attendanceRecords?.filter(rec => isSameMonth(parseISO(rec.date), new Date()));
  const presentMonth = currentMonthRecords?.filter(rec => rec.status === 'Present').length || 0;
  const totalRecordsMonth = currentMonthRecords?.length || 0;
  const attendancePercentageMonth = totalRecordsMonth > 0 ? ((presentMonth / totalRecordsMonth) * 100).toFixed(1) : 'N/A';


  if (isLoading || isLoadingClasses) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">تتبع الحضور</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="rounded-md border p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading attendance records: {error.message}</div>;
  }

  if (classesError) {
    return <div className="text-red-500">Error loading classes: {classesError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">تتبع الحضور</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> تسجيل الحضور
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>تسجيل حضور جديد</DialogTitle>
            </DialogHeader>
            <AttendanceForm onSuccess={handleAttendanceRecorded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حضور اليوم</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentageToday}%</div>
            <p className="text-xs text-muted-foreground">{presentToday} حاضرين من {totalStudentsToday} طلاب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حضور الأسبوع</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentageWeek}%</div>
            <p className="text-xs text-muted-foreground">{presentWeek} سجلات حضور من {totalRecordsWeek} إجمالي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حضور الشهر</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentageMonth}%</div>
            <p className="text-xs text-muted-foreground">{presentMonth} سجلات حضور من {totalRecordsMonth} إجمالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Select onValueChange={setSelectedClassFilter} value={selectedClassFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="اختر حصة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحصص</SelectItem>
            {classes?.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[200px] justify-start text-left font-normal",
                !selectedDateFilter && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {selectedDateFilter ? format(selectedDateFilter, "PPP") : <span>اختر تاريخاً</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateFilter}
              onSelect={setSelectedDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={() => setSelectedDateFilter(undefined)}>مسح التاريخ</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحصة</TableHead>
              <TableHead>اسم الطالب</TableHead>
              <TableHead>رقم الطالب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>سجل بواسطة</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">لا يوجد سجلات حضور مطابقة.</TableCell>
              </TableRow>
            ) : (
              filteredRecords?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.date && !isNaN(new Date(record.date).getTime())
                      ? format(new Date(record.date), 'PPP')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{record.classes?.name || 'N/A'}</TableCell>
                  <TableCell>{record.students ? `${record.students.first_name} ${record.students.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{record.students?.student_id || 'N/A'}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>{record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'N/A'}</TableCell>
                  <TableCell>
                    {record.created_at && !isNaN(new Date(record.created_at).getTime())
                      ? format(new Date(record.created_at), 'PPpp')
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceTracking;