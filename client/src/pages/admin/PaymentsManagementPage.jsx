import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  Calendar,
  CreditCard,
  QrCode,
  ArrowUpRight,
  GraduationCap,
  Building
} from 'lucide-react';

export const PaymentsManagementPage = () => {
  const { user } = useAuth();
  const { orders, canteens, markCashPaymentCollected } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  // Helper to accurately resolve student enrollment number and department
  const getStudentDetails = (ord) => {
    let savedUsers = [];
    try {
      savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users')) || [];
    } catch {
      savedUsers = [];
    }

    const cleanOrdName = (ord.studentName || '').toLowerCase().trim();
    const cleanOrdPhone = String(ord.studentPhone || '').replace(/\D/g, '');

    const foundUser = savedUsers.find((u) => {
      if (ord.studentId && (u.id === ord.studentId || u._id === ord.studentId)) return true;
      if (cleanOrdName && u.name && u.name.toLowerCase().trim() === cleanOrdName) return true;
      if (cleanOrdPhone && u.phone && u.phone.replace(/\D/g, '') === cleanOrdPhone) return true;
      return false;
    });

    // 1. Resolve Enrollment Number
    let enrollment =
      ord.studentEnrollment ||
      ord.studentRoll ||
      ord.enrollmentNumber ||
      foundUser?.studentId ||
      foundUser?.rollNumber ||
      'BTET25O1039';

    // 2. Resolve Academic Department
    let department =
      (ord.studentDepartment &&
      ord.studentDepartment !== 'Campus' &&
      ord.studentDepartment !== 'General Campus' &&
      ord.studentDepartment !== 'Campus Department'
        ? ord.studentDepartment
        : null) ||
      foundUser?.department;

    if (!department) {
      const upperEnroll = String(enrollment).toUpperCase();
      if (upperEnroll.includes('CS')) department = 'Computer Science & Engineering';
      else if (upperEnroll.includes('IT')) department = 'Information Technology';
      else if (upperEnroll.includes('AI') || upperEnroll.includes('DS')) department = 'Artificial Intelligence & Data Science';
      else if (upperEnroll.includes('EC') || upperEnroll.includes('ET')) department = 'Electronics and Telecommunication';
      else if (upperEnroll.includes('ME')) department = 'Mechanical Engineering';
      else if (upperEnroll.includes('CE')) department = 'Civil Engineering';
      else if (upperEnroll.includes('EE')) department = 'Electrical Engineering';
      else department = 'Electronics and Telecommunication';
    }

    return {
      enrollment,
      department,
    };
  };

  // Owner's canteen details for QR
  const myCanteen = user?.canteenId
    ? canteens.find((c) => c._id === user.canteenId || c.id === user.canteenId) || canteens[0]
    : canteens[0];

  // Calculations
  const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const upiRevenue = nonCancelledOrders
    .filter((o) => o.paymentMethod === 'UPI')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const cashCollected = nonCancelledOrders
    .filter((o) => o.paymentMethod === 'CASH_AT_COUNTER' && o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const cashPending = nonCancelledOrders
    .filter((o) => o.paymentMethod === 'CASH_AT_COUNTER' && o.paymentStatus !== 'PAID')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Filter logic
  const filteredOrders = nonCancelledOrders.filter((ord) => {
    const { enrollment, department } = getStudentDetails(ord);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchToken = ord.tokenNumber.toLowerCase().includes(q);
      const matchName = ord.studentName?.toLowerCase().includes(q);
      const matchEnroll = enrollment.toLowerCase().includes(q);
      const matchDept = department.toLowerCase().includes(q);
      if (!matchToken && !matchName && !matchEnroll && !matchDept) return false;
    }

    if (filterMethod !== 'ALL' && ord.paymentMethod !== filterMethod) return false;
    if (filterStatus === 'PAID' && ord.paymentStatus !== 'PAID') return false;
    if (filterStatus === 'UNPAID' && ord.paymentStatus === 'PAID') return false;

    if (filterDepartment !== 'ALL') {
      if (!department.toLowerCase().includes(filterDepartment.toLowerCase())) return false;
    }

    return true;
  });

  const handleCollectCash = (order) => {
    markCashPaymentCollected(order.id);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-400" />
            Cash & Online Payments Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB3C5] mt-1">
            Real-time tracking of UPI collections, at-counter cash handovers, student enrollment IDs and academic departments.
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:from-[#6842df] hover:to-[#3d5bff] text-white text-xs font-black shadow-md shadow-purple-500/30 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>Configure Canteen QR & UPI</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1b. Canteen QR Quick Status Banner */}
      <div className="p-4 rounded-3xl border border-purple-500/25 bg-gradient-to-r from-[#1C263A] via-[#151C30] to-[#1C263A] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white flex items-center justify-center shrink-0 shadow-md">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {myCanteen?.qrCodeImage ? 'Custom Payment QR Active' : 'Default Dynamic QR Active'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live for Students
              </span>
            </div>
            <p className="text-xs text-[#AAB3C5] mt-0.5">
              Receiving UPI ID: <strong className="font-mono text-purple-300">{myCanteen?.upiId || 'campus.canteen@okhdfcbank'}</strong> • Payee: <strong className="text-white">{myCanteen?.upiMerchantName || myCanteen?.name || 'MITS Main Canteen'}</strong>
            </p>
          </div>
        </div>
        <Link
          to="/admin/settings"
          className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 shrink-0"
        >
          Change QR Code & UPI Details &rarr;
        </Link>
      </div>

      {/* 2. Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Total Sales Today</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white privacy-sensitive" title="Protected by Privacy Shield">₹{totalRevenue}</span>
            <div className="w-10 h-10 rounded-2xl bg-[#151C30] border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
              💰
            </div>
          </div>
        </div>

        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">UPI / QR (Online)</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-300">₹{upiRevenue}</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Cash Collected</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">₹{cashCollected}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C263A]/85 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-xl">
          <p className="text-[11px] font-bold text-[#AAB3C5] uppercase tracking-wider">Pending Counter Cash</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-400">₹{cashPending}</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token #TK-101, student name, enrollment no, or department..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#151C30] border border-purple-500/30 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-[#7955E8]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science (CSE)</option>
            <option value="Information Technology">Information Technology (IT)</option>
            <option value="Artificial Intelligence">AI & Data Science</option>
            <option value="Electronics">Electronics & Telecom (ET)</option>
            <option value="Mechanical">Mechanical Engg</option>
            <option value="Electrical">Electrical Engg</option>
            <option value="Civil">Civil Engg</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="UPI">UPI / QR Only</option>
            <option value="CASH_AT_COUNTER">Cash at Counter</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#151C30] border border-purple-500/30 text-xs font-bold text-white focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid / Cleared</option>
            <option value="UNPAID">Pending Collection</option>
          </select>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-[#1C263A]/90 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151C30] text-[#AAB3C5] font-extrabold uppercase tracking-wider border-b border-purple-500/20">
              <tr>
                <th className="py-4 px-5">Order Token</th>
                <th className="py-4 px-4">Student & Enrollment No.</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Method</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Order Status</th>
                <th className="py-4 px-5 text-right">Counter Cash Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#AAB3C5]">
                    No payment records match filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isPaid = ord.paymentStatus === 'PAID';
                  const isCash = ord.paymentMethod === 'CASH_AT_COUNTER';
                  const { enrollment, department } = getStudentDetails(ord);

                  return (
                    <tr key={ord.id || ord._id} className="hover:bg-[#151C30]/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-black text-white">
                        #{ord.tokenNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-extrabold text-white text-xs sm:text-sm">
                            {ord.studentName || 'Ayush Pandey'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#151C30] text-purple-200 text-[10px] font-mono font-bold border border-purple-500/30"
                              title="Student Enrollment / Roll Number"
                            >
                              <GraduationCap className="w-3 h-3 text-purple-400 shrink-0" />
                              <span className="text-[#AAB3C5] font-sans font-semibold">Enroll:</span>
                              <span className="text-white font-black">{enrollment}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 text-[11px] font-bold border border-purple-500/30 shadow-xs">
                          <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate max-w-[190px]" title={department}>
                            {department}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-white text-sm">
                        ₹{ord.finalAmount || ord.totalAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ord.paymentMethod === 'UPI'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {ord.paymentMethod === 'UPI' ? 'UPI / QR' : 'Cash Counter'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-black text-xs ${
                            isPaid ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {isPaid ? 'PAID ✓' : 'PENDING ⏳'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#AAB3C5] font-bold">
                        {ord.status}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {isCash && !isPaid ? (
                          <button
                            onClick={() => handleCollectCash(ord)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] shadow-sm transition-all inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Collect ₹{ord.finalAmount}
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#AAB3C5] font-semibold italic">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagementPage;
