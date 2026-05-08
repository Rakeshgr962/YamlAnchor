'use client';

import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Calendar, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function LogsPage() {
  const history = [
    { id: 1, name: "Production Release", date: "2026-05-08 14:22", status: "success", duration: "4m 12s", savings: "$0.03" },
    { id: 2, name: "PR: Add keyless loop", date: "2026-05-08 11:05", status: "success", duration: "2m 45s", savings: "$0.02" },
    { id: 3, name: "Test: Security Scanner", date: "2026-05-07 23:50", status: "failed", duration: "1m 12s", savings: "$0.01" },
    { id: 4, name: "Nightly Build", date: "2026-05-07 00:00", status: "success", duration: "8m 20s", savings: "$0.07" },
  ];

  const { showToast } = useToast();
  const [selectedLog, setSelectedLog] = useState<number | null>(1);

  const handleExportJSON = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaml-anchor-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast("Exporting logs as JSON...", "success");
  };

  const handleDownloadRaw = () => {
    const logContent = `[00:00:01] INFO: Initializing Dagger engine...\n[00:00:02] INFO: Loading anchor.yaml...\n[00:00:03] INFO: Found 4 jobs in DAG\n[00:00:05] › build: checkout @v3 (1.2s)\n[00:00:07] › build: go test ./... (42.5s)\n[00:01:12] SUCCESS: Job 'build' complete.`;
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-log-report-${selectedLog}.txt`;
    a.click();
    showToast("Downloading raw log report...", "success");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">Automation Logs</h1>
          <p className="text-sm text-gray-500 mt-2">Historical execution reports and telemetry data.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <select className="bg-[#15151A] border border-gray-800 rounded-lg pl-10 pr-8 py-2 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-brand-primary">
              <option>All Projects</option>
              <option>yaml-anchor-ui</option>
              <option>fusiontech-backend</option>
            </select>
          </div>
          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-6 py-2 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left: Execution List */}
        <div className="col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Calendar size={14} /> Execution History
          </h3>
          {history.map(run => (
            <div 
              key={run.id}
              onClick={() => setSelectedLog(run.id)}
              className={cn(
                "p-5 bg-[#15151A] border rounded-xl flex items-center justify-between cursor-pointer transition-all",
                selectedLog === run.id ? "border-brand-primary bg-brand-primary/5" : "border-gray-800 hover:border-gray-600"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg border",
                  run.status === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  {run.status === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{run.name}</h4>
                  <p className="text-[10px] text-gray-600 mt-0.5">{run.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-300">{run.duration}</p>
                <p className="text-[10px] text-brand-primary font-bold">{run.savings} saved</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Logs */}
        <div className="col-span-7 flex flex-col bg-[#08080A] border border-gray-800 rounded-xl overflow-hidden min-h-[600px] shadow-2xl">
          <div className="bg-[#15151A] p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-brand-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                {selectedLog ? `LOG_REPORT_#${selectedLog}` : "Select a run to view logs"}
              </span>
            </div>
            {selectedLog && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/20 text-green-500 rounded uppercase">Success</span>
            )}
          </div>
          
          <div className="flex-1 p-8 font-mono text-xs leading-relaxed text-gray-500 overflow-y-auto custom-scrollbar">
            {selectedLog ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-brand-primary">[00:00:01] INFO: Initializing Dagger engine...</p>
                <p className="text-brand-primary">[00:00:02] INFO: Loading anchor.yaml...</p>
                <p className="text-brand-primary">[00:00:03] INFO: Found 4 jobs in DAG</p>
                <p className="text-white">[00:00:05] › build: checkout @v3 (1.2s)</p>
                <p className="text-white">[00:00:07] › build: go test ./... (42.5s)</p>
                <p className="text-green-500 font-bold">[00:01:12] SUCCESS: Job 'build' complete.</p>
                <p className="text-white">[00:01:13] › lint: golangci-lint (12.1s)</p>
                <p className="text-gray-400 mt-8">--- END OF LOG ---</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                <ScrollText size={64} />
                <p className="text-lg">No run selected</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#15151A] border-t border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              <Clock size={12} /> Full Report Ready
            </div>
            <button 
              onClick={handleDownloadRaw}
              className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition uppercase tracking-widest"
            >
              Download Raw Log <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
