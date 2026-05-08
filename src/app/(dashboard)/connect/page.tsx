'use client';

import React, { useState } from 'react';
import { Share2, Copy, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import GitHubConnectModal from '@/components/scanning/GitHubConnectModal';

// --- Inline SVG brand icons (lucide removed brand icons) ---
const GithubIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const GitlabIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.25-.1.41.41 0 0 0-.33.16.43.43 0 0 0-.1.32L15.37 12H8.63L6.15 3.5a.43.43 0 0 0-.1-.32.41.41 0 0 0-.33-.16.38.38 0 0 0-.25.1.42.42 0 0 0-.14.18L2 13.29a2 2 0 0 0 .73 2.32l9.27 6.75 9.27-6.75a2 2 0 0 0 .73-2.32Z"/>
  </svg>
);

const FolderCodeIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 10.5 8 13l2 2.5"/>
    <path d="m14 10.5 2 2.5-2 2.5"/>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>
  </svg>
);

export default function ConnectPage() {
  const { showToast } = useToast();
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = (type: string) => {
    if (type === 'github') {
      setShowGitHubModal(true);
    } else {
      setIsConnecting(type);
      showToast(`Initializing ${type} connection...`, "info");
      setTimeout(() => {
        setIsConnecting(null);
        showToast(`Connected to ${type} successfully!`, "success");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-4">
          <span className="text-brand-primary">Step 1:</span> Connect Repository
        </h1>
        <p className="text-gray-500 text-lg font-medium">Select your source provider to begin automated anchor generation.</p>
      </div>

      {/* Connection Options */}
      <div className="grid grid-cols-3 gap-8 max-w-6xl">
        <ConnectCard 
          title="GitHub" 
          icon={<GithubIcon />} 
          desc="Connect via OAuth or Personal Access Token" 
          onClick={() => handleConnect('github')}
          loading={isConnecting === 'github'}
        />
        <ConnectCard 
          title="GitLab" 
          icon={<GitlabIcon />} 
          desc="Self-hosted or GitLab.com integration" 
          onClick={() => handleConnect('gitlab')}
          loading={isConnecting === 'gitlab'}
        />
        <ConnectCard 
          title="Local Source" 
          icon={<FolderCodeIcon />} 
          desc="Mount local filesystem (Dev only)" 
          onClick={() => handleConnect('local')}
          loading={isConnecting === 'local'}
        />
      </div>

      {/* Manual Configuration Step */}
      <div className="bg-[#15151A] border border-gray-800 rounded-2xl p-10 max-w-4xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Share2 size={120} className="text-brand-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight italic">Manual CLI Setup</h2>
          <p className="text-sm text-gray-500">Already have Anchor CLI installed? Run this in your repo:</p>
        </div>

        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 font-mono text-sm group relative">
          <code className="text-brand-primary">yaml-anchor init --remote-origin git@github.com:fusiontech/backend.git</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText("yaml-anchor init --remote-origin git@github.com:fusiontech/backend.git");
              showToast("CLI command copied", "success");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded hover:bg-brand-primary/20 transition text-gray-400 hover:text-brand-primary"
          >
            <Copy size={14} />
          </button>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => showToast("Verifying repository access...", "info")}
            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
          >
            Verify Connection
          </button>
          <button className="px-8 py-3 bg-transparent border border-gray-800 text-gray-400 font-bold rounded-xl hover:bg-gray-800 transition">
            Skip for now
          </button>
        </div>
      </div>

      {showGitHubModal && (
        <GitHubConnectModal 
          onClose={() => setShowGitHubModal(false)} 
          onConnect={() => {
            setShowGitHubModal(false);
            showToast("GitHub repository connected successfully!", "success");
          }} 
        />
      )}
    </div>
  );
}

const ConnectCard = ({ title, icon, desc, onClick, loading }: { 
  title: string; 
  icon: React.ReactNode; 
  desc: string; 
  onClick: () => void; 
  loading?: boolean;
}) => (
  <div 
    onClick={onClick}
    className="p-8 bg-[#15151A] border border-gray-800 rounded-2xl space-y-6 hover:border-brand-primary/50 transition group cursor-pointer relative overflow-hidden"
  >
    <div className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition">
      {loading 
        ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div> 
        : icon
      }
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
      Connect now <ChevronRight size={14} />
    </div>
  </div>
);
