"use client";

import React from 'react';
import AdminCouponManagement from '@/app/Components/AdminCouponManagement';
import { ToastProvider } from '@/app/Components/Toast';

export default function AdminCouponsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#111a22]">
        <AdminCouponManagement />
      </div>
    </ToastProvider>
  );
}