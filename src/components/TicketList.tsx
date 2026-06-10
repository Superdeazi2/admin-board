import type { Ticket } from '../data/tickets'
import { priorityLabels, statusLabels } from '../data/tickets'

type TicketListProps = {
  tickets: Ticket[]
}

const statusClasses = {
  new: 'badge-status-new',
  work: 'badge-status-work',
  waiting: 'badge-status-waiting',
  closed: 'badge-status-closed',
}

const priorityClasses = {
  low: 'badge-priority-low',
  medium: 'badge-priority-medium',
  high: 'badge-priority-high',
  critical: 'badge-priority-critical',
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <section className="bg-card border-main rounded-lg border p-8 text-center">
        <p className="text-lg font-semibold text-white">Заявки не найдены</p>
        <p className="text-muted mt-2 text-sm">Попробуйте изменить поиск или сбросить фильтры.</p>
      </section>
    )
  }

  return (
    <section className="bg-card border-main overflow-hidden rounded-lg border">
      <div className="border-main text-muted grid grid-cols-[1.4fr_1fr_130px_140px_120px] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] max-lg:hidden">
        <span>Заявка</span>
        <span>Клиент</span>
        <span>Статус</span>
        <span>Приоритет</span>
        <span>Дата</span>
      </div>

      <div className="ticket-list-rows">
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="hover:bg-card-hover grid grid-cols-[1.4fr_1fr_130px_140px_120px] gap-4 px-5 py-4 transition-colors max-lg:grid-cols-1 max-lg:gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{ticket.title}</p>
                <span className="text-muted text-xs">#{ticket.id}</span>
              </div>
              <p className="text-body mt-1 text-sm">{ticket.description}</p>
            </div>

            <div className="flex items-center">
              <p className="text-sm text-white">{ticket.client}</p>
            </div>

            <div className="flex items-center">
              <span className={`badge ${statusClasses[ticket.status]}`}>
                {statusLabels[ticket.status]}
              </span>
            </div>

            <div className="flex items-center">
              <span className={`badge ${priorityClasses[ticket.priority]}`}>
                {priorityLabels[ticket.priority]}
              </span>
            </div>

            <div className="flex items-center">
              <p className="text-muted text-sm">{ticket.date}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
