"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
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

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  date_of_birth: string | null; // Can be null
  grade_level: number;
  created_at: string;
}

const fetchStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const StudentManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: students, isLoading, error, refetch } = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const handleStudentAdded = () => {
    refetch();
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Student Management</h2>
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
        <h2 className="text-3xl font-bold">Student Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <StudentForm onSuccess={handleStudentAdded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Grade Level</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No students found.</TableCell>
              </TableRow>
            ) : (
              students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.first_name}</TableCell>
                  <TableCell>{student.last_name}</TableCell>
                  <TableCell>
                    {student.date_of_birth && !isNaN(new Date(student.date_of_birth).getTime())
                      ? format(new Date(student.date_of_birth), 'PPP')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{student.grade_level}</TableCell>
                  <TableCell>
                    {student.created_at && !isNaN(new Date(student.created_at).getTime())
                      ? format(new Date(student.created_at), 'PPpp')
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

export default StudentManagement;