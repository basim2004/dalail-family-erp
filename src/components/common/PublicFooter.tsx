'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Address */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/official-logo.jpg"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-black text-slate-900 tracking-tight block uppercase">
              DALAIL FAMILY ERP
            </span>
            <p className="text-[11px] text-slate-400 font-medium">
              Dalailul Khairath Islamic Foundation (Regd.) • Kakkidippuram Campus, Malappuram
            </p>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <Link href="/" className="hover:text-[#164A9B] transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link href="/leaderboard" className="hover:text-[#164A9B] transition-colors">
            Leaderboard
          </Link>
          <span>•</span>
          <Link href="/campuses" className="hover:text-[#164A9B] transition-colors">
            Campuses
          </Link>
          <span>•</span>
          <Link href="/helpdesk" className="hover:text-[#164A9B] transition-colors">
            Help Desk
          </Link>
          <span>•</span>
          <Link href="/login" className="hover:text-[#164A9B] transition-colors">
            Login
          </Link>
        </div>

        {/* Contacts */}
        <div className="flex items-center gap-4 text-[11px] font-mono font-medium text-slate-600">
          <a href="tel:+917034149149" className="hover:text-[#164A9B] flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#164A9B]" />
            <span>+91 70341 49149</span>
          </a>
          <span>•</span>
          <a href="mailto:kakkidippuramdkif@gmail.com" className="hover:text-[#164A9B] flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>kakkidippuramdkif@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

