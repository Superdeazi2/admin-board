import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  api,
  type Ticket,
  type TicketPayload,
  type TicketPriority,
  type TicketStatus,
} from '../api'
import { queryClient } from '../queryClient'
import { EmptyState, ErrorState, LoadingState } from '../components/State'
import { TicketModal } from '../components/TicketModal'
import { useAuth } from '../auth'

const statusLabel: Record<TicketStatus, string> = {
  new: 'Новая',
  work: 'В работе',
  waiting: 'Ожидает',
  closed: 'Закрыта',
}
const priorityLabel: Record<TicketPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export function TicketsPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('updatedAt')
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [creating, setCreating] = useState(false)

  const params = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: '8', sort, order: 'desc' })
    if (search.trim()) p.set('search', search.trim())
    if (status) p.set('status', status)
    if (priority) p.set('priority', priority)
    return p
  }, [page, search, status, priority, sort])

  const tickets = useQuery({
    queryKey: ['tickets', params.toString()],
    queryFn: () => api.tickets(params),
    placeholderData: (previous) => previous,
  })

  const createMutation = useMutation({
    mutationFn: api.createTicket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
      setCreating(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TicketPayload> }) =>
      api.updateTicket(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] })
      const snapshots = queryClient.getQueriesData<{ items: Ticket[] }>({ queryKey: ['tickets'] })
      snapshots.forEach(([key, value]) => {
        if (!value) return
        queryClient.setQueryData(key, {
          ...value,
          items: value.items.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })
      })
      return { snapshots }
    },
    onError: (_e, _vars, context) =>
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
    onSuccess: () => setEditing(null),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteTicket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
      void queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h2>Очередь обращений</h2>
          <p>Поиск, фильтрация и управление заявками</p>
        </div>
        {canEdit && (
          <button className="button primary" onClick={() => setCreating(true)}>
            <Plus size={17} />
            Новая заявка
          </button>
        )}
      </section>

      <section className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Поиск по заявкам и клиентам"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="work">В работе</option>
          <option value="waiting">Ожидают</option>
          <option value="closed">Закрытые</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Любой приоритет</option>
          <option value="critical">Критический</option>
          <option value="high">Высокий</option>
          <option value="medium">Средний</option>
          <option value="low">Низкий</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="updatedAt">По обновлению</option>
          <option value="createdAt">По созданию</option>
          <option value="priority">По приоритету</option>
          <option value="status">По статусу</option>
        </select>
      </section>

      {tickets.isLoading && <LoadingState />}
      {tickets.isError && (
        <ErrorState
          message={(tickets.error as Error).message}
          action={
            <button className="button secondary" onClick={() => void tickets.refetch()}>
              Повторить
            </button>
          }
        />
      )}
      {tickets.data && tickets.data.items.length === 0 && (
        <EmptyState title="Заявок не найдено" text="Измените фильтры или создайте новую заявку." />
      )}

      {tickets.data && tickets.data.items.length > 0 && (
        <section className="table-card">
          <div className="table-head">
            <span>Заявка</span>
            <span>Клиент</span>
            <span>Статус</span>
            <span>Приоритет</span>
            <span>Обновлена</span>
            <span />
          </div>
          <div className="table-body">
            {tickets.data.items.map((ticket) => (
              <article className="ticket-row" key={ticket.id}>
                <div className="ticket-main">
                  <div className="ticket-title">
                    <strong>{ticket.title}</strong>
                    <span>#{ticket.number}</span>
                  </div>
                  <p>{ticket.category}</p>
                </div>
                <div className="cell mobile-labeled" data-label="Клиент">
                  {ticket.client}
                </div>
                <div className="cell mobile-labeled" data-label="Статус">
                  <button
                    className={`badge status-${ticket.status}`}
                    disabled={!canEdit}
                    onClick={() =>
                      canEdit &&
                      updateMutation.mutate({
                        id: ticket.id,
                        data: { status: ticket.status === 'closed' ? 'work' : 'closed' },
                      })
                    }
                  >
                    {statusLabel[ticket.status]}
                  </button>
                </div>
                <div className="cell mobile-labeled" data-label="Приоритет">
                  <span className={`badge priority-${ticket.priority}`}>
                    {priorityLabel[ticket.priority]}
                  </span>
                </div>
                <div className="cell muted mobile-labeled" data-label="Обновлена">
                  {new Intl.DateTimeFormat('ru-RU', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(ticket.updatedAt))}
                </div>
                <div className="row-actions">
                  {canEdit && (
                    <button
                      className="icon-button"
                      onClick={() => setEditing(ticket)}
                      aria-label="Редактировать"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      className="icon-button danger"
                      onClick={() => {
                        if (confirm(`Удалить заявку #${ticket.number}?`))
                          deleteMutation.mutate(ticket.id)
                      }}
                      aria-label="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <footer className="pagination">
            <span>{tickets.data.total} заявок</span>
            <div>
              <button
                className="icon-button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {page} / {tickets.data.pages}
              </span>
              <button
                className="icon-button"
                disabled={page >= tickets.data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </section>
      )}

      {creating && (
        <TicketModal
          busy={createMutation.isPending}
          onClose={() => setCreating(false)}
          onSubmit={(data) => createMutation.mutateAsync(data)}
        />
      )}
      {editing && (
        <TicketModal
          ticket={editing}
          busy={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={(data) => updateMutation.mutateAsync({ id: editing.id, data })}
        />
      )}
    </div>
  )
}
