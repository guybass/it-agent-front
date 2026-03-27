import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/StatusBadge'
import { TicketTypeBadge } from '@/components/TicketTypeBadge'
import { timeAgo } from '@/lib/utils'
import { UserPlus, ArrowRightLeft, Users, AlertCircle, CheckCircle2, Clock, Package } from 'lucide-react'
import type { Employee, Ticket, ToolRequest } from '@/types'
import { RequestToolsModal } from '@/components/RequestToolsModal'

export function ManagerDashboard() {
  const { user, permittedRoles } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showToolModal, setShowToolModal] = useState(false)

  useEffect(() => {
    async function load() {
      const [emps, tix, tReqs] = await Promise.all([
        api.getEmployees({ manager: user!.email }),
        api.getTickets(),
        api.getToolRequests({ requester: user!.email }),
      ])
      setEmployees(emps)
      setTickets(tix.filter((t) => t.status !== 'resolved' && t.status !== 'cancelled').slice(0, 5))
      setToolRequests(tReqs)
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading...</div>
  }

  const teamStats = {
    total: employees.length,
    onboarded: employees.filter((e) => e.status === 'onboarded').length,
    inProgress: employees.filter((e) => e.status === 'onboarding' || e.status === 'pending').length,
    needsAttention: employees.filter((e) => e.status === 'failed').length,
  }

  const pendingToolReqs = toolRequests.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-8">
      {/* Identity / Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {user?.name.split(' ')[0]}</h1>
            <p className="text-blue-100 text-sm mt-1">
              Team Lead &middot; Managing {teamStats.total} team member{teamStats.total !== 1 ? 's' : ''} &middot;{' '}
              {permittedRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowToolModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-white/25 transition-colors border border-white/20"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Request Tools
            </button>
            <Link
              to="/onboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Onboard Employee
            </Link>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: teamStats.total, icon: Users, color: 'text-blue-600' },
          { label: 'Onboarded', value: teamStats.onboarded, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'In Progress', value: teamStats.inProgress, icon: Clock, color: 'text-amber-600' },
          { label: 'Needs Attention', value: teamStats.needsAttention, icon: AlertCircle, color: teamStats.needsAttention > 0 ? 'text-red-600' : 'text-gray-400' },
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

      {/* Tool / Account Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Tool &amp; Account Requests
          </h2>
          <button
            onClick={() => setShowToolModal(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            New Request →
          </button>
        </div>
        {toolRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No tool requests yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Need to switch tools for your team? (e.g., Cursor → Claude Code)
            </p>
            <button
              onClick={() => setShowToolModal(true)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Request a tool change
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {toolRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-700">
                      {req.tool_from ? (
                        <>{req.tool_from} → <strong>{req.tool_to}</strong></>
                      ) : (
                        <>Add <strong>{req.tool_to}</strong></>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">for {req.employee_name}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    req.status === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : req.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {pendingToolReqs.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            {pendingToolReqs.length} request{pendingToolReqs.length !== 1 ? 's' : ''} awaiting IT approval
          </p>
        )}
      </div>

      {/* Team cards */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          My Team ({employees.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <Link
              key={emp.email}
              to={`/employees/${emp.email}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 capitalize">{emp.role}</div>
              <div className="text-xs text-gray-400 mt-1">
                {emp.resolved_groups.length} tool{emp.resolved_groups.length !== 1 ? 's' : ''} provisioned
              </div>
              <div className="mt-3">
                <StatusBadge status={emp.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">My Requests</h2>
          <Link to="/tickets" className="text-xs text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-400">No open requests</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to="/tickets"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TicketTypeBadge type={ticket.type} />
                  <span className="text-sm text-gray-700">{ticket.title}</span>
                </div>
                {ticket.expires_at && (
                  <span className="text-xs text-gray-400">{timeAgo(ticket.expires_at)}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tool Request Modal */}
      {showToolModal && (
        <RequestToolsModal
          employees={employees}
          onClose={() => setShowToolModal(false)}
          onSubmit={async (data) => {
            await api.createToolRequest({
              ...data,
              requester: user!.email,
            })
            const updated = await api.getToolRequests({ requester: user!.email })
            setToolRequests(updated)
            setShowToolModal(false)
          }}
        />
      )}
    </div>
  )
}
