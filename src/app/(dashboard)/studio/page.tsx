'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Settings, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Play, 
  Sparkles, 
  Box,
  Share2,
  Bell,
  Copy,
  Maximize2,
  Minimize2,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { AutoImproveModal } from '@/components/modals/AutoImproveModal';

export default function StudioDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    showToast("Analyzing stack dependencies...", "info");
    setTimeout(() => {
      setIsAnalyzing(false);
      showToast("Stack analysis complete. 4 jobs identified.", "success");
    }, 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    showToast("Pushing anchor.yaml to repository...", "info");
    setTimeout(() => {
      setIsExporting(false);
      showToast("Successfully exported to GitHub main branch!", "success");
    }, 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("version: '1.0'\npipeline:\n  name: go-react-stack...");
    showToast("YAML copied to clipboard", "success");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0F111A]">
      
      {/* Top Navbar */}
      <nav className="h-16 border-b border-gray-800 bg-[#151722] flex items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
              <path d="M50 10C55.5228 10 60 14.4772 60 20C60 25.5228 55.5228 30 50 30C44.4772 30 40 25.5228 40 20C40 14.4772 44.4772 10 50 10Z" fill="#00BCD4"/>
              <rect x="46" y="30" width="8" height="40" fill="#00BCD4"/>
              <path d="M20 50H10V54C10 76.0914 27.9086 94 50 94C72.0914 94 90 76.0914 90 54V50H80H90V54C90 70.3686 79.1672 84.187 64 88.6657V78.6657H75V70H64V88.6657C59.6053 89.9622 54.9126 90.6667 50.0001 90.6667C45.0876 90.6667 40.3949 89.9622 36.0001 88.6657V70H25.0001V78.6657H36.0001V88.6657C20.8329 84.187 10 70.3686 10 54V50H20Z" fill="#00BCD4"/>
            </svg>
            <span className="text-xl font-bold text-white">YamlAnchor</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <button onClick={() => router.push('/workflows')} className="text-gray-400 hover:text-white transition">Dashboard</button>
            <button onClick={() => router.push('/connect')} className="text-brand-tertiary border-b-2 border-brand-tertiary pb-5 transition">Connect Repo</button>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-400">
          <Bell size={20} className="hover:text-white cursor-pointer" />
          <Settings size={20} className="hover:text-white cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rakesh" alt="avatar" />
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Sidebar: Pipeline Intake */}
        <div className="w-80 flex flex-col gap-6">
          <div className="flex-1 bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1F212E]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PIPELINE INTAKE</span>
              <Workflow size={14} className="text-gray-600" />
            </div>
            
            <div className="p-6 flex flex-col flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Stack Description</label>
                <textarea 
                  className="w-full h-32 bg-[#0F111A] border border-gray-700 rounded-lg p-4 text-sm text-gray-300 outline-none focus:border-brand-primary transition-colors resize-none"
                  defaultValue="Go backend + React"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Target Blueprint</label>
                <select className="w-full bg-[#0F111A] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-brand-primary">
                  <option>Auto-detect from stack</option>
                  <option>go-app (Recommended)</option>
                  <option>node-app</option>
                  <option>docker-build</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>Secret Scanner</span>
                  <span className="text-green-500">Clean</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>DAG Validation</span>
                  <span className="text-green-500">Valid</span>
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={cn(
                  "w-full py-3 bg-brand-tertiary text-black font-bold rounded-lg transition shadow-lg shadow-brand-tertiary/10 flex items-center justify-center gap-2",
                  isAnalyzing ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-tertiary/90"
                )}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Stack"}
              </button>
            </div>
          </div>

          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Cost Telemetry</span>
              <span className="text-xs font-bold text-white">$0.008/min saved</span>
            </div>
            <p className="text-[10px] text-brand-primary/70 leading-relaxed">
              Based on your pipeline complexity, local simulation saves an estimated 12 mins of remote CI time per run.
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top: Flow Trace */}
          <div className="flex-1 bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1F212E]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FLOW TRACE</span>
              <div className="flex gap-4">
                <Search size={14} className="text-gray-600 cursor-pointer hover:text-white" />
                <Maximize2 size={14} className="text-gray-600 cursor-pointer hover:text-white" />
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-12 relative">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="flex items-center gap-6 z-10">
                <Node label="build" icon={<Settings size={18} />} />
                <div className="w-8 h-[2px] bg-gray-800"></div>
                <Node label="test" icon={<CheckCircle2 size={18} />} active />
                <div className="w-8 h-[2px] bg-gray-800"></div>
                <Node label="lint" icon={<Workflow size={18} />} />
                <div className="w-8 h-[2px] bg-gray-800"></div>
                <Node label="deploy" icon={<Play size={18} />} />
              </div>
            </div>
          </div>

          {/* Bottom: YAML Preview */}
          <div className="h-[400px] bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1F212E]">
              <div className="flex items-center gap-2">
                <FileTextIcon size={14} className="text-brand-tertiary" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ANCHOR.YAML PREVIEW</span>
              </div>
              <button 
                onClick={handleCopy}
                className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-[#0F111A] p-6 font-mono text-xs leading-relaxed text-gray-400">
              <div className="flex gap-6">
                <div className="text-gray-700 text-right select-none space-y-1">
                  {Array.from({ length: 12 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <div className="space-y-1">
                  <p><span className="text-brand-tertiary">version</span>: '1.0'</p>
                  <p><span className="text-brand-tertiary">pipeline</span>:</p>
                  <p className="pl-4"><span className="text-brand-tertiary">name</span>: go-react-stack</p>
                  <p><span className="text-brand-tertiary">stages</span>:</p>
                  <p className="pl-4">- build</p>
                  <p className="pl-4">- test</p>
                  <p className="pl-4">- lint</p>
                  <p className="pl-4">- deploy</p>
                  <p><span className="text-brand-tertiary">jobs</span>:</p>
                  <p className="pl-4"><span className="text-brand-tertiary">build</span>:</p>
                  <p className="pl-8"><span className="text-brand-tertiary">stage</span>: build</p>
                  <p><span className="text-brand-tertiary">image</span>: golang:1.20</p>
                  <p><span className="text-brand-tertiary">script</span>:</p>
                  <p className="pl-4">- go build ./...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sticky Actions */}
      <div className="h-20 border-t border-gray-800 bg-[#151722] flex items-center justify-end px-8 gap-4">
        <button 
          onClick={() => setShowAIModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-700 bg-gray-800/30 text-white text-sm font-bold hover:bg-gray-800 transition"
        >
          <Sparkles size={16} className="text-brand-primary" /> Auto-Improve
        </button>
        <button 
          onClick={() => router.push('/pulse')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-700 bg-gray-800/30 text-white text-sm font-bold hover:bg-gray-800 transition"
        >
          <Play size={16} className="text-brand-primary" /> Simulate Locally
        </button>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-lg bg-brand-tertiary text-black text-sm font-bold transition shadow-xl shadow-brand-tertiary/20",
            isExporting ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-tertiary/90"
          )}
        >
          {isExporting ? "Exporting..." : <><Download size={16} /> Export to GitHub</>}
        </button>
      </div>

      {showAIModal && <AutoImproveModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}

const Node = ({ label, icon, active = false }: { label: string, icon: React.ReactNode, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-6 py-3 rounded-lg border transition-all cursor-pointer shadow-lg",
    active 
      ? "bg-[#1A1C26] border-green-500 text-green-500 shadow-green-500/10" 
      : "bg-[#1A1C26] border-gray-800 text-gray-500 hover:border-brand-tertiary/50"
  )}>
    <span className={cn(active ? "text-green-500" : "text-brand-tertiary")}>{icon}</span>
    <span className="text-sm font-bold text-white uppercase tracking-wider">{label}</span>
  </div>
);

const FileTextIcon = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);
