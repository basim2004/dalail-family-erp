'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import { useAuth } from '@/lib/services/authService';
import { Dispatch, Member, Expense, Receipt } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Calendar,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function CampusAdminDispatchesPage() {
  const { user } = useAuth();
  const campusId = user?.campusId || 'campus_kak';
  const campus = db.getCampusById(campusId);
  const [dispatches, setDispatches] = useState<Dispatch[]>(db.getDispatches(campusId));
  const members = db.getMembers(campusId);
  const fieldWorkStudents = members.filter((m) => m.fieldWorkEnabled);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [deletingDispatch, setDeletingDispatch] = useState<Dispatch | null>(null);
  const [settlingDispatch, setSettlingDispatch] = useState<Dispatch | null>(null);
  const [verifiedCashInput, setVerifiedCashInput] = useState<string>('0');
  const [settlementNotesInput, setSettlementNotesInput] = useState<string>('');

  // Create Dispatch Form State
  const [studentId, setStudentId] = useState(fieldWorkStudents[0]?.id || members[0]?.id || '');
  const [routePlace, setRoutePlace] = useState('');
  const [districtCode, setDistrictCode] = useState('MLP-VAL-01');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deploymentType, setDeploymentType] = useState<'Individual' | 'Team'>('Individual');
  const [calendarsGiven, setCalendarsGiven] = useState<number | ''>(50);
  const [allowance, setAllowance] = useState<number | ''>(500);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!studentId && members.length > 0) {
      setStudentId(fieldWorkStudents[0]?.id || members[0]?.id || '');
    }
  }, [members, fieldWorkStudents, studentId]);

  const refreshList = () => {
    setDispatches(db.getDispatches(campusId));
    if (selectedDispatch) {
      setSelectedDispatch(db.getDispatchById(selectedDispatch.id) || null);
    }
  };

  const handleOpenSettlement = (disp: Dispatch) => {
    const fin = db.getDispatchFinancials(disp.id);
    setSettlingDispatch(disp);
    setVerifiedCashInput(String(Math.max(0, fin.netCash)));
    setSettlementNotesInput(disp.settlementNotes || '');
  };

  const handleConfirmSettlement = () => {
    if (!settlingDispatch) return;
    const fin = db.getDispatchFinancials(settlingDispatch.id);
    const cashHandedOver = Number(verifiedCashInput) || 0;
    
    db.settleDispatch(settlingDispatch.id, {
      cashHandedOver,
      approvedExpenses: fin.expenses,
      settlementNotes: settlementNotesInput.trim() || 'Verified by Campus Admin',
      settledBy: campus?.campusAdminName || user?.name || 'Campus Admin',
    });

    setSettlingDispatch(null);
    if (selectedDispatch?.id === settlingDispatch.id) {
      setSelectedDispatch(null);
    }
    refreshList();
  };

  const handleConfirmDeleteDispatch = () => {
    if (!deletingDispatch) return;
    db.deleteDispatch(deletingDispatch.id);
    setDeletingDispatch(null);
    if (selectedDispatch?.id === deletingDispatch.id) {
      setSelectedDispatch(null);
    }
    refreshList();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routePlace.trim() || !studentId || !calendarsGiven) return;

    const chosenStudent = members.find((m) => m.id === studentId) || members[0];
    if (!chosenStudent) return;

    db.createDispatch({
      studentId: chosenStudent.id,
      studentName: chosenStudent.name,
      leaderId: chosenStudent.id,
      leaderName: chosenStudent.name,
      participatingMemberIds: [chosenStudent.id],
      participatingMemberNames: [chosenStudent.name],
      campusId,
      campusName: campus?.name || chosenStudent.campusName || 'Kakkidippuram Campus',
      routePlace: routePlace.trim(),
      districtCode: districtCode.trim(),
      date,
      deploymentType,
      calendarsGiven: Number(calendarsGiven),
      allowance: Number(allowance) || 0,
      notes: notes.trim(),
      status: 'In Field',
      dispatchedBy: campus?.campusAdminName || user?.name || 'Campus Admin',
      totalCollection: 0,
      cashCollection: 0,
      upiCollection: 0,
      approvedExpenses: 0,
      cashHandedOver: 0,
      cashDue: 0,
    });

    setShowCreateModal(false);
    setRoutePlace('');
    setNotes('');
    refreshList();
  };

  const handleApproveExpense = (expenseId: string) => {
    db.updateExpenseStatus(expenseId, 'Approved', campus?.campusAdminName || 'Campus Admin');
    refreshList();
  };

  const handleRejectExpense = (expenseId: string) => {
    db.updateExpenseStatus(expenseId, 'Rejected', campus?.campusAdminName || 'Campus Admin');
    refreshList();
  };

  const selectedFinancials = selectedDispatch
    ? db.getDispatchFinancials(selectedDispatch.id)
    : null;
  const selectedReceipts = selectedDispatch ? db.getReceipts(selectedDispatch.id) : [];
  const selectedExpenses = selectedDispatch ? db.getExpenses(selectedDispatch.id) : [];

  const settlingFinancials = settlingDispatch
    ? db.getDispatchFinancials(settlingDispatch.id)
    : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-dalail-primary" />
            Dispatches & Field Settlement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign field routes to authorized students, approve expenses, and settle daily cash collections.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Create Field Dispatch
        </button>
      </div>

      {/* Dispatches List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">
            Active & Past Field Dispatches ({dispatches.length})
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {fieldWorkStudents.length} Students Field-Work Enabled
          </span>
        </div>

        {dispatches.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No dispatches created yet. Click &quot;Create Field Dispatch&quot; to deploy a student.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dispatches.map((disp) => {
              const fin = db.getDispatchFinancials(disp.id);
              const remaining = Math.max(0, disp.calendarsGiven - disp.calendarsSold);
              return (
                <div
                  key={disp.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {disp.date} • {disp.districtCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          disp.status === 'Completed' || disp.status === 'Settled'
                            ? 'bg-slate-100 text-slate-700'
                            : disp.status === 'Submitted'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {disp.status === 'Submitted' ? 'Submitted for Settlement' : disp.status}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {disp.deploymentType}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base tracking-tight truncate">
                      {disp.routePlace}
                    </h3>

                    <p className="text-xs text-slate-600 font-semibold">
                      Student: <span className="font-bold text-slate-900">{disp.studentName}</span> •
                      Dispatched by {disp.dispatchedBy}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                      <span>
                        Donors: <b className="text-slate-800">{fin.receiptsCount}</b>
                      </span>
                      <span>
                        Cash: <b className="text-emerald-700 font-mono">{formatCurrency(fin.collectedCash || 0)}</b>
                      </span>
                      <span>
                        UPI: <b className="text-purple-700 font-mono">{formatCurrency(fin.collectedUpi || 0)}</b>
                      </span>
                      <span>
                        Total: <b className="text-slate-900 font-mono">{formatCurrency(fin.totalCollected || 0)}</b>
                      </span>
                      <span>
                        Net Cash Due: <b className="text-dalail-primary font-mono">{formatCurrency(fin.netCash || 0)}</b>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setSelectedDispatch(disp)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details & Review
                    </button>

                    {disp.status !== 'Completed' && disp.status !== 'Settled' ? (
                      <button
                        onClick={() => handleOpenSettlement(disp)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Verify & Settle
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                      </span>
                    )}

                    <button
                      onClick={() => setDeletingDispatch(disp)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Dispatch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE DISPATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dalail-primary" /> Create Field Dispatch
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Field Work Student *
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-bold"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberId}) {m.fieldWorkEnabled ? '— [Field Work Active]' : '— [Not Enabled]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Route / Place *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valanchery Town & Market"
                  value={routePlace}
                  onChange={(e) => setRoutePlace(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District / Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MLP-VAL-01"
                    value={districtCode}
                    onChange={(e) => setDistrictCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dispatch Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deployment Type
                  </label>
                  <select
                    value={deploymentType}
                    onChange={(e) => setDeploymentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-semibold"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Calendars Given *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={calendarsGiven}
                    onChange={(e) => setCalendarsGiven(Number(e.target.value) || '')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Allowance (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value) || '')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Focus on commercial patrons and merchant institutions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-dalail-primary hover:bg-dalail-dark rounded-xl shadow-sm"
                >
                  Deploy Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH DETAILS & EXPENSE REVIEW MODAL */}
      {selectedDispatch && selectedFinancials && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                  Dispatch Review & Settlement
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {selectedDispatch.routePlace}
                </h3>
                <p className="text-xs text-slate-500">
                  Student: <span className="font-bold text-slate-800">{selectedDispatch.studentName}</span> •
                  Date: {selectedDispatch.date} ({selectedDispatch.status})
                </p>
              </div>
              <button
                onClick={() => setSelectedDispatch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Financial Summary
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Allowance Paid</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatCurrency(selectedFinancials.allowance || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cash Collected</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{formatCurrency(selectedFinancials.collectedCash || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approved Expenses</span>
                  <span className="font-mono font-bold text-rose-700">
                    -{formatCurrency(selectedFinancials.expenses || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Net Cash to Collect</span>
                  <span className="font-mono font-black text-dalail-primary text-base">
                    {formatCurrency(selectedFinancials.netCash || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Review Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Submitted Expenses ({selectedExpenses.length})</span>
                <span className="text-[10px] text-slate-400">Review & Approve</span>
              </h4>

              {selectedExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No expenses reported by student.</p>
              ) : (
                <div className="space-y-2">
                  {selectedExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{exp.category}</span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                              exp.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exp.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{exp.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          ₹{exp.amount}
                        </span>

                        {exp.status === 'Pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleApproveExpense(exp.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectExpense(exp.id)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[10px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Issued Receipts */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">
                Issued Receipts ({selectedReceipts.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {selectedReceipts.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-dalail-primary mr-2">
                        {r.receiptNo}
                      </span>
                      <span className="font-bold text-slate-800">{r.donorName}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({r.paymentMode})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">
                        {formatCurrency(r.amount)}
                      </span>
                      <Link
                        href={`/verify/receipt/${r.receiptNo}`}
                        target="_blank"
                        className="text-dalail-primary hover:underline text-[11px] font-bold"
                      >
                        Receipt &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Settle Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedDispatch(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              {selectedDispatch.status !== 'Completed' && selectedDispatch.status !== 'Settled' ? (
                <button
                  onClick={() => handleOpenSettlement(selectedDispatch)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" /> Verify & Settle Dispatch
                </button>
              ) : (
                <span className="text-xs font-bold text-slate-500">
                  Settled by {selectedDispatch.settledBy || 'Campus Admin'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTLEMENT VERIFICATION MODAL */}
      {settlingDispatch && settlingFinancials && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Verify & Settle Collection
                  </h3>
                  <p className="text-xs text-slate-500">
                    Campus Admin verification before final closure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettlingDispatch(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dispatch & Student Info */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                <span className="font-bold text-slate-900 text-sm">{settlingDispatch.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispatch Route</span>
                <span className="font-bold text-slate-900">{settlingDispatch.routePlace}</span>
                <span className="text-[10px] font-mono text-slate-500 block">({settlingDispatch.districtCode})</span>
              </div>
            </div>

            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Donors</span>
                <span className="text-lg font-black text-blue-900 font-mono">
                  {settlingFinancials.receiptCount}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Cash</span>
                <span className="text-lg font-black text-emerald-900 font-mono">
                  {formatCurrency(settlingFinancials.cash)}
                </span>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-purple-700 uppercase block">Direct UPI</span>
                <span className="text-lg font-black text-purple-900 font-mono">
                  {formatCurrency(settlingFinancials.upi)}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Gross Collection:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(settlingFinancials.total)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Approved Field Expenses:</span>
                <span className="font-mono font-bold text-rose-600">
                  - {formatCurrency(settlingFinancials.expenses)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-800 font-bold">Net Cash Expected:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatCurrency(settlingFinancials.netCash)}
                </span>
              </div>
            </div>

            {/* Physical Cash Verification Input */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Physical Cash Handed Over (Verified by Campus Admin) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={verifiedCashInput}
                    onChange={(e) => setVerifiedCashInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter actual physical cash received"
                  />
                </div>
              </div>

              {/* Difference Calculation */}
              {(() => {
                const enteredCash = Number(verifiedCashInput) || 0;
                const diff = enteredCash - settlingFinancials.netCash;
                return (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    diff === 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : diff > 0 
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <span className="font-bold">
                      {diff === 0 ? 'Cash Matches Exactly' : diff > 0 ? 'Surplus Cash Received' : 'Shortage in Handover'}
                    </span>
                    <span className="font-mono font-black">
                      {diff === 0 ? '₹0 Difference' : `${diff > 0 ? '+' : ''}${formatCurrency(diff)}`}
                    </span>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Settlement Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={settlementNotesInput}
                  onChange={(e) => setSettlementNotesInput(e.target.value)}
                  placeholder="e.g. Cash counted and deposited in campus safe. Receipts verified."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSettlingDispatch(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" /> Confirm & Settle
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE DISPATCH CONFIRMATION MODAL */}
      {deletingDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                Delete Field Dispatch?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete the dispatch for <span className="font-bold text-slate-800">{deletingDispatch.studentName}</span> at <span className="font-bold">{deletingDispatch.routePlace}</span> ({deletingDispatch.districtCode})?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingDispatch(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteDispatch}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Delete Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
