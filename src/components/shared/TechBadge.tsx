import { cn } from '@/lib/utils';
import type { TechBadgeProps } from '@/types';

const VARIANTS = {
  default:   'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  highlight: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  muted:     'bg-white/[0.05] text-white/40 border border-white/[0.06]',
} as const;

export function TechBadge({ label, icon, variant = 'default' }: TechBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
        VARIANTS[variant],
      )}
    >
      {icon && <span className="text-sm leading-none">{icon}</span>}
      {label}
    </span>
  );
}
