"use client";

import React, { useState, useEffect } from 'react';
import { Search, Folder, FileText, Check, RefreshCw } from 'lucide-react';

interface ScanningModalProps {
  onClose: () => void;
}

export default function ScanningModal({ onClose }: ScanningModalProps) {
  const [scanProgress, setScanProgress] = useState(0);

  // Simulates the scanner connecting to your backend and progressing to 85%
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#15151A] border border-gray-700 rounded-xl p-8 w-[600px] shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Search className="text-indigo-400" size={28} />
          <h2 className="text-2xl font-bold text-white tracking-wide">SCANNING YOUR CODEBASE</h2>
        </div>

        {/* Directory Tag */}
        <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-md px-3 py-1 mb-8">
          <Folder size={14} className="text-yellow-500" />
          <span className="text-xs text-gray-300 font-mono">Scanning /project</span>
        </div>

        {/* Progress Stats */}
        <div className="flex justify-between items-end mb-2">
          <span className="text-5xl font-bold text-indigo-300">{scanProgress}%</span>
          <span className="text-xs text-gray-500 mb-2">Estimated time: 5 seconds</span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-brand-primary transition-all duration-300 ease-out"
            style={{ width: `${scanProgress}%` }}
          ></div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">

          {/* Files Identified Column */}
          <div className="bg-[#0E0E11] border border-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <FileText size={16} className="text-yellow-500" /> Files Identified
            </h4>
            <ul className="space-y-3 text-sm text-gray-400 font-mono">
              <li className="flex items-center gap-2"><Check size={14} className="text-white" /> go.mod</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-white" /> package.json</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-white" /> Dockerfile</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-white" /> .env.example</li>
            </ul>
          </div>

          {/* Current Tasks Column */}
          <div className="bg-[#0E0E11] border border-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <RefreshCw size={16} className="text-indigo-400" /> Current Tasks
            </h4>
            <div className="space-y-2">
              <div className="bg-gray-800/40 border border-gray-700/50 rounded p-2 text-xs text-gray-400 flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-yellow-500" /> Analyzing dependencies...
              </div>
              <div className="bg-gray-800/40 border border-gray-700/50 rounded p-2 text-xs text-gray-400 flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-yellow-500" /> Detecting test patterns...
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded border border-gray-700 hover:bg-gray-800 text-gray-300 text-sm transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}