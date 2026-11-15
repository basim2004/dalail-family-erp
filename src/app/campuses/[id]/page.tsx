'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
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
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  BookOpen,
  Heart,
  Maximize2,
  X,
  ExternalLink,
  Users,
  Star,
  Award,
} from 'lucide-react';

export default function CampusDetailPage() {
  const params = useParams();
  const campusId = (params?.id as string) || '';
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Match campus by id or code
  const campus = registeredCampuses.find(
    (c) => c.id.toLowerCase() === campusId.toLowerCase() || c.code.toLowerCase() === campusId.toLowerCase()
  );

  if (!campus) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans">
        <PublicNavbar />
        <main className="max-w-4xl mx-auto w-full px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
          <Building2 className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Campus Not Found</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            The requested campus directory identifier does not exist or has been relocated under DKIF institutional records.
          </p>
          <Link
            href="/campuses"
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#164A9B] text-white font-bold text-xs hover:bg-[#0C2F66] transition-colors"
          >
            ← Return to Campuses Directory
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased">
      {/* Global Navigation */}
      <PublicNavbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        {/* ===================== BREADCRUMB & BACK LINK ===================== */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <Link
            href="/campuses"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#164A9B] transition-colors font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Campuses</span>
          </Link>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Link href="/" className="hover:text-slate-600">Home</Link>
            <span>/</span>
            <Link href="/campuses" className="hover:text-slate-600">Campuses</Link>
            <span>/</span>
            <span className="text-slate-700 font-bold truncate max-w-[160px] sm:max-w-none">{campus.name}</span>
          </div>
        </div>

        {/* ===================== CAMPUS HERO BANNER ===================== */}
        <section className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-card border border-slate-200/80">
          <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-end">
            {/* Campus Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campus.image}
              alt={campus.name}
              className="w-full h-full object-cover object-center absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

            <div className="relative z-20 p-6 sm:p-10 md:p-12 w-full max-w-4xl space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#F7D9A0] bg-black/60 px-3.5 py-1 rounded-full border border-amber-400/40 backdrop-blur-md">
                  {campus.code} • {campus.institutionName}
                </span>
                {campus.isHeadquarters && (
                  <span className="text-[11px] font-black uppercase tracking-wider text-white bg-[#164A9B] px-3.5 py-1 rounded-full border border-blue-400/50 shadow-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
                    Central Headquarters
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {campus.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-medium max-w-2xl leading-relaxed">
                {campus.tagline}
              </p>

              {/* Quick Info Bar */}
              <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-white/90 font-medium">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{campus.location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <GraduationCap className="w-3.5 h-3.5 text-[#F7D9A0]" />
                  <span>{campus.studentCount} Scholars & Receivers</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <Calendar className="w-3.5 h-3.5 text-blue-300" />
                  <span>Established {campus.established}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== MAIN GRID CONTENT ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: About, Academics, Facilities, Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Institutional Overview */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#164A9B]" />
                <span>About {campus.name}</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {campus.overview}
              </p>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#164A9B] shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  Accredited by the central board of Dalailul Khairath Islamic Foundation (Regd.). All education, boarding, and healthcare for enrolled orphan scholars are provided 100% free of charge through public community support.
                </p>
              </div>
            </section>

            {/* Official Brochure Milestones */}
            {(campus.huffazCount || campus.graduatesCount) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle text-center space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#164A9B]">{campus.studentCount}</span>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scholars & Staff</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle text-center space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600">{campus.huffazCount}</span>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certified Huffaz</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle text-center space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">{campus.graduatesCount}</span>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scholarly Graduates</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle text-center space-y-1">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600">{campus.postgraduatesCount}</span>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Postgraduates</p>
                </div>
              </div>
            )}

            {/* 2. Academic Programs */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#164A9B]" />
                <span>Academic Programs & Courses</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campus.academicPrograms.map((prog, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{prog}</p>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                        Certified syllabus with residential scholarship
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Facilities & Infrastructure */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Award className="w-5 h-5 text-[#164A9B]" />
                <span>Campus Infrastructure & Facilities</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {campus.facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#164A9B] shrink-0" />
                    <span className="truncate">{fac}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Authentic Photo Gallery */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-[#164A9B]" />
                  <span>Campus Photo Gallery</span>
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  Click to enlarge photos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {campus.galleryImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImageModal(imgUrl)}
                    className="relative group rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`${campus.name} Gallery ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Administration, Contact & Quick Actions */}
          <div className="space-y-6">
            {/* Admin in Charge Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Administration & Leadership
              </h3>

              {/* 1. Campus Administrator in charge of collection & fieldwork */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Campus Admin (Collection & Fieldwork)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Active In Charge</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {campus.adminName}
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Oversees student fieldwork dispatches, route place allocations, daily receipt collections, and camp welfare settlement.
                </p>
                <div className="pt-1">
                  <a
                    href={`tel:${campus.adminContact.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{campus.adminContact}</span>
                  </a>
                </div>
              </div>

              {/* 2. Founder & General Secretary Profile */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-900 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveImageModal(campus.founderPhoto || '/assets/founder.jpg')}
                    title="Click to view founder portrait"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={campus.founderPhoto || '/assets/founder.jpg'}
                      alt={campus.founderName || "USTHAD ABDUL SALAM SA'ADI KAKKIDIPPURAM"}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase text-[#164A9B] bg-blue-100/80 px-2 py-0.5 rounded-md inline-block mb-1">
                      Founder & General Secretary
                    </span>
                    <div className="text-sm font-black text-slate-900 leading-snug truncate">
                      {campus.founderName || "USTHAD ABDUL SALAM SA'ADI KAKKIDIPPURAM"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Dalailul Khairath Islamic Research Center
                    </div>
                  </div>
                </div>

                {/* Official Signature Endorsement */}
                {campus.id === 'campus_kak' && (
                  <div className="mt-2 pt-2.5 border-t border-slate-200/80 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Executive Founder Endorsement
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="h-10 flex items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/assets/office-signature.png"
                            alt="Signature - USTHAD ABDUL SALAM SA'ADI Kakkidippuram"
                            className="max-h-9 w-auto object-contain filter contrast-125"
                            style={{ imageRendering: '-webkit-optimize-contrast' }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 block truncate">
                          USTHAD ABDUL SALAM SA&apos;ADI Kakkidippuram
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block truncate">
                          Founder & General Secretary
                        </span>
                      </div>
                      <div className="w-12 h-12 relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/office-seal.png"
                          alt="Foundation Seal"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campus Contact Details */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Campus Address</span>
                    <span className="text-slate-600 font-medium">{campus.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#164A9B] shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 block">General Inquiry</span>
                    <a href={`tel:${campus.contact.replace(/\s+/g, '')}`} className="text-slate-600 hover:text-[#164A9B] font-medium">
                      {campus.contact}
                    </a>
                  </div>
                </div>

                {campus.secondaryContact && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#164A9B] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-700 block">Official Helpline</span>
                      <a href={`tel:${campus.secondaryContact.replace(/\s+/g, '')}`} className="text-slate-600 hover:text-[#164A9B] font-medium">
                        {campus.secondaryContact}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700 block">Official Email</span>
                    <a href={`mailto:${campus.email}`} className="text-slate-600 hover:text-[#164A9B] font-medium">
                      {campus.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Performance Highlight */}
            {campus.totalCollection && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Collection Drive Stats
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{campus.totalCollection}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Drive
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Recorded contributions supported by field receivers and online receipt verifications.
                </p>
                <Link
                  href="/leaderboard"
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <span>View Leaderboard Ranking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#0C2F66] to-[#164A9B] text-white rounded-3xl p-6 shadow-card space-y-3">
              <h4 className="text-sm font-black">Need Campus Support?</h4>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Submit an inquiry or request student credentials verification from this campus via our Help Desk.
              </p>
              <Link
                href="/helpdesk"
                className="w-full py-2.5 px-4 rounded-xl bg-white text-[#164A9B] hover:bg-blue-50 text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Raise Request on Help Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ===================== IMAGE LIGHTBOX MODAL ===================== */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImageModal}
              alt="Expanded Campus View"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

