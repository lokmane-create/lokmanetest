"use client";

import React, { useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar, { MobileSidebar } from './Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot, UserCircle } from 'lucide-react'; // Added UserCircle for avatar
import AIAssistant from './AIAssistant'; // Import the new AI Assistant component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { session, loading, user } = useAuth(); // Destructure user from useAuth
  const navigate = useNavigate();
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-gray-700 dark:text-gray-300">جاري تحميل التطبيق...</p>
      </div>
    );
  }

  if (!session) {
    navigate('/login');
    return null;
  }

  const userFirstName = user?.user_metadata?.first_name || user?.email?.split('@')[0];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]"> {/* Adjusted sidebar width */}
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-[72px] items-center gap-4 border-b bg-background px-4 lg:px-6"> {/* Adjusted header height */}
          <MobileSidebar />
          <div className="w-full flex-1 flex justify-end items-center gap-4">
            {/* User Avatar and Name */}
            <div className="flex items-center gap-2">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
              <span className="font-medium text-sm hidden sm:inline">{userFirstName}</span>
            </div>
            {/* Quick Actions (Placeholder) */}
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              الإشعارات
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              الإعدادات
            </Button>
            {/* AI Assistant Quick Open */}
            <Sheet open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Bot className="h-4 w-4" />
                  <span className="sr-only">Open AI Assistant</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                <AIAssistant />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          Made by lokzeg
        </footer>
      </div>
    </div>
  );
};

export default Layout;