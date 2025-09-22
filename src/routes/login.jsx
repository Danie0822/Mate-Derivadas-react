import { createFileRoute } from '@tanstack/react-router'
import Login from '../pages/Login'
import { PublicRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/login')({
  component: () => (
    <PublicRoute>
      <Login />
    </PublicRoute>
  ),
})