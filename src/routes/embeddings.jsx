import { createFileRoute } from '@tanstack/react-router'
import Embeddings from '../pages/Embeddings'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/embeddings')({
  component: () => (
    <ProtectedRoute>
      <Embeddings />
    </ProtectedRoute>
  ),
})
