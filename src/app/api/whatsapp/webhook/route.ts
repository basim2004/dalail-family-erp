import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/db/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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
 * Logs status: sent -> delivered -> read -> failed
 * And updates the receipt's live delivery status in Firestore
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (data.entry && data.entry[0]?.changes && data.entry[0].changes[0]?.value?.statuses) {
      const statuses = data.entry[0].changes[0].value.statuses;
      for (const s of statuses) {
        const messageId = s.id;
        const rawStatus = (s.status || '').toLowerCase(); // 'sent' | 'delivered' | 'read' | 'failed'
        const timestamp = s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : new Date().toISOString();

        try {
          const logRef = doc(firestore, 'whatsapp_logs', messageId);
          const logSnap = await getDoc(logRef);

          await updateDoc(logRef, {
            status: rawStatus,
            lastUpdated: timestamp,
            deliveryHistory: arrayUnion({
              status: rawStatus,
              timestamp,
            }),
          });

          // Sync back to receipt document if present
          if (logSnap.exists()) {
            const logData = logSnap.data();
            const receiptId = logData.receiptId;
            const isCampusAdmin = logData.recipientType === 'campus_admin';

            if (receiptId) {
              const rcptRef = doc(firestore, 'receipts', receiptId);
              const mappedStatus =
                rawStatus === 'delivered'
                  ? 'Delivered'
                  : rawStatus === 'read'
                  ? 'Read'
                  : rawStatus === 'sent'
                  ? 'Sent'
                  : rawStatus === 'failed'
                  ? 'Failed'
                  : undefined;

              if (mappedStatus) {
                if (isCampusAdmin) {
                  await updateDoc(rcptRef, {
                    adminWhatsappStatus: mappedStatus,
                    ...(mappedStatus === 'Delivered' || mappedStatus === 'Read'
                      ? { adminWhatsappDeliveredAt: timestamp }
                      : {}),
                  });
                } else {
                  await updateDoc(rcptRef, {
                    whatsappStatus: mappedStatus,
                    ...(mappedStatus === 'Delivered' || mappedStatus === 'Read'
                      ? { whatsappDeliveredAt: timestamp }
                      : {}),
                  });
                }
              }
            }
          }
        } catch (itemErr: any) {
          console.warn('Webhook logging notice for message', messageId, itemErr.message);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
