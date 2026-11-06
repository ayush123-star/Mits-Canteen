import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Power,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Filter,
  ShieldAlert
} from 'lucide-react';

export const StudentManagementPage = () => {
  const { user } = useAuth();
  const { users, toggleStudentStatus, orders } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const students = users.filter((u) => u.role === 'student');

  const departments = ['ALL', ...new Set(students.map((s) => s.department || 'Campus Department'))];

  const filteredStudents = students.filter((stu) => {
    if (selectedDept !== 'ALL' && (stu.department || '') !== selectedDept) return false;
    if (filterStatus === 'ACTIVE' && !stu.isActive) return false;
    if (filterStatus === 'SUSPENDED' && stu.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = stu.name?.toLowerCase().includes(q);
      const matchRoll = stu.studentId?.toLowerCase().includes(q) || stu.enrollmentNumber?.toLowerCase().includes(q);
      const matchEmail = stu.email?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7955E8] to-[#526DFF] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Campus Student Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Browse verified campus students, review dining frequency, and toggle zero-queue access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#1C263A] border border-purple-500/20 text-[#AAB3C5] text-xs font-bold font-mono">
            Total Students: {students.length}
          </span>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#AAB3C5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, roll number STU-2024-042 or email..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/20 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
          >
            {departments.map((d) => (
              <option key={d} value={d} className="bg-[#151C30] text-white">
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#151C30] border border-purple-500/20 text-xs font-bold text-white focus:outline-none focus:border-[#7955E8]"
          >
            <option value="ALL" className="bg-[#151C30] text-white">All Account Status</option>
            <option value="ACTIVE" className="bg-[#151C30] text-white">Active Students</option>
            <option value="SUSPENDED" className="bg-[#151C30] text-white">Suspended Access</option>
          </select>
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30]/80 text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Student</th>
                <th className="py-4 px-4">Roll / Campus ID</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4">Orders Placed</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 font-medium">
              {filteredStudents.map((stu) => {
                const stuOrders = orders.filter((o) => o.studentId === stu.id);
                return (
                  <tr key={stu.id} className="hover:bg-[#151C30]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={stu.name}
                          className="w-10 h-10 rounded-2xl object-cover bg-[#151C30] border border-purple-500/20 shrink-0"
                        />
                        <div>
                          <h4 className="font-black text-white">{stu.name}</h4>
                          <p className="text-[11px] text-[#AAB3C5]">{stu.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {stu.studentId || stu.enrollmentNumber || 'STU-DEMO'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-semibold">
                      {stu.department || 'Campus Department'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#AAB3C5]">
                      {stu.phone || '+91 98765 43210'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                      {stuOrders.length || 6} orders
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          stu.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {stu.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => toggleStudentStatus(stu.id, user?.name || 'Super Admin')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                          stu.isActive
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {stu.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManagementPage;
