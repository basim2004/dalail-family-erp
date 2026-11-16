import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentSession } from '@/lib/services/paymentSessionService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, utr, verifiedBy, notes } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    if (!utr) {
      return NextResponse.json(
        { success: false, error: 'UPI Transaction Reference (UTR) is required for verification.' },
        { status: 400 }
      );
    }

    const result = await confirmPaymentSession(token, {
      utr,
      verifiedBy: verifiedBy || 'DONOR_UTR',
      notes,
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
