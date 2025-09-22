import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function Embeddings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Embeddings
          </h1>
          <p className="mt-2 text-gray-600">
            Administra la base de datos vectorial y embeddings del sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">
              Próximamente
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗄️</div>
              <p className="text-gray-500">
                La gestión de embeddings y base de datos vectorial estará disponible pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
