'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/services/authService';
import { triggerPwaInstall } from '@/components/common/PwaInstallPrompt';
import {
  Menu,
  X,
  UserCheck,
  Phone,
  Home,
  Trophy,
  Building2,
  Headphones,
  GraduationCap,
  Download,
} from 'lucide-react';

interface PublicNavbarProps {
  activeTab?: string;
}

export function PublicNavbar({ activeTab }: PublicNavbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    }
  }, []);

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Campuses', href: '/campuses', icon: Building2 },
    { label: 'Help Desk', href: '/helpdesk', icon: Headphones },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors md:hidden shrink-0"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 bg-white shadow-2xs p-0.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/official-logo.jpg"
                    alt="Dalail Family Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-tight truncate min-w-0">
                  <h1 className="text-xs sm:text-lg font-black text-slate-900 tracking-tight uppercase whitespace-nowrap">
                    <span className="sm:hidden">DALAIL ERP</span>
                    <span className="hidden sm:inline">DALAIL FAMILY ERP</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide truncate hidden sm:block">
                    Dalailul Khairath Islamic Foundation
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: The 4 Independent Public Pages */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      active
                        ? 'text-[#164A9B] bg-blue-50/90 border border-blue-200 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Install App, Hotline & Login Button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {!isStandalone && (
                <button
                  type="button"
                  onClick={() => triggerPwaInstall()}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#164A9B] text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                  title="Install DALAIL FAMILY ERP on your device (Standalone Native App)"
                >
                  <Download className="w-3.5 h-3.5 text-[#164A9B]" />
                  <span className="hidden sm:inline">Install App</span>
                  <span className="sm:hidden text-[11px]">Install</span>
                </button>
              )}

              <a
                href="tel:+917034149149"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                title="Foundation Official Contact"
              >
                <Phone className="w-3.5 h-3.5 text-[#164A9B]" />
                <span className="font-mono text-[11px]">+91 70341 49149</span>
              </a>

              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold shadow-sm transition-all hover:shadow-md"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{user ? 'Portal' : 'Login'}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex md:hidden animate-fade-in">
          <div className="bg-white w-72 max-w-[85vw] h-full shadow-2xl flex flex-col justify-between p-5">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/official-logo.jpg"
                    alt="Logo"
                    className="w-9 h-9 rounded-full object-contain"
                  />
                  <div>
                    <h3 className="font-black text-sm text-slate-900">DALAIL FAMILY</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Public Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${active
                          ? 'bg-blue-50 text-[#164A9B] border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <Icon className="w-4 h-4 text-[#164A9B]" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  triggerPwaInstall();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install App (Standalone)</span>
              </button>

              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2.5 px-3 bg-[#164A9B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In to Dalail ERP</span>
              </Link>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                Dalailul Khairath Islamic Foundation (Regd.)
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

