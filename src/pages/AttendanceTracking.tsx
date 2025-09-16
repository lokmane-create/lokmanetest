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
import AttendanceForm from '@/components/AttendanceForm';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { demoData } from '@/lib/fakeData'; // Import demo data

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

// Mock fetch function using demoData
const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.attendanceRecords as AttendanceRecord[];
};

const AttendanceTracking = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: attendanceRecords, isLoading, error, refetch } = useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendanceRecords'],
    queryFn: fetchAttendanceRecords,
  });

  const handleAttendanceRecorded = () => {
    // In a real app, this would trigger a refetch from the actual DB
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">تتبع الحضور</h2>
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
    return <div className="text-red-500">Error loading attendance records: {error.message}</div>;
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
            {attendanceRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">لا يوجد سجلات حضور.</TableCell>
              </TableRow>
            ) : (
              attendanceRecords?.map((record) => (
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