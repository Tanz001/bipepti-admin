import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProductsProvider } from './context/ProductsContext';

import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StorefrontPreviewModal } from './components/products/StorefrontPreviewModal';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FB] text-sm text-[#5F7088]">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const FullStorefrontPage: React.FC = () => {
  return (
    <StorefrontPreviewModal
      isOpen={true}
      onClose={() => {
        window.history.back();
      }}
    />
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ProductsProvider>
            <Routes>
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/website-preview" element={<FullStorefrontPage />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ProductsProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
