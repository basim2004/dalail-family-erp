import {
  Dispatch,
  Member,
  Receipt,
  Expense,
  SettlementSettings,
  VolunteerSettlement,
  SettlementPaymentRecord,
} from '../types';

/**
 * Format currency in Indian numbering format (e.g. ₹2,50,997.00)
 */
export function formatINR(amount: number | undefined | null = 0, includeDecimals = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) return includeDecimals ? '₹0.00' : '₹0';
  const parts = (includeDecimals ? amount.toFixed(2) : Math.round(amount).toString()).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : includeDecimals ? '.00' : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  // Indian comma formatting: 3 digits from right, then groups of 2
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formattedInteger =
    otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return `${isNegative ? '-' : ''}₹${formattedInteger}${decimalPart}`;
}

/**
 * Calculate Equal Share for a single dispatch
 * Equal Share = Total Verified Collection / Number of Participating Members
 */
export function calculateDispatchEqualShare(
  dispatch: Dispatch,
  receipts: Receipt[] = []
): {
  totalCollection: number;
  cashCollection: number;
  upiCollection: number;
  participatingCount: number;
  eachShare: number;
} {
  // If specific receipts are passed for this dispatch, calculate live; otherwise use dispatch totals
  const dispatchReceipts = receipts.filter(
    (r) => r.dispatchId === dispatch.id && r.paymentStatus === 'Verified' && !r.cancelled
  );

  let totalCollection = dispatch.totalCollection || 0;
  let cashCollection = dispatch.cashCollection || 0;
  let upiCollection = dispatch.upiCollection || 0;

  if (dispatchReceipts.length > 0) {
    cashCollection = dispatchReceipts
      .filter((r) => r.paymentMode === 'Cash in Hand')
      .reduce((sum, r) => sum + r.amount, 0);
    upiCollection = dispatchReceipts
      .filter((r) => r.paymentMode === 'Direct UPI')
      .reduce((sum, r) => sum + r.amount, 0);
    totalCollection = cashCollection + upiCollection;
  }

  const participatingCount = dispatch.participatingMemberIds?.length || 1;
  const eachShare = participatingCount > 0 ? totalCollection / participatingCount : totalCollection;

  return {
    totalCollection,
    cashCollection,
    upiCollection,
    participatingCount,
    eachShare: Math.round(eachShare * 100) / 100,
  };
}

/**
 * Reconcile a dispatch's cash & UPI settlement
 */
export function reconcileDispatchSettlement(
  dispatch: Dispatch,
  expenses: Expense[] = []
): {
  totalCollection: number;
  cashCollection: number;
  upiCollection: number;
  approvedExpenses: number;
  expectedCashHandover: number;
  cashHandedOver: number;
  cashDue: number;
  settlementStatus: 'Settled' | 'Partially Settled' | 'Pending' | 'Discrepancy Found';
} {
  const totalCollection = dispatch.totalCollection || 0;
  const cashCollection = dispatch.cashCollection || 0;
  const upiCollection = dispatch.upiCollection || 0;

  // Sum approved expenses for this dispatch
  const dispatchExpenses = expenses.filter(
    (e) => e.dispatchId === dispatch.id && e.status === 'Approved'
  );
  const approvedExpenses =
    dispatchExpenses.reduce((sum, e) => sum + e.amount, 0) || dispatch.approvedExpenses || 0;

  const expectedCashHandover = Math.max(0, cashCollection - approvedExpenses);
  const cashHandedOver = dispatch.cashHandedOver || 0;
  const cashDue = expectedCashHandover - cashHandedOver;

  let settlementStatus: 'Settled' | 'Partially Settled' | 'Pending' | 'Discrepancy Found' = 'Pending';
  if (dispatch.status === 'Settled' || cashDue === 0) {
    settlementStatus = 'Settled';
  } else if (cashHandedOver > 0 && cashDue > 0) {
    settlementStatus = 'Partially Settled';
  } else if (cashDue > 0) {
    settlementStatus = 'Discrepancy Found';
  }

  return {
    totalCollection,
    cashCollection,
    upiCollection,
    approvedExpenses,
    expectedCashHandover,
    cashHandedOver,
    cashDue,
    settlementStatus,
  };
}

/**
 * Calculate Individual Collection Total Equal Shares
 * Adds all equal shares from every eligible dispatch in which the member participated
 */
export function calculateMemberEqualShares(
  members: Member[],
  dispatches: Dispatch[],
  receipts: Receipt[] = []
): Record<
  string,
  {
    member: Member;
    participatedDispatches: Dispatch[];
    participatedCount: number;
    totalEqualShare: number;
  }
> {
  const result: Record<
    string,
    {
      member: Member;
      participatedDispatches: Dispatch[];
      participatedCount: number;
      totalEqualShare: number;
    }
  > = {};

  members.forEach((m) => {
    result[m.id] = {
      member: m,
      participatedDispatches: [],
      participatedCount: 0,
      totalEqualShare: 0,
    };
  });

  // Eligible dispatches (not rejected)
  const eligibleDispatches = dispatches.filter((d) => d.status !== 'Rejected');

  eligibleDispatches.forEach((dispatch) => {
    const { eachShare } = calculateDispatchEqualShare(dispatch, receipts);
    const participantIds = dispatch.participatingMemberIds || [];

    participantIds.forEach((mId) => {
      if (result[mId]) {
        result[mId].participatedDispatches.push(dispatch);
        result[mId].participatedCount += 1;
        result[mId].totalEqualShare += eachShare;
      }
    });
  });

  // Round shares cleanly
  Object.values(result).forEach((entry) => {
    entry.totalEqualShare = Math.round(entry.totalEqualShare * 100) / 100;
  });

  return result;
}

