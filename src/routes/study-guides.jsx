import { createFileRoute } from '@tanstack/react-router'
import StudyGuides from '../pages/StudyGuides'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/study-guides')({
  component: () => (
    <ProtectedRoute>
      <StudyGuides />
    </ProtectedRoute>
  ),
})
