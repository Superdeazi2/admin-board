import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import { Layout } from './components/Layout'
import { LoadingState } from './components/State'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

const TicketsPage = lazy(() =>
  import('./pages/TicketsPage').then((module) => ({ default: module.TicketsPage })),
)
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })),
)
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((module) => ({ default: module.UsersPage })),
)

function RouteFallback() {
  return (
    <div className="screen-center">
      <LoadingState />
    </div>
  )
}

function Protected() {
  const { user, loading } = useAuth()

  if (loading) return <RouteFallback />
  if (!user) return <Navigate to="/login" replace />

  return <Layout />
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Protected />}>
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
    </Suspense>
  )
}
