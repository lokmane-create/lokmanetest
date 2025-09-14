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

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: string;
  recorded_by: string;
  created_at: string;
  students: { first_name: string; last_name: string; student_id: string };
  classes: { name: string };
  profiles: { first_name: string; last_name: string };
}

const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(first_name, last_name, student_id), classes(name), profiles(first_name, last_name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const AttendanceTracking = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: attendanceRecords, isLoading, error, refetch } = useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendanceRecords'],
    queryFn: fetchAttendanceRecords,
  });

  const handleAttendanceRecorded = () => {
    refetch();
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Attendance Tracking</h2>
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
        <h2 className="text-3xl font-bold">Attendance Tracking</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Record Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Attendance</DialogTitle>
            </DialogHeader>
            <AttendanceForm onSuccess={handleAttendanceRecorded} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Recorded At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No attendance records found.</TableCell>
              </TableRow>
            ) : (
              attendanceRecords?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{format(new Date(record.date), 'PPP')}</TableCell>
                  <TableCell>{record.classes?.name || 'N/A'}</TableCell>
                  <TableCell>{record.students ? `${record.students.first_name} ${record.students.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{record.students?.student_id || 'N/A'}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>{record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{format(new Date(record.created_at), 'PPpp')}</TableCell>
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