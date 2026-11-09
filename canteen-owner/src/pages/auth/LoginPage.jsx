import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  ChevronDown,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Building,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  Coffee,
  Flame,
  Utensils,
  Zap,
  Radio,
  Clock
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
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (hrs >= 5 && hrs < 12) setGreeting('Good Morning ☀️');
      else if (hrs >= 12 && hrs < 17) setGreeting('Good Afternoon 🍛');
      else if (hrs >= 17 && hrs < 22) setGreeting('Good Evening ☕');
      else setGreeting('Welcome Night Owl 🌙');
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Login Mode: 'google' or 'password'
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'password'

  // Google OAuth States & Active Selection Role
  const [targetRole, setTargetRole] = useState('student');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Password Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Feature Interactive Pill
  const [activeFeature, setActiveFeature] = useState(0);

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

  const smartFeatures = [
    {
      icon: '⚡',
      title: 'Zero-Queue Smart Token',
      subtitle: 'Order from hostel or class. Pick up warm food when token pops on counter screen.',
      badge: 'Speed'
    },
    {
      icon: '📺',
      title: 'Live TV Calling Display',
      subtitle: 'Real-time multi-station display calls your exact token with bilingual speech chime.',
      badge: 'Live Audio'
    },
    {
      icon: '🥗',
      title: '100% Pure Veg Standards',
      subtitle: 'Hygienic campus food standards, live kadhai fresh snacks & student combos.',
      badge: 'Hygiene'
    },
    {
      icon: '📲',
      title: 'Direct WhatsApp Receipts',
      subtitle: 'Instant token slips and bill receipts dispatched straight to WhatsApp.',
      badge: 'Alerts'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* 1. Dynamic Ambient Glowing Auroras */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-gradient-to-tr from-amber-600/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-gradient-to-br from-purple-700/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Floating Decorative Micro-Chips (Dynamic Visual Energy) */}
      <div className="hidden lg:block absolute top-28 left-8 animate-float-slow pointer-events-none z-0">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#0D1527]/80 border border-amber-500/25 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>MITS Campus Canteen</span>
        </div>
      </div>

      <div className="hidden lg:block absolute top-40 right-10 animate-float-slow [animation-delay:1.5s] pointer-events-none z-0">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#0D1527]/80 border border-purple-500/30 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-purple-300">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>Zero-Queue Tokens</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-36 left-12 animate-float-slow [animation-delay:2.5s] pointer-events-none z-0">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#0D1527]/80 border border-emerald-500/25 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-emerald-300">
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Pure Vegetarian</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-44 right-14 animate-float-slow [animation-delay:3.2s] pointer-events-none z-0">
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#0D1527]/80 border border-amber-500/25 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-amber-300">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span>Campus Snacks & Chai</span>
        </div>
      </div>

      {/* 2. Top Header Bar with Live Campus Operations Pill */}
      <header className="w-full border-b border-amber-500/15 bg-[#0A0E1A]/85 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-amber-500/40">
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
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                MITS
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20 font-mono">
                CANTEEN
              </span>
            </div>
            <p className="text-[10px] text-[#AAB3C5] hidden sm:block">
              Madhav Institute of Technology & Science
            </p>
          </div>
        </div>

        {/* Dynamic Center Badge: Live Kitchen Operations */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Kitchen Active</span>
          <span className="text-emerald-500/60">&bull;</span>
          <span className="text-[#AAB3C5]">{greeting}</span>
          <span className="text-emerald-500/60">&bull;</span>
          <span className="font-mono text-white text-[10px]">{currentTimeStr}</span>
        </div>

        {/* Right Nav Action: Developer Pill & Theme Icon */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollToDeveloper}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131C31] hover:bg-[#1A2642] border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
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

      {/* 3. Main Login Experience */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 z-10 w-full max-w-lg mx-auto space-y-4">
        
        {/* Dynamic Greeting & Crest Heading */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold tracking-wide uppercase mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{greeting} &bull; MITS Smart Dining</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to Smart Canteen
          </h1>
          <p className="text-xs text-[#AAB3C5]">
            Skip counter queues &bull; Track live token callouts on TV
          </p>
        </div>

        {/* 4. Luxury Glassmorphic Sign-In Card */}
        <div className="w-full bg-[#0D1527]/95 backdrop-blur-2xl border border-amber-500/20 hover:border-amber-500/35 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-4 transition-all relative">
          
          {/* Subtle top golden light line */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>

          {/* Dynamic Sign-In Mode Switcher (Google Workspace vs Campus ID) */}
          <div className="flex rounded-2xl bg-[#080E1C] p-1 border border-amber-500/20 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'google'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                  : 'text-[#AAB3C5] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Google One-Tap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setAuthError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold'
                  : 'text-[#AAB3C5] hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
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
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <p className="text-xs text-[#AAB3C5]">
                  Select your campus role and authenticate with your official Google account:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-mono font-semibold">
                    @mitsgwl.ac.in
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-semibold">
                    @mitsgwalior.in
                  </span>
                </div>
              </div>

              {/* Main Official GIS Google Sign In Trigger */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => handleStartGoogleLogin(targetRole)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#131C31] hover:bg-[#1A2642] border border-amber-500/30 text-white font-black text-sm shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-75"
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
                  {googleLoading ? 'Connecting to Google OAuth...' : 'Continue with Google Workspace'}
                </span>
              </button>

              {/* Role Selection Selector */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={() => setTargetRole('student')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    targetRole === 'student'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-[#131C31] border-slate-700/60 text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Student (@mitsgwl)</span>
                </button>

                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={() => setTargetRole('faculty')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                    targetRole === 'faculty'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-[#131C31] border-slate-700/60 text-[#AAB3C5] hover:text-white'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-orange-400" />
                  <span>Teacher (@mitsgwalior)</span>
                </button>
              </div>

              {/* Instant 1-Click Demo Fill Preview */}
              <div className="pt-1 flex items-center justify-center gap-2">
                <span className="text-[10px] text-[#AAB3C5] uppercase font-bold tracking-wider">Fast Preview:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (targetRole === 'faculty') loginAsDemoFaculty();
                    else loginAsDemoAyush();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Instant 1-Click Demo Login &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE B: Direct Campus ID & Password */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider block">
                  College Email or Enrollment No.
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 25et1ay39@mitsgwl.ac.in or BTET25O1039"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#090F1E] border border-amber-500/30 text-xs font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
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

              <div className="flex items-center justify-between text-[11px] pt-1 text-[#AAB3C5]">
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

          {/* 5. Mandatory Student Registration Card (Golden border, high aesthetic) */}
          <div className="p-3.5 rounded-2xl bg-[#090E1D] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">New Student at MITS?</p>
                <p className="text-[11px] text-[#AAB3C5]">Register with your Enrollment ID</p>
              </div>
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black shadow-md shadow-amber-500/20 text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6. Dynamic Interactive Features Showcase Carousel/Pills */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Smart Campus Highlights</span>
              </span>
              <span className="text-[10px] text-[#AAB3C5]">Tap to preview</span>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-4 gap-1.5">
              {smartFeatures.map((feat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFeature(idx)}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                    activeFeature === idx
                      ? 'bg-amber-500/20 border-amber-500/60 shadow-md text-amber-300 scale-105'
                      : 'bg-[#090E1D] border-slate-800 text-slate-400 hover:text-white hover:bg-[#131C31]'
                  }`}
                >
                  <div className="text-sm">{feat.icon}</div>
                  <div className="text-[9px] font-bold truncate mt-0.5">{feat.badge}</div>
                </button>
              ))}
            </div>

            {/* Active Feature Detail Drawer */}
            <div className="p-3 rounded-2xl bg-[#090E1D] border border-amber-500/25 flex items-start gap-2.5 animate-fadeIn">
              <div className="text-xl shrink-0 p-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                {smartFeatures[activeFeature].icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white">
                  {smartFeatures[activeFeature].title}
                </h4>
                <p className="text-[11px] text-[#AAB3C5] leading-relaxed mt-0.5">
                  {smartFeatures[activeFeature].subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. MITS "DEVELOPED BY" Luxury Developer Card */}
      <footer id="developer-section" ref={developerRef} className="w-full px-4 py-5 sm:py-6 z-10 border-t border-amber-500/20 bg-[#070A12]/95 backdrop-blur-xl">
        <div className="max-w-md mx-auto space-y-4">
          
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
              DEVELOPED BY
            </span>
          </div>

          {/* Sleek Glassmorphism Developer Card */}
          <div className="p-4 rounded-3xl bg-[#0D1527]/90 border border-amber-500/30 shadow-xl backdrop-blur-xl flex items-center gap-3.5 relative overflow-hidden">
            
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Profile Photograph with Golden Ring */}
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

              {/* Social & Contact Actions */}
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
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-[#0077b5]/30 border border-slate-700 hover:border-[#0077b5]/50 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                </a>

                <a
                  href="https://github.com/ayush123-star"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
                  title="GitHub Profile"
                >
                  <Github className="w-3.5 h-3.5 text-white" />
                </a>

                <button
                  type="button"
                  onClick={handleContactDeveloperEmail}
                  className="w-7 h-7 rounded-xl bg-[#131C31] hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  title="Contact Ayush via Gmail"
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#AAB3C5]">
            MITS Smart Canteen &bull; Designed &amp; Developed for Campus Hospitality Excellence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
