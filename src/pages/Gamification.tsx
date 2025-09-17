"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Award, Star, Crown, ClipboardCheck, BookOpen } from 'lucide-react'; // Added ClipboardCheck and BookOpen
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
import { demoData } from '@/lib/fakeData';
import { showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaderboardEntry {
  id: string;
  student_name: string;
  rank: number;
  score: number;
  grade_level: number;
  badges: string[];
}

const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return demoData.leaderboard as LeaderboardEntry[];
};

const Gamification = () => {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  const { data: leaderboard, isLoading, error } = useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  });

  const filteredLeaderboard = leaderboard?.filter(entry =>
    selectedGradeFilter === 'all' || entry.grade_level.toString() === selectedGradeFilter
  ).sort((a, b) => a.rank - b.rank); // Ensure sorted by rank

  const gradeLevelsOptions = Array.from(new Set(demoData.students.map(s => s.grade_level))).sort((a, b) => a - b);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">الألعاب والمكافآت</h2>
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
    return <div className="text-red-500">Error loading leaderboard: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          الألعاب والمكافآت
        </h3>
        <p className="text-sm text-muted-foreground">
          تنافس مع زملائك، واكسب الشارات، وحقق الإنجازات!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لوحة المتصدرين للطلاب</CardTitle>
          <CardDescription>أفضل الطلاب أداءً بناءً على متوسط الدرجات.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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
                  <TableHead>الترتيب</TableHead>
                  <TableHead>اسم الطالب</TableHead>
                  <TableHead>الصف</TableHead>
                  <TableHead>النقاط (متوسط الدرجة)</TableHead>
                  <TableHead>الشارات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaderboard?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">لا يوجد طلاب في لوحة المتصدرين.</TableCell>
                  </TableRow>
                ) : (
                  filteredLeaderboard?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.rank === 1 && <Crown className="inline-block h-5 w-5 text-yellow-500 mr-1" />}
                        {entry.rank}
                      </TableCell>
                      <TableCell>{entry.student_name}</TableCell>
                      <TableCell>{entry.grade_level}</TableCell>
                      <TableCell>{entry.score}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {entry.badges.map((badge, index) => (
                            <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              <Award className="h-3 w-3 mr-1" /> {badge}
                            </span>
                          ))}
                        </div>
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
          <CardTitle>شارات الإنجاز</CardTitle>
          <CardDescription>استكشف الشارات التي يمكن للطلاب كسبها.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <h4 className="font-semibold">شارة المتفوق</h4>
              <p className="text-sm text-muted-foreground">لتحقيق متوسط درجات 90% أو أعلى.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <ClipboardCheck className="h-8 w-8 text-green-500" />
            <div>
              <h4 className="font-semibold">شارة المواظب</h4>
              <p className="text-sm text-muted-foreground">للحضور الكامل لمدة شهر.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <h4 className="font-semibold">شارة القارئ النشط</h4>
              <p className="text-sm text-muted-foreground">لقراءة 5 كتب من المكتبة الرقمية.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Trophy className="h-8 w-8 text-purple-500" />
            <div>
              <h4 className="font-semibold">شارة الإنجاز</h4>
              <p className="text-sm text-muted-foreground">لإكمال جميع الواجبات في الوقت المحدد.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gamification;