import { firestore } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
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
  PublicMediaSettings,
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
  initialPublicMediaSettings,
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
  private publicMediaSettings: PublicMediaSettings = initialPublicMediaSettings;
  private deletedReceiptIds: Set<string> = new Set();
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
      this.publicMediaSettings = { ...initialPublicMediaSettings };
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

      // Load deleted/voided receipt ID tracker to prevent resurrection upon refresh
      const savedDeleted = localStorage.getItem('dalail_v12_deleted_receipts');
      if (savedDeleted) {
        try {
          const arr: string[] = JSON.parse(savedDeleted);
          this.deletedReceiptIds = new Set(arr);
        } catch {}
      }

      this.receipts = load('receipts', initialReceipts);
      // Clean up any deleted receipts from local storage immediately
      if (this.deletedReceiptIds.size > 0) {
        this.receipts = this.receipts.filter(
          (r) => !this.deletedReceiptIds.has(r.id) && (!r.receiptNo || !this.deletedReceiptIds.has(r.receiptNo))
        );
      }
      this.save('receipts', this.receipts);

      this.expenses = load('expenses', initialExpenses);
      this.settlementSettings = load('settlement_settings', initialSettlementSettings);
      this.payments = load('payments', initialPayments);
      this.publicMediaSettings = load('public_media_settings', initialPublicMediaSettings);
      this.initialized = true;

      // Automatically sync cloud dispatches and receipts across devices
      if (typeof window !== 'undefined') {
        this.syncWithFirestore();
      }
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
      this.publicMediaSettings = { ...initialPublicMediaSettings };
      this.initialized = true;
    }
  }

  private saveDeletedReceiptIds() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'dalail_v12_deleted_receipts',
          JSON.stringify(Array.from(this.deletedReceiptIds))
        );
      } catch (e) {
        console.error('Failed to save deleted receipts list:', e);
      }
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

  /**
   * Real-Time Cross-Device Cloud Sync via Firebase Firestore
   * Synchronizes dispatches and receipts created on Laptop instantly to Phones and other devices
   */
  public async syncWithFirestore(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      let changed = false;

      // 1. Pull dispatches from Cloud Firestore
      const dispSnap = await getDocs(collection(firestore, 'dispatches'));
      if (!dispSnap.empty) {
        dispSnap.forEach((d) => {
          const remote = d.data() as Dispatch;
          const idx = this.dispatches.findIndex((x) => x.id === remote.id || x.dispatchId === remote.dispatchId);
          if (idx >= 0) {
            // Update existing if different
            if (JSON.stringify(this.dispatches[idx]) !== JSON.stringify(remote)) {
              this.dispatches[idx] = { ...this.dispatches[idx], ...remote };
              changed = true;
            }
          } else {
            // Prepend new dispatch created on another device
            this.dispatches.unshift(remote);
            changed = true;
          }
        });
        if (changed) {
          this.save('dispatches', this.dispatches);
        }
      }

      // 2. Pull receipts from Cloud Firestore
      const rcptSnap = await getDocs(collection(firestore, 'receipts'));
      let rcptChanged = false;
      if (!rcptSnap.empty) {
        rcptSnap.forEach((d) => {
          const remote = d.data() as Receipt;

          // Never resurrect permanently deleted receipts
          if (
            this.deletedReceiptIds.has(remote.id) ||
            (remote.receiptNo && this.deletedReceiptIds.has(remote.receiptNo))
          ) {
            return;
          }

          const idx = this.receipts.findIndex(
            (x) => x.id === remote.id || (remote.receiptNo && x.receiptNo === remote.receiptNo)
          );
          if (idx >= 0) {
            if (JSON.stringify(this.receipts[idx]) !== JSON.stringify(remote)) {
              this.receipts[idx] = { ...this.receipts[idx], ...remote };
              rcptChanged = true;
            }
          } else {
            this.receipts.unshift(remote);
            rcptChanged = true;
          }
        });

        // Strict Deduplication Pass: Never allow two receipts with the same receiptNo or ID
        const seenKeys = new Set<string>();
        const deduped: Receipt[] = [];
        for (const r of this.receipts) {
          const key = r.receiptNo || r.id;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            deduped.push(r);
          } else {
            rcptChanged = true;
          }
        }
        this.receipts = deduped;

        if (rcptChanged) {
          this.save('receipts', this.receipts);
        }
      }

      return changed || rcptChanged;
    } catch (e) {
      console.warn('Firestore sync note:', e);
      return false;
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
    const direct = this.users.find((u) => u.id === id || u.email === id || u.username === id);
    if (direct) return direct;

    // Check if it's a student user or member ID
    const memberId = id.startsWith('user_student_') ? id.replace('user_student_', '') : id;
    const member = this.members.find((m) => m.id === memberId || m.memberId === memberId || m.name.toLowerCase() === id.toLowerCase());
    if (member) {
      return {
        id: `user_student_${member.id}`,
        name: member.name,
        username: member.studentUsername || member.name.toLowerCase().replace(/\s+/g, ''),
        email: `${member.name.toLowerCase().replace(/\s+/g, '')}@dalail.org`,
        phone: member.phone || '',
        role: 'student',
        campusId: member.campusId,
        campusName: member.campusName,
        memberId: member.id,
        active: true,
        createdAt: member.createdAt,
      };
    }
    return undefined;
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

  updateUserPassword(id: string, newPassword: string): boolean {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.password = newPassword.trim();
    this.save('users', this.users);

    // If user is a student linked to a Member, also sync member.studentPassword
    if (user.memberId) {
      const member = this.members.find((m) => m.id === user.memberId);
      if (member) {
        member.studentPassword = newPassword.trim();
        this.save('members', this.members);
      }
    }
    return true;
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

  updateMemberPassword(id: string, newPassword: string): boolean {
    const member = this.members.find((m) => m.id === id || m.memberId === id);
    if (!member) return false;
    member.studentPassword = newPassword.trim();
    this.save('members', this.members);

    // Also sync corresponding user if present
    const user = this.users.find(
      (u) => u.memberId === member.id || (member.studentUsername && u.username.toLowerCase() === member.studentUsername.toLowerCase())
    );
    if (user) {
      user.password = newPassword.trim();
      this.save('users', this.users);
    }
    return true;
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
    if (typeof window !== 'undefined') {
      try {
        setDoc(doc(firestore, 'dispatches', newDispatch.id), newDispatch, { merge: true }).catch(() => {});
      } catch {}
    }
    return newDispatch;
  }

  updateDispatch(id: string, updates: Partial<Dispatch>): Dispatch | undefined {
    const index = this.dispatches.findIndex((d) => d.id === id || d.dispatchId === id);
    if (index === -1) return undefined;
    this.dispatches[index] = { ...this.dispatches[index], ...updates };
    this.save('dispatches', this.dispatches);
    if (typeof window !== 'undefined') {
      try {
        setDoc(doc(firestore, 'dispatches', this.dispatches[index].id), this.dispatches[index], { merge: true }).catch(() => {});
      } catch {}
    }
    return this.dispatches[index];
  }

  submitDispatchForSettlement(id: string, notes?: string): Dispatch | undefined {
    const index = this.dispatches.findIndex((d) => d.id === id || d.dispatchId === id);
    if (index === -1) return undefined;
    const dispatch = this.dispatches[index];
    const fin = this.getDispatchFinancials(dispatch.id);
    this.dispatches[index] = {
      ...dispatch,
      totalCollection: fin.totalCollected,
      cashCollection: fin.collectedCash,
      upiCollection: fin.collectedUpi,
      approvedExpenses: fin.expenses,
      status: 'Submitted',
      settlementNotes: notes || dispatch.notes,
    };
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
    const fin = this.getDispatchFinancials(dispatch.id);
    const isString = typeof settlement === 'string';
    const settledBy = isString ? settlement : settlement.settledBy;

    const liveTotal = fin.totalCollected || dispatch.totalCollection || 0;
    const liveCash = fin.collectedCash || dispatch.cashCollection || 0;
    const liveUpi = fin.collectedUpi || dispatch.upiCollection || 0;
    const approvedExpenses =
      !isString && settlement.approvedExpenses !== undefined
        ? settlement.approvedExpenses
        : fin.expenses;

    const expectedCashHandover = Math.max(0, liveCash - approvedExpenses);
    const cashHandedOver = isString
      ? expectedCashHandover
      : settlement.cashHandedOver !== undefined
      ? settlement.cashHandedOver
      : expectedCashHandover;

    const cashDue = Math.max(0, expectedCashHandover - cashHandedOver);

    this.dispatches[index] = {
      ...dispatch,
      totalCollection: liveTotal,
      cashCollection: liveCash,
      upiCollection: liveUpi,
      cashHandedOver,
      approvedExpenses,
      cashDue,
      status: 'Settled',
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
    total: number;
    cash: number;
    upi: number;
    receiptCount: number;
  } {
    const dispatch = this.dispatches.find((d) => d.id === dispatchId || d.dispatchId === dispatchId);
    const rcpts = this.receipts.filter(
      (r) => r.dispatchId === dispatchId || (dispatch && (r.dispatchId === dispatch.id || r.dispatchId === dispatch.dispatchId))
    );
    const hasLiveReceipts = rcpts.length > 0;
    const isCashMode = (mode: string) => mode === 'Cash' || mode === 'Cash in Hand';
    const isUpiMode = (mode: string) => mode === 'UPI' || mode === 'Direct UPI';

    const collectedCash = hasLiveReceipts
      ? rcpts.filter((r) => isCashMode(r.paymentMode)).reduce((sum, r) => sum + r.amount, 0)
      : dispatch?.cashCollection || 0;

    const collectedUpi = hasLiveReceipts
      ? rcpts.filter((r) => isUpiMode(r.paymentMode)).reduce((sum, r) => sum + r.amount, 0)
      : dispatch?.upiCollection || 0;

    const totalCollected = hasLiveReceipts
      ? collectedCash + collectedUpi
      : dispatch?.totalCollection || 0;

    const expList = this.expenses.filter(
      (e) => e.dispatchId === dispatchId || (dispatch && (e.dispatchId === dispatch.id || e.dispatchId === dispatch.dispatchId))
    );
    const approvedExpList = expList.filter((e) => e.status === 'Approved');
    const expenses = approvedExpList.reduce((sum, e) => sum + e.amount, 0) || dispatch?.approvedExpenses || 0;
    const allowance = dispatch?.allowance || 0;
    const netCash = Math.max(0, collectedCash - expenses);
    const receiptsCount = hasLiveReceipts
      ? rcpts.length
      : dispatch ? (dispatch.hasReceiptData ? Math.round(totalCollected / 2000) : 0) : 0;

    return {
      totalCollected,
      collectedCash,
      collectedUpi,
      expenses,
      allowance,
      netCash,
      receiptsCount,
      total: totalCollected,
      cash: collectedCash,
      upi: collectedUpi,
      receiptCount: receiptsCount,
    };
  }

  // --- Receipts (Module 03) ---
  getReceipts(dispatchId?: string, campusId?: string, includeCancelled = false): Receipt[] {
    const list = this.receipts && this.receipts.length > 0 ? this.receipts : initialReceipts;
    return list.filter((r) => {
      // Exclude voided/cancelled receipts by default so they never contaminate active totals
      if (!includeCancelled && r.cancelled) return false;

      if (dispatchId) {
        if (r.dispatchId !== dispatchId) {
          const disp = this.dispatches.find((d) => d.id === dispatchId || d.dispatchId === dispatchId);
          if (!disp || (r.dispatchId !== disp.id && r.dispatchId !== disp.dispatchId)) {
            return false;
          }
        }
      }
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
    // Idempotency check: If an active receipt with this exact paymentReference or donationRef already exists, return it
    if (receiptData.paymentReference && receiptData.paymentReference.trim().length >= 6) {
      const existing = this.receipts.find(
        (r) => !r.cancelled && r.paymentReference === receiptData.paymentReference
      );
      if (existing) return existing;
    }

    if (receiptData.donationRef) {
      const existingRef = this.receipts.find(
        (r) => !r.cancelled && r.donationRef === receiptData.donationRef
      );
      if (existingRef) return existingRef;
    }

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
    if (typeof window !== 'undefined') {
      try {
        setDoc(doc(firestore, 'receipts', newReceipt.id), newReceipt, { merge: true }).catch(() => {});
      } catch {}
    }

    // Update dispatch financial totals in real-time
    if (receiptData.dispatchId) {
      const dispatch = this.dispatches.find(
        (d) => d.id === receiptData.dispatchId || d.dispatchId === receiptData.dispatchId
      );
      if (dispatch) {
        const fin = this.getDispatchFinancials(dispatch.id);
        dispatch.totalCollection = fin.totalCollected;
        dispatch.cashCollection = fin.collectedCash;
        dispatch.upiCollection = fin.collectedUpi;
        if (receiptData.calendarGiven) {
          dispatch.calendarsSold = Math.min(dispatch.calendarsGiven, (dispatch.calendarsSold || 0) + 1);
        }
        dispatch.cashDue = Math.max(0, dispatch.cashCollection - (dispatch.approvedExpenses || 0) - (dispatch.cashHandedOver || 0));
        this.save('dispatches', this.dispatches);
      }
    }

    return newReceipt;
  }

  async deleteReceipt(
    id: string,
    options?: { voidOnly?: boolean; cancelledBy?: string; cancelReason?: string }
  ): Promise<boolean> {
    const rcpt = this.receipts.find((r) => r.id === id || r.receiptNo === id);
    if (!rcpt) return false;

    const voidOnly = options?.voidOnly ?? false;

    if (voidOnly) {
      // Mark as Voided/Cancelled in financial records
      rcpt.cancelled = true;
      rcpt.cancelledAt = new Date().toISOString();
      rcpt.cancelledBy = options?.cancelledBy || 'ADMIN';
      rcpt.cancelReason = options?.cancelReason || 'Administrative Void';
      this.save('receipts', this.receipts);

      if (typeof window !== 'undefined') {
        try {
          await setDoc(
            doc(firestore, 'receipts', rcpt.id),
            {
              cancelled: true,
              cancelledAt: rcpt.cancelledAt,
              cancelledBy: rcpt.cancelledBy,
              cancelReason: rcpt.cancelReason,
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Firestore void notice:', err);
        }
      }
    } else {
      // Permanent removal for test / duplicate records
      this.receipts = this.receipts.filter((r) => r.id !== rcpt.id && r.receiptNo !== rcpt.receiptNo);
      this.deletedReceiptIds.add(rcpt.id);
      if (rcpt.receiptNo) this.deletedReceiptIds.add(rcpt.receiptNo);
      this.saveDeletedReceiptIds();
      this.save('receipts', this.receipts);

      if (typeof window !== 'undefined') {
        try {
          await deleteDoc(doc(firestore, 'receipts', rcpt.id));
        } catch (err) {
          console.warn('Firestore deleteDoc notice:', err);
        }
      }
    }

    // Call server-side API to ensure complete cloud synchronization
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/receipt/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiptId: rcpt.id,
            receiptNo: rcpt.receiptNo,
            voidOnly,
            performedBy: options?.cancelledBy || 'ADMIN',
            reason: options?.cancelReason || (voidOnly ? 'Voided receipt' : 'Deleted test/duplicate record'),
          }),
        }).catch(() => {});
      } catch {}
    }

    // Immediately recalculate and save dispatch totals
    if (rcpt.dispatchId) {
      const dispatch = this.dispatches.find(
        (d) => d.id === rcpt.dispatchId || d.dispatchId === rcpt.dispatchId
      );
      if (dispatch) {
        const fin = this.getDispatchFinancials(dispatch.id);
        dispatch.totalCollection = fin.totalCollected;
        dispatch.cashCollection = fin.collectedCash;
        dispatch.upiCollection = fin.collectedUpi;
        if (rcpt.calendarGiven && dispatch.calendarsSold > 0) {
          dispatch.calendarsSold -= 1;
        }
        dispatch.cashDue = Math.max(0, dispatch.cashCollection - (dispatch.approvedExpenses || 0) - (dispatch.cashHandedOver || 0));
        this.save('dispatches', this.dispatches);
      }
    }

    return true;
  }

  updateReceiptWhatsAppStatus(
    idOrNo: string,
    status: NonNullable<Receipt['whatsappStatus']>,
    messageId?: string,
    error?: string
  ): Receipt | undefined {
    const rcpt = this.getReceiptById(idOrNo);
    if (!rcpt) return undefined;

    rcpt.whatsappStatus = status;
    if (messageId) rcpt.whatsappMessageId = messageId;
    rcpt.whatsappSentAt = new Date().toISOString();
    if (error) rcpt.whatsappError = error;

    this.save('receipts', this.receipts);
    return rcpt;
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

  // --- Public Media & Showcase Settings (YouTube & Instagram) ---
  getPublicMediaSettings(): PublicMediaSettings {
    return { ...this.publicMediaSettings };
  }

  updatePublicMediaSettings(updates: Partial<PublicMediaSettings>): PublicMediaSettings {
    this.publicMediaSettings = { ...this.publicMediaSettings, ...updates };
    this.save('public_media_settings', this.publicMediaSettings);
    return this.publicMediaSettings;
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
