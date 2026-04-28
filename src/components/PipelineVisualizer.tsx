import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Search, Brain, Zap, ShieldAlert, MonitorPlay } from 'lucide-react';

interface PipelineVisualizerProps {
  currentStep: number; // -1 to 5
}

const steps = [
  { icon: MonitorPlay, label: 'Ingest Stream' },
  { icon: Fingerprint, label: 'Fingerprint' },
  { icon: Search, label: 'Global Scan' },
  { icon: Brain, label: 'AI Risk Engine' },
  { icon: ShieldAlert, label: 'Threat Triage' },
  { icon: Zap, label: 'Action Center' }
];

export default function PipelineVisualizer({ currentStep }: PipelineVisualizerProps) {
  return (
    <div className="w-full bg-[#111827]/50 border border-white/5 p-4 rounded-xl mb-6 shadow-inner relative overflow-hidden">
      {/* Background glow when active */}
      {currentStep >= 0 && (
        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between relative z-10">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isComplete = idx < currentStep;
          const isPending = idx > currentStep;

          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive 
                      ? 'rgba(99, 102, 241, 0.2)' 
                      : isComplete 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isActive 
                      ? 'rgba(99, 102, 241, 0.5)' 
                      : isComplete 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-lg ${
                    isActive ? 'shadow-[0_0_20px_rgba(99,102,241,0.4)]' : ''
                  }`}
                >
                  <step.icon className={`w-4 h-4 ${
                    isActive 
                      ? 'text-indigo-400 animate-pulse' 
                      : isComplete 
                        ? 'text-emerald-500' 
                        : 'text-slate-500'
                  }`} />
                </motion.div>
                <span className={`text-[10px] font-mono uppercase tracking-widest text-center leading-tight ${
                  isActive ? 'text-indigo-300 font-bold' : isComplete ? 'text-emerald-400/80' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute -bottom-2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"
                  />
                )}
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-white/5 relative mx-2">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isComplete ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-emerald-500/50 origin-left"
                  />
                  {isActive && (
                    <motion.div
                      className="absolute top-0 left-0 h-full w-1/3 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                      animate={{
                        x: ['0%', '300%']
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                      }}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
