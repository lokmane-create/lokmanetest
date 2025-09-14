"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";

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
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, { message: "Class name must be at least 2 characters." }),
  subject_id: z.string().uuid({ message: "Please select a subject." }),
  teacher_id: z.string().uuid({ message: "Please select a teacher." }),
  grade_level: z.coerce.number().min(1).max(12, { message: "Grade level must be between 1 and 12." }).optional(),
  room_number: z.string().optional(),
});

interface ClassFormProps {
  onSuccess?: () => void;
}

interface Subject {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

const fetchSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase.from('subjects').select('id, name').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase.from('teachers').select('id, first_name, last_name').order('last_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const ClassForm: React.FC<ClassFormProps> = ({ onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject_id: "",
      teacher_id: "",
      grade_level: undefined,
      room_number: "",
    },
  });

  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError } = useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  });

  const { data: teachers, isLoading: isLoadingTeachers, error: teachersError } = useQuery<Teacher[], Error>({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data, error } = await supabase
      .from("classes")
      .insert([
        {
          name: values.name,
          subject_id: values.subject_id,
          teacher_id: values.teacher_id,
          grade_level: values.grade_level || null,
          room_number: values.room_number || null,
        },
      ]);

    if (error) {
      showError(`Failed to add class: ${error.message}`);
      console.error("Error adding class:", error);
    } else {
      showSuccess("Class added successfully!");
      form.reset();
      onSuccess?.();
    }
  };

  if (isLoadingSubjects || isLoadingTeachers) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (subjectsError) {
    return <div className="text-red-500">Error loading subjects: {subjectsError.message}</div>;
  }

  if (teachersError) {
    return <div className="text-red-500">Error loading teachers: {teachersError.message}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="Algebra I - Section A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
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
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
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
          name="grade_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Level (Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Room 101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Class</Button>
      </form>
    </Form>
  );
};

export default ClassForm;