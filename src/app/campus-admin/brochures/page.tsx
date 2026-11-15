'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { BrochureItem } from '@/lib/types';
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  X,
  ExternalLink,
  Search,
} from 'lucide-react';

export default function CampusAdminBrochuresPage() {
  const [brochures] = useState<BrochureItem[]>(db.getBrochures());
  const [viewingBrochure, setViewingBrochure] = useState<BrochureItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  const filtered = brochures.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.language.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === 'all' || b.language.toLowerCase().includes(selectedLang.toLowerCase());
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-dalail-primary" />
            Institution Brochures
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official multi-lingual brochures and publications of Dalailul Khairath Islamic Foundation.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedLang('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === 'all'
                ? 'bg-dalail-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All Languages
          </button>
          <button
            onClick={() => setSelectedLang('English')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === 'English'
                ? 'bg-dalail-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('Urdu')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === 'Urdu'
                ? 'bg-dalail-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Urdu
          </button>
          <button
            onClick={() => setSelectedLang('Kannada')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === 'Kannada'
                ? 'bg-dalail-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Kannada
          </button>
          <button
            onClick={() => setSelectedLang('Malayalam')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === 'Malayalam'
                ? 'bg-dalail-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Malayalam
          </button>
        </div>

        <div className="w-full sm:w-64 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search brochures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Brochure Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-[10px] text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                  {b.language}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold">
                  {b.fileSize}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {b.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                {b.fileName}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingBrochure(b)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>

                <a
                  href={b.fileUrl}
                  download={b.fileName}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dalail-primary hover:bg-dalail-dark text-white font-bold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF View Modal */}
      {viewingBrochure && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-dalail-primary rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {viewingBrochure.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {viewingBrochure.fileName} • {viewingBrochure.language} ({viewingBrochure.fileSize})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingBrochure.fileUrl}
                  download={viewingBrochure.fileName}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white font-bold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setViewingBrochure(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Native Browser PDF Viewer */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={`${viewingBrochure.fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={viewingBrochure.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

