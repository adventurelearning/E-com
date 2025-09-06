import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
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
import ReviewManagement from './pages/Review/ReviewManagement';
import ProductReviews from './pages/Review/ProductReviews';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import Settings from './pages/Settings/Settings';
import ThemePage from './configuration/Theme';
import Logo from './configuration/Logo';
import AdminFooter from './components/AdminFooter';
import ReturnPolicy from './pages/cms/ReturnPolicy';
import PrivacyPolicy from './pages/cms/PrivacyPolicy';
import ShippingPolicy from './pages/cms/ShippingPolicy';
import PaymentPolicy from './pages/cms/PaymentPolicy';
import Terms_Con from './pages/cms/Terms_Con';
import RefundPolicy from './pages/cms/RefundPolicy';
import Customer_Service from './pages/cms/Customer_Service';
import Whats_new from './pages/cms/Whats_new';

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

  const cld = new Cloudinary({ cloud: { cloudName: 'dsjpkktkj' } });

  // Use this sample image or upload your own via the Media Explorer
  const img = cld
    .image('cld-sample-5')
    .format('auto') // Optimize delivery by resizing and applying auto-format and auto-quality
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

  // return (<AdvancedImage cldImg={img}/>);
  // };

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth < 768 && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Only show when authenticated and not on login page */}
      <ScrollToTop />
      {isAuthenticated && !isLoginPage && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && window.innerWidth < 768 && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleSidebar}
            />
          )}

          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:relative h-full transition-transform duration-300 z-30`}>
            <Sidebar
              open={sidebarOpen}
              toggleSidebar={toggleSidebar}
              hasPermission={hasPermission}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Only show when authenticated and not on login page */}
        {isAuthenticated && !isLoginPage && (
          <Topbar
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50 pt-5">
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

            <Route path="/review" element={
              <ProtectedRoute requiredPermission="Reviews">
                <ReviewManagement />
              </ProtectedRoute>
            } />
            <Route path="/product/:id/reviews" element={
              <ProtectedRoute requiredPermission="Reviews">
                <ProductReviews />
              </ProtectedRoute>
            } />

            <Route path="/Settings" element={
              <ProtectedRoute requiredPermission="Settings">
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/return-policy" element={
              <ProtectedRoute requiredPermission="Suplier">
                <ReturnPolicy />
              </ProtectedRoute>
            } />
            <Route path="/privacy-policy" element={
              <ProtectedRoute requiredPermission="Suplier">
                <PrivacyPolicy />
              </ProtectedRoute>
            } />
            <Route path="/shipping-policy" element={
              <ProtectedRoute requiredPermission="Suplier">
                <ShippingPolicy />
              </ProtectedRoute>
            } />
            <Route path="/payment-policy" element={
              <ProtectedRoute requiredPermission="Suplier">
                <PaymentPolicy />
              </ProtectedRoute>
            } />

            <Route path="/terms-conditions" element={
              <ProtectedRoute requiredPermission="Suplier">
                <Terms_Con />
              </ProtectedRoute>
            } />

            <Route path="/refund-policy" element={
              <ProtectedRoute requiredPermission="Suplier">
                <RefundPolicy />
              </ProtectedRoute>
            } />
            <Route path="/customer-service" element={
              <ProtectedRoute requiredPermission="Suplier">
                <Customer_Service />
              </ProtectedRoute>
            } />
            <Route path="/whats-new" element={
              <ProtectedRoute requiredPermission="Suplier">
                <Whats_new />
              </ProtectedRoute>
            } />
            <Route path="/Theme" element={
              <ProtectedRoute requiredPermission="Theme">
                <ThemePage />
              </ProtectedRoute>
            } />

            <Route path="/logo" element={
              <ProtectedRoute requiredPermission="Suplier">
                <Logo />
              </ProtectedRoute>
            } />

            <Route path="/footer" element={
              <ProtectedRoute requiredPermission="Footer">
                <AdminFooter />
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