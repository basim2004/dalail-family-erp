'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { Member } from '@/lib/types';
import { MemberIdCard } from '@/components/id-card/MemberIdCard';
import {
  Users,
  Search,
  PlusCircle,
  Building2,
  CreditCard,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Upload,
  Camera,
  Key,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Send,
  Smartphone,
} from 'lucide-react';

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>(db.getMembers());
  const campuses = db.getCampuses();
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [search, setSearch] = useState('');

  // Password & Security Audit State (Main Admin Only)
  const [showPasswordsMap, setShowPasswordsMap] = useState<Record<string, boolean>>({});
  const [revealAllPasswords, setRevealAllPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Quick Password Change & WhatsApp State
  const [quickPasswordMember, setQuickPasswordMember] = useState<Member | null>(null);
  const [quickNewPassword, setQuickNewPassword] = useState('');
  const [quickPasswordSuccess, setQuickPasswordSuccess] = useState<string | null>(null);
  const [whatsappSentMemberId, setWhatsappSentMemberId] = useState<string | null>(null);

  const handleOpenQuickPassword = (m: Member) => {
    setQuickPasswordMember(m);
    setQuickNewPassword(m.studentPassword || 'password123');
    setQuickPasswordSuccess(null);
  };

  const handleSaveQuickPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasswordMember || !quickNewPassword.trim()) return;

    db.updateMemberPassword(quickPasswordMember.id, quickNewPassword.trim());
    setMembers(db.getMembers());
    setQuickPasswordSuccess(`Password updated to "${quickNewPassword.trim()}"!`);
    setTimeout(() => {
      setQuickPasswordMember(null);
      setQuickPasswordSuccess(null);
    }, 1500);
  };

  const sendCredentialsWhatsApp = (m: Member) => {
    const u = m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const p = m.studentPassword || 'password123';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text = `*DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)*\n_Official Member Portal Credentials_\n\nAssalamu Alaikum,\nHere are your login credentials for Dalail Family ERP:\n\n👤 *Member Name:* ${m.name}\n🆔 *Member ID:* ${m.memberId}\n🏛️ *Campus:* ${m.campusName}\n🌐 *Portal Login:* ${origin}/login\n\n🔑 *Username:* ${u}\n🔒 *Password:* ${p}\n\nPlease keep your credentials confidential.\nOfficial Sender: +91 70341 49149\nEmail: kakkidippuramdkif@gmail.com`;

    const phoneDigits = (m.phone || '').replace(/[^0-9]/g, '');
    const waUrl =
      phoneDigits.length >= 10
        ? `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(text)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
    setWhatsappSentMemberId(m.id);
    setTimeout(() => setWhatsappSentMemberId(null), 3000);
  };

  // Modals
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [place, setPlace] = useState('');
  const [pincode, setPincode] = useState('679580');
  const [campusId, setCampusId] = useState(campuses[0]?.id || 'campus_kak');
  const [photoUrl, setPhotoUrl] = useState('/assets/member_photo_1.jpg');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [showModalPassword, setShowModalPassword] = useState(false);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = members.filter((m) => {
    if (selectedCampus !== 'all' && m.campusId !== selectedCampus) return false;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.place.toLowerCase().includes(q) ||
      m.postOffice.toLowerCase().includes(q) ||
      m.addressLine1.toLowerCase().includes(q)
    );
  });

  const handleToggleFieldWork = (id: string, currentVal: boolean) => {
    db.toggleFieldWork(id, !currentVal);
    setMembers(db.getMembers());
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordsMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyCredentials = (m: Member) => {
    const u = m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const p = m.studentPassword || 'password123';
    const text = `Dalail Member Login Credentials\nMember: ${m.name} (${m.memberId})\nCampus: ${m.campusName}\nUsername: ${u}\nPassword: ${p}`;
    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setAddressLine1('');
    setAddressLine2('');
    setPostOffice('');
    setPlace('');
    setPincode('679580');
    setPhotoUrl('/assets/member_photo_1.jpg');
    setStudentUsername('');
    setStudentPassword('password123');
    setShowModalPassword(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: Member) => {
    setSelectedMemberForCard(null);
    setEditingMember(m);
    setName(m.name);
    setAddressLine1(m.addressLine1);
    setAddressLine2(m.addressLine2 || '');
    setPostOffice(m.postOffice);
    setPlace(m.place);
    setPincode(m.pincode);
    setCampusId(m.campusId);
    setPhotoUrl(m.photoUrl || '/assets/member_photo_1.jpg');
    setStudentUsername(m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    setStudentPassword(m.studentPassword || 'password123');
    setShowModalPassword(false);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !addressLine1.trim() || !place.trim()) return;

    const chosenCampus = campuses.find((c) => c.id === campusId);

    if (editingMember) {
      const updated = db.updateMember(editingMember.id, {
        name: name.trim().toUpperCase(),
        addressLine1: addressLine1.trim().toUpperCase(),
        addressLine2: addressLine2.trim() ? addressLine2.trim().toUpperCase() : undefined,
        postOffice: postOffice.trim().toUpperCase(),
        place: place.trim().toUpperCase(),
        pincode: pincode.trim(),
        campusId,
        campusName: chosenCampus?.name || 'Kakkidippuram Campus',
        photoUrl,
        studentUsername: studentUsername.trim().toLowerCase(),
        studentPassword: studentPassword.trim(),
      });

      if (updated && selectedMemberForCard && selectedMemberForCard.id === editingMember.id) {
        setSelectedMemberForCard(updated);
      }
    } else {
      const nextNum = members.length + 1;
      const created = db.addMember({
        memberId: `DKIF-REC-0${nextNum}`,
        name: name.trim().toUpperCase(),
        roleTitle: 'RECEIVER',
        addressLine1: addressLine1.trim().toUpperCase(),
        addressLine2: addressLine2.trim() ? addressLine2.trim().toUpperCase() : undefined,
        postOffice: postOffice.trim().toUpperCase(),
        place: place.trim().toUpperCase(),
        pincode: pincode.trim(),
        photoUrl,
        campusId,
        campusName: chosenCampus?.name || 'Kakkidippuram Campus',
        status: 'Active',
        fieldWorkEnabled: false,
        studentUsername: studentUsername.trim().toLowerCase() || `student_${Date.now()}`,
        studentPassword: studentPassword.trim() || 'password123',
      });
      if (created && selectedMemberForCard) {
        setSelectedMemberForCard(created);
      }
    }

    setMembers(db.getMembers());
    setShowAddModal(false);
  };

  const handleDelete = (id: string, memberName: string) => {
    if (confirm(`Are you sure you want to delete member ${memberName}?`)) {
      db.deleteMember(id);
      setMembers(db.getMembers());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-dalail-primary" />
            Members & ID Card Generator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authentic receiver profiles from the official ID cards PDF with exact card generation, download, and student portal credentials audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealAllPasswords(!revealAllPasswords)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              revealAllPasswords
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {revealAllPasswords ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{revealAllPasswords ? 'Mask Passwords' : 'Audit All Passwords'}</span>
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Credentials Table</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Total <strong className="text-slate-800">{filtered.length}</strong> official receivers
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member, place, house..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-dalail-primary"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Address Details (from ID Card)</th>
                <th className="py-3 px-4">Place & PIN</th>
                <th className="py-3 px-4">Campus</th>
                <th className="py-3 px-4">Portal Credentials (Admin)</th>
                <th className="py-3 px-4 text-center">Field Work</th>
                <th className="py-3 px-4 text-center">ID Card</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-9 h-11 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-black text-slate-900 block text-xs tracking-tight">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.memberId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                      {m.roleTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block uppercase">
                      {m.addressLine1}
                    </span>
                    {m.addressLine2 && (
                      <span className="text-[10px] text-slate-500 block uppercase">
                        {m.addressLine2}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 uppercase">{m.postOffice}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 uppercase block">{m.place}</span>
                    <span className="text-[10px] text-slate-400 font-mono">PIN {m.pincode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{m.campusName}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-bold">
                        <span className="text-slate-400">@</span>
                        <span>{m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold select-all">
                          {revealAllPasswords || showPasswordsMap[m.id]
                            ? m.studentPassword || 'password123'
                            : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(m.id)}
                          className="p-1 text-slate-400 hover:text-dalail-primary rounded transition-colors"
                          title={showPasswordsMap[m.id] ? 'Hide Password' : 'Show Password'}
                        >
                          {revealAllPasswords || showPasswordsMap[m.id] ? (
                            <EyeOff className="w-3.5 h-3.5 text-dalail-primary" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyCredentials(m)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          title="Copy Login Credentials"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickPassword(m)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="പാസ്‌വേഡ് മാറ്റുക (Change Password)"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => sendCredentialsWhatsApp(m)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          title="വാട്സ്ആപ്പ് വഴി അയക്കുക (Send Password via WhatsApp)"
                        >
                          {whatsappSentMemberId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleFieldWork(m.id, !!m.fieldWorkEnabled)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        m.fieldWorkEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      {m.fieldWorkEnabled ? 'Active' : 'Enable'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedMemberForCard(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dalail-primary text-white font-bold text-[11px] hover:bg-dalail-dark shadow-sm transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> View / Download ID
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Card Modal (Full Exact Replica with Download & Print) */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Official ID Card Preview
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedMemberForCard.name} • {selectedMemberForCard.roleTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberIdCard
              member={selectedMemberForCard}
              showActions={true}
              onEdit={handleOpenEdit}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal (Only fields shown on the uploaded ID card) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingMember ? 'Edit Member Information' : 'Add Member from ID Card'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name (Capitalized) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ATHNAN / BASIM ASLAM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Address Line 1 (House Name) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. KADMBADATH / POKKAT (H)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Address Line 2 (Locality / Landmark)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. AYYATHADATHIL AYIROOR"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Post Office *
                  </label>
                  <input
                    type="text"
                    required
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    placeholder="e.g. PO AYIROOR"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Place / Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. PUTHANPALLI / EDAYUR"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 679580"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Campus</label>
                  <select
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Member Photo Section (Upload or Select) */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-dalail-primary" />
                    <span>Member ID Photo *</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Custom upload or preset</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Current Active Photo Preview */}
                  <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-dalail-primary bg-white shadow-xs shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl || '/assets/member_photo_1.jpg'}
                      alt="Active Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* File Upload Button */}
                    <label
                      htmlFor="admin-photo-upload"
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-dalail-primary border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Photo (Camera / File)</span>
                    </label>
                    <input
                      id="admin-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP. Instant card preview.
                    </p>
                  </div>
                </div>

                {/* Preset Authentic Member Portraits */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Or select authentic member portrait:
                  </span>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                      const url = `/assets/member_photo_${num}.jpg`;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPhotoUrl(url)}
                          className={`rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                            photoUrl === url
                              ? 'border-dalail-primary ring-2 ring-blue-300 scale-105'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          title={`Select Portrait ${num}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Photo ${num}`}
                            className="w-full h-11 object-cover rounded-lg"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Student Portal Login Credentials (Admin & Campus Admin Managed) */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-dalail-primary" />
                    <span>Student Portal Login Credentials</span>
                  </label>
                  <span className="text-[10px] font-bold text-dalail-primary bg-blue-100/60 px-2 py-0.5 rounded-full">
                    Audited by Main Admin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Username *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. athnan"
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dalail-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Portal Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="password123"
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-dalail-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showModalPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-dalail-primary text-white font-bold hover:bg-dalail-dark shadow-sm"
                >
                  Save Member & ID Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Member Credentials Security Audit Modal (Main Admin Exclusive) */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 my-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Member Portal Credentials Security Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Central ERP master vault: Saved usernames and passwords across all campuses.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Total Accounts:</span>
                <span className="bg-white border px-2 py-0.5 rounded-full font-bold text-slate-900 font-mono">
                  {members.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevealAllPasswords(!revealAllPasswords)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  {revealAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealAllPasswords ? 'Hide All Passwords' : 'Reveal All Passwords'}</span>
                </button>
                <button
                  onClick={() => {
                    const text = members
                      .map(
                        (m) =>
                          `${m.memberId}\t${m.name}\t${m.campusName}\t${m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}\t${m.studentPassword || 'password123'}`
                      )
                      .join('\n');
                    navigator.clipboard.writeText(`ID\tName\tCampus\tUsername\tPassword\n${text}`);
                    alert('All credentials copied to clipboard in tab-separated format!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-dalail-primary text-white font-bold hover:bg-dalail-dark flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Credentials</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[60vh] border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Member ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Password</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {members.map((m) => {
                    const u = m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const p = m.studentPassword || 'password123';
                    const isRevealed = revealAllPasswords || showPasswordsMap[m.id];
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                          {m.memberId}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.campusName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-dalail-primary">
                          @{u}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
                            {isRevealed ? p : '••••••••'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(m.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                              title="Toggle Visibility"
                            >
                              {isRevealed ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyCredentials(m)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                              title="Copy Credentials"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickPassword(m)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded"
                              title="പാസ്‌വേഡ് മാറ്റുക (Change Password)"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => sendCredentialsWhatsApp(m)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                              title="വാട്സ്ആപ്പ് വഴി അയക്കുക (Send Password via WhatsApp)"
                            >
                              {whatsappSentMemberId === m.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Change Password Modal */}
      {quickPasswordMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Change Member Password</h3>
                  <p className="text-[10px] text-slate-400">പാസ്‌വേഡ് മാറ്റുക</p>
                </div>
              </div>
              <button
                onClick={() => setQuickPasswordMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPassword} className="space-y-3 pt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Member Details:
                </span>
                <p className="font-bold text-slate-900">{quickPasswordMember.name}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  ID: {quickPasswordMember.memberId} | @{quickPasswordMember.studentUsername || quickPasswordMember.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password (പുതിയ പാസ്‌വേഡ്) *
                </label>
                <input
                  type="text"
                  required
                  value={quickNewPassword}
                  onChange={(e) => setQuickNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-dalail-primary"
                />
              </div>

              {quickPasswordSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold">
                  {quickPasswordSuccess}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPasswordMember(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-dalail-primary hover:bg-dalail-dark text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

