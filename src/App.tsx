import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ShoppingCart, FileText, ShieldCheck, Users, Settings } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProductsProvider } from './context/ProductsContext';

import { AdminLayout } from './components/layout/AdminLayout';
import { ProductsPage } from './pages/ProductsPage';
import { LoginPage } from './pages/LoginPage';
import { SectionPlaceholderPage } from './pages/SectionPlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StorefrontPreviewModal } from './components/products/StorefrontPreviewModal';

// Route guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Fullscreen Public Storefront Page for /website-preview
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
              {/* Public Login Route */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Direct Website Preview */}
              <Route path="/website-preview" element={<FullStorefrontPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/products" replace />} />
                <Route path="products" element={<ProductsPage />} />
                <Route
                  path="orders"
                  element={
                    <SectionPlaceholderPage
                      title="B2B Orders & Invoices"
                      subtitle="Manage wholesale purchase orders, payment terms, and automated shipping manifests."
                      icon={ShoppingCart}
                      badge="14 Active Inquiries"
                    />
                  }
                />
                <Route
                  path="quotes"
                  element={
                    <SectionPlaceholderPage
                      title="Custom Synthesis Quotes"
                      subtitle="Review custom peptide sequence requests, gram-scale volume inquiries, and purity requirements."
                      icon={FileText}
                      badge="3 Pending Requests"
                    />
                  }
                />
                <Route
                  path="coa"
                  element={
                    <SectionPlaceholderPage
                      title="COA & Batch Testing Reports"
                      subtitle="High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS) batch certificate management."
                      icon={ShieldCheck}
                      badge="Certificates Repository"
                    />
                  }
                />
                <Route
                  path="customers"
                  element={
                    <SectionPlaceholderPage
                      title="Institutional Clients"
                      subtitle="Manage verified research laboratories, university accounts, and tier-based trade discounts."
                      icon={Users}
                      badge="Client Directory"
                    />
                  }
                />
                <Route
                  path="settings"
                  element={
                    <SectionPlaceholderPage
                      title="Catalog Settings & API"
                      subtitle="Configure inventory alerts, currency defaults, shipping zones, and webhook integrations."
                      icon={Settings}
                      badge="System Preferences"
                    />
                  }
                />
              </Route>

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/admin/products" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ProductsProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
