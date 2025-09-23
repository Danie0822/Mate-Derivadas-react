import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function Embeddings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Gestión de Embeddings
          </h1>
          <p className="mt-2 text-gray-700">
            Administra la base de datos vectorial y embeddings del sistema
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200/50">
            <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Próximamente
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗄️</div>
              <p className="text-gray-600">
                La gestión de embeddings y base de datos vectorial estará disponible pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
