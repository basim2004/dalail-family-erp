import { firestore } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  User,
  Campus,
  Member,
  BrochureItem,
  FieldWorkItem,
  CollectionGroup,
  Dispatch,
  Receipt,
  Expense,
  SettlementSettings,
  SettlementPaymentRecord,
} from '../types';
import {
  initialUsers,
  initialCampuses,
  initialMembers,
  initialBrochures,
  initialFieldWorkItems,
  initialGroups,
  initialDispatches,
  initialReceipts,
  initialExpenses,
  initialSettlementSettings,
  initialPayments,
} from './mockData';

class DatabaseService {
  private users: User[] = [];
  private campuses: Campus[] = [];
  private members: Member[] = [];
  private brochures: BrochureItem[] = [];
  private fieldWorkItems: FieldWorkItem[] = [];
  private groups: CollectionGroup[] = [];
  private dispatches: Dispatch[] = [];
  private receipts: Receipt[] = [];
  private expenses: Expense[] = [];
  private settlementSettings: SettlementSettings = initialSettlementSettings;
  private payments: SettlementPaymentRecord[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.users = [...initialUsers];
      this.campuses = [...initialCampuses];
      this.members = [...initialMembers];
      this.brochures = [...initialBrochures];
      this.fieldWorkItems = [...initialFieldWorkItems];
      this.groups = [...initialGroups];
      this.dispatches = [...initialDispatches];
      this.receipts = [...initialReceipts];
      this.expenses = [...initialExpenses];
      this.settlementSettings = { ...initialSettlementSettings };
      this.payments = [...initialPayments];
      this.initialized = true;
      return;
    }

