'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/db/dbService';
import { PublicMediaSettings } from '@/lib/types';
import {
  Instagram,
  ExternalLink,
  CheckCircle2,
  Grid,
  Bookmark,
  UserCheck,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Lock,
  Compass,
  Film,
  PlusSquare,
  Search,
  Wifi,
  Battery,
  ShieldCheck,
  Sparkles,
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
  const igName = settings.instagramName || 'Dalailul Khairath';

  const highlights = [
    { title: 'Campus', img: '/assets/campus-main.jpg' },
    { title: 'Orphan Care', img: '/assets/founder.jpg' },
    { title: 'Students', img: '/assets/authentic_student_1.jpg' },
    { title: 'Dars & Hifz', img: '/assets/authentic_student_2.jpg' },
    { title: 'Events', img: '/assets/authentic_student_4.jpg' },
  ];

  const posts = settings.instagramPosts && settings.instagramPosts.length > 0
    ? settings.instagramPosts
    : [
        { id: '1', imageUrl: '/assets/campus-main.jpg', postUrl: igUrl, caption: 'Masjid Zainab Complex' },
        { id: '2', imageUrl: '/assets/authentic_student_1.jpg', postUrl: igUrl, caption: 'Tahfeezul Quran' },
        { id: '3', imageUrl: '/assets/authentic_student_2.jpg', postUrl: igUrl, caption: 'Classical Library' },
        { id: '4', imageUrl: '/assets/authentic_student_3.jpg', postUrl: igUrl, caption: 'Dars Circles' },
        { id: '5', imageUrl: '/assets/authentic_student_4.jpg', postUrl: igUrl, caption: 'Academic Hall' },
        { id: '6', imageUrl: '/assets/founder.jpg', postUrl: igUrl, caption: 'Founder & Secretary' },
      ];

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/30 to-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-subtle space-y-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Descriptive Story & Official Social CTA (Span 6 cols) */}
        <div className="lg:col-span-6 space-y-5 text-left order-2 lg:order-1">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 text-purple-900 text-xs font-bold border border-rose-200/70 shadow-2xs">
              <Instagram className="w-3.5 h-3.5 text-rose-600" />
              <span>Official Social Media Channel</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Follow Our Daily Journey & Campus Moments on Instagram
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Stay connected with daily glimpses of classical Islamic scholarship, spiritual gatherings at Masjid Zainab, orphan welfare sponsorships, and scholarly symposiums directly from our official Instagram feed.
            </p>
          </div>

          {/* Social Proof Bullet Highlights */}
          <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Daily Quran memorization (Hifz) & Tajweed recitations</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Live coverage of visiting scholars and guest lectures</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold">Official notices from Kakkidippuram Main Campus Head Office</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 hover:shadow-lg transition-all"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>Follow @{igHandle}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>

            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs hover:bg-slate-50 transition-all"
            >
              <span>View Profile</span>
            </a>
          </div>

          {/* Verified Account Footnote */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 text-[#164A9B]" />
            <span>Official Verified Instagram Account of Dalailul Khairath Islamic Foundation (Regd.)</span>
          </div>
        </div>

        {/* Right Column: Realistic Smartphone Mockup (Span 6 cols) */}
        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
          {/* Smartphone Frame Outer Shell */}
          <div className="relative w-full max-w-[320px] sm:max-w-[340px] bg-slate-900 rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 select-none">
            {/* Phone Speaker & Dynamic Island Pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-white rounded-[34px] overflow-hidden flex flex-col text-slate-900 font-sans shadow-inner border border-slate-200">
              {/* Phone Status Bar */}
              <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[10px] font-bold text-slate-900">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[9px] font-bold">5G</span>
                  <Battery className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              {/* Instagram App Top Header */}
              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-black">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[150px]">{igHandle}</span>
                  <div className="w-3 h-3 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-[7px] font-black">
                    ✓
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              </div>

              {/* Instagram Profile Header (Avatar + Counts) */}
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  {/* Profile Picture with Instagram Gradient Story Ring */}
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative shrink-0 p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xs group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white p-0.5 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/official-logo.jpg"
                        alt={igName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </a>

                  {/* Profile Statistics */}
                  <div className="flex-1 flex items-center justify-around text-center">
                    <div>
                      <span className="block text-xs font-black text-slate-900">{settings.instagramPostsCount || '248'}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Posts</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-900">{settings.instagramFollowersCount || '12.4K'}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Followers</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-900">{settings.instagramFollowingCount || '86'}</span>
                      <span className="text-[9px] text-slate-500 font-medium">Following</span>
                    </div>
                  </div>
                </div>

                {/* Name & Bio */}
                <div className="text-[11px] leading-tight space-y-0.5">
                  <span className="font-bold text-slate-900 block">{igName}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Education & Welfare Sanctuary</span>
                  {settings.instagramBio && settings.instagramBio.length > 0 ? (
                    settings.instagramBio.map((line, idx) => (
                      <p key={idx} className="text-[10px] text-slate-700 leading-snug">
                        {line}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="text-[10px] text-slate-700 leading-snug">دَلَائِلُ الْخَيْرَاتِ الإسلامية</p>
                      <p className="text-[10px] text-slate-700 leading-snug">Center of Higher Islamic Learning & Orphan Welfare</p>
                      <p className="text-[10px] text-slate-700 leading-snug">📍 Kakkidippuram, Malappuram, Kerala</p>
                    </>
                  )}
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#00376B] font-bold hover:underline block pt-0.5"
                  >
                    dalail.org
                  </a>
                </div>

                {/* Action Button: Follow */}
                <div className="pt-1 flex items-center gap-1.5">
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#0095F6] hover:bg-[#1877F2] text-white text-[11px] font-black text-center transition-colors shadow-2xs"
                  >
                    Follow
                  </a>
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold text-center transition-colors"
                  >
                    Message
                  </a>
                </div>

                {/* Story Highlights Circles */}
                <div className="pt-2 flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1">
                  {highlights.map((h, idx) => (
                    <a
                      key={idx}
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 shrink-0 group"
                    >
                      <div className="w-11 h-11 rounded-full p-0.5 border border-slate-300 bg-white group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={h.img} alt={h.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <span className="text-[8px] font-medium text-slate-600 truncate max-w-[48px]">
                        {h.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Grid Tab Nav */}
              <div className="border-t border-slate-200 flex items-center justify-around py-1.5 text-slate-900">
                <div className="border-b-2 border-slate-900 pb-1 px-4">
                  <Grid className="w-4 h-4 text-slate-900" />
                </div>
                <div className="pb-1 px-4 text-slate-400">
                  <Film className="w-4 h-4" />
                </div>
                <div className="pb-1 px-4 text-slate-400">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>

              {/* 3-Column Recent Posts Photo Grid */}
              <div className="grid grid-cols-3 gap-0.5 bg-slate-100">
                {posts.slice(0, 6).map((post) => (
                  <a
                    key={post.id}
                    href={post.postUrl || igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square bg-slate-200 overflow-hidden group block"
                    title={post.caption || 'View on Instagram'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.caption || 'Instagram post'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Instagram className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Bottom Phone App Navigation Bar */}
              <div className="bg-white border-t border-slate-100 py-2 px-5 flex items-center justify-between text-slate-800">
                <Compass className="w-4 h-4" />
                <Search className="w-4 h-4 text-slate-400" />
                <PlusSquare className="w-4 h-4 text-slate-400" />
                <Heart className="w-4 h-4 text-slate-400" />
                <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/official-logo.jpg" alt="Profile" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
