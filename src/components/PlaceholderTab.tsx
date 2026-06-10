type PlaceholderTabProps = {
  title: string
  description: string
}

export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
  return (
    <section className="bg-card border-main rounded-lg border p-6">
      <p className="text-accent-light text-xs font-semibold uppercase tracking-[0.16em]">
        Раздел
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="text-body mt-2 max-w-2xl text-sm">{description}</p>
    </section>
  )
}
