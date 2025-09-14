"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
}

type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

const attendanceSchema = z.object({
  student_id: z.string().uuid(),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
});

const formSchema = z.object({
  class_id: z.string().uuid({ message: "Please select a class." }),
  date: z.date({ required_error: "Attendance date is required." }),
  student_attendance: z.array(attendanceSchema).min(1, "Please mark attendance for at least one student."),
});

interface AttendanceFormProps {
  onSuccess?: () => void;
}

const fetchClasses = async (): Promise<Class[]> => {
  const { data, error } = await supabase.from('classes').select('id, name').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchStudentsByClass = async (classId: string): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, student_id')
    .eq('class_id', classId)
    .order('last_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class_id: "",
      date: new Date(),
      student_attendance: [],
    },
  });

  const selectedClassId = form.watch("class_id");
  const selectedDate = form.watch("date");

  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useQuery<Student[], Error>({
    queryKey: ['students', selectedClassId],
    queryFn: () => fetchStudentsByClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  // Initialize student_attendance when students data changes
  React.useEffect(() => {
    if (students && students.length > 0) {
      const initialAttendance = students.map(student => ({
        student_id: student.id,
        status: "Present" as AttendanceStatus, // Default to Present
      }));
      form.setValue("student_attendance", initialAttendance);
    } else {
      form.setValue("student_attendance", []);
    }
  }, [students, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      showError("User not authenticated to record attendance.");
      return;
    }

    const attendanceRecords = values.student_attendance.map(sa => ({
      student_id: sa.student_id,
      class_id: values.class_id,
      date: format(values.date, "yyyy-MM-dd"),
      status: sa.status,
      recorded_by: user.id,
    }));

    const { error } = await supabase
      .from("attendance")
      .insert(attendanceRecords);

    if (error) {
      showError(`Failed to record attendance: ${error.message}`);
      console.error("Error recording attendance:", error);
    } else {
      showSuccess("Attendance recorded successfully!");
      form.reset({
        class_id: "",
        date: new Date(),
        student_attendance: [],
      });
      onSuccess?.();
    }
  };

  if (isLoadingClasses) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (classesError) {
    return <div className="text-red-500">Error loading classes: {classesError.message}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()} // Cannot select future dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedClassId && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mark Attendance for {format(selectedDate, "PPP")}</h3>
            {isLoadingStudents ? (
              <div className="rounded-md border p-4">
                <Skeleton className="h-10 w-full mb-4" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ) : studentsError ? (
              <div className="text-red-500">Error loading students: {studentsError.message}</div>
            ) : students?.length === 0 ? (
              <p className="text-muted-foreground">No students found for this class.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`student_attendance.${index}.status`}
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-1">
                                    <FormControl>
                                      <RadioGroupItem value="Present" />
                                    </FormControl>
                                    <Label>Present</Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-1">
                                    <FormControl>
                                      <RadioGroupItem value="Absent" />
                                    </FormControl>
                                    <Label>Absent</Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-1">
                                    <FormControl>
                                      <RadioGroupItem value="Late" />
                                    </FormControl>
                                    <Label>Late</Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-1">
                                    <FormControl>
                                      <RadioGroupItem value="Excused" />
                                    </FormControl>
                                    <Label>Excused</Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button type="submit" className="w-full">Record Attendance</Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default AttendanceForm;