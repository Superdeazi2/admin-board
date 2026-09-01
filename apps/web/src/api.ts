export type Role = 'admin' | 'manager' | 'user'
export type Permission =
  'tickets.create' | 'tickets.edit' | 'tickets.delete' | 'analytics.view' | 'users.view'

export type TicketStatus = 'new' | 'work' | 'waiting' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  permissions: Permission[]
}

export type AdminUser = SessionUser & {
  permissions: Permission[]
  createdAt: string
  _count: { assignedTickets: number }
}

export type Ticket = {
  id: string
  number: number
  title: string
  description: string
  client: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  assigneeId?: string | null
  assignee?: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

export type TicketPayload = Pick<
  Ticket,
  'title' | 'description' | 'client' | 'status' | 'priority' | 'category'
> & {
  assigneeId?: string | null
}

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 8000

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const headers = new Headers(init?.headers)

  if (init?.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      credentials: 'include',
      ...init,
      headers,
      signal: controller.signal,
    })

    if (
      response.status === 401 &&
      path !== '/api/auth/refresh' &&
      path !== '/api/auth/login' &&
      path !== '/api/auth/register'
    ) {
      const refreshed = await fetch(`${API_ORIGIN}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (refreshed.ok) {
        return request<T>(path, init)
      }
    }

    if (!response.ok) {
      const body = await response
        .json()
        .catch(() => ({ message: `Ошибка запроса (${response.status})` }))

      throw new Error(body.message ?? `Ошибка запроса (${response.status})`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'TimeoutError')
    ) {
      throw new Error('Сервер не ответил вовремя')
    }

    if (error instanceof TypeError) {
      throw new Error('Не удалось подключиться к серверу')
    }

    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export const api = {
  login: (data: { email: string; password: string }) =>
    request<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: SessionUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: SessionUser }>('/api/auth/me'),

  logout: () =>
    request<{ ok: true }>('/api/auth/logout', {
      method: 'POST',
    }),

  tickets: (params: URLSearchParams) =>
    request<{
      items: Ticket[]
      total: number
      page: number
      pageSize: number
      pages: number
    }>(`/api/tickets?${params}`),

  createTicket: (data: TicketPayload) =>
    request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTicket: (id: string, data: Partial<TicketPayload>) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTicket: (id: string) =>
    request<void>(`/api/tickets/${id}`, {
      method: 'DELETE',
    }),

  users: () => request<AdminUser[]>('/api/users'),

  createUser: (data: { name: string; email: string; password: string; role: Role }) =>
    request<AdminUser>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserAccess: (id: string, data: { role: Role; permissions: Permission[] }) =>
    request<AdminUser>(`/api/users/${id}/access`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  stats: () =>
    request<{
      total: number
      closedRate: number
      byStatus: Array<{ name: TicketStatus; value: number }>
      byPriority: Array<{ name: TicketPriority; value: number }>
    }>('/api/stats/overview'),
}
