import { NextRequest, NextResponse } from 'next/server';
import { sendOfficialWhatsAppReceipt, OFFICIAL_SENDER_NUMBER } from '@/lib/services/whatsappCloudService';
import { firestore } from '@/lib/db/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptNo, donorName, donorPhone, amount, category, shortNo } = body;

    if (!donorPhone) {
      return NextResponse.json(
        { success: false, error: 'Donor phone number is required.' },
        { status: 400 }
      );
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const receiptUrl = `${protocol}://${host}/verify/receipt/${receiptNo || shortNo || '3102'}`;

    // Dispatch WhatsApp via Official Cloud API Service
    const result = await sendOfficialWhatsAppReceipt({
      donorName: donorName || 'Respected Supporter',
      donorPhone,
      amount: Number(amount) || 0,
      receiptNo: receiptNo || `DF-2026-0${shortNo || '3102'}`,
      category: category || 'Islamic Education & Student Care',
      receiptUrl,
      shortNo,
    });

    // 9. Store WhatsApp message IDs and delivery statuses in Firebase Firestore
    try {
      await setDoc(
        doc(firestore, 'whatsapp_logs', result.messageId),
        {
          messageId: result.messageId,
          receiptNo: receiptNo || shortNo,
          donorName,
          donorPhone: result.recipientPhone,
          amount: Number(amount) || 0,
          senderNumber: OFFICIAL_SENDER_NUMBER,
          status: result.status,
          receiptUrl,
          timestamp: result.timestamp,
          deliveryHistory: [
            {
              status: result.status,
              timestamp: result.timestamp,
            },
          ],
        },
        { merge: true }
      );
    } catch (dbErr: any) {
      console.warn('Firestore logging notice (rules/offline):', dbErr.message);
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      status: result.status,
      senderNumber: OFFICIAL_SENDER_NUMBER,
      recipientPhone: result.recipientPhone,
      receiptUrl,
      previewText: result.previewText,
      bannerUrl: result.bannerUrl,
      directWhatsAppUrl: result.directWhatsAppUrl,
      details: result.details,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