    try {
      // Clear legacy storage versions (v1 through v11)
      [
        'users',
        'campuses',
        'members',
        'brochures',
        'fieldwork',
        'dispatches',
        'receipts',
        'expenses',
        'groups',
        'settlement_settings',
        'payments',
      ].forEach((k) => {
        for (let v = 1; v <= 11; v++) {
          localStorage.removeItem(`dalail_v${v}_${k}`);
        }
      });

      const load = <T>(key: string, fallback: T): T => {
        const item = localStorage.getItem(`dalail_v12_${key}`);
        if (!item) {
          localStorage.setItem(`dalail_v12_${key}`, JSON.stringify(fallback));
          return fallback;
        }
        return JSON.parse(item);
      };

      this.users = load('users', initialUsers);
      const adminUser = this.users.find((u) => u.role === 'main_admin');
      if (adminUser && adminUser.name !== 'BASIM ASLAM') {
        adminUser.name = 'BASIM ASLAM';
      }
      const campusAdminUser = this.users.find((u) => u.role === 'campus_admin' || u.id === 'user_campus_admin_kak');
      if (campusAdminUser && campusAdminUser.name !== "USTHAD ABDUL HAKEEM SA'ADI") {
        campusAdminUser.name = "USTHAD ABDUL HAKEEM SA'ADI";
      }
      this.save('users', this.users);

      this.campuses = load('campuses', initialCampuses);
      if (this.campuses && this.campuses.length > 0) {
        const validCampusIds = new Set(initialCampuses.map((c) => c.id));
        const cleanedCampuses = this.campuses.filter((c) => validCampusIds.has(c.id));
        const kak = cleanedCampuses.find((c) => c.id === 'campus_kak');
        if (kak) {
          kak.name = 'Dalailul Khairath Islamic Foundation Kakkidippuram Main Campus';
          kak.membersCount = 100;
          kak.contact = '+91 7034149149';
          kak.campusAdminName = "USTHAD ABDUL HAKEEM SA'ADI";
        }
        this.campuses = cleanedCampuses;
        this.save('campuses', this.campuses);
      }
      this.members = load('members', initialMembers);
      this.brochures = load('brochures', initialBrochures);
      this.fieldWorkItems = load('fieldwork', initialFieldWorkItems);
      this.groups = load('groups', initialGroups);
      this.dispatches = load('dispatches', initialDispatches);

      // Anti-Double Protection:
      // If historical dispatches were imported or duplicated, ensure the 2026 drive is never counted twice.
      // If both disp_2k26_* (21 group drives) and disp_hist_* (89 individual rows) are present, keep only the canonical 21 group drives.
      if (this.dispatches && this.dispatches.length > 0) {
        const hasCanonicalGroup = this.dispatches.some((d) => d.id.startsWith('disp_2k26_'));
        if (hasCanonicalGroup) {
          const beforeLen = this.dispatches.length;
          this.dispatches = this.dispatches.filter((d) => !d.id.startsWith('disp_hist_'));
          if (this.dispatches.length !== beforeLen) {
            this.save('dispatches', this.dispatches);
          }
        }
      }

      if (!this.dispatches || this.dispatches.length === 0) {
        this.dispatches = [...initialDispatches];
        this.save('dispatches', this.dispatches);
      }
      this.receipts = load('receipts', initialReceipts);
      if (!this.receipts || this.receipts.length < 89) {
        this.receipts = [...initialReceipts];
        this.save('receipts', this.receipts);
      }
      this.expenses = load('expenses', initialExpenses);
      this.settlementSettings = load('settlement_settings', initialSettlementSettings);
      this.payments = load('payments', initialPayments);
      this.initialized = true;
    } catch {
      this.users = [...initialUsers];
      this.campuses = [...initialCampuses];
      this.members = [...initialMembers];
      this.brochures = [...initialBrochures];
      this.fieldWorkItems = [...initialFieldWorkItems];
      this.groups = [...initialGroups];
      this.dispatches = [...initialDispatches];
      this.receipts = [...initialReceipts];
      this.expenses = [...initialExpenses];
      this.settlementSettings = { ...initialSettlementSettings };
      this.payments = [...initialPayments];
      this.initialized = true;
    }
  }

  private save<T>(key: string, data: T) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`dalail_v12_${key}`, JSON.stringify(data));
      } catch (e) {
        console.error(`Failed to save ${key}:`, e);
      }
    }
  }

  // Clear all financial transaction data (dispatches, receipts, expenses, payments) to reset accounts to 0
  clearAllFinancialCalculations() {
    this.dispatches = [];
    this.receipts = [];
    this.expenses = [];
    this.payments = [];
    this.settlementSettings = {
      campaignId: 'CAMP-2026',
      campaignName: 'Field Collection Drive 2026',
      baseSharePool: 0,
      standardDeductionPerVolunteer: 0,
      customTravelDeductions: {},
    };
    this.save('dispatches', this.dispatches);
    this.save('receipts', this.receipts);
    this.save('expenses', this.expenses);
    this.save('payments', this.payments);
    this.save('settlement_settings', this.settlementSettings);
  }

  // --- Users & Campus Admins ---
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id || u.email === id || u.username === id);
  }

  addCampusAdmin(adminData: Omit<User, 'id' | 'role' | 'createdAt'>): User {
    const newUser: User = {
      ...adminData,
      id: `user_${Date.now()}`,
      role: 'campus_admin',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.save('users', this.users);

    if (adminData.campusId) {
      const campus = this.campuses.find((c) => c.id === adminData.campusId);
      if (campus) {
        campus.campusAdminId = newUser.id;
        campus.campusAdminName = newUser.name;
        this.save('campuses', this.campuses);
      }
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...updates };
    this.save('users', this.users);

    if (updates.campusId && updates.name) {
      const campus = this.campuses.find((c) => c.id === updates.campusId);
      if (campus) {
        campus.campusAdminId = id;
        campus.campusAdminName = updates.name;
        this.save('campuses', this.campuses);
      }
    }

    return this.users[index];
  }

  deleteCampusAdmin(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;

    if (user.campusId) {
      const campus = this.campuses.find((c) => c.id === user.campusId);
      if (campus && campus.campusAdminId === userId) {
        campus.campusAdminId = undefined;
        campus.campusAdminName = undefined;
        this.save('campuses', this.campuses);
      }
    }

    this.users = this.users.filter((u) => u.id !== userId);
    this.save('users', this.users);
    return true;
  }

  // --- Campuses ---
  getCampuses(): Campus[] {
    return [...this.campuses];
  }

  getCampusById(id: string): Campus | undefined {
    return this.campuses.find((c) => c.id === id || c.code === id);
  }

  createCampus(campusData: Omit<Campus, 'id' | 'createdAt' | 'membersCount'>): Campus {
    const newCampus: Campus = {
      ...campusData,
      id: `campus_${Date.now()}`,
      membersCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.campuses.push(newCampus);
    this.save('campuses', this.campuses);
    return newCampus;
  }

  addCampus(campusData: Omit<Campus, 'id' | 'createdAt' | 'membersCount'>): Campus {
    return this.createCampus(campusData);
  }

  updateCampus(id: string, updates: Partial<Campus>): Campus | undefined {
    const index = this.campuses.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.campuses[index] = { ...this.campuses[index], ...updates };
    this.save('campuses', this.campuses);
    return this.campuses[index];
  }

  // --- Members (Receivers) ---
  getMembers(campusId?: string): Member[] {
    if (!campusId || campusId === 'all') return [...this.members];
    return this.members.filter((m) => m.campusId === campusId);
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find((m) => m.id === id || m.memberId === id);
  }

  createMember(memberData: Omit<Member, 'id' | 'memberId' | 'createdAt'>): Member {
    const seq = this.members.length + 1;
    const memberId = `DKIF-REC-${String(seq).padStart(2, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: `mem_${Date.now()}`,
      memberId,
      createdAt: new Date().toISOString(),
    };
    this.members.push(newMember);
    this.save('members', this.members);

    const campus = this.campuses.find((c) => c.id === memberData.campusId);
    if (campus) {
      campus.membersCount += 1;
      this.save('campuses', this.campuses);
    }

    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>): Member | undefined {
    const index = this.members.findIndex((m) => m.id === id || m.memberId === id);
    if (index === -1) return undefined;
    this.members[index] = { ...this.members[index], ...updates };
    this.save('members', this.members);
    return this.members[index];
  }

  deleteMember(id: string): boolean {
    const member = this.members.find((m) => m.id === id || m.memberId === id);
    if (!member) return false;
    this.members = this.members.filter((m) => m.id !== member.id);
    this.save('members', this.members);

    const campus = this.campuses.find((c) => c.id === member.campusId);
    if (campus && campus.membersCount > 0) {
      campus.membersCount -= 1;
      this.save('campuses', this.campuses);
    }
    return true;
  }

  addMember(memberData: Omit<Member, 'id' | 'createdAt'> & { memberId?: string }): Member {
    const seq = this.members.length + 1;
    const memberId = memberData.memberId || `DKIF-REC-${String(seq).padStart(2, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: `mem_${Date.now()}`,
      memberId,
      createdAt: new Date().toISOString(),
    };
    this.members.push(newMember);
    this.save('members', this.members);

    const campus = this.campuses.find((c) => c.id === memberData.campusId);
    if (campus) {
      campus.membersCount += 1;
      this.save('campuses', this.campuses);
    }

    return newMember;
  }

  toggleFieldWork(id: string, enabled: boolean): Member | undefined {
    return this.updateMember(id, { fieldWorkEnabled: enabled });
  }

  // --- Collection Groups (Module 01) ---
  getGroups(campusId?: string): CollectionGroup[] {
    if (!campusId || campusId === 'all') return [...this.groups];
    return this.groups.filter((g) => g.campusId === campusId);
  }

  getCollectionGroups(campusId?: string): CollectionGroup[] {
    return this.getGroups(campusId);
  }

  getGroupById(id: string): CollectionGroup | undefined {
    return this.groups.find((g) => g.id === id || g.groupId === id);
  }

  createGroup(groupData: Omit<CollectionGroup, 'id' | 'createdAt'>): CollectionGroup {
    const newGroup: CollectionGroup = {
      ...groupData,
      id: `grp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.groups.unshift(newGroup);
    this.save('groups', this.groups);
    return newGroup;
  }

  updateGroup(id: string, updates: Partial<CollectionGroup>): CollectionGroup | undefined {
    const index = this.groups.findIndex((g) => g.id === id || g.groupId === id);
    if (index === -1) return undefined;
    this.groups[index] = { ...this.groups[index], ...updates };
    this.save('groups', this.groups);
    return this.groups[index];
  }

  deleteGroup(id: string): boolean {
    const index = this.groups.findIndex((g) => g.id === id || g.groupId === id);
    if (index === -1) return false;
    this.groups.splice(index, 1);
    this.save('groups', this.groups);
    return true;
  }

  // --- Dispatches (Module 02 & 06) ---
  getDispatches(campusId?: string): Dispatch[] {
    const list = this.dispatches && this.dispatches.length > 0 ? this.dispatches : initialDispatches;
    if (!campusId || campusId === 'all') return [...list];
    return list.filter((d) => d.campusId === campusId);
  }

  getDispatchById(id: string): Dispatch | undefined {
    return this.dispatches.find((d) => d.id === id || d.dispatchId === id);
  }

  createDispatch(
    dispatchData: Partial<Dispatch> & {
      campusId: string;
      routePlace: string;
    }
  ): Dispatch {
    const seq = this.dispatches.length + 1;
    const dispatchId = dispatchData.dispatchId || `DSP-2026-${String(seq).padStart(3, '0')}`;
    const campus = this.campuses.find((c) => c.id === dispatchData.campusId);
    const newDispatch: Dispatch = {
      id: `disp_${Date.now()}`,
      dispatchId,
      campaignName: dispatchData.campaignName || 'Field Collection Drive 2K26',
      academicYear: dispatchData.academicYear || '2025-2026',
      campusId: dispatchData.campusId,
      campusName: dispatchData.campusName || campus?.name || 'Kakkidippuram Campus',
      date: dispatchData.date || new Date().toISOString().split('T')[0],
      routePlace: dispatchData.routePlace,
      districtCode: dispatchData.districtCode || 'KL-GEN',
      collectionType: dispatchData.collectionType || 'Group',
      deploymentType: dispatchData.deploymentType,
      groupId: dispatchData.groupId,
      groupName: dispatchData.groupName,
      leaderId: dispatchData.leaderId || dispatchData.studentId || '',
      leaderName: dispatchData.leaderName || dispatchData.studentName || '',
      studentId: dispatchData.studentId,
      studentName: dispatchData.studentName,
      participatingMemberIds:
        dispatchData.participatingMemberIds || (dispatchData.studentId ? [dispatchData.studentId] : []),
      participatingMemberNames:
        dispatchData.participatingMemberNames || (dispatchData.studentName ? [dispatchData.studentName] : []),
      calendarsGiven: dispatchData.calendarsGiven ?? 50,
      calendarsSold: dispatchData.calendarsSold ?? 0,
      allowance: dispatchData.allowance ?? 0,
      notes: dispatchData.notes,
      status: dispatchData.status || 'Assigned',
      dispatchedBy: dispatchData.dispatchedBy || 'Admin',
      totalCollection: dispatchData.totalCollection ?? 0,
      cashCollection: dispatchData.cashCollection ?? 0,
      upiCollection: dispatchData.upiCollection ?? 0,
      approvedExpenses: dispatchData.approvedExpenses ?? 0,
      cashHandedOver: dispatchData.cashHandedOver ?? 0,
      cashDue: dispatchData.cashDue ?? 0,
      settlementNotes: dispatchData.settlementNotes,
      settledBy: dispatchData.settledBy,
      settledAt: dispatchData.settledAt,
      isHistorical: dispatchData.isHistorical ?? false,
      hasReceiptData: dispatchData.hasReceiptData ?? true,
      createdAt: dispatchData.createdAt || new Date().toISOString(),
    };
    this.dispatches.unshift(newDispatch);
    this.save('dispatches', this.dispatches);
    return newDispatch;
  }

  updateDispatch(id: string, updates: Partial<Dispatch>): Dispatch | undefined {
    const index = this.dispatches.findIndex((d) => d.id === id || d.dispatchId === id);
    if (index === -1) return undefined;
    this.dispatches[index] = { ...this.dispatches[index], ...updates };
    this.save('dispatches', this.dispatches);
    return this.dispatches[index];
  }

  settleDispatch(
    id: string,
    settlement:
      | {
          cashHandedOver?: number;
          approvedExpenses?: number;
          settlementNotes?: string;
          settledBy: string;
        }
      | string
  ): Dispatch | undefined {
    const index = this.dispatches.findIndex((d) => d.id === id || d.dispatchId === id);
    if (index === -1) return undefined;

    const dispatch = this.dispatches[index];
    const isString = typeof settlement === 'string';
    const settledBy = isString ? settlement : settlement.settledBy;
    const cashHandedOver = isString
      ? Math.max(0, (dispatch.cashCollection || 0) - (dispatch.approvedExpenses || 0))
      : settlement.cashHandedOver !== undefined
      ? settlement.cashHandedOver
      : (dispatch.cashHandedOver || 0);
    const approvedExpenses =
      !isString && settlement.approvedExpenses !== undefined
        ? settlement.approvedExpenses
        : (dispatch.approvedExpenses || 0);
    const expectedHandover = Math.max(0, (dispatch.cashCollection || 0) - approvedExpenses);
    const cashDue = expectedHandover - cashHandedOver;

    this.dispatches[index] = {
      ...dispatch,
      cashHandedOver,
      approvedExpenses,
      cashDue,
      status: cashDue === 0 ? 'Settled' : 'Submitted',
      settlementNotes: !isString && settlement.settlementNotes ? settlement.settlementNotes : dispatch.settlementNotes,
      settledBy,
      settledAt: new Date().toISOString(),
    };

    this.save('dispatches', this.dispatches);
    return this.dispatches[index];
  }

  deleteDispatch(id: string): boolean {
    const index = this.dispatches.findIndex((d) => d.id === id || d.dispatchId === id);
    if (index === -1) return false;
    this.dispatches.splice(index, 1);
    this.save('dispatches', this.dispatches);
    return true;
  }

  importHistoricalDispatches(newDispatches: Dispatch[]): {
    createdCount: number;
    skippedCount: number;
    totalAmount: number;
  } {
    // Zero Double Counting Protection:
    // If the 2K26 drive (21 daily group dispatches totaling ₹2,50,997) is already present in Central ERP,
    // do not add duplicate rows that would double the collection.
    const alreadyPresent = this.dispatches.some(
      (d) => d.id.startsWith('disp_2k26_') || (d.groupId === 'grp_wayanad_2k26' && d.status === 'Settled')
    );

    if (alreadyPresent) {
      return {
        createdCount: 0,
        skippedCount: newDispatches.length,
        totalAmount: 250997.00,
      };
    }

    let createdCount = 0;
    let skippedCount = 0;
    let totalAmount = 0;

    newDispatches.forEach((item) => {
      // Duplicate check: same student + date + place
      const exists = this.dispatches.some(
        (d) =>
          d.studentId === item.studentId &&
          d.date === item.date &&
          d.routePlace.trim().toLowerCase() === item.routePlace.trim().toLowerCase()
      );

      if (exists) {
        skippedCount++;
      } else {
        this.dispatches.push(item);
        createdCount++;
        totalAmount += item.totalCollection;
      }
    });

    this.save('dispatches', this.dispatches);
    return {
      createdCount,
      skippedCount,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  getDispatchFinancials(dispatchId: string): {
    totalCollected: number;
    collectedCash: number;
    collectedUpi: number;
    expenses: number;
    allowance: number;
    netCash: number;
    receiptsCount: number;
  } {
    const dispatch = this.dispatches.find((d) => d.id === dispatchId || d.dispatchId === dispatchId);
    const rcpts = this.receipts.filter((r) => r.dispatchId === dispatchId);
    const totalCollected = rcpts.reduce((sum, r) => sum + r.amount, 0) || dispatch?.totalCollection || 0;
    const collectedCash = rcpts.filter((r) => r.paymentMode === 'Cash' || r.paymentMode === 'Cash in Hand').reduce((sum, r) => sum + r.amount, 0) || dispatch?.cashCollection || 0;
    const collectedUpi = rcpts.filter((r) => r.paymentMode === 'UPI' || r.paymentMode === 'Direct UPI').reduce((sum, r) => sum + r.amount, 0) || dispatch?.upiCollection || 0;
    const expList = this.expenses.filter((e) => e.dispatchId === dispatchId && e.status === 'Approved');
    const expenses = expList.reduce((sum, e) => sum + e.amount, 0) || dispatch?.approvedExpenses || 0;
    const allowance = dispatch?.allowance || 0;
    const netCash = Math.max(0, collectedCash - expenses);
    const receiptsCount = rcpts.length || (dispatch ? Math.round(totalCollected / 2000) : 0);

    return {
      totalCollected,
      collectedCash,
      collectedUpi,
      expenses,
      allowance,
      netCash,
      receiptsCount,
    };
  }

  // --- Receipts (Module 03) ---
  getReceipts(dispatchId?: string, campusId?: string): Receipt[] {
    const list = this.receipts && this.receipts.length > 0 ? this.receipts : initialReceipts;
    return list.filter((r) => {
      if (dispatchId && r.dispatchId !== dispatchId) return false;
      if (campusId && campusId !== 'all' && r.campusId !== campusId) return false;
      return true;
    });
  }

  getReceiptById(id: string): Receipt | undefined {
    const clean = id.trim().toUpperCase();
    return this.receipts.find((r) => {
      if (r.id === id) return true;
      if (r.receiptNo && r.receiptNo.toUpperCase() === clean) return true;
      const numMatch = r.receiptNo?.match(/DF-\d+-0*(\d+)/);
      if (numMatch && numMatch[1] === clean.replace(/^0+/, '')) return true;
      return false;
    });
  }

  createReceipt(receiptData: Omit<Receipt, 'id' | 'receiptNo' | 'createdAt'>): Receipt {
    // Generate sequential receipt number: DF-2026-03102 etc.
    let maxSeq = 3100;
    this.receipts.forEach((r) => {
      const match = r.receiptNo?.match(/DF-2026-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    });

    const nextNum = maxSeq + 1;
    const formattedNum = `DF-2026-${String(nextNum).padStart(5, '0')}`;

    const newReceipt: Receipt = {
      ...receiptData,
      id: `rcpt_${Date.now()}`,
      receiptNo: formattedNum,
      createdAt: new Date().toISOString(),
    };

    this.receipts.unshift(newReceipt);
    this.save('receipts', this.receipts);

    // Update dispatch financial totals in real-time
    if (receiptData.dispatchId) {
      const dispatch = this.dispatches.find((d) => d.id === receiptData.dispatchId);
      if (dispatch) {
        dispatch.totalCollection = (dispatch.totalCollection || 0) + receiptData.amount;
        if (receiptData.paymentMode === 'Cash in Hand') {
          dispatch.cashCollection = (dispatch.cashCollection || 0) + receiptData.amount;
        } else {
          dispatch.upiCollection = (dispatch.upiCollection || 0) + receiptData.amount;
        }
        if (receiptData.calendarGiven) {
          dispatch.calendarsSold = Math.min(dispatch.calendarsGiven, (dispatch.calendarsSold || 0) + 1);
        }
        dispatch.cashDue = Math.max(0, dispatch.cashCollection - (dispatch.approvedExpenses || 0) - (dispatch.cashHandedOver || 0));
        this.save('dispatches', this.dispatches);
      }
    }

    return newReceipt;
  }

  deleteReceipt(id: string): boolean {
    const rcpt = this.receipts.find((r) => r.id === id || r.receiptNo === id);
    if (!rcpt) return false;

    if (rcpt.dispatchId) {
      const dispatch = this.dispatches.find((d) => d.id === rcpt.dispatchId);
      if (dispatch) {
        dispatch.totalCollection = Math.max(0, (dispatch.totalCollection || 0) - rcpt.amount);
        if (rcpt.paymentMode === 'Cash in Hand') {
          dispatch.cashCollection = Math.max(0, (dispatch.cashCollection || 0) - rcpt.amount);
        } else {
          dispatch.upiCollection = Math.max(0, (dispatch.upiCollection || 0) - rcpt.amount);
        }
        if (rcpt.calendarGiven && dispatch.calendarsSold > 0) {
          dispatch.calendarsSold -= 1;
        }
        dispatch.cashDue = Math.max(0, dispatch.cashCollection - (dispatch.approvedExpenses || 0) - (dispatch.cashHandedOver || 0));
        this.save('dispatches', this.dispatches);
      }
    }

    this.receipts = this.receipts.filter((r) => r.id !== rcpt.id && r.receiptNo !== rcpt.receiptNo);
    this.save('receipts', this.receipts);
    return true;
  }

  // --- Expenses (Module 07) ---
  getExpenses(dispatchId?: string, campusId?: string): Expense[] {
    return this.expenses.filter((e) => {
      if (dispatchId && e.dispatchId !== dispatchId) return false;
      if (campusId && campusId !== 'all' && e.campusId !== campusId) return false;
      return true;
    });
  }

  createExpense(expenseData: Omit<Expense, 'id' | 'expenseId' | 'createdAt' | 'status'>): Expense {
    const seq = this.expenses.length + 1;
    const expenseId = `EXP-2026-${String(seq).padStart(3, '0')}`;
    const newExpense: Expense = {
      date: expenseData.date || new Date().toISOString().split('T')[0],
      ...expenseData,
      id: `exp_${Date.now()}`,
      expenseId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    this.save('expenses', this.expenses);
    return newExpense;
  }

  updateExpenseStatus(
    id: string,
    status: 'Approved' | 'Rejected',
    reviewer: string
  ): Expense | undefined {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    this.expenses[index].status = status;
    this.expenses[index].approvedBy = reviewer;
    this.save('expenses', this.expenses);

    // If approved, update approved expenses on dispatch
    const exp = this.expenses[index];
    if (exp.dispatchId) {
      const dispatch = this.dispatches.find((d) => d.id === exp.dispatchId);
      if (dispatch) {
        const approvedSum = this.expenses
          .filter((e) => e.dispatchId === exp.dispatchId && e.status === 'Approved')
          .reduce((sum, e) => sum + e.amount, 0);
        dispatch.approvedExpenses = approvedSum;
        dispatch.cashDue = Math.max(0, dispatch.cashCollection - approvedSum - (dispatch.cashHandedOver || 0));
        this.save('dispatches', this.dispatches);
      }
    }

    return this.expenses[index];
  }

  // --- Settlement Settings & Payments (Module 08 & 12) ---
  getSettlementSettings(): SettlementSettings {
    return { ...this.settlementSettings };
  }

  updateSettlementSettings(updates: Partial<SettlementSettings>): SettlementSettings {
    this.settlementSettings = { ...this.settlementSettings, ...updates };
    this.save('settlement_settings', this.settlementSettings);
    return this.settlementSettings;
  }

  getPayments(volunteerId?: string): SettlementPaymentRecord[] {
    if (!volunteerId) return [...this.payments];
    return this.payments.filter((p) => p.volunteerId === volunteerId);
  }

  createPayment(
    paymentData: Omit<SettlementPaymentRecord, 'id' | 'paymentId' | 'createdAt'>
  ): SettlementPaymentRecord {
    const seq = this.payments.length + 1;
    const paymentId = `PAY-2026-${String(seq).padStart(3, '0')}`;
    const newPayment: SettlementPaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      paymentId,
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);
    this.save('payments', this.payments);
    return newPayment;
  }

  // --- Brochures & Field Work ---
  getBrochures(): BrochureItem[] {
    return [...this.brochures];
  }

  addBrochure(item: Omit<BrochureItem, 'id' | 'updatedAt'> & { updatedAt?: string }): BrochureItem {
    const newBrochure: BrochureItem = {
      ...item,
      id: `br_${Date.now()}`,
      updatedAt: item.updatedAt || new Date().toISOString().split('T')[0],
    };
    this.brochures.push(newBrochure);
    this.save('brochures', this.brochures);
    return newBrochure;
  }

  getFieldWorkItems(): FieldWorkItem[] {
    return [...this.fieldWorkItems];
  }

  getFieldWorkFolders(): string[] {
    const set = new Set<string>();
    this.fieldWorkItems.forEach((item) => {
      if (item.folder) set.add(item.folder);
    });
    return Array.from(set);
  }

  addFieldWorkItem(
    item: Omit<FieldWorkItem, 'id' | 'updatedAt'> & { updatedAt?: string }
  ): FieldWorkItem {
    const newItem: FieldWorkItem = {
      ...item,
      id: `fw_${Date.now()}`,
      updatedAt: item.updatedAt || new Date().toISOString().split('T')[0],
    };
    this.fieldWorkItems.push(newItem);
    this.save('fieldwork', this.fieldWorkItems);
    return newItem;
  }

  renameFieldWorkItem(id: string, newTitle: string): FieldWorkItem | undefined {
    const index = this.fieldWorkItems.findIndex((f) => f.id === id);
    if (index === -1) return undefined;
    this.fieldWorkItems[index].title = newTitle;
    this.save('fieldwork', this.fieldWorkItems);
    return this.fieldWorkItems[index];
  }

  deleteFieldWorkItem(id: string): boolean {
    const index = this.fieldWorkItems.findIndex((f) => f.id === id);
    if (index === -1) return false;
    this.fieldWorkItems.splice(index, 1);
    this.save('fieldwork', this.fieldWorkItems);
    return true;
  }

  // ==========================================
  // FIREBASE & FIRESTORE INTEGRATION METHODS
  // ==========================================

  /**
   * Create complete local JSON backup of all existing records
   */
  public createCompleteBackup(): { timestamp: string; version: string; data: Record<string, any> } {
    const backup = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      institution: 'Dalailul Khairath Islamic Foundation (Regd.)',
      stats: {
        users: this.users.length,
        campuses: this.campuses.length,
        members: this.members.length,
        dispatches: this.dispatches.length,
        receipts: this.receipts.length,
        expenses: this.expenses.length,
        totalCollection: this.receipts.reduce((sum, r) => sum + r.amount, 0),
      },
      data: {
        users: this.users,
        campuses: this.campuses,
        members: this.members,
        brochures: this.brochures,
        fieldwork: this.fieldWorkItems,
        groups: this.groups,
        dispatches: this.dispatches,
        receipts: this.receipts,
        expenses: this.expenses,
        settlementSettings: this.settlementSettings,
        payments: this.payments,
      },
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dalail_backup_latest', JSON.stringify(backup));
      } catch (err) {
        console.warn('Backup storage error:', err);
      }
    }
    return backup;
  }

  /**
   * Migrate and sync all records to Cloud Firestore while preserving all original IDs
   */
  public async migrateToFirestore(): Promise<{
    success: boolean;
    migratedCounts: Record<string, number>;
    errors: string[];
  }> {
    const results = {
      success: true,
      migratedCounts: {
        campuses: 0,
        users: 0,
        members: 0,
        dispatches: 0,
        receipts: 0,
        expenses: 0,
        groups: 0,
      },
      errors: [] as string[],
    };

    try {
      // 1. Campuses
      for (const campus of this.campuses) {
        try {
          await setDoc(doc(firestore, 'campuses', campus.id), campus, { merge: true });
          results.migratedCounts.campuses++;
        } catch (e: any) {
          results.errors.push(`Campus ${campus.id}: ${e.message}`);
        }
      }

      // 2. Members / Students
      for (const member of this.members) {
        try {
          await setDoc(doc(firestore, 'students', member.id), member, { merge: true });
          results.migratedCounts.members++;
        } catch (e: any) {
          results.errors.push(`Member ${member.id}: ${e.message}`);
        }
      }

      // 3. Dispatches
      for (const disp of this.dispatches) {
        try {
          await setDoc(doc(firestore, 'dispatches', disp.id), disp, { merge: true });
          results.migratedCounts.dispatches++;
        } catch (e: any) {
          results.errors.push(`Dispatch ${disp.id}: ${e.message}`);
        }
      }

      // 4. Receipts
      for (const rec of this.receipts) {
        try {
          await setDoc(doc(firestore, 'receipts', rec.id), rec, { merge: true });
          results.migratedCounts.receipts++;
        } catch (e: any) {
          results.errors.push(`Receipt ${rec.id}: ${e.message}`);
        }
      }

      // 5. Expenses
      for (const exp of this.expenses) {
        try {
          await setDoc(doc(firestore, 'expenses', exp.id), exp, { merge: true });
          results.migratedCounts.expenses++;
        } catch (e: any) {
          results.errors.push(`Expense ${exp.id}: ${e.message}`);
        }
      }

      if (results.errors.length > 0) {
        results.success = false;
      }
    } catch (globalErr: any) {
      results.success = false;
      results.errors.push(`Global sync error: ${globalErr.message}`);
    }

    return results;
  }
}

export const db = new DatabaseService();
