import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Shield, AlertTriangle, ShieldCheck, FileVideo, Download, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScan } from '../context/ScanContext';
import PipelineVisualizer from '../components/PipelineVisualizer';

export default function CreatorDashboard() {
  const { userData, logout } = useAuth();
  const { input, setInput, analyzeContent, loading, result, currentStep, reset } = useScan();

  const handleScan = () => {
    if (input) analyzeContent();
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-200">
      
      {/* Top Navbar */}
      <nav className="bg-[#111827] border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Asset Guard <span className="font-light text-slate-400">Solo</span></h1>
            <p className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider mt-1">Creator Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden sm:block text-right">
             <p className="text-xs font-bold text-slate-300">{userData?.email}</p>
             <p className="text-[10px] font-mono text-slate-500 uppercase">{userData?.tenantName}</p>
           </div>
           <button onClick={logout} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-red-400">
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 mt-4">
        
        {/* Welcome Section */}
        <div className="text-center space-y-4 mb-12">
           <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Protect Your Content</h2>
           <p className="text-slate-400 max-w-2xl mx-auto">Upload a video, link a post, or paste a description. Our AI will scan the entire web to find unauthorized copies of your work.</p>
        </div>

        {/* Input Section */}
        <div className="bg-[#111827] border border-white/5 p-6 rounded-3xl shadow-2xl relative z-10">
           <div className="flex flex-col gap-4">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileVideo className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  placeholder="Paste URL, title, or upload description..."
                  className="w-full bg-[#0B0F1A] border-2 border-white/5 focus:border-indigo-500/50 rounded-2xl py-4 pl-12 pr-32 text-sm text-slate-200 shadow-inner transition-all hover:border-white/10"
                />
                <button
                  onClick={handleScan}
                  disabled={loading || !input.trim()}
                  className="absolute inset-y-2 right-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  SCAN
                </button>
             </div>
           </div>
        </div>

        {/* Loading Pipeline */}
        {loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
             <PipelineVisualizer currentStep={currentStep} />
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg flex items-center gap-4">
                   <div className="p-4 bg-red-500/10 text-red-400 rounded-full">
                     <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Copies Found</p>
                     <p className="text-2xl font-bold text-white">{result.total_links_found}</p>
                   </div>
                </div>
                <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg flex items-center gap-4">
                   <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full">
                     <Search className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Similarity</p>
                     <p className="text-2xl font-bold text-white">{result.similarity}%</p>
                   </div>
                </div>
                <div className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-lg flex items-center gap-4">
                   <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full">
                     <ShieldCheck className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Risk Level</p>
                     <p className="text-xl font-bold text-white uppercase tracking-wider">{result.risk_level}</p>
                   </div>
                </div>
              </div>

              {/* Feed of copies */}
              <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-6 border-b border-white/5">
                   <h3 className="font-bold text-lg text-white">Detected Infringements</h3>
                 </div>
                 <div className="divide-y divide-white/5">
                   {result.flagged_links.map((link, idx) => (
                     <div key={idx} className="p-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                             link.risk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                             link.risk === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                             'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                           }`}>
                             {link.platform}
                           </span>
                           <span className="text-xs text-slate-500">{link.reason.substring(0, 50)}...</span>
                         </div>
                         <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-indigo-400 hover:text-indigo-300 truncate block">
                           {link.url}
                         </a>
                       </div>
                       
                       <div className="flex gap-2 shrink-0">
                         <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-slate-300 transition-colors uppercase tracking-wider">
                           File DMCA
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
