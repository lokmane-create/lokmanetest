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

// Mock fetch function using demoData
const fetchGrades = async (): Promise<Grade[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.grades as Grade[];
};

const GradesExams = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: grades, isLoading, error, refetch } = useQuery<Grade[], Error>({
    queryKey: ['grades'],
    queryFn: fetchGrades,
  });

  const handleGradeAdded = () => {
    // In a real app, this would trigger a refetch from the actual DB
    setIsFormOpen(false);
  };

  // Calculate averages and top/bottom students
  const averageScore = grades ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : 'N/A';
  const topStudents = grades ? [...grades].sort((a, b) => b.score - a.score).slice(0, 5) : [];
  const bottomStudents = grades ? [...grades].sort((a, b) => a.score - b.score).slice(0, 5) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">الدرجات والامتحانات</h2>
          <Skeleton className="h-10 w-32" />
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
            <p className="text-xs text-muted-foreground">متوسط جميع المواد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل 5 طلاب</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground">
              {topStudents.map((grade, index) => (
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
              {bottomStudents.map((grade, index) => (
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
            {/* Placeholder for a GradeForm component */}
            <div className="p-4 text-center text-muted-foreground">
              <p>نموذج إضافة الدرجات سيتم إنشاؤه هنا.</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(false)}>إغلاق</Button>
            </div>
          </DialogContent>
        </Dialog>
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
            {grades?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">لا يوجد درجات.</TableCell>
              </TableRow>
            ) : (
              grades?.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.students ? `${grade.students.first_name} ${grade.students.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{grade.students?.student_id || 'N/A'}</TableCell>
                  <TableCell>{grade.classes?.name || 'N/A'}</TableCell>
                  <TableCell>{grade.assignment_name}</TableCell>
                  <TableCell>{grade.score}</TableCell>
                  <TableCell>{grade.max_score}</TableCell>
                  <TableCell>{grade.profiles ? `${grade.profiles.first_name} ${grade.profiles.last_name}` : 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2">تحرير</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">حذف</Button>
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