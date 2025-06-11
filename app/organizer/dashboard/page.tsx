"use client";

import React from 'react';
import EnhancedOrganizerDashboard from '@/app/Components/EnhancedOrganizerDashboard';
import { ToastProvider } from '@/app/Components/Toast';

export default function OrganizerDashboardPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#111a22]">
        <EnhancedOrganizerDashboard />
      </div>
    </ToastProvider>
  );
}