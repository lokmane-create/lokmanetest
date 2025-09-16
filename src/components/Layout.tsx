"use client";

import React, { useState } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar, { MobileSidebar } from './Sidebar';
import { MadeWithDyad } from './made-with-dyad';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import AIAssistant from './AIAssistant'; // Import the new AI Assistant component

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">جاري تحميل التطبيق...</p>
      </div>
    );
  }

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <MobileSidebar />
          <div className="w-full flex-1 flex justify-end items-center">
            <Sheet open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
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
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Layout;