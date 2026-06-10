import type { ReactNode } from 'react'
import { Button } from './Button'

type HeaderProps = {
  mobileTabs: ReactNode
}

export function Header({ mobileTabs }: HeaderProps) {
  return (
    <header className="bg-header border-main border-b">
      <div className="content-shell flex min-h-[88px] items-center justify-between gap-6 py-4 max-md:flex-col max-md:items-start max-md:gap-4">
        <div>
          <p className="text-accent-light text-xs font-semibold uppercase tracking-[0.16em]">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white max-sm:text-xl">
            Панель управления заявками
          </h1>
          <p className="text-body mt-1 text-sm">
            Мини-интерфейс для обработки обращений пользователей
          </p>
        </div>
        <Button className="max-sm:w-full">+ Новая заявка</Button>
      </div>
      {mobileTabs}
    </header>
  )
}
