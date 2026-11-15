'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export function PublicFooter() {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Campuses', href: '/campuses' },
    { label: 'Help Desk', href: '/helpdesk' },
    { label: 'Login to Portal', href: '/login' },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Institution Info (Span 5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                <Image
                  src="/assets/official-logo.jpg"
                  alt="Dalailul Khairath Official Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight uppercase">
                  DALAIL FAMILY ERP
                </h3>
                <p className="text-xs font-semibold text-[#164A9B]">
                  Dalailul Khairath Islamic Foundation (Regd.)
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              Centralized enterprise governance, multi-campus student dispatch logistics, and verified digital receipt collections system.
            </p>

            <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
              <MapPin className="w-4 h-4 text-[#164A9B] shrink-0 mt-0.5" />
              <span>Kakkidippuram, P.O. Alamkode, Malappuram Dt., Kerala – 679585</span>
            </div>
          </div>

          {/* Quick Navigation Links (Span 3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#164A9B] hover:translate-x-0.5 transition-all inline-flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Contact & Direct Verification (Span 4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Official Desk & Support
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href="tel:+917034149149"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-slate-700 hover:text-[#164A9B]"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#164A9B] flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Official Contact</span>
                  <span className="font-mono font-bold text-xs sm:text-sm">+91 70341 49149</span>
                </div>
              </a>

              <a
                href="mailto:kakkidippuramdkif@gmail.com"
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-slate-700 hover:text-[#164A9B]"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#164A9B] flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Official Email</span>
                  <span className="font-mono font-semibold text-xs truncate block">kakkidippuramdkif@gmail.com</span>
                </div>
              </a>

              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Audited Central ERP &bull; 100% Verified Receipts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer with Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Dalailul Khairath Islamic Foundation (Regd.). All rights reserved.
          </p>
          <p className="font-mono text-center sm:text-right">
            DALAIL FAMILY ERP &bull; Enterprise Institutional Edition
          </p>
        </div>
      </div>
    </footer>
  );
}
