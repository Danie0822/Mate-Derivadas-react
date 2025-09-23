import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function UserProgress() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Progreso de Usuario
          </h1>
          <p className="mt-2 text-gray-700">
            Seguimiento de tu rendimiento y estadísticas de aprendizaje
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/50">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200/50">
            <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Próximamente
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600">
                El sistema de progreso y métricas estará disponible pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
