import { cn } from '@/lib/utils'

const typeStyles: Record<string, string> = {
  approval: 'bg-amber-50 text-amber-700',
  failure: 'bg-red-50 text-red-700',
  manual_config: 'bg-blue-50 text-blue-700',
  info: 'bg-gray-50 text-gray-600',
}

const typeIcons: Record<string, string> = {
  approval: '🟡',
  failure: '🔴',
  manual_config: '🔵',
  info: 'ℹ️',
}

const typeLabels: Record<string, string> = {
  approval: 'Approval',
  failure: 'Failure',
  manual_config: 'Manual',
  info: 'Info',
}

export function TicketTypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', typeStyles[type], className)}>
      {typeIcons[type]} {typeLabels[type] || type}
    </span>
  )
}
