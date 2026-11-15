'use client';

import React, { useRef, useState } from 'react';
import { Member } from '@/lib/types';
import { Download, Printer, ShieldCheck, Edit2 } from 'lucide-react';

interface MemberIdCardProps {
  member: Member;
  showActions?: boolean;
  onEdit?: (member: Member) => void;
}

export const MemberIdCard: React.FC<MemberIdCardProps> = ({
  member,
  showActions = true,
  onEdit,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 136],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 136);
      pdf.save(`Dalail_ID_${member.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate ID card PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      {/* Top Action Bar */}
      {showActions && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl shadow-subtle border border-slate-200 mb-4 print:hidden">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Member ID Card</span>
          </span>
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(member)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-xs"
                title="Edit Photo and Address"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Card</span>
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-dalail-primary hover:bg-dalail-dark text-white transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '...' : 'PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* ID Card Front Frame (Exact Replica of Uploaded ID Card in assets) */}
      <div
        ref={cardRef}
        className="relative w-[340px] h-[540px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-300 select-none flex flex-col justify-between"
      >
        {/* Navy Header Arch */}
        <div className="relative bg-[#163B7E] text-white pt-5 pb-9 px-4 text-center rounded-b-[42px] shadow-md">
          {/* Accent light rings */}
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full border-t-4 border-r-4 border-white/20 pointer-events-none transform translate-x-8 -translate-y-8" />
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-t-2 border-l-2 border-white/10 pointer-events-none transform -translate-x-6 -translate-y-6" />

          {/* Official Circular Logo inside white container */}
          <div className="mx-auto w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm mb-2 border border-white/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/official-logo.jpg"
              alt="Official Logo"
              className="w-10 h-10 object-contain rounded-lg"
            />
          </div>

          <h3 dir="rtl" className="font-arabic text-sm text-white font-semibold leading-none">
            مؤسسة دلائل الخيرات الإسلامية
          </h3>
          <h2 className="text-xs font-black text-[#FACC15] tracking-tight mt-1 uppercase">
            DALAILUL KHAIRATH ISLAMIC FOUNDATION<span className="text-[9px]">(REGD)</span>
          </h2>
          <p className="text-[8px] text-slate-200 uppercase font-medium mt-1 leading-tight tracking-tight">
            KAKKIDIPPURAM, PO. ALANKODE 679585, MALAPPURAM - DT. KERALA MOBILE: 9633915864
          </p>
        </div>

        {/* Centered Member Photo - Authentic cropped portrait */}
        <div className="relative -mt-10 flex flex-col items-center z-10">
          <div className="w-28 h-36 bg-blue-100 rounded-2xl p-1 shadow-lg border-2 border-white overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.photoUrl || '/assets/member_photo_1.jpg'}
              alt={member.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Member Name */}
          <h1 className="text-xl font-black text-[#164A9B] tracking-tight uppercase mt-3 text-center px-2 leading-tight">
            {member.name}
          </h1>

          {/* Role Badge */}
          <div className="bg-[#EF4444] text-white px-5 py-0.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm mt-1">
            {member.roleTitle || 'RECEIVER'}
          </div>
        </div>

        {/* Member Address Details (Exact from Card) and Scanned Signature */}
        <div className="px-5 py-2 flex items-end justify-between">
          <div className="text-left space-y-0.5 max-w-[190px]">
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">
              {member.addressLine1}
            </p>
            {member.addressLine2 && (
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate">
                {member.addressLine2}
              </p>
            )}
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
              {member.postOffice}
            </p>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
              {member.place}
            </p>
            <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-tight">
              PIN {member.pincode}
            </p>
          </div>

          {/* Official Scanned Office Signature */}
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/office-signature.png"
              alt="Office Signature"
              className="w-24 h-12 object-contain"
            />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-800 mt-0.5">
              SIGNATURE
            </span>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="h-3 bg-[#EAF3FF] w-full border-t border-slate-200" />
      </div>
    </div>
  );
};
