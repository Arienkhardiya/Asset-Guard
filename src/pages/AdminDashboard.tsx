import React from 'react';
import { Users, Settings, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { userData } = useAuth();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="space-y-12"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Admin Console
        </h1>
        <p className="text-sm text-slate-400 font-mono mt-2">Full system visibility and tenant management for {userData?.tenantName}.</p>
      </div>

      {/* Mock User Management Section */}
      <section className="bg-[#111827] border border-white/5 p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-indigo-500/30 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-shadow">
               <Users className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg uppercase tracking-wide text-white">Tenant Directory</h3>
          </div>
          <button className="text-xs font-bold uppercase hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg border border-white/10 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all bg-[#0B0F1A]">
            + Invite Analyst
          </button>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0B0F1A] shadow-inner">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#0f131a] border-b border-white/5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Email Coordinate</th>
                <th className="px-6 py-4 font-bold">Clearance Level</th>
                <th className="px-6 py-4 font-bold">Organization Tenant ID</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors group/row cursor-pointer">
                <td className="px-6 py-4 font-medium text-white group-hover/row:text-indigo-300 transition-colors">{userData?.email} (You)</td>
                <td className="px-6 py-4 font-mono text-indigo-400 text-xs">{userData?.role}</td>
                <td className="px-6 py-4 font-mono text-[10px] drop-shadow">{userData?.tenantId}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">Active</span></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors opacity-60 hover:opacity-100 group/row cursor-pointer">
                <td className="px-6 py-4 font-medium text-white group-hover/row:text-indigo-300 transition-colors">cyber_analyst_2@{userData?.email?.split('@')[1] || 'domain.com'}</td>
                <td className="px-6 py-4 font-mono text-indigo-400 text-xs">Cybersecurity Analyst</td>
                <td className="px-6 py-4 font-mono text-[10px]">{userData?.tenantId}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* We can embed the other dashboards, or since they are full pages, maybe just show the scanner */}
      <div className="px-4 py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-3">
        <Activity className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">As an Administrator, use the sidebar to navigate to specific operational modules with elevated privileges.</p>
      </div>
    </motion.div>
  );
}
