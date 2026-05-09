'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, Search, Settings, CheckCircle2, ChevronRight, Download, 
  Play, Sparkles, Box, Share2, Bell, Copy, Maximize2, Minimize2, Workflow, FolderOpen, FileCode2, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { connectToGithub, scanYaml, validateYaml, listDirectory, improveYaml, browseFolder, deployYaml, saveAsYaml, testLocal, addRunLog } from '@/actions/connection';

export default function StudioDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step 1: Directory Selection
  const [projectPath, setProjectPath] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [isLoadingDir, setIsLoadingDir] = useState(false);

  useEffect(() => {
    const pathParam = searchParams.get('path');
    if (pathParam) {
      setProjectPath(pathParam);
    }
  }, [searchParams]);

  // Step 2: Main File Selection
  const [mainFile, setMainFile] = useState("");
  
  // Step 3: Architecture Understanding
  const [isUnderstanding, setIsUnderstanding] = useState(false);
  const [architectureUnderstood, setArchitectureUnderstood] = useState(false);

  // Step 4: Flow Generation & Self-Healing
  const [isFlowRunning, setIsFlowRunning] = useState(false);
  const [flowLogs, setFlowLogs] = useState<{label: string, isError: boolean, isSuccess: boolean}[]>([]);
  const [generatedYaml, setGeneratedYaml] = useState<string>("# Pipeline will appear here once finalized.");
  const [isPerfected, setIsPerfected] = useState(false);
  const [currentStage, setCurrentStage] = useState<'build' | 'test' | 'correct' | 'deploy' | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'visual' | 'terminal'>('terminal');

  // Step 5: Deploy & Save
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBrowseFolderClick = async () => {
    showToast("Opening folder picker...", "info");
    const res = await browseFolder();
    if (res.success && res.path) {
      setProjectPath(res.path);
      showToast("Folder selected successfully.", "success");
    } else {
      showToast("Folder selection canceled or failed.", "error");
    }
  };

  const handleLoadDirectory = async () => {
    if (!projectPath) {
      showToast("Please enter a valid project path.", "error");
      return;
    }
    setIsLoadingDir(true);
    showToast("Scanning directory...", "info");
    const res = await listDirectory(projectPath);
    setIsLoadingDir(false);
    if (res.success && res.files) {
      setFiles(res.files);
      showToast(`Found ${res.files.length} files in directory.`, "success");
    } else {
      setFiles([]);
      showToast("Failed to load directory. Is it a valid absolute path?", "error");
    }
  };

  const handleUnderstandStructure = async () => {
    if (!mainFile) {
      showToast("Please select a main file.", "error");
      return;
    }
    setIsUnderstanding(true);
    showToast("Analyzing project structure based on main file...", "info");
    
    setTimeout(() => {
      setIsUnderstanding(false);
      setArchitectureUnderstood(true);
      showToast("Architecture understood. Ready for pipeline generation.", "success");
    }, 1500);
  };

  const handleStartFlow = async () => {
    setIsFlowRunning(true);
    setActiveTab('terminal');
    setFlowLogs([{ label: "Generating initial YAML based on understood structure...", isError: false, isSuccess: false }]);
    setIsPerfected(false);
    setCurrentStage('build');
    const startTime = Date.now();
    const runLogs: string[] = [];
    
    try {
      const response = await connectToGithub("workspace", projectPath, mainFile);
      if (response.success && response.generatedYaml) {
        let currentYaml = response.generatedYaml;
        setGeneratedYaml(currentYaml);
        setFlowLogs(prev => [...prev, { label: "✓ Build stage: Initial YAML generated.", isError: false, isSuccess: false }]);
        runLogs.push("✓ Build stage: Initial YAML generated.");

        let cycle = 1;

        // Loop until the YAML passes all static checks — no arbitrary cap
        while (true) {
          setCurrentStage('test');
          setFlowLogs(prev => [...prev, { label: `━━━ Cycle ${cycle}: Running local test...`, isError: false, isSuccess: false }]);
          runLogs.push(`━━━ Cycle ${cycle}: Running local test...`);
          
          const testRes = await testLocal(currentYaml, cycle);
          
          if (!testRes.success) {
            setFlowLogs(prev => [...prev, { label: `✗ Execution stopped.`, isError: true, isSuccess: false }]);
            setFlowLogs(prev => [...prev, { label: `  Error: ${testRes.error}`, isError: true, isSuccess: false }]);
            runLogs.push(`✗ Error: ${testRes.error}`);
            setCurrentStage('correct');
            setFlowLogs(prev => [...prev, { label: `  Understanding error and applying correction...`, isError: false, isSuccess: false }]);
            runLogs.push(`  Applying correction...`);
            
            const improveRes = await improveYaml(currentYaml, 1);
            if (improveRes.finalYaml) {
              currentYaml = improveRes.finalYaml;
            }
            setGeneratedYaml(currentYaml);
            setFlowLogs(prev => [...prev, { label: `  ✓ Correction applied. Retesting...`, isError: false, isSuccess: false }]);
            runLogs.push(`  ✓ Correction applied.`);
            cycle++;
          } else {
            // No more errors — done
            setCurrentStage('deploy');
            setGeneratedYaml(currentYaml);
            localStorage.setItem('anchor_yaml', currentYaml);
            setIsPerfected(true);
            runLogs.push("✓ No errors detected. Pipeline PASSED.");
            setFlowLogs(prev => [...prev, { label: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", isError: false, isSuccess: false }]);
            setFlowLogs(prev => [...prev, { label: `✓ No errors detected after ${cycle} cycle${cycle > 1 ? 's' : ''}. PASSED.`, isError: false, isSuccess: true }]);
            setFlowLogs(prev => [...prev, { label: "✓ Pipeline ready for deployment.", isError: false, isSuccess: true }]);
            break;
          }
        }

      } else {
        setFlowLogs(prev => [...prev, { label: "✗ CRITICAL: YAML Generation failed.", isError: true, isSuccess: false }]);
      }
    } catch (err) {
      setFlowLogs(prev => [...prev, { label: `✗ Exception: ${String(err)}`, isError: true, isSuccess: false }]);
      runLogs.push(`✗ Exception: ${String(err)}`);
    } finally {
      setIsFlowRunning(false);
      // Save the real run to the log store
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      const status = isPerfected ? 'success' : 'failed';
      const name = projectPath ? projectPath.split(/[\\/]/).pop() || 'Pipeline Run' : 'Pipeline Run';
      const cycleCount = runLogs.filter(l => l.startsWith('━━━ Cycle')).length;
      await addRunLog({ name: `${name} — ${mainFile || 'auto'}`, status, duration, cycles: cycleCount, logs: runLogs });
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    showToast("Exporting pipeline to .github/workflows...", "info");
    const res = await deployYaml(projectPath, generatedYaml);
    setIsDeploying(false);
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.error || "Failed to deploy", "error");
    }
  };

  const handleSaveAs = async () => {
    setIsSaving(true);
    showToast("Opening Save As dialog...", "info");
    const res = await saveAsYaml(generatedYaml);
    setIsSaving(false);
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.error || "Save canceled.", "error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedYaml);
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
            <button className="text-brand-tertiary border-b-2 border-brand-tertiary pb-5 transition">Pipeline Wizard</button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Sidebar: Setup Wizard */}
        <div className="w-96 flex flex-col gap-6">
          <div className="flex-1 bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1F212E]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Setup Wizard</span>
              <Workflow size={14} className="text-gray-600" />
            </div>
            
            <div className="p-6 flex flex-col flex-1 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-bold">1</div>
                  <h3 className="text-white font-bold tracking-tight">Load Local Project</h3>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Enter absolute path (e.g. C:\projects\app)"
                      value={projectPath}
                      onChange={(e) => setProjectPath(e.target.value)}
                      className="flex-1 bg-[#0F111A] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-brand-primary transition-colors"
                    />
                    <button 
                      onClick={handleBrowseFolderClick}
                      className="px-4 py-2 bg-[#0F111A] border border-gray-700 text-gray-300 text-sm font-bold rounded-lg hover:border-brand-primary hover:text-white transition whitespace-nowrap"
                    >
                      Browse...
                    </button>
                  </div>
                  <button 
                    onClick={handleLoadDirectory}
                    disabled={isLoadingDir}
                    className="w-full py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-700 transition"
                  >
                    {isLoadingDir ? "Scanning..." : "Load Directory"}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={cn("space-y-4 transition-opacity", files.length > 0 ? "opacity-100" : "opacity-30 pointer-events-none")}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-tertiary text-black text-xs flex items-center justify-center font-bold">2</div>
                  <h3 className="text-white font-bold tracking-tight">Select Main File</h3>
                </div>
                <div className="space-y-2 ml-8">
                  <select 
                    className="w-full bg-[#0F111A] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-brand-tertiary"
                    value={mainFile}
                    onChange={(e) => setMainFile(e.target.value)}
                  >
                    <option value="" disabled>-- Select start file --</option>
                    {files.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleUnderstandStructure}
                    disabled={isUnderstanding || !mainFile}
                    className="w-full py-2 bg-brand-tertiary text-black text-sm font-bold rounded-lg hover:bg-brand-tertiary/90 transition shadow-lg shadow-brand-tertiary/10"
                  >
                    {isUnderstanding ? "Analyzing Architecture..." : "Understand Structure"}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className={cn("space-y-4 transition-opacity", architectureUnderstood ? "opacity-100" : "opacity-30 pointer-events-none")}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                  <h3 className="text-white font-bold tracking-tight">Generate & Heal</h3>
                </div>
                <div className="space-y-2 ml-8">
                  <p className="text-xs text-gray-400">Architecture mapped. Ready to kick off the self-healing CI generation loop.</p>
                  <button 
                    onClick={handleStartFlow}
                    disabled={isFlowRunning || isPerfected}
                    className="w-full py-3 bg-green-500 text-black text-sm font-bold rounded-lg hover:bg-green-400 transition shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    {isFlowRunning ? <><Sparkles size={16} className="animate-spin" /> Running Loop...</> : "Start Flow"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top: Output Tabs */}
          <div className="flex-1 bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden relative">
            <div className="flex border-b border-gray-800 bg-[#1F212E]">
              <button 
                onClick={() => setActiveTab('visual')}
                className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2", activeTab === 'visual' ? "text-brand-tertiary border-b-2 border-brand-tertiary bg-[#1A1C26]" : "text-gray-500 hover:text-white")}
              >
                <Workflow size={14} /> Visual Pipeline
              </button>
              <button 
                onClick={() => setActiveTab('terminal')}
                className={cn("px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2", activeTab === 'terminal' ? "text-brand-tertiary border-b-2 border-brand-tertiary bg-[#1A1C26]" : "text-gray-500 hover:text-white")}
              >
                <Terminal size={14} /> Self-Healing Logs
              </button>
            </div>
            
            {activeTab === 'terminal' ? (
              <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-y-auto custom-scrollbar space-y-2 bg-[#0F111A]">
                {flowLogs.length === 0 ? (
                  <div className="text-gray-600 italic">Logs will appear here once the flow starts...</div>
                ) : (
                  flowLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-gray-600 mt-0.5 select-none">›</span>
                      <span className={cn(
                        log.isError ? "text-red-400 font-bold" : 
                        log.isSuccess ? "text-green-400 font-bold" : 
                        "text-gray-300"
                      )}>{log.label}</span>
                    </div>
                  ))
                )}
                {isFlowRunning && (
                  <div className="flex gap-4 items-center animate-pulse">
                    <span className="text-gray-600 select-none">›</span>
                    <div className="w-2 h-4 bg-brand-primary/50"></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 relative bg-[#0F111A]">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="flex flex-col items-center gap-8 z-10">
                  {isPerfected ? (
                    <div className="flex items-center gap-6">
                      <Node label="build" icon={<Settings size={18} />} completed />
                      <div className="w-8 h-[2px] bg-green-500"></div>
                      <Node label="test" icon={<CheckCircle2 size={18} />} completed />
                      <div className="w-8 h-[2px] bg-green-500"></div>
                      <Node label="deploy" icon={<Play size={18} />} active />
                    </div>
                  ) : currentStage === 'build' ? (
                    <div className="flex items-center gap-6">
                      <Node label="build" icon={<Settings size={18} />} active />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="test" icon={<CheckCircle2 size={18} />} />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="deploy" icon={<Play size={18} />} />
                    </div>
                  ) : currentStage === 'test' ? (
                    <div className="flex items-center gap-6">
                      <Node label="build" icon={<Settings size={18} />} completed />
                      <div className="w-8 h-[2px] bg-brand-tertiary animate-pulse"></div>
                      <Node label="test" icon={<CheckCircle2 size={18} />} active />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="deploy" icon={<Play size={18} />} />
                    </div>
                  ) : currentStage === 'correct' ? (
                    <div className="flex items-center gap-6">
                      <Node label="build" icon={<Settings size={18} />} completed />
                      <div className="w-8 h-[2px] bg-red-500/50"></div>
                      <Node label="test" icon={<CheckCircle2 size={18} />} error />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="deploy" icon={<Play size={18} />} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-6 opacity-30">
                      <Node label="build" icon={<Settings size={18} />} />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="test" icon={<CheckCircle2 size={18} />} />
                      <div className="w-8 h-[2px] bg-gray-800"></div>
                      <Node label="deploy" icon={<Play size={18} />} />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">Live DAG Trace</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom: YAML Preview & Deploy */}
          <div className="h-[350px] bg-[#1A1C26] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1F212E]">
              <div className="flex items-center gap-2">
                <FileCode2 size={14} className={cn(isPerfected ? "text-green-500" : "text-gray-500")} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FINAL YAML PREVIEW</span>
              </div>
              <button 
                onClick={handleCopy}
                disabled={!isPerfected}
                className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-[#0F111A] p-6 font-mono text-xs leading-relaxed text-gray-400 relative">
              <div className="flex gap-6">
                <div className="text-gray-700 text-right select-none space-y-1">
                  {generatedYaml.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <div className="space-y-1 whitespace-pre">
                  {generatedYaml.split('\n').map((line, i) => (
                    <div key={i}>
                      {line.includes(':') ? (
                        <>
                          <span className="text-brand-tertiary">{line.substring(0, line.indexOf(':') + 1)}</span>
                          <span className="text-gray-300">{line.substring(line.indexOf(':') + 1)}</span>
                        </>
                      ) : (
                        <span className={line.startsWith('#') ? "text-gray-500" : "text-gray-300"}>{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Overlay */}
              {isPerfected && (
                <div className="absolute bottom-6 right-6 p-6 bg-[#1A1C26]/95 backdrop-blur border border-green-500/30 shadow-2xl shadow-green-500/10 rounded-xl animate-in slide-in-from-bottom-8 duration-700 w-[350px]">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-500" size={24} />
                      <h3 className="text-white font-bold text-lg">YAML Perfected!</h3>
                    </div>
                    <p className="text-xs text-gray-400">The AI has verified this pipeline will successfully execute. How would you like to save it?</p>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={handleDeploy}
                        disabled={isDeploying || isSaving}
                        className="w-full py-2.5 bg-brand-primary text-white text-sm font-bold rounded-lg hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20 flex justify-center items-center gap-2"
                      >
                        {isDeploying ? "Deploying..." : <><Download size={16} /> Deploy to .github/workflows</>}
                      </button>
                      <button 
                        onClick={handleSaveAs}
                        disabled={isDeploying || isSaving}
                        className="w-full py-2.5 bg-[#0F111A] border border-gray-700 text-gray-300 text-sm font-bold rounded-lg hover:border-gray-500 hover:text-white transition flex justify-center items-center gap-2"
                      >
                        {isSaving ? "Opening Dialog..." : <><Save size={16} /> Save As...</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Node = ({ label, icon, active = false, completed = false, error = false }: { label: string, icon: React.ReactNode, active?: boolean, completed?: boolean, error?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-6 py-3 rounded-lg border transition-all cursor-pointer shadow-lg",
    completed
      ? "bg-[#1A1C26] border-green-500 text-green-500 shadow-green-500/10"
      : error
        ? "bg-[#1A1C26] border-red-500 text-red-500 shadow-red-500/10 animate-pulse"
        : active 
          ? "bg-[#1A1C26] border-brand-tertiary text-brand-tertiary shadow-brand-tertiary/10 animate-pulse" 
          : "bg-[#1A1C26] border-gray-800 text-gray-500"
  )}>
    <span>{icon}</span>
    <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
  </div>
);
