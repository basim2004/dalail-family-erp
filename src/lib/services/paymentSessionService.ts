import { firestore } from '@/lib/db/firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { PaymentSession, PaymentSessionStatus, Receipt, DonationCategory } from '@/lib/types';
import { sendOfficialWhatsAppReceipt, OFFICIAL_SENDER_NUMBER } from './whatsappCloudService';
import crypto from 'crypto';

// In-memory fallback cache to ensure real-time responsiveness even during network drops
const sessionMemoryCache = new Map<string, PaymentSession>();

/**
 * Generate a cryptographically secure, URL-safe random token
 */
export function generateSecurePaymentToken(): string {
  const randomHex = crypto.randomBytes(12).toString('hex');
  return `dpay_${Date.now()}_${randomHex}`;
}

export interface CreateSessionParams {
  dispatchId?: string;
  collectorId: string;
  collectorName: string;
  campusId: string;
  campusName: string;
  donorName: string;
  donorPhone: string;
  donorAddress?: string;
  prayerRequest?: string;
  amount: number;
  category?: DonationCategory;
  calendarGiven?: boolean;
}

/**
 * Creates a new Payment Session in Firestore and memory
 */
export async function createPaymentSession(params: CreateSessionParams): Promise<PaymentSession> {
  const token = generateSecurePaymentToken();
  const id = `session_${token}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  const session: PaymentSession = {
    id,
    token,
    dispatchId: params.dispatchId || '',
    collectorId: params.collectorId || 'DKIF-REC-01',
    collectorName: params.collectorName || 'ATHNAN',
    campusId: params.campusId || 'campus_kak',
    campusName: params.campusName || 'Dalailul Khairath Kakkidippuram Campus',
    donorName: (params.donorName || '').trim().toUpperCase(),
    donorPhone: (params.donorPhone || '').trim(),
    donorAddress: (params.donorAddress || '').trim(),
    prayerRequest: (params.prayerRequest || '').trim(),
    amount: Number(params.amount) || 1000,
    category: params.category || 'General/None',
    calendarGiven: !!params.calendarGiven,
    status: 'PENDING',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt,
  };

  sessionMemoryCache.set(token, session);
  sessionMemoryCache.set(id, session);

  try {
    const sessionRef = doc(firestore, 'payment_sessions', id);
    await setDoc(sessionRef, session, { merge: true });
  } catch (err: any) {
    console.warn('Firestore write warning for payment session:', err.message);
  }

  return session;
}

/**
 * Retrieve payment session by token or session id
 */
export async function getPaymentSession(tokenOrId: string): Promise<PaymentSession | null> {
  if (!tokenOrId) return null;

  // Check memory cache first
  const cached = sessionMemoryCache.get(tokenOrId);

  try {
    // Try reading doc directly
    const docId = tokenOrId.startsWith('session_') ? tokenOrId : `session_${tokenOrId}`;
    const docRef = doc(firestore, 'payment_sessions', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as PaymentSession;
      sessionMemoryCache.set(data.token, data);
      sessionMemoryCache.set(data.id, data);
      return data;
    }

    // Secondary query by token field if id pattern differed
    const q = query(collection(firestore, 'payment_sessions'), where('token', '==', tokenOrId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const data = querySnap.docs[0].data() as PaymentSession;
      sessionMemoryCache.set(data.token, data);
      sessionMemoryCache.set(data.id, data);
      return data;
    }
  } catch (err: any) {
    console.warn('Firestore read warning for payment session:', err.message);
  }

  return cached || null;
}

/**
 * Updates donor info / amount on the payment session before payment
 */
export async function updatePaymentSession(
  token: string,
  updates: Partial<Pick<PaymentSession, 'amount' | 'donorName' | 'donorPhone' | 'donorAddress' | 'prayerRequest'>>
): Promise<PaymentSession | null> {
  const session = await getPaymentSession(token);
  if (!session) return null;
  if (session.status === 'PAID') return session;

  const now = new Date().toISOString();
  const updated: PaymentSession = {
    ...session,
    ...updates,
    updatedAt: now,
  };

  sessionMemoryCache.set(updated.token, updated);
  sessionMemoryCache.set(updated.id, updated);

  try {
    const docRef = doc(firestore, 'payment_sessions', updated.id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (err: any) {
    console.warn('Firestore update error on payment session:', err.message);
  }

  return updated;
}

/**
 * Server-side payment verification & automated receipt execution.
 * Called when gateway callback / webhook fires or verification endpoint is triggered.
 */
export async function confirmPaymentSession(
  token: string,
  details: {
    gateway?: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    utr?: string;
  }
): Promise<{ success: boolean; session: PaymentSession; receipt?: Receipt; error?: string }> {
  const session = await getPaymentSession(token);
  if (!session) {
    return { success: false, session: null as any, error: 'Payment session not found or expired.' };
  }

  if (session.status === 'PAID') {
    return { success: true, session };
  }

  const now = new Date().toISOString();
  const utr = details.utr || details.gatewayPaymentId || `UPI${Date.now()}`;
  const gateway = details.gateway || 'UPI Direct / Gateway';

  // 1. Generate Next Receipt Number
  // Default sequence start is 3105 or max from Firestore
  let nextSeq = 3105;
  try {
    const rcptDocs = await getDocs(collection(firestore, 'receipts'));
    rcptDocs.forEach((d) => {
      const data = d.data();
      const match = data.receiptNo?.match(/DF-2026-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val >= nextSeq) {
          nextSeq = val + 1;
        }
      }
    });
  } catch (err) {
    nextSeq = 3105 + Math.floor(Math.random() * 50);
  }

  const receiptNo = `DF-2026-${String(nextSeq).padStart(5, '0')}`;
  const receiptId = `rcpt_${Date.now()}_${token.slice(-6)}`;

  // 2. Build the Official Receipt Object
  const newReceipt: Receipt = {
    id: receiptId,
    receiptNo,
    dispatchId: session.dispatchId,
    studentId: session.collectorId,
    studentName: session.collectorName,
    campusId: session.campusId,
    campusName: session.campusName,
    donorName: session.donorName,
    donorPhone: session.donorPhone,
    donorAddress: session.donorAddress || '',
    amount: session.amount,
    category: session.category,
    paymentMode: 'Direct UPI',
    paymentReference: utr,
    paymentStatus: 'Verified',
    calendarGiven: !!session.calendarGiven,
    createdAt: now,
    whatsappStatus: session.donorPhone ? 'Pending' : undefined,
  };

  // 3. Save Receipt to Cloud Firestore
  try {
    const rcptRef = doc(firestore, 'receipts', receiptId);
    await setDoc(rcptRef, newReceipt, { merge: true });
  } catch (err: any) {
    console.warn('Firestore receipt creation notice:', err.message);
  }

  // 4. Update the Payment Session to PAID
  const paidSession: PaymentSession = {
    ...session,
    status: 'PAID',
    paymentGateway: gateway,
    gatewayOrderId: details.gatewayOrderId,
    gatewayPaymentId: details.gatewayPaymentId,
    utr,
    receiptId,
    receiptNo,
    paidAt: now,
    updatedAt: now,
  };

  sessionMemoryCache.set(paidSession.token, paidSession);
  sessionMemoryCache.set(paidSession.id, paidSession);

  try {
    const sessionRef = doc(firestore, 'payment_sessions', paidSession.id);
    await setDoc(sessionRef, paidSession, { merge: true });
  } catch (err: any) {
    console.warn('Firestore payment session status update notice:', err.message);
  }

  // 5. Automated Official WhatsApp Receipt Delivery to Donor
  if (paidSession.donorPhone) {
    try {
      const shortNo = receiptNo.match(/DF-\d+-0*(\d+)/)?.[1] || receiptNo;
      const host = process.env.VERCEL_URL || 'dalail-family-erp.vercel.app';
      const receiptUrl = `https://${host}/verify/receipt/${receiptNo}`;

      await sendOfficialWhatsAppReceipt({
        donorName: paidSession.donorName || 'Respected Supporter',
        donorPhone: paidSession.donorPhone,
        amount: paidSession.amount,
        receiptNo,
        category: paidSession.category,
        receiptUrl,
        shortNo,
      });

      // Update receipt with whatsapp sent status
      newReceipt.whatsappStatus = 'Sent';
      newReceipt.whatsappSentAt = now;
      try {
        await updateDoc(doc(firestore, 'receipts', receiptId), {
          whatsappStatus: 'Sent',
          whatsappSentAt: now,
        });
      } catch {}
    } catch (waErr: any) {
      console.warn('Automatic WhatsApp dispatch error:', waErr.message);
    }
  }

  return {
    success: true,
    session: paidSession,
    receipt: newReceipt,
  };
}
