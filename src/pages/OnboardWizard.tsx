import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import { api } from '@/api/client'
import { cn, domainDisplayName } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Rocket, Check } from 'lucide-react'
import type { Flow, Role } from '@/types'

interface WizardState {
  email: string
  name: string
  startDate: string
  selectedFlow: string | null
  enabledApps: string[]
  addGroups: string[]
  removeGroups: string[]
}

const initial: WizardState = {
  email: '',
  name: '',
  startDate: '',
  selectedFlow: null,
  enabledApps: [],
  addGroups: [],
  removeGroups: [],
}

export function OnboardWizard() {
  const { user, permittedRoles } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(initial)
  const [flows, setFlows] = useState<Flow[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const [f, r] = await Promise.all([api.getFlows(), api.getRoles()])
      setFlows(f.filter((fl) => permittedRoles.includes(fl.role)))
      setRoles(r)
    }
    load()
  }, [permittedRoles])

  const selectedFlow = flows.find((f) => f.name === state.selectedFlow)
  const selectedRole = roles.find((r) => r.name === selectedFlow?.role)
  const allDomains = selectedFlow?.phases.flatMap((p) => p.domains) || []

  function handleFlowSelect(flowName: string) {
    const flow = flows.find((f) => f.name === flowName)
    if (!flow) return
    setState({
      ...state,
      selectedFlow: flowName,
      enabledApps: flow.phases.flatMap((p) => p.domains),
      addGroups: [],
      removeGroups: [],
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api.createEmployee({
        email: state.email,
        name: state.name,
        role: selectedFlow?.role || '',
        start_date: state.startDate,
        manager: user!.email,
        configured_by: user!.email,
        add_groups: state.addGroups,
        remove_groups: state.removeGroups,
        enabled_apps: state.enabledApps,
      })
      navigate(`/employees/${state.email}`)
    } catch {
      setSubmitting(false)
    }
  }

  const canNext = () => {
    if (step === 1) return state.email && state.name && state.startDate
    if (step === 2) return state.selectedFlow
    if (step === 3) return state.enabledApps.length > 0
    return true
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                s === step
                  ? 'bg-blue-600 text-white'
                  : s < step
                    ? 'bg-blue-100 text-blue-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400',
              )}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </button>
            {s < 4 && <div className={cn('w-12 h-0.5', s < step ? 'bg-blue-300' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 1: Employee Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Employee Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bob Johnson"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={state.startDate}
                onChange={(e) => setState({ ...state, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Choose Flow */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose Provisioning Flow</h2>
            <p className="text-sm text-gray-500">Select a role-based flow or build a custom configuration.</p>
            <div className="space-y-2">
              {flows.map((flow) => (
                <button
                  key={flow.name}
                  onClick={() => handleFlowSelect(flow.name)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all',
                    state.selectedFlow === flow.name
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900">{flow.display_name}</span>
                    <span className="text-xs text-gray-400">
                      {flow.total_domains} apps, {flow.phases.length} phases
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {flow.phases.map((p) => p.domains.map(domainDisplayName).join(', ')).join(' → ')}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setState({ ...state, selectedFlow: 'custom', enabledApps: [] })}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all',
                  state.selectedFlow === 'custom'
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white',
                )}
              >
                <span className="font-medium text-sm text-gray-900">Custom</span>
                <div className="mt-1 text-xs text-gray-500">Pick individual apps manually</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Customize */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Customize Apps & Groups</h2>
            {selectedFlow && (
              <p className="text-sm text-gray-500">Base: {selectedFlow.display_name}</p>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Apps</h3>
              <div className="flex flex-wrap gap-2">
                {(state.selectedFlow === 'custom'
                  ? ['slack', 'github', 'asana', 'trello', 'figma', 'hubspot']
                  : [...new Set([...allDomains, 'asana', 'trello', 'figma', 'hubspot'])]
                ).map((domain) => {
                  const enabled = state.enabledApps.includes(domain)
                  const isRequired = false
                  return (
                    <button
                      key={domain}
                      disabled={isRequired}
                      onClick={() => {
                        setState({
                          ...state,
                          enabledApps: enabled
                            ? state.enabledApps.filter((d) => d !== domain)
                            : [...state.enabledApps, domain],
                        })
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                        enabled
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300',
                        isRequired && 'opacity-60 cursor-not-allowed',
                      )}
                    >
                      {enabled ? '✓ ' : ''}{domainDisplayName(domain)}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedRole && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Baseline Groups</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.baseline_groups.map((g) => {
                    const removed = state.removeGroups.includes(g)
                    return (
                      <button
                        key={g}
                        onClick={() => {
                          setState({
                            ...state,
                            removeGroups: removed
                              ? state.removeGroups.filter((x) => x !== g)
                              : [...state.removeGroups, g],
                          })
                        }}
                        className={cn(
                          'px-2 py-1 rounded text-xs border transition-all',
                          removed
                            ? 'bg-red-50 border-red-200 text-red-500 line-through'
                            : 'bg-gray-100 border-gray-200 text-gray-700',
                        )}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>

                {selectedRole.approval_required.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Approval-Required Groups</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRole.approval_required.map((g) => {
                        const added = state.addGroups.includes(g)
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              setState({
                                ...state,
                                addGroups: added
                                  ? state.addGroups.filter((x) => x !== g)
                                  : [...state.addGroups, g],
                              })
                            }}
                            className={cn(
                              'px-2 py-1 rounded text-xs border transition-all',
                              added
                                ? 'bg-purple-50 border-purple-300 text-purple-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400',
                            )}
                          >
                            🔒 {g}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">Employee</div>
                <div className="text-gray-900 font-medium">{state.name}</div>
                <div className="text-gray-500">{state.email}</div>
                <div className="text-gray-500 mt-1">Start: {state.startDate}</div>
                <div className="text-gray-500">Manager: {user?.email}</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-2">Flow</div>
                <div className="text-gray-900 font-medium">
                  {selectedFlow?.display_name || 'Custom'}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {state.enabledApps.map((d) => (
                    <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {domainDisplayName(d)}
                    </span>
                  ))}
                </div>
              </div>
              {(state.addGroups.length > 0 || state.removeGroups.length > 0) && (
                <div className="p-4">
                  <div className="text-xs text-gray-400 mb-2">Group Changes</div>
                  {state.addGroups.map((g) => (
                    <div key={g} className="text-xs text-purple-700">🔒 + {g} (requires approval)</div>
                  ))}
                  {state.removeGroups.map((g) => (
                    <div key={g} className="text-xs text-red-500">✕ {g} (removed)</div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Provisioning will begin on the start date, or immediately if the start date is today.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button
              onClick={() => canNext() && setStep(step + 1)}
              disabled={!canNext()}
              className={cn(
                'inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                canNext()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Rocket className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
