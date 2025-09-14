"use client";

import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';

const ParentPortal = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Parent Portal
        </h3>
        <p className="text-sm text-muted-foreground">
          Welcome, {user?.user_metadata?.first_name || user?.email}! View your child's attendance, grades, and announcements here.
        </p>
      </div>
    </div>
  );
};

export default ParentPortal;