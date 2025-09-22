import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function StudyGuides() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Guías de Estudio
          </h1>
          <p className="mt-2 text-gray-600">
            Material de estudio y recursos educativos
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
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">
                Las guías de estudio estarán disponibles pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
