import { Search } from 'lucide-react'

type TicketFiltersProps = {
  search: string
  status: string
  priority: string
  sort: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onSortChange: (value: string) => void
}

export function TicketFilters({
  search,
  status,
  priority,
  sort,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
}: TicketFiltersProps) {
  return (
    <section className="toolbar" aria-label="Фильтры заявок">
      <div className="search-box">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск по заявкам и клиентам"
          aria-label="Поиск заявок"
        />
      </div>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Фильтр по статусу"
      >
        <option value="">Все статусы</option>
        <option value="new">Новые</option>
        <option value="work">В работе</option>
        <option value="waiting">Ожидают</option>
        <option value="closed">Закрытые</option>
      </select>

      <select
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value)}
        aria-label="Фильтр по приоритету"
      >
        <option value="">Любой приоритет</option>
        <option value="critical">Критический</option>
        <option value="high">Высокий</option>
        <option value="medium">Средний</option>
        <option value="low">Низкий</option>
      </select>

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        aria-label="Сортировка заявок"
      >
        <option value="updatedAt">По обновлению</option>
        <option value="createdAt">По созданию</option>
        <option value="priority">По приоритету</option>
        <option value="status">По статусу</option>
      </select>
    </section>
  )
}
