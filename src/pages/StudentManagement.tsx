"use client";

import React from 'react';

const StudentManagement = () => {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Student Management
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage student profiles, classes, and grade levels here.
        </p>
      </div>
    </div>
  );
};

export default StudentManagement;