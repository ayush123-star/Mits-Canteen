import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  UtensilsCrossed,
  Clock,
  Layers,
  BookOpen,
  History,
  DollarSign,
  BarChart3,
  Settings,
  Power,
  Flame,
  LogOut,
  Menu,
  X,
  Tv,
  Bell,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { canteens, toggleCanteenStatus, orders, inventoryItems } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rushHour, setRushHour] = useState(false);
  
  // Privacy & Screen Lock States for Canteen Owner
  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('canteen_counter_privacy') === 'true';
  });
  const [isConsoleLocked, setIsConsoleLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('canteen_counter_privacy', String(next));
      return next;
    });
  };

  const location = useLocation();
  const navigate = useNavigate();

  const currentCanteen = canteens[0] || { id: 'canteen-1', name: 'Main Campus Food Court', isOpen: true };
  const pendingOrdersCount = orders.filter((o) => ['Placed', 'Accepted', 'Preparing'].includes(o.status)).length;
  const lowStockCount = inventoryItems.filter((i) => i.currentQuantity <= i.minimumStockLevel).length;

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Live Orders Queue', path: '/admin/dashboard', icon: Clock, badge: pendingOrdersCount },
    { label: 'Menu Catalog', path: '/admin/menu', icon: Layers },
    { label: 'Raw Materials & Stock', path: '/admin/inventory', icon: BookOpen, badge: lowStockCount, badgeColor: 'bg-purple-600' },
    { label: 'Recipe Studio', path: '/admin/recipes', icon: UtensilsCrossed },
    { label: 'Stock History Ledger', path: '/admin/stock-history', icon: History },
    { label: 'Cravings & Day Offers', path: '/admin/homepage-manager', icon: Flame, badge: 'Home', badgeColor: 'bg-gradient-to-r from-[#7955E8] to-[#526DFF]' },
    { label: 'Cash & Online Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Sales Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Payment QR & Settings', path: '/admin/settings', icon: QrCode },
  ];

  return (
    <div className={`min-h-screen bg-[#0B1020] flex text-white ${privacyMode ? 'counter-privacy-active' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1020]/95 backdrop-blur-xl border-r border-purple-500/20 text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-500/40 shrink-0">
                <img
                  src="/images/mits/mits-logo.png"
                  alt="MITS Gwalior"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white">MITS CANTEEN</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Manager &bull; Counter 1
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#AAB3C5] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Branch Pill */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#151C30] border border-purple-500/20">
            <span className="text-[10px] uppercase font-bold text-[#AAB3C5] tracking-wider block">
              Active Canteen
            </span>
            <p className="text-xs font-black text-white truncate mt-0.5">{currentCanteen.name}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/20 text-[11px]">
              <span className={`flex items-center gap-1 font-bold ${currentCanteen.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full ${currentCanteen.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                {currentCanteen.isOpen ? 'Accepting Orders' : 'Canteen Paused'}
              </span>
              <button
                onClick={() => toggleCanteenStatus(currentCanteen.id)}
                className="text-[10px] font-bold text-purple-300 hover:text-white hover:underline"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30'
                      : 'text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-purple-300" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${
                        item.badgeColor || 'bg-gradient-to-r from-[#7955E8] to-[#526DFF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: TV Display Shortcut & Profile */}
        <div className="p-4 border-t border-purple-500/20 space-y-3">
          <Link
            to="/live-tokens"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl bg-[#151C30] hover:bg-[#1C263A] text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-purple-400" /> Open Canteen TV Display
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/30 shrink-0 bg-slate-800">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'Admin'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/campus/ayush_pandey.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0) || 'M'}
                  </div>
                )}
              </div>
              <div className="truncate max-w-[130px]">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Canteen Manager'}</p>
                <p className="text-[10px] text-[#AAB3C5]">Canteen Admin</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-lg text-[#AAB3C5] hover:text-red-400 hover:bg-[#1C263A] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 bg-[#0B1020]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0B1020]/85 backdrop-blur-xl border-b border-purple-500/20 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-base font-black text-white tracking-tight">
                {currentCanteen.name}
              </h1>
              <p className="text-[11px] text-[#AAB3C5]">Live Kitchen Operations Console</p>
            </div>
          </div>

          {/* Quick Operational Controls */}
          <div className="flex items-center gap-2.5">
            {/* Canteen Open/Close Master Switch */}
            <button
              onClick={() => toggleCanteenStatus(currentCanteen.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                currentCanteen.isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentCanteen.isOpen ? 'Canteen OPEN' : 'Canteen CLOSED'}</span>
            </button>

            {/* Rush Hour Mode Switch */}
            <button
              onClick={() => setRushHour(!rushHour)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                rushHour
                  ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white ring-2 ring-purple-400 animate-pulse'
                  : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white border border-purple-500/20'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Rush Hour:</span> {rushHour ? 'ON (+10m)' : 'OFF'}
            </button>

            {/* Counter Privacy Shield Toggle */}
            <button
              onClick={togglePrivacyMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                privacyMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#151C30] text-[#AAB3C5] hover:bg-[#1C263A] hover:text-white border border-purple-500/20'
              }`}
              title={privacyMode ? "Privacy Mode Active: Sensitive Numbers Blurred" : "Turn ON Privacy Shield for Counter Protection"}
            >
              {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-[#AAB3C5]" />}
              <span className="hidden sm:inline">Privacy Shield:</span> {privacyMode ? 'ON' : 'OFF'}
            </button>

            {/* Quick Screen Lock Button */}
            <button
              onClick={() => {
                setUnlockPin('');
                setUnlockError('');
                setIsConsoleLocked(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#151C30] text-purple-300 border border-purple-500/30 hover:bg-[#1C263A] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Lock Canteen Console when stepping away from the counter"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Screen</span>
            </button>

            {/* Public TV Kiosk Shortcut */}
            <Link
              to="/live-tokens"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#151C30] border border-purple-500/30 text-purple-300 hover:bg-[#1C263A] hover:text-white transition-colors"
            >
              <Tv className="w-3.5 h-3.5 text-purple-400" />
              <span>Live Kiosk</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Fullscreen Canteen Owner Screen Lock (Away Mode) */}
      {isConsoleLocked && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1C263A] border-2 border-purple-500/40 rounded-3xl p-6 text-white text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Console Locked (Away Mode)</h3>
              <p className="text-xs text-[#AAB3C5] mt-1">
                Protected against counter peeking. Enter 4-digit Owner PIN to unlock.
              </p>
            </div>

            {unlockError && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                {unlockError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (unlockPin.trim() === '1957') {
                  setIsConsoleLocked(false);
                  setUnlockPin('');
                } else {
                  setUnlockError('Invalid PIN! Correct owner security PIN required.');
                }
              }}
              className="space-y-3"
            >
              <input
                type="password"
                autoFocus
                maxLength={10}
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Enter Owner PIN"
                className="w-full py-2.5 px-3 rounded-xl bg-[#151C30] border border-purple-500/30 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-purple-500/30"
              >
                Unlock Console
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
