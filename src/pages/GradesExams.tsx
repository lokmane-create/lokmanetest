"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, BarChart, Award, TrendingDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { demoData } from '@/lib/fakeData'; // Import demo data
import GradeForm from '@/components/GradeForm'; // Import the new GradeForm
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  assignment_name: string;
  score: number;
  max_score: number;
  graded_by: string;
  created_at: string;
  students: { first_name: string; last_name: string; student_id: string } | null;
  classes: { name: string } | null;
  profiles: { first_name: string; last_name: string } | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Class {
  id: string;
  name: string;
}

// Mock fetch function using demoData
const fetchGrades = async (): Promise<Grade[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.grades as Grade[];
};

const fetchStudents = async (): Promise<Student[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.students.map(s => ({ id: s.id, first_name: s.first_name, last_name: s.last_name }));
};

const fetchClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.classes.map(c => ({ id: c.id, name: c.name }));
};

const GradesExams = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  const { data: grades, isLoading, error, refetch } = useQuery<Grade[], Error>({
    queryKey: ['grades'],
    queryFn: fetchGrades,
  });

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useQuery<Student[], Error>({
    queryKey: ['allStudents'],
    queryFn: fetchStudents,
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery<Class[], Error>({
    queryKey: ['allClasses'],
    queryFn: fetchClasses,
  });

  const handleGradeAdded = () => {
    setIsFormOpen(false);
    showSuccess("تمت إضافة الدرجة بنجاح (محاكاة).");
    refetch(); // Refetch to update the list and summaries
  };

  const filteredGrades = grades?.filter(grade => {
    const matchesClass = selectedClassFilter === 'all' || grade.class_id === selectedClassFilter;
    const matchesStudent = selectedStudentFilter === 'all' || grade.student_id === selectedStudentFilter;
    return matchesClass && matchesStudent;
  });

  // Calculate averages and top/bottom students from filtered grades
  const averageScore = filteredGrades && filteredGrades.length > 0 ? (filteredGrades.reduce((sum, g) => sum + g.score, 0) / filteredGrades.length).toFixed(1) : 'N/A';
  const topStudents = filteredGrades ? [...filteredGrades].sort((a, b) => b.score - a.score).slice(0, 5) : [];
  const bottomStudents = filteredGrades ? [...filteredGrades].sort((a, b) => a.score - b.score).slice(0, 5) : [];

  if (isLoading || isLoadingStudents || isLoadingClasses) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">الدرجات والامتحانات</h2>
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
    return <div className="text-red-500">Error loading grades: {error.message}</div>;
  }

  if (studentsError) {
    return <div className="text-red-500">Error loading students: {studentsError.message}</div>;
  }

  if (classesError) {
    return <div className="text-red-500">Error loading classes: {classesError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          الدرجات والامتحانات
        </h3>
        <p className="text-sm text-muted-foreground">
          إدخال، تعديل، وعرض نتائج الامتحانات وإنشاء التقارير.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <p className="text-xs text-muted-foreground">متوسط الدرجات المفلترة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل 5 طلاب</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground">
              {topStudents.length === 0 ? <li>لا يوجد بيانات</li> : topStudents.map((grade, index) => (
                <li key={index}>{grade.students?.first_name} {grade.students?.last_name} ({grade.score})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أقل 5 طلاب أداءً</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground">
              {bottomStudents.length === 0 ? <li>لا يوجد بيانات</li> : bottomStudents.map((grade, index) => (
                <li key={index}>{grade.students?.first_name} {grade.students?.last_name} ({grade.score})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">سجلات الدرجات</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> إضافة درجة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة درجة جديدة</DialogTitle>
            </DialogHeader>
            <GradeForm onSuccess={handleGradeAdded} />
          </DialogContent>
        </Dialog>
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
        <Select onValueChange={setSelectedStudentFilter} value={selectedStudentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="اختر طالباً" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلاب</SelectItem>
            {students?.map(student => (
              <SelectItem key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الطالب</TableHead>
              <TableHead>رقم الطالب</TableHead>
              <TableHead>الحصة</TableHead>
              <TableHead>اسم الواجب/الاختبار</TableHead>
              <TableHead>الدرجة</TableHead>
              <TableHead>الدرجة القصوى</TableHead>
              <TableHead>تم التقييم بواسطة</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrades?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">لا يوجد درجات مطابقة.</TableCell>
              </TableRow>
            ) : (
              filteredGrades?.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.students ? `${grade.students.first_name} ${grade.students.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{grade.students?.student_id || 'N/A'}</TableCell>
                  <TableCell>{grade.classes?.name || 'N/A'}</TableCell>
                  <TableCell>{grade.assignment_name}</TableCell>
                  <TableCell>{grade.score}</TableCell>
                  <TableCell>{grade.max_score}</TableCell>
                  <TableCell>{grade.profiles ? `${grade.profiles.first_name} ${grade.profiles.last_name}` : 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => showSuccess(`تحرير درجة ${grade.assignment_name} للطالب ${grade.students?.first_name}`)}>تحرير</Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => showError(`حذف درجة ${grade.assignment_name} للطالب ${grade.students?.first_name} (محاكاة)`)}>حذف</Button>
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

export default GradesExams;