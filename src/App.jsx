import { createRouter, RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from './context/AuthContext'

// Import the route tree (JavaScript version)
import { routeTree } from './routeTree.js'

// Create a new router instance
const router = createRouter({ routeTree })

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
