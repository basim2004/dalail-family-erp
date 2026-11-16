import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/services/paymentSessionService';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      collectorId,
      collectorName,
      campusId,
      campusName,
      dispatchId,
      donorName,
      donorPhone,
      donorAddress,
      prayerRequest,
      amount,
      category,
      calendarGiven,
    } = body;

    const session = await createPaymentSession({
      collectorId: collectorId || 'DKIF-REC-01',
      collectorName: collectorName || 'ATHNAN',
      campusId: campusId || 'campus_kak',
      campusName: campusName || 'Dalailul Khairath Kakkidippuram Campus',
      dispatchId: dispatchId || '',
      donorName: donorName || '',
      donorPhone: donorPhone || '',
      donorAddress: donorAddress || '',
      prayerRequest: prayerRequest || '',
      amount: Number(amount) || 1000,
      category: category || 'General/None',
      calendarGiven: !!calendarGiven,
    });

    const host = req.headers.get('host') || 'dalail-family-erp.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const paymentUrl = `${protocol}://${host}/donate/${session.token}`;

    // Generate high-resolution scannable QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 380,
      margin: 2,
      color: {
        dark: '#0A2540',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    return NextResponse.json({
      success: true,
      token: session.token,
      paymentUrl,
      qrDataUrl,
      session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
