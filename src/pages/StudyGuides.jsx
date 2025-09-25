import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';
import { 
  StudyGuideModal, 
  DeleteStudyGuideModal, 
  StudyGuideDetailModal 
} from '../components/modals';
import { 
  getStudyGuides, 
  createStudyGuide, 
  updateStudyGuide, 
  deleteStudyGuide 
} from '../services/node/study-guides.service';
import { getLevelText, getLevelColor } from '../schemas/studyGuideSchemas';

export default function StudyGuides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudyGuide, setSelectedStudyGuide] = useState(null);
  
  const queryClient = useQueryClient();

  // Query para obtener guías de estudio
  const {
    data: studyGuides = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['studyGuides'],
    queryFn: getStudyGuides,
    select: (data) => {
      // Manejar tanto casos donde los datos vienen en data.data como directamente
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    onError: (error) => {
      console.error('Error fetching study guides:', error);
      toast.error('Error al cargar las guías de estudio');
    }
  });

  // Filtrar guías basado en la búsqueda
  const filteredStudyGuides = useMemo(() => {
    if (!searchQuery.trim()) return studyGuides;
    
    const query = searchQuery.toLowerCase();
    return studyGuides.filter(guide => 
      guide.title?.toLowerCase().includes(query) ||
      guide.description?.toLowerCase().includes(query) ||
      guide.topic?.toLowerCase().includes(query) ||
      guide.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [studyGuides, searchQuery]);

  // Configurar la virtualización para las cartas
  // Responsivo: 1 carta en móvil, 2 en tablet, 3 en desktop
  const [cardsPerRow, setCardsPerRow] = useState(3);
  
  // Detectar tamaño de pantalla y ajustar cartas por fila
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCardsPerRow(1);
      } else if (width < 1024) {
        setCardsPerRow(2);
      } else {
        setCardsPerRow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const studyGuideRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredStudyGuides.length; i += cardsPerRow) {
      rows.push(filteredStudyGuides.slice(i, i + cardsPerRow));
    }
    return rows;
  }, [filteredStudyGuides, cardsPerRow]);

  // Ref para el contenedor de scroll
  const parentRef = useRef();

  // Configurar el virtualizer con altura dinámica
  const virtualizer = useVirtualizer({
    count: studyGuideRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardsPerRow === 1 ? 420 : cardsPerRow === 2 ? 400 : 380, 
    paddingStart: 0,
    paddingEnd: 0,
    overscan: 2, 
  });

  // Mutación para crear guía de estudio
  const createStudyGuideMutation = useMutation({
    mutationFn: createStudyGuide,
    onSuccess: () => {
      queryClient.invalidateQueries(['studyGuides']);
      setIsCreateModalOpen(false);
      toast.success('Guía de estudio creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating study guide:', error);
      toast.error('Error al crear la guía de estudio');
    }
  });

  // Mutación para actualizar guía de estudio
  const updateStudyGuideMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateStudyGuide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['studyGuides']);
      setIsEditModalOpen(false);
      setSelectedStudyGuide(null);
      toast.success('Guía de estudio actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating study guide:', error);
      toast.error('Error al actualizar la guía de estudio');
    }
  });

  // Mutación para eliminar guía de estudio
  const deleteStudyGuideMutation = useMutation({
    mutationFn: deleteStudyGuide,
    onSuccess: () => {
      queryClient.invalidateQueries(['studyGuides']);
      setIsDeleteModalOpen(false);
      setSelectedStudyGuide(null);
      toast.success('Guía de estudio eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting study guide:', error);
      toast.error('Error al eliminar la guía de estudio');
    }
  });

  // Handlers para modales
  const handleCreateStudyGuide = async (studyGuideData) => {
    await createStudyGuideMutation.mutateAsync(studyGuideData);
  };

  const handleEditStudyGuide = async (studyGuideData) => {
    await updateStudyGuideMutation.mutateAsync(studyGuideData);
  };

  const handleDeleteStudyGuide = async (studyGuideId) => {
    await deleteStudyGuideMutation.mutateAsync(studyGuideId);
  };

  const handleViewDetails = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteFromDetail = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsEditModalOpen(true);
  };

  const handleDelete = (studyGuide) => {
    setSelectedStudyGuide(studyGuide);
    setIsDeleteModalOpen(true);
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Guías de Estudio
            </h1>
            <p className="mt-2 text-gray-700">
              Material de estudio y recursos educativos
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium mb-2">Error al cargar las guías de estudio</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Guías de Estudio
            </h1>
            <p className="mt-2 text-gray-700">
              Material de estudio y recursos educativos ({filteredStudyGuides.length} {filteredStudyGuides.length === 1 ? 'guía' : 'guías'})
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Guía
          </button>
        </div>

        {/* Barra de búsqueda */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar guías de estudio por título, descripción, tema o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50">
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando guías de estudio...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de guías */}
        {!isLoading && filteredStudyGuides.length === 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50">
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                {searchQuery ? (
                  <>
                    <p className="text-gray-600 mb-2">No se encontraron guías que coincidan con tu búsqueda</p>
                    <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">Aún no hay guías de estudio creadas</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Crear primera guía
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid virtualizado de guías */}
        {!isLoading && filteredStudyGuides.length > 0 && (
          <div
            ref={parentRef}
            className="h-[calc(100vh-300px)] overflow-auto"
            style={{
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = studyGuideRows[virtualRow.index];
                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className={`grid gap-6 h-full ${
                      cardsPerRow === 1 ? 'grid-cols-1' : 
                      cardsPerRow === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    } px-1`}>
                      {row.map((studyGuide) => (
                        <Card
                          key={studyGuide.id}
                          className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl transition-all duration-200 cursor-pointer group h-fit"
                        >
                          <CardHeader 
                            className="bg-gradient-to-r from-blue-100 to-green-100 border-b border-blue-200/50"
                            onClick={() => handleViewDetails(studyGuide)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                                  {studyGuide.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    📅 Semana {studyGuide.week} - Día {studyGuide.day}
                                  </span>
                                  
                                  {studyGuide.level && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(studyGuide.level)}`}>
                                      🎯 {getLevelText(studyGuide.level)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(studyGuide);
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar guía"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(studyGuide);
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar guía"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent 
                            className="p-4 cursor-pointer"
                            onClick={() => handleViewDetails(studyGuide)}
                          >
                            <div className="space-y-3">
                              {/* Descripción */}
                              {studyGuide.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {truncateText(studyGuide.description, 120)}
                                </p>
                              )}

                              {/* Tema */}
                              {studyGuide.topic && (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    📚 {studyGuide.topic}
                                  </span>
                                </div>
                              )}

                              {/* Tags */}
                              {studyGuide.tags && studyGuide.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {studyGuide.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {studyGuide.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                      +{studyGuide.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Estadísticas */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    {studyGuide.resources?.length || 0} recursos
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    {studyGuide.exercises?.length || 0} ejercicios
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(studyGuide.updated_at).toLocaleDateString()}
                                </span>
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
        )}
      </div>

      {/* Modales */}
      <StudyGuideModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStudyGuide}
        isSubmitting={createStudyGuideMutation.isPending}
      />

      <StudyGuideModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudyGuide(null);
        }}
        onSubmit={handleEditStudyGuide}
        studyGuide={selectedStudyGuide}
        isSubmitting={updateStudyGuideMutation.isPending}
      />

      <DeleteStudyGuideModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudyGuide(null);
        }}
        onConfirm={handleDeleteStudyGuide}
        studyGuide={selectedStudyGuide}
        isSubmitting={deleteStudyGuideMutation.isPending}
      />

      <StudyGuideDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudyGuide(null);
        }}
        studyGuide={selectedStudyGuide}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    </Layout>
  );
}
