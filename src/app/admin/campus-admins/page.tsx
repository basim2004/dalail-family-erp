'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db/dbService';
import { User } from '@/lib/types';
import {
  UserCheck,
  PlusCircle,
  Building2,
  CheckCircle2,
  XCircle,
  X,
  Edit2,
  Phone,
  Mail,
} from 'lucide-react';

export default function CampusAdminsPage() {
  const [users, setUsers] = useState<User[]>(
    db.getUsers().filter((u) => u.role === 'campus_admin')
  );
  const campuses = db.getCampuses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [campusId, setCampusId] = useState(campuses[0]?.id || 'campus_kak');
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPhone('+91 7034149149');
    setCampusId(campuses[0]?.id || 'campus_kak');
    setActive(true);
    setShowAddModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setPhone(u.phone);
    setCampusId(u.campusId || campuses[0]?.id || 'campus_kak');
    setActive(u.active);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const chosenCampus = campuses.find((c) => c.id === campusId);

    if (editingUser) {
      db.updateUser(editingUser.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        campusId,
        campusName: chosenCampus?.name || 'Kakkidippuram Campus',
        active,
      });
    } else {
      db.addCampusAdmin({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim() || `${username.trim().toLowerCase()}@dalail.org`,
        phone: phone.trim(),
        campusId,
        campusName: chosenCampus?.name || 'Kakkidippuram Campus',
        active,
      });
    }

    setUsers(db.getUsers().filter((u) => u.role === 'campus_admin'));
    setShowAddModal(false);
  };

  const toggleStatus = (id: string, current: boolean) => {
    db.updateUser(id, { active: !current });
    setUsers(db.getUsers().filter((u) => u.role === 'campus_admin'));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-dalail-primary" />
            Campus Admin Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, assign campuses, and manage login status for designated campus administrators.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-dalail-primary hover:bg-dalail-dark text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Campus Admin
        </button>
      </div>

      {/* Campus Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Username & Email</th>
                <th className="py-3 px-4">Assigned Campus</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Account Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-dalail-primary block">@{u.username}</span>
                    <span className="text-[10px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{u.campusName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.phone}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleStatus(u.id, u.active)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${u.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                        }`}
                      title="Click to toggle active status"
                    >
                      {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                {editingUser ? 'Edit Campus Admin' : 'Create Campus Admin Account'}
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
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Usthad Abdul Rasheed Baqavi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. kakkidippuram"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 7034149149"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kakkidippuramdlf@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Campus *</label>
                <select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
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
                  Save Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

