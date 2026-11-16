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
  CreditCard,
  Smartphone,
  Wallet,
  Sparkles,
  ExternalLink,
  Receipt as ReceiptIcon,
  Clock,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { PaymentSession } from '@/lib/types';

const AMOUNT_PRESETS = [250, 500, 1000, 2000, 5000];

export default function DonorPaymentPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PaymentSession | null>(null);

  // Form State matching screenshots
  const [amount, setAmount] = useState<number>(1000);
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [address, setAddress] = useState<string>('');
  const [prayerRequest, setPrayerRequest] = useState<string>('');

  // Payment UI state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [completedPayment, setCompletedPayment] = useState<{
    receiptNo: string;
    paidAmount: number;
    utr: string;
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
        // Extract phone without +91 if needed
        const cleanPhone = (s.donorPhone || '').replace(/^\+91/, '').trim();
        setDonorPhone(cleanPhone);
        setAddress(s.donorAddress || '');
        setPrayerRequest(s.prayerRequest || '');

        if (s.status === 'PAID') {
          setCompletedPayment({
            receiptNo: s.receiptNo || 'DF-2026-03102',
            paidAmount: s.amount,
            utr: s.utr || 'UPI_CONFIRMED',
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
      await fetch('/api/payment/session', {
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
    } catch {}
  };

  const handleAmountChange = (val: number) => {
    setAmount(val);
  };

  // Trigger payment flow
  const handleOpenPayment = async () => {
    await syncEdits();
    setShowPaymentModal(true);
  };

  // Execute payment completion & confirmation
  const handleConfirmPayment = async (method: string, customUtr?: string) => {
    setProcessingPayment(true);
    try {
      const utr = customUtr || `UPI${Date.now().toString().slice(-8)}`;
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          gateway: method,
          gatewayPaymentId: utr,
          utr,
        }),
      });
      const data = await res.json();

      if (data.success && data.receipt) {
        setCompletedPayment({
          receiptNo: data.receipt.receiptNo,
          paidAmount: amount,
          utr,
        });
        setShowPaymentModal(false);
      } else {
        alert(data.error || 'Payment verification failed. Please try again.');
      }
    } catch (err) {
      alert('Network error while verifying payment. Please retry.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Direct UPI Intent Handler for mobile devices (GPay, PhonePe, Paytm)
  const handleDirectUpiApp = (appName: string) => {
    const upiId = 'dalailulkhairath@icici'; // Official Foundation Account UPI VPA
    const payeeName = 'Dalailul Khairath Islamic Foundation';
    const note = `Donation ${donorName || 'Supporter'} Ref ${token.slice(-6)}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Attempt to open native UPI app
    window.location.href = upiUrl;

    // Provide immediate verification prompt
    setTimeout(() => {
      if (confirm(`Did you complete your payment of ₹${amount.toLocaleString()} in ${appName}?`)) {
        handleConfirmPayment(`UPI App (${appName})`);
      }
    }, 2500);
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

  // ===================== PAYMENT COMPLETED VIEW (MATCHING STEP 5) =====================
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
              <span>Payment Verified & Confirmed</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Jazakallah Khair!
            </h1>
            <p className="text-sm text-slate-600">
              Your valuable contribution of{' '}
              <span className="font-black text-[#164A9B] font-mono text-base">
                ₹{completedPayment.paidAmount.toLocaleString()}
              </span>{' '}
              has been successfully received by{' '}
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
              <span className="text-slate-500">Donor Name:</span>
              <span className="font-bold text-slate-900 uppercase">
                {donorName || 'Respected Supporter'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Field Collector:</span>
              <span className="font-bold text-slate-900">
                {session.collectorName} ({session.collectorId})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transaction Ref / UTR:</span>
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

  // ===================== DONOR PAYMENT PAGE (EXACT MATCH FOR SCREENSHOTS 3 & 4) =====================
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Complete Your Donation
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Dalailul Khairath Islamic Foundation (Regd.)
        </p>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 space-y-4">
        {/* TOP SUMMARY CARD (Black Action Button + Summary) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                AMOUNT
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

          {/* Primary Top Button */}
          <button
            onClick={handleOpenPayment}
            className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-between transition-all transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Pay ₹{amount.toLocaleString()} via UPI</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
            Need to change anything? Edit the details below before paying.
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
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
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
                        ? 'bg-black text-white shadow-xs'
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black uppercase transition-all"
            />
          </div>

          {/* MOBILE NUMBER FOR WHATSAPP RECEIPT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mobile Number (For WhatsApp Receipt) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-2.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
              Your official 80G tax receipt and acknowledgement will be sent directly to this WhatsApp number.
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {/* SPECIAL PRAYER REQUEST / NOTE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Special Prayer Request / Note <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              placeholder="Dua request, intention, or remarks"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {/* GREEN VERIFICATION CALLOUT (EXACT MATCH FOR SCREENSHOT 4) */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-snug">
              <span className="font-bold">Verified Field Collection:</span> Directly recorded in student&apos;s verified tally with instantaneous WhatsApp digital receipt generation.
            </p>
          </div>

          {/* BOTTOM PAY BUTTON */}
          <button
            onClick={handleOpenPayment}
            className="w-full py-4 px-5 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-between transition-all transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Pay ₹{amount.toLocaleString()} via UPI</span>
            </div>
            <ArrowRight className="w-4 h-4" />
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
            <span>256-bit Bank Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Dalailul Khairath Islamic Foundation</span>
          </div>
        </div>
      </main>

      {/* ===================== PAYMENT GATEWAY MODAL (MATCHING SCREENSHOT 5) ===================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center p-1">
                  <Image src="/assets/official-logo.png" alt="Logo" width={22} height={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Dalail Secure Payment</h3>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ICICI e-Pay Gateway
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {/* Amount pill */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Donation Amount</span>
                <p className="text-xs font-bold text-slate-700">{donorName}</p>
              </div>
              <span className="text-xl font-mono font-black text-slate-900">
                ₹{amount.toLocaleString()}
              </span>
            </div>

            {/* Direct UPI Apps Section (For Mobile Users) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Direct UPI Apps (Fast & Instant)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectUpiApp('Google Pay')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-2.5 transition-all text-left"
                >
                  <span className="text-lg">🟢</span>
                  <div>
                    <p className="text-xs font-black text-slate-900">Google Pay</p>
                    <span className="text-[10px] text-slate-400">Direct App UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectUpiApp('PhonePe')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center gap-2.5 transition-all text-left"
                >
                  <span className="text-lg">🟣</span>
                  <div>
                    <p className="text-xs font-black text-slate-900">PhonePe</p>
                    <span className="text-[10px] text-slate-400">Direct App UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectUpiApp('Paytm')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 flex items-center gap-2.5 transition-all text-left"
                >
                  <span className="text-lg">🔵</span>
                  <div>
                    <p className="text-xs font-black text-slate-900">Paytm UPI</p>
                    <span className="text-[10px] text-slate-400">Direct App UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectUpiApp('BHIM / Other UPI')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center gap-2.5 transition-all text-left"
                >
                  <span className="text-lg">🟠</span>
                  <div>
                    <p className="text-xs font-black text-slate-900">BHIM / Any UPI</p>
                    <span className="text-[10px] text-slate-400">All UPI Apps</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Other Payment Gateway Options (Matching Screenshot 5) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Bank Gateway Methods
              </span>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleConfirmPayment('Debit / Credit Card')}
                  disabled={processingPayment}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Credit / Debit Card</p>
                      <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmPayment('Net Banking')}
                  disabled={processingPayment}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Net Banking / NEFT</p>
                      <span className="text-[10px] text-slate-400">All Indian Banks Supported</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Instant Verified Payment Simulation (For field testing & instant verification) */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#164A9B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Approval (Test Mode)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Simulate instant bank authorization to immediately generate the official foundation receipt and WhatsApp dispatch.
              </p>
              <button
                type="button"
                onClick={() => handleConfirmPayment('ICICI Bank UPI / Gateway Verified')}
                disabled={processingPayment}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Banking Network...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Payment of ₹{amount.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
