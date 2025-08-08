import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
// import Users from './pages/User';
import Products from './pages/Product/Products';
import ProductList from './pages/Product/ProductList';
import 'bootstrap/dist/css/bootstrap.min.css';
import Banner from './components/Banner';
import AdminUsersPage from './pages/AdminUsers';
import SupplierList from './pages/Suppliers/SupplierList';
import AddSupplier from './pages/Suppliers/AddSupplier';
import EditSupplier from './pages/Suppliers/EditSupplier';
import ApproveSuppliers from './pages/Suppliers/ApproveSuppliers';
import SubBanner from './components/SubBanner';
import AdminLogin from './components/AdminLogin';
import { isLoggedIn, getAdminInfo } from './utils/auth';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/404/NotFound';
import PendingProductsPage from './pages/Suppliers/ApproveSuppliers';
import SupplierProductForm from './pages/SupplierProduct/SupplierProductForm';
import SupplierProductsPage from './pages/SupplierProduct/SupplierProductsPage';
import ScrollToTop from './components/ScrollToTop';
import SupplierProductList from './pages/Suppliers/SupplierProductlist';
import { ToastContainer } from 'react-toastify';
import Users from './pages/Users/User';
import Orders from './pages/orders/Orders';
import Offer from './components/Offer';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';
  const isAuthenticated = isLoggedIn();
  const adminInfo = getAdminInfo();

  // Helper function to check permissions
  const hasPermission = (requiredPermission) => {
    if (!adminInfo) return false;
    return adminInfo.role === 'admin' ||
      adminInfo.permissions?.includes(requiredPermission);
  };

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar - Only show when authenticated and not on login page */}
      <ScrollToTop />
      {isAuthenticated && !isLoginPage && sidebarOpen && (
        <div style={{ width: '240px', transition: 'width 0.3s ease' }}>
          <Sidebar
            open={sidebarOpen}
            toggleSidebar={toggleSidebar}
            hasPermission={hasPermission}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Topbar - Only show when authenticated and not on login page */}
        {isAuthenticated && !isLoginPage && (
          <Topbar
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        )}

        <div style={{
          padding: isAuthenticated && !isLoginPage ? '20px' : '0px',
          marginTop: isAuthenticated && !isLoginPage ? '50px' : '0px',
          marginLeft: (isAuthenticated && !isLoginPage && sidebarOpen) ? '15px' : '0px',
          transition: 'margin-left 0.3s ease'
        }}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute requiredPermission="Dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute requiredPermission="users">
                <Users />
              </ProtectedRoute>
            } />

            <Route path="/add-product" element={
              <ProtectedRoute requiredPermission="Product Management">
                <Products />
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute requiredPermission="Product Management">
                <ProductList />
              </ProtectedRoute>
            } />

            <Route path="/product/:id" element={
              <ProtectedRoute requiredPermission="Product Management">
                <Products />
              </ProtectedRoute>
            } />

            <Route path="/orders" element={
              <ProtectedRoute requiredPermission="orders">
                <Orders />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="settings">
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/banner" element={
              <ProtectedRoute requiredPermission="Banners">
                <Banner />
              </ProtectedRoute>
            } />

            <Route path="/AdminUsers" element={
              <ProtectedRoute requiredPermission="Admin Users">
                <AdminUsersPage />
              </ProtectedRoute>
            } />

            {/* Supplier Management */}
            <Route path="/suppliers" element={
              <ProtectedRoute requiredPermission="suppliers">
                <SupplierList />
              </ProtectedRoute>
            } />

            <Route path="/add-supplier" element={
              <ProtectedRoute requiredPermission="suppliers">
                <AddSupplier />
              </ProtectedRoute>
            } />

            <Route path="/edit-supplier/:id" element={
              <ProtectedRoute requiredPermission="Supplier Management">
                <EditSupplier />
              </ProtectedRoute>
            } />

            <Route path="/approve-suppliers" element={
              <ProtectedRoute requiredPermission="Supplier Management">
                <PendingProductsPage />
              </ProtectedRoute>
            } />

            <Route path="/SubBanner" element={
              <ProtectedRoute requiredPermission="Banners">
                <SubBanner />
              </ProtectedRoute>
            } />
            <Route path="/offer" element={
              <ProtectedRoute requiredPermission="Banners">
                <Offer />
              </ProtectedRoute>
            } />

            <Route path="/Add-SProduct" element={
              <ProtectedRoute requiredPermission="Suplier">
                <SupplierProductForm />
              </ProtectedRoute>
            } />

            <Route path="/SProduct" element={
              <ProtectedRoute requiredPermission="Suplier">
                <SupplierProductsPage />
              </ProtectedRoute>
            } />

            <Route path="/supplier-products/:supplierId" element={
              <ProtectedRoute requiredPermission="Admin Users">
                <SupplierProductList />
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;