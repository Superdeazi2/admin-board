import type { ReactNode } from 'react'

export function LoadingState() {
  return (
    <div className="state-card">
      <div className="spinner" />
      <span>Загрузка данных</span>
    </div>
  )
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="state-card error">
      <strong>Не удалось загрузить данные</strong>
      <span>{message}</span>
      {action}
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}
