import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api'
import { ErrorState, LoadingState } from '../components/State'

const statusMap: Record<string, string> = {
  new: 'Новые',
  work: 'В работе',
  waiting: 'Ожидают',
  closed: 'Закрытые',
}
const priorityMap: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export function AnalyticsPage() {
  const stats = useQuery({ queryKey: ['stats'], queryFn: api.stats })
  if (stats.isLoading) return <LoadingState />
  if (stats.isError) return <ErrorState message={(stats.error as Error).message} />
  if (!stats.data) return null

  const open = stats.data.byStatus
    .filter((x) => x.name !== 'closed')
    .reduce((sum, x) => sum + x.value, 0)
  const critical = stats.data.byPriority.find((x) => x.name === 'critical')?.value ?? 0

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h2>Обзор</h2>
          <p>Текущее состояние очереди поддержки</p>
        </div>
      </section>
      <section className="metric-grid">
        <article className="metric">
          <span>Всего заявок</span>
          <strong>{stats.data.total}</strong>
        </article>
        <article className="metric">
          <span>Активные</span>
          <strong>{open}</strong>
        </article>
        <article className="metric">
          <span>Критические</span>
          <strong>{critical}</strong>
        </article>
        <article className="metric">
          <span>Закрыто</span>
          <strong>{stats.data.closedRate}%</strong>
        </article>
      </section>
      <section className="analytics-grid">
        <article className="chart-card">
          <header>
            <h3>По статусам</h3>
            <span>текущая очередь</span>
          </header>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.data.byStatus.map((x) => ({ ...x, label: statusMap[x.name] }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="breakdown-card">
          <header>
            <h3>Приоритеты</h3>
            <span>распределение</span>
          </header>
          <div className="breakdown-list">
            {stats.data.byPriority.map((item) => (
              <div key={item.name}>
                <span>{priorityMap[item.name]}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
