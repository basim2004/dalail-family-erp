'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db/dbService';
import { MemberIdCard } from '@/components/id-card/MemberIdCard';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyMemberIdPage() {
  const params = useParams();
  const memberId = params.id as string;
  const member = db.getMemberById(memberId);

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Receiver Identity Verification Portal
          </div>
        </div>

        {member ? (
          <div className="space-y-6 animate-fade-in flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl p-4 border border-emerald-200 shadow-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm">
                  Active Verified Foundation Member / Receiver
                </h2>
                <p className="text-xs text-slate-500">
                  Authorized collector for DALAILUL KHAIRATH ISLAMIC FOUNDATION.
                </p>
              </div>
            </div>

            <MemberIdCard member={member} showActions={true} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">Member ID Not Found</h2>
            <p className="text-xs text-slate-500">
              The identifier &quot;{memberId}&quot; could not be verified in the active registry.
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
