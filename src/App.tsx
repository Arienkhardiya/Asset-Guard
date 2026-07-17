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

// Universal Fake Auth to feed all inner components what they expect
import { AuthContext } from './context/AuthContext';
const MockAuthProvider = ({ children }: any) => {
  return (
    <AuthContext.Provider value={{
      user: { id: "1", email: "admin@assetguard.ai" },
      userData: { name: "Admin User", role: "Admin", tenantType: "Organization" },
      loading: false,
      login: async () => {},
      logout: async () => {}
    } as any}>
      {children}
    </AuthContext.Provider>
  );
};

export default function App() {
  return (
    <MockAuthProvider>
      <SecurityProvider>
        <ScanProvider>
          <Router>
            <Routes>
              {/* Force base path straight into the layout layout */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="cyber" replace />} />
                <Route path="cyber" element={<CyberDashboard />} />
                <Route path="live-monitor" element={<LiveMonitor />} />
                <Route path="legal" element={<LegalDashboard />} />
                <Route path="business" element={<BusinessDashboard />} />
                <Route path="remediation" element={<RemediationCenter />} />
                <Route path="logs" element={<AuditLogs />} />
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
              
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="*" element={<Navigate to="/cyber" replace />} />
            </Routes>
          </Router>
        </ScanProvider>
      </SecurityProvider>
    </MockAuthProvider>
  );
}
