import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { useState } from 'react'
import { useAuth } from '../auth'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

type Form = z.infer<typeof schema>

export function RegisterPage() {
  const { user, register: registerAccount } = useAuth()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  if (user) return <Navigate to="/tickets" replace />

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">AB</div>
        <div className="login-copy">
          <h1>Создать аккаунт</h1>
          <p>Admin Board workspace</p>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => {
            setError('')
            try {
              await registerAccount(data.name, data.email, data.password)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Ошибка регистрации')
            }
          })}
        >
          <label className="field">
            <span>Имя</span>
            <input {...register('name')} autoFocus />
            {errors.name && <small>{errors.name.message}</small>}
          </label>
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
            Создать аккаунт
          </button>
        </form>

        <div className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </section>
    </main>
  )
}
