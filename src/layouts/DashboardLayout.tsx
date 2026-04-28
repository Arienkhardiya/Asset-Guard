import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Shield, Briefcase, Gavel, Settings, LogOut, User as UserIcon, Building2, Wifi, Activity, Lock, Unlock, Loader2, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSecurity } from '../context/SecurityContext';
import { useScan } from '../context/ScanContext';

export default function DashboardLayout() {
  const { userData, logout } = useAuth();
  const { isConfidentialMode, toggleConfidentialMode } = useSecurity();
  const { systemStatus } = useScan();
  const role = userData?.role || 'Admin';
  const location = useLocation();

  const links = [];
  
  if (role === 'Cybersecurity Analyst' || role === 'Admin') {
    links.push({ to: '/cyber', icon: Shield, label: 'Cyber Intelligence' });
    links.push({ to: '/live-monitor', icon: Activity, label: 'Live Monitor' });
  }
  if (role === 'Legal Analyst' || role === 'Admin') {
    links.push({ to: '/legal', icon: Gavel, label: 'Legal Affairs' });
  }
  if (role === 'Business Analyst' || role === 'Admin') {
    links.push({ to: '/business', icon: Briefcase, label: 'Business Risk' });
  }
  
  // Everyone with dashboard access should see Remediation
  if (role !== 'Creator') {
    links.push({ to: '/remediation', icon: Zap, label: 'Action Center' });
  }

  if (role === 'Admin') {
    links.push({ to: '/admin', icon: Settings, label: 'Admin Console' });
  }
  
  links.push({ to: '/logs', icon: Activity, label: 'Audit Logs' });

  // Handle index redirect
  if (location.pathname === '/') {
    if (links.length > 0) {
      return <Navigate to={links[0].to} replace />;
    }
  }

  const renderStatusIndicator = () => {
    switch(systemStatus) {
      case 'SCANNING':
        return (
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
            <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              SCANNING
            </span>
          </div>
        );
      case 'THREAT DETECTED':
        return (
          <div className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              THREAT DETECTED
            </span>
          </div>
        );
      case 'SECURE':
        return (
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SYSTEM SECURE</span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 transition-all">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">SYSTEM IDLE</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans selection:bg-indigo-500/30 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#111827] border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Asset Guard</h1>
            <p className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">Enterprise</p>
          </div>
        </div>

        <div className="p-4 border-b border-white/5">
           <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Organization</p>
           <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
             <Building2 className="w-4 h-4 text-emerald-500" />
             <span className="truncate">{userData?.tenantName || 'Unassigned'}</span>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 ml-2">Modules</p>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-black/20 border border-white/5">
             <UserIcon className="w-4 h-4 text-slate-400" />
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white truncate">{userData?.email}</p>
               <p className="text-[10px] font-mono text-slate-500 truncate">{role}</p>
             </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4" /> End Session
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <div className="sticky top-0 z-50 w-full bg-[#111827]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
           {/* Mobile header title */}
           <div className="flex items-center gap-2 md:hidden">
             <Shield className="w-5 h-5 text-indigo-400" />
             <h1 className="font-bold text-white text-sm">Asset Guard</h1>
           </div>
           
           <div className="hidden md:flex items-center gap-3">
             {renderStatusIndicator()}
             
             <button
               onClick={toggleConfidentialMode}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider ${
                 isConfidentialMode 
                 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                 : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
               }`}
             >
               {isConfidentialMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
               Confidential Mode
             </button>
           </div>
           
           <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
             <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-emerald-400" /> SYSTEM ONLINE</span>
             <span className="opacity-40">|</span>
             <span className="hidden sm:flex items-center gap-1.5 uppercase"><Building2 className="w-3 h-3" /> {userData?.tenantId?.substring(0, 8)}</span>
           </div>
        </div>
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
