import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Canteen3DScene } from '../../components/Canteen3DScene';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Code,
  Sun,
  Moon,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Building,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  Zap,
  Coffee,
  Utensils,
  Tv
} from 'lucide-react';

export const LoginPage = () => {
  const { user, isAuthenticated, loginWithGoogle, login, loginAsDemoAyush, loginAsDemoFaculty } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const developerRef = useRef(null);

  const destination = location.state?.from?.pathname || '/';

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (user?.role === 'canteen_admin' || user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, destination]);

  // Real-time dynamic greeting & clock
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
      else setGreeting('Night Dining 🌙');
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Login Mode: 'google' or 'password'
  const [authMode, setAuthMode] = useState('google');

  // Google OAuth States & Active Selection Role
  const [targetRole, setTargetRole] = useState('student');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Password Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Smooth scroll to Developer section
  const scrollToDeveloper = () => {
    if (developerRef.current) {
      developerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Gmail Composer Launcher
  const handleContactDeveloperEmail = (e) => {
    e.preventDefault();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.location.href = 'mailto:pandeyayush1603@gmail.com';
    } else {
      const gmailWeb = 'https://mail.google.com/mail/?view=cm&fs=1&to=pandeyayush1603@gmail.com';
      const win = window.open(gmailWeb, '_blank');
      if (!win) {
        window.location.href = 'mailto:pandeyayush1603@gmail.com';
      }
    }
  };

  // Official Google Identity Services OAuth 2.0 Account Chooser Popup Trigger
  const triggerGoogleLogin = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setAuthError('');
      try {
        const res = await loginWithGoogle(
          { accessToken: tokenResponse.access_token },
          targetRole
        );
        if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setAuthError(res.message || 'Google Sign-In failed');
        }
      } catch (err) {
        setAuthError(err.message || 'Error completing Google Sign-In');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.warn('Google Sign-In popup closed or cancelled:', error);
      setGoogleLoading(false);
    },
  });

  const handleStartGoogleLogin = (role = 'student') => {
    setTargetRole(role);
    setAuthError('');
    triggerGoogleLogin();
  };

  // Direct Campus ID / Password Sign In
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setAuthError('Please enter both your college ID / email and password.');
      return;
    }
    setAuthError('');
    setPasswordLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setAuthError(res.message || 'Invalid credentials. Please verify your details.');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Dynamic Ambient Glowing Lights */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/12 via-orange-600/8 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[400px] bg-gradient-to-tl from-purple-700/12 via-indigo-600/8 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. Sleek Top Header Bar */}
      <header className="w-full border-b border-amber-500/15 bg-[#090E1A]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-amber-500/40">
            <img
              src="/assets/campus/mits-logo.png"
              alt="MITS Seal"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/images/mits/mits-logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white">
                MITS
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20 font-mono">
                CANTEEN
              </span>
            </div>
            <p className="text-[10px] text-[#AAB3C5]">
              Madhav Institute of Technology &amp; Science, Gwalior
            </p>
          </div>
        </div>

        {/* Live Operations Chime */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Kitchen</span>
          <span className="text-emerald-500/50">&bull;</span>
          <span className="text-[#AAB3C5]">{greeting}</span>
          <span className="text-emerald-500/50">&bull;</span>
          <span className="font-mono text-white text-[11px]">{timeStr}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollToDeveloper}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#131C31] hover:bg-[#1A2642] border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>Developer</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[#131C31] hover:bg-[#1A2642] border border-purple-500/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#7955E8] hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Expansive 2-Column Hero & Login Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: INTERACTIVE 3D STAGE & CANTEEN SHOWCASE    */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Next-Gen 3D Campus Dining</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Order Ahead. <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  Zero Waiting Lines.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#AAB3C5] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Browse hot gourmet meals, track your token live on counter TV screens, and enjoy instant pickup at the MITS Main Canteen.
              </p>
            </div>

            {/* INTERACTIVE 3D CANVAS STAGE */}
            <div className="rounded-3xl bg-[#090E1D]/80 border border-amber-500/25 p-2 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <Canteen3DScene />
            </div>

            {/* Quick Feature Pills (Spacious, Clean) */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-[#090E1D]/90 border border-amber-500/20 text-center space-y-1">
                <div className="text-lg">⚡</div>
                <div className="text-xs font-extrabold text-white">Zero Wait</div>
                <div className="text-[10px] text-[#AAB3C5]">Skip counter rush</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090E1D]/90 border border-purple-500/25 text-center space-y-1">
                <div className="text-lg">📺</div>
                <div className="text-xs font-extrabold text-white">Live TV Chime</div>
                <div className="text-[10px] text-[#AAB3C5]">Token audio alerts</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090E1D]/90 border border-emerald-500/20 text-center space-y-1">
                <div className="text-lg">🥗</div>
                <div className="text-xs font-extrabold text-white">Pure Veg</div>
                <div className="text-[10px] text-[#AAB3C5]">Hygienic campus food</div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: CLEAN, SPACIOUS, LUXURY LOGIN CARD         */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-[#0D1527]/95 backdrop-blur-2xl border border-amber-500/25 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6 transition-all relative">
              
              {/* Subtle top golden light line */}
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>

              {/* Header inside Card */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome to MITS Portal
                </h2>
                <p className="text-xs text-[#AAB3C5]">
                  Sign in with your official college account
                </p>
              </div>

              {/* Dynamic Sign-In Mode Switcher (Google Workspace vs Campus ID) */}
              <div className="flex rounded-2xl bg-[#080E1C] p-1.5 border border-amber-500/20 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('google');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'google'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                      : 'text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Google Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                      : 'text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Campus ID / Pass</span>
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-relaxed">{authError}</span>
                </div>
              )}

              {/* MODE A: Google Workspace One-Tap */}
              {authMode === 'google' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Role Selector */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={() => setTargetRole('student')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        targetRole === 'student'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-[#131C31] border-slate-700/60 text-[#AAB3C5] hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <span>Student (@mitsgwl)</span>
                    </button>

                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={() => setTargetRole('faculty')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        targetRole === 'faculty'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-[#131C31] border-slate-700/60 text-[#AAB3C5] hover:text-white'
                      }`}
                    >
                      <Building className="w-4 h-4 text-orange-400" />
                      <span>Faculty (@mitsgwalior)</span>
                    </button>
                  </div>

                  {/* Main Official GIS Google Sign In Trigger */}
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={() => handleStartGoogleLogin(targetRole)}
                    className="w-full py-4 px-4 rounded-2xl bg-[#131C31] hover:bg-[#1A2642] border border-amber-500/35 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-75"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="group-hover:text-amber-200 transition-colors">
                      {googleLoading ? 'Connecting to Google...' : 'Continue with Google Workspace'}
                    </span>
                  </button>

                  {/* Fast 1-Click Demo Shortcut */}
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (targetRole === 'faculty') loginAsDemoFaculty();
                        else loginAsDemoAyush();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Instant 1-Click Preview Login &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE B: Direct Campus ID & Password */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#AAB3C5] uppercase tracking-wider block">
                      College Email or Enrollment No.
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 25et1ay39@mitsgwl.ac.in or BTET25O1039"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
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
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
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
                    disabled={passwordLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In With Credentials</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-[#AAB3C5]">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('25et1ay39@mitsgwl.ac.in');
                        setPassword('mits123');
                      }}
                      className="hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Fill Sample Student
                    </button>
                    <Link to="/register" className="text-amber-400 hover:underline">
                      Need a Student Account?
                    </Link>
                  </div>
                </form>
              )}

              {/* Spacious Register Gate */}
              <div className="p-4 rounded-2xl bg-[#090E1D] border border-amber-500/25 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">New Student at MITS?</p>
                    <p className="text-[11px] text-[#AAB3C5]">Register with your enrollment ID</p>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black shadow-md shadow-amber-500/20 text-center flex items-center gap-1 transition-all active:scale-95 shrink-0"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Luxury Developer Footer */}
      <footer id="developer-section" ref={developerRef} className="w-full px-4 py-6 z-10 border-t border-amber-500/15 bg-[#070A12]/95 backdrop-blur-xl">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-4 rounded-3xl bg-[#0D1527]/90 border border-amber-500/25 shadow-xl backdrop-blur-xl flex items-center gap-4 relative overflow-hidden">
            {/* Profile Photo */}
            <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full overflow-hidden border-2 border-amber-400 shadow-lg ring-2 ring-amber-500/30 shrink-0">
              <img
                src="/assets/developer/ayush_pandey.jpg"
                alt="Ayush Pandey"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/campus/ayush_pandey.jpg';
                }}
              />
            </div>

            {/* Developer Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate">
                  Ayush Pandey
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xs shrink-0">
                  Lead Developer
                </span>
              </div>

              <p className="text-xs text-amber-300 font-medium truncate mt-0.5">
                Electronics and Telecommunication &bull; MITS Gwalior
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <a
                  href="https://portfolio-jade-two-92.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-[#131C31] hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span>Portfolio</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/ayush-pandey-204176249/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-[#0077b5]/30 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                </a>

                <a
                  href="https://github.com/ayush123-star"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
                  title="GitHub"
                >
                  <Github className="w-3.5 h-3.5 text-white" />
                </a>

                <button
                  type="button"
                  onClick={handleContactDeveloperEmail}
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-red-500/20 border border-slate-700 text-slate-300 hover:text-red-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  title="Contact via Gmail"
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#AAB3C5]">
            MITS Smart Campus Canteen &bull; Designed &amp; Developed for MITS Gwalior
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
