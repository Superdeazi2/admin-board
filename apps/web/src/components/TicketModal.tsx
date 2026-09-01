import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Ticket, TicketPayload } from '../api'
import { Modal } from './Modal'

const schema = z.object({
  title: z.string().min(3, 'Минимум 3 символа'),
  description: z.string().min(5, 'Добавьте описание'),
  client: z.string().min(2, 'Укажите клиента'),
  status: z.enum(['new', 'work', 'waiting', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(2, 'Укажите категорию'),
})

type FormData = z.infer<typeof schema>

export function TicketModal({
  ticket,
  onClose,
  onSubmit,
  busy,
}: {
  ticket?: Ticket
  onClose: () => void
  onSubmit: (data: TicketPayload) => Promise<unknown>
  busy?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: ticket
      ? {
          title: ticket.title,
          description: ticket.description,
          client: ticket.client,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
        }
      : {
          status: 'new',
          priority: 'medium',
          category: 'Общее',
        },
  })

  return (
    <Modal title={ticket ? `Заявка #${ticket.number}` : 'Новая заявка'} onClose={onClose}>
      <form
        className="form-grid"
        onSubmit={handleSubmit(async (data) => {
          await onSubmit(data)
        })}
      >
        <label className="field full">
          <span>Тема</span>
          <input {...register('title')} autoFocus />
          {errors.title && <small>{errors.title.message}</small>}
        </label>

        <label className="field">
          <span>Клиент</span>
          <input {...register('client')} />
          {errors.client && <small>{errors.client.message}</small>}
        </label>

        <label className="field">
          <span>Категория</span>
          <input {...register('category')} />
          {errors.category && <small>{errors.category.message}</small>}
        </label>

        <label className="field">
          <span>Статус</span>
          <select {...register('status')}>
            <option value="new">Новая</option>
            <option value="work">В работе</option>
            <option value="waiting">Ожидает</option>
            <option value="closed">Закрыта</option>
          </select>
        </label>

        <label className="field">
          <span>Приоритет</span>
          <select {...register('priority')}>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
        </label>

        <label className="field full">
          <span>Описание</span>
          <textarea rows={5} {...register('description')} />
          {errors.description && <small>{errors.description.message}</small>}
        </label>

        <div className="modal-actions full">
          <button className="button secondary" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="button primary" disabled={busy} type="submit">
            {busy ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
