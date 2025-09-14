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
import ScheduleForm from '@/components/ScheduleForm'; // New import
import ScheduleList from '@/components/ScheduleList'; // New import
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const fetchSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase.from('subjects').select('*').order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const fetchClasses = async (): Promise<Class[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*, subjects(name), teachers(first_name, last_name)')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const ClassManagement = () => {
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false); // New state for schedule form

  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError, refetch: refetchSubjects } = useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  });

  const { data: classes, isLoading: isLoadingClasses, error: classesError, refetch: refetchClasses } = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  // We need to refetch schedules when a new one is added
  const { refetch: refetchSchedules } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => Promise.resolve([]), // Placeholder, actual fetch is in ScheduleList
    enabled: false, // Disable initial fetch here
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
    refetchSchedules(); // Refetch schedules after adding a new one
    setIsScheduleFormOpen(false);
  };

  if (isLoadingSubjects || isLoadingClasses) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Classes & Timetable</h2>
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
      <h2 className="text-3xl font-bold">Classes & Timetable</h2>

      <Tabs defaultValue="classes">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger> {/* New tab trigger */}
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isClassFormOpen} onOpenChange={setIsClassFormOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => setIsClassFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <ClassForm onSuccess={handleClassAdded} />
              </DialogContent>
            </Dialog>
            <Dialog open={isSubjectFormOpen} onOpenChange={setIsSubjectFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsSubjectFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <SubjectForm onSuccess={handleSubjectAdded} />
              </DialogContent>
            </Dialog>
            <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}> {/* New dialog for schedule form */}
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsScheduleFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Class Schedule</DialogTitle>
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
                  <TableHead>Class Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No classes found.</TableCell>
                  </TableRow>
                ) : (
                  classes?.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.subjects?.name || 'N/A'}</TableCell>
                      <TableCell>{cls.teachers ? `${cls.teachers.first_name} ${cls.teachers.last_name}` : 'N/A'}</TableCell>
                      <TableCell>{cls.grade_level || 'N/A'}</TableCell>
                      <TableCell>{cls.room_number || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(cls.created_at), 'PPpp')}</TableCell>
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
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No subjects found.</TableCell>
                  </TableRow>
                ) : (
                  subjects?.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.description || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(subject.created_at), 'PPpp')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="timetable"> {/* New tab content for timetable */}
          <ScheduleList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassManagement;