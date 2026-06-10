type BoardTab = 'tickets' | 'stats' | 'clients' | 'knowledge' | 'settings'

type SidebarProps = {
  activeTab: BoardTab
  onTabChange: (tab: BoardTab) => void
}

const sidebarTabs: Array<{ id: BoardTab; label: string }> = [
  { id: 'tickets', label: 'Заявки' },
  { id: 'stats', label: 'Статистика' },
  { id: 'clients', label: 'Клиенты' },
  { id: 'knowledge', label: 'База знаний' },
  { id: 'settings', label: 'Настройки' },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="bg-sidebar border-main flex w-[260px] shrink-0 flex-col border-r px-5 py-6 max-lg:hidden">
      <div className="flex items-center gap-3">
        <div className="bg-accent flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold text-white">
          AB
        </div>
        <div>
          <p className="text-base font-semibold text-white">Admin Board</p>
          <p className="text-muted text-sm">Support dashboard</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        {sidebarTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button rounded-lg px-4 py-3 text-left text-sm font-medium ${
              activeTab === tab.id ? 'tab-button-active bg-panel-active' : ''
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="bg-panel border-main mt-auto rounded-lg border p-4">
        <p className="text-sm font-semibold text-white">Портфолио проект</p>
        <p className="text-muted mt-2 text-sm">
          Практичный dashboard с фильтрацией, адаптивной сеткой и рабочими вкладками.
        </p>
      </div>
    </aside>
  )
}
