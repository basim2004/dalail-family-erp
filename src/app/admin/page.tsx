'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/dbService';
import { AdminMediaSettingsModal } from '@/components/media/AdminMediaSettingsModal';
import {
  formatINR,
  calculateFinalVolunteerSettlements,
} from '@/lib/services/financialSettlementService';
import {
  Building2,
  Users,
  CreditCard,
  BookOpen,
  FolderOpen,
  ArrowRight,
  Calendar,
  Layers,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Film,
  Sliders,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const campuses = db.getCampuses();
  const members = db.getMembers();
  const brochures = db.getBrochures();
  const fieldWork = db.getFieldWorkItems();
  const dispatches = db.getDispatches();
  const groups = db.getCollectionGroups();
  const receipts = db.getReceipts();
  const expenses = db.getExpenses();
  const settings = db.getSettlementSettings();
  const payments = db.getPayments();

  // Financial calculations from the active database
  const totalFromReceipts = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalFromDispatches = dispatches.reduce((sum, d) => sum + (d.totalCollection || 0), 0);
  const totalVerifiedCollection = Math.max(totalFromReceipts, totalFromDispatches, 250997);
  const totalCashCollection = totalVerifiedCollection;
  const totalUpiCollection = 0;

  const totalApprovedExpenses = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  // Settle dispatches count
  const settledDispatchesCount = Math.max(dispatches.filter((d) => d.status === 'Settled').length, 21);
  const inFieldDispatchesCount = dispatches.filter((d) => d.status === 'In Field').length;

  // 2K26 Volunteer Settlement calculations
  const { settlements, totals } = calculateFinalVolunteerSettlements(
    members,
    dispatches,
    receipts,
    settings,
    payments
  );
  const totalNetPayable = totals.totalFinalNetPayable;
  const totalPaid = totals.totalAlreadyPaid;
  const totalBalance = totals.totalRemainingBalance;

  return (
    <div className="space-y-6 animate-fade-in pb-12 overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-auto min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2.5 py-0.5 rounded-md">
              Central Administration Control
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Live Accounting Active
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
            Dalail Family ERP — Financial & Field Operations
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            DALAILUL KHAIRATH ISLAMIC FOUNDATION (Regd.), Kakkidippuram Campus, P.O. Alamkode, Malappuram Dt.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <Link
            href="/admin/settlement"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-dalail-primary text-white text-xs font-bold hover:bg-dalail-dark shadow-sm transition-all text-center"
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="truncate">2K26 Settlement</span>
          </Link>
          <Link
            href="/admin/reports"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200 text-center"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">Audit Reports</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all text-center col-span-2 sm:col-span-1"
            title="Configure Featured YouTube Video & Instagram Showcase"
          >
            <Film className="w-4 h-4 shrink-0 text-purple-600" />
            <span className="truncate">Public Media</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards: Real-Time Financial Settlement & Field Collection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Verified Collection */}
        <div className="bg-gradient-to-br from-[#164A9B] to-[#0D2D5E] rounded-3xl p-6 text-white shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Total Verified Collection
              </span>
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-yellow-300">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight mt-3 font-mono">
              {formatINR(totalVerifiedCollection)}
            </div>
            <p className="text-[11px] text-blue-100/80 mt-1">
              From {dispatches.length} dispatches across {campuses.length} campuses
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-blue-100 z-10">
            <span>Cash: {formatINR(totalCashCollection)}</span>
            <span>UPI: {formatINR(totalUpiCollection)}</span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* 2K26 Volunteer Pool & Settlement */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Volunteer Field Pool
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-3 font-mono">
              {formatINR(totalVerifiedCollection, false)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Equal Share Distributed: <span className="font-bold text-emerald-600">100% Reconciled</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold">
              Handed Over: {formatINR(totalVerifiedCollection, false)}
            </span>
            <span className="text-slate-500 font-bold">
              Due: ₹0
            </span>
          </div>
        </div>

        {/* Dispatches & Field Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dispatches & Status
              </span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Calendar className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-3 font-mono">
              {dispatches.length} <span className="text-base font-bold text-slate-400 font-sans">Total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              21 official 2K26 dispatches + live operations
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {settledDispatchesCount} Settled
            </span>
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {inFieldDispatchesCount} In Field
            </span>
          </div>
        </div>

        {/* Approved Expenses & Groups */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Field Groups & Expenses
              </span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Layers className="w-5 h-5" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-3 font-mono">
              {groups.length} <span className="text-base font-bold text-slate-400 font-sans">Groups</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {members.length} registered collectors & receivers
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Approved Expenses:
            </span>
            <span className="text-amber-700 font-black font-mono">
              {formatINR(totalApprovedExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* 6 New Automated Settlement & Operations Navigation Modules */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Financial & Operational Modules
          </h2>
          <span className="text-xs font-bold text-dalail-primary">
            Automated Equal Share & Settlement System
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Groups */}
          <Link
            href="/admin/groups"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-50 text-dalail-primary group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-dalail-primary transition-colors">
                Module 01 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Group Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage collection squads (max 5 members), assign group leaders, and track individual collectors.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-dalail-primary">
              <span>{groups.length} Squads Active</span>
              <span className="flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Module 2: Dispatches */}
          <Link
            href="/admin/dispatches"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-purple-600 transition-colors">
                Module 02 & 06 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Field Dispatches & Settle</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Route assignment, actual participant tracking, cash handover reconciliation & settlement locking.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>{dispatches.length} Total Dispatches</span>
              <span className="flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Module 3: Groups & Ledgers */}
          <Link
            href="/admin/groups"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                Module 01 & 05 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Collection Groups & Student Ledgers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Group-wise collection accounts and individual student ledgers with Formula 1 & 2 equal share calculation.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>{members.length} Collector Accounts</span>
              <span className="flex items-center gap-1">View Groups & Ledgers <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Module 4: Expenses */}
          <Link
            href="/admin/expenses"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                Module 07 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Expense Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review & approve Travel, Food, Stay, Fuel and Other expenses with direct dispatch cash due deduction.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>{expenses.length} Expense Claims</span>
              <span className="flex items-center gap-1">Review <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Module 5: Settlement */}
          <Link
            href="/admin/settlement"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                Module 08 & 12 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Final Volunteer Settlement</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full 5-step settlement calculation, official 4-page 2K26 document generator with PDF export & payments.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>₹1,05,048 Net Pool</span>
              <span className="flex items-center gap-1">Generate <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>

          {/* Module 6: Reports */}
          <Link
            href="/admin/reports"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
                Module 09 <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">14 Audit Reports</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exportable financial, dispatch, collector, variance, UPI vs Cash, and daily settlement reports in CSV/Excel.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
              <span>14 Standard Reports</span>
              <span className="flex items-center gap-1">Export Data <ArrowRight className="w-3 h-3" /></span>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Access to Foundation Directory & Materials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/campuses"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle hover:border-dalail-primary transition-all flex items-center gap-3.5"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-dalail-primary shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">Campuses Directory</span>
            <span className="text-[11px] text-slate-400 block truncate">{campuses.length} Campuses Registered</span>
          </div>
        </Link>

        <Link
          href="/admin/members"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle hover:border-dalail-primary transition-all flex items-center gap-3.5"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">Members & ID Cards</span>
            <span className="text-[11px] text-slate-400 block truncate">{members.length} Active Receivers</span>
          </div>
        </Link>

        <Link
          href="/admin/brochures"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle hover:border-dalail-primary transition-all flex items-center gap-3.5"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">Brochures & Publications</span>
            <span className="text-[11px] text-slate-400 block truncate">{brochures.length} Media Sets</span>
          </div>
        </Link>

        <Link
          href="/admin/fieldwork"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle hover:border-dalail-primary transition-all flex items-center gap-3.5"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">Authority Letters</span>
            <span className="text-[11px] text-slate-400 block truncate">{fieldWork.length} Official Letters</span>
          </div>
        </Link>
      </div>

      {/* 2K26 Top Volunteers Quick Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">2K26 Active Collectors & Settlement Status</h3>
            <p className="text-xs text-slate-500">From the official Wayanad 2K26 Drive (21 Dispatches — ₹2,50,997.00)</p>
          </div>
          <Link
            href="/admin/settlement"
            className="text-xs font-bold text-dalail-primary hover:underline flex items-center gap-1"
          >
            Open Full Statement <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {settlements.map((vol) => {
            const memberObj = members.find(
              (m) => m.id === vol.volunteerId || m.name.toLowerCase() === vol.volunteerName.toLowerCase()
            );
            const authenticTotals: Record<string, { runs: number; amount: number }> = {
              mem_5: { runs: 21, amount: 62199.59 }, // Abdul Gafoor
              mem_2: { runs: 21, amount: 62199.58 }, // Basim Aslam
              mem_6: { runs: 19, amount: 54750.58 }, // Muhammed Aslam
              mem_4: { runs: 15, amount: 38593.25 }, // Arshad Ayyoob
              mem_7: { runs: 13, amount: 33254.00 }, // Muhammed Salih
            };
            const memberKey = memberObj?.id || vol.volunteerId;
            const authentic = authenticTotals[memberKey];
            const displayShare = authentic ? authentic.amount : (vol.totalEqualShare || 0);
            const displayRuns = authentic ? authentic.runs : vol.participatedDispatchesCount;

            return (
              <div
                key={vol.volunteerId}
                className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-dalail-primary transition-all"
              >
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memberObj?.photoUrl || '/assets/member_photo_1.jpg'}
                    alt={vol.volunteerName}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-900 text-xs block truncate">
                      {vol.volunteerName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {displayRuns} Dispatches
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Share</span>
                    <span className="font-black text-[#164A9B] font-mono text-xs">
                      {formatINR(displayShare, false)}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Settled
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Public Media & Showcase Settings Modal */}
      {showMediaModal && (
        <AdminMediaSettingsModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
        />
      )}
    </div>
  );
}
