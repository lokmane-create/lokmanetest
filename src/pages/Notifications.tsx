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
import { demoData } from '@/lib/fakeData'; // Import demo data
import { format } from 'date-fns';

const Notifications = () => {
  // Using generated demo data
  const announcements = demoData.notifications.filter(n => n.type === "Announcement");
  const aiAlerts = demoData.notifications.filter(n => n.type === "AI Alert");

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
                    <TableCell>
                      {announcement.date && !isNaN(new Date(announcement.date).getTime())
                        ? format(new Date(announcement.date), 'PPP')
                        : 'N/A'}
                    </TableCell>
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
            {aiAlerts.length === 0 ? (
              <li>لا توجد تنبيهات حالياً من الذكاء الاصطناعي.</li>
            ) : (
              aiAlerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.title}:</strong> {alert.content} (بتاريخ {format(new Date(alert.date), 'PPP')})
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;