'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Campuses', href: '/campuses' },
    { label: 'Help Desk', href: '/helpdesk' },
    { label: 'Login', href: '/login' },
  ];

  return (
    <footer className="mt-12 bg-white border-t border-slate-200 pt-8 pb-24 sm:pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Address */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/official-logo.jpg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-black text-slate-900 tracking-tight block uppercase text-xs sm:text-sm">
              DALAIL FAMILY ERP
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Dalailul Khairath Islamic Foundation (Regd.) • Kakkidippuram, Malappuram
            </p>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#164A9B] border border-slate-200/80 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contacts */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] font-mono font-medium text-slate-600">
          <a
            href="tel:+917034149149"
            className="hover:text-[#164A9B] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60"
          >
            <Phone className="w-3.5 h-3.5 text-[#164A9B]" />
            <span>+91 70341 49149</span>
          </a>
          <a
            href="mailto:kakkidippuramdkif@gmail.com"
            className="hover:text-[#164A9B] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>kakkidippuramdkif@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
