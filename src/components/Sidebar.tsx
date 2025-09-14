"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Book, Calendar, ClipboardCheck, GraduationCap, UsersRound, LogOut, Settings } from 'lucide-react';
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
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label, currentRole, allowedRoles }) => {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return null; // Don't render if role not allowed
  }
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary hover:bg-sidebar-accent"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role;

  const navigationItems = [
    { to: '/', icon: Home, label: 'Dashboard', allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
    { to: '/students', icon: Users, label: 'Student Management', allowedRoles: ['admin', 'teacher'] },
    { to: '/teachers', icon: Users, label: 'Teacher Management', allowedRoles: ['admin'] },
    { to: '/classes', icon: Book, label: 'Classes & Timetable', allowedRoles: ['admin', 'teacher'] },
    { to: '/attendance', icon: ClipboardCheck, label: 'Attendance Tracking', allowedRoles: ['admin', 'teacher'] },
    { to: '/grades', icon: GraduationCap, label: 'Grades & Exams', allowedRoles: ['admin', 'teacher'] },
    { to: '/parent-portal', icon: UsersRound, label: 'Parent Portal', allowedRoles: ['parent'] },
    // { to: '/settings', icon: Settings, label: 'Settings', allowedRoles: ['admin'] }, // Future feature
  ];

  return (
    <div className="hidden border-r bg-sidebar-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-primary">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            <span className="">SMS</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                currentRole={userRole}
                allowedRoles={item.allowedRoles}
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <Button onClick={signOut} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export const MobileSidebar = () => {
  const { user, signOut } = useAuth();
  const userRole = user?.user_metadata?.role;

  const navigationItems = [
    { to: '/', icon: Home, label: 'Dashboard', allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
    { to: '/students', icon: Users, label: 'Student Management', allowedRoles: ['admin', 'teacher'] },
    { to: '/teachers', icon: Users, label: 'Teacher Management', allowedRoles: ['admin'] },
    { to: '/classes', icon: Book, label: 'Classes & Timetable', allowedRoles: ['admin', 'teacher'] },
    { to: '/attendance', icon: ClipboardCheck, label: 'Attendance Tracking', allowedRoles: ['admin', 'teacher'] },
    { to: '/grades', icon: GraduationCap, label: 'Grades & Exams', allowedRoles: ['admin', 'teacher'] },
    { to: '/parent-portal', icon: UsersRound, label: 'Parent Portal', allowedRoles: ['parent'] },
  ];

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
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            <span className="sr-only">SMS</span>
          </Link>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              currentRole={userRole}
              allowedRoles={item.allowedRoles}
            />
          ))}
        </nav>
        <div className="mt-auto">
          <Button onClick={signOut} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;