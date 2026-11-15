'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { useAuth } from '@/lib/services/authService';
import { BrochureItem } from '@/lib/types';
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  UploadCloud,
  X,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function BrochuresPage() {
  const { role } = useAuth();
  const [brochures, setBrochures] = useState<BrochureItem[]>(db.getBrochures());
  const [viewingBrochure, setViewingBrochure] = useState<BrochureItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload state
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Malayalam / English');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('DALAIL KAHIRATH BROCHURE English.pdf');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    db.addBrochure({
      title: title.trim(),
      language,
      fileName: selectedFile,
      fileUrl: `/documents/brochures/${selectedFile}`,
      fileSize: '7.2 MB',
      description: description.trim() || 'Institutional foundation brochure asset.',
    });

    setBrochures(db.getBrochures());
    setShowUploadModal(false);
    setTitle('');
  };

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

        {role === 'main_admin' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" /> Upload / Replace Brochure
          </button>
        )}
      </div>

      {/* Brochure Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {brochures.map((b) => (
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

      {/* In-Browser PDF Document Viewer Modal */}
      {viewingBrochure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Viewer Topbar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-dalail-light" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{viewingBrochure.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {viewingBrochure.fileName} ({viewingBrochure.fileSize})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={viewingBrochure.fileUrl}
                  download={viewingBrochure.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setViewingBrochure(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Native Full-Fidelity PDF Viewer Frame */}
            <div className="flex-1 w-full bg-slate-100">
              <iframe
                src={`${viewingBrochure.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={viewingBrochure.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload / Replace Modal for Main Admin */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Upload / Replace Brochure</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brochure Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundation Brochure Edition 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English / Kannada / Urdu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Brochure File</label>
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold"
                >
                  <option value="DALAIL KAHIRATH BROCHURE English.pdf">DALAIL KAHIRATH BROCHURE English.pdf</option>
                  <option value="DALAIL KAHIRATH BROCHURE kannada.pdf">DALAIL KAHIRATH BROCHURE kannada.pdf</option>
                  <option value="DALAIL KAHIRATH BROCHURE urdu.pdf">DALAIL KAHIRATH BROCHURE urdu.pdf</option>
                  <option value="brosher.pdf">brosher.pdf (Foundation Overview)</option>
                  <option value="brosher 1.pdf">brosher 1.pdf</option>
                  <option value="brosher 2.pdf">brosher 2.pdf</option>
                  <option value="brosher 3.pdf">brosher 3.pdf</option>
                  <option value="brosher 4.pdf">brosher 4.pdf</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of brochure contents"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-dalail-primary text-white font-bold hover:bg-dalail-dark shadow-sm"
                >
                  Save Brochure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

