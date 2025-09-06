import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// User Components
import UserProfile from './components/user/UserProfile';

// Staff Components
import { 
  StaffStockManagement, 
  StaffProductView, 
  StaffBillManagement, 
  StaffSalesReports 
} from './components/staff';

// import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Only Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />

              {/* Staff Routes */}
              <Route 
                path="/staff/stock" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffStockManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/products" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffProductView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/billing" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffBillManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/staff/reports" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffSalesReports />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
