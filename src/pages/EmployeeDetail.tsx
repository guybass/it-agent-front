import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { domainDisplayName, formatDateTime, capitalize } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type { Employee, Workflow } from '@/types'
import { cn } from '@/lib/utils'

export function EmployeeDetail() {
  const { email } = useParams<{ email: string }>()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) return
    async function load() {
      const [emp, wfs] = await Promise.all([
        api.getEmployee(email!),
        api.getWorkflowsByEmployee(email!),
      ])
      setEmployee(emp || null)
      setWorkflows(wfs)
      setLoading(false)
    }
    load()
  }, [email])

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>
  if (!employee) return <div className="text-gray-500">Employee not found</div>

  const activeWorkflow = workflows.find((w) => w.status === 'in_progress' || w.status === 'pending')
  const completedWorkflow = workflows.find((w) => w.status === 'completed')
  const displayWorkflow = activeWorkflow || completedWorkflow || workflows[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{employee.name}</h1>
            <div className="text-sm text-gray-500 mt-0.5">{employee.email}</div>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>Role: <span className="text-gray-600 capitalize">{employee.role}</span></span>
              <span>Manager: <span className="text-gray-600">{employee.manager}</span></span>
              <span>Started: <span className="text-gray-600">{employee.start_date}</span></span>
            </div>
          </div>
          <StatusBadge status={employee.status} />
        </div>
      </div>

      {/* Current Workflow */}
      {displayWorkflow && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            {activeWorkflow ? 'Current Workflow' : 'Last Workflow'}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-gray-900">{displayWorkflow.flow_name}</span>
            <StatusBadge status={displayWorkflow.status} />
          </div>
          <ProgressBar
            completed={displayWorkflow.completed_domains}
            total={displayWorkflow.total_domains}
            className="mb-4"
          />

          {/* Domain states */}
          {Object.keys(displayWorkflow.domain_states).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(displayWorkflow.domain_states).map(([domain, state]) => (
                <div
                  key={domain}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium',
                    state.status === 'completed' && 'bg-green-50 border-green-200 text-green-700',
                    state.status === 'failed' && 'bg-red-50 border-red-200 text-red-700',
                    state.status === 'pending' && 'bg-gray-50 border-gray-200 text-gray-500',
                    state.status === 'pending_approval' && 'bg-purple-50 border-purple-200 text-purple-700',
                    state.status === 'skipped' && 'bg-gray-50 border-gray-200 text-gray-400',
                  )}
                >
                  {state.status === 'completed' && '✅ '}
                  {state.status === 'failed' && '❌ '}
                  {state.status === 'pending_approval' && '🔒 '}
                  {state.status === 'pending' && '⏳ '}
                  {domainDisplayName(domain)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Groups</h2>
        <div className="flex flex-wrap gap-1.5">
          {employee.resolved_groups.map((g) => (
            <span key={g} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700">
              {g}
            </span>
          ))}
        </div>
        {employee.add_groups.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {employee.add_groups.map((g) => (
              <span key={g} className="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                + {g}
              </span>
            ))}
          </div>
        )}
        {employee.remove_groups.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {employee.remove_groups.map((g) => (
              <span key={g} className="px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-500 line-through">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {displayWorkflow && displayWorkflow.events.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">History</h2>
          <div className="space-y-2">
            {displayWorkflow.events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-xs">
                <span className="text-gray-400 whitespace-nowrap">{formatDateTime(event.created_at)}</span>
                <span className="text-gray-600">
                  <span className="font-medium text-gray-700">{capitalize(event.event_type.replace(/_/g, ' '))}</span>
                  {' — '}{event.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
