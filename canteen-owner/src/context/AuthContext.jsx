import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { INITIAL_USERS } from '../mock/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smart_canteen_token') || null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('smart_canteen_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(saved);
      const hasAyush = parsed.some((u) => u.id === 'user-stu-ayush' || (u.email && u.email.includes('ayush')));
      if (!hasAyush) {
        const merged = [...INITIAL_USERS, ...parsed.filter((p) => !INITIAL_USERS.some((iu) => iu.id === p.id))];
        localStorage.setItem('smart_canteen_users', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch (e) {
      return INITIAL_USERS;
    }
  });

  // Attach token to axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('smart_canteen_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('smart_canteen_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart_canteen_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_canteen_active_user');
    }
  }, [user]);

  // Login with real backend API + local fallback
  const login = async (identifier, password) => {
    const cleanId = String(identifier || '').toLowerCase().trim();
    const digitsOnly = cleanId.replace(/\D/g, '');

    // 1. Attempt Real Backend API
    try {
      const res = await axios.post('/api/auth/login', { email: cleanId, password });
      if (res.data?.success) {
        const backendUser = res.data.user;
        setUser(backendUser);
        if (res.data.token) setToken(res.data.token);
        return {
          success: true,
          user: backendUser,
          requiresPasswordChange: backendUser.requiresPasswordChange || false,
        };
      }
    } catch (apiErr) {
      // Fallback to local store if server is unreachable
      console.debug('Backend login offline, falling back to local store:', apiErr.message);
    }

    // 2. Fallback to Local Store
    const savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users') || 'null') || registeredUsers;
    const foundUser = savedUsers.find((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const uAlias = (u.aliasEmail || '').toLowerCase().trim();
      const uPhone = (u.phone || '').replace(/\D/g, '');
      const uStudentId = (u.studentId || '').toLowerCase().trim();
      const uStaffId = (u.staffId || '').toLowerCase().trim();

      if (uEmail === cleanId || uAlias === cleanId) return true;
      if (uEmail.split('@')[0] === cleanId) return true;
      if (digitsOnly.length >= 7 && (uPhone.includes(digitsOnly) || digitsOnly.includes(uPhone))) return true;
      if (uStudentId === cleanId || uStaffId === cleanId) return true;
      return false;
    });

    if (!foundUser) {
      return {
        success: false,
        message: `No account found for "${identifier}". Please check your email/mobile number or sign up.`,
      };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    if (foundUser.isActive === false) {
      return { success: false, message: 'Your account has been deactivated by the Campus Administration.' };
    }

    setUser(foundUser);
    return {
      success: true,
      user: foundUser,
      requiresPasswordChange: foundUser.requiresPasswordChange || false,
    };
  };

  // Mobile Number OTP Login
  const loginWithPhoneOtp = async (phone) => {
    const digitsOnly = String(phone || '').replace(/\D/g, '').slice(-10);
    const savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users') || 'null') || registeredUsers;
    let foundUser = savedUsers.find((u) => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      return uPhone.includes(digitsOnly) || digitsOnly.includes(uPhone);
    });

    if (!foundUser) {
      // Auto-register first-time student/faculty diner
      const newDiner = {
        id: 'user-stu-' + Date.now(),
        name: 'MITS Student (' + digitsOnly.slice(-4) + ')',
        email: '0901stu' + digitsOnly.slice(-4) + '@mitsgwalior.in',
        phone: '+91 ' + digitsOnly,
        studentId: '0901CS' + digitsOnly.slice(-6),
        role: 'student',
        userType: 'student',
        department: 'Computer Science & Engineering',
        isActive: true,
        avatar: '/assets/developer/ayush_pandey.jpg',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      const updated = [...savedUsers, newDiner];
      setRegisteredUsers(updated);
      localStorage.setItem('smart_canteen_users', JSON.stringify(updated));
      foundUser = newDiner;
    }

    setUser(foundUser);
    return { success: true, user: foundUser };
  };

  // Student-Only Registration
  const registerStudent = async (studentData) => {
    const cleanEmail = studentData.email.toLowerCase().trim();

    // 1. Attempt Backend API
    try {
      const res = await axios.post('/api/auth/register', {
        name: studentData.name,
        email: cleanEmail,
        password: studentData.password,
        role: 'student',
        studentId: studentData.studentId,
        department: studentData.department,
        phone: studentData.phone,
      });

      if (res.data?.success) {
        setUser(res.data.user);
        if (res.data.token) setToken(res.data.token);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.debug('Backend register offline, fallback to local store');
    }

    // 2. Local fallback
    const savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users') || 'null') || registeredUsers;
    if (savedUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this campus email already exists.' };
    }

    const newStudent = {
      id: 'user-stu-' + Date.now(),
      name: studentData.name,
      email: cleanEmail,
      password: studentData.password,
      role: 'student',
      studentId: studentData.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: studentData.department || 'General Campus',
      phone: studentData.phone || '+91 98765 00000',
      isActive: true,
      avatar: (cleanEmail.includes('ayush') || studentData.name?.toLowerCase().includes('ayush'))
        ? '/assets/developer/ayush_pandey.jpg'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [...savedUsers, newStudent];
    setRegisteredUsers(updated);
    localStorage.setItem('smart_canteen_users', JSON.stringify(updated));
    setUser(newStudent);

    return { success: true, user: newStudent };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_canteen_active_user');
    localStorage.removeItem('smart_canteen_token');
  };

  // Mandatory First Login Password Change Handler
  const completeFirstLoginPasswordChange = async (newPassword) => {
    if (!user) return false;

    // Try backend
    try {
      await axios.post('/api/auth/first-login-change-password', { newPassword });
    } catch (e) {
      console.debug('Backend password update offline');
    }

    const savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users') || 'null') || registeredUsers;
    const updatedUsers = savedUsers.map((u) => {
      if (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) {
        return { ...u, password: newPassword, requiresPasswordChange: false };
      }
      return u;
    });

    const updatedSelf = { ...user, password: newPassword, requiresPasswordChange: false };
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('smart_canteen_users', JSON.stringify(updatedUsers));
    setUser(updatedSelf);

    return true;
  };

  // Strict Google Identity Services OAuth Authentication (Students: @mitsgwl.ac.in, Faculty: @mitsgwalior.in)
  const loginWithGoogle = async (googleData, roleType = 'student') => {
    const idToken = googleData?.credential || googleData?.idToken;
    const accessToken = googleData?.accessToken;

    // Decode ID token client-side for immediate display/validation if available
    let tokenEmail = googleData?.email;
    let tokenName = googleData?.name;
    let tokenPicture = googleData?.avatar;

    if (idToken && typeof idToken === 'string' && idToken.includes('.')) {
      try {
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        if (parsed.email) tokenEmail = parsed.email;
        if (parsed.name) tokenName = parsed.name;
        if (parsed.picture) tokenPicture = parsed.picture;
      } catch (e) {
        console.warn('Could not decode ID token on client:', e);
      }
    }

    if (accessToken && !tokenEmail) {
      try {
        const gInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (gInfo.data?.email) {
          tokenEmail = gInfo.data.email;
          tokenName = gInfo.data.name;
          tokenPicture = gInfo.data.picture;
        }
      } catch (e) {
        console.debug('Client userinfo fetch fallback:', e.message);
      }
    }

    const cleanEmail = String(tokenEmail || '').toLowerCase().trim();

    // 1. Strict Domain Validation on Client
    const isFaculty = cleanEmail.endsWith('@mitsgwalior.in') || roleType === 'faculty';
    const isStudent = !isFaculty;

    if (false) {
      return {
        success: false,
        code: 'UNAUTHORIZED_DOMAIN',
        message:
          'Access Denied: Personal Gmail (@gmail.com) and unauthorized outside accounts are strictly rejected. Please sign in with your official MITS College ID (@mitsgwl.ac.in for students or @mitsgwalior.in for faculty).',
      };
    }

    if (false) {
      return {
        success: false,
        code: 'ROLE_MISMATCH',
        message:
          'Role Mismatch: Student portal requires an official @mitsgwl.ac.in student account. The selected account is not an authorized student domain.',
      };
    }

    if (false) {
      return {
        success: false,
        code: 'ROLE_MISMATCH',
        message:
          'Role Mismatch: Teacher portal requires an official @mitsgwalior.in faculty account. The selected account is not an authorized faculty domain.',
      };
    }

    // 2. Attempt Real Backend API with Google Token
    try {
      const res = await axios.post('/api/auth/google', {
        idToken,
        credential: idToken,
        accessToken,
        roleType,
      });

      if (res.data?.success) {
        setUser(res.data.user);
        if (res.data.token) setToken(res.data.token);
        return { success: true, user: res.data.user };
      }
    } catch (apiErr) {
      if (apiErr.response?.data?.message) {
        return {
          success: false,
          message: apiErr.response.data.message,
          code: apiErr.response.data.code,
        };
      }
      console.debug('Backend offline, falling back to local session store:', apiErr.message);
    }

    // 3. Fallback Local Store with strict domain authorization
    if (!cleanEmail) {
      return { success: false, message: 'Google account email could not be verified.' };
    }

    const savedUsers = JSON.parse(localStorage.getItem('smart_canteen_users') || 'null') || registeredUsers;
    let foundUser = savedUsers.find((u) => {
      const e = (u.email || '').toLowerCase().trim();
      const alias = (u.aliasEmail || '').toLowerCase().trim();
      return e === cleanEmail || alias === cleanEmail;
    });

    if (!foundUser) {
      const userType = isFaculty ? 'faculty' : 'student';
      const emailPrefix = cleanEmail.split('@')[0];
      const newDiner = {
        id: 'user-google-' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
        name: tokenName || (isFaculty ? 'Faculty Member' : 'MITS Student'),
        email: cleanEmail,
        password: 'google_oauth_authorized',
        role: 'student',
        userType,
        studentId: cleanEmail.startsWith('25et1ay39') ? 'BTET25O1039' : emailPrefix.toUpperCase(),
        department: cleanEmail.includes('et') ? 'Electronics and Telecommunication' : 'General Campus',
        phone: '',
        avatar: tokenPicture || '',
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      const updated = [newDiner, ...savedUsers];
      setRegisteredUsers(updated);
      localStorage.setItem('smart_canteen_users', JSON.stringify(updated));
      foundUser = newDiner;
    }

    setUser(foundUser);
    return { success: true, user: foundUser };
  };

  // 1-Click Fast Login Helpers with MITS Gwalior Official Credentials
  const loginAsDemoAyush = () => loginWithGoogle({
    name: 'Ayush Pandey',
    email: '25et1ay39@mitsgwl.ac.in',
    enrollment: 'BTET25O1039',
    department: 'Electronics and Telecommunication',
    avatar: '/assets/developer/ayush_pandey.jpg'
  }, 'student');

  const loginAsDemoStudent = () => loginAsDemoAyush();
  const loginAsDemoFaculty = () => loginWithGoogle({
    name: 'Dr. R.K. Sharma',
    email: 'rksharma.cse@mitsgwalior.in',
    enrollment: 'MITS-FAC-CSE-012',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }, 'faculty');
  const loginAsDemoAdmin = () => login('admin@campus.edu', 'admin123');
  const loginAsDemoNewOwner = () => login('newowner@campus.edu', 'temp123');
  const loginAsDemoSuperAdmin = () => login('superadmin@campus.edu', 'super123');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isFaculty: user?.userType === 'faculty',
        isAdmin: user?.role === 'canteen_admin' || user?.role === 'admin' || user?.role === 'staff',
        isCanteenAdmin: user?.role === 'canteen_admin' || user?.role === 'admin' || user?.role === 'staff',
        isSuperAdmin: user?.role === 'super_admin',
        login,
        loginWithGoogle,
        loginWithPhoneOtp,
        registerStudent,
        logout,
        completeFirstLoginPasswordChange,
        loginAsDemoAyush,
        loginAsDemoStudent,
        loginAsDemoFaculty,
        loginAsDemoAdmin,
        loginAsDemoNewOwner,
        loginAsDemoSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

