'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db/dbService';
import { OfficialReceipt } from '@/components/receipt/OfficialReceipt';
import { Logo } from '@/components/common/Logo';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Building2,
  Phone,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function VerifyReceiptPage() {
  const params = useParams();
  const receiptId = params.id as string;
  const receipt = db.getReceiptById(receiptId);

  const formattedDate = receipt
    ? new Date(receipt.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '';

  const formattedTime = receipt
    ? new Date(receipt.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Foundation Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Donation Receipt Verification Portal
          </div>
        </div>

        {receipt ? (
          <div className="space-y-6 animate-fade-in">
            {/* Verification Status Banner */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-subtle flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-slate-900 text-sm">
                    Verified Authentic Receipt
                  </h2>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {receipt.receiptNo}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issued on {formattedDate} at {formattedTime} by {receipt.campusName}.
                </p>
              </div>
            </div>

            {/* Structured Verification Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-dalail-primary" /> Receipt Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block">Donor Name:</span>
                  <span className="font-bold text-slate-900 uppercase">{receipt.donorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Contact Number:</span>
                  <span className="font-mono font-medium text-slate-800">{receipt.donorPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Amount Contributed:</span>
                  <span className="font-black text-base text-dalail-primary font-mono">
                    {formatCurrency(receipt.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Donation Category:</span>
                  <span className="font-bold text-blue-700">{receipt.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{receipt.paymentMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Collector Name:</span>
                  <span className="font-bold text-slate-900">{receipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Campus:</span>
                  <span className="font-medium text-slate-800">{receipt.campusName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Token Given:</span>
                  <span className="font-medium text-amber-700">
                    {receipt.calendarGiven ? '1 Calendar Given' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Scanned Receipt Preview */}
            <OfficialReceipt receipt={receipt} showActions={true} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">Receipt Not Found</h2>
            <p className="text-xs text-slate-500">
              The receipt reference &quot;{receiptId}&quot; could not be found in our verified ledger.
            </p>
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} DALAILUL KHAIRATH ISLAMIC FOUNDATION (Regd.)
        </div>
      </div>
    </div>
  );
}

