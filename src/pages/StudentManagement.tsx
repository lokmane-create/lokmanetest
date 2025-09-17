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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

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
  emergency_contact: string; // Added for demo data
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const { data: students, isLoading, error, refetch } = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const handleStudentAdded = () => {
    // In a real app, this would trigger a refetch from the actual DB
    // For demo, we'll just close the form and rely on the static data for now
    // A full rebuild would refresh the demoData
    setIsFormOpen(false);
    showSuccess("تمت إضافة الطالب بنجاح (محاكاة).");
    refetch(); // Refetch to update the list with potentially new demo data
  };

  const filteredStudents = students?.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGradeFilter === 'all' || student.grade_level.toString() === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  });

  // Generate grade level options dynamically
  const gradeLevels = Array.from(new Set(demoData.students.map(s => s.grade_level))).sort((a, b) => a - b);

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
          <Button variant="outline" onClick={() => showSuccess("تم تصدير تقارير الطلاب كـ PDF (محاكاة).")}>
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

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="ابحث عن اسم الطالب أو رقم الهوية..."
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select onValueChange={setSelectedGradeFilter} value={selectedGradeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر الصف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الصفوف</SelectItem>
            {gradeLevels.map(grade => (
              <SelectItem key={grade} value={grade.toString()}>
                الصف {grade}
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
              <TableHead>تاريخ الميلاد</TableHead>
              <TableHead>المستوى الدراسي</TableHead>
              <TableHead>الحضور %</TableHead>
              <TableHead>المعدل التراكمي</TableHead>
              <TableHead>اسم ولي الأمر</TableHead>
              <TableHead>اتصال ولي الأمر</TableHead>
              <TableHead>اتصال الطوارئ</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">لا يوجد طلاب مطابقون.</TableCell>
              </TableRow>
            ) : (
              filteredStudents?.map((student) => (
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
                  <TableCell>{student.emergency_contact}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => showSuccess(`عرض تفاصيل الطالب ${student.first_name} ${student.last_name}`)}>عرض</Button>
                    <Button variant="ghost" size="sm" onClick={() => showSuccess(`تحرير الطالب ${student.first_name} ${student.last_name}`)}>تحرير</Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => showError(`حذف الطالب ${student.first_name} ${student.last_name} (محاكاة)`)}>حذف</Button>
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