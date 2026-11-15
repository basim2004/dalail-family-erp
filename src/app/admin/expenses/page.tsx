'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import { Expense, Dispatch, Member, CollectionGroup, ExpenseCategory } from '@/lib/types';
import { formatINR } from '@/lib/services/financialSettlementService';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<CollectionGroup[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    dispatchId: '',
    collectorId: '',
    category: 'Travel' as ExpenseCategory,
    amount: 300,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadData = () => {
    setExpenses(db.getExpenses());
    setDispatches(db.getDispatches());
    setMembers(db.getMembers());
    setGroups(db.getGroups());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      dispatchId: dispatches[0]?.id || '',
      collectorId: members[0]?.id || '',
      category: 'Travel',
      amount: 300,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setShowAddModal(true);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Please enter expense description');
      return;
    }

    const collector = members.find((m) => m.id === formData.collectorId);
    const dispatch = dispatches.find((d) => d.id === formData.dispatchId);

    db.createExpense({
      dispatchId: formData.dispatchId,
      collectorId: formData.collectorId,
      collectorName: collector?.name || 'Collector',
      groupId: dispatch?.groupId,
      campusId: dispatch?.campusId || 'campus_kak',
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      billPhotoUrl: '/assets/sample_bill.jpg',
    });

    setShowAddModal(false);
    loadData();
  };

  const handleApprove = (expId: string) => {
    db.updateExpenseStatus(expId, 'Approved', "USTHAD ABDUL SALAM SA'ADI");
    loadData();
  };

  const handleReject = (expId: string) => {
    db.updateExpenseStatus(expId, 'Rejected', "USTHAD ABDUL SALAM SA'ADI");
    loadData();
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.collectorName && e.collectorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalApproved = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = expenses
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Module 07</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Field Expense Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Record, verify, and approve field collection expenses (Travel, Food, Stay, Fuel). Only authorized expenses impact dispatch settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Recorded</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{expenses.length}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Billable Field Vouchers</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Approved Expenses</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatINR(totalApproved, false)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Deducted from Cash Settlement</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{formatINR(totalPending, false)}</div>
          <span className="text-[11px] text-amber-600 font-semibold">Requires Verification</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Review Officer</span>
          <div className="text-sm font-black text-slate-800 mt-1 truncate">USTHAD ABDUL SALAM</div>
          <span className="text-[11px] text-slate-500 font-semibold">Foundation Patron</span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense ID, collector, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Fuel">Fuel</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Expense ID</th>
                <th className="py-3.5 px-4">Date & Category</th>
                <th className="py-3.5 px-4">Collector & Dispatch</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No expenses submitted yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Field collectors can submit fuel, food, and travel expense claims from their Student Portal.
                    </p>
                  </td>
                </tr>
              )}
              {filteredExpenses.map((exp) => {
                const dispatch = dispatches.find((d) => d.id === exp.dispatchId);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#164A9B]">
                      {exp.expenseId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{exp.category}</span>
                      <span className="text-[10px] text-slate-400">{exp.date}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">
                        {exp.collectorName || 'Collector'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dispatch?.dispatchId || exp.dispatchId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {exp.description}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatINR(exp.amount, false)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          exp.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : exp.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {exp.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(exp.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 text-xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(exp.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {exp.approvedBy ? `By ${exp.approvedBy}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Record Field Expense</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch *</label>
                  <select
                    value={formData.dispatchId}
                    onChange={(e) => setFormData({ ...formData, dispatchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    {dispatches.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dispatchId} ({d.routePlace})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collector Incurred *</label>
                  <select
                    value={formData.collectorId}
                    onChange={(e) => setFormData({ ...formData, collectorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.memberId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description / Purpose *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Bus fare and lunch during Kalpetta drive..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold shadow-md shadow-blue-900/20"
                >
                  Submit Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

