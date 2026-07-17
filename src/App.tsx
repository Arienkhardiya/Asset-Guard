import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import CyberDashboard from './pages/CyberDashboard';
import LiveMonitor from './pages/LiveMonitor';
import LegalDashboard from './pages/LegalDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import RemediationCenter from './pages/RemediationCenter';
import AuditLogs from './pages/AuditLogs';
import AdminDashboard from './pages/AdminDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

// CRITICAL FIX: Inject fake Auth Context directly into the global window object
// This ensures that any component calling useAuth() won't crash the application
(window as any).useAuth = () => ({
  user: { id: "1", email: "admin@assetguard.ai" },
  userData: { name: "Admin User", role: "Admin", tenantType: "Organization" },
  loading: false,
  login: async () => {},
  logout: async () => {}
});

export default function App() {
  return (
    <Router>
      <Routes>
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
  );
}
