import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  Building,
  Award,
  Heart,
  ShoppingBag,
  Bell,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Save,
  QrCode
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, logout } = useAuth();
  const { orders } = useData();

  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [dietPref, setDietPref] = useState('Vegetarian');
  const [spicePref, setSpicePref] = useState('Medium');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const studentOrders = orders.filter((o) => o.studentId === user?.id || true);
  const totalSpent = studentOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-white">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-purple-500/25">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <img
            src={user?.avatar || '/assets/developer/ayush-pandey.jpg'}
            alt={user?.name || 'Ayush Pandey'}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-purple-500/60 shadow-lg shadow-purple-500/30"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'; }}
          />
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name || 'Ayush Pandey'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-sm">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-[#AAB3C5] mt-1 flex items-center gap-2 justify-center sm:justify-start">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>{user?.department || 'Electronics and Telecommunication'}</span>
              <span>•</span>
              <span className="font-mono text-purple-300">{user?.studentId || 'BTET25O1039'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* 2. Three Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#151C30] border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#AAB3C5] font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-white">{studentOrders.length}</p>
          </div>
        </div>

        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#151C30] border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#AAB3C5] font-bold uppercase tracking-wider">Campus Foodie Rank</p>
            <p className="text-2xl font-black text-white">Gold Tier ⭐</p>
          </div>
        </div>

        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#151C30] border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#AAB3C5] font-bold uppercase tracking-wider">Queues Skipped</p>
            <p className="text-2xl font-black text-white">{studentOrders.length * 15} mins</p>
          </div>
        </div>
      </div>

      {/* 3. Profile Information & Digital Pass */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="md:col-span-7 bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Student Profile Details
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full">
              Verified Student
            </span>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Profile preferences updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || 'Ayush Pandey'}
                className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                  Enrollment / Roll No.
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.studentId || 'BTET25O1039'}
                  className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-mono font-bold text-purple-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                  Department
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.department || 'Electronics and Telecommunication'}
                  className="w-full px-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || '25et1ay39@mitsgwl.ac.in'}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                WhatsApp Phone Number (For pickup notifications)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-semibold text-white focus:outline-none focus:border-[#7955E8]"
                />
              </div>
            </div>

            {/* Food Preferences */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                  Dietary Choice
                </label>
                <select
                  value={dietPref}
                  onChange={(e) => setDietPref(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
                >
                  <option value="Vegetarian">Pure Vegetarian (100% Veg)</option>
                  <option value="Jain">Jain (No Onion & Garlic)</option>
                  <option value="Vegan">Vegan (Plant-Based)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#AAB3C5] block mb-1 uppercase tracking-wider">
                  Spice Tolerance
                </label>
                <select
                  value={spicePref}
                  onChange={(e) => setSpicePref(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
                >
                  <option value="Mild">Mild / Low Spice</option>
                  <option value="Medium">Medium</option>
                  <option value="Spicy">Spicy & Hot 🔥</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-extrabold text-xs shadow-md shadow-purple-500/30 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Save className="w-4 h-4" />
              Save Student Preferences
            </button>
          </form>
        </div>

        {/* Digital Student RFID / QR Card */}
        <div className="md:col-span-5 bg-[#151C30] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-500/30 text-center">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
              SMART CAMPUS IDENTITY
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
            <QRCodeSVG
              value={`STUDENT:${user?.studentId || 'BTET25O1039'}:${user?.name || 'Ayush Pandey'}`}
              size={150}
              level="M"
            />
          </div>

          <div>
            <h3 className="text-base font-black text-white">{user?.name || 'Ayush Pandey'}</h3>
            <p className="text-xs text-purple-300 font-mono mt-0.5">{user?.studentId || 'BTET25O1039'}</p>
            <p className="text-[11px] text-[#AAB3C5] mt-1">{user?.department || 'Electronics and Telecommunication'}</p>
          </div>

          <div className="p-3 bg-[#0B1020] rounded-2xl border border-purple-500/20 text-xs text-[#AAB3C5] text-left space-y-1">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold">Active & Good Standing</span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp Dispatch:</span>
              <span className="text-white font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
