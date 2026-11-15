'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  CreditCard,
  BookOpen,
  FolderOpen,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  Receipt,
  FileSpreadsheet,
  Calculator,
  LayoutDashboard,
  Wallet,
  History,
} from 'lucide-react';

interface SidebarProps {
  type?: 'main_admin' | 'campus_admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type = 'main_admin' }) => {
  const pathname = usePathname();

  const mainAdminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Collection Groups', href: '/admin/groups', icon: Layers },
    { label: 'Field Dispatches', href: '/admin/dispatches', icon: Calendar },
    { label: 'Historical Collection Import', href: '/admin/historical-import', icon: History },
    { label: 'Expense Management', href: '/admin/expenses', icon: CreditCard },
    { label: '2K26 Volunteer Settlement', href: '/admin/settlement', icon: Calculator },
    { label: 'Financial Reports (14)', href: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Campuses', href: '/admin/campuses', icon: Building2 },
    { label: 'Members & ID Cards', href: '/admin/members', icon: Users },
    { label: 'Campus Admins', href: '/admin/campus-admins', icon: UserCheck },
    { label: 'Field Work Materials', href: '/admin/fieldwork', icon: FolderOpen },
    { label: 'Brochures', href: '/admin/brochures', icon: BookOpen },
  ];

  const campusAdminNav = [
    { label: 'Campus Overview', href: '/campus-admin', icon: Building2 },
    { label: 'Campus Dispatches', href: '/campus-admin/dispatches', icon: Calendar },
    { label: 'Campus Groups', href: '/campus-admin/groups', icon: Layers },
    { label: 'Campus Members', href: '/campus-admin/members', icon: Users },
    { label: 'Field Work Materials', href: '/campus-admin/fieldwork', icon: FolderOpen },
    { label: 'Brochures', href: '/campus-admin/brochures', icon: BookOpen },
  ];

  const navItems = type === 'campus_admin' ? campusAdminNav : mainAdminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex flex-col justify-between p-4 shadow-xs select-none overflow-y-auto">
      <div className="space-y-4">
        <div className="px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {type === 'campus_admin' ? 'Campus Administration' : 'Central ERP Financials'}
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' &&
                item.href !== '/campus-admin' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#164A9B] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#164A9B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Foundation Badge */}
      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2.5 mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/official-logo.jpg"
          alt="Dalail"
          className="w-8 h-8 rounded-full object-contain"
        />
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-900 truncate">Dalailul Khairath</p>
          <p className="text-[10px] text-slate-500 font-medium truncate">Kakkidippuram Campus (HQ)</p>
        </div>
      </div>
    </aside>
  );
};
