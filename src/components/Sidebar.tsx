"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Users, UserCog, CalendarDays, ClipboardCheck, GraduationCap,
  DollarSign, MessageSquare, Bell, BarChart, Bot, LogOut, BookOpen, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  currentRole: string | undefined;
  allowedRoles: string[];
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label, currentRole, allowedRoles, onClick }) => {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return null;
  }
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

interface NavigationGroup {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    route: string;
    allowedRoles: string[];
  }[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "الأساسيات",
    items: [
      { icon: Home, label: "لوحة القيادة", route: "/dashboard", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student', 'Accountant', 'HR'] },
      { icon: Users, label: "إدارة الطلاب", route: "/students", allowedRoles: ['Admin', 'Principal', 'Teacher'] },
      { icon: UserCog, label: "إدارة المعلمين", route: "/teachers", allowedRoles: ['Admin', 'Principal', 'HR'] },
      { icon: CalendarDays, label: "الحصص والجدول", route: "/classes", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student'] } // Changed to /classes as it manages timetable
    ]
  },
  {
    title: "العمليات",
    items: [
      { icon: ClipboardCheck, label: "الحضور", route: "/attendance", allowedRoles: ['Admin', 'Principal', 'Teacher'] },
      { icon: BookOpen, label: "الدرجات والامتحانات", route: "/grades", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student'] },
      { icon: DollarSign, label: "المالية", route: "/finance", allowedRoles: ['Admin', 'Principal', 'Accountant'] },
      { icon: UserCog, label: "الموارد البشرية", route: "/hr", allowedRoles: ['Admin', 'HR'] }
    ]
  },
  {
    title: "التواصل والتحليل",
    items: [
      { icon: MessageSquare, label: "المحادثات", route: "/chat", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student', 'HR'] },
      { icon: Bell, label: "الإشعارات", route: "/notifications", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student', 'HR'] },
      { icon: BarChart, label: "التقارير والإحصاءات", route: "/reports", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Accountant', 'HR'] },
      { icon: Bot, label: "مساعد الذكاء الاصطناعي", route: "/ai-assistant", allowedRoles: ['Admin', 'Principal', 'Teacher', 'Student', 'Accountant', 'HR'] }
    ]
  }
];

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role;

  return (
    <div className="hidden border-r bg-sidebar-background md:block" style={{ width: '280px' }}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[72px] items-center border-b px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-primary">
            <img src="/school_logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-lg">نظام إدارة المدرسة</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h4>
                {group.items.map((item) => (
                  <NavLink
                    key={item.route}
                    to={item.route}
                    icon={item.icon}
                    label={item.label}
                    currentRole={userRole}
                    allowedRoles={item.allowedRoles}
                    onClick={item.route === "/ai-assistant" ? () => { /* Handled by Layout SheetTrigger */ } : undefined}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          {/* Placeholder for Switch Account */}
          <Button variant="outline" className="w-full flex items-center gap-2 mb-2">
            <UserCog className="h-4 w-4" />
            تغيير الحساب
          </Button>
          <Button onClick={signOut} className="w-full flex items-center gap-2" variant="destructive">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MobileSidebar = () => {
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <img src="/school_logo.png" alt="Logo" className="h-8 w-8" />
            <span className="sr-only">نظام إدارة المدرسة</span>
          </Link>
          {navigationGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h4>
              {group.items.map((item) => (
                <NavLink
                  key={item.route}
                  to={item.route}
                  icon={item.icon}
                  label={item.label}
                  currentRole={userRole}
                  allowedRoles={item.allowedRoles}
                  onClick={item.route === "/ai-assistant" ? () => { /* Handled by Layout SheetTrigger */ } : undefined}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          {/* Placeholder for Switch Account */}
          <Button variant="outline" className="w-full flex items-center gap-2 mb-2">
            <UserCog className="h-4 w-4" />
            تغيير الحساب
          </Button>
          <Button onClick={signOut} className="w-full flex items-center gap-2" variant="destructive">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;