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
import {
  Building2,
  BookOpen,
  Heart,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Maximize2,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Bell,
  Mail,
  GraduationCap,
} from 'lucide-react';

export default function HomePage() {
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const announcements = [
    {
      id: 'ann_1',
      date: '12 November 2026',
      badge: 'Academic Admission',
      title: 'Annual Shariah & Tahfeezul Quran Entrance 2026-27 Announced',
      desc: 'Applications are now open for the comprehensive Higher Islamic Theology, Daw’ah, and Hifz courses at Kakkidippuram campus. All admitted students receive full scholarship including boarding and study materials.',
    },
    {
      id: 'ann_2',
      date: '05 November 2026',
      badge: 'Orphan Care Wing',
      title: 'Residential Orphan Care & Destitute Sponsorship Expansion',
      desc: 'Masjid Zainab complex has inaugurated expanded student residential dormitories and healthcare amenities, welcoming 50+ new orphan scholars under our continuous community patronage.',
    },
    {
      id: 'ann_3',
      date: '28 October 2026',
      badge: 'Field Operations',
      title: 'Official Multilingual Letters of Authority Issued for Field Representatives',
      desc: 'Certified credentials in English, Kannada, Tamil, and Urdu have been authorized for student receivers representing Dalailul Khairath Islamic Foundation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      {/* 1. Global Public Navigation Bar */}
      <PublicNavbar />

      {/* Main Institutional Content Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-12 flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200/80 bg-slate-950">
          <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[520px] flex items-end">
            {/* Campus Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/campus-main.jpg"
              alt="Kakkidippuram Main Campus"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />

            {/* Welcome & Institutional Title */}
            <div className="relative z-20 p-5 sm:p-10 md:p-14 w-full max-w-4xl space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#F7D9A0] bg-black/50 px-3.5 py-1 rounded-full border border-amber-400/50 backdrop-blur-md">
                  DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)
                </span>
                <span className="text-[11px] text-white/80 font-semibold hidden sm:inline-block">
                  • Kakkidippuram Campus, Malappuram
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                Center of Higher Islamic Learning, Daw’ah Studies & Orphan Welfare
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-slate-200 drop-shadow-xs max-w-2xl leading-relaxed">
                Welcome to Dalailul Khairath Islamic Foundation (Regd.) at Kakkidippuram, P.O. Alamkode, Malappuram Dt., Kerala. Integrating traditional Islamic scholarship with dignified orphan sponsorship and humanitarian care.
              </p>

              <div className="pt-2 sm:pt-4 grid grid-cols-2 sm:flex sm:flex-row items-center gap-2.5 sm:gap-3">
                <a
                  href="#highlights"
                  className="w-full sm:w-auto text-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs border border-white/20 transition-all shadow-sm"
                >
                  Campus Highlights
                </a>
                <Link
                  href="/campuses"
                  className="w-full sm:w-auto text-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 backdrop-blur-md transition-all shadow-sm"
                >
                  Explore Campuses &rarr;
                </Link>
                <Link
                  href="/helpdesk"
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto text-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#F5B82E] hover:bg-[#e0a420] text-slate-950 font-black text-xs transition-all shadow-sm"
                >
                  Help Desk & Support
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INSTITUTIONAL INTRODUCTION & LEADERSHIP PROFILE ===================== */}
        <section className="bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Executive Leadership & Authorized Signatory Card */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-5 sm:p-6 bg-gradient-to-b from-blue-50/60 to-slate-50/90 rounded-3xl border border-blue-100 shadow-2xs">
            <div
              className="relative mb-3 group cursor-pointer inline-block"
              onClick={() => setActiveImageModal('/assets/founder.jpg')}
              title="Click to view founder portrait"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-900 group-hover:scale-105 transition-transform duration-200 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/founder.jpg"
                  alt="USTHAD ABDUL SALAM SA'ADI Kakkidippuram - Founder & General Secretary"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-1 right-1 p-1 bg-[#164A9B] text-white rounded-full shadow-md border-2 border-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider text-[#164A9B] bg-blue-100/80 border border-blue-200 px-3 py-0.5 rounded-full mb-1">
              Founder & General Secretary
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
              USTHAD ABDUL SALAM SA&apos;ADI Kakkidippuram
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Founder & General Secretary, Dalailul Khairath Islamic Research Center
            </p>

            <a
              href="tel:+917034149149"
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 hover:text-[#164A9B] shadow-2xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#164A9B]" />
              <span>+91 7034149149</span>
            </a>

            {/* High Quality Official Signature & Seal Block (Side-by-side certificate layout) */}
            <div className="mt-4 pt-3 border-t border-slate-200/90 w-full space-y-2">
              <div className="w-full bg-white rounded-2xl p-3 border border-slate-200 shadow-subtle">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                  Official Credential Verification
                </span>

                <div className="grid grid-cols-2 gap-2 items-center">
                  {/* Left: Authorized Signature */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 h-24">
                    <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider mb-1">
                      Signatory
                    </span>
                    <div className="flex-1 flex items-center justify-center w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/office-signature.png"
                        alt="Signature - USTHAD ABDUL SALAM SA'ADI Kakkidippuram"
                        className="max-h-12 w-auto object-contain filter contrast-125"
                      />
                    </div>
                  </div>

                  {/* Right: Foundation Official Seal */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 h-24">
                    <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider mb-1">
                      Official Seal
                    </span>
                    <div className="flex-1 flex items-center justify-center w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/office-seal.png"
                        alt="Official Foundation Seal"
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 w-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Executive Authority Endorsement</span>
              </div>
            </div>
          </div>

          {/* Introduction Content */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#164A9B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Institutional Overview & Mission</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              “Nurturing Prophetic Scholarship & Empowering Deserving Children With Faith and Dignity”
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>Dalailul Khairath Islamic Foundation (Regd.)</strong> was founded with the sacred aim of disseminating authentic Islamic theological knowledge, establishing state-of-the-art educational campuses, and running comprehensive social welfare sanctuaries for orphans and destitute students.
              </p>
              <p>
                Headquartered at the <strong>Kakkidippuram Main Campus</strong> in Malappuram District, our institution provides 100% free religious education, boarding facilities, healthcare, and secular academic guidance. We impart traditional Shariah scholarship alongside contemporary communication, Arabic linguistics, and moral mentorship.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-xl font-black text-[#164A9B]">20+</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Years of Service</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-xl font-black text-emerald-600">100</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Scholars & Staff</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-xl font-black text-amber-600">150+</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Huffaz Produced</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="block text-xl font-black text-purple-600">200+</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Graduates</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CAMPUS HIGHLIGHTS ===================== */}
        <section id="highlights" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#164A9B] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-blue-200">
                Infrastructure & Facilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Campus Highlights & Institutional Heritage
              </h2>
            </div>
            <Link
              href="/campuses/campus_kak"
              className="text-xs font-bold text-[#164A9B] hover:underline flex items-center gap-1 self-start sm:self-end"
            >
              <span>Explore Campus Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/campus-main.jpg"
                    alt="Masjid Zainab"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#164A9B] shadow-xs">
                    Spiritual Center
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-black text-base text-slate-900">Masjid Zainab & Campus Complex</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Premier spiritual sanctuary hosting daily congregational prayers, spiritual majlis gatherings, and integrated classical Islamic learning.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Kakkidippuram Main Campus
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/authentic_student_4.jpg"
                    alt="Conference Hall"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-amber-700 shadow-xs">
                    Academic Auditorium
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-black text-base text-slate-900">Marhoom K. P. Moitheen Musliyar Memorial Hall</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Spacious academic conference and assembly hall dedicated to inter-collegiate symposiums, scholarly discourses, and community orientation.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Kakkidippuram Main Campus
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/authentic_student_2.jpg"
                    alt="Qur'an Study Center"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-emerald-700 shadow-xs">
                    Tahfeez & Research
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-black text-base text-slate-900">Shaikhuna Kakkidippuram Memorial Qur&apos;an Center</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Intensive Quranic memorization academy, classical research library, and residential scholarship wing providing free boarding for all students.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Kakkidippuram Main Campus
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ACADEMIC EXCELLENCE & STUDENT ACTIVITIES (4 AUTHENTIC PHOTOS) ===================== */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#164A9B] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-blue-200">
                Prophetic Tradition & Scholarly Rigor
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Academic Excellence & Student Life
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Glimpses from daily life: Quran memorization, classical library research, Dars study circles, and faculty mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'p1',
                title: 'Quran Hifz & Tajweed Recitation',
                subtitle: 'Daily memorization and authentic Qira’at on prayer carpet.',
                image: '/assets/authentic_student_1.jpg',
                tag: 'Tahfeezul Quran',
              },
              {
                id: 'p2',
                title: 'Classical Research Library',
                subtitle: 'Students selecting classical Arabic treatises and Hadith volumes.',
                image: '/assets/authentic_student_2.jpg',
                tag: 'Islamic Treatises',
              },
              {
                id: 'p3',
                title: 'Fiqh & Dars Study Circles',
                subtitle: 'Peer-guided scholarly discussion of Islamic jurisprudence.',
                image: '/assets/authentic_student_3.jpg',
                tag: 'Dars Circle',
              },
              {
                id: 'p4',
                title: 'Founder & Academic Council',
                subtitle: 'Usthad Abdul Salam Sa’adi chairing academic conference.',
                image: '/assets/authentic_student_4.jpg',
                tag: 'Faculty Council',
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveImageModal(item.image)}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-card transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-2xs">
                      {item.tag}
                    </span>
                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#164A9B] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0 text-[10px] font-bold text-[#164A9B] flex items-center gap-1">
                  <span>Enlarge Photo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== IMPORTANT ANNOUNCEMENTS ===================== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Important Announcements & Bulletins
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-3 flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#164A9B] px-2.5 py-0.5 rounded-full border border-blue-200">
                      {ann.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      {ann.date}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ann.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Kakkidippuram Campus</span>
                  <span className="text-[#164A9B] font-bold">Official Bulletin</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Full Screen Image Lightbox */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImageModal}
              alt="Enlarged academic preview"
              className="w-full h-full object-contain max-h-[85vh] rounded-xl"
            />
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />

      {/* Minimal Public Footer */}
      <PublicFooter />
    </div>
  );
}
