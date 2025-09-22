import { createFileRoute } from '@tanstack/react-router'
import PDFUpload from '../pages/PDFUpload'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/pdf-upload')({
  component: () => (
    <ProtectedRoute>
      <PDFUpload />
    </ProtectedRoute>
  ),
})
