'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/lib/services/authService';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (role !== 'main_admin') {
        if (role === 'campus_admin') {
          router.replace('/campus-admin');
        } else {
          router.replace('/student');
        }
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dalail-bg">
        <div className="w-8 h-8 border-4 border-[#164A9B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'main_admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dalail-bg">
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar type="main_admin" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
