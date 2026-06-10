import type { TicketStatus } from '../data/tickets'

export type StatusFilter = 'all' | TicketStatus

type TicketFiltersProps = {
  search: string
  statusFilter: StatusFilter
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: StatusFilter) => void
}

export function TicketFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: TicketFiltersProps) {
  return (
    <section className="bg-panel border-main rounded-lg border p-4">
      <div className="grid grid-cols-[1fr_220px] gap-3 max-md:grid-cols-1">
        <input
          className="form-field rounded-lg px-4 py-3 text-sm"
          type="search"
          value={search}
          placeholder="Поиск по заявке или клиенту..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <select
          className="form-field rounded-lg px-4 py-3 text-sm"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
        >
          <option value="all">Все статусы</option>
          <option value="new">Новые</option>
          <option value="work">В работе</option>
          <option value="waiting">Ожидают</option>
          <option value="closed">Закрытые</option>
        </select>
      </div>
    </section>
  )
}
