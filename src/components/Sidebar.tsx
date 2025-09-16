"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Users, UserCog, CalendarDays, ClipboardCheck, GraduationCap,
  DollarSign, MessageSquare, Bell, BarChart, Bot, LogOut, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

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
      { icon: Home, label: "لوحة القيادة", route: "/dashboard", allowedRoles: ['Admin', 'Teacher', 'Student'] },
      { icon: Users, label: "الطلاب", route: "/students", allowedRoles: ['Admin', 'Teacher'] },
      { icon: UserCog, label: "المعلمين", route: "/teachers", allowedRoles: ['Admin'] },
      { icon: CalendarDays, label: "الجدول", route: "/timetable", allowedRoles: ['Admin', 'Teacher', 'Student'] }
    ]
  },
  {
    title: "الإدارة",
    items: [
      { icon: ClipboardCheck, label: "الحضور", route: "/attendance", allowedRoles: ['Admin', 'Teacher'] },
      { icon: BookOpen, label: "الدرجات والامتحانات", route: "/grades", allowedRoles: ['Admin', 'Teacher', 'Student'] },
      { icon: DollarSign, label: "المالية", route: "/finance", allowedRoles: ['Admin'] },
      { icon: Users, label: "الموارد البشرية", route: "/hr", allowedRoles: ['Admin'] } // Using Users for HR for now
    ]
  },
  {
    title: "التواصل والتقارير",
    items: [
      { icon: MessageSquare, label: "المحادثات", route: "/chat", allowedRoles: ['Admin', 'Teacher', 'Student'] },
      { icon: Bell, label: "الإشعارات", route: "/notifications", allowedRoles: ['Admin', 'Teacher', 'Student'] },
      { icon: BarChart, label: "التقارير", route: "/reports", allowedRoles: ['Admin', 'Teacher'] },
      { icon: Bot, label: "مساعد الذكاء الاصطناعي", route: "/ai", allowedRoles: ['Admin', 'Teacher', 'Student'] }
    ]
  }
];

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role;

  return (
    <div className="hidden border-r bg-sidebar-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-primary">
            <img src="/school_logo.png" alt="Logo" className="h-6 w-6" />
            <span className="">نظام إدارة المدرسة</span>
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
                    onClick={item.route === "/ai" ? () => { /* Handled by Layout SheetTrigger */ } : undefined}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Button onClick={signOut} className="w-full flex items-center gap-2">
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
            <img src="/school_logo.png" alt="Logo" className="h-6 w-6" />
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
                  onClick={item.route === "/ai" ? () => { /* Handled by Layout SheetTrigger */ } : undefined}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          <Button onClick={signOut} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;