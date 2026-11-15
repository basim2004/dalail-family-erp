'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { FieldWorkItem } from '@/lib/types';
import {
  FolderOpen,
  Folder,
  FileText,
  Download,
  Printer,
  Eye,
  X,
  Search,
} from 'lucide-react';
import { OfficialLetterGenerator } from '@/components/letterhead/OfficialLetterGenerator';

export default function CampusAdminFieldWorkPage() {
  const [activeMainTab, setActiveMainTab] = useState<'documents' | 'letterhead'>('documents');
  const [items] = useState<FieldWorkItem[]>(db.getFieldWorkItems());
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingItem, setViewingItem] = useState<FieldWorkItem | null>(null);

  const allFolders = Array.from(new Set(items.map((i) => i.folder)));

  const filteredItems = items.filter((item) => {
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handlePrint = (fileUrl: string) => {
    // Print directly with iframe so original layout and dimensions are strictly preserved
    const existingIframe = document.getElementById('pdf-print-iframe-ca');
    if (existingIframe) {
      existingIframe.remove();
    }
    const iframe = document.createElement('iframe');
    iframe.id = 'pdf-print-iframe-ca';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = fileUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.open(fileUrl, '_blank');
        }
      }, 500);
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-dalail-primary" />
            Field Work Materials & Letters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official authorization letters and credentials designated for campus field collection teams.
          </p>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveMainTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'documents'
              ? 'bg-dalail-primary text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Documents & Official Brochures ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('letterhead')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === 'letterhead'
              ? 'bg-dalail-primary text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Campus Letterhead & Custom Matter Generator</span>
        </button>
      </div>

      {activeMainTab === 'letterhead' ? (
        <OfficialLetterGenerator />
      ) : (
        /* Main Layout: Left Folder Directory & Right File List */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Folders Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Folders
            </span>
            <span className="text-xs font-bold text-slate-500">{items.length} files</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedFolder === 'all'
                  ? 'bg-dalail-light text-dalail-primary border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-dalail-primary" />
                <span>All Documents</span>
              </div>
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-full font-mono text-slate-500">
                {items.length}
              </span>
            </button>

            {allFolders.map((fName) => {
              const count = items.filter((i) => i.folder === fName).length;
              return (
                <button
                  key={fName}
                  onClick={() => setSelectedFolder(fName)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedFolder === fName
                      ? 'bg-dalail-light text-dalail-primary border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate">{fName}</span>
                  </div>
                  <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-full font-mono text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Files Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-subtle flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search materials by title, language, or file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Files List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-subtle">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No materials found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery ? 'Try searching with a different keyword.' : 'Folder is empty.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0 mt-0.5">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                          {item.language}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          {item.folder}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          {item.fileSize}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        File: {item.fileName} • Updated: {item.updatedAt}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: View, Download, Print */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      title="View PDF"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>

                    <a
                      href={item.fileUrl}
                      download={item.fileName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dalail-light hover:bg-blue-100 text-dalail-primary font-bold text-xs border border-blue-200 transition-colors"
                      title="Download authentic PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>

                    <button
                      onClick={() => handlePrint(item.fileUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white font-bold text-xs shadow-sm transition-colors"
                      title="Print PDF with original layout and dimensions"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* View PDF Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {viewingItem.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {viewingItem.fileName} • {viewingItem.language} ({viewingItem.fileSize})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(viewingItem.fileUrl)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <a
                  href={viewingItem.fileUrl}
                  download={viewingItem.fileName}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white font-bold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Native Browser PDF Viewer */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={`${viewingItem.fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={viewingItem.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

