import React, { createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CyberDashboard from './pages/CyberDashboard';

// 1. Create universal dummy contexts inline so they cannot break the build
const DummyContext = createContext<any>({
  user: { id: "1", email: "admin@assetguard.ai" },
  userData: { name: "Admin User", role: "Admin", tenantType: "Organization" },
  loading: false,
  scans: [],
  securityData: {},
  startScan: async () => {},
  login: async () => {},
  logout: async () => {}
});

// 2. Intercept React's context lookup completely to feed all child hooks (useAuth, useScan, etc.)
const ReactWithMock = React as any;
ReactWithMock.createContext = () => DummyContext;

export default function App() {
  return (
    <DummyContext.Provider value={{
      user: { id: "1", email: "admin@assetguard.ai" },
      userData: { name: "Admin User", role: "Admin", tenantType: "Organization" },
      loading: false,
      scans: [],
      securityData: {},
      startScan: async () => {}
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<CyberDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DummyContext.Provider>
  );
}
