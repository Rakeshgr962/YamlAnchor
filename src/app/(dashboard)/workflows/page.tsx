'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PulseChart = dynamic(() => import('@/components/charts/PulseChart'), { ssr: false });
import { 
  Folder, 
  Link2, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Download, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const steps = [
    { id: 1, icon: <Folder />, title: "CODE REPOSITORY", desc: "go.mod" },
    { id: 2, icon: <Link2 />, title: "ANCHOR YAML", desc: "schema" },
    { id: 3, icon: <CheckCircle2 />, title: "VALIDATE", desc: "Checkmark" },
    { id: 4, icon: <Play />, title: "SIMULATE", desc: "Dagger simulation" },
    { id: 5, icon: <Sparkles />, title: "AUTO-IMPROVE", desc: "Enhance workflows with AI-driven optimizations based on execution history.", span: true },
    { id: 6, icon: <Download />, title: "EXPORT", desc: "Export generated configuration to standard CI provider formats.", span: true },
  ];

  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E11] p-12 space-y-12">
      
      {/* Hero Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase italic flex items-center gap-4">
          <span className="text-brand-primary">YAMLANCHOR:</span> CI/CD AS TYPE-SAFE CODE
        </h1>
        <p className="text-gray-500 text-lg font-medium">Stop pushing blind. Start anchoring.</p>
      </div>

      {/* Grid Section */}
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

      {/* Pulse Dashboard Section */}
      <div className="bg-[#15151A] border border-gray-800 rounded-xl overflow-hidden grid grid-cols-12 max-w-7xl">
        <div className="col-span-4 p-10 space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            7. PULSE DASHBOARD
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Monitor your entire CI/CD pipeline health in real-time. Gain insights into execution times, flakiness, and deployment velocity across all your repositories.
          </p>
          <button 
            onClick={() => router.push('/pulse')}
            className="w-fit px-8 py-3 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary font-bold rounded-lg hover:bg-brand-primary/30 transition flex items-center gap-2"
          >
            View Live Metrics <ArrowRight size={18} />
          </button>
        </div>
        <div className="col-span-8 relative min-h-[400px] bg-black/40">
          {/* Mockup of the Metrics Chart from Image */}
          <PulseChart />
          {/* Decorative grid overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #8069BF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
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
