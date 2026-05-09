'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Network, 
  Share2, 
  ScrollText, 
  BookOpen,
  Edit3,
  FileCode2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <a 
    href={href}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium",
      active 
        ? "bg-brand-primary/10 text-white" 
        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
    )}
  >
    <span className={cn(active ? "text-brand-primary" : "")}>{icon}</span>
    {label}
  </a>
);

export function Sidebar() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const router = useRouter();

  const handleNewWorkflow = () => {
    showToast("Starting new workflow intake...");
    router.push('/studio');
  };

  const navItems = [
    { icon: <Network size={18} />, label: "Workflows", href: "/workflows" },
    { icon: <Share2 size={18} />, label: "Connectors", href: "/connect" },
    { icon: <Edit3 size={18} />, label: "Studio", href: "/studio" },
    { icon: <FileCode2 size={18} />, label: "Editor", href: "/editor" },
    { icon: <ScrollText size={18} />, label: "Logs", href: "/logs" },
    { icon: <BookOpen size={18} />, label: "Docs", href: "/docs" },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 flex flex-col justify-between bg-[#0E0E11] h-screen sticky top-0">
      <div>
        <div className="p-6">
          <button 
            onClick={() => router.push('/workflows')}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10C55.5228 10 60 14.4772 60 20C60 25.5228 55.5228 30 50 30C44.4772 30 40 25.5228 40 20C40 14.4772 44.4772 10 50 10Z" fill="#00BCD4"/>
              <rect x="46" y="30" width="8" height="40" fill="#00BCD4"/>
              <path d="M20 50H10V54C10 76.0914 27.9086 94 50 94C72.0914 94 90 76.0914 90 54V50H80H90V54C90 70.3686 79.1672 84.187 64 88.6657V78.6657H75V70H64V88.6657C59.6053 89.9622 54.9126 90.6667 50.0001 90.6667C45.0876 90.6667 40.3949 89.9622 36.0001 88.6657V70H25.0001V78.6657H36.0001V88.6657C20.8329 84.187 10 70.3686 10 54V50H20Z" fill="#00BCD4"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-primary transition-colors">
                YamlAnchor
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Automation Engine</p>
            </div>
          </button>
        </div>

        <div className="px-4">
          <button 
            onClick={handleNewWorkflow}
            className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 mb-6 hover:bg-brand-primary/90 transition shadow-lg shadow-brand-primary/20"
          >
            <span>+</span> New Workflow
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-gray-800">
        <button 
          onClick={() => showToast("All systems operational: Dagger Engine (Stable), Registry (Connected)", "success")}
          className="flex items-center gap-3 group w-full"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-bold text-white group-hover:border-brand-primary/50 transition">
            N
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-white group-hover:text-brand-primary transition">System Status</p>
            <p className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              All Systems Operational
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}
