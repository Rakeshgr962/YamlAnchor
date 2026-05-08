'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Settings, 
  Terminal, 
  Shield, 
  Box, 
  Copy,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function DocsPage() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Getting Started');

  const categories = [
    { name: "Getting Started", icon: <BookOpen size={16} /> },
    { name: "Configuration", icon: <Settings size={16} /> },
    { name: "Simulations", icon: <Terminal size={16} /> },
    { name: "Security", icon: <Shield size={16} /> },
    { name: "Blueprints", icon: <Box size={16} /> },
  ];

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    showToast("Command copied to clipboard", "success");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">Documentation</h1>
        <p className="text-sm text-gray-500">Learn how to anchor your CI/CD pipelines with type-safety.</p>
      </div>

      <div className="grid grid-cols-12 gap-12">
        
        {/* Navigation Sidebar */}
        <div className="col-span-3 space-y-2">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeCategory === cat.name ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" : "text-gray-500 hover:text-white hover:bg-gray-800/30"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="col-span-9 max-w-3xl space-y-12">
          
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Quick Install</h2>
            <p className="text-gray-400 leading-relaxed">
              Get started by installing the Anchor CLI and initializing your first project.
            </p>
            
            <div className="space-y-4">
              <div className="bg-[#08080A] border border-gray-800 rounded-xl p-6 group relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Install via Go</p>
                <code className="text-brand-primary font-mono text-sm">go install github.com/AyushCN/yaml-anchor@latest</code>
                <button 
                  onClick={() => handleCopy("go install github.com/AyushCN/yaml-anchor@latest")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded opacity-0 group-hover:opacity-100 transition hover:bg-brand-primary/20 text-gray-400 hover:text-brand-primary"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="bg-[#08080A] border border-gray-800 rounded-xl p-6 group relative">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Initialize Project</p>
                <code className="text-brand-primary font-mono text-sm">yaml-anchor init</code>
                <button 
                  onClick={() => handleCopy("yaml-anchor init")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-gray-800/50 rounded opacity-0 group-hover:opacity-100 transition hover:bg-brand-primary/20 text-gray-400 hover:text-brand-primary"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Feature Overview</h2>
            <div className="grid grid-cols-2 gap-6">
              <FeatureCard 
                title="Type-Safe Validation" 
                desc="Automatic YAML schema validation against your specific stack blueprints." 
                icon={<Shield size={20} />} 
              />
              <FeatureCard 
                title="Local Simulation" 
                desc="Run your entire DAG locally using Dagger before pushing to remote CI." 
                icon={<Terminal size={20} />} 
              />
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}

const FeatureCard = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="p-6 bg-[#15151A] border border-gray-800 rounded-xl space-y-4 hover:border-brand-primary/30 transition group cursor-pointer">
    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="text-white font-bold">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);
