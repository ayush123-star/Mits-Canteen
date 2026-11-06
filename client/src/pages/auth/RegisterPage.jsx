import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MitsCampusBackground } from '../../components/common/MitsCampusBackground';
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  GraduationCap,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building
} from 'lucide-react';

export const RegisterPage = () => {
  const [userType, setUserType] = useState('student'); // 'student' | 'teacher'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: 'Electronics and Telecommunication',
    phone: '',
  });
  const [error, setError] = useState('');

  const { user, isAuthenticated, registerStudent } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Kripya valid email address enter karein (jaise: yourname@mitsgwl.ac.in).');
      return;
    }

    const isInstituteEmail = cleanEmail.endsWith('@mitsgwl.ac.in') || cleanEmail.endsWith('@mitsgwalior.in');
    if (!isInstituteEmail) {
      setError('Access Denied: Keval authorized MITS College email ID (@mitsgwl.ac.in students ke liye aur @mitsgwalior.in teachers ke liye) hi allowed hai.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await registerStudent({
      name: formData.name,
      email: cleanEmail,
      password: formData.password,
      role: 'student',
      userType,
      studentId: formData.studentId,
      department: formData.department,
      phone: formData.phone,
    });

    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0B1020]">
      {/* Real Animated MITS Gwalior Campus Drone Reel / Cinematic View */}
      <MitsCampusBackground overlay="auth" showBadge={true} showControls={true} />

      <div className="relative z-10 w-full max-w-lg bg-[#1C263A]/90 backdrop-blur-2xl rounded-3xl border border-purple-500/20 shadow-2xl p-6 sm:p-8 space-y-6 text-white card-3d">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 border-2 border-purple-500/30">
            <img
              src="/images/mits/mits-logo.png"
              alt="MITS Gwalior Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            MITS Campus Registration
          </h2>
          <p className="text-xs text-[#AAB3C5]">
            Madhav Institute of Technology & Science, Gwalior &bull; Main Canteen Express
          </p>
        </div>

        {/* User Category Tabs: Student or Teacher */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#151C30] border border-purple-500/20">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              userType === 'student'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>MITS Student</span>
          </button>

          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              userType === 'teacher'
                ? 'bg-gradient-to-r from-[#7955E8] to-[#526DFF] text-white shadow-lg shadow-purple-500/30'
                : 'text-[#AAB3C5] hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Faculty / Teacher</span>
          </button>
        </div>

        {/* Security Role Notice */}
        <div className="p-3 rounded-2xl bg-[#151C30] border border-purple-500/20 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-[#AAB3C5]">Registering As:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {userType === 'student' ? 'MITS Student Diner' : 'MITS Faculty Member'}
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#AAB3C5] block mb-1">
              {userType === 'student' ? 'Student Full Name' : 'Faculty Full Name & Title (e.g. Dr. / Prof.)'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={userType === 'student' ? "Ayush Pandey" : "Dr. Rajesh Sharma"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#AAB3C5] block mb-1">
              Institute Email ID (@mitsgwl.ac.in / @mitsgwalior.in)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={userType === 'student' ? "25et1ay39@mitsgwl.ac.in" : "prof.name@mitsgwalior.in"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] focus:ring-1 focus:ring-[#7955E8] font-mono"
              />
            </div>
            <p className="text-[10px] text-purple-300 mt-1">
              Students: @mitsgwl.ac.in &bull; Faculty: @mitsgwalior.in (Strictly Institute Emails Only)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#AAB3C5] block mb-1">
                {userType === 'student' ? 'Enrollment Number / Roll No.' : 'Employee / Faculty ID (Optional)'}
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder={userType === 'student' ? "BTET25O1039" : "MITS-FAC-042"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8] font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#AAB3C5] block mb-1">Mobile (for WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#AAB3C5] block mb-1">Academic Department</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 font-semibold text-white focus:outline-none focus:border-[#7955E8]"
              >
                <option value="Electronics & Telecommunication" className="bg-[#151C30] text-white">Electronics and Telecommunication (ET)</option>
                <option value="Computer Science & Engineering" className="bg-[#151C30] text-white">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology" className="bg-[#151C30] text-white">Information Technology (IT)</option>
                <option value="Artificial Intelligence & Data Science" className="bg-[#151C30] text-white">Artificial Intelligence & Data Science (AI & DS)</option>
                <option value="Mechanical Engineering" className="bg-[#151C30] text-white">Mechanical Engineering</option>
                <option value="Electrical Engineering" className="bg-[#151C30] text-white">Electrical Engineering</option>
                <option value="Civil Engineering" className="bg-[#151C30] text-white">Civil Engineering</option>
                <option value="Architecture & Planning" className="bg-[#151C30] text-white">Architecture & Planning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#AAB3C5] block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#AAB3C5] block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAB3C5]" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151C30] border border-purple-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#7955E8]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7955E8] to-[#526DFF] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-purple-500/20 text-xs text-[#AAB3C5]">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-[#7955E8] hover:text-purple-300 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
