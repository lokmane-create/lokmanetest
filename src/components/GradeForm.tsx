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
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { demoData } from '@/lib/fakeData'; // Using demo data for selects

const formSchema = z.object({
  student_id: z.string().uuid({ message: "الرجاء اختيار طالب." }),
  class_id: z.string().uuid({ message: "الرجاء اختيار حصة." }),
  assignment_name: z.string().min(2, { message: "اسم الواجب/الاختبار يجب أن يتكون من حرفين على الأقل." }),
  score: z.coerce.number().min(0, { message: "الدرجة لا يمكن أن تكون سالبة." }).max(100, { message: "الدرجة القصوى هي 100." }),
  max_score: z.coerce.number().min(1, { message: "الدرجة القصوى يجب أن تكون 1 على الأقل." }),
});

interface GradeFormProps {
  onSuccess?: () => void;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Class {
  id: string;
  name: string;
}

// Mock fetch functions using demoData
const fetchStudents = async (): Promise<Student[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.students.map(s => ({ id: s.id, first_name: s.first_name, last_name: s.last_name }));
};

const fetchClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.classes.map(c => ({ id: c.id, name: c.name }));
};

const GradeForm: React.FC<GradeFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: "",
      class_id: "",
      assignment_name: "",
      score: 0,
      max_score: 100,
    },
  });

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useQuery<Student[], Error>({
    queryKey: ['allStudents'],
    queryFn: fetchStudents,
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError } = useQuery<Class[], Error>({
    queryKey: ['allClasses'],
    queryFn: fetchClasses,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      showError("المستخدم غير مصادق لإضافة الدرجات.");
      return;
    }

    const { error } = await supabase
      .from("grades")
      .insert([
        {
          student_id: values.student_id,
          class_id: values.class_id,
          assignment_name: values.assignment_name,
          score: values.score,
          max_score: values.max_score,
          graded_by: user.id,
        },
      ]);

    if (error) {
      showError(`فشل إضافة الدرجة: ${error.message}`);
      console.error("Error adding grade:", error);
    } else {
      showSuccess("تمت إضافة الدرجة بنجاح!");
      form.reset();
      onSuccess?.();
    }
  };

  if (isLoadingStudents || isLoadingClasses) {
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

  if (studentsError) {
    return <div className="text-red-500">خطأ في تحميل الطلاب: {studentsError.message}</div>;
  }

  if (classesError) {
    return <div className="text-red-500">خطأ في تحميل الحصص: {classesError.message}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الطالب</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طالباً" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
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
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحصة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حصة" />
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
          name="assignment_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الواجب/الاختبار</FormLabel>
              <FormControl>
                <Input placeholder="اختبار الرياضيات الأول" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الدرجة</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الدرجة القصوى</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">إضافة درجة</Button>
      </form>
    </Form>
  );
};

export default GradeForm;