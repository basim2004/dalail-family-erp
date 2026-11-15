'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/services/authService';
import { UserRole } from '@/lib/types';
import { SplashLogoAnimation } from '@/components/common/SplashLogoAnimation';
import { FloatingAIChat } from '@/components/common/FloatingAIChat';
import Link from 'next/link';
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
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('main_admin');
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(false);

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

    const success = login(identifier.trim(), selectedRole);
    if (success) {
      if (selectedRole === 'main_admin') {
        router.push('/admin');
      } else if (selectedRole === 'campus_admin') {
        router.push('/campus-admin');
      } else {
        router.push('/student');
      }
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <>
      {/* Brand Splash / Logo Animation */}
      <SplashLogoAnimation forceShow={showSplash} onFinish={() => setShowSplash(false)} />

      <div className="min-h-screen bg-[#0C2F66] flex flex-col lg:flex-row overflow-hidden">
        {/* ===================== LAPTOP HERO LEFT PANEL (From Mockup 1_Login) ===================== */}
        <div className="relative flex-[1.2] lg:min-h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden text-white bg-slate-900">
          {/* Background campus photo with authentic gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/assets/campus-main.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C2F66]/95 via-[#164A9B]/85 to-[#E99A24]/30" />
          <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1.5 shadow-xl flex items-center justify-center">
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
          <div className="relative z-10 py-10 lg:py-0 max-w-lg">
            <div className="w-14 h-1 bg-[#E99A24] rounded-full mb-5" />
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              Dalail <br />
              Family ERP
            </h1>
            <p className="mt-4 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-md">
              Centralized Enterprise Platform for Multi-Campus Operations, Authentic Student ID Cards, Dispatches, and Real-Time Field Collections.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                ✓ Head Office & Multi-Campus
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
                ✓ Verified Receipt Generation
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
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

            {/* Role Switcher Tabs */}
            <div className="mb-6 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Select Portal Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('main_admin')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'main_admin'
                      ? 'border-[#164A9B] bg-[#EAF3FF] text-[#164A9B] shadow-xs ring-2 ring-[#164A9B]/10 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-[#164A9B]" />
                  <span className="text-[11px] leading-tight">Main Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('campus_admin')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'campus_admin'
                      ? 'border-[#164A9B] bg-[#EAF3FF] text-[#164A9B] shadow-xs ring-2 ring-[#164A9B]/10 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-[#164A9B]" />
                  <span className="text-[11px] leading-tight">Campus Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'student'
                      ? 'border-[#164A9B] bg-[#EAF3FF] text-[#164A9B] shadow-xs ring-2 ring-[#164A9B]/10 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white font-medium'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 text-[#164A9B]" />
                  <span className="text-[11px] leading-tight">Student</span>
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
                      selectedRole === 'main_admin'
                        ? 'Enter admin username or email'
                        : selectedRole === 'campus_admin'
                        ? 'Enter campus admin username'
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
                  <span className="text-[11px] text-[#164A9B] hover:underline cursor-pointer">
                    Forgot?
                  </span>
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

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />
    </>
  );
}
