export interface Employee {
  email: string
  name: string
  role: string
  start_date: string
  status: 'pending' | 'onboarding' | 'onboarded' | 'offboarding' | 'offboarded' | 'failed'
  manager: string
  configured_by: string
  add_groups: string[]
  remove_groups: string[]
  resolved_groups: string[]
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  employee_email: string
  employee_name: string
  flow_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'partial_failure' | 'failed' | 'pending_approvals'
  domain_states: Record<string, DomainState>
  total_domains: number
  completed_domains: number
  events: WorkflowEvent[]
  created_at: string
  updated_at: string
}

export interface DomainState {
  domain: string
  status: 'pending' | 'completed' | 'failed' | 'pending_approval' | 'skipped'
  actions: string[]
  error?: string
  duration_ms?: number
}

export interface WorkflowEvent {
  id: string
  event_type: string
  details: string
  created_at: string
}

export interface Ticket {
  id: string
  type: 'approval' | 'manual_config' | 'failure' | 'info'
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'cancelled'
  workflow_id: string
  employee_email: string
  domain?: string
  action?: string
  approvers: Approver[]
  assignee?: string
  resolution?: string
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface Approver {
  email: string
  status: 'pending' | 'approved' | 'denied'
}

export interface Flow {
  name: string
  display_name: string
  action: 'onboard' | 'offboard'
  role: string
  phases: FlowPhase[]
  total_domains: number
}

export interface FlowPhase {
  name: string
  domains: string[]
}

export interface Role {
  name: string
  display_name: string
  baseline_groups: string[]
  approval_required: string[]
}

export interface ToolRequest {
  id: string
  requester: string
  employee_email: string
  employee_name: string
  tool_from?: string
  tool_to: string
  reason: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
  updated_at: string
}

export interface AuthUser {
  email: string
  name: string
  groups: string[]
}
