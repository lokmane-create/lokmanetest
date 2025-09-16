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

interface Schedule {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  classes: { name: string } | null; // Joined data
}

const fetchSchedules = async (): Promise<Schedule[]> => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*, classes(name)')
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const daysOfWeekMap: { [key: number]: string } = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
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
            <TableHead>Class Name</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No schedules found.</TableCell>
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