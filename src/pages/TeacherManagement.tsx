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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

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

interface Subject {
  id: string;
  name: string;
}

// Mock fetch function using demoData
const fetchTeachers = async (): Promise<Teacher[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.teachers as Teacher[];
};

const fetchSubjects = async (): Promise<Subject[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.subjects.map(s => ({ id: s.id, name: s.name }));
};

const TeacherManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  const { data: teachers, isLoading, error, refetch } = useQuery<Teacher[], Error>({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError } = useQuery<Subject[], Error>({
    queryKey: ['allSubjects'],
    queryFn: fetchSubjects,
  });

  const handleTeacherAdded = () => {
    setIsFormOpen(false);
    showSuccess("تمت إضافة المعلم بنجاح (محاكاة).");
    refetch(); // Refetch to update the list with potentially new demo data
  };

  const filteredTeachers = teachers?.filter(teacher => {
    const matchesSearch = teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || teacher.subject_specialty === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (isLoading || isLoadingSubjects) {
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

  if (subjectsError) {
    return <div className="text-red-500">Error loading subjects: {subjectsError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">إدارة المعلمين</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => showSuccess("تم تصدير قائمة المعلمين كـ CSV (محاكاة).")}>
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

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="ابحث عن اسم المعلم أو رقم الهوية..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select onValueChange={setSelectedSubjectFilter} value={selectedSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر التخصص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التخصصات</SelectItem>
            {subjects?.map(subject => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {filteredTeachers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">لا يوجد معلمين مطابقون.</TableCell>
              </TableRow>
            ) : (
              filteredTeachers?.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.first_name} {teacher.last_name}</TableCell>
                  <TableCell>{teacher.teacher_id}</TableCell>
                  <TableCell>{teacher.subject_specialty || 'N/A'}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.salary}</TableCell>
                  <TableCell>{teacher.contact}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => showSuccess(`عرض تفاصيل المعلم ${teacher.first_name} ${teacher.last_name}`)}>عرض</Button>
                    <Button variant="ghost" size="sm" onClick={() => showSuccess(`تحرير المعلم ${teacher.first_name} ${teacher.last_name}`)}>تحرير</Button>
                    <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => showSuccess(`إرسال رسالة إلى ${teacher.first_name} ${teacher.last_name}`)}><MessageSquare className="h-4 w-4" /></Button>
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