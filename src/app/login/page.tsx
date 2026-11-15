'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/services/authService';
import { UserRole } from '@/lib/types';
import { SplashLogoAnimation } from '@/components/common/SplashLogoAnimation';
import { FloatingAIChat } from '@/components/common/FloatingAIChat';
import Link from 'next/link';
import { db } from '@/lib/db/dbService';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronLeft,
  Key,
  Send,
  X,
  Smartphone,
  Check,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('campus_admin');
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  // Forgot / Reset Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLookupQuery, setForgotLookupQuery] = useState('');
  const [foundAccount, setFoundAccount] = useState<{
    id: string;
    name: string;
    username: string;
    roleName: string;
    campusName: string;
    phone: string;
    currentPassword?: string;
    type: 'user' | 'member';
  } | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const handleLookupAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);
    setResetSuccess(null);
    setWhatsappSent(false);

    const q = forgotLookupQuery.trim().toLowerCase();
    if (!q) {
      setForgotError('Please enter a username, ID, or registered mobile number.');
      return;
    }

    // Search in users
    const users = db.getUsers();
    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === q ||
        u.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
        u.email.toLowerCase() === q
    );

    if (matchedUser) {
      setFoundAccount({
        id: matchedUser.id,
        name: matchedUser.name,
        username: matchedUser.username,
        roleName:
          matchedUser.role === 'main_admin'
            ? 'Main Admin'
            : matchedUser.role === 'campus_admin'
            ? 'Campus Admin'
            : 'Student / Receiver',
        campusName: matchedUser.campusName || 'Kakkidippuram Main Campus',
        phone: matchedUser.phone || '+91 8547931509',
        currentPassword: matchedUser.password || 'password123',
        type: 'user',
      });
      return;
    }

    // Search in members
    const members = db.getMembers();
    const matchedMember = members.find(
      (m) =>
        (m.studentUsername && m.studentUsername.toLowerCase() === q) ||
        m.memberId.toLowerCase() === q ||
        m.name.toLowerCase().includes(q)
    );

    if (matchedMember) {
      setFoundAccount({
        id: matchedMember.id,
        name: matchedMember.name,
        username:
          matchedMember.studentUsername ||
          matchedMember.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        roleName: 'Official Receiver / Student',
        campusName: matchedMember.campusName,
        phone: matchedMember.phone || '+91 8547931509',
        currentPassword: matchedMember.studentPassword || 'password123',
        type: 'member',
      });
      return;
    }

    setForgotError(
      'No matching account found. Please check your username or contact Admin/Developer at +91 8547931509.'
    );
  };

  const handleApplyNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundAccount || !newPassword.trim()) return;

    if (newPassword.trim().length < 4) {
      setForgotError('Password must be at least 4 characters long.');
      return;
    }

    if (foundAccount.type === 'user') {
      db.updateUserPassword(foundAccount.id, newPassword.trim());
    } else {
      db.updateMemberPassword(foundAccount.id, newPassword.trim());
    }

    setFoundAccount((prev) =>
      prev ? { ...prev, currentPassword: newPassword.trim() } : null
    );
    setResetSuccess('Password updated successfully! You can now sign in with your new password.');
  };

  const handleSendViaWhatsApp = () => {
    if (!foundAccount) return;
    const pwd = foundAccount.currentPassword || newPassword || 'password123';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `*DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)*\n_Official Portal Access Credentials_\n\nAssalamu Alaikum,\nAccount login credentials for Dalail Family ERP:\n\n👤 *Name:* ${foundAccount.name}\n🔑 *Username:* ${foundAccount.username}\n🔒 *Password:* ${pwd}\n🏛️ *Campus:* ${foundAccount.campusName}\n🌐 *Portal Login:* ${origin}/login\n\nOfficial Sender / Developer Desk: +91 8547931509\nEmail: kakkidippuramdkif@gmail.com`;

    // Direct developer WhatsApp number: +91 8547931509
    const targetPhone = '918547931509';
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
    setWhatsappSent(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your username, email, or mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const loggedInUser = login(identifier.trim(), selectedRole);
    if (loggedInUser) {
      if (loggedInUser.role === 'main_admin') {
        router.push('/admin');
      } else if (loggedInUser.role === 'campus_admin') {
        router.push('/campus-admin');
      } else {
        router.push('/student');
      }
    } else {
      setError('Invalid username, ID, or password. Please check your credentials.');
    }
  };

  return (
    <>
      {/* Brand Splash / Logo Animation */}
      <SplashLogoAnimation forceShow={showSplash} onFinish={() => setShowSplash(false)} />

      <div className="min-h-screen bg-[#0C2F66] flex flex-col lg:flex-row overflow-hidden">
        {/* ===================== LAPTOP HERO LEFT PANEL (From Mockup 1_Login) ===================== */}
        <div className="relative flex-[1.2] lg:min-h-screen p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-hidden text-white bg-slate-900">
          {/* Background campus photo with authentic gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/assets/campus-main.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C2F66]/95 via-[#164A9B]/85 to-[#E99A24]/30" />
          <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white p-1.5 shadow-xl flex items-center justify-center shrink-0">
              <Image
                src="/assets/official-logo.jpg"
                alt="Dalailul Khairath Official Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] tracking-[0.2em] font-bold text-[#F7D9A0] uppercase">
                DALAILUL KHAIRATH
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white/90 tracking-wider">
                ISLAMIC FOUNDATION (REGD.)
              </div>
            </div>
          </div>

          {/* Center Brand Title & Mission */}
          <div className="relative z-10 py-5 lg:py-0 max-w-lg">
            <div className="w-12 h-1 bg-[#E99A24] rounded-full mb-3 lg:mb-5" />
            <h1 className="font-playfair text-2xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              Dalail Family ERP
            </h1>
            <p className="mt-2 sm:mt-4 text-xs sm:text-base text-blue-100/90 leading-relaxed max-w-md">
              Centralized Enterprise Platform for Multi-Campus Operations, Authentic Student ID Cards, Dispatches, and Real-Time Field Collections.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs font-semibold text-blue-100">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                ✓ Head Office & Multi-Campus
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                ✓ Verified Receipt Generation
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                ✓ Student Field Work Portal
              </span>
            </div>
          </div>

          {/* Bottom Campus Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/80 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Kakkidippuram Campus • Central Malappuram</span>
            </div>
            <button
              onClick={() => setShowSplash(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7D9A0] transition-colors border border-white/20 font-semibold"
              title="Watch the official splash logo animation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Logo Animation</span>
            </button>
          </div>
        </div>

        {/* ===================== RIGHT LOGIN FORM PANEL ===================== */}
        <div className="flex-1 bg-[#EEF4FC] flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-t-[5px] border-[#E99A24] border-slate-100 animate-fade-in">
            {/* Top Navigation Back to Website */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#164A9B] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Website</span>
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#164A9B] bg-[#EAF3FF] px-2.5 py-1 rounded-full">
                Portal Access
              </span>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#164A9B] tracking-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your designated role to enter the secure foundation portal
              </p>
            </div>

            {/* Role Selection Tabs - Campus Admin and Student Only (No Main Admin button) */}
            <div className="mb-6 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Select Portal Access
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('campus_admin')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'campus_admin'
                      ? 'border-[#164A9B] bg-[#EAF3FF] text-[#164A9B] shadow-xs ring-2 ring-[#164A9B]/10 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-[#164A9B]" />
                  <span className="text-xs leading-tight font-bold">Campus Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'student'
                      ? 'border-[#164A9B] bg-[#EAF3FF] text-[#164A9B] shadow-xs ring-2 ring-[#164A9B]/10 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 text-[#164A9B]" />
                  <span className="text-xs leading-tight font-bold">Student</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Username or Mobile Number
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F1F4F9] border-0 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#164A9B] outline-hidden transition-all"
                    placeholder={
                      selectedRole === 'campus_admin'
                        ? 'Enter username, email, or mobile'
                        : 'Enter student username or ID'
                    }
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      if (identifier) setForgotLookupQuery(identifier);
                    }}
                    className="text-[11px] font-bold text-[#164A9B] hover:underline"
                  >
                    Forgot Password? (Reset & WhatsApp Delivery)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#F1F4F9] border-0 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#164A9B] outline-hidden transition-all"
                    placeholder="Enter password"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#164A9B] to-[#2876C8] hover:from-[#0C2F66] hover:to-[#164A9B] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#164A9B]/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Direct Verification Link */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Have a receipt to verify?{' '}
                <button
                  onClick={() => router.push('/verify/receipt/DF-2026-03101')}
                  className="font-bold text-[#164A9B] hover:underline"
                >
                  Verify Receipt Online
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password / WhatsApp Credentials Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-dalail-primary flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Reset & Send Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    Find your account, set a new password, or send credentials via WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setFoundAccount(null);
                  setResetSuccess(null);
                  setForgotError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-4">
              {/* Lookup Form */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Username, Member ID, or Registered Mobile:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={forgotLookupQuery}
                    onChange={(e) => setForgotLookupQuery(e.target.value)}
                    placeholder="e.g. admin, kakkidippuram, athnan, basim"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dalail-primary outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupAccount()}
                    className="px-4 py-2.5 bg-dalail-primary hover:bg-dalail-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Find Account
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {forgotError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                  {forgotError}
                </div>
              )}

              {/* Success Message */}
              {resetSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {/* Found Account Card */}
              {foundAccount && (
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-dalail-primary">
                        {foundAccount.roleName}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm">{foundAccount.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-lg border text-slate-700">
                      @{foundAccount.username}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-blue-200/50">
                    <p>🏛️ <strong>Campus:</strong> {foundAccount.campusName}</p>
                    <p>📱 <strong>Registered Phone:</strong> {foundAccount.phone}</p>
                  </div>

                  {/* Actions: Reset Password & Send to WhatsApp */}
                  <div className="pt-2 border-t border-blue-200/60 space-y-3">
                    {/* Reset Password Form */}
                    <form onSubmit={handleApplyNewPassword} className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-800">
                        1. Set New Password:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (e.g. Dalail@2026)"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-dalail-primary outline-hidden"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>

                    {/* WhatsApp Sender */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                        2. Send Credentials via Official WhatsApp:
                      </label>
                      <button
                        type="button"
                        onClick={handleSendViaWhatsApp}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Send to Developer WhatsApp (+91 8547931509)</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      {whatsappSent && (
                        <p className="text-[10px] text-emerald-700 font-bold mt-1 text-center">
                          ✓ WhatsApp opened with message for developer (+91 8547931509)!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Foundation Support Footer Note */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Official Sender: <strong>+91 8547931509</strong></span>
                <span>Developer Phone: <strong>+91 8547931509</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />
    </>
  );
}
