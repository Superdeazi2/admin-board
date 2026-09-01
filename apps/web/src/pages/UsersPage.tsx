import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Trash2, UserPlus, UsersRound, X } from 'lucide-react'
import { api, type AdminUser, type Permission, type Role } from '../api'
import { useAuth } from '../auth'

const permissionOptions: Array<{
  value: Permission
  title: string
  description: string
}> = [
  {
    value: 'tickets.create',
    title: 'Создание заявок',
    description: 'Может создавать новые заявки.',
  },
  {
    value: 'tickets.edit',
    title: 'Редактирование заявок',
    description: 'Может менять данные и статусы заявок.',
  },
  {
    value: 'tickets.delete',
    title: 'Удаление заявок',
    description: 'Может безвозвратно удалять заявки.',
  },
  {
    value: 'analytics.view',
    title: 'Аналитика',
    description: 'Имеет доступ к метрикам и графикам.',
  },
  {
    value: 'users.view',
    title: 'Команда',
    description: 'Может просматривать список пользователей.',
  },
]

const roleLabels: Record<Role, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  user: 'Пользователь',
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [accessRole, setAccessRole] = useState<Role>('user')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as Role,
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: api.users,
  })

  const saveAccess = useMutation({
    mutationFn: ({
      id,
      role,
      permissions: nextPermissions,
    }: {
      id: string
      role: Role
      permissions: Permission[]
    }) => api.updateUserAccess(id, { role, permissions: nextPermissions }),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      setSelected(updated)
      setAccessRole(updated.role)
      setPermissions(updated.permissions)
    },
  })

  const deleteUser = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: async () => {
      setSelected(null)
      setDeleteConfirm(false)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const createUser = useMutation({
    mutationFn: api.createUser,
    onSuccess: async () => {
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', role: 'user' })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const users = usersQuery.data ?? []

  const roleCounts = {
    admin: users.filter((item) => item.role === 'admin').length,
    manager: users.filter((item) => item.role === 'manager').length,
    user: users.filter((item) => item.role === 'user').length,
  }

  const openAccess = (item: AdminUser) => {
    setSelected(item)
    setAccessRole(item.role)
    setPermissions(item.permissions ?? [])
    setDeleteConfirm(false)
  }

  const togglePermission = (permission: Permission) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  if (usersQuery.isLoading) {
    return <div className="access-state">Загрузка пользователей…</div>
  }

  if (usersQuery.isError) {
    return (
      <div className="access-state access-state-error">
        {usersQuery.error instanceof Error
          ? usersQuery.error.message
          : 'Не удалось загрузить пользователей'}
      </div>
    )
  }

  return (
    <div className="access-page">
      <div className="access-heading">
        <div>
          <p className="access-eyebrow">Команда</p>
          <h1>Пользователи и доступ</h1>
          <p>
            Роли задают базовый уровень доступа. Администратор может добавить отдельные права поверх
            роли.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button className="access-primary" type="button" onClick={() => setShowCreate(true)}>
            <UserPlus size={17} />
            Добавить пользователя
          </button>
        )}
      </div>

      <div className="access-summary">
        <div>
          <span>Всего</span>
          <strong>{users.length}</strong>
        </div>
        <div>
          <span>Администраторы</span>
          <strong>{roleCounts.admin}</strong>
        </div>
        <div>
          <span>Менеджеры</span>
          <strong>{roleCounts.manager}</strong>
        </div>
        <div>
          <span>Пользователи</span>
          <strong>{roleCounts.user}</strong>
        </div>
      </div>

      <div className="access-grid">
        {users.map((item) => (
          <button
            className="access-user-card"
            key={item.id}
            type="button"
            onClick={() => openAccess(item)}
          >
            <span className="access-avatar">{initials(item.name)}</span>
            <span className="access-user-main">
              <span className="access-user-name">
                {item.name}
                {item.id === currentUser?.id && <small>Вы</small>}
              </span>
              <span className="access-user-email">{item.email}</span>
              <span className="access-user-meta">
                {roleLabels[item.role]} · {item._count.assignedTickets} заявок
              </span>
            </span>
            <span className={`access-role access-role-${item.role}`}>{roleLabels[item.role]}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="access-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setSelected(null)
            }
          }}
        >
          <section
            className="access-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Управление доступом"
          >
            <header className="access-dialog-header">
              <div>
                <span className="access-avatar access-avatar-large">{initials(selected.name)}</span>
                <div>
                  <h2>{selected.name}</h2>
                  <p>{selected.email}</p>
                </div>
              </div>
              <button
                className="access-icon-button"
                type="button"
                aria-label="Закрыть"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="access-dialog-body">
              <div className="access-section">
                <div className="access-section-title">
                  <ShieldCheck size={17} />
                  <div>
                    <strong>Базовая роль</strong>
                    <span>
                      Менеджер уже умеет создавать и редактировать заявки, смотреть аналитику и
                      команду.
                    </span>
                  </div>
                </div>

                <select
                  className="access-select"
                  value={accessRole}
                  disabled={currentUser?.role !== 'admin'}
                  onChange={(event) => setAccessRole(event.target.value as Role)}
                >
                  <option value="user">Пользователь</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div className="access-section">
                <div className="access-section-title">
                  <UsersRound size={17} />
                  <div>
                    <strong>Дополнительные права</strong>
                    <span>Эти разрешения добавляются поверх возможностей выбранной роли.</span>
                  </div>
                </div>

                <div className="access-permissions">
                  {permissionOptions.map((option) => {
                    const active = permissions.includes(option.value)

                    return (
                      <label
                        className={`access-permission ${active ? 'is-active' : ''}`}
                        key={option.value}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          disabled={currentUser?.role !== 'admin'}
                          onChange={() => togglePermission(option.value)}
                        />
                        <span>
                          <strong>{option.title}</strong>
                          <small>{option.description}</small>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {saveAccess.error && (
                <p className="access-error">
                  {saveAccess.error instanceof Error
                    ? saveAccess.error.message
                    : 'Не удалось изменить доступ'}
                </p>
              )}

              {deleteUser.error && (
                <p className="access-error">
                  {deleteUser.error instanceof Error
                    ? deleteUser.error.message
                    : 'Не удалось удалить пользователя'}
                </p>
              )}
            </div>

            {currentUser?.role === 'admin' && (
              <footer className="access-dialog-footer">
                <div>
                  {selected.id !== currentUser.id &&
                    (!deleteConfirm ? (
                      <button
                        className="access-danger-ghost"
                        type="button"
                        onClick={() => setDeleteConfirm(true)}
                      >
                        <Trash2 size={16} />
                        Удалить аккаунт
                      </button>
                    ) : (
                      <button
                        className="access-danger"
                        type="button"
                        disabled={deleteUser.isPending}
                        onClick={() => deleteUser.mutate(selected.id)}
                      >
                        {deleteUser.isPending ? 'Удаление…' : 'Подтвердить удаление'}
                      </button>
                    ))}
                </div>

                <button
                  className="access-primary"
                  type="button"
                  disabled={saveAccess.isPending}
                  onClick={() =>
                    saveAccess.mutate({
                      id: selected.id,
                      role: accessRole,
                      permissions,
                    })
                  }
                >
                  {saveAccess.isPending ? 'Сохранение…' : 'Сохранить права'}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}

      {showCreate && (
        <div className="access-overlay">
          <section
            className="access-dialog access-dialog-small"
            role="dialog"
            aria-modal="true"
            aria-label="Новый пользователь"
          >
            <header className="access-dialog-header">
              <div>
                <span className="access-avatar access-avatar-large">
                  <UserPlus size={20} />
                </span>
                <div>
                  <h2>Новый пользователь</h2>
                  <p>Создайте аккаунт и назначьте базовую роль.</p>
                </div>
              </div>
              <button
                className="access-icon-button"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                <X size={18} />
              </button>
            </header>

            <form
              className="access-create-form"
              onSubmit={(event) => {
                event.preventDefault()
                createUser.mutate(form)
              }}
            >
              <label>
                Имя
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Пароль
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Роль
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value as Role,
                    }))
                  }
                >
                  <option value="user">Пользователь</option>
                  <option value="manager">Менеджер</option>
                  <option value="admin">Администратор</option>
                </select>
              </label>

              {createUser.error && (
                <p className="access-error">
                  {createUser.error instanceof Error
                    ? createUser.error.message
                    : 'Не удалось создать пользователя'}
                </p>
              )}

              <button
                className="access-primary access-create-submit"
                type="submit"
                disabled={createUser.isPending}
              >
                {createUser.isPending ? 'Создание…' : 'Создать аккаунт'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
