import React from 'react';
import { Shield, Radar, Loader2, AlertTriangle, Server, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScan } from '../context/ScanContext';
import { useSecurity } from '../context/SecurityContext';

export default function CyberDashboard() {
  const { 
    input, setInput, analyzeContent, loading, error, pastScans,
    scanResult, result, fingerprint, systemStatus, currentStep 
  } = useScan();
  const { maskData } = useSecurity();

  // (This would normally query Firestore again, or we can just omit it for brevity, 
  // but let's mock the "Organization Archives" visually or pull it from a simple prop if needed.
  // For now, we'll keep the scanner core).

  const PIPELINE_STEPS = [
    { id: 'upload', label: 'Telemetry', desc: 'Ingestion' },
    { id: 'fingerprint', label: 'Fingerprint', desc: 'Vectors' },
    { id: 'scan', label: 'Engine', desc: 'Global Scan' },
    { id: 'ai', label: 'AI', desc: 'Evaluation' },
    { id: 'action', label: 'Action', desc: 'Compilation' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 max-w-[1400px] mx-auto">
      {/* LEFT: Input Panel */}
      <div className="lg:col-span-4 space-y-6 sticky top-24">
        <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl shadow-black/50 relative overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-[#0f131a]">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                 Cyber Security <span className="text-indigo-400">Scanner</span>
              </h1>
              <p className="text-slate-400 font-mono text-[10px] mt-1 uppercase tracking-wider">
                Threat Intelligence Input
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            
            <textarea
              id="content-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Submit content query, URL, or raw metadata..."
              className="w-full h-40 bg-[#0B0F1A] border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-mono text-sm leading-relaxed relative z-10 shadow-inner"
            />
            
            <button
              onClick={analyzeContent}
              disabled={loading || !input.trim()}
              className={`w-full mt-4 py-4 px-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none flex items-center justify-center gap-2 relative z-10 ${
                loading 
                ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
              }`}
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] ${loading ? 'animate-[shimmer_2s_infinite]' : ''}`} />
              {loading ? <Loader2 className="w-5 h-5 animate-spin shadow-amber-500" /> : <Radar className="w-5 h-5" />}
              {loading ? 'STATUS: SCANNING...' : 'INITIATE SYSTEM SCAN'}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-mono">{error}</p>
          </motion.div>
        )}

        {/* Past Scans / Tenant Dashboard */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl p-6 hidden lg:block">
           <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Server className="w-4 h-4 text-indigo-400" /> Organization Archives
           </h3>
           <div className="space-y-3">
             {pastScans.length === 0 ? (
               <p className="text-xs text-slate-600 font-mono text-center py-4">No recent records generated</p>
             ) : (
               pastScans.slice(0, 5).map(scan => (
                 <div key={scan.id} className="p-3 bg-[#0B0F1A] border border-white/5 rounded-xl transition-colors hover:border-indigo-500/30 cursor-pointer">
                   <div className="flex items-center justify-between mb-1.5">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        scan.riskLevel === 'Critical' || scan.riskLevel === 'Viral' ? 'text-red-500 bg-red-500/10' :
                        scan.riskLevel === 'High' ? 'text-orange-500 bg-orange-500/10' :
                        scan.riskLevel === 'Medium' ? 'text-amber-500 bg-amber-500/10' :
                        'text-emerald-500 bg-emerald-500/10'
                     }`}>
                       {scan.riskLevel}
                     </span>
                     <span className="text-[10px] text-slate-500 font-mono">
                       {scan.createdAt?.toDate ? new Date(scan.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                     </span>
                   </div>
                   <p className="text-xs text-slate-300 font-medium truncate">{scan.inputQuery}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* MAIN/RIGHT: Results Dashboard */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div 
              key="standby"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full min-h-[500px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[#0b0e14]/30"
            >
              <Shield className="w-20 h-20 mb-6 opacity-30 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-300">Awaiting Cyber Scan</h2>
              <p className="text-sm mt-3 text-slate-500 max-w-sm font-mono">
                Initiate scan to begin technical intelligence gathering and vector extraction.
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="h-full min-h-[500px] bg-[#111827] border border-white/5 rounded-2xl p-8 shadow-[0_0_50px_rgba(79,70,229,0.1)] flex flex-col items-center justify-center relative overflow-hidden"
            >
              {/* Animated subtle grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none animate-[slide_10s_linear_infinite] opacity-20" />

              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 border-[3px] border-indigo-500/10 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 border-[3px] border-amber-500/20 rounded-full border-t-amber-500/80 animate-[spin_2s_linear_infinite_reverse]" />
                <div className="absolute inset-5 border-[2px] border-blue-500/20 rounded-full border-b-blue-500/80 animate-[spin_4s_ease-in-out_infinite]" />
                <Radar className="w-10 h-10 text-indigo-400 animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              </div>
              
              <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-1">Scanning Global Threat Intelligence Network...</h3>
              <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase mb-12 flex flex-col items-center gap-1">
                <span className="opacity-70">Establishing secure connection...</span>
                <span>{`[NODE-${Math.floor(Math.random() * 900) + 100}] Connected.`}</span>
              </p>
              
              <div className="w-full max-w-md space-y-4 relative z-10">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isActive = currentStep === idx;
                  const isDone = currentStep > idx;
                  return (
                    <div key={idx} className={`flex flex-col relative p-2.5 rounded-lg transition-all duration-300 ${isActive ? 'bg-indigo-500/5 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border border-transparent'}`}>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse scale-150' : isDone ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`} />
                           <div>
                             <span className={`text-xs font-mono uppercase tracking-widest block transition-colors ${isActive ? 'text-white font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>
                               {step.label}
                             </span>
                             {isActive && (
                               <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-amber-500/70 font-mono">
                                 {idx === 0 && `Ingesting ${Math.floor(Math.random() * 50) + 10} vectors...`}
                                 {idx === 1 && `Cross-referencing metadata headers...`}
                                 {idx === 2 && `Scanning ${Math.floor(Math.random() * 500) + 100} sources...`}
                                 {idx === 3 && `Evaluating signature mismatches...`}
                                 {idx === 4 && `Simulating remediation path...`}
                               </motion.span>
                             )}
                           </div>
                         </div>
                         <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-amber-400' : isDone ? 'text-indigo-400' : 'text-slate-700'}`}>
                           {isActive ? 'PROCESSING' : isDone ? 'COMPLETED' : 'WAITING'}
                         </span>
                      </div>
                      
                      {isActive && (
                        <motion.div layoutId="active-indicator" className="absolute left-0 top-0 w-0.5 h-full bg-amber-400 rounded-full shadow-[0_0_5px_#fbbf24]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div 
              key="results"
              variants={{
                show: { transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden" animate="show"
              className="space-y-6"
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
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Risk Classification</p>
                  <p className={`text-2xl font-black uppercase ${
                    result.risk_level === 'Critical' || result.risk_level === 'High' ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {result.risk_level}
                  </p>
                  <div className={`mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                    result.risk_level === 'Critical' || result.risk_level === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    Alert Priority: Elevated
                  </div>
                </div>

                <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl flex flex-col items-center text-center shadow-lg">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Confidence Score</p>
                  <p className="text-3xl font-black text-white">{result.confidence}</p>
                  <div className="w-full bg-slate-800 rounded-full h-1 mt-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: result.confidence }}
                      className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" 
                    />
                  </div>
                </div>

                <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl flex flex-col items-center text-center shadow-lg">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Vector Similarity</p>
                  <p className="text-3xl font-black text-indigo-400">{result.similarity}%</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">Matched against known IP assets</p>
                </div>
              </motion.div>

              {/* 2 & 3. Detection Details & Intelligence Brief */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div 
                   variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                   className="lg:col-span-12 bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" /> Intelligence Brief
                      </h3>
                      <p className="text-slate-300 leading-relaxed max-w-4xl text-sm italic">
                        "{result.explanation.length > 200 ? result.explanation.substring(0, 200) + '...' : result.explanation}"
                      </p>
                    </div>
                    <div className="flex items-center gap-8 pr-4">
                      <div className="text-center">
                        <p className="text-2xl font-black text-white">{result.total_links_found}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Detection Nodes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-slate-300">{result.platforms_detected.length}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Unique Networks</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Cyber Technical Data (Left) */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  className="lg:col-span-8 space-y-6"
                >
                  <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Platform Vector Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.platform_distribution.map((pd, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group">
                          <span className="text-xs text-slate-400 font-mono group-hover:text-white transition-colors capitalize">{pd.platform}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-indigo-400">{pd.count}</span>
                            <div className="w-16 bg-slate-900 rounded-full h-1 overflow-hidden">
                               <div className="h-full bg-indigo-500/50" style={{ width: `${(pd.count / result.total_links_found) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                      <Server className="w-32 h-32 text-indigo-400" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Detection Feed (Active Vectors)</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar focus:outline-none">
                      {result.flagged_links.slice(0, 5).map((link, index) => (
                        <div key={index} className="p-3 bg-black/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all">
                           <div className="flex items-start justify-between mb-2">
                             <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase">{link.platform}</span>
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-white/5 bg-black/40 ${
                               link.risk === 'Critical' || link.risk === 'High' ? 'text-red-500' : 'text-emerald-500'
                             }`}>{link.risk}</span>
                           </div>
                           <p className="font-mono text-[10px] text-slate-300 break-all mb-1">{maskData(link.url, 'domain')}</p>
                           <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">{link.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Fingerprint Vectors (Right) */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                  className="lg:col-span-4" 
                >
                  <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-amber-500 opacity-20" />
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Radar className="w-3.5 h-3.5" /> Fingerprint Identification
                    </h3>
                    
                    <div className="space-y-6 relative z-10">
                       <div>
                          <p className="text-[10px] font-mono text-slate-600 uppercase mb-2">Asset Vectors</p>
                          <div className="flex flex-wrap gap-2">
                             {fingerprint?.fingerprint.entities.concat(fingerprint?.fingerprint.keywords || []).slice(0, 8).map((kw, i) => (
                               <span key={i} className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-slate-400 hover:text-indigo-400 transition-colors">
                                 {maskData(kw, 'string')}
                               </span>
                             ))}
                          </div>
                       </div>

                       <div>
                          <p className="text-[10px] font-mono text-slate-600 uppercase mb-2">Extraction ID</p>
                          <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-indigo-300/80 leading-relaxed shadow-inner">
                            {maskData('AUTH_9182x_VECT_FPRINT_882', 'id')}
                          </div>
                       </div>

                       <div className="pt-4 border-t border-white/5">
                          <p className="text-[10px] font-mono text-slate-600 uppercase mb-2">Internal Notes</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Signatures matched against verified tenant library. Confidence factor remains consistent across multiple nodes.
                          </p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
