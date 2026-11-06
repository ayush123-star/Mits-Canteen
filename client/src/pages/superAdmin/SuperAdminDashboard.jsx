import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  Star
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { canteens, users, orders, ownerInvitations, auditLogs } = useData();

  const studentsCount = users.filter((u) => u.role === 'student').length;
  const ownersCount = users.filter((u) => u.role === 'canteen_admin').length;
  const pendingInvites = ownerInvitations.filter((i) => i.status === 'PENDING').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  const activeCanteensCount = canteens.filter((c) => c.isOpen).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              University Canteen Operations Directorate
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Campus-wide overview of all canteen branches, dining traffic, owner invitations, and compliance audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/super-admin/owners"
            className="px-4 py-2.5 rounded-2xl bg-[#1C263A] hover:bg-[#151C30] border border-purple-500/20 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-4 h-4 text-purple-400" />
            Invite Canteen Owner
          </Link>
          <Link
            to="/super-admin/business"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Multi-Branch Reports
          </Link>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Campus Canteens</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-white">{canteens.length}</span>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">
                {activeCanteensCount} Operational Now
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Registered Students</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-white">{studentsCount + 1240}</span>
              <p className="text-[10px] text-[#AAB3C5] mt-1">Zero-queue ID active</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C263A]/90 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Pending Owner Invites</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-amber-400">{pendingInvites}</span>
              <p className="text-[10px] text-amber-400 font-bold mt-1">24-hr deadline active</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#7955E8]/30 via-[#526DFF]/20 to-[#1C263A] text-white p-5 rounded-3xl shadow-xl border border-purple-500/30 backdrop-blur-xl">
          <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Campus Daily GMV</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-white">₹{totalRevenue}</span>
              <p className="text-[10px] text-[#AAB3C5] mt-1">{orders.length} orders today</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Canteen Health & Operations Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Campus Canteen Branches & Live Status
          </h2>
          <span className="text-xs text-[#AAB3C5]">{canteens.length} Locations Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {canteens.map((canteen) => (
            <div
              key={canteen.id}
              className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl hover:border-purple-500/40 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                      {canteen.code}
                    </span>
                    <h3 className="font-black text-sm text-white mt-0.5">{canteen.name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      canteen.isOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {canteen.isOpen ? 'Operational' : 'Closed'}
                  </span>
                </div>

                <p className="text-[11px] text-[#AAB3C5] flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  {canteen.location}
                </p>

                {/* Operating Info */}
                <div className="mt-4 p-3 rounded-2xl bg-[#151C30] border border-purple-500/20 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#AAB3C5]">Manager:</span>
                    <span className="font-bold text-white">{canteen.managerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB3C5]">Active Counters:</span>
                    <span className="font-bold text-white">{canteen.activeCounters} Stations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB3C5]">Today Orders:</span>
                    <span className="font-mono font-bold text-purple-400">{canteen.todayOrdersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAB3C5]">Today Sales:</span>
                    <span className="font-mono font-bold text-white">₹{canteen.todayRevenue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-500/10 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {canteen.rating} ({canteen.reviewCount} reviews)
                </span>
                <span className="text-[11px] text-[#AAB3C5] font-mono">
                  {canteen.openingTime} - {canteen.closingTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent System Audit Trail Snapshot */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-extrabold text-white">Recent Campus System Audit Events</h2>
          </div>

          <Link
            to="/super-admin/audit-logs"
            className="text-xs font-black text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            View Full Audit Trail
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-purple-500/10 text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-md bg-[#151C30] border border-purple-500/20 text-[#AAB3C5] font-mono text-[10px] font-bold">
                  {log.module}
                </span>
                <span className="font-extrabold text-white">{log.action}</span>
                <span className="text-[#AAB3C5] truncate max-w-md">{log.details}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#AAB3C5] shrink-0 font-mono">
                <span>By {log.actor}</span>
                <span>•</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
