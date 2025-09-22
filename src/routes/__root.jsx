import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="App">
        <Outlet />
      </div>
      {/* DevTools solo en desarrollo */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})