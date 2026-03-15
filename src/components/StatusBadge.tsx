import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  // Employee statuses
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
  onboarded: 'bg-green-50 text-green-700 border-green-200',
  offboarding: 'bg-orange-50 text-orange-700 border-orange-200',
  offboarded: 'bg-gray-50 text-gray-500 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  // Workflow statuses
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  partial_failure: 'bg-orange-50 text-orange-700 border-orange-200',
  pending_approvals: 'bg-purple-50 text-purple-700 border-purple-200',
  pending_approval: 'bg-purple-50 text-purple-700 border-purple-200',
  // Ticket statuses
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  // Domain statuses
  skipped: 'bg-gray-50 text-gray-500 border-gray-200',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  onboarding: 'Onboarding',
  onboarded: 'Active',
  offboarding: 'Offboarding',
  offboarded: 'Offboarded',
  failed: 'Failed',
  in_progress: 'In Progress',
  completed: 'Completed',
  partial_failure: 'Partial Failure',
  pending_approvals: 'Awaiting Approval',
  pending_approval: 'Awaiting Approval',
  open: 'Open',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
}

const statusIcons: Record<string, string> = {
  pending: '⏳',
  onboarding: '⏳',
  onboarded: '✅',
  offboarding: '⏳',
  offboarded: '—',
  failed: '❌',
  in_progress: '⏳',
  completed: '✅',
  partial_failure: '⚠️',
  pending_approvals: '🔒',
  pending_approval: '🔒',
  open: '🟡',
  resolved: '✅',
  cancelled: '—',
  skipped: '—',
}

interface StatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200',
        className,
      )}
    >
      {showIcon && <span>{statusIcons[status] || '•'}</span>}
      {statusLabels[status] || status}
    </span>
  )
}