/**
 * Calculate the complete 5-Step Final Volunteer Settlement
 * Exactly reproduces the official 2K26 Collection & Settlement Report structure
 */
export function calculateFinalVolunteerSettlements(
  members: Member[],
  dispatches: Dispatch[],
  receipts: Receipt[] = [],
  settings: SettlementSettings,
  payments: SettlementPaymentRecord[] = []
): {
  settlements: VolunteerSettlement[];
  totals: {
    totalCollection: number;
    totalEqualShares: number;
    totalPercentage: number;
    totalBaseShare: number;
    totalStandardDeduction: number;
    totalAdjustedShare: number;
    totalTravelDeduction: number;
    totalFinalNetPayable: number;
    totalAlreadyPaid: number;
    totalRemainingBalance: number;
  };
} {
  const memberSharesMap = calculateMemberEqualShares(members, dispatches, receipts);

  // Filter only members who participated in at least one dispatch
  const activeMembers = members.filter((m) => memberSharesMap[m.id]?.participatedCount > 0);

  // Sum total equal shares across all eligible collectors
  const totalEqualShares = activeMembers.reduce(
    (sum, m) => sum + (memberSharesMap[m.id]?.totalEqualShare || 0),
    0
  );

  const baseSharePool = typeof settings.baseSharePool === 'number' ? settings.baseSharePool : 0;
  const standardDeductionPerVolunteer = typeof settings.standardDeductionPerVolunteer === 'number' ? settings.standardDeductionPerVolunteer : 0;
  const customTravelDeductions = settings.customTravelDeductions || {};

  const settlements: VolunteerSettlement[] = activeMembers.map((member) => {
    const shareData = memberSharesMap[member.id];
    const totalEqualShare = shareData.totalEqualShare;

    // Step 1: Collection Proportion (%)
    const collectionPercentage =
      totalEqualShares > 0 ? Math.round((totalEqualShare / totalEqualShares) * 10000) / 100 : 0;

    // Step 2: Base Share = Percentage * BaseSharePool / 100
    // To match 2K26 exact figures:
    const baseShare = Math.round(((collectionPercentage * baseSharePool) / 100) * 100) / 100;

    // Step 3: Standard Deduction
    const standardDeduction = standardDeductionPerVolunteer;
    const adjustedShare = Math.round((baseShare - standardDeduction) * 100) / 100;

    // Step 4: Travel Expense Deduction
    const travelExpenseDeduction = customTravelDeductions[member.id] || 0;
    const finalNetPayable = Math.round((adjustedShare - travelExpenseDeduction) * 100) / 100;

    // Step 5: Payments Tracking
    const memberPayments = payments.filter((p) => p.volunteerId === member.id);
    const amountAlreadyPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = Math.round((finalNetPayable - amountAlreadyPaid) * 100) / 100;

    let paymentStatus: 'Not Paid' | 'Partially Paid' | 'Fully Paid' = 'Not Paid';
    if (amountAlreadyPaid >= finalNetPayable && finalNetPayable > 0) {
      paymentStatus = 'Fully Paid';
    } else if (amountAlreadyPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    return {
      volunteerId: member.id,
      volunteerName: member.name,
      campusId: member.campusId,
      campusName: member.campusName,
      participatedDispatchesCount: shareData.participatedCount,
      totalEqualShare,
      collectionPercentage,
      baseShare,
      standardDeduction,
      adjustedShare,
      travelExpenseDeduction,
      finalNetPayable,
      amountAlreadyPaid,
      remainingBalance,
      paymentStatus,
    };
  });

  // Calculate grand totals
  const totalBaseShare = settlements.reduce((s, v) => s + v.baseShare, 0);
  const totalStandardDeduction = settlements.reduce((s, v) => s + v.standardDeduction, 0);
  const totalAdjustedShare = settlements.reduce((s, v) => s + v.adjustedShare, 0);
  const totalTravelDeduction = settlements.reduce((s, v) => s + v.travelExpenseDeduction, 0);
  const totalFinalNetPayable = settlements.reduce((s, v) => s + v.finalNetPayable, 0);
  const totalAlreadyPaid = settlements.reduce((s, v) => s + v.amountAlreadyPaid, 0);
  const totalRemainingBalance = settlements.reduce((s, v) => s + v.remainingBalance, 0);

  const totalCollection = dispatches
    .filter((d) => d.status !== 'Rejected')
    .reduce((s, d) => s + (d.totalCollection || 0), 0);

  return {
    settlements,
    totals: {
      totalCollection,
      totalEqualShares: Math.round(totalEqualShares * 100) / 100,
      totalPercentage: 100,
      totalBaseShare: Math.round(totalBaseShare * 100) / 100,
      totalStandardDeduction: Math.round(totalStandardDeduction * 100) / 100,
      totalAdjustedShare: Math.round(totalAdjustedShare * 100) / 100,
      totalTravelDeduction: Math.round(totalTravelDeduction * 100) / 100,
      totalFinalNetPayable: Math.round(totalFinalNetPayable * 100) / 100,
      totalAlreadyPaid: Math.round(totalAlreadyPaid * 100) / 100,
      totalRemainingBalance: Math.round(totalRemainingBalance * 100) / 100,
    },
  };
}

