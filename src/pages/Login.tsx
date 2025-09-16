"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Globe } from 'lucide-react';

const arabicLocalization = {
  variables: {
    sign_in: {
      email_label: "البريد الإلكتروني",
      password_label: "كلمة المرور",
      email_input_placeholder: "أدخل البريد الإلكتروني",
      password_input_placeholder: "أدخل كلمة المرور",
      button_label: "تسجيل الدخول",
      social_auth_typography: "أو سجل الدخول باستخدام",
      link_text: "هل نسيت كلمة المرور؟",
      confirmation_code_label: "رمز التأكيد",
      confirmation_code_input_placeholder: "أدخل رمز التأكيد",
      social_provider_text: "تسجيل الدخول بـ {{provider}}",
    },
    sign_up: {
      email_label: "البريد الإلكتروني",
      password_label: "كلمة المرور",
      email_input_placeholder: "أدخل البريد الإلكتروني",
      password_input_placeholder: "أدخل كلمة المرور",
      button_label: "إنشاء حساب",
      social_auth_typography: "أو أنشئ حسابًا باستخدام",
      link_text: "هل لديك حساب بالفعل؟ تسجيل الدخول",
      confirmation_code_label: "رمز التأكيد",
      confirmation_code_input_placeholder: "أدخل رمز التأكيد",
      social_provider_text: "إنشاء حساب بـ {{provider}}",
    },
    forgotten_password: {
      email_label: "البريد الإلكتروني",
      password_label: "كلمة المرور الجديدة",
      email_input_placeholder: "أدخل البريد الإلكتروني",
      button_label: "إرسال تعليمات إعادة تعيين كلمة المرور",
      link_text: "تذكرت كلمة المرور؟ تسجيل الدخول",
      confirmation_code_label: "رمز التأكيد",
      confirmation_code_input_placeholder: "أدخل رمز التأكيد",
    },
    update_password: {
      password_label: "كلمة المرور الجديدة",
      password_input_placeholder: "أدخل كلمة المرور الجديدة",
      button_label: "تحديث كلمة المرور",
    },
    magic_link: {
      email_input_placeholder: "أدخل البريد الإلكتروني",
      button_label: "إرسال رابط سحري",
      link_text: "تسجيل الدخول بكلمة المرور",
    },
    verify_otp: {
      email_input_placeholder: "أدخل البريد الإلكتروني",
      phone_input_placeholder: "أدخل رقم الهاتف",
      token_input_placeholder: "أدخل رمز OTP",
      email_label: "البريد الإلكتروني",
      phone_label: "رقم الهاتف",
      token_label: "رمز OTP",
      button_label: "تأكيد",
      link_text: "تسجيل الدخول بكلمة المرور",
    },
    update_email: {
      new_email_label: "البريد الإلكتروني الجديد",
      new_email_input_placeholder: "أدخل البريد الإلكتروني الجديد",
      button_label: "تحديث البريد الإلكتروني",
    },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

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
    "مدير النظام",
    "مدير المدرسة",
    "أحمد محمد",
    "سارة أحمد",
    "محمد علي",
    "فاطمة حسن"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-cairo text-right">
      <Card className="w-full max-w-md bg-card text-foreground shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <img src="/UPLOAD_YOUR_LOGO.png" alt="Logo" className="mx-auto h-20 w-20 mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">نظام إدارة المدرسة</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">مؤسسة تعليمية لإدارة شؤون الطلاب والمعلمين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">تسجيل الدخول</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">أدخل بياناتك للوصول إلى النظام</p>
          <Auth
            supabaseClient={supabase}
            providers={[]} // Only email/password for now
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))', // Use the primary color from tailwind config
                    brandAccent: 'hsl(var(--primary-foreground))', // Use the primary-foreground color
                  },
                },
              },
            }}
            theme="light" // Use light theme, can be dynamic later
            redirectTo={window.location.origin} // Redirect to home after login
            localization={arabicLocalization}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 border-t">
          <div className="w-full text-center">
            <h4 className="text-lg font-semibold mb-2 text-foreground">حسابات تجريبية (كلمة المرور: demo123)</h4>
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              {demoAccounts.map((account, index) => (
                <li key={index}>{account}</li>
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