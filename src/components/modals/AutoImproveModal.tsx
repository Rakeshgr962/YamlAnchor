'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Zap, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AutoImproveModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Analyzing execution history...", icon: <Brain className="text-brand-primary" /> },
    { label: "Identifying bottlenecks in 'build' step...", icon: <Zap className="text-yellow-500" /> },
    { label: "Generating optimized DAG...", icon: <Sparkles className="text-brand-tertiary" /> },
    { label: "Validation complete. 12% speedup predicted.", icon: <CheckCircle2 className="text-green-500" /> },
  ];

  useEffect(() => {
    if (step < steps.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
          {steps.map((s, i) => (
            <div key={i} className={cn(
              "flex items-center gap-4 transition-all duration-500",
              i <= step ? "opacity-100 translate-x-0" : "opacity-20 -translate-x-4"
            )}>
              <div className="p-2 rounded-md bg-gray-800/50">
                {s.icon}
              </div>
              <span className="text-sm font-medium text-gray-300">{s.label}</span>
            </div>
          ))}
        </div>

        {step === steps.length - 1 && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={onClose}
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
