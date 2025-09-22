import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';

export default function Calculator() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calculadora de Derivadas
          </h1>
          <p className="mt-2 text-gray-600">
            Calcula derivadas de funciones matemáticas
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
              <div className="text-6xl mb-4">🧮</div>
              <p className="text-gray-500">
                La calculadora de derivadas estará disponible pronto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
