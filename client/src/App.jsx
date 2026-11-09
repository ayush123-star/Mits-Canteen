import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChangePasswordModal } from './components/common/ChangePasswordModal';
import { GlobalVoiceCallingAnnouncer } from './components/common/GlobalVoiceCallingAnnouncer';
import { AestheticCursorGlow } from './components/common/AestheticCursorGlow';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// Public & Auth Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { OwnerLoginPage } from './pages/auth/OwnerLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LiveTokenDisplay } from './pages/LiveTokenDisplay';
import { AboutPage } from './pages/AboutPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MenuPage } from './pages/student/MenuPage';
import { MyOrdersPage } from './pages/student/MyOrdersPage';
import { FeedbackPage } from './pages/student/FeedbackPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Canteen Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MenuManagementPage } from './pages/admin/MenuManagementPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { RecipeManagementPage } from './pages/admin/RecipeManagementPage';
import { StockHistoryPage } from './pages/admin/StockHistoryPage';
import { PaymentsManagementPage } from './pages/admin/PaymentsManagementPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { CanteenSettingsPage } from './pages/admin/CanteenSettingsPage';
import { HomepageManagerPage } from './pages/admin/HomepageManagerPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AllOrdersHistoryPage } from './pages/admin/AllOrdersHistoryPage';

// Super Admin Portal Pages
import { SuperAdminDashboard } from './pages/superAdmin/SuperAdminDashboard';
import { OwnerManagementPage } from './pages/superAdmin/OwnerManagementPage';
import { StudentManagementPage } from './pages/superAdmin/StudentManagementPage';
import { BusinessReportsPage } from './pages/superAdmin/BusinessReportsPage';
import { SystemAuditLogsPage } from './pages/superAdmin/SystemAuditLogsPage';
import { SuperAdminSettingsPage } from './pages/superAdmin/SuperAdminSettingsPage';

// Protected Route Guard with Role Isolation (Mandatory Login)
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isOwnerRoute = allowedRoles.includes('canteen_admin') || allowedRoles.includes('admin');

  if (!isAuthenticated) {
    return <Navigate to={isOwnerRoute ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (isOwnerRoute) return <Navigate to="/admin/login" replace />;
    if (user?.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user?.role === 'canteen_admin' || user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Auth Route Guard (Prevents logged-in users from seeing the login/register screen again)
const PublicAuthRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user?.role === 'canteen_admin' || user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <SocketProvider>
          <DataProvider>
            <AuthProvider>
              <CartProvider>
                {/* Global Ambient Cursor Spotlight for desktop users */}
                <AestheticCursorGlow />

                {/* Global Audio Chime & Speech Announcer across all pages */}
                <GlobalVoiceCallingAnnouncer />

                {/* Mandatory First-Login Password Change Modal */}
                <ChangePasswordModal />

                <Routes>
                {/* 1. PUBLIC AUTH SCREENS (Mandatory first gate for unauthenticated users) */}
                <Route
                  path="/login"
                  element={
                    <PublicAuthRoute>
                      <LoginPage />
                    </PublicAuthRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicAuthRoute>
                      <RegisterPage />
                    </PublicAuthRoute>
                  }
                />
                {/* Dedicated Canteen Owner Login Gate */}
                <Route path="/admin/login" element={<OwnerLoginPage />} />
                <Route path="/canteen-owner/login" element={<OwnerLoginPage />} />
                <Route path="/owner/login" element={<OwnerLoginPage />} />

                <Route path="/live-tokens" element={<LiveTokenDisplay />} />

                {/* 2. STUDENT PORTAL (MANDATORY LOGIN REQUIRED: Accessible only after login / registration) */}
                <Route
                  element={
                    <ProtectedRoute>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Student Protected Routes */}
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/student/my-orders" element={<MyOrdersPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/student/feedback" element={<FeedbackPage />} />
                  <Route path="/profile" element={<StudentProfilePage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                </Route>

                {/* 3. CANTEEN ADMIN / OWNER PORTAL */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['canteen_admin', 'admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AllOrdersHistoryPage />} />
                  <Route path="all-orders" element={<AllOrdersHistoryPage />} />
                  <Route path="menu" element={<MenuManagementPage />} />
                  <Route path="stock" element={<Navigate to="/admin/menu" replace />} />
                  <Route path="inventory" element={<Navigate to="/admin/menu" replace />} />
                  <Route path="recipes" element={<Navigate to="/admin/menu" replace />} />
                  <Route path="stock-history" element={<Navigate to="/admin/menu" replace />} />
                  <Route path="payments" element={<PaymentsManagementPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<CanteenSettingsPage />} />
                  <Route path="homepage-manager" element={<HomepageManagerPage />} />
                  <Route path="feedback" element={<AdminFeedbackPage />} />
                </Route>

                {/* Dedicated Alias Routes for Canteen Owner Portal */}
                <Route
                  path="/canteen-owner"
                  element={
                    <ProtectedRoute allowedRoles={['canteen_admin', 'admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AllOrdersHistoryPage />} />
                  <Route path="all-orders" element={<AllOrdersHistoryPage />} />
                  <Route path="menu" element={<MenuManagementPage />} />
                  <Route path="stock" element={<Navigate to="/canteen-owner/menu" replace />} />
                  <Route path="inventory" element={<Navigate to="/canteen-owner/menu" replace />} />
                  <Route path="recipes" element={<Navigate to="/canteen-owner/menu" replace />} />
                  <Route path="stock-history" element={<Navigate to="/canteen-owner/menu" replace />} />
                  <Route path="payments" element={<PaymentsManagementPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<CanteenSettingsPage />} />
                  <Route path="homepage-manager" element={<HomepageManagerPage />} />
                  <Route path="feedback" element={<AdminFeedbackPage />} />
                </Route>

                {/* 4. SUPER ADMIN PORTAL (Governance, 24h Owner Invites, Audits) */}
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <SuperAdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="dashboard" element={<SuperAdminDashboard />} />
                  <Route path="owners" element={<OwnerManagementPage />} />
                  <Route path="students" element={<StudentManagementPage />} />
                  <Route path="business" element={<BusinessReportsPage />} />
                  <Route path="audit-logs" element={<SystemAuditLogsPage />} />
                  <Route path="settings" element={<SuperAdminSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </DataProvider>
      </SocketProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
