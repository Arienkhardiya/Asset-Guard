const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const returnStart = content.indexOf('return (\n    <div className="min-h-screen');
if (returnStart === -1) {
    console.error("Could not find return statement start.");
    process.exit(1);
}

const topPart = content.substring(0, returnStart);

const newRender = `return (
    <div className="min-h-screen bg-[#06080d] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
      
      {/* Top AI System Banner & Status Indicator */}
      <div className="w-full bg-[#0b0e14] border-b border-white/5 py-2 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
              <div className={\`w-2 h-2 rounded-full shadow-[0_0_8px] animate-pulse \${
                systemStatus === 'SCANNING' ? 'bg-amber-500 shadow-amber-500' :
                systemStatus === 'THREAT DETECTED' ? 'bg-red-500 shadow-red-500' :
                systemStatus === 'SECURE' ? 'bg-emerald-500 shadow-emerald-500' :
                'bg-indigo-500 shadow-indigo-500'
              }\`} />
              <span className={\`text-[10px] font-mono font-bold tracking-[0.2em] uppercase \${
                systemStatus === 'SCANNING' ? 'text-amber-500' :
                systemStatus === 'THREAT DETECTED' ? 'text-red-500' :
                systemStatus === 'SECURE' ? 'text-emerald-500' :
                'text-indigo-400'
              }\`}>
                SYSTEM STATUS: {systemStatus}
              </span>
            </div>
            <span className="hidden md:inline-block text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              EdgeMind // Security Protocol v4.0.2
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> NETWORK: STABLE</span>
            <span className="hidden sm:inline-block opacity-40">|</span>
            <span className="hidden sm:flex items-center gap-1.5"><Building2 className="w-3 h-3" /> NODE: ASIA-EARLY</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* TOP CENTER: Pipeline Visualization */}
        <div className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center">
            <h3 className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-8 flex items-center gap-2">
              <Cpu className="w-3 h-3" /> ACTIVE INTELLIGENCE PIPELINE
            </h3>
            <div className="flex items-center justify-between w-full max-w-4xl relative">
              {PIPELINE_STEPS.map((step, idx) => {
                const isActive = currentStep === idx;
                const isPast = currentStep > idx;
                
                return (
                  <div key={step.id} className="flex flex-1 flex-col items-center relative group z-10">
                    <div className={\`w-12 h-12 rounded-xl flex items-center justify-center border-2 mb-3 bg-[#06080d] transition-all duration-300 \${
                      isActive ? 'border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110' :
                      isPast ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' :
                      'border-white/5 text-slate-600'
                    }\`}>
                      {isPast ? <CheckCircle className="w-5 h-5" /> : isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : <step.icon className="w-5 h-5 opacity-50" />}
                    </div>
                    <span className={\`text-[10px] font-bold uppercase tracking-tighter text-center transition-colors \${isActive ? 'text-indigo-300' : isPast ? 'text-emerald-400' : 'text-slate-500'}\`}>{step.label}</span>
                  </div>
                );
              })}
              
              {/* Connector lines behind steps */}
              <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-800 -z-0">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-700 ease-in-out" 
                  style={{ width: currentStep >= 0 ? \`\${(currentStep / (PIPELINE_STEPS.length - 1)) * 100}%\` : '0%' }}
                />
              </div>
            </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* LEFT: Input Panel */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-[#0b0e14] border border-white/5 rounded-2xl shadow-xl shadow-black/50 relative overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#0f131a]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                       EdgeMind <span className="text-indigo-400">AI</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-[10px] mt-1 uppercase tracking-wider">
                      Threat Intelligence Input
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                
                <textarea
                  id="content-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Submit content query, URL, or raw metadata..."
                  className="w-full h-40 bg-[#06080d] border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-mono text-sm leading-relaxed relative z-10 shadow-inner"
                />
                
                <button
                  onClick={analyzeContent}
                  disabled={loading || !input.trim()}
                  className={\`w-full mt-4 py-4 px-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none flex items-center justify-center gap-2 relative z-10 \${
                    loading 
                    ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                  }\`}
                >
                  <div className={\`absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] \${loading ? 'animate-[shimmer_2s_infinite]' : ''}\`} />
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
          </div>

          {/* MAIN/RIGHT: Results Dashboard */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* Standby State */}
              {!result && !loading && (
                <motion.div 
                  key="standby"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-[#0b0e14]/30 backdrop-blur-sm group"
                >
                  <div className="relative mb-8">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                     <Shield className="w-20 h-20 mb-6 opacity-30 group-hover:opacity-60 transition-opacity relative z-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] glow-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-300 tracking-tight">Awaiting Threat Intelligence Input</h2>
                  <p className="text-sm mt-3 text-slate-500 max-w-sm font-mono leading-relaxed px-4 border-l border-indigo-500/20">
                    Input content title, metadata, or distribution vectors to initiate a global infrastructure scan and piracy intelligence routine.
                  </p>
                </motion.div>
              )}

              {/* Active Loading Details State */}
              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] border border-indigo-500/20 bg-[#0b0e14]/50 backdrop-blur-sm rounded-2xl p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
                  
                  <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mb-8" />
                  <h2 className="text-2xl font-bold text-white tracking-wide">Executing Protocol...</h2>
                  <p className="text-slate-400 font-mono text-sm mt-2 max-w-md text-center">
                    {currentStep === 0 ? 'Calibrating telemetry sensors...' : 
                     currentStep === 1 ? 'Generating cryptographic hashes and query vectors...' :
                     currentStep === 2 ? 'Scanning global backbone infrastructure...' :
                     currentStep === 3 ? 'Engaging multi-layer heuristic risk engine...' :
                     'Compiling final enforcement protocols...'}
                  </p>
                </motion.div>
              )}

              {/* Resolved Analysis Result State */}
              {result && !loading && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="space-y-6"
                >
                  {/* A. THREAT SUMMARY (TOP, BIG) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <div className={\`p-8 rounded-2xl border bg-gradient-to-br \${getRiskGradient(result.risk_level)} \${getRiskColor(result.risk_level).split(' ')[0]} \${getRiskColor(result.risk_level).split(' ')[2]} shadow-lg col-span-1 flex flex-col items-center justify-center text-center\`}>
                       <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 opacity-80">Risk Level</p>
                       <p className="text-4xl font-black uppercase tracking-tight">{result.risk_level}</p>
                     </div>
                     <div className="bg-[#0b0e14] border border-white/5 p-8 rounded-2xl shadow-lg col-span-1 flex flex-col items-center justify-center text-center">
                       <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Similarity</p>
                       <p className="text-4xl font-bold text-white tracking-tight">{result.similarity}%</p>
                     </div>
                     <div className="bg-[#0b0e14] border border-white/5 p-8 rounded-2xl shadow-lg col-span-1 flex flex-col items-center justify-center text-center">
                       <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Confidence</p>
                       <p className="text-4xl font-bold text-slate-300 tracking-tight">{result.confidence}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* B. DETECTION DETAILS (Clutter removed, concise) */}
                    <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                           <Activity className="w-5 h-5" />
                         </div>
                         <h3 className="font-bold text-sm uppercase tracking-wide text-white">Detection Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                         <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Total Sources</p>
                            <p className="text-2xl font-bold text-indigo-400">{result.total_links_found}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Platforms</p>
                            <p className="text-2xl font-bold text-slate-200">{result.platforms_detected.length}</p>
                         </div>
                      </div>

                      <div className="space-y-3 flex-1">
                         {result.platform_distribution.slice(0, 4).map((pd, index) => (
                           <div key={index} className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 font-mono">{pd.platform}</span>
                              <span className="text-xs font-bold text-slate-200">{pd.count}</span>
                           </div>
                         ))}
                      </div>
                      
                      {fingerprint && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                           <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Search Vectors Extracted</p>
                           <div className="flex flex-wrap gap-2">
                             {fingerprint.fingerprint.entities.concat(fingerprint.fingerprint.keywords).slice(0, 5).map((kw, idx) => (
                               <span key={idx} className="px-2 py-1 bg-[#06080d] border border-white/5 rounded text-[10px] font-mono text-slate-400">
                                 {kw}
                               </span>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>

                    {/* C. SPREAD & BUSINESS IMPACT */}
                    <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                           <Globe className="w-5 h-5" />
                         </div>
                         <h3 className="font-bold text-sm uppercase tracking-wide text-white">Spread & Impact</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Spread Level</p>
                          <p className="text-xl font-bold text-white tracking-tight">{result.spread_level}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                           <div>
                             <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">Brand Damage</p>
                             <p className="text-sm text-slate-300 font-medium">{result.business_impact.brand_damage}</p>
                           </div>
                           <div>
                             <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">Estimated Risk</p>
                             <p className="text-sm font-bold text-emerald-400">{result.business_impact.estimated_loss}</p>
                           </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5">
                           <p className="text-[10px] text-slate-500 font-mono uppercase mb-1">Market Risk Context</p>
                           <p className="text-xs text-slate-400">{result.business_impact.market_risk}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* D. OWNERSHIP INTELLIGENCE */}
                    <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                           <Building2 className="w-5 h-5" />
                         </div>
                         <h3 className="font-bold text-sm uppercase tracking-wide text-white">Ownership Intelligence</h3>
                      </div>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                           <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Likely Owner / Type</p>
                           <p className="text-lg font-bold text-white">{result.ownership_analysis.likely_owner}</p>
                           <p className="text-xs text-slate-400">{result.ownership_analysis.owner_type}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Confidence</p>
                           <p className="text-lg font-bold text-purple-400">{result.ownership_analysis.confidence}%</p>
                        </div>
                      </div>
                    </div>

                    {/* E. INTELLIGENCE BRIEF */}
                    <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                           <FileText className="w-5 h-5" />
                         </div>
                         <h3 className="font-bold text-sm uppercase tracking-wide text-white">Intelligence Brief</h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed max-h-20 overflow-hidden text-ellipsis line-clamp-3">
                        {result.explanation}
                      </p>
                    </div>
                  </div>

                  {/* F. ACTION CENTER (BOTTOM, MAX 3) */}
                  {actionResult && (
                    <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Gavel className="w-48 h-48" />
                      </div>
                      
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                         <div className="p-2 bg-indigo-500 text-white rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                           <Gavel className="w-5 h-5" />
                         </div>
                         <h3 className="font-bold text-sm uppercase tracking-wide text-indigo-300">Action Center</h3>
                      </div>
                      
                      <div className="space-y-3 relative z-10">
                        {actionResult.actions.slice(0, 3).map((action, idx) => (
                          <div key={idx} className="bg-[#0d111a] border border-white/5 p-4 rounded-xl flex sm:items-center justify-between flex-col sm:flex-row gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 mt-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20 shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{action.type}</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl">{action.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 sm:ml-0 mt-3 sm:mt-0">
                              <span className={\`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border \${getRiskColor(action.priority)}\`}>
                                {action.priority}
                              </span>
                              <button className={\`text-xs font-bold uppercase px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${
                                action.priority === 'Critical' || action.priority === 'High' || action.type.toLowerCase().includes('takedown')
                                  ? 'bg-red-500 hover:bg-red-400 text-white'
                                  : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                              }\`}>
                                Execute <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/App.tsx', topPart + newRender);
console.log("UI updated.");
