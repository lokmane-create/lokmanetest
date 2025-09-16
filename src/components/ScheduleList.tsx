"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { demoData } from '@/lib/fakeData'; // Import demo data

interface Schedule {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  classes: { name: string } | null; // Joined data
}

// Mock fetch function using demoData
const fetchSchedules = async (): Promise<Schedule[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.schedules as Schedule[];
};

const daysOfWeekMap: { [key: number]: string } = {
  0: "الأحد",
  1: "الإثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

const ScheduleList = () => {
  const { data: schedules, isLoading, error } = useQuery<Schedule[], Error>({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
  });

  if (isLoading) {
    return (
      <div className="rounded-md border p-4">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading schedules: {error.message}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الحصة</TableHead>
            <TableHead>اليوم</TableHead>
            <TableHead>وقت البدء</TableHead>
            <TableHead>وقت الانتهاء</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">لا يوجد جداول حصص.</TableCell>
            </TableRow>
          ) : (
            schedules?.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.classes?.name || 'N/A'}</TableCell>
                <TableCell>{daysOfWeekMap[schedule.day_of_week]}</TableCell>
                <TableCell>{schedule.start_time}</TableCell>
                <TableCell>{schedule.end_time}</TableCell>
                <TableCell>
                  {schedule.created_at && !isNaN(new Date(schedule.created_at).getTime())
                    ? format(new Date(schedule.created_at), 'PPpp')
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScheduleList;