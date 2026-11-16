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

export interface WhatsAppAdminNotificationParams {
  adminPhone: string;
  donorName: string;
  donorPhone?: string;
  amount: number;
  receiptNo: string;
  category?: string;
  collectorName?: string;
  collectorId?: string;
  campusName?: string;
  paymentMode?: string;
  receiptUrl: string;
}

export interface WhatsAppMessageResult {
  success: boolean;
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending_configuration';
  senderNumber: string;
  recipientPhone: string;
  timestamp: string;
  details?: string;
  apiPayload?: Record<string, any>;
  previewText?: string;
  bannerUrl?: string;
  receiptUrl?: string;
}

export const OFFICIAL_SENDER_NUMBER = '+91 97454 81583';
export const OFFICIAL_SENDER_CLEAN = '919745481583';
export const WHATSAPP_TEMPLATE_NAME = 'dalail_donation_receipt';

/**
 * Format phone number to E.164 without '+' or spaces for WhatsApp Cloud API.
 * Defaults Indian mobile numbers to 91XXXXXXXXXX.
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Checks WhatsApp Cloud API credentials status
 */
export function getWhatsAppConfigStatus() {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isConnected = !!(token && phoneNumberId && token !== 'your_meta_system_access_token');

  return {
    isConnected,
    senderNumber: OFFICIAL_SENDER_NUMBER,
    phoneNumberId: phoneNumberId || 'Not configured',
    hasToken: !!token && token !== 'your_meta_system_access_token',
    missing: [
      !phoneNumberId ? 'WHATSAPP_PHONE_NUMBER_ID' : null,
      !token || token === 'your_meta_system_access_token' ? 'WHATSAPP_CLOUD_API_TOKEN' : null,
    ].filter(Boolean) as string[],
  };
}

/**
 * Send Official Donation Receipt to Donor via Meta WhatsApp Cloud API
 */
export async function sendOfficialWhatsAppReceipt(
  params: WhatsAppSendReceiptParams
): Promise<WhatsAppMessageResult> {
  const recipient = formatWhatsAppPhone(params.donorPhone);
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const timestamp = new Date().toISOString();

  const baseHost =
    params.baseUrl ||
    (params.receiptUrl ? params.receiptUrl.split('/verify/')[0] : 'https://dalail-family-erp.vercel.app');
  const bannerUrl = `${baseHost}/assets/whatsapp_receipt_banner.jpg`;

  // Standard official notification text
  const previewText = 
`Dear ${params.donorName},

We have successfully received your contribution of ₹${params.amount.toLocaleString('en-IN')} towards Dalailul Khairath Islamic Foundation.

Your official receipt is available below for your reference.

Thank you for your valuable support.

📄 Receipt No: ${params.receiptNo}
🔗 View Official Receipt:
${params.receiptUrl}`;

  // Meta Cloud API template payload
  const templatePayload = {
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

  // Live Meta Cloud API Dispatch
  if (token && phoneNumberId && token !== 'your_meta_system_access_token') {
    try {
      // 1. Try sending the official approved template
      let response = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templatePayload),
        }
      );

      let data = await response.json();

      // 2. If template error (e.g. template not yet approved in Meta Business Suite), fallback to direct text message
      if (!response.ok && data.error?.code === 100) {
        const textPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: {
            preview_url: true,
            body: previewText,
          },
        };

        const textResponse = await fetch(
          `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(textPayload),
          }
        );

        if (textResponse.ok) {
          data = await textResponse.json();
          response = textResponse;
        }
      }

      if (response.ok && data.messages && data.messages.length > 0) {
        return {
          success: true,
          messageId: data.messages[0].id,
          status: 'sent',
          senderNumber: OFFICIAL_SENDER_NUMBER,
          recipientPhone: recipient,
          timestamp,
          apiPayload: templatePayload,
          previewText,
          bannerUrl,
          receiptUrl: params.receiptUrl,
        };
      } else {
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          senderNumber: OFFICIAL_SENDER_NUMBER,
          recipientPhone: recipient,
          timestamp,
          details: data.error?.message || 'Meta Cloud API returned an error',
          apiPayload: templatePayload,
          previewText,
          bannerUrl,
          receiptUrl: params.receiptUrl,
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
        apiPayload: templatePayload,
        previewText,
        bannerUrl,
        receiptUrl: params.receiptUrl,
      };
    }
  }

  // Pending Configuration: accurately report that Meta Cloud API credentials are required
  const pendingId = `pending_${Date.now()}_${recipient.slice(-4)}`;
  return {
    success: false,
    messageId: pendingId,
    status: 'pending_configuration',
    senderNumber: OFFICIAL_SENDER_NUMBER,
    recipientPhone: recipient,
    timestamp,
    details: 'Meta WhatsApp Cloud API credentials (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID) pending configuration in .env.local.',
    apiPayload: templatePayload,
    previewText,
    bannerUrl,
    receiptUrl: params.receiptUrl,
  };
}

/**
 * Send Collection Notification to Campus Admin / Foundation Office
 */
export async function sendCampusAdminCollectionNotification(
  params: WhatsAppAdminNotificationParams
): Promise<WhatsAppMessageResult> {
  const recipient = formatWhatsAppPhone(params.adminPhone);
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const timestamp = new Date().toISOString();

  const adminText = 
`🕌 *DALAILUL KHAIRATH ISLAMIC FOUNDATION*
*New Field Collection Recorded*

• Receipt No: ${params.receiptNo}
• Donor: ${params.donorName}${params.donorPhone ? ` (${params.donorPhone})` : ''}
• Amount: ₹${params.amount.toLocaleString('en-IN')}
• Payment Mode: ${params.paymentMode || 'Direct UPI'}
• Collector: ${params.collectorName || 'Student Volunteer'} ${params.collectorId ? `(${params.collectorId})` : ''}
• Campus: ${params.campusName || 'Head Office'}

📄 Official Receipt Link:
${params.receiptUrl}`;

  const textPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'text',
    text: {
      preview_url: true,
      body: adminText,
    },
  };

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
          body: JSON.stringify(textPayload),
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
          previewText: adminText,
          receiptUrl: params.receiptUrl,
        };
      } else {
        return {
          success: false,
          messageId: `err_adm_${Date.now()}`,
          status: 'failed',
          senderNumber: OFFICIAL_SENDER_NUMBER,
          recipientPhone: recipient,
          timestamp,
          details: data.error?.message || 'Meta Cloud API admin notification error',
          previewText: adminText,
          receiptUrl: params.receiptUrl,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        messageId: `err_adm_${Date.now()}`,
        status: 'failed',
        senderNumber: OFFICIAL_SENDER_NUMBER,
        recipientPhone: recipient,
        timestamp,
        details: err.message,
        previewText: adminText,
        receiptUrl: params.receiptUrl,
      };
    }
  }

  const pendingId = `pending_adm_${Date.now()}_${recipient.slice(-4)}`;
  return {
    success: false,
    messageId: pendingId,
    status: 'pending_configuration',
    senderNumber: OFFICIAL_SENDER_NUMBER,
    recipientPhone: recipient,
    timestamp,
    details: 'Meta WhatsApp Cloud API credentials pending configuration in .env.local for campus notification.',
    previewText: adminText,
    receiptUrl: params.receiptUrl,
  };
}
