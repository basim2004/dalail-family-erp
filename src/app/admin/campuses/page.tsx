'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/dbService';
import { Campus } from '@/lib/types';
import {
  Building2,
  PlusCircle,
  MapPin,
  Phone,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Edit2,
  Eye,
} from 'lucide-react';

export default function CampusesPage() {
  const [campuses, setCampuses] = useState<Campus[]>(db.getCampuses());
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [institutionName, setInstitutionName] = useState('Dalailul Khairath Islamic Foundation (Regd.)');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Malappuram');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('679585');
  const [contact, setContact] = useState('+91 7034149149');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filtered = campuses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCampus(null);
    setName('');
    setCode('');
    setLocation('');
    setAddress('');
    setDistrict('Malappuram');
    setState('Kerala');
    setPincode('679585');
    setContact('+91 7034149149');
    setStatus('Active');
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Campus) => {
    setEditingCampus(c);
    setName(c.name);
    setCode(c.code);
    setInstitutionName(c.institutionName);
    setLocation(c.location);
    setAddress(c.address);
    setDistrict(c.district);
    setState(c.state);
    setPincode(c.pincode);
    setContact(c.contact);
    setStatus(c.status);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingCampus) {
      db.updateCampus(editingCampus.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        institutionName: institutionName.trim(),
        location: location.trim(),
        address: address.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        contact: contact.trim(),
        status,
      });
    } else {
      db.addCampus({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        institutionName: institutionName.trim(),
        location: location.trim(),
        address: address.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        contact: contact.trim(),
        status,
      });
    }

    setCampuses(db.getCampuses());
    setShowAddModal(false);
  };

  const toggleStatus = (id: string, currentStatus: 'Active' | 'Inactive') => {
    db.updateCampus(id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
    setCampuses(db.getCampuses());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-dalail-primary" />
            Campus Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Initial Campus: <strong>Kakkidippuram Campus</strong>. Manage campuses, assigned administrators, and member allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campuses..."
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-dalail-primary shadow-subtle"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Campus
          </button>
        </div>
      </div>

      {/* Campus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((campus) => (
          <div
            key={campus.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[10px] text-dalail-primary bg-blue-50 px-2 py-0.5 rounded">
                    {campus.code}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-1">{campus.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{campus.institutionName}</p>
                </div>
                <button
                  onClick={() => toggleStatus(campus.id, campus.status)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    campus.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                  title="Click to toggle status"
                >
                  {campus.status === 'Active' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {campus.status}
                </button>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{campus.address}</span>
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{campus.contact}</span>
                </p>
                {campus.campusAdminName && (
                  <p className="text-[11px] text-dalail-primary font-semibold pt-1">
                    Campus Admin: {campus.campusAdminName}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                href={`/admin/members?campus=${campus.id}`}
                className="font-bold text-dalail-primary hover:underline flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{campus.membersCount} Members</span>
              </Link>

              <button
                onClick={() => handleOpenEdit(campus)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                title="Edit Campus"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Campus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingCampus ? 'Edit Campus Details' : 'Add New Campus Branch'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kakkidippuram Campus"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. KAK01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-dalail-primary font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kakkidippuram"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Malappuram"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Postal Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, P.O. Alamkode, Malappuram"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
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
                  Save Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
