import { NextRequest, NextResponse } from 'next/server';
import {
  logPaymentDiagnostic,
  getRecentPaymentDiagnostics,
  FOUNDATION_UPI_ID,
  FOUNDATION_PAYEE_NAME,
} from '@/lib/services/paymentDiagnosticService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      donationRef,
      token,
      paymentReference,
      requestedAmount,
      selectedUpiApp,
      intentUri,
      status,
      errorMessage,
      errorCode,
      deviceInfo,
    } = body;

    if (!donationRef || !requestedAmount) {
      return NextResponse.json(
        { success: false, error: 'donationRef and requestedAmount are required' },
        { status: 400 }
      );
    }

    const record = await logPaymentDiagnostic({
      donationRef,
      token,
      paymentReference,
      requestedAmount: Number(requestedAmount),
      selectedUpiApp: selectedUpiApp || 'Unknown UPI App',
      intentUri: intentUri || '',
      transactionInitiationTime: new Date().toISOString(),
      status: status || 'INITIATED',
      errorMessage,
      errorCode,
      deviceInfo: {
        ...deviceInfo,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      diagnosticId: record.id,
      record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const records = await getRecentPaymentDiagnostics(50);
    return NextResponse.json({
      success: true,
      payeeUpiId: FOUNDATION_UPI_ID,
      payeeName: FOUNDATION_PAYEE_NAME,
      hasSbiDirectApi: false, // Truthful reporting of SBI API connection
      sbiApiStatus: 'NO_DIRECT_BANK_API_INTEGRATED',
      sbiApiNotice:
        'State Bank of India (SBI) does not provide public REST webhooks for basic P2P/P2M VPAs without an approved SBI Merchant / Aggregator Agreement. Verification relies on UPI Intent initiation and bank reconciliation.',
      count: records.length,
      diagnostics: records,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
