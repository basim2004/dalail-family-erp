'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import { Dispatch, CollectionGroup, Member, Campus, Expense, Receipt } from '@/lib/types';
import {
  formatINR,
  calculateDispatchEqualShare,
  reconcileDispatchSettlement,
} from '@/lib/services/financialSettlementService';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Building2,
  Users,
  MapPin,
  Wallet,
  Receipt as ReceiptIcon,
  X,
  CreditCard,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';

export default function AdminDispatchesPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [groups, setGroups] = useState<CollectionGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSettlementDispatch, setSelectedSettlementDispatch] = useState<Dispatch | null>(null);
  const [selectedViewDispatch, setSelectedViewDispatch] = useState<Dispatch | null>(null);

  // Form State for Dispatch Creation
  const [formData, setFormData] = useState({
    dispatchId: '',
    campaignName: 'Field Collection Drive 2K26',
    academicYear: '2025-2026',
    campusId: 'campus_kak',
    date: new Date().toISOString().split('T')[0],
    routePlace: '',
    districtCode: 'KL-WAY',
    collectionType: 'Group' as 'Group' | 'Individual',
    groupId: '',
    leaderId: '',
    participatingMemberIds: [] as string[],
    allowance: 500,
    calendarsGiven: 50,
    notes: '',
  });

  // Form State for Settlement
  const [settlementData, setSettlementData] = useState({
    cashHandedOver: 0,
    approvedExpenses: 0,
    notes: '',
  });

  const loadData = () => {
    setDispatches(db.getDispatches());
    setGroups(db.getGroups());
    setMembers(db.getMembers());
    setCampuses(db.getCampuses());
    setExpenses(db.getExpenses());
    setReceipts(db.getReceipts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    const nextSeq = dispatches.length + 1;
    const defaultCampus = campuses[0]?.id || 'campus_kak';
    const defaultGroup = groups[0];

    setFormData({
      dispatchId: `DSP-2026-${String(nextSeq).padStart(3, '0')}`,
      campaignName: 'Field Collection Drive 2K26',
      academicYear: '2025-2026',
      campusId: defaultCampus,
      date: new Date().toISOString().split('T')[0],
      routePlace: '',
      districtCode: 'KL-MLP',
      collectionType: 'Group',
      groupId: defaultGroup?.id || '',
      leaderId: defaultGroup?.leaderId || '',
      participatingMemberIds: defaultGroup ? [...defaultGroup.memberIds] : [],
      allowance: 500,
      calendarsGiven: 50,
      notes: '',
    });
    setShowCreateModal(true);
  };

  const handleGroupSelect = (grpId: string) => {
    const selectedGroup = groups.find((g) => g.id === grpId);
    if (selectedGroup) {
      setFormData({
        ...formData,
        groupId: selectedGroup.id,
        leaderId: selectedGroup.leaderId,
        participatingMemberIds: [...selectedGroup.memberIds],
      });
    } else {
      setFormData({
        ...formData,
        groupId: '',
        leaderId: '',
        participatingMemberIds: [],
      });
    }
  };

  const toggleParticipant = (memberId: string) => {
    const exists = formData.participatingMemberIds.includes(memberId);
    if (exists) {
      const updated = formData.participatingMemberIds.filter((id) => id !== memberId);
      setFormData({
        ...formData,
        participatingMemberIds: updated,
        leaderId: formData.leaderId === memberId ? updated[0] || '' : formData.leaderId,
      });
    } else {
      if (formData.participatingMemberIds.length >= 5) {
        alert('A dispatch can have at most 5 participating collectors.');
        return;
      }
      const updated = [...formData.participatingMemberIds, memberId];
      setFormData({
        ...formData,
        participatingMemberIds: updated,
        leaderId: formData.leaderId || memberId,
      });
    }
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routePlace.trim()) {
      alert('Please specify the route / location');
      return;
    }
    if (formData.participatingMemberIds.length === 0) {
      alert('Please select at least 1 participating collector');
      return;
    }

    const campus = campuses.find((c) => c.id === formData.campusId);
    const group = groups.find((g) => g.id === formData.groupId);
    const leader = members.find((m) => m.id === formData.leaderId);

    const participantNames = formData.participatingMemberIds.map((mId) => {
      const m = members.find((mem) => mem.id === mId);
      return m?.name || mId;
    });

    db.createDispatch({
      dispatchId: formData.dispatchId,
      campaignName: formData.campaignName,
      academicYear: formData.academicYear,
      campusId: formData.campusId,
      campusName: campus?.name || 'Kakkidippuram Campus',
      date: formData.date,
      routePlace: formData.routePlace,
      districtCode: formData.districtCode,
      collectionType: formData.collectionType,
      groupId: formData.collectionType === 'Group' ? formData.groupId : undefined,
      groupName: formData.collectionType === 'Group' ? group?.name : undefined,
      leaderId: formData.leaderId,
      leaderName: leader?.name || 'Leader',
      participatingMemberIds: formData.participatingMemberIds,
      participatingMemberNames: participantNames,
      calendarsGiven: formData.calendarsGiven,
      calendarsSold: 0,
      allowance: formData.allowance,
      notes: formData.notes,
      status: 'Assigned',
      dispatchedBy: "USTHAD ABDUL SALAM SA'ADI",
      totalCollection: 0,
      cashCollection: 0,
      upiCollection: 0,
      approvedExpenses: 0,
      cashHandedOver: 0,
      cashDue: 0,
    });

    setShowCreateModal(false);
    loadData();
  };

  const handleOpenSettlement = (dispatch: Dispatch) => {
    const recon = reconcileDispatchSettlement(dispatch, expenses);
    setSelectedSettlementDispatch(dispatch);
    setSettlementData({
      cashHandedOver: dispatch.cashHandedOver || recon.expectedCashHandover,
      approvedExpenses: recon.approvedExpenses,
      notes: dispatch.settlementNotes || 'Verified and reconciled.',
    });
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlementDispatch) return;

    db.settleDispatch(selectedSettlementDispatch.id, {
      cashHandedOver: Number(settlementData.cashHandedOver),
      approvedExpenses: Number(settlementData.approvedExpenses),
      settlementNotes: settlementData.notes,
      settledBy: 'BASIM ASLAM',
    });

    setSelectedSettlementDispatch(null);
    loadData();
  };

  const handleDeleteDispatch = (id: string, dispatchId: string) => {
    if (confirm(`Are you sure you want to remove dispatch ${dispatchId}? All linked calculations will adjust automatically.`)) {
      db.deleteDispatch(id);
      loadData();
    }
  };

  // Filter Dispatches
  const filteredDispatches = dispatches.filter((d) => {
    const matchesSearch =
      d.dispatchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.routePlace.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.groupName && d.groupName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCampus = campusFilter === 'all' || d.campusId === campusFilter;

    return matchesSearch && matchesStatus && matchesCampus;
  });

  const totalCollected = dispatches
    .filter((d) => d.status !== 'Rejected')
    .reduce((sum, d) => sum + (d.totalCollection || 0), 0);

  const totalSettled = dispatches.filter((d) => d.status === 'Settled').length;
  const totalPending = dispatches.filter((d) => d.status !== 'Settled' && d.status !== 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>Modules 02 & 06</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Field Dispatch Management & Settlement
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Deploy collection groups or independent volunteers, track real-time receipt generation, and execute automated cash & UPI settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Field Dispatch</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Dispatches</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{dispatches.length}</div>
          <span className="text-[11px] text-slate-500 font-semibold">{totalSettled} Settled • {totalPending} Pending</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Collection</span>
          <div className="text-2xl font-black text-[#164A9B] mt-1">{formatINR(totalCollected, false)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Live Database Verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Settlement Status</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalSettled}</div>
          <span className="text-[11px] text-slate-500 font-semibold">Locked & Reconciled</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active in Field</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {dispatches.filter((d) => d.status === 'In Field').length}
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Live Student Tracking</span>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dispatch ID, route, leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Field">In Field</option>
            <option value="Submitted">Submitted</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Settled">Settled</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
          >
            <option value="all">All Campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dispatches Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Dispatch ID</th>
                <th className="py-3.5 px-4">Date & Route</th>
                <th className="py-3.5 px-4">Type & Team</th>
                <th className="py-3.5 px-4">Participating Members</th>
                <th className="py-3.5 px-4 text-right">Collection</th>
                <th className="py-3.5 px-4 text-right">Equal Share</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDispatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">No field dispatches recorded.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &quot;Create Dispatch&quot; to assign a new field route to individual students or groups.
                    </p>
                  </td>
                </tr>
              )}
              {filteredDispatches.map((dispatch) => {
                const { eachShare } = calculateDispatchEqualShare(dispatch, receipts);
                const isSettled = dispatch.status === 'Settled';

                return (
                  <tr key={dispatch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#164A9B] block">
                        {dispatch.dispatchId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dispatch.campaignName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{dispatch.routePlace}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dispatch.date}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            dispatch.collectionType === 'Group'
                              ? 'bg-blue-50 text-[#164A9B]'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {dispatch.collectionType}
                        </span>
                        {dispatch.groupName && (
                          <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]">
                            {dispatch.groupName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Lead: {dispatch.leaderName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-semibold text-slate-800">
                        {dispatch.participatingMemberNames.join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {dispatch.participatingMemberIds.length} Active Collectors
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-slate-900 block">
                        {formatINR(dispatch.totalCollection, false)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Cash: {formatINR(dispatch.cashCollection, false)} • UPI: {formatINR(dispatch.upiCollection, false)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {formatINR(eachShare, true)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          dispatch.status === 'Settled'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : dispatch.status === 'In Field'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isSettled ? <Lock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{dispatch.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedViewDispatch(dispatch)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Dispatch Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSettlement(dispatch)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSettled
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {isSettled ? 'Review Settlement' : 'Settle Dispatch'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDispatch(dispatch.id, dispatch.dispatchId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DISPATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Create New Field Dispatch</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.dispatchId}
                    onChange={(e) => setFormData({ ...formData, dispatchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collection Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign *</label>
                  <input
                    type="text"
                    required
                    value={formData.campaignName}
                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus *</label>
                  <select
                    value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Location / Route *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayanad Kalpetta, Mananthavadi"
                  value={formData.routePlace}
                  onChange={(e) => setFormData({ ...formData, routePlace: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Collection Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Collection Type *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, collectionType: 'Group' })}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                        formData.collectionType === 'Group'
                          ? 'bg-[#164A9B] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, collectionType: 'Individual' })}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                        formData.collectionType === 'Individual'
                          ? 'bg-[#164A9B] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                {formData.collectionType === 'Group' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Group *</label>
                    <select
                      value={formData.groupId}
                      onChange={(e) => handleGroupSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      <option value="">Select a Group</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.groupId})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Participating Members Selection (Crucial Financial Rule: Equal share calculated only from active participants) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Select Participating Members (Max 5) *
                  </label>
                  <span className="text-[11px] font-black text-[#164A9B]">
                    {formData.participatingMemberIds.length} / 5 Selected
                  </span>
                </div>
                <div className="border border-slate-200 rounded-2xl p-2 max-h-40 overflow-y-auto space-y-1 bg-slate-50">
                  {members.map((m) => {
                    const isSelected = formData.participatingMemberIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleParticipant(m.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-100/90 border border-blue-300 font-bold text-[#164A9B]'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded-sm text-[#164A9B]"
                          />
                          <span>{m.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{m.memberId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leader Selection */}
              {formData.participatingMemberIds.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Leader / Primary In-Charge *
                  </label>
                  <select
                    value={formData.leaderId}
                    onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    {formData.participatingMemberIds.map((mId) => {
                      const m = members.find((mem) => mem.id === mId);
                      return (
                        <option key={mId} value={mId}>
                          {m?.name} ({m?.memberId})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approved Allowance (₹)</label>
                  <input
                    type="number"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calendars Issued</label>
                  <input
                    type="number"
                    value={formData.calendarsGiven}
                    onChange={(e) =>
                      setFormData({ ...formData, calendarsGiven: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold shadow-md shadow-blue-900/20"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH SETTLEMENT MODAL (MODULE 06) */}
      {selectedSettlementDispatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#164A9B]">
                  Financial Settlement Module
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  Settle Dispatch: {selectedSettlementDispatch.dispatchId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSettlementDispatch(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Financial Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Cash Collected</span>
                <span className="text-sm font-black text-slate-900">
                  {formatINR(selectedSettlementDispatch.cashCollection, false)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">UPI Verified</span>
                <span className="text-sm font-black text-[#164A9B]">
                  {formatINR(selectedSettlementDispatch.upiCollection, false)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Total Collection</span>
                <span className="text-sm font-black text-emerald-700">
                  {formatINR(selectedSettlementDispatch.totalCollection, false)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSettlement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Approved Cash Expenses (₹)
                  </label>
                  <input
                    type="number"
                    value={settlementData.approvedExpenses}
                    onChange={(e) =>
                      setSettlementData({
                        ...settlementData,
                        approvedExpenses: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cash Handed Over by Collectors (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={settlementData.cashHandedOver}
                    onChange={(e) =>
                      setSettlementData({
                        ...settlementData,
                        cashHandedOver: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Settlement Formula Calculation Display */}
              {(() => {
                const expected = Math.max(
                  0,
                  selectedSettlementDispatch.cashCollection - Number(settlementData.approvedExpenses)
                );
                const cashDue = expected - Number(settlementData.cashHandedOver);

                return (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Expected Cash Handover:</span>
                      <span>{formatINR(expected, false)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Cash Handed Over:</span>
                      <span>{formatINR(Number(settlementData.cashHandedOver), false)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-2 border-t border-blue-200">
                      <span className={cashDue === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {cashDue === 0 ? 'Cash Due (Fully Reconciled):' : 'Cash Due (Shortage/Discrepancy):'}
                      </span>
                      <span className={cashDue === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {formatINR(cashDue, false)}
                      </span>
                    </div>

                    {cashDue > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>Discrepancy warning: ₹{cashDue} remains due from collectors.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Settlement & Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={settlementData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSettlementDispatch(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Lock & Approve Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DISPATCH DETAILS MODAL */}
      {selectedViewDispatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#164A9B]">
                  Dispatch Details
                </span>
                <h2 className="text-base font-black text-slate-900">
                  {selectedViewDispatch.dispatchId} • {selectedViewDispatch.routePlace}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedViewDispatch(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-semibold text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Campaign:</span>
                <span>{selectedViewDispatch.campaignName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Date:</span>
                <span>{selectedViewDispatch.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Campus:</span>
                <span>{selectedViewDispatch.campusName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Leader:</span>
                <span>{selectedViewDispatch.leaderName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Active Collectors:</span>
                <span className="font-bold text-slate-900">
                  {selectedViewDispatch.participatingMemberNames.join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Calendars:</span>
                <span>
                  {selectedViewDispatch.calendarsSold} Sold / {selectedViewDispatch.calendarsGiven} Given
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Equal Share per Member:</span>
                <span className="font-black text-[#164A9B]">
                  {formatINR(
                    calculateDispatchEqualShare(selectedViewDispatch, receipts).eachShare,
                    true
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Settled By:</span>
                <span>{selectedViewDispatch.settledBy || 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
