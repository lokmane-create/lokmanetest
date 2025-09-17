"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, BookOpen, Video, FileText, Download } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoData } from '@/lib/fakeData';
import { showSuccess, showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/integrations/supabase/auth';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: string;
  subject_id: string;
  grade_level: number;
  file_url: string;
  uploaded_by: string;
  upload_date: string;
  created_at: string;
  subjects: { name: string };
}

interface Subject {
  id: string;
  name: string;
}

const fetchLibraryItems = async (): Promise<LibraryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.libraryItems as LibraryItem[];
};

const fetchSubjects = async (): Promise<Subject[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.subjects.map(s => ({ id: s.id, name: s.name }));
};

const uploadResourceSchema = z.object({
  title: z.string().min(5, { message: "العنوان يجب أن يتكون من 5 أحرف على الأقل." }),
  description: z.string().optional(),
  type: z.string().min(1, { message: "الرجاء اختيار نوع المورد." }),
  subject_id: z.string().uuid({ message: "الرجاء اختيار مادة." }),
  grade_level: z.coerce.number().min(1).max(12, { message: "المستوى الدراسي يجب أن يكون بين 1 و 12." }),
  file: z.any().refine(file => file?.length > 0, "الرجاء تحميل ملف.").optional(), // Simplified file upload
});

const UploadResourceForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof uploadResourceSchema>>({
    resolver: zodResolver(uploadResourceSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "PDF",
      subject_id: "",
      grade_level: 1,
    },
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[], Error>({
    queryKey: ['allSubjects'],
    queryFn: fetchSubjects,
  });

  const onSubmit = async (values: z.infer<typeof uploadResourceSchema>) => {
    // Simulate file upload and API call
    await new Promise(resolve => setTimeout(resolve, 500));
    showSuccess("تم تحميل المورد بنجاح (محاكاة).");
    onSuccess();
  };

  if (isLoadingSubjects) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>العنوان</FormLabel>
            <Input placeholder="عنوان المورد" {...field} />
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
            <Textarea placeholder="وصف موجز للمورد" {...field} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع المورد</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المورد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">ملف PDF</SelectItem>
                <SelectItem value="E-Book">كتاب إلكتروني</SelectItem>
                <SelectItem value="Video">فيديو</SelectItem>
                <SelectItem value="Notes">ملاحظات</SelectItem>
                <SelectItem value="Homework">واجب منزلي</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="subject_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المادة</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="اختر مادة" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
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
            <FormLabel>المستوى الدراسي</FormLabel>
            <Input type="number" placeholder="1" {...field} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="file"
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <FormItem>
            <FormLabel>الملف</FormLabel>
            <Input
              {...fieldProps}
              type="file"
              onChange={(event) => onChange(event.target.files && event.target.files[0])}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full">تحميل المورد</Button>
    </form>
  );
};


const Library = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const { data: libraryItems, isLoading, error, refetch } = useQuery<LibraryItem[], Error>({
    queryKey: ['libraryItems'],
    queryFn: fetchLibraryItems,
  });

  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError } = useQuery<Subject[], Error>({
    queryKey: ['allSubjects'],
    queryFn: fetchSubjects,
  });

  const handleResourceUploaded = () => {
    setIsUploadFormOpen(false);
    refetch();
  };

  const filteredItems = libraryItems?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'all' || item.subject_id === selectedSubjectFilter;
    const matchesType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;
    const matchesGrade = selectedGradeFilter === 'all' || item.grade_level.toString() === selectedGradeFilter;
    return matchesSearch && matchesSubject && matchesType && matchesGrade;
  });

  const itemTypesOptions = Array.from(new Set(demoData.libraryItems.map(item => item.type)));
  const gradeLevelsOptions = Array.from(new Set(demoData.libraryItems.map(item => item.grade_level))).sort((a, b) => a - b);

  if (isLoading || isLoadingSubjects) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">المكتبة والموارد</h2>
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
    return <div className="text-red-500">Error loading library items: {error.message}</div>;
  }

  if (subjectsError) {
    return <div className="text-red-500">Error loading subjects: {subjectsError.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          المكتبة والموارد
        </h3>
        <p className="text-sm text-muted-foreground">
          تصفح وحمل الكتب الإلكترونية، ملفات PDF، الفيديوهات، والملاحظات.
        </p>
      </div>

      {(userRole === 'Admin' || userRole === 'Teacher') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>تحميل مورد جديد</CardTitle>
            <Dialog open={isUploadFormOpen} onOpenChange={setIsUploadFormOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsUploadFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> تحميل مورد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>تحميل مورد جديد</DialogTitle>
                </DialogHeader>
                <UploadResourceForm onSuccess={handleResourceUploaded} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              يمكن للمعلمين والإدارة تحميل مواد تعليمية جديدة.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الموارد الرقمية</CardTitle>
          <CardDescription>ابحث عن الموارد التعليمية وقم بتصفيتها.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="ابحث عن عنوان أو وصف..."
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={setSelectedSubjectFilter} value={selectedSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="اختر مادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواد</SelectItem>
                {subjects?.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedTypeFilter} value={selectedTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="اختر نوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {itemTypesOptions.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedGradeFilter} value={selectedGradeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="اختر صف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                {gradeLevelsOptions.map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>
                    الصف {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>المادة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المستوى الدراسي</TableHead>
                  <TableHead>تاريخ التحميل</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">لا توجد موارد مطابقة.</TableCell>
                  </TableRow>
                ) : (
                  filteredItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.subjects?.name || 'N/A'}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.grade_level}</TableCell>
                      <TableCell>{format(parseISO(item.upload_date), 'PPP')}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => window.open(item.file_url, '_blank')}>
                          <Download className="mr-2 h-4 w-4" /> تحميل
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

export default Library;