export type TicketStatus = 'new' | 'work' | 'waiting' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type Ticket = {
  id: number
  title: string
  description: string
  client: string
  status: TicketStatus
  priority: TicketPriority
  date: string
}

export const statusLabels: Record<TicketStatus, string> = {
  new: 'Новая',
  work: 'В работе',
  waiting: 'Ожидает',
  closed: 'Закрыта',
}

export const priorityLabels: Record<TicketPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export const tickets: Ticket[] = [
  {
    id: 1001,
    title: 'Не проходит оплата',
    description: 'Клиент получает ошибку при оплате годового тарифа банковской картой.',
    client: 'Acme Studio',
    status: 'new',
    priority: 'critical',
    date: '09 июн',
  },
  {
    id: 1002,
    title: 'Ошибка входа',
    description: 'После сброса пароля пользователь не может войти в личный кабинет.',
    client: 'Northwind CRM',
    status: 'work',
    priority: 'high',
    date: '08 июн',
  },
  {
    id: 1003,
    title: 'Изменить email',
    description: 'Нужно обновить контактный email администратора аккаунта.',
    client: 'Pixel Forge',
    status: 'waiting',
    priority: 'medium',
    date: '07 июн',
  },
  {
    id: 1004,
    title: 'Не загружается файл',
    description: 'Документ зависает на этапе обработки и не появляется в списке вложений.',
    client: 'Finex Group',
    status: 'work',
    priority: 'high',
    date: '07 июн',
  },
  {
    id: 1005,
    title: 'Вопрос по тарифам',
    description: 'Клиент уточняет лимиты по участникам и доступным интеграциям.',
    client: 'Orbit Apps',
    status: 'new',
    priority: 'low',
    date: '06 июн',
  },
  {
    id: 1006,
    title: 'Заявка решена',
    description: 'Проблема с уведомлениями устранена после обновления настроек проекта.',
    client: 'Market Desk',
    status: 'closed',
    priority: 'medium',
    date: '05 июн',
  },
]
