import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSession, updatePaymentSession, confirmPaymentSession } from '@/lib/services/paymentSessionService';
import { checkGatewayTransactionStatus } from '@/lib/services/paymentGatewayService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    let session = await getPaymentSession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Payment session not found or expired' }, { status: 404 });
    }

    // If session is PENDING, automatically check payment status with authorized gateway/bank provider
    if (session.status === 'PENDING') {
      try {
        const gatewayResult = await checkGatewayTransactionStatus(session);
        if (gatewayResult.isPaid && gatewayResult.transactionId) {
          const confirmResult = await confirmPaymentSession(token, {
            utr: gatewayResult.transactionId,
            verifiedBy: 'GATEWAY_VERIFIED',
            notes: `Auto-verified via ${gatewayResult.provider || 'Gateway'}`,
          });
          if (confirmResult.success && confirmResult.session) {
            session = confirmResult.session;
          }
        }
      } catch (err: any) {
        console.warn('Gateway status check error during session poll:', err.message);
      }
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, amount, donorName, donorPhone, donorAddress, prayerRequest } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const updated = await updatePaymentSession(token, {
      ...(amount ? { amount: Number(amount) } : {}),
      ...(donorName !== undefined ? { donorName: String(donorName).toUpperCase() } : {}),
      ...(donorPhone !== undefined ? { donorPhone: String(donorPhone) } : {}),
      ...(donorAddress !== undefined ? { donorAddress: String(donorAddress) } : {}),
      ...(prayerRequest !== undefined ? { prayerRequest: String(prayerRequest) } : {}),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
