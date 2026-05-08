'use client';

import React from 'react';
import { 
  Link2, 
  X, 
  Lock, 
  Folder, 
  Settings, 
  ChevronDown, 
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Brand Icons ---
const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
);

interface GitHubConnectModalProps {
  onClose: () => void;
  onConnect: () => void;
}

export default function GitHubConnectModal({ onClose, onConnect }: GitHubConnectModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[700px] bg-[#15151A] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Link2 className="text-indigo-400" size={24} /> Connect GitHub Repository
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          
          {/* Authenticate Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Lock size={14} className="text-indigo-400" /> Authenticate with GitHub
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Repository URL</label>
                <input 
                  type="text" 
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-[#0E0E11] border border-gray-800 rounded-md px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-4 py-2">
                <span className="text-xs text-gray-600 font-bold">OR</span>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white font-medium hover:bg-gray-700 transition">
                  <GithubIcon /> Sign in with GitHub
                </button>
              </div>
            </div>
          </section>

          {/* Recent Repos */}
          <section className="space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Recent repos
            </div>
            
            <div className="grid gap-3">
              <RepoCard name="user/backend-api" time="Updated 2 hours ago" tags={['Go', 'Docker']} />
              <RepoCard name="team/frontend-ui" time="Updated 1 day ago" tags={['React', 'TS']} />
            </div>
          </section>

          {/* Advanced Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Settings size={14} className="text-indigo-400" /> Advanced
            </div>
            
            <div className="bg-[#0E0E11] border border-gray-800 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Branch</label>
                  <div className="relative">
                    <select className="w-full bg-gray-900/50 border border-gray-800 rounded-md px-4 py-2 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-indigo-500/30">
                      <option>main</option>
                      <option>develop</option>
                      <option>staging</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scan Depth</label>
                  <div className="relative">
                    <select className="w-full bg-gray-900/50 border border-gray-800 rounded-md px-4 py-2 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-indigo-500/30">
                      <option>Full (All commits)</option>
                      <option>Shallow (Latest)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <input type="checkbox" className="rounded border-gray-800 bg-gray-900 text-indigo-500 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Include Submodules in Scan</p>
                  <p className="text-xs text-gray-600 mt-1">Scanning submodules may significantly increase processing time.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-4 bg-gray-900/10">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConnect}
            className="flex items-center gap-2 px-8 py-2 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
          >
            Connect & Scan <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

const RepoCard = ({ name, time, tags }: { name: string; time: string; tags: string[] }) => (
  <div className="p-4 bg-[#0E0E11] border border-gray-800 rounded-lg flex items-center justify-between group hover:border-gray-700 transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-gray-900 border border-gray-800 rounded-md text-gray-500 group-hover:text-indigo-400 transition-colors">
        <Folder size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-200">{name}</h4>
        <p className="text-[10px] text-gray-600 font-medium">{time}</p>
      </div>
    </div>
    <div className="flex gap-2">
      {tags.map(tag => (
        <span key={tag} className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-[9px] font-mono text-gray-500 uppercase tracking-widest">{tag}</span>
      ))}
    </div>
  </div>
);
