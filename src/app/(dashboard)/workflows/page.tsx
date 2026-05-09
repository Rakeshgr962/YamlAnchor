'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Folder,
  Link2,
  CheckCircle2,
  Play,
  Sparkles,
  Download,
  RefreshCw,
  HardDrive,
  Clock,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const GitlabIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.25-.1.41.41 0 0 0-.33.16.43.43 0 0 0-.1.32L15.37 12H8.63L6.15 3.5a.43.43 0 0 0-.1-.32.41.41 0 0 0-.33-.16.38.38 0 0 0-.25.1.42.42 0 0 0-.14.18L2 13.29a2 2 0 0 0 .73 2.32l9.27 6.75 9.27-6.75a2 2 0 0 0 .73-2.32Z"/>
  </svg>
);

const PulseChart = dynamic(() => import('@/components/charts/PulseChart'), { ssr: false });

interface RepoEntry {
  id: number;
  name: string;
  path: string;
  source: 'github' | 'gitlab' | 'local';
  visitedAt: string;
}

const SOURCE_CONFIG = {
  github: {
    label: 'GitHub',
    icon: <GithubIcon />,
    badge: 'bg-gray-800 text-gray-300 border border-gray-700',
    dot: 'bg-indigo-400',
  },
  gitlab: {
    label: 'GitLab',
    icon: <GitlabIcon />,
    badge: 'bg-orange-950/60 text-orange-400 border border-orange-900/40',
    dot: 'bg-orange-400',
  },
  local: {
    label: 'Local',
    icon: <HardDrive size={14} />,
    badge: 'bg-green-950/60 text-green-400 border border-green-900/40',
    dot: 'bg-green-400',
  },
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<RepoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'github' | 'gitlab' | 'local'>('all');

  const loadRepos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/repositories', { cache: 'no-store' });
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch {
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadRepos(); }, [loadRepos]);

  const filtered = filter === 'all' ? repos : repos.filter(r => r.source === filter);

  const counts = {
    all: repos.length,
    github: repos.filter(r => r.source === 'github').length,
    gitlab: repos.filter(r => r.source === 'gitlab').length,
    local: repos.filter(r => r.source === 'local').length,
  };

  const steps = [
    { id: 1, icon: <Folder />, title: "CODE REPOSITORY", desc: "Scan local or remote source" },
    { id: 2, icon: <Link2 />, title: "ANCHOR YAML", desc: "Generate pipeline schema" },
    { id: 3, icon: <CheckCircle2 />, title: "VALIDATE", desc: "Static rule-based checks" },
    { id: 4, icon: <Play />, title: "TEST LOCAL", desc: "Self-healing correction loop" },
    { id: 5, icon: <Sparkles />, title: "AUTO-IMPROVE", desc: "Deterministic fix engine applies corrections until the pipeline passes all checks.", span: true },
    { id: 6, icon: <Download />, title: "EXPORT", desc: "Deploy to .github/workflows or save as YAML to any path.", span: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-14">

      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase italic flex items-center gap-4">
          <span className="text-brand-primary">YAMLANCHOR:</span> CI/CD AS TYPE-SAFE CODE
        </h1>
        <p className="text-gray-500 text-lg font-medium">Stop pushing blind. Start anchoring.</p>
      </div>

      {/* Pipeline Steps */}
      <div className="grid grid-cols-4 gap-6 max-w-7xl">
        {steps.slice(0, 4).map(step => (
          <StepCard key={step.id} {...step} />
        ))}
        {steps.slice(4).map(step => (
          <div key={step.id} className="col-span-2">
            <StepCard {...step} large />
          </div>
        ))}
      </div>

      {/* Code Repository History */}
      <div className="max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">
              Code Repositories
            </h2>
            <p className="text-sm text-gray-500 mt-1">All previously visited repositories this session.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter tabs */}
            <div className="flex gap-1 bg-[#15151A] border border-gray-800 rounded-lg p-1">
              {(['all', 'github', 'gitlab', 'local'] as const).map(src => (
                <button
                  key={src}
                  onClick={() => setFilter(src)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all",
                    filter === src
                      ? "bg-brand-primary text-black"
                      : "text-gray-500 hover:text-gray-200"
                  )}
                >
                  {src === 'all' ? `All (${counts.all})` :
                   src === 'github' ? `GitHub (${counts.github})` :
                   src === 'gitlab' ? `GitLab (${counts.gitlab})` :
                   `Local (${counts.local})`}
                </button>
              ))}
            </div>
            <button
              onClick={loadRepos}
              className="p-2 border border-gray-800 rounded-lg text-gray-500 hover:text-white hover:border-gray-600 transition"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-[#15151A] border border-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-700 space-y-4 bg-[#15151A] border border-gray-800 rounded-xl">
            <Inbox size={48} />
            <p className="text-sm font-medium text-gray-500">No repositories yet.</p>
            <p className="text-xs text-gray-600">
              Clone from{' '}
              <button onClick={() => router.push('/connect')} className="text-brand-primary hover:underline">
                Connectors
              </button>{' '}
              or open a local folder in{' '}
              <button onClick={() => router.push('/studio')} className="text-brand-primary hover:underline">
                Studio
              </button>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(repo => {
              const cfg = SOURCE_CONFIG[repo.source] || SOURCE_CONFIG.local;
              return (
                <div
                  key={repo.id}
                  onClick={() => router.push(`/studio?path=${encodeURIComponent(repo.path)}`)}
                  className="group p-5 bg-[#15151A] border border-gray-800 rounded-xl hover:border-brand-primary/40 transition cursor-pointer space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-0.5", cfg.dot)} />
                      <span className="text-white font-bold text-sm truncate max-w-[160px]">{repo.name}</span>
                    </div>
                    <span className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0", cfg.badge)}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono truncate">{repo.path}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                      <Clock size={10} /> {repo.visitedAt}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-brand-primary opacity-0 group-hover:opacity-100 transition font-bold uppercase tracking-wider">
                      Open in Studio <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pulse Chart teaser */}
      <div className="bg-[#15151A] border border-gray-800 rounded-xl overflow-hidden grid grid-cols-12 max-w-7xl">
        <div className="col-span-4 p-10 space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Pipeline Telemetry
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Monitor your CI/CD pipeline health in real-time. Gain insights into execution times and deployment velocity across all your repositories.
          </p>
          <button
            onClick={() => router.push('/logs')}
            className="w-fit px-8 py-3 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-bold rounded-lg hover:bg-brand-primary/30 transition flex items-center gap-2"
          >
            View Execution Logs <ArrowRight size={18} />
          </button>
        </div>
        <div className="col-span-8 relative min-h-[400px] bg-black/40">
          <PulseChart />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #8069BF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
      </div>

    </div>
  );
}

const StepCard = ({ icon, title, desc, large = false }: { icon: React.ReactNode, title: string, desc: string, large?: boolean }) => (
  <div className={cn(
    "p-8 bg-[#15151A] border border-gray-800 rounded-xl space-y-4 hover:border-brand-primary/30 transition group cursor-pointer",
    large ? "h-full" : "min-h-[160px]"
  )}>
    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-white tracking-widest uppercase">{title}</h3>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);
