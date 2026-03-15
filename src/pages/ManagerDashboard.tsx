import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/StatusBadge'
import { TicketTypeBadge } from '@/components/TicketTypeBadge'
import { timeAgo } from '@/lib/utils'
import { UserPlus } from 'lucide-react'
import type { Employee, Ticket } from '@/types'

export function ManagerDashboard() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [emps, tix] = await Promise.all([
        api.getEmployees({ manager: user!.email }),
        api.getTickets(),
      ])
      setEmployees(emps)
      setTickets(tix.filter((t) => t.status !== 'resolved' && t.status !== 'cancelled').slice(0, 5))
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user?.name.split(' ')[0]}
        </h1>
        <Link
          to="/onboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Onboard Employee
        </Link>
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
    </div>
  )
}
