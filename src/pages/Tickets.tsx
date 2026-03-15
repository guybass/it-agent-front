import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import { StatusBadge } from '@/components/StatusBadge'
import { TicketTypeBadge } from '@/components/TicketTypeBadge'
import { cn, formatDateTime, timeAgo } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Ticket } from '@/types'

const tabs = [
  { label: 'All', filter: undefined },
  { label: 'Open', filter: 'open' },
  { label: 'Resolved', filter: 'resolved' },
]

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    async function load() {
      const data = await api.getTickets(activeTab ? { status: activeTab } : undefined)
      setTickets(data)
      setLoading(false)
    }
    load()
  }, [activeTab])

  async function handleResolve(ticket: Ticket, action: string) {
    const res = action === 'approve' ? 'Approved' : action === 'deny' ? `Denied: ${resolution}` : resolution || 'Resolved'
    await api.resolveTicket(ticket.id, res)
    setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'resolved' as const, resolution: res } : t)))
    setSelected(null)
    setResolution('')
  }

  const tabCounts: Record<string, number> = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === 'open').length,
    Resolved: tickets.filter((t) => t.status === 'resolved').length,
  }

  const filtered = activeTab ? tickets.filter((t) => t.status === activeTab) : tickets

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>

  return (
    <div className="flex gap-0 h-[calc(100vh-7rem)]">
      {/* List */}
      <div className={cn('flex flex-col flex-1 min-w-0', selected && 'max-w-[55%]')}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.filter)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                activeTab === tab.filter
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100',
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs">{tabCounts[tab.label]}</span>
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelected(ticket)}
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                selected?.id === ticket.id && 'bg-blue-50',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 font-mono">{ticket.id}</span>
                <TicketTypeBadge type={ticket.type} />
                <StatusBadge status={ticket.status} className="ml-auto" />
              </div>
              <div className="text-sm text-gray-900">{ticket.title}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>{ticket.employee_email}</span>
                {ticket.expires_at && <span>{timeAgo(ticket.expires_at)}</span>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">No tickets found</div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-[400px] bg-white border-l border-gray-200 overflow-auto flex flex-col ml-4 rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-medium text-sm text-gray-900">{selected.id}</span>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-1">Title</div>
              <div className="text-gray-900">{selected.title}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Type</div>
                <TicketTypeBadge type={selected.type} />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Status</div>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Employee</div>
              <div className="text-gray-700">{selected.employee_email}</div>
            </div>
            {selected.domain && (
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Domain</div>
                  <div className="text-gray-700">{selected.domain}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Action</div>
                  <div className="text-gray-700">{selected.action}</div>
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-400 mb-1">Description</div>
              <div className="text-gray-600 text-xs">{selected.description}</div>
            </div>
            {selected.approvers.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Approvers</div>
                {selected.approvers.map((a) => (
                  <div key={a.email} className="flex items-center gap-2 text-xs py-1">
                    <span>
                      {a.status === 'approved' ? '✅' : a.status === 'denied' ? '❌' : '⬜'}
                    </span>
                    <span className="text-gray-700">{a.email}</span>
                    <span className="text-gray-400">({a.status})</span>
                  </div>
                ))}
              </div>
            )}
            <div>
              <div className="text-xs text-gray-400 mb-1">Created</div>
              <div className="text-gray-600 text-xs">{formatDateTime(selected.created_at)}</div>
            </div>
            {selected.expires_at && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Expires</div>
                <div className="text-gray-600 text-xs">{formatDateTime(selected.expires_at)}</div>
              </div>
            )}
            {selected.resolution && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Resolution</div>
                <div className="text-gray-600 text-xs">{selected.resolution}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {selected.status === 'open' && (
            <div className="p-4 border-t border-gray-100 space-y-3">
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Reason (optional for approve, required for deny)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                {selected.type === 'approval' && (
                  <>
                    <button
                      onClick={() => handleResolve(selected, 'approve')}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleResolve(selected, 'deny')}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"
                    >
                      Deny
                    </button>
                  </>
                )}
                {selected.type === 'failure' && (
                  <button
                    onClick={() => handleResolve(selected, 'resolve')}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                  >
                    Resolve
                  </button>
                )}
                {selected.type === 'manual_config' && (
                  <button
                    onClick={() => handleResolve(selected, 'resolve')}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
