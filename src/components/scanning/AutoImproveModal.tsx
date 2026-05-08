'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoImproveModalProps {
  onClose: () => void;
  onApply: () => void;
}

const IMPROVEMENT_STEPS = [
  "Analyzing YAML anchors for circular references...",
  "Scanning for hardcoded secrets in env blocks...",
  "Optimizing Docker caching layers in build step...",
  "Reducing job dependency chains for faster execution...",
  "Applying security hardening (OWASP standards)...",
  "Verifying syntax against GitHub Actions schema..."
];

export default function AutoImproveModal({ onClose, onApply }: AutoImproveModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentStep < IMPROVEMENT_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[600px] bg-[#15151A] border border-yellow-500/30 rounded-xl overflow-hidden shadow-2xl shadow-yellow-500/5">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-yellow-500/[0.03]">
          <div className="flex items-center gap-3">
            <Sparkles className="text-yellow-500" size={24} />
            <h2 className="text-xl font-bold text-white tracking-wide uppercase italic">Auto-Improve Loop</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isDone && <RefreshCw size={16} className="text-yellow-500 animate-spin" />}
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
              isDone ? "bg-green-500 text-white" : "bg-yellow-500/20 text-yellow-500"
            )}>
              {isDone ? "Refined" : "Optimizing"}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Status Display */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center relative overflow-hidden">
                {!isDone ? (
                  <Zap size={32} className="text-yellow-500 animate-pulse" />
                ) : (
                  <CheckCircle2 size={32} className="text-green-500 animate-bounce" />
                )}
                {/* Animated Ring */}
                {!isDone && (
                  <div className="absolute inset-0 border-t-4 border-yellow-500 rounded-full animate-spin"></div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {isDone ? "Optimization Complete" : "AI is Refactoring your YAML"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Applying structural improvements and security patches.</p>
            </div>
          </div>

          {/* Progress Log */}
          <div className="bg-[#0E0E11] border border-gray-800 rounded-lg p-5 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-400 mb-4 border-b border-gray-800 pb-2">
              <Terminal size={14} /> Refactor Logs
            </div>
            <div className="space-y-3 h-[180px] overflow-y-auto custom-scrollbar pr-2">
              {IMPROVEMENT_STEPS.slice(0, currentStep + 1).map((step, i) => {
                const active = i === currentStep && !isDone;
                const completed = i < currentStep || isDone;
                
                return (
                  <div key={i} className={cn(
                    "flex items-start gap-3 transition-opacity duration-300",
                    active ? "opacity-100" : completed ? "opacity-60" : "opacity-0"
                  )}>
                    {completed ? (
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-yellow-500/50 border-t-transparent animate-spin mt-0.5" />
                    )}
                    <span className={cn(
                      active ? "text-yellow-400 font-bold" : "text-gray-400"
                    )}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-900/10">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
          >
            Discard Changes
          </button>
          <div className="flex gap-4">
            {!isDone ? (
              <button 
                onClick={onClose}
                className="px-6 py-2 border border-gray-700 rounded text-xs text-gray-400 hover:bg-gray-800 transition"
              >
                Abort
              </button>
            ) : (
              <button 
                onClick={onApply}
                className="flex items-center gap-2 px-8 py-2 bg-yellow-500 text-black font-bold rounded shadow-lg shadow-yellow-500/10 hover:bg-yellow-400 transition transform active:scale-95"
              >
                Apply Refactored YAML <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
