"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, MessageSquare, Download } from 'lucide-react';
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
import TeacherForm from '@/components/TeacherForm';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { demoData } from '@/lib/fakeData'; // Import demo data

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  teacher_id: string;
  subject_specialty: string | null;
  created_at: string;
  email: string; // Added for demo data
  salary: string; // Added for demo data
  contact: string; // Added for demo data
}

// Mock fetch function using demoData
const fetchTeachers = async (): Promise<Teacher[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.teachers as Teacher[];
};

const TeacherManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: teachers, isLoading, error, refetch } = useQuery<Teacher[], Error>({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  const handleTeacherAdded = () => {
    // In a real app, this would trigger a refetch from the actual DB
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">إدارة المعلمين</h2>
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
    return <div className="text-red-500">Error loading teachers: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">إدارة المعلمين</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> تصدير قائمة (CSV)
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> إضافة معلم
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة معلم جديد</DialogTitle>
              </DialogHeader>
              <TeacherForm onSuccess={handleTeacherAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المعلم</TableHead>
              <TableHead>رقم المعلم</TableHead>
              <TableHead>التخصص</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الراتب</TableHead>
              <TableHead>جهة الاتصال</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">لا يوجد معلمين.</TableCell>
              </TableRow>
            ) : (
              teachers?.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.first_name} {teacher.last_name}</TableCell>
                  <TableCell>{teacher.teacher_id}</TableCell>
                  <TableCell>{teacher.subject_specialty || 'N/A'}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.salary}</TableCell>
                  <TableCell>{teacher.contact}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2">عرض</Button>
                    <Button variant="ghost" size="sm">تحرير</Button>
                    <Button variant="ghost" size="sm" className="text-blue-500"><MessageSquare className="h-4 w-4" /></Button>
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

export default TeacherManagement;