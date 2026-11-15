# DALAIL FAMILY ERP

**Enterprise Resource Planning, Campus Management & Field Collection System**  
Built for **DALAILUL KHAIRATH ISLAMIC FOUNDATION (Regd.)**  
*Kakkidippuram Campus, P.O. Alamkode, Malappuram Dt., Kerala, India — Pin: 679585*  
*Contact: +91 7034149149 | Email: kakkidippuramdlf@gmail.com*

---

## 1. System Overview

DALAIL FAMILY ERP is a production-ready, multi-role web platform designed to streamline campus management, academic records, field collections, dynamic UPI payments, instant official receipt dispatch via WhatsApp, and auditable cash reconciliations across foundation campuses.

### Key Capabilities
- **Multi-Campus Isolation & Oversight:** Unlimited campus support with central administration and campus-level isolation (initial headquarters: *Kakkidippuram Campus*).
- **Mobile-First Student Collector Portal:** Intuitive dashboard for students and receivers with active route dispatches, quick collection recording, calendar tracking, expense claims, and cash settlement submission.
- **Physical-Accurate Digital Receipts:** High-fidelity landscape A4 official receipts strictly preserving the foundation's original blue border, Arabic calligraphy (`مؤسسة دلائل الخيرات الإسلامية`), official logo, circular seal stamp, sequential numbering (e.g. `DF-2026-03102`), and Rupees in words.
- **Dynamic UPI QR Code Payment:** Generates a unique, transaction-specific dynamic QR code for every donation with live countdown, webhook verification, and simulated sandbox mode.
- **Instant WhatsApp Dispatch:** Direct integration and template messaging to dispatch official receipts and public verification links to donors immediately upon payment.
- **Digital Student ID Cards:** Real-time generation of authentic portrait ID cards with verified QR code linking to the public validation portal.
- **Reconciliation & Settlement Engine:** Strict mathematical accounting:
  $$\text{Total Collected} = \text{Cash} + \text{UPI}$$
  $$\text{Final Amount} = \text{Total Collected} - \text{Approved Expenses}$$
  $$\text{Cash Due} = \text{Cash Collected} - \text{Cash Handed Over}$$
  *(UPI is settled directly via gateway bank settlement and never subtracted from physical cash due)*.

---

## 2. Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Data & Security:** Reactive Database Engine, Firestore Security Rules (`firestore.rules`), Compound Indexes (`firestore.indexes.json`), Firebase SDK adapter (`src/lib/db/firebase.ts`)
- **PDF & Canvas Export:** jsPDF, html2canvas, QRCode
- **Excel Export & Import:** xlsx (SheetJS)
- **Styling & Fonts:** Amiri (Arabic typography), Inter, customized brand palette (`#164A9B`, `#2876C8`, `#EAF3FF`, `#F5F8FC`)

---

## 3. Pre-Configured Demo Accounts

You can log in directly from the login page by clicking the **"Login As"** quick tabs or entering the credentials below:

| Role | Name | Identifier / Email | Assigned Campus |
|---|---|---|---|
| **Main Admin** | Sayyid Munavvar Ali Shihab | `admin@dalail.org` | All Campuses (Central HQ) |
| **Campus Admin / Founder** | USTHAD ABDUL SALAM SA'ADI | `kakkidippuramdlf@gmail.com` (+91 9645655555) | Kakkidippuram Campus |
| **Collection Manager** | Musthafa Saqafi | `collection@dalail.org` | Kakkidippuram Campus |
| **Student / Receiver** | Basim Aslam | `2004-13642-2025` | Kakkidippuram (Batch 12, العتق 10) |
| **Student / Receiver** | Athnan | `DF-2026-0104` | Kakkidippuram (Batch 12) |

*(Password for all demo accounts: `password123`)*

---

## 4. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or yarn

### Installation
```bash
# Clone or navigate to the repository
cd "c:\basim\dalail family"

# Install dependencies
npm install

# Run development server
npm run dev
# The app will be available at http://localhost:3000
```

### Production Build
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 5. Environment Variables & Gateway Configuration

Copy `.env.example` to `.env.local` to configure real production credentials:

```ini
# Firebase Cloud Firestore
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dalail-family-erp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dalail-family-erp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dalail-family-erp.appspot.com

# Payment Gateway (Razorpay / Cashfree / Sandbox)
NEXT_PUBLIC_PAYMENT_GATEWAY_MODE=Sandbox
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# WhatsApp Business Cloud API
WHATSAPP_CLOUD_API_TOKEN=your_meta_system_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_TEMPLATE_NAME=dalail_official_receipt_v1
```

*When credentials are not supplied, the platform runs in full-featured **Sandbox Mode**, permitting end-to-end simulation of dynamic UPI QR codes, instant webhook confirmations, and receipt issuances without external billing.*

---

## 6. Public Verification Links

- **Official Digital Receipt Verification:**  
  `http://localhost:3000/verify/receipt/3102`
- **Digital Student ID Card Verification:**  
  `http://localhost:3000/verify/id/2004-13642-2025`

