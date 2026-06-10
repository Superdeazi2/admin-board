import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { PlaceholderTab } from '../components/PlaceholderTab'
import { Sidebar } from '../components/Sidebar'
import { StatsCards } from '../components/StatsCards'
import { TicketFilters, type StatusFilter } from '../components/TicketFilters'
import { TicketList } from '../components/TicketList'
import { tickets } from '../data/tickets'

type BoardTab = 'tickets' | 'stats' | 'clients' | 'knowledge' | 'settings'

const tabs: Array<{ id: BoardTab; label: string; description: string }> = [
  {
    id: 'tickets',
    label: 'Заявки',
    description: 'Очередь обращений, поиск и фильтрация по статусу.',
  },
  {
    id: 'stats',
    label: 'Статистика',
    description: 'Здесь можно разместить графики нагрузки, SLA и динамику закрытых обращений.',
  },
  {
    id: 'clients',
    label: 'Клиенты',
    description: 'Раздел для списка компаний, контактов и истории обращений.',
  },
  {
    id: 'knowledge',
    label: 'База знаний',
    description: 'Место для статей поддержки, быстрых ответов и внутренних инструкций.',
  },
  {
    id: 'settings',
    label: 'Настройки',
    description: 'Настройки очередей, уведомлений и параметров рабочего пространства.',
  },
]

export function AdminBoardPage() {
  const [activeTab, setActiveTab] = useState<BoardTab>('tickets')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.description.toLowerCase().includes(normalizedSearch) ||
        ticket.client.toLowerCase().includes(normalizedSearch)

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const totalTickets = tickets.length
  const inWorkTickets = tickets.filter((ticket) => ticket.status === 'work').length
  const closedTickets = tickets.filter((ticket) => ticket.status === 'closed').length
  const activePlaceholder = tabs.find((tab) => tab.id === activeTab)

  const mobileTabs = (
    <div className="content-shell overflow-x-auto pb-4 lg:hidden">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === tab.id ? 'tab-button-active bg-panel-active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="app-background bg-page min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header mobileTabs={mobileTabs} />

          <main className="content-shell flex-1 py-8 max-sm:py-6">
            {activeTab === 'tickets' ? (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-accent-light text-xs font-semibold uppercase tracking-[0.16em]">
                    Рабочая область
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Заявки пользователей</h2>
                </div>

                <StatsCards
                  total={totalTickets}
                  inWork={inWorkTickets}
                  closed={closedTickets}
                />

                <TicketFilters
                  search={search}
                  statusFilter={statusFilter}
                  onSearchChange={setSearch}
                  onStatusFilterChange={setStatusFilter}
                />

                <TicketList tickets={filteredTickets} />
              </div>
            ) : (
              <PlaceholderTab
                title={activePlaceholder?.label ?? 'Раздел'}
                description={activePlaceholder?.description ?? 'Раздел находится в разработке.'}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
