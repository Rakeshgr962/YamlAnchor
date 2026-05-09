'use client';

import React, { useState } from 'react';
import { Link2, X, Lock, Folder, Settings, ChevronDown, ArrowRight, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cloneRepository } from '@/actions/connection';
import { useToast } from '@/components/ui/Toast';

// --- GitLab Brand Icon ---
const GitlabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.25-.1.41.41 0 0 0-.33.16.43.43 0 0 0-.1.32L15.37 12H8.63L6.15 3.5a.43.43 0 0 0-.1-.32.41.41 0 0 0-.33-.16.38.38 0 0 0-.25.1.42.42 0 0 0-.14.18L2 13.29a2 2 0 0 0 .73 2.32l9.27 6.75 9.27-6.75a2 2 0 0 0 .73-2.32Z"/>
  </svg>
);

interface GitLabConnectModalProps {
  onClose: () => void;
  onConnect: (path?: string) => void;
}

export default function GitLabConnectModal({ onClose, onConnect }: GitLabConnectModalProps) {
  const { showToast } = useToast();
  const [repoUrl, setRepoUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // GitLab "sign in" state — uses public API by namespace
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [gitlabInstance, setGitlabInstance] = useState('gitlab.com');
  const [gitlabUser, setGitlabUser] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  const fetchRepos = async () => {
    if (!gitlabUser) return;
    setIsLoadingRepos(true);
    try {
      // GitLab public API — fetches projects by username
      const res = await fetch(
        `https://${gitlabInstance}/api/v4/users/${gitlabUser}/projects?order_by=last_activity_at&per_page=5`
      );
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
        showToast(`Found ${data.length} projects for ${gitlabUser}`, 'success');
        setIsSigningIn(false);
      } else {
        showToast('GitLab user not found or instance unreachable', 'error');
      }
    } catch {
      showToast('Network error reaching GitLab instance', 'error');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleConnectAndScan = async () => {
    if (!repoUrl) {
      showToast('Please enter a repository URL', 'error');
      return;
    }
    setIsCloning(true);
    showToast('Cloning GitLab repository locally...', 'info');
    const res = await cloneRepository(repoUrl);
    setIsCloning(false);

    if (res.success && res.path) {
      showToast(res.message || 'Repository cloned successfully', 'success');
      onConnect(res.path);
    } else {
      showToast(res.error || 'Failed to clone repository', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[700px] bg-[#15151A] border border-orange-900/40 rounded-xl overflow-hidden shadow-2xl">

        {/* Header — GitLab orange accent */}
        <div className="p-6 border-b border-orange-900/30 flex justify-between items-center bg-orange-950/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-orange-400"><GitlabIcon /></span>
            <span>Connect GitLab Repository</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">

          {/* Authenticate Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Lock size={14} className="text-orange-400" /> Authenticate with GitLab
            </div>

            {/* Instance URL row */}
            <div className="flex items-center gap-3">
              <Server size={14} className="text-gray-600 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GitLab Instance</label>
                <input
                  type="text"
                  value={gitlabInstance}
                  onChange={(e) => setGitlabInstance(e.target.value)}
                  placeholder="gitlab.com"
                  className="w-full bg-[#0E0E11] border border-gray-800 rounded-md px-4 py-2 text-sm text-gray-300 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Repository URL</label>
                <input
                  type="text"
                  placeholder={`https://${gitlabInstance}/username/project`}
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#0E0E11] border border-gray-800 rounded-md px-4 py-2.5 text-sm text-gray-300 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <span className="text-xs text-gray-600 font-bold">OR</span>
                {isSigningIn ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="GitLab Username"
                      value={gitlabUser}
                      onChange={(e) => setGitlabUser(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchRepos()}
                      className="bg-[#0E0E11] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-300 outline-none focus:border-orange-500/50"
                    />
                    <button
                      onClick={fetchRepos}
                      disabled={isLoadingRepos}
                      className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm font-bold hover:bg-orange-600 transition"
                    >
                      {isLoadingRepos ? '...' : 'Fetch'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSigningIn(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white font-medium hover:bg-gray-700 transition"
                  >
                    <GitlabIcon /> Sign in with GitLab
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Projects list */}
          <section className="space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {repos.length > 0 ? `${gitlabUser}'s Projects` : 'Example projects'}
            </div>

            <div className="grid gap-3">
              {repos.length > 0 ? (
                repos.map((repo: any) => (
                  <div key={repo.id} onClick={() => setRepoUrl(repo.http_url_to_repo)} className="cursor-pointer">
                    <RepoCard
                      name={repo.path_with_namespace}
                      time={`Updated ${new Date(repo.last_activity_at).toLocaleDateString()}`}
                      tags={[repo.visibility || 'private']}
                      accent="orange"
                    />
                  </div>
                ))
              ) : (
                <>
                  <div onClick={() => setRepoUrl(`https://${gitlabInstance}/team/backend-service.git`)}>
                    <RepoCard name="team/backend-service" time="Updated 3 hours ago" tags={['Python', 'Docker']} accent="orange" />
                  </div>
                  <div onClick={() => setRepoUrl(`https://${gitlabInstance}/team/infra-k8s.git`)}>
                    <RepoCard name="team/infra-k8s" time="Updated 2 days ago" tags={['HCL', 'K8s']} accent="orange" />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Advanced */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Settings size={14} className="text-orange-400" /> Advanced
            </div>
            <div className="bg-[#0E0E11] border border-gray-800 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Branch</label>
                  <div className="relative">
                    <select className="w-full bg-gray-900/50 border border-gray-800 rounded-md px-4 py-2 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-orange-500/30">
                      <option>main</option>
                      <option>develop</option>
                      <option>staging</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pipeline Target</label>
                  <div className="relative">
                    <select className="w-full bg-gray-900/50 border border-gray-800 rounded-md px-4 py-2 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-orange-500/30">
                      <option>GitHub Actions</option>
                      <option>GitLab CI</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <input type="checkbox" className="rounded border-gray-800 bg-gray-900 text-orange-500 focus:ring-orange-500/20" />
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
        <div className="p-6 border-t border-orange-900/20 flex justify-end gap-4 bg-orange-950/5">
          <button onClick={onClose} className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConnectAndScan}
            disabled={isCloning}
            className="flex items-center gap-2 px-8 py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
          >
            {isCloning ? 'Cloning...' : <>Connect & Scan <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

const RepoCard = ({ name, time, tags, accent = 'indigo' }: { name: string; time: string; tags: string[]; accent?: string }) => (
  <div className={cn(
    "p-4 bg-[#0E0E11] border border-gray-800 rounded-lg flex items-center justify-between group hover:border-gray-700 transition-colors cursor-pointer",
  )}>
    <div className="flex items-center gap-4">
      <div className={cn(
        "p-2.5 bg-gray-900 border border-gray-800 rounded-md text-gray-500 transition-colors",
        accent === 'orange' ? 'group-hover:text-orange-400' : 'group-hover:text-indigo-400'
      )}>
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
