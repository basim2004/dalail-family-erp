'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { Member } from '@/lib/types';
import { MemberIdCard } from '@/components/id-card/MemberIdCard';
import {
  Users,
  Search,
  CreditCard,
  Building2,
  X,
  PlusCircle,
  Edit2,
  CheckCircle2,
  FolderOpen,
  Check,
  Shield,
  Upload,
  Camera,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function CampusAdminMembersPage() {
  const campusId = 'campus_kak';
  const campus = db.getCampusById(campusId);
  const [members, setMembers] = useState<Member[]>(db.getMembers(campusId));
  const [search, setSearch] = useState('');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [place, setPlace] = useState('');
  const [pincode, setPincode] = useState('679580');
  const [photoUrl, setPhotoUrl] = useState('/assets/member_photo_1.jpg');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) {
        const found = members.find((m) => m.id === editId);
        if (found) {
          handleOpenEdit(found);
        }
      }
    }
  }, [members]);

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
    setMembers(db.getMembers(campusId));
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
    setShowModal(true);
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
    setPhotoUrl(m.photoUrl || '/assets/member_photo_1.jpg');
    setStudentUsername(m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    setStudentPassword(m.studentPassword || 'password123');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !addressLine1.trim() || !place.trim()) return;

    if (editingMember) {
      const updated = db.updateMember(editingMember.id, {
        name: name.trim().toUpperCase(),
        addressLine1: addressLine1.trim().toUpperCase(),
        addressLine2: addressLine2.trim() ? addressLine2.trim().toUpperCase() : undefined,
        postOffice: postOffice.trim().toUpperCase(),
        place: place.trim().toUpperCase(),
        pincode: pincode.trim(),
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
        campusName: campus?.name || 'Kakkidippuram Campus',
        status: 'Active',
        fieldWorkEnabled: false,
        studentUsername: studentUsername.trim().toLowerCase() || `student_${Date.now()}`,
        studentPassword: studentPassword.trim() || 'password123',
      });

      if (created && selectedMemberForCard) {
        setSelectedMemberForCard(created);
      }
    }

    setMembers(db.getMembers(campusId));
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-dalail-primary" />
            Campus Members & ID Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized receiver members assigned to {campus?.name || 'Kakkidippuram Campus'}.
            Campus Admins can enable or disable field work permissions for each member.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Campus Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-subtle flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search member by name, house name, place, or post office..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-semibold focus:outline-none bg-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 mr-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {m.memberId}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      {m.status}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm mt-0.5 truncate tracking-wide">
                    {m.name}
                  </h3>
                  <p className="text-[11px] font-bold text-dalail-primary">
                    {m.roleTitle}
                  </p>
                </div>
              </div>

              {/* Exact Address Fields From ID Card */}
              <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <p className="font-semibold text-slate-800 truncate">
                  {m.addressLine1}
                </p>
                {m.addressLine2 && (
                  <p className="text-slate-600 truncate">{m.addressLine2}</p>
                )}
                <p className="text-slate-600 truncate">
                  {m.postOffice}, {m.place}
                </p>
                <p className="font-mono text-slate-500 font-bold">
                  PIN: {m.pincode}
                </p>
              </div>

              {/* Portal Login Credentials Security Tag */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 font-mono text-slate-600">
                  <span className="text-slate-400">Portal:</span>
                  <span className="font-bold text-slate-800">@{m.studentUsername || m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-medium" title="Saved securely. Auditable only by Main Admin in Central ERP">
                  •••••••• (Main Admin Secured)
                </span>
              </div>

              {/* Field Work Permission Switch (Section 6.5) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Field Work
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      m.fieldWorkEnabled ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {m.fieldWorkEnabled ? 'Active (Assigned)' : 'Not Enabled'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFieldWork(m.id, !!m.fieldWorkEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    m.fieldWorkEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                  title="Toggle Field Work Selection"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{m.fieldWorkEnabled ? 'Enabled' : 'Enable Field Work'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEdit(m)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-dalail-primary hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>

              <button
                onClick={() => setSelectedMemberForCard(m)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white font-bold text-xs shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" /> ID Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ID Card Generator Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-auto">
            <button
              onClick={() => setSelectedMemberForCard(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dalail-primary bg-blue-50 px-2 py-0.5 rounded-full">
                ID Card Preview & Download
              </span>
              <h3 className="font-black text-lg text-slate-900 mt-1">
                {selectedMemberForCard.name} ({selectedMemberForCard.roleTitle})
              </h3>
              <p className="text-xs text-slate-400">
                Official layout copy with authentic signature, seal stamp, and logo.
              </p>
            </div>

            <div className="flex justify-center my-4 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <MemberIdCard
                member={selectedMemberForCard}
                onEdit={handleOpenEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingMember ? 'Edit Campus Member' : 'Add New Campus Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (Capital letters as on ID card) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ATHNAN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    House Name / Address 1 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KADMBADATH"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address 2 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AYYATHADATHIL AYIROOR"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Post Office *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO AYIROOR"
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Place / Village *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PUTHANPALLI"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="679580"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono"
                  />
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
                      htmlFor="campus-photo-upload"
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-dalail-primary border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Photo (Camera / File)</span>
                    </label>
                    <input
                      id="campus-photo-upload"
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

              {/* Member Login Credentials (Set by Campus Admin, Audited by Main Admin) */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#164A9B]" />
                    <span>Student Portal Login Credentials</span>
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Audited by Main Admin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. athnan"
                      value={studentUsername}
                      onChange={(e) => setStudentUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-bold text-[#164A9B] hover:underline flex items-center gap-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="password123"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Campus Admin can set credentials here. Login credentials can be reviewed and managed by the Main Admin.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-dalail-primary hover:bg-dalail-dark rounded-xl shadow-sm"
                >
                  {editingMember ? 'Update Member' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
