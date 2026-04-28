import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Square, AlertOctagon, MonitorPlay, Activity, ShieldAlert,
  Globe, Globe2, Link as LinkIcon, Users, Building, ShieldOff, CheckCircle2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useSecurity } from '../context/SecurityContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { API_BASE } from '../config';
import PipelineVisualizer from '../components/PipelineVisualizer';

interface PiracyHit {
  id: string;
  url: string;
  status: 'LIVE STREAMING' | 'PENDING' | 'TERMINATED';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  viewers: number;
  host: string;
  detectedAt: Date;
}

export default function LiveMonitor() {
  const { isConfidentialMode, maskData, logAction } = useSecurity();
  const { userData } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(-1);
  const [hits, setHits] = useState<PiracyHit[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Setup Socket Connection
  useEffect(() => {
    let socketIo: Socket | null = null;
    
    const initSocket = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      socketIo = io(API_BASE, {
        auth: { token }
      });

      socketIo.on('connect', () => {
        console.log('Real-time connection established');
      });

      socketIo.on('NEW_DETECTION', (detection: any) => {
        logAction('LIVE_DETECTION', `Detected mirror stream at ${detection.url}`);
        setHits(prev => [{
          id: detection.id,
          url: detection.url,
          status: detection.status === 'PENDING' ? 'LIVE STREAMING' : detection.status,
          riskLevel: detection.riskLevel,
          confidence: detection.confidence,
          viewers: Math.floor(Math.random() * 50000) + 500, // Real system would estimate viewers
          host: 'Unknown Infrastructure',
          detectedAt: new Date(detection.createdAt)
        }, ...prev]);
      });

      setSocket(socketIo);
    };

    if (isMonitoring && !socket) {
      initSocket();
    }

    return () => {
      if (socketIo) socketIo.disconnect();
    };
  }, [isMonitoring, logAction]);

  // Simulation Logic for pipeline steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      // Rotate pipeline steps slightly to show activity
      let cycle = 0;
      interval = setInterval(() => {
        cycle++;
        setCurrentStep(cycle % 6);
      }, 2000);
    } else {
      setCurrentStep(-1);
    }

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleStartMonitor = async () => {
    if (!streamUrl.trim()) return;
    setIsMonitoring(true);
    setHits([]);
    setCurrentStep(0);
    logAction('MONITOR_START', `Started live monitoring for stream: ${streamUrl}`);
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      await fetch(`${API_BASE}/api/scan/live/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ streamUrl })
      });
    } catch(e) {
      console.error(e);
    }
  };

  const handleStopMonitor = () => {
    setIsMonitoring(false);
    setCurrentStep(-1);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    logAction('MONITOR_STOP', `Stopped live monitoring.`);
  };

  const handleAction = async (hitId: string, actionType: string) => {
    setHits(prev => prev.map(h => 
      h.id === hitId ? { ...h, status: actionType === 'TERMINATE' ? 'TERMINATED' : 'PENDING' } : h
    ));
    logAction('REMEDIATION_ACTION', `Executed ${actionType} on hit ${hitId}`);
    
    if (actionType === 'TERMINATE' || actionType === 'LEGAL') {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        await fetch(`${API_BASE}/api/actions/takedown`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ detectionId: hitId })
        });
      } catch (e) {
        console.error('Takedown API failed', e);
      }
    }
  };

  const totalViewers = hits.reduce((acc, h) => h.status !== 'TERMINATED' ? acc + h.viewers : acc, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MonitorPlay className="text-indigo-400 w-6 h-6" /> 
            Live Stream Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time ingestion and continuous distributed scanning for live events.</p>
        </div>
        
        {isMonitoring && (
          <div className="px-4 py-2 border border-red-500/30 bg-red-500/10 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase">Live Surveillance Active</span>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-xl">
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Target Official Stream (m3u8, rtmp, or page URL)
        </label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            disabled={isMonitoring}
            placeholder="https://my-platform.com/live/match-1"
            className="flex-1 bg-[#0B0F1A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          {!isMonitoring ? (
            <button 
              onClick={handleStartMonitor}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              INITIATE
            </button>
          ) : (
            <button 
              onClick={handleStopMonitor}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              TERMINATE
            </button>
          )}
        </div>
      </div>

      <PipelineVisualizer currentStep={currentStep} />

      {/* Live Dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Telemetry
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Total Illicit Viewers</p>
                <p className={`text-3xl font-black tracking-tighter ${totalViewers > 10000 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-slate-200'}`}>
                  {totalViewers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Pirate Nodes</p>
                <p className="text-2xl font-bold text-slate-200">{hits.filter(h => h.status === 'LIVE STREAMING').length}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-mono text-slate-500 mb-2">Projected Impact</p>
                <p className="text-sm text-red-400 font-mono">-$ {((totalViewers * 0.15) * 1.5).toFixed(2)} EPS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Feed */}
        <div className="lg:col-span-3 bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B0F1A]">
            <h3 className="font-bold text-sm tracking-wide uppercase text-slate-300">Live Detection Feed</h3>
            <span className="text-[10px] font-mono text-indigo-400 animate-pulse flex items-center gap-1"><Activity className="w-3 h-3"/> SYNCED</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {hits.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-slate-500 gap-4"
                >
                  <Globe2 className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-mono uppercase tracking-widest text-center">Awaiting initial telemetry...<br/>Start monitor to ingest.</p>
                </motion.div>
              )}
              
              {hits.map(hit => (
                <motion.div
                  key={hit.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  layout
                  className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                    hit.status === 'TERMINATED' 
                      ? 'border-emerald-500/20 bg-emerald-500/5' 
                      : 'border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent shadow-[inset_4px_0_0_rgb(239,68,68)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         {hit.status === 'LIVE STREAMING' && <span className="flex h-2 w-2 relative shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                         {hit.status === 'TERMINATED' && <ShieldOff className="w-4 h-4 text-emerald-400" />}
                         <a href="#" className="font-mono text-sm text-white hover:text-indigo-400 transition-colors truncate max-w-[200px] md:max-w-[400px]">
                           {isConfidentialMode ? maskData(hit.url, 'domain') : hit.url}
                         </a>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                         <span className="flex items-center gap-1.5 px-2 bg-white/5 py-1 rounded border border-white/5 font-bold uppercase tracking-widest text-[#a8b1c2]">
                           Risk: <span className={hit.riskLevel === 'Critical' ? 'text-red-400' : 'text-amber-400'}>{hit.riskLevel}</span>
                         </span>
                         <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {(hit.status === 'TERMINATED' ? 0 : hit.viewers).toLocaleString()} Viewers</span>
                         <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Host: {isConfidentialMode ? '***' : hit.host}</span>
                         <span className="flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> {hit.confidence}% Match</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hit.status === 'LIVE STREAMING' && (
                        <>
                          <button 
                            onClick={() => handleAction(hit.id, 'TERMINATE')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          >
                            TAKEDOWN
                          </button>
                          <button 
                            onClick={() => handleAction(hit.id, 'LEGAL')}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all"
                          >
                            DMCA
                          </button>
                        </>
                      )}
                      
                      {hit.status === 'TERMINATED' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                           <CheckCircle2 className="w-4 h-4" /> Offline
                        </div>
                      )}
                      
                      {hit.status === 'PENDING' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                           <Activity className="w-4 h-4 animate-spin" /> Processing
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
