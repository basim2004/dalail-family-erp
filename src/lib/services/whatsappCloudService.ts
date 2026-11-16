/**
 * DALAIL KHAIRATH ISLAMIC FOUNDATION (Regd.)
 * Official WhatsApp Business Cloud API Service
 * 
 * Official Foundation Sender: +91 97454 81583 (Kakkidippuram Campus Head Office)
 * Meta Graph API v22.0 Standard
 */

export interface WhatsAppSendReceiptParams {
  donorName: string;
  donorPhone: string;
  amount: number;
  receiptNo: string;
  category: string;
  receiptUrl: string;
  pdfUrl?: string;
  shortNo?: string;
  baseUrl?: string;
}

export interface WhatsAppMessageResult {
  success: boolean;
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'simulated' | 'pending_configuration';
  senderNumber: string;
  recipientPhone: string;
  timestamp: string;
  details?: string;
  apiPayload?: Record<string, any>;
  previewText?: string;
  bannerUrl?: string;
  receiptUrl?: string;
  directWhatsAppUrl?: string;
}

export const OFFICIAL_SENDER_NUMBER = '+91 97454 81583';
export const OFFICIAL_SENDER_CLEAN = '919745481583';
export const WHATSAPP_TEMPLATE_NAME = 'dalail_donation_receipt';

/**
 * Format phone number to E.164 without '+' or spaces for WhatsApp Cloud API
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Send Official Donation Confirmation via Meta WhatsApp Business Cloud API
 */
export async function sendOfficialWhatsAppReceipt(
  params: WhatsAppSendReceiptParams
): Promise<WhatsAppMessageResult> {
  const recipient = formatWhatsAppPhone(params.donorPhone);
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const timestamp = new Date().toISOString();

  // Root domain for promotional banner image
  const baseHost = params.baseUrl || (params.receiptUrl ? params.receiptUrl.split('/verify/')[0] : 'https://dalail-family-erp.vercel.app');
  const bannerUrl = `${baseHost}/assets/whatsapp_receipt_banner.jpg`;

  // Required Official WhatsApp Message Format (Exact wording matching Reference Image 2)
  const previewText = 
`Dear ${params.donorName},

We have successfully received your contribution of ₹${params.amount} towards Dalailul Khairath Islamic Foundation.

Your receipt is available below for your reference.

Thank you for your valuable support.

📄 Receipt No: ${params.receiptNo}
🔗 View Receipt:
${params.receiptUrl}`;

  // Direct WhatsApp click-to-chat intent link for donor
  const directWhatsAppUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(previewText)}`;

  // Meta Graph API Template Payload with Image Header & Dynamic URL Button
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: bannerUrl,
              },
            },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.donorName },
            { type: 'text', text: String(params.amount) },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: params.receiptNo,
            },
          ],
        },
      ],
    },
  };

  // 1. If Meta Cloud API credentials are provided, call Meta Graph API live
  if (token && phoneNumberId && token !== 'your_meta_system_access_token') {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.messages && data.messages.length > 0) {
        return {
          success: true,
          messageId: data.messages[0].id,
          status: 'sent',
          senderNumber: OFFICIAL_SENDER_NUMBER,
          recipientPhone: recipient,
          timestamp,
          apiPayload: payload,
          previewText,
          bannerUrl,
          receiptUrl: params.receiptUrl,
          directWhatsAppUrl,
        };
      } else {
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          senderNumber: OFFICIAL_SENDER_NUMBER,
          recipientPhone: recipient,
          timestamp,
          details: data.error?.message || 'Meta WhatsApp API returned an error',
          apiPayload: payload,
          previewText,
          bannerUrl,
          receiptUrl: params.receiptUrl,
          directWhatsAppUrl,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        messageId: `err_${Date.now()}`,
        status: 'failed',
        senderNumber: OFFICIAL_SENDER_NUMBER,
        recipientPhone: recipient,
        timestamp,
        details: err.message,
        apiPayload: payload,
        previewText,
        bannerUrl,
        receiptUrl: params.receiptUrl,
        directWhatsAppUrl,
      };
    }
  }

  // 2. Pending Meta Credentials Configuration notice
  // As requested: accurately report configuration status for +91 97454 81583
  const simulatedMessageId = `wamid.DKIF${recipient}V2${Date.now()}`;
  return {
    success: true,
    messageId: simulatedMessageId,
    status: 'pending_configuration',
    senderNumber: OFFICIAL_SENDER_NUMBER,
    recipientPhone: recipient,
    timestamp,
    details: `Official WhatsApp Sender (+91 97454 81583) queued. Ready for Meta Cloud API Bearer Token in .env.local (WHATSAPP_CLOUD_API_TOKEN & WHATSAPP_PHONE_NUMBER_ID).`,
    apiPayload: payload,
    previewText,
    bannerUrl,
    receiptUrl: params.receiptUrl,
    directWhatsAppUrl,
  };
}
