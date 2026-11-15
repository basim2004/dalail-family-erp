'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/db/dbService';
import { PublicMediaSettings } from '@/lib/types';
import {
  Instagram,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface InstagramShowcaseSectionProps {
  customSettings?: PublicMediaSettings;
}

export function InstagramShowcaseSection({ customSettings }: InstagramShowcaseSectionProps) {
  const [settings, setSettings] = useState<PublicMediaSettings>(
    customSettings || db.getPublicMediaSettings()
  );

  useEffect(() => {
    if (!customSettings) {
      setSettings(db.getPublicMediaSettings());
    }
  }, [customSettings]);

  if (!settings.instagramEnabled) {
    return null;
  }

  const igUrl = settings.instagramUrl || 'https://www.instagram.com/dalailul_khairath_/';
  const igHandle = settings.instagramHandle || 'dalailul_khairath_';

  return (
    <section className="bg-gradient-to-b from-white via-slate-50/50 to-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-subtle space-y-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Official Social Information & CTAs (Span 6 cols) */}
        <div className="lg:col-span-6 space-y-6 text-left order-2 lg:order-1">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 text-purple-900 text-xs font-bold border border-rose-200/70 shadow-2xs">
              <Instagram className="w-3.5 h-3.5 text-rose-600" />
              <span>Official Instagram Channel</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Follow Our Daily Journey & Campus Moments on Instagram
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Stay connected with daily glimpses of classical Islamic scholarship, spiritual gatherings at Masjid Zainab, convocations, and community programs directly from the official feed of <span className="font-bold text-slate-900">Dalailul Khairath, Kakkidippuram</span>.
            </p>
          </div>

          {/* Quick Metrics Bar from Official Account */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-center">
            <div className="p-2">
              <span className="block text-base sm:text-lg font-black text-slate-900">340</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Posts</span>
            </div>
            <div className="p-2 border-x border-slate-200">
              <span className="block text-base sm:text-lg font-black text-slate-900">597</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Followers</span>
            </div>
            <div className="p-2">
              <span className="block text-base sm:text-lg font-black text-slate-900">12</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Following</span>
            </div>
          </div>

          {/* Key Content Highlights */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>
                <strong className="text-slate-900">Qur&apos;an Hub of Jamia Madeenathunnoor:</strong> Tahfeezul Qur&apos;an achievements, Tajweed recitations, and student recognitions.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>
                <strong className="text-slate-900">Academic & Cultural Events:</strong> Coverage of annual Rendezvous, Meelad campaigns, convocations, and historical archives.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>
                <strong className="text-slate-900">Direct Head Office Notices:</strong> Announcements from Kakkidippuram Main Campus, Alamkode, Malappuram.
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>Follow @{igHandle}</span>
              <ArrowUpRight className="w-4 h-4 text-white/90" />
            </a>

            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <span>Open in Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* Verified Footnote */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 text-[#164A9B] shrink-0" />
            <span>Official Verified Instagram Account of Dalailul Khairath Islamic Foundation (Regd.)</span>
          </div>
        </div>

        {/* Right Column: Exact Instagram Screenshot Inside Realistic Smartphone Mockup (Span 6 cols) */}
        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
          {/* Smartphone Frame Outer Shell */}
          <div className="relative w-full max-w-[320px] sm:max-w-[350px] bg-slate-950 rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 select-none group">
            {/* Top Speaker / Dynamic Island Cutout Accent */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-between px-2.5 pointer-events-none shadow-sm">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
            </div>

            {/* Inner Phone Screen Displaying the EXACT Original Screenshot */}
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-[34px] overflow-hidden bg-black shadow-inner border border-slate-800 focus:outline-none"
              title="Click to open @dalailul_khairath_ on Instagram"
            >
              {/* The EXACT Original Screenshot with Preserved Proportions and No Modification */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/instagram_screenshot_official.jpg"
                alt="Dalailul Khairath Official Instagram Profile (@dalailul_khairath_)"
                className="w-full h-auto block select-none group-hover:scale-[1.01] transition-transform duration-300"
                style={{ aspectRatio: '459 / 1024' }}
                loading="eager"
              />

              {/* Subtle Interactive Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 text-white pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold w-fit border border-white/20">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Open @{igHandle} on Instagram</span>
                  <ExternalLink className="w-3 h-3 text-white/80" />
                </div>
              </div>
            </a>

            {/* Hardware Side Button Accents */}
            <div className="absolute -left-1 top-24 w-1 h-10 bg-slate-700 rounded-l-md pointer-events-none" />
            <div className="absolute -left-1 top-38 w-1 h-10 bg-slate-700 rounded-l-md pointer-events-none" />
            <div className="absolute -right-1 top-28 w-1 h-12 bg-slate-700 rounded-r-md pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
