import React from 'react';
import { getLevelText, getLevelColor } from '../../schemas/studyGuideSchemas';

const DeleteStudyGuideModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  studyGuide,
  isSubmitting = false 
}) => {
  if (!isOpen || !studyGuide) return null;

  const handleConfirm = async () => {
    await onConfirm(studyGuide.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Guía de Estudio
              </h3>
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          {/* Información de la guía */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 text-base">
                  {studyGuide.title}
                </h4>
                {studyGuide.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {studyGuide.description.length > 100
                      ? `${studyGuide.description.substring(0, 100)}...`
                      : studyGuide.description
                    }
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Semana {studyGuide.week} - Día {studyGuide.day}
                </span>
                
                {studyGuide.level && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(studyGuide.level)}`}>
                    {getLevelText(studyGuide.level)}
                  </span>
                )}

                {studyGuide.topic && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {studyGuide.topic}
                  </span>
                )}
              </div>

              {studyGuide.tags && studyGuide.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {studyGuide.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {studyGuide.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      +{studyGuide.tags.length - 3} más
                    </span>
                  )}
                </div>
              )}

              {/* Estadísticas */}
              <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>
                  Recursos: {studyGuide.resources?.length || 0}
                </span>
                <span>
                  Ejercicios: {studyGuide.exercises?.length || 0}
                </span>
                <span>
                  Creada: {new Date(studyGuide.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <div className="mb-6">
            <p className="text-sm text-gray-700">
              ¿Estás seguro de que deseas eliminar esta guía de estudio? 
              <span className="font-medium text-red-600"> Esta acción no se puede deshacer</span> y 
              se perderá toda la información asociada incluyendo el contenido educativo, recursos y referencias a ejercicios.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Eliminar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudyGuideModal;