'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  RefreshCw, 
  Save, 
  Download, 
  Copy, 
  Sparkles, 
  Play,
  Terminal,
  Activity,
  Box,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AutoImproveModal from '@/components/scanning/AutoImproveModal';

export default function PreviewPipelinePage() {
  const [showImproveModal, setShowImproveModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0E0E11] text-center p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <CheckCircle2 size={64} className="text-brand-primary" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 border border-brand-primary/10 rounded-full animate-ping"></div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight italic uppercase">Pipeline is Production Ready!</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Your YAML configuration has been validated, optimized, and is ready for deployment to GitHub Actions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          <div className="bg-[#15151A] border border-gray-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Anchors</p>
            <p className="text-xl font-bold text-white italic">12 Resolved</p>
          </div>
          <div className="bg-[#15151A] border border-gray-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Secrets</p>
            <p className="text-xl font-bold text-white italic">0 Leaks</p>
          </div>
          <div className="bg-[#15151A] border border-gray-800 p-4 rounded-xl">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Efficiency</p>
            <p className="text-xl font-bold text-green-500 italic">+42%</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-8 py-3 rounded-lg border border-gray-800 text-gray-400 font-bold hover:bg-gray-800 transition"
          >
            Back to Editor
          </button>
          <button className="px-8 py-3 rounded-lg bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition shadow-xl shadow-brand-primary/30 flex items-center gap-2">
            Go to Repository <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0E0E11]">
      
      {/* Top Banner */}
      <div className="bg-brand-primary/10 border-b border-brand-primary/20 py-2 px-8 flex items-center gap-3">
        <CheckCircle2 size={16} className="text-brand-primary" />
        <span className="text-xs font-medium text-brand-primary/70">
          Pipeline generated from your code! <span className="text-brand-primary/50 ml-1">GitHub repo: user/my-project</span>
        </span>
      </div>

      {/* Header */}
      <div className="p-8 border-b border-gray-800/50 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Preview Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1">
            Review the generated YAML and its logical execution tree before deployment.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition">
            <Edit3 size={16} /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition">
            <RefreshCw size={16} /> Regenerate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition">
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Workspace: Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Code Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-800/50 bg-[#171A21]">
          <div className="p-4 border-b border-gray-800/50 flex justify-between items-center bg-gray-900/30">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Terminal size={14} className="text-brand-primary" /> GENERATED YAML
            </div>
            <div className="text-[10px] text-gray-500 font-mono">workflow.yml</div>
          </div>
          
          <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed">
            <div className="flex gap-4">
              <div className="text-gray-600 text-right select-none pr-4 border-r border-gray-800/50">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <div className="flex-1 space-y-0.5">
                <p><span className="text-brand-primary/80">name</span>: <span className="text-yellow-200">CI/CD Pipeline</span></p>
                <p><span className="text-brand-primary/80">on</span>:</p>
                <p className="pl-4"><span className="text-brand-primary/80">push</span>:</p>
                <p className="pl-8"><span className="text-brand-primary/80">branches</span>: [ <span className="text-yellow-200">"main"</span> ]</p>
                <p><span className="text-brand-primary/80">jobs</span>:</p>
                <p className="pl-4"><span className="text-brand-primary/80">test</span>:</p>
                <p className="pl-8"><span className="text-brand-primary/80">runs-on</span>: <span className="text-yellow-200">ubuntu-latest</span></p>
                <p className="pl-8"><span className="text-brand-primary/80">steps</span>:</p>
                <p className="pl-12">- <span className="text-brand-primary/80">uses</span>: <span className="text-yellow-200">actions/checkout@v3</span></p>
                <p className="pl-12">- <span className="text-brand-primary/80">name</span>: <span className="text-yellow-200">Set up Go</span></p>
                <p className="pl-14"><span className="text-brand-primary/80">uses</span>: <span className="text-yellow-200">actions/setup-go@v4</span></p>
                <p className="pl-14"><span className="text-brand-primary/80">with</span>:</p>
                <p className="pl-16"><span className="text-brand-primary/80">go-version</span>: <span className="text-yellow-200">'1.21'</span></p>
                <p className="pl-12">- <span className="text-brand-primary/80">name</span>: <span className="text-yellow-200">Test</span></p>
                <p className="pl-14"><span className="text-brand-primary/80">run</span>: <span className="text-yellow-200">go test -v ./...</span></p>
                <p className="pl-4"><span className="text-brand-primary/80">build</span>:</p>
                <p className="pl-8"><span className="text-brand-primary/80">needs</span>: <span className="text-yellow-200">test</span></p>
                <p className="pl-8"><span className="text-brand-primary/80">runs-on</span>: <span className="text-yellow-200">ubuntu-latest</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Pipeline Preview */}
        <div className="w-[450px] flex flex-col bg-[#121216]">
          <div className="p-4 border-b border-gray-800/50 bg-gray-900/30 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Activity size={14} className="text-yellow-500" /> PIPELINE PREVIEW
          </div>
          
          <div className="flex-1 overflow-auto p-10 relative">
            {/* Visual DAG */}
            <div className="space-y-12">
              
              {/* Job Node: Test */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/5">
                    <Box size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      test <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">ubuntu-latest</span>
                    </h4>
                  </div>
                </div>

                <div className="space-y-3 pl-5 border-l-2 border-dashed border-gray-800 ml-5 py-2">
                  <StepCard label="actions/checkout@v3" />
                  <StepCard label="Set up Go" />
                  <StepCard label="go test -v ./..." />
                </div>
              </div>

              {/* Connecting Line */}
              <div className="absolute left-[39px] top-[180px] bottom-[100px] border-l-2 border-dashed border-gray-800 -z-10"></div>

              {/* Job Node: Build */}
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
                    <Play size={20} />
                  </div>
                  <div>
                    <h4 className="text-gray-400 font-bold text-lg flex items-center gap-2">
                      build <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded border border-brand-primary/20">depends_on: test</span>
                    </h4>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50 bg-[#0E0E11] flex justify-between items-center z-10 sticky bottom-0">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-800 rounded-md text-sm text-gray-400 hover:text-gray-200 transition">
            <Download size={16} /> Download YAML
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-800 rounded-md text-sm text-gray-400 hover:text-gray-200 transition">
            <Copy size={16} /> Copy
          </button>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowImproveModal(true)}
            className="flex items-center gap-2 px-6 py-2 rounded border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-sm font-semibold hover:bg-yellow-500/10 transition"
          >
            <Sparkles size={16} /> Auto-Improve
          </button>
          <button 
            onClick={() => setIsSuccess(true)}
            className="flex items-center gap-2 px-8 py-2 rounded bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
          >
            <CheckCircle2 size={16} /> Use This
          </button>
        </div>
      </div>

      {/* Auto-Improve Loop Modal */}
      {showImproveModal && (
        <AutoImproveModal 
          onClose={() => setShowImproveModal(false)} 
          onApply={() => {
            setShowImproveModal(false);
          }} 
        />
      )}
    </div>
  );
}

const StepCard = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg group hover:border-gray-700 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/50"></div>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <CheckCircle2 size={14} className="text-gray-600 group-hover:text-green-500 transition-colors" />
  </div>
);
