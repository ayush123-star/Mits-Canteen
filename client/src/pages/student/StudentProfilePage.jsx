import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  Building,
  Award,
  Heart,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Save,
  UtensilsCrossed,
  Star,
  ChevronRight
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, logout } = useAuth();
  const { orders } = useData();

  const [phone, setPhone] = useState(user?.phone || '+91 90395 67623');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter orders strictly for the logged-in user
  const studentOrders = Array.isArray(orders)
    ? orders.filter(
        (o) =>
          o.studentId === user?.id ||
          o.studentEmail === user?.email ||
          o.studentId === user?.studentId
      )
    : [];

  const handleSave = (e) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, phone };
      try {
        localStorage.setItem('smart_canteen_active_user', JSON.stringify(updatedUser));
      } catch (_) {}
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const userRole = (user?.role || user?.userType || 'Student').replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn text-white">
      
      {/* 1. Header Banner */}
      <div className="bg-[#141A29] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-purple-500/25">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          {/* Avatar: Google profile image or stylish initial avatar */}
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-md ring-2 ring-purple-500/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7955E8] to-[#526DFF] border-2 border-purple-400 shadow-md flex items-center justify-center text-2xl font-black text-white ${
                user?.avatar ? 'hidden' : 'flex'
              }`}
            >
              {userInitial}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name || 'MITS Campus Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-sm">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 justify-center sm:justify-start">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>{user?.department || 'MITS Campus'}</span>
              <span>&bull;</span>
              <span className="font-mono text-purple-300">
                {user?.studentId || user?.email?.split('@')[0]?.toUpperCase() || 'STUDENT'}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Canteen Activity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141A29] p-5 rounded-2xl border border-purple-500/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-white">{studentOrders.length}</p>
          </div>
        </div>

        <div className="bg-[#141A29] p-5 rounded-2xl border border-purple-500/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Campus Foodie Rank</p>
            <p className="text-xl font-black text-white">
              {studentOrders.length >= 10
                ? 'Gold Tier ⭐'
                : studentOrders.length >= 3
                ? 'Silver Tier ✨'
                : 'Bronze Tier 🥉'}
            </p>
          </div>
        </div>

        <div className="bg-[#141A29] p-5 rounded-2xl border border-purple-500/20 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Queues Skipped</p>
            <p className="text-2xl font-black text-white">
              {Math.max(studentOrders.length * 12, 15)} mins
            </p>
          </div>
        </div>
      </div>

      {/* 3. Personal Profile & Contact Details (Clean Single-Card Layout) */}
      <div className="bg-[#141A29] rounded-3xl border border-purple-500/25 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <span>Personal Profile & Contact Details</span>
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Account
          </span>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Contact details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || 'MITS Campus Member'}
                className="w-full px-4 py-3 rounded-xl bg-[#0E1320] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@mitsgwl.ac.in'}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0E1320] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Enrollment / Roll No.
              </label>
              <input
                type="text"
                disabled
                value={user?.studentId || user?.email?.split('@')[0]?.toUpperCase() || 'STUDENT'}
                className="w-full px-4 py-3 rounded-xl bg-[#0E1320] border border-purple-500/20 text-xs font-mono font-bold text-purple-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Department
              </label>
              <input
                type="text"
                disabled
                value={user?.department || 'General Campus'}
                className="w-full px-4 py-3 rounded-xl bg-[#0E1320] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">
              WhatsApp Phone Number (For pickup notifications & token alerts)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0E1320] border border-purple-500/30 text-xs font-semibold text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-4"
          >
            <span className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Contact Details
            </span>
          </button>
        </form>
      </div>

      {/* 4. Quick Account Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/my-orders"
          className="p-4 rounded-2xl bg-[#141A29] hover:bg-[#1A2337] border border-purple-500/20 text-white flex items-center justify-between transition-colors shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Order History & Token Passes</h4>
              <p className="text-[11px] text-slate-400">View past tokens and receipts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/feedback"
          className="p-4 rounded-2xl bg-[#141A29] hover:bg-[#1A2337] border border-purple-500/20 text-white flex items-center justify-between transition-colors shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Rate Dishes & Share Feedback</h4>
              <p className="text-[11px] text-slate-400">Give suggestions to canteen manager</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};

export default StudentProfilePage;
