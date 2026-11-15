'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PublicNavbar,
} from '@/components/common/PublicNavbar';
import {
  PublicFooter,
} from '@/components/common/PublicFooter';
import {
  FloatingAIChat,
} from '@/components/common/FloatingAIChat';
import { registeredCampuses } from '@/lib/data/campusesData';
import {
  Building2,
  MapPin,
  GraduationCap,
  Phone,
  Mail,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Calendar,
  Compass,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function CampusesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const districts = ['all', ...Array.from(new Set(registeredCampuses.map((c) => c.district)))];

  const filteredCampuses = registeredCampuses.filter((campus) => {
    const matchesSearch =
      campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.adminName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict =
      selectedDistrict === 'all' || campus.district.toLowerCase() === selectedDistrict.toLowerCase();

    return matchesSearch && matchesDistrict;
  });

  const totalStudents = registeredCampuses.reduce((acc, c) => acc + c.studentCount, 0);

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      {/* 1. Global Navigation */}
      <PublicNavbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
        {/* ===================== DIRECTORY HERO BANNER ===================== */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0C2F66] via-[#164A9B] to-[#1E60B8] text-white p-6 sm:p-10 md:p-12 shadow-card border border-blue-900/30">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F7D9A0] text-xs font-bold tracking-wide uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Network</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Campuses & Centers Directory
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              Explore the officially registered academic campuses, residential complexes, and welfare institutions established under Dalailul Khairath Islamic Foundation (Regd.).
            </p>
          </div>

          {/* Key Directory Highlights */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-white">{registeredCampuses.length}</span>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">Active Campuses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-[#F7D9A0]">{totalStudents}+</span>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">Scholars & Receivers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">100%</span>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">Free Boarding & Care</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-white truncate block">Kakkidippuram</span>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">Main Headquarters</p>
            </div>
          </div>
        </section>

        {/* ===================== SEARCH & FILTER BAR ===================== */}
        <section className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by campus name, code or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#164A9B] focus:border-transparent font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0 ml-1 mr-2">
              <Filter className="w-3.5 h-3.5" /> District:
            </span>
            {districts.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDistrict(d)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all shrink-0 ${selectedDistrict === d
                    ? 'bg-[#164A9B] text-white shadow-xs font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
              >
                {d === 'all' ? 'All Districts' : d}
              </button>
            ))}
          </div>
        </section>

        {/* ===================== CAMPUS DIRECTORY GRID ===================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#164A9B]" />
              <span>Registered Campuses ({filteredCampuses.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Showing official campuses under DKIF (Regd.)
            </span>
          </div>

          <div className={`grid gap-6 ${filteredCampuses.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredCampuses.map((campus) => (
              <div
                key={campus.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Photo & Badges Header */}
                <div className="relative h-52 sm:h-56 bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campus.image}
                    alt={campus.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#164A9B]/90 text-white backdrop-blur-md shadow-xs border border-white/20">
                      {campus.code}
                    </span>
                    {campus.isHeadquarters ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 backdrop-blur-md shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Main HQ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md">
                        Active Campus
                      </span>
                    )}
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                      <GraduationCap className="w-3.5 h-3.5 text-[#F7D9A0]" />
                      <span>{campus.studentCount} Students & Receivers</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-200 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>Est. {campus.established}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#164A9B] transition-colors leading-snug">
                      {campus.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{campus.address}</span>
                    </p>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-3 line-clamp-2">
                      {campus.overview}
                    </p>

                    {/* Facilities Chips */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Key Campus Facilities:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {campus.facilities.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                          >
                            {f}
                          </span>
                        ))}
                        {campus.facilities.length > 3 && (
                          <span className="px-2 py-1 rounded-md text-[11px] font-bold text-[#164A9B] bg-blue-50">
                            +{campus.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Admin in Charge & Action Link */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                          Campus Admin (Fieldwork & Collection)
                        </span>
                        <span className="font-bold text-slate-900 truncate block">
                          {campus.adminName}
                        </span>
                      </div>
                      <a
                        href={`tel:${campus.contact.replace(/\s+/g, '')}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#164A9B] text-slate-600 transition-colors"
                        title={`Call ${campus.contact}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <Link
                      href={`/campuses/${campus.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#164A9B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs group-hover:bg-[#164A9B]"
                    >
                      <span>Explore Campus Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== INSTITUTIONAL ACCREDITATION & ASSURANCE ===================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-[#164A9B]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Government & Shariah Registered Network
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  All branches operate strictly under the governing trust of Dalailul Khairath Islamic Foundation (Regd.). Receipts and dispatches are digitally verified.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/helpdesk"
                className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 transition-colors text-center"
              >
                Contact Administration
              </Link>
              <Link
                href="/login"
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-colors shadow-xs text-center"
              >
                Campus Admin Portal →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

