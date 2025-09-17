"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, MonitorPlay, Video, CalendarPlus, Download, ClipboardPen as WhiteboardIcon } from 'lucide-react'; // Replaced Whiteboard with ClipboardPen
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isPast, addDays } from 'date-fns'; // Added addDays
import { demoData } from '@/lib/fakeData';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/integrations/supabase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Whiteboard from '@/components/Whiteboard'; // Import Whiteboard component
import { v4 as uuidv4 } from 'uuid'; // For generating session IDs

interface OnlineClass {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: string;
  meeting_link: string;
  recorded: boolean;
  recording_link: string | null;
  created_at: string;
  classes: { name: string };
  teachers: { first_name: string; last_name: string };
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

const fetchOnlineClasses = async (): Promise<OnlineClass[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.onlineClasses as OnlineClass[];
};

const fetchClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.classes.map(c => ({ id: c.id, name: c.name }));
};

const fetchTeachers = async (): Promise<Teacher[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.teachers.map(t => ({ id: t.id, first_name: t.first_name, last_name: t.last_name }));
};

const scheduleClassSchema = z.object({
  class_id: z.string().uuid({ message: "الرجاء اختيار حصة." }),
  teacher_id: z.string().uuid({ message: "الرجاء اختيار معلم." }),
  title: z.string().min(5, { message: "العنوان يجب أن يتكون من 5 أحرف على الأقل." }),
  description: z.string().optional(),
  start_time: z.string().refine(val => !isPast(parseISO(val)), { message: "وقت البدء يجب أن يكون في المستقبل." }),
  end_time: z.string().refine(val => !isPast(parseISO(val)), { message: "وقت الانتهاء يجب أن يكون في المستقبل." }),
  platform: z.string().min(1, { message: "الرجاء اختيار منصة." }),
});

const ScheduleClassForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof scheduleClassSchema>>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      class_id: "",
      teacher_id: user?.id || "", // Default to current user if teacher
      title: "",
      description: "",
      start_time: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
      platform: "Jitsi Meet",
    },
  });

  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[], Error>({
    queryKey: ['allClasses'],
    queryFn: fetchClasses,
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery<Teacher[], Error>({
    queryKey: ['allTeachers'],
    queryFn: fetchTeachers,
  });

  const onSubmit = async (values: z.infer<typeof scheduleClassSchema>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    showSuccess("تم جدولة الحصة بنجاح (محاكاة).");
    onSuccess();
  };

  if (isLoadingClasses || isLoadingTeachers) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  {classes?.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
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
              <FormLabel>المعلم</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر معلم" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers?.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="عنوان الحصة المباشرة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف (اختياري)</FormLabel>
              <FormControl>
                <Textarea placeholder="وصف موجز للحصة" {...field} />
              </FormControl>
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
                <FormLabel>وقت البدء</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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
                <FormLabel>وقت الانتهاء</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المنصة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر منصة الاجتماع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Jitsi Meet">Jitsi Meet</SelectItem>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">جدولة الحصة</Button>
      </form>
    </Form>
  );
};


const OnlineClasses = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [activeWhiteboardSession, setActiveWhiteboardSession] = useState<{ classId: string; sessionId: string; isTeacher: boolean } | null>(null);

  const { data: onlineClasses, isLoading, error, refetch } = useQuery<OnlineClass[], Error>({
    queryKey: ['onlineClasses'],
    queryFn: fetchOnlineClasses,
  });

  const handleClassScheduled = () => {
    setIsScheduleFormOpen(false);
    refetch();
  };

  const handleSaveWhiteboardToLibrary = (imageUrl: string, title: string) => {
    // Simulate saving to library_items table
    // In a real app, you'd upload imageUrl to Supabase Storage and then insert a record.
    showSuccess(`تم حفظ "${title}" في مكتبة الدروس (محاكاة).`);
    // You might want to refetch library items here if you had a query for them
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">الفصول والاجتماعات عبر الإنترنت</h2>
        <Skeleton className="h-10 w-full mb-4" />
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
    return <div className="text-red-500">Error loading online classes: {error.message}</div>;
  }

  const upcomingClasses = onlineClasses?.filter(cls => !isPast(parseISO(cls.start_time))).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  const pastClasses = onlineClasses?.filter(cls => isPast(parseISO(cls.start_time))).sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());

  if (activeWhiteboardSession) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold">السبورة البيضاء للفصل: {activeWhiteboardSession.classId}</h3>
          <Button variant="outline" onClick={() => setActiveWhiteboardSession(null)}>
            العودة إلى الفصول
          </Button>
        </div>
        <div className="flex-1">
          <Whiteboard
            classId={activeWhiteboardSession.classId}
            sessionId={activeWhiteboardSession.sessionId}
            isTeacher={activeWhiteboardSession.isTeacher}
            onSaveToLibrary={handleSaveWhiteboardToLibrary}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          الفصول والاجتماعات عبر الإنترنت
        </h3>
        <p className="text-sm text-muted-foreground">
          انضم إلى الفصول المباشرة، وجدولة الاجتماعات، وراجع التسجيلات.
        </p>
      </div>

      {(userRole === 'Admin' || userRole === 'Principal' || userRole === 'Teacher') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>جدولة حصة/اجتماع جديد</CardTitle>
            <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsScheduleFormOpen(true)}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> جدولة حصة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>جدولة حصة/اجتماع جديد</DialogTitle>
                </DialogHeader>
                <ScheduleClassForm onSuccess={handleClassScheduled} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              يمكن للمعلمين والإدارة جدولة فصول دراسية أو اجتماعات عبر الإنترنت.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الفصول القادمة</CardTitle>
          <CardDescription>انضم إلى الفصول المباشرة المجدولة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الحصة</TableHead>
                  <TableHead>المعلم</TableHead>
                  <TableHead>وقت البدء</TableHead>
                  <TableHead>المنصة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingClasses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">لا توجد فصول قادمة.</TableCell>
                  </TableRow>
                ) : (
                  upcomingClasses?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.title}</TableCell>
                      <TableCell>{cls.classes?.name || 'N/A'}</TableCell>
                      <TableCell>{cls.teachers ? `${cls.teachers.first_name} ${cls.teachers.last_name}` : 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(cls.start_time), 'PPP p')}</TableCell>
                      <TableCell>{cls.platform}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="default" size="sm" onClick={() => window.open(cls.meeting_link, '_blank')} className="mr-2">
                          <Video className="mr-2 h-4 w-4" /> انضم الآن
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveWhiteboardSession({ classId: cls.class_id, sessionId: cls.id, isTeacher: userRole === 'Teacher' || userRole === 'Admin' })}
                        >
                          <WhiteboardIcon className="mr-2 h-4 w-4" /> السبورة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مكتبة الدروس (التسجيلات)</CardTitle>
          <CardDescription>راجع تسجيلات الفصول السابقة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الحصة</TableHead>
                  <TableHead>المعلم</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastClasses?.filter(cls => cls.recorded && cls.recording_link)?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">لا توجد تسجيلات متاحة.</TableCell>
                  </TableRow>
                ) : (
                  pastClasses?.filter(cls => cls.recorded && cls.recording_link).map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.title}</TableCell>
                      <TableCell>{cls.classes?.name || 'N/A'}</TableCell>
                      <TableCell>{cls.teachers ? `${cls.teachers.first_name} ${cls.teachers.last_name}` : 'N/A'}</TableCell>
                      <TableCell>{format(parseISO(cls.start_time), 'PPP')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => window.open(cls.recording_link!, '_blank')}>
                          <Download className="mr-2 h-4 w-4" /> مشاهدة التسجيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlineClasses;