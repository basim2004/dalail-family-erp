'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Receipt } from '@/lib/types';
import { numberToWords } from '@/lib/utils/numberToWords';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Download,
  Share2,
  ShieldCheck,
  Printer,
  FileText,
  Smartphone,
  Check,
} from 'lucide-react';

interface OfficialReceiptProps {
  receipt: Receipt;
  showActions?: boolean;
}

export const OfficialReceipt: React.FC<OfficialReceiptProps> = ({
  receipt,
  showActions = true,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'original' | 'digital'>('original');
  const [isExporting, setIsExporting] = useState(false);

  // Extract short number e.g. 3102 from DF-2026-03102
  const shortNoMatch = receipt.receiptNo?.match(/DF-\d+-0*(\d+)/);
  const shortNo = shortNoMatch ? shortNoMatch[1] : receipt.receiptNo;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 148);
      pdf.save(`Dalail_Receipt_${receipt.receiptNo}.pdf`);
    } catch (err) {
      console.error('Failed to export receipt:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dalail.org';
    const text = encodeURIComponent(
      `Dear ${receipt.donorName}, We have successfully received your contribution of ₹${receipt.amount} towards ${receipt.category}. Official Receipt No. ${receipt.receiptNo} (No. [${shortNo}]) has been generated. View your verified receipt here: ${origin}/verify/receipt/${receipt.receiptNo}. Thank you for your generous support.`
    );
    window.open(`https://wa.me/${receipt.donorPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = new Date(receipt.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      {/* Top Action Toolbar */}
      {showActions && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl shadow-subtle border border-slate-200 mb-4 print:hidden">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'original'
                  ? 'bg-white text-[#164A9B] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Original Receipt</span>
            </button>
            <button
              onClick={() => setViewMode('digital')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'digital'
                  ? 'bg-white text-[#164A9B] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Digital Card (S5)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container for Print / Export */}
      <div ref={receiptRef} className="w-full">
        {viewMode === 'original' ? (
          /* ===================== ORIGINAL DALAIL RECEIPT DESIGN ===================== */
          <div
            id="official-receipt-print"
            className="w-full bg-[#FFFDF9] rounded-2xl p-6 sm:p-8 border-4 border-[#164A9B] shadow-2xl relative overflow-hidden select-none text-slate-800"
            style={{ minHeight: '440px' }}
          >
            {/* Elegant Double Border Inner Frame */}
            <div className="absolute inset-1.5 border border-[#E99A24] pointer-events-none rounded-xl" />

            {/* Subtle Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
              <Image
                src="/assets/office-seal.png"
                alt="Watermark Seal"
                width={260}
                height={260}
                className="w-72 h-72 object-contain"
              />
            </div>

            {/* Top Official Header */}
            <div className="relative z-10 flex items-start justify-between border-b-2 border-[#164A9B] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md border border-slate-200 shrink-0 flex items-center justify-center">
                  <Image
                    src="/assets/official-logo.jpg"
                    alt="Dalail Official Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span dir="rtl" className="font-arabic text-sm font-bold text-[#164A9B] block">
                    مؤسسة دلائل الخيرات الإسلامية
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#0C2F66] tracking-tight leading-tight uppercase font-playfair">
                    DALAILUL KHAIRATH ISLAMIC FOUNDATION <span className="text-xs text-[#E99A24] font-sans font-bold">(REGD.)</span>
                  </h2>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    KAKKIDIPPURAM, P.O. ALANKODE - 679585, MALAPPURAM DT., KERALA
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Mobile: +91 9533215864 • +91 7034149149 • Web: dalail.org
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 uppercase tracking-wider">
                  ✓ Official Receipt
                </span>
              </div>
            </div>

            {/* Receipt Meta Row: No. & Date */}
            <div className="relative z-10 mt-4 flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Receipt No:
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-[#164A9B] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {receipt.receiptNo}
                </span>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  No. [{shortNo}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Main Receipt Body Fields */}
            <div className="relative z-10 mt-4 space-y-3.5 text-xs sm:text-sm">
              {/* Received from */}
              <div className="flex items-baseline gap-2 border-b border-dotted border-slate-300 pb-1.5">
                <span className="text-slate-500 font-semibold whitespace-nowrap">
                  Received with thanks from:
                </span>
                <span className="font-bold text-slate-900 uppercase font-mono flex-1 text-sm sm:text-base">
                  {receipt.donorName}
                </span>
              </div>

              {/* Address / Contact */}
              <div className="flex items-baseline gap-2 border-b border-dotted border-slate-300 pb-1.5">
                <span className="text-slate-500 font-semibold whitespace-nowrap">
                  Address / Phone:
                </span>
                <span className="font-medium text-slate-800 flex-1">
                  {receipt.donorAddress ? `${receipt.donorAddress} • ` : ''}{receipt.donorPhone}
                </span>
              </div>

              {/* Sum of Rupees in words */}
              <div className="flex items-baseline gap-2 border-b border-dotted border-slate-300 pb-1.5">
                <span className="text-slate-500 font-semibold whitespace-nowrap">
                  The sum of Rupees:
                </span>
                <span className="font-bold text-slate-900 italic capitalize flex-1 text-xs sm:text-sm">
                  Rupees {numberToWords(receipt.amount)} Only
                </span>
              </div>

              {/* Towards / Payment Mode Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 font-semibold whitespace-nowrap">
                    Towards / Purpose:
                  </span>
                  <span className="font-bold text-[#164A9B] uppercase">
                    {receipt.category} Contribution
                  </span>
                </div>

                <div className="flex items-baseline gap-2 sm:justify-end">
                  <span className="text-slate-500 font-semibold whitespace-nowrap">
                    Payment Mode:
                  </span>
                  <span className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {receipt.paymentMode} ({receipt.paymentStatus})
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Amount Box + Collector + Signature & Stamp */}
            <div className="relative z-10 mt-6 pt-4 border-t-2 border-slate-800 flex flex-wrap items-end justify-between gap-4">
              {/* Big Amount Box */}
              <div className="bg-[#164A9B] text-white px-5 py-2.5 rounded-xl shadow-md border-2 border-[#E99A24] flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F7D9A0] uppercase tracking-wider">
                  Amount:
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>

              {/* Collector Info */}
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Field Collector
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase block">
                  {receipt.studentName}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {receipt.campusName || 'Kakkidippuram Campus'}
                </span>
              </div>

              {/* Seal & Signature */}
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/office-seal.png"
                  alt="Official Seal"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain opacity-95"
                />

                <div className="text-center">
                  <Image
                    src="/assets/office-signature.png"
                    alt="Authorized Signature"
                    width={80}
                    height={36}
                    className="w-20 h-9 object-contain mx-auto"
                  />
                  <span className="text-[9px] font-bold uppercase text-slate-600 block border-t border-slate-300 pt-0.5">
                    Authorized Signatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===================== MOCKUP S5 DIGITAL VERIFIED RECEIPT CARD ===================== */
          <div className="w-full bg-[#EEF4FC] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 select-none">
            {/* Royal Blue Curved Banner */}
            <div className="relative bg-gradient-to-br from-[#0C2F66] via-[#164A9B] to-[#2876C8] text-white p-6 sm:p-7 pb-14 rounded-b-[36px] overflow-hidden">
              <div className="absolute inset-0 bg-islamic-pattern opacity-15 pointer-events-none" />

              {/* Status & Short Receipt Number */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wider uppercase border border-white/20">
                  <Check className="w-3.5 h-3.5" /> VERIFIED RECEIPT
                </span>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold font-mono tracking-wider border border-white/20">
                  No. [{shortNo}]
                </span>
              </div>

              {/* Logo & Institute Heading */}
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg shrink-0 flex items-center justify-center">
                  <Image
                    src="/assets/official-logo.jpg"
                    alt="Dalail Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold leading-tight">
                    Dalailul Khairath <br />
                    Islamic Foundation
                  </h2>
                </div>
              </div>

              <div className="relative z-10 mt-3 text-xs sm:text-sm text-blue-100 font-medium">
                Receipt • {receipt.category} Fund
              </div>
            </div>

            {/* Elevated Amount Card with Gold Accent (Mockup S5) */}
            <div className="-mt-10 mx-5 sm:mx-6 bg-white rounded-2xl shadow-xl border-t-4 border-[#E99A24] p-5 sm:p-6 z-20 relative">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                AMOUNT CONTRIBUTED
              </span>
              <div className="font-playfair text-3xl sm:text-4xl font-bold text-[#164A9B] mt-1">
                {formatCurrency(receipt.amount)}
              </div>
              <div className="text-[11px] text-slate-500 capitalize mt-1">
                Rupees {numberToWords(receipt.amount)} Only
              </div>
            </div>

            {/* Key-Value Details Grid */}
            <div className="p-6 sm:p-7 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 gap-3 divide-y divide-slate-200/60 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    DONOR NAME
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block uppercase">
                    {receipt.donorName}
                  </span>
                </div>

                {receipt.donorAddress && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      ADDRESS / LOCALITY
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {receipt.donorAddress}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    CONTACT NUMBER
                  </span>
                  <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                    {receipt.donorPhone}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    PAYMENT DATE & TIME
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {formattedDate} • {formattedTime}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    PAYMENT MODE
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {receipt.paymentMode} ({receipt.paymentStatus})
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    PURPOSE / CATEGORY
                  </span>
                  <span className="font-bold text-[#164A9B] mt-0.5 block">
                    {receipt.category} Contribution
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    FIELD COLLECTOR
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block uppercase">
                    {receipt.studentName} ({receipt.studentId})
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    CAMPUS & OFFICE
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {receipt.campusName || 'Kakkidippuram Campus'}
                  </span>
                </div>

                {receipt.calendarGiven && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E99A24] block">
                      TOKEN GIVEN
                    </span>
                    <span className="font-semibold text-amber-800 mt-0.5 block">
                      ✓ 1 Foundation 2026 Calendar Given
                    </span>
                  </div>
                )}
              </div>

              {/* Authentic Seals & Official Signatures */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/office-seal.png"
                    alt="Office Seal"
                    width={56}
                    height={56}
                    className="w-14 h-14 object-contain opacity-90"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      OFFICIAL SEAL
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      State Head Office
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <Image
                    src="/assets/office-signature.png"
                    alt="Authorized Signature"
                    width={80}
                    height={38}
                    className="w-20 h-9 object-contain ml-auto"
                  />
                  <span className="text-[9px] font-bold uppercase text-slate-500 block border-t border-slate-300 pt-0.5">
                    Authorized Signatory
                  </span>
                </div>
              </div>

              {/* Serial & Unique QR Info */}
              <div className="text-center pt-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Unique System Ref: {receipt.receiptNo}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
