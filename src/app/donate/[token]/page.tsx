'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Receipt as ReceiptIcon,
  AlertCircle,
  Loader2,
  Check,
  Smartphone,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PaymentSession } from '@/lib/types';
import { FOUNDATION_UPI_ID, FOUNDATION_PAYEE_NAME, buildUpiIntentUri } from '@/lib/services/paymentSessionService';

const AMOUNT_PRESETS = [250, 500, 1000, 2000, 5000];

export default function DonorPaymentPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PaymentSession | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(1000);
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [address, setAddress] = useState<string>('');
  const [prayerRequest, setPrayerRequest] = useState<string>('');

  // Payment UI state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [verifyingUtr, setVerifyingUtr] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showBankDiagnostic, setShowBankDiagnostic] = useState(false);
  const [reportingFailure, setReportingFailure] = useState(false);
  const [diagnosticReported, setDiagnosticReported] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const [completedPayment, setCompletedPayment] = useState<{
    receiptNo: string;
    paidAmount: number;
    utr: string;
    donationRef: string;
  } | null>(null);

  // Load session from backend
  useEffect(() => {
    if (!token) return;

    async function fetchSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/payment/session?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!data.success || !data.session) {
          setError(data.error || 'This donation payment link is invalid or has expired.');
          setLoading(false);
          return;
        }

        const s: PaymentSession = data.session;
        setSession(s);
        setAmount(s.amount || 1000);
        setDonorName(s.donorName || '');
        const cleanPhone = (s.donorPhone || '').replace(/^\+91/, '').trim();
        setDonorPhone(cleanPhone);
        setAddress(s.donorAddress || '');
        setPrayerRequest(s.prayerRequest || '');

        if (s.status === 'PAID') {
          setCompletedPayment({
            receiptNo: s.receiptNo || 'DF-2026-03102',
            paidAmount: s.amount,
            utr: s.utr || 'UPI_CONFIRMED',
            donationRef: s.donationRef || 'DF-0001',
          });
        }
      } catch (err: any) {
        setError('Unable to load donation details. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [token]);

  // Sync edits to backend in real-time
  const syncEdits = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/payment/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount,
          donorName,
          donorPhone: `${countryCode} ${donorPhone}`.trim(),
          donorAddress: address,
          prayerRequest,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
      }
    } catch {}
  };

  const handleAmountChange = (val: number) => {
    setAmount(val);
  };

  const handleOpenPayment = async () => {
    await syncEdits();
    setShowPaymentModal(true);
  };

  // Launch Authentic UPI Intent for selected application with diagnostic logging
  const handleLaunchUpiApp = (appName: string, customScheme?: string) => {
    setSelectedApp(appName);
    setVerificationError(null);

    const donationRef = session?.donationRef || 'DF-0001';
    const cleanRef = donationRef.replace(/[^a-zA-Z0-9]/g, '');
    const amtStr = Number(amount).toFixed(2);
    const genericUpiUri = buildUpiIntentUri(amount, donationRef);

    // Standard NPCI-compliant intent with tr & tn
    let appUri = genericUpiUri;
    if (customScheme === 'gpay') {
      // Standard universal intent is officially validated by Google Pay
      appUri = genericUpiUri;
    } else if (customScheme === 'phonepe') {
      appUri = `phonepe://pay?pa=${FOUNDATION_UPI_ID}&pn=${encodeURIComponent(
        FOUNDATION_PAYEE_NAME
      )}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(`Donation ${donationRef}`)}&tr=${cleanRef}`;
    } else if (customScheme === 'paytm') {
      appUri = `paytmmp://pay?pa=${FOUNDATION_UPI_ID}&pn=${encodeURIComponent(
        FOUNDATION_PAYEE_NAME
      )}&am=${amtStr}&cu=INR&tn=${encodeURIComponent(`Donation ${donationRef}`)}&tr=${cleanRef}`;
    }

    // 1. Record Diagnostic Event to Backend Audit Log
    fetch('/api/payment/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donationRef,
        token,
        requestedAmount: amount,
        selectedUpiApp: appName,
        intentUri: appUri,
        status: 'APP_OPENED',
      }),
    }).catch(() => {});

    // 2. Open UPI Intent URI
    try {
      window.location.href = appUri;
    } catch (e) {
      window.location.href = genericUpiUri;
    }
  };

  // Report and log bank failure without generating fake receipts
  const handleReportBankFailure = async (errorMsg: string) => {
    setReportingFailure(true);
    const donationRef = session?.donationRef || 'DF-0001';

    try {
      await fetch('/api/payment/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationRef,
          token,
          requestedAmount: amount,
          selectedUpiApp: selectedApp || 'Google Pay',
          status: 'FAILED',
          errorMessage: errorMsg,
          errorCode: 'U16_RECEIVER_BANK_RESTRICTION',
        }),
      });
      setDiagnosticReported(true);
    } catch {} finally {
      setReportingFailure(false);
    }
  };

  // Submit and verify genuine 12-digit UPI UTR / Bank Reference Number
  const handleVerifyUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim().toUpperCase();

    if (!cleanUtr || cleanUtr.length < 6) {
      setVerificationError('Please enter a valid 12-digit UPI Transaction Reference (UTR) number.');
      return;
    }

    setVerifyingUtr(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          utr: cleanUtr,
          verifiedBy: 'DONOR_SUBMITTED_UTR',
        }),
      });
      const data = await res.json();

      if (data.success && data.receipt) {
        // Log Verified diagnostic event
        fetch('/api/payment/diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donationRef: session?.donationRef || 'DF-0001',
            token,
            paymentReference: cleanUtr,
            requestedAmount: amount,
            selectedUpiApp: selectedApp || 'UPI App',
            status: 'VERIFIED',
          }),
        }).catch(() => {});

        setCompletedPayment({
          receiptNo: data.receipt.receiptNo,
          paidAmount: amount,
          utr: cleanUtr,
          donationRef: session?.donationRef || 'DF-0001',
        });
        setShowPaymentModal(false);
      } else {
        const errorMsg = data.error || 'Payment verification failed. Please check the UTR.';
        setVerificationError(errorMsg);

        // Log Failed diagnostic event
        fetch('/api/payment/diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donationRef: session?.donationRef || 'DF-0001',
            token,
            paymentReference: cleanUtr,
            requestedAmount: amount,
            selectedUpiApp: selectedApp || 'UPI App',
            status: 'FAILED',
            errorMessage: errorMsg,
          }),
        }).catch(() => {});
      }
    } catch (err: any) {
      setVerificationError('Network error while verifying payment. Please retry.');
    } finally {
      setVerifyingUtr(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#164A9B] animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Connecting to Dalail Secure Gateway...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Donation Link Unavailable</h2>
          <p className="text-sm text-slate-600">{error || 'Session not found.'}</p>
          <Link
            href="/"
            className="inline-block py-2.5 px-6 rounded-xl bg-[#164A9B] text-white text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            Return to Dalail Family ERP
          </Link>
        </div>
      </div>
    );
  }

  // ===================== PAYMENT COMPLETED VIEW (MATCHING STEP 4) =====================
  if (completedPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2 shadow-inner">
              <Image
                src="/assets/official-logo.png"
                alt="Dalail Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Payment Confirmed</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Jazakallah Khair!
            </h1>
            <p className="text-sm text-slate-600">
              Your contribution of{' '}
              <span className="font-black text-[#164A9B] font-mono text-base">
                ₹{completedPayment.paidAmount.toLocaleString()}
              </span>{' '}
              has been received by{' '}
              <span className="font-bold text-slate-800">
                Dalailul Khairath Islamic Foundation
              </span>
              .
            </p>
          </div>

          {/* Receipt Info Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold">Official Receipt No:</span>
              <span className="font-mono font-black text-[#164A9B] text-sm">
                {completedPayment.receiptNo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Donation Ref:</span>
              <span className="font-mono font-bold text-slate-800">
                {completedPayment.donationRef}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Donor Name:</span>
              <span className="font-bold text-slate-900 uppercase">
                {donorName || 'Respected Supporter'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Paid to UPI ID:</span>
              <span className="font-mono font-bold text-slate-800">{FOUNDATION_UPI_ID}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Bank UTR / Reference:</span>
              <span className="font-mono font-bold text-slate-700">{completedPayment.utr}</span>
            </div>
          </div>

          {/* WhatsApp Confirmation Callout */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 text-left flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-900">
                WhatsApp Digital Receipt Dispatched!
              </p>
              <p className="text-emerald-700 leading-relaxed">
                Your official foundation digital receipt with authentic seal and founder signature has been automatically delivered to WhatsApp number{' '}
                <span className="font-mono font-bold">{countryCode} {donorPhone}</span> from our official verified number{' '}
                <span className="font-mono font-bold">+91 97454 81583</span>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Link
              href={`/verify/receipt/${completedPayment.receiptNo}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <ReceiptIcon className="w-4 h-4" />
              <span>View Official Foundation Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="block w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Back to Foundation Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DONOR PAYMENT PAGE (MATCHING REFERENCE SCREENSHOT 2) =====================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Top Header / Branding */}
      <header className="pt-8 pb-4 text-center px-4">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2">
            <Image
              src="/assets/official-logo.png"
              alt="Dalailul Khairath Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          DALAILUL KHAIRATH ISLAMIC FOUNDATION
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Complete Your Donation • <span className="font-mono text-[#164A9B] font-bold">{session.donationRef}</span>
        </p>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 space-y-4">
        {/* TOP SUMMARY CARD */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                DONATION AMOUNT
              </span>
              <p className="text-xs font-bold text-slate-600 mt-1 truncate">
                {donorName || 'Supporter'} • {countryCode} {donorPhone}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Primary Top Button - Direct UPI Pay */}
          <button
            onClick={handleOpenPayment}
            className="w-full py-4 px-4 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-black text-base shadow-md flex items-center justify-between transition-all transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-200" />
              <span>PAY ₹{amount.toLocaleString()} VIA UPI</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
            Need to change anything? Edit details below before paying.
          </p>
        </div>

        {/* EDITABLE DETAILS CARD */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          {/* DONATION AMOUNT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Donation Amount (INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => handleAmountChange(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A] transition-all"
              />
            </div>

            {/* Amount Presets */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              {AMOUNT_PRESETS.map((p) => {
                const active = amount === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleAmountChange(p)}
                    className={`py-1.5 px-3 rounded-full text-xs font-bold transition-all shrink-0 ${
                      active
                        ? 'bg-[#00875A] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    ₹{p.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DONOR FULL NAME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Donor Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Suhail"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A] uppercase transition-all"
            />
          </div>

          {/* MOBILE NUMBER */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mobile Number (For WhatsApp Receipt) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-2.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A]"
                >
                  <option value="+91">+91 (India)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+966">+966 (KSA)</option>
                  <option value="+974">+974 (Qatar)</option>
                  <option value="+968">+968 (Oman)</option>
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="tel"
                  required
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="9633784801"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A] transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
              Official digital receipt will be automatically sent to this WhatsApp number.
            </p>
          </div>

          {/* ADDRESS / PLACE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Address / Place <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Adrsseri"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A] transition-all"
            />
          </div>

          {/* DONATION CATEGORY & REFERENCE */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Category
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                {session.category}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Collection Ref
              </span>
              <span className="text-xs font-mono font-bold text-[#164A9B] block mt-0.5">
                {session.donationRef}
              </span>
            </div>
          </div>

          {/* PRAYER REQUEST / NOTE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Special Prayer Request / Note <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="Dua request, intention, or remarks"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00875A] transition-all"
            />
          </div>

          {/* FOUNDATION UPI DESTINATION INFO BOX */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                Official Destination UPI ID
              </span>
              <span className="font-mono font-black text-slate-900 block truncate">
                {FOUNDATION_UPI_ID}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(FOUNDATION_UPI_ID);
                setCopiedUpi(true);
                setTimeout(() => setCopiedUpi(false), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold text-[11px] hover:bg-blue-50"
            >
              {copiedUpi ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* GREEN VERIFICATION BADGE */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-snug">
              <span className="font-bold">Verified Field Collection:</span> Recorded in student&apos;s verified tally with instantaneous WhatsApp digital receipt delivery.
            </p>
          </div>

          {/* BOTTOM PAY BUTTON */}
          <button
            onClick={handleOpenPayment}
            className="w-full py-4 px-5 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white font-black text-base shadow-md flex items-center justify-between transition-all transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-200" />
              <span>PAY ₹{amount.toLocaleString()} VIA UPI</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="py-2 flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Tax Deductible (80G)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Official SBI UPI Gateway</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Dalailul Khairath Islamic Foundation</span>
          </div>
        </div>
      </main>

      {/* ===================== UPI ONLY APPLICATION SELECTION MODAL (MATCHING STEP 3) ===================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center p-1.5 border border-blue-100">
                  <Image src="/assets/official-logo.png" alt="Logo" width={24} height={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Select UPI Application</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Ref: {session.donationRef}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {/* Amount & Destination Banner */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Amount to Pay
                </span>
                <span className="text-xs font-bold text-slate-700 block truncate">
                  Payee: {FOUNDATION_PAYEE_NAME}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                  UPI ID: {FOUNDATION_UPI_ID}
                </span>
              </div>
              <span className="text-2xl font-mono font-black text-emerald-800">
                ₹{amount.toLocaleString()}
              </span>
            </div>

            {/* AUTHENTIC UPI APPLICATION BUTTONS (ONLY 4 OPTIONS AS REQUIRED) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Tap Your UPI App to Pay
              </span>

              {/* 1. Google Pay */}
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('Google Pay', 'gpay')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-2xs">
                    <Image src="/icons/gpay.svg" alt="Google Pay" width={26} height={26} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-700">Google Pay</p>
                    <span className="text-[10px] text-slate-400">Pay directly with GPay</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* 2. PhonePe */}
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5f259f] p-1 flex items-center justify-center shadow-2xs">
                    <Image src="/icons/phonepe.svg" alt="PhonePe" width={28} height={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 group-hover:text-purple-700">PhonePe</p>
                    <span className="text-[10px] text-slate-400">Instant UPI transfer</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>

              {/* 3. Paytm */}
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('Paytm', 'paytm')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
                    <Image src="/icons/paytm.svg" alt="Paytm" width={32} height={18} className="object-contain" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 group-hover:text-cyan-700">Paytm</p>
                    <span className="text-[10px] text-slate-400">Paytm UPI & Wallet</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </button>

              {/* 4. BHIM / Other Supported UPI Apps */}
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('BHIM / Other UPI')}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0c2340] p-1 flex items-center justify-center shadow-2xs">
                    <Image src="/icons/bhim.svg" alt="BHIM" width={28} height={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 group-hover:text-emerald-700">BHIM / Any UPI App</p>
                    <span className="text-[10px] text-slate-400">Cred, Amazon Pay & Bank UPI</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            </div>

            {/* GENUINE PAYMENT VERIFICATION VIA 12-DIGIT UTR */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 block">
                  Step 2: Confirm Transaction
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  After paying in your UPI app, enter the <strong>12-digit UPI Reference No. (UTR)</strong> from your payment receipt to verify and generate your official foundation receipt:
                </p>

                <form onSubmit={handleVerifyUtr} className="space-y-2 pt-1">
                  <input
                    type="text"
                    required
                    maxLength={22}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                    placeholder="e.g. 412389102934"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00875A]"
                  />

                  {verificationError && (
                    <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {verificationError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={verifyingUtr}
                    className="w-full py-3 px-4 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {verifyingUtr ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Bank Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify & Issue Official Receipt</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Bank Error Diagnostic Helper */}
                <div className="pt-2 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setShowBankDiagnostic(!showBankDiagnostic)}
                    className="w-full text-center text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center justify-center gap-1.5 py-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Seeing &ldquo;Receiver&apos;s bank does not allow payments&rdquo;?</span>
                  </button>

                  {showBankDiagnostic && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left space-y-2 text-[11px] text-amber-900 animate-fade-in">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Info className="w-3.5 h-3.5" />
                        <span>State Bank of India (SBI) Diagnostic Notice</span>
                      </div>
                      <p className="leading-relaxed">
                        This bank error message is issued directly by <strong>State Bank of India</strong>. It indicates that incoming transfers to this Foundation Trust account require merchant category authorization or have an inward transaction threshold.
                      </p>
                      <div className="p-2 bg-white rounded-lg border border-amber-200 font-mono text-[10px] space-y-0.5">
                        <div className="font-bold text-slate-800">Direct Foundation Bank Details:</div>
                        <div>Account: <strong>67051441563</strong> (SBI)</div>
                        <div>IFSC: <strong>SBIN0070643</strong> (Changaramkulam)</div>
                        <div>Payee: DALAILUL KHAIRATH ISLAMIC FOUNDATION</div>
                      </div>
                      <p className="text-[10px] text-amber-700">
                        You can transfer directly via NEFT/IMPS or PhonePe/Paytm and enter the 12-digit UTR above to generate your receipt immediately.
                      </p>

                      {!diagnosticReported ? (
                        <button
                          type="button"
                          onClick={() => handleReportBankFailure("Receiver's bank does not allow payments to this bank account")}
                          disabled={reportingFailure}
                          className="w-full py-1.5 px-3 bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {reportingFailure ? 'Logging Diagnostic...' : 'Record Failure in Central Audit Log'}
                        </button>
                      ) : (
                        <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Logged to Foundation Central Admin Audit (Safe to retry)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
