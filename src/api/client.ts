import type { Employee, Workflow, Ticket, Flow, Role, ToolRequest } from '@/types'
import { mockEmployees, mockWorkflows, mockTickets, mockFlows, mockRoles, mockToolRequests, availableTools } from './mock-data'

// In a real setup this would be an Axios instance hitting VITE_API_BASE_URL.
// For now, mock API functions that return data with a small delay.

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const api = {
  // Employees
  async getEmployees(filters?: { manager?: string; status?: string }): Promise<Employee[]> {
    await delay()
    let result = [...mockEmployees]
    if (filters?.manager) result = result.filter((e) => e.manager === filters.manager)
    if (filters?.status) result = result.filter((e) => e.status === filters.status)
    return result
  },

  async getEmployee(email: string): Promise<Employee | undefined> {
    await delay()
    return mockEmployees.find((e) => e.email === email)
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    await delay(500)
    const emp: Employee = {
      email: data.email!,
      name: data.name!,
      role: data.role!,
      start_date: data.start_date!,
      status: 'pending',
      manager: data.manager || '',
      configured_by: data.configured_by || '',
      add_groups: data.add_groups || [],
      remove_groups: data.remove_groups || [],
      resolved_groups: data.resolved_groups || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockEmployees.push(emp)
    return emp
  },

  // Workflows
  async getWorkflows(filters?: { status?: string; limit?: number }): Promise<Workflow[]> {
    await delay()
    let result = [...mockWorkflows]
    if (filters?.status) result = result.filter((w) => w.status === filters.status)
    if (filters?.limit) result = result.slice(0, filters.limit)
    return result
  },

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    await delay()
    return mockWorkflows.find((w) => w.id === id)
  },

  async getWorkflowsByEmployee(email: string): Promise<Workflow[]> {
    await delay()
    return mockWorkflows.filter((w) => w.employee_email === email)
  },

  async retryWorkflow(id: string): Promise<Workflow> {
    await delay(500)
    const wf = mockWorkflows.find((w) => w.id === id)
    if (wf) wf.status = 'in_progress'
    return wf!
  },

  // Tickets
  async getTickets(filters?: { status?: string; type?: string }): Promise<Ticket[]> {
    await delay()
    let result = [...mockTickets]
    if (filters?.status) result = result.filter((t) => t.status === filters.status)
    if (filters?.type) result = result.filter((t) => t.type === filters.type)
    return result
  },

  async getTicket(id: string): Promise<Ticket | undefined> {
    await delay()
    return mockTickets.find((t) => t.id === id)
  },

  async resolveTicket(id: string, resolution: string): Promise<Ticket> {
    await delay(500)
    const ticket = mockTickets.find((t) => t.id === id)
    if (ticket) {
      ticket.status = 'resolved'
      ticket.resolution = resolution
      ticket.updated_at = new Date().toISOString()
    }
    return ticket!
  },

  // Flows
  async getFlows(): Promise<Flow[]> {
    await delay()
    return mockFlows
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    await delay()
    return mockRoles
  },

  async getRole(name: string): Promise<Role | undefined> {
    await delay()
    return mockRoles.find((r) => r.name === name)
  },

  // Tool Requests
  async getToolRequests(filters?: { requester?: string }): Promise<ToolRequest[]> {
    await delay()
    let result = [...mockToolRequests]
    if (filters?.requester) result = result.filter((r) => r.requester === filters.requester)
    return result
  },

  async createToolRequest(data: Omit<ToolRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ToolRequest> {
    await delay(500)
    const req: ToolRequest = {
      ...data,
      id: `tr-${String(mockToolRequests.length + 1).padStart(3, '0')}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockToolRequests.push(req)
    return req
  },

  async getAvailableTools(): Promise<{ name: string; category: string }[]> {
    await delay()
    return availableTools
  },
}
