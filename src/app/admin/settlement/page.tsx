'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import {
  Member,
  Dispatch,
  Receipt,
  SettlementSettings,
  SettlementPaymentRecord,
  VolunteerSettlement,
} from '@/lib/types';
import {
  formatINR,
  calculateFinalVolunteerSettlements,
  calculateMemberEqualShares,
  calculateDispatchEqualShare,
} from '@/lib/services/financialSettlementService';
import {
  Calculator,
  Printer,
  FileSpreadsheet,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sliders,
  Save,
} from 'lucide-react';

export default function AdminSettlementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [settings, setSettings] = useState<SettlementSettings>(db.getSettlementSettings());
  const [payments, setPayments] = useState<SettlementPaymentRecord[]>([]);

  // Config Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configPool, setConfigPool] = useState(115000);
  const [configStdDed, setConfigStdDed] = useState(790.4);
  const [configTravel, setConfigTravel] = useState<Record<string, number>>({});

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedVolunteerForPayment, setSelectedVolunteerForPayment] = useState<VolunteerSettlement | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'UPI',
    transactionReference: '',
    notes: '',
  });

  // Print Mode State
  const [isPrintMode, setIsPrintMode] = useState(false);

  const loadData = () => {
    setMembers(db.getMembers());
    setDispatches(db.getDispatches());
    setReceipts(db.getReceipts());
    const currentSettings = db.getSettlementSettings();
    setSettings(currentSettings);
    setConfigPool(currentSettings.baseSharePool);
    setConfigStdDed(currentSettings.standardDeductionPerVolunteer);
    setConfigTravel(currentSettings.customTravelDeductions || {});
    setPayments(db.getPayments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const { settlements, totals } = calculateFinalVolunteerSettlements(
    members,
    dispatches,
    receipts,
    settings,
    payments
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateSettlementSettings({
      baseSharePool: Number(configPool),
      standardDeductionPerVolunteer: Number(configStdDed),
      customTravelDeductions: configTravel,
    });
    setSettings(updated);
    setShowConfigModal(false);
    loadData();
  };

  const handleOpenPayment = (vol: VolunteerSettlement) => {
    setSelectedVolunteerForPayment(vol);
    setPaymentFormData({
      amount: vol.remainingBalance,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      transactionReference: `NEFT-2026-${Date.now().toString().slice(-6)}`,
      notes: `Final volunteer settlement payment for ${vol.volunteerName}.`,
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteerForPayment) return;

    db.createPayment({
      volunteerId: selectedVolunteerForPayment.volunteerId,
      volunteerName: selectedVolunteerForPayment.volunteerName,
      amount: Number(paymentFormData.amount),
      paymentDate: paymentFormData.paymentDate,
      paymentMode: paymentFormData.paymentMode,
      transactionReference: paymentFormData.transactionReference,
      notes: paymentFormData.notes,
      approvedBy: 'BASIM ASLAM',
    });

    setShowPaymentModal(false);
    loadData();
  };

  const handleTriggerPrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 2K26 Dispatches for official report view
  const dispatches2K26 = dispatches.filter((d) => d.id.startsWith('disp_2k26'));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <Calculator className="w-3.5 h-3.5" />
            <span>Modules 08 & 12</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Final Volunteer Financial Settlement (2K26 Model)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Multi-tier automatic financial settlement allocating verified collections into equal shares, base share pools, standard deductions, and travel adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Settlement Settings</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="px-4 py-2 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-900/20"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official 2K26 PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collection</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatINR(totals.totalCollection, false)}</div>
          <span className="text-[10px] text-slate-500 font-semibold">{dispatches2K26.length} Dispatches</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Share Pool</span>
          <div className="text-xl font-black text-[#164A9B] mt-1">{formatINR(totals.totalBaseShare, false)}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Configurable Pool</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Std. Deductions</span>
          <div className="text-xl font-black text-slate-700 mt-1">-{formatINR(totals.totalStandardDeduction, false)}</div>
          <span className="text-[10px] text-slate-500 font-semibold">₹790.40 per Volunteer</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Deductions</span>
          <div className="text-xl font-black text-rose-600 mt-1">-{formatINR(totals.totalTravelDeduction, false)}</div>
          <span className="text-[10px] text-rose-600 font-semibold">Attendance Shortage</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Final Net Payable</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatINR(totals.totalFinalNetPayable, false)}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{formatINR(totals.totalAlreadyPaid, false)} Disbursed</span>
        </div>
      </div>

      {/* 5-STEP VOLUNTEER SETTLEMENT LIVE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              5-Step Final Volunteer Settlement Ledger
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Calculated live from database records strictly reproducing the official 2K26 formula.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Paid: {formatINR(totals.totalAlreadyPaid, false)}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Remaining: {formatINR(totals.totalRemainingBalance, false)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Volunteer Name</th>
                <th className="py-3.5 px-4 text-center">Dispatches</th>
                <th className="py-3.5 px-4 text-right">Equal Share (₹)</th>
                <th className="py-3.5 px-4 text-right">Step 1: Pct (%)</th>
                <th className="py-3.5 px-4 text-right">Step 2: Base Share</th>
                <th className="py-3.5 px-4 text-right">Step 3: Std. Ded</th>
                <th className="py-3.5 px-4 text-right">Step 4: Travel Ded</th>
                <th className="py-3.5 px-4 text-right">Final Net Payable</th>
                <th className="py-3.5 px-4 text-right">Already Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status & Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {settlements.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No dispatches or volunteer settlements recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Dispatches recorded in the Field Collection / Dispatch module will automatically appear here with calculated equal shares.
                    </p>
                  </td>
                </tr>
              )}
              {settlements.map((s) => {
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
                            {member?.memberId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-700">
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

                    <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                      {s.travelExpenseDeduction > 0 ? `-${formatINR(s.travelExpenseDeduction, true)}` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                      {formatINR(s.finalNetPayable, true)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {formatINR(s.amountAlreadyPaid, true)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-lg ${
                          s.remainingBalance === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {formatINR(s.remainingBalance, true)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {s.remainingBalance > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(s)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Disburse</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          Fully Paid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Totals Footer Row */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900 text-xs">
              <tr>
                <td className="py-3.5 px-4">Grand Total</td>
                <td className="py-3.5 px-4 text-center">-</td>
                <td className="py-3.5 px-4 text-right">{formatINR(totals.totalEqualShares, true)}</td>
                <td className="py-3.5 px-4 text-right">{totals.totalPercentage}%</td>
                <td className="py-3.5 px-4 text-right">{formatINR(totals.totalBaseShare, true)}</td>
                <td className="py-3.5 px-4 text-right">-{formatINR(totals.totalStandardDeduction, true)}</td>
                <td className="py-3.5 px-4 text-right text-rose-600">-{formatINR(totals.totalTravelDeduction, true)}</td>
                <td className="py-3.5 px-4 text-right text-emerald-700">{formatINR(totals.totalFinalNetPayable, true)}</td>
                <td className="py-3.5 px-4 text-right">{formatINR(totals.totalAlreadyPaid, true)}</td>
                <td className="py-3.5 px-4 text-right">{formatINR(totals.totalRemainingBalance, true)}</td>
                <td className="py-3.5 px-4 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* RECENT SETTLEMENT PAYMENTS LOG */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#164A9B]" />
            <span>Disbursed Settlement Transactions ({payments.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Authorized by Central Administration
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
          {payments.map((p) => (
            <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#164A9B]">{p.paymentId}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-slate-900">{p.volunteerName}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Date: {p.paymentDate} • Mode: {p.paymentMode} • Ref: {p.transactionReference}
                </p>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-900 text-sm block">
                  {formatINR(p.amount, true)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Approved by {p.approvedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== OFFICIAL 2K26 REPORT MODAL / PRINT VIEW ===================== */}
      {isPrintMode && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 sm:p-8 font-sans text-slate-900">
          <div className="max-w-4xl mx-auto space-y-8 bg-white border border-slate-300 p-8 rounded-2xl shadow-2xl print:border-none print:shadow-none print:p-0">
            {/* Print Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500">
                Official 2K26 Document Preview (Matches Physical Printout)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#164A9B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintMode(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* PAGE 1 HEADER (Exact copy from 2K26 official PDF) */}
            <div className="bg-[#1B5E20] text-white p-6 rounded-t-xl text-center space-y-1">
              <h2 className="text-2xl font-black tracking-wider uppercase">
                DALAILUL KHAIRATH ISLAMIC FOUNDATION (Reg)
              </h2>
              <p className="text-xs text-white/90 font-medium">
                Kakkidippuram, P.O. Alankode, Malappuram | Phone: 7034149149
              </p>
            </div>

            {/* SECTION 1: DAILY COLLECTION SUMMARY */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-[#1B5E20] pl-2.5">
                1. DAILY COLLECTION SUMMARY
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#E8F5E9] font-black text-slate-800">
                  <tr>
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Location</th>
                    <th className="p-2 border-b">Collectors</th>
                    <th className="p-2 border-b text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dispatches2K26.map((d) => (
                    <tr key={d.id}>
                      <td className="p-2">{d.date}</td>
                      <td className="p-2 font-semibold">{d.routePlace}</td>
                      <td className="p-2 text-slate-600">
                        {d.participatingMemberNames.map((n) => n.split(' ')[0]).join(', ')}
                      </td>
                      <td className="p-2 text-right font-black">{d.totalCollection.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-sm">
                    <td colSpan={3} className="p-2 text-right">Grand Total Collection</td>
                    <td className="p-2 text-right text-emerald-800">{totals.totalCollection.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2: EQUAL SHARE CALCULATION (DAILY BREAKDOWN) */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-[#1B5E20] pl-2.5">
                2. EQUAL SHARE CALCULATION (DAILY BREAKDOWN)
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#E8F5E9] font-black text-slate-800">
                  <tr>
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b text-right">Amount (₹)</th>
                    <th className="p-2 border-b">Collectors Involved</th>
                    <th className="p-2 border-b text-right">Each Share (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dispatches2K26.map((d) => {
                    const { eachShare } = calculateDispatchEqualShare(d, receipts);
                    return (
                      <tr key={d.id}>
                        <td className="p-2">{d.date}</td>
                        <td className="p-2 text-right font-bold">{d.totalCollection.toLocaleString('en-IN')}</td>
                        <td className="p-2 text-slate-600">
                          {d.participatingMemberNames.map((n) => n.split(' ')[0]).join(', ')}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">{eachShare.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECTION 3: COLLECTION PROPORTIONS & BASE SHARES */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-[#1B5E20] pl-2.5">
                3. COLLECTION PROPORTIONS & BASE SHARES
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#E8F5E9] font-black text-slate-800">
                  <tr>
                    <th className="p-2 border-b">Volunteer Name</th>
                    <th className="p-2 border-b text-right">Collection Amount (₹)</th>
                    <th className="p-2 border-b text-right">Percentage (%)</th>
                    <th className="p-2 border-b text-right">Base Share (₹1,15,000)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {settlements.map((s) => (
                    <tr key={s.volunteerId}>
                      <td className="p-2 font-bold">{s.volunteerName.split(' ')[0]}</td>
                      <td className="p-2 text-right font-mono">{s.totalEqualShare.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">{s.collectionPercentage.toFixed(2)}%</td>
                      <td className="p-2 text-right font-mono font-bold">{s.baseShare.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right font-mono">{totals.totalEqualShares.toFixed(2)}</td>
                    <td className="p-2 text-right">100%</td>
                    <td className="p-2 text-right font-mono">1,15,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 4: SETTLEMENT AFTER STANDARD DEDUCTION */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-[#1B5E20] pl-2.5">
                4. SETTLEMENT AFTER STANDARD DEDUCTION
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#E8F5E9] font-black text-slate-800">
                  <tr>
                    <th className="p-2 border-b">Volunteer Name</th>
                    <th className="p-2 border-b text-right">Base Share (₹)</th>
                    <th className="p-2 border-b text-right">Standard Deduction (₹)</th>
                    <th className="p-2 border-b text-right">Adjusted Share (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {settlements.map((s) => (
                    <tr key={s.volunteerId}>
                      <td className="p-2 font-bold">{s.volunteerName.split(' ')[0]}</td>
                      <td className="p-2 text-right font-mono">{s.baseShare.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-slate-500">
                        {s.standardDeduction.toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-mono font-black">{s.adjustedShare.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right font-mono">{totals.totalBaseShare.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{totals.totalStandardDeduction.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{totals.totalAdjustedShare.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 5: FINAL SETTLEMENT & NET PAYABLE */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-base font-black text-slate-900 border-l-4 border-[#1B5E20] pl-2.5">
                5. FINAL SETTLEMENT & NET PAYABLE
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-[#E8F5E9] font-black text-slate-800">
                  <tr>
                    <th className="p-2 border-b">Volunteer Name</th>
                    <th className="p-2 border-b text-right">Adjusted Share (₹)</th>
                    <th className="p-2 border-b text-right">Travel Expense Deduction (₹)</th>
                    <th className="p-2 border-b text-right">Final Net Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {settlements.map((s) => (
                    <tr key={s.volunteerId}>
                      <td className="p-2 font-bold">{s.volunteerName.split(' ')[0]}</td>
                      <td className="p-2 text-right font-mono">{s.adjustedShare.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-rose-600">
                        {s.travelExpenseDeduction > 0 ? s.travelExpenseDeduction.toFixed(2) : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-black text-emerald-800">
                        {s.finalNetPayable.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black">
                    <td className="p-2">Grand Total</td>
                    <td className="p-2 text-right font-mono">{totals.totalAdjustedShare.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-rose-600">
                      {totals.totalTravelDeduction.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-800">
                      {totals.totalFinalNetPayable.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IMPORTANT NOTE / അറിയിപ്പ് (Strictly transcribed from 2K26 reference PDF) */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border-l-4 border-amber-500 text-xs space-y-3">
              <h4 className="font-black text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>⚠️ IMPORTANT NOTE / അറിയിപ്പ്:</span>
              </h4>
              <p className="text-slate-800 leading-relaxed font-medium">
                Ayub and Salih had lower attendance during the collection period. Consequently, a travel expense of ₹3,000 each has been deducted from their shares. To avoid this deduction affecting your final balance, you are required to collect and remit this amount separately. Please ensure this is completed as soon as possible.
              </p>
              <p className="text-slate-800 leading-relaxed font-medium pt-1 border-t border-amber-200">
                അയ്യൂബ്, സ്വാലിഹ് എന്നിവർ പിരിവിന് ഇറങ്ങിയത് കുറവായതിനാൽ അവർക്ക് ട്രാവൽ എക്സ്പെൻസ് (Travel Expenses) ആയി ₹3,000 വീതം കുറച്ചിട്ടുണ്ട്. ഈ തുക നിങ്ങളുടെ ബാലൻസിൽ നിന്നും കുറയാതിരിക്കണമെന്നുണ്ടെങ്കിൽ നിങ്ങൾ ഈ പൈസ പിരിച്ചു തരേണ്ടതുണ്ട്. അതിനാൽ ദയവായി ഈ തുക എത്രയും പെട്ടെന്ന് കളക്ട് ചെയ്ത് ഏൽപ്പിക്കുക.
              </p>
            </div>

            {/* FOOTER ACCREDITATION (Strictly matching official 2K26 PDF) */}
            <div className="pt-6 border-t border-slate-300 text-center text-xs text-slate-500 font-semibold space-y-1">
              <p>© 2026 DALAILUL KHAIRATH ISLAMIC FOUNDATION</p>
              <p className="text-[11px] text-slate-400">
                Official Document Generated by BE Creatives | Developed by Basim Aslam Edayur
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SETTLEMENT CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">
                Configure Campaign Settlement Parameters
              </h2>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base Share Pool Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={configPool}
                  onChange={(e) => setConfigPool(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-black text-sm text-[#164A9B]"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Default: ₹1,15,000 as per 2K26 official document.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Standard Deduction per Volunteer (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={configStdDed}
                  onChange={(e) => setConfigStdDed(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Default: ₹790.40 each (Total ₹3,952.00).
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custom Travel Expense Deductions (₹)
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-xl bg-slate-50">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={configTravel[m.id] || 0}
                        onChange={(e) =>
                          setConfigTravel({
                            ...configTravel,
                            [m.id]: Number(e.target.value),
                          })
                        }
                        className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-right font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164A9B] text-white font-bold shadow-md shadow-blue-900/20"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISBURSE PAYMENT MODAL */}
      {showPaymentModal && selectedVolunteerForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#164A9B]">
                  Disburse Volunteer Settlement
                </span>
                <h2 className="text-base font-black text-slate-900">
                  {selectedVolunteerForPayment.volunteerName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex justify-between font-bold">
              <span>Total Remaining Balance:</span>
              <span className="text-[#164A9B] text-sm font-black">
                {formatINR(selectedVolunteerForPayment.remainingBalance, true)}
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentFormData.amount}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentFormData.paymentDate}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={paymentFormData.paymentMode}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        paymentMode: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Direct UPI">UPI Transfer</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref *</label>
                  <input
                    type="text"
                    required
                    value={paymentFormData.transactionReference}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        transactionReference: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={paymentFormData.notes}
                  onChange={(e) =>
                    setPaymentFormData({ ...paymentFormData, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/20"
                >
                  Confirm & Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

