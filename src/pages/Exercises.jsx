import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, Search } from '../components/ui';

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState('');

  // Datos mock para ejercicios
  const mockExercises = [
    {
      id: 1,
      title: 'Derivada de funciones polinómicas',
      description: 'Calcula la derivada de f(x) = 3x² + 2x - 1',
      difficulty: 'easy',
      topic: 'Derivadas básicas',
      tags: ['polinomios', 'derivadas', 'básico'],
      created_at: '2024-01-15'
    },
    {
      id: 2,
      title: 'Regla de la cadena',
      description: 'Encuentra la derivada de f(x) = (2x + 1)³',
      difficulty: 'medium',
      topic: 'Reglas de derivación',
      tags: ['regla de la cadena', 'composición', 'medio'],
      created_at: '2024-01-12'
    },
    {
      id: 3,
      title: 'Derivadas trigonométricas',
      description: 'Calcula la derivada de f(x) = sin(x) * cos(x)',
      difficulty: 'hard',
      topic: 'Funciones trigonométricas',
      tags: ['trigonometría', 'producto', 'avanzado'],
      created_at: '2024-01-10'
    }
  ];

  const filteredExercises = mockExercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil'
    };
    return texts[difficulty] || difficulty;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ejercicios Interactivos
            </h1>
            <p className="mt-2 text-gray-600">
              Práctica con ejercicios de derivadas
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            Nuevo Ejercicio
          </Button>
        </div>

        {/* Búsqueda */}
        <Card>
          <CardContent>
            <Search
              placeholder="Buscar ejercicios por título, descripción o tema..."
              onSearch={setSearchQuery}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-500">Total Ejercicios</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{mockExercises.length}</dd>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-500">Temas</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {[...new Set(mockExercises.map(e => e.topic))].length}
                </dd>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-500">Dificultades</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">3</dd>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de ejercicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                    {exercise.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyText(exercise.difficulty)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {exercise.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Tema:</span>
                    <span className="ml-2 text-xs text-gray-700">{exercise.topic}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {exercise.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {new Date(exercise.created_at).toLocaleDateString()}
                    </span>
                    <div className="space-x-2">
                      <Button size="sm" variant="ghost">
                        Ver
                      </Button>
                      <Button size="sm">
                        Resolver
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-500">
                  No se encontraron ejercicios
                  {searchQuery && ` para "${searchQuery}"`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}