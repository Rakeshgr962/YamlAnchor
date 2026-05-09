'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { improveYaml } from '@/actions/connection';

export function AutoImproveModal({ yamlContent, onComplete, onClose }: { yamlContent?: string, onComplete?: (yaml: string) => void, onClose: () => void }) {
  const [logs, setLogs] = useState<{label: string, icon: any}[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [finalYaml, setFinalYaml] = useState("");

  useEffect(() => {
    async function runImprove() {
      if (!yamlContent) return;
      
      setLogs([{ label: "Initializing AI Auto-Improve Loop...", icon: <Brain className="text-brand-primary" /> }]);
      
      const result = await improveYaml(yamlContent, 3);
      
      if (result && result.logs) {
        const newLogs = result.logs.map((log: string, index: number) => {
          let icon = <Zap className="text-yellow-500" />;
          if (log.includes("perfected") || log.includes("Success")) {
            icon = <CheckCircle2 className="text-green-500" />;
          } else if (log.includes("failed")) {
            icon = <X className="text-red-500" />;
          } else if (log.includes("Iteration")) {
            icon = <Sparkles className="text-brand-tertiary" />;
          }
          return { label: log, icon };
        });
        setLogs(prev => [...prev, ...newLogs]);
        if (result.success || result.finalYaml) {
          setFinalYaml(result.finalYaml);
          setIsDone(true);
        }
      } else {
        setLogs(prev => [...prev, { label: "Failed to connect to backend", icon: <X className="text-red-500" /> }]);
        setIsDone(true);
      }
    }
    
    runImprove();
  }, [yamlContent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#15151A] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/10 blur-3xl rounded-full"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-brand-primary/20">
            <Sparkles className="text-brand-primary" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">AI Auto-Improve Loop</h2>
        </div>

        <div className="space-y-6">
          {logs.map((s, i) => (
            <div key={i} className="flex items-center gap-4 transition-all duration-500 opacity-100 translate-x-0">
              <div className="p-2 rounded-md bg-gray-800/50">
                {s.icon}
              </div>
              <span className="text-sm font-medium text-gray-300">{s.label}</span>
            </div>
          ))}
          {!isDone && (
            <div className="flex items-center gap-4 animate-pulse">
               <div className="p-2 rounded-md bg-gray-800/50"><Brain className="text-brand-primary" /></div>
               <span className="text-sm font-medium text-gray-300">Processing...</span>
            </div>
          )}
        </div>

        {isDone && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={() => {
                if (onComplete && finalYaml) onComplete(finalYaml);
                else onClose();
              }}
              className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
            >
              Apply Optimizations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
