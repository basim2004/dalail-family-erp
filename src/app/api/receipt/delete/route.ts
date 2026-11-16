import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/db/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptId, receiptNo, voidOnly = false, performedBy = 'ADMIN', reason = 'User requested removal' } = body;

    if (!receiptId && !receiptNo) {
      return NextResponse.json({ success: false, error: 'Receipt ID or Receipt Number is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    let targetDocId = receiptId;

    // If receiptId not provided or not directly matching doc, find by receiptNo
    if (!targetDocId && receiptNo) {
      const q = query(collection(firestore, 'receipts'), where('receiptNo', '==', receiptNo));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetDocId = qSnap.docs[0].id;
      }
    }

    if (voidOnly) {
      // 1. Mark Void / Cancelled in Firestore to preserve financial audit trail
      if (targetDocId) {
        const docRef = doc(firestore, 'receipts', targetDocId);
        await updateDoc(docRef, {
          cancelled: true,
          cancelledAt: now,
          cancelledBy: performedBy,
          cancelReason: reason,
        });
      }

      // Also mark any duplicates with same receiptNo as cancelled
      if (receiptNo) {
        const qDup = query(collection(firestore, 'receipts'), where('receiptNo', '==', receiptNo));
        const dupSnap = await getDocs(qDup);
        dupSnap.forEach(async (d) => {
          if (d.id !== targetDocId) {
            await updateDoc(d.ref, {
              cancelled: true,
              cancelledAt: now,
              cancelledBy: performedBy,
              cancelReason: reason,
            });
          }
        });
      }

      // Write audit log
      await setDoc(doc(firestore, 'receipt_audit_logs', `void_${Date.now()}_${receiptNo || targetDocId}`), {
        action: 'VOID',
        receiptId: targetDocId,
        receiptNo: receiptNo || '',
        performedBy,
        reason,
        timestamp: now,
      });

      return NextResponse.json({ success: true, action: 'VOIDED', receiptId: targetDocId, receiptNo });
    } else {
      // 2. Permanent Delete (for test/duplicate records)
      if (targetDocId) {
        await deleteDoc(doc(firestore, 'receipts', targetDocId));
      }

      // Also clean up any orphan/duplicate docs with the exact same receiptNo
      if (receiptNo) {
        const qDup = query(collection(firestore, 'receipts'), where('receiptNo', '==', receiptNo));
        const dupSnap = await getDocs(qDup);
        for (const d of dupSnap.docs) {
          await deleteDoc(d.ref);
        }
      }

      // Record in audit log
      await setDoc(doc(firestore, 'receipt_audit_logs', `del_${Date.now()}_${receiptNo || targetDocId}`), {
        action: 'DELETE',
        receiptId: targetDocId,
        receiptNo: receiptNo || '',
        performedBy,
        reason,
        timestamp: now,
      });

      return NextResponse.json({ success: true, action: 'DELETED', receiptId: targetDocId, receiptNo });
    }
  } catch (error: any) {
    console.error('Receipt delete API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
