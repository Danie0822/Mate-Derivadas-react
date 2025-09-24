import { Button, Card, CardContent, CardHeader } from '../ui';

const DeleteExerciseModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  exercise,
  isSubmitting = false 
}) => {
  if (!isOpen || !exercise) return null;

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

  const handleConfirm = async () => {
    await onConfirm(exercise.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Eliminar Ejercicio
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src="/Derivium-Logo.avif"
                      alt="Derivium"
                      className="h-5 w-auto"
                    />
                    <span className="text-sm text-white/90">
                      Esta acción no se puede deshacer
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 bg-gradient-to-br from-white to-red-50/30">
              <div className="space-y-4">
                {/* Mensaje de advertencia */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      ¿Estás seguro de que quieres eliminar este ejercicio?
                    </h4>
                    <p className="text-sm text-red-600 mb-4">
                      Esta acción eliminará permanentemente el ejercicio y no se puede deshacer. 
                      Todos los datos asociados se perderán.
                    </p>
                  </div>
                </div>

                {/* Vista previa del ejercicio */}
                <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-gray-900 line-clamp-2">
                      {exercise.title}
                    </h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyText(exercise.difficulty)}
                    </span>
                  </div>
                  
                  {exercise.description && (
                    <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                      <div dangerouslySetInnerHTML={{ __html: exercise.description }} />
                    </div>
                  )}
                  
                  <div className="space-y-2 text-xs">
                    {exercise.topic && (
                      <div>
                        <span className="font-medium text-gray-500">Tema:</span>
                        <span className="ml-2 text-gray-700">{exercise.topic}</span>
                      </div>
                    )}
                    
                    {exercise.tags && exercise.tags.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-500">Tags:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {exercise.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gradient-to-r from-blue-100 to-green-100 text-blue-700">
                              {tag}
                            </span>
                          ))}
                          {exercise.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{exercise.tags.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-gray-500">Creado:</span>
                      <span className="ml-2 text-gray-700">
                        {exercise.created_at ? new Date(exercise.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 shadow-lg"
                  >
                    {isSubmitting ? 'Eliminando...' : 'Eliminar Ejercicio'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeleteExerciseModal;