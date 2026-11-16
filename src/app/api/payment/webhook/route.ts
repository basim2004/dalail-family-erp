import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentSession, getPaymentSession } from '@/lib/services/paymentSessionService';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }

    // Support standard webhook payloads (Razorpay / Cashfree / Generic)
    const token =
      body.token ||
      body.data?.order?.order_tags?.token ||
      body.payload?.payment?.entity?.notes?.token ||
      req.nextUrl.searchParams.get('token');

    const paymentId =
      body.data?.payment?.cf_payment_id ||
      body.payload?.payment?.entity?.id ||
      body.paymentId ||
      body.utr;

    const orderId =
      body.data?.order?.order_id ||
      body.payload?.payment?.entity?.order_id ||
      body.orderId;

    if (!token) {
      return NextResponse.json({ status: 'ignored', reason: 'No token attached to webhook payload' }, { status: 200 });
    }

    const session = await getPaymentSession(token);
    if (!session) {
      return NextResponse.json({ status: 'ignored', reason: 'Session not found' }, { status: 200 });
    }

    if (session.status === 'PAID') {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    const result = await confirmPaymentSession(token, {
      gateway: 'Webhook Verified Gateway',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      utr: paymentId,
    });

    return NextResponse.json({ status: 'success', receiptNo: result.receipt?.receiptNo }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
