'use client';

import React from 'react';

export default function PulseChart() {
  return (
    <div className="absolute inset-0 p-8 flex items-end gap-1">
      {Array.from({ length: 40 }).map((_, i) => (
        <div 
          key={i} 
          className="flex-1 bg-brand-primary/40 rounded-t-sm animate-pulse" 
          style={{ 
            height: `${Math.sin(i * 0.5) * 30 + 50}%`,
            animationDelay: `${i * 0.05}s`
          }}
        ></div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#15151A] via-transparent to-transparent"></div>
    </div>
  );
}
