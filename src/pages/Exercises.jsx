import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, Button, Search } from '../components/ui';
import { ExerciseModal, DeleteExerciseModal, ExerciseDetailModal } from '../components/modals';
import { UserTableSkeleton } from '../components/ui/Skeleton';
import { 
  getExercises, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../services/node/exercises.service';

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  const queryClient = useQueryClient();

  // Query para obtener ejercicios
  const {
    data: exercises = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExercises,
    select: (data) => {
      // Asegurar que siempre sea un array
      return Array.isArray(data) ? data : data?.data ? data.data : [];
    },
    onError: (error) => {
      console.error('Error fetching exercises:', error);
      toast.error('Error al cargar los ejercicios');
    }
  });

  // Filtrar ejercicios basado en la búsqueda
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exercises;
    
    return exercises.filter(exercise =>
      exercise.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exercise.tags && exercise.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [exercises, searchQuery]);

  // Configurar la virtualización para las cartas
  // Responsivo: 1 carta en móvil, 2 en tablet, 3 en desktop
  const [cardsPerRow, setCardsPerRow] = useState(3);
  
  // Detectar tamaño de pantalla y ajustar cartas por fila
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (window.innerWidth < 768) {
        setCardsPerRow(1); // móvil
      } else if (window.innerWidth < 1024) {
        setCardsPerRow(2); // tablet
      } else {
        setCardsPerRow(3); // desktop
      }
    };
    
    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  const exerciseRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredExercises.length; i += cardsPerRow) {
      rows.push(filteredExercises.slice(i, i + cardsPerRow));
    }
    return rows;
  }, [filteredExercises, cardsPerRow]);

  // Ref para el contenedor de scroll
  const parentRef = useRef();

    // Configurar el virtualizer con altura dinámica
  const virtualizer = useVirtualizer({
    count: exerciseRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardsPerRow === 1 ? 400 : cardsPerRow === 2 ? 380 : 360, 
    paddingStart: 0,
    paddingEnd: 0,
    overscan: 2, 
  });

  // Mutación para crear ejercicio
  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      toast.success('Ejercicio creado exitosamente');
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      console.error('Error creating exercise:', error);
      toast.error(error?.response?.data?.message || 'Error al crear el ejercicio');
    }
  });

  // Mutación para actualizar ejercicio
  const updateExerciseMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      toast.success('Ejercicio actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedExercise(null);
    },
    onError: (error) => {
      console.error('Error updating exercise:', error);
      toast.error(error?.response?.data?.message || 'Error al actualizar el ejercicio');
    }
  });

  // Mutación para eliminar ejercicio
  const deleteExerciseMutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      toast.success('Ejercicio eliminado exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedExercise(null);
    },
    onError: (error) => {
      console.error('Error deleting exercise:', error);
      toast.error(error?.response?.data?.message || 'Error al eliminar el ejercicio');
    }
  });

  // Handlers para modales
  const handleCreateExercise = async (exerciseData) => {
    createExerciseMutation.mutate(exerciseData);
  };

  const handleEditExercise = async (exerciseData) => {
    if (selectedExercise) {
      updateExerciseMutation.mutate({ id: selectedExercise.id, ...exerciseData });
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    deleteExerciseMutation.mutate(exerciseId);
  };

  const openEditModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteModalOpen(true);
  };

  const openDetailModal = (exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedExercise(null);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800',
      medium: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800',
      hard: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
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

  // Calcular estadísticas
  const stats = useMemo(() => ({
    total: exercises.length,
    topics: exercises.length > 0 ? [...new Set(exercises.map(e => e.topic).filter(Boolean))].length : 0,
    difficulties: 3 // easy, medium, hard
  }), [exercises]);

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-600 text-lg mb-4">Error al cargar los ejercicios</div>
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Ejercicios Interactivos
            </h1>
            <p className="mt-2 text-gray-700">
              Práctica con ejercicios de derivadas
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg"
          >
            Nuevo Ejercicio
          </Button>
        </div>

        {/* Búsqueda */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-blue-50/30">
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
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/40">
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-600">Total Ejercicios</dt>
                <dd className="mt-1 text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {isLoading ? '...' : stats.total}
                </dd>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/40">
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-600">Temas</dt>
                <dd className="mt-1 text-2xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? '...' : stats.topics}
                </dd>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/40">
            <CardContent>
              <div className="p-2">
                <dt className="text-sm font-medium text-gray-600">Dificultades</dt>
                <dd className="mt-1 text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {stats.difficulties}
                </dd>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/20">
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 float-right"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de ejercicios virtualizada */}
        {!isLoading && filteredExercises.length > 0 && (
          <div className="relative">
            {/* Indicador de total de ejercicios */}
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Mostrando {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-500">
                💡 Scroll para ver más ejercicios
              </span>
            </div>
            
            <div 
              ref={parentRef}
              className="h-[600px] overflow-auto border rounded-lg bg-gradient-to-br from-white to-blue-50/10 shadow-inner"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#3b82f6 #f1f5f9'
              }}
            >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const exerciseRow = exerciseRows[virtualItem.index];
                
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 pb-12">
                      {exerciseRow.map((exercise) => (
                        <Card key={exercise.id} className="hover:shadow-xl transition-shadow duration-200 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/20 min-h-[280px] flex flex-col">
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
                          <CardContent className="flex-grow flex flex-col">
                            {exercise.description && (
                              <div className="text-sm text-gray-600 mb-4 line-clamp-3">
                                <div dangerouslySetInnerHTML={{ __html: exercise.description }} />
                              </div>
                            )}
                            
                            <div className="flex-grow space-y-3">
                              {exercise.topic && (
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Tema:</span>
                                  <span className="ml-2 text-xs text-gray-700">{exercise.topic}</span>
                                </div>
                              )}
                              
                              {exercise.tags && exercise.tags.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-gray-500">Tags:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {exercise.tags.slice(0, 3).map((tag, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gradient-to-r from-blue-100 to-green-100 text-blue-700">
                                        {tag}
                                      </span>
                                    ))}
                                    {exercise.tags.length > 3 && (
                                      <span className="text-xs text-gray-500">+{exercise.tags.length - 3} más</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                                <span className="text-xs text-gray-500">
                                  {exercise.created_at ? new Date(exercise.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => openDetailModal(exercise)}
                                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-purple-600 hover:text-purple-700"
                                  >
                                    Ver
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => openEditModal(exercise)}
                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50"
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => openDeleteModal(exercise)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* Mensaje de no resultados */}
        {!isLoading && filteredExercises.length === 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-gray-600 text-lg mb-2">
                  {searchQuery ? 'No se encontraron ejercicios' : 'No hay ejercicios disponibles'}
                </div>
                <div className="text-gray-500 text-sm">
                  {searchQuery 
                    ? `No hay resultados para "${searchQuery}". Intenta con otros términos.`
                    : 'Comienza creando tu primer ejercicio.'
                  }
                </div>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white border-0 shadow-lg"
                  >
                    Crear Primer Ejercicio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modales */}
        <ExerciseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateExercise}
          isSubmitting={createExerciseMutation.isPending}
        />

        <ExerciseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedExercise(null);
          }}
          onSubmit={handleEditExercise}
          exercise={selectedExercise}
          isSubmitting={updateExerciseMutation.isPending}
        />

        <ExerciseDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          exercise={selectedExercise}
          onEdit={() => {
            closeDetailModal();
            setSelectedExercise(selectedExercise);
            setIsEditModalOpen(true);
          }}
          onDelete={() => {
            closeDetailModal();
            setSelectedExercise(selectedExercise);
            setIsDeleteModalOpen(true);
          }}
        />

        <DeleteExerciseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedExercise(null);
          }}
          onConfirm={handleDeleteExercise}
          exercise={selectedExercise}
          isSubmitting={deleteExerciseMutation.isPending}
        />
      </div>
    </Layout>
  );
}