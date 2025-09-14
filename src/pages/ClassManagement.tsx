"use client";

import React from 'react';

const ClassManagement = () => {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Classes & Timetable
        </h3>
        <p className="text-sm text-muted-foreground">
          Create subjects, classrooms, and manage weekly schedules.
        </p>
      </div>
    </div>
  );
};

export default ClassManagement;