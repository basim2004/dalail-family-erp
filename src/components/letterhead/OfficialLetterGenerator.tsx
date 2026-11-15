'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Check,
  Edit3,
  RefreshCw,
  Sparkles,
  Building2,
  Calendar,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LetterTemplate {
  id: string;
  name: string;
  subject: string;
  recipient: string;
  body: string;
}

const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'authority',
    name: 'Official Field Work Authority Letter',
    recipient: 'To Whom It May Concern,',
    subject: 'AUTHORIZATION LETTER FOR ANNUAL EDUCATIONAL & RELIEF FUND COLLECTION 2026',
    body: `Respected Brother / Sister in Islam,

Assalamu Alaikum Wa Rahmatullah,

We hereby certify and authorize our dedicated students and receivers of Dalailul Khairath Islamic Foundation (Regd.) to represent our institution for the annual educational, relief, and campus development fund collection.

Dalailul Khairath Islamic Foundation has been serving the community through comprehensive Islamic education, orphan sponsorship, welfare services, and moral upbringing of youth across our campus facilities.

The authorized student bearer of this letter carries an Official DKIF Receiver ID Card and an authentic institutional receipt book. All contributions made are accounted for with official printed receipts and digital verification.

We humbly request your generous support and benign cooperation to enable our continued religious and humanitarian missions. May Almighty Allah reward you and your family with boundless barakah.

Wassalam,`,
  },
  {
    id: 'appeal',
    name: 'Campus Development & Orphan Welfare Appeal',
    recipient: 'To Our Esteemed Well-Wishers & Philanthropists,',
    subject: 'SPECIAL APPEAL FOR CAMPUS EXPANSION & ORPHAN CARE SERVICES',
    body: `Respected Benefactors,

Assalamu Alaikum Wa Rahmatullah,

With praise and gratitude to Almighty Allah, Dalailul Khairath Islamic Foundation continues to provide quality Shariah education, safe residential orphan care, and community empowerment from our Kakkidippuram campus.

To accommodate the growing number of deserving orphan students and to expand our educational infrastructure, our governing council has embarked on expanding classroom facilities, library, and student living quarters.

We cordially invite your benevolent partnership in this noble cause. Your Zakat, Sadaqah, and generous contributions will directly touch the lives of hundreds of young scholars and destitute children.

Thanking you in anticipation of your valuable patronage and prayers.

Wassalam,`,
  },
  {
    id: 'custom',
    name: 'Custom Matter Letter (Blank Canvas)',
    recipient: 'To Whom It May Concern,',
    subject: 'OFFICIAL NOTIFICATION / INSTITUTIONAL CORRESPONDENCE',
    body: `Respected Sir / Madam,

Assalamu Alaikum Wa Rahmatullah,

[Type your custom letter matter here. You can freely edit this text, add specific instructions, recipient details, event announcements, or official recommendations for any purpose.]

Thanking you and assuring you of our utmost prayers and regard.

Wassalam,`,
  },
];

