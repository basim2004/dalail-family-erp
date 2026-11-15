'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PublicNavbar,
} from '@/components/common/PublicNavbar';
import {
  PublicFooter,
} from '@/components/common/PublicFooter';
import {
  FloatingAIChat,
} from '@/components/common/FloatingAIChat';
import {
  Headphones,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

type TabType = 'raise' | 'contact' | 'guide' | 'status';

export default function HelpDeskPage() {
  const [activeTab, setActiveTab] = useState<TabType>('raise');

  // Form State for Raise Request
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Receipt Verification',
    priority: 'Normal',
    subject: '',
    message: '',
  });
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    createdAt: string;
    subject: string;
    category: string;
  } | null>(null);

  // Status Lookup State
  const [lookupTicketId, setLookupTicketId] = useState('');
  const [statusResult, setStatusResult] = useState<{
    id: string;
    status: 'In Review' | 'In Progress' | 'Resolved';
    subject: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    assignedTo: string;
    resolutionNote?: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.subject || !formData.message) {
      alert('Please fill all required fields');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: `TKT-2026-${randomNum}`,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      subject: formData.subject,
      category: formData.category,
    };

    setSubmittedTicket(newTicket);
    // Also save into recent lookup simulation
    setStatusResult({
      id: newTicket.id,
      status: 'In Review',
      subject: newTicket.subject,
      category: newTicket.category,
      createdAt: newTicket.createdAt,
      updatedAt: 'Just now',
      assignedTo: 'Central Helpdesk Desk Officer',
      resolutionNote: 'Your request has been logged. An official representative will contact you within 24 hours.',
    });
  };

  const handleLookupStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const trimmed = lookupTicketId.trim().toUpperCase();
    if (!trimmed) {
      setLookupError('Please enter a ticket number (e.g. TKT-2026-1024)');
      return;
    }

    if (submittedTicket && submittedTicket.id === trimmed) {
      setStatusResult({
        id: submittedTicket.id,
        status: 'In Review',
        subject: submittedTicket.subject,
        category: submittedTicket.category,
        createdAt: submittedTicket.createdAt,
        updatedAt: '5 minutes ago',
        assignedTo: 'Central Helpdesk Officer',
        resolutionNote: 'Ticket received and queued for immediate administrative response.',
      });
      return;
    }

    // Default mock ticket lookup
    if (trimmed.startsWith('TKT')) {
      setStatusResult({
        id: trimmed,
        status: 'Resolved',
        subject: 'Receipt verification confirmation',
        category: 'Receipt Verification',
        createdAt: '12 Nov 2026, 10:30 AM',
        updatedAt: '12 Nov 2026, 02:45 PM',
        assignedTo: "Usthad Abdul Salam Sa'adi Desk",
        resolutionNote: 'The receipt record was cross-verified with Kakkidippuram campus accounts. Digital verification seal confirmed.',
      });
    } else {
      setLookupError('Ticket not found. Please verify your ticket reference number.');
      setStatusResult(null);
    }
  };

  const faqs = [
    {
      q: 'How do I verify an official field collection receipt?',
      a: 'Every receipt issued by Dalailul Khairath Islamic Foundation has a unique serial number (e.g., DF-2026-03101) and a digital verification QR code. You can verify it instantly online by clicking "Verify Receipt" on the navbar or asking the AI Assistant on this page.',
    },
    {
      q: 'How can I confirm if a student receiver is officially authorized?',
      a: 'All authorized receivers carry an Official Photo ID Card with registration number (DKIF-REC-XX) and an Official Authority Letter with the seal and signature of Founder Usthad Abdul Salam Sa’adi. You can scan their card or verify their ID through this portal.',
    },
    {
      q: 'What programs are funded by Dalail Family donations?',
      a: '100% of contributions directly support student education, full residential boarding, Quran Tahfeez courses, destitutes and orphan welfare at Masjid Zainab Campus Complex, Kakkidippuram and affiliated institutions.',
    },
    {
      q: 'Can I pay donations via UPI or direct bank transfer?',
      a: 'Yes, field receivers can accept Direct UPI as well as Cash in Hand. Once received, the student enters the transaction into their app, issuing an official digital SMS/printable receipt instantly.',
    },
    {
      q: 'How can a campus or student report a lost receipt or discrepancy?',
      a: 'Use the "Raise a Request" tab on this Help Desk page, select "Receipt Discrepancy", and input your details. Our administrative office will review the campus ledger and rectify the record within 24 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-slate-800 antialiased">
      {/* Global Navigation */}
      <PublicNavbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
        {/* ===================== HERO BANNER ===================== */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0C2F66] via-[#164A9B] to-[#1E60B8] text-white p-6 sm:p-10 md:p-12 shadow-card border border-blue-900/30">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F7D9A0] text-xs font-bold tracking-wide uppercase">
              <Headphones className="w-3.5 h-3.5" />
              <span>Public Support & Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Dalail Family Help Desk
            </h1>
            <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
              We are here to support donors, students, campus administrators, and the public. Submit inquiries, check ticket status, or contact our central desk.
            </p>
          </div>

          {/* Quick Helpline Strip */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <Phone className="w-3.5 h-3.5 text-[#F7D9A0]" />
              <span>Official Helpline: +91 70341 49149</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Response Window: Within 24 Hours</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Central Desk: Kakkidippuram HQ</span>
            </div>
          </div>
        </section>

        {/* ===================== TAB SELECTOR ===================== */}
        <section className="bg-white rounded-2xl p-2 shadow-card border border-slate-200/80 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('raise')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'raise'
                ? 'bg-[#164A9B] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Raise a Request</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-[#164A9B] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-[#164A9B] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>User Guide & FAQs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'status'
                ? 'bg-[#164A9B] text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Request Status</span>
          </button>
        </section>

        {/* ===================== TAB 1: RAISE A REQUEST ===================== */}
        {activeTab === 'raise' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#164A9B]" />
                  <span>Submit a Support Request</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Fill in the details below. Our administrative desk will issue an instant Ticket ID and reach out to you.
                </p>
              </div>

              {submittedTicket && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-emerald-900">
                      Request Registered Successfully! Ticket Reference: <span className="font-black underline">{submittedTicket.id}</span>
                    </p>
                    <p className="text-emerald-700">
                      Logged at {submittedTicket.createdAt}. You can track its progress under the &ldquo;Request Status&rdquo; tab anytime.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Basim Aslam"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9847123456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Inquiry Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                    >
                      <option value="Receipt Verification">Receipt Verification / Discrepancy</option>
                      <option value="Student Credential Verification">Student Receiver Credential Check</option>
                      <option value="Admission Inquiry">Shariah & Tahfeez Admission</option>
                      <option value="Campus Administration">Campus Administration & Dispatches</option>
                      <option value="Donation Support">General Donation & Orphan Sponsorship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject / Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Briefly state your concern..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full details, receipt number or student name if applicable..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Help Desk</span>
                </button>
              </form>
            </div>

            {/* Right Information Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Instant Support Hotline
                </h3>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-[#164A9B] uppercase block">Official Support Line</span>
                  <div className="text-lg font-black text-slate-900">+91 70341 49149</div>
                  <p className="text-xs text-slate-600 font-medium">
                    Central Office & Official WhatsApp desk of Dalailul Khairath Islamic Foundation. Available for instant support.
                  </p>
                  <a
                    href="tel:+917034149149"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#164A9B] hover:underline pt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Ticket Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>24-Hour Administrative Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Digital Receipt Ledger Audit</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Box */}
              <div className="bg-emerald-700 text-white rounded-3xl p-6 shadow-card space-y-3">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Official WhatsApp Line</span>
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                  Prefer chatting? Send a direct message to our official WhatsApp number for swift verification and assistance.
                </p>
                <a
                  href="https://wa.me/917034149149?text=Assalamu%20Alaikum%2C%20I%20need%20assistance%20regarding%20Dalailul%20Khairath%20Islamic%20Foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Chat on WhatsApp (+91 70341 49149) →</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 2: CONTACT SUPPORT ===================== */}
        {activeTab === 'contact' && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#164A9B]">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Telephone Helplines</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Direct telephone contact for public queries, donation confirmations, and campus operations.
                </p>
                <div className="space-y-2 pt-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Official Helpline</span>
                    <a href="tel:+917034149149" className="text-sm font-bold text-[#164A9B] hover:underline">
                      +91 70341 49149
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Central Office Desk</span>
                    <a href="tel:+919633915864" className="text-sm font-bold text-slate-800 hover:underline">
                      +91 9633915864
                    </a>
                  </div>
                </div>
              </div>
              <a
                href="tel:+917034149149"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#164A9B] text-white text-xs font-bold text-center transition-colors"
              >
                Call Hotline
              </a>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Official Correspondence</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Send email inquiries regarding admissions, institutional collaboration, and financial reports.
                </p>
                <div className="space-y-2 pt-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Primary Email</span>
                    <a href="mailto:kakkidippuramdlf@gmail.com" className="text-sm font-bold text-[#164A9B] hover:underline">
                      kakkidippuramdlf@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Institutional Desk</span>
                    <a href="mailto:admin@dalail.org" className="text-sm font-bold text-slate-800 hover:underline">
                      admin@dalail.org
                    </a>
                  </div>
                </div>
              </div>
              <a
                href="mailto:kakkidippuramdlf@gmail.com"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#164A9B] text-white text-xs font-bold text-center transition-colors"
              >
                Send Email
              </a>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Central Headquarters</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Visit the administrative foundation campus in Malappuram district.
                </p>
                <div className="pt-2 text-xs text-slate-700 font-medium leading-relaxed">
                  <strong className="block text-slate-900">Dalailul Khairath Islamic Foundation (Regd.)</strong>
                  Masjid Zainab Campus, Kakkidippuram,<br />
                  P.O. Alamkode - 679585,<br />
                  Malappuram District, Kerala, India.
                </div>
              </div>
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 pt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Office Hours: 8:00 AM – 8:00 PM</span>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB 3: USER GUIDE & FAQS ===================== */}
        {activeTab === 'guide' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#164A9B]" />
                  <span>User Guide & Frequently Asked Questions</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Find quick guidance on donation verification, receiver credentials, and portal usage.
                </p>
              </div>

              <a
                href="/documents/helpdesk/Dalail_ERP_User_Manual_and_Helpdesk_Guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
              >
                <FileText className="w-4 h-4 text-[#F7D9A0]" />
                <span>Download PDF Guide</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">1.3 MB</span>
              </a>
            </div>

            {/* Official User Manual PDF Feature Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0C2F66] to-[#164A9B] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-[#F7D9A0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#E99A24] text-slate-950 text-[10px] font-black rounded-md uppercase">
                      Official Document
                    </span>
                    <span className="text-xs text-blue-200 font-semibold">Illustrated User Manual</span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1">
                    DALAIL FAMILY ERP – Comprehensive User Manual & Helpdesk Guide
                  </h3>
                  <p className="text-xs text-blue-100/80 mt-0.5">
                    Student Portal ഉപയോഗം, Campus Admin പ്രവർത്തനങ്ങൾ, രസീത് വിതരണം എന്നിവയുടെ പൂർണ്ണ സ്ക്രീൻഷോട്ടുകളോടെയുള്ള ഔദ്യോഗിക ഗൈഡ്.
                  </p>
                </div>
              </div>
              <a
                href="/documents/helpdesk/Dalail_ERP_User_Manual_and_Helpdesk_Guide.pdf"
                download="Dalail_ERP_User_Manual_and_Helpdesk_Guide.pdf"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E99A24] hover:bg-[#d4891b] text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-sm"
              >
                <span>Download Illustrated PDF</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#164A9B] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 text-xs text-slate-600 font-normal leading-relaxed bg-white border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===================== TAB 4: REQUEST STATUS ===================== */}
        {activeTab === 'status' && (
          <section className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#164A9B]" />
                <span>Track Request Status</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enter your Ticket ID below to see the latest update from the central administrative desk.
              </p>
            </div>

            <form onSubmit={handleLookupStatus} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Ticket ID (e.g. TKT-2026-1024)"
                  value={lookupTicketId}
                  onChange={(e) => setLookupTicketId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold uppercase focus:outline-hidden focus:ring-2 focus:ring-[#164A9B]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs sm:text-sm transition-colors shrink-0"
              >
                Track Status
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {statusResult && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Reference</span>
                    <span className="text-sm font-black text-slate-900">{statusResult.id}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      statusResult.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {statusResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Category</span>
                    <span className="font-semibold text-slate-800">{statusResult.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Assigned Officer</span>
                    <span className="font-semibold text-slate-800">{statusResult.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Submitted At</span>
                    <span className="font-semibold text-slate-800">{statusResult.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Last Update</span>
                    <span className="font-semibold text-slate-800">{statusResult.updatedAt}</span>
                  </div>
                </div>

                {statusResult.resolutionNote && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Officer Note:</span>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {statusResult.resolutionNote}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Floating AI Chat Assistant */}
      <FloatingAIChat />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

