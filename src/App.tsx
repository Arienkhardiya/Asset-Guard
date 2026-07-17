import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CyberDashboard from './pages/CyberDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Mounts the full dashboard directly to the main link with zero security walls */}
        <Route path="/" element={<CyberDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
