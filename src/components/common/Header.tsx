'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '@/lib/services/authService';
import { db } from '@/lib/db/dbService';
import { UserRole } from '@/lib/types';
import {
  ChevronDown,
  LogOut,
  Building2,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  GraduationCap,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const router = useRouter();

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPasswordStatus({ type: 'error', msg: 'Please enter a new password.' });
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordStatus({ type: 'error', msg: 'Passwords do not match.' });
      return;
    }
    if (user?.id) {
      db.updateUserPassword(user.id, newPassword.trim());
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);
    }
  };

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
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      setShowPasswordModal(true);
                      setPasswordStatus(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#164A9B] transition-colors text-left"
                  >
                    <Key className="w-3.5 h-3.5 text-[#164A9B]" /> Change Password (പാസ്‌വേഡ് മാറ്റുക)
                  </button>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-gradient-to-r from-[#0C2F66] to-[#164A9B] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Change Password</h3>
                  <p className="text-[11px] text-blue-200 truncate max-w-[180px]">
                    User: {user?.name || 'Account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-4">
              {passwordStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordStatus.msg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#164A9B] focus:bg-white outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordText ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Confirm New Password
                </label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#164A9B] focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
