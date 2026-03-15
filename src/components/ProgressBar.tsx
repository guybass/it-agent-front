import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ completed, total, className, showLabel = true }: ProgressBarProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0
  const color = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {completed}/{total}
        </span>
      )}
    </div>
  )
}
