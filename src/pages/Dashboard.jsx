import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();

  const userStats = [
    { label: 'Rol', value: user?.rol || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Nombre', value: user?.full_name || 'N/A' },
    { label: 'ID', value: user?.id || 'N/A' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-700">
            Bienvenido a tu panel de control de Derivium
          </p>
        </div>

        {/* Usuario Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/40 hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="p-2">
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {stat.value}
                  </dd>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200/50">
              <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Información Personal
              </h3>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Nombre completo</dt>
                  <dd className="mt-1 text-sm text-gray-800">{user?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Correo electrónico</dt>
                  <dd className="mt-1 text-sm text-gray-800">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">ID de usuario</dt>
                  <dd className="mt-1 text-sm text-gray-800 font-mono text-xs">{user?.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Rol</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
                      {user?.rol}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200/50">
              <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Funcionalidades Próximas
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Calculadora de derivadas</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-green-600 to-blue-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Ejercicios interactivos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Historial de cálculos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-green-600 to-blue-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Gráficos de funciones</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Estado de autenticación */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/20">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200/50">
            <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Estado de la Sesión
            </h3>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Sesión activa y autenticada correctamente
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    El token JWT está siendo enviado automáticamente en todas las peticiones a la API.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
