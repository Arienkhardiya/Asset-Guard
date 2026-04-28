import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config';
import { API_BASE } from '../config';
import { safeJson } from '../utils/api';

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userEmail: string;
  role: string;
  createdAt: any;
}

interface SecurityContextType {
  isConfidentialMode: boolean;
  toggleConfidentialMode: () => void;
  maskData: (data: string | undefined | null, type: 'domain' | 'id' | 'string') => string;
  logAction: (action: string, details: string) => Promise<void>;
  auditLogs: AuditLog[];
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isConfidentialMode, setIsConfidentialMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { userData } = useAuth();

  const toggleConfidentialMode = () => setIsConfidentialMode(!isConfidentialMode);

  const maskData = (data: string | undefined | null, type: 'domain' | 'id' | 'string') => {
    if (!data) return '';
    if (!isConfidentialMode) return data;
    
    try {
        if (type === 'domain') {
            // Try to match domain-like strings
            let str = data.replace(/^(https?:\/\/)/, '');
            const parts = str.split('/');
            const domainParts = parts[0].split('.');
            if (domainParts.length > 1) {
                const name = domainParts[domainParts.length - 2];
                // Leave only first 2 chars
                domainParts[domainParts.length - 2] = name.substring(0, 2) + '*'.repeat(Math.max(2, name.length - 2));
                parts[0] = domainParts.join('.');
                return (data.startsWith('http') ? data.match(/^(https?:\/\/)/)![1] : '') + parts.join('/');
            }
            return data.substring(0, 3) + '***';
        } else if (type === 'id') {
            return data.substring(0, 4) + '****' + data.slice(-4);
        } else if (type === 'string') {
            return data.substring(0, 2) + '*'.repeat(data.length - 2);
        }
    } catch (e) {
        return '***';
    }
    return '***';
  };

  const logAction = async (action: string, details: string) => {
    if (!userData?.tenantId || !userData?.uid) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, details })
      });
      await safeJson(res);
      fetchLogs(); // Refresh logs after adding
    } catch (error) {
      console.error("Failed to log action", error);
    }
  };

  const fetchLogs = async () => {
    if (!userData?.tenantId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/audit`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { data } = await safeJson(res);
      setAuditLogs(data || []);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [userData]);

  return (
    <SecurityContext.Provider value={{ isConfidentialMode, toggleConfidentialMode, maskData, logAction, auditLogs }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error("useSecurity must be used within SecurityProvider");
  return context;
};
