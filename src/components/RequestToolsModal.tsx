import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { X } from 'lucide-react'
import type { Employee } from '@/types'

interface Props {
  employees: Employee[]
  onClose: () => void
  onSubmit: (data: {
    employee_email: string
    employee_name: string
    tool_from?: string
    tool_to: string
    reason: string
  }) => Promise<void>
}

export function RequestToolsModal({ employees, onClose, onSubmit }: Props) {
  const [tools, setTools] = useState<{ name: string; category: string }[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [toolFrom, setToolFrom] = useState('')
  const [toolTo, setToolTo] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getAvailableTools().then(setTools)
  }, [])

  const categories = [...new Set(tools.map((t) => t.category))]
  const employee = employees.find((e) => e.email === selectedEmployee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee || !toolTo || !reason) return
    setSubmitting(true)
    await onSubmit({
      employee_email: selectedEmployee,
      employee_name: employee?.name || selectedEmployee,
      tool_from: toolFrom || undefined,
      tool_to: toolTo,
      reason,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Request Tool / Account Change</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a team member...</option>
              {employees.map((emp) => (
                <option key={emp.email} value={emp.email}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Current Tool (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Tool <span className="text-gray-400 font-normal">(optional — for replacements)</span>
            </label>
            <select
              value={toolFrom}
              onChange={(e) => setToolFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None (new tool request)</option>
              {categories.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {tools.filter((t) => t.category === cat).map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* New Tool */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {toolFrom ? 'Replace With' : 'Tool to Add'}
            </label>
            <select
              value={toolTo}
              onChange={(e) => setToolTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a tool...</option>
              {categories.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {tools
                    .filter((t) => t.category === cat && t.name !== toolFrom)
                    .map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Preview */}
          {toolFrom && toolTo && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <strong>{toolFrom}</strong> → <strong>{toolTo}</strong>
              {employee && <span className="text-blue-600"> for {employee.name}</span>}
            </div>
          )}
          {!toolFrom && toolTo && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800">
              Add <strong>{toolTo}</strong>
              {employee && <span className="text-green-600"> for {employee.name}</span>}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Team is migrating from Cursor to Claude Code for better agentic workflows"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedEmployee || !toolTo || !reason}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
