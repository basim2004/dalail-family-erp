import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSession, confirmPaymentSession } from '@/lib/services/paymentSessionService';
import { checkGatewayTransactionStatus } from '@/lib/services/paymentGatewayService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, utr, verifiedBy, notes } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const session = await getPaymentSession(token);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Payment session not found or expired' }, { status: 404 });
    }

    if (session.status === 'PAID') {
      return NextResponse.json({
        success: true,
        session,
        message: 'Payment is already confirmed.',
      });
    }

    // 1. If an authorized provider webhook or bank transaction ID is explicitly provided
    if (utr && (verifiedBy === 'BANK_WEBHOOK' || verifiedBy === 'ADMIN_RECONCILIATION')) {
      const result = await confirmPaymentSession(token, {
        utr,
        verifiedBy,
        notes,
      });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // 2. Query authorized payment provider / bank gateway for automated transaction status
    const gatewayResult = await checkGatewayTransactionStatus(session);
    if (gatewayResult.isPaid && gatewayResult.transactionId) {
      const result = await confirmPaymentSession(token, {
        utr: gatewayResult.transactionId,
        verifiedBy: 'GATEWAY_VERIFIED',
        notes: `Verified via ${gatewayResult.provider}`,
      });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json({
      success: false,
      status: 'PENDING',
      error: 'Payment confirmation is pending with the bank. Please complete the transaction in your UPI app.',
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
