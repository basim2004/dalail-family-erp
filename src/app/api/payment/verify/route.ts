import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentSession } from '@/lib/services/paymentSessionService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, gateway, gatewayOrderId, gatewayPaymentId, utr } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const result = await confirmPaymentSession(token, {
      gateway: gateway || 'Online Gateway',
      gatewayOrderId,
      gatewayPaymentId,
      utr: utr || gatewayPaymentId,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      session: result.session,
      receipt: result.receipt,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
