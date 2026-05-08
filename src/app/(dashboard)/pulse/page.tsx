'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Play, 
  Clock, 
  Terminal as TerminalIcon, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function PulseTuiPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'shell'>('logs');
  const [shellInput, setShellInput] = useState("");
  
  useEffect(() => {
    const messages = [
      "Fetching dependencies...",
      "> go mod download",
      "go: downloading github.com/gorilla/mux v1.8.0...",
      "go: downloading golang.org/x/sys v0.0.0-20220715151400-c0bba94af5f8...",
      "go: downloading gopkg.in/yaml.v3 v3.0.1...",
      "Extracting layers...",
      "Building binary...",
      "Running unit tests...",
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, messages[i % messages.length]]);
      i++;
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const handleShellCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && shellInput.trim()) {
      showToast(`Executing remote command: ${shellInput}`, "info");
      setShellInput("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#111114] p-12 items-center justify-center">
      
      <div className="w-full max-w-[900px] bg-[#15151A] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-brand-primary rounded-sm transform rotate-45"></div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              YamlAnchor Pulse Dashboard — Local Simulation (Dagger)
            </h1>
          </div>
          <button 
            onClick={() => showToast("Simulation session terminated.", "error")}
            className="px-4 py-1.5 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-bold rounded uppercase tracking-widest hover:bg-brand-primary/30 transition"
          >
            [Ctrl+C to stop]
          </button>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Pipeline Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pipeline Status</h3>
            
            <StatusCard 
              icon={<CheckCircle2 size={20} />} 
              title="build" 
              desc="checkout, setup-go (done), go mod download (running)" 
              progress={80} 
              active
            />
            <StatusCard 
              icon={<Play size={20} />} 
              title="lint" 
              desc="running linter" 
              progress={40} 
              color="border-yellow-500/50"
              barColor="bg-yellow-500"
            />
            <StatusCard 
              icon={<Clock size={20} />} 
              title="deploy" 
              desc="waiting" 
              progress={0} 
              opacity="opacity-40"
            />
          </div>

          {/* Tabs: Active Log / Debug Shell */}
          <div className="space-y-4">
            <div className="flex gap-6 border-b border-gray-800">
              <button 
                onClick={() => setActiveTab('logs')}
                className={cn(
                  "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative",
                  activeTab === 'logs' ? "text-brand-primary" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <TerminalIcon size={14} className="inline mr-2" /> Active Log (build)
                {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('shell')}
                className={cn(
                  "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative",
                  activeTab === 'shell' ? "text-brand-primary" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Zap size={14} className="inline mr-2" /> Debug Shell (exec)
                {activeTab === 'shell' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"></div>}
              </button>
            </div>
            
            {activeTab === 'logs' ? (
              <div className="bg-[#08080A] border border-gray-800 rounded-lg p-6 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="space-y-1 h-[250px] overflow-y-auto custom-scrollbar pr-4">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-gray-600 select-none">›</span>
                      <span className={cn(
                        log.startsWith('>') ? "text-white font-bold" : "text-gray-400"
                      )}>{log}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 items-center animate-pulse">
                    <span className="text-gray-600 select-none">›</span>
                    <div className="w-2 h-4 bg-brand-primary/50"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#08080A] border border-gray-800 rounded-lg p-6 font-mono text-sm leading-relaxed overflow-hidden flex flex-col h-[250px]">
                <div className="flex-1 space-y-2 text-gray-400 overflow-y-auto custom-scrollbar">
                  <p className="text-yellow-500">[!] Job 'build' failed at step: 'go test ./...'</p>
                  <p className="text-white">root@anchor-runner:/# ls -la</p>
                  <p>total 12</p>
                  <p>drwxr-xr-x 1 root root 4096 May 8 17:40 .</p>
                  <p>drwxr-xr-x 1 root root 4096 May 8 17:40 ..</p>
                  <p>-rw-r--r-- 1 root root  128 May 8 17:40 go.mod</p>
                  <p className="text-brand-primary">root@anchor-runner:/# _</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3">
                  <span className="text-brand-primary font-bold">#</span>
                  <input 
                    type="text" 
                    value={shellInput}
                    onChange={(e) => setShellInput(e.target.value)}
                    onKeyDown={handleShellCommand}
                    placeholder="Type a command to debug the container..." 
                    className="bg-transparent border-none outline-none text-white w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 border-t border-gray-800 bg-gray-900/10 flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock size={12} /> LOCAL RUN 2M 14S</span>
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} /> ESTIMATED GITHUB CI 8-12M
          </div>
        </div>

      </div>

    </div>
  );
}

const StatusCard = ({ 
  icon, 
  title, 
  desc, 
  progress, 
  active = false, 
  opacity = "", 
  color = "border-gray-800",
  barColor = "bg-brand-primary"
}: { 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  progress: number, 
  active?: boolean, 
  opacity?: string,
  color?: string,
  barColor?: string
}) => (
  <div className={cn(
    "p-5 bg-[#1A1A20] border rounded-lg flex items-center justify-between group transition-all",
    color,
    active ? "bg-brand-primary/5" : "",
    opacity
  )}>
    <div className="flex items-center gap-5">
      <div className={cn(
        "w-12 h-12 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 transition-colors",
        active ? "text-brand-primary border-brand-primary/30 bg-brand-primary/10" : ""
      )}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-xs text-gray-500 font-medium">
          {desc.split('(done)').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && <span className="text-brand-primary font-bold">(done)</span>}
            </React.Fragment>
          ))}
          {desc.includes('(running)') && (
            <span className="text-yellow-500 font-bold ml-1 animate-pulse">
              {desc.substring(desc.indexOf('(running)'))}
            </span>
          )}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-4 min-w-[200px]">
      <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", barColor)} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-xs font-bold text-white font-mono w-10 text-right">{progress}%</span>
    </div>
  </div>
);
