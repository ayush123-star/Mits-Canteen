import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { isOrderOwnedByUser } from '../services/realtimeSync';
import {
  UtensilsCrossed,
  ShoppingBag,
  Tv,
  ClipboardList,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Code,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Crown,
  Star,
  Sparkles,
  Mail,
  Linkedin,
  Github,
  GraduationCap,
  Globe,
  Briefcase,
  Award,
  ExternalLink,
  Phone
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { canteens, orders } = useData();
  const { theme, toggleTheme, isDark } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

  const canteenStatus = canteens[0] || { isOpen: true, name: 'MITS Main Canteen' };
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Active orders count for badge (strictly for current user)
  const userActiveOrders = isAuthenticated
    ? orders.filter(
        (o) =>
          isOrderOwnedByUser(o, user) &&
          ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
      ).length
    : 0;

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

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B1020]/90 backdrop-blur-xl border-b border-purple-500/20 text-white shadow-xl shadow-black/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 1. Left: MITS Crest Logo & Brand Name */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-500/40 group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
                <img
                  src="/images/mits/mits-logo.png"
                  alt="MITS Gwalior Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/assets/campus/mits-logo.png';
                  }}
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  MITS
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/25">
                  CANTEEN
                </span>

                {/* Compact Live Status Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-[#151C30] border border-purple-500/20 text-[10px]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      canteenStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                    }`}
                  ></span>
                  <span
                    className={`font-bold ${
                      canteenStatus.isOpen ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {canteenStatus.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </Link>

            {/* 2. Middle: Clean Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 font-bold'
                    : 'text-[#AAB3C5] hover:text-white hover:bg-[#1C263A]/80'
                }`}
              >
                Home
              </Link>

              <Link
                to="/menu"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/menu')
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 font-bold'
                    : 'text-[#AAB3C5] hover:text-white hover:bg-[#1C263A]/80'
                }`}
              >
                Food Menu
              </Link>

              <Link
                to="/live-tokens"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/live-tokens')
                    ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 font-bold'
                    : 'text-[#AAB3C5] hover:text-white hover:bg-[#1C263A]/80'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                Live Tokens
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-orders"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/my-orders')
                      ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 font-bold'
                      : 'text-[#AAB3C5] hover:text-white hover:bg-[#1C263A]/80'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>My Orders</span>
                  {userActiveOrders > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                      {userActiveOrders}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated && !isAdmin && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 font-bold'
                      : 'text-[#AAB3C5] hover:text-white hover:bg-[#1C263A]/80'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* 3. Right Action Area: Developer Button + Light/Dark Mode Toggle + Cart + User */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Signature MITS AMS Developer Pill Button (Desktop & Tablet only to keep mobile navbar clean) */}
              <button
                type="button"
                onClick={() => setIsDeveloperModalOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151C30] hover:bg-[#1C263A] border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="View Lead Developer: Ayush Pandey"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-purple-400 shrink-0 shadow-xs">
                  <img
                    src="/assets/developer/ayush_pandey.jpg"
                    alt="Ayush Pandey"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/campus/ayush_pandey.jpg'; }}
                  />
                </div>
                <span className="text-xs">Developer</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              </button>

              {/* Clean Dark/Light Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#151C30] hover:bg-[#1C263A] border border-purple-500/20 text-[#AAB3C5] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-400" />}
              </button>

              {/* Food Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-[#151C30] hover:bg-[#1C263A] text-white transition-all border border-purple-500/20 flex items-center gap-1.5 group shadow-sm cursor-pointer"
                title="Open Food Cart"
              >
                <ShoppingBag className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold text-slate-200">Cart</span>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-bounce">
                    {totalItemCount}
                  </span>
                )}
              </button>

              {/* User Dropdown with Ayush's Real Profile Photo (Desktop only; on mobile it is inside the 3-lines menu) */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1 rounded-xl bg-[#151C30] hover:bg-[#1C263A] border border-purple-500/30 transition-all text-left shadow-sm cursor-pointer"
                  >
                    {/* User Profile Photo */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400/90 shadow-md ring-2 ring-purple-500/20 shrink-0 bg-slate-800">
                      <img
                        src={user?.avatar || '/assets/developer/ayush_pandey.jpg'}
                        alt={user?.name || 'Ayush Pandey'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/campus/ayush_pandey.jpg';
                        }}
                      />
                    </div>

                    <div className="hidden md:block">
                      <p className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                        {user?.name || 'Ayush Pandey'}
                      </p>
                      <p className="text-[9px] text-purple-300 capitalize leading-none mt-0.5">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#AAB3C5]" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      {/* Transparent click-outside overlay to close dropdown */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />

                      {/* 100% SOLID OPAQUE DARK DROPDOWN PANEL */}
                      <div
                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#070B16] border-2 border-purple-500/40 shadow-2xl shadow-black ring-2 ring-black/80 z-50 overflow-hidden divide-y divide-purple-500/15 animate-fadeIn"
                      >
                        {/* 1. DARK SOLID "SIGNED IN AS" HEADER WITH AYUSH'S PHOTO */}
                        <div className="p-3.5 bg-[#0C1222] border-b border-purple-500/25 flex items-center gap-3">
                          {/* Circular Photo with Glowing Border */}
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shadow-md ring-2 ring-purple-500/40 shrink-0 bg-slate-800">
                            <img
                              src={user?.avatar || '/assets/developer/ayush_pandey.jpg'}
                              alt={user?.name || 'Ayush Pandey'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/assets/campus/ayush_pandey.jpg';
                              }}
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0C1222]" title="Active" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-purple-400 uppercase font-black tracking-widest flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                SIGNED IN AS
                              </span>
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {user?.role?.replace('_', ' ') || 'Student'}
                              </span>
                            </div>
                            
                            <p className="text-xs font-black text-white truncate mt-0.5">
                              {user?.name || 'Ayush Pandey'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {user?.email || '25et1ay39@mitsgwl.ac.in'}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#151C30] text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">
                              ID: {user?.studentId || 'BTET25O1039'}
                            </span>
                          </div>
                        </div>

                        {/* 2. MENU LINKS */}
                        <div className="p-1.5 space-y-0.5 bg-[#070B16]">
                          {!isAdmin && (
                            <Link
                              to="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                            >
                              <User className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>Student Dashboard</span>
                            </Link>
                          )}
                          <Link
                            to="/my-orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                          >
                            <ClipboardList className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>My Order History</span>
                          </Link>
                          {!isAdmin && (
                            <>
                              <Link
                                to="/profile"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                              >
                                <User className="w-4 h-4 text-purple-400 shrink-0" />
                                <span>My Profile</span>
                              </Link>
                              <Link
                                to="/feedback"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                              >
                                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Rate Dishes & Feedback</span>
                              </Link>
                            </>
                          )}
                          {isAdmin && !isSuperAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-300 hover:bg-[#151C30] transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>Canteen Admin Panel</span>
                            </Link>
                          )}
                          {isSuperAdmin && (
                            <Link
                              to="/super-admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:bg-[#151C30] transition-colors"
                            >
                              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Super Admin Console</span>
                            </Link>
                          )}
                        </div>

                        {/* 3. SIGN OUT */}
                        <div className="p-1.5 bg-[#070B16]">
                          <button
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white shadow-md shadow-purple-500/30 items-center gap-1.5 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#AAB3C5] hover:text-white hover:bg-[#151C30] cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Three Lines Menu - Clean, Organized & Spacious) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#070B16] border-b-2 border-purple-500/30 px-4 pt-3 pb-6 space-y-3 animate-fadeIn shadow-2xl">
            
            {/* 1. EXACT "SIGNED IN AS" CARD FROM THE USER DROPDOWN (Shifted inside the 3-lines menu on mobile) */}
            {isAuthenticated ? (
              <div className="rounded-2xl bg-[#070B16] border-2 border-purple-500/40 shadow-2xl overflow-hidden divide-y divide-purple-500/15">
                {/* Header with Photo, Name & ID */}
                <div className="p-3.5 bg-[#0C1222] flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shadow-md ring-2 ring-purple-500/40 shrink-0 bg-slate-800">
                    <img
                      src={user?.avatar || '/assets/developer/ayush_pandey.jpg'}
                      alt={user?.name || 'Ayush Pandey'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/campus/ayush_pandey.jpg';
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0C1222]" title="Active" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-purple-400 uppercase font-black tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        SIGNED IN AS
                      </span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {user?.role?.replace('_', ' ') || 'Student'}
                      </span>
                    </div>

                    <p className="text-xs font-black text-white truncate mt-0.5">
                      {user?.name || 'Ayush Pandey'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {user?.email || '25et1ay39@mitsgwl.ac.in'}
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#151C30] text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">
                      ID: {user?.studentId || 'BTET25O1039'}
                    </span>
                  </div>
                </div>

                {/* Account Actions from Dropdown */}
                <div className="p-1.5 space-y-0.5 bg-[#070B16]">
                  {!isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Student Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                    <span>My Order History {userActiveOrders > 0 && `(${userActiveOrders})`}</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-[#151C30] transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rate Dishes & Feedback</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#151C30] via-[#1C263A] to-[#151C30] border border-purple-500/30 flex items-center justify-between gap-3 shadow-md">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">Student / Faculty Access</p>
                  <p className="text-[10px] text-[#AAB3C5]">Sign in to order food & skip canteen lines</p>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-md shadow-purple-500/30 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* 2. GENERAL CANTEEN NAVIGATION LINKS */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive('/') ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white font-bold' : 'text-[#AAB3C5] hover:bg-[#151C30]'
                }`}
              >
                🏠 Home
              </Link>

              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive('/menu') ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white font-bold' : 'text-[#AAB3C5] hover:bg-[#151C30]'
                }`}
              >
                🍲 Food Menu
              </Link>

              <Link
                to="/live-tokens"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive('/live-tokens') ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white font-bold' : 'text-purple-300 hover:bg-[#151C30]'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                <span>Live TV Tokens</span>
              </Link>
            </div>

            {/* 3. DEDICATED LEAD DEVELOPER SECTION (Inside the 3 lines menu on mobile) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#151C30] to-[#0E1424] border-2 border-blue-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Code className="w-3 h-3 text-blue-400" />
                  Lead Developer
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 ring-2 ring-purple-500/30 shrink-0 bg-slate-800 shadow-md">
                  <img
                    src="/assets/developer/ayush_pandey.jpg"
                    alt="Ayush Pandey"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/campus/ayush_pandey.jpg'; }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#151C30]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white truncate">Ayush Pandey</h4>
                  <p className="text-[10px] text-purple-300 font-medium truncate">Electronics & Telecommunication</p>
                  <p className="text-[9px] text-[#AAB3C5] font-mono truncate">MITS Gwalior (BTET25O1039)</p>
                </div>
              </div>

              {/* Developer Action Buttons (With Portfolio Website Icon) */}
              <div className="flex items-center gap-2 pt-1 border-t border-purple-500/15">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleContactDeveloperEmail();
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-200 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Mail className="w-3 h-3 text-purple-300" />
                  <span>Email Ayush</span>
                </button>

                <a
                  href="https://portfolio-jade-two-92.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#1C263A] hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 flex items-center justify-center transition-colors shadow-xs"
                  title="Ayush Pandey Portfolio Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://www.linkedin.com/in/ayush-pandey-a9161b275"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#1C263A] hover:bg-[#25334d] border border-blue-500/25 text-blue-400 flex items-center justify-center transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://github.com/ayush123-star"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-xl bg-[#1C263A] hover:bg-[#25334d] border border-purple-500/25 text-purple-300 flex items-center justify-center transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsDeveloperModalOpen(true);
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-[#1C263A] hover:bg-[#25334d] border border-purple-500/25 text-[#AAB3C5] hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Modal &rarr;
                </button>
              </div>
            </div>

            {/* 4. THEME & SIGN OUT FOOTER */}
            <div className="pt-2 border-t border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#151C30] hover:bg-[#1C263A] text-slate-200 border border-purple-500/20 transition-colors"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                </button>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 flex items-center gap-1.5 border border-red-500/25"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 4. Rich Interactive Developer Profile Modal (Loaded with Ayush's Real Portfolio Data) */}
      {isDeveloperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1C263A] rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-purple-500/30 relative text-white space-y-4">
            <button
              onClick={() => setIsDeveloperModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#151C30] hover:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[#AAB3C5] hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7955E8]">
                MITS CANTEEN PLATFORM
              </span>
              <h3 className="text-xl font-black text-white">LEAD DEVELOPER PORTFOLIO</h3>
            </div>

            {/* Profile Hero Card */}
            <div className="bg-gradient-to-b from-[#151C30] to-[#121829] rounded-2xl p-4 sm:p-5 border border-purple-500/25 flex flex-col items-center text-center space-y-3 shadow-inner">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[#7955E8] to-[#526DFF] shadow-lg shadow-purple-500/30">
                  <img
                    src="/assets/developer/ayush_pandey.jpg"
                    alt="Ayush Pandey"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/campus/ayush_pandey.jpg';
                    }}
                  />
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#151C30] flex items-center justify-center text-[10px] text-white font-bold" title="Verified Creator">
                  ✓
                </span>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Ayush Pandey
                </h4>
                <p className="text-xs text-purple-300 font-bold mt-0.5">
                  B.Tech &bull; Electronics & Telecommunication Engineering (2025–2029)
                </p>
                <p className="text-[11px] text-[#AAB3C5] mt-0.5">
                  Madhav Institute of Technology & Science (MITS), Gwalior
                </p>
              </div>

              {/* Social & Portfolio Action Icons Row */}
              <div className="flex items-center gap-2 pt-1">
                {/* 🌐 Portfolio Website Icon Link */}
                <a
                  href="https://portfolio-jade-two-92.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#1C263A] hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="Ayush Pandey Portfolio Website"
                >
                  <Globe className="w-4 h-4" />
                </a>

                {/* 💼 LinkedIn Icon Link */}
                <a
                  href="https://www.linkedin.com/in/ayush-pandey-a9161b275"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#1C263A] hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>

                {/* 🐙 GitHub Icon Link */}
                <a
                  href="https://github.com/ayush123-star"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#1C263A] hover:bg-purple-500/30 border border-purple-500/20 text-[#AAB3C5] hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>

                {/* ✉️ Direct Gmail Icon Launcher */}
                <button
                  type="button"
                  onClick={handleContactDeveloperEmail}
                  className="w-9 h-9 rounded-xl bg-[#1C263A] hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-purple-200 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Send Email to pandeyayush1603@gmail.com"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 💼 Work Experience & Internship Section */}
            <div className="bg-[#151C30]/80 rounded-2xl p-3.5 border border-purple-500/20 space-y-2 text-left">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>INTERNSHIP & WORK EXPERIENCE</span>
              </div>
              <div className="bg-[#0C1222] p-3 rounded-xl border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Web Development Intern</h5>
                  <span className="text-[10px] text-purple-300 font-mono">Sep 2026 – Oct 2026</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold">Thiranex</p>
                <p className="text-[11px] text-[#AAB3C5] leading-relaxed">
                  Developed responsive web interfaces, integrated front-end components with back-end services, optimized web performance, and debugged application workflows.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 pl-1">
                &bull; Shortlisted for App & AI/ML Internships at UPTOSKILLS & ROBOKWIK.COM via National Internship Portal.
              </p>
            </div>

            {/* 📡 Clubs & Technical Societies Section */}
            <div className="bg-[#151C30]/80 rounded-2xl p-3.5 border border-purple-500/20 space-y-2 text-left">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Award className="w-4 h-4 text-purple-400" />
                <span>CLUBS, SOCIETIES & COMMUNITIES</span>
              </div>
              <div className="bg-[#0C1222] p-3 rounded-xl border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">Technical Team Member</h5>
                  <span className="text-[10px] text-emerald-400 font-mono">Oct 2026 – Present</span>
                </div>
                <p className="text-[11px] text-blue-400 font-semibold">IEEE MTT-S Student Branch Chapter, MITS-DU</p>
                <p className="text-[11px] text-[#AAB3C5] leading-relaxed">
                  Contributing to technical sessions, workshops, RF & microwave systems, hands-on student projects, and society-level technical operations.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 pl-1">
                &bull; Member: IETE Students' Forum, MITS-DU &bull; Google Student Ambassador Program 2026.
              </p>
            </div>

            {/* Direct CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href="https://portfolio-jade-two-92.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Live Portfolio</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <button
                type="button"
                onClick={handleContactDeveloperEmail}
                className="py-2.5 px-3 rounded-xl bg-[#151C30] hover:bg-[#1f2942] border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Email Developer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
