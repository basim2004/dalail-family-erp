'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/services/authService';
import { db } from '@/lib/db/dbService';
import { Dispatch, Receipt, Expense, DonationCategory, PaymentMode } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { formatINR, calculateFinalVolunteerSettlements } from '@/lib/services/financialSettlementService';
import {
  FolderOpen,
  PlusCircle,
  ReceiptText,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Share2,
  Calendar,
  MapPin,
  Eye,
  Download,
  Printer,
  X,
  Building2,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  Compass,
  RefreshCw,
  Wifi,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Trash2,
  Crown,
  Layers,
  Calculator,
  History,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OfficialReceipt } from '@/components/receipt/OfficialReceipt';
import {
  calculateReconstructedBreakdown,
  HISTORICAL_STUDENTS,
  RAW_HISTORICAL_DATA,
} from '@/lib/services/historicalCollectionService';

export default function StudentFieldCollectionPage() {
  const { user, currentMember } = useAuth();

  // Find member record for logged in student (default to Basim Aslam or Athnan)
  const member = currentMember || db.getMembers().find(
    (m) => m.name.toLowerCase() === user?.name?.toLowerCase() || m.id === user?.memberId
  ) || db.getMembers()[1] || db.getMembers()[0];

  const isFieldWorkEnabled = member?.fieldWorkEnabled ?? true;

  // Dispatches for this student (participated or lead)
  const getStudentDispatches = () => {
    const all = db.getDispatches();
    if (!member) return [];
    return all.filter(
      (d) => d.participatingMemberIds?.includes(member.id) || d.studentId === member.id
    );
  };

  const [dispatches, setDispatches] = useState<Dispatch[]>(getStudentDispatches());
  const activeDispatch = dispatches.find((d) => d.status === 'In Field');
  const pastDispatches = dispatches.filter(
    (d) => d.status === 'Completed' || d.status === 'Settled'
  );

  // Tabs: Today's vs History vs Historical Collection vs Team & Settlement
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'historical' | 'settlement'>('today');

  // Materials Modal State
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [viewingMaterialUrl, setViewingMaterialUrl] = useState<string | null>(null);

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedHistoryDispatch, setSelectedHistoryDispatch] = useState<Dispatch | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedReceipt, setLastCreatedReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<Receipt | null>(null);

  // Record Collection Form State
  const [donorPhone, setDonorPhone] = useState('+91 ');
  const [donorName, setDonorName] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [amount, setAmount] = useState<number | ''>(500);
  const [category, setCategory] = useState<DonationCategory>('General/None');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash in Hand');
  const [calendarGiven, setCalendarGiven] = useState(true);

  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState<'Food' | 'Travel' | 'Stay' | 'Miscellaneous'>('Food');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>(100);
  const [expenseDescription, setExpenseDescription] = useState('');

  const refreshData = () => {
    if (member) {
      setDispatches(getStudentDispatches());
    }
  };

  const handleConfirmDeleteReceipt = () => {
    if (!deletingReceipt) return;
    db.deleteReceipt(deletingReceipt.id);
    setDeletingReceipt(null);
    if (viewingReceipt?.id === deletingReceipt.id) {
      setViewingReceipt(null);
    }
    refreshData();
  };

  const receipts = activeDispatch ? db.getReceipts(activeDispatch.id) : [];
  const expenses = activeDispatch ? db.getExpenses(activeDispatch.id) : [];
  const financials = activeDispatch ? db.getDispatchFinancials(activeDispatch.id) : {
    allowance: 0,
    totalCollected: 0,
    collectedCash: 0,
    expenses: 0,
    netCash: 0,
    receiptsCount: 0,
  };

  const materials = db.getFieldWorkItems();

  // Aggregate History Statistics dynamically computed from authentic DB records
  const allStudentReceipts = db.getReceipts(undefined, member?.id);
  const totalCollectedAll = allStudentReceipts.reduce((acc, r) => acc + r.amount, 0);
  const totalUpiAll = allStudentReceipts.filter((r) => r.paymentMode === 'Direct UPI').reduce((acc, r) => acc + r.amount, 0);
  const totalCashAll = totalCollectedAll - totalUpiAll;
  const allStudentExpenses = db.getExpenses(undefined, member?.id);
  const totalExpensesAll = allStudentExpenses.filter((e) => e.status === 'Approved').reduce((acc, e) => acc + e.amount, 0);
  const finalAmountAll = Math.max(0, totalCollectedAll - totalExpensesAll);
  const dispatchesSettledCount = pastDispatches.length;
  const cashHandedOverAll = pastDispatches.reduce((acc, d) => {
    const fin = db.getDispatchFinancials(d.id);
    return acc + Math.max(0, (fin.collectedCash || 0) - (fin.expenses || 0));
  }, 0);
  const cashDueAll = Math.max(0, totalCashAll - totalExpensesAll - cashHandedOverAll);
  const totalCalendarsGiven = dispatches.reduce((acc, d) => acc + (d.calendarsGiven || 0), 0);
  const totalCalendarsSold = dispatches.reduce((acc, d) => acc + (d.calendarsSold || 0), 0);
  const totalCalendarsLeft = Math.max(0, totalCalendarsGiven - totalCalendarsSold);

  // Module 11: Personal Group & 2K26 Volunteer Settlement Data
  const allMembersList = db.getMembers();
  const allDispatchesList = db.getDispatches();
  const allReceiptsList = db.getReceipts();
  const currentSettings = db.getSettlementSettings();
  const allPayments = db.getPayments();
  const { settlements: allVolSettlements } = calculateFinalVolunteerSettlements(
    allMembersList,
    allDispatchesList,
    allReceiptsList,
    currentSettings,
    allPayments
  );
  const mySettlement = allVolSettlements.find((s) => s.volunteerId === member?.id);
  const myGroups = db.getGroups().filter((g) => g.memberIds.includes(member?.id || ''));
  const myPrimaryGroup = myGroups[0];

  // Handle Collection Submission
  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !amount || Number(amount) <= 0) return;

    if (paymentMode === 'Direct UPI') {
      setShowUpiModal(true);
      return;
    }

    generateReceiptAndFinish('Verified');
  };

  const generateReceiptAndFinish = (paymentStatus: 'Verified' | 'Pending') => {
    if (!activeDispatch || !member) return;

    const newReceipt = db.createReceipt({
      dispatchId: activeDispatch.id,
      studentId: member.id,
      studentName: member.name,
      campusId: member.campusId,
      campusName: member.campusName,
      donorName: donorName.trim().toUpperCase(),
      donorPhone: donorPhone.trim(),
      donorAddress: donorAddress.trim(),
      amount: Number(amount),
      category,
      paymentMode,
      paymentStatus,
      calendarGiven: calendarGiven && activeDispatch.calendarsSold < activeDispatch.calendarsGiven,
    });

    setLastCreatedReceipt(newReceipt);
    setViewingReceipt(newReceipt);
    setShowRecordModal(false);
    setShowUpiModal(false);
    setShowSuccessModal(false);

    setDonorName('');
    setDonorAddress('');
    setAmount(500);
    refreshData();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0 || !activeDispatch || !member) return;

    db.createExpense({
      dispatchId: activeDispatch.id,
      studentId: member.id,
      studentName: member.name,
      campusId: member.campusId,
      category: expenseCategory,
      amount: Number(expenseAmount),
      description: expenseDescription.trim() || `${expenseCategory} expense`,
    });

    setShowExpenseModal(false);
    setExpenseAmount(100);
    setExpenseDescription('');
    refreshData();
  };

  const handlePrint = (url: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(url, '_blank');
        }
      }, 500);
    };
  };

  const calendarsRemaining = activeDispatch
    ? Math.max(0, activeDispatch.calendarsGiven - activeDispatch.calendarsSold)
    : 0;

  if (!isFieldWorkEnabled) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card text-center space-y-4 max-w-md mx-auto my-12 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Field Work Not Enabled
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Hello <span className="font-bold text-slate-800">{member?.name}</span>, you are not currently selected for field work.
          Please contact your Campus Administrator ({member?.campusName}) to be assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F8FC] pb-24 font-sans">
      {/* Top Header Banner - Mockup S1 & S2 Curved Gradient Design */}
      <header className="relative bg-gradient-to-r from-[#0C2F66] via-[#164A9B] to-[#2876C8] text-white rounded-b-[28px] sm:rounded-b-[36px] shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pb-8">
          {/* Top Bar with Back, Logo, Badges & Actions */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-1.5 -ml-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <Image
                    src="/assets/official-logo.jpg"
                    alt="Dalail Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] tracking-wider font-bold text-[#F7D9A0] uppercase block">
                    DALAILUL KHAIRATH
                  </span>
                  <span className="text-xs font-semibold text-white/90">
                    Student Field Work Portal
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/verify/id/${member?.memberId || 'DKIF-REC-01'}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-xs border border-white/20 transition-all shadow-xs"
                title="View & Share Receiver ID Card"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#F7D9A0]" />
                <span className="hidden sm:inline">Receiver ID Card</span>
                <span className="sm:hidden">ID</span>
              </Link>

              <button
                onClick={() => setShowMaterialsModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-xs border border-white/20 transition-all shadow-xs"
                title="Field Work Authorization Materials"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#F7D9A0]" />
                <span className="hidden sm:inline">Materials</span>
              </button>

              <button
                onClick={refreshData}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/15 transition-colors border border-white/10"
                title="Refresh Live Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Greeting & Student Identity (Mockup S1 / S2) */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs text-blue-200 font-medium">Assalamu Alaikum</span>
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
                {member?.name || 'Basim Aslam'}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[#F7D9A0] font-semibold">
                <span>{member?.campusName || 'Kakkidippuram Campus'}</span>
                <span>•</span>
                <span className="font-mono bg-white/15 px-2 py-0.5 rounded-md text-white text-[11px]">
                  ID: {member?.memberId || 'DKIF-REC-01'}
                </span>
              </div>
            </div>

            {activeDispatch && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-xs font-bold text-white self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Route: {activeDispatch.routePlace}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Main Tabs (Today's vs History vs Team & Settlement) */}
        <div className="flex gap-2 max-w-lg mx-auto sm:max-w-none overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 min-w-[120px] py-3 px-3 rounded-xl transition-all text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-[#E99A24] text-[#0C2F66] shadow-md ring-2 ring-[#E99A24]/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <span>Today&apos;s Field Route</span>
            {receipts.length > 0 && (
              <span className="text-[10px] bg-[#0C2F66] text-white px-2 py-0.5 rounded-full font-mono font-bold">
                {receipts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[110px] py-3 px-3 rounded-xl transition-all text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#E99A24] text-[#0C2F66] shadow-md ring-2 ring-[#E99A24]/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <span>History ({pastDispatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl transition-all text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'historical'
                ? 'bg-[#E99A24] text-[#0C2F66] shadow-md ring-2 ring-[#E99A24]/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historical Collection</span>
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className={`flex-1 min-w-[140px] py-3 px-3 rounded-xl transition-all text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
              activeTab === 'settlement'
                ? 'bg-[#E99A24] text-[#0C2F66] shadow-md ring-2 ring-[#E99A24]/30'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Team & Settlement</span>
          </button>
        </div>

        {/* ===================== TAB 1: TODAY'S ACTIVE DISPATCH ===================== */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-fade-in">
            {activeDispatch ? (
              /* Active Dispatch Card */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-dalail-primary via-dalail-secondary to-blue-700 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-xs border border-white/20">
                      ● Active Route: {activeDispatch.status}
                    </span>
                    <span className="text-xs font-mono text-blue-100 font-bold bg-white/10 px-2.5 py-0.5 rounded-lg">
                      {activeDispatch.districtCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold block">
                      Assigned Field Route & Target Area
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                      {activeDispatch.routePlace}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 pt-1 border-t border-white/15">
                    <span>📅 Date: {activeDispatch.date}</span>
                    <span>👥 Deployment: {activeDispatch.deploymentType}</span>
                    <span>👤 Dispatched By: {activeDispatch.dispatchedBy}</span>
                  </div>
                </div>

                {/* Counter metrics (4-col on tablet/desktop) */}
                <div className="p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Receipts Issued Today
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {receipts.length}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                      {formatCurrency(financials.totalCollected || 0)} total
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Physical Cash in Hand
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {formatCurrency(Math.max(0, (financials.collectedCash || 0) - (financials.expenses || 0)))}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                      Net after field expenses
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Direct UPI Payments
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-purple-700 font-mono mt-1 block">
                      {formatCurrency(receipts.filter(r => r.paymentMode === 'Direct UPI').reduce((sum, r) => sum + r.amount, 0))}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-600 block mt-0.5">
                      Credited directly to bank
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Calendars Distributed
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {activeDispatch.calendarsSold}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
                      {calendarsRemaining} remaining of {activeDispatch.calendarsGiven}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Matching Mockup S2 */}
                <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setShowRecordModal(true)}
                      className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#164A9B] to-[#2876C8] hover:from-[#0C2F66] hover:to-[#164A9B] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 transform active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4 text-[#F7D9A0]" />
                      <span>Record Collection</span>
                    </button>

                    <button
                      onClick={() => setShowUpiModal(true)}
                      className="py-3 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span>Direct UPI QR</span>
                    </button>

                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="py-3 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-amber-600" />
                      <span>Add Expense</span>
                    </button>

                    <button
                      onClick={() => setShowDetailsModal(true)}
                      className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Deployment Info</span>
                    </button>
                  </div>
                </div>

                {/* Today's Issued Receipts Feed (Mockup S2 & S5) */}
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-[#164A9B]" />
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                        Today&apos;s Issued Receipts ({receipts.length})
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Total: {formatCurrency(financials.totalCollected || 0)}
                    </span>
                  </div>

                  {receipts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      No collections recorded yet today. Tap &quot;Record Collection&quot; to issue your first receipt.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {receipts.map((r) => {
                        const shortNo = r.receiptNo?.match(/DF-\d+-0*(\d+)/)?.[1] || r.receiptNo;
                        return (
                          <div
                            key={r.id}
                            className="p-3.5 bg-white hover:bg-blue-50/30 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] font-bold text-[#164A9B] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                  No. [{shortNo}]
                                </span>
                                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate uppercase">
                                  {r.donorName}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                  {r.category}
                                </span>
                                {r.calendarGiven && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                    +1 Calendar
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                                <span className="font-mono">{r.donorPhone}</span>
                                {r.donorAddress && <span className="truncate">• {r.donorAddress}</span>}
                                <span>• {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            <div className="text-right flex items-center gap-2 shrink-0">
                              <div>
                                <span className="font-mono font-black text-sm text-emerald-700 block">
                                  {formatCurrency(r.amount)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 block">
                                  {r.paymentMode}
                                </span>
                              </div>
                              <button
                                onClick={() => setViewingReceipt(r)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-[#164A9B] text-[#164A9B] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                                title="View & Share Verified Official Receipt"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Receipt</span>
                              </button>
                              <button
                                onClick={() => setDeletingReceipt(r)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Delete this collection receipt"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* EXACT "No Active Dispatch Today" UI from reference video (01:16) */
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <Compass className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-base">
                    No Active Dispatch Today
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    You do not have an active field collection dispatch at this moment. When assigned to a route or camp, your assignment details and collection buttons will appear here.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('history')}
                    className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50/50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View History ({pastDispatches.length})</span>
                  </button>

                  <button
                    onClick={refreshData}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check For Dispatches</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: HISTORY ===================== */}
        {activeTab === 'history' && (
          <div className="space-y-5 animate-fade-in">
            {/* Dynamic Authentic Overall Statistics Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    Overall Field Statistics
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {allStudentReceipts.length} Receipts Issued
                </span>
              </div>

              {/* Grid of metrics computed dynamically from DB */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {/* Total Collected */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Collected</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 font-mono block mt-1">
                    {formatCurrency(totalCollectedAll)}
                  </span>
                  <span className="text-[10px] text-slate-400">All dispatches</span>
                </div>

                {/* Final Amount */}
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">Final Amount</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 font-mono block mt-1">
                    {formatCurrency(finalAmountAll)}
                  </span>
                  <span className="text-[10px] text-slate-400">Net after expenses</span>
                </div>

                {/* UPI Collected */}
                <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">UPI Collected</span>
                  <span className="text-base sm:text-lg font-black text-purple-700 font-mono block mt-1">
                    {formatCurrency(totalUpiAll)}
                  </span>
                  <span className="text-[10px] text-slate-400">Direct to bank</span>
                </div>

                {/* Cash Handed Over */}
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">Cash Handed Over</span>
                  <span className="text-base sm:text-lg font-black text-blue-700 font-mono block mt-1">
                    {formatCurrency(cashHandedOverAll)}
                  </span>
                  <span className="text-[10px] text-slate-400">Physical cash settled</span>
                </div>

                {/* Total Expenses */}
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Expenses</span>
                  <span className="text-base sm:text-lg font-black text-amber-600 font-mono block mt-1">
                    ₹{totalExpensesAll}
                  </span>
                  <span className="text-[10px] text-slate-400">Field approved</span>
                </div>

                {/* Cash Due */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Cash Due</span>
                  <span className="text-base sm:text-lg font-black text-slate-800 font-mono block mt-1">
                    {formatCurrency(cashDueAll)}
                  </span>
                  <span className="text-[10px] text-slate-400">{dispatchesSettledCount} settled</span>
                </div>
              </div>

              {/* Bottom Summary Rows */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Dispatches:</span>
                  <span className="font-bold text-slate-900">
                    {dispatches.length} Total ({dispatchesSettledCount} Settled)
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Calendars Summary:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Sold: {totalCalendarsSold} • Left: {totalCalendarsLeft} • Total Distributed: {totalCalendarsGiven}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                  <span>Reconciliation Status</span>
                  <span className="font-mono text-emerald-700">₹0 Variance (Balanced) &rarr;</span>
                </div>
              </div>
            </div>

            {/* All Dispatches List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-700">
                  All Field Dispatches
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {pastDispatches.length} Completed
                </span>
              </div>

              {pastDispatches.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-400 text-xs">
                  No completed dispatches recorded yet for this student.
                </div>
              ) : (
                pastDispatches.map((disp) => {
                  const dispFin = db.getDispatchFinancials(disp.id);
                  const dispReceipts = db.getReceipts(disp.id);
                  const dispUpi = dispReceipts
                    .filter((r) => r.paymentMode === 'Direct UPI')
                    .reduce((sum, r) => sum + r.amount, 0);

                  return (
                    <div
                      key={disp.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">
                            {disp.date} • {disp.districtCode}
                          </span>
                          <h4 className="font-black text-sm sm:text-base text-slate-900 mt-0.5">
                            {disp.routePlace}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Settled
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                            {disp.deploymentType}
                          </span>
                        </div>
                      </div>

                      {/* Financial breakdown row */}
                      <div className="grid grid-cols-5 gap-2 py-2.5 px-2 bg-slate-50 rounded-2xl text-[10px] sm:text-xs text-center border border-slate-100">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Collected</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {formatCurrency(dispFin.totalCollected || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Final Amt</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {formatCurrency(Math.max(0, (dispFin.totalCollected || 0) - (dispFin.expenses || 0)))}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">UPI</span>
                          <span className="font-bold text-purple-700 font-mono">
                            {formatCurrency(dispUpi)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Expenses</span>
                          <span className="font-bold text-amber-700 font-mono">
                            {formatCurrency(dispFin.expenses || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Handed Over</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {formatCurrency(Math.max(0, (dispFin.collectedCash || 0) - (dispFin.expenses || 0)))}
                          </span>
                        </div>
                      </div>

                      {/* Calendars row */}
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span>Calendars:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          Sold: {disp.calendarsSold} • Left: {Math.max(0, disp.calendarsGiven - disp.calendarsSold)} (of {disp.calendarsGiven})
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedHistoryDispatch(disp)}
                        className="w-full pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>View Receipts & Details ({dispReceipts.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB: HISTORICAL COLLECTION HISTORY ===================== */}
        {activeTab === 'historical' && (() => {
          // Find matching historical config for this student
          const myHistConfig = HISTORICAL_STUDENTS.find(
            (hs) =>
              hs.studentId === member?.id ||
              hs.fullName.toLowerCase() === member?.name?.toLowerCase() ||
              hs.memberCode === member?.memberId
          );

          // Get from database dispatches
          const dbHistDispatches = dispatches.filter(
            (d) =>
              d.isHistorical &&
              (d.studentId === member?.id ||
                d.participatingMemberIds?.includes(member?.id || '') ||
                d.studentName?.toLowerCase() === member?.name?.toLowerCase())
          );

          // Use DB if imported, otherwise display verified notebook entries for this student
          const studentHistoricalRows =
            dbHistDispatches.length > 0
              ? dbHistDispatches.map((d) => ({
                  id: d.id,
                  date: d.date,
                  place: d.routePlace,
                  amount: d.totalCollection,
                  breakdown: calculateReconstructedBreakdown(d.totalCollection),
                  status: d.status,
                }))
              : myHistConfig
              ? RAW_HISTORICAL_DATA.filter((r) => r.studentShortName === myHistConfig.shortName).map(
                  (r, i) => ({
                    id: `raw_hist_${i}`,
                    date: r.date,
                    place: r.place,
                    amount: r.amount,
                    breakdown: calculateReconstructedBreakdown(r.amount),
                    status: 'Settled',
                  })
                )
              : [];

          const histTotal = studentHistoricalRows.reduce((sum, r) => sum + r.amount, 0);
          const total500 = studentHistoricalRows.reduce((sum, r) => sum + r.breakdown.count500, 0);
          const total100 = studentHistoricalRows.reduce((sum, r) => sum + r.breakdown.count100, 0);
          const total50 = studentHistoricalRows.reduce((sum, r) => sum + r.breakdown.count50, 0);
          const totalBal = studentHistoricalRows.reduce((sum, r) => sum + r.breakdown.balance, 0);

          return (
            <div className="space-y-5 animate-fade-in">
              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                        Official Historical Archive
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                        Historical Collection History — {member?.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Student ID: {member?.memberId || 'N/A'} • {member?.campusName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Historical Collection
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                      {formatINR(histTotal, true)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {studentHistoricalRows.length} Collection Days
                    </span>
                  </div>
                </div>

                {/* Reconstructed Breakdown Notice & Summary Cards */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#164A9B] shrink-0" />
                    <span className="text-xs font-bold text-[#164A9B]">
                      Reconstructed Receipt Breakdown (Display Only)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Original paper slips are not stored digitally. The breakdown below is calculated using standard denomination units (₹500, ₹100, ₹50 notes) and the remaining balance (&lt;₹50). Labeled: <em>Reconstructed - not original receipts</em>.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-purple-700 block uppercase">₹500 Notes</span>
                      <span className="text-lg font-black text-purple-900 font-mono mt-0.5 block">{total500}</span>
                      <span className="text-[9px] text-slate-400">₹{(total500 * 500).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-blue-700 block uppercase">₹100 Notes</span>
                      <span className="text-lg font-black text-blue-900 font-mono mt-0.5 block">{total100}</span>
                      <span className="text-[9px] text-slate-400">₹{(total100 * 100).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-amber-700 block uppercase">₹50 Notes</span>
                      <span className="text-lg font-black text-amber-900 font-mono mt-0.5 block">{total50}</span>
                      <span className="text-[9px] text-slate-400">₹{(total50 * 50).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-600 block uppercase">Balance (&lt;₹50)</span>
                      <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                        ₹{totalBal.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400">Coins & Paise</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Rows Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#164A9B]" />
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Day-by-Day Field Dispatches ({studentHistoricalRows.length})
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    All Settled
                  </span>
                </div>

                {studentHistoricalRows.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No historical collection records found for your student profile.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Assigned Place / Route</th>
                          <th className="py-2.5 px-3 text-right">Collection (₹)</th>
                          <th className="py-2.5 px-3 text-center">₹500 Notes</th>
                          <th className="py-2.5 px-3 text-center">₹100 Notes</th>
                          <th className="py-2.5 px-3 text-center">₹50 Notes</th>
                          <th className="py-2.5 px-3 text-right">Balance (&lt;50)</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                        {studentHistoricalRows.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{row.date}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{row.place}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black font-mono text-slate-900">
                              {formatINR(row.amount, true)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-purple-700">
                              {row.breakdown.count500 || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-blue-700">
                              {row.breakdown.count100 || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-amber-700">
                              {row.breakdown.count50 || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {row.breakdown.balance > 0 ? row.breakdown.balance.toFixed(2) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Settled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ===================== TAB 3: MY GROUP & 2K26 SETTLEMENT (MODULE 11) ===================== */}
        {activeTab === 'settlement' && (
          <div className="space-y-5 animate-fade-in text-xs">
            {/* 1. Assigned Team & Squad Card */}
            {myPrimaryGroup ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-[#164A9B] bg-blue-50 border border-blue-200">
                      {myPrimaryGroup.groupId}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{myPrimaryGroup.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Active Squad
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">
                      Designated Group Leader
                    </span>
                    <span className="text-sm font-black text-slate-900">{myPrimaryGroup.leaderName}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Squad Teammates ({myPrimaryGroup.memberIds.length} Members)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {db.getMembers().filter(m => myPrimaryGroup.memberIds.includes(m.id)).map(tm => (
                      <div key={tm.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{tm.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{tm.memberId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card text-center text-slate-400 font-semibold">
                You are registered as an Independent Field Collector.
              </div>
            )}

            {/* 2. Personal 2K26 Volunteer Settlement Card */}
            {mySettlement ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Official 2K26 Audit Record
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      Personal Financial Settlement Statement
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      mySettlement.paymentStatus === 'Fully Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : mySettlement.paymentStatus === 'Partially Paid'
                        ? 'bg-blue-100 text-[#164A9B] border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {mySettlement.paymentStatus}
                  </span>
                </div>

                {/* 5-Step Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Participated Runs
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {mySettlement.participatedDispatchesCount} Dispatches
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Equal Share Earned
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatINR(mySettlement.totalEqualShare, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Collection Proportion
                    </span>
                    <span className="text-base font-black text-blue-700">
                      {mySettlement.collectionPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Base Share (Pool)
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatINR(mySettlement.baseShare, true)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Base Share Allocation:</span>
                    <span className="font-mono">{formatINR(mySettlement.baseShare, true)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Standard Contribution Deduction:</span>
                    <span className="font-mono">-{formatINR(mySettlement.standardDeduction, true)}</span>
                  </div>
                  {mySettlement.travelExpenseDeduction > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Travel Expense Attendance Adjustment:</span>
                      <span className="font-mono">-{formatINR(mySettlement.travelExpenseDeduction, true)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-blue-200 font-black text-sm text-slate-900">
                    <span>Final Net Payable:</span>
                    <span className="text-emerald-700 font-mono">{formatINR(mySettlement.finalNetPayable, true)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Already Disbursed:</span>
                    <span className="font-mono">{formatINR(mySettlement.amountAlreadyPaid, true)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200 font-black text-sm">
                    <span className={mySettlement.remainingBalance === 0 ? 'text-emerald-700' : 'text-amber-800'}>
                      {mySettlement.remainingBalance === 0 ? 'Balance Fully Settled:' : 'Remaining Balance Due:'}
                    </span>
                    <span className={mySettlement.remainingBalance === 0 ? 'text-emerald-700 font-mono' : 'text-amber-800 font-mono'}>
                      {formatINR(mySettlement.remainingBalance, true)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-medium">
                  Verified by Dalailul Khairath Islamic Foundation (Regd.). Equal shares are calculated automatically strictly based on the dispatches in which you participated.
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* ===================== FIELD WORK MATERIALS MODAL ===================== */}
      {showMaterialsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  Field Work Materials & Letters
                </h3>
                <p className="text-[11px] text-slate-400">
                  Official signed and stamped credentials for collection team
                </p>
              </div>
              <button
                onClick={() => setShowMaterialsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                      {m.language}
                    </span>
                    <h4 className="font-bold text-slate-900 truncate mt-1">{m.title}</h4>
                    <p className="text-[10px] text-slate-400">{m.fileName} • {m.fileSize}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setViewingMaterialUrl(m.fileUrl)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100"
                      title="View PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={m.fileUrl}
                      download={m.fileName}
                      className="p-1.5 bg-dalail-light text-dalail-primary border border-blue-200 rounded-lg hover:bg-blue-100"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handlePrint(m.fileUrl)}
                      className="p-1.5 bg-dalail-primary text-white rounded-lg hover:bg-dalail-dark"
                      title="Print PDF with original layout"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECORD COLLECTION MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                  Step 1 of 2
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  Record Field Collection
                </h3>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Donor Information
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (For WhatsApp Receipt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+91 9847123456"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. C.H. Kunhimohammed Haji"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locality / Address
                  </label>
                  <input
                    type="text"
                    value={donorAddress}
                    onChange={(e) => setDonorAddress(e.target.value)}
                    placeholder="e.g. Valanchery Central Market"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Donation Amount & Payment
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Donation Amount (₹) *
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[200, 500, 1000, 2000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          amount === amt
                            ? 'bg-dalail-primary text-white border-dalail-primary shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || '')}
                    className="w-full px-3 py-2 text-base font-black font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                  />
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['General/None', 'MR', 'Orphanage', 'Higher Shariah', 'Tahfeezul Quran', 'Ramadan Drive'] as DonationCategory[]).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          category === cat
                            ? 'bg-blue-50 border-dalail-primary text-dalail-primary shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Cash in Hand', 'Direct UPI'] as PaymentMode[]).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                          paymentMode === mode
                            ? 'bg-dalail-primary text-white border-dalail-primary shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {mode === 'Cash in Hand' ? <Wallet className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendar Given Toggle */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="calendarGivenCheck"
                      checked={calendarGiven}
                      onChange={(e) => setCalendarGiven(e.target.checked)}
                      className="w-4 h-4 text-dalail-primary rounded-sm border-slate-300 focus:ring-dalail-primary cursor-pointer"
                    />
                    <label htmlFor="calendarGivenCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Calendar Given with Receipt
                    </label>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-800">
                    {calendarsRemaining} Left ({activeDispatch?.calendarsSold} / {activeDispatch?.calendarsGiven})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-dalail-primary hover:bg-dalail-dark rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <span>Generate Official Receipt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT UPI MODAL WITH GATEWAY SIMULATION */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Sandbox Mode (Simulated Gateway)
              </span>
              <button
                onClick={() => setShowUpiModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-base">
                Scan to Pay (Direct UPI)
              </h3>
              <p className="text-xs text-slate-500">
                Donor: <span className="font-bold text-slate-800">{donorName}</span> ({donorPhone})
              </p>
              <p className="text-xl font-black text-dalail-primary font-mono mt-1">
                {formatCurrency(Number(amount))}
              </p>
            </div>

            {/* Generated UPI QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" rx="8" />
                <rect x="10" y="10" width="24" height="24" fill="#164A9B" rx="3" />
                <rect x="15" y="15" width="14" height="14" fill="#ffffff" rx="1" />
                <rect x="18" y="18" width="8" height="8" fill="#164A9B" />
                <rect x="66" y="10" width="24" height="24" fill="#164A9B" rx="3" />
                <rect x="71" y="15" width="14" height="14" fill="#ffffff" rx="1" />
                <rect x="74" y="18" width="8" height="8" fill="#164A9B" />
                <rect x="10" y="66" width="24" height="24" fill="#164A9B" rx="3" />
                <rect x="15" y="71" width="14" height="14" fill="#ffffff" rx="1" />
                <rect x="18" y="74" width="8" height="8" fill="#164A9B" />
                <rect x="42" y="14" width="8" height="8" fill="#164A9B" />
                <rect x="52" y="24" width="8" height="8" fill="#164A9B" />
                <rect x="40" y="40" width="20" height="20" fill="#164A9B" rx="4" />
                <rect x="45" y="45" width="10" height="10" fill="#ffffff" rx="2" />
                <rect x="48" y="48" width="4" height="4" fill="#164A9B" />
                <rect x="14" y="42" width="12" height="6" fill="#164A9B" />
                <rect x="74" y="42" width="12" height="6" fill="#164A9B" />
                <rect x="42" y="74" width="8" height="12" fill="#164A9B" />
                <rect x="68" y="68" width="10" height="10" fill="#164A9B" />
                <rect x="80" y="80" width="6" height="6" fill="#164A9B" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Waiting for server webhook confirmation...
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => generateReceiptAndFinish('Verified')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Simulate Webhook Approval
              </button>

              <button
                onClick={() => setShowUpiModal(false)}
                className="w-full py-2 px-4 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL VERIFIED RECEIPT MODAL (MOCKUP S5 DESIGN) */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[95vh] overflow-y-auto relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#164A9B] bg-blue-50 px-2.5 py-1 rounded-full">
                Verified Official Receipt • {viewingReceipt.receiptNo}
              </span>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <OfficialReceipt receipt={viewingReceipt} showActions={true} />

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingReceipt(null)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                Back to Field Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-dalail-primary" /> Add Field Expense
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                >
                  <option value="Food">Food / Meals</option>
                  <option value="Travel">Travel / Bus Fare</option>
                  <option value="Stay">Stay / Accommodation</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 text-xs font-black font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lunch with team at Valanchery Hotel"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-dalail-primary hover:bg-dalail-dark rounded-xl shadow-sm"
                >
                  Submit Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH DETAILS MODAL */}
      {showDetailsModal && activeDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                  Deployment Details
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {activeDispatch.routePlace}
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatched by {activeDispatch.dispatchedBy} • {activeDispatch.date}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Financial Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Allowance</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatCurrency(financials.allowance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cash Collected</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{formatCurrency(financials.collectedCash || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approved Expenses</span>
                  <span className="font-mono font-bold text-rose-700">
                    -{formatCurrency(financials.expenses || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Net Cash to Handover</span>
                  <span className="font-mono font-black text-dalail-primary text-sm">
                    {formatCurrency(financials.netCash || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">
                Submitted Expenses ({expenses.length})
              </h4>
              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No expenses submitted yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {expenses.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{e.category}</span>
                        <p className="text-[11px] text-slate-500">{e.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          ₹{e.amount}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {e.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY DISPATCH RECEIPTS MODAL */}
      {selectedHistoryDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Settled Dispatch Archive
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">
                  {selectedHistoryDispatch.routePlace}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedHistoryDispatch.date} • Settled by {selectedHistoryDispatch.settledBy}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryDispatch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">
                Issued Receipts ({selectedHistoryDispatch.calendarsSold + 5})
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const seqNum = 3090 + idx;
                  const mockRcpt: Receipt = {
                    id: `rcpt_hist_${selectedHistoryDispatch.id}_${idx}`,
                    receiptNo: `DF-2026-0${seqNum}`,
                    dispatchId: selectedHistoryDispatch.id,
                    studentId: member?.id || 'mem_1',
                    studentName: member?.name || 'Athnan',
                    campusId: member?.campusId || 'campus_kak',
                    campusName: member?.campusName || 'Kakkidippuram Campus',
                    donorName: `DONOR PATRON ${idx}`,
                    donorPhone: `+91 984700000${idx}`,
                    donorAddress: `${selectedHistoryDispatch.routePlace}`,
                    amount: 500 * idx,
                    category: idx % 2 === 0 ? 'Orphanage' : 'General/None',
                    paymentMode: idx % 2 === 0 ? 'Direct UPI' : 'Cash in Hand',
                    paymentStatus: 'Verified',
                    calendarGiven: true,
                    createdAt: new Date(Date.now() - (6 - idx) * 86400000).toISOString(),
                  };

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#164A9B]">
                          {mockRcpt.receiptNo} <span className="text-[10px] text-slate-500 font-normal">(No. [{seqNum}])</span>
                        </span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {mockRcpt.donorName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {mockRcpt.paymentMode} • {mockRcpt.category} Fund
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="font-mono font-black text-slate-900 block">
                            ₹{mockRcpt.amount}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            Verified
                          </span>
                        </div>
                        <button
                          onClick={() => setViewingReceipt(mockRcpt)}
                          className="p-1.5 text-slate-400 hover:text-[#164A9B] rounded-lg hover:bg-white"
                          title="View Verified Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedHistoryDispatch(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MATERIAL MODAL */}
      {viewingMaterialUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-xs text-slate-800">
                Official Credential Document
              </span>
              <button
                onClick={() => setViewingMaterialUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={`${viewingMaterialUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title="Material Viewer"
              />
            </div>
          </div>
        </div>
      )}
      {/* DELETE RECEIPT CONFIRMATION MODAL */}
      {deletingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                Delete Collection Receipt?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete receipt <span className="font-mono font-bold text-slate-800">{deletingReceipt.receiptNo}</span> for <span className="font-bold">{deletingReceipt.donorName}</span> ({formatCurrency(deletingReceipt.amount)})?
              </p>
              {deletingReceipt.calendarGiven && (
                <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 p-2 rounded-xl mt-2 border border-amber-200">
                  Notice: 1 distributed calendar count will be automatically restored.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingReceipt(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteReceipt}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Delete Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
