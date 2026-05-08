'use client';

import React from 'react';
import { 
  Box, 
  Cpu, 
  Database, 
  Globe, 
  Terminal, 
  Zap,
  Search,
  Plus,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function NodesPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const blueprints = [
    { name: "Go Backend", desc: "Optimized for Go 1.20+, caching, and linting.", type: "Official" },
    { name: "Node.js App", desc: "Vite/Next.js support with pnpm/npm caching.", type: "Official" },
    { name: "Python API", desc: "Poetry/Pipenv integration with security scanning.", type: "Community" },
    { name: "Docker Compose", desc: "Multi-container orchestration blueprints.", type: "Official" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">Nodes & Blueprints</h1>
          <p className="text-sm text-gray-500 mt-2">Manage your CI runner environments and pre-configured templates.</p>
        </div>
        <button 
          onClick={() => showToast("Opening Blueprint Marketplace...", "info")}
          className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
        >
          Browse Marketplace
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Blueprints Grid */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
          {blueprints.map((bp, i) => (
            <div 
              key={i} 
              onClick={() => showToast(`Selected ${bp.name} blueprint for configuration.`, "success")}
              className="p-6 bg-[#15151A] border border-gray-800 rounded-xl space-y-4 hover:border-brand-primary/50 transition group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition">
                  <Box size={20} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-800 text-gray-500 rounded uppercase tracking-widest">{bp.type}</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{bp.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{bp.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Nodes / Runners */}
        <div className="col-span-4 bg-[#15151A] border border-gray-800 rounded-xl p-8 space-y-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Runners (4)</h3>
          
          <div className="space-y-6">
            <RunnerNode name="anchor-runner-01" status="Idle" region="us-east-1" />
            <RunnerNode name="anchor-runner-02" status="Active" region="eu-west-1" />
            <RunnerNode name="anchor-runner-03" status="Idle" region="us-west-2" />
          </div>

          <div className="pt-8 border-t border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compute Usage</span>
              <span className="text-xs font-bold text-brand-primary">12%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-[12%] bg-brand-primary"></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

const RunnerNode = ({ name, status, region }: { name: string, status: string, region: string }) => {
  const { showToast } = useToast();
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === "Active" ? "bg-brand-primary animate-pulse" : "bg-gray-600"
        )}></div>
        <div>
          <p className="text-xs font-bold text-white">{name}</p>
          <p className="text-[10px] text-gray-600 font-medium">{region}</p>
        </div>
      </div>
      <button 
        onClick={() => showToast(`Opening management console for ${name}...`, "info")}
        className="p-2 text-gray-600 hover:text-white transition"
      >
        <Settings size={14} />
      </button>
    </div>
  );
};
