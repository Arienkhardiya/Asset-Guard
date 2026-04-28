import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from '../config';
import { safeJson } from '../utils/api';

export type UserRole = 'Admin' | 'Cybersecurity Analyst' | 'Legal Analyst' | 'Business Analyst' | 'Creator';
export type TenantType = 'Organization' | 'Creator';

interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  tenantType: TenantType;
  tenantId: string;
  tenantName: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await safeJson(res);
            setUserData(data as UserData);
          } else {
            localStorage.removeItem('token');
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password' })
      });
      
      const data = await safeJson(res);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUserData(data.user);
        
        // Audit log
        try {
          await fetch(`${API_BASE}/api/audit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
              action: 'LOGIN',
              details: 'User authenticated via local JWT.'
            })
          });
        } catch(e) {}
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUserData(null);
  };

  const updateUserRole = async (newRole: UserRole) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/auth/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      setUserData(prev => prev ? { ...prev, role: newRole } : null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, loading, login, logout, updateUserRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
