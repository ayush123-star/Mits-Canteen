import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Tv,
  ShoppingBag,
  ExternalLink,
  ChefHat
} from 'lucide-react';

export const OwnerLoginPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState('pin'); // 'pin' or 'password'
  const [ownerPin, setOwnerPin] = useState('');
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin/owner, proceed directly to dashboard
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'canteen_admin' || user?.role === 'admin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Master PIN Verification (PIN: 1957)
  const verifyPin = async (pinValue) => {
    const pin = (pinValue !== undefined ? pinValue : ownerPin).trim();
    setError('');

    if (pin === '1957') {
      setLoading(true);
      try {
        const res = await login('admin@campus.edu', 'admin123');
        if (res.success) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setError(res.message || 'Owner authentication failed');
        }
      } catch (err) {
        setError(err.message || 'Error authenticating owner');
      } finally {
        setLoading(false);
      }
    } else {
      setError('⛔ Access Denied! Invalid Canteen Owner PIN. Authorized staff only.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNumpadPress = (digit) => {
    if (loading) return;
    if (ownerPin.length >= 4) return;
    const nextPin = ownerPin + digit;
    setOwnerPin(nextPin);
    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleNumpadBackspace = () => {
    if (loading) return;
    setOwnerPin((prev) => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-white flex flex-col justify-between selection:bg-purple-600 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="w-full border-b border-purple-500/20 bg-[#0B1020]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-purple-500/30">
            <img
              src="/assets/campus/mits-logo.png"
              alt="MITS Gwalior"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/images/mits/mits-logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                MITS CANTEEN
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                OWNER CONSOLE
              </span>
            </div>
            <p className="text-[10px] text-purple-200">Kitchen Operations & Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-slate-300 hover:text-white text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Student App</span>
          </Link>
          <Link
            to="/live-tokens"
            className="px-3.5 py-1.5 rounded-xl bg-[#151C30] hover:bg-[#25334d] text-slate-300 hover:text-white text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Live TV Display</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-sm bg-[#0D1527] border-2 border-purple-500/30 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-2 border-purple-500/40 text-purple-300 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <ChefHat className="w-7 h-7 text-purple-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Canteen Owner Portal
            </h2>
            <p className="text-xs text-[#AAB3C5]">
              Authorized kitchen operators & manager console
            </p>
          </div>

          {/* Mode Switcher: Quick PIN or Credentials */}
          <div className="flex rounded-2xl bg-[#151C30] p-1 border border-purple-500/20">
            <button
              type="button"
              onClick={() => {
                setActiveMode('pin');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeMode === 'pin'
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                  : 'text-[#AAB3C5] hover:text-white'
              }`}
            >
              Express PIN (1957)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('password');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeMode === 'password'
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md'
                  : 'text-[#AAB3C5] hover:text-white'
              }`}
            >
              Password Login
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {activeMode === 'pin' ? (
            <div className="space-y-4">
              {/* 4-Digit PIN Visual Display */}
              <div className="flex justify-center items-center gap-2.5 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = ownerPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-11 h-12 rounded-2xl flex items-center justify-center text-lg font-black font-mono transition-all border ${
                        isFilled
                          ? 'border-purple-400 bg-purple-500/25 text-purple-200 shadow-md shadow-purple-500/30 scale-105'
                          : 'border-slate-700 bg-slate-900/90 text-slate-600'
                      }`}
                    >
                      {isFilled ? '●' : '○'}
                    </div>
                  );
                })}
              </div>

              {/* Phone-Friendly Touch Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={loading}
                    onClick={() => handleNumpadPress(String(num))}
                    className="h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-extrabold text-base active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setOwnerPin('');
                    setError('');
                  }}
                  className="h-11 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleNumpadPress('0')}
                  className="h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-extrabold text-base active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleNumpadBackspace}
                  className="h-11 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-purple-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Backspace"
                >
                  ⌫
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={loading || ownerPin.length === 0}
                onClick={() => verifyPin(ownerPin)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Operator...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Owner Dashboard</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[#AAB3C5]">
                Default Master PIN: <strong className="text-white font-mono">1957</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[#AAB3C5]">
                Default: <strong className="text-white">admin@campus.edu</strong> / <strong className="text-white">admin123</strong>
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-purple-500/20 bg-[#0B1020]/90 py-3 text-center text-[11px] text-[#AAB3C5]">
        MITS Smart Campus Canteen &bull; Kitchen Operations &amp; Real-Time Order Management Console
      </footer>
    </div>
  );
};

export default OwnerLoginPage;
