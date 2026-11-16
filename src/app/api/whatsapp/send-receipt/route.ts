import { NextRequest, NextResponse } from 'next/server';
import {
  sendOfficialWhatsAppReceipt,
  sendCampusAdminCollectionNotification,
  OFFICIAL_SENDER_NUMBER,
} from '@/lib/services/whatsappCloudService';
import { firestore } from '@/lib/db/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      receiptId,
      receiptNo,
      shortNo,
      donorName,
      donorPhone,
      amount,
      category,
      collectorName,
      collectorId,
      campusName,
      campusId,
      paymentMode,
      isRetry,
    } = body;

    if (!donorPhone) {
      return NextResponse.json(
        { success: false, error: 'Donor phone number is required.' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cleanReceiptNo = receiptNo || `DF-2026-0${shortNo || '3102'}`;
    const receiptUrl = `${protocol}://${host}/verify/receipt/${cleanReceiptNo}`;

    // 1. Duplicate Prevention Check (Unless explicitly retrying)
    if (receiptId && !isRetry) {
      try {
        const rcptSnap = await getDoc(doc(firestore, 'receipts', receiptId));
        if (rcptSnap.exists()) {
          const data = rcptSnap.data();
          if (data.whatsappStatus === 'Sent' || data.whatsappStatus === 'Delivered' || data.whatsappStatus === 'Read') {
            return NextResponse.json({
              success: true,
              alreadySent: true,
              status: data.whatsappStatus,
              messageId: data.whatsappMessageId,
              message: 'Receipt already dispatched to donor WhatsApp',
            });
          }
        }
      } catch (err: any) {
        console.warn('Firestore duplicate check notice:', err.message);
      }
    }

    // 2. Dispatch WhatsApp Receipt to Donor
    const donorResult = await sendOfficialWhatsAppReceipt({
      donorName: donorName || 'Respected Supporter',
      donorPhone,
      amount: Number(amount) || 0,
      receiptNo: cleanReceiptNo,
      category: category || 'Islamic Education & Student Care',
      receiptUrl,
      shortNo,
      baseUrl: `${protocol}://${host}`,
    });

    // 3. Dispatch WhatsApp Notification to Campus Admin / Foundation Office
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '+919745481583';
    const adminResult = await sendCampusAdminCollectionNotification({
      adminPhone,
      donorName: donorName || 'Respected Supporter',
      donorPhone,
      amount: Number(amount) || 0,
      receiptNo: cleanReceiptNo,
      collectorName,
      collectorId,
      campusName,
      paymentMode: paymentMode || 'Direct UPI',
      receiptUrl,
    });

    // Map result status to receipt whatsappStatus
    const mappedDonorStatus =
      donorResult.status === 'sent'
        ? 'Sent'
        : donorResult.status === 'delivered'
        ? 'Delivered'
        : donorResult.status === 'pending_configuration'
        ? 'pending_configuration'
        : 'Failed';

    const mappedAdminStatus =
      adminResult.status === 'sent'
        ? 'Sent'
        : adminResult.status === 'delivered'
        ? 'Delivered'
        : adminResult.status === 'pending_configuration'
        ? 'pending_configuration'
        : 'Failed';

    // 4. Update the receipt document in Firestore
    if (receiptId) {
      try {
        await updateDoc(doc(firestore, 'receipts', receiptId), {
          whatsappStatus: mappedDonorStatus,
          whatsappMessageId: donorResult.messageId,
          whatsappSentAt: donorResult.timestamp,
          whatsappError: donorResult.details || null,
          adminWhatsappStatus: mappedAdminStatus,
          adminWhatsappMessageId: adminResult.messageId,
          adminWhatsappSentAt: adminResult.timestamp,
          adminWhatsappError: adminResult.details || null,
        });
      } catch (dbErr: any) {
        console.warn('Firestore receipt update notice:', dbErr.message);
      }
    }

    // 5. Store detailed logs in whatsapp_logs collection
    try {
      await setDoc(
        doc(firestore, 'whatsapp_logs', donorResult.messageId),
        {
          messageId: donorResult.messageId,
          receiptId: receiptId || null,
          receiptNo: cleanReceiptNo,
          recipientType: 'donor',
          donorName,
          donorPhone: donorResult.recipientPhone,
          amount: Number(amount) || 0,
          senderNumber: OFFICIAL_SENDER_NUMBER,
          status: donorResult.status,
          receiptUrl,
          timestamp: donorResult.timestamp,
          details: donorResult.details || null,
          deliveryHistory: [
            {
              status: donorResult.status,
              timestamp: donorResult.timestamp,
            },
          ],
        },
        { merge: true }
      );

      await setDoc(
        doc(firestore, 'whatsapp_logs', adminResult.messageId),
        {
          messageId: adminResult.messageId,
          receiptId: receiptId || null,
          receiptNo: cleanReceiptNo,
          recipientType: 'campus_admin',
          donorName,
          adminPhone: adminResult.recipientPhone,
          amount: Number(amount) || 0,
          senderNumber: OFFICIAL_SENDER_NUMBER,
          status: adminResult.status,
          receiptUrl,
          timestamp: adminResult.timestamp,
          details: adminResult.details || null,
        },
        { merge: true }
      );
    } catch (logErr: any) {
      console.warn('Firestore logging notice:', logErr.message);
    }

    return NextResponse.json({
      success: donorResult.success,
      donor: {
        status: mappedDonorStatus,
        messageId: donorResult.messageId,
        recipientPhone: donorResult.recipientPhone,
        details: donorResult.details,
      },
      campusAdmin: {
        status: mappedAdminStatus,
        messageId: adminResult.messageId,
        recipientPhone: adminResult.recipientPhone,
        details: adminResult.details,
      },
      senderNumber: OFFICIAL_SENDER_NUMBER,
      receiptUrl,
      previewText: donorResult.previewText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
