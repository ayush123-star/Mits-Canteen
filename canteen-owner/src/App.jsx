import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChangePasswordModal } from './components/common/ChangePasswordModal';

// Layout
import { AdminLayout } from './layouts/AdminLayout';

// Canteen Owner Auth & Console Pages
import { OwnerLoginPage } from './pages/auth/OwnerLoginPage';
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
import { LiveTokenDisplay } from './pages/LiveTokenDisplay';

// Protected Route Guard for Canteen Owner Portal
const OwnerProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure user has canteen_admin or admin role
  if (user?.role !== 'canteen_admin' && user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard for Owner Login
const OwnerPublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && (user?.role === 'canteen_admin' || user?.role === 'admin' || user?.role === 'super_admin')) {
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
                <ChangePasswordModal />

                <Routes>
                  {/* Canteen Owner Authentication Gate */}
                  <Route
                    path="/login"
                    element={
                      <OwnerPublicRoute>
                        <OwnerLoginPage />
                      </OwnerPublicRoute>
                    }
                  />

                  {/* Kiosk TV Display */}
                  <Route path="/live-tokens" element={<LiveTokenDisplay />} />

                  {/* Canteen Owner Console Portal */}
                  <Route
                    path="/"
                    element={
                      <OwnerProtectedRoute>
                        <AdminLayout />
                      </OwnerProtectedRoute>
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
                    <Route path="feedback" element={<AdminFeedbackPage />} />
                  </Route>

                  {/* Direct /admin aliases */}
                  <Route
                    path="/admin"
                    element={
                      <OwnerProtectedRoute>
                        <AdminLayout />
                      </OwnerProtectedRoute>
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
                    <Route path="feedback" element={<AdminFeedbackPage />} />
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
