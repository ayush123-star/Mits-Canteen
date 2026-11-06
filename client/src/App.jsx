import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChangePasswordModal } from './components/common/ChangePasswordModal';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';

// Public & Auth Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
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

// Super Admin Portal Pages
import { SuperAdminDashboard } from './pages/superAdmin/SuperAdminDashboard';
import { OwnerManagementPage } from './pages/superAdmin/OwnerManagementPage';
import { StudentManagementPage } from './pages/superAdmin/StudentManagementPage';
import { BusinessReportsPage } from './pages/superAdmin/BusinessReportsPage';
import { SystemAuditLogsPage } from './pages/superAdmin/SystemAuditLogsPage';
import { SuperAdminSettingsPage } from './pages/superAdmin/SuperAdminSettingsPage';

// Protected Route Guard with Role Isolation
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user?.role === 'canteen_admin' || user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <DataProvider>
          <AuthProvider>
            <CartProvider>
              <SocketProvider>
                {/* Mandatory First-Login Password Change Modal */}
                <ChangePasswordModal />

                <Routes>
                {/* 1. PUBLIC STANDALONE SCREENS */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/live-tokens" element={<LiveTokenDisplay />} />

                {/* 2. STUDENT PORTAL (Zomato-inspired, zero-queue dining) */}
                <Route element={<StudentLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Student Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/my-orders"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feedback"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <FeedbackPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/feedback"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <FeedbackPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentProfilePage />
                      </ProtectedRoute>
                    }
                  />
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
                  <Route path="menu" element={<MenuManagementPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="recipes" element={<RecipeManagementPage />} />
                  <Route path="stock-history" element={<StockHistoryPage />} />
                  <Route path="payments" element={<PaymentsManagementPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<CanteenSettingsPage />} />
                  <Route path="homepage-manager" element={<HomepageManagerPage />} />
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
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </DataProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
