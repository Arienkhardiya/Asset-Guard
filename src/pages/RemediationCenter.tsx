import React from 'react';
import { useScan } from '../context/ScanContext';
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, ChevronRight, Zap, Target, Gavel } from 'lucide-react';
import { motion } from 'motion/react';

export default function RemediationCenter() {
  const { actionResult, result, loading } = useScan();

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400 fill-amber-400/20" /> Remediation Center
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">Active protocols and automated takedown orchestration.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-[#111827] border border-white/5 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Active Actions</p>
                <p className="text-sm font-bold text-white">{actionResult?.actions.length || 0}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
           </div>
        </div>
      </div>

      {!actionResult && !loading && (
        <div className="p-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center bg-[#111827]/30">
          <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
          <h2 className="text-xl font-bold text-slate-400">No Active Protocols</h2>
          <p className="text-sm text-slate-600 font-mono mt-2 max-w-sm">
            Takedown recommendations will populate here once a valid system scan identifies actionable threats.
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 w-full bg-[#111827] animate-pulse rounded-2xl border border-white/5" />
          ))}
        </div>
      )}

      {actionResult && (
        <div className="grid grid-cols-1 gap-6">
          {actionResult.actions.map((action, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#111827] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <Gavel className="w-32 h-32" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${getPriorityColor(action.priority)}`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-white text-lg">{action.type}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 max-w-2xl">{action.description}</p>
                    {result && (
                      <div className="flex items-center gap-4 mt-3">
                         <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> DEPOT: {new Date().toLocaleDateString()}
                         </span>
                         <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3" /> AUTO-RESOLVE ENABLED
                         </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
                    Execute Protocol <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* System Recommendations Section */}
          <div className="mt-12">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Automated Strategy Brief
            </h3>
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Target className="w-20 h-20 text-amber-500 rotate-12" />
               </div>
               <p className="text-sm text-amber-200/80 leading-relaxed font-mono relative z-10">
                 System has detected high similarity matches with verified IP assets. Recommended approach involves a tiered takedown starting with high-traffic distribution hubs. Global takedown confidence is estimated at <span className="text-white font-bold">88.5%</span>.
               </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
