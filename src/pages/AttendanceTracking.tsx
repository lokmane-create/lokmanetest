"use client";

import React from 'react';

const AttendanceTracking = () => {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Attendance Tracking
        </h3>
        <p className="text-sm text-muted-foreground">
          Mark student attendance and view summaries.
        </p>
      </div>
    </div>
  );
};

export default AttendanceTracking;