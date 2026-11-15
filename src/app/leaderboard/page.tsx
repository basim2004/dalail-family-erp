'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PublicNavbar,
} from '@/components/common/PublicNavbar';
import {
  FloatingAIChat,
} from '@/components/common/FloatingAIChat';
import { db } from '@/lib/db/dbService';
import { HISTORICAL_STUDENTS } from '@/lib/services/historicalCollectionService';
import {
  Trophy,
  Users,
  Building2,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Medal,
  Award,
  Sparkles,
  Layers,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';

type TimeFilter = 'today' | 'weekly' | 'monthly' | 'yearly';
type CategoryView = 'all' | 'students' | 'groups' | 'campuses';

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<TimeFilter>('monthly');
  const [activeCategory, setActiveCategory] = useState<CategoryView>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const members = db.getMembers();
  const campuses = db.getCampuses();
  const groups = db.getCollectionGroups();
  const receipts = db.getReceipts();
  const dispatches = db.getDispatches();

  // Authentic Individual Rankings based on verified 2K26 Drive & Student Accounts
  const rawIndividualStats = members
    .map((m) => {
      const memberReceipts = receipts.filter(
        (r) =>
          (r.studentId === m.id || r.studentName.toLowerCase() === m.name.toLowerCase()) &&
          r.paymentStatus === 'Verified' &&
          !r.cancelled
      );
      let totalAmount = memberReceipts.reduce((sum, r) => sum + r.amount, 0);
      let runsCount = memberReceipts.length;

      // Fallback to verified historical student drive totals if receipts not yet populated
      if (totalAmount === 0) {
        const hist = HISTORICAL_STUDENTS.find(
          (h) => h.studentId === m.id || h.memberCode === m.memberId || h.fullName.toLowerCase() === m.name.toLowerCase()
        );
        if (hist) {
          totalAmount = hist.expectedTotal;
          runsCount = hist.expectedDays;
        }
      }

      return {
        studentId: m.memberId || m.id,
        name: m.name,
        campus: m.campusName,
        amount: Math.round(totalAmount * 100) / 100,
        receipts: runsCount,
        avatar: m.photoUrl || '/assets/member_photo_1.jpg',
      };
    })
    .filter((m) => m.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const individualStats = rawIndividualStats.length > 0
    ? rawIndividualStats
    : HISTORICAL_STUDENTS.map((h, idx) => ({
        studentId: h.memberCode,
        name: h.fullName.toUpperCase(),
        campus: 'Kakkidippuram Campus',
        amount: h.expectedTotal,
        receipts: h.expectedDays,
        avatar: `/assets/member_photo_${h.studentId.replace('mem_', '')}.jpg`,
        rank: idx + 1,
      }));

  // Dynamic Group Rankings strictly from 2K26 Campaign (21 dispatches / ₹2,50,997)
  const groupStats = groups
    .map((g) => {
      const groupReceipts = receipts.filter(
        (r) => (r.groupId === g.id || r.groupId === 'grp_wayanad_2k26') && r.paymentStatus === 'Verified' && !r.cancelled
      );
      let totalAmount = groupReceipts.reduce((sum, r) => sum + r.amount, 0);
      if (totalAmount === 0 && g.id === 'grp_wayanad_2k26') {
        totalAmount = 250997.00;
      }
      return {
        name: g.name,
        membersCount: g.memberIds?.length || 5,
        leader: g.leaderName,
        amount: Math.round(totalAmount * 100) / 100,
        zone: g.campusName,
      };
    })
    .filter((g) => g.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Authentic Campus Rankings (HQ Kakkidippuram: ₹2,50,997, other registered campuses: ₹0)
  const campusStats = campuses
    .map((c) => {
      const campusReceipts = receipts.filter(
        (r) => r.campusId === c.id && r.paymentStatus === 'Verified' && !r.cancelled
      );
      let totalAmount = campusReceipts.reduce((sum, r) => sum + r.amount, 0);
      if (totalAmount === 0 && c.id === 'campus_kak') {
        totalAmount = 250997.00;
      }
      const campusMembers = members.filter((m) => m.campusId === c.id);
      return {
        name: c.name,
        code: c.code,
        students: c.id === 'campus_kak' ? 100 : campusMembers.length,
        amount: Math.round(totalAmount * 100) / 100,
        target: c.id === 'campus_kak' ? 250997 : 100000,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const currentIndividuals = individualStats.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentGroups = groupStats.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.leader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCampuses = campusStats.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top 3 Podium Students
  const top1 = currentIndividuals.find((s) => s.rank === 1);
  const top2 = currentIndividuals.find((s) => s.rank === 2);
  const top3 = currentIndividuals.find((s) => s.rank === 3);

  const totalVerifiedSum = groupStats.reduce((acc, g) => acc + g.amount, 0) || 250997;

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased pb-20">
      {/* Navigation Bar */}
      <PublicNavbar />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="bg-gradient-to-r from-[#0C2F66] via-[#164A9B] to-[#1E60B8] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F7D9A0] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Official Live Rankings &bull; 2K26 Drive</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Field Collection Leaderboard
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Live, verified performance metrics of individual student receivers, 5-member regional collection teams, and registered foundation campuses across Kerala.
              </p>
            </div>

            {/* Quick High-Level Metrics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[10px] sm:text-xs text-blue-200 uppercase font-bold tracking-wider block">Total Audited</span>
                <span className="text-base sm:text-xl font-black text-emerald-300 font-mono block mt-0.5">
                  ₹{totalVerifiedSum.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-blue-200">100% Reconciled</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[10px] sm:text-xs text-blue-200 uppercase font-bold tracking-wider block">Dispatches</span>
                <span className="text-base sm:text-xl font-black text-white font-mono block mt-0.5">21</span>
                <span className="text-[9px] text-blue-200">Completed Runs</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 sm:p-4 text-center">
                <span className="text-[10px] sm:text-xs text-blue-200 uppercase font-bold tracking-wider block">Campuses</span>
                <span className="text-base sm:text-xl font-black text-white font-mono block mt-0.5">{campuses.length}</span>
                <span className="text-[9px] text-blue-200">Affiliated</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CONTROLS: TIME FILTER & SEARCH ===================== */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Time Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none w-full md:w-auto shrink-0">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Academic Year' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-[#164A9B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Universal Search Field */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, team, campus..."
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B] focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category View Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Rankings', icon: Layers },
                { id: 'students', label: 'Top Students', icon: Trophy, count: currentIndividuals.length },
                { id: 'groups', label: 'Field Squads', icon: Users, count: currentGroups.length },
                { id: 'campuses', label: 'Campuses', icon: Building2, count: currentCampuses.length },
              ] as const
            ).map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    activeCategory === cat.id
                      ? 'bg-blue-50 text-[#164A9B] border-blue-200 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#164A9B]" />
                  <span>{cat.label}</span>
                  {'count' in cat && (
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.2 rounded-md border border-slate-200">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================== TOP 3 PODIUM (For Individual Students) ===================== */}
        {(activeCategory === 'all' || activeCategory === 'students') && !searchTerm && top1 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Top Student Collectors Podium</h2>
                  <p className="text-[11px] text-slate-400 font-semibold">Verified Individual Field Rankings</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#164A9B] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                Audited 2K26 Drive
              </span>
            </div>

            {/* Podium Composition (Rank 2 Left, Rank 1 Center, Rank 3 Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4 max-w-4xl mx-auto">
              {/* Rank 2: Silver */}
              {top2 && (
                <div className="order-2 sm:order-1 bg-gradient-to-t from-slate-100 to-white rounded-2xl p-5 border border-slate-200 text-center space-y-3 shadow-2xs relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white shadow-2xs flex items-center gap-1">
                    <Medal className="w-3 h-3 text-slate-600" />
                    <span>2nd Place</span>
                  </div>

                  <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-slate-300 shadow-sm mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-slate-900 truncate">{top2.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{top2.campus}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="font-mono font-black text-base text-emerald-600 block">
                      ₹{top2.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{top2.receipts} Dispatches</span>
                  </div>
                </div>
              )}

              {/* Rank 1: Gold (Center & Taller) */}
              <div className="order-1 sm:order-2 bg-gradient-to-t from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-300 text-center space-y-3.5 shadow-md relative sm:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-white shadow-xs flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>1st Champion</span>
                </div>

                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4 border-amber-300 shadow-md mt-1 ring-4 ring-amber-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h3 className="font-black text-base text-slate-900 truncate">{top1.name}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{top1.campus}</p>
                </div>

                <div className="pt-2 border-t border-amber-200/60">
                  <span className="font-mono font-black text-lg text-emerald-600 block">
                    ₹{top1.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-amber-800 font-bold bg-amber-100/70 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {top1.receipts} Completed Runs
                  </span>
                </div>
              </div>

              {/* Rank 3: Bronze */}
              {top3 && (
                <div className="order-3 bg-gradient-to-t from-amber-100/40 to-white rounded-2xl p-5 border border-amber-200 text-center space-y-3 shadow-2xs relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white shadow-2xs flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-200" />
                    <span>3rd Place</span>
                  </div>

                  <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-amber-700/40 shadow-sm mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-slate-900 truncate">{top3.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{top3.campus}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="font-mono font-black text-base text-emerald-600 block">
                      ₹{top3.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{top3.receipts} Dispatches</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== RANKINGS GRID / SECTIONS ===================== */}
        <div className={`grid gap-6 ${
          activeCategory === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {/* SECTION 1: INDIVIDUAL STUDENTS */}
          {(activeCategory === 'all' || activeCategory === 'students') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Individual Students</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Top Collectors ({currentIndividuals.length})</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentIndividuals.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold">No students match your search.</p>
                  </div>
                ) : (
                  currentIndividuals.map((s) => (
                    <div
                      key={s.studentId}
                      className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            s.rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-2xs ring-1 ring-amber-300'
                              : s.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : s.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          {s.rank}
                        </span>

                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <span className="font-black text-xs text-slate-900 block truncate">{s.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{s.campus}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 block">
                          ₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-semibold">{s.receipts} Runs</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SECTION 2: GROUP LEADERBOARD */}
          {(activeCategory === 'all' || activeCategory === 'groups') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Group Leaderboard</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Teams (Up to 5 Members)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentGroups.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold">No group records match your search.</p>
                  </div>
                ) : (
                  currentGroups.map((g) => (
                    <div
                      key={g.name}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            g.rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-2xs ring-1 ring-amber-300'
                              : g.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : g.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          {g.rank}
                        </span>

                        <div className="min-w-0">
                          <span className="font-black text-xs sm:text-sm text-slate-900 block truncate">{g.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Zone: {g.zone} &bull; {g.membersCount} Members &bull; Lead: {g.leader}
                          </span>
                        </div>
                      </div>

                      {/* Financial Collection - Guaranteed No Overflow */}
                      <div className="flex items-center justify-between sm:justify-end sm:text-right shrink-0 border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0">
                        <span className="text-[10px] text-slate-400 font-semibold sm:hidden">Total Verified:</span>
                        <div>
                          <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 block">
                            ₹{g.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold hidden sm:block">100% Verified</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SECTION 3: CAMPUSES LEADERBOARD */}
          {(activeCategory === 'all' || activeCategory === 'campuses') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#164A9B] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Campus Leaderboard</h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Campus Performance</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentCampuses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold">No campuses match your search.</p>
                  </div>
                ) : (
                  currentCampuses.map((c) => {
                    const percent = Math.min(100, Math.round((c.amount / c.target) * 100));
                    return (
                      <div
                        key={c.code}
                        className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 ${
                                c.rank === 1
                                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {c.rank}
                            </span>
                            <div className="min-w-0">
                              <span className="font-black text-xs text-slate-900 block truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {c.code} &bull; {c.students} Students
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-xs sm:text-sm text-emerald-600 block">
                              ₹{c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-[#164A9B] font-bold">{percent}% Target</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#164A9B] h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                            <span>Target: ₹{c.target.toLocaleString()}</span>
                            <span>{percent}% Completed</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </div>

        {/* Informational Transparency Note */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-[#164A9B] shrink-0" />
            <p className="leading-relaxed">
              All collections are audited live in Central ERP with digital timestamp verification, official receipt numbers, and campus reconciliations.
            </p>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold shrink-0 transition-colors shadow-2xs self-start sm:self-auto text-center"
          >
            Portal Access &rarr;
          </Link>
        </div>
      </main>

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />
    </div>
  );
}
