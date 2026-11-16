export type UserRole = 'main_admin' | 'campus_admin' | 'student';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  campusId?: string;
  campusName?: string;
  memberId?: string; // Links student user to Member profile
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Campus {
  id: string;
  name: string;
  code: string;
  institutionName: string;
  location: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contact: string;
  campusAdminId?: string;
  campusAdminName?: string;
  status: 'Active' | 'Inactive';
  membersCount: number;
  createdAt: string;
}

export interface Member {
  id: string;
  memberId: string; // e.g. "DKIF-REC-01"
  name: string;
  roleTitle: 'RECEIVER';
  addressLine1: string;
  addressLine2?: string;
  place: string;
  postOffice: string;
  pincode: string;
  photoUrl: string;
  campusId: string;
  campusName: string;
  status: 'Active' | 'Inactive';
  fieldWorkEnabled: boolean;
  phone?: string;
  studentUsername?: string;
  studentPassword?: string;
  createdAt: string;
}

export interface BrochureItem {
  id: string;
  title: string;
  language: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  description: string;
  updatedAt: string;
}

export interface FieldWorkItem {
  id: string;
  title: string;
  folder: string;
  language: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  description: string;
  updatedAt: string;
}

// ===================== COLLECTION & SETTLEMENT MODULE TYPES =====================

export interface CollectionGroup {
  id: string;
  groupId: string; // e.g. "GRP-WYD-01"
  name: string; // e.g. "Wayanad Focus Team"
  campusId: string;
  campusName: string;
  leaderId: string; // Member ID
  leaderName: string;
  memberIds: string[]; // Up to 5 members
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type DonationCategory =
  | 'General/None'
  | 'MR'
  | 'Orphanage'
  | 'Higher Shariah'
  | 'Tahfeezul Quran'
  | 'Ramadan Drive';

export type PaymentMode = 'Cash in Hand' | 'Direct UPI' | 'Cash' | 'UPI';

export type DispatchStatus =
  | 'Assigned'
  | 'In Field'
  | 'Submitted'
  | 'Verification Pending'
  | 'Settled'
  | 'Completed'
  | 'Rejected';

export interface Dispatch {
  id: string;
  dispatchId: string; // Sequential identifier e.g. "DSP-2026-001"
  campaignName: string; // e.g. "Ramadan & Annual Drive 2K26"
  academicYear: string; // e.g. "2025-2026"
  campusId: string;
  campusName: string;
  date: string; // YYYY-MM-DD
  routePlace: string; // Location / route
  districtCode: string;
  collectionType: 'Group' | 'Individual';
  deploymentType?: string;
  groupId?: string;
  groupName?: string;
  leaderId: string;
  leaderName: string;
  studentId?: string;
  studentName?: string;
  participatingMemberIds: string[]; // Actual collectors who participated (1 to 5)
  participatingMemberNames: string[];
  calendarsGiven: number;
  calendarsSold: number;
  allowance: number; // Approved field allowance
  notes?: string;
  status: DispatchStatus;
  dispatchedBy: string;
  // Financial settlement totals calculated from live records:
  totalCollection: number; // Cash + UPI verified receipts
  cashCollection: number;
  upiCollection: number;
  approvedExpenses: number; // Approved cash expenses deducted
  cashHandedOver: number; // Cash handed over by students
  cashDue: number; // Expected Cash Handover - Cash Handed Over
  settlementNotes?: string;
  settledBy?: string;
  settledAt?: string;
  isHistorical?: boolean;
  hasReceiptData?: boolean;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNo: string; // Sequential format DF-2026-00001
  dispatchId?: string;
  studentId: string; // Collector memberId
  studentName: string;
  groupId?: string;
  groupName?: string;
  campusId: string;
  campusName: string;
  donorName: string;
  donorPhone: string;
  donorAddress: string;
  amount: number;
  amountInWords?: string;
  category: DonationCategory;
  paymentMode: PaymentMode;
  paymentReference?: string; // UPI UTR or reference
  paymentStatus: 'Verified' | 'Pending';
  calendarGiven: boolean;
  createdAt: string;
  donationRef?: string; // Donation reference (e.g. "DF-0001")
  cancelled?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  whatsappStatus?: 'Pending' | 'Submitted' | 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'pending_configuration';
  whatsappMessageId?: string;
  whatsappSentAt?: string;
  whatsappError?: string;
}

export type ExpenseCategory =
  | 'Travel'
  | 'Food'
  | 'Accommodation'
  | 'Stay'
  | 'Fuel'
  | 'Miscellaneous'
  | 'Other';

export interface Expense {
  id: string;
  expenseId: string; // e.g. "EXP-2026-001"
  dispatchId: string;
  groupId?: string;
  collectorId?: string;
  collectorName?: string;
  studentId?: string;
  studentName?: string;
  campusId: string;
  category: ExpenseCategory;
  amount: number;
  date?: string;
  description: string;
  billPhotoUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface SettlementSettings {
  campaignId: string;
  campaignName: string;
  baseSharePool: number; // Default ₹1,15,000 as per 2K26 official report
  standardDeductionPerVolunteer: number; // Default ₹790.40
  customTravelDeductions: Record<string, number>; // e.g. { "mem_4": 3000, "mem_7": 3000 }
}

export interface VolunteerSettlement {
  volunteerId: string; // Member ID
  volunteerName: string;
  campusId: string;
  campusName: string;
  participatedDispatchesCount: number;
  totalEqualShare: number; // Sum of equal shares from participated dispatches
  collectionPercentage: number; // Individual Share / Total All Shares * 100
  baseShare: number; // Percentage * BaseSharePool / 100
  standardDeduction: number; // e.g. 790.40
  adjustedShare: number; // Base Share - Standard Deduction
  travelExpenseDeduction: number; // Custom deduction (e.g. 3000)
  finalNetPayable: number; // Adjusted Share - Travel Expense Deduction
  amountAlreadyPaid: number;
  remainingBalance: number;
  paymentStatus: 'Not Paid' | 'Partially Paid' | 'Fully Paid';
}

export interface SettlementPaymentRecord {
  id: string;
  paymentId: string; // e.g. "PAY-2026-001"
  volunteerId: string;
  volunteerName: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Bank Transfer' | 'Cash' | 'UPI';
  transactionReference: string;
  notes?: string;
  approvedBy: string;
  createdAt: string;
}

export interface InstagramPostItem {
  id: string;
  imageUrl: string;
  postUrl: string;
  caption?: string;
}

export interface PublicMediaSettings {
  // YouTube Section
  youtubeEnabled: boolean;
  youtubeUrl: string;
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeBadge: string;

