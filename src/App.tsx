import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ScanProvider } from './context/ScanContext';
import { SecurityProvider } from './context/SecurityContext';
import DashboardLayout from './layouts/DashboardLayout';
import CyberDashboard from './pages/CyberDashboard';
import LegalDashboard from './pages/LegalDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogs from './pages/AuditLogs';
import RemediationCenter from './pages/RemediationCenter';
import CreatorDashboard from './pages/CreatorDashboard';
import LiveMonitor from './pages/LiveMonitor';

// Fake Auth Provider to stop inner pages from crashing
import { AuthContext } from './context/AuthContext';
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: { id: "1", email: "admin@assetguard.ai" },
    userData: { name: "Admin User", role: "Admin", tenantType: "Organization" },
    loading: false,
    login: async () => {},
    logout: async () => {}
  };
  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
};

function RootRouter() {
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
    <MockAuthProvider>
      <Router>
        <Routes>
          {/* Main Application Layout */}
          <Route path="/" element={<RootRouter />}>
            <Route index element={<Navigate to="cyber" replace />} />
            <Route path="cyber" element={<CyberDashboard />} />
            <Route path="live-monitor" element={<LiveMonitor />} />
            <Route path="legal" element={<LegalDashboard />} />
            <Route path="business" element={<BusinessDashboard />} />
            <Route path="remediation" element={<RemediationCenter />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>

          {/* Creator Route (Standalone) */}
          <Route 
            path="/creator" 
            element={
              <SecurityProvider>
                <ScanProvider>
                  <CreatorDashboard />
                </ScanProvider>
              </SecurityProvider>
            } 
          />

          {/* Fallback routes */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </MockAuthProvider>
  );
}
