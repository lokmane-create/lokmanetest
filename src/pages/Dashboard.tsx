"use client";

import React from 'react';
import { useAuth } from '@/integrations/supabase/auth';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role;

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Welcome to your Dashboard, {user?.user_metadata?.first_name || user?.email}!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your role: <span className="font-semibold capitalize">{userRole}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is your central hub. More features and AI insights will appear here soon!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;