'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { PublicMediaSettings } from '@/lib/types';
import { extractYouTubeId } from './FeaturedVideoSection';
import {
  X,
  Youtube,
  Instagram,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Link2,
} from 'lucide-react';

interface AdminMediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updated: PublicMediaSettings) => void;
}

export function AdminMediaSettingsModal({
  isOpen,
  onClose,
  onSave,
}: AdminMediaSettingsModalProps) {
  const [settings, setSettings] = useState<PublicMediaSettings>(
    db.getPublicMediaSettings()
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentExtractedId = extractYouTubeId(settings.youtubeUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updatePublicMediaSettings(settings);
    setSaveSuccess(true);
    if (onSave) onSave(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0C2F66] to-[#164A9B] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20">
              <Sliders className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Public Media & Showcase Settings</h3>
              <p className="text-xs text-blue-200">Main Admin &bull; Configure Featured YouTube Video and Instagram</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Public media settings updated successfully! Changes are live on the Home Page.</span>
            </div>
          )}

          {/* ===================== SECTION 1: FEATURED YOUTUBE VIDEO ===================== */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black text-slate-900">Featured YouTube Video</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.youtubeEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#164A9B]"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {settings.youtubeEnabled ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  YouTube Video URL or Video ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.youtubeUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, youtubeUrl: e.target.value })
                    }
                    placeholder="e.g. https://youtu.be/KjdFwGty0QY or https://youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                    required
                  />
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                {/* Real-time Extracted ID Preview */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {currentExtractedId ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Detected YouTube ID: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{currentExtractedId}</strong></span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Please enter a valid YouTube video link</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section Badge Text
                </label>
                <input
                  type="text"
                  value={settings.youtubeBadge}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeBadge: e.target.value })
                  }
                  placeholder="e.g. Watch Our Story"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={settings.youtubeTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeTitle: e.target.value })
                  }
                  placeholder="Enter video headline"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Video Description
                </label>
                <textarea
                  value={settings.youtubeDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeDescription: e.target.value })
                  }
                  rows={2}
                  placeholder="Enter documentary description"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>
            </div>
          </div>

          {/* ===================== SECTION 2: INSTAGRAM SHOWCASE ===================== */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-rose-600" />
                <h4 className="text-sm font-black text-slate-900">Instagram Profile Showcase</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.instagramEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#164A9B]"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {settings.instagramEnabled ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  placeholder="https://www.instagram.com/dalailul_khairath_/"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Username Handle
                </label>
                <input
                  type="text"
                  value={settings.instagramHandle}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramHandle: e.target.value })
                  }
                  placeholder="dalailul_khairath_"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Followers Count Label
                </label>
                <input
                  type="text"
                  value={settings.instagramFollowersCount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagramFollowersCount: e.target.value,
                    })
                  }
                  placeholder="e.g. 12.4K"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Posts Count Label
                </label>
                <input
                  type="text"
                  value={settings.instagramPostsCount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instagramPostsCount: e.target.value,
                    })
                  }
                  placeholder="e.g. 248"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
