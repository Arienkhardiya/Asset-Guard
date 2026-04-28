import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Activity, ShieldAlert, Key, Zap, Lock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function AuditLogs() {
  const { auditLogs } = useSecurity();
  const { userData } = useAuth();
  
  const getIcon = (action: string) => {
    switch (action) {
      case 'SCAN_PERFORMED': return <Search className="w-4 h-4 text-indigo-400" />;
      case 'ACTION_EXECUTED': return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'LOGIN': return <Key className="w-4 h-4 text-amber-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="w-6 h-6 text-indigo-400" />
          Audit & Security Logs
        </h1>
        <p className="text-slate-400 font-mono text-xs mt-2">
          {userData?.role === 'Admin' ? 'Displaying full tenant access logs' : 'Displaying limited personal activity logs'}
        </p>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#0f131a] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> Secure Event Trail
            </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-mono text-slate-500 bg-black/20">
                <th className="p-4 font-semibold">Timestamp (UTC)</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-mono text-xs">
                    No log events found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {log.createdAt?.toDate ? new Date(log.createdAt.toDate()).toISOString() : 'Pending'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0B0F1A] border border-white/5 text-xs font-medium w-fit">
                        {getIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-slate-300">{log.userEmail}</div>
                      <div className="text-[10px] font-mono text-slate-500">{log.role}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs font-mono break-all max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
