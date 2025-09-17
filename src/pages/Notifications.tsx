"use client";

import React, { useState } from 'react';
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
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/integrations/supabase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Added form components

const announcementSchema = z.object({
  title: z.string().min(5, { message: "العنوان يجب أن يتكون من 5 أحرف على الأقل." }),
  content: z.string().min(10, { message: "المحتوى يجب أن يتكون من 10 أحرف على الأقل." }),
  target_roles: z.array(z.string()).min(1, { message: "الرجاء اختيار جمهور مستهدف واحد على الأقل." }),
});

const AddAnnouncementForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      target_roles: ["الجميع"],
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    if (!user?.id) {
      showError("المستخدم غير مصادق لإضافة إعلان.");
      return;
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    showSuccess("تم إضافة الإعلان بنجاح (محاكاة).");
    onSuccess();
  };

  const availableRoles = ["الجميع", "الطلاب", "المعلمين", "الإدارة", "أولياء الأمور"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="عنوان الإعلان" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المحتوى</FormLabel>
              <FormControl>
                <Textarea placeholder="محتوى الإعلان التفصيلي" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجمهور المستهدف</FormLabel>
              <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value[0]}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجمهور المستهدف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">إضافة إعلان</Button>
      </form>
    </Form>
  );
};


const Notifications = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;
  const [isAddAnnouncementFormOpen, setIsAddAnnouncementFormOpen] = useState(false);

  // Using generated demo data
  const announcements = demoData.notifications.filter(n => n.type === "Announcement");
  const aiAlerts = demoData.notifications.filter(n => n.type === "AI Alert");

  const handleAnnouncementAdded = () => {
    setIsAddAnnouncementFormOpen(false);
    // In a real app, this would trigger a refetch of notifications
    showSuccess("تم إضافة الإعلان بنجاح (محاكاة).");
  };

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
          {(userRole === 'Admin' || userRole === 'Principal') && (
            <Dialog open={isAddAnnouncementFormOpen} onOpenChange={setIsAddAnnouncementFormOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" onClick={() => setIsAddAnnouncementFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> إضافة إعلان
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إضافة إعلان جديد</DialogTitle>
                </DialogHeader>
                <AddAnnouncementForm onSuccess={handleAnnouncementAdded} />
              </DialogContent>
            </Dialog>
          )}
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
                {announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">لا يوجد إعلانات.</TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>{announcement.title}</TableCell>
                      <TableCell>
                        {announcement.date && !isNaN(new Date(announcement.date).getTime())
                          ? format(new Date(announcement.date), 'PPP')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{announcement.target}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => showSuccess(`عرض إعلان: ${announcement.title}`)}>عرض</Button>
                        {(userRole === 'Admin' || userRole === 'Principal') && (
                          <Button variant="ghost" size="sm" onClick={() => showSuccess(`تحرير إعلان: ${announcement.title}`)}>تحرير</Button>
                        )}
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
          <CardTitle>تنبيهات الذكاء الاصطناعي</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {aiAlerts.length === 0 ? (
              <li>لا توجد تنبيهات حالياً من الذكاء الاصطناعي.</li>
            ) : (
              aiAlerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.title}:</strong> {alert.content} (بتاريخ {format(parseISO(alert.date), 'PPP')})
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