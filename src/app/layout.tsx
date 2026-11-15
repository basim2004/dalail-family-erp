import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/services/authService';

export const metadata: Metadata = {
  title: 'Dalail Family ERP — Dalailul Khairath Islamic Foundation',
  description:
    'Comprehensive Campus Management, Field Collection & Financial Settlement ERP for Dalailul Khairath Islamic Foundation (Regd.), Kakkidippuram Campus.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dalail-bg antialiased text-slate-800">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

