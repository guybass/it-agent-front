import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { TicketTypeBadge } from '@/components/TicketTypeBadge'
import { timeAgo, formatDate } from '@/lib/utils'
import { AlertTriangle, Clock, Ticket, Activity, Shield, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react'
import type { Workflow, Ticket as TicketType, ToolRequest } from '@/types'

interface Stats {
  activeWorkflows: number
  pendingApprovals: number
  openTickets: number
  failed: number
  totalEmployees: number
  pendingToolRequests: number
}

export function ITDashboard() {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([])
  const [stats, setStats] = useState<Stats>({
    activeWorkflows: 0, pendingApprovals: 0, openTickets: 0, failed: 0, totalEmployees: 0, pendingToolRequests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [wfs, tix, emps, tReqs] = await Promise.all([
        api.getWorkflows(),
        api.getTickets(),
        api.getEmployees(),
        api.getToolRequests(),
      ])
      setWorkflows(wfs)
      setTickets(tix)
      setToolRequests(tReqs)
      setStats({
        activeWorkflows: wfs.filter((w) => w.status === 'in_progress').length,
        pendingApprovals: tix.filter((t) => t.type === 'approval' && t.status === 'open').length,
        openTickets: tix.filter((t) => t.status === 'open').length,
        failed: wfs.filter((w) => w.status === 'failed').length,
        totalEmployees: emps.length,
        pendingToolRequests: tReqs.filter((r) => r.status === 'pending').length,
      })
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading...</div>
  }

  const actionNeeded = [
    ...workflows.filter((w) => w.status === 'failed').map((w) => ({
      id: w.id,
      type: 'failure' as const,
      label: `${w.flow_name} for ${w.employee_email} failed at ${Object.entries(w.domain_states).find(([, s]) => s.status === 'failed')?.[0] || 'unknown'}`,
      link: `/employees/${w.employee_email}`,
    })),
    ...tickets.filter((t) => t.type === 'approval' && t.status === 'open').map((t) => ({
      id: t.id,
      type: 'approval' as const,
      label: `Approval pending: ${t.title}${t.expires_at ? ` (${timeAgo(t.expires_at)})` : ''}`,
      link: '/tickets',
    })),
  ]

  const activeWorkflows = workflows.filter((w) => w.status === 'in_progress')
  const recentCompleted = workflows.filter((w) => w.status === 'completed').slice(0, 5)
  const pendingToolReqs = toolRequests.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* IT Admin Identity Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-semibold">IT Operations</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {user?.name} &middot; IT Admin &middot; {stats.totalEmployees} employees across org &middot; {stats.activeWorkflows} active workflow{stats.activeWorkflows !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Workflows', value: stats.activeWorkflows, icon: Activity, color: 'text-blue-600' },
          { label: 'Awaiting Approval', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600' },
          { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: 'text-purple-600' },
          { label: 'Tool Requests', value: stats.pendingToolRequests, icon: ArrowRightLeft, color: stats.pendingToolRequests > 0 ? 'text-blue-600' : 'text-gray-400' },
          { label: 'Failed', value: stats.failed, icon: AlertTriangle, color: stats.failed > 0 ? 'text-red-600' : 'text-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Action Needed */}
      {actionNeeded.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> Action Needed
          </h2>
          <div className="bg-white rounded-lg border border-red-100 divide-y divide-red-50">
            {actionNeeded.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50/50 transition-colors"
              >
                <TicketTypeBadge type={item.type} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tool Requests from Managers */}
      {pendingToolReqs.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="h-4 w-4" /> Pending Tool Requests
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {pendingToolReqs.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-700">
                      {req.tool_from ? (
                        <>{req.tool_from} → <strong>{req.tool_to}</strong></>
                      ) : (
                        <>Add <strong>{req.tool_to}</strong></>
                      )}
                      <span className="text-gray-400 ml-1">for {req.employee_name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Requested by {req.requester} &middot; {timeAgo(req.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Approve">
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Deny">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Workflows */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">Active Workflows</h2>
        {activeWorkflows.length === 0 ? (
          <p className="text-sm text-gray-400">No active workflows</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {activeWorkflows.map((wf) => (
              <Link
                key={wf.id}
                to={`/employees/${wf.employee_email}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700 w-40 truncate">{wf.employee_email}</span>
                <span className="text-sm text-gray-500 w-40">{wf.flow_name}</span>
                <ProgressBar completed={wf.completed_domains} total={wf.total_domains} className="flex-1" />
                <StatusBadge status={wf.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">Recent Completed</h2>
        {recentCompleted.length === 0 ? (
          <p className="text-sm text-gray-400">No completed workflows yet</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {recentCompleted.map((wf) => (
              <Link
                key={wf.id}
                to={`/employees/${wf.employee_email}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700 w-40 truncate">{wf.employee_email}</span>
                <span className="text-sm text-gray-500 w-40">{wf.flow_name}</span>
                <ProgressBar completed={wf.completed_domains} total={wf.total_domains} className="flex-1" />
                <span className="text-xs text-gray-400">{formatDate(wf.updated_at)}</span>
                <StatusBadge status={wf.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
