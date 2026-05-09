'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  Terminal,
  Shield,
  Copy,
  ChevronRight,
  Zap,
  GitBranch,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const CodeBlock = ({ label, code }: { label: string; code: string }) => {
  const { showToast } = useToast();
  return (
    <div className="bg-[#08080A] border border-gray-800 rounded-xl p-5 group relative">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{label}</p>
      <pre className="text-brand-primary font-mono text-sm whitespace-pre-wrap">{code}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); showToast('Copied!', 'success'); }}
        className="absolute right-4 top-4 p-2 bg-gray-800/50 rounded opacity-0 group-hover:opacity-100 transition hover:bg-brand-primary/20 text-gray-400 hover:text-brand-primary"
      >
        <Copy size={14} />
      </button>
    </div>
  );
};

const categories = [
  { name: 'Getting Started', icon: <BookOpen size={16} /> },
  { name: 'Configuration', icon: <Cpu size={16} /> },
  { name: 'Connectors', icon: <GitBranch size={16} /> },
  { name: 'Security', icon: <Shield size={16} /> },
];

const DOCS: Record<string, { title: string; body: React.ReactNode }> = {
  'Getting Started': {
    title: 'Getting Started',
    body: (
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What is YamlAnchor?</h2>
          <p className="text-gray-400 leading-relaxed">
            YamlAnchor is a local-first CI/CD pipeline generator. It scans your codebase, detects your tech stack,
            generates a production-ready GitHub Actions YAML, then runs a self-healing correction loop until every
            static check passes — all before you push a single commit.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Workflow in 4 steps</h2>
          <ol className="space-y-3 text-sm text-gray-400 list-none">
            {[
              ['1', 'Connect', 'Clone a GitHub/GitLab repo or browse a local folder via Connectors.'],
              ['2', 'Understand Structure', 'YamlAnchor scans your stack (Go, Python, Node, etc.) and maps entry points.'],
              ['3', 'Generate & Heal', 'A YAML is generated. The static analyzer checks it. The fixer corrects any issues. Repeat until clean.'],
              ['4', 'Deploy', 'Export to .github/workflows or save anywhere on disk.'],
            ].map(([n, title, desc]) => (
              <li key={n} className="flex gap-4 p-4 bg-[#15151A] border border-gray-800 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-primary text-black text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="text-white font-bold">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Run locally</h2>
          <CodeBlock label="Start backend (Go)" code="cd backend && go run ./cmd/server.go" />
          <CodeBlock label="Start frontend (Next.js)" code="npm run dev" />
        </section>
      </div>
    ),
  },
  'Configuration': {
    title: 'Configuration',
    body: (
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Stack Detection</h2>
          <p className="text-gray-400 leading-relaxed">
            The analyzer scans your project root for known entry-point files and infers the tech stack automatically.
          </p>
          <table className="w-full text-sm border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-[#15151A]">
              <tr>
                <th className="text-left p-3 text-gray-400 font-bold text-xs uppercase tracking-widest">File Detected</th>
                <th className="text-left p-3 text-gray-400 font-bold text-xs uppercase tracking-widest">Stack</th>
                <th className="text-left p-3 text-gray-400 font-bold text-xs uppercase tracking-widest">Setup Action Injected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['go.mod', 'Go', 'actions/setup-go@v5'],
                ['package.json', 'Node.js', 'actions/setup-node@v4'],
                ['requirements.txt / pyproject.toml', 'Python', 'actions/setup-python@v5'],
                ['Dockerfile / docker-compose.yml', 'Docker', 'docker/setup-buildx-action@v3'],
                ['app.py', 'Python (Flask/FastAPI)', 'actions/setup-python@v5'],
              ].map(([file, stack, action]) => (
                <tr key={file} className="bg-[#0E0E11] hover:bg-[#15151A] transition">
                  <td className="p-3 font-mono text-xs text-brand-primary">{file}</td>
                  <td className="p-3 text-gray-300 text-xs">{stack}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Self-Healing Rules</h2>
          <p className="text-gray-400 text-sm">The static analyzer checks for these issues and the fixer corrects them deterministically:</p>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              'npm/yarn used without actions/setup-node',
              'go commands used without actions/setup-go',
              'python/pip used without actions/setup-python',
              'docker build without docker/setup-buildx-action',
              'deploy job with no needs: dependency',
              'No actions/checkout step',
              'No on: trigger defined',
            ].map(rule => (
              <li key={rule} className="flex items-center gap-3 p-3 bg-[#15151A] border border-gray-800 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>
    ),
  },
  'Connectors': {
    title: 'Connectors',
    body: (
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">GitHub</h2>
          <p className="text-gray-400 leading-relaxed">
            Enter a repository URL or type a GitHub username to fetch their public repositories.
            YamlAnchor calls <code className="text-brand-primary font-mono text-sm">GET /api/clone</code> on the Go backend
            which runs <code className="text-brand-primary font-mono text-sm">git clone</code> into a temporary directory,
            then redirects you to Studio with that path pre-filled.
          </p>
          <CodeBlock label="Clone endpoint" code="POST http://localhost:8080/api/clone\n{ repoUrl: string }" />
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">GitLab</h2>
          <p className="text-gray-400 leading-relaxed">
            Supports both <code className="text-brand-primary font-mono text-sm">gitlab.com</code> and self-hosted instances.
            Enter the instance URL, your GitLab username to fetch projects, or paste a direct project URL to clone.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Local Folder</h2>
          <p className="text-gray-400 leading-relaxed">
            In Studio, click <strong className="text-white">Browse Folder</strong> to open a native OS file picker
            (PowerShell on Windows). The selected path is sent to the Go backend for directory listing and stack detection.
          </p>
          <CodeBlock label="Browse folder endpoint" code="POST http://localhost:8080/api/browse-folder\n{} → { path: string }" />
        </section>
      </div>
    ),
  },
  'Security': {
    title: 'Security',
    body: (
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Secret Scanner</h2>
          <p className="text-gray-400 leading-relaxed">
            YamlAnchor includes a static secret scanner that runs on the generated YAML before export.
            It checks for patterns matching API keys, tokens, and hardcoded credentials.
          </p>
          <CodeBlock label="Scan endpoint" code="POST http://localhost:8080/api/scan\n{ yamlContent: string }" />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Best Practices</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              'Never commit secrets to YAML — use ${{ secrets.MY_SECRET }} syntax',
              'All generated YAML uses GitHub Secrets references, never inline values',
              'The scanner flags any string matching common API key patterns (Bearer, sk-, AKIA, etc.)',
            ].map(t => (
              <li key={t} className="flex items-start gap-3 p-3 bg-[#15151A] border border-gray-800 rounded-lg">
                <Shield size={14} className="text-brand-primary mt-0.5 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    ),
  },
};



export default function DocsPage() {
  const [active, setActive] = useState('Getting Started');
  const doc = DOCS[active];

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">Documentation</h1>
        <p className="text-sm text-gray-500">Learn how YamlAnchor generates, validates and self-heals your CI/CD pipelines.</p>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="col-span-3 space-y-1">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActive(cat.name)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                active === cat.name
                  ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                  : "text-gray-500 hover:text-white hover:bg-gray-800/30"
              )}
            >
              {cat.icon} {cat.name}
              {active === cat.name && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-9 max-w-3xl">
          {doc?.body}
        </div>
      </div>
    </div>
  );
}
