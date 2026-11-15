import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/db/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'dalail_whatsapp_webhook_2026';

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * Meta Webhook Status Updates (POST)
 * Logs status: sent -> delivered -> read
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (data.entry && data.entry[0]?.changes && data.entry[0].changes[0]?.value?.statuses) {
      const statuses = data.entry[0].changes[0].value.statuses;
      for (const s of statuses) {
        const messageId = s.id;
        const newStatus = s.status; // 'sent' | 'delivered' | 'read'
        const timestamp = new Date(Number(s.timestamp) * 1000).toISOString();

        try {
          await updateDoc(doc(firestore, 'whatsapp_logs', messageId), {
            status: newStatus,
            lastUpdated: timestamp,
            deliveryHistory: arrayUnion({
              status: newStatus,
              timestamp,
            }),
          });
        } catch {
          // Ignore if logging offline
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
