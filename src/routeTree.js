/* eslint-disable */

// This file was manually created as a JavaScript version of the route tree
// Import route definitions
import { Route as rootRouteImport } from './routes/__root'
import { Route as LoginRouteImport } from './routes/login'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as IndexRouteImport } from './routes/index'
import { Route as UsersRouteImport } from './routes/users'
import { Route as ExercisesRouteImport } from './routes/exercises'
import { Route as AIChatRouteImport } from './routes/ai-chat'
import { Route as CalculatorRouteImport } from './routes/calculator'
import { Route as StudyGuidesRouteImport } from './routes/study-guides'
import { Route as UserProgressRouteImport } from './routes/user-progress'
import { Route as PDFUploadRouteImport } from './routes/pdf-upload'
import { Route as EmbeddingsRouteImport } from './routes/embeddings'

// Create route instances
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
})

const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
})

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
})

const UsersRoute = UsersRouteImport.update({
  id: '/users',
  path: '/users',
  getParentRoute: () => rootRouteImport,
})

const ExercisesRoute = ExercisesRouteImport.update({
  id: '/exercises',
  path: '/exercises',
  getParentRoute: () => rootRouteImport,
})

const AIChatRoute = AIChatRouteImport.update({
  id: '/ai-chat',
  path: '/ai-chat',
  getParentRoute: () => rootRouteImport,
})

const CalculatorRoute = CalculatorRouteImport.update({
  id: '/calculator',
  path: '/calculator',
  getParentRoute: () => rootRouteImport,
})

const StudyGuidesRoute = StudyGuidesRouteImport.update({
  id: '/study-guides',
  path: '/study-guides',
  getParentRoute: () => rootRouteImport,
})

const UserProgressRoute = UserProgressRouteImport.update({
  id: '/user-progress',
  path: '/user-progress',
  getParentRoute: () => rootRouteImport,
})

const PDFUploadRoute = PDFUploadRouteImport.update({
  id: '/pdf-upload',
  path: '/pdf-upload',
  getParentRoute: () => rootRouteImport,
})

const EmbeddingsRoute = EmbeddingsRouteImport.update({
  id: '/embeddings',
  path: '/embeddings',
  getParentRoute: () => rootRouteImport,
})

// Define route children
const rootRouteChildren = {
  IndexRoute: IndexRoute,
  DashboardRoute: DashboardRoute,
  LoginRoute: LoginRoute,
  UsersRoute: UsersRoute,
  ExercisesRoute: ExercisesRoute,
  AIChatRoute: AIChatRoute,
  CalculatorRoute: CalculatorRoute,
  StudyGuidesRoute: StudyGuidesRoute,
  UserProgressRoute: UserProgressRoute,
  PDFUploadRoute: PDFUploadRoute,
  EmbeddingsRoute: EmbeddingsRoute,
}

// Export the route tree
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)