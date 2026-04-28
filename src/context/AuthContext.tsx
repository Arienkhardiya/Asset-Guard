import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { API_BASE } from '../config';

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
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data from backend
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            setUserData(data as UserData);
            
            // Just basic tracking log
            try {
              const sessionKey = `logged_in_${currentUser.uid}`;
              if (!sessionStorage.getItem(sessionKey)) {
                await fetch(`${API_BASE}/api/audit`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    action: 'LOGIN',
                    details: 'User authenticated and started a secure session.'
                  })
                });
                sessionStorage.setItem(sessionKey, 'true');
              }
            } catch(e) {}
          } else {
            console.error("User data not found in Backend");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
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
    <AuthContext.Provider value={{ user, userData, loading, logout, updateUserRole }}>
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
