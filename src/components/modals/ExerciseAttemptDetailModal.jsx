import { Card, CardContent, CardHeader } from '../ui';

const ExerciseAttemptDetailModal = ({ 
  isOpen, 
  onClose, 
  exercise,
  userAttempt
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <Card className="border-0 shadow-2xl">
            <CardHeader className={`text-white ${userAttempt?.is_correct ? 'bg-gradient-to-r from-green-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-pink-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {userAttempt?.is_correct ? '✅' : '❌'} {exercise.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)} bg-white/90`}>
                      {getDifficultyText(exercise.difficulty)}
                    </span>
                    {exercise.topic && (
                      <span className="text-white/90 text-sm bg-white/20 px-2 py-1 rounded">
                        📚 {exercise.topic}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 bg-gradient-to-br from-white to-blue-50/30 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Enunciado del ejercicio */}
                {exercise.content && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                      🎯 Enunciado del Ejercicio
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg shadow-sm border border-blue-200">
                      {typeof exercise.content === 'object' && exercise.content.question ? (
                        <div dangerouslySetInnerHTML={{ __html: exercise.content.question }} />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: exercise.content }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Tu respuesta */}
                {userAttempt?.answer && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                      📝 Tu Respuesta
                    </h4>
                    <div className={`prose prose-sm max-w-none text-gray-700 p-4 rounded-lg shadow-sm border ${
                      userAttempt.is_correct 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    }`}>
                      {typeof userAttempt.answer === 'object' && userAttempt.answer.userAnswer ? (
                        <div dangerouslySetInnerHTML={{ __html: userAttempt.answer.userAnswer }} />
                      ) : typeof userAttempt.answer === 'string' ? (
                        <div dangerouslySetInnerHTML={{ __html: userAttempt.answer }} />
                      ) : (
                        <p>{JSON.stringify(userAttempt.answer)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Solución correcta */}
                {exercise.solution && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                      ✅ Solución Correcta
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg shadow-sm border border-green-200">
                      {typeof exercise.solution === 'object' && exercise.solution.answer ? (
                        <div dangerouslySetInnerHTML={{ __html: exercise.solution.answer }} />
                      ) : exercise.solution ? (
                        <div dangerouslySetInnerHTML={{ __html: exercise.solution }} />
                      ) : (
                        <p className="text-gray-500 italic">No hay solución disponible</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Información del intento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-800 mb-2">🎯 Estado</h5>
                    <p className={`text-sm font-semibold ${userAttempt?.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                      {userAttempt?.is_correct ? 'Correcta ✅' : 'Incorrecta ❌'}
                    </p>
                  </div>
                  
                  {userAttempt?.answered_at && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-2">📅 Fecha de respuesta</h5>
                      <p className="text-sm text-gray-600">
                        {new Date(userAttempt.answered_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de cerrar */}
              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAttemptDetailModal;
