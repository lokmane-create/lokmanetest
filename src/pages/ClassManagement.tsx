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
import SubjectForm from '@/components/SubjectForm';
import ClassForm from '@/components/ClassForm';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleList from '@/components/ScheduleList';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { demoData } from '@/lib/fakeData'; // Import demo data

interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  grade_level: number | null;
  room_number: string | null;
  created_at: string;
  subjects: { name: string }; // Joined data
  teachers: { first_name: string; last_name: string }; // Joined data
}

// Mock fetch functions using demoData
const fetchSubjects = async (): Promise<Subject[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.subjects as Subject[];
};

const fetchClasses = async (): Promise<Class[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return demoData.classes as Class[];
};

const ClassManagement = () => {
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError, refetch: refetchSubjects } = useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError, refetch: refetchClasses } = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const { refetch: refetchSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => Promise.resolve([]), // Placeholder, actual fetch is in ScheduleList
    enabled: false,
  });

  const handleSubjectAdded = () => {
    refetchSubjects();
    setIsSubjectFormOpen(false);
  };

  const handleClassAdded = () => {
    refetchClasses();
    setIsClassFormOpen(false);
  };

  const handleScheduleAdded = () => {
    refetchSchedules();
    setIsScheduleFormOpen(false);
  };

  if (isLoadingSubjects || isLoadingClasses) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">الحصص والجدول</h2>
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

  if (subjectsError) {
    return <div className="text-red-500">Error loading subjects: {subjectsError.message}</div>;
  }

  if (classesError) {
    return <div className="text-red-500">Error loading classes: {classesError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">الحصص والجدول</h2>

      <Tabs defaultValue="classes">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <TabsList>
            <TabsTrigger value="classes">الحصص</TabsTrigger>
            <TabsTrigger value="subjects">المواد</TabsTrigger>
            <TabsTrigger value="timetable">الجدول الزمني</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isClassFormOpen} onOpenChange={setIsClassFormOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsClassFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> إضافة حصة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إضافة حصة جديدة</DialogTitle>
                </DialogHeader>
                <ClassForm onSuccess={handleClassAdded} />
              </DialogContent>
            </Dialog>
            <Dialog open={isSubjectFormOpen} onOpenChange={setIsSubjectFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsSubjectFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> إضافة مادة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إضافة مادة جديدة</DialogTitle>
                </DialogHeader>
                <SubjectForm onSuccess={handleSubjectAdded} />
              </DialogContent>
            </Dialog>
            <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsScheduleFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> إضافة جدول حصة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إضافة جدول حصة جديد</DialogTitle>
                </DialogHeader>
                <ScheduleForm onSuccess={handleScheduleAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="classes">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الحصة</TableHead>
                  <TableHead>المادة</TableHead>
                  <TableHead>المعلم</TableHead>
                  <TableHead>المستوى الدراسي</TableHead>
                  <TableHead>رقم الغرفة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">لا يوجد حصص.</TableCell>
                  </TableRow>
                ) : (
                  classes?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.subjects?.name || 'N/A'}</TableCell>
                      <TableCell>{cls.teachers ? `${cls.teachers.first_name} ${cls.teachers.last_name}` : 'N/A'}</TableCell>
                      <TableCell>{cls.grade_level || 'N/A'}</TableCell>
                      <TableCell>{cls.room_number || 'N/A'}</TableCell>
                      <TableCell>
                        {cls.created_at && !isNaN(new Date(cls.created_at).getTime())
                          ? format(new Date(cls.created_at), 'PPpp')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المادة</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">لا يوجد مواد.</TableCell>
                  </TableRow>
                ) : (
                  subjects?.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.description || 'N/A'}</TableCell>
                      <TableCell>
                        {subject.created_at && !isNaN(new Date(subject.created_at).getTime())
                          ? format(new Date(subject.created_at), 'PPpp')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="timetable">
          <ScheduleList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassManagement;