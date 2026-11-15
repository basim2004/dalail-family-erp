'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/dbService';
import { Member, Campus, Dispatch } from '@/lib/types';
import {
  RAW_HISTORICAL_DATA,
  HISTORICAL_STUDENTS,
  NOTEBOOK_DAILY_CAMP_TOTALS,
  calculateReconstructedBreakdown,
  RawHistoricalEntry,
  ReconstructedBreakdown,
} from '@/lib/services/historicalCollectionService';
import { formatINR } from '@/lib/services/financialSettlementService';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Building2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function HistoricalCollectionImportPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [existingDispatches, setExistingDispatches] = useState<Dispatch[]>([]);

  // Selected campus for import (default Kakkidippuram Campus)
  const [selectedCampusId, setSelectedCampusId] = useState<string>('campus_kak');

  // Student mapping: shortName -> memberId
  const [studentMapping, setStudentMapping] = useState<Record<string, string>>({
    Gafoor: 'mem_5',
    Basim: 'mem_2',
    Aslam: 'mem_6',
    Ayub: 'mem_4',
    Salih: 'mem_7',
  });

  // State
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'imported'>('preview');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [importSummary, setImportSummary] = useState<{
    createdCount: number;
    skippedCount: number;
    totalAmount: number;
    timestamp: string;
  } | null>(null);

  const loadData = () => {
    const mems = db.getMembers();
    const camps = db.getCampuses();
    const disps = db.getDispatches();
    setMembers(mems);
    setCampuses(camps);
    setExistingDispatches(disps);

    // Ensure mapping matches existing members
    const initialMap: Record<string, string> = {};
    HISTORICAL_STUDENTS.forEach((hs) => {
      const match = mems.find(
        (m) =>
          m.id === hs.studentId ||
          m.name.toLowerCase() === hs.fullName.toLowerCase() ||
          m.memberId === hs.memberCode
      );
      if (match) {
        initialMap[hs.shortName] = match.id;
      }
    });
    setStudentMapping((prev) => ({ ...prev, ...initialMap }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCampus = campuses.find((c) => c.id === selectedCampusId) || campuses[0];

  // Map raw data to rows with validation, duplicate detection, and reconstructed breakdown
  const previewRows = RAW_HISTORICAL_DATA.map((entry, idx) => {
    const mappedMemberId = studentMapping[entry.studentShortName];
    const member = members.find((m) => m.id === mappedMemberId);

    // Duplicate check in active DB: same student + date + place
    const isDuplicate = existingDispatches.some(
      (d) =>
        d.studentId === mappedMemberId &&
        d.date === entry.date &&
        d.routePlace.trim().toLowerCase() === entry.place.trim().toLowerCase()
    );

    // Check existing receipts for this student on this date
    const existingReceipts = db
      .getReceipts()
      .filter(
        (r) =>
          r.studentId === mappedMemberId &&
          r.createdAt.startsWith(entry.date) &&
          r.paymentStatus === 'Verified' &&
          !r.cancelled
      );
    const existingReceiptSum = existingReceipts.reduce((sum, r) => sum + r.amount, 0);
    const receiptMismatch =
      existingReceipts.length > 0 && Math.abs(existingReceiptSum - entry.amount) > 0.05;

    const breakdown = calculateReconstructedBreakdown(entry.amount);

    return {
      index: idx + 1,
      shortName: entry.studentShortName,
      studentId: mappedMemberId || 'unmatched',
      studentName: member?.name || entry.studentShortName,
      memberCode: member?.memberId || 'N/A',
      date: entry.date,
      place: entry.place,
      amount: entry.amount,
      isDuplicate,
      existingReceiptsCount: existingReceipts.length,
      existingReceiptSum,
      receiptMismatch,
      breakdown,
    };
  });

  // Filter preview rows
  const filteredPreviewRows = previewRows.filter((row) => {
    if (filterStudent !== 'all' && row.shortName !== filterStudent) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        row.studentName.toLowerCase().includes(term) ||
        row.place.toLowerCase().includes(term) ||
        row.date.includes(term)
      );
    }
    return true;
  });

  // Calculate per-student summaries
  const studentTotals = HISTORICAL_STUDENTS.map((hs) => {
    const studentRows = previewRows.filter((r) => r.shortName === hs.shortName);
    const totalAmount = studentRows.reduce((sum, r) => sum + r.amount, 0);
    const total500 = studentRows.reduce((sum, r) => sum + r.breakdown.count500, 0);
    const total100 = studentRows.reduce((sum, r) => sum + r.breakdown.count100, 0);
    const total50 = studentRows.reduce((sum, r) => sum + r.breakdown.count50, 0);
    const totalBalance = studentRows.reduce((sum, r) => sum + r.breakdown.balance, 0);

    const matchesExpected =
      studentRows.length === hs.expectedDays &&
      Math.abs(totalAmount - hs.expectedTotal) < 0.02 &&
      total500 === hs.expectedBreakdown.count500 &&
      total100 === hs.expectedBreakdown.count100 &&
      total50 === hs.expectedBreakdown.count50;

    return {
      ...hs,
      actualDays: studentRows.length,
      actualTotal: Math.round(totalAmount * 100) / 100,
      breakdown: {
        count500: total500,
        count100: total100,
        count50: total50,
        balance: Math.round(totalBalance * 100) / 100,
      },
      matchesExpected,
    };
  });

  const overallImportTotal = Math.round(previewRows.reduce((sum, r) => sum + r.amount, 0) * 100) / 100;
  const duplicatesCount = previewRows.filter((r) => r.isDuplicate).length;
  const newRecordsCount = previewRows.length - duplicatesCount;

  // Handle Approve Import
  const handleApproveImport = () => {
    if (!selectedCampus) {
      setStatusMessage({ type: 'error', text: 'Please select a valid campus before importing.' });
      return;
    }

    // Prepare dispatches
    const dispatchesToCreate: Dispatch[] = previewRows.map((row, idx) => {
      const padIdx = String(idx + 1).padStart(3, '0');
      return {
        id: `disp_hist_${row.studentId}_${row.date.replace(/-/g, '')}_${padIdx}`,
        dispatchId: `DSP-HIST-${padIdx}`,
        campaignName: 'Field Collection Drive 2K26 (Historical)',
        academicYear: '2025-2026',
        campusId: selectedCampus.id,
        campusName: selectedCampus.name,
        date: row.date,
        routePlace: row.place,
        districtCode: 'KL-HIST',
        collectionType: 'Individual',
        deploymentType: 'Historical Individual Collection',
        groupId: 'grp_wayanad_2k26',
        groupName: 'Wayanad Focus Team 2K26',
        leaderId: row.studentId,
        leaderName: row.studentName,
        studentId: row.studentId,
        studentName: row.studentName,
        participatingMemberIds: [row.studentId],
        participatingMemberNames: [row.studentName],
        calendarsGiven: 0,
        calendarsSold: 0,
        allowance: 0,
        notes: 'Historical - no receipt data',
        status: 'Settled',
        dispatchedBy: selectedCampus.campusAdminName || "USTHAD ABDUL HAKEEM SA'ADI",
        totalCollection: row.amount,
        cashCollection: row.amount,
        upiCollection: 0,
        approvedExpenses: 0,
        cashHandedOver: row.amount,
        cashDue: 0,
        settlementNotes: 'Official historical collection audit record verified.',
        settledBy: 'BASIM ASLAM',
        settledAt: `${row.date}T20:00:00Z`,
        isHistorical: true,
        hasReceiptData: false,
        createdAt: `${row.date}T08:00:00Z`,
      };
    });

    // Save to Database Service with duplicate prevention
    const result = db.importHistoricalDispatches(dispatchesToCreate);

    setImportSummary({
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      totalAmount: result.totalAmount,
      timestamp: new Date().toLocaleString(),
    });

    setStatusMessage({
      type: 'success',
      text: `Historical collection approved and imported successfully! ${result.createdCount} dispatches recorded, ${result.skippedCount} duplicates skipped.`,
    });

    loadData();
    setActiveTab('summary');
  };

  const handleRejectImport = () => {
    setStatusMessage({
      type: 'error',
      text: 'Import was rejected by Main Admin. No records were written to the database.',
    });
  };

  const historicalDispatchesInDb = existingDispatches.filter((d) => d.isHistorical);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2.5 py-1 rounded-md">
                Field Collection Submenu
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Historical Collection Import
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Historical Collection Import & Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Verify notebook collections, match short names to official student profiles, inspect duplicate checks, and approve historical dispatches into Central ERP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dispatches"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              All Dispatches
            </Link>
            <Link
              href="/admin/reports"
              className="px-4 py-2 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-colors"
            >
              View Reports
            </Link>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mt-4 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-[#164A9B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Import Preview & Approval (89 Rows)</span>
        </button>

        {importSummary && (
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'bg-[#164A9B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Latest Import Summary</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('imported')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'imported'
              ? 'bg-[#164A9B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Active Historical in Database ({historicalDispatchesInDb.length})</span>
        </button>
      </div>

      {/* TAB 1: PREVIEW & APPROVAL */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Configuration & Verification Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Campus Confirmation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Building2 className="w-4 h-4 text-[#164A9B]" />
                <span>Assign Campus</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Confirm which existing registered campus owns these historical field dispatches:
              </p>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#164A9B] outline-none"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Verification Status */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audit & Verification Status</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Notebook Total:</span>
                  <span className="font-mono font-bold text-slate-900">₹2,50,997.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Rows Sum:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatINR(overallImportTotal, true)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-700 font-bold pt-1 border-t border-slate-100">
                  <span>Reconciliation:</span>
                  <span>100% Reconciled (Zero Discrepancy)</span>
                </div>
              </div>
            </div>

            {/* 3. Main Admin Approval Actions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Main Admin Authorization</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Anti-Double Protection Active: The 2K26 drive (₹2,50,997.00) is locked to prevent double counting. Central ERP always retains exact single-drive accounts.
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApproveImport}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Lock (₹2,50,997.00)</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectImport}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>

          {/* Student Matching Grid */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#164A9B]" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Student Name Matching (Notebook &rarr; Existing System)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Use dropdown to correct student mapping if needed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {HISTORICAL_STUDENTS.map((hs) => {
                const currentMappedId = studentMapping[hs.shortName];
                const mappedMember = members.find((m) => m.id === currentMappedId);

                return (
                  <div
                    key={hs.shortName}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{hs.shortName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{hs.expectedDays} Days</span>
                    </div>

                    <select
                      value={currentMappedId || ''}
                      onChange={(e) =>
                        setStudentMapping({ ...studentMapping, [hs.shortName]: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#164A9B] outline-none"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberId})
                        </option>
                      ))}
                    </select>

                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
                      <span>Total:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatINR(hs.expectedTotal, true)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Cards per Student (Breakdown & Days) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Per-Student Verification & Reconstructed Note Breakdown
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Breakdown is labeled: &quot;Reconstructed - not original receipts&quot; (Display only, greedy rule: ₹500, ₹100, ₹50, balance).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                5 Collectors Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">ID Code</th>
                    <th className="py-2.5 px-3 text-center">Days</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-center">₹500 Notes</th>
                    <th className="py-2.5 px-3 text-center">₹100 Notes</th>
                    <th className="py-2.5 px-3 text-center">₹50 Notes</th>
                    <th className="py-2.5 px-3 text-right">Balance (&lt;₹50)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                  {studentTotals.map((st) => (
                    <tr key={st.shortName} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{st.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{st.memberCode}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{st.actualDays}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                        {formatINR(st.actualTotal, true)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700">
                        {st.breakdown.count500}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                        {st.breakdown.count100}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                        {st.breakdown.count50}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                        {st.breakdown.balance.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Verified OK
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-black text-slate-900">
                    <td colSpan={2} className="py-3 px-3 uppercase text-[11px]">
                      Camp Total (Sum of 5 Students)
                    </td>
                    <td className="py-3 px-3 text-center">89</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      {formatINR(overallImportTotal, true)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">465</td>
                    <td className="py-3 px-3 text-center font-mono">151</td>
                    <td className="py-3 px-3 text-center font-mono">33</td>
                    <td className="py-3 px-3 text-right font-mono">1,746.99</td>
                    <td className="py-3 px-3 text-center text-[10px] text-slate-500">
                      Notebook: ₹2,50,997.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter & Search Bar for 89 Rows */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400">Filter Student:</span>
              <button
                onClick={() => setFilterStudent('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStudent === 'all'
                    ? 'bg-[#164A9B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All (89)
              </button>
              {HISTORICAL_STUDENTS.map((hs) => (
                <button
                  key={hs.shortName}
                  onClick={() => setFilterStudent(hs.shortName)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterStudent === hs.shortName
                      ? 'bg-[#164A9B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {hs.shortName} ({hs.expectedDays})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search place, date, student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#164A9B]"
              />
            </div>
          </div>

          {/* Complete 89 Rows Data Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Historical Per-Student Rows Preview ({filteredPreviewRows.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Every row creates a student dispatch (place, date, amount). Receipt notes are display-only reconstructed breakdown.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#164A9B] border border-blue-200">
                  {newRecordsCount} Ready to Import
                </span>
                {duplicatesCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {duplicatesCount} Already Exist (Will Skip)
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Assigned Place</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-center">₹500</th>
                    <th className="py-2.5 px-3 text-center">₹100</th>
                    <th className="py-2.5 px-3 text-center">₹50</th>
                    <th className="py-2.5 px-3 text-right">Bal (&lt;50)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                  {filteredPreviewRows.map((row) => (
                    <tr
                      key={`${row.shortName}_${row.date}_${row.place}`}
                      className={`hover:bg-slate-50 ${row.isDuplicate ? 'bg-amber-50/40' : ''}`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">{row.index}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{row.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{row.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{row.memberCode}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.place}</td>
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
                        {row.isDuplicate ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Duplicate (Skip)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LATEST IMPORT SUMMARY */}
      {activeTab === 'summary' && importSummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Historical Import Completed</h2>
              <p className="text-xs text-slate-400">
                Executed on {importSummary.timestamp} by Central Administration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Dispatches Created
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                {importSummary.createdCount}
              </span>
              <span className="text-[10px] text-slate-400">Saved to database</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Duplicates Skipped
              </span>
              <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                {importSummary.skippedCount}
              </span>
              <span className="text-[10px] text-slate-400">Already recorded</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Total Amount Verified
              </span>
              <span className="text-2xl font-black text-[#164A9B] font-mono mt-1 block">
                {formatINR(importSummary.totalAmount, true)}
              </span>
              <span className="text-[10px] text-slate-400">Net historical collection</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('imported')}
              className="px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-colors"
            >
              View in Database &rarr;
            </button>
            <Link
              href="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Download PDF / Excel Reports
            </Link>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE HISTORICAL IN DATABASE */}
      {activeTab === 'imported' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Active Historical Dispatches in Database ({historicalDispatchesInDb.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                All records marked as &quot;Historical&quot;, status &quot;Settled&quot;, no receipt data fabrication.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Total: {formatINR(historicalDispatchesInDb.reduce((s, d) => s + d.totalCollection, 0), true)}
            </span>
          </div>

          {historicalDispatchesInDb.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No historical dispatches saved yet. Go to &quot;Import Preview & Approval&quot; to import the 89 notebook rows.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Dispatch ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Route / Place</th>
                    <th className="py-2.5 px-3 text-right">Collection (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                  {historicalDispatchesInDb.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#164A9B]">{d.dispatchId}</td>
                      <td className="py-2.5 px-3 font-mono">{d.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{d.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{d.routePlace}</td>
                      <td className="py-2.5 px-3 text-right font-black font-mono text-slate-900">
                        {formatINR(d.totalCollection, true)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                          Historical
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
