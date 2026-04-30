import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Mail, Lock, User, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { safeJson } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<'Organization' | 'Creator'>('Organization');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Cybersecurity Analyst');
  const [tenantName, setTenantName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        window.location.href = "/";
      } else {
        // Simple registration flow
        const res = await fetch(`/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            role: accountType === 'Creator' ? 'Creator' : role,
            tenantName: accountType === 'Creator' ? email.split('@')[0] : tenantName,
            tenantType: accountType
          })
        });
        
        const data = await safeJson(res);
        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = '/'; // Reload to pick up new user
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111827] border border-white/5 shadow-2xl rounded-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 border-b border-white/5 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Asset Guard AI</h1>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest text-center">
            Global Anti-Piracy Intelligence Network
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-2 text-xs">
                 <AlertTriangle className="w-4 h-4 shrink-0" />
                 <span>{error}</span>
               </div>
            )}

            {!isLogin && (
              <div className="flex gap-2 p-1 bg-[#06080d] border border-white/5 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setAccountType('Organization')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${accountType === 'Organization' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Organization
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('Creator')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${accountType === 'Creator' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Solo Creator
                </button>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Coordinates</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                  placeholder="analyst@enterprise.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Access Clearance (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#06080d] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && accountType === 'Organization' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Organization Tenant</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        className="w-full bg-[#06080d] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                        placeholder="e.g. IPL Broadcasting Ltd"
                        required={!isLogin && accountType === 'Organization'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Clearance Level (Role)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-[#06080d] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="Admin">Admin (Full Access)</option>
                        <option value="Cybersecurity Analyst">Detection & Cyber Intel</option>
                        <option value="Legal Analyst">Legal & IP Enforcement</option>
                        <option value="Business Analyst">Business & Risk Officer</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isLogin ? 'ESTABLISH LINK' : 'INITIALIZE WORKSPACE'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-slate-500">
              {isLogin ? "No active clearance?" : "Already possess clearance?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-wider"
              >
                {isLogin ? "Initialize Workspace" : "Establish Link"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
      <div className="absolute bottom-6 text-[#555] text-[10px] uppercase font-mono tracking-widest">
        Asset Guard AI Platform © 2026. Authorized Personnel Only.
      </div>
    </div>
  );
}
