import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { useAuth } from '../auth'

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

type Form = z.infer<typeof schema>

const publicDemo = import.meta.env.VITE_PUBLIC_DEMO === 'true'

const credentials = publicDemo
  ? { email: 'demo@adminboard.app', password: 'PortfolioDemo!2026' }
  : { email: 'admin@mail.ru', password: 'Admin123!' }

export function LoginPage() {
  const { user, login } = useAuth()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: credentials,
  })

  if (user) return <Navigate to="/tickets" replace />

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">AB</div>
        <div className="login-copy">
          <h1>Admin Board</h1>
          <p>Support workspace</p>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => {
            setError('')
            try {
              await login(data.email, data.password)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Ошибка входа')
            }
          })}
        >
          <label className="field">
            <span>Email</span>
            <input {...register('email')} />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label className="field">
            <span>Пароль</span>
            <input type="password" {...register('password')} />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          {error && <div className="inline-error">{error}</div>}
          <button className="button primary full-button" disabled={isSubmitting}>
            Войти
          </button>
        </form>

        {!publicDemo && (
          <div className="auth-switch">
            Нет аккаунта? <Link to="/register">Создать</Link>
          </div>
        )}

        <div className="demo-note">
          <span>{publicDemo ? 'Portfolio demo' : 'Local seed'}</span>
          <code>
            {credentials.email} / {credentials.password}
          </code>
        </div>
      </section>
    </main>
  )
}
