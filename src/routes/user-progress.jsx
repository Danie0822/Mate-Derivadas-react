import { createFileRoute } from '@tanstack/react-router'
import UserProgress from '../pages/UserProgress'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/user-progress')({
  component: () => (
    <ProtectedRoute>
      <UserProgress />
    </ProtectedRoute>
  ),
})
