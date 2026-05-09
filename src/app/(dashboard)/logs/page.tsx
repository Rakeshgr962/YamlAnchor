'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollText, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchLogs, fetchLogDetails } from '@/actions/connection';
import { useToast } from '@/components/ui/Toast';

interface LogMeta {
  id: number;
  name: string;
  date: string;
  status: string;
  duration: string;
  cycles: number;
}

interface LogDetail extends LogMeta {
  logs: string[];
}

export default function LogsPage() {
  const { showToast } = useToast();
  const [history, setHistory] = useState<LogMeta[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchLogs();
    setHistory(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSelectLog = async (id: number) => {
    setIsLoadingDetail(true);
    const detail = await fetchLogDetails(id);
    setSelectedLog(detail);
    setIsLoadingDetail(false);
  };

  const handleExportJSON = () => {
    if (!selectedLog) return;
    const blob = new Blob([JSON.stringify(selectedLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-log-${selectedLog.id}-${selectedLog.date.replace(/\s/g, '_')}.json`;
    a.click();
    showToast('Log exported as JSON', 'success');
  };

  const handleDownloadRaw = () => {
    if (!selectedLog?.logs) return;
    const blob = new Blob([selectedLog.logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-log-${selectedLog.id}.txt`;
    a.click();
    showToast('Downloading raw log...', 'success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">Automation Logs</h1>
          <p className="text-sm text-gray-500 mt-2">Real execution history from your pipeline runs.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition text-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          {selectedLog && (
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition text-sm"
            >
              Export JSON
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">

        {/* Left: Execution List */}
        <div className="col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Clock size={14} /> Execution History ({history.length} runs)
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-[#15151A] border border-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 space-y-4">
              <Inbox size={48} />
              <p className="text-sm font-medium">No runs yet.</p>
              <p className="text-xs text-gray-700">Run a pipeline from the <span className="text-brand-primary">Studio</span> to see logs here.</p>
            </div>
          ) : (
            history.map(run => (
              <div
                key={run.id}
                onClick={() => handleSelectLog(run.id)}
                className={cn(
                  "p-5 bg-[#15151A] border rounded-xl flex items-center justify-between cursor-pointer transition-all",
                  selectedLog?.id === run.id ? "border-brand-primary bg-brand-primary/5" : "border-gray-800 hover:border-gray-600"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg border",
                    run.status === "success"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                  )}>
                    {run.status === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{run.name}</h4>
                    <p className="text-[10px] text-gray-600 mt-0.5">{run.date}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-gray-300">{run.duration}</p>
                  <p className="text-[10px] text-gray-600 font-mono">{run.cycles} cycle{run.cycles !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Detailed Logs */}
        <div className="col-span-7 flex flex-col bg-[#08080A] border border-gray-800 rounded-xl overflow-hidden min-h-[600px] shadow-2xl">
          <div className="bg-[#15151A] p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-brand-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                {selectedLog ? `RUN #${selectedLog.id} — ${selectedLog.name}` : "Select a run to view logs"}
              </span>
            </div>
            {selectedLog && (
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                selectedLog.status === 'success'
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              )}>
                {selectedLog.status}
              </span>
            )}
          </div>

          <div className="flex-1 p-8 font-mono text-xs leading-relaxed text-gray-500 overflow-y-auto">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
              </div>
            ) : selectedLog ? (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-gray-700 mb-4"># Run started at {selectedLog.date} — {selectedLog.cycles} cycles</p>
                {selectedLog.logs?.map((line, i) => (
                  <p key={i} className={cn(
                    line.startsWith('✓') ? 'text-green-400' :
                    line.startsWith('✗') || line.includes('Error') ? 'text-red-400' :
                    line.startsWith('━') ? 'text-brand-primary font-bold' :
                    line.startsWith('  ') ? 'text-gray-400 pl-4' :
                    'text-gray-300'
                  )}>
                    {line}
                  </p>
                ))}
                <p className="text-gray-700 mt-6">--- END OF LOG ---</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                <ScrollText size={64} />
                <p className="text-lg">No run selected</p>
              </div>
            )}
          </div>

          {selectedLog && (
            <div className="p-4 bg-[#15151A] border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <Clock size={12} /> {selectedLog.duration} — {selectedLog.cycles} self-healing cycles
              </div>
              <button
                onClick={handleDownloadRaw}
                className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition uppercase tracking-widest"
              >
                Download Raw Log <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
