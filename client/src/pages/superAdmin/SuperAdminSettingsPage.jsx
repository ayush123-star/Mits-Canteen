import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  ShieldCheck,
  Building,
  Lock,
  Power,
  Save,
  CheckCircle2,
  Clock,
  Smartphone,
  Banknote,
  AlertTriangle
} from 'lucide-react';

export const SuperAdminSettingsPage = () => {
  const { user } = useAuth();

  const [universityName, setUniversityName] = useState('Madhav Institute of Technology & Science, Gwalior (MITS)');
  const [academicYear, setAcademicYear] = useState('2026-2027 Academic Session');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowCashPayments, setAllowCashPayments] = useState(true);
  const [allowUpiPayments, setAllowUpiPayments] = useState(true);
  const [inviteTimeoutHours, setInviteTimeoutHours] = useState(24);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          University Global Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
          Institutional dining governance, onboarding security timeouts, and campus-wide payment policies.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Global configuration policies updated successfully!
        </div>
      )}

      {/* 2. Emergency Campus Maintenance Mode */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#AAB3C5]">
          Campus Emergency Kill-Switch
        </h2>

        <div
          onClick={() => setMaintenanceMode(!maintenanceMode)}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
            maintenanceMode
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-purple-500/20 bg-[#151C30]'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#AAB3C5]">
              Campus Maintenance Override
            </span>
            <h3 className="text-base font-black text-white">
              {maintenanceMode ? 'Maintenance Mode ACTIVE ⚠️' : 'Normal Campus Operations'}
            </h3>
            <p className="text-xs text-[#AAB3C5]">
              {maintenanceMode
                ? 'All food courts are forced offline. Students cannot place new orders.'
                : 'All canteens operate under their own independent open/closed status.'}
            </p>
          </div>

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
              maintenanceMode ? 'bg-red-600 shadow-red-500/30' : 'bg-[#1C263A] border border-purple-500/30 text-[#AAB3C5]'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Settings Form */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl p-6 space-y-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#AAB3C5]">
          Institution & Governance Policies
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
              University / College Full Name
            </label>
            <input
              type="text"
              required
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Active Academic Session
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8]"
              />
            </div>

            <div>
              <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block mb-1">
                Canteen Owner Onboarding Timeout
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="6"
                  max="72"
                  value={inviteTimeoutHours}
                  onChange={(e) => setInviteTimeoutHours(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/20 font-bold text-white focus:outline-none focus:border-[#7955E8] font-mono"
                />
                <span className="font-bold text-[#AAB3C5]">Hours</span>
              </div>
            </div>
          </div>

          {/* Payment Methods Policy */}
          <div className="pt-2 space-y-2">
            <label className="font-bold text-[#AAB3C5] uppercase tracking-wider block">
              Allowed Payment Methods on Campus
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-purple-500/20 bg-[#151C30] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowUpiPayments}
                  onChange={(e) => setAllowUpiPayments(e.target.checked)}
                  className="w-4 h-4 text-[#7955E8] rounded-sm bg-[#1C263A] border-purple-500/30 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold text-white block">UPI QR Payments</span>
                  <span className="text-[10px] text-[#AAB3C5]">GPay, PhonePe, Paytm</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-purple-500/20 bg-[#151C30] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCashPayments}
                  onChange={(e) => setAllowCashPayments(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded-sm bg-[#1C263A] border-purple-500/30 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-white block">Cash at Counter</span>
                  <span className="text-[10px] text-[#AAB3C5]">Physical paper currency</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-500/20 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4 text-white" />
              Save Platform Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminSettingsPage;
