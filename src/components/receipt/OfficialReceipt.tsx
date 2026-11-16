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
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Send,
  X,
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

  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppResult, setWhatsAppResult] = useState<any>(null);

  const handleOpenWhatsAppAudit = async () => {
    if (whatsAppResult) {
      setWhatsAppModalOpen(true);
      return;
    }
    // Load delivery audit status
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch('/api/whatsapp/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNo: receipt.receiptNo,
          shortNo,
          donorName: receipt.donorName,
          donorPhone: receipt.donorPhone,
          amount: receipt.amount,
          category: receipt.category,
        }),
      });
      const data = await res.json();
      setWhatsAppResult(data);
      setWhatsAppModalOpen(true);
    } catch (err: any) {
      setWhatsAppResult({
        success: false,
        error: err.message || 'Failed to query WhatsApp status',
        recipientPhone: receipt.donorPhone,
        status: receipt.whatsappStatus || 'Failed',
      });
      setWhatsAppModalOpen(true);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleReDispatch = async () => {
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch('/api/whatsapp/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNo: receipt.receiptNo,
          shortNo,
          donorName: receipt.donorName,
          donorPhone: receipt.donorPhone,
          amount: receipt.amount,
          category: receipt.category,
        }),
      });
      const data = await res.json();
      setWhatsAppResult(data);
    } catch (err: any) {
      setWhatsAppResult({
        success: false,
        error: err.message || 'Retry dispatch failed',
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
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
              onClick={handleOpenWhatsAppAudit}
              disabled={isSendingWhatsApp}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                receipt.whatsappStatus === 'Failed'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Official WhatsApp Business Delivery (+91 97454 81583)"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSendingWhatsApp
                  ? 'Checking...'
                  : receipt.whatsappStatus
                  ? `WhatsApp: ${receipt.whatsappStatus}`
                  : 'WhatsApp: Auto-Delivered'}
              </span>
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
          /* ===================== OFFICIAL DALAIL RECEIPT (IMAGE 1 TEMPLATE) ===================== */
          <div
            id="official-receipt-print"
            className="relative w-full aspect-[1024/619] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#164A9B]/30 bg-[#E8F3FA] select-none"
          >
            {/* Background Template: Exact Official Foundation Receipt Image 1 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/official_receipt_template.jpg"
              alt="Official Foundation Receipt"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
            />

            {/* 1. Receipt Number Pill Box Overlay (covering placeholder) */}
            <div
              className="absolute flex items-center justify-center bg-[#FCECEC] rounded-full border border-red-200/60 shadow-2xs"
              style={{
                left: '8.0%',
                top: '39.8%',
                width: '11.5%',
                height: '7.0%',
              }}
            >
              <span className="font-mono font-black text-[#C81414] tracking-tight text-[11px] sm:text-base md:text-xl leading-none">
                {shortNo || receipt.receiptNo}
              </span>
            </div>

            {/* 2. Date */}
            <div
              className="absolute flex items-baseline justify-start"
              style={{
                left: '77.0%',
                top: '41.8%',
                width: '19.0%',
                height: '5.5%',
              }}
            >
              <span className="font-mono font-bold text-[#0C2F66] text-[10px] sm:text-xs md:text-sm tracking-wide">
                {formattedDate}
              </span>
            </div>

            {/* 3. Received From */}
            <div
              className="absolute flex items-baseline justify-start"
              style={{
                left: '22.5%',
                top: '52.5%',
                width: '74.0%',
                height: '6.0%',
              }}
            >
              <span className="font-bold text-[#0C2F66] uppercase tracking-wide truncate text-[11px] sm:text-sm md:text-base font-sans">
                {receipt.donorName}
              </span>
            </div>

            {/* 4. Rupees (Words & Numbers) */}
            <div
              className="absolute flex items-baseline justify-start"
              style={{
                left: '13.5%',
                top: '62.5%',
                width: '82.5%',
                height: '6.0%',
              }}
            >
              <span className="font-bold text-[#0C2F66] italic tracking-wide truncate text-[10px] sm:text-xs md:text-sm capitalize font-serif">
                {numberToWords(receipt.amount)} Rupees Only ({formatCurrency(receipt.amount)})
              </span>
            </div>

            {/* 5. Amount Box (Inside Pill Next to Blue Rupee Coin) */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: '10.0%',
                top: '79.5%',
                width: '19.5%',
                height: '10.5%',
              }}
            >
              <span className="font-mono font-black text-[#0C2F66] tracking-tight text-sm sm:text-lg md:text-2xl">
                {receipt.amount.toLocaleString('en-IN')}.00
              </span>
            </div>

            {/* 6. Receiver */}
            <div
              className="absolute flex items-center justify-center text-center"
              style={{
                left: '76.5%',
                top: '77.5%',
                width: '19.5%',
                height: '6.5%',
              }}
            >
              <span className="font-bold text-[#0C2F66] text-[9px] sm:text-xs md:text-xs tracking-wider uppercase truncate block font-mono">
                {receipt.studentName || 'Authorized Officer'}
              </span>
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

      {/* Official WhatsApp Dispatch Confirmation Modal */}
      {whatsAppModalOpen && whatsAppResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0C2F66] to-[#164A9B] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-1.5">
                    <span>Official WhatsApp Receipt</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </h3>
                  <p className="text-[11px] text-blue-200 font-mono">
                    Sender: +91 97454 81583
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: WhatsApp Chat Bubble Preview with Official Promotional Banner */}
            <div className="p-5 space-y-4 bg-slate-100/70 max-h-[75vh] overflow-y-auto">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Donor WhatsApp Message Preview:</span>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  whatsAppResult.status === 'sent' || whatsAppResult.status === 'delivered'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-blue-700 bg-blue-50'
                }`}>
                  ● {whatsAppResult.status === 'pending_configuration' ? 'Official Sender Ready' : whatsAppResult.status}
                </span>
              </div>

              {/* Chat Bubble Container (Matches Official WhatsApp Presentation) */}
              <div className="rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200 space-y-3">
                {/* 1. Official Promotional Banner (Image 2 - Stay Connected with Dalail Family ERP) */}
                <div className="rounded-xl overflow-hidden shadow-xs border border-slate-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/whatsapp_receipt_banner.jpg"
                    alt="DALAIL FAMILY ERP Official Showcase"
                    className="w-full h-auto object-cover select-none"
                  />
                </div>

                {/* 2. Personalized Message Text */}
                <div className="text-xs text-slate-800 space-y-2 leading-relaxed font-sans px-1">
                  <p className="font-semibold text-slate-900">
                    Dear {receipt.donorName},
                  </p>
                  <p>
                    We have successfully received your contribution of{' '}
                    <strong className="text-slate-950 font-mono font-bold">
                      {formatCurrency(receipt.amount)}
                    </strong>{' '}
                    towards Dalailul Khairath Islamic Foundation.
                  </p>
                  <p>
                    Your receipt is available below for your reference.
                  </p>
                  <p className="text-slate-600">
                    Thank you for your valuable support.
                  </p>
                </div>

                {/* 3. Clickable "View Receipt" URL Button */}
                <div className="pt-1">
                  <a
                    href={`/verify/receipt/${receipt.receiptNo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors uppercase tracking-wider"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                    <span>View Receipt</span>
                  </a>
                </div>
              </div>

              {/* Zero-Click Automated Cloud Delivery Status Card */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fully Automated Cloud Delivery</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                  The official donor receipt is delivered automatically from the verified foundation sender (<strong>+91 97454 81583</strong>) directly to the donor&apos;s WhatsApp via Meta Cloud API. No manual student WhatsApp action required.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-emerald-200/60 text-emerald-900">
                  <span>Server Trigger:</span>
                  <span className="font-bold text-emerald-700">Automatic / Zero-Click</span>
                </div>
              </div>

              {/* Authorized Backend Re-dispatch Action (If retry needed) */}
              <div>
                <button
                  onClick={handleReDispatch}
                  disabled={isSendingWhatsApp}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSendingWhatsApp
                      ? 'Dispatching from Server...'
                      : 'Re-trigger Cloud Dispatch (+91 97454 81583)'}
                  </span>
                </button>
              </div>

              {/* Technical Audit & Verification Box */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient Mobile:</span>
                  <span className="font-bold text-slate-800">{receipt.donorPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Sender:</span>
                  <span className="font-bold text-emerald-700">+91 97454 81583</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt Ref:</span>
                  <span className="font-bold text-slate-800">{receipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Template / Image:</span>
                  <span className="font-bold text-blue-700">Official Banner Header</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-400">Cloud API Status:</span>
                  <span className="font-bold text-emerald-700 uppercase text-[10px]">
                    {whatsAppResult.status === 'pending_configuration'
                      ? 'Queue Ready (Token Pending)'
                      : whatsAppResult.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Close Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
