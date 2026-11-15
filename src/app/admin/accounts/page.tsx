'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/dbService';
import { CollectionGroup, Member, Dispatch, Receipt, Expense, SettlementSettings } from '@/lib/types';
import {
  formatINR,
  calculateMemberEqualShares,
  calculateFinalVolunteerSettlements,
  calculateDispatchEqualShare,
} from '@/lib/services/financialSettlementService';
import {
  Wallet,
  Users,
  Layers,
  Search,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  FileText,
  DollarSign,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function AdminAccountsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/groups');
  }, [router]);

  const [groups, setGroups] = useState<CollectionGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<SettlementSettings>(db.getSettlementSettings());

  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Member | null>(null);

  const loadData = () => {
    setGroups(db.getGroups());
    setMembers(db.getMembers());
    setDispatches(db.getDispatches());
    setReceipts(db.getReceipts());
    setExpenses(db.getExpenses());
    setSettings(db.getSettlementSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const payments = db.getPayments();
  const { settlements } = calculateFinalVolunteerSettlements(members, dispatches, receipts, settings, payments);
  const memberSharesMap = calculateMemberEqualShares(members, dispatches, receipts);

  // Filter individual settlements
  const filteredSettlements = settlements.filter((s) => {
    const member = members.find((m) => m.id === s.volunteerId);
    return (
      s.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member?.memberId && member.memberId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    return (
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <Wallet className="w-3.5 h-3.5" />
            <span>Module 05</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Separate Group & Individual Financial Accounts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Independent ledgers maintaining strict separation between reporting group summaries and personal volunteer financial ledgers.
          </p>
        </div>
      </div>

      {/* View Switcher Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'individual'
              ? 'bg-[#164A9B] text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Individual-Wise Personal Ledgers ({settlements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'group'
              ? 'bg-[#164A9B] text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Group-Wise Summary Accounts ({groups.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, ID, or group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
          />
        </div>
      </div>

      {/* VIEW A: INDIVIDUAL STUDENT FINANCIAL LEDGERS */}
      {activeTab === 'individual' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Individual Student Receivers Ledger
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Equal share calculated strictly from dispatches actually participated. Zero double counting.
              </p>
            </div>
            <span className="text-xs font-bold text-[#164A9B] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Base Share Pool: {formatINR(settings.baseSharePool, false)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student & ID</th>
                  <th className="py-3.5 px-4 text-center">Dispatches</th>
                  <th className="py-3.5 px-4 text-right">Total Equal Share</th>
                  <th className="py-3.5 px-4 text-right">Share %</th>
                  <th className="py-3.5 px-4 text-right">Base Share</th>
                  <th className="py-3.5 px-4 text-right">Std. Deduction</th>
                  <th className="py-3.5 px-4 text-right">Travel Ded.</th>
                  <th className="py-3.5 px-4 text-right">Net Payable</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSettlements.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-sm">No individual student collections recorded yet.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        All student shares will be calculated dynamically once field dispatches are recorded.
                      </p>
                    </td>
                  </tr>
                )}
                {filteredSettlements.map((s) => {
                  const member = members.find((m) => m.id === s.volunteerId);
                  return (
                    <tr key={s.volunteerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member?.photoUrl || '/assets/member_photo_1.jpg'}
                            alt={s.volunteerName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{s.volunteerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {member?.memberId} • {s.campusName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {s.participatedDispatchesCount} Runs
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatINR(s.totalEqualShare, true)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-blue-700">
                        {s.collectionPercentage.toFixed(2)}%
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold">
                        {formatINR(s.baseShare, true)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-500">
                        -{formatINR(s.standardDeduction, true)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                        {s.travelExpenseDeduction > 0
                          ? `-${formatINR(s.travelExpenseDeduction, true)}`
                          : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        {formatINR(s.finalNetPayable, true)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {formatINR(s.amountAlreadyPaid, true)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-lg ${s.remainingBalance === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                        >
                          {formatINR(s.remainingBalance, true)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForDrawer(member || null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#164A9B] hover:text-white text-slate-700 font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Ledger</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: GROUP-WISE SUMMARY ACCOUNTS */}
      {activeTab === 'group' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => {
            const groupDispatches = dispatches.filter(
              (d) => d.groupId === group.id && d.status !== 'Rejected'
            );
            const totalCollected = groupDispatches.reduce(
              (sum, d) => sum + (d.totalCollection || 0),
              0
            );
            const totalCash = groupDispatches.reduce((sum, d) => sum + (d.cashCollection || 0), 0);
            const totalUPI = groupDispatches.reduce((sum, d) => sum + (d.upiCollection || 0), 0);
            const totalExpenses = groupDispatches.reduce(
              (sum, d) => sum + (d.approvedExpenses || 0),
              0
            );
            const totalHandedOver = groupDispatches.reduce(
              (sum, d) => sum + (d.cashHandedOver || 0),
              0
            );
            const totalCashDue = groupDispatches.reduce((sum, d) => sum + (d.cashDue || 0), 0);

            const settledCount = groupDispatches.filter((d) => d.status === 'Settled').length;
            const pendingCount = groupDispatches.filter((d) => d.status !== 'Settled').length;

            return (
              <div
                key={group.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#164A9B] bg-blue-50 px-2 py-0.5 rounded-full">
                      {group.groupId}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{group.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{group.campusName}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase block">
                      Leader
                    </span>
                    <span className="text-xs font-black text-slate-800">{group.leaderName}</span>
                  </div>
                </div>

                {/* Financial Figures Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Collection</span>
                    <span className="text-sm font-black text-slate-900">{formatINR(totalCollected, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Cash Collected</span>
                    <span className="text-sm font-black text-slate-800">{formatINR(totalCash, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">UPI Verified</span>
                    <span className="text-sm font-black text-[#164A9B]">{formatINR(totalUPI, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Approved Expenses</span>
                    <span className="text-sm font-black text-slate-800">{formatINR(totalExpenses, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Cash Handed Over</span>
                    <span className="text-sm font-black text-emerald-700">{formatINR(totalHandedOver, false)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Cash Due</span>
                    <span
                      className={`text-sm font-black ${totalCashDue === 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                    >
                      {formatINR(totalCashDue, false)}
                    </span>
                  </div>
                </div>

                {/* Dispatch Progress Summary */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">{groupDispatches.length} Total Dispatches:</span>
                    <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {settledCount} Settled
                    </span>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {pendingCount} Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENT DETAILED TRANSACTION HISTORY DRAWER / MODAL */}
      {selectedStudentForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudentForDrawer.photoUrl || '/assets/member_photo_1.jpg'}
                  alt={selectedStudentForDrawer.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="text-[10px] font-black uppercase text-[#164A9B]">
                    Student Financial Account History
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    {selectedStudentForDrawer.name} ({selectedStudentForDrawer.memberId})
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForDrawer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of dispatches in which this member actually participated */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Participated Dispatches & Calculated Equal Shares
              </h4>

              {(() => {
                const participated = dispatches.filter(
                  (d) =>
                    d.participatingMemberIds?.includes(selectedStudentForDrawer.id) &&
                    d.status !== 'Rejected'
                );

                if (participated.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No participating dispatches recorded for this student yet.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {participated.map((d) => {
                      const { eachShare } = calculateDispatchEqualShare(d, receipts);
                      return (
                        <div
                          key={d.id}
                          className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#164A9B]">
                                {d.dispatchId}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-bold text-slate-900">{d.routePlace}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {d.date} • {d.participatingMemberIds.length} Collectors
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-700 block">
                              +{formatINR(eachShare, true)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              of {formatINR(d.totalCollection, false)} total
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

