'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '@/lib/services/authService';
import { UserRole } from '@/lib/types';
import {
  ChevronDown,
  LogOut,
  Building2,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  GraduationCap,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const router = useRouter();

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'main_admin') {
      router.push('/admin');
    } else if (newRole === 'campus_admin') {
      router.push('/campus-admin');
    } else {
      router.push('/student');
    }
  };

  const getRoleBadge = () => {
    if (role === 'main_admin') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Main Admin</span>;
    }
    if (role === 'campus_admin') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Campus Admin</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Student</span>;
  };

  const homeHref = role === 'main_admin' ? '/admin' : role === 'campus_admin' ? '/campus-admin' : '/student';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-dalail-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href={homeHref}>
          <Logo size="sm" />
        </Link>

        {/* Right Role Switcher & Account Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-dalail-primary bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold"
            >
              {getRoleBadge()}
              <span className="hidden sm:inline text-slate-700 font-bold truncate max-w-[140px]">
                {user?.name || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-float border border-slate-200 py-2 z-50 animate-scale-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                  {user?.campusName && (
                    <p className="text-[10px] text-dalail-primary font-semibold mt-0.5">
                      📍 {user.campusName}
                    </p>
                  )}
                </div>

                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </div>

                <div className="space-y-1 px-1">
                  <button
                    onClick={() => handleRoleChange('main_admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                      role === 'main_admin'
                        ? 'bg-dalail-light text-dalail-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs">Main Admin</div>
                      <div className="text-[10px] text-slate-400">Full System Access</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('campus_admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                      role === 'campus_admin'
                        ? 'bg-dalail-light text-dalail-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs">Campus Admin</div>
                      <div className="text-[10px] text-slate-400">Kakkidippuram Campus Only</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                      role === 'student'
                        ? 'bg-dalail-light text-dalail-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs">Student Panel</div>
                      <div className="text-[10px] text-slate-400">Field Work Collector (ATHNAN)</div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-2 pt-1 px-1">
                  <Link
                    href="/login"
                    onClick={() => setRoleMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Login Page
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
