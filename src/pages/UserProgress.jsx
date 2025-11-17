import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader } from '../components/ui';
import { ExerciseAttemptDetailModal } from '../components/modals';
import { getStudyGuides } from '../services/node/study-guides.service';
import { getUserProgresses, createUserProgress } from '../services/node/user-progress.service';
import { getUserExercises } from '../services/node/user-exercises.service';
import { getExercises } from '../services/node/exercises.service';

export default function UserProgress() {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);

  // Query para obtener todas las guías de estudio
  const { data: studyGuides = [] } = useQuery({
    queryKey: ['studyGuides'],
    queryFn: getStudyGuides,
    select: (data) => Array.isArray(data) ? data : data?.data ? data.data : []
  });

  // Query para obtener el progreso del usuario
  const { data: userProgressData = [] } = useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgresses,
    select: (data) => {
      const progressArray = Array.isArray(data) ? data : data?.data ? data.data : [];
      // Filtrar solo el progreso del usuario actual
      return progressArray.filter(p => p.user_id === user?.id);
    }
  });

  // Query para obtener los intentos de ejercicios del usuario
  const { data: userExercisesData = [] } = useQuery({
    queryKey: ['userExercises'],
    queryFn: getUserExercises,
    select: (data) => {
      const exercisesArray = Array.isArray(data) ? data : data?.data ? data.data : [];
      // Filtrar solo los ejercicios del usuario actual
      return exercisesArray.filter(e => e.user_id === user?.id);
    }
  });

  // Query para obtener todos los ejercicios (para obtener detalles)
  const { data: allExercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExercises,
    select: (data) => Array.isArray(data) ? data : data?.data ? data.data : []
  });

  // Calcular estadísticas y progreso por guía
  const studyGuidesProgress = useMemo(() => {
    return studyGuides.map(guide => {
      // Obtener IDs de ejercicios de la guía
      const guideExerciseIds = guide.exercises?.map(ex => ex.exercise_id || ex.id) || [];
      
      // Filtrar intentos del usuario para ejercicios de esta guía
      const guideAttempts = userExercisesData.filter(attempt => 
        guideExerciseIds.includes(attempt.exercise_id)
      );

      // Obtener ejercicios únicos intentados
      const uniqueAttemptedExercises = [...new Set(guideAttempts.map(a => a.exercise_id))];
      
      // Calcular correctos
      const correctAttempts = guideAttempts.filter(a => a.is_correct);
      const uniqueCorrectExercises = [...new Set(correctAttempts.map(a => a.exercise_id))];

      // Verificar si la guía está completada
      const isCompleted = guideExerciseIds.length > 0 && 
                         uniqueCorrectExercises.length === guideExerciseIds.length;

      // Buscar en user progress si ya se marcó como completada
      const progressRecord = userProgressData.find(p => p.study_guide_id === guide.id);

      // Calcular porcentajes
      const totalExercises = guideExerciseIds.length;
      const attemptedCount = uniqueAttemptedExercises.length;
      const correctCount = uniqueCorrectExercises.length;
      const attemptedPercentage = totalExercises > 0 ? (attemptedCount / totalExercises) * 100 : 0;
      const successPercentage = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

      // Obtener detalles de ejercicios - PRIORIZAR INTENTOS CORRECTOS
      const exercisesDetails = guideExerciseIds.map(exId => {
        const exercise = allExercises.find(ex => ex.id === exId);
        // Obtener todos los intentos de este ejercicio
        const allAttemptsForExercise = guideAttempts.filter(a => a.exercise_id === exId);
        
        // Priorizar: buscar primero un intento correcto
        let bestAttempt = allAttemptsForExercise.find(a => a.is_correct);
        // Si no hay correcto, tomar el más reciente
        if (!bestAttempt && allAttemptsForExercise.length > 0) {
          bestAttempt = allAttemptsForExercise.sort((a, b) => 
            new Date(b.answered_at) - new Date(a.answered_at)
          )[0];
        }
        
        return {
          exercise,
          attempt: bestAttempt,
          allAttempts: allAttemptsForExercise,
          attemptsCount: allAttemptsForExercise.length,
          isAttempted: allAttemptsForExercise.length > 0,
          isCorrect: !!bestAttempt?.is_correct
        };
      });

      return {
        ...guide,
        totalExercises,
        attemptedCount,
        correctCount,
        attemptedPercentage,
        successPercentage,
        isCompleted,
        progressRecord,
        exercisesDetails,
        pendingExercises: exercisesDetails.filter(e => !e.isAttempted),
        totalAttempts: guideAttempts.length
      };
    });
  }, [studyGuides, userExercisesData, userProgressData, allExercises, user]);

  // Estadísticas globales
  const globalStats = useMemo(() => {
    const totalAttempts = userExercisesData.length;
    const correctAttempts = userExercisesData.filter(a => a.is_correct).length;
    const successRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Agrupar por dificultad
    const byDifficulty = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 }
    };

    userExercisesData.forEach(attempt => {
      const exercise = allExercises.find(ex => ex.id === attempt.exercise_id);
      if (exercise && exercise.difficulty) {
        byDifficulty[exercise.difficulty].total++;
        if (attempt.is_correct) {
          byDifficulty[exercise.difficulty].correct++;
        }
      }
    });

    const completedGuides = studyGuidesProgress.filter(g => g.isCompleted).length;
    const totalGuides = studyGuides.length;

    return {
      totalAttempts,
      correctAttempts,
      successRate,
      byDifficulty,
      completedGuides,
      totalGuides
    };
  }, [userExercisesData, allExercises, studyGuidesProgress, studyGuides]);

  const handleViewAttempt = (exercise, attempt) => {
    setSelectedExercise(exercise);
    setSelectedAttempt(attempt);
    setIsAttemptModalOpen(true);
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'from-green-100 to-blue-100 text-green-800',
      intermediate: 'from-yellow-100 to-orange-100 text-yellow-800',
      advanced: 'from-red-100 to-pink-100 text-red-800'
    };
    return colors[level] || 'from-gray-100 to-gray-200 text-gray-800';
  };

  const getLevelText = (level) => {
    const texts = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return texts[level] || level;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Mi Progreso de Aprendizaje
          </h1>
          <p className="mt-2 text-gray-700">
            Seguimiento de tu rendimiento y estadísticas en derivadas
          </p>
        </div>

        {/* Estadísticas globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total de Intentos</p>
                  <p className="text-3xl font-bold text-blue-700">{globalStats.totalAttempts}</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Respuestas Correctas</p>
                  <p className="text-3xl font-bold text-green-700">{globalStats.correctAttempts}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Tasa de Éxito</p>
                  <p className="text-3xl font-bold text-purple-700">{globalStats.successRate.toFixed(1)}%</p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Guías Completadas</p>
                  <p className="text-3xl font-bold text-orange-700">{globalStats.completedGuides}/{globalStats.totalGuides}</p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas por dificultad */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b">
            <h3 className="text-lg font-semibold text-gray-800">📊 Rendimiento por Dificultad</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">🟢 Fácil</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Intentos: <span className="font-bold">{globalStats.byDifficulty.easy.total}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Correctos: <span className="font-bold text-green-600">{globalStats.byDifficulty.easy.correct}</span>
                  </p>
                  {globalStats.byDifficulty.easy.total > 0 && (
                    <p className="text-sm font-semibold text-green-700">
                      {((globalStats.byDifficulty.easy.correct / globalStats.byDifficulty.easy.total) * 100).toFixed(1)}% de éxito
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-700 mb-2">🟡 Medio</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Intentos: <span className="font-bold">{globalStats.byDifficulty.medium.total}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Correctos: <span className="font-bold text-yellow-600">{globalStats.byDifficulty.medium.correct}</span>
                  </p>
                  {globalStats.byDifficulty.medium.total > 0 && (
                    <p className="text-sm font-semibold text-yellow-700">
                      {((globalStats.byDifficulty.medium.correct / globalStats.byDifficulty.medium.total) * 100).toFixed(1)}% de éxito
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">🔴 Difícil</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Intentos: <span className="font-bold">{globalStats.byDifficulty.hard.total}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Correctos: <span className="font-bold text-red-600">{globalStats.byDifficulty.hard.correct}</span>
                  </p>
                  {globalStats.byDifficulty.hard.total > 0 && (
                    <p className="text-sm font-semibold text-red-700">
                      {((globalStats.byDifficulty.hard.correct / globalStats.byDifficulty.hard.total) * 100).toFixed(1)}% de éxito
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progreso por guías de estudio */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">📚 Progreso en Guías de Estudio</h2>
          
          {studyGuidesProgress.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-gray-600">No hay guías de estudio disponibles</p>
              </CardContent>
            </Card>
          ) : (
            studyGuidesProgress.map(guide => (
              <Card key={guide.id} className={`shadow-lg border-0 ${guide.isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-white to-blue-50/30'}`}>
                <CardHeader className={`border-b ${guide.isCompleted ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-blue-100 to-green-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {guide.isCompleted && '🏆'} {guide.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getLevelColor(guide.level)}`}>
                          {getLevelText(guide.level)}
                        </span>
                        {guide.topic && (
                          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                            📚 {guide.topic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Estadísticas de la guía */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Total Ejercicios</p>
                      <p className="text-2xl font-bold text-blue-600">{guide.totalExercises}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Intentados</p>
                      <p className="text-2xl font-bold text-purple-600">{guide.attemptedCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Correctos</p>
                      <p className="text-2xl font-bold text-green-600">{guide.correctCount}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">Éxito</p>
                      <p className="text-2xl font-bold text-orange-600">{guide.successPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-blue-200">
                      <p className="text-xs text-gray-500">Total Intentos</p>
                      <p className="text-2xl font-bold text-blue-600">{guide.totalAttempts}</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progreso de la guía</span>
                      <span className="font-semibold">{guide.attemptedPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${guide.attemptedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Lista de ejercicios */}
                  {guide.totalExercises > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Ejercicios de esta guía:</h4>
                      <div className="space-y-2">
                        {guide.exercisesDetails.map((item, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              item.isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : item.isAttempted 
                                ? 'bg-red-50 border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">
                                  {item.isCorrect ? '✅' : item.isAttempted ? '❌' : '⏳'}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {item.exercise?.title || 'Ejercicio sin título'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.isCorrect 
                                      ? 'Completado correctamente' 
                                      : item.isAttempted 
                                      ? `${item.attemptsCount} intento${item.attemptsCount > 1 ? 's' : ''} - Último incorrecto` 
                                      : 'Pendiente'}
                                  </p>
                                </div>
                              </div>
                              {item.isAttempted && item.exercise && (
                                <div className="flex gap-2">
                                  {item.attemptsCount > 1 && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-semibold">
                                      {item.attemptsCount} intentos
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleViewAttempt(item.exercise, item.attempt)}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Ver {item.isCorrect ? 'respuesta' : 'último intento'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guide.totalExercises === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Esta guía aún no tiene ejercicios asignados
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Historial completo de intentos */}
        {userExercisesData.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">📜 Historial Completo de Intentos</h2>
            
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Todos tus intentos ({userExercisesData.length} totales)
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Estado</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Ejercicio</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Guía Relacionada</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Fecha</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userExercisesData
                        .sort((a, b) => new Date(b.answered_at) - new Date(a.answered_at))
                        .map((attempt, idx) => {
                          const exercise = allExercises.find(ex => ex.id === attempt.exercise_id);
                          const relatedGuide = studyGuides.find(g => 
                            g.exercises?.some(ex => (ex.exercise_id || ex.id) === attempt.exercise_id)
                          );
                          
                          return (
                            <tr 
                              key={idx} 
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                attempt.is_correct ? 'bg-green-50/30' : 'bg-red-50/30'
                              }`}
                            >
                              <td className="p-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  attempt.is_correct 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {attempt.is_correct ? '✅ Correcto' : '❌ Incorrecto'}
                                </span>
                              </td>
                              <td className="p-3">
                                <p className="font-medium text-gray-800">
                                  {exercise?.title || 'Ejercicio no encontrado'}
                                </p>
                                {exercise?.difficulty && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Dificultad: {
                                      exercise.difficulty === 'easy' ? 'Fácil' :
                                      exercise.difficulty === 'medium' ? 'Medio' :
                                      exercise.difficulty === 'hard' ? 'Difícil' : exercise.difficulty
                                    }
                                  </p>
                                )}
                              </td>
                              <td className="p-3">
                                {relatedGuide ? (
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    📚 {relatedGuide.title}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Sin guía</span>
                                )}
                              </td>
                              <td className="p-3">
                                <p className="text-sm text-gray-600">
                                  {attempt.answered_at 
                                    ? new Date(attempt.answered_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'N/A'
                                  }
                                </p>
                              </td>
                              <td className="p-3">
                                {exercise && (
                                  <button
                                    onClick={() => handleViewAttempt(exercise, attempt)}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Ver detalles
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal para ver detalles del intento */}
      <ExerciseAttemptDetailModal
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        exercise={selectedExercise}
        userAttempt={selectedAttempt}
      />
    </Layout>
  );
}
