import { createFileRoute } from '@tanstack/react-router'
import AIChat from '../pages/AIChat'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/ai-chat')({
  component: () => (
    <ProtectedRoute>
      <AIChat />
    </ProtectedRoute>
  ),
})
