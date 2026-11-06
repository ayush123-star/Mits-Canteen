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
  X,
  Code,
  Sun,
  Moon,
  ChevronDown,
  Linkedin,
  Github,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Building,
  UserCheck,
  AlertTriangle,
  Sparkles,
  UserPlus
} from 'lucide-react';

export const LoginPage = () => {
  const { user, isAuthenticated, loginWithGoogle, login } = useAuth();
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

  // Official Google OAuth States & Active Selection Role
  const [targetRole, setTargetRole] = useState('student');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // UI Interactive States
  const [showFeatures, setShowFeatures] = useState(false);

  // Canteen Owner Security PIN Authorization States
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);

  // Smooth scroll to Developer section
  const scrollToDeveloper = () => {
    if (developerRef.current) {
      developerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Gmail Composer Launcher (Opens Gmail app on phones or web composer on desktop)
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

  // Canteen Owner Master PIN Verification (PIN: 1957)
  const verifyOwnerPin = async (pinValue) => {
    const pinToTest = (pinValue !== undefined ? pinValue : ownerPin).trim();
    setOwnerError('');

    if (pinToTest === '1957') {
      setOwnerLoading(true);
      try {
        const res = await login('admin@campus.edu', 'admin123');
        if (res.success) {
          setIsOwnerModalOpen(false);
          navigate('/admin/dashboard');
        } else {
          setOwnerError(res.message || 'Owner authentication failed');
        }
      } catch (err) {
        setOwnerError(err.message || 'Error authenticating owner');
      } finally {
        setOwnerLoading(false);
      }
    } else {
      setOwnerError('⛔ Access Denied! Invalid Owner PIN. Authorized staff only.');
    }
  };

  const handleOwnerPinSubmit = (e) => {
    if (e) e.preventDefault();
    verifyOwnerPin(ownerPin);
  };

  const handleNumpadPress = (digit) => {
    if (ownerLoading) return;
    if (ownerPin.length >= 4) return;
    const nextPin = ownerPin + digit;
    setOwnerPin(nextPin);
    if (nextPin.length === 4) {
      verifyOwnerPin(nextPin);
    }
  };

  const handleNumpadBackspace = () => {
    if (ownerLoading) return;
    setOwnerPin((prev) => prev.slice(0, -1));
    setOwnerError('');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[450px] bg-gradient-to-t from-purple-950/20 via-indigo-950/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. MITS Top Header Bar */}
      <header className="w-full border-b border-purple-500/20 bg-[#0B1020]/90 backdrop-blur-xl px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-900 border border-purple-500/30 p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src="/assets/campus/mits-logo.png"
              alt="MITS Seal"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = '/images/mits/mits-logo.png';
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base sm:text-lg tracking-tight text-white">
              MITS
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/25">
              CANTEEN
            </span>
          </div>
        </div>

        {/* Right Nav Action: Developer Pill Button (Desktop & Tablet) & Theme Icon */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollToDeveloper}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151C30] hover:bg-[#1C263A] border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Code className="w-3.5 h-3.5 text-blue-400" />
            <span>Developer</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[#151C30] hover:bg-[#1C263A] border border-purple-500/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
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

      {/* 2. Main Login Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 z-10 w-full max-w-lg mx-auto space-y-4">
        
        {/* MITS Seal Crest & Heading - Clean & Well-proportioned */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 border-2 border-purple-500/40">
            <img
              src="/assets/campus/mits-logo.png"
              alt="MITS Gwalior Logo"
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                e.target.src = '/images/mits/mits-logo.png';
              }}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            MITS Canteen Portal
          </h1>
          <p className="text-xs text-[#AAB3C5]">
            Madhav Institute of Technology & Science, Gwalior
          </p>
        </div>

        {/* 3. Center Glassmorphism Login Card (Clean, well-spaced, zero clipping) */}
        <div className="w-full bg-[#0D1527]/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 space-y-4">
          
          {/* Lock Icon in Circular Badge */}
          <div className="w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>

          {/* Card Heading & Clean Domain Guidelines */}
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Sign in to your account
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-mono font-semibold">
                Students: @mitsgwl.ac.in
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-semibold">
                Faculty: @mitsgwalior.in
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {/* Single Clean "Sign in with Google" Button (Official GIS OAuth Trigger) */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => handleStartGoogleLogin('student')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#131C31] hover:bg-[#1A2642] border border-slate-700/80 text-white font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer group active:scale-[0.99] disabled:opacity-75"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : (
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center p-0.5 shrink-0 shadow-xs">
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
            <span className="group-hover:text-white transition-colors">
              {googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}
            </span>
          </button>

          {/* Quick Portal Switcher Pills */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              disabled={googleLoading}
              onClick={() => handleStartGoogleLogin('student')}
              className="py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 disabled:opacity-60"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student (@mitsgwl)</span>
            </button>

            <button
              type="button"
              disabled={googleLoading}
              onClick={() => handleStartGoogleLogin('faculty')}
              className="py-1.5 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95 disabled:opacity-60"
            >
              <Building className="w-3.5 h-3.5 text-orange-400" />
              <span>Teacher (@mitsgwalior)</span>
            </button>
          </div>

          {/* Mandatory Student Registration / New Account Gate - Responsive, No Truncation */}
          <div className="p-3.5 rounded-2xl bg-[#151C30]/90 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">New Student at MITS?</p>
                <p className="text-[11px] text-[#AAB3C5]">Register with your college ID</p>
              </div>
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-bold shadow-md shadow-purple-500/25 text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Show Features Toggle Button (As seen on MITS AMS page) */}
          <button
            type="button"
            onClick={() => setShowFeatures(!showFeatures)}
            className="w-full py-3 rounded-xl bg-[#131C31] hover:bg-[#1A2642] border border-slate-700/60 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{showFeatures ? 'Hide Features' : 'Show Features'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                showFeatures ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Expanded Features Panel */}
          {showFeatures && (
            <div className="pt-2 space-y-2 animate-fadeIn text-xs border-t border-slate-800">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base">⚡</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Zero-Queue Digital Ordering</h4>
                  <p className="text-[11px] text-slate-400">Order from classrooms or hostels and skip canteen wait lines.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base">📺</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Live Token Calling TV Screen</h4>
                  <p className="text-[11px] text-slate-400">Real-time counter token callout screen placed at MITS Canteen Counter 1.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-base">🥗</span>
                <div>
                  <h4 className="font-bold text-white text-xs">100% Pure Vegetarian Kitchen</h4>
                  <p className="text-[11px] text-slate-400">Strictly vegetarian campus cuisine, healthy snacks, thalis & drinks.</p>
                </div>
              </div>
            </div>
          )}

          {/* Restricted Canteen Staff Access */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setOwnerPin('');
                setOwnerError('');
                setIsOwnerModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Canteen Staff & Owner Restricted Portal</span>
            </button>
          </div>
        </div>
      </main>

      {/* 4. MITS AMS "DEVELOPED BY" Section (NORMAL, SLEEK & COMPACT) */}
      <footer id="developer-section" ref={developerRef} className="w-full px-4 py-5 sm:py-6 z-10 border-t border-purple-500/20 bg-[#070B16]/95 backdrop-blur-xl">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Section Heading */}
          <div>
            <h3 className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-purple-400 mb-2.5">
              DEVELOPED BY
            </h3>

            {/* Developer Card (Sleek, perfectly proportioned horizontal card) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0F172A]/90 border border-purple-500/30 shadow-lg backdrop-blur-xl flex items-center gap-3.5">
              
              {/* Profile Photograph (Normal, compact 56px circle with fixed dimensions) */}
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full overflow-hidden border-2 border-purple-400/80 shadow-md ring-2 ring-purple-500/20 shrink-0">
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
                  <h4 className="font-bold text-sm sm:text-base text-white truncate">
                    Ayush Pandey
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                    Lead Developer
                  </span>
                </div>

                <p className="text-xs text-purple-300 font-medium truncate mt-0.5">
                  Electronics and Telecommunication &bull; MITS Gwalior
                </p>

                {/* Social & Portfolio Icons Row: Portfolio, LinkedIn, GitHub, Email */}
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href="https://portfolio-jade-two-92.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white flex items-center justify-center transition-all shadow-xs"
                    title="Live Portfolio Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/ayush-pandey-a9161b275"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 flex items-center justify-center transition-all"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://github.com/ayush123-star"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all"
                    title="GitHub Profile"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="mailto:pandeyayush1603@gmail.com"
                    onClick={handleContactDeveloperEmail}
                    className="w-7 h-7 rounded-lg bg-pink-600/20 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/30 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Send direct email to pandeyayush1603@gmail.com"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Matched with Image 1 */}
          <div className="pt-3 text-center text-xs text-[#AAB3C5] space-y-1">
            <p className="text-slate-400">© {new Date().getFullYear()} MITS Gwalior Canteen</p>
            <p className="text-slate-400 text-[11px]">
              Made by{' '}
              <a
                href="https://portfolio-jade-two-92.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-[#526DFF] hover:text-blue-400 font-semibold transition-colors"
              >
                Ayush Pandey
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 5. Canteen Owner Security PIN Authorization Modal (Fully Mobile-Optimized) */}
      {isOwnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0D1527] border-2 border-orange-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 my-auto">
            
            <button
              type="button"
              onClick={() => setIsOwnerModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Canteen Owner Gate
              </h3>
              <p className="text-[11px] text-slate-300">
                Restricted access for MITS canteen operators
              </p>
            </div>

            {ownerError && (
              <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{ownerError}</span>
              </div>
            )}

            {/* 4-Digit PIN Visual Boxes */}
            <div className="flex justify-center items-center gap-2.5 py-1">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = ownerPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-10 h-11 sm:w-11 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-black font-mono transition-all border ${
                      isFilled
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300 shadow-md shadow-orange-500/20 scale-105'
                        : 'border-slate-700 bg-slate-900/90 text-slate-600'
                    }`}
                  >
                    {isFilled ? '●' : '○'}
                  </div>
                );
              })}
            </div>

            {/* Phone-Friendly Touch Numeric Keypad */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={ownerLoading}
                  onClick={() => handleNumpadPress(String(num))}
                  className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-extrabold text-sm sm:text-base active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={ownerLoading}
                onClick={() => {
                  setOwnerPin('');
                  setOwnerError('');
                }}
                className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-slate-400 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={ownerLoading}
                onClick={() => handleNumpadPress('0')}
                className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-extrabold text-sm sm:text-base active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                disabled={ownerLoading}
                onClick={handleNumpadBackspace}
                className="h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-orange-400 font-bold text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                aria-label="Backspace"
              >
                ⌫
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={ownerLoading || ownerPin.length === 0}
              onClick={() => verifyOwnerPin(ownerPin)}
              className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {ownerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Owner Console</span>
                </>
              )}
            </button>

            <div className="text-center text-[9px] sm:text-[10px] text-slate-500">
              MITS Main Canteen Operations Console &bull; Security Protected
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
