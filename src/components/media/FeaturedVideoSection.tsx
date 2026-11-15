'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/dbService';
import { PublicMediaSettings } from '@/lib/types';
import {
  Play,
  Youtube,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Film,
  CheckCircle2,
} from 'lucide-react';

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

interface FeaturedVideoSectionProps {
  customSettings?: PublicMediaSettings;
}

export function FeaturedVideoSection({ customSettings }: FeaturedVideoSectionProps) {
  const [settings, setSettings] = useState<PublicMediaSettings>(
    customSettings || db.getPublicMediaSettings()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!customSettings) {
      setSettings(db.getPublicMediaSettings());
    }
  }, [customSettings]);

  if (!settings.youtubeEnabled) {
    return null;
  }

  const videoId = extractYouTubeId(settings.youtubeUrl) || 'KjdFwGty0QY';
  const privacyEmbedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = imgError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-subtle space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#164A9B] text-xs font-bold border border-blue-200">
            <Film className="w-3.5 h-3.5 text-[#164A9B]" />
            <span>{settings.youtubeBadge || 'Watch Our Story'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Documentary & Campus Heritage
          </h2>
        </div>
        <a
          href={youtubeWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164A9B] hover:text-[#0C2F66] transition-colors self-start sm:self-auto"
        >
          <Youtube className="w-4 h-4 text-red-600" />
          <span>Watch on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
      </div>

      {/* Main Video Frame & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left: Responsive 16:9 Video Player (Span 8 cols) */}
        <div className="lg:col-span-8">
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-card group">
            {isPlaying ? (
              <iframe
                src={privacyEmbedUrl}
                title={settings.youtubeTitle || 'Dalailul Khairath Official Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div
                className="relative w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={() => setIsPlaying(true)}
                title="Click to play documentary"
              >
                {/* Poster / Thumbnail Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt={settings.youtubeTitle}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />

                {/* Gradient Dim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40 group-hover:bg-slate-950/30 transition-colors" />

                {/* Animated Play Button */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 ring-8 ring-white/25">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-1" />
                  </div>
                  <span className="text-white text-xs sm:text-sm font-black tracking-wide uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20">
                    Play Video
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
                  <span className="truncate max-w-[80%] font-semibold drop-shadow-sm">
                    {settings.youtubeTitle}
                  </span>
                  <span className="text-[10px] bg-red-600/90 font-mono font-bold px-2 py-0.5 rounded-md">
                    HD
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Video Story & Institutional Context (Span 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#164A9B] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Featured Story
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {settings.youtubeTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {settings.youtubeDescription}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free residential Shariah & Hifz academy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Comprehensive orphan sponsorship wing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Masjid Zainab community sanctuary</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Watch on YouTube</span>
            </a>
            <Link
              href="/campuses"
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all text-center"
            >
              Campuses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
