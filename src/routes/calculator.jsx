import { createFileRoute } from '@tanstack/react-router'
import Calculator from '../pages/Calculator'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/calculator')({
  component: () => (
    <ProtectedRoute>
      <Calculator />
    </ProtectedRoute>
  ),
})
