import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();

  const userStats = [
    { label: 'Rol', value: user?.rol || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Teléfono', value: user?.cellphone || 'N/A' },
    { label: 'ID', value: user?.id || 'N/A' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenido a tu panel de control de Mate Derivadas
          </p>
        </div>

        {/* Usuario Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <div className="p-2">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
                Información Personal
              </h3>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Correo electrónico</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.cellphone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rol</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user?.rol}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900">
                Funcionalidades Próximas
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Calculadora de derivadas</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Ejercicios interactivos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Historial de cálculos</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600 mt-2"></div>
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
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Estado de la Sesión
            </h3>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
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
