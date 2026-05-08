import { cn } from '@/lib/utils';
import type { ConnectionCardProps } from '@/types';

export function ConnectionCard({
  title,
  description,
  icon,
  active = false,
  onClick,
}: ConnectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full flex-col gap-2 rounded-xl border p-5 text-left transition-all duration-200',
        active
          ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_0_1px_rgba(139,92,246,0.3)]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
      )}
    >
      {/* Active indicator ring */}
      {active && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
      )}

      <span className="text-2xl leading-none">{icon}</span>

      <div>
        <p className={cn('text-sm font-semibold', active ? 'text-violet-200' : 'text-white/80')}>
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/40">{description}</p>
      </div>
    </button>
  );
}
