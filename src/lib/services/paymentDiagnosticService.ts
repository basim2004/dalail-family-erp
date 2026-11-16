/**
 * DALAIL FAMILY ERP - UPI Payment Diagnostic & Audit Service
 * 
 * Records, traces and analyzes all UPI payment attempts, bank responses,
 * and failure reasons for Foundation UPI ID: dalailul@sbi
 * 
 * STRICT COMPLIANCE:
 * Never logs or stores UPI PIN, OTP, passwords or sensitive banking credentials.
 */

import { firestore } from '@/lib/db/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface PaymentDiagnosticRecord {
  id: string;
  donationRef: string;
  token?: string;
  paymentReference?: string;
  requestedAmount: number;
  payeeUpiId: string;
  payeeName: string;
  selectedUpiApp: string;
  intentUri: string;
  transactionInitiationTime: string;
  status: 'INITIATED' | 'APP_OPENED' | 'FAILED' | 'VERIFIED' | 'ABORTED';
  errorMessage?: string;
  errorCode?: string;
  gatewayResponse?: Record<string, any>;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    isMobile?: boolean;
  };
  resolvedAt?: string;
}

export const FOUNDATION_UPI_ID = 'dalailul@sbi';
export const FOUNDATION_PAYEE_NAME = 'DALAILUL KHAIRATH ISLAMIC FOUNDATION';
export const FOUNDATION_BANK_ACCOUNT = '67051441563';
export const FOUNDATION_IFSC = 'SBIN0070643';
export const FOUNDATION_BRANCH = 'Changaramkulam';

/**
 * Log a payment diagnostic event into Cloud Firestore
 */
export async function logPaymentDiagnostic(
  record: Omit<PaymentDiagnosticRecord, 'id' | 'payeeUpiId' | 'payeeName'> & { id?: string }
): Promise<PaymentDiagnosticRecord> {
  const diagnosticId = record.id || `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullRecord: PaymentDiagnosticRecord = {
    id: diagnosticId,
    donationRef: record.donationRef,
    token: record.token,
    paymentReference: record.paymentReference,
    requestedAmount: record.requestedAmount,
    payeeUpiId: FOUNDATION_UPI_ID,
    payeeName: FOUNDATION_PAYEE_NAME,
    selectedUpiApp: record.selectedUpiApp,
    intentUri: record.intentUri,
    transactionInitiationTime: record.transactionInitiationTime || new Date().toISOString(),
    status: record.status,
    errorMessage: record.errorMessage,
    errorCode: record.errorCode,
    gatewayResponse: record.gatewayResponse,
    deviceInfo: record.deviceInfo,
    resolvedAt: record.resolvedAt,
  };

  try {
    const diagRef = doc(firestore, 'payment_diagnostics', diagnosticId);
    await setDoc(diagRef, fullRecord, { merge: true });
  } catch (err: any) {
    console.warn('Payment diagnostic logging notice (Firestore offline/rules):', err.message);
  }

  return fullRecord;
}

/**
 * Fetch recent diagnostic records for administrative audit
 */
export async function getRecentPaymentDiagnostics(maxCount = 50): Promise<PaymentDiagnosticRecord[]> {
  const records: PaymentDiagnosticRecord[] = [];
  try {
    const q = query(collection(firestore, 'payment_diagnostics'), limit(maxCount));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      records.push(d.data() as PaymentDiagnosticRecord);
    });
    // Sort descending by initiation time
    records.sort((a, b) => new Date(b.transactionInitiationTime).getTime() - new Date(a.transactionInitiationTime).getTime());
  } catch (err: any) {
    console.warn('Failed to fetch diagnostics:', err.message);
  }
  return records;
}