export function OfficialLetterGenerator() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('authority');
  const [refNo, setRefNo] = useState<string>('DKIF/GEN/2026/089');
  const [letterDate, setLetterDate] = useState<string>(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [recipient, setRecipient] = useState<string>(LETTER_TEMPLATES[0].recipient);
  const [subject, setSubject] = useState<string>(LETTER_TEMPLATES[0].subject);
  const [body, setBody] = useState<string>(LETTER_TEMPLATES[0].body);
  const [signatoryName, setSignatoryName] = useState<string>("USTHAD ABDUL SALAM SA'ADI");
  const [signatoryRole, setSignatoryRole] = useState<string>('Founder & General Secretary');
  const [includeSeal, setIncludeSeal] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleSelectTemplate = (tpl: LetterTemplate) => {
    setSelectedTemplateId(tpl.id);
    setRecipient(tpl.recipient);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!letterRef.current) return;
    setIsExporting(true);
    try {
      const element = letterRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dalail_Official_Letter_${refNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not generate PDF. Please try printing to PDF instead.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)*\n*Ref:* ${refNo}\n*Date:* ${letterDate}\n\n*${subject}*\n\n${recipient}\n\n${body}\n\n---\n*Authorized Signatory*\n${signatoryName}\n${signatoryRole}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Control Bar & Template Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-dalail-primary">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Campus Official Letterhead & Custom Matter Generator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official Dalailul Khairath letterhead format with custom editable matter, authentic office seal, and signature.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Letter</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Template Pills */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-2">Letter Templates:</span>
          {LETTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTemplateId === tpl.id
                  ? 'bg-blue-50 text-dalail-primary border border-blue-200 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (Hidden on print) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-4 no-print">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-dalail-primary" />
              <span>Letter Details & Custom Matter</span>
            </h3>
            <span className="text-[10px] text-slate-400">Live preview updates automatically</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="DKIF/GEN/2026/089"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-dalail-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Letter Date</label>
              <input
                type="text"
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                placeholder="14 November 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-dalail-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Addressed To (Recipient)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="To Whom It May Concern,"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-dalail-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="AUTHORIZATION / NOTIFICATION"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-dalail-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600">
                Letter Matter / Content (Body Text)
              </label>
              <span className="text-[10px] text-slate-400">Freely editable</span>
            </div>
            <textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your custom matter here..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed font-normal focus:ring-2 focus:ring-dalail-primary"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 block">Signatory & Authentic Stamps:</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSeal}
                  onChange={(e) => setIncludeSeal(e.target.checked)}
                  className="rounded text-dalail-primary focus:ring-dalail-primary"
                />
                <span>Include Official Seal Stamp</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSignature}
                  onChange={(e) => setIncludeSignature(e.target.checked)}
                  className="rounded text-dalail-primary focus:ring-dalail-primary"
                />
                <span>Include Office Signature</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Authentic Letterhead Preview (Printable A4 Canvas) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            ref={letterRef}
            id="official-letterhead-print-area"
            className="w-full max-w-[680px] bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-10 text-slate-900 font-serif leading-normal relative flex flex-col justify-between"
            style={{
              minHeight: '920px',
            }}
          >
            {/* Top Official Header Banner from asset */}
            <div>
              <div className="pb-3 border-b-2 border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/official_letterhead_banner.png"
                  alt="Dalailul Khairath Islamic Foundation Letterhead Header"
                  className="w-full object-contain mx-auto"
                />
              </div>

              {/* Reference and Date Bar */}
              <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-700 mt-4 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 mr-1.5">Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{refNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 mr-1.5">Date:</span>
                  <span className="font-medium text-slate-900">{letterDate}</span>
                </div>
              </div>

              {/* Recipient */}
              <div className="mt-6 text-xs font-sans font-bold text-slate-800 tracking-wide">
                {recipient}
              </div>

              {/* Subject */}
              <div className="mt-4 text-center">
                <span className="inline-block text-xs font-sans font-black text-slate-900 uppercase tracking-tight border-b-2 border-slate-900 pb-0.5">
                  Sub: {subject}
                </span>
              </div>

              {/* Letter Matter Body */}
              <div className="mt-6 text-[12px] sm:text-[13px] leading-relaxed text-slate-800 font-sans whitespace-pre-line space-y-3">
                {body}
              </div>
            </div>

            {/* Bottom Signature & Seal Area */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-end justify-between">
              {/* Left: Official Circular Seal Stamp */}
              <div className="w-36 h-36 flex flex-col items-center justify-center">
                {includeSeal ? (
                  <div className="relative w-32 h-32 opacity-95">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/office-seal.png"
                      alt="Office Seal Stamp"
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-300 uppercase">
                    Official Seal
                  </div>
                )}
              </div>

              {/* Right: Signature & Signatory Designation */}
              <div className="text-right flex flex-col items-end">
                {includeSignature && (
                  <div className="w-36 h-16 relative mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/office-signature.png"
                      alt="Authorized Signature"
                      className="w-full h-full object-contain object-right filter drop-shadow-xs"
                    />
                  </div>
                )}
                <div className="font-sans">
                  <span className="font-bold text-xs text-slate-900 block">
                    {signatoryName}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    {signatoryRole}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                    Dalailul Khairath Islamic Foundation (Regd.)
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Letterhead Micro-Footer */}
            <div className="mt-6 pt-2 border-t border-slate-100 text-[9px] text-center text-slate-400 font-sans">
              Head Office: Kakkidippuram, P.O. Alamkode 679585, Malappuram Dt., Kerala | Helpline: +91 7034149149 | www.dalail.org
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-letterhead-print-area,
          #official-letterhead-print-area * {
            visibility: visible;
          }
          #official-letterhead-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 18mm 18mm !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

