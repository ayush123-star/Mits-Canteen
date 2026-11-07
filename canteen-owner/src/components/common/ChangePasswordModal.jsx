import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export const ChangePasswordModal = () => {
  const { user, completeFirstLoginPasswordChange } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || !user.requiresPasswordChange) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword === 'temp123') {
      setError('New password cannot be the temporary password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const ok = await completeFirstLoginPasswordChange(newPassword);
    if (ok) {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#1C263A]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#7955E8]/30 via-[#526DFF]/20 to-[#0B1020] border-b border-purple-500/20 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 mx-auto shadow-lg shadow-purple-500/30 flex items-center justify-center text-white">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">First-Time Login Security Setup</h3>
          <p className="text-xs text-[#AAB3C5]">
            Welcome, <strong className="text-white">{user.name}</strong>! As an authorized Canteen Staff/Owner, you must change your temporary password before accessing the portal.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-white">Password Changed Successfully!</h4>
              <p className="text-xs text-[#AAB3C5]">
                Your account is now secured. Proceeding to your Canteen Dashboard...
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="font-bold text-[#AAB3C5] block mb-1">Set New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#AAB3C5] block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Update Password & Enter
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
