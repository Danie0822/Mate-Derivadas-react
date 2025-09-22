import { createFileRoute } from '@tanstack/react-router'
import Exercises from '../pages/Exercises'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/exercises')({
  component: () => (
    <ProtectedRoute>
      <Exercises />
    </ProtectedRoute>
  ),
})
