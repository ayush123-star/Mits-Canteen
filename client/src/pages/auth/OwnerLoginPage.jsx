import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Canteen3DScene } from '../../components/Canteen3DScene';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Tv,
  ShoppingBag,
  ChefHat,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const OwnerLoginPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState('pin'); // 'pin' or 'password'
  const [ownerPin, setOwnerPin] = useState('');
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic time & greeting
  const [greeting, setGreeting] = useState('');
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (hrs >= 5 && hrs < 12) setGreeting('Good Morning ☀️');
      else if (hrs >= 12 && hrs < 17) setGreeting('Good Afternoon 🍛');
      else if (hrs >= 17 && hrs < 22) setGreeting('Good Evening ☕');
      else setGreeting('Night Operations 🌙');
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

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
      setError('⛔ Access Denied! Invalid Master PIN. Please enter 1957.');
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
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Dynamic Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/12 via-orange-600/8 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[400px] bg-gradient-to-tl from-purple-700/12 via-indigo-600/8 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="w-full border-b border-amber-500/15 bg-[#090E1A]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-amber-500/40">
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
              <span className="font-black text-lg tracking-tight text-white">
                MITS CANTEEN
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-sm font-mono">
                OWNER CONSOLE
              </span>
            </div>
            <p className="text-[10px] text-[#AAB3C5]">Kitchen Operations &amp; Cashier Gateway</p>
          </div>
        </div>

        {/* Live Chime */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Station Active</span>
          <span className="text-emerald-500/50">&bull;</span>
          <span className="text-[#AAB3C5]">{greeting}</span>
          <span className="text-emerald-500/50">&bull;</span>
          <span className="font-mono text-white text-[11px]">{timeStr}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl bg-[#131C31] hover:bg-[#1A2642] text-slate-300 hover:text-white text-xs font-bold border border-amber-500/25 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Student Portal</span>
          </Link>
          <Link
            to="/live-tokens"
            className="px-3.5 py-1.5 rounded-xl bg-[#131C31] hover:bg-[#1A2642] text-slate-300 hover:text-white text-xs font-bold border border-emerald-500/25 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Live TV Display</span>
          </Link>
        </div>
      </header>

      {/* Main Spacious 2-Column Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: INTERACTIVE 3D DISPLAY */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wide uppercase shadow-sm">
                <ChefHat className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>MITS Canteen Owner Operations</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Master Kitchen &amp; <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  Order POS Terminal.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#AAB3C5] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Accept student orders in real time, adjust cooking prep timers, call tokens with bilingual audio, and manage daily cravings.
              </p>
            </div>

            {/* 3D Canvas Showcase */}
            <div className="rounded-3xl bg-[#090E1D]/80 border border-amber-500/25 p-2 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <Canteen3DScene />
            </div>
          </div>

          {/* RIGHT COLUMN: SPACIOUS OWNER PIN AUTH CARD */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#0D1527]/95 border border-amber-500/25 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-black/90 space-y-6 backdrop-blur-2xl transition-all relative">
              
              {/* Top Accent Line */}
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto shadow-md">
                  <KeyRound className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Canteen Owner Login
                </h2>
                <p className="text-xs text-[#AAB3C5]">
                  Authorized kitchen operators &amp; manager verification
                </p>
              </div>

              {/* Mode Switcher: Quick PIN or Credentials */}
              <div className="flex rounded-2xl bg-[#080E1C] p-1.5 border border-amber-500/20 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('pin');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === 'pin'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                      : 'text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Express PIN (1957)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('password');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === 'password'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                      : 'text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Login</span>
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {activeMode === 'pin' ? (
                <div className="space-y-5 animate-fadeIn">
                  {/* 4-Digit PIN Visual Display */}
                  <div className="flex justify-center items-center gap-3 py-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const isFilled = ownerPin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono transition-all border ${
                            isFilled
                              ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-md shadow-amber-500/30 scale-105'
                              : 'border-slate-800 bg-[#090F1E] text-slate-600'
                          }`}
                        >
                          {isFilled ? '●' : '○'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Spacious Touch Keypad */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        disabled={loading}
                        onClick={() => handleNumpadPress(String(num))}
                        className="h-12 rounded-2xl bg-[#090F1E] hover:bg-[#151F33] border border-amber-500/20 text-white font-extrabold text-base active:scale-95 transition-all cursor-pointer shadow-xs hover:border-amber-400/50"
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
                      className="h-12 rounded-2xl bg-[#090F1E]/60 hover:bg-[#151F33] text-slate-400 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleNumpadPress('0')}
                      className="h-12 rounded-2xl bg-[#090F1E] hover:bg-[#151F33] border border-amber-500/20 text-white font-extrabold text-base active:scale-95 transition-all cursor-pointer shadow-xs hover:border-amber-400/50"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleNumpadBackspace}
                      className="h-12 rounded-2xl bg-[#090F1E]/60 hover:bg-[#151F33] text-amber-300 font-bold text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
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
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Authorizing Operator...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Unlock Owner Dashboard</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-[#AAB3C5] pt-1">
                    <span>Default Master PIN:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOwnerPin('1957');
                        verifyPin('1957');
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold hover:bg-amber-500/25 transition-all cursor-pointer"
                    >
                      Auto-Fill 1957 &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-[#AAB3C5] pt-1">
                    Default: <strong className="text-white">admin@campus.edu</strong> / <strong className="text-white">admin123</strong>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-500/15 bg-[#090E1A]/90 py-3.5 text-center text-xs text-[#AAB3C5]">
        MITS Smart Campus Canteen &bull; Kitchen Operations &amp; Real-Time Order Management Console
      </footer>
    </div>
  );
};

export default OwnerLoginPage;
