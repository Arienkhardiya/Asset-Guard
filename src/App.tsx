import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import { SecurityProvider } from './context/SecurityContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import CyberDashboard from './pages/CyberDashboard';
import LegalDashboard from './pages/LegalDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogs from './pages/AuditLogs';
import RemediationCenter from './pages/RemediationCenter';
import CreatorDashboard from './pages/CreatorDashboard';
import LiveMonitor from './pages/LiveMonitor';

// Helper component to redirect based on tenant type
function RootRouter() {
  const { userData, loading } = useAuth();
  
  if (loading) return null;

  if (userData?.tenantType === 'Creator') {
    return <Navigate to="/creator" replace />;
  }

  // Otherwise organization goes to normal dashboard layout
  return (
    <SecurityProvider>
      <ScanProvider>
        <DashboardLayout />
      </ScanProvider>
    </SecurityProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <RootRouter />
              </ProtectedRoute>
            } 
          >
            {/* Organization Routes */}
            <Route 
              path="cyber" 
              element={
                <RoleGuard allowedRoles={['Cybersecurity Analyst', 'Admin']}>
                  <CyberDashboard />
                </RoleGuard>
              } 
            />
            
            <Route 
              path="live-monitor" 
              element={
                <RoleGuard allowedRoles={['Cybersecurity Analyst', 'Admin']}>
                  <LiveMonitor />
                </RoleGuard>
              } 
            />
            
            <Route 
              path="legal" 
              element={
                <RoleGuard allowedRoles={['Legal Analyst', 'Admin']}>
                  <LegalDashboard />
                </RoleGuard>
              } 
            />

            <Route 
              path="business" 
              element={
                <RoleGuard allowedRoles={['Business Analyst', 'Admin']}>
                  <BusinessDashboard />
                </RoleGuard>
              } 
            />

            <Route path="remediation" element={<RemediationCenter />} />
            <Route path="logs" element={<AuditLogs />} />
            
            <Route 
              path="admin" 
              element={
                <RoleGuard allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleGuard>
              } 
            />
          </Route>

          {/* Creator Route (Standalone) */}
          <Route 
            path="/creator" 
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Creator']}>
                  <SecurityProvider>
                    <ScanProvider>
                      <CreatorDashboard />
                    </ScanProvider>
                  </SecurityProvider>
                </RoleGuard>
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
