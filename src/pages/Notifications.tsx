"use client";

import React from 'react';
import { Bell, PlusCircle } from 'lucide-react';
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

const Notifications = () => {
  // Placeholder data
  const announcements = [
    { id: 1, title: "تذكير باجتماع أولياء الأمور", date: "2024-09-15", target: "الجميع" },
    { id: 2, title: "إجازة اليوم الوطني", date: "2024-09-23", target: "الجميع" },
    { id: 3, title: "تغيير جدول حصة الرياضيات", date: "2024-09-10", target: "طلاب الصف 1" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 text-center pt-6">
        <h3 className="text-2xl font-bold tracking-tight">
          الإشعارات والتنبيهات
        </h3>
        <p className="text-sm text-muted-foreground">
          عرض وإدارة الإعلانات والتذكيرات.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الإعلانات الأخيرة</CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة إعلان
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الجمهور المستهدف</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell>{announcement.date}</TableCell>
                    <TableCell>{announcement.target}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm">عرض</Button>
                      <Button variant="ghost" size="sm">تحرير</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تنبيهات الذكاء الاصطناعي</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>تنبيه: انخفاض حضور الطالب أحمد محمد هذا الأسبوع.</li>
            <li>تنبيه: 3 طلاب لديهم درجات منخفضة في اختبار الرياضيات الأخير.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;