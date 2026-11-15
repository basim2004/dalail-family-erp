'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/dbService';
import { Member } from '@/lib/types';
import { MemberIdCard } from '@/components/id-card/MemberIdCard';
import { formatINR } from '@/lib/services/financialSettlementService';
import {
  Building2,
  Users,
  CreditCard,
  BookOpen,
  FolderOpen,
  ArrowRight,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Calendar,
  Layers,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function CampusAdminOverviewPage() {
  const router = useRouter();
  const campusId = 'campus_kak';
  const campus = db.getCampusById(campusId) || {
    id: 'campus_kak',
    name: 'Dalailul Khairath Islamic Foundation Kakkidippuram Main Campus',
    code: 'KAK01',
    institutionName: 'DALAILUL KHAIRATH ISLAMIC FOUNDATION (Regd.)',
    location: 'Kakkidippuram, P.O. Alamkode',
    address: 'Kakkidippuram Campus, P.O. Alamkode, Malappuram Dt. 679585',
    district: 'Malappuram',
    state: 'Kerala',
    pincode: '679585',
    contact: '+91 7034149149',
    campusAdminName: "USTHAD ABDUL HAKEEM SA'ADI",
    status: 'Active' as const,
    membersCount: 100,
    createdAt: '2008-01-01T00:00:00Z',
  };

  const members = db.getMembers(campusId);
  const brochures = db.getBrochures();
  const fieldWork = db.getFieldWorkItems();
  const dispatches = db.getDispatches(campusId);
  const groups = db.getCollectionGroups(campusId);
  const receipts = db.getReceipts().filter((r) => r.campusId === campusId || !r.campusId);
  const campusCollection = receipts.reduce((sum, r) => sum + r.amount, 0);

  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  const handleEditMemberFromCard = (member: Member) => {
    setSelectedMemberForCard(null);
    router.push(`/campus-admin/members?edit=${member.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome & Campus Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2.5 py-1 rounded-md">
              Campus Administration Portal
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Campus
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-dalail-primary" />
            {campus.name}
          </h1>

          <p className="text-xs text-slate-500 mt-1 font-medium">
            {campus.institutionName} • Code: <span className="font-mono text-slate-700 font-bold">{campus.code}</span>
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {campus.address} (PIN: {campus.pincode})
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {campus.contact}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/campus-admin/groups"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
          >
            <Layers className="w-4 h-4 text-dalail-primary" /> Manage Squads
          </Link>
          <Link
            href="/campus-admin/members"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dalail-primary text-white text-xs font-bold hover:bg-dalail-dark shadow-sm transition-all shrink-0"
          >
            <CreditCard className="w-4 h-4" /> Issue ID Cards
          </Link>
        </div>
      </div>

      {/* Campus Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#164A9B] to-[#0D2D5E] rounded-2xl p-5 text-white flex flex-col justify-between shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase">Campus Collection</span>
            <TrendingUp className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="text-2xl font-black font-mono mt-3">
            {formatINR(campusCollection)}
          </div>
          <span className="text-[11px] text-blue-100/80 mt-1">
            {receipts.length} verified donor receipts
          </span>
        </div>

        <Link
          href="/campus-admin/groups"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:border-dalail-primary transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Collection Squads</span>
            <div className="p-2 rounded-xl bg-blue-50 text-dalail-primary group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-3">
            {groups.length} <span className="text-sm font-bold text-slate-400 font-sans">Squads</span>
          </div>
          <span className="text-xs font-bold text-dalail-primary flex items-center gap-1 mt-1">
            Manage Squads <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/campus-admin/dispatches"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:border-purple-600 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Dispatches</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-3">
            {dispatches.length} <span className="text-sm font-bold text-slate-400 font-sans">Routes</span>
          </div>
          <span className="text-xs font-bold text-purple-600 flex items-center gap-1 mt-1">
            Review Dispatches <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/campus-admin/members"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:border-emerald-600 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Receivers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-3">
            {members.length} <span className="text-sm font-bold text-slate-400 font-sans">Students</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
            Student Directory <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* 4 Core Module Cards for Campus Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/campus-admin/members"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {members.length}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Campus Members & ID Cards</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official receivers list with exact PDF ID card download, edit & print
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            View Members <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/campus-admin/brochures"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {brochures.length}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Institution Brochures</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Multi-lingual official publications (English, Urdu, Kannada, Malayalam)
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            Open Brochures <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/campus-admin/fieldwork"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {fieldWork.length}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Field Work Materials</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official signed & stamped letters of authority for field collectors
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
            View & Print Materials <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/campus-admin/dispatches"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card hover:border-dalail-primary transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {dispatches.length}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Dispatches & Settlement</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Assign routes, track equal shares & submit for central settlement
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
            Manage Dispatches <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Campus Members Quick List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-dalail-primary" />
              Authorized Campus Receivers ({members.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official members designated from the foundation ID cards PDF
            </p>
          </div>
          <Link
            href="/campus-admin/members"
            className="text-xs font-bold text-dalail-primary hover:underline"
          >
            Manage All &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900 tracking-wide">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {m.roleTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {m.addressLine1}, {m.place} • PIN: {m.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setSelectedMemberForCard(m)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dalail-light hover:bg-blue-100 text-dalail-primary font-bold text-xs border border-blue-200 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Generate ID Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ID Card Generator Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-auto">
            <button
              onClick={() => setSelectedMemberForCard(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                ID Card Preview & Download
              </span>
              <h3 className="font-black text-lg text-slate-900 mt-1">
                {selectedMemberForCard.name} ({selectedMemberForCard.roleTitle})
              </h3>
              <p className="text-xs text-slate-400">
                Exact layout replication with authentic seal, signature, and official logo.
              </p>
            </div>

            <div className="flex justify-center my-4 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <MemberIdCard
                member={selectedMemberForCard}
                onEdit={handleEditMemberFromCard}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
