type StatsCardsProps = {
  total: number
  inWork: number
  closed: number
}

const cards = [
  { key: 'total', label: 'Всего заявок' },
  { key: 'inWork', label: 'В работе' },
  { key: 'closed', label: 'Закрыто' },
] as const

export function StatsCards({ total, inWork, closed }: StatsCardsProps) {
  const values = { total, inWork, closed }

  return (
    <section className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {cards.map((card) => (
        <article key={card.key} className="bg-card border-main rounded-lg border p-5">
          <p className="text-muted text-sm">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{values[card.key]}</p>
        </article>
      ))}
    </section>
  )
}
