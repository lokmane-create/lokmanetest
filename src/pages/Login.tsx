"use client";

import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Globe } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل." }),
});

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && session) {
      navigate('/');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo">
        <p className="text-lg text-gray-700 dark:text-gray-300">جاري تحميل التطبيق...</p>
      </div>
    );
  }

  const demoAccounts = [
    { name: "مدير النظام", email: "admin@school.com", password: "demo123", role: "Admin" },
    { name: "مدير المدرسة", email: "principal@school.com", password: "demo123", role: "Principal" },
    { name: "أحمد محمد", email: "ahmed@student.local", password: "demo123", role: "Student" },
    { name: "سارة أحمد", email: "sara@student.local", password: "demo123", role: "Student" },
    { name: "محمد علي", email: "mohamed@student.local", password: "demo123", role: "Teacher" },
    { name: "فاطمة حسن", email: "fatima@student.local", password: "demo123", role: "Parent" },
    { name: "محاسب", email: "accountant@school.com", password: "demo123", role: "Accountant" },
    { name: "موارد بشرية", email: "hr@school.com", password: "demo123", role: "HR" }
  ];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      showError(`فشل تسجيل الدخول: ${error.message}`);
      console.error("Login error:", error);
    } else {
      showSuccess("تم تسجيل الدخول بنجاح!");
      navigate('/');
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    form.setValue("email", account.email);
    form.setValue("password", account.password);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-cairo text-right">
      <Card className="w-full max-w-md bg-card text-foreground shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <img src="/school_logo.png" alt="Logo" className="mx-auto h-20 w-20 mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">نظام إدارة المدرسة</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">حل متكامل لإدارة الشؤون التعليمية والإدارية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">تسجيل الدخول</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">أدخل بياناتك للوصول إلى النظام</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل البريد الإلكتروني" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                تسجيل الدخول
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 border-t">
          <div className="w-full text-center">
            <h4 className="text-lg font-semibold mb-2 text-foreground">حسابات تجريبية (كلمة المرور: demo123)</h4>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
              {demoAccounts.map((account, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{account.name} ({account.email})</span>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin(account)}>
                    تسجيل الدخول
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between w-full mt-4">
            <Button variant="outline" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              تسجيل الدخول بـ QR
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              العربية
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;