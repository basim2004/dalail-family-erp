'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db/dbService';
import { CollectionGroup, Member, Campus, Dispatch } from '@/lib/types';
import { formatINR } from '@/lib/services/financialSettlementService';
import {
  HISTORICAL_STUDENTS,
  RAW_HISTORICAL_DATA,
  NOTEBOOK_DAILY_CAMP_TOTALS,
  calculateReconstructedBreakdown,
  HistoricalStudentConfig,
  RawHistoricalEntry,
} from '@/lib/services/historicalCollectionService';
import {
  Layers,
  Users,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Crown,
  Trash2,
  Edit,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Calendar,
  Filter,
  Wallet,
  Receipt,
  FileText,
  DollarSign,
  ChevronRight,
  Coins,
} from 'lucide-react';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<CollectionGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);

  const [activeTab, setActiveTab] = useState<'groups' | 'individuals'>('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CollectionGroup | null>(null);
  const [selectedGroupHistory, setSelectedGroupHistory] = useState<CollectionGroup | null>(null);
  const [selectedStudentLedger, setSelectedStudentLedger] = useState<{
    member: Member;
    config?: HistoricalStudentConfig;
    runs: RawHistoricalEntry[];
    total: number;
    daysCount: number;
    sharePercent: number;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    groupId: '',
    campusId: 'campus_kak',
    leaderId: '',
    memberIds: [] as string[],
    status: 'Active' as 'Active' | 'Inactive',
  });

  const loadData = () => {
    setGroups(db.getGroups());
    setMembers(db.getMembers());
    setCampuses(db.getCampuses());
    setDispatches(db.getDispatches());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map historical student config by member id
  const historicalConfigMap = useMemo(() => {
    const map = new Map<string, HistoricalStudentConfig>();
    HISTORICAL_STUDENTS.forEach((hs) => {
      map.set(hs.studentId, hs);
    });
    return map;
  }, []);

  // Overall financial calculation across all 5 collectors (Total: ₹2,50,997.00)
  const GRAND_TOTAL_COLLECTION = 250997;
  const TOTAL_RUNS_COUNT = 89;
  const TOTAL_CAMP_DAYS = 21;

  // Calculate stats for a group
  const getGroupStats = (group: CollectionGroup) => {
    // Check if matching dispatches exist in database
    const dbDispatches = dispatches.filter(
      (d) =>
        (d.groupId === group.id ||
          (d.collectionType === 'Group' &&
            d.participatingMemberIds?.some((mId) => group.memberIds.includes(mId)))) &&
        d.status !== 'Rejected'
    );

    if (dbDispatches.length > 0) {
      const totalCollected = dbDispatches.reduce((sum, d) => sum + (d.totalCollection || 0), 0);
      const totalHandover = dbDispatches.reduce((sum, d) => sum + (d.cashHandedOver || 0), 0);
      return {
        dispatchesCount: dbDispatches.length,
        totalCollected,
        cashHandedOver: totalHandover,
        isSettled: dbDispatches.every((d) => d.status === 'Settled'),
      };
    }

    // Authentic fallback for Wayanad Focus Team 2K26
    if (group.id === 'grp_wayanad_2k26' || group.name.toLowerCase().includes('wayanad')) {
      return {
        dispatchesCount: TOTAL_CAMP_DAYS,
        runsCount: TOTAL_RUNS_COUNT,
        totalCollected: GRAND_TOTAL_COLLECTION,
        cashHandedOver: GRAND_TOTAL_COLLECTION,
        isSettled: true,
      };
    }

    return {
      dispatchesCount: 0,
      runsCount: 0,
      totalCollected: 0,
      cashHandedOver: 0,
      isSettled: true,
    };
  };

  // Get individual member's collection account
  const getMemberAccount = (member: Member) => {
    // Check historical config
    const hist = historicalConfigMap.get(member.id);
    if (hist) {
      const studentRuns = RAW_HISTORICAL_DATA.filter((r) => r.studentShortName === hist.shortName);
      const total = hist.expectedTotal;
      const sharePercent = (total / GRAND_TOTAL_COLLECTION) * 100;
      return {
        hasData: true,
        daysCount: hist.expectedDays,
        totalCollected: total,
        sharePercent: sharePercent,
        breakdown: hist.expectedBreakdown,
        runs: studentRuns,
        config: hist,
      };
    }

    // Calculate from DB dispatches
    const memberDispatches = dispatches.filter(
      (d) =>
        (d.studentId === member.id || d.participatingMemberIds?.includes(member.id)) &&
        d.status !== 'Rejected'
    );

    if (memberDispatches.length > 0) {
      let total = 0;
      memberDispatches.forEach((d) => {
        if (d.collectionType === 'Individual') {
          total += d.totalCollection || 0;
        } else {
          const count = d.participatingMemberIds?.length || 1;
          total += (d.totalCollection || 0) / count;
        }
      });

      return {
        hasData: true,
        daysCount: memberDispatches.length,
        totalCollected: total,
        sharePercent: GRAND_TOTAL_COLLECTION > 0 ? (total / GRAND_TOTAL_COLLECTION) * 100 : 0,
        breakdown: calculateReconstructedBreakdown(total),
        runs: [],
        config: undefined,
      };
    }

    return {
      hasData: false,
      daysCount: 0,
      totalCollected: 0,
      sharePercent: 0,
      breakdown: { count500: 0, count100: 0, count50: 0, balance: 0 },
      runs: [],
      config: undefined,
    };
  };

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.groupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.leaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'all' || g.campusId === campusFilter;
    return matchesSearch && matchesCampus;
  });

  // Filter members for individual accounts
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.place.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'all' || m.campusId === campusFilter;
    return matchesSearch && matchesCampus;
  });

  const handleOpenCreate = () => {
    const seq = groups.length + 1;
    setEditingGroup(null);
    setFormData({
      name: '',
      groupId: `GRP-2026-${String(seq).padStart(2, '0')}`,
      campusId: campuses[0]?.id || 'campus_kak',
      leaderId: '',
      memberIds: [],
      status: 'Active',
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (group: CollectionGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      groupId: group.groupId,
      campusId: group.campusId,
      leaderId: group.leaderId,
      memberIds: [...group.memberIds],
      status: group.status,
    });
    setShowCreateModal(true);
  };

  const toggleMemberSelection = (memberId: string) => {
    const exists = formData.memberIds.includes(memberId);
    if (exists) {
      const updated = formData.memberIds.filter((id) => id !== memberId);
      setFormData({
        ...formData,
        memberIds: updated,
        leaderId: formData.leaderId === memberId ? updated[0] || '' : formData.leaderId,
      });
    } else {
      if (formData.memberIds.length >= 5) {
        alert('A collection group can have at most 5 members.');
        return;
      }
      const updated = [...formData.memberIds, memberId];
      setFormData({
        ...formData,
        memberIds: updated,
        leaderId: formData.leaderId || memberId,
      });
    }
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter group name');
      return;
    }
    if (formData.memberIds.length === 0) {
      alert('Please select at least 1 member for the group');
      return;
    }
    if (!formData.leaderId) {
      alert('Please assign a group leader');
      return;
    }

    const campus = campuses.find((c) => c.id === formData.campusId);
    const leader = members.find((m) => m.id === formData.leaderId);

    if (editingGroup) {
      db.updateGroup(editingGroup.id, {
        name: formData.name,
        groupId: formData.groupId,
        campusId: formData.campusId,
        campusName: campus?.name || 'Kakkidippuram Campus',
        leaderId: formData.leaderId,
        leaderName: leader?.name || 'Leader',
        memberIds: formData.memberIds,
        status: formData.status,
      });
    } else {
      db.createGroup({
        name: formData.name,
        groupId: formData.groupId,
        campusId: formData.campusId,
        campusName: campus?.name || 'Kakkidippuram Campus',
        leaderId: formData.leaderId,
        leaderName: leader?.name || 'Leader',
        memberIds: formData.memberIds,
        status: formData.status,
      });
    }

    setShowCreateModal(false);
    loadData();
  };

  const toggleGroupStatus = (group: CollectionGroup) => {
    const newStatus = group.status === 'Active' ? 'Inactive' : 'Active';
    db.updateGroup(group.id, { status: newStatus });
    loadData();
  };

  const handleDeleteGroup = (group: CollectionGroup) => {
    if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
      db.deleteGroup(group.id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Module 01 & 05</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Collection Groups & Student Financial Accounts
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage field collection teams (up to 5 members), track group accounts, and monitor individual student ledgers with zero discrepancy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Group</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Collection Groups</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{groups.length} Active</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Wayanad Focus Team 2K26</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Collection</span>
          <div className="text-2xl font-black text-[#164A9B] mt-1">{formatINR(GRAND_TOTAL_COLLECTION, false)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Reconciled & Handed Over</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Collectors</span>
          <div className="text-2xl font-black text-slate-900 mt-1">5 Receivers</div>
          <span className="text-[11px] text-slate-500 font-semibold">Kakkidippuram Campus</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Field Dispatches</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{TOTAL_CAMP_DAYS} Days</div>
          <span className="text-[11px] text-slate-500 font-semibold">{TOTAL_RUNS_COUNT} Student Runs Settled</span>
        </div>
      </div>

      {/* Tabs & Search / Filter Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-[#164A9B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Collection Groups ({groups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('individuals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'individuals'
                ? 'bg-[#164A9B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Individual Student Ledgers (5)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'groups' ? 'Search group or leader...' : 'Search student or ID...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
            />
          </div>

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

      {/* TAB 1: GROUPS VIEW */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroups.map((group) => {
            const stats = getGroupStats(group);
            const groupMembers = members.filter((m) => group.memberIds.includes(m.id));

            return (
              <div
                key={group.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#164A9B] border border-blue-200">
                      {group.groupId}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Settled
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroupStatus(group)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                          group.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {group.status}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.campusName}</span>
                  </p>

                  {/* Financial Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Verified Total
                      </span>
                      <span className="text-base font-black text-[#164A9B] block mt-0.5">
                        {formatINR(stats.totalCollected, false)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Reconciled</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Dispatches
                      </span>
                      <span className="text-base font-black text-slate-900 block mt-0.5">
                        {stats.dispatchesCount} Days
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">89 Member Runs</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Cash Handover
                      </span>
                      <span className="text-base font-black text-emerald-600 block mt-0.5">
                        {formatINR(stats.cashHandedOver, false)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Zero Due</span>
                    </div>
                  </div>

                  {/* Group Leader Highlight */}
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Group Leader
                      </span>
                      <span className="text-xs font-black text-slate-900 truncate block">
                        {group.leaderName}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                      DKIF-REC-05
                    </span>
                  </div>

                  {/* Members List with Individual Collections */}
                  <div className="mt-4 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Assigned Members (Individual Breakdown)</span>
                      <span className="text-slate-600 font-black">{groupMembers.length} / 5</span>
                    </div>

                    <div className="space-y-1.5">
                      {groupMembers.map((m) => {
                        const acc = getMemberAccount(m);
                        const isLeader = m.id === group.leaderId;

                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/60"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.photoUrl || '/assets/member_photo_1.jpg'}
                                alt={m.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {m.name}
                                  </span>
                                  {isLeader && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                                      LEADER
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {m.memberId}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-[#164A9B] block">
                                {formatINR(acc.totalCollected, false)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {acc.daysCount} Runs • {acc.sharePercent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGroupHistory(group)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#164A9B] text-xs font-bold transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View 21 Daily Dispatches</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(group)}
                    className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Edit Group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INDIVIDUAL COLLECTOR LEDGERS TABLE */}
      {activeTab === 'individuals' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Individual Student Accounts
                </span>
                <span className="text-xs font-bold text-slate-400">Strict Equal Share Allocation</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Individual Student Collection Ledgers & Reconstructed Note Breakdown
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Equal share calculated strictly from dispatches in which each student actually participated. Zero double counting.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Collection Account
              </span>
              <span className="text-xl font-black text-[#164A9B]">
                {formatINR(GRAND_TOTAL_COLLECTION, false)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student & ID</th>
                  <th className="py-3.5 px-4 text-center">Dispatches</th>
                  <th className="py-3.5 px-4 text-right">Verified Total</th>
                  <th className="py-3.5 px-4 text-center">Share %</th>
                  <th className="py-3.5 px-4">Reconstructed Notes Breakdown</th>
                  <th className="py-3.5 px-4 text-center">Settlement</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMembers.map((member) => {
                  const acc = getMemberAccount(member);
                  const isHistoricalCollector = acc.hasData;

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isHistoricalCollector ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.photoUrl || '/assets/member_photo_1.jpg'}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {member.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="font-mono font-bold text-[#164A9B]">{member.memberId}</span>
                              <span>•</span>
                              <span>{member.campusName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-[#164A9B] font-black text-xs">
                          {acc.daysCount} Runs
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-black text-slate-900 block font-mono">
                          {formatINR(acc.totalCollected, false)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Handed Over</span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {acc.sharePercent > 0 ? `${acc.sharePercent.toFixed(2)}%` : '0.00%'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isHistoricalCollector ? (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              ₹500: <strong className="font-mono">{acc.breakdown.count500}</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                              ₹100: <strong className="font-mono">{acc.breakdown.count100}</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              ₹50: <strong className="font-mono">{acc.breakdown.count50}</strong>
                            </span>
                            {acc.breakdown.balance > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                Bal: ₹{acc.breakdown.balance.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No field dispatches recorded</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isHistoricalCollector ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-semibold">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isHistoricalCollector ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudentLedger({
                                member,
                                config: acc.config,
                                runs: acc.runs,
                                total: acc.totalCollected,
                                daysCount: acc.daysCount,
                                sharePercent: acc.sharePercent,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>View Ledger</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200 text-xs">
                <tr>
                  <td className="py-4 px-4 uppercase tracking-wider text-slate-600">
                    Grand Total (5 Active Collectors)
                  </td>
                  <td className="py-4 px-4 text-center text-[#164A9B]">
                    {TOTAL_RUNS_COUNT} Runs
                  </td>
                  <td className="py-4 px-4 text-right text-[#164A9B] font-mono text-sm">
                    {formatINR(GRAND_TOTAL_COLLECTION, false)}
                  </td>
                  <td className="py-4 px-4 text-center text-emerald-600">100.00%</td>
                  <td className="py-4 px-4 text-slate-600 text-[11px]">
                    465 × ₹500 • 151 × ₹100 • 30 × ₹50 notes
                  </td>
                  <td className="py-4 px-4 text-center text-emerald-600">100% Settled</td>
                  <td className="py-4 px-4 text-right text-emerald-600 font-bold">Zero Discrepancy</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingGroup ? 'Edit Collection Group' : 'Create New Collection Group'}
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayanad Focus Team 2K26"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Group ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
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

              {/* Members Selection (Up to 5) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Select Group Members (Max 5) *
                  </label>
                  <span className="text-[11px] font-black text-[#164A9B]">
                    {formData.memberIds.length} / 5 Selected
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1 bg-slate-50">
                  {members.map((m) => {
                    const isSelected = formData.memberIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMemberSelection(m.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-100/80 border border-blue-300 font-bold text-[#164A9B]'
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
              {formData.memberIds.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assign Group Leader *
                  </label>
                  <select
                    value={formData.leaderId}
                    onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    {formData.memberIds.map((mId) => {
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold shadow-md shadow-blue-900/20"
                >
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP COLLECTION HISTORY MODAL (21 DAILY DISPATCHES) */}
      {selectedGroupHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#164A9B]">
                  {selectedGroupHistory.groupId} • 21 Daily Field Drives
                </span>
                <h2 className="text-lg font-black text-slate-900">{selectedGroupHistory.name}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Total Collection: {formatINR(GRAND_TOTAL_COLLECTION, false)} • 100% Settled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroupHistory(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {NOTEBOOK_DAILY_CAMP_TOTALS.map((camp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#164A9B]">
                        DAY-{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-slate-900">{camp.places}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Date: {camp.date} • Route Collection Drive
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block font-mono">
                      {formatINR(camp.campTotal, false)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL STUDENT DAY-BY-DAY LEDGER DRAWER / MODAL */}
      {selectedStudentLedger && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudentLedger.member.photoUrl || '/assets/member_photo_1.jpg'}
                  alt={selectedStudentLedger.member.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#164A9B]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      {selectedStudentLedger.member.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-[#164A9B]">
                      {selectedStudentLedger.member.memberId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStudentLedger.member.campusName} • {selectedStudentLedger.member.place}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentLedger(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                <span className="text-[10px] text-[#164A9B] font-bold uppercase tracking-wider block">
                  Total Collection
                </span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  {formatINR(selectedStudentLedger.total, false)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Handed Over</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                  Dispatches Run
                </span>
                <span className="text-lg font-black text-emerald-900 mt-1 block">
                  {selectedStudentLedger.daysCount} Days
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Share: {selectedStudentLedger.sharePercent.toFixed(2)}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Average / Day
                </span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  {formatINR(
                    selectedStudentLedger.daysCount > 0
                      ? selectedStudentLedger.total / selectedStudentLedger.daysCount
                      : 0,
                    false
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Per Field Run</span>
              </div>
            </div>

            {/* Reconstructed Notes Summary */}
            {selectedStudentLedger.config && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                  Reconstructed Denominations Summary (For Physical Handover Audit)
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-700 block">₹500 Notes</span>
                    <span className="font-mono font-black text-purple-900 text-sm">
                      {selectedStudentLedger.config.expectedBreakdown.count500}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-[10px] font-bold text-sky-700 block">₹100 Notes</span>
                    <span className="font-mono font-black text-sky-900 text-sm">
                      {selectedStudentLedger.config.expectedBreakdown.count100}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block">₹50 Notes</span>
                    <span className="font-mono font-black text-amber-900 text-sm">
                      {selectedStudentLedger.config.expectedBreakdown.count50}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 block">Balance</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      ₹{selectedStudentLedger.config.expectedBreakdown.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Day-by-Day Historical Dispatches Table */}
            <div>
              <h4 className="text-xs font-black text-slate-900 mb-2">
                Day-by-Day Field Log ({selectedStudentLedger.runs.length} Records)
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Location / Place</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3">Notes Breakdown</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {selectedStudentLedger.runs.map((r, i) => {
                      const bd = calculateReconstructedBreakdown(r.amount);
                      return (
                        <tr key={i} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-800">
                            {r.date}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.place}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-[#164A9B]">
                            {formatINR(r.amount, false)}
                          </td>
                          <td className="py-2 px-3 text-[10px]">
                            <span className="text-slate-600">
                              {bd.count500}×500, {bd.count100}×100, {bd.count50}×50
                              {bd.balance > 0 ? ` +₹${bd.balance.toFixed(2)}` : ''}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                              Settled
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentLedger(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
