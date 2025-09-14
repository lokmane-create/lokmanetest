"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Clock, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format

const formSchema = z.object({
  class_id: z.string().uuid({ message: "Please select a class." }),
  day_of_week: z.coerce.number().min(0).max(6, { message: "Day of week must be between 0 (Sunday) and 6 (Saturday)." }),
  start_time: z.string().regex(timeRegex, { message: "Start time must be in HH:MM format (24-hour)." }),
  end_time: z.string().regex(timeRegex, { message: "End time must be in HH:MM format (24-hour)." }),
}).refine((data) => {
  const [startHour, startMinute] = data.start_time.split(':').map(Number);
  const [endHour, endMinute] = data.end_time.split(':').map(Number);

  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return endTimeInMinutes > startTimeInMinutes;
}, {
  message: "End time must be after start time.",
  path: ["end_time"],
});

interface ScheduleFormProps {
  onSuccess?: () => void;
}

interface Class {
  id: string;
  name: string;
}

const fetchClasses = async (): Promise<Class[]> => {
  const { data, error } = await supabase.from('classes').select('id, name').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class_id: "",
      day_of_week: 1, // Default to Monday
      start_time: "09:00",
      end_time: "10:00",
    },
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase
      .from("schedules")
      .insert([
        {
          class_id: values.class_id,
          day_of_week: values.day_of_week,
          start_time: values.start_time,
          end_time: values.end_time,
        },
      ]);

    if (error) {
      showError(`Failed to add schedule: ${error.message}`);
      console.error("Error adding schedule:", error);
    } else {
      showSuccess("Schedule added successfully!");
      form.reset();
      onSuccess?.();
    }
  };

  if (isLoadingClasses) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
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
          name="day_of_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="09:00" {...field} className="pl-9" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="10:00" {...field} className="pl-9" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">Add Schedule</Button>
      </form>
    </Form>
  );
};

export default ScheduleForm;