  // Instagram Showcase Section
  instagramEnabled: boolean;
  instagramUrl: string;
  instagramHandle: string;
  instagramName: string;
  instagramBio: string[];
  instagramPostsCount: string;
  instagramFollowersCount: string;
  instagramFollowingCount: string;
  instagramPosts: InstagramPostItem[];
}

// ===================== DYNAMIC QR & DIRECT UPI PAYMENT TYPES =====================

export type PaymentSessionStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface PaymentSession {
  id: string;
  token: string;
  donationRef: string; // e.g. "DF-0001" or "DF-2026-03102"
  dispatchId?: string;
  collectorId: string;
  collectorName: string;
  campusId: string;
  campusName: string;
  donorName: string;
  donorPhone: string;
  donorAddress?: string;
  prayerRequest?: string;
  amount: number;
  category: DonationCategory;
  calendarGiven?: boolean;
  status: PaymentSessionStatus;
  upiId: string; // "dalailul@sbi"
  payeeName: string; // "DALAILUL KHAIRATH ISLAMIC FOUNDATION"
  upiIntentUrl?: string;
  utr?: string; // 12-digit UPI reference number
  verifiedBy?: string; // e.g. "DONOR_UTR" | "ADMIN_RECONCILIATION" | "BANK_STATEMENT"
  verifiedAt?: string;
  receiptId?: string;
  receiptNo?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  expiresAt: string;
}

