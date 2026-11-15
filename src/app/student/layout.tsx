'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { useAuth } from '@/lib/services/authService';

export default function StudentLayout({
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
      } else if (role === 'campus_admin') {
        router.replace('/campus-admin');
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FC]">
        <div className="w-8 h-8 border-4 border-[#164A9B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role === 'campus_admin') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC]">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-20">
        {children}
      </main>
    </div>
  );
}
