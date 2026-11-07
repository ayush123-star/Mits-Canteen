import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  Crown,
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
  Activity,
  FileText
} from 'lucide-react';

export const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const { ownerInvitations } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingInvitesCount = ownerInvitations.filter((i) => i.status === 'PENDING').length;

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'System Overview', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Canteen Owners & Invites', path: '/super-admin/owners', icon: Building2, badge: pendingInvitesCount, badgeColor: 'bg-purple-600' },
    { label: 'Student Directory', path: '/super-admin/students', icon: Users },
    { label: 'Multi-Canteen Performance', path: '/super-admin/business', icon: BarChart3 },
    { label: 'System Audit Logs', path: '/super-admin/audit-logs', icon: Activity },
    { label: 'Platform Settings', path: '/super-admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] flex text-white">
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
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Campus Directorate &bull; MITS
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

          {/* Directorate Badge */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#AAB3C5] tracking-wider block">
              Governance Scope
            </span>
            <p className="font-black text-white mt-0.5">Central Campus Directorate</p>
            <div className="mt-2 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-300">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                System 100% Online
              </span>
            </div>
          </div>

          {/* Navigation */}
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
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-purple-300'}`} />
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

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs border border-purple-500/30">
                👑
              </div>
              <div className="truncate max-w-[130px]">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Directorate'}</p>
                <p className="text-[10px] text-purple-300">System Owner</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-lg text-[#AAB3C5] hover:text-red-400 hover:bg-[#1C263A]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 bg-[#0B1020]">
        {/* Top Header */}
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
                Super Admin Directorate Console
              </h1>
              <p className="text-[11px] text-[#AAB3C5]">
                Campus-Wide Canteen Operations & Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/super-admin/owners"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/30 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Owner Invite</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
