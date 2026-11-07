import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Mail,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Search,
  Power,
  X,
  Sparkles,
  Phone,
  AlertTriangle
} from 'lucide-react';

export const OwnerManagementPage = () => {
  const { user } = useAuth();
  const {
    users,
    canteens,
    ownerInvitations,
    createOwnerManually,
    sendOwnerInvitation,
    resendInvitation,
    revokeInvitation,
    toggleOwnerStatus,
  } = useData();

  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'INVITES'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Manual Owner Form
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    password: 'temp_' + Math.random().toString(36).substring(2, 8),
    canteenId: canteens[0]?.id || 'canteen-1',
    phone: '',
    staffId: 'STAFF-MGR-' + Math.floor(10 + Math.random() * 90),
  });

  // Invite Form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    canteenName: canteens[0]?.name || 'Main Campus Food Court',
    role: 'canteen_admin',
  });

  // Live timer for 24h invitations countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const ownersList = users.filter((u) => u.role === 'canteen_admin');

  const filteredOwners = ownersList.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.canteenName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const canteen = canteens.find((c) => c.id === manualForm.canteenId);
    createOwnerManually(
      {
        ...manualForm,
        canteenName: canteen?.name || 'Campus Food Court',
      },
      user?.name || 'Super Admin'
    );
    alert(`Account created! Temporary password is: ${manualForm.password}. Owner will be prompted to change password on first login.`);
    setIsManualModalOpen(false);
    setManualForm({
      name: '',
      email: '',
      password: 'temp_' + Math.random().toString(36).substring(2, 8),
      canteenId: canteens[0]?.id || 'canteen-1',
      phone: '',
      staffId: 'STAFF-MGR-' + Math.floor(10 + Math.random() * 90),
    });
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    sendOwnerInvitation(inviteForm.email, inviteForm.canteenName, user?.name || 'Super Admin');
    alert(`24-hour onboarding invitation dispatched to ${inviteForm.email}!`);
    setIsInviteModalOpen(false);
    setInviteForm({
      email: '',
      canteenName: canteens[0]?.name || 'Main Campus Food Court',
      role: 'canteen_admin',
    });
  };

  // Helper for 24-hr countdown
  const formatCountdown = (expiresAt) => {
    const diffMs = expiresAt - now;
    if (diffMs <= 0) return 'EXPIRED';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Canteen Owner Governance & Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Authorize campus food court managers, monitor onboarding with 24-hour deadlines, and manage account access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#1C263A] border border-purple-500/20 hover:bg-[#151C30] text-[#AAB3C5] hover:text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4 text-purple-400" />
            Send 24h Invitation
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Create Owner Account
          </button>
        </div>
      </div>

      {/* 2. Privacy Guarantee Banner */}
      <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-3 backdrop-blur-xl">
        <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0" />
        <p>
          <strong className="font-extrabold text-white">Privacy Safeguard Active:</strong> Super Admin has operational authority over business performance and menus. Personal messages, private bank credentials, personal files, and passwords of canteen owners are encrypted and strictly prohibited from view.
        </p>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-purple-500/20 pb-3">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30'
              : 'bg-[#1C263A] text-[#AAB3C5] hover:text-white border border-purple-500/20'
          }`}
        >
          Active Canteen Owners ({ownersList.length})
        </button>

        <button
          onClick={() => setActiveTab('INVITES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'INVITES'
              ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30'
              : 'bg-[#1C263A] text-[#AAB3C5] hover:text-white border border-purple-500/20'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending 24h Invitations ({ownerInvitations.length})
        </button>
      </div>

      {/* 4. ACTIVE OWNERS TABLE */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          <div className="bg-[#1C263A]/90 backdrop-blur-xl p-3.5 rounded-3xl border border-purple-500/20 shadow-lg flex items-center gap-2">
            <Search className="w-4 h-4 text-[#AAB3C5] ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search canteen owners by name, email or branch..."
              className="w-full bg-transparent text-xs font-semibold text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
                  <tr>
                    <th className="py-4 px-5">Owner</th>
                    <th className="py-4 px-4">Assigned Canteen</th>
                    <th className="py-4 px-4">Staff ID</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">First-Login Setup</th>
                    <th className="py-4 px-5 text-right">Access Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 font-medium">
                  {filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-[#151C30]/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={owner.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'}
                            alt={owner.name}
                            className="w-10 h-10 rounded-2xl object-cover bg-[#151C30] border border-purple-500/20 shrink-0"
                          />
                          <div>
                            <h4 className="font-black text-white">{owner.name}</h4>
                            <p className="text-[11px] text-[#AAB3C5]">{owner.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-200">
                        {owner.canteenName || 'Campus Main Canteen'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#AAB3C5]">
                        {owner.staffId || 'STAFF-01'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#AAB3C5]">
                        {owner.phone || '+91 98112 23344'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            owner.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {owner.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {owner.requiresPasswordChange ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                            Password Change Pending
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Completed ✓
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => toggleOwnerStatus(owner.id, user?.name || 'Super Admin')}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                            owner.isActive
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {owner.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PENDING 24-HOUR INVITATIONS TABLE */}
      {activeTab === 'INVITES' && (
        <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
          <div className="p-4 bg-[#151C30]/80 border-b border-purple-500/20 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">
              Invitations expire automatically in 24 hours from dispatch
            </span>
            <span className="text-xs text-[#AAB3C5]">Total: {ownerInvitations.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
                <tr>
                  <th className="py-4 px-5">Invited Email</th>
                  <th className="py-4 px-4">Assigned Canteen</th>
                  <th className="py-4 px-4">Sent At</th>
                  <th className="py-4 px-4">24h Deadline Countdown</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 font-medium">
                {ownerInvitations.map((inv) => {
                  const isExpired = Date.now() > inv.expiresAt;
                  const countdownText = formatCountdown(inv.expiresAt);

                  return (
                    <tr key={inv.id} className="hover:bg-[#151C30]/60 transition-colors">
                      <td className="py-3.5 px-5 font-black text-white">
                        {inv.email}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {inv.canteenName}
                      </td>

                      <td className="py-3.5 px-4 text-[#AAB3C5] font-mono text-[11px]">
                        {inv.sentAt}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isExpired
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-black'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {countdownText}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inv.status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isExpired
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : inv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => resendInvitation(inv.id, user?.name || 'Super Admin')}
                            className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1 transition-colors"
                            title="Resend invitation and reset 24-hour timer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Resend (Reset 24h)
                          </button>
                          <button
                            onClick={() => revokeInvitation(inv.id, user?.name || 'Super Admin')}
                            className="px-2.5 py-1 rounded-xl text-[#AAB3C5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Revoke Invitation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CREATE OWNER MANUALLY MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Manually Provision Canteen Owner
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Manager Full Name
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="e.g. Suresh Patel"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Manager Email
                </label>
                <input
                  type="email"
                  required
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  placeholder="owner@campus.edu"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Assigned Canteen Branch
                </label>
                <select
                  value={manualForm.canteenId}
                  onChange={(e) => setManualForm({ ...manualForm, canteenId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8]"
                >
                  {canteens.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#151C30] text-white">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.password}
                    onChange={(e) => setManualForm({ ...manualForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-mono font-bold text-purple-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={manualForm.staffId}
                    onChange={(e) => setManualForm({ ...manualForm, staffId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-mono font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Manager Mobile Phone
                </label>
                <input
                  type="text"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="+91 98112 23344"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                🔒 <strong>First-Login Enforcement:</strong> This owner will be immediately locked and forced to choose a confidential private password upon their initial login.
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-lg shadow-purple-500/30 transition-all"
                >
                  Create & Issue Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SEND 24-HR INVITATION MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-500/20 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Dispatch 24-Hour Onboarding Invite
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="newmanager@campus.edu"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                  Assign Canteen Food Court
                </label>
                <select
                  value={inviteForm.canteenName}
                  onChange={(e) => setInviteForm({ ...inviteForm, canteenName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8]"
                >
                  {canteens.map((c) => (
                    <option key={c.id} value={c.name} className="bg-[#151C30] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  24-Hour Strict Security Window
                </div>
                <p>
                  The invited manager must complete the registration link within 24 hours. Expired invitations can be re-triggered anytime from this console.
                </p>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#AAB3C5] hover:text-white hover:bg-[#151C30] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black shadow-lg shadow-purple-500/30 transition-all"
                >
                  Send Onboarding Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerManagementPage;
