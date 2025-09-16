"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, FileText, Download } from 'lucide-react';
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
import StudentForm from '@/components/StudentForm';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { demoData } from '@/lib/fakeData'; // Import demo data

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  date_of_birth: string | null; // Can be null
  grade_level: number;
  created_at: string;
  attendance: number; // Added for demo data
  avgGrade: number; // Added for demo data
  parent_name: string; // Added for demo data
  parent_contact: string; // Added for demo data
  gpa: string; // Added for demo data
}

// Mock fetch function using demoData
const fetchStudents = async (): Promise<Student[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.students as Student[];
};

const StudentManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: students, isLoading, error, refetch } = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const handleStudentAdded = () => {
    // In a real app, this would trigger a refetch from the actual DB
    // For demo, we'll just close the form and rely on the static data for now
    // A full rebuild would refresh the demoData
    setIsFormOpen(false);
    // For a more dynamic demo, you could add the new student to demoData.students array
    // and then force a re-render, but for now, we'll keep it simple.
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">إدارة الطلاب</h2>
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
    return <div className="text-red-500">Error loading students: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">إدارة الطلاب</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> تصدير تقارير (PDF)
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> إضافة طالب
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة طالب جديد</DialogTitle>
              </DialogHeader>
              <StudentForm onSuccess={handleStudentAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الطالب</TableHead>
              <TableHead>رقم الطالب</TableHead>
              <TableHead>تاريخ الميلاد</TableHead>
              <TableHead>المستوى الدراسي</TableHead>
              <TableHead>الحضور %</TableHead>
              <TableHead>المعدل التراكمي</TableHead>
              <TableHead>اسم ولي الأمر</TableHead>
              <TableHead>اتصال ولي الأمر</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">لا يوجد طلاب.</TableCell>
              </TableRow>
            ) : (
              students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>
                    {student.date_of_birth && !isNaN(new Date(student.date_of_birth).getTime())
                      ? format(new Date(student.date_of_birth), 'PPP')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{student.grade_level}</TableCell>
                  <TableCell>{student.attendance}%</TableCell>
                  <TableCell>{student.gpa}</TableCell>
                  <TableCell>{student.parent_name}</TableCell>
                  <TableCell>{student.parent_contact}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2">عرض</Button>
                    <Button variant="ghost" size="sm">تحرير</Button>
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

export default StudentManagement;