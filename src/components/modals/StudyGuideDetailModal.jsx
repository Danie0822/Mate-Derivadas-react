import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getLevelText, getLevelColor } from '../../schemas/studyGuideSchemas';
import { getStudyGuideExercises } from '../../services/node/study-guides.service'
import SolveExerciseModal from './SolveExerciseModal'

const StudyGuideDetailModal = ({ 
  isOpen, 
  onClose, 
  studyGuide,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);

  // Query para obtener los ejercicios completos de la guía de estudio
  const { 
    data: exercisesResponse, 
    isLoading: isLoadingExercises,
    error: exercisesError 
  } = useQuery({
    queryKey: ['studyGuideExercises', studyGuide?.id],
    queryFn: () => getStudyGuideExercises(studyGuide.id),
    enabled: isOpen && !!studyGuide?.id,
    select: (data) => {
      // Manejar tanto casos donde los datos vienen en data.data como directamente
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    }
  });

  const handleSolveExercise = (exercise) => {
    setSelectedExercise(exercise);
    setIsSolveModalOpen(true);
  };

  const handleCloseSolveModal = () => {
    setIsSolveModalOpen(false);
    setSelectedExercise(null);
  };

  const handleSubmitAnswer = (answerData) => {
    console.log('Respuesta del usuario:', answerData);
    // Aquí puedes implementar la lógica de comparación o envío
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Intermedio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (!isOpen || !studyGuide) return null;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📋' },
    { id: 'content', label: 'Contenido', icon: '📖' },
    { id: 'resources', label: 'Recursos', icon: '🔗' },
    { id: 'exercises', label: 'Ejercicios', icon: '💡' }
  ];

  const renderContentSection = (title, content) => {
    if (!content || (typeof content === 'string' && !content.trim())) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No hay contenido para {title.toLowerCase()}</p>
        </div>
      );
    }

    return (
      <div className="prose max-w-none">
        <div 
          className="bg-white p-4 rounded-lg border border-gray-200"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{studyGuide.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 text-white">
                  📅 Semana {studyGuide.week} - Día {studyGuide.day}
                </span>
                
                {studyGuide.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 text-white">
                    🎯 {getLevelText(studyGuide.level)}
                  </span>
                )}

                {studyGuide.topic && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 text-white">
                    📚 {studyGuide.topic}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {studyGuide.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {studyGuide.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Información temporal */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📅 Cronograma</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Semana:</span> {studyGuide.week}</p>
                    <p><span className="font-medium">Día:</span> {studyGuide.day}</p>
                  </div>
                </div>

                {/* Información educativa */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">🎯 Categorización</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><span className="font-medium">Nivel:</span> {studyGuide.level ? getLevelText(studyGuide.level) : 'No especificado'}</p>
                    <p><span className="font-medium">Tema:</span> {studyGuide.topic || 'No especificado'}</p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">📊 Estadísticas</h4>
                  <div className="space-y-1 text-sm text-purple-800">
                    <p><span className="font-medium">Recursos:</span> {studyGuide.resources?.length || 0}</p>
                    <p><span className="font-medium">Ejercicios:</span> {studyGuide.exercises?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {studyGuide.tags && studyGuide.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {studyGuide.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Información de fechas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Creada:</span> {new Date(studyGuide.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Actualizada:</span> {new Date(studyGuide.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📖 Contenido Educativo</h3>
              
              {studyGuide.content ? (
                <div className="space-y-6">
                  {studyGuide.content.introduction && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        🌟 Introducción
                      </h4>
                      {renderContentSection('Introducción', studyGuide.content.introduction)}
                    </div>
                  )}

                  {studyGuide.content.theory && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        📚 Teoría
                      </h4>
                      {renderContentSection('Teoría', studyGuide.content.theory)}
                    </div>
                  )}

                  {studyGuide.content.examples && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        💡 Ejemplos
                      </h4>
                      {renderContentSection('Ejemplos', studyGuide.content.examples)}
                    </div>
                  )}

                  {studyGuide.content.notes && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        📝 Notas
                      </h4>
                      {renderContentSection('Notas', studyGuide.content.notes)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📖</div>
                  <p>No hay contenido educativo disponible</p>
                  <p className="text-sm mt-2">Edita la guía para agregar contenido</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🔗 Recursos Externos</h3>
              
              {studyGuide.resources && studyGuide.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyGuide.resources.map((resource, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {resource.type === 'video' && '🎥'}
                          {resource.type === 'pdf' && '📄'}
                          {resource.type === 'link' && '🔗'}
                          {resource.type === 'article' && '📰'}
                          {!['video', 'pdf', 'link', 'article'].includes(resource.type) && '📎'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
                          <p className="text-sm text-gray-500 capitalize mb-2">{resource.type}</p>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Ver recurso
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔗</div>
                  <p>No hay recursos externos disponibles</p>
                  <p className="text-sm mt-2">Edita la guía para agregar recursos</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">💡 Ejercicios Relacionados</h3>
                {isLoadingExercises && (
                  <div className="text-sm text-gray-500">Cargando ejercicios...</div>
                )}
              </div>
              
              {exercisesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Error al cargar los ejercicios: {exercisesError.message}</p>
                </div>
              )}

              {!isLoadingExercises && !exercisesError && exercisesResponse && exercisesResponse.length > 0 ? (
                <div className="space-y-4">
                  {exercisesResponse
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((exercise, index) => (
                      <div key={exercise.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Header del ejercicio */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-800">
                                {exercise.order || index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">{exercise.title}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                                  {getDifficultyText(exercise.difficulty)}
                                </span>
                                {exercise.topic && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    📚 {exercise.topic}
                                  </span>
                                )}
                                {exercise.required && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    ⚠️ Requerido
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSolveExercise(exercise)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Resolver
                          </button>
                        </div>

                        {/* Descripción del ejercicio */}
                        {exercise.description && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Descripción:</h5>
                            <div 
                              className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded-lg border"
                              dangerouslySetInnerHTML={{ __html: exercise.description }}
                            />
                          </div>
                        )}

                        {/* Contenido/Pregunta del ejercicio */}
                        {exercise.content && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Pregunta:</h5>
                            <div 
                              className="prose prose-sm max-w-none text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200"
                              dangerouslySetInnerHTML={{ 
                                __html: exercise.content.question || JSON.stringify(exercise.content) 
                              }}
                            />
                          </div>
                        )}

                        {/* Tags del ejercicio */}
                        {exercise.tags && exercise.tags.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Etiquetas:</h5>
                            <div className="flex flex-wrap gap-2">
                              {exercise.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notas adicionales si las hay */}
                        {exercise.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-medium text-yellow-900 mb-1">📝 Notas:</h5>
                            <p className="text-sm text-yellow-800">{exercise.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : !isLoadingExercises && !exercisesError ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💡</div>
                  <p>No hay ejercicios relacionados disponibles</p>
                  <p className="text-sm mt-2">Edita la guía para agregar ejercicios</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
          {user?.rol === 'admin' && onEdit && (
            <button
              onClick={() => onEdit(studyGuide)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
          {user?.rol === 'admin' && onDelete && (
            <button
              onClick={() => onDelete(studyGuide)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Modal para resolver ejercicio */}
      <SolveExerciseModal
        isOpen={isSolveModalOpen}
        onClose={handleCloseSolveModal}
        exercise={selectedExercise}
        onSubmitAnswer={handleSubmitAnswer}
        userId={user?.id}
      />
    </div>
  );
};

export default StudyGuideDetailModal;