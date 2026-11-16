'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbService';
import { Receipt } from '@/lib/types';
import { OfficialReceipt } from '@/components/receipt/OfficialReceipt';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCw,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Send,
  Building2,
  User,
  ExternalLink,
  Info,
  Radio,
} from 'lucide-react';

export default function AdminWhatsAppDeliveryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'sent' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = () => {
    setReceipts(db.getReceipts());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryDispatch = async (receipt: Receipt) => {
    setIsRetrying(receipt.id);
    setActionNotice(null);

    try {
      const shortNo = receipt.receiptNo?.match(/DF-\d+-0*(\d+)/)?.[1] || receipt.receiptNo;
      const res = await fetch('/api/whatsapp/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: receipt.id,
          receiptNo: receipt.receiptNo,
          shortNo,
          donorName: receipt.donorName,
          donorPhone: receipt.donorPhone,
          amount: receipt.amount,
          category: receipt.category,
          collectorName: receipt.studentName,
          collectorId: receipt.studentId,
          campusName: receipt.campusName,
          paymentMode: receipt.paymentMode,
          isRetry: true,
        }),
      });

      const data = await res.json();
      if (data && data.donor) {
        db.updateReceiptWhatsAppStatus(
          receipt.id,
          data.donor.status,
          data.donor.messageId,
          data.donor.details,
          data.campusAdmin?.status,
          data.campusAdmin?.messageId,
          data.campusAdmin?.details
        );
        setActionNotice(`WhatsApp dispatch executed for ${receipt.receiptNo}: Donor (${data.donor.status}), Admin (${data.campusAdmin?.status || 'Sent'})`);
      } else {
        setActionNotice(`Notice: ${data.error || 'Server processed request'}`);
      }
      loadData();
    } catch (err: any) {
      setActionNotice(`Error triggering retry: ${err.message}`);
    } finally {
      setIsRetrying(null);
    }
  };

  // Metrics
  const totalReceipts = receipts.length;
  const donorDelivered = receipts.filter((r) => r.whatsappStatus === 'Delivered' || r.whatsappStatus === 'Read').length;
  const donorSent = receipts.filter((r) => r.whatsappStatus === 'Sent').length;
  const donorPendingConfig = receipts.filter((r) => r.whatsappStatus === 'pending_configuration' || !r.whatsappStatus || r.whatsappStatus === 'Pending').length;
  const deliveryFailed = receipts.filter((r) => r.whatsappStatus === 'Failed').length;
  const adminNotified = receipts.filter((r) => r.adminWhatsappStatus === 'Sent' || r.adminWhatsappStatus === 'Delivered').length;

  // Filtered List
  const filteredReceipts = receipts.filter((r) => {
    if (filterStatus === 'delivered' && r.whatsappStatus !== 'Delivered' && r.whatsappStatus !== 'Read') return false;
    if (filterStatus === 'sent' && r.whatsappStatus !== 'Sent') return false;
    if (filterStatus === 'pending' && r.whatsappStatus !== 'pending_configuration' && r.whatsappStatus !== 'Pending') return false;
    if (filterStatus === 'failed' && r.whatsappStatus !== 'Failed') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNo = r.receiptNo?.toLowerCase().includes(q);
      const matchDonor = r.donorName?.toLowerCase().includes(q);
      const matchPhone = r.donorPhone?.toLowerCase().includes(q);
      const matchCollector = r.studentName?.toLowerCase().includes(q);
      if (!matchNo && !matchDonor && !matchPhone && !matchCollector) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2.5 py-0.5 rounded-md">
              Automated Communications Hub
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse" /> Official Sender: +91 97454 81583
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            WhatsApp Receipts &amp; Real-Time Delivery Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live delivery tracking for official Foundation receipts delivered to donors and collection notifications dispatched to campus administrators.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Generated</span>
            <CheckCircle2 className="w-4 h-4 text-dalail-primary" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalReceipts}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Valid Official Receipts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Donor Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{donorDelivered}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">Confirmed WhatsApp Delivery</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Donor Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">{donorSent}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5 font-medium">Dispatched to Meta Cloud</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Config Required</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1 font-mono">{donorPendingConfig}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5 font-medium">Pending Meta API Token</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivery Failures</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{deliveryFailed}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5 font-medium">Actionable retry items</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Receipts' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'sent', label: 'Sent' },
            { id: 'pending', label: 'Pending Config' },
            { id: 'failed', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-dalail-primary text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt, donor, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-dalail-primary font-medium"
          />
        </div>
      </div>

      {/* Receipts Delivery Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Receipt Ref</th>
                <th className="py-3.5 px-4">Donor &amp; Contact</th>
                <th className="py-3.5 px-4">Amount &amp; Mode</th>
                <th className="py-3.5 px-4">Collector &amp; Campus</th>
                <th className="py-3.5 px-4 text-center">Receipt Gen</th>
                <th className="py-3.5 px-4 text-center">Donor WhatsApp</th>
                <th className="py-3.5 px-4 text-center">Campus Alert</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No collection receipts match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => {
                  const formattedDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Receipt Ref */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-dalail-primary block">
                          {r.receiptNo}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Donor */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block uppercase">
                          {r.donorName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                          {r.donorPhone || 'No Phone'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 block">
                          {formatCurrency(r.amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          {r.paymentMode} ({r.paymentStatus})
                        </span>
                      </td>

                      {/* Collector */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {r.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {r.campusName}
                        </span>
                      </td>

                      {/* Receipt Gen Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Generated
                        </span>
                      </td>

                      {/* Donor WhatsApp Status */}
                      <td className="py-3 px-4 text-center">
                        {r.whatsappStatus === 'Delivered' || r.whatsappStatus === 'Read' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Delivered
                          </span>
                        ) : r.whatsappStatus === 'Sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Send className="w-3 h-3 text-blue-600" />
                            Sent
                          </span>
                        ) : r.whatsappStatus === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Setup
                          </span>
                        )}
                      </td>

                      {/* Campus Admin WhatsApp Status */}
                      <td className="py-3 px-4 text-center">
                        {r.adminWhatsappStatus === 'Delivered' || r.adminWhatsappStatus === 'Read' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Delivered
                          </span>
                        ) : r.adminWhatsappStatus === 'Sent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Sent
                          </span>
                        ) : r.adminWhatsappStatus === 'Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-dalail-primary hover:bg-slate-50 transition-colors shadow-2xs"
                            title="View Official Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRetryDispatch(r)}
                            disabled={isRetrying === r.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-dalail-primary hover:text-white text-slate-700 transition-colors disabled:opacity-50"
                            title="Retry WhatsApp Dispatch without duplicating receipt"
                          >
                            <RotateCw className={`w-3 h-3 ${isRetrying === r.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Official Foundation Receipt Preview
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedReceipt.receiptNo} • {selectedReceipt.donorName}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <OfficialReceipt receipt={selectedReceipt} showActions={true} />
          </div>
        </div>
      )}
    </div>
  );
}
