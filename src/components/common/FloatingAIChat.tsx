'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Building2,
  FileCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  reportData?: any;
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Assalamu Alaikum! I am the Dalail Family ERP AI Assistant. How may I assist you today? You can ask about our institutions, verify a donation receipt, or check authorized ERP information.',
      timestamp: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate intelligent ERP response
    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = '';

      if (q.includes('founder') || q.includes('salam') || q.includes('usthad')) {
        reply =
          "The Founder & General Secretary of Dalailul Khairath Islamic Foundation (Regd.) is USTHAD ABDUL SALAM SA'ADI. Under his leadership, the Kakkidippuram campus shelters and educates hundreds of deserving scholars and orphans. Official contact: +91 70341 49149.";
      } else if (q.includes('receipt') || q.includes('verify') || q.includes('df-')) {
        const match = query.match(/DF-\d+-\d+/i);
        if (match) {
          const r = db.getReceiptById(match[0].toUpperCase());
          if (r) {
            reply = `Verified Official Receipt found! Receipt No: ${r.receiptNo}, Donor: ${r.donorName}, Amount: ₹${r.amount}, Category: ${r.category}, Campus: ${r.campusName}. Link: /verify/receipt/${r.receiptNo}`;
          } else {
            reply = `No receipt found for "${match[0]}". Please check the number or verify directly at /verify/receipt/${match[0]}.`;
          }
        } else {
          reply =
            "To verify an official donation receipt, you can enter the Receipt Number (e.g., DF-2026-03102) or scan the QR code printed on the physical receipt. Every receipt is cryptographically recorded in the Central ERP.";
        }
      } else if (q.includes('campus') || q.includes('kakkidippuram') || q.includes('location')) {
        reply =
          'Dalailul Khairath Islamic Foundation has its central main campus at Kakkidippuram, P.O. Alamkode 679585, Malappuram Dt., Kerala. It features Masjid Zainab, the Higher Shariah College, residential dormitories, and the central administrative offices.';
      } else if (q.includes('field work') || q.includes('student') || q.includes('collection')) {
        reply =
          'Students authorized for field work carry an official DKIF Receiver ID Card and certified letter of authority. Donors receive an instant numbered receipt via SMS/WhatsApp with live digital verification.';
      } else if (q.includes('leaderboard') || q.includes('rank')) {
        reply =
          'You can explore the live collection leaderboard on our dedicated Leaderboard page (/leaderboard), featuring Individual Students, 5-Member Groups, and Campus-wise rankings with daily, weekly, and monthly filters.';
      } else if (q.includes('help') || q.includes('contact') || q.includes('support')) {
        reply =
          'For support or queries, you can visit our Help Desk page (/helpdesk) to submit a ticket, contact the foundation helpline at +91 70341 49149, or email kakkidippuramdkif@gmail.com.';
      } else {
        reply =
          "Thank you for contacting Dalail Family ERP. I can answer institutional queries, verify donation receipts, explain field collection protocols, or guide you through our campuses. What would you like to know?";
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 450);
  };

  return (
    <>
      {/* Floating Action Beacon Button */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#164A9B] hover:bg-[#0C2F66] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/80"
          aria-label="Open Dalail AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="font-bold text-xs tracking-wide pr-1 hidden sm:inline">
            Dalail AI Assistant
          </span>
        </button>
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] md:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-fade-in no-print">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0C2F66] to-[#164A9B] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs leading-none">Dalail AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-blue-200 mt-0.5">
                  ERP Intelligence & Verification Portal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap">
            <span className="text-slate-400 font-semibold shrink-0">Ask:</span>
            {[
              'About Kakkidippuram Campus',
              'Founder of Dalailul Khairath',
              'Verify receipt DF-2026-03102',
              'Field work procedures',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#164A9B] hover:border-blue-300 font-medium transition-colors shrink-0 shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#164A9B] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#164A9B] text-white rounded-br-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about foundation, verify receipt, campuses..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#164A9B]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

