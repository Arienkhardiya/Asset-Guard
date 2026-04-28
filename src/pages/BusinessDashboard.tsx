import React from 'react';
import { Briefcase, Globe, AlertTriangle, FileText, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScan } from '../context/ScanContext';
import { useSecurity } from '../context/SecurityContext';

export default function BusinessDashboard() {
  const { result, loading } = useScan();
  const { isConfidentialMode } = useSecurity();

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Critical':
      case 'Viral':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getRiskGradient = (level: string) => {
    switch(level) {
      case 'Critical': return 'from-red-500/20 to-red-900/5';
      case 'High': return 'from-orange-500/20 to-orange-900/5';
      case 'Medium': return 'from-amber-500/20 to-amber-900/5';
      case 'Low': return 'from-emerald-500/20 to-emerald-900/5';
      default: return 'from-slate-500/20 to-slate-900/5';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-400" /> Business Impact & Risk Matrix 
        </h1>
        <p className="text-sm text-slate-400 font-mono mt-2">Evaluate calculated financial exposure based on real-time intelligence feeds.</p>
      </div>

      <AnimatePresence mode="wait">
        {!result && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center bg-[#111827]/50"
          >
            <Briefcase className="w-16 h-16 text-slate-600 mb-4" />
            <h2 className="text-lg font-bold text-slate-300">No Active Data Stream</h2>
            <p className="text-sm text-slate-500 font-mono max-w-sm mt-2">A Cybersecurity Analyst must initiate a scan pipeline to populate risk matrices.</p>
          </motion.div>
        )}

        {loading && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="p-12 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center bg-[#111827]/50"
           >
             <div className="animate-pulse flex flex-col items-center">
               <AlertTriangle className="w-12 h-12 text-amber-500/50 mb-4" />
               <p className="text-xs font-mono text-amber-500/70 tracking-widest uppercase">Calculating Multi-Vector Risks...</p>
             </div>
           </motion.div>
        )}

        {result && (
          <motion.div 
            variants={{
              show: { transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden" animate="show"
            className="space-y-8"
          >
            
            {/* 1. THREAT SUMMARY (TOP) */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className={`p-6 bg-[#111827] border rounded-2xl flex flex-col items-center text-center shadow-lg transition-all ${
                result.risk_level === 'Critical' || result.risk_level === 'High' 
                ? 'border-red-500/20 shadow-red-500/5' 
                : 'border-white/5'
              }`}>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Exposure Level</p>
                <p className={`text-2xl font-black uppercase ${
                  result.risk_level === 'Critical' || result.risk_level === 'High' ? 'text-red-500' : 'text-emerald-500'
                }`}>
                  {result.risk_level}
                </p>
                <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Calculated Severity</p>
              </div>

              <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Spread Velocity</p>
                <p className="text-2xl font-black text-white uppercase">{result.spread_level}</p>
                <div className={`mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  result.spread_level === 'Viral' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {result.spread_level === 'Viral' ? 'High Impact' : 'Monitoring'}
                </div>
              </div>

              <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl flex flex-col items-center text-center shadow-lg">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Analysis Confidence</p>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">{result.confidence}</p>
                <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest">Model Accuracy</p>
              </div>
            </motion.div>

            {/* 3. SPREAD & BUSINESS IMPACT (MERGED) */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} 
               className="bg-[#111827] border border-white/5 p-8 rounded-2xl shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Globe className="w-64 h-64 text-emerald-500" />
              </div>
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                 <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                   <Globe className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-xl uppercase tracking-wide text-white">Consolidated Business Impact</h3>
                   <p className="text-xs font-mono text-slate-500">Merged Financial & Market Distribution Exposure</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4 relative z-10">
                 {/* LEFT: Financials */}
                 <div className="space-y-6">
                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group/item">
                       <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                       <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-4">Calculated Financial Exposure (Loss)</p>
                       <p className={`text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] ${isConfidentialMode ? 'blur-md select-none' : ''}`}>
                         {result.business_impact.estimated_loss}
                       </p>
                       <p className="text-xs text-slate-500 mt-4 font-mono">Projected over 30-day lifecycle.</p>
                    </div>

                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl group/brand transition-all">
                       <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3">Brand Integrity Damage</p>
                       <div className="flex items-start gap-4">
                          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <p className="text-lg text-slate-200 font-medium leading-tight group-hover/brand:text-white transition-colors">
                            {result.business_impact.brand_damage}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* RIGHT: Market & Spread */}
                 <div className="space-y-8">
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6">
                       <div className="group/risk">
                         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                           <ShieldCheck className="w-3 h-3 text-indigo-400" /> Market Risk Vector
                         </p>
                         <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
                           {result.business_impact.market_risk}
                         </p>
                       </div>

                       <div className="group/scale">
                         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                           <Activity className="w-3 h-3 text-amber-500" /> Spread Distribution Scale
                         </p>
                         <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1">
                           {result.business_impact.scale_of_distribution}
                         </p>
                       </div>
                    </div>

                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                       <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-3 font-bold">Recommended Mitigation Priority</h4>
                       <div className="flex items-center gap-4">
                          <div className="px-3 py-1 bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                            Immediate Takedown
                          </div>
                          <span className="text-xs text-slate-500 font-mono">Suggested via Action Center</span>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* Intelligence Summary */}
            <motion.div 
               variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} 
               className="bg-[#111827] border border-white/5 p-8 rounded-2xl shadow-xl flex flex-col hover:border-indigo-500/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                   <FileText className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-sm uppercase tracking-widest text-white">Executive Intelligence Brief</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed p-6 bg-black/40 rounded-xl border border-white/5 italic">
                {result.explanation}
              </p>
            </motion.div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